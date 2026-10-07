#!/usr/bin/env python3
"""Постит анонс новой версии модпака в публичный канал Discord.

Cloudflare перед Discord отдаёт 403/1010 на дефолтный User-Agent Python,
поэтому заголовки задаём вручную и повторяем отправку при 429/5xx.
"""
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

DESC_LIMIT = 3800
COLOR_RELEASE = 0xD4A574  # steampunk bronze

HEADERS = {
    "Content-Type": "application/json",
    "User-Agent": "DiscordBot (https://github.com/packwiz/packwiz, 1.0)",
    "Accept": "application/json",
    "Accept-Language": "en-US,en;q=0.9",
}

RETRIES = 3
RETRY_BACKOFF = 3


def send(webhook: str, payload: dict) -> bool:
    """Отправляет webhook с ретраями на 429 и 5xx."""
    url = webhook + "?wait=true"
    body = json.dumps(payload).encode()
    for attempt in range(1, RETRIES + 1):
        req = urllib.request.Request(url, data=body, headers=HEADERS, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                print(f"Анонс отправлен, HTTP {resp.status}")
                return True
        except urllib.error.HTTPError as e:
            detail = e.read().decode()[:500]
            retryable = e.code == 429 or 500 <= e.code < 600
            print(f"Попытка {attempt}/{RETRIES}: Discord вернул {e.code} — {detail}",
                  file=sys.stderr)
            if not retryable or attempt == RETRIES:
                if e.code == 403 and "1010" in detail:
                    print("→ Cloudflare отклонил запрос. Проверьте права вебхука "
                          "и что URL скопирован полностью.", file=sys.stderr)
                return False
            time.sleep(RETRY_BACKOFF * attempt)
        except urllib.error.URLError as e:
            print(f"Попытка {attempt}/{RETRIES}: сетевая ошибка — {e.reason}", file=sys.stderr)
            if attempt == RETRIES:
                return False
            time.sleep(RETRY_BACKOFF * attempt)
    return False


def main() -> int:
    webhook = os.environ.get("WEBHOOK", "").strip()
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

    return 0 if send(webhook, payload) else 1


if __name__ == "__main__":
    sys.exit(main())
