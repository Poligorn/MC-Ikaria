package me.ikaria.sound;

import java.util.ArrayDeque;
import java.util.Collections;
import java.util.Deque;
import java.util.Set;
import java.util.WeakHashMap;
import me.ikaria.sound.voicechat.IkariaVoicechatPlugin;
import net.minecraft.client.Minecraft;
import net.minecraft.client.resources.sounds.SoundInstance;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.sounds.SoundSource;
import net.neoforged.fml.ModList;

/**
 * Classifies copyright-sensitive sounds and supplies extra gain on top of vanilla SoundSource volumes.
 * Radio is handled separately (Java Sound / SVC category).
 */
public final class IkariaSoundControl {
    private static final ThreadLocal<Deque<SoundInstance>> PLAYING = ThreadLocal.withInitial(ArrayDeque::new);
    private static final Set<SoundInstance> JUKEBOX_INSTANCES = Collections.newSetFromMap(new WeakHashMap<>());

    private static volatile boolean streamerMode;
    private static volatile float radioSvcMultiplier = 1.0f;
    private static volatile float melodiesVolume = 1.0f;
    private static volatile float hornsVolume = 1.0f;
    private static volatile float jukeboxVolume = 1.0f;

    private IkariaSoundControl() {
    }

    public static void pushPlaying(SoundInstance sound) {
        PLAYING.get().push(sound);
    }

    public static void popPlaying() {
        Deque<SoundInstance> stack = PLAYING.get();
        if (!stack.isEmpty()) {
            stack.pop();
        }
    }

    public static SoundInstance currentPlaying() {
        return PLAYING.get().peek();
    }

    public static void markJukebox(SoundInstance sound) {
        if (sound != null) {
            synchronized (JUKEBOX_INSTANCES) {
                JUKEBOX_INSTANCES.add(sound);
                JUKEBOX_ORDER.addLast(new WeakReference<>(sound));
            }
        }
    }

    public static float applyRadioGain(float originalGain) {
        if (streamerMode || originalGain <= 0.0f || radioSvcMultiplier <= 0.0f) {
            return 0.0f;
        }
        return originalGain * radioSvcMultiplier;
    }

    public static float extraMultiplier(SoundInstance sound) {
        IkariaSoundCategory category = classify(sound);
        if (category == null) {
            return 1.0f;
        }
        return volumeOf(category);
    }

    public static float extraMultiplierForCurrent() {
        SoundInstance current = currentPlaying();
        return current == null ? 1.0f : extraMultiplier(current);
    }

    public static float volumeOf(IkariaSoundCategory category) {
        if (streamerMode) {
            return 0.0f;
        }
        return switch (category) {
            case RADIO -> radioSvcMultiplier;
            case MELODIES -> melodiesVolume;
            case HORNS -> hornsVolume;
            case JUKEBOX -> jukeboxVolume;
        };
    }

    public static boolean isStreamerMode() {
        return streamerMode;
    }

    public static void setStreamerMode(boolean enabled) {
        streamerMode = enabled;
        IkariaSoundConfig.STREAMER_MODE.set(enabled);
        refreshRadioLineGain();
        refreshPlayingSounds();
    }

    public static void toggleStreamerMode() {
        setStreamerMode(!streamerMode);
    }

    public static void setCategoryVolume(IkariaSoundCategory category, double volume) {
        float clamped = (float) Math.max(0.0, Math.min(1.0, volume));
        switch (category) {
            case MELODIES -> {
                melodiesVolume = clamped;
                IkariaSoundConfig.VOLUME_MELODIES.set(volume);
            }
            case HORNS -> {
                hornsVolume = clamped;
                IkariaSoundConfig.VOLUME_HORNS.set(volume);
            }
            case JUKEBOX -> {
                jukeboxVolume = clamped;
                IkariaSoundConfig.VOLUME_JUKEBOX.set(volume);
            }
            case RADIO -> {
                // Radio lives in Simple Voice Chat's volume screen.
            }
        }
        refreshPlayingSounds();
    }

    public static double configuredVolume(IkariaSoundCategory category) {
        return switch (category) {
            case MELODIES -> IkariaSoundConfig.VOLUME_MELODIES.get();
            case HORNS -> IkariaSoundConfig.VOLUME_HORNS.get();
            case JUKEBOX -> IkariaSoundConfig.VOLUME_JUKEBOX.get();
            case RADIO -> radioSvcMultiplier;
        };
    }

    public static IkariaSoundCategory classify(SoundInstance sound) {
        if (sound == null) {
            return null;
        }
        synchronized (JUKEBOX_INSTANCES) {
            if (JUKEBOX_INSTANCES.contains(sound)) {
                return IkariaSoundCategory.JUKEBOX;
            }
        }
        String className = sound.getClass().getName();
        if (className.startsWith("immersive_melodies.") || className.contains("NoteSoundInstance")) {
            if (className.contains("immersive_melodies")) {
                return IkariaSoundCategory.MELODIES;
            }
        }
        if (className.toLowerCase().contains("jukebox")) {
            return IkariaSoundCategory.JUKEBOX;
        }

        ResourceLocation location;
        try {
            location = sound.getLocation();
        } catch (Throwable ignored) {
            return null;
        }
        if (location == null) {
            return null;
        }
        String namespace = location.getNamespace();
        String path = location.getPath();
        if ("immersive_melodies".equals(namespace)) {
            return IkariaSoundCategory.MELODIES;
        }
        if (path.startsWith("item.goat_horn.") || path.contains("goat_horn.sound")) {
            return IkariaSoundCategory.HORNS;
        }
        if (path.contains("music_disc") || path.startsWith("records/") || path.contains("jukebox_song") || path.contains("jukebox")) {
            return IkariaSoundCategory.JUKEBOX;
        }
        if (sound.getSource() == SoundSource.RECORDS && !path.startsWith("block.note_block")) {
            try {
                if (sound.shouldStream()) {
                    return IkariaSoundCategory.JUKEBOX;
                }
            } catch (Throwable ignored) {
                // Sound not resolved yet.
            }
        }
        return null;
    }

    public static void clientTick() {
        boolean configuredStreamer = IkariaSoundConfig.STREAMER_MODE.get();
        if (configuredStreamer != streamerMode) {
            streamerMode = configuredStreamer;
            refreshRadioLineGain();
            refreshPlayingSounds();
        }
        melodiesVolume = IkariaSoundConfig.VOLUME_MELODIES.get().floatValue();
        hornsVolume = IkariaSoundConfig.VOLUME_HORNS.get().floatValue();
        jukeboxVolume = IkariaSoundConfig.VOLUME_JUKEBOX.get().floatValue();

        float nextRadio = 1.0f;
        if (ModList.get().isLoaded("voicechat")) {
            nextRadio = IkariaVoicechatPlugin.radioCategoryVolume();
        }
        if (nextRadio < 0.0f) {
            nextRadio = 0.0f;
        }
        if (Float.floatToIntBits(nextRadio) != Float.floatToIntBits(radioSvcMultiplier)) {
            radioSvcMultiplier = nextRadio;
            refreshRadioLineGain();
        }
    }

    public static void refreshPlayingSounds() {
        Minecraft mc = Minecraft.getInstance();
        if (mc.getSoundManager() != null && mc.options != null) {
            float records = mc.options.getSoundSourceVolume(SoundSource.RECORDS);
            mc.getSoundManager().updateSourceVolume(SoundSource.RECORDS, records);
        }
    }

    /**
     * RadioPlayer.updateVolume() is package-private; setGlobalVolume(getGlobalVolume())
     * re-applies MASTER_GAIN on every active SourceDataLine.
     */
    public static void refreshRadioLineGain() {
        try {
            Class<?> player = Class.forName("com.radiomod.radio.RadioPlayer");
            Object volume = player.getMethod("getGlobalVolume").invoke(null);
            player.getMethod("setGlobalVolume", int.class).invoke(null, volume);
        } catch (Throwable ignored) {
            // Radio mod not loaded or API changed; PCM scaling in computeLinearGain still applies.
        }
    }
}
