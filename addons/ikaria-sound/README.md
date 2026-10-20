# Ikaria Sound Categories (`ikariasound`)

Клиентский аддон для пака Aeronautics Ikaria (Minecraft 1.21.1, NeoForge 21.1.250).
Один jar: отдельные ползунки для Live Radio, Immersive Melodies, козьих рогов и проигрывателей/пластинок плюс глобальный mute для стрима.

Готовый файл: `artifacts/ikariasound-neoforge-1.21.1-1.0.0.jar`.

## Куда какие ползунки

| Что | Как играет звук | Где ползунок |
| --- | --- | --- |
| Live Radio | Свой Java Sound (`SourceDataLine` + JLayer), не SVC и не `SoundManager` | Simple Voice Chat → Adjust Volumes → **Live Radio**. `0` = mute |
| Immersive Melodies | `SoundManager`, категория `NEUTRAL` (дружелюбные мобы) | Настройки → Музыка и звуки → **Инструменты (Melodies)** |
| Козьи рога | `SoundManager`, `SoundSource.RECORDS` (`item.goat_horn.*`) | Настройки → Музыка и звуки → **Козьи рога** |
| Проигрыватель / пластинки | `SoundManager`, `SimpleSoundInstance.forJukeboxSong` + streaming `RECORDS` | Настройки → Музыка и звуки → **Проигрыватель / пластинки** |

Vanilla-ползунок «Проигрыватель/нотоблоки» по-прежнему влияет на нотоблоки и как множитель на рога/пластинки. Наши ползунки — дополнительный множитель, чтобы стример мог выключить пластинки, не трогая нотоблоки.

**Режим стримера** глушит все четыре группы сразу. Клавиша в настройках управления (по умолчанию не назначена) и тумблер в «Музыка и звуки». Пока включён, в углу HUD горит `РЕЖИМ СТРИМЕРА`. Пишется в `config/ikariasound-client.toml`.

AudioPlayer (henkelmax) в NeoForge 1.21.1 нет — аддон на него не опирается.

## Установка

Только на клиенте стримера. Серверу этот jar не нужен (`displayTest = IGNORE_SERVER_VERSION`).

1. Live Radio (`radiomod-1.0.2.jar`) — клиент **и** сервер, если радио используется.
2. Immersive Melodies и Simple Voice Chat уже в паке.
3. `ikariasound-neoforge-1.21.1-1.0.0.jar` → папка `mods` клиента.

## Сборка

```bash
cd addons/ikaria-sound
./gradlew build
# jar: build/libs/ikariasound-neoforge-1.21.1-1.0.0.jar
```

Цели: Minecraft 1.21.1, NeoForge 21.1.250, voicechat-api 2.6.20+ (в паке SVC 2.6.22).
