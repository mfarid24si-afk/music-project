export const API_BASE_URL = 'https://farid-peminjaman.alwaysdata.net/api';
export const APP_BASE_URL = 'https://farid-peminjaman.alwaysdata.net';

export const THEMES = [
    { id: 'default', color: '#ccf228', name: 'Acid Lime' },
    { id: 'purple', color: '#a855f7', name: 'Electric Violet' },
    { id: 'blue', color: '#3b82f6', name: 'Deep Cobalt' },
    { id: 'cyberpunk', color: '#ec4899', name: 'Hot Pink' },
    { id: 'sunset', color: '#f97316', name: 'Safety Amber' },
    { id: 'ocean', color: '#06b6d4', name: 'Cyan Laser' },
];

export const THEME = {
    bg: '#0d0e11',
    surface: '#17181c',
    elevated: '#202227',
    accent: '#ccf228',
    accentGlow: 'rgba(204, 242, 40, 0.25)',
    textMain: '#ffffff',
    textMuted: '#9a9ca6',
    border: 'rgba(255, 255, 255, 0.08)',
    borderAccent: 'rgba(204, 242, 40, 0.35)',
    danger: '#ef4444',
};

// --- Material Design 3 tokens -------------------------------------------------

// MD3 spacing scale (4dp grid)
export const space = {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
};

// MD3 shape / corner radii
export const shape = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 28,
    full: 999,
};

// MD3 typographic scale
export const font = {
    displaySmall: {
        fontSize: 36,
        lineHeight: 44,
        fontWeight: '400',
        letterSpacing: 0,
    },
    headlineSmall: {
        fontSize: 24,
        lineHeight: 32,
        fontWeight: '400',
        letterSpacing: 0,
    },
    titleLarge: {
        fontSize: 22,
        lineHeight: 28,
        fontWeight: '500',
        letterSpacing: 0,
    },
    titleMedium: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '600',
        letterSpacing: 0.15,
    },
    titleSmall: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '600',
        letterSpacing: 0.1,
    },
    bodyLarge: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '400',
        letterSpacing: 0.5,
    },
    bodyMedium: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '400',
        letterSpacing: 0.25,
    },
    bodySmall: {
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '400',
        letterSpacing: 0.4,
    },
    labelLarge: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '600',
        letterSpacing: 0.1,
    },
    labelMedium: {
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '500',
        letterSpacing: 0.5,
    },
    labelSmall: {
        fontSize: 11,
        lineHeight: 16,
        fontWeight: '500',
        letterSpacing: 0.5,
    },
};

// MD3 elevation levels (0-5)
export const elevation = {
    0: {},
    1: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.18,
        shadowRadius: 2,
        elevation: 1,
    },
    2: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.22,
        shadowRadius: 4,
        elevation: 3,
    },
    3: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 8,
        elevation: 6,
    },
    4: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.32,
        shadowRadius: 12,
        elevation: 8,
    },
    5: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.36,
        shadowRadius: 16,
        elevation: 12,
    },
};

// MD3 minimum touch target (48dp)
export const touchTarget = {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
};

// Android ripple presets for Touchable/Pressable feedback
export const ripple = {
    bounded: (color = 'rgba(255, 255, 255, 0.12)') => ({
        color,
        borderless: false,
    }),
    borderless: (color = 'rgba(255, 255, 255, 0.16)', radius = 24) => ({
        color,
        borderless: true,
        radius,
    }),
};
