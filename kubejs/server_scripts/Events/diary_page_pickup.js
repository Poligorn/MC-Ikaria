// Подсказка, какой лист только что открыл главу.
const DIARY_PAGE_HINT = {
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

PlayerEvents.inventoryChanged(event => {
  const id = String(event.item.id)
  const hint = DIARY_PAGE_HINT[id]
  if (!hint) return
  const key = 'asi_page_' + id.replace('kubejs:', '').replace(/[^a-z0-9_]/g, '_')
  if (event.player.persistentData.getBoolean(key)) return
  event.player.persistentData.putBoolean(key, true)
  event.player.tell(Text.gold('Лист лёг в дневник: ').append(Text.yellow(hint)))
})
