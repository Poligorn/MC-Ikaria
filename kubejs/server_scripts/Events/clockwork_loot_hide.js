// В jar Clockwork нет своих loot table, но прячем предметы на случай чужих таблиц.
const CLOCKWORK_LOOT_HIDE = [
  'clockwork:clockwork_gear',
  'clockwork:crossbow_barrel',
  'clockwork:clockwork_arrow',
  'clockwork:barrel_crossbow',
  'clockwork:scope_crossbow',
  'clockwork:clockwork_potion_sprayer',
  'clockwork:clockwork_flamethrower',
  'clockwork:clockwork_drill'
]

LootJS.modifiers(event => {
  let modifier = event.addTableModifier(/.*chests.*/)
  for (let i = 0; i < CLOCKWORK_LOOT_HIDE.length; i++) {
    modifier.removeLoot(CLOCKWORK_LOOT_HIDE[i])
  }
})
