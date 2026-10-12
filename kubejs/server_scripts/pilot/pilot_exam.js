// Экзамен пилота. var, не const: общая область server_scripts + /reload.
var EXAM = {
  trigger: { x: 100, y: 65, z: -200, dim: 'minecraft:overworld' },
  cooldownMin: 10
}

var exam = global.exam || { active: false, player: null, startedAt: 0 }
global.exam = exam

BlockEvents.rightClicked(event => {
  var player = event.player
  var block = event.block
  var level = event.level
  if (level.dimension.toString() !== EXAM.trigger.dim) return
  if (block.x !== EXAM.trigger.x || block.y !== EXAM.trigger.y || block.z !== EXAM.trigger.z) return

  event.cancel()

  if (exam.active) {
    if (exam.player === player.username) return
    player.tell(Text.red('Экзамен уже проводится (сдаёт ' + exam.player + '). Подождите.'))
    return
  }

  var cds = event.server.persistentData.pilotExamCooldowns
  var uuid = player.uuid.toString()
  if (cds && cds.contains(uuid)) {
    var leftMs = cds.getLong(uuid) + EXAM.cooldownMin * 60000 - Date.now()
    if (leftMs > 0) {
      player.tell(Text.red('Пересдача через ' + Math.ceil(leftMs / 60000) + ' мин.'))
      return
    }
  }

  exam.active = true
  exam.player = player.username
  exam.startedAt = Date.now()
  player.tell(Text.green('Экзамен начат! Займите место в самолёте.'))
})

PlayerEvents.loggedOut(event => {
  if (exam.active && exam.player === event.player.username) {
    exam.active = false
    exam.player = null
  }
})

ServerEvents.commandRegistry(event => {
  var Commands = event.commands
  event.register(Commands.literal('examreset')
    .requires(function (s) { return s.hasPermission(2) })
    .executes(function (ctx) {
      exam.active = false
      exam.player = null
      ctx.source.sendSystemMessage(Text.green('Состояние экзамена сброшено'))
      return 1
    }))
})
