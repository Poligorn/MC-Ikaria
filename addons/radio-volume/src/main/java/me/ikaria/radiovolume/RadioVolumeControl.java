package me.ikaria.radiovolume;

import de.maxhenkel.voicechat.api.VoicechatClientApi;
import me.ikaria.radiovolume.voicechat.RadioVolumeVoicechatPlugin;

/**
 * Thread-safe gain multiplier applied to Live Radio's Java Sound pipeline.
 * The audio decoder thread only reads volatiles; SVC config is sampled on the client tick.
 */
public final class RadioVolumeControl {
    private static volatile boolean streamerMode;
    private static volatile float svcMultiplier = 1.0f;

    private RadioVolumeControl() {
    }

    public static float apply(float originalGain) {
        if (streamerMode || originalGain <= 0.0f || svcMultiplier <= 0.0f) {
            return 0.0f;
        }
        return originalGain * svcMultiplier;
    }

    public static boolean isStreamerMode() {
        return streamerMode;
    }

    public static float getSvcMultiplier() {
        return svcMultiplier;
    }

    public static void setStreamerMode(boolean enabled) {
        streamerMode = enabled;
        RadioVolumeConfig.STREAMER_MODE.set(enabled);
        refreshRadioLineGain();
    }

    public static void toggleStreamerMode() {
        setStreamerMode(!streamerMode);
    }

    public static void clientTick() {
        boolean configured = RadioVolumeConfig.STREAMER_MODE.get();
        if (configured != streamerMode) {
            streamerMode = configured;
            refreshRadioLineGain();
        }

        float next = 1.0f;
        VoicechatClientApi api = RadioVolumeVoicechatPlugin.clientApi();
        if (api != null) {
            try {
                next = (float) api.getVolumeConfig().getCategoryVolume(RadioVolumeMod.SVC_CATEGORY_ID);
            } catch (Throwable ignored) {
                next = 1.0f;
            }
        }
        if (next < 0.0f) {
            next = 0.0f;
        }
        if (Float.floatToIntBits(next) != Float.floatToIntBits(svcMultiplier)) {
            svcMultiplier = next;
            refreshRadioLineGain();
        }
    }

    /**
     * RadioPlayer.updateVolume() is package-private; setGlobalVolume(getGlobalVolume())
     * re-applies MASTER_GAIN on every active SourceDataLine.
     */
    private static void refreshRadioLineGain() {
        try {
            Class<?> player = Class.forName("com.radiomod.radio.RadioPlayer");
            Object volume = player.getMethod("getGlobalVolume").invoke(null);
            player.getMethod("setGlobalVolume", int.class).invoke(null, volume);
        } catch (Throwable ignored) {
            // Radio mod not loaded or API changed; PCM scaling in computeLinearGain still applies.
        }
    }
}
