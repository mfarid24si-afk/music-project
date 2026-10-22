import React, { useState, useEffect, useRef } from 'react';
import { useAudio } from '../context/AudioContext';
import { useLyrics } from '../hooks/useLyrics';
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
    LuMusic,
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
import { formatSeconds } from '../format';
import {
    GRID_BACKDROP_STYLE,
    GROOVE_OVERLAY_STYLE,
    SPECULAR_SHEEN_STYLE,
    STROBE_RING_STYLE,
    qualityLabel,
} from '../nowPlayingVisuals';


const FOCUS_RING =
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container/60';

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

    const {
        lyricsData,
        loading: lyricsLoading,
        lines: parsedLines,
        activeIndex,
    } = useLyrics(currentSong, currentTime, isOpen);

    const [artFailed, setArtFailed] = useState(false);
    const [artSongId, setArtSongId] = useState(null);
    const [rpm, setRpm] = useState(33);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const activeLineRef = useRef(null);
    const lyricsScrollRef = useRef(null);
    const dialogRef = useRef(null);
    const [swipeY, setSwipeY] = useState(0);
    const [swiping, setSwiping] = useState(false);
    const swipeStartY = useRef(0);
    const swipeActive = useRef(false);

    function onSwipeStart(e) {
        swipeStartY.current = e.touches ? e.touches[0].clientY : e.clientY;
        swipeActive.current = true;
        setSwiping(true);
    }

    function onSwipeMove(e) {
        if (!swipeActive.current) return;
        const y = e.touches ? e.touches[0].clientY : e.clientY;
        const delta = y - swipeStartY.current;
        if (delta < 0) return;
        setSwipeY(delta);
        if (e.cancelable) e.preventDefault();
    }

    function onSwipeEnd() {
        if (!swipeActive.current) return;
        swipeActive.current = false;
        setSwiping(false);
        if (swipeY > 120) {
            onClose();
        }
        setSwipeY(0);
    }

    // Reset the art fallback whenever the focused track changes.
    if (currentSong && artSongId !== currentSong.id) {
        setArtSongId(currentSong.id);
        setArtFailed(false);
    }

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

        const reduceMotion = window.matchMedia?.(
            '(prefers-reduced-motion: reduce)',
        ).matches;

        container.scrollTo({
            top: Math.max(0, target),
            behavior: reduceMotion ? 'auto' : 'smooth',
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
            className="animate-fadeIn player-font fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-canvas text-ink-strong"
            onTouchStart={onSwipeStart}
            onTouchMove={onSwipeMove}
            onTouchEnd={onSwipeEnd}
            style={{
                transform: swipeY > 0 ? `translateY(${swipeY}px)` : 'translateY(0)',
                transition: swiping ? 'none' : 'transform 320ms ease-out',
            }}
        >
            {/* Dynamic background gradient driven by cover colour */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div
                    className="absolute inset-0 player-cover-gradient transition-opacity duration-300"
                    style={{ opacity: isPlaying ? 1 : 0.8 }}
                />
                <div className="absolute -top-32 left-1/4 h-[750px] w-[750px] rounded-full opacity-40 blur-[140px]" style={{ background: 'color-mix(in oklab, var(--cover-accent, var(--accent-color)) 22%, transparent)' }} />
                <div className="absolute top-1/3 -left-32 h-[600px] w-[600px] rounded-full opacity-30 blur-[160px]" style={{ background: 'color-mix(in oklab, var(--cover-accent, var(--accent-color)) 18%, transparent)' }} />
                <div className="absolute bottom-20 left-1/2 h-[450px] w-[850px] -translate-x-1/2 rounded-full opacity-50 blur-[150px]" style={{ background: 'color-mix(in oklab, var(--cover-accent, var(--accent-color)) 20%, transparent)' }} />
                {isPlaying && (
                    <>
                        <div className="absolute top-1/2 left-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary-container/30 animate-[scaleUp_2200ms_ease-out_infinite]" />
                        <div className="absolute top-1/2 left-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary-container/20 animate-[scaleUp_2800ms_ease-out_infinite]" style={{ animationDelay: '400ms' }} />
                        <div className="absolute top-1/2 left-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary-container/10 animate-[scaleUp_3400ms_ease-out_infinite]" style={{ animationDelay: '800ms' }} />
                    </>
                )}
                <div className="absolute inset-0">
                    {[...Array(16)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute h-1 w-1 rounded-full bg-primary-container/40"
                            style={{
                                left: `${(i * 37) % 100}%`,
                                top: `${(i * 19) % 100}%`,
                                animation: `fadeIn 4200ms ease-in-out infinite`,
                                animationDelay: `${i * 260}ms`,
                                boxShadow: '0 0 14px var(--accent-glow)',
                            }}
                        />
                    ))}
                </div>
                <div
                    className="absolute inset-0"
                    style={GRID_BACKDROP_STYLE}
                />
            </div>

            <main className="relative z-10 mx-auto flex w-full max-w-[1720px] flex-col px-4 pt-6 pb-44 md:px-8 lg:px-12 lg:pt-8 lg:pb-40">
                {/* Top bar — calm, one accent, one fact */}
                <header className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line/60 pb-5">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full border border-line-strong/30 bg-raised px-3 py-1.5 font-mono text-xs font-semibold tracking-wider text-ink">
                            <span
                                aria-hidden="true"
                                className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-container motion-reduce:animate-none"
                            />
                            NOW PLAYING
                        </span>
                        <span className="hidden items-center gap-2 rounded-lg border border-line-strong/30 bg-overlay/60 px-3 py-1.5 font-mono text-xs text-ink-secondary sm:inline-flex">
                            <LuAudioWaveform
                                aria-hidden="true"
                                className="h-4 w-4 text-primary-container"
                            />
                            Lossless · 24-bit
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Minimize now playing view"
                        title="Minimize (Esc)"
                        className={`group flex items-center gap-2 rounded-full border border-line-strong/30 bg-raised/80 py-2 pr-4 pl-3 text-ink-secondary backdrop-blur-md transition-colors duration-200 ease-out hover:border-primary-container/50 hover:text-ink motion-reduce:transition-none ${FOCUS_RING}`}
                    >
                        <LuChevronDown
                            aria-hidden="true"
                            className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-y-0.5 motion-reduce:transition-none"
                        />
                        <span className="font-mono text-xs font-medium tracking-wider uppercase">
                            Minimize
                        </span>
                    </button>
                </header>

                {/* Two-panel stage: turntable + lyrics */}
                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
                    {/* LEFT: Turntable deck */}
                    <section className="flex flex-col items-center justify-center lg:col-span-7">
                        <div className="relative flex w-full max-w-[620px] flex-col justify-between rounded-3xl border border-line-strong/20 bg-raised/90 p-5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.65)] backdrop-blur-2xl sm:p-6 md:p-8">
                            {/* Deck top details: speed selector + pitch lock */}
                            <div className="z-20 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-1 rounded-full border border-line-strong/30 bg-inset/80 p-1">
                                    <button
                                        type="button"
                                        onClick={() => setRpm(33)}
                                        aria-pressed={rpm === 33}
                                        title="33 RPM (visual)"
                                        className={`rounded-full px-3.5 py-1.5 font-mono text-xs font-bold tracking-wider transition-colors duration-200 ease-out motion-reduce:transition-none ${FOCUS_RING} ${
                                            rpm === 33
                                                ? 'bg-primary-container text-on-primary-container shadow-[0_0_12px_var(--accent-glow)]'
                                                : 'text-ink-secondary hover:text-ink'
                                        }`}
                                    >
                                        33 RPM
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRpm(45)}
                                        aria-pressed={rpm === 45}
                                        title="45 RPM (visual)"
                                        className={`rounded-full px-3.5 py-1.5 font-mono text-xs font-bold tracking-wider transition-colors duration-200 ease-out motion-reduce:transition-none ${FOCUS_RING} ${
                                            rpm === 45
                                                ? 'bg-primary-container text-on-primary-container shadow-[0_0_12px_var(--accent-glow)]'
                                                : 'text-ink-secondary hover:text-ink'
                                        }`}
                                    >
                                        45 RPM
                                    </button>
                                </div>
                                <span className="flex items-center gap-2 font-mono text-xs tracking-widest text-on-surface-variant">
                                    <span
                                        aria-hidden="true"
                                        className="h-2 w-2 rounded-full bg-primary-container shadow-[0_0_8px_var(--accent-glow)]"
                                    />
                                    PITCH LOCK
                                </span>
                            </div>

                            {/* Platter */}
                            <div className="relative flex justify-center py-8">
                                <div
                                    aria-hidden="true"
                                    className="absolute top-1/2 left-1/2 h-[560px] w-[560px] max-w-[92%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-container/10 blur-[130px]"
                                />

                                <div
                                    className="relative flex h-[min(78vw,340px)] w-[min(78vw,340px)] items-center justify-center rounded-full sm:h-[380px] sm:w-[380px]"
                                    style={STROBE_RING_STYLE}
                                >
                                    <button
                                        type="button"
                                        onClick={togglePlay}
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
                                        className={`group relative block h-full w-full cursor-pointer overflow-hidden rounded-full bg-inset shadow-inner ring-1 ring-line-strong/30 select-none ${FOCUS_RING}`}
                                    >
                                        {/* Spinning disc */}
                                        <span
                                            aria-hidden="true"
                                            className={`spinning-vinyl player-cover-shadow absolute inset-0 ${isPlaying ? '' : 'paused'}`}
                                        >
                                            {artFailed ? (
                                                <span className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-chip to-canvas">
                                                    <LuMusic2 className="h-14 w-14 text-on-surface-variant opacity-40" />
                                                </span>
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
                                            <span
                                                className="pointer-events-none absolute inset-0 rounded-full"
                                                style={GROOVE_OVERLAY_STYLE}
                                            />
                                            {/* Specular light reflection */}
                                            <span
                                                className="pointer-events-none absolute inset-0 rounded-full"
                                                style={SPECULAR_SHEEN_STYLE}
                                            />
                                            {/* Center label + spindle */}
                                            <span className="absolute top-1/2 left-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-line-strong/40 bg-canvas/90 shadow-2xl backdrop-blur-md">
                                                <span className="font-mono text-[11px] font-bold tracking-widest text-primary-container">
                                                    SPOTIRID
                                                </span>
                                                <span className="mt-0.5 font-mono text-[11px] tracking-wider text-on-surface-variant">
                                                    SIDE A ·{' '}
                                                    {rpm === 33 ? '33⅓' : '45'}
                                                </span>
                                                <span className="mt-1 flex h-4 w-4 items-center justify-center rounded-full border border-black/40 bg-linear-to-br from-zinc-200 via-zinc-400 to-zinc-700 shadow-inner">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-black" />
                                                </span>
                                            </span>
                                            {/* Runout groove band */}
                                            <span className="pointer-events-none absolute top-1/2 left-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-line-strong/20" />
                                        </span>

                                        {/* Play/pause affordance (static) */}
                                        <span
                                            aria-hidden="true"
                                            className="absolute inset-0 z-20 flex items-center justify-center rounded-full bg-canvas/40 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
                                        >
                                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-on-primary-container shadow-lg">
                                                {isPlaying ? (
                                                    <LuPause className="h-5 w-5 fill-current" />
                                                ) : (
                                                    <LuPlay className="ml-0.5 h-5 w-5 fill-current" />
                                                )}
                                            </span>
                                        </span>
                                    </button>
                                </div>

                                {/* Brushed metallic tonearm */}
                                <div className="pointer-events-none absolute -top-6 right-0 z-30 hidden select-none sm:block sm:right-4">
                                    <svg
                                        width="140"
                                        height="340"
                                        viewBox="0 0 140 340"
                                        fill="none"
                                        className="drop-shadow-[0_12px_24px_rgba(0,0,0,0.55)]"
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

                            {/* Deck bottom: motor status */}
                            <div className="z-20 flex items-center justify-between gap-3 border-t border-line/60 pt-4">
                                <button
                                    type="button"
                                    onClick={togglePlay}
                                    aria-pressed={isPlaying}
                                    aria-label={
                                        isPlaying
                                            ? 'Pause playback'
                                            : 'Start playback'
                                    }
                                    className={`flex items-center gap-2 rounded-full border border-line-strong/30 bg-overlay/80 px-4 py-2 font-mono text-xs font-semibold text-ink transition-colors duration-200 ease-out hover:bg-chip active:scale-90 motion-reduce:transition-none motion-reduce:active:scale-100 ${FOCUS_RING}`}
                                >
                                    <span
                                        aria-hidden="true"
                                        className={`h-2.5 w-2.5 rounded-full ${
                                            isPlaying
                                                ? 'bg-primary-container shadow-[0_0_8px_var(--accent-glow)]'
                                                : 'bg-on-surface-variant/50'
                                        }`}
                                    />
                                    {isPlaying ? 'MOTOR ON' : 'STANDBY'}
                                </button>
                                <span className="font-mono text-xs tracking-wider text-on-surface-variant">
                                    QUARTZ LOCKED · {rpm} RPM
                                </span>
                            </div>
                        </div>

                        {/* Track meta */}
                        <div className="mt-6 flex w-full max-w-[620px] flex-col gap-3">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                <div className="min-w-0">
                                    <div className="mb-1 flex items-center gap-2">
                                        <span className="rounded border border-primary-container/30 bg-primary-container/15 px-2 py-0.5 font-mono text-[11px] font-bold tracking-widest text-primary-container uppercase">
                                            Now Rotating
                                        </span>
                                        {currentSong.genre && (
                                            <span className="font-mono text-xs tracking-wider text-on-surface-variant uppercase">
                                                {currentSong.genre}
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="truncate font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                                        {currentSong.title}
                                    </h1>
                                    <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm font-semibold text-ink-secondary">
                                        <span>{currentSong.artist}</span>
                                        {currentSong.album && (
                                            <>
                                                <span
                                                    aria-hidden="true"
                                                    className="text-on-surface-variant/60"
                                                >
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
                                        aria-pressed={isLiked}
                                        title={
                                            isLiked
                                                ? 'Remove from favorites'
                                                : 'Add to favorites'
                                        }
                                        className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-colors duration-200 ease-out motion-reduce:transition-none ${FOCUS_RING} ${
                                            isLiked
                                                ? 'border-primary-container/30 bg-primary-container/15 text-primary-container'
                                                : 'border-line-strong/30 bg-overlay/70 text-ink-secondary hover:bg-chip hover:text-ink'
                                        } ${isLiked ? 'like-pop' : ''}`}
                                    >
                                        <LuHeart
                                            aria-hidden="true"
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
                                        className={`flex h-11 w-11 items-center justify-center rounded-xl border border-line-strong/30 bg-overlay/70 text-ink-secondary transition-colors duration-200 ease-out hover:bg-chip hover:text-ink motion-reduce:transition-none ${FOCUS_RING}`}
                                    >
                                        <LuListMusic
                                            aria-hidden="true"
                                            className="h-5 w-5"
                                        />
                                    </button>
                                    {currentSong.youtubeUrl ? (
                                        <a
                                            href={currentSong.youtubeUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label="Watch on YouTube"
                                            title="Watch on YouTube"
                                            className={`flex h-11 w-11 items-center justify-center rounded-xl border border-line-strong/30 bg-overlay/70 text-ink-secondary transition-colors duration-200 ease-out hover:bg-chip hover:text-ink motion-reduce:transition-none ${FOCUS_RING}`}
                                        >
                                            <LuExternalLink
                                                aria-hidden="true"
                                                className="h-5 w-5"
                                            />
                                        </a>
                                    ) : (
                                        <span
                                            aria-hidden="true"
                                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-line-strong/30 bg-overlay/70 text-on-surface-variant opacity-50"
                                        >
                                            <LuEllipsis
                                                aria-hidden="true"
                                                className="h-5 w-5"
                                            />
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Format badges */}
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                <span className="flex items-center gap-1.5 rounded-full border border-line-strong/40 bg-raised px-3 py-1 font-mono text-xs text-ink shadow-sm">
                                    <span
                                        aria-hidden="true"
                                        className="h-1.5 w-1.5 rounded-full bg-primary-container"
                                    />
                                    {qualityLabel(currentSong)}
                                </span>
                                <span className="flex items-center gap-1.5 rounded-full border border-line-strong/40 bg-raised px-3 py-1 font-mono text-xs text-ink shadow-sm">
                                    <LuDisc3
                                        aria-hidden="true"
                                        className="h-3.5 w-3.5 text-primary-container"
                                    />
                                    Vinyl Picture Disc
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* RIGHT: Synced lyrics panel */}
                    <section className="flex h-[460px] flex-col lg:col-span-5 lg:h-[580px]">
                        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl border border-line-strong/20 bg-inset/80 p-5 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:p-6 md:p-8">
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute top-1/3 -right-20 h-60 w-60 rounded-full bg-primary-container/10 blur-[80px]"
                            />

                            {/* Header */}
                            <div className="z-10 flex items-center justify-between border-b border-line/60 pb-4">
                                <div className="flex items-center gap-3">
                                    <span className="rounded bg-primary-container px-2.5 py-1 font-mono text-xs font-bold tracking-wider text-on-primary-container">
                                        LYRICS
                                    </span>
                                    <span className="hidden items-center gap-1.5 font-mono text-xs text-ink-secondary sm:flex">
                                        <span
                                            aria-hidden="true"
                                            className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-container motion-reduce:animate-none"
                                        />
                                        SYNCED
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
                                    className={`rounded-lg p-2 text-ink-secondary transition-colors duration-200 ease-out hover:bg-overlay hover:text-ink motion-reduce:transition-none ${FOCUS_RING}`}
                                >
                                    <LuMaximize
                                        aria-hidden="true"
                                        className="h-4 w-4"
                                    />
                                </button>
                            </div>

                            {/* Body */}
                            <div
                                ref={lyricsScrollRef}
                                className="z-10 my-2 min-h-0 flex-1 overflow-y-auto overscroll-contain py-4 pr-1 select-none"
                            >
                                {lyricsLoading ? (
                                    <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3">
                                        <div
                                            aria-hidden="true"
                                            className="h-6 w-6 animate-spin rounded-full border-2 border-primary-container border-t-transparent motion-reduce:animate-none"
                                        />
                                        <p className="font-mono text-xs text-on-surface-variant">
                                            Searching lyrics database...
                                        </p>
                                    </div>
                                ) : parsedLines ? (
                                    <div className="flex flex-col gap-2">
                                        {parsedLines.map((line, idx) => {
                                            const isActive =
                                                idx === activeIndex;
                                            return (
                                                <button
                                                    type="button"
                                                    key={idx}
                                                    ref={
                                                        isActive
                                                            ? activeLineRef
                                                            : null
                                                    }
                                                    onClick={() =>
                                                        seekTo(line.time)
                                                    }
                                                    aria-current={
                                                        isActive
                                                            ? 'true'
                                                            : undefined
                                                    }
                                                    className={`group flex w-full items-start gap-3 rounded-xl border-l-4 p-3 text-left transition-colors duration-200 ease-out motion-reduce:transition-none ${FOCUS_RING} ${
                                                        isActive
                                                            ? 'border-primary-container bg-overlay/70 shadow-[0_0_24px_var(--accent-glow)]'
                                                            : 'border-transparent opacity-40 hover:bg-overlay/40 hover:opacity-80'
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
                                                            <LuPlay
                                                                aria-hidden="true"
                                                                className="h-3 w-3 fill-current"
                                                            />
                                                        )}
                                                        {formatSeconds(
                                                            line.time,
                                                        )}
                                                    </span>
                                                    <span
                                                        className={`font-display tracking-tight ${
                                                            isActive
                                                                ? 'text-lg font-bold text-ink sm:text-xl'
                                                                : 'text-base font-semibold text-ink-secondary group-hover:text-ink'
                                                        }`}
                                                    >
                                                        {line.text || (
                                                            <span className="inline-flex items-center gap-1.5 opacity-60">
                                                                <LuMusic className="h-4 w-4" aria-hidden="true" />
                                                                <LuMusic className="h-3.5 w-3.5" aria-hidden="true" />
                                                            </span>
                                                        )}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : lyricsData && lyricsData.plainLyrics ? (
                                    <p className="py-2 text-sm leading-relaxed font-medium whitespace-pre-line text-ink-secondary md:text-base">
                                        {lyricsData.plainLyrics}
                                    </p>
                                ) : (
                                    <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 text-center">
                                        <LuMusic2
                                            aria-hidden="true"
                                            className="h-9 w-9 text-on-surface-variant opacity-30"
                                        />
                                        <p className="text-sm font-semibold text-ink-secondary">
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
                            <div className="z-10 flex items-center justify-between border-t border-line/60 pt-3 text-on-surface-variant">
                                <div className="flex items-center gap-2">
                                    <LuMicVocal
                                        aria-hidden="true"
                                        className="h-4 w-4 text-primary-container"
                                    />
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
            <footer className="fixed right-0 bottom-4 left-0 z-20 mx-auto max-w-[1400px] px-4 sm:px-8 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
                <div className="player-glass grid grid-cols-1 gap-3 rounded-2xl border border-line-strong/20 px-4 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.6)] sm:px-6 sm:py-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] lg:items-center lg:gap-6">
                    {/* Left: current track mini */}
                    <div className="hidden min-w-0 items-center gap-3 lg:flex">
                        <div className="relative aspect-square h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-line-strong/20 bg-chip">
                            {artFailed ? (
                                <span className="flex h-full w-full items-center justify-center">
                                    <LuMusic2
                                        aria-hidden="true"
                                        className="h-5 w-5 text-on-surface-variant opacity-50"
                                    />
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
                            <h4 className="truncate font-display text-sm font-bold text-ink">
                                {currentSong.title}
                            </h4>
                            <p className="truncate text-xs text-on-surface-variant">
                                {currentSong.artist}
                            </p>
                        </div>
                    </div>

                    {/* Center: transport + scrubber */}
                    <div className="flex w-full min-w-0 flex-col items-center gap-2">
                        <div className="flex items-center gap-5 sm:gap-7">
                            <button
                                type="button"
                                onClick={toggleShuffle}
                                aria-pressed={isShuffle}
                                aria-label="Shuffle"
                                title="Shuffle"
                                className={`rounded-full p-2 transition-colors duration-200 ease-out active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100 ${FOCUS_RING} ${
                                    isShuffle
                                        ? 'text-primary-container'
                                        : 'text-ink-secondary hover:text-ink'
                                }`}
                            >
                                <LuShuffle aria-hidden="true" className="h-5 w-5" />
                            </button>

                            <button
                                type="button"
                                onClick={prevSong}
                                aria-label="Previous track"
                                className={`rounded-full p-2 text-ink transition-colors duration-200 ease-out hover:text-primary-container active:scale-90 motion-reduce:transition-none motion-reduce:active:scale-100 ${FOCUS_RING}`}
                            >
                                <LuSkipBack
                                    aria-hidden="true"
                                    className="h-6 w-6 fill-current"
                                />
                            </button>

                            <button
                                type="button"
                                onClick={togglePlay}
                                aria-label={isPlaying ? 'Pause' : 'Play'}
                                className={`flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-on-primary-container shadow-[0_0_32px_var(--accent-glow)] transition-transform duration-200 ease-out hover:scale-105 active:scale-95 motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100 ${FOCUS_RING}`}
                            >
                                {isPlaying ? (
                                    <LuPause
                                        aria-hidden="true"
                                        className="h-6 w-6 fill-current"
                                    />
                                ) : (
                                    <LuPlay
                                        aria-hidden="true"
                                        className="ml-0.5 h-6 w-6 fill-current"
                                    />
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={nextSong}
                                aria-label="Next track"
                                className={`rounded-full p-2 text-ink transition-colors duration-200 ease-out hover:text-primary-container active:scale-90 motion-reduce:transition-none motion-reduce:active:scale-100 ${FOCUS_RING}`}
                            >
                                <LuSkipForward
                                    aria-hidden="true"
                                    className="h-6 w-6 fill-current"
                                />
                            </button>

                            <button
                                type="button"
                                onClick={cycleRepeat}
                                aria-label={`Repeat: ${repeatMode}`}
                                aria-pressed={repeatMode !== 'off'}
                                className={`rounded-full p-2 transition-colors duration-200 ease-out active:scale-90 motion-reduce:transition-none motion-reduce:active:scale-100 ${FOCUS_RING} ${
                                    repeatMode !== 'off'
                                        ? 'text-primary-container'
                                        : 'text-ink-secondary hover:text-ink'
                                }`}
                            >
                                {repeatMode === 'one' ? (
                                    <LuRepeat1
                                        aria-hidden="true"
                                        className="h-5 w-5"
                                    />
                                ) : (
                                    <LuRepeat
                                        aria-hidden="true"
                                        className="h-5 w-5"
                                    />
                                )}
                            </button>
                        </div>

                        {/* Scrubber */}
                        <div className="flex w-full items-center gap-3">
                            <span className="w-10 text-right font-mono text-[11px] text-on-surface-variant tabular-nums">
                                {formatSeconds(currentTime)}
                            </span>
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
                                style={{
                                    '--range-progress': progressPct / 100,
                                }}
                                className="player-range--custom focus-ring min-w-0 flex-1"
                            />
                            <span className="w-10 font-mono text-[11px] text-on-surface-variant tabular-nums">
                                {formatSeconds(duration)}
                            </span>
                        </div>
                    </div>

                    {/* Right: volume */}
                    <div className="hidden min-w-0 items-center justify-end gap-3 lg:flex">
                        <button
                            type="button"
                            onClick={() => setIsMuted(!isMuted)}
                            aria-label={isMuted ? 'Unmute' : 'Mute'}
                            title={isMuted ? 'Unmute' : 'Mute'}
                            className={`rounded-md p-1.5 text-ink-secondary transition-colors duration-200 ease-out hover:text-ink motion-reduce:transition-none ${FOCUS_RING}`}
                        >
                            {isMuted || volume === 0 ? (
                                <LuVolumeX
                                    aria-hidden="true"
                                    className="h-5 w-5"
                                />
                            ) : (
                                <LuVolume2
                                    aria-hidden="true"
                                    className="h-5 w-5"
                                />
                            )}
                        </button>
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
                            style={{ '--range-progress': volumePct / 100 }}
                            className="player-range--custom focus-ring w-24 flex-shrink-0"
                        />
                        <span
                            className="flex items-center gap-1.5 rounded border border-line-strong/30 bg-overlay px-2.5 py-1 font-mono text-[11px] font-bold tracking-wider text-ink"
                            title="Lossless output"
                        >
                            <LuWaves
                                aria-hidden="true"
                                className="h-3.5 w-3.5 text-primary-container"
                            />
                            LOSSLESS
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
