// Скрыть всё Clockwork кроме крыльев из EMI (в паке нет JEI/REI).
const CLOCKWORK_HIDE_ITEMS = [
  'clockwork:clockwork_gear',
  'clockwork:crossbow_barrel',
  'clockwork:clockwork_arrow',
  'clockwork:barrel_crossbow',
  'clockwork:scope_crossbow',
  'clockwork:clockwork_potion_sprayer',
  'clockwork:clockwork_flamethrower',
  'clockwork:clockwork_drill'
]

RecipeViewerEvents.removeEntriesCompletely('item', event => {
  for (let i = 0; i < CLOCKWORK_HIDE_ITEMS.length; i++) {
    event.remove(CLOCKWORK_HIDE_ITEMS[i])
  }
})
