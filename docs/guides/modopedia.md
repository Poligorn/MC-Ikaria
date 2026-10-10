# Дневники Трёх (Modopedia)

В паке **Modopedia** 1.1.11 для NeoForge 1.21.1 (`mods/modopedia.pw.toml`). Три тестовых гайда заменены на **дневники основателей**: обложки целы, страницы раскиданы по сундукам.

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

1. **Сундуки.** Обложки и листы падают из таблиц `chests` (LootJS `diary_chest_loot.js`). На спавне книги **не** выдаются — только журнал FTB. Шанс обложки **16%** на том независимо; листа — **5.5%** на тип. **По одному на игрока:** флаг в `persistentData`, повторно не дропает; листы `maxStackSize(1)`. Lootr крутит таблицу на игрока. На стартовом острове сундуков нет (бочонки — NBT структуры).
2. **Крафт обложки** (`kubejs/server_scripts/Recipes/modopedia_books.js`): книга + компас / карта / кость.
3. **Оператор.** `/asi givediaries` выдаёт три тома (права 2). `/asi resetplayer` больше не кладёт дневники в инвентарь.
4. Куски:

    ```
    /give @s modopedia:book[modopedia:book="asi:mechanist_diary"]
    /give @s modopedia:book[modopedia:book="asi:skyward_diary"]
    /give @s modopedia:book[modopedia:book="asi:wildlander_diary"]
    /modopedia open book asi:skyward_diary
    ```

Предмет книги — `modopedia:book`, ID тома в компоненте `modopedia:book`.

## Сбор страниц и unlock

Modopedia 1.1.11 **не** запирает главу предметом напрямую. Есть поле `advancement` у категории и записи.

Цепочка в паке:

1. Лист в сундуке (`diary_chest_loot.js`).
2. Advancement `asi:diary/<key>` — триггер `inventory_changed`.
3. Категория и её записи ссылаются на этот advancement.
4. Предисловие каждого тома **без** advancement — первая запись всегда открыта: обрывок в голосе автора, без инструкций «как вести дневник».
5. Тост advancement + сообщение в чат (`diary_page_pickup.js`).

Корень дерева: скрытый `asi:diary/root` (тик). Это ближайший рабочий вариант к «страница из сундука открывает главу» без отдельного мода-квестбука.

## Где лежат файлы

```
kubejs/data/asi/modopedia/books/<book_id>.json
kubejs/data/asi/advancement/diary/
kubejs/assets/asi/modopedia/books/<book_id>/<lang>/{categories,entries}/
kubejs/assets/asi/models/item/modopedia_books/
kubejs/assets/asi/textures/item/
kubejs/startup_scripts/diary_pages.js
```

Локали `ru_ru` и `en_us` синхронизированы по id файлов.

## О чём тома (факты пака)

- **Механик:** стресс/RPM Create без выдуманных SU, вал/шестерни, пресс/миксер/мельница, деплойер/пила/вентилятор, андезит→латунь, список аддонов пака.
- **Небоход:** Paragliders + аэролит, Clockwork-крылья (рецепт пака), корабль = Create Aeronautics + Sable (VS2 нет), тяга из `aeronautics-server.toml`, Hostile Skies, Discovery, Waystones: Sable.
- **Следопыт:** More Mobs / пиглины / стража / Hordium без выдуманных боссов, дикий сектор 1500, Eve Wormhole Portals, Незер/Энд/Deeper Darker/Stellarity, YUNG + Dungeons Arise + деревни в небе, Artifacts / Lootr / Clavis.

!!! warning "Чего эта среда не проверяет"
    JSON валиден синтаксически. Клиент Minecraft с модами здесь не запускается: GUI книги, точный ID каждого предмета Create 6 и дроп LootJS на Lootr нужно смотреть в игре. Если книга не открывается — лог Modopedia и язык клиента (`ru_ru` / `en_us`).
