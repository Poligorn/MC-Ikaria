# 🤖 CI/CD для PackWiz модпака

Автоматизация выпуска модпака: 3 билда, анонсы в Discord, отслеживание коммитов.

## 📋 Что делает система

### 1. 🔧 Dev-коммиты → приватный канал
Каждый коммит в ветку `dev` постится в приватный Discord-канал для админов.

**Что показывает:**
- Список коммитов (до 10)
- Количество изменённых файлов
- Список изменённых модов (`.pw.toml` файлы)
- Ссылка на сравнение (compare view)

### 2. 🚀 Main → Release + 3 билда + анонс
Любой пуш/мердж в ветку `main` запускает полный релиз-цикл:

**Три билда:**
1. **Modrinth** — `.mrpack` файл
2. **CurseForge** — `.zip` для CurseForge
3. **Manual** — `.zip` с джарниками для ручной установки

**Дополнительно:**
- Генерирует чейнджлог с диффом модов
- Создаёт GitHub Release с тегом `vX.Y.Z`
- Постит анонс в публичный канал Discord
- Пингует роль (опционально)

---

## 🛠️ Установка

### Шаг 1: Копируем файлы в репозиторий

Скопируйте всю папку `.github/` в корень вашего PackWiz-репозитория:

```
your-modpack/
├── .github/
│   ├── workflows/
│   │   ├── dev-notify.yml
│   │   └── release.yml
│   └── scripts/
│       ├── notify_dev.py
│       ├── notify_release.py
│       ├── pack_meta.py
│       ├── changelog.py
│       └── build_manual_zip.py
├── pack.toml
├── index.toml
└── mods/
```

### Шаг 2: Создаём Discord Webhooks

#### Для dev-канала (приватный):
1. Откройте приватный канал в Discord (админский)
2. **Настройки канала → Интеграции → Вебхуки → Создать вебхук**
3. Имя: `Dev Feed`, копируем URL
4. GitHub: **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `DISCORD_DEV_WEBHOOK`
   - Value: `https://discord.com/api/webhooks/...`

#### Для анонсов (публичный):
1. Откройте публичный канал `#announcements`
2. Создайте вебхук: `Modpack Releases`
3. В GitHub Secrets:
   - Name: `DISCORD_ANNOUNCE_WEBHOOK`
   - Value: `https://discord.com/api/webhooks/...`

#### Пинг роли при анонсе (опционально):
Если хотите пинговать роль `@Updates` при релизе:

1. В Discord: **Настройки сервера → Роли → Updates → скопируйте ID** (нужен режим разработчика)
2. GitHub: **Settings → Secrets and variables → Actions → Variables (вкладка)**
   - Name: `DISCORD_PING_ROLE_ID`
   - Value: `123456789012345678` (ID роли)

Если не хотите пинговать — просто не создавайте эту переменную.

### Шаг 3: Проверяем pack.toml

Убедитесь, что `pack.toml` содержит актуальные данные:

```toml
name = "My Awesome Modpack"
version = "1.0.0"

[versions]
minecraft = "1.20.1"
forge = "47.2.0"  # или fabric/neoforge
```

**Важно:** при каждом релизе поднимайте `version` вручную. Система использует его для тега `vX.Y.Z`.

### Шаг 4: Запускаем первый релиз

```bash
# 1. Работаем в dev
git checkout dev
git add .
git commit -m "Add JEI mod"
git push  # → сообщение в приватный канал

# 2. Мерджим в main для релиза
git checkout main
git merge dev
git push  # → создаёт Release + 3 билда + анонс
```

Через ~2-5 минут в `#announcements` появится пост с тремя ссылками на скачивание.

---

## 📦 Структура билдов

### 1. Modrinth (.mrpack)
- Для установки через Modrinth Launcher / Prism Launcher
- Генерируется командой `packwiz modrinth export`
- Моды скачиваются автоматически при установке

### 2. CurseForge (.zip)
- Для загрузки на CurseForge или установки через CurseForge App
- Генерируется командой `packwiz curseforge export`
- Совместим с Overwolf/CurseForge Launcher

### 3. Manual (jars + configs)
- ZIP со всеми джарниками и конфигами
- Для ручной установки в любой лаунчер (MultiMC, ATLauncher, PolyMC, стандартный)
- Включает README.txt с инструкцией

**Что входит в Manual ZIP:**
```
mods/           — все .jar файлы
config/         — конфиги модов
kubejs/         — KubeJS скрипты (если есть)
scripts/        — CraftTweaker (если есть)
defaultconfigs/ — дефолты
overrides/      — всё остальное (кроме логов)
README.txt      — инструкция по установке
```

---

## 🔄 Workflow: как это работает

### Dev-workflow (каждый коммит в `dev`)
```
push → dev → GitHub Actions → notify_dev.py → Discord приватный канал
```

**Что видят админы:**
```
🔧 Новые коммиты в dev

[`abc1234`](link) Add Create mod — *Poligorn*
[`def5678`](link) Update JEI config — *Poligorn*

Коммитов: 2
Файлов изменено: 8
Моды (3): create, jei, kubejs

your-repo/modpack · ветка dev
```

### Release-workflow (push в `main`)
```
push → main → GitHub Actions →
  ├─ pack_meta.py      (читает pack.toml)
  ├─ changelog.py      (дифф модов + коммиты)
  ├─ build 1: .mrpack
  ├─ build 2: .zip (curseforge)
  ├─ build 3: .zip (manual)
  ├─ GitHub Release
  └─ notify_release.py → Discord публичный канал
```

**Что видят игроки в #announcements:**
```
@Updates вышла новая версия — v1.2.0

🚀 My Awesome Modpack v1.2.0

### ➕ Добавлены моды
- Create
- Applied Energistics 2

### 🔄 Обновлены моды
- JEI
- Waystones

### 📝 Изменения
- Добавлен крафт для стартового набора
- Исправлен баг с порталами
…и ещё 5 коммит(ов)

Minecraft: 1.20.1
Загрузчик: Forge 47.2.0
Моды: ➕ 2 · 🔄 2

📥 Скачать
• Modrinth / .mrpack (link)
• CurseForge / .zip (link)
• Ручная установка / jars (link)

Обновите сборку перед входом на сервер
```

---

## 🐛 Устранение проблем

### Webhook не работает
**Проверьте:**
- URL точно скопирован (без пробелов в конце)
- Webhook не удалён в Discord
- Секрет добавлен с правильным именем (регистр важен)

**Как проверить:** зайдите в **Actions → последний запуск → notify → Build and send embed** — там будет лог с ошибкой.

### Дубликат тега
```
::warning::Тег v1.2.0 уже существует — поднимите version в pack.toml
```

Релиз пропущен, потому что версия не изменилась. **Решение:** откройте `pack.toml`, поднимите `version = "1.2.1"` и сделайте новый коммит.

### Моды не скачались
Если в manual.zip нет `.jar` файлов:

```bash
# Локально проверьте:
packwiz refresh
ls mods/*.jar
```

Если джарников нет — значит, они не скачались через packwiz. Проверьте `mods/*.pw.toml` на корректные хеши.

### Python-ошибки
Если видите `ModuleNotFoundError: tomllib`:

Убедитесь, что workflow использует Python 3.12+ (в наших файлах уже `python-version: "3.12"`).

### Force-push в dev
Если сделали `git push --force` в dev, бот пометит это оранжевым цветом:

```
⚠️ force-push в dev
```

Это нормально для dev-ветки, но напоминание, что история переписана.

---

## ⚙️ Настройка под себя

### Изменить имя вебхука
Откройте `notify_dev.py` или `notify_release.py` и измените строку:

```python
"username": "Dev Feed"  # или "Your Modpack Bot"
```

### Добавить логотип в embed
В `notify_release.py` добавьте в `embed`:

```python
"thumbnail": {"url": "https://your-site.com/logo.png"}
```

### Изменить цвет embed
```python
COLOR_RELEASE = 0xD4A574  # steampunk bronze
# Попробуйте: 0x5865F2 (discord blue), 0xE67E22 (orange), 0x1ABC9C (teal)
```

### Отключить пинг роли
Просто не создавайте переменную `DISCORD_PING_ROLE_ID` в GitHub.

### Добавить автозагрузку на Modrinth/CurseForge
Для этого нужны их API-ключи. **Не рекомендую автоматизировать** — платформы требуют ручного review для каждого файла, иначе блокируют.

---

## 📚 Структура файлов

```
.github/
├── workflows/
│   ├── dev-notify.yml         # Триггер: push в dev
│   └── release.yml            # Триггер: push в main
└── scripts/
    ├── notify_dev.py          # Постит коммиты
    ├── notify_release.py      # Постит релиз-анонс
    ├── pack_meta.py           # Читает pack.toml
    ├── changelog.py           # Генерит дифф модов
    └── build_manual_zip.py    # Собирает ZIP с джарами
```

**Все скрипты автономные** — используют только stdlib Python (urllib, json, zipfile, tomllib).

---

## 🚀 Быстрый старт (checklist)

- [ ] Скопировал `.github/` в репозиторий
- [ ] Создал два вебхука в Discord (dev + announce)
- [ ] Добавил секреты в GitHub:
  - [ ] `DISCORD_DEV_WEBHOOK`
  - [ ] `DISCORD_ANNOUNCE_WEBHOOK`
- [ ] (Опционально) Добавил переменную `DISCORD_PING_ROLE_ID`
- [ ] Проверил `pack.toml` (name, version, minecraft, loader)
- [ ] Сделал первый пуш в `dev` — проверил сообщение в приватном канале
- [ ] Смерджил `dev → main` — проверил релиз в `#announcements`
- [ ] Протестировал скачивание всех трёх билдов

---

**Готово! Система автоматически отслеживает коммиты и собирает релизы.**

Если что-то не работает — смотрите логи в **Actions → последний запуск → клик на шаг с ошибкой**.
