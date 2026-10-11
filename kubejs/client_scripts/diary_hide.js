// EMI: обычный hide (removeEntries), не removeEntriesCompletely.
// Completely в KubeJS 2101.7 убирает катализатор рецептов; сам по себе
// креатив не чистит, но вместе с modifyCreativeTab.remove — да
// (https://github.com/KubeJS-Mods/KubeJS/issues/1096). Вкладка
// kubejs:asi_diaries от removeEntries не зависит.
RecipeViewerEvents.removeEntries('item', event => {
  if (global.ASI_DIARIES_ENABLED) return
  event.remove('modopedia:book[modopedia:book="asi:mechanist_diary"]')
  event.remove('modopedia:book[modopedia:book="asi:skyward_diary"]')
  event.remove('modopedia:book[modopedia:book="asi:wildlander_diary"]')
})
