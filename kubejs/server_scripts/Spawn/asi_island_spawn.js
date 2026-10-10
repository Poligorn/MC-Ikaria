// Первый вход: не ставим asi_started, пока под ногами нет блока острова.
// Телепорт повторяется, пока /place не даст землю (SP часто логинится раньше loaded).

function asiFinishFirstSpawn(server, uuid, attempt) {
  let p = server.getPlayer(uuid)
  if (!p) return
  if (p.persistentData.getBoolean('asi_started')) return

  let ready = asiEnsureIsland(server)
  let level = server.getLevel(ASI_DIM)
  let grounded = ready && asiIsSolidGround(level, ASI_SPAWN_X, ASI_SPAWN_Y, ASI_SPAWN_Z)

  if (grounded) {
    asiTeleportToIsland(p)
    asiGiveStarterItems(p)
    p.persistentData.putBoolean('asi_started', true)
    p.tell(Text.gold('Добро пожаловать на Небесный Остров. Ваше приключение начинается здесь...'))
    p.tell(Text.aqua('Книга квестов в инвентаре. Дневники основателей — в сундуках по миру.'))
    console.info('[ASI] Игрок ' + p.name.string + ' на острове (попытка ' + attempt + ').')
    return
  }

  asiTeleportToIsland(p)
  if (attempt === 1) {
    p.tell(Text.yellow('Остров ещё собирается. Держитесь — телепорт повторится.'))
  }
  if (attempt >= 40) {
    p.persistentData.putBoolean('asi_started', true)
    asiGiveStarterItems(p)
    p.tell(Text.red('Остров не подтвердился за 20 с. /asi placenow и перезайдите, либо проверьте логи.'))
    console.error('[ASI] Таймаут спавна для ' + p.name.string)
    return
  }
  server.scheduleInTicks(10, function () {
    asiFinishFirstSpawn(server, uuid, attempt + 1)
  })
}

PlayerEvents.loggedIn(event => {
  let player = event.player
  if (player.level.isClientSide()) return

  let pdata = player.persistentData
  if (pdata.getBoolean('asi_started')) return

  console.info('[ASI] Новый игрок: ' + player.name.string + '. Жду твёрдый блок на острове.')
  asiEnsureIsland(event.server)
  asiTeleportToIsland(player)
  asiFinishFirstSpawn(event.server, player.uuid, 1)
})
