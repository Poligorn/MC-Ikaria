#!/usr/bin/env python3
"""Собирает ZIP с джарниками для ручной установки в любой лаунчер.

packwiz refresh только пересчитывает index.toml и не качает jars.
Все mods/*.pw.toml должны иметь [download].url (Modrinth CDN, FTB Maven,
CurseForge CDN) — тогда этот скрипт скачивает их сам, без CF API-ключа.
"""
from __future__ import annotations

import hashlib
import os
import sys
import tomllib
import zipfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

EXCLUDE_DIRS = {"overrides/.minecraft/logs", "overrides/.minecraft/crash-reports"}
INCLUDE_ROOTS = {"mods", "config", "kubejs", "scripts", "defaultconfigs", "overrides"}
HASH_FNS = {
    "sha1": hashlib.sha1,
    "sha256": hashlib.sha256,
    "sha512": hashlib.sha512,
    "md5": hashlib.md5,
}
UA = "AeronauticsIkaria-pack-ci/1.0 (+https://github.com/Poligorn/MC-Ikaria)"
WORKERS = 8


def file_hash(path: Path, fmt: str) -> str:
    h = HASH_FNS[fmt]()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def download_one(toml_path: Path, mods_dir: Path) -> str:
    meta = tomllib.loads(toml_path.read_text(encoding="utf-8"))
    dl = meta.get("download") or {}
    url = dl.get("url")
    filename = meta.get("filename")
    expected = (dl.get("hash") or "").lower()
    fmt = dl.get("hash-format") or "sha256"
    name = meta.get("name") or toml_path.name

    if not url or not filename:
        raise RuntimeError(
            f"{toml_path.name}: нет [download].url / filename "
            f"(metadata:curseforge без прямого URL не попадёт в manual ZIP)"
        )
    if fmt not in HASH_FNS:
        raise RuntimeError(f"{toml_path.name}: неизвестный hash-format {fmt}")

    dest = mods_dir / filename
    if dest.is_file() and expected and file_hash(dest, fmt) == expected:
        return f"cached {filename}"

    req = Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    try:
        with urlopen(req, timeout=120) as resp:
            data = resp.read()
    except (HTTPError, URLError) as exc:
        raise RuntimeError(f"{name}: не скачался {url} — {exc}") from exc

    digest = HASH_FNS[fmt](data).hexdigest()
    if expected and digest != expected:
        raise RuntimeError(
            f"{name}: hash mismatch {fmt} {digest} != {expected} ({url})"
        )
    dest.write_bytes(data)
    return f"fetched {filename}"


def download_all_mods(mods_dir: Path) -> None:
    tomls = sorted(mods_dir.glob("*.pw.toml"))
    if not tomls:
        raise RuntimeError("нет mods/*.pw.toml")
    print(f"Скачиваем {len(tomls)} модов в {mods_dir}...")
    errors: list[str] = []
    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        futs = {pool.submit(download_one, t, mods_dir): t for t in tomls}
        for fut in as_completed(futs):
            src = futs[fut]
            try:
                print(f"  {fut.result()}")
            except Exception as exc:  # noqa: BLE001 — собираем все ошибки
                errors.append(f"{src.name}: {exc}")
    if errors:
        print("Ошибки загрузки:", file=sys.stderr)
        for line in errors:
            print(f"  {line}", file=sys.stderr)
        raise RuntimeError(f"не скачались {len(errors)} мод(ов)")
    jars = list(mods_dir.glob("*.jar"))
    print(f"Готово: {len(jars)} jar")


def main() -> int:
    slug = os.environ.get("SLUG", "modpack")
    version = os.environ.get("VERSION", "0.0.0")
    dist = Path("dist")
    dist.mkdir(parents=True, exist_ok=True)
    output = dist / f"{slug}-{version}-manual.zip"
    mods_dir = Path("mods")

    try:
        download_all_mods(mods_dir)
    except RuntimeError as exc:
        print(f"Ошибка загрузки модов: {exc}", file=sys.stderr)
        return 1

    with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED) as zf:
        for root_dir in INCLUDE_ROOTS:
            p = Path(root_dir)
            if not p.exists():
                continue
            for f in p.rglob("*"):
                if not f.is_file():
                    continue
                rel = f.relative_to(".")
                if rel.suffix == ".toml" and rel.stem.endswith(".pw"):
                    continue
                if any(str(rel).startswith(ex) for ex in EXCLUDE_DIRS):
                    continue
                zf.write(f, arcname=str(rel))
                print(f"  + {rel}")

        readme = f"""# {slug} v{version}

Ручная установка:

1. Распакуйте содержимое этого архива в папку .minecraft вашего лаунчера
2. Убедитесь, что у вас установлен нужный загрузчик (Forge/Fabric/NeoForge)
3. Запустите игру

Структура:
- mods/ — моды (включая FTB Library / Quests / Teams с официального Maven)
- config/ — конфигурация
- kubejs/, scripts/ — скрипты (если есть)

Для автоматической установки используйте файлы для Modrinth или CurseForge.
FTB-моды — All Rights Reserved: в git их нет, в этом ZIP они скачаны с maven.ftb.dev.
"""
        zf.writestr("README.txt", readme)

    size_mb = output.stat().st_size / (1024 * 1024)
    print(f"\n✅ Собрано: {output} ({size_mb:.1f} MB)")

    out = os.environ.get("GITHUB_OUTPUT")
    if out:
        with open(out, "a", encoding="utf-8") as f:
            f.write(f"manual_zip={output.name}\n")
            f.write(f"manual_size_mb={size_mb:.1f}\n")

    return 0


if __name__ == "__main__":
    sys.exit(main())
