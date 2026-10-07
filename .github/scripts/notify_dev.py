#!/usr/bin/env python3
"""Постит коммиты из dev в приватный Discord-канал одним embed-ом.

Cloudflare перед Discord отдаёт 403/1010 на дефолтный User-Agent Python,
поэтому заголовки задаём вручную и повторяем отправку при 429/5xx.
"""
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request

MAX_COMMITS = 10
EMBED_DESC_LIMIT = 4000
COLOR_DEV = 0x5865F2       # discord blurple
COLOR_FORCED = 0xE67E22    # orange, если был force-push

# Заголовки, которые проходят Cloudflare (обычный Discord-совместимый UA)
HEADERS = {
    "Content-Type": "application/json",
    "User-Agent": "DiscordBot (https://github.com/packwiz/packwiz, 1.0)",
    "Accept": "application/json",
    "Accept-Language": "en-US,en;q=0.9",
}

RETRIES = 3
RETRY_BACKOFF = 3  # секунды, умножается на номер попытки


def sh(*args: str) -> str:
    return subprocess.run(args, capture_output=True, text=True, check=False).stdout.strip()


def commit_range(before: str, after: str) -> str:
    """Пустой before (новая ветка) или отсутствующий объект -> берём последний коммит."""
    zero = "0" * 40
    if not before or before == zero:
        return f"{after}~1..{after}"
    exists = subprocess.run(["git", "cat-file", "-e", f"{before}^{{commit}}"], check=False)
    if exists.returncode != 0:
        return f"{after}~1..{after}"
    return f"{before}..{after}"


def collect(rng: str) -> list[dict]:
    raw = sh("git", "log", "--no-merges", "--pretty=%H%x1f%h%x1f%an%x1f%s", rng)
    out = []
    for line in filter(None, raw.splitlines()):
        full, short, author, subject = line.split("\x1f", 3)
        out.append({"sha": full, "short": short, "author": author, "subject": subject})
    return out


def changed_files(rng: str) -> tuple[int, list[str]]:
    raw = sh("git", "diff", "--name-only", rng)
    files = [f for f in raw.splitlines() if f]
    mods = sorted({f.split("/")[-1].removesuffix(".pw.toml")
                   for f in files if f.startswith("mods/") and f.endswith(".pw.toml")})
    return len(files), mods


def send(webhook: str, payload: dict) -> bool:
    """Отправляет webhook с ретраями на 429 и 5xx."""
    url = webhook + "?wait=true"
    body = json.dumps(payload).encode()
    for attempt in range(1, RETRIES + 1):
        req = urllib.request.Request(url, data=body, headers=HEADERS, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                print(f"Отправлено, HTTP {resp.status}")
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
        print("DISCORD_DEV_WEBHOOK не задан — пропускаю отправку")
        return 0

    repo = os.environ.get("REPO", "")
    after = os.environ.get("AFTER", "")
    rng = commit_range(os.environ.get("BEFORE", ""), after)
    commits = collect(rng)
    if not commits:
        print("Нет новых коммитов (возможно, только merge) — пропускаю")
        return 0

    forced = os.environ.get("FORCED", "false") == "true"
    lines = []
    for c in commits[:MAX_COMMITS]:
        url = f"https://github.com/{repo}/commit/{c['sha']}"
        subject = c["subject"][:140]
        lines.append(f"[`{c['short']}`]({url}) {subject} — *{c['author']}*")
    if len(commits) > MAX_COMMITS:
        lines.append(f"…и ещё {len(commits) - MAX_COMMITS} коммит(ов)")

    desc = "\n".join(lines)[:EMBED_DESC_LIMIT]
    total_files, mods = changed_files(rng)

    fields = [{"name": "Коммитов", "value": str(len(commits)), "inline": True},
              {"name": "Файлов изменено", "value": str(total_files), "inline": True}]
    if mods:
        value = ", ".join(f"`{m}`" for m in mods[:15])
        if len(mods) > 15:
            value += f" +{len(mods) - 15}"
        fields.append({"name": f"Моды ({len(mods)})", "value": value[:1024], "inline": False})

    embed = {
        "title": ("⚠️ force-push в dev" if forced else "🔧 Новые коммиты в dev"),
        "url": os.environ.get("COMPARE") or f"https://github.com/{repo}",
        "description": desc,
        "color": COLOR_FORCED if forced else COLOR_DEV,
        "fields": fields,
        "footer": {"text": f"{repo} · ветка dev"},
    }
    payload = {"username": "Dev Feed", "embeds": [embed], "allowed_mentions": {"parse": []}}

    return 0 if send(webhook, payload) else 1


if __name__ == "__main__":
    sys.exit(main())
