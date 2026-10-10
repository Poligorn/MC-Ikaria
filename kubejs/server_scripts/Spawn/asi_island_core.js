// Общие функции острова. Грузится после asi_island_config.js (алфавит).
// NBT starter_island: size 20×13×35 от угла ASI_ORIGIN.

function asiFloor(n) {
  return Math.floor(n)
}

function asiIsSolidGround(level, x, y, z) {
  if (!level) return false
  let block
  try {
    block = level.getBlock(asiFloor(x), asiFloor(y) - 1, asiFloor(z))
  } catch (e) {
    return false
  }
  if (!block) return false
  let id = '' + block.id
  return id !== 'minecraft:air' && id !== 'minecraft:void_air' && id !== 'minecraft:cave_air' && id !== 'minecraft:empty'
}

function asiPlaceIsland(server) {
  let ox = ASI_ORIGIN[0]
  let oy = ASI_ORIGIN[1]
  let oz = ASI_ORIGIN[2]
  // Структура 20×35 по XZ — грузим соседние чанки до /place.
  server.runCommandSilent('forceload add -24 -24 24 40')
  server.runCommandSilent('place template ' + ASI_STRUCTURE + ' ' + ox + ' ' + oy + ' ' + oz)
  if (typeof ASI_STRUCTURE_BLOCK !== 'undefined' && ASI_STRUCTURE_BLOCK) {
    let b = ASI_STRUCTURE_BLOCK
    server.runCommandSilent('setblock ' + b[0] + ' ' + b[1] + ' ' + b[2] + ' minecraft:air')
  }
  server.runCommandSilent(
    'setworldspawn ' + asiFloor(ASI_SPAWN_X) + ' ' + asiFloor(ASI_SPAWN_Y) + ' ' + asiFloor(ASI_SPAWN_Z)
  )
  server.runCommandSilent('gamerule spawnRadius 0')

  let level = server.getLevel(ASI_DIM)
  if (level && asiIsSolidGround(level, ASI_SPAWN_X, ASI_SPAWN_Y, ASI_SPAWN_Z)) {
    server.persistentData.putBoolean('asi_island_placed', true)
    console.info('[ASI] Остров на месте, земля под спавном есть.')
    return true
  }
  console.warn('[ASI] /place выполнен, но под точкой спавна ещё воздух — повтор.')
  return false
}

function asiEnsureIsland(server) {
  let level = server.getLevel(ASI_DIM)
  if (server.persistentData.getBoolean('asi_island_placed')) {
    if (level && asiIsSolidGround(level, ASI_SPAWN_X, ASI_SPAWN_Y, ASI_SPAWN_Z)) {
      return true
    }
    console.warn('[ASI] Флаг стоял, земли нет — ставлю структуру снова.')
    server.persistentData.putBoolean('asi_island_placed', false)
  }
  return asiPlaceIsland(server)
}

function asiTeleportToIsland(player) {
  if (!player) return
  try {
    if (typeof player.teleportTo === 'function') {
      player.teleportTo(ASI_SPAWN_X, ASI_SPAWN_Y, ASI_SPAWN_Z)
    }
  } catch (e) {
    let name = player.username || (player.name && player.name.string) || ''
    if (name) {
      player.server.runCommandSilent(
        'execute in ' + ASI_DIM + ' run tp ' + name + ' ' + ASI_SPAWN_X + ' ' + ASI_SPAWN_Y + ' ' + ASI_SPAWN_Z
      )
    }
  }
  try {
    player.fallDistance = 0
  } catch (e2) {}
}

function asiGiveStarterItems(player) {
  let diary = function (id) {
    return Item.of('modopedia:book[modopedia:book="' + id + '"]')
  }
  player.give(Item.of('ftbquests:book'))
  player.give(diary('asi:mechanist_diary'))
  player.give(diary('asi:skyward_diary'))
  player.give(diary('asi:wildlander_diary'))
}
