package me.ikaria.radiovolume;

import me.ikaria.radiovolume.client.RadioVolumeClient;
import net.neoforged.api.distmarker.Dist;
import net.neoforged.bus.api.IEventBus;
import net.neoforged.fml.ModContainer;
import net.neoforged.fml.common.Mod;
import net.neoforged.fml.config.ModConfig;
import net.neoforged.fml.loading.FMLEnvironment;
import net.neoforged.neoforge.common.NeoForge;

@Mod(RadioVolumeMod.MODID)
public class RadioVolumeMod {
    public static final String MODID = "radiovolume";
    public static final String SVC_CATEGORY_ID = "live_radio";

    public RadioVolumeMod(IEventBus modEventBus, ModContainer container) {
        container.registerConfig(ModConfig.Type.CLIENT, RadioVolumeConfig.SPEC);
        if (FMLEnvironment.dist == Dist.CLIENT) {
            RadioVolumeClient.register(modEventBus);
            NeoForge.EVENT_BUS.register(RadioVolumeClient.class);
        }
    }
}
