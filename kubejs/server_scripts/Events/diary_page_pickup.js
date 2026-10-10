// Один том / один лист на игрока. Флаг в persistentData — на игрока, не на мир.
// Инвентарь: InventoryKJS.getSlots / getStackInSlot / setStackInSlot (KubeJS 2101.7).
const ASI_PAGE_HINT = {
  'kubejs:diary_page_mechanist_kinetics': 'Чертежи Механика: глава «Кинетика»',
  'kubejs:diary_page_mechanist_machines': 'Чертежи Механика: глава «Станки»',
  'kubejs:diary_page_mechanist_progress': 'Чертежи Механика: глава «Сплавы»',
  'kubejs:diary_page_skyward_glider': 'Журнал Небохода: глава «Личный полёт»',
  'kubejs:diary_page_skyward_airship': 'Журнал Небохода: глава «Корпус»',
  'kubejs:diary_page_skyward_sky': 'Журнал Небохода: глава «Небо»',
  'kubejs:diary_page_wildlander_beasts': 'Дневник Следопыта: глава «Звери»',
  'kubejs:diary_page_wildlander_portals': 'Дневник Следопыта: глава «Дыры»',
  'kubejs:diary_page_wildlander_ruins': 'Дневник Следопыта: глава «Руины»'
}

const ASI_PAGE_FLAG = {
  'kubejs:diary_page_mechanist_kinetics': 'asi_got_page_mechanist_kinetics',
  'kubejs:diary_page_mechanist_machines': 'asi_got_page_mechanist_machines',
  'kubejs:diary_page_mechanist_progress': 'asi_got_page_mechanist_progress',
  'kubejs:diary_page_skyward_glider': 'asi_got_page_skyward_glider',
  'kubejs:diary_page_skyward_airship': 'asi_got_page_skyward_airship',
  'kubejs:diary_page_skyward_sky': 'asi_got_page_skyward_sky',
  'kubejs:diary_page_wildlander_beasts': 'asi_got_page_wildlander_beasts',
  'kubejs:diary_page_wildlander_portals': 'asi_got_page_wildlander_portals',
  'kubejs:diary_page_wildlander_ruins': 'asi_got_page_wildlander_ruins'
}

function asiDiaryBookKey(item) {
  if (!item || item.empty || item.id !== 'modopedia:book') return ''
  let s = '' + item
  if (s.indexOf('mechanist_diary') >= 0) return 'mechanist'
  if (s.indexOf('skyward_diary') >= 0) return 'skyward'
  if (s.indexOf('wildlander_diary') >= 0) return 'wildlander'
  return ''
}

function asiKeepOneMatching(player, matchFn) {
  let inv = player.inventory
  let slots = inv.getSlots()
  let kept = false
  for (let i = 0; i < slots; i++) {
    let st = inv.getStackInSlot(i)
    if (!st || st.empty) continue
    if (!matchFn(st)) continue
    if (!kept) {
      kept = true
      if (st.count > 1) st.setCount(1)
    } else {
      inv.setStackInSlot(i, Item.of('minecraft:air'))
    }
  }
}

const ASI_BOOK_STAGE = {
  mechanist: 'asi_book_mechanist',
  skyward: 'asi_book_skyward',
  wildlander: 'asi_book_wildlander'
}

function asiGrantBookStage(player, book) {
  if (!book || !ASI_BOOK_STAGE[book]) return
  player.persistentData.putBoolean('asi_got_book_' + book, true)
  // FTB 2101 StageTask читает entity tags (EntityTagStageProvider), не KubeJS stages.
  player.addTag(ASI_BOOK_STAGE[book])
}

function asiEnsureDiaryBookStages(player) {
  if (!player || player.level.isClientSide()) return
  let held = {
    mechanist: false,
    skyward: false,
    wildlander: false
  }
  let inv = player.inventory
  let slots = inv.getSlots()
  for (let i = 0; i < slots; i++) {
    let key = asiDiaryBookKey(inv.getStackInSlot(i))
    if (key) held[key] = true
  }
  let books = ['mechanist', 'skyward', 'wildlander']
  for (let b = 0; b < books.length; b++) {
    let book = books[b]
    if (held[book] || player.persistentData.getBoolean('asi_got_book_' + book)) {
      asiGrantBookStage(player, book)
    }
  }
}

function asiMarkDiaryObtain(player, item) {
  let id = String(item.id)
  let pageFlag = ASI_PAGE_FLAG[id]
  if (pageFlag) {
    let first = !player.persistentData.getBoolean(pageFlag)
    player.persistentData.putBoolean(pageFlag, true)
    asiKeepOneMatching(player, function (st) { return String(st.id) === id })
    if (first && ASI_PAGE_HINT[id]) {
      player.tell(Text.gold('Лист лёг в дневник: ').append(Text.yellow(ASI_PAGE_HINT[id])))
    }
    return
  }
  let book = asiDiaryBookKey(item)
  if (!book) return
  asiGrantBookStage(player, book)
  asiKeepOneMatching(player, function (st) { return asiDiaryBookKey(st) === book })
}

PlayerEvents.inventoryChanged(event => {
  asiMarkDiaryObtain(event.player, event.item)
})

PlayerEvents.loggedIn(event => {
  asiEnsureDiaryBookStages(event.player)
})

PlayerEvents.tick(event => {
  if (event.player.tickCount % 40 !== 0) return
  asiEnsureDiaryBookStages(event.player)
})
