# Как Live Radio 1.0.2 играет звук

Декомпиляция `radiomod-1.0.2.jar` (CFR 0.152).

## Пайплайн

Радио **не** использует Simple Voice Chat API и **не** использует Minecraft `SoundManager` / `SoundSource`.

Клиент:

1. Сервер шлёт `StationBroadcastPayload` (station id + stream URL + ключ блока).
2. `RadioPlayer.setStation` открывает HTTP-поток (`User-Agent: RadioMod/1.0 Minecraft`, `Icy-MetaData: 0`).
3. JLayer (`javazoom.jl.decoder.Bitstream` / `Decoder`) декодирует MP3 в PCM.
4. PCM пишется в `javax.sound.sampled.SourceDataLine` (Java Sound, системный микшер, не OpenAL Minecraft).
5. Громкость: `globalVolume` 0–100 (по умолчанию 50) × квадратичное затухание по дистанции (до `200 * userGain` блоков). Gain применяется к сэмплам и к `FloatControl.Type.MASTER_GAIN`.

Зависимости внутри jar (JarJar): JLayer 1.0.1.4, MP3SPI 1.9.5.4, tritonus-share 0.3.7.4. MP3SPI в рантайме для этого пути не обязателен — декод идёт через JLayer напрямую.

Сервер:

- Хранит выбранную станцию в `RadioBlockEntity`.
- Рассылает URL клиентам. Сам аудиопоток **не** проксирует.

Стриминг **клиентский**: каждый игрок качает станцию сам. Выключить звук у себя нельзя «на сервере».

## Уже существующая громкость

`RadioPlayer.globalVolume` + ползунок в `RadioScreen`. Это клиентская глобальная громкость всех радио, не категория SVC и не `SoundSource`. Она не сохраняется в конфиг (статическое поле, сбрасывается при перезапуске клиента).

## Почему аддон, а не форк

Mixin в `computeLinearGain()F` масштабирует и PCM, и MASTER_GAIN, не трогая оригинальный jar. Форк имел бы смысл только если mixin сломается на новой версии radiomod.
