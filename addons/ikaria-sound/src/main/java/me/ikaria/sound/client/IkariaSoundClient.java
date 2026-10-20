package me.ikaria.sound.client;

import com.mojang.blaze3d.platform.InputConstants;
import me.ikaria.sound.IkariaSoundControl;
import net.minecraft.client.KeyMapping;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.Font;
import net.minecraft.client.gui.GuiGraphics;
import net.minecraft.client.gui.screens.Screen;
import net.minecraft.client.resources.sounds.SoundInstance;
import net.minecraft.network.chat.Component;
import net.neoforged.bus.api.IEventBus;
import net.neoforged.bus.api.SubscribeEvent;
import net.neoforged.neoforge.client.event.ClientTickEvent;
import net.neoforged.neoforge.client.event.RegisterKeyMappingsEvent;
import net.neoforged.neoforge.client.event.RenderGuiEvent;
import net.neoforged.neoforge.client.event.ScreenEvent;
import net.neoforged.neoforge.client.event.sound.PlaySoundEvent;
import org.lwjgl.glfw.GLFW;

public final class IkariaSoundClient {
    private static final String RADIO_SCREEN = "com.radiomod.screen.RadioScreen";
    private static final int RADIO_IMAGE_WIDTH = 256;
    private static final int RADIO_IMAGE_HEIGHT = 248;
    private static final int BUTTON_W = 88;
    private static final int BUTTON_H = 16;
    private static final int BUTTON_X_OFF = RADIO_IMAGE_WIDTH - 8 - BUTTON_W;
    private static final int BUTTON_Y_OFF = 6;

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

    @SubscribeEvent
    public static void onRadioScreenRender(ScreenEvent.Render.Post event) {
        if (!isRadioScreen(event.getScreen())) {
            return;
        }
        Screen screen = event.getScreen();
        int left = radioLeft(screen);
        int top = radioTop(screen);
        int bx = left + BUTTON_X_OFF;
        int by = top + BUTTON_Y_OFF;
        boolean hovered = inButton(event.getMouseX(), event.getMouseY(), screen);
        boolean muted = IkariaSoundControl.isStreamerMode();
        int border = hovered ? 0xFFB25A30 : 0xFF694A20;
        int fill = muted ? 0xFF6B1C1C : 0xFF3D3328;
        GuiGraphics gfx = event.getGuiGraphics();
        gfx.fill(bx - 1, by - 1, bx + BUTTON_W + 1, by + BUTTON_H + 1, border);
        gfx.fill(bx, by, bx + BUTTON_W, by + BUTTON_H, fill);
        Component label = Component.translatable(
                muted ? "gui.ikariasound.radio_streamer_on" : "gui.ikariasound.radio_streamer_off"
        );
        Font font = screen.getMinecraft().font;
        gfx.drawCenteredString(font, label, bx + BUTTON_W / 2, by + 4, muted ? 0xFFFF5555 : 0xFFE8D4A8);
        if (muted) {
            gfx.drawString(
                    font,
                    Component.translatable("gui.ikariasound.radio_streamer_hint"),
                    left + 10,
                    top + 196,
                    0xFFFF5555,
                    false
            );
        }
    }

    @SubscribeEvent
    public static void onRadioScreenClick(ScreenEvent.MouseButtonPressed.Pre event) {
        if (event.getButton() != GLFW.GLFW_MOUSE_BUTTON_LEFT || !isRadioScreen(event.getScreen())) {
            return;
        }
        if (!inButton(event.getMouseX(), event.getMouseY(), event.getScreen())) {
            return;
        }
        IkariaSoundControl.toggleStreamerMode();
        event.setCanceled(true);
    }

    private static boolean isRadioScreen(Screen screen) {
        return RADIO_SCREEN.equals(screen.getClass().getName());
    }

    private static int radioLeft(Screen screen) {
        return (screen.width - RADIO_IMAGE_WIDTH) / 2;
    }

    private static int radioTop(Screen screen) {
        return (screen.height - RADIO_IMAGE_HEIGHT) / 2;
    }

    private static boolean inButton(double mx, double my, Screen screen) {
        int bx = radioLeft(screen) + BUTTON_X_OFF;
        int by = radioTop(screen) + BUTTON_Y_OFF;
        return mx >= bx && mx < bx + BUTTON_W && my >= by && my < by + BUTTON_H;
    }
}
