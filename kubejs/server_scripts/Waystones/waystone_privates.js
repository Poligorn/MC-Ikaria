// ============================================================
// Приваты Waystone (дикие земли). Waystones 21.1.46 + Balm 21.0.63
// Заменяет kubejs/server_scripts/Waystones/waystone_privates.js
// var, без spread, без top-level const (Rhino /reload).
// ============================================================

var WS_PD_KEY = 'asiWaystoneClaimsJson'
var WS_OLD_FILE = 'kubejs/data/waystone_claims.json'
var WILD_RADIUS = 1500
var WS_SERVER_UID_STR = '00000000-0000-0000-0000-000000000001'
var WS_NEAR = 3

var UUIDCls = Java.loadClass('java.util.UUID')
var PlayerCls = Java.loadClass('net.minecraft.world.entity.player.Player')
var BalmCls = Java.loadClass('net.blay09.mods.balm.api.Balm')
var TpPreCls = Java.loadClass('net.blay09.mods.waystones.api.event.WaystoneTeleportEvent$Pre')
var MenuCls = Java.loadClass('net.blay09.mods.waystones.api.event.BuildWaystoneSelectionMenuEvent')
var VisCls = Java.loadClass('net.blay09.mods.waystones.api.WaystoneVisibility')
var MutableWsCls = Java.loadClass('net.blay09.mods.waystones.api.MutableWaystone')
var WsMgrCls = Java.loadClass('net.blay09.mods.waystones.core.WaystoneManagerImpl')
var WsSyncCls = Java.loadClass('net.blay09.mods.waystones.core.WaystoneSyncManager')
var PwMgrCls = Java.loadClass('net.blay09.mods.waystones.core.PlayerWaystoneManager')
var IdxCls = Java.loadClass('net.blay09.mods.waystones.core.WaystoneIndexManager')
var WS_SERVER_UID = UUIDCls.fromString(WS_SERVER_UID_STR)

function wsMcPlayer(player) {
  if (!player) return null
  if (player.minecraftPlayer) return player.minecraftPlayer
  return player
}

function wsMcServer(server) {
  if (!server) return null
  if (server.minecraftServer) return server.minecraftServer
  return server
}

function wsUidOf(ws) {
  if (!ws || !ws.getWaystoneUid) return ''
  var u = ws.getWaystoneUid()
  return u == null ? '' : String(u)
}

function wsIsServer(entry) {
  return !!(entry && entry.type === 'server')
}

function wsTypeOf(entry) {
  if (!entry) return 'unclaimed'
  if (wsIsServer(entry)) return 'server'
  if (entry['public']) return 'public'
  return 'private'
}

function wsTypeLabel(entry) {
  var t = wsTypeOf(entry)
  if (t === 'unclaimed') return '§aничейный'
  if (t === 'server') return '§bсерверный'
  if (t === 'public') return '§aпубличный'
  return '§cприватный'
}

function wsFriendsOf(entry) {
  var out = []
  if (!entry || entry.friends == null) return out
  var f = entry.friends
  var n = 0
  var i
  var item
  if (typeof f.size === 'function') n = f.size()
  else if (f.length != null) n = f.length
  for (i = 0; i < n; i++) {
    item = typeof f.get === 'function' ? f.get(i) : f[i]
    if (item != null) out.push(String(item))
  }
  return out
}

function wsFriendIndex(entry, uuid) {
  var f = wsFriendsOf(entry)
  var i
  for (i = 0; i < f.length; i++) {
    if (f[i] === uuid) return i
  }
  return -1
}

function wsCanUse(entry, uuid) {
  if (!entry) return true
  if (wsIsServer(entry)) return true
  if (entry['public']) return true
  if (entry.owner === uuid) return true
  return wsFriendIndex(entry, uuid) !== -1
}

function wsLoad(server) {
  if (!server) return {}
  try {
    var raw = server.persistentData.getString(WS_PD_KEY)
    if (raw && String(raw).length > 2) return JSON.parse(String(raw))
  } catch (e) {
    console.error('[WS] load persistentData: ' + e)
  }
  return {}
}

function wsSave(server, data) {
  if (!server) return
  try {
    server.persistentData.putString(WS_PD_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('[WS] save persistentData: ' + e)
  }
}

function wsFromBlock(block) {
  if (!block) return null
  var id = String(block.id)
  if (id.indexOf('waystones:') !== 0) return null
  if (id.indexOf('sharestone') !== -1) return null
  if (id.indexOf('warp_plate') !== -1) return null
  if (id.indexOf('portstone') !== -1) return null
  var be = block.entity
  if (!be) return null
  try {
    var ws = be.getWaystone()
    if (ws && ws.getWaystoneUid) return ws
  } catch (e) {}
  return null
}

function wsLooked(player) {
  try {
    var ray = player.rayTrace(6)
    if (ray && ray.block) {
      var ws = wsFromBlock(ray.block)
      if (ws) return ws
    }
  } catch (e) {}
  return null
}

function wsNearPlayer(player) {
  var hit = wsLooked(player)
  if (hit) return hit
  var px = Math.floor(player.x)
  var py = Math.floor(player.y)
  var pz = Math.floor(player.z)
  var best = null
  var bestD = 9999
  var dx
  var dy
  var dz
  for (dx = -WS_NEAR; dx <= WS_NEAR; dx++) {
    for (dy = -2; dy <= 3; dy++) {
      for (dz = -WS_NEAR; dz <= WS_NEAR; dz++) {
        var block
        try {
          block = player.level.getBlock(px + dx, py + dy, pz + dz)
        } catch (eBlk) {
          continue
        }
        var cand = wsFromBlock(block)
        if (!cand) continue
        var d = dx * dx + dy * dy + dz * dz
        if (d < bestD) {
          bestD = d
          best = cand
        }
      }
    }
  }
  return best
}

function wsGetByKey(server, key) {
  if (!server || !key) return null
  try {
    var opt = WsMgrCls.get(wsMcServer(server)).getWaystoneById(UUIDCls.fromString(key))
    if (opt && opt.isPresent()) return opt.get()
  } catch (e) {}
  return null
}

function wsEachPlayer(server, fn) {
  if (!server) return
  var players = server.players
  var i
  var n = players.length != null ? players.length : players.size()
  for (i = 0; i < n; i++) {
    var p = players[i] != null ? players[i] : players.get(i)
    if (p) fn(p)
  }
}

function wsDistFromSpawn(player) {
  var spawn
  try {
    spawn = player.server.overworld().getSharedSpawnPos()
  } catch (e) {
    spawn = { x: 0, z: 0 }
  }
  var dx = player.x - spawn.x
  var dz = player.z - spawn.z
  return Math.sqrt(dx * dx + dz * dz)
}

function wsInWild(player) {
  var dim = String(player.level.dimension)
  if (dim.indexOf('the_nether') !== -1) return true
  if (dim.indexOf('the_end') !== -1) return true
  return wsDistFromSpawn(player) >= WILD_RADIUS
}

function wsPrivateMessage(entry) {
  var name = entry && entry.ownerName ? entry.ownerName : '?'
  return '§cWaystone приватный. §7Владелец: §e' + name
}

function wsTell(player, msg) {
  try {
    player.tell(msg)
  } catch (e) {
    try {
      var mc = wsMcPlayer(player)
      if (mc && mc.sendSystemMessage) {
        mc.sendSystemMessage(Text.of(msg))
      }
    } catch (e2) {}
  }
}

function wsRefreshIndex(server, ws) {
  try {
    IdxCls.visibilityChanged(wsMcServer(server), ws, VisCls.GLOBAL)
  } catch (e) {
    console.error('[WS] visibilityChanged: ' + e)
  }
}

function wsApplyModAccess(server, ws, entry) {
  if (!ws || !MutableWsCls.isInstance(ws)) return
  try {
    if (wsIsServer(entry)) {
      ws.setOwnerUid(WS_SERVER_UID)
      ws.setOwnerUsername('Сервер')
      ws.setVisibility(VisCls.GLOBAL)
    } else if (entry && entry.owner) {
      ws.setOwnerUid(UUIDCls.fromString(entry.owner))
      if (entry.ownerName) ws.setOwnerUsername(entry.ownerName)
      if (entry['public']) ws.setVisibility(VisCls.GLOBAL)
      else ws.setVisibility(VisCls.ACTIVATION)
    } else {
      ws.setOwnerUid(null)
      ws.setOwnerUsername('')
      ws.setVisibility(VisCls.ACTIVATION)
    }
    WsMgrCls.get(wsMcServer(server)).updateWaystone(ws)
    wsRefreshIndex(server, ws)
    WsSyncCls.sendWaystoneUpdateToAll(wsMcServer(server), ws)
  } catch (e) {
    console.error('[WS] applyModAccess: ' + e)
  }
}

function wsMakeKnown(server, ws, key) {
  if (!server || !ws || !key) return
  var uid
  try {
    uid = UUIDCls.fromString(key)
  } catch (e) {
    return
  }
  wsEachPlayer(server, function (p) {
    var mc = wsMcPlayer(p)
    if (!mc) return
    try {
      PwMgrCls.setWaystoneHidden(mc, uid, false)
    } catch (eHid) {}
    try {
      PwMgrCls.activateWaystone(mc, ws)
    } catch (eAct) {}
    try {
      WsSyncCls.sendActivatedWaystones(mc)
    } catch (eSync) {}
  })
}

function wsRefreshHidden(server, key, entry) {
  if (!server || !key) return
  var uid
  try {
    uid = UUIDCls.fromString(key)
  } catch (e) {
    return
  }
  if (wsIsServer(entry)) {
    var ws = wsGetByKey(server, key)
    if (ws) wsMakeKnown(server, ws, key)
    return
  }
  wsEachPlayer(server, function (p) {
    var mc = wsMcPlayer(p)
    if (!mc) return
    var hide = !wsCanUse(entry, String(p.uuid))
    try {
      PwMgrCls.setWaystoneHidden(mc, uid, hide)
      WsSyncCls.sendActivatedWaystones(mc)
    } catch (e2) {
      console.error('[WS] setWaystoneHidden: ' + e2)
    }
  })
}

function wsCancelNative(event) {
  try {
    event.setCanceled(true)
  } catch (e) {
    console.error('[WS] setCanceled: ' + e)
  }
}

function wsOnTeleportPre(event) {
  try {
    var ctx = event.getContext()
    var entity = ctx.getEntity()
    if (!PlayerCls.isInstance(entity)) return
    var ws = ctx.getTargetWaystone()
    if (!ws) return
    var key = wsUidOf(ws)
    if (!key) return
    var server = entity.getServer ? entity.getServer() : null
    if (!server && entity.level && entity.level.server) server = entity.level.server
    var entry = wsLoad(server)[key]
    var uuid = String(entity.getUUID())
    if (!wsCanUse(entry, uuid)) {
      wsCancelNative(event)
      try {
        entity.sendSystemMessage(Text.of(wsPrivateMessage(entry)))
      } catch (eMsg) {}
    }
  } catch (e) {
    console.error('[WS-TP] ' + e)
  }
}

function wsOnBuildMenu(event) {
  try {
    var player = event.getPlayer()
    if (!player) return
    var uuid = String(player.getUUID())
    var server = player.getServer ? player.getServer() : null
    if (!server && player.level && player.level.server) server = player.level.server
    var data = wsLoad(server)
    var list = event.getWaystones()
    if (!list) return
    var n = typeof list.size === 'function' ? list.size() : list.length
    var doomed = []
    var present = {}
    var i
    for (i = 0; i < n; i++) {
      var pws = typeof list.get === 'function' ? list.get(i) : list[i]
      if (!pws) continue
      var key = wsUidOf(pws)
      if (!key) continue
      present[key] = true
      if (!wsCanUse(data[key], uuid)) doomed.push(pws)
    }
    for (i = 0; i < doomed.length; i++) {
      try {
        list.remove(doomed[i])
      } catch (eRem) {
        try {
          if (doomed[i].setHidden) doomed[i].setHidden(true)
        } catch (eHid) {}
      }
    }
    var k
    for (k in data) {
      if (!Object.prototype.hasOwnProperty.call(data, k)) continue
      if (!wsIsServer(data[k])) continue
      if (present[k]) continue
      var missing = wsGetByKey(server, k)
      if (!missing) continue
      try {
        event.addWaystone(PwMgrCls.getPlayerDecoratedWaystone(player, missing))
      } catch (eAdd) {
        console.error('[WS] addWaystone server: ' + eAdd)
      }
    }
  } catch (e) {
    console.error('[WS-MENU] ' + e)
  }
}

function wsListen(cls, handler, label) {
  try {
    if (typeof NativeEvents !== 'undefined' && NativeEvents.onEvent) {
      NativeEvents.onEvent(cls, handler)
      console.info('[WS] NativeEvents: ' + label)
      return true
    }
  } catch (e) {
    console.error('[WS] NativeEvents ' + label + ': ' + e)
  }
  try {
    BalmCls.getEvents().onEvent(cls, handler)
    console.info('[WS] Balm.onEvent: ' + label)
    return true
  } catch (e2) {
    console.error('[WS] Balm ' + label + ': ' + e2)
  }
  return false
}

wsListen(TpPreCls, wsOnTeleportPre, 'WaystoneTeleportEvent$Pre')
wsListen(MenuCls, wsOnBuildMenu, 'BuildWaystoneSelectionMenuEvent')

ServerEvents.loaded(function (event) {
  var server = event.server
  var cur = ''
  try {
    cur = String(server.persistentData.getString(WS_PD_KEY) || '')
  } catch (e) {}
  if (cur.length > 2) return
  try {
    var old = JsonIO.read(WS_OLD_FILE)
    if (old) {
      wsSave(server, old)
      console.info('[WS] Перенесены клеймы из ' + WS_OLD_FILE)
    }
  } catch (e2) {}
})

PlayerEvents.loggedIn(function (event) {
  var player = event.player
  var server = player.server
  var data = wsLoad(server)
  var mc = wsMcPlayer(player)
  var key
  for (key in data) {
    if (!Object.prototype.hasOwnProperty.call(data, key)) continue
    var uid
    try {
      uid = UUIDCls.fromString(key)
    } catch (e) {
      continue
    }
    if (wsIsServer(data[key])) {
      try {
        PwMgrCls.setWaystoneHidden(mc, uid, false)
      } catch (eHid) {}
      var ws = wsGetByKey(server, key)
      if (ws) {
        try {
          PwMgrCls.activateWaystone(mc, ws)
        } catch (eAct) {}
      }
      continue
    }
    var hide = !wsCanUse(data[key], String(player.uuid))
    try {
      PwMgrCls.setWaystoneHidden(mc, uid, hide)
    } catch (e2) {}
  }
  try {
    WsSyncCls.sendActivatedWaystones(mc)
  } catch (e3) {}
})

BlockEvents.rightClicked(function (event) {
  var ws = wsFromBlock(event.block)
  if (!ws) return
  var player = event.player
  if (player.fake) return
  var key = wsUidOf(ws)
  if (!key) return
  var server = event.server
  var data = wsLoad(server)
  var uuid = String(player.uuid)
  var entry = data[key]

  if (wsIsServer(entry)) return

  if (!entry) {
    if (!wsInWild(player)) return
    data[key] = {
      type: 'private',
      owner: uuid,
      ownerName: String(player.username),
      friends: [],
      'public': false,
      name: '',
      pos: event.block.pos.x + ',' + event.block.pos.y + ',' + event.block.pos.z,
      dim: String(event.level.dimension)
    }
    try {
      if (ws.getName) data[key].name = String(ws.getName().getString())
    } catch (eName) {}
    wsSave(server, data)
    wsApplyModAccess(server, ws, data[key])
    try {
      PwMgrCls.activateWaystone(wsMcPlayer(player), ws)
    } catch (eAct) {}
    wsRefreshHidden(server, key, data[key])
    wsTell(player, '§6⚑ Вы захватили этот Waystone! §7Управление: /ws')
    server.tell('§e' + player.username + ' §7захватил Waystone §e' + data[key].pos)
    return
  }

  if (!wsCanUse(entry, uuid)) {
    event.cancel()
    wsTell(player, wsPrivateMessage(entry))
  }
})

ServerEvents.commandRegistry(function (event) {
  var Commands = event.commands
  var Arguments = event.arguments

  function requireLooked(ctx) {
    var player = ctx.source.player
    if (!player) {
      return null
    }
    var ws = wsNearPlayer(player)
    if (!ws) {
      wsTell(player, '§cПосмотрите на Waystone или встаньте рядом (до ' + WS_NEAR + ' блоков)')
      return null
    }
    return { player: player, key: wsUidOf(ws), ws: ws, data: wsLoad(player.server) }
  }

  function requireOwned(ctx) {
    var r = requireLooked(ctx)
    if (!r) return null
    if (!r.data[r.key]) {
      wsTell(r.player, '§cЭтот Waystone никем не захвачен')
      return null
    }
    if (wsIsServer(r.data[r.key])) {
      wsTell(r.player, '§cЭто серверный Waystone. Доступ менять нельзя. §7OP: /ws release')
      return null
    }
    if (r.data[r.key].owner !== String(r.player.uuid)) {
      wsTell(r.player, '§cВы не владелец')
      return null
    }
    return r
  }

  function doSetServer(ctx) {
    var r = requireLooked(ctx)
    if (!r) return 0
    var name = ''
    try {
      if (r.ws.getName) name = String(r.ws.getName().getString())
    } catch (eN) {}
    var pos = '?'
    try {
      var p = r.ws.getPos()
      pos = p.getX() + ',' + p.getY() + ',' + p.getZ()
    } catch (eP) {}
    var dim = String(r.player.level.dimension)
    r.data[r.key] = {
      type: 'server',
      owner: 'server',
      ownerName: 'Сервер',
      friends: [],
      'public': true,
      name: name,
      pos: pos,
      dim: dim
    }
    wsSave(r.player.server, r.data)
    wsApplyModAccess(r.player.server, r.ws, r.data[r.key])
    wsMakeKnown(r.player.server, r.ws, r.key)
    wsTell(r.player, '§bWaystone теперь серверный§7: виден всем сразу, захват запрещён')
    r.player.server.tell('§7OP §e' + r.player.username + ' §7назначил серверный Waystone §e' + pos)
    return 1
  }

  function doReleaseServer(ctx) {
    var r = requireLooked(ctx)
    if (!r) return 0
    if (!r.data[r.key] || !wsIsServer(r.data[r.key])) {
      wsTell(r.player, '§cЭтот Waystone не серверный')
      return 0
    }
    var pos = r.data[r.key].pos
    delete r.data[r.key]
    wsSave(r.player.server, r.data)
    wsApplyModAccess(r.player.server, r.ws, null)
    wsRefreshHidden(r.player.server, r.key, null)
    wsTell(r.player, '§6Серверный статус снят. §7Камень снова ничейный')
    r.player.server.tell('§7OP §e' + r.player.username + ' §7снял серверный статус с Waystone §e' + pos)
    return 1
  }

  event.register(
    Commands.literal('ws')
      .executes(function (ctx) {
        wsTell(ctx.source.player, '§6/ws info§7 | §6/ws private§7 | §6/ws public§7 | §6/ws friend add|remove <игрок>§7 | §6/ws transfer <игрок>§7 | §6/ws list')
        wsTell(ctx.source.player, '§7OP: §6/ws server§7 | §6/ws unserver§7 (§6/ws release§7)')
        return 1
      })
      .then(Commands.literal('private').executes(function (ctx) {
        var r = requireOwned(ctx)
        if (!r) return 0
        r.data[r.key]['public'] = false
        r.data[r.key].type = 'private'
        wsSave(r.player.server, r.data)
        if (r.ws) wsApplyModAccess(r.player.server, r.ws, r.data[r.key])
        wsRefreshHidden(r.player.server, r.key, r.data[r.key])
        wsTell(r.player, '§6Waystone теперь §cприватный')
        return 1
      }))
      .then(Commands.literal('public').executes(function (ctx) {
        var r = requireOwned(ctx)
        if (!r) return 0
        r.data[r.key]['public'] = true
        r.data[r.key].type = 'public'
        wsSave(r.player.server, r.data)
        if (r.ws) wsApplyModAccess(r.player.server, r.ws, r.data[r.key])
        wsRefreshHidden(r.player.server, r.key, r.data[r.key])
        wsTell(r.player, '§6Waystone теперь §aпубличный')
        return 1
      }))
      .then(Commands.literal('friend')
        .then(Commands.literal('add').then(Commands.argument('player', Arguments.PLAYER.create(event)).executes(function (ctx) {
          var r = requireOwned(ctx)
          if (!r) return 0
          var friend = Arguments.PLAYER.getResult(ctx, 'player')
          var fu = String(friend.uuid)
          var friends = wsFriendsOf(r.data[r.key])
          if (wsFriendIndex(r.data[r.key], fu) === -1) friends.push(fu)
          r.data[r.key].friends = friends
          wsSave(r.player.server, r.data)
          wsRefreshHidden(r.player.server, r.key, r.data[r.key])
          wsTell(r.player, '§a' + friend.username + ' §6получил доступ')
          wsTell(friend, '§6' + r.player.username + ' дал вам доступ к своему Waystone')
          return 1
        })))
        .then(Commands.literal('remove').then(Commands.argument('player', Arguments.PLAYER.create(event)).executes(function (ctx) {
          var r = requireOwned(ctx)
          if (!r) return 0
          var friend = Arguments.PLAYER.getResult(ctx, 'player')
          var fu = String(friend.uuid)
          var friends = wsFriendsOf(r.data[r.key])
          var next = []
          var i
          for (i = 0; i < friends.length; i++) {
            if (friends[i] !== fu) next.push(friends[i])
          }
          r.data[r.key].friends = next
          wsSave(r.player.server, r.data)
          wsRefreshHidden(r.player.server, r.key, r.data[r.key])
          wsTell(r.player, '§c' + friend.username + ' §6лишён доступа')
          return 1
        })))
      )
      .then(Commands.literal('transfer').then(Commands.argument('player', Arguments.PLAYER.create(event)).executes(function (ctx) {
        var r = requireOwned(ctx)
        if (!r) return 0
        var target = Arguments.PLAYER.getResult(ctx, 'player')
        r.data[r.key].owner = String(target.uuid)
        r.data[r.key].ownerName = String(target.username)
        r.data[r.key].friends = []
        wsSave(r.player.server, r.data)
        if (r.ws) wsApplyModAccess(r.player.server, r.ws, r.data[r.key])
        wsRefreshHidden(r.player.server, r.key, r.data[r.key])
        wsTell(r.player, '§6Владение передано §a' + target.username)
        wsTell(target, '§6' + r.player.username + ' передал вам Waystone!')
        return 1
      })))
      .then(Commands.literal('info').executes(function (ctx) {
        var r = requireLooked(ctx)
        if (!r) return 0
        var e = r.data[r.key]
        if (!e) {
          wsTell(r.player, '§6Тип: ' + wsTypeLabel(null) + '§7 — ПКМ в диких землях (>' + WILD_RADIUS + ' от спавна), чтобы захватить')
          return 1
        }
        if (wsIsServer(e)) {
          wsTell(r.player, '§6Тип: ' + wsTypeLabel(e) + ' §7| владелец: §bсервер §7| доступен всем сразу, захват и смена доступа запрещены')
          return 1
        }
        wsTell(r.player, '§6Тип: ' + wsTypeLabel(e) + ' §7| владелец: §e' + e.ownerName + ' §7| друзей: ' + wsFriendsOf(e).length)
        return 1
      }))
      .then(Commands.literal('list').executes(function (ctx) {
        var player = ctx.source.player
        var data = wsLoad(player.server)
        var uuid = String(player.uuid)
        var n = 0
        var key
        for (key in data) {
          if (!Object.prototype.hasOwnProperty.call(data, key)) continue
          if (wsIsServer(data[key])) continue
          if (data[key].owner !== uuid) continue
          n++
          wsTell(player, '§7- §e' + (data[key].name || key) + ' §7@ ' + data[key].pos + ' §7| тип: ' + wsTypeLabel(data[key]))
        }
        if (n === 0) wsTell(player, '§7У вас нет захваченных Waystone')
        var showServer = false
        try {
          showServer = !!player.hasPermissions(2)
        } catch (ePerm) {
          try {
            showServer = !!ctx.source.hasPermission(2)
          } catch (ePerm2) {}
        }
        if (showServer) {
          var sn = 0
          for (key in data) {
            if (!Object.prototype.hasOwnProperty.call(data, key)) continue
            if (!wsIsServer(data[key])) continue
            sn++
            wsTell(player, '§7- §bсервер §e' + (data[key].name || key) + ' §7@ ' + data[key].pos)
          }
          if (sn === 0) wsTell(player, '§7Серверных Waystone нет')
        }
        return 1
      }))
      .then(Commands.literal('server').requires(function (src) {
        return src.hasPermission(2)
      }).executes(function (ctx) {
        return doSetServer(ctx)
      }))
      .then(Commands.literal('unserver').requires(function (src) {
        return src.hasPermission(2)
      }).executes(function (ctx) {
        return doReleaseServer(ctx)
      }))
      .then(Commands.literal('release').requires(function (src) {
        return src.hasPermission(2)
      }).executes(function (ctx) {
        return doReleaseServer(ctx)
      }))
  )
})

EntityEvents.death('minecraft:player', function (event) {
  var victim = event.entity
  var killer = null
  try {
    killer = event.source.actual
  } catch (e) {}
  if (!killer || !killer.isPlayer()) return
  if (String(killer.uuid) === String(victim.uuid)) return
  if (!wsInWild(victim)) return

  var server = event.server
  var data = wsLoad(server)
  var vu = String(victim.uuid)
  var lost = []
  var key
  for (key in data) {
    if (!Object.prototype.hasOwnProperty.call(data, key)) continue
    if (wsIsServer(data[key])) continue
    if (data[key].owner === vu) {
      lost.push({ key: key, entry: data[key] })
      delete data[key]
    }
  }
  if (lost.length === 0) return
  wsSave(server, data)
  var i
  for (i = 0; i < lost.length; i++) {
    wsTell(victim, '§4☠ Вы потеряли Waystone на §c' + lost[i].entry.pos + '§4!')
    wsRefreshHidden(server, lost[i].key, null)
  }
  server.tell('§c' + victim.username + ' §7пал в диких землях от руки §c' + killer.username + '§7 и потерял §c' + lost.length + '§7 Waystone!')
})

console.info('[WS] Система приватов Waystone 21.1.46 загружена (тип server)')
