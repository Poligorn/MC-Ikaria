var NITER = 'cgs:niter'

// LootJS 3.7: LootJS.modifiers + addEntityModifier / addTableModifier.
// Старый lootTables().removeItem / pool.addEntry на 3.7 нет.
LootJS.modifiers(event => {
  event.addEntityModifier('minecraft:creeper')
    .removeLoot('minecraft:gunpowder')
    .addLoot(NITER)
  event.addTableModifier(/minecraft:chests\/.*/)
    .removeLoot('minecraft:gunpowder')
    .addLoot(NITER)
})
