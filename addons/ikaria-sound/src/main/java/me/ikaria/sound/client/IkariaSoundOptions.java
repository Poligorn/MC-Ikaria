package me.ikaria.sound.client;

import me.ikaria.sound.IkariaSoundCategory;
import me.ikaria.sound.IkariaSoundConfig;
import me.ikaria.sound.IkariaSoundControl;
import net.minecraft.client.OptionInstance;
import net.minecraft.client.gui.components.OptionsList;
import net.minecraft.network.chat.CommonComponents;
import net.minecraft.network.chat.Component;

public final class IkariaSoundOptions {
    private IkariaSoundOptions() {
    }

    public static void addTo(OptionsList list) {
        OptionInstance<?> melodies = volumeSlider(IkariaSoundCategory.MELODIES);
        OptionInstance<?> horns = volumeSlider(IkariaSoundCategory.HORNS);
        OptionInstance<?> jukebox = volumeSlider(IkariaSoundCategory.JUKEBOX);
        list.addSmall(melodies, horns);
        list.addSmall(jukebox, streamerMode());

        IkariaSoundCategory[] extras = {
                IkariaSoundCategory.WHISTLES,
                IkariaSoundCategory.CANNONS,
                IkariaSoundCategory.GUNS,
                IkariaSoundCategory.SHIPS,
                IkariaSoundCategory.CREATE,
                IkariaSoundCategory.EMOTES,
                IkariaSoundCategory.SUPPS,
                IkariaSoundCategory.PARAGLIDERS
        };
        for (int i = 0; i < extras.length; i += 2) {
            list.addSmall(volumeSlider(extras[i]), volumeSlider(extras[i + 1]));
        }
    }

    public static OptionInstance<Boolean> streamerMode() {
        return OptionInstance.createBoolean(
                "options.ikariasound.streamer_mode",
                OptionInstance.cachedConstantTooltip(
                        Component.translatable("options.ikariasound.streamer_mode.tooltip")
                ),
                IkariaSoundConfig.STREAMER_MODE.get(),
                IkariaSoundControl::setStreamerMode
        );
    }

    private static OptionInstance<Double> volumeSlider(IkariaSoundCategory category) {
        return new OptionInstance<>(
                category.optionKey(),
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
