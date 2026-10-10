// ============================================================
//  ASI — DEBUG-КОМАНДЫ для управления стартовым островом
//  Файл: kubejs/server_scripts/asi_island_debug.js
//  Требуют прав оператора (уровень 2).
// ============================================================

ServerEvents.commandRegistry(event => {
  const { commands: Commands, arguments: Arguments } = event;

  event.register(
    Commands.literal('asi')
      .requires(src => src.hasPermission(2))

      // /asi resetisland  — сбросить флаг размещения острова
      .then(Commands.literal('resetisland')
        .executes(ctx => {
          const server = ctx.source.server;
          server.persistentData.putBoolean('asi_island_placed', false);
          ctx.source.sendSystemMessage(Text.yellow(
            '[ASI] Флаг размещения острова сброшен. Перезайдите на сервер (или /reload), чтобы остров переставился.'
          ));
          return 1;
        }))

      // /asi placenow  — принудительно разместить остров прямо сейчас
      .then(Commands.literal('placenow')
        .executes(ctx => {
          const server = ctx.source.server;
          server.persistentData.putBoolean('asi_island_placed', false)
          let ok = asiPlaceIsland(server)
          ctx.source.sendSystemMessage(Text.green('[ASI] Остров: ' + (ok ? 'земля есть' : 'place вызван, земля ещё не видна') + ' (' + ASI_STRUCTURE + ').'));
          return 1;
        }))

      // /asi resetplayer  — сбросить свой личный флаг спавна (для теста ТП + книги)
      .then(Commands.literal('resetplayer')
        .executes(ctx => {
          const player = ctx.source.player;
          if (player) {
            player.persistentData.putBoolean('asi_started', false);
            ctx.source.sendSystemMessage(Text.yellow('[ASI] Твой флаг спавна сброшен. Перезайди — снова заспавнишься на острове с дневниками.'));
          }
          return 1;
        }))

      // /asi givediaries — выдать три обложки (если спавн уже прошёл)
      .then(Commands.literal('givediaries')
        .executes(ctx => {
          const player = ctx.source.player
          if (!player) return 0
          const diary = id => Item.of(`modopedia:book[modopedia:book="${id}"]`)
          player.give(diary('asi:mechanist_diary'))
          player.give(diary('asi:skyward_diary'))
          player.give(diary('asi:wildlander_diary'))
          ctx.source.sendSystemMessage(Text.green('[ASI] Выданы три дневника основателей.'))
          return 1
        }))

      // /asi status  — показать текущее состояние флагов
      .then(Commands.literal('status')
        .executes(ctx => {
          const server = ctx.source.server;
          const placed = server.persistentData.getBoolean('asi_island_placed');
          let level = server.getLevel(ASI_DIM)
          let ground = asiIsSolidGround(level, ASI_SPAWN_X, ASI_SPAWN_Y, ASI_SPAWN_Z)
          ctx.source.sendSystemMessage(Text.aqua('[ASI] Флаг: ' + placed + ', земля под спавном: ' + ground));
          return 1;
        }))
  );
});