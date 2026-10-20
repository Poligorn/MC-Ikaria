package me.ikaria.radiovolume.client;

import com.mojang.blaze3d.platform.InputConstants;
import me.ikaria.radiovolume.RadioVolumeControl;
import net.minecraft.client.KeyMapping;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.GuiGraphics;
import net.minecraft.network.chat.Component;
import net.neoforged.bus.api.IEventBus;
import net.neoforged.bus.api.SubscribeEvent;
import net.neoforged.neoforge.client.event.ClientTickEvent;
import net.neoforged.neoforge.client.event.RegisterKeyMappingsEvent;
import net.neoforged.neoforge.client.event.RenderGuiEvent;
import org.lwjgl.glfw.GLFW;

public final class RadioVolumeClient {
    public static final KeyMapping STREAMER_MODE_KEY = new KeyMapping(
            "key.radiovolume.streamer_mode",
            InputConstants.Type.KEYSYM,
            GLFW.GLFW_KEY_UNKNOWN,
            "key.categories.radiovolume"
    );

    private RadioVolumeClient() {
    }

    public static void register(IEventBus modEventBus) {
        modEventBus.addListener(RadioVolumeClient::onRegisterKeys);
    }

    private static void onRegisterKeys(RegisterKeyMappingsEvent event) {
        event.register(STREAMER_MODE_KEY);
    }

    @SubscribeEvent
    public static void onClientTick(ClientTickEvent.Post event) {
        RadioVolumeControl.clientTick();
        while (STREAMER_MODE_KEY.consumeClick()) {
            RadioVolumeControl.toggleStreamerMode();
            Minecraft mc = Minecraft.getInstance();
            if (mc.player != null) {
                mc.player.displayClientMessage(
                        Component.translatable(
                                RadioVolumeControl.isStreamerMode()
                                        ? "message.radiovolume.streamer_on"
                                        : "message.radiovolume.streamer_off"
                        ),
                        true
                );
            }
        }
    }

    @SubscribeEvent
    public static void onRenderGui(RenderGuiEvent.Post event) {
        if (!RadioVolumeControl.isStreamerMode()) {
            return;
        }
        Minecraft mc = Minecraft.getInstance();
        if (mc.options.hideGui) {
            return;
        }
        GuiGraphics graphics = event.getGuiGraphics();
        Component label = Component.translatable("hud.radiovolume.muted");
        int width = mc.font.width(label);
        int x = 4;
        int y = mc.getWindow().getGuiScaledHeight() - 38;
        graphics.fill(x - 2, y - 2, x + width + 2, y + 10, 0xAA000000);
        graphics.drawString(mc.font, label, x, y, 0xFFFF5555, false);
    }
}
