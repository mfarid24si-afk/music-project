export const EMOJI_OPTIONS = [
    '🎧',
    '🔥',
    '🌙',
    '☕',
    '⚡',
    '💎',
    '🌊',
    '🌸',
    '🚀',
    '💿',
    '🎸',
    '🎹',
    '✨',
    '🪐',
];

export const GRADIENT_PRESETS = [
    {
        id: 'default',
        name: 'Acid Lime',
        class: 'from-primary-container/25 via-raised to-canvas',
        border: 'border-primary-container/30',
        color: '#ccf228',
    },
    {
        id: 'purple',
        name: 'Violet',
        class: 'from-primary-container/25 via-raised to-canvas',
        border: 'border-primary-container/30',
        color: '#a855f7',
    },
    {
        id: 'pink',
        name: 'Hot Pink',
        class: 'from-primary-container/25 via-raised to-canvas',
        border: 'border-primary-container/30',
        color: '#ec4899',
    },
    {
        id: 'sunset',
        name: 'Amber',
        class: 'from-primary-container/25 via-raised to-canvas',
        border: 'border-primary-container/30',
        color: '#f97316',
    },
    {
        id: 'ocean',
        name: 'Cyan',
        class: 'from-primary-container/25 via-raised to-canvas',
        border: 'border-primary-container/30',
        color: '#06b6d4',
    },
    {
        id: 'slate',
        name: 'Cobalt',
        class: 'from-primary-container/25 via-raised to-canvas',
        border: 'border-primary-container/30',
        color: '#3b82f6',
    },
];

export function parseDurationToSeconds(str) {
    if (!str) return 210;
    const parts = str.split(':').map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return parts[0] * 60 + parts[1];
    }
    if (
        parts.length === 3 &&
        !isNaN(parts[0]) &&
        !isNaN(parts[1]) &&
        !isNaN(parts[2])
    ) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 210;
}

export function formatTotalDuration(seconds) {
    if (!seconds || seconds <= 0) return '0 min';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
        return `${hrs} hr ${mins} min`;
    }
    return `${mins} min ${secs > 0 ? `${secs} sec` : ''}`;
}
