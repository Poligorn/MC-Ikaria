# Create Aeronautics и полёт

Это ядро пака. Отдельного мода с названием «Aeronautics Sky Islands» в `mods/` нет: острова и корабли собираются из нескольких проектов.

## Обязательный набор

| Мод | Modrinth / CF | Зачем в паке |
|-----|---------------|--------------|
| [Create Aeronautics](https://modrinth.com/mod/create-aeronautics) | `oWaK0Q19` | Корабли, пропеллеры, подъём на воздухе/паре |
| [Sable](https://modrinth.com/mod/sable) | `T9PomCSv` | Библиотека движущихся суб-уровней |
| [Aero Islands](https://modrinth.com/mod/aeroscapes-islands) | `tGVwBATM` | Генерация небесных островов, аэролит |
| [Create Aeronautics Discovery](https://modrinth.com/mod/create-aeronautics-discovery) | `MtpVp9HL` | Пролёты, торговец, события столкновений |
| [Aeronautics Camera Sync](https://modrinth.com/mod/aero_cam_sync) | `ZGxtWu73` | Наклон камеры на контрапшене |
| [Create Aeronautics: Claims](https://modrinth.com/mod/aeroclaims) | `CwZ8q37q` | Клаймы кораблей, стык с OPAC |
| [Clockwork](https://modrinth.com/mod/clockwork_mod) | `h3OPQqBm` | Только крылья (`clockwork_wings`); остальное скрыто |
| [Paragliders](https://modrinth.com/mod/paragliders) | `esqWA0aQ` | Личный планер |
| [Create: Hostile Skies](https://modrinth.com/mod/create-hostile-skies) | `78hqRjWm` | Рейды дирижаблей |
| [Waystones: Sable](https://modrinth.com/mod/waystones-sable) | `BxhPGfcK` | Телепорт с суб-уровня |
| [Jade Sable Compat](https://modrinth.com/mod/jade-sable-compat) | `jCrJ4iGH` | Jade на кораблях |
| [Sable: Ragdolls](https://modrinth.com/mod/sable-ragdolls) | `I3mWDgfy` | Рэгдолл на физике Sable |
| [Create: Design n' Decor - Aeronautics Compat](https://modrinth.com/mod/create-design-n-decor-aeronautics-compat) | `KhnOEVjA` | Декор DnD на кораблях |

Рядом по теме: [Create: Radars](https://modrinth.com/mod/create-radars), [Create Big Cannons](https://modrinth.com/mod/create-big-cannons), [Create: Gunsmithing](https://modrinth.com/mod/cgs), [Sky Whale Ship](https://modrinth.com/mod/sky-whale-ship), [Forgiving Void](https://modrinth.com/mod/forgiving-void), [Clear Void](https://modrinth.com/mod/clear-void), [Smooth Skies](https://modrinth.com/mod/smooth-skies), [Cirrus](https://modrinth.com/mod/cirrus), [Eve Wormhole Portals](https://www.curseforge.com/projects/1713071).

## Чего нет

**Valkyrien Skies 2** в паке нет. Документация, где VS2 назван «основным модом», относилась к другому черновику.

Create Aeronautics в индексе — **bundled** jar `create-aeronautics-bundled-1.21.1-1.3.0.jar`. Предметы пространства имён `aeronautics:` и `simulated:` (очки пилота в квестах, пружины/гироскоп в рецепте крыльев) приходят из этой экосистемы.

## Как это стыкуется с лором

Корабль = «корабль пилота». Червоточины — отдельный мод, не блок Aeronautics. Ранги лицензий — предметы KubeJS, они не выдаются Aeronautics автоматически.

См. также: [острова](../mechanics/flying-islands.md), [корабли](../mechanics/airships.md), [EVE](../lore/eve-online.md).
