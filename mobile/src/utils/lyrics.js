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
