package me.ikaria.sound.client;

import me.ikaria.sound.IkariaSoundCategory;
import me.ikaria.sound.IkariaSoundConfig;
import me.ikaria.sound.IkariaSoundControl;
import net.minecraft.client.OptionInstance;
import net.minecraft.network.chat.CommonComponents;
import net.minecraft.network.chat.Component;

public final class IkariaSoundOptions {
    private IkariaSoundOptions() {
    }

    public static OptionInstance<Double> melodies() {
        return volumeSlider("options.ikariasound.melodies", IkariaSoundCategory.MELODIES);
    }

    public static OptionInstance<Double> horns() {
        return volumeSlider("options.ikariasound.horns", IkariaSoundCategory.HORNS);
    }

    public static OptionInstance<Double> jukebox() {
        return volumeSlider("options.ikariasound.jukebox", IkariaSoundCategory.JUKEBOX);
    }

    public static OptionInstance<Boolean> streamerMode() {
        return OptionInstance.createBoolean(
                "options.ikariasound.streamer_mode",
                OptionInstance.cachedConstantTooltip(Component.translatable("options.ikariasound.streamer_mode.tooltip")),
                IkariaSoundConfig.STREAMER_MODE.get(),
                IkariaSoundControl::setStreamerMode
        );
    }

    private static OptionInstance<Double> volumeSlider(String key, IkariaSoundCategory category) {
        return new OptionInstance<>(
                key,
                OptionInstance.noTooltip(),
                IkariaSoundOptions::percentOrOff,
                OptionInstance.UnitDouble.INSTANCE,
                IkariaSoundControl.configuredVolume(category),
                value -> IkariaSoundControl.setCategoryVolume(category, value)
        );
    }

    private static Component percentOrOff(Component caption, Double value) {
        if (value == 0.0) {
            return Component.translatable("options.generic_value", caption, CommonComponents.OPTION_OFF);
        }
        return Component.translatable("options.percent_value", caption, (int) (value * 100.0));
    }
}
