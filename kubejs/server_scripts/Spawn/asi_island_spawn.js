// ============================================================
//  ASI — СПАВН ИГРОКА НА ОБЩЕМ СТАРТОВОМ ОСТРОВЕ
//  Файл: kubejs/server_scripts/asi_island_spawn.js
//  Константы берутся из asi_island_config.js
//
//  ВАЖНО: гарантированно размещает остров ДО спавна игрока,
//  чтобы он не упал в пустоту.
// ============================================================

PlayerEvents.loggedIn(event => {
  const player = event.player;
  if (player.level.isClientSide()) return;

  const server = event.server;
  const pdata = player.persistentData;

  // Если этот игрок уже начинал игру — ничего не делаем
  if (pdata.getBoolean('asi_started')) return;
  pdata.putBoolean('asi_started', true);

  console.info('[ASI] Новый игрок вошёл: ' + player.name.string + '. Проверяю остров...');

  // ============================================================
  // КРИТИЧЕСКИЙ МОМЕНТ: убедиться, что остров УЖЕ на месте.
  // Если при входе игрока остров ещё не размещён — разместить немедленно.
  // ============================================================
  const flags = server.persistentData;
  if (!flags.getBoolean('asi_island_placed')) {
    console.warn('[ASI] Остров ещё не размещён! Размещаю немедленно перед спавном игрока...');
    
    const ox = ASI_ORIGIN[0], oy = ASI_ORIGIN[1], oz = ASI_ORIGIN[2];
    server.runCommandSilent(`forceload add ${ox} ${oz}`);
    server.runCommandSilent(`place template ${ASI_STRUCTURE} ${ox} ${oy} ${oz}`);
    
    // Удаляем блок-конструктор, если он в NBT
    if (typeof ASI_STRUCTURE_BLOCK !== 'undefined' && ASI_STRUCTURE_BLOCK) {
      const b = ASI_STRUCTURE_BLOCK;
      server.runCommandSilent(`setblock ${b[0]} ${b[1]} ${b[2]} minecraft:air`);
    }
    
    server.runCommandSilent(`setworldspawn ${Math.floor(ASI_SPAWN_X)} ${Math.floor(ASI_SPAWN_Y)} ${Math.floor(ASI_SPAWN_Z)}`);
    server.runCommandSilent('gamerule spawnRadius 0');
    flags.putBoolean('asi_island_placed', true);
    console.info('[ASI] Остров размещён перед спавном игрока.');
  }

  // Теперь ГАРАНТИРОВАННО спавним/телепортируем на остров с минимальной задержкой
  event.server.scheduleInTicks(5, () => {
    const p = event.server.getPlayer(player.uuid);
    if (!p) return;

    const dim = ASI_DIM.replace('minecraft:', '');
    // Не /tp и не /item replace от имени игрока: в 1.21 у новичка нет прав,
    // p.username часто пустой — команды молча не срабатывали, книги не появлялись.
    if (typeof p.teleportTo === 'function') {
      try {
        p.teleportTo(ASI_SPAWN_X, ASI_SPAWN_Y, ASI_SPAWN_Z)
      } catch (e) {
        const name = p.username || (p.name && p.name.string) || ''
        if (name) {
          event.server.runCommandSilent(
            `execute in minecraft:${dim} run tp ${name} ${ASI_SPAWN_X} ${ASI_SPAWN_Y} ${ASI_SPAWN_Z}`
          )
        }
      }
    } else {
      const name = p.username || (p.name && p.name.string) || ''
      if (name) {
        event.server.runCommandSilent(
          `execute in minecraft:${dim} run tp ${name} ${ASI_SPAWN_X} ${ASI_SPAWN_Y} ${ASI_SPAWN_Z}`
        )
      }
    }

    const diary = id => Item.of(`modopedia:book[modopedia:book="${id}"]`)
    p.give(Item.of('ftbquests:book'))
    p.give(diary('asi:mechanist_diary'))
    p.give(diary('asi:skyward_diary'))
    p.give(diary('asi:wildlander_diary'))

    p.tell(Text.gold('Добро пожаловать на Небесный Остров. Ваше приключение начинается здесь...'));
    p.tell(Text.aqua('Три дневника основателей и книга квестов — в инвентаре. Страницы ищите в сундуках.'));
    
    console.info('[ASI] Игрок ' + p.name.string + ' заспавнен на острове.');
  });
});