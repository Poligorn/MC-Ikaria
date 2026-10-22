package me.ikaria.sound;

import java.util.ArrayDeque;
import java.util.Collections;
import java.util.Deque;
import java.util.EnumMap;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.WeakHashMap;
import me.ikaria.sound.voicechat.IkariaVoicechatPlugin;
import net.minecraft.client.Minecraft;
import net.minecraft.client.resources.sounds.SoundInstance;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.sounds.SoundSource;
import net.neoforged.fml.ModList;

/**
 * Classifies sounds and supplies extra gain on top of vanilla SoundSource volumes.
 * Radio is Java Sound / the SVC Live Radio category. Streamer mode mutes radio only.
 */
public final class IkariaSoundControl {
    private static final ThreadLocal<Deque<SoundInstance>> PLAYING = ThreadLocal.withInitial(ArrayDeque::new);
    private static final Set<SoundInstance> JUKEBOX_INSTANCES = Collections.newSetFromMap(new WeakHashMap<>());
    private static final Map<IkariaSoundCategory, Float> SLIDER_VOLUMES = new EnumMap<>(IkariaSoundCategory.class);

    private static volatile boolean streamerMode;
    private static volatile float radioSvcMultiplier = 1.0f;

    static {
        for (IkariaSoundCategory category : IkariaSoundCategory.sliderCategories()) {
            SLIDER_VOLUMES.put(category, 1.0f);
        }
    }

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
        if (category == null || category == IkariaSoundCategory.RADIO) {
            return 1.0f;
        }
        return volumeOf(category);
    }

    public static float extraMultiplierForCurrent() {
        SoundInstance current = currentPlaying();
        return current == null ? 1.0f : extraMultiplier(current);
    }

    public static float volumeOf(IkariaSoundCategory category) {
        if (category == IkariaSoundCategory.RADIO) {
            return streamerMode ? 0.0f : radioSvcMultiplier;
        }
        Float value = SLIDER_VOLUMES.get(category);
        return value == null ? 1.0f : Math.max(0.0f, value);
    }

    public static boolean isStreamerMode() {
        return streamerMode;
    }

    public static void setStreamerMode(boolean enabled) {
        streamerMode = enabled;
        IkariaSoundConfig.STREAMER_MODE.set(enabled);
        refreshRadioLineGain();
    }

    public static void toggleStreamerMode() {
        setStreamerMode(!streamerMode);
    }

    public static void setCategoryVolume(IkariaSoundCategory category, double volume) {
        if (!category.hasVanillaSlider()) {
            return;
        }
        float clamped = (float) Math.max(0.0, Math.min(1.0, volume));
        SLIDER_VOLUMES.put(category, clamped);
        IkariaSoundConfig.volume(category).set(volume);
        refreshPlayingSounds();
    }

    public static double configuredVolume(IkariaSoundCategory category) {
        if (category == IkariaSoundCategory.RADIO) {
            return radioSvcMultiplier;
        }
        return IkariaSoundConfig.volume(category).get();
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

        ResourceLocation location = null;
        try {
            location = sound.getLocation();
        } catch (Throwable ignored) {
            // fall through to class-name checks
        }

        String namespace = location == null ? "" : location.getNamespace();
        String path = location == null ? "" : location.getPath();
        String className = sound.getClass().getName();

        if (path.contains("music_disc") || path.startsWith("records/")
                || path.contains("jukebox_song") || path.contains("jukebox")) {
            return IkariaSoundCategory.JUKEBOX;
        }
        if (className.toLowerCase(Locale.ROOT).contains("jukebox")) {
            return IkariaSoundCategory.JUKEBOX;
        }
        if (sound.getSource() == SoundSource.RECORDS && !path.startsWith("block.note_block")
                && !path.startsWith("item.goat_horn.") && !path.contains("goat_horn.sound")) {
            try {
                if (sound.getSound() != null && sound.getSound().shouldStream()) {
                    return IkariaSoundCategory.JUKEBOX;
                }
            } catch (Throwable ignored) {
                // Sound not resolved yet.
            }
        }
        if (className.contains("immersive_melodies") || "immersive_melodies".equals(namespace)) {
            return IkariaSoundCategory.MELODIES;
        }
        return null;
    }

    public static void clientTick() {
        boolean configuredStreamer = IkariaSoundConfig.STREAMER_MODE.get();
        if (configuredStreamer != streamerMode) {
            streamerMode = configuredStreamer;
            refreshRadioLineGain();
        }

        boolean soundChanged = false;
        for (IkariaSoundCategory category : IkariaSoundCategory.sliderCategories()) {
            float next = IkariaSoundConfig.volume(category).get().floatValue();
            Float previous = SLIDER_VOLUMES.put(category, next);
            if (previous == null || Float.floatToIntBits(previous) != Float.floatToIntBits(next)) {
                soundChanged = true;
            }
        }
        if (soundChanged) {
            refreshPlayingSounds();
        }

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
        if (mc.getSoundManager() == null || mc.options == null) {
            return;
        }
        for (SoundSource source : SoundSource.values()) {
            mc.getSoundManager().updateSourceVolume(source, mc.options.getSoundSourceVolume(source));
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
