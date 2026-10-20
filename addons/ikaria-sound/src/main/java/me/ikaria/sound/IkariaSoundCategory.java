package me.ikaria.sound;

import java.util.Locale;
import java.util.Set;

/**
 * Sound groups with an independent client slider.
 * {@link #RADIO} is the Simple Voice Chat category; the rest appear in Music &amp; Sounds.
 */
public enum IkariaSoundCategory {
    RADIO("radio", "options.ikariasound.radio", Set.of()),
    MELODIES("melodies", "options.ikariasound.melodies", Set.of("immersive_melodies")),
    HORNS("horns", "options.ikariasound.horns", Set.of()),
    JUKEBOX("jukebox", "options.ikariasound.jukebox", Set.of()),
    WHISTLES("whistles", "options.ikariasound.whistles", Set.of("bellsandwhistles")),
    CANNONS("cannons", "options.ikariasound.cannons", Set.of("createbigcannons")),
    GUNS(
            "guns",
            "options.ikariasound.guns",
            Set.of("ntgl", "cgs", "create_gunsmithing", "creategunsmithing")
    ),
    SHIPS(
            "ships",
            "options.ikariasound.ships",
            Set.of(
                    "aeronautics",
                    "simulated",
                    "sable",
                    "clockwork",
                    "vs_clockwork",
                    "create_aeronautics",
                    "createaeronautics",
                    "aeronauticsdiscovery",
                    "create_aeronautics_discovery",
                    "create_hostile_skies",
                    "createhostileskies",
                    "sky_whale_ship",
                    "skywhaleship"
            )
    ),
    CREATE("create", "options.ikariasound.create", Set.of("create")),
    EMOTES("emotes", "options.ikariasound.emotes", Set.of("emotecraft")),
    SUPPS("supps", "options.ikariasound.supps", Set.of("supplementaries", "amendments")),
    PARAGLIDERS("paragliders", "options.ikariasound.paragliders", Set.of("paraglider", "paragliders"));

    private final String configId;
    private final String optionKey;
    private final Set<String> namespaces;

    IkariaSoundCategory(String configId, String optionKey, Set<String> namespaces) {
        this.configId = configId;
        this.optionKey = optionKey;
        this.namespaces = namespaces;
    }

    public String configId() {
        return configId;
    }

    public String optionKey() {
        return optionKey;
    }

    public boolean hasVanillaSlider() {
        return this != RADIO;
    }

    public boolean matchesNamespace(String namespace) {
        return !namespaces.isEmpty() && namespaces.contains(namespace.toLowerCase(Locale.ROOT));
    }

    /**
     * Music &amp; Sounds sliders, more-specific namespaces first so Create does not swallow cannons/guns/ships.
     */
    public static IkariaSoundCategory[] sliderCategories() {
        return new IkariaSoundCategory[]{
                MELODIES, HORNS, JUKEBOX, WHISTLES, CANNONS, GUNS, SHIPS, CREATE, EMOTES, SUPPS, PARAGLIDERS
        };
    }
}
