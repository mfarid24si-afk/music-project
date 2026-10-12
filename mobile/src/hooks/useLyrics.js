import { useEffect, useMemo, useState } from 'react';
import { fetchLyricsFromAPI } from '../services/api';

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

export function useLyrics(song, time) {
    const [lyricsData, setLyricsData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!song) {
            setLyricsData(null);
            return undefined;
        }

        let isCancelled = false;
        setLoading(true);
        void fetchLyricsFromAPI(song.artist, song.title).then((data) => {
            if (!isCancelled) {
                setLyricsData(data);
                setLoading(false);
            }
        });

        return () => {
            isCancelled = true;
        };
    }, [song?.id]);

    const lines = useMemo(
        () => parseSyncedLyrics(lyricsData?.syncedLyrics),
        [lyricsData],
    );
    const activeIndex = useMemo(
        () => findActiveLyricIndex(lines, time),
        [lines, time],
    );

    return { lyricsData, loading, lines, activeIndex };
}
