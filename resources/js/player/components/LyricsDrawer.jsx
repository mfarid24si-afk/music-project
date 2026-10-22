import React, { useEffect, useRef } from 'react';
import { useAudio } from '../context/AudioContext';
import { useLyrics } from '../hooks/useLyrics';
import { useDialogA11y } from '../hooks/useDialogA11y';
import { LuMic, LuMusic2, LuX } from 'react-icons/lu';
export default function LyricsDrawer({ isOpen, onClose }) {
    const { currentSong, currentTime, seekTo } = useAudio();
    const {
        lyricsData,
        loading,
        lines: parsedLines,
        activeIndex,
    } = useLyrics(currentSong, currentTime, isOpen);
    const scrollRef = useRef(null);
    const activeLineRef = useRef(null);
    const dialogRef = useDialogA11y({ isOpen, onClose });

    // Auto-scroll active line into center
    useEffect(() => {
        if (activeLineRef.current && scrollRef.current) {
            const reduceMotion = window.matchMedia(
                '(prefers-reduced-motion: reduce)',
            ).matches;
            activeLineRef.current.scrollIntoView({
                behavior: reduceMotion ? 'auto' : 'smooth',
                block: 'center',
            });
        }
    }, [activeIndex]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                aria-hidden="true"
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity motion-reduce:transition-none"
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <aside
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="lyrics-drawer-title"
                tabIndex={-1}
                className="animate-fadeSlideUp fixed top-0 right-0 z-50 flex h-dvh w-full max-w-md flex-col border-l border-line-strong/30 bg-raised shadow-2xl focus:outline-none"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-line/60 p-5">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary-container/30 bg-primary-container/10 text-primary-container">
                            <LuMic className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <div>
                            <h3
                                id="lyrics-drawer-title"
                                className="font-display text-sm font-bold text-ink-strong"
                            >
                                Lyrics
                            </h3>
                            <p className="max-w-[240px] truncate text-xs text-on-surface-variant">
                                {currentSong?.title} — {currentSong?.artist}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close lyrics"
                        className="focus-ring flex h-8 w-8 items-center justify-center rounded-full bg-chip text-on-surface-variant transition-colors duration-200 ease-out hover:text-ink-strong motion-reduce:transition-none"
                    >
                        <LuX className="h-4 w-4" aria-hidden="true" />
                    </button>
                </div>

                {/* Content */}
                <div
                    ref={scrollRef}
                    className="player-scroll flex flex-1 flex-col gap-4 overflow-y-auto p-6"
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
                                    <button
                                        type="button"
                                        key={idx}
                                        ref={isActive ? activeLineRef : null}
                                        onClick={() => seekTo(line.time)}
                                        aria-current={
                                            isActive ? 'true' : undefined
                                        }
                                        className={`focus-ring cursor-pointer rounded-lg px-3 py-1.5 text-left font-display text-lg font-bold transition-colors duration-200 ease-out motion-reduce:transition-none md:text-xl ${
                                            isActive
                                                ? 'scale-[1.02] bg-primary-container/10 text-primary-container shadow-[0_0_12px_var(--accent-glow)]'
                                                : 'text-ink-dim hover:bg-hover-surface hover:text-ink'
                                        }`}
                                    >
                                        {line.text || '♪ ♪ ♪'}
                                    </button>
                                );
                            })}
                        </div>
                    ) : lyricsData && lyricsData.plainLyrics ? (
                        <div className="text-sm leading-relaxed font-medium whitespace-pre-line text-ink md:text-base">
                            {lyricsData.plainLyrics}
                        </div>
                    ) : (
                        <div className="flex h-64 flex-col items-center justify-center gap-2 text-center text-text-muted">
                            <LuMusic2 className="h-10 w-10 opacity-30" aria-hidden="true" />
                            <p className="text-sm font-semibold text-ink">
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
