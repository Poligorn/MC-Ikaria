# Ikaria Sound Categories (`ikariasound`)

Клиентский аддон для пака Aeronautics Ikaria (Minecraft 1.21.1, NeoForge 21.1.250).
Один jar: отдельные ползунки для Live Radio, Immersive Melodies и пластинок плюс mute Live Radio для стрима.

Готовый файл: `artifacts/ikariasound-neoforge-1.21.1-1.1.2.jar`.

## Куда какие ползунки

| Что | Как играет звук | Где ползунок |
| --- | --- | --- |
| Live Radio | Свой Java Sound (`SourceDataLine` + JLayer), не SVC и не `SoundManager` | Simple Voice Chat → Adjust Volumes → **Live Radio**. `0` = mute |
| Immersive Melodies | `SoundManager`, категория `NEUTRAL` | Настройки → Музыка и звуки → **Инструменты (Melodies)** |
| Проигрыватель / пластинки | `SoundManager`, `forJukeboxSong` + streaming `RECORDS` | Настройки → Музыка и звуки → **Проигрыватель / пластинки** |

Vanilla-ползунок «Проигрыватель/нотоблоки» по-прежнему влияет на нотоблоки и как множитель на пластинки. Наш ползунок пластинок — дополнительный множитель.

**Режим стримера глушит только Live Radio.** Клавиша в настройках управления (по умолчанию не назначена) и маленькая иконка динамика справа на строке громкости в GUI радио (подсказка при наведении). Пока включён, в углу HUD тихая иконка. Пишется в `config/ikariasound-client.toml`.

AudioPlayer (henkelmax) в NeoForge 1.21.1 нет — аддон на него не опирается.

## Установка

Только на клиенте стримера. Серверу этот jar не нужен (`displayTest = IGNORE_SERVER_VERSION`).

1. Live Radio (`radiomod-1.0.2.jar`) — клиент **и** сервер, если радио используется.
2. Immersive Melodies и Simple Voice Chat уже в паке.
3. `ikariasound-neoforge-1.21.1-1.1.2.jar` → папка `mods` клиента.

## Сборка

```bash
cd addons/ikaria-sound
./gradlew build
# jar: build/libs/ikariasound-neoforge-1.21.1-1.1.2.jar
```

Цели: Minecraft 1.21.1, NeoForge 21.1.250, voicechat-api 2.6.20+ (в паке SVC 2.6.22).
