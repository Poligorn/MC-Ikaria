package me.ikaria.radiovolume;

import net.neoforged.neoforge.common.ModConfigSpec;

public final class RadioVolumeConfig {
    public static final ModConfigSpec SPEC;
    public static final ModConfigSpec.BooleanValue STREAMER_MODE;

    static {
        ModConfigSpec.Builder builder = new ModConfigSpec.Builder();
        STREAMER_MODE = builder
                .comment(
                        "When true, Live Radio is fully muted on this client regardless of the SVC slider or the radio GUI volume.",
                        "Use this as a streamer safety mute so copyrighted radio is not captured by OBS."
                )
                .define("streamerMode", false);
        SPEC = builder.build();
    }

    private RadioVolumeConfig() {
    }
}
