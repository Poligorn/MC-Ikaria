package me.ikaria.sound.client;

import me.ikaria.sound.IkariaSoundCategory;
import me.ikaria.sound.IkariaSoundControl;
import net.minecraft.client.OptionInstance;
import net.minecraft.client.gui.components.OptionsList;
import net.minecraft.network.chat.CommonComponents;
import net.minecraft.network.chat.Component;

public final class IkariaSoundOptions {
    private IkariaSoundOptions() {
    }

    public static void addTo(OptionsList list) {
        list.addSmall(volumeSlider(IkariaSoundCategory.MELODIES), volumeSlider(IkariaSoundCategory.JUKEBOX));
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
