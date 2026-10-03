import React, { useState, useEffect, useRef } from 'react';
import { useAudio } from '../context/AudioContext';
import { fetchLyricsFromAPI } from '../services/api';
import { LuMic, LuMusic2, LuX } from 'react-icons/lu';
export default function LyricsDrawer({ isOpen, onClose }) {
    const { currentSong, currentTime, seekTo } = useAudio();
    const [lyricsData, setLyricsData] = useState(null);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);
    const activeLineRef = useRef(null);

    // Fetch lyrics when song changes or drawer opens
    useEffect(() => {
        if (!isOpen || !currentSong) return;

        let isMounted = true;
        async function loadLyrics() {
            setLoading(true);
            const data = await fetchLyricsFromAPI(
                currentSong.artist,
                currentSong.title,
            );
            if (isMounted) {
                setLyricsData(data);
                setLoading(false);
            }
        }
        loadLyrics();

        return () => {
            isMounted = false;
        };
    }, [isOpen, currentSong]);

    // Parse synced lyrics if available
    const parsedLines = React.useMemo(() => {
        if (!lyricsData || !lyricsData.syncedLyrics) return null;
        const raw = lyricsData.syncedLyrics.split('\n').filter((l) => l.trim());
        const parsed = [];
        for (const line of raw) {
            const match = line.match(/^\[(\d+):(\d+)(?:[.,](\d+))?\](.*)/);
            if (match) {
                const m = parseInt(match[1], 10);
                const s = parseInt(match[2], 10);
                let ms = match[3] ? parseInt(match[3], 10) : 0;
                if (match[3] && match[3].length === 2) ms *= 10;
                const time = m * 60 + s + ms / 1000;
                parsed.push({ time, text: match[4].trim() });
            }
        }
        return parsed.length > 0 ? parsed : null;
    }, [lyricsData]);

    // Active line calculation
    const activeIndex = React.useMemo(() => {
        if (!parsedLines) return -1;
        let idx = -1;
        for (let i = 0; i < parsedLines.length; i++) {
            if (currentTime >= parsedLines[i].time) {
                idx = i;
            }
        }
        return idx;
    }, [parsedLines, currentTime]);

    // Auto-scroll active line into center
    useEffect(() => {
        if (activeLineRef.current && scrollRef.current) {
            activeLineRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [activeIndex]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <aside className="animate-fadeSlideUp fixed top-0 right-0 z-50 flex h-screen w-full max-w-md flex-col border-l border-line-strong/30 bg-raised shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-line/60 p-5">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary-container/30 bg-primary-container/10 text-primary-container">
                            <LuMic className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="font-display text-sm font-bold text-white">
                                Lyrics
                            </h3>
                            <p className="max-w-[240px] truncate text-xs text-on-surface-variant">
                                {currentSong?.title} — {currentSong?.artist}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-chip text-on-surface-variant transition-colors hover:text-white"
                    >
                        <LuX className="h-4 w-4" />
                    </button>
                </div>

                {/* Content */}
                <div
                    ref={scrollRef}
                    className="flex flex-1 flex-col gap-4 overflow-y-auto p-6"
                >
                    {loading ? (
                        <div className="flex h-64 flex-col items-center justify-center gap-3 text-text-muted">
                            <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary-container border-t-transparent" />
                            <p className="font-mono text-xs">
                                Searching lyrics database...
                            </p>
                        </div>
                    ) : parsedLines ? (
                        <div className="flex flex-col gap-3 py-10">
                            {parsedLines.map((line, idx) => {
                                const isActive = idx === activeIndex;
                                return (
                                    <p
                                        key={idx}
                                        ref={isActive ? activeLineRef : null}
                                        onClick={() => seekTo(line.time)}
                                        className={`cursor-pointer rounded-lg px-3 py-1.5 font-display text-lg font-bold transition-all duration-200 md:text-xl ${
                                            isActive
                                                ? 'scale-[1.02] bg-primary-container/10 text-primary-container shadow-[0_0_12px_var(--accent-glow)]'
                                                : 'text-white/40 hover:bg-white/5 hover:text-white/80'
                                        }`}
                                    >
                                        {line.text || '♪ ♪ ♪'}
                                    </p>
                                );
                            })}
                        </div>
                    ) : lyricsData && lyricsData.plainLyrics ? (
                        <div className="text-sm leading-relaxed font-medium whitespace-pre-line text-white/80 md:text-base">
                            {lyricsData.plainLyrics}
                        </div>
                    ) : (
                        <div className="flex h-64 flex-col items-center justify-center gap-2 text-center text-text-muted">
                            <LuMusic2 className="h-10 w-10 opacity-30" />
                            <p className="text-sm font-semibold text-white/70">
                                No synchronized lyrics available
                            </p>
                            <p className="max-w-xs text-xs text-on-surface-variant">
                                Lyrics could not be found for this track. You
                                can still enjoy the lossless audio playback.
                            </p>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
