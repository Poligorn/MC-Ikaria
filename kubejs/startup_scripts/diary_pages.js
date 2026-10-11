// Вырванные листы дневников Трёх. Текстура — kubejs:item/diary_page_<id>
// Регистрация только при global.ASI_DIARIES_ENABLED (asi_features.js).
const DIARY_PAGES = [
  'mechanist_kinetics',
  'mechanist_machines',
  'mechanist_progress',
  'skyward_glider',
  'skyward_airship',
  'skyward_sky',
  'wildlander_beasts',
  'wildlander_portals',
  'wildlander_ruins'
]

StartupEvents.registry('item', event => {
  if (!global.ASI_DIARIES_ENABLED) return
  for (let i = 0; i < DIARY_PAGES.length; i++) {
    event.create('diary_page_' + DIARY_PAGES[i])
      .maxStackSize(1)
      .rarity('uncommon')
  }
})
