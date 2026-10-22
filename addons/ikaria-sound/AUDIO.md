# Как источники звука играют и куда сели ползунки

## Live Radio 1.0.2

Декомпиляция `radiomod-1.0.2.jar` (CFR 0.152).

Не использует Simple Voice Chat API и не использует Minecraft `SoundManager` / `SoundSource`.

Клиент сам открывает HTTP MP3 (`User-Agent: RadioMod/1.0 Minecraft`), декодирует JLayer (`Bitstream`/`Decoder`) и пишет PCM в `javax.sound.sampled.SourceDataLine`. Громкость: статическое `globalVolume` 0–100 × квадратичное затухание по дистанции, плюс `FloatControl.MASTER_GAIN`. Сервер только рассылает station id + URL.

Ползунок нельзя повесить на vanilla SoundSource — звука там нет. Категория SVC `live_radio` (`registerClientVolumeCategory`) + mixin `RadioPlayer.computeLinearGain()`.

## Immersive Melodies 0.8.0+1.21.1

Ноты — `NoteSoundInstance` через `Minecraft.getSoundManager().play(...)`.
`InstrumentItem.playNote` передаёт **`SoundSource.NEUTRAL`**. Это vanilla-ползунок «Дружелюбные существа», не SVC.

Отдельный ползунок в «Музыка и звуки»; mixin `SoundEngine.calculateVolume` масштабирует по namespace `immersive_melodies` / классу `NoteSoundInstance`. Это MIDI-подобные ноты, не записи — режим стримера их не глушит.

## Проигрыватель и пластинки

Vanilla: `LevelRenderer.playJukeboxSong` → `SimpleSoundInstance.forJukeboxSong` (`SoundSource.RECORDS`, stream из `sounds.json`).
Моды, которые вызывают `forJukeboxSong` или level event 1010 (в том числе типичные jukebox-апгрейды рюкзаков), попадают в ту же группу. Дополнительно: path содержит `music_disc` / `jukebox`, либо `RECORDS` + `shouldStream()` (кроме нотоблоков).

AudioPlayer не используется: NeoForge-порта нет.

Отдельный слайдер Melodies/пластинок в «Музыка и звуки». Козьи рога и шум пака (Create, пушки, корабли и т.д.) снова только на ванильных категориях — доп. ползунки убраны.

## Режим стримера

Только Live Radio: `0` для radio gain. В GUI радио — маленькая иконка динамика справа на строке Volume (не наезжает на +1/+10). На HUD — та же иконка, полупрозрачная. `PlaySoundEvent.setSound(null)` если множитель Melodies/пластинок 0.
