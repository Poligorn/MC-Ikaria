package me.ikaria.sound;

import me.ikaria.sound.client.IkariaSoundClient;
import net.neoforged.api.distmarker.Dist;
import net.neoforged.bus.api.IEventBus;
import net.neoforged.fml.ModContainer;
import net.neoforged.fml.common.Mod;
import net.neoforged.fml.config.ModConfig;
import net.neoforged.fml.loading.FMLEnvironment;
import net.neoforged.neoforge.common.NeoForge;

@Mod(IkariaSoundMod.MODID)
public class IkariaSoundMod {
    public static final String MODID = "ikariasound";
    public static final String SVC_RADIO_CATEGORY = "live_radio";

    public IkariaSoundMod(IEventBus modEventBus, ModContainer container) {
        container.registerConfig(ModConfig.Type.CLIENT, IkariaSoundConfig.SPEC);
        if (FMLEnvironment.dist == Dist.CLIENT) {
            IkariaSoundClient.register(modEventBus);
            NeoForge.EVENT_BUS.register(IkariaSoundClient.class);
        }
    }
}
