// Вырванные листы дневников Трёх. Текстура — kubejs:item/diary_page_<id>
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
  DIARY_PAGES.forEach(id => {
    event.create(`diary_page_${id}`)
      .maxStackSize(16)
      .rarity('uncommon')
  })
})
