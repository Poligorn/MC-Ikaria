# Воздушные корабли

Полёт в паке строится на **Create Aeronautics** (бандл `create-aeronautics-bundled`) и физике суб-уровней **Sable**, а не на Valkyrien Skies 2. VS2 в паке **нет**.

## Create Aeronautics

Корабль — контрапшен Create, который становится движущейся структурой (sub-level). В `config/aeronautics-server.toml` заданы:

- тяга и обдув пропеллеров (деревянных, андезитовых, smart, propeller bearing);
- подъёмная сила **горячего воздуха** и **пара** (`hotAirStrength` / `steamStrength`, по умолчанию 1.5 kpg на м³);
- лимиты горелки и парового вентиля;
- отдача картофельной пушки на корабле.

Камера на контрапшене: **Aeronautics Camera Sync**.

Клаймы на корабли: **Create Aeronautics: Claims** (совместим с OPAC).

## Сборка и декор

Для корпуса и интерьера в паке есть Create Encased, Copycats+, Interiors, Design n' Decor (+ совместимость с Aeronautics), Bells & Whistles, Frame Changer (декор/рамки порталов Незер — не путать с червоточинами EVE).

**Clockwork** добавляет механические инструменты: в KubeJS переопределены рецепты крыльев, бура, огнемёта, арбалетов. Крылья требуют элитру, латунь Create, золотой аэролит и детали Simulated.

**Paragliders** — личный планер в стиле BotW; крафт заменён на аэролит.

## Бой в небе

**Create: Hostile Skies** — рейды пилладжерских дирижаблей. В `config/hostile_skies-common.toml`:

- попытка спавна каждые **15** минут, шанс 10% → до 50%;
- до **3** активных рейдов на сервер;
- тиры Scout → Skiff → Warship → Flagship (тир 2 с 8 убийств капитанов, тир 3 с 25);
- можно захватывать корабли (Captain's Orders), если не выключено.

**Create: Radars**, **Create Big Cannons**, **Create: Gunsmithing** (библиотека NTGL) — обнаружение и огневая мощь. Снаряды CBC: Ritchie's Projectile Library.

KubeJS на больших дистанциях от спавна вооружает ванильных мобов револьверами/дробовиками CGS.

## Телепорты на кораблях

Обычные Waystones **не крафтятся** (рецепты сняты). Для камней на суб-уровнях Sable нужен аддон **Waystones: Sable**. UI: **Waystones Plus**. Совместимость с картой: Xaero + Waystones.

Червоточины между измерениями — отдельная система, см. [EVE Online](../lore/eve-online.md).
