// Totem Factory 1.1.2 шлёт create:filling с type:fluid_stack — Create 6.0.10
// (пак) принимает NeoForge SizedFluidIngredient: neoforge:components / neoforge:single.
// Голова: override kubejs/data/totemfactory/recipe/totem/totem_head.json.
// totem_of_undying требует create_enchantment_industry:experience — мода в паке нет;
// остаётся sequenced deploy на create:experience_block.
ServerEvents.recipes(event => {
  event.remove({ id: 'totemfactory:totem/totem_of_undying' })
})
