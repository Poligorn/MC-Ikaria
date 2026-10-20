package me.ikaria.radiovolume.voicechat;

/**
 * 16x16 ARGB icon for the Simple Voice Chat volume category.
 * Drawn in-code so the addon does not ship Live Radio's textures.
 */
final class RadioCategoryIcon {
    private static final int TRANSPARENT = 0x00000000;
    private static final int WOOD = 0xFF6B3A1F;
    private static final int WOOD_DARK = 0xFF3A1E0E;
    private static final int BRASS = 0xFFC9A227;
    private static final int BRASS_DARK = 0xFF8A6A12;
    private static final int GRILLE = 0xFF241208;
    private static final int LED = 0xFFE23B2A;

    private RadioCategoryIcon() {
    }

    static int[][] create() {
        int[][] icon = new int[16][16];
        for (int x = 0; x < 16; x++) {
            for (int y = 0; y < 16; y++) {
                icon[x][y] = TRANSPARENT;
            }
        }

        fill(icon, 2, 5, 13, 14, WOOD);
        hline(icon, 2, 13, 5, WOOD_DARK);
        hline(icon, 2, 13, 14, WOOD_DARK);
        vline(icon, 2, 5, 14, WOOD_DARK);
        vline(icon, 13, 5, 14, WOOD_DARK);

        fill(icon, 4, 7, 11, 12, GRILLE);
        for (int x = 5; x <= 10; x += 2) {
            vline(icon, x, 8, 11, BRASS_DARK);
        }

        // Antenna
        icon[11][4] = BRASS;
        icon[12][3] = BRASS;
        icon[13][2] = BRASS;
        icon[14][1] = BRASS;
        icon[14][0] = LED;

        // Tuning knob
        icon[3][10] = BRASS;
        icon[3][11] = BRASS_DARK;
        return icon;
    }

    private static void fill(int[][] icon, int x0, int y0, int x1, int y1, int color) {
        for (int x = x0; x <= x1; x++) {
            for (int y = y0; y <= y1; y++) {
                icon[x][y] = color;
            }
        }
    }

    private static void hline(int[][] icon, int x0, int x1, int y, int color) {
        for (int x = x0; x <= x1; x++) {
            icon[x][y] = color;
        }
    }

    private static void vline(int[][] icon, int x, int y0, int y1, int color) {
        for (int y = y0; y <= y1; y++) {
            icon[x][y] = color;
        }
    }
}
