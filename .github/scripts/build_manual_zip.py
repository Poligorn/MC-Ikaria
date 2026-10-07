#!/usr/bin/env python3
"""Собирает ZIP с джарниками для ручной установки в любой лаунчер."""
import os
import subprocess
import sys
import zipfile
from pathlib import Path

EXCLUDE_DIRS = {"overrides/.minecraft/logs", "overrides/.minecraft/crash-reports"}
INCLUDE_ROOTS = {"mods", "config", "kubejs", "scripts", "defaultconfigs", "overrides"}


def sh(*args: str) -> int:
    return subprocess.run(args, check=False).returncode


def main() -> int:
    slug = os.environ.get("SLUG", "modpack")
    version = os.environ.get("VERSION", "0.0.0")
    output = Path(f"{slug}-{version}-manual.zip")

    # Скачиваем моды через packwiz (если ещё не скачаны)
    if not Path("mods").is_dir() or not list(Path("mods").glob("*.jar")):
        print("Скачиваем моды через packwiz...")
        if sh("packwiz", "refresh") != 0:
            print("Ошибка packwiz refresh", file=sys.stderr)
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
                # Пропускаем .pw.toml (метаданные packwiz)
                if rel.suffix == ".toml" and rel.stem.endswith(".pw"):
                    continue
                # Пропускаем логи и краши
                if any(str(rel).startswith(ex) for ex in EXCLUDE_DIRS):
                    continue
                zf.write(f, arcname=str(rel))
                print(f"  + {rel}")

        # Добавляем README с инструкцией
        readme = f"""# {slug} v{version}

Ручная установка:

1. Распакуйте содержимое этого архива в папку .minecraft вашего лаунчера
2. Убедитесь, что у вас установлен нужный загрузчик (Forge/Fabric/NeoForge)
3. Запустите игру

Структура:
- mods/ — моды
- config/ — конфигурация
- kubejs/, scripts/ — скрипты (если есть)

Для автоматической установки используйте файлы для Modrinth или CurseForge.
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
