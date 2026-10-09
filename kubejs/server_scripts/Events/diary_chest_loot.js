// Листы дневников в сундуках структур (Lootr крутит таблицу на игрока).
// LootJS 3.x: modifiers + LootType.CHEST + LootEntry.randomChance
const DIARY_PAGE_ITEMS = [
  'kubejs:diary_page_mechanist_kinetics',
  'kubejs:diary_page_mechanist_machines',
  'kubejs:diary_page_mechanist_progress',
  'kubejs:diary_page_skyward_glider',
  'kubejs:diary_page_skyward_airship',
  'kubejs:diary_page_skyward_sky',
  'kubejs:diary_page_wildlander_beasts',
  'kubejs:diary_page_wildlander_portals',
  'kubejs:diary_page_wildlander_ruins'
]

LootJS.modifiers(event => {
  const entries = DIARY_PAGE_ITEMS.map(id => LootEntry.of(id).randomChance(0.055))
  event.addTableModifier(/.*chests.*/).addLoot(...entries)
})
