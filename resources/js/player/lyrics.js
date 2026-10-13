export function parseSyncedLyrics(syncedLyrics) {
    if (!syncedLyrics) return null;
    const lines = [];
    for (const rawLine of syncedLyrics.split('\n')) {
        if (!rawLine.trim()) continue;
        const match = rawLine.match(/^\[(\d+):(\d+)(?:[.,](\d+))?\](.*)/);
        if (!match) continue;
        const m = parseInt(match[1], 10);
        const s = parseInt(match[2], 10);
        let ms = match[3] ? parseInt(match[3], 10) : 0;
        if (match[3] && match[3].length === 2) {
            ms *= 10;
        }
        lines.push({ time: m * 60 + s + ms / 1000, text: match[4].trim() });
    }
    return lines.length > 0 ? lines : null;
}

export function findActiveLyricIndex(lines, time) {
    if (!lines) return -1;
    let idx = -1;
    for (let i = 0; i < lines.length; i++) {
        if (time >= lines[i].time) {
            idx = i;
        }
    }
    return idx;
}

// Converts a track length ("3:24", "1:02:03" or a number of seconds) into
// whole seconds so lyrics can be matched to the exact recording version.
export function durationToSeconds(value) {
    if (typeof value === 'number') {
        return Number.isFinite(value) && value > 0 ? Math.round(value) : null;
    }
    if (typeof value !== 'string') {
        return null;
    }
    const parts = value.trim().split(':').map(Number);
    if (parts.length === 0 || parts.some((n) => !Number.isFinite(n))) {
        return null;
    }
    if (parts.length === 2) {
        return Math.round(parts[0] * 60 + parts[1]);
    }
    if (parts.length === 3) {
        return Math.round(parts[0] * 3600 + parts[1] * 60 + parts[2]);
    }
    return null;
}
