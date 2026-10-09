# Книги Modopedia

В паке уже есть мод **Modopedia** 1.1.11 для NeoForge 1.21.1 (`mods/modopedia.pw.toml`, Modrinth `SYrakyVL`). Добавлять его через Packwiz не нужно.

Тестовые книги — датапак + ресурспак в **KubeJS** (так пак уже кладёт структуры `asi:` и языковые файлы). Формат сверен с [документацией Modopedia](https://moddedmc.wiki/en/project/modopedia/docs/books/overview) (версия мода **1.1.11**, MC **1.21.1**).

## Три тестовые книги

| ID | Название | О чём |
|----|----------|--------|
| `asi:pilot_handbook` | Справочник пилота | Вводный гайд пака: остров, полёт, квесты |
| `asi:void_almanac` | Альманах пустоты | EVE-inspired червоточины и ранги |
| `asi:mod_compendium` | Компендиум модов | Обзор ядра пака + страница ванильного рецепта |

Тип книг: `modopedia:classic` (категории → записи → страницы). В записях есть текст, галерея предметов (`modopedia:item_gallery`) и шаблон рецепта (`modopedia:page/crafting`).

Локализации контента: `ru_ru` и `en_us`. Заголовки предметов книг — ключи в `kubejs/assets/asi/lang/`.

## Как получить в игре

1. **Первый вход:** справочник пилота кладётся в хотбар рядом с книгой квестов.
2. **Крафт** (KubeJS, `kubejs/server_scripts/Recipes/modopedia_books.js`):
    - книга + карта → справочник пилота;
    - книга + жемчуг Края → альманах пустоты;
    - книга + компас → компендиум модов.
3. **Творчество:** книги попадают во вкладку Search и в `minecraft:tools_and_utilities`.
4. Команды:

    ```
    /give @s modopedia:book[modopedia:book="asi:pilot_handbook"]
    /give @s modopedia:book[modopedia:book="asi:void_almanac"]
    /give @s modopedia:book[modopedia:book="asi:mod_compendium"]
    /modopedia open book asi:pilot_handbook
    ```

Предмет книги — `modopedia:book`. ID гайда хранится в data component **`modopedia:book`** (ResourceLocation), см. исходники Modopedia (`MDataComponents`, `MBookItem`).

## Где лежат файлы

```
kubejs/data/asi/modopedia/books/<book_id>.json          # datapack: book.json
kubejs/assets/asi/modopedia/books/<book_id>/<lang>/
    categories/<id>.json
    entries/<id>.json
kubejs/assets/asi/lang/ru_ru.json
kubejs/assets/asi/lang/en_us.json
```

KubeJS подхватывает `kubejs/data/` как датапак и `kubejs/assets/` как ресурспак. После добавления файлов в репозиторий выполните `packwiz refresh`.

## Как добавить ещё одну книгу

1. Создайте `kubejs/data/<namespace>/modopedia/books/<id>.json` с полями `title`, при желании `subtitle`, `landing_text`, `creative_tab`, `type`.
2. Создайте content set: `kubejs/assets/<namespace>/modopedia/books/<id>/ru_ru/categories/` и `.../entries/`.
3. В категории перечислите `entries` по id файлов записей. Для `modopedia:classic` запись без категории на лендинге не появится.
4. Страница — объект с `components`: либо `{ "type": "modopedia:text", "text": "..." }`, либо `{ "template": "modopedia:page/headered_text", ... }`, либо `{ "template": "modopedia:page/crafting", "recipe": "minecraft:stick" }`.
5. Предметы в галерее: `modopedia:item_gallery` + display `modopedia:simple` / `grid` / `cycling`.
6. Добавьте ключи в lang, рецепт или `/give`, затем `packwiz refresh`.

Официальная схема: [Book JSON](https://moddedmc.wiki/en/project/modopedia/docs/books/book-json), [Categories](https://github.com/Favouriteless/Modopedia/blob/main/docs/books/category-json.mdx), [Entries](https://github.com/Favouriteless/Modopedia/blob/main/docs/books/entry-json.mdx), [Templates](https://github.com/Favouriteless/Modopedia/blob/main/docs/books/templates.mdx).

!!! warning "Чего этот пак не проверяет автоматически"
    JSON валидируется синтаксически. Открыть GUI книги в клиенте Minecraft в этой среде нельзя: нужны установленные моды. Если книга не открывается, смотрите лог Modopedia (`Error attempting to load book`) и язык клиента (`ru_ru` / `en_us`).
