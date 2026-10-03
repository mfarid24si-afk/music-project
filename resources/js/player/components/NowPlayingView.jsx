import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAudio } from '../context/AudioContext';
import { fetchLyricsFromAPI } from '../services/api';
import {
    LuAudioWaveform,
    LuChevronDown,
    LuDisc3,
    LuEllipsis,
    LuExternalLink,
    LuHeart,
    LuListMusic,
    LuMaximize,
    LuMicVocal,
    LuMusic2,
    LuPause,
    LuPlay,
    LuRepeat,
    LuRepeat1,
    LuShuffle,
    LuSkipBack,
    LuSkipForward,
    LuVolume2,
    LuVolumeX,
    LuWaves,
} from 'react-icons/lu';

function formatSeconds(sec) {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function qualityLabel(song) {
    const raw = (song?.rawSrc || '').toLowerCase();
    if (raw.endsWith('.flac')) return 'FLAC 24-BIT LOSSLESS';
    if (raw.endsWith('.wav')) return 'WAV STUDIO MASTER';
    if (raw.endsWith('.mp3')) return 'MP3 320 KBPS MASTER';
    return 'HIGH QUALITY STREAM';
}

// Decorative turntable textures, inlined so no global CSS is required.
const STROBE_RING_STYLE = {
    background:
        'repeating-conic-gradient(from 0deg, #33343b 0deg 2deg, #0c0e14 2deg 4deg)',
};
const GROOVE_OVERLAY_STYLE = {
    background:
        'radial-gradient(circle, transparent 38%, rgba(0,0,0,0.45) 39%, rgba(255,255,255,0.08) 40%, transparent 41%, rgba(0,0,0,0.35) 50%, rgba(255,255,255,0.06) 51%, transparent 52%, rgba(0,0,0,0.4) 62%, rgba(255,255,255,0.09) 63%, transparent 64%, rgba(0,0,0,0.5) 75%, rgba(255,255,255,0.05) 76%, transparent 77%, rgba(0,0,0,0.8) 98%)',
};
const SPECULAR_SHEEN_STYLE = {
    background:
        'conic-gradient(from 140deg at 50% 50%, rgba(255,255,255,0.18) 0deg, transparent 25deg, transparent 155deg, rgba(255,255,255,0.16) 180deg, transparent 205deg, transparent 335deg, rgba(255,255,255,0.18) 360deg)',
    mixBlendMode: 'screen',
};
const GRID_BACKDROP_STYLE = {
    backgroundImage:
        'linear-gradient(to right, rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.015) 1px, transparent 1px)',
    backgroundSize: '48px 48px',
};

export default function NowPlayingView({ isOpen, onClose }) {
    const {
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        setVolume,
        isMuted,
        setIsMuted,
        isShuffle,
        toggleShuffle,
        repeatMode,
        cycleRepeat,
        togglePlay,
        nextSong,
        prevSong,
        seekTo,
        favorites,
        toggleFavorite,
        addToQueue,
    } = useAudio();

    const [lyricsData, setLyricsData] = useState(null);
    const [lyricsLoading, setLyricsLoading] = useState(false);
    const [artFailed, setArtFailed] = useState(false);
    const [artSongId, setArtSongId] = useState(null);
    const [rpm, setRpm] = useState(33);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const activeLineRef = useRef(null);
    const lyricsScrollRef = useRef(null);
    const dialogRef = useRef(null);

    // Reset the art fallback whenever the focused track changes.
    if (currentSong && artSongId !== currentSong.id) {
        setArtSongId(currentSong.id);
        setArtFailed(false);
    }

    // Reload lyrics whenever the focused track changes.
    useEffect(() => {
        if (!isOpen || !currentSong) return;

        let isMounted = true;
        setLyricsData(null);

        async function loadLyrics() {
            setLyricsLoading(true);
            const data = await fetchLyricsFromAPI(
                currentSong.artist,
                currentSong.title,
            );
            if (isMounted) {
                setLyricsData(data);
                setLyricsLoading(false);
            }
        }
        loadLyrics();

        return () => {
            isMounted = false;
        };
    }, [isOpen, currentSong]);

    const parsedLines = useMemo(() => {
        if (!lyricsData || !lyricsData.syncedLyrics) return null;
        const parsed = [];
        for (const line of lyricsData.syncedLyrics.split('\n')) {
            if (!line.trim()) continue;
            const match = line.match(/^\[(\d+):(\d+)(?:[.,](\d+))?\](.*)/);
            if (!match) continue;
            const m = parseInt(match[1], 10);
            const s = parseInt(match[2], 10);
            let ms = match[3] ? parseInt(match[3], 10) : 0;
            if (match[3] && match[3].length === 2) ms *= 10;
            parsed.push({ time: m * 60 + s + ms / 1000, text: match[4].trim() });
        }
        return parsed.length > 0 ? parsed : null;
    }, [lyricsData]);

    const activeIndex = useMemo(() => {
        if (!parsedLines) return -1;
        let idx = -1;
        for (let i = 0; i < parsedLines.length; i++) {
            if (currentTime >= parsedLines[i].time) idx = i;
        }
        return idx;
    }, [parsedLines, currentTime]);

    // Scroll ONLY the lyrics panel so a line change never drags the whole
    // viewport/page along with it (that felt forced, especially on mobile).
    useEffect(() => {
        const line = activeLineRef.current;
        const container = lyricsScrollRef.current;
        if (!line || !container) return;

        const containerRect = container.getBoundingClientRect();
        const lineRect = line.getBoundingClientRect();
        const target =
            container.scrollTop +
            (lineRect.top - containerRect.top) -
            (container.clientHeight - lineRect.height) / 2;

        container.scrollTo({
            top: Math.max(0, target),
            behavior: 'smooth',
        });
    }, [activeIndex]);

    // Escape closes the view without touching playback.
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    // Track native fullscreen state so the control stays in sync.
    useEffect(() => {
        const onFullscreenChange = () =>
            setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onFullscreenChange);
        return () =>
            document.removeEventListener(
                'fullscreenchange',
                onFullscreenChange,
            );
    }, []);

    const toggleFullscreen = async () => {
        try {
            if (!document.fullscreenElement) {
                await dialogRef.current?.requestFullscreen?.();
            } else {
                await document.exitFullscreen?.();
            }
        } catch (err) {
            // Fullscreen can be blocked by the browser; ignore and keep UI usable.
        }
    };

    if (!isOpen || !currentSong) return null;

    const isLiked = favorites.includes(currentSong.id);
    const safeDuration = duration || 0;
    const progressPct =
        safeDuration > 0
            ? Math.min(100, Math.max(0, (currentTime / safeDuration) * 100))
            : 0;
    const volumePct = isMuted ? 0 : Math.round((volume || 0) * 100);

    return (
        <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Now playing: ${currentSong.title}`}
            className="animate-fadeIn fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-canvas text-white"
        >
            {/* Ambient backdrop glow + subtle matrix grid */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="absolute -top-32 left-1/4 h-[750px] w-[750px] rounded-full bg-primary-container/10 opacity-40 blur-[140px]" />
                <div className="absolute top-1/3 -left-32 h-[600px] w-[600px] rounded-full bg-primary-container/10 opacity-30 blur-[160px]" />
                <div className="absolute bottom-20 left-1/2 h-[450px] w-[850px] -translate-x-1/2 rounded-full bg-primary-container/10 opacity-50 blur-[150px]" />
                <div
                    className="absolute inset-0"
                    style={GRID_BACKDROP_STYLE}
                />
            </div>

            <main className="relative z-10 mx-auto flex w-full max-w-[1720px] flex-col px-4 pt-6 pb-44 md:px-8 lg:px-12 lg:pt-8 lg:pb-40">
                {/* Top telemetry strip */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-line-strong/20 pb-5">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full border border-line-strong/30 bg-raised px-3 py-1 font-mono text-[11px] font-semibold tracking-wider text-white">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-container" />
                            PHONO STAGE DIRECT
                        </span>
                        <span className="hidden font-mono text-[11px] tracking-wider text-on-surface-variant lg:inline">
                            DECK: AETHER ORBIT MK-IV &bull; BALANCED OUTPUT
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden items-center gap-2 rounded-lg border border-line-strong/30 bg-overlay/60 px-3 py-1 sm:flex">
                            <LuAudioWaveform className="h-4 w-4 text-primary-container" />
                            <span className="font-mono text-[11px] text-white">
                                96.0 kHz / 24-BIT LOSSLESS
                            </span>
                        </div>
                        <div className="hidden items-center gap-1.5 font-mono text-[11px] text-on-surface-variant md:flex">
                            <span className="h-2 w-2 rounded-full bg-primary-container" />
                            DAC LOCKED
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Minimize now playing view"
                            title="Minimize (Esc)"
                            className="group flex items-center gap-2 rounded-full border border-line-strong/30 bg-raised/80 py-2 pr-4 pl-3 text-on-surface-variant backdrop-blur-md transition-colors hover:border-primary-container/50 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container/60"
                        >
                            <LuChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                            <span className="font-mono text-[11px] font-medium tracking-wider uppercase">
                                Minimize
                            </span>
                        </button>
                    </div>
                </div>

                {/* Two-panel stage: turntable + lyrics */}
                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
                    {/* LEFT: Turntable deck */}
                    <section className="flex flex-col items-center justify-center lg:col-span-7">
                        <div className="relative flex w-full max-w-[620px] flex-col justify-between rounded-2xl border border-white/10 bg-raised/90 p-5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.85)] backdrop-blur-2xl sm:p-6 md:p-8">
                            {/* Deck top details: speed selector + pitch lock */}
                            <div className="z-20 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-1 rounded-lg border border-line-strong/30 bg-inset/80 p-1">
                                    <button
                                        type="button"
                                        onClick={() => setRpm(33)}
                                        aria-pressed={rpm === 33}
                                        title="33 RPM (visual)"
                                        className={`rounded px-2.5 py-1.5 font-mono text-[11px] font-bold tracking-wider transition-colors ${
                                            rpm === 33
                                                ? 'bg-primary-container text-on-primary-container shadow-[0_0_12px_var(--accent-glow)]'
                                                : 'text-on-surface-variant hover:text-white'
                                        }`}
                                    >
                                        33 RPM
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRpm(45)}
                                        aria-pressed={rpm === 45}
                                        title="45 RPM (visual)"
                                        className={`rounded px-2.5 py-1.5 font-mono text-[11px] font-bold tracking-wider transition-colors ${
                                            rpm === 45
                                                ? 'bg-primary-container text-on-primary-container shadow-[0_0_12px_var(--accent-glow)]'
                                                : 'text-on-surface-variant hover:text-white'
                                        }`}
                                    >
                                        45 RPM
                                    </button>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="hidden font-mono text-[11px] text-on-surface-variant sm:inline">
                                        PITCH LOCK
                                    </span>
                                    <span className="h-2 w-2 rounded-full bg-primary-container shadow-[0_0_8px_var(--accent-glow)]" />
                                    <span className="font-mono text-[11px] tracking-widest text-white">
                                        +0.00%
                                    </span>
                                </div>
                            </div>

                            {/* Platter & vinyl record arena */}
                            <div className="relative my-auto flex items-center justify-center py-6">
                                <div className="absolute h-[300px] w-[300px] rounded-full bg-gradient-to-tr from-primary-container/20 via-primary-container/25 to-transparent blur-2xl" />

                                <div
                                    className="relative flex h-[min(78vw,340px)] w-[min(78vw,340px)] items-center justify-center rounded-full border border-white/10 p-2 shadow-2xl sm:h-[380px] sm:w-[380px]"
                                    style={STROBE_RING_STYLE}
                                >
                                    <div className="relative flex h-full w-full items-center justify-center rounded-full bg-[#161922] p-2 shadow-inner">
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            onClick={togglePlay}
                                            onKeyDown={(e) => {
                                                if (
                                                    e.key === 'Enter' ||
                                                    e.key === ' '
                                                ) {
                                                    // Stop the global Space shortcut from
                                                    // toggling playback a second time.
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    togglePlay();
                                                }
                                            }}
                                            aria-label={
                                                isPlaying
                                                    ? 'Pause playback'
                                                    : 'Resume playback'
                                            }
                                            title={
                                                isPlaying
                                                    ? 'Pause playback'
                                                    : 'Resume playback'
                                            }
                                            className={`spinning-vinyl relative flex h-full w-full cursor-pointer items-center justify-center overflow-hidden rounded-full shadow-2xl select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container/60 ${
                                                !isPlaying ? 'paused' : ''
                                            }`}
                                        >
                                            {artFailed ? (
                                                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-br from-chip to-canvas">
                                                    <LuMusic2 className="h-12 w-12 text-on-surface-variant opacity-40" />
                                                </div>
                                            ) : (
                                                <img
                                                    src={currentSong.img}
                                                    alt={`${currentSong.title} cover art`}
                                                    onError={() =>
                                                        setArtFailed(true)
                                                    }
                                                    className="absolute inset-0 h-full w-full rounded-full object-cover"
                                                />
                                            )}
                                            {/* Concentric microgrooves */}
                                            <div
                                                className="pointer-events-none absolute inset-0 rounded-full"
                                                style={GROOVE_OVERLAY_STYLE}
                                            />
                                            {/* Specular light reflection */}
                                            <div
                                                className="pointer-events-none absolute inset-0 rounded-full"
                                                style={SPECULAR_SHEEN_STYLE}
                                            />
                                            {/* Center label + spindle */}
                                            <div className="relative z-10 flex h-24 w-24 flex-col items-center justify-center rounded-full border border-line-strong/40 bg-canvas/90 shadow-2xl backdrop-blur-md">
                                                <span className="font-mono text-[8px] tracking-widest text-primary-container">
                                                    AETHER REC
                                                </span>
                                                <span className="mt-0.5 font-mono text-[9px] font-bold tracking-wider text-white">
                                                    SPOTIRID
                                                </span>
                                                <span className="font-mono text-[7px] text-on-surface-variant">
                                                    SIDE A &bull;{' '}
                                                    {rpm === 33 ? '33⅓' : '45'}
                                                </span>
                                                <span className="mt-1 flex h-4 w-4 items-center justify-center rounded-full border border-black/80 bg-gradient-to-br from-zinc-200 via-zinc-400 to-zinc-700 shadow-inner">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-black" />
                                                </span>
                                            </div>
                                            {/* Runout groove band */}
                                            <div className="pointer-events-none absolute h-36 w-36 rounded-full border border-white/10" />
                                        </div>
                                    </div>
                                </div>

                                {/* Brushed metallic tonearm */}
                                <div className="pointer-events-none absolute -top-6 right-0 z-30 hidden select-none sm:block sm:right-4">
                                    <svg
                                        width="140"
                                        height="340"
                                        viewBox="0 0 140 340"
                                        fill="none"
                                        className="drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]"
                                        aria-hidden="true"
                                    >
                                        <circle
                                            cx="95"
                                            cy="45"
                                            r="32"
                                            fill="#181a24"
                                            stroke="rgba(255,255,255,0.2)"
                                            strokeWidth="1.5"
                                        />
                                        <circle
                                            cx="95"
                                            cy="45"
                                            r="22"
                                            fill="url(#np-metal-gradient)"
                                            stroke="rgba(0,0,0,0.6)"
                                            strokeWidth="1"
                                        />
                                        <circle
                                            cx="95"
                                            cy="45"
                                            r="10"
                                            fill="#282a30"
                                            stroke="var(--accent-color)"
                                            strokeWidth="1"
                                        />
                                        <rect
                                            x="76"
                                            y="10"
                                            width="38"
                                            height="12"
                                            rx="3"
                                            fill="#2d303a"
                                            stroke="rgba(255,255,255,0.2)"
                                        />
                                        <line
                                            x1="88"
                                            x2="88"
                                            y1="10"
                                            y2="22"
                                            stroke="var(--accent-color)"
                                            strokeWidth="1"
                                        />
                                        <path
                                            d="M95 55 C95 120, 80 150, 72 210 C66 250, 52 270, 42 292"
                                            stroke="url(#np-arm-sheen)"
                                            strokeWidth="5"
                                            strokeLinecap="round"
                                        />
                                        <path
                                            d="M95 55 C95 120, 80 150, 72 210 C66 250, 52 270, 42 292"
                                            stroke="rgba(255,255,255,0.5)"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                        />
                                        <g transform="translate(38, 288) rotate(22)">
                                            <rect
                                                x="-6"
                                                y="0"
                                                width="12"
                                                height="26"
                                                rx="2"
                                                fill="#1a1c24"
                                                stroke="rgba(255,255,255,0.2)"
                                                strokeWidth="1"
                                            />
                                            <polygon
                                                points="-5,18 5,18 3,34 -3,34"
                                                fill="var(--accent-color)"
                                            />
                                            <line
                                                x1="0"
                                                x2="0"
                                                y1="34"
                                                y2="38"
                                                stroke="#ffffff"
                                                strokeWidth="1.5"
                                            />
                                            <circle
                                                cx="0"
                                                cy="38"
                                                r="1.5"
                                                fill="var(--accent-color)"
                                                filter="drop-shadow(0 0 4px var(--accent-color))"
                                            />
                                        </g>
                                        <defs>
                                            <linearGradient
                                                id="np-metal-gradient"
                                                x1="0%"
                                                x2="100%"
                                                y1="0%"
                                                y2="100%"
                                            >
                                                <stop
                                                    offset="0%"
                                                    stopColor="#4a4d57"
                                                />
                                                <stop
                                                    offset="50%"
                                                    stopColor="#b0b5c4"
                                                />
                                                <stop
                                                    offset="100%"
                                                    stopColor="#2d2f38"
                                                />
                                            </linearGradient>
                                            <linearGradient
                                                id="np-arm-sheen"
                                                x1="0%"
                                                x2="100%"
                                                y1="0%"
                                                y2="0%"
                                            >
                                                <stop
                                                    offset="0%"
                                                    stopColor="#707482"
                                                />
                                                <stop
                                                    offset="50%"
                                                    stopColor="#e8ecf8"
                                                />
                                                <stop
                                                    offset="100%"
                                                    stopColor="#464952"
                                                />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>
                            </div>

                            {/* Deck bottom: motor control + pitch fader */}
                            <div className="z-20 flex flex-wrap items-center justify-between gap-3 border-t border-line-strong/20 pt-3">
                                <button
                                    type="button"
                                    onClick={togglePlay}
                                    aria-pressed={isPlaying}
                                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-overlay/80 px-4 py-2 font-mono text-xs font-semibold text-white transition-all hover:bg-chip active:scale-95"
                                >
                                    {isPlaying ? (
                                        <>
                                            <span className="h-2.5 w-2.5 rounded-full bg-primary-container shadow-[0_0_8px_var(--accent-glow)]" />
                                            <span>MOTOR ON</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="h-2.5 w-2.5 rounded-full bg-red-400 shadow-[0_0_8px_#ffb4ab]" />
                                            <span>STANDBY</span>
                                        </>
                                    )}
                                </button>

                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-[10px] text-on-surface-variant">
                                        -8%
                                    </span>
                                    <div className="relative flex h-2 w-24 items-center rounded-full border border-line-strong/30 bg-inset px-0.5 sm:w-28">
                                        <div className="absolute left-1/2 h-3 w-0.5 -translate-x-1/2 bg-white/30" />
                                        <div className="ml-[45%] h-5 w-4 rounded-sm border border-black/50 bg-gradient-to-b from-zinc-300 to-zinc-600 shadow-md" />
                                    </div>
                                    <span className="font-mono text-[10px] text-on-surface-variant">
                                        +8%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Track meta */}
                        <div className="mt-6 flex w-full max-w-[620px] flex-col gap-3">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                <div className="min-w-0">
                                    <div className="mb-1 flex items-center gap-2">
                                        <span className="rounded border border-primary-container/30 bg-primary-container/15 px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest text-primary-container uppercase">
                                            Now Rotating
                                        </span>
                                        {currentSong.genre && (
                                            <span className="font-mono text-[11px] tracking-wider text-white/70 uppercase">
                                                {currentSong.genre}
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="truncate font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                        {currentSong.title}
                                    </h1>
                                    <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm font-semibold text-white/80">
                                        <span>{currentSong.artist}</span>
                                        {currentSong.album && (
                                            <>
                                                <span className="text-line-strong">
                                                    &bull;
                                                </span>
                                                <span className="font-normal text-on-surface-variant">
                                                    {currentSong.album}
                                                </span>
                                            </>
                                        )}
                                    </p>
                                </div>

                                <div className="flex flex-shrink-0 items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            toggleFavorite(currentSong.id)
                                        }
                                        aria-label={
                                            isLiked
                                                ? 'Remove from favorites'
                                                : 'Add to favorites'
                                        }
                                        title={
                                            isLiked
                                                ? 'Remove from favorites'
                                                : 'Add to favorites'
                                        }
                                        className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container/60 ${
                                            isLiked
                                                ? 'border-primary-container/30 bg-primary-container/15 text-primary-container'
                                                : 'border-line-strong/30 bg-overlay/70 text-on-surface-variant hover:bg-chip hover:text-white'
                                        }`}
                                    >
                                        <LuHeart
                                            className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`}
                                        />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            addToQueue(currentSong.id)
                                        }
                                        aria-label="Add to queue"
                                        title="Add to queue"
                                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-line-strong/30 bg-overlay/70 text-on-surface-variant transition-colors hover:bg-chip hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container/60"
                                    >
                                        <LuListMusic className="h-5 w-5" />
                                    </button>
                                    {currentSong.youtubeUrl ? (
                                        <a
                                            href={currentSong.youtubeUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label="Watch on YouTube"
                                            title="Watch on YouTube"
                                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-line-strong/30 bg-overlay/70 text-on-surface-variant transition-colors hover:bg-chip hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container/60"
                                        >
                                            <LuExternalLink className="h-5 w-5" />
                                        </a>
                                    ) : (
                                        <span
                                            aria-hidden="true"
                                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-line-strong/30 bg-overlay/70 text-on-surface-variant opacity-50"
                                        >
                                            <LuEllipsis className="h-5 w-5" />
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Format badges */}
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                <span className="flex items-center gap-1.5 rounded-full border border-line-strong/40 bg-raised px-3 py-1 font-mono text-[11px] text-white shadow-sm">
                                    <span className="h-1.5 w-1.5 rounded-full bg-primary-container" />
                                    {qualityLabel(currentSong)}
                                </span>
                                <span className="flex items-center gap-1.5 rounded-full border border-line-strong/40 bg-raised px-3 py-1 font-mono text-[11px] text-white shadow-sm">
                                    <LuDisc3 className="h-3.5 w-3.5 text-primary-container" />
                                    Vinyl Picture Disc Edition
                                </span>
                                <span className="rounded-full border border-line-strong/20 bg-raised/70 px-3 py-1 font-mono text-[11px] text-on-surface-variant">
                                    MASTER QUALITY STREAM
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* RIGHT: Synced lyrics panel */}
                    <section className="flex h-[460px] flex-col lg:col-span-5 lg:h-[580px]">
                        <div className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-inset/80 p-5 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.8)] backdrop-blur-2xl sm:p-6 md:p-8">
                            <div className="pointer-events-none absolute top-1/3 -right-20 h-60 w-60 rounded-full bg-primary-container/10 blur-[80px]" />

                            {/* Header */}
                            <div className="z-10 flex items-center justify-between border-b border-line-strong/20 pb-4">
                                <div className="flex items-center gap-3">
                                    <span className="rounded bg-primary-container px-2.5 py-1 font-mono text-[11px] font-bold tracking-wider text-on-primary-container">
                                        LYRICS
                                    </span>
                                    <span className="flex items-center gap-1.5 font-mono text-[11px] text-white/80">
                                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-container" />
                                        <span className="hidden sm:inline">
                                            TELEMETRY SYNC ACTIVE
                                        </span>
                                        <span className="sm:hidden">
                                            SYNC ACTIVE
                                        </span>
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={toggleFullscreen}
                                    title={
                                        isFullscreen
                                            ? 'Exit full view'
                                            : 'Full view'
                                    }
                                    aria-label={
                                        isFullscreen
                                            ? 'Exit full view'
                                            : 'Full view'
                                    }
                                    className="rounded-md p-2 text-on-surface-variant transition-colors hover:bg-overlay hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container/60"
                                >
                                    <LuMaximize className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Body */}
                            <div
                                ref={lyricsScrollRef}
                                className="z-10 my-2 min-h-0 flex-1 overflow-y-auto overscroll-contain py-4 pr-1 select-none"
                            >
                                {lyricsLoading ? (
                                    <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3">
                                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-container border-t-transparent" />
                                        <p className="font-mono text-xs text-on-surface-variant">
                                            Searching lyrics database...
                                        </p>
                                    </div>
                                ) : parsedLines ? (
                                    <div className="flex flex-col gap-3">
                                        {parsedLines.map((line, idx) => {
                                            const isActive =
                                                idx === activeIndex;
                                            return (
                                                <div
                                                    key={idx}
                                                    ref={
                                                        isActive
                                                            ? activeLineRef
                                                            : null
                                                    }
                                                    onClick={() =>
                                                        seekTo(line.time)
                                                    }
                                                    className={`group flex cursor-pointer items-start gap-3 rounded-xl border-l-4 p-3 transition-all duration-300 ${
                                                        isActive
                                                            ? 'border-primary-container bg-overlay/70 shadow-[0_0_24px_var(--accent-glow)]'
                                                            : 'border-transparent opacity-40 hover:opacity-80'
                                                    }`}
                                                >
                                                    <span
                                                        className={`flex w-10 flex-shrink-0 items-center gap-1 pt-1 font-mono text-xs ${
                                                            isActive
                                                                ? 'font-bold text-primary-container'
                                                                : 'text-on-surface-variant/70'
                                                        }`}
                                                    >
                                                        {isActive && (
                                                            <LuPlay className="h-3 w-3 fill-current" />
                                                        )}
                                                        {formatSeconds(
                                                            line.time,
                                                        )}
                                                    </span>
                                                    <p
                                                        className={`font-display tracking-tight ${
                                                            isActive
                                                                ? 'text-lg font-bold text-white sm:text-xl'
                                                                : 'text-base font-semibold text-white/80 group-hover:text-white'
                                                        }`}
                                                    >
                                                        {line.text ||
                                                            '♪ ♪ ♪'}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : lyricsData && lyricsData.plainLyrics ? (
                                    <p className="py-2 text-sm leading-relaxed font-medium whitespace-pre-line text-white/80 md:text-base">
                                        {lyricsData.plainLyrics}
                                    </p>
                                ) : (
                                    <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 text-center">
                                        <LuMusic2 className="h-9 w-9 text-on-surface-variant opacity-30" />
                                        <p className="text-sm font-semibold text-white/70">
                                            No synchronized lyrics available
                                        </p>
                                        <p className="max-w-xs text-xs text-on-surface-variant">
                                            Lyrics could not be found for this
                                            track. Playback continues
                                            unaffected.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="z-10 flex items-center justify-between border-t border-line-strong/20 pt-3 text-on-surface-variant">
                                <div className="flex items-center gap-2">
                                    <LuMicVocal className="h-4 w-4 text-primary-container" />
                                    <span className="font-mono text-[11px]">
                                        Time-synced lyrics
                                    </span>
                                </div>
                                {parsedLines && (
                                    <span className="font-mono text-[11px]">
                                        {Math.max(activeIndex + 1, 0)} /{' '}
                                        {parsedLines.length} lines
                                    </span>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {/* Floating transport bar */}
            <footer className="fixed right-0 bottom-4 left-0 z-20 mx-auto max-w-[1400px] px-4 sm:px-8">
                <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-chrome/90 px-4 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl sm:px-6 sm:py-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* Left: current track mini */}
                    <div className="hidden items-center gap-3 lg:flex lg:w-1/4 lg:min-w-[200px]">
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-white/10 bg-chip">
                            {artFailed ? (
                                <span className="flex h-full w-full items-center justify-center">
                                    <LuMusic2 className="h-5 w-5 text-on-surface-variant opacity-50" />
                                </span>
                            ) : (
                                <img
                                    src={currentSong.img}
                                    alt={currentSong.title}
                                    onError={() => setArtFailed(true)}
                                    className="h-full w-full object-cover"
                                />
                            )}
                        </div>
                        <div className="min-w-0">
                            <h4 className="truncate font-display text-sm font-bold text-white">
                                {currentSong.title}
                            </h4>
                            <p className="truncate text-xs text-on-surface-variant">
                                {currentSong.artist}
                            </p>
                        </div>
                    </div>

                    {/* Center: transport + scrubber */}
                    <div className="flex w-full flex-col items-center gap-2 lg:w-2/4 lg:max-w-[620px]">
                        <div className="flex items-center gap-5 sm:gap-7">
                            <button
                                type="button"
                                onClick={toggleShuffle}
                                aria-pressed={isShuffle}
                                aria-label="Shuffle"
                                title="Shuffle"
                                className={`rounded-full p-2 transition-colors active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container/60 ${
                                    isShuffle
                                        ? 'text-primary-container'
                                        : 'text-on-surface-variant hover:text-white'
                                }`}
                            >
                                <LuShuffle className="h-5 w-5" />
                            </button>

                            <button
                                type="button"
                                onClick={prevSong}
                                aria-label="Previous track"
                                title="Previous track"
                                className="rounded-full p-2 text-white transition-colors hover:text-primary-container active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container/60"
                            >
                                <LuSkipBack className="h-6 w-6 fill-current" />
                            </button>

                            <button
                                type="button"
                                onClick={togglePlay}
                                aria-label={isPlaying ? 'Pause' : 'Play'}
                                title={isPlaying ? 'Pause' : 'Play'}
                                className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-container text-on-primary-container shadow-[0_0_32px_var(--accent-glow)] transition-all duration-200 hover:scale-105 hover:shadow-[0_0_42px_var(--accent-glow)] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                            >
                                {isPlaying ? (
                                    <LuPause className="h-7 w-7 fill-current" />
                                ) : (
                                    <LuPlay className="ml-0.5 h-7 w-7 fill-current" />
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => nextSong()}
                                aria-label="Next track"
                                title="Next track"
                                className="rounded-full p-2 text-white transition-colors hover:text-primary-container active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container/60"
                            >
                                <LuSkipForward className="h-6 w-6 fill-current" />
                            </button>

                            <button
                                type="button"
                                onClick={cycleRepeat}
                                aria-label={`Repeat: ${repeatMode}`}
                                title={`Repeat: ${repeatMode.toUpperCase()}`}
                                className={`relative flex flex-col items-center rounded-full p-2 transition-colors active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container/60 ${
                                    repeatMode !== 'off'
                                        ? 'text-primary-container'
                                        : 'text-on-surface-variant hover:text-white'
                                }`}
                            >
                                {repeatMode === 'one' ? (
                                    <LuRepeat1 className="h-5 w-5" />
                                ) : (
                                    <LuRepeat className="h-5 w-5" />
                                )}
                                {repeatMode !== 'off' && (
                                    <span className="mt-0.5 h-1 w-1 rounded-full bg-primary-container" />
                                )}
                            </button>
                        </div>

                        {/* Scrubber */}
                        <div className="flex w-full items-center gap-3">
                            <span className="w-10 text-right font-mono text-[11px] text-on-surface-variant tabular-nums">
                                {formatSeconds(currentTime)}
                            </span>
                            <div className="group relative flex h-6 flex-1 items-center">
                                <input
                                    type="range"
                                    min={0}
                                    max={safeDuration || 100}
                                    step={0.1}
                                    value={currentTime || 0}
                                    onChange={(e) =>
                                        seekTo(parseFloat(e.target.value))
                                    }
                                    aria-label="Seek"
                                    className="absolute inset-0 z-20 h-full w-full cursor-pointer appearance-none bg-transparent opacity-0"
                                />
                                <div className="relative h-1.5 w-full rounded-full bg-chip transition-all group-hover:h-2">
                                    <div
                                        className="absolute inset-y-0 left-0 rounded-full bg-primary-container"
                                        style={{ width: `${progressPct}%` }}
                                    >
                                        <span className="absolute top-1/2 right-0 h-3.5 w-3.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary-container shadow-[0_0_12px_var(--accent-glow)] transition-transform group-hover:scale-125" />
                                    </div>
                                </div>
                            </div>
                            <span className="w-10 font-mono text-[11px] text-on-surface-variant tabular-nums">
                                {formatSeconds(duration)}
                            </span>
                        </div>
                    </div>

                    {/* Right: volume */}
                    <div className="hidden items-center justify-end gap-3 lg:flex lg:w-1/4">
                        <button
                            type="button"
                            onClick={() => setIsMuted(!isMuted)}
                            aria-label={isMuted ? 'Unmute' : 'Mute'}
                            title={isMuted ? 'Unmute' : 'Mute'}
                            className="rounded-md p-1.5 text-on-surface-variant transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container/60"
                        >
                            {isMuted || volume === 0 ? (
                                <LuVolumeX className="h-5 w-5" />
                            ) : (
                                <LuVolume2 className="h-5 w-5" />
                            )}
                        </button>
                        <div className="group relative flex h-6 w-24 flex-shrink-0 items-center">
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.01}
                                value={isMuted ? 0 : volume}
                                onChange={(e) => {
                                    if (isMuted) setIsMuted(false);
                                    setVolume(parseFloat(e.target.value));
                                }}
                                aria-label="Volume"
                                className="absolute inset-0 z-20 h-full w-full cursor-pointer appearance-none bg-transparent opacity-0"
                            />
                            <div className="relative h-1.5 w-full rounded-full bg-chip">
                                <div
                                    className="absolute inset-y-0 left-0 rounded-full bg-primary-container"
                                    style={{ width: `${volumePct}%` }}
                                >
                                    <span className="absolute top-1/2 right-0 h-2.5 w-2.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary-container shadow-[0_0_8px_var(--accent-glow)] transition-transform group-hover:scale-125" />
                                </div>
                            </div>
                        </div>
                        <span
                            className="flex items-center gap-1.5 rounded border border-line-strong/30 bg-overlay px-2.5 py-1 font-mono text-[11px] font-bold tracking-wider text-white"
                            title="Lossless output"
                        >
                            <LuWaves className="h-3.5 w-3.5 text-primary-container" />
                            LOSSLESS
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
