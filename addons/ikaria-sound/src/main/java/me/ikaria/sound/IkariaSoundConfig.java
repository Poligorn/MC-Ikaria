package me.ikaria.sound;

import net.neoforged.neoforge.common.ModConfigSpec;

public final class IkariaSoundConfig {
    public static final ModConfigSpec SPEC;
    public static final ModConfigSpec.BooleanValue STREAMER_MODE;
    public static final ModConfigSpec.DoubleValue VOLUME_MELODIES;
    public static final ModConfigSpec.DoubleValue VOLUME_HORNS;
    public static final ModConfigSpec.DoubleValue VOLUME_JUKEBOX;

    static {
        ModConfigSpec.Builder builder = new ModConfigSpec.Builder();
        STREAMER_MODE = builder
                .comment(
                        "When true, Live Radio, Immersive Melodies, goat horns, and jukebox/music discs are fully muted on this client.",
                        "Use this as a streamer safety mute so copyrighted audio is not captured by OBS."
                )
                .define("streamerMode", false);
        builder.push("volumes");
        VOLUME_MELODIES = builder
                .comment("Client volume for Immersive Melodies instruments (0 = mute, 1 = full). Also in Options → Music & Sounds.")
                .defineInRange("melodies", 1.0, 0.0, 1.0);
        VOLUME_HORNS = builder
                .comment("Client volume for goat horns (0 = mute, 1 = full). Also in Options → Music & Sounds.")
                .defineInRange("horns", 1.0, 0.0, 1.0);
        VOLUME_JUKEBOX = builder
                .comment("Client volume for jukeboxes and music discs, including modded record players that use the vanilla jukebox song API (0 = mute, 1 = full).")
                .defineInRange("jukebox", 1.0, 0.0, 1.0);
        builder.pop();
        SPEC = builder.build();
    }

    private IkariaSoundConfig() {
    }
}
