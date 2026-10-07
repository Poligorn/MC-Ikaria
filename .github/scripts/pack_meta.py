#!/usr/bin/env python3
"""Читает pack.toml и выводит метаданные в GITHUB_OUTPUT (или stdout)."""
import os
import sys
import tomllib
from pathlib import Path


def load(path: str = "pack.toml") -> dict:
    p = Path(path)
    if not p.is_file():
        print(f"Не найден {path} в корне репозитория", file=sys.stderr)
        sys.exit(1)
    with p.open("rb") as f:
        return tomllib.load(f)


def main() -> int:
    pack = load()
    versions = pack.get("versions", {})

    mc = versions.get("minecraft", "unknown")
    loader = next((k for k in ("forge", "neoforge", "fabric", "quilt") if k in versions), "unknown")
    loader_version = versions.get(loader, "unknown")

    name = pack.get("name", "modpack")
    version = pack.get("version", "0.0.0")
    slug = "".join(c if c.isalnum() or c in "-_" else "-" for c in name.lower()).strip("-")

    data = {
        "name": name,
        "slug": slug,
        "version": version,
        "mc": mc,
        "loader": loader,
        "loader_version": loader_version,
        "tag": f"v{version}",
    }

    out = os.environ.get("GITHUB_OUTPUT")
    if out:
        with open(out, "a", encoding="utf-8") as f:
            for k, v in data.items():
                f.write(f"{k}={v}\n")

    for k, v in data.items():
        print(f"{k}={v}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
