import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { LuExternalLink, LuHeart, LuListMusic, LuMic, LuMusic2, LuPause, LuPlay, LuRepeat, LuRepeat1, LuShuffle, LuSkipBack, LuSkipForward, LuVolume2, LuVolumeX } from 'react-icons/lu';
import { formatSeconds } from '../format';
import { MagneticButton } from '../utils/magneticTilt.jsx';


const TRANSPORT_BUTTON =
    'focus-ring rounded-full p-1.5 text-on-surface-variant transition-colors duration-200 ease-out hover:text-ink-strong motion-reduce:transition-none';

export default function PlayerDock({
    onToggleLyrics,
    onToggleQueue,
    onOpenNowPlaying,
    isLyricsOpen,
    isQueueOpen,
}) {
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
        queue,
    } = useAudio();

    const [artFailed, setArtFailed] = useState(false);
    const [artSongId, setArtSongId] = useState(null);

    // Reset the art fallback whenever the track changes.
    if (currentSong && artSongId !== currentSong.id) {
        setArtSongId(currentSong.id);
        setArtFailed(false);
    }

    if (!currentSong) return null;

    const isLiked = favorites.includes(currentSong.id);
    const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <footer className="player-glass fixed right-0 bottom-[calc(var(--player-nav-h)+env(safe-area-inset-bottom))] left-0 z-50 grid min-h-18 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1 border-t border-line-strong/30 px-3 pt-2 pb-2 md:bottom-0 md:min-h-22 md:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)_minmax(0,1fr)] md:gap-4 md:px-6 md:pb-3">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px">
                <div className={`h-px w-full ${isPlaying ? 'dock-glow' : ''}`} style={{ background: 'linear-gradient(90deg, transparent, var(--accent-color), transparent)', boxShadow: isPlaying ? '0 0 24px var(--accent-glow)' : 'none' }} />
            </div>

            {/* Thin Top Scrubber for Mobile with generous touch target */}
            <div
                aria-hidden="true"
                className="absolute -top-2 right-0 left-0 z-10 flex h-4 cursor-pointer items-center bg-transparent md:hidden"
                onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pos = (e.clientX - rect.left) / rect.width;
                    seekTo(pos * (duration || 0));
                }}
            >
                <div className="h-1 w-full overflow-hidden rounded-full bg-chip">
                    <div
                        className="h-full w-full origin-left bg-primary-container transition-transform duration-150 ease-linear motion-reduce:transition-none"
                        style={{ transform: `scaleX(${progressPct / 100})` }}
                    />
                </div>
            </div>

            {/* Left Zone: Current Track Info */}
            <div className="flex min-w-0 items-center gap-2.5 md:gap-4">
                <button
                    type="button"
                onClick={onOpenNowPlaying}
                title="Open now playing view"
                aria-label="Open now playing view"
                className="focus-ring flex min-w-0 flex-1 items-center gap-2.5 rounded-lg text-left transition-opacity duration-200 ease-out hover:opacity-75 motion-reduce:transition-none md:gap-4"
                onPointerDown={(e) => {
                    // Allow the click to fire while not blocking horizontal scroll
                    if (e.pointerType === 'touch') {
                        e.currentTarget.dataset.pd = String(e.clientY);
                    }
                }}
                onTouchStart={(e) => {
                    e.currentTarget.dataset.ts = String(e.touches[0].clientY);
                }}
                onTouchEnd={(e) => {
                    const start = parseFloat(e.currentTarget.dataset.ts || '0');
                    const end = e.changedTouches[0].clientY;
                    if (start > 0 && end - start < -40) {
                        onOpenNowPlaying();
                    }
                    delete e.currentTarget.dataset.ts;
                }}
            >

                    <div className={`relative aspect-square h-11 w-11 flex-shrink-0 overflow-hidden rounded-md border border-line-strong/30 bg-chip md:h-14 md:w-14 ${isPlaying ? 'spinning-vinyl' : 'spinning-vinyl paused'}`}>
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            <span className="absolute inset-0 rounded-full border border-white/5" />
                            <span className="absolute h-1/2 w-1/2 rounded-full border border-white/10" />
                        </div>
                        {artFailed ? (
                            <span className="flex h-full w-full items-center justify-center">
                                <LuMusic2 className="h-5 w-5 text-on-surface-variant opacity-50" />
                            </span>
                        ) : (
                            <img
                                src={currentSong.img}
                                alt={currentSong.title}
                                onError={() => setArtFailed(true)}
                                className="h-full w-full object-cover rounded-full scale-90"
                            />
                        )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex min-w-0 items-center gap-1.5">
                            <span
                                className={`min-w-0 truncate font-display text-xs font-semibold md:text-sm ${isPlaying ? 'text-primary-container' : 'text-ink-strong'}`}
                            >
                                {currentSong.title}
                            </span>
                            <span className="hidden flex-shrink-0 rounded border border-primary-container/30 bg-primary-container/20 px-1.5 py-0.5 font-mono text-[10px] text-primary-container uppercase lg:inline">
                                LOSSLESS
                            </span>
                        </div>
                        <div className="flex min-w-0 items-center gap-1.5">
                            <span className="min-w-0 truncate text-[11px] text-on-surface-variant md:text-xs">
                                {currentSong.artist}
                            </span>
                            {isPlaying && (
                                <div className="flex flex-shrink-0 items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/40 backdrop-blur-sm">
                                    {[0, 1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="eq-bar"
                                            style={{ animationDelay: `${i * 70}ms` }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </button>

                {/* Favorite */}
                <button
                    type="button"
                    onClick={() => toggleFavorite(currentSong.id)}
                    aria-label={
                        isLiked
                            ? `Remove ${currentSong.title} from liked songs`
                            : `Add ${currentSong.title} to liked songs`
                    }
                    aria-pressed={isLiked}
                    className={`tap-target focus-ring flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-200 ease-out motion-reduce:transition-none ${
                        isLiked
                            ? 'text-primary-container'
                            : 'text-on-surface-variant hover:text-ink-strong'
                    } ${isLiked ? 'like-pop' : ''}`}
                >
                    <LuHeart
                        className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`}
                    />
                </button>
            </div>

            <div className="flex flex-shrink-0 items-center gap-0.5 sm:gap-1 md:hidden">
                <button
                    type="button"
                    onClick={prevSong}
                    aria-label="Previous track"
                    className="tap-target focus-ring flex h-11 w-11 items-center justify-center p-2 text-on-surface-variant transition-colors duration-200 ease-out hover:text-ink-strong active:scale-95 motion-reduce:transition-none"
                >
                    <LuSkipBack className="h-4 w-4 fill-current" />
                </button>

                <MagneticButton
                    type="button"
                    strength={8}
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                    className="tap-target focus-ring flex h-11 w-11 items-center justify-center rounded-full bg-primary-container text-on-primary-container shadow-[0_0_16px_var(--accent-glow)] transition-transform duration-200 ease-out active:scale-90 motion-reduce:transition-none motion-reduce:active:scale-100"
                >
                    {isPlaying ? (
                        <LuPause className="h-4 w-4 fill-current" />
                    ) : (
                        <LuPlay className="ml-0.5 h-4 w-4 fill-current" />
                    )}
                </MagneticButton>

                <button
                    type="button"
                    onClick={() => nextSong()}
                    aria-label="Next track"
                    className="tap-target focus-ring flex h-11 w-11 items-center justify-center p-2 text-on-surface-variant transition-colors duration-200 ease-out hover:text-ink-strong motion-reduce:transition-none"
                >
                    <LuSkipForward className="h-4 w-4 fill-current" />
                </button>

                <button
                    type="button"
                    onClick={onToggleLyrics}
                    aria-label="Toggle lyrics"
                    aria-pressed={isLyricsOpen}
                    className={`tap-target focus-ring flex h-11 w-11 items-center justify-center rounded-lg p-2 transition-colors duration-200 ease-out motion-reduce:transition-none ${
                        isLyricsOpen
                            ? 'text-primary-container'
                            : 'text-on-surface-variant'
                    }`}
                >
                    <LuMic className="h-4 w-4" />
                </button>

                <button
                    type="button"
                    onClick={onToggleQueue}
                    aria-label="Toggle queue"
                    aria-pressed={isQueueOpen}
                    className={`tap-target focus-ring relative flex h-11 w-11 items-center justify-center rounded-lg p-2 transition-colors duration-200 ease-out motion-reduce:transition-none ${
                        isQueueOpen
                            ? 'text-primary-container'
                            : 'text-on-surface-variant'
                    }`}
                >
                    <LuListMusic className="h-4 w-4" />
                    {queue.length > 0 && (
                        <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-container font-mono text-[10px] font-bold text-on-primary-container">
                            {queue.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Desktop Center Zone: Transport Controls & Scrubber (>= md) */}
            <div className="hidden min-w-0 flex-col items-center gap-1.5 md:flex">
                {/* Buttons */}
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={toggleShuffle}
                        aria-label="Toggle shuffle"
                        aria-pressed={isShuffle}
                        className={`focus-ring rounded-full p-1.5 transition-colors duration-200 ease-out motion-reduce:transition-none ${
                            isShuffle
                                ? 'text-primary-container'
                                : 'text-on-surface-variant hover:text-ink-strong'
                        }`}
                    >
                        <LuShuffle className="h-4 w-4" />
                    </button>

                    <button
                        type="button"
                        onClick={prevSong}
                        aria-label="Previous track"
                        className="tap-target focus-ring rounded-full p-1.5 text-on-surface-variant transition-colors duration-200 ease-out hover:text-ink-strong motion-reduce:transition-none"
                    >
                        <LuSkipBack className="h-5 w-5 fill-current" />
                    </button>

                    <MagneticButton
                        type="button"
                        strength={8}
                        onClick={togglePlay}
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                        className="tap-target focus-ring flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-on-primary-container shadow-[0_0_16px_var(--accent-glow)] transition-transform duration-200 ease-out hover:scale-105 active:scale-90 motion-reduce:transition-none"
                    >
                    {isPlaying ? (
                        <LuPause className="h-4 w-4 fill-current" />
                    ) : (
                        <LuPlay className="ml-0.5 h-4 w-4 fill-current" />
                    )}
                </MagneticButton>

                    <button
                        type="button"
                        onClick={() => nextSong()}
                        aria-label="Next track"
                        className="tap-target focus-ring rounded-full p-1.5 text-on-surface-variant transition-colors duration-200 ease-out hover:text-ink-strong motion-reduce:transition-none"
                    >
                        <LuSkipForward className="h-5 w-5 fill-current" />
                    </button>

                    <button
                        type="button"
                        onClick={cycleRepeat}
                        aria-label={`Repeat: ${repeatMode}`}
                        className={`focus-ring rounded-full p-1.5 transition-colors duration-200 ease-out motion-reduce:transition-none ${
                            repeatMode !== 'off'
                                ? 'text-primary-container'
                                : 'text-on-surface-variant hover:text-ink-strong'
                        }`}
                    >
                        {repeatMode === 'one' ? (
                            <LuRepeat1 className="h-4 w-4" />
                        ) : (
                            <LuRepeat className="h-4 w-4" />
                        )}
                    </button>
                </div>

                {/* Scrubber Bar */}
                <div className="flex w-full items-center gap-3">
                    <span className="w-10 text-right font-mono text-[11px] text-on-surface-variant">
                        {formatSeconds(currentTime)}
                    </span>

                    <div className="flex-1">
                        <input
                            type="range"
                            min={0}
                            max={duration || 100}
                            step={0.1}
                            value={currentTime || 0}
                            onChange={(e) => seekTo(parseFloat(e.target.value))}
                            aria-label="Seek within track"
                            className="player-range focus-ring"
                        />
                    </div>

                    <span className="w-10 font-mono text-[11px] text-on-surface-variant">
                        {formatSeconds(duration)}
                    </span>
                </div>
            </div>

            {/* Desktop Right Zone: Lyrics, Queue, Volume (>= md) */}
            <div className="hidden min-w-0 items-center justify-end gap-3 md:flex">
                {/* Lyrics Button */}
                <button
                    type="button"
                    onClick={onToggleLyrics}
                    aria-label="Toggle lyrics"
                    aria-pressed={isLyricsOpen}
                    className={`tap-target focus-ring flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-200 ease-out motion-reduce:transition-none ${
                        isLyricsOpen
                            ? 'bg-primary-container text-on-primary-container shadow-[0_0_12px_var(--accent-glow)]'
                            : 'border border-line-strong/30 bg-raised text-on-surface-variant hover:bg-chip hover:text-ink-strong'
                    }`}
                >
                    <LuMic className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only">Lyrics</span>
                </button>

                {/* Queue Button */}
                <button
                    type="button"
                    onClick={onToggleQueue}
                    aria-label="Toggle queue"
                    aria-pressed={isQueueOpen}
                    className={`tap-target focus-ring relative flex h-11 w-11 items-center justify-center rounded-lg p-2 transition-colors duration-200 ease-out motion-reduce:transition-none ${
                        isQueueOpen
                            ? 'bg-chip text-primary-container'
                            : 'text-on-surface-variant hover:bg-raised hover:text-ink-strong'
                    }`}
                >
                    <LuListMusic className="h-5 w-5" />
                    {queue.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-container font-mono text-[10px] font-bold text-on-primary-container">
                            {queue.length}
                        </span>
                    )}
                </button>

                {/* Volume */}
                <div className="group flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIsMuted(!isMuted)}
                        aria-label={isMuted ? 'Unmute' : 'Mute'}
                        aria-pressed={isMuted}
                        className="focus-ring rounded-full text-on-surface-variant transition-colors duration-200 ease-out hover:text-ink-strong motion-reduce:transition-none"
                    >
                        {isMuted || volume === 0 ? (
                            <LuVolumeX className="h-4 w-4" />
                        ) : (
                            <LuVolume2 className="h-4 w-4" />
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
                        className="player-range focus-ring w-20"
                    />
                </div>
            </div>
        </footer>
    );
}
