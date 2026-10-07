#!/usr/bin/env python3
"""Генерирует чейнджлог: дифф модов по index.toml + список коммитов между тегами."""
import os
import re
import subprocess
import sys
import tomllib
from pathlib import Path


def sh(*args: str) -> str:
    r = subprocess.run(args, capture_output=True, text=True, check=False)
    return r.stdout.strip()


def prev_tag(current: str) -> str:
    """Предыдущий тег вида vX.Y.Z, отсортированный по версии."""
    tags = [t for t in sh("git", "tag", "--list", "v*", "--sort=-v:refname").splitlines() if t]
    tags = [t for t in tags if t != current]
    return tags[0] if tags else ""


def mods_at(ref: str) -> dict[str, str]:
    """{имя мода: hash метаданных} из index.toml на указанном ref."""
    if ref:
        raw = sh("git", "show", f"{ref}:index.toml")
    else:
        raw = Path("index.toml").read_text(encoding="utf-8") if Path("index.toml").is_file() else ""
    if not raw:
        return {}
    try:
        data = tomllib.loads(raw)
    except tomllib.TOMLDecodeError:
        return {}
    out = {}
    for entry in data.get("files", []):
        f = entry.get("file", "")
        if not f.startswith("mods/"):
            continue
        name = f.split("/")[-1].removesuffix(".pw.toml").removesuffix(".toml")
        out[name] = entry.get("hash", "")
    return out


def pretty(slug: str) -> str:
    return re.sub(r"[-_]+", " ", slug).strip().title()


def commit_lines(rng: str, limit: int = 20) -> list[str]:
    raw = sh("git", "log", "--no-merges", "--pretty=%s|%an", rng)
    lines = []
    for line in filter(None, raw.splitlines()):
        subject, _, author = line.rpartition("|")
        lines.append(f"- {subject[:120]} (*{author}*)")
    if len(lines) > limit:
        extra = len(lines) - limit
        lines = lines[:limit] + [f"- …и ещё {extra} коммит(ов)"]
    return lines


def main() -> int:
    tag = os.environ.get("TAG", "")
    base = prev_tag(tag)

    old, new = mods_at(base), mods_at("")
    added = sorted(set(new) - set(old))
    removed = sorted(set(old) - set(new))
    updated = sorted(k for k in set(old) & set(new) if old[k] != new[k])

    md: list[str] = []
    if added:
        md.append("### ➕ Добавлены моды")
        md += [f"- {pretty(m)}" for m in added]
        md.append("")
    if removed:
        md.append("### ➖ Удалены моды")
        md += [f"- {pretty(m)}" for m in removed]
        md.append("")
    if updated:
        md.append("### 🔄 Обновлены моды")
        md += [f"- {pretty(m)}" for m in updated]
        md.append("")

    rng = f"{base}..HEAD" if base else "HEAD"
    commits = commit_lines(rng)
    if commits:
        md.append("### 📝 Изменения")
        md += commits
        md.append("")

    if not md:
        md = ["Без заметных изменений."]

    body = "\n".join(md).strip()
    Path("CHANGELOG_RELEASE.md").write_text(body, encoding="utf-8")

    # Короткая сводка для Discord-анонса
    summary_parts = []
    if added:
        summary_parts.append(f"➕ {len(added)}")
    if removed:
        summary_parts.append(f"➖ {len(removed)}")
    if updated:
        summary_parts.append(f"🔄 {len(updated)}")
    summary = " · ".join(summary_parts) or "правки конфигов и баланса"

    out = os.environ.get("GITHUB_OUTPUT")
    if out:
        with open(out, "a", encoding="utf-8") as f:
            f.write(f"prev_tag={base}\n")
            f.write(f"mods_summary={summary}\n")
            f.write(f"added={len(added)}\n")
            f.write(f"removed={len(removed)}\n")
            f.write(f"updated={len(updated)}\n")

    print(f"prev_tag={base}\nmods_summary={summary}")
    print("--- CHANGELOG_RELEASE.md ---")
    print(body[:2000])
    return 0


if __name__ == "__main__":
    sys.exit(main())
