import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { LuExternalLink, LuHeart, LuListMusic, LuMic, LuMusic2, LuPause, LuPlay, LuRepeat, LuRepeat1, LuShuffle, LuSkipBack, LuSkipForward, LuVolume2, LuVolumeX } from 'react-icons/lu';
function formatSeconds(sec) {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

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
        <footer className="fixed right-0 bottom-0 left-0 z-50 flex h-18 items-center justify-between border-t border-line-strong/30 bg-chrome/95 px-3 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:h-22 md:px-6">
            {/* Thin Top Scrubber for Mobile with generous touch target */}
            <div
                className="absolute -top-2 right-0 left-0 z-10 flex h-4 cursor-pointer items-center bg-transparent md:hidden"
                onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pos = (e.clientX - rect.left) / rect.width;
                    seekTo(pos * (duration || 0));
                }}
            >
                <div className="h-1 w-full bg-chip">
                    <div
                        className="h-full bg-primary-container transition-all"
                        style={{ width: `${progressPct}%` }}
                    />
                </div>
            </div>

            {/* Left Zone: Current Track Info */}
            <div className="flex min-w-0 flex-1 items-center gap-2.5 md:w-1/4 md:min-w-[220px] md:flex-initial md:gap-4">
                <button
                    type="button"
                    onClick={onOpenNowPlaying}
                    title="Open now playing view"
                    aria-label="Open now playing view"
                    className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg text-left transition-opacity hover:opacity-75 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container/60 md:gap-4"
                >
                    <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-md border border-line-strong/30 bg-chip md:h-14 md:w-14">
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

                    <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-center gap-1.5">
                            <span
                                className={`truncate font-display text-xs font-semibold md:text-sm ${isPlaying ? 'text-primary-container' : 'text-white'}`}
                            >
                                {currentSong.title}
                            </span>
                            <span className="py-0.2 hidden flex-shrink-0 rounded border border-primary-container/30 bg-primary-container/20 px-1.5 font-mono text-[9px] text-primary-container uppercase lg:inline">
                                LOSSLESS
                            </span>
                        </div>
                        <span className="truncate text-[11px] text-on-surface-variant md:text-xs">
                            {currentSong.artist}
                        </span>
                    </div>
                </button>

                {/* Favorite */}
                <button
                    onClick={() => toggleFavorite(currentSong.id)}
                    className={`flex-shrink-0 rounded-full p-1.5 transition-all ${
                        isLiked
                            ? 'text-primary-container'
                            : 'text-on-surface-variant hover:text-white'
                    }`}
                    title={isLiked ? 'Unlike' : 'Like'}
                >
                    <LuHeart
                        className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`}
                    />
                </button>

                {/* YouTube link if exists (large desktop only) */}
                {currentSong.youtubeUrl && (
                    <a
                        href={currentSong.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden flex-shrink-0 rounded-full p-1.5 text-on-surface-variant transition-colors hover:text-red-400 xl:block"
                        title="Watch on YouTube"
                    >
                        <LuExternalLink className="h-4 w-4" />
                    </a>
                )}
            </div>

            {/* Mobile Right Controls (< md) */}
            <div className="flex flex-shrink-0 items-center gap-0.5 sm:gap-1 md:hidden">
                <button
                    onClick={prevSong}
                    className="xs:flex hidden p-2 text-on-surface-variant transition-all hover:text-white active:scale-95"
                    title="Previous"
                >
                    <LuSkipBack className="h-4 w-4 fill-current" />
                </button>

                <button
                    onClick={togglePlay}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-on-primary-container shadow-[0_0_12px_var(--accent-glow)] transition-all active:scale-90"
                    title={isPlaying ? 'Pause' : 'Play'}
                >
                    {isPlaying ? (
                        <LuPause className="h-4 w-4 fill-current" />
                    ) : (
                        <LuPlay className="ml-0.5 h-4 w-4 fill-current" />
                    )}
                </button>

                <button
                    onClick={() => nextSong()}
                    className="p-2 text-on-surface-variant transition-all hover:text-white active:scale-95"
                    title="Next"
                >
                    <LuSkipForward className="h-4 w-4 fill-current" />
                </button>

                <button
                    onClick={onToggleLyrics}
                    className={`rounded-lg p-2 transition-colors ${
                        isLyricsOpen
                            ? 'text-primary-container'
                            : 'text-on-surface-variant'
                    }`}
                    title="Lyrics"
                >
                    <LuMic className="h-4 w-4" />
                </button>

                <button
                    onClick={onToggleQueue}
                    className={`relative rounded-lg p-2 transition-colors ${
                        isQueueOpen
                            ? 'text-primary-container'
                            : 'text-on-surface-variant'
                    }`}
                    title="Queue"
                >
                    <LuListMusic className="h-4 w-4" />
                    {queue.length > 0 && (
                        <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary-container font-mono text-[8px] font-bold text-on-primary-container">
                            {queue.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Desktop Center Zone: Transport Controls & Scrubber (>= md) */}
            <div className="hidden w-2/4 max-w-xl flex-col items-center gap-1.5 md:flex">
                {/* Buttons */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleShuffle}
                        className={`rounded-full p-1.5 transition-colors ${
                            isShuffle
                                ? 'text-primary-container'
                                : 'text-on-surface-variant hover:text-white'
                        }`}
                        title="Shuffle"
                    >
                        <LuShuffle className="h-4 w-4" />
                    </button>

                    <button
                        onClick={prevSong}
                        className="p-1.5 text-on-surface-variant transition-colors hover:text-white"
                        title="Previous (or restart)"
                    >
                        <LuSkipBack className="h-5 w-5 fill-current" />
                    </button>

                    <button
                        onClick={togglePlay}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-on-primary-container shadow-[0_0_12px_var(--accent-glow)] transition-all hover:scale-105 active:scale-95"
                        title={isPlaying ? 'Pause' : 'Play'}
                    >
                        {isPlaying ? (
                            <LuPause className="h-4 w-4 fill-current" />
                        ) : (
                            <LuPlay className="ml-0.5 h-4 w-4 fill-current" />
                        )}
                    </button>

                    <button
                        onClick={() => nextSong()}
                        className="p-1.5 text-on-surface-variant transition-colors hover:text-white"
                        title="Next"
                    >
                        <LuSkipForward className="h-5 w-5 fill-current" />
                    </button>

                    <button
                        onClick={cycleRepeat}
                        className={`rounded-full p-1.5 transition-colors ${
                            repeatMode !== 'off'
                                ? 'text-primary-container'
                                : 'text-on-surface-variant hover:text-white'
                        }`}
                        title={`Repeat: ${repeatMode.toUpperCase()}`}
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

                    <div className="group relative flex-1 py-2">
                        <input
                            type="range"
                            min={0}
                            max={duration || 100}
                            step={0.1}
                            value={currentTime || 0}
                            onChange={(e) => seekTo(parseFloat(e.target.value))}
                            className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-chip accent-primary-container focus:outline-none"
                        />
                        <div
                            className="pointer-events-none absolute top-1/2 left-0 h-1 -translate-y-1/2 rounded-lg bg-primary-container transition-all group-hover:h-1.5"
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>

                    <span className="w-10 font-mono text-[11px] text-on-surface-variant">
                        {formatSeconds(duration)}
                    </span>
                </div>
            </div>

            {/* Desktop Right Zone: Lyrics, Queue, Volume (>= md) */}
            <div className="hidden w-1/4 min-w-[200px] items-center justify-end gap-3 md:flex">
                {/* Lyrics Button */}
                <button
                    onClick={onToggleLyrics}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-xs font-medium transition-all ${
                        isLyricsOpen
                            ? 'bg-primary-container text-on-primary-container shadow-[0_0_12px_var(--accent-glow)]'
                            : 'border border-line-strong/30 bg-raised text-on-surface-variant hover:bg-chip hover:text-white'
                    }`}
                    title="Toggle Lyrics"
                >
                    <LuMic className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Lyrics</span>
                </button>

                {/* Queue Button */}
                <button
                    onClick={onToggleQueue}
                    className={`relative rounded-lg p-2 transition-colors ${
                        isQueueOpen
                            ? 'bg-chip text-primary-container'
                            : 'text-on-surface-variant hover:bg-raised hover:text-white'
                    }`}
                    title="Toggle Queue"
                >
                    <LuListMusic className="h-5 w-5" />
                    {queue.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-container font-mono text-[9px] font-bold text-on-primary-container">
                            {queue.length}
                        </span>
                    )}
                </button>

                {/* Volume */}
                <div className="group flex items-center gap-2">
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="text-on-surface-variant hover:text-white"
                        title={isMuted ? 'Unmute' : 'Mute'}
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
                        className="h-1 w-20 cursor-pointer appearance-none rounded-lg bg-chip accent-primary-container"
                    />
                </div>
            </div>
        </footer>
    );
}
