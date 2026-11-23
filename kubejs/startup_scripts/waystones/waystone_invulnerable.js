// Неуязвимость блоков мода Waystones (21.1.46).
// Всем блокам namespace waystones выставляется прочность как у бедрока:
// destroySpeed -1 (не ломаются в выживании) и explosionResistance 3600000
// (устойчивость к взрывам). Waystones: Sable своих блоков не добавляет.
// Тег #waystones:waystones покрывает только 10 вариантов вейстоуна,
// поэтому список id задан явно по банке мода (blockstates и теги).
// Скрипт стартовый: нужен полный перезапуск клиента и сервера, /reload недостаточен.

var WAYSTONE_DESTROY_SPEED = -1
var WAYSTONE_EXPLOSION_RESISTANCE = 3600000

var WAYSTONE_BLOCKS = [
  'waystones:waystone',
  'waystones:mossy_waystone',
  'waystones:sandy_waystone',
  'waystones:deepslate_waystone',
  'waystones:blackstone_waystone',
  'waystones:end_stone_waystone',
  'waystones:mud_bricks_waystone',
  'waystones:prismarine_waystone',
  'waystones:purpur_waystone',
  'waystones:red_nether_bricks_waystone',
  'waystones:warp_plate',
  'waystones:warp_portal',
  'waystones:fleeting_memorial',
  'waystones:white_portstone',
  'waystones:orange_portstone',
  'waystones:magenta_portstone',
  'waystones:light_blue_portstone',
  'waystones:yellow_portstone',
  'waystones:lime_portstone',
  'waystones:pink_portstone',
  'waystones:gray_portstone',
  'waystones:light_gray_portstone',
  'waystones:cyan_portstone',
  'waystones:purple_portstone',
  'waystones:blue_portstone',
  'waystones:brown_portstone',
  'waystones:green_portstone',
  'waystones:red_portstone',
  'waystones:black_portstone',
  'waystones:orange_sharestone',
  'waystones:magenta_sharestone',
  'waystones:light_blue_sharestone',
  'waystones:yellow_sharestone',
  'waystones:lime_sharestone',
  'waystones:pink_sharestone',
  'waystones:gray_sharestone',
  'waystones:light_gray_sharestone',
  'waystones:cyan_sharestone',
  'waystones:purple_sharestone',
  'waystones:blue_sharestone',
  'waystones:brown_sharestone',
  'waystones:green_sharestone',
  'waystones:red_sharestone',
  'waystones:black_sharestone'
]

BlockEvents.modification(event => {
  event.modify(WAYSTONE_BLOCKS, function (block) {
    block.destroySpeed = WAYSTONE_DESTROY_SPEED
    block.explosionResistance = WAYSTONE_EXPLOSION_RESISTANCE
  })
})
