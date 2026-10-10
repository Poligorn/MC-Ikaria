// Тома и листы: по одному на игрока. Lootr крутит таблицу на игрока.
// Rhino: без spread; флаг замыкается в asiLootOnce, не в общем цикле.
const ASI_DIARY_BOOK_CHANCE = 0.16
const ASI_DIARY_PAGE_CHANCE = 0.055

function asiLootOnce(event, itemId, chance, flag) {
  event.addTableModifier(/.*chests.*/)
    .playerPredicate(function (p) {
      return !!p && !p.persistentData.getBoolean(flag)
    })
    .addLoot(LootEntry.of(itemId).randomChance(chance))
}

LootJS.modifiers(event => {
  asiLootOnce(event, 'modopedia:book[modopedia:book="asi:mechanist_diary"]', ASI_DIARY_BOOK_CHANCE, 'asi_got_book_mechanist')
  asiLootOnce(event, 'modopedia:book[modopedia:book="asi:skyward_diary"]', ASI_DIARY_BOOK_CHANCE, 'asi_got_book_skyward')
  asiLootOnce(event, 'modopedia:book[modopedia:book="asi:wildlander_diary"]', ASI_DIARY_BOOK_CHANCE, 'asi_got_book_wildlander')
  asiLootOnce(event, 'kubejs:diary_page_mechanist_kinetics', ASI_DIARY_PAGE_CHANCE, 'asi_got_page_mechanist_kinetics')
  asiLootOnce(event, 'kubejs:diary_page_mechanist_machines', ASI_DIARY_PAGE_CHANCE, 'asi_got_page_mechanist_machines')
  asiLootOnce(event, 'kubejs:diary_page_mechanist_progress', ASI_DIARY_PAGE_CHANCE, 'asi_got_page_mechanist_progress')
  asiLootOnce(event, 'kubejs:diary_page_skyward_glider', ASI_DIARY_PAGE_CHANCE, 'asi_got_page_skyward_glider')
  asiLootOnce(event, 'kubejs:diary_page_skyward_airship', ASI_DIARY_PAGE_CHANCE, 'asi_got_page_skyward_airship')
  asiLootOnce(event, 'kubejs:diary_page_skyward_sky', ASI_DIARY_PAGE_CHANCE, 'asi_got_page_skyward_sky')
  asiLootOnce(event, 'kubejs:diary_page_wildlander_beasts', ASI_DIARY_PAGE_CHANCE, 'asi_got_page_wildlander_beasts')
  asiLootOnce(event, 'kubejs:diary_page_wildlander_portals', ASI_DIARY_PAGE_CHANCE, 'asi_got_page_wildlander_portals')
  asiLootOnce(event, 'kubejs:diary_page_wildlander_ruins', ASI_DIARY_PAGE_CHANCE, 'asi_got_page_wildlander_ruins')
})
