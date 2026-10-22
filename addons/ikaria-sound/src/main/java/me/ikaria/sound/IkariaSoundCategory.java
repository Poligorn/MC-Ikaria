package me.ikaria.sound;

/**
 * Sound groups with an independent client slider.
 * {@link #RADIO} is the Simple Voice Chat category; Melodies and jukebox appear in Music &amp; Sounds.
 */
public enum IkariaSoundCategory {
    RADIO("radio", "options.ikariasound.radio"),
    MELODIES("melodies", "options.ikariasound.melodies"),
    JUKEBOX("jukebox", "options.ikariasound.jukebox");

    private final String configId;
    private final String optionKey;

    IkariaSoundCategory(String configId, String optionKey) {
        this.configId = configId;
        this.optionKey = optionKey;
    }

    public String configId() {
        return configId;
    }

    public String optionKey() {
        return optionKey;
    }

    public boolean hasVanillaSlider() {
        return this == MELODIES || this == JUKEBOX;
    }

    public static IkariaSoundCategory[] sliderCategories() {
        return new IkariaSoundCategory[]{MELODIES, JUKEBOX};
    }
}
