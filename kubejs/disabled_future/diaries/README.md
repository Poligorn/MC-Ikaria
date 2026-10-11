# Дневники Трёх — отложено

Контент **не удалён**. Лут, крафт листов и квесты следа выключены флагом `global.ASI_DIARIES_ENABLED = false` в `kubejs/startup_scripts/asi_features.js`.

Тома при этом **есть** в игре: `/asi givediaries` (оператор, права 2) и вкладка креатива `kubejs:asi_diaries`. EMI их прячет.

## Что лежит здесь

| Путь | Зачем |
|------|--------|
| `ftbquests/*.snbt` | Главы-следы + снимок квестов обложек и lang-ключей |
| `advancement/diary/` | Оригиналы unlock (`inventory_changed` на `kubejs:diary_page_*`) |

JSON книг, модели и текстуры остаются в `kubejs/assets/asi/` и `kubejs/data/asi/modopedia/`.

В `kubejs/data/asi/advancement/diary/` сейчас **тестерские** stub’ы: те же id, критерий `minecraft:impossible`, скрытые. Их выдаёт команда / креатив, чтобы книга читалась целиком. Оригиналы отсюда **не** копируйте поверх, пока листы не зарегистрированы — критерий ссылался бы на несуществующий предмет.

## Как включить снова

1. В `kubejs/startup_scripts/asi_features.js` поставьте `global.ASI_DIARIES_ENABLED = true`.
2. Верните главы: скопируйте `ftbquests/{elias,kaira,rovan}_trail.snbt` в `config/ftbquests/quests/chapters/`.
3. Верните три квеста обложек из `ftbquests/cover_quests.snbt` в `initial_research.snbt` (после стартера, deps на `3364BA01A0AF91D8`).
4. Верните ключи из `ftbquests/lang_diary_entries.snbt` в `config/ftbquests/quests/lang/{en_us,ru_ru}.snbt`.
5. **Замените** живые stub’ы: скопируйте `advancement/diary/` поверх `kubejs/data/asi/advancement/diary/` (листы к этому моменту уже регистрируются).
6. `packwiz refresh`. Тексты стартера, которые сейчас только называют троих, снова можно привязать к поиску томов.

Скрипты лута, листов, крафта и скрытие EMI читают тот же флаг. `/asi givediaries` флаг не читает — команда всегда работает.
