// Ставим остров сразу при загрузке сервера/оверворлда.
// Старая задержка 100 тиков давала игроку заспавниться в пустоте раньше структуры.

function asiRetryPlace(server, attempt) {
  if (attempt > 8) {
    console.error('[ASI] Остров не встал за 8 попыток. Смотри логи /place template.')
    return
  }
  if (asiEnsureIsland(server)) return
  server.scheduleInTicks(20, function () {
    asiRetryPlace(server, attempt + 1)
  })
}

ServerEvents.loaded(event => {
  console.info('[ASI] Сервер загружен — ставлю стартовый остров без паузы.')
  asiRetryPlace(event.server, 1)
})
