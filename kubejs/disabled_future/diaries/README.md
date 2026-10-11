# Дневники Трёх — отложено

Контент **не удалён**. В релизе выключен флагом `global.ASI_DIARIES_ENABLED = false` в `kubejs/startup_scripts/asi_features.js`.

## Что лежит здесь

| Путь | Зачем |
|------|--------|
| `ftbquests/*.snbt` | Главы-следы + снимок квестов обложек и lang-ключей |
| `advancement/diary/` | Unlock-advancements Modopedia (`asi:diary/<key>`) |

JSON книг, модели и текстуры остаются в `kubejs/assets/asi/` и `kubejs/data/asi/modopedia/`.

## Как включить снова

1. В `kubejs/startup_scripts/asi_features.js` поставьте `global.ASI_DIARIES_ENABLED = true`.
2. Верните главы: скопируйте `ftbquests/{elias,kaira,rovan}_trail.snbt` в `config/ftbquests/quests/chapters/`.
3. Верните три квеста обложек из `ftbquests/cover_quests.snbt` в `initial_research.snbt` (после стартера, deps на `3364BA01A0AF91D8`).
4. Верните ключи из `ftbquests/lang_diary_entries.snbt` в `config/ftbquests/quests/lang/{en_us,ru_ru}.snbt`.
5. Верните `advancement/diary/` в `kubejs/data/asi/advancement/diary/`.
6. `packwiz refresh`. Тексты стартера, которые сейчас только называют троих, снова можно привязать к поиску томов.

Скрипты лута, листов, крафта, `/asi givediaries` и скрытие EMI читают тот же флаг — их двигать не нужно.
