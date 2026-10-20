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
    /** Matches {@code RadioScreen} image size / volume strip. */
    private static final int RADIO_IMAGE_WIDTH = 256;
    private static final int RADIO_IMAGE_HEIGHT = 248;
    private static final int RADIO_MARGIN = 8;
    private static final int RADIO_VOL_Y = 194;
    private static final int RADIO_VOL_W = 230;
    private static final int BUTTON_H = 14;
    // Same ARGB values as RadioScreen.drawStyledButton.
    private static final int COL_ACCENT = 0xFFB26430;
    private static final int COL_BTN_BORDER = 0xFF695A20;
    private static final int COL_BTN_BG = 0xFF3E3828;
    private static final int COL_BTN_BG_HOVER = 0xFF695A20;
    private static final int COL_TOP = 0xFF504828;
    private static final int COL_TOP_HOVER = 0xFF9A8430;
    private static final int COL_TEXT = 0xFFE8DCC8;
    private static final int COL_TEXT_DIM = 0xFF8A7E60;
    private static final int COL_TEXT_ON = 0xFFFF5555;

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
        RadioStreamerButton button = radioStreamerButton(event.getScreen());
        boolean hovered = button.contains(event.getMouseX(), event.getMouseY());
        boolean on = IkariaSoundControl.isStreamerMode();
        GuiGraphics gfx = event.getGuiGraphics();
        gfx.fill(button.x - 1, button.y - 1, button.x + button.w + 1, button.y + button.h + 1,
                hovered ? COL_ACCENT : COL_BTN_BORDER);
        gfx.fill(button.x, button.y, button.x + button.w, button.y + button.h,
                hovered ? COL_BTN_BG_HOVER : COL_BTN_BG);
        gfx.fill(button.x, button.y, button.x + button.w, button.y + 1,
                hovered ? COL_TOP_HOVER : COL_TOP);
        int textColor = on ? COL_TEXT_ON : (hovered ? COL_TEXT : COL_TEXT_DIM);
        gfx.drawCenteredString(
                event.getScreen().getMinecraft().font,
                button.label,
                button.x + button.w / 2,
                button.y + 3,
                textColor
        );
    }

    @SubscribeEvent
    public static void onRadioScreenClick(ScreenEvent.MouseButtonPressed.Pre event) {
        if (event.getButton() != GLFW.GLFW_MOUSE_BUTTON_LEFT || !isRadioScreen(event.getScreen())) {
            return;
        }
        if (!radioStreamerButton(event.getScreen()).contains(event.getMouseX(), event.getMouseY())) {
            return;
        }
        IkariaSoundControl.toggleStreamerMode();
        event.setCanceled(true);
    }

    private static boolean isRadioScreen(Screen screen) {
        return RADIO_SCREEN.equals(screen.getClass().getName());
    }

    /**
     * Same origin as {@code AbstractContainerScreen.leftPos/topPos}: centered panel in scaled GUI pixels.
     */
    private static RadioStreamerButton radioStreamerButton(Screen screen) {
        Font font = screen.getMinecraft().font;
        boolean on = IkariaSoundControl.isStreamerMode();
        Component label = Component.translatable(
                on ? "gui.ikariasound.radio_streamer_on" : "gui.ikariasound.radio_streamer_off"
        );
        int left = (screen.width - RADIO_IMAGE_WIDTH) / 2;
        int top = (screen.height - RADIO_IMAGE_HEIGHT) / 2;
        int stripX = left + RADIO_MARGIN;
        int stripY = top + RADIO_VOL_Y;
        int width = Math.max(72, font.width(label) + 10);
        int x = stripX + RADIO_VOL_W - width;
        int y = stripY + 6;
        return new RadioStreamerButton(x, y, width, BUTTON_H, label);
    }

    private record RadioStreamerButton(int x, int y, int w, int h, Component label) {
        boolean contains(double mx, double my) {
            return mx >= x && mx < x + w && my >= y && my < y + h;
        }
    }
}
