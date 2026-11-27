# Главы FTB Quests

Карта журнала *Мой журнал* (`config/ftbquests/`). Сейчас в игре **одна глава**. Ниже — как разложить следующие главы по гайдам пака и правилам сервера (ветки `dev` + `server`).

Тексты квестов — `config/ftbquests/quests/lang/ru_ru.snbt`.

---

## Уже в журнале

| Глава | Файл | О чём | Гайд |
|-------|------|--------|------|
| **Камень и три имени** | `chapters/initial_research.snbt` | Проснулся на острове → оболочка и горелка → Physics Assembler → андезитовый пропеллер; параллельно параглайдер из аэролита | [Первые шаги](getting-started-guide.md), [первый запуск](../getting-started/first-launch.md), [острова](../mechanics/flying-islands.md) |

Три имени (Элиас, Кайра, Рован) — тон стартера, не предметы. Дневники Modopedia **не** в этой главе: [Modopedia](modopedia.md).

---

## Предлагаемые главы

Порядок — как игрок их встречает. Каждая глава = гайд по модам **и** правило сервера, если оно есть.

### 1. Не упасть

- **Моды:** Forgiving Void, Clear Void, Smooth Skies, Aero Islands.
- **Правило:** база не на самом краю без ограды; падение возвращает сверху, но убивает.
- **Гайд:** [первые шаги §1](getting-started-guide.md), [острова / пустота](../mechanics/flying-islands.md).

### 2. Крыло и корабль

- **Моды:** Paragliders (рецепт с аэролитом), Create Aeronautics, Simulated / Physics Assembler, Sable, Aeronautics Camera Sync. Clockwork — только крылья.
- **Правило:** обычные Waystones **не крафтятся**. На корабль — только **Waystones: Sable**.
- **Гайд:** [первые шаги §3–4](getting-started-guide.md), [корабли](../mechanics/airships.md), [Aeronautics](../mods/aeronautics.md).

### 3. Мастерская Create

- **Моды:** Create (кинетика, пресс, смеситель, мельница, деплойер). Нет Mekanism / IE / AE2.
- **Правило:** нет. Прогресс как в ванильном Create.
- **Гайд:** [первые шаги §4](getting-started-guide.md). Позже — том Механика в [Modopedia](modopedia.md).

### 4. Еда

- **Моды:** Farmer's Delight, Slice & Dice, Botany Pots, Starcatcher.
- **Правило:** нет отдельного.
- **Гайд:** [первые шаги §5](getting-started-guide.md).

### 5. Зоны мира

Скрипты на ветке `server`: `Dimensions/zones.js`, `Wild_Lands/danger_indicator.js`. Дистанция от **(0, 0)** оверворлда.

| Зона | Радиус | Правило |
|------|--------|---------|
| Спавн | &lt; 100 | Хаб, без дикого PvE-огнестрела |
| Стройка | 100–1500 | Базы, клаймы OPAC |
| Дикие | ≥ 1500 | Тир опасности каждые 500 блоков; мобы с CGS; захват waystone |
| Незер | измерение | Нет чата, ники скрыты, смерти молчат, координаты 1:1 с оверворлдом |
| Энд | измерение | Отдельная метка в TAB |

- **Гайд:** [первые шаги §6](getting-started-guide.md), [механики](../mechanics/index.md), [концепт зон](../planning/concept.md).

### 6. Клаймы и вечеринки

- **Моды:** Open Parties and Claims, OPAC Warfare / Bonus Claims, Create Aeronautics: Claims (корабль ≠ чанк земли).
- **Правило:** чужой чанк не ломать; Create-машины в чужом привате режутся конфигом OPAC; корабль клеится AeroClaims.
- **Гайд:** [первые шаги §7](getting-started-guide.md), [механики](../mechanics/index.md).

### 7. Рынок

- **Моды:** Numismatics, Marketplace, Villager Currency (жители → `numismatics:cog`).
- **Правило:** глобальная доска, не локальный сундук. Игровые магазины сами выставляют цены.
- **Гайд:** [первые шаги §7](getting-started-guide.md).

### 8. Дикие земли и бой

- **Моды:** Create: Gunsmithing, Hostile Skies, Radars, Big Cannons. KubeJS: огнестрел мобам с 1500, «бункер» с 5000, мародёры с 7000.
- **Правило:** рейды дирижаблей по таймеру; PvP и захват waystone — в диких / Незере.
- **Гайд:** [корабли / бой](../mechanics/airships.md), [механики / мобы](../mechanics/index.md).

### 9. Червоточины

- **Моды:** Eve Wormhole Portals.
- **Правило:** это не хаб Незера. Класс, таймер, лимит проходов; берите радар.
- **Гайд:** [EVE Online](../lore/eve-online.md).

### 10. Лицензия пилота

- **Моды:** предметы `kubejs:pilot_license_*`, слот Curios `license`.
- **Правило:** в репо **нет** выдачи. Экзамен / ранги настраивает сервер.
- **Гайд:** [первый запуск](../getting-started/first-launch.md), [EVE / ранги](../lore/eve-online.md).

---

## Пока не в журнале

Главы-следы Элиаса / Кайры / Рована лежат в `kubejs/disabled_future/diaries/ftbquests/`. В выживание не входят, пока `ASI_DIARIES_ENABLED` выключен. Как вернуть: [Modopedia](modopedia.md).
