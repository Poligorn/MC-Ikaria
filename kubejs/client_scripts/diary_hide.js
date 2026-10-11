// Пока дневники не в релизе — не показывать тома Modopedia в EMI.
RecipeViewerEvents.removeEntriesCompletely('item', event => {
  if (global.ASI_DIARIES_ENABLED) return
  event.remove('modopedia:book')
})
