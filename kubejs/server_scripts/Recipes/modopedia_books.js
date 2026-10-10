// Дневники Трёх (Modopedia). Запасной крафт обложки, если потеряли том со спавна.
ServerEvents.recipes(event => {
  const book = id => Item.of(`modopedia:book[modopedia:book="${id}"]`)

  event.shapeless(book('asi:mechanist_diary'), ['minecraft:book', 'minecraft:compass'])
  event.shapeless(book('asi:skyward_diary'), ['minecraft:book', 'minecraft:map'])
  event.shapeless(book('asi:wildlander_diary'), ['minecraft:book', 'minecraft:bone'])
})
