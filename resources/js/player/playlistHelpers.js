import {
    LuAudioLines,
    LuCoffee,
    LuDisc3,
    LuFlame,
    LuFlower2,
    LuGem,
    LuGuitar,
    LuHeadphones,
    LuMoon,
    LuOrbit,
    LuPiano,
    LuRocket,
    LuSparkles,
    LuWaves,
    LuZap,
} from 'react-icons/lu';

export const DEFAULT_PLAYLIST_ICON = 'headphones';

// Vector replacements for the legacy emoji set. Stored on the same
// `emoji` field so existing playlists keep working - the value is now
// an icon id, with legacy emoji values mapped back on read.
export const PLAYLIST_ICON_OPTIONS = [
    { id: 'headphones', label: 'Headphones', Icon: LuHeadphones },
    { id: 'audio-lines', label: 'Sound Waves', Icon: LuAudioLines },
    { id: 'flame', label: 'On Fire', Icon: LuFlame },
    { id: 'moon', label: 'Late Night', Icon: LuMoon },
    { id: 'coffee', label: 'Coffee Break', Icon: LuCoffee },
    { id: 'zap', label: 'High Energy', Icon: LuZap },
    { id: 'gem', label: 'Precious', Icon: LuGem },
    { id: 'waves', label: 'Ocean', Icon: LuWaves },
    { id: 'flower', label: 'Blossom', Icon: LuFlower2 },
    { id: 'rocket', label: 'Launch', Icon: LuRocket },
    { id: 'disc', label: 'Vinyl', Icon: LuDisc3 },
    { id: 'guitar', label: 'Guitar', Icon: LuGuitar },
    { id: 'piano', label: 'Piano', Icon: LuPiano },
    { id: 'sparkles', label: 'Sparkle', Icon: LuSparkles },
    { id: 'orbit', label: 'Cosmic', Icon: LuOrbit },
];

const LEGACY_EMOJI_TO_ICON_ID = {
    '🎧': 'headphones',
    '🔥': 'flame',
    '🌙': 'moon',
    '☕': 'coffee',
    '⚡': 'zap',
    '💎': 'gem',
    '🌊': 'waves',
    '🌸': 'flower',
    '🚀': 'rocket',
    '💿': 'disc',
    '🎸': 'guitar',
    '🎹': 'piano',
    '✨': 'sparkles',
    '🪐': 'orbit',
};

export function resolvePlaylistIconId(value) {
    if (!value) {
        return DEFAULT_PLAYLIST_ICON;
    }
    if (PLAYLIST_ICON_OPTIONS.some((option) => option.id === value)) {
        return value;
    }
    return LEGACY_EMOJI_TO_ICON_ID[value] || DEFAULT_PLAYLIST_ICON;
}

export function getPlaylistIconDefinition(value) {
    const id = resolvePlaylistIconId(value);
    return (
        PLAYLIST_ICON_OPTIONS.find((option) => option.id === id) ||
        PLAYLIST_ICON_OPTIONS[0]
    );
}

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
