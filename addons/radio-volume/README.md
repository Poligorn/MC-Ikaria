# Live Radio Volume (`radiovolume`)

Клиентский аддон для [Live Radio Mod](https://github.com/) 1.0.2 на NeoForge 1.21.1.
Не пересобирает и не распространяет оригинальный `radiomod.jar`.

Готовый jar: `artifacts/radiovolume-neoforge-1.21.1-1.0.0.jar` в корне репозитория.

## Зачем

Live Radio играет интернет-потоки через свой Java Sound (`SourceDataLine` + JLayer),
минуя и Minecraft `SoundManager`, и Simple Voice Chat. Ползунок в GUI радио —
это локальная громкость самого мода, её неудобно держать на нуле во время стрима.

Аддон регистрирует категорию **Live Radio** в экране громкостей Simple Voice Chat
и масштабирует выход радио. Отдельный **режим стримера** глушит радио полностью.

## Установка

Только на клиенте стримера (серверу аддон не нужен).

1. Live Radio Mod (`radiomod-1.0.2.jar`) — на **клиенте и сервере**.
2. Simple Voice Chat — уже есть в паке.
3. Скопируйте `radiovolume-neoforge-1.21.1-1.0.0.jar` в папку `mods` **клиента**.

Сервер без этого jar принимает игроков: `displayTest = IGNORE_SERVER_VERSION`.

## Как пользоваться

1. В игре откройте Simple Voice Chat → **Adjust Volumes**.
2. Найдите категорию **Live Radio** и поставьте громкость. `0` = полный mute.
3. Опционально назначьте клавишу **Режим стримера (выключить радио)** в настройках управления. Пока режим включён, радио молчит независимо от ползунков, в углу HUD горит `РАДИО ВЫКЛ`. Состояние пишется в `config/radiovolume-client.toml`.

Ползунок в GUI самого радио по-прежнему работает и задаёт дистанцию слышимости. Аддон умножает уже посчитанный gain.

## Сборка

```bash
cd addons/radio-volume
./gradlew build
# jar: build/libs/radiovolume-neoforge-1.21.1-1.0.0.jar
```

Цели: Minecraft 1.21.1, NeoForge 21.1.250, voicechat-api 2.6.0+ (пакет использует SVC 2.6.22).
