# Как источники звука играют и куда сели ползунки

## Live Radio 1.0.2

Декомпиляция `radiomod-1.0.2.jar` (CFR 0.152).

Не использует Simple Voice Chat API и не использует Minecraft `SoundManager` / `SoundSource`.

Клиент сам открывает HTTP MP3 (`User-Agent: RadioMod/1.0 Minecraft`), декодирует JLayer (`Bitstream`/`Decoder`) и пишет PCM в `javax.sound.sampled.SourceDataLine`. Громкость: статическое `globalVolume` 0–100 × квадратичное затухание по дистанции, плюс `FloatControl.MASTER_GAIN`. Сервер только рассылает station id + URL.

Ползунок нельзя повесить на vanilla SoundSource — звука там нет. Категория SVC `live_radio` (`registerClientVolumeCategory`) + mixin `RadioPlayer.computeLinearGain()`.

## Immersive Melodies 0.8.0+1.21.1

Исходники и декомпиляция `immersive_melodies-neoforge-0.8.0+1.21.1.jar`.

Ноты — `NoteSoundInstance` через `Minecraft.getSoundManager().play(...)`.
`InstrumentItem.playNote` передаёт **`SoundSource.NEUTRAL`**. Это vanilla-ползунок «Дружелюбные существа», не SVC.

Отдельный ползунок в «Музыка и звуки»; mixin `SoundEngine.calculateVolume` масштабирует по namespace `immersive_melodies` / классу `NoteSoundInstance`.

## Козьи рога

Vanilla 1.21.1: `InstrumentItem.play` → `SoundSource.RECORDS`, события `minecraft:item.goat_horn.sound.0`–`7`.
Тот же слайдер, что у проигрывателя и нотоблоков (MC-251832, Works As Intended).

Классификация по id звука `item.goat_horn.*`, отдельный слайдер в настройках звука. Нотоблоки (`block.note_block.*`) не трогаем.

## Проигрыватель и пластинки

Vanilla: `LevelRenderer.playJukeboxSong` → `SimpleSoundInstance.forJukeboxSong` (`SoundSource.RECORDS`, stream из `sounds.json`).
Моды, которые вызывают `forJukeboxSong` или level event 1010 (в том числе типичные jukebox-апгрейды рюкзаков), попадают в ту же группу. Дополнительно: path содержит `music_disc` / `jukebox`, либо `RECORDS` + `shouldStream()` (кроме нотоблоков).

AudioPlayer не используется: NeoForge-порта нет.

## Режим стримера

Один флаг. `0` для radio gain, extra-multiplier для SoundManager-групп, `PlaySoundEvent.setSound(null)` если множитель 0.
