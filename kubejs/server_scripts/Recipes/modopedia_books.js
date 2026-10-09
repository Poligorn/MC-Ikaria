// Тестовые книги Modopedia (kubejs/data+assets, namespace asi)
ServerEvents.recipes(event => {
  const book = id => Item.of(`modopedia:book[modopedia:book="${id}"]`)

  event.shapeless(book('asi:pilot_handbook'), ['minecraft:book', 'minecraft:map'])
  event.shapeless(book('asi:void_almanac'), ['minecraft:book', 'minecraft:ender_pearl'])
  event.shapeless(book('asi:mod_compendium'), ['minecraft:book', 'minecraft:compass'])
})
