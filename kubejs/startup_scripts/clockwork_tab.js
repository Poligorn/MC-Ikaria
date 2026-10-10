// Вкладка мода: clockwork:clockwork_creative_tab (ClockworkCreativeTabs.class).
const CLOCKWORK_TAB_HIDE = [
  'clockwork:clockwork_gear',
  'clockwork:crossbow_barrel',
  'clockwork:clockwork_arrow',
  'clockwork:barrel_crossbow',
  'clockwork:scope_crossbow',
  'clockwork:clockwork_potion_sprayer',
  'clockwork:clockwork_flamethrower',
  'clockwork:clockwork_drill'
]

StartupEvents.modifyCreativeTab('clockwork:clockwork_creative_tab', event => {
  for (let i = 0; i < CLOCKWORK_TAB_HIDE.length; i++) {
    event.remove(CLOCKWORK_TAB_HIDE[i])
  }
})
