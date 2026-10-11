# Дневники Трёх (Modopedia)

!!! warning "Пока не в релизе"
    Листы и квесты следа **отложены**: в сундуках их нет, в журнале FTB — нет, в EMI книги скрыты. Сами тома **есть** в датапаке: оператор выдаёт их `/asi givediaries` (права 2), в креативе они во вкладке `kubejs:asi_diaries`. JSON, модели и текстуры лежат в репо. Включить лут и квесты: `global.ASI_DIARIES_ENABLED = true` в `kubejs/startup_scripts/asi_features.js` и шаги из `kubejs/disabled_future/diaries/README.md`. На [роадмапе](../planning/roadmap.md#diaries-later) это контент «на потом».

В паке **Modopedia** 1.1.11 для NeoForge 1.21.1 (`mods/modopedia.pw.toml`). Три тестовых гайда заменены на **дневники основателей**. Ниже — как система устроена, когда флаг снова `true`.

Формат сверен с [Book JSON](https://moddedmc.wiki/en/project/modopedia/docs/books/book-json), [Book Textures](https://moddedmc.wiki/en/project/modopedia/docs/books/book-textures) и [Book Types](https://moddedmc.wiki/en/project/modopedia/docs/books/book-types) (classic + `locked_view_type`). Контент — только механики, которые есть в `mods/*.pw.toml` и в доках пака; нейро-рефы вроде «Ash Colossus» в текст не попали.

## Авторы и тома

Имена из журнала FTB (*The Mechanist / The Skyward / The Wildlander*) и слоя «Дневники Трех» на доске. Полные имена — чтобы у каждого был голос.

| ID | Том | Автор | Голос | Стиль GUI |
|----|-----|-------|-------|-----------|
| `asi:mechanist_diary` | Чертежи Механика | **Элиас Верн** (Механик) | Пометки `※`, только измеренное, без выдуманных SU | коричневая обложка, золотая скоба `modopedia:brown_gold` |
| `asi:skyward_diary` | Бортовой журнал Небохода | **Кайра Шторм** (Небоход) | Вахтенные записи, погода, высота | синяя обложка, серебро `modopedia:blue_silver` |
| `asi:wildlander_diary` | Полевой дневник Следопыта | **Рован Пепельный** (Следопыт) | Карточки бестиария, шкала ●…●●●● | красная обложка, железо `modopedia:red_iron` |

Лендинг classic: баннер = `title` / **Оглавление**, под лентой = `subtitle` + `landing_text` (**Подзаголовок**), справа список категорий (**Главы**). Закрытые главы видны полупрозрачно (`locked_view_type: translucent`).

Текстуры предметов — перекраска официальных иконок Modopedia (MIT, Favouriteless) плюс точка-эмблема на корешке. GUI-рамки — встроенные classic, не копия PNG в пак. Модели: `kubejs/assets/asi/models/item/modopedia_books/`.

## Как получить

Пока `ASI_DIARIES_ENABLED = false`, выживший **не** находит тома: лута нет, крафта нет, квестов нет, в EMI книг нет. Книги при этом зарегистрированы.

1. **Оператор.** `/asi givediaries` (права 2) всегда выдаёт три тома и открывает все главы. Флаг на это не влияет.
2. **Креатив.** Вкладка `kubejs:asi_diaries` («Дневники Трёх»). EMI прячет те же стеки через `RecipeViewerEvents.removeEntries` — не `removeEntriesCompletely` и не `modifyCreativeTab.remove`, иначе вместе с EMI пропала бы и вкладка (KubeJS #1096).
3. Куски (креатив / консоль):

    ```
    /give @s modopedia:book[modopedia:book="asi:mechanist_diary"]
    /give @s modopedia:book[modopedia:book="asi:skyward_diary"]
    /give @s modopedia:book[modopedia:book="asi:wildlander_diary"]
    /modopedia open book asi:skyward_diary
    ```

Когда флаг снова `true`:

4. **Сундуки.** Обложки и листы падают из таблиц `chests` (LootJS `diary_chest_loot.js`). На спавне книги **не** выдаются — только журнал FTB. Шанс обложки **16%** на том независимо; листа — **5.5%** на тип. **По одному на игрока:** флаг в `persistentData`; LootJS 3.7 `LootEntry.matchPlayerCustom` (не `playerPredicate`); листы `maxStackSize(1)`. Lootr крутит таблицу на игрока. На стартовом острове сундуков нет (бочонки — NBT структуры).
5. **Крафт обложки** (`kubejs/server_scripts/Recipes/modopedia_books.js`): книга + компас / карта / кость.

Предмет книги — `modopedia:book`, ID тома в компоненте `modopedia:book`. Квесты FTB рисуют ту же обложку: иконка и item-задача — стек `{id:"modopedia:book", components:{"modopedia:book":"asi:<том>"}}`. Модели: `kubejs/assets/asi/models/item/modopedia_books/` → `asi:item/<том>`.

## Сбор страниц и unlock

Modopedia 1.1.11 **не** запирает главу предметом напрямую. Есть поле `advancement` у категории и записи.

Цепочка в паке (когда флаг `true`):

1. Лист в сундуке (`diary_chest_loot.js`).
2. Advancement `asi:diary/<key>` — триггер `inventory_changed`.
3. Категория и её записи ссылаются на этот advancement.
4. Предисловие каждого тома **без** advancement — первая запись всегда открыта: обрывок в голосе автора, без инструкций «как вести дневник».
5. Тост advancement + сообщение в чат (`diary_page_pickup.js`).

Пока флаг `false` листы не регистрируются — оригинальные `inventory_changed` нельзя грузить (предупреждение о отсутствующем предмете). В `kubejs/data/asi/advancement/diary/` лежат **тестерские** копии: тот же id, критерий `minecraft:impossible`, `hidden`, без тоста. `/asi givediaries` и попадание тома в инвентарь (креатив / `/give`) выдают все `asi:diary/*`. Тестер читает книгу целиком; выживший эти advancement’ы сам не заработает — листов в мире нет. Оригиналы с `inventory_changed` остаются в `disabled_future`; при включении флага **замените** живые stub’ы ими.

## Где лежат файлы

```
kubejs/data/asi/modopedia/books/<book_id>.json
kubejs/data/asi/advancement/diary/
kubejs/assets/asi/modopedia/books/<book_id>/<lang>/{categories,entries}/
kubejs/assets/asi/models/item/modopedia_books/
kubejs/assets/asi/textures/item/
kubejs/startup_scripts/diary_pages.js
kubejs/startup_scripts/diary_tab.js
kubejs/startup_scripts/asi_features.js
kubejs/server_scripts/Events/diary_access.js
kubejs/disabled_future/diaries/
```

Локали `ru_ru` и `en_us` синхронизированы по id файлов.

## О чём тома (факты пака)

- **Механик:** стресс/RPM Create без выдуманных SU, вал/шестерни, пресс/миксер/мельница, деплойер/пила/вентилятор, андезит→латунь, список аддонов пака.
- **Небоход:** Paragliders + аэролит, Clockwork-крылья (рецепт пака), корабль = Create Aeronautics + Sable (VS2 нет), тяга из `aeronautics-server.toml`, Hostile Skies, Discovery, Waystones: Sable.
- **Следопыт:** More Mobs / пиглины / стража / Hordium без выдуманных боссов, дикий сектор 1500, Eve Wormhole Portals, Незер/Энд/Deeper Darker/Stellarity, YUNG + Dungeons Arise + деревни в небе, Artifacts / Lootr / Clavis.

!!! warning "Чего эта среда не проверяет"
    JSON валиден синтаксически. Клиент Minecraft с модами здесь не запускается: GUI книги, точный ID каждого предмета Create 6 и дроп LootJS на Lootr нужно смотреть в игре. Если книга не открывается — лог Modopedia и язык клиента (`ru_ru` / `en_us`).
