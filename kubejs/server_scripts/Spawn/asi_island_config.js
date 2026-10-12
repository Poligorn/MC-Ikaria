// ============================================================
//  ASI (Aeronautics: Sky Islands) — ОБЩИЙ КОНФИГ
//  Файл: kubejs/server_scripts/asi_island_config.js
//  Грузится первым (по алфавиту 'a...'), имена видны в других файлах.
//  Top-level var, не const: server_scripts делят одну область Rhino,
//  /reload иначе даёт "redeclaration of const".
// ============================================================

// ID структуры из kubejs/data/asi/structure/start_island.nbt
var ASI_STRUCTURE = 'asi:starter_island';

// Измерение, где стоит остров
var ASI_DIM = 'minecraft:overworld';

// УГОЛ структуры (nbt ставится от угла = минимальные X/Y/Z!)
var ASI_ORIGIN = [-8, 200, -8];

// Смещение от угла структуры до точки, где стоит игрок.
// !!! ВПИШИ реальные значения из своего NBT (размеры/центр площадки) !!!
var ASI_SPAWN_OFFSET = [12, 5, 12];

// Готовая точка спавна игрока (+0.5 = центр блока по X/Z)
var ASI_SPAWN_X = ASI_ORIGIN[0] + ASI_SPAWN_OFFSET[0] + 0.5;
var ASI_SPAWN_Y = ASI_ORIGIN[1] + ASI_SPAWN_OFFSET[1];
var ASI_SPAWN_Z = ASI_ORIGIN[2] + ASI_SPAWN_OFFSET[2] + 0.5;
