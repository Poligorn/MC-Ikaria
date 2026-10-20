package me.ikaria.sound.client;

import com.mojang.blaze3d.platform.InputConstants;
import me.ikaria.sound.IkariaSoundControl;
import net.minecraft.client.KeyMapping;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.GuiGraphics;
import net.minecraft.client.resources.sounds.SoundInstance;
import net.minecraft.network.chat.Component;
import net.neoforged.bus.api.IEventBus;
import net.neoforged.bus.api.SubscribeEvent;
import net.neoforged.neoforge.client.event.ClientTickEvent;
import net.neoforged.neoforge.client.event.RegisterKeyMappingsEvent;
import net.neoforged.neoforge.client.event.RenderGuiEvent;
import net.neoforged.neoforge.client.event.sound.PlaySoundEvent;
import org.lwjgl.glfw.GLFW;

public final class IkariaSoundClient {
    public static final KeyMapping STREAMER_MODE_KEY = new KeyMapping(
            "key.ikariasound.streamer_mode",
            InputConstants.Type.KEYSYM,
            GLFW.GLFW_KEY_UNKNOWN,
            "key.categories.ikariasound"
    );

    private IkariaSoundClient() {
    }

    public static void register(IEventBus modEventBus) {
        modEventBus.addListener(IkariaSoundClient::onRegisterKeys);
    }

    private static void onRegisterKeys(RegisterKeyMappingsEvent event) {
        event.register(STREAMER_MODE_KEY);
    }

    @SubscribeEvent
    public static void onClientTick(ClientTickEvent.Post event) {
        IkariaSoundControl.clientTick();
        while (STREAMER_MODE_KEY.consumeClick()) {
            IkariaSoundControl.toggleStreamerMode();
            Minecraft mc = Minecraft.getInstance();
            if (mc.player != null) {
                mc.player.displayClientMessage(
                        Component.translatable(
                                IkariaSoundControl.isStreamerMode()
                                        ? "message.ikariasound.streamer_on"
                                        : "message.ikariasound.streamer_off"
                        ),
                        true
                );
            }
        }
    }

    @SubscribeEvent
    public static void onPlaySound(PlaySoundEvent event) {
        SoundInstance sound = event.getSound();
        if (sound != null && IkariaSoundControl.extraMultiplier(sound) <= 0.0f) {
            event.setSound(null);
        }
    }

    @SubscribeEvent
    public static void onRenderGui(RenderGuiEvent.Post event) {
        if (!IkariaSoundControl.isStreamerMode()) {
            return;
        }
        Minecraft mc = Minecraft.getInstance();
        if (mc.options.hideGui) {
            return;
        }
        GuiGraphics graphics = event.getGuiGraphics();
        Component label = Component.translatable("hud.ikariasound.muted");
        int width = mc.font.width(label);
        int x = 4;
        int y = mc.getWindow().getGuiScaledHeight() - 38;
        graphics.fill(x - 2, y - 2, x + width + 2, y + 10, 0xAA000000);
        graphics.drawString(mc.font, label, x, y, 0xFFFF5555, false);
    }
}
