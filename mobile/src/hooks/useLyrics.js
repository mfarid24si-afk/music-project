import { useEffect, useMemo, useState } from 'react';
import { fetchLyricsFromAPI } from '../services/api';
import { findActiveLyricIndex, parseSyncedLyrics } from '../utils/lyrics';

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
        void fetchLyricsFromAPI(song.artist, song.title, song.duration).then(
            (data) => {
                if (!isCancelled) {
                    setLyricsData(data);
                    setLoading(false);
                }
            },
        );

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
