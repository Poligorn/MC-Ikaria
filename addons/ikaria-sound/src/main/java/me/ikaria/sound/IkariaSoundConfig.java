package me.ikaria.sound;

import java.util.EnumMap;
import java.util.Map;
import net.neoforged.neoforge.common.ModConfigSpec;

public final class IkariaSoundConfig {
    public static final ModConfigSpec SPEC;
    public static final ModConfigSpec.BooleanValue STREAMER_MODE;
    private static final Map<IkariaSoundCategory, ModConfigSpec.DoubleValue> VOLUMES =
            new EnumMap<>(IkariaSoundCategory.class);

    static {
        ModConfigSpec.Builder builder = new ModConfigSpec.Builder();
        STREAMER_MODE = builder
                .comment(
                        "When true, Live Radio is fully muted on this client (OBS-safe).",
                        "Immersive Melodies and jukebox sliders stay independent."
                )
                .define("streamerMode", false);
        builder.push("volumes");
        for (IkariaSoundCategory category : IkariaSoundCategory.sliderCategories()) {
            VOLUMES.put(
                    category,
                    builder.comment(
                                    "Client volume for " + category.name().toLowerCase()
                                            + " (0 = mute, 1 = full). Also in Options → Music & Sounds."
                            )
                            .defineInRange(category.configId(), 1.0, 0.0, 1.0)
            );
        }
        builder.pop();
        SPEC = builder.build();
    }

    public static ModConfigSpec.DoubleValue volume(IkariaSoundCategory category) {
        return VOLUMES.get(category);
    }

    private IkariaSoundConfig() {
    }
}
