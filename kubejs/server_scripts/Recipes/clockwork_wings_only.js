// Clockwork 1.1.3 (jar clockwork-neoforge-1.21.1-1.1.3).
// Предметы из assets/clockwork/lang/en_us.json и data/clockwork/recipe/*.
// Ванильный рецепт крыльев требует clockwork:clockwork_gear — его не оставляем.
// Пак уже крафтит крылья из элитр / латуни / аэролита / Simulated / altimeter.
const CLOCKWORK_HIDDEN = [
  'clockwork:clockwork_gear',
  'clockwork:crossbow_barrel',
  'clockwork:clockwork_arrow',
  'clockwork:barrel_crossbow',
  'clockwork:scope_crossbow',
  'clockwork:clockwork_potion_sprayer',
  'clockwork:clockwork_flamethrower',
  'clockwork:clockwork_drill'
]

ServerEvents.recipes(event => {
  event.remove({ mod: 'clockwork' })
  for (let i = 0; i < CLOCKWORK_HIDDEN.length; i++) {
    event.remove({ output: CLOCKWORK_HIDDEN[i] })
  }
  event.remove({ output: 'clockwork:clockwork_wings' })

  event.shaped('clockwork:clockwork_wings', [
    'SMS',
    'BEB',
    'AGA'
  ], {
    A: 'aeroscapes:golden_aerolite_twig',
    E: 'minecraft:elytra',
    B: 'create:brass_sheet',
    G: 'simulated:gyroscopic_mechanism',
    S: 'simulated:spring',
    M: 'supplementaries:altimeter'
  })
})
