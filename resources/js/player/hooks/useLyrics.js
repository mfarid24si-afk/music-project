import { useEffect, useMemo, useState } from 'react';
import { findActiveLyricIndex, parseSyncedLyrics } from '../lyrics';
import { fetchLyricsFromAPI } from '../services/api';

export function useLyrics(song, time, enabled = true) {
    const [lyricsData, setLyricsData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!enabled || !song) return undefined;

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
    }, [song?.id, enabled]);

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
