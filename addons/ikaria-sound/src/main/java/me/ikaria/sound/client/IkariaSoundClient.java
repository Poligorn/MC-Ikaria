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
    /** RadioScreen volume +/- buttons sit at volY + 22; keep a gap above them. */
    private static final int ICON = 12;
    private static final int ICON_Y_OFF = 2;
    private static final int HUD_ICON = 8;
    // Same ARGB values as RadioScreen.drawStyledButton.
    private static final int COL_ACCENT = 0xFFB26430;
    private static final int COL_BTN_BORDER = 0xFF695A20;
    private static final int COL_BTN_BG = 0xFF3E3828;
    private static final int COL_BTN_BG_HOVER = 0xFF695A20;
    private static final int COL_GLYPH = 0xFF8A7E60;
    private static final int COL_GLYPH_HOVER = 0xFFE8DCC8;
    private static final int COL_GLYPH_ON = 0xFFCC5555;
    private static final int COL_HUD = 0x88AA5555;

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
        if (mc.options.hideGui || isRadioScreen(mc.screen)) {
            return;
        }
        int x = 3;
        int y = mc.getWindow().getGuiScaledHeight() - 20;
        drawSpeaker(event.getGuiGraphics(), x, y, HUD_ICON, true, COL_HUD);
    }

    @SubscribeEvent
    public static void onRadioScreenRender(ScreenEvent.Render.Post event) {
        if (!isRadioScreen(event.getScreen())) {
            return;
        }
        Screen screen = event.getScreen();
        int x = radioIconX(screen);
        int y = radioIconY(screen);
        boolean hovered = inRadioIcon(event.getMouseX(), event.getMouseY(), screen);
        boolean on = IkariaSoundControl.isStreamerMode();
        GuiGraphics gfx = event.getGuiGraphics();
        gfx.fill(x - 1, y - 1, x + ICON + 1, y + ICON + 1, hovered ? COL_ACCENT : COL_BTN_BORDER);
        gfx.fill(x, y, x + ICON, y + ICON, hovered ? COL_BTN_BG_HOVER : COL_BTN_BG);
        int glyph = on ? COL_GLYPH_ON : (hovered ? COL_GLYPH_HOVER : COL_GLYPH);
        drawSpeaker(gfx, x + 1, y + 1, ICON - 2, on, glyph);
        if (hovered) {
            Component tip = Component.translatable(
                    on ? "gui.ikariasound.radio_streamer_on" : "gui.ikariasound.radio_streamer_off"
            );
            Font font = screen.getMinecraft().font;
            int tipX = x - 4 - font.width(tip);
            gfx.drawString(font, tip, tipX, y + 2, glyph, false);
        }
    }

    @SubscribeEvent
    public static void onRadioScreenClick(ScreenEvent.MouseButtonPressed.Pre event) {
        if (event.getButton() != GLFW.GLFW_MOUSE_BUTTON_LEFT || !isRadioScreen(event.getScreen())) {
            return;
        }
        if (!inRadioIcon(event.getMouseX(), event.getMouseY(), event.getScreen())) {
            return;
        }
        IkariaSoundControl.toggleStreamerMode();
        event.setCanceled(true);
    }

    private static boolean isRadioScreen(Screen screen) {
        return screen != null && RADIO_SCREEN.equals(screen.getClass().getName());
    }

    private static int radioLeft(Screen screen) {
        return (screen.width - RADIO_IMAGE_WIDTH) / 2;
    }

    private static int radioTop(Screen screen) {
        return (screen.height - RADIO_IMAGE_HEIGHT) / 2;
    }

    private static int radioIconX(Screen screen) {
        return radioLeft(screen) + RADIO_MARGIN + RADIO_VOL_W - ICON;
    }

    private static int radioIconY(Screen screen) {
        return radioTop(screen) + RADIO_VOL_Y + ICON_Y_OFF;
    }

    private static boolean inRadioIcon(double mx, double my, Screen screen) {
        int x = radioIconX(screen);
        int y = radioIconY(screen);
        return mx >= x && mx < x + ICON && my >= y && my < y + ICON;
    }

    private static void drawSpeaker(GuiGraphics gfx, int x, int y, int size, boolean muted, int color) {
        int s = Math.max(6, size);
        int bodyX1 = x + Math.max(1, s / 6);
        int bodyX2 = x + s / 2 - 1;
        int bodyY1 = y + s / 4;
        int bodyY2 = y + s - s / 4 - 1;
        gfx.fill(bodyX1, bodyY1, bodyX2 + 1, bodyY2 + 1, color);
        int hornX = bodyX2 + 1;
        gfx.fill(hornX, y + s / 6, hornX + Math.max(1, s / 8), y + s - s / 6, color);
        if (muted) {
            int x0 = x + 1;
            int y0 = y + 1;
            int x1 = x + s - 2;
            int y1 = y + s - 2;
            for (int i = 0; i <= s - 3; i++) {
                int px = x0 + i;
                int py = y0 + (i * (y1 - y0) + (s - 3) / 2) / Math.max(1, s - 3);
                gfx.fill(px, py, px + 1, py + 1, color);
            }
        } else {
            int wave = hornX + Math.max(2, s / 5);
            gfx.fill(wave, y + s / 3, wave + 1, y + s - s / 3, color);
            gfx.fill(wave + 2, y + s / 5, wave + 3, y + s - s / 5, color);
        }
    }
}
