// Доступ оператора / креатива к томам, пока лут и квесты выключены.
// Главы Modopedia завязаны на asi:diary/* — выдаём их вместе с книгой.
// Критерии живых advancement’ов: minecraft:impossible (листы не
// зарегистрированы при флаге false). Оригиналы inventory_changed
// лежат в kubejs/disabled_future/diaries/advancement/.
const ASI_DIARY_ADVANCEMENTS = [
  'asi:diary/root',
  'asi:diary/mechanist_kinetics',
  'asi:diary/mechanist_machines',
  'asi:diary/mechanist_progress',
  'asi:diary/skyward_glider',
  'asi:diary/skyward_airship',
  'asi:diary/skyward_sky',
  'asi:diary/wildlander_beasts',
  'asi:diary/wildlander_portals',
  'asi:diary/wildlander_ruins'
]

const ASI_DIARY_BOOKS = [
  'asi:mechanist_diary',
  'asi:skyward_diary',
  'asi:wildlander_diary'
]

function asiDiaryBookItem(id) {
  return Item.of('modopedia:book[modopedia:book="' + id + '"]')
}

function asiGrantDiaryAdvancements(player) {
  if (!player) return
  let name = player.username || (player.name && player.name.string) || ''
  if (!name) return
  for (let i = 0; i < ASI_DIARY_ADVANCEMENTS.length; i++) {
    player.server.runCommandSilent('advancement grant ' + name + ' only ' + ASI_DIARY_ADVANCEMENTS[i])
  }
  player.persistentData.putBoolean('asi_diary_chapters_unlocked', true)
}

function asiGiveFounderDiaries(player) {
  if (!player) return
  for (let i = 0; i < ASI_DIARY_BOOKS.length; i++) {
    player.give(asiDiaryBookItem(ASI_DIARY_BOOKS[i]))
  }
  player.persistentData.putBoolean('asi_got_book_mechanist', true)
  player.persistentData.putBoolean('asi_got_book_skyward', true)
  player.persistentData.putBoolean('asi_got_book_wildlander', true)
  asiGrantDiaryAdvancements(player)
}

function asiDiaryBookKey(item) {
  if (!item || item.empty || item.id !== 'modopedia:book') return ''
  let s = '' + item
  if (s.indexOf('mechanist_diary') >= 0) return 'mechanist'
  if (s.indexOf('skyward_diary') >= 0) return 'skyward'
  if (s.indexOf('wildlander_diary') >= 0) return 'wildlander'
  return ''
}

// Креатив / /give: книга в инвентаре → все главы читаемы.
// При включённом флаге главы открывают листы (diary_page_pickup.js).
PlayerEvents.inventoryChanged(event => {
  if (global.ASI_DIARIES_ENABLED) return
  if (event.player.persistentData.getBoolean('asi_diary_chapters_unlocked')) return
  if (!asiDiaryBookKey(event.item)) return
  asiGrantDiaryAdvancements(event.player)
})
