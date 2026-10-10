// Тома и листы: по одному на игрока. LootJS 3.7.0: LootModifier$Builder
// не имеет playerPredicate. Условие игрока — matchPlayerCustom
// (LootConditionsContainer → PlayerParamPredicate).
// Rhino: без spread; флаг замыкается в asiLootOnce.
const ASI_DIARY_BOOK_CHANCE = 0.16
const ASI_DIARY_PAGE_CHANCE = 0.055

function asiLootOnce(modifier, itemId, chance, flag) {
  modifier.addLoot(
    LootEntry.of(itemId)
      .randomChance(chance)
      .matchPlayerCustom(function (p) {
        return !p.persistentData.getBoolean(flag)
      })
  )
}

LootJS.modifiers(event => {
  let modifier = event.addTableModifier(/.*chests.*/)
  asiLootOnce(modifier, 'modopedia:book[modopedia:book="asi:mechanist_diary"]', ASI_DIARY_BOOK_CHANCE, 'asi_got_book_mechanist')
  asiLootOnce(modifier, 'modopedia:book[modopedia:book="asi:skyward_diary"]', ASI_DIARY_BOOK_CHANCE, 'asi_got_book_skyward')
  asiLootOnce(modifier, 'modopedia:book[modopedia:book="asi:wildlander_diary"]', ASI_DIARY_BOOK_CHANCE, 'asi_got_book_wildlander')
  asiLootOnce(modifier, 'kubejs:diary_page_mechanist_kinetics', ASI_DIARY_PAGE_CHANCE, 'asi_got_page_mechanist_kinetics')
  asiLootOnce(modifier, 'kubejs:diary_page_mechanist_machines', ASI_DIARY_PAGE_CHANCE, 'asi_got_page_mechanist_machines')
  asiLootOnce(modifier, 'kubejs:diary_page_mechanist_progress', ASI_DIARY_PAGE_CHANCE, 'asi_got_page_mechanist_progress')
  asiLootOnce(modifier, 'kubejs:diary_page_skyward_glider', ASI_DIARY_PAGE_CHANCE, 'asi_got_page_skyward_glider')
  asiLootOnce(modifier, 'kubejs:diary_page_skyward_airship', ASI_DIARY_PAGE_CHANCE, 'asi_got_page_skyward_airship')
  asiLootOnce(modifier, 'kubejs:diary_page_skyward_sky', ASI_DIARY_PAGE_CHANCE, 'asi_got_page_skyward_sky')
  asiLootOnce(modifier, 'kubejs:diary_page_wildlander_beasts', ASI_DIARY_PAGE_CHANCE, 'asi_got_page_wildlander_beasts')
  asiLootOnce(modifier, 'kubejs:diary_page_wildlander_portals', ASI_DIARY_PAGE_CHANCE, 'asi_got_page_wildlander_portals')
  asiLootOnce(modifier, 'kubejs:diary_page_wildlander_ruins', ASI_DIARY_PAGE_CHANCE, 'asi_got_page_wildlander_ruins')
})
