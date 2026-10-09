// Листы дневников в сундуках структур (Lootr крутит таблицу на игрока).
// Rhino в KubeJS не понимает spread (...array) — addLoot по одному.
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
  let modifier = event.addTableModifier(/.*chests.*/)
  for (let i = 0; i < DIARY_PAGE_ITEMS.length; i++) {
    modifier.addLoot(LootEntry.of(DIARY_PAGE_ITEMS[i]).randomChance(0.055))
  }
})
