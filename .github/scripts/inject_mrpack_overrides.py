#!/usr/bin/env python3
"""Переносит в overrides файлы .mrpack, чьи URL не с разрешённых хостов Modrinth.

Modrinth принимает в files[].downloads только cdn.modrinth.com, github.com,
raw.githubusercontent.com и gitlab.com. Остальные (maven.ftb.dev, Forge CDN
и т.п.) кладём внутрь архива: overrides/, client-overrides/ или
server-overrides/ — в зависимости от files[].env — и вычёркиваем запись
из modrinth.index.json.

Скрипт общий: список файлов не зашит, решение принимается только по хосту URL.
"""
from __future__ import annotations

import hashlib
import json
import sys
import tempfile
import zipfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen

ALLOWED_HOSTS = frozenset({
    "cdn.modrinth.com",
    "github.com",
    "raw.githubusercontent.com",
    "gitlab.com",
})
HASH_FNS = {
    "sha1": hashlib.sha1,
    "sha512": hashlib.sha512,
    "sha256": hashlib.sha256,
    "md5": hashlib.md5,
}
UA = "AeronauticsIkaria-pack-ci/1.0 (+https://github.com/Poligorn/MC-Ikaria)"
WORKERS = 8
INDEX_NAME = "modrinth.index.json"


def url_host(url: str) -> str:
    return (urlparse(url).hostname or "").lower()


def disallowed_hosts(file_entry: dict) -> list[str]:
    hosts: list[str] = []
    for url in file_entry.get("downloads") or []:
        host = url_host(str(url))
        if host not in ALLOWED_HOSTS:
            hosts.append(host or "<no-host>")
    return hosts


def needs_override(file_entry: dict) -> bool:
    downloads = file_entry.get("downloads") or []
    if not downloads:
        return True
    return bool(disallowed_hosts(file_entry))


def override_prefix(file_entry: dict) -> str:
    env = file_entry.get("env") or {}
    if env.get("server") == "unsupported":
        return "client-overrides"
    if env.get("client") == "unsupported":
        return "server-overrides"
    return "overrides"


def normalize_pack_path(path: str) -> str:
    raw = (path or "").replace("\\", "/").lstrip("/")
    parts = [p for p in raw.split("/") if p not in ("", ".")]
    if not parts or any(p == ".." for p in parts):
        raise RuntimeError(f"небезопасный path в индексе: {path!r}")
    return "/".join(parts)


def digest(data: bytes, fmt: str) -> str:
    if fmt not in HASH_FNS:
        raise RuntimeError(f"неизвестный хеш {fmt}")
    return HASH_FNS[fmt](data).hexdigest()


def verify_hashes(data: bytes, hashes: dict, label: str) -> None:
    if not hashes:
        raise RuntimeError(f"{label}: в индексе нет hashes")
    checked = 0
    for fmt in ("sha512", "sha1"):
        expected = (hashes.get(fmt) or "").lower()
        if not expected:
            continue
        actual = digest(data, fmt)
        if actual != expected:
            raise RuntimeError(
                f"{label}: hash mismatch {fmt} {actual} != {expected}"
            )
        checked += 1
    if checked == 0:
        raise RuntimeError(f"{label}: нет sha1/sha512 в hashes")


def fetch_entry(file_entry: dict) -> tuple[str, bytes]:
    path = normalize_pack_path(file_entry.get("path") or "")
    urls = [str(u) for u in (file_entry.get("downloads") or []) if u]
    if not urls:
        raise RuntimeError(f"{path}: нечего скачивать, downloads пуст")

    hashes = file_entry.get("hashes") or {}
    errors: list[str] = []
    for url in urls:
        req = Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
        try:
            with urlopen(req, timeout=120) as resp:
                data = resp.read()
        except (HTTPError, URLError, TimeoutError, OSError) as exc:
            errors.append(f"{url} — {exc}")
            continue
        try:
            verify_hashes(data, hashes, path)
        except RuntimeError as exc:
            errors.append(str(exc))
            continue
        expected_size = file_entry.get("fileSize")
        if expected_size and len(data) != int(expected_size):
            errors.append(
                f"{url}: размер {len(data)} != fileSize {expected_size}"
            )
            continue
        return path, data

    raise RuntimeError(f"{path}: не скачался ни один URL ({'; '.join(errors)})")


def rewrite_zip(
    zip_path: Path,
    index: dict,
    jars: dict[str, bytes],
) -> None:
    tmp_zip = zip_path.with_suffix(zip_path.suffix + ".tmp")
    index_bytes = (json.dumps(index, ensure_ascii=False, indent=4) + "\n").encode(
        "utf-8"
    )
    skip = {INDEX_NAME, *jars}
    with zipfile.ZipFile(zip_path, "r") as src, zipfile.ZipFile(
        tmp_zip, "w", compression=zipfile.ZIP_DEFLATED
    ) as dst:
        dst.writestr(INDEX_NAME, index_bytes)
        for item in src.infolist():
            name = item.filename
            if name in skip or name.endswith("/"):
                continue
            dst.writestr(name, src.read(name), compress_type=item.compress_type)
        for arc, data in jars.items():
            dst.writestr(arc, data)
            print(f"  + {arc} ({len(data)} bytes)")
    tmp_zip.replace(zip_path)


def verify_result(zip_path: Path, expected_jars: dict[str, bytes]) -> None:
    with zipfile.ZipFile(zip_path) as z:
        index = json.loads(z.read(INDEX_NAME))
        names = set(z.namelist())
        leftovers: list[str] = []
        for entry in index.get("files") or []:
            bad = disallowed_hosts(entry)
            downloads = entry.get("downloads") or []
            if not downloads or bad:
                leftovers.append(
                    f"{entry.get('path')} hosts={bad or '<none>'}"
                )
        missing: list[str] = []
        mismatch: list[str] = []
        for arc, data in expected_jars.items():
            if arc not in names:
                missing.append(arc)
                continue
            if z.read(arc) != data:
                mismatch.append(arc)

    if leftovers or missing or mismatch:
        raise RuntimeError(
            "проверка .mrpack не прошла: "
            + (f"в индексе остались запрещённые URL: {leftovers}; " if leftovers else "")
            + (f"нет jar в архиве: {missing}; " if missing else "")
            + (f"содержимое jar не совпало: {mismatch}" if mismatch else "")
        )
    print(
        f"Проверка OK: 0 запрещённых хостов в индексе, "
        f"{len(expected_jars)} jar в overrides"
    )


def process(zip_path: Path) -> int:
    with zipfile.ZipFile(zip_path) as z:
        if INDEX_NAME not in z.namelist():
            raise RuntimeError(f"в {zip_path.name} нет {INDEX_NAME}")
        index = json.loads(z.read(INDEX_NAME))

    files = list(index.get("files") or [])
    to_move = [f for f in files if needs_override(f)]
    if not to_move:
        print("Все files[].downloads с разрешённых хостов — нечего переносить")
        return 0

    print(f"Переносим в overrides {len(to_move)} файл(ов):")
    for entry in to_move:
        path = entry.get("path")
        bad = disallowed_hosts(entry)
        dest = f"{override_prefix(entry)}/{normalize_pack_path(entry.get('path') or '')}"
        print(f"  - {path} → {dest} (hosts: {', '.join(bad) or '<none>'})")

    fetched: dict[str, bytes] = {}
    errors: list[str] = []
    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        futs = {pool.submit(fetch_entry, entry): entry for entry in to_move}
        for fut in as_completed(futs):
            entry = futs[fut]
            try:
                path, data = fut.result()
                arc = f"{override_prefix(entry)}/{path}"
                fetched[arc] = data
            except Exception as exc:  # noqa: BLE001
                errors.append(str(exc))
    if errors:
        print("Ошибки загрузки:", file=sys.stderr)
        for line in errors:
            print(f"  {line}", file=sys.stderr)
        raise RuntimeError(f"не скачались {len(errors)} файл(ов)")

    kept = [f for f in files if not needs_override(f)]
    index["files"] = kept
    rewrite_zip(zip_path, index, fetched)
    print(
        f"Готово: в индексе осталось {len(kept)} файлов, "
        f"в архив добавлено {len(fetched)} jar"
    )
    verify_result(zip_path, fetched)
    return 0


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: inject_mrpack_overrides.py <pack.mrpack>", file=sys.stderr)
        return 2
    zip_path = Path(sys.argv[1])
    if not zip_path.is_file():
        print(f"нет файла {zip_path}", file=sys.stderr)
        return 1
    try:
        return process(zip_path)
    except Exception as exc:  # noqa: BLE001
        print(f"Ошибка: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
