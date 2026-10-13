#!/usr/bin/env python3
"""Дописывает в CurseForge-zip jar'ы модов с [update.curseforge].

packwiz curseforge export кладёт такие моды ТОЛЬКО в manifest.json
(projectID/fileID) и не кладёт файлы в overrides/mods. Клиент, который
распаковывает zip или импортирует его без CurseForge API, FTB не видит.

Этот шаг скачивает те же версии по [download].url (FTB Maven / прямой CDN)
и кладёт их в overrides/mods/, не трогая manifest.json.
"""
from __future__ import annotations

import json
import sys
import tempfile
import tomllib
import zipfile
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPTS))
from build_manual_zip import download_one  # noqa: E402


def cf_mod_tomls(mods_dir: Path) -> list[Path]:
    out = []
    for toml in sorted(mods_dir.glob("*.pw.toml")):
        meta = tomllib.loads(toml.read_text(encoding="utf-8"))
        update = meta.get("update") or {}
        if "curseforge" in update:
            out.append(toml)
    return out


def inject(zip_path: Path, mods_dir: Path) -> int:
    tomls = cf_mod_tomls(mods_dir)
    if not tomls:
        print("Нет модов с [update.curseforge] — нечего дописывать")
        return 0

    with tempfile.TemporaryDirectory() as tmp:
        tmp_mods = Path(tmp)
        jars: dict[str, Path] = {}
        for toml in tomls:
            print(download_one(toml, tmp_mods))
            meta = tomllib.loads(toml.read_text(encoding="utf-8"))
            filename = meta["filename"]
            jars[filename] = tmp_mods / filename
            if not jars[filename].is_file():
                raise RuntimeError(f"нет файла после загрузки: {filename}")

        tmp_zip = zip_path.with_suffix(zip_path.suffix + ".tmp")
        skip = {f"overrides/mods/{name}" for name in jars}
        with zipfile.ZipFile(zip_path, "r") as src, zipfile.ZipFile(
            tmp_zip, "w", compression=zipfile.ZIP_DEFLATED
        ) as dst:
            for item in src.infolist():
                if item.filename in skip:
                    continue
                dst.writestr(item.filename, src.read(item.filename), compress_type=item.compress_type)
            for name, path in jars.items():
                arc = f"overrides/mods/{name}"
                dst.write(path, arcname=arc)
                print(f"  + {arc} ({path.stat().st_size} bytes)")
        tmp_zip.replace(zip_path)

    print(f"Дописано {len(jars)} jar в {zip_path.name}")
    verify(zip_path, tomls)
    return 0


def verify(zip_path: Path, tomls: list[Path]) -> None:
    """CI-проверка: ID в манифесте И jar в overrides — иначе клиент снова без FTB."""
    with zipfile.ZipFile(zip_path) as z:
        man = json.loads(z.read("manifest.json"))
        ids = {(int(f["projectID"]), int(f["fileID"])) for f in man.get("files") or []}
        names = set(z.namelist())
    missing_ids: list[str] = []
    missing_jars: list[str] = []
    for toml in tomls:
        meta = tomllib.loads(toml.read_text(encoding="utf-8"))
        cf = (meta.get("update") or {}).get("curseforge") or {}
        pair = (int(cf["project-id"]), int(cf["file-id"]))
        name = meta.get("name") or toml.name
        if pair not in ids:
            missing_ids.append(f"{name} {pair}")
        arc = f"overrides/mods/{meta['filename']}"
        if arc not in names:
            missing_jars.append(arc)
    if missing_ids or missing_jars:
        raise RuntimeError(
            "CurseForge zip неполный: "
            + (f"нет в manifest.json: {missing_ids}; " if missing_ids else "")
            + (f"нет jar в overrides: {missing_jars}" if missing_jars else "")
        )
    print(f"Проверка OK: {len(tomls)} CF-мода в manifest.json и в overrides/mods/")


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: inject_cf_override_jars.py <curseforge.zip>", file=sys.stderr)
        return 2
    zip_path = Path(sys.argv[1])
    if not zip_path.is_file():
        print(f"нет файла {zip_path}", file=sys.stderr)
        return 1
    mods_dir = Path("mods")
    if not mods_dir.is_dir():
        print("нет каталога mods/ — запускайте из корня пака", file=sys.stderr)
        return 1
    try:
        return inject(zip_path, mods_dir)
    except Exception as exc:  # noqa: BLE001
        print(f"Ошибка: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
