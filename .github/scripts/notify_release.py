#!/usr/bin/env python3
"""Постит анонс новой версии модпака в публичный канал Discord."""
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

DESC_LIMIT = 3800
COLOR_RELEASE = 0xD4A574  # steampunk bronze


def main() -> int:
    webhook = os.environ.get("WEBHOOK", "")
    if not webhook:
        print("DISCORD_ANNOUNCE_WEBHOOK не задан — пропускаю отправку")
        return 0

    name = os.environ.get("PACK_NAME", "Modpack")
    version = os.environ.get("VERSION", "0.0.0")
    tag = os.environ.get("TAG", f"v{version}")
    mc = os.environ.get("MC", "?")
    loader = os.environ.get("LOADER", "?")
    loader_version = os.environ.get("LOADER_VERSION", "")
    repo = os.environ.get("REPO", "")
    summary = os.environ.get("MODS_SUMMARY", "")
    role_id = os.environ.get("PING_ROLE_ID", "").strip()

    body = ""
    cl = Path("CHANGELOG_RELEASE.md")
    if cl.is_file():
        body = cl.read_text(encoding="utf-8").strip()
    if len(body) > DESC_LIMIT:
        body = body[:DESC_LIMIT].rsplit("\n", 1)[0] + "\n\n…полный список в GitHub Release."

    release_url = f"https://github.com/{repo}/releases/tag/{tag}"
    loader_label = f"{loader.capitalize()} {loader_version}".strip()

    embed = {
        "title": f"🚀 {name} {tag}",
        "url": release_url,
        "description": body or "Новая версия доступна для загрузки.",
        "color": COLOR_RELEASE,
        "fields": [
            {"name": "Minecraft", "value": mc, "inline": True},
            {"name": "Загрузчик", "value": loader_label or "—", "inline": True},
            {"name": "Моды", "value": summary or "—", "inline": True},
            {
                "name": "📥 Скачать",
                "value": (
                    f"• [Modrinth / .mrpack]({release_url})\n"
                    f"• [CurseForge / .zip]({release_url})\n"
                    f"• [Ручная установка / jars]({release_url})"
                ),
                "inline": False,
            },
        ],
        "footer": {"text": "Обновите сборку перед входом на сервер"},
    }

    payload = {
        "username": f"{name} Releases",
        "embeds": [embed],
        "allowed_mentions": {"parse": [], "roles": [role_id] if role_id else []},
    }
    if role_id:
        payload["content"] = f"<@&{role_id}> вышла новая версия — **{tag}**"

    req = urllib.request.Request(
        webhook + "?wait=true",
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            print(f"Анонс отправлен, HTTP {resp.status}")
    except urllib.error.HTTPError as e:
        print(f"Discord вернул {e.code}: {e.read().decode()[:500]}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
