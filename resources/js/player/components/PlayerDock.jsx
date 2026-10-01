import React from 'react';
import { useAudio } from '../context/AudioContext';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  Heart, Volume2, VolumeX, Mic, ListMusic, ExternalLink, Disc
} from 'lucide-react';

function formatSeconds(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default function PlayerDock({ onToggleLyrics, onToggleQueue, isLyricsOpen, isQueueOpen }) {
  const {
    currentSong, isPlaying, currentTime, duration, volume, setVolume,
    isMuted, setIsMuted, isShuffle, toggleShuffle, repeatMode, cycleRepeat,
    togglePlay, nextSong, prevSong, seekTo, favorites, toggleFavorite, queue
  } = useAudio();

  if (!currentSong) return null;

  const isLiked = favorites.includes(currentSong.id);
  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-18 md:h-22 bg-[#0d0e11]/95 backdrop-blur-xl border-t border-[#454934]/30 px-3 md:px-6 flex items-center justify-between z-50 pb-[env(safe-area-inset-bottom)]">
      {/* Thin Top Scrubber for Mobile with generous touch target */}
      <div
        className="md:hidden absolute -top-2 left-0 right-0 h-4 bg-transparent cursor-pointer z-10 flex items-center"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pos = (e.clientX - rect.left) / rect.width;
          seekTo(pos * (duration || 0));
        }}
      >
        <div className="w-full h-1 bg-[#292a2d]">
          <div
            className="h-full bg-primary-container transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Left Zone: Current Track Info */}
      <div className="flex items-center gap-2.5 md:gap-4 min-w-0 flex-1 md:flex-initial md:w-1/4 md:min-w-[220px]">
        <div className="relative h-11 w-11 md:h-14 md:w-14 rounded-md overflow-hidden bg-[#292a2d] border border-[#454934]/30 flex-shrink-0">
          <img
            src={currentSong.img}
            alt={currentSong.title}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect width=%22100%22 height=%22100%22 fill=%22%23282828%22/%3E%3Ctext x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22%23727272%22 font-size=%2230%22%3E🎵%3C/text%3E%3C/svg%3E';
            }}
          />
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className={`text-xs md:text-sm font-semibold truncate font-display ${isPlaying ? 'text-primary-container' : 'text-white'}`}>
              {currentSong.title}
            </span>
            <span className="hidden lg:inline px-1.5 py-0.2 rounded bg-primary-container/20 text-primary-container text-[9px] font-mono border border-primary-container/30 uppercase flex-shrink-0">
              LOSSLESS
            </span>
          </div>
          <span className="text-[11px] md:text-xs text-on-surface-variant truncate">
            {currentSong.artist}
          </span>
        </div>

        {/* Favorite */}
        <button
          onClick={() => toggleFavorite(currentSong.id)}
          className={`p-1.5 rounded-full transition-all flex-shrink-0 ${
            isLiked ? 'text-primary-container' : 'text-on-surface-variant hover:text-white'
          }`}
          title={isLiked ? 'Unlike' : 'Like'}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        {/* YouTube link if exists (large desktop only) */}
        {currentSong.youtubeUrl && (
          <a
            href={currentSong.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-full text-on-surface-variant hover:text-red-400 transition-colors hidden xl:block flex-shrink-0"
            title="Watch on YouTube"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Mobile Right Controls (< md) */}
      <div className="flex md:hidden items-center gap-0.5 sm:gap-1 flex-shrink-0">
        <button
          onClick={prevSong}
          className="hidden xs:flex p-2 text-on-surface-variant hover:text-white active:scale-95 transition-all"
          title="Previous"
        >
          <SkipBack className="w-4 h-4 fill-current" />
        </button>

        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center active:scale-90 transition-all shadow-[0_0_12px_var(--accent-glow)]"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>

        <button
          onClick={() => nextSong()}
          className="p-2 text-on-surface-variant hover:text-white active:scale-95 transition-all"
          title="Next"
        >
          <SkipForward className="w-4 h-4 fill-current" />
        </button>

        <button
          onClick={onToggleLyrics}
          className={`p-2 rounded-lg transition-colors ${
            isLyricsOpen ? 'text-primary-container' : 'text-on-surface-variant'
          }`}
          title="Lyrics"
        >
          <Mic className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleQueue}
          className={`relative p-2 rounded-lg transition-colors ${
            isQueueOpen ? 'text-primary-container' : 'text-on-surface-variant'
          }`}
          title="Queue"
        >
          <ListMusic className="w-4 h-4" />
          {queue.length > 0 && (
            <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-primary-container text-on-primary-container font-mono text-[8px] font-bold flex items-center justify-center">
              {queue.length}
            </span>
          )}
        </button>
      </div>

      {/* Desktop Center Zone: Transport Controls & Scrubber (>= md) */}
      <div className="hidden md:flex flex-col items-center gap-1.5 max-w-xl w-2/4">
        {/* Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleShuffle}
            className={`p-1.5 rounded-full transition-colors ${
              isShuffle ? 'text-primary-container' : 'text-on-surface-variant hover:text-white'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={prevSong}
            className="p-1.5 text-on-surface-variant hover:text-white transition-colors"
            title="Previous (or restart)"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_12px_var(--accent-glow)]"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={() => nextSong()}
            className="p-1.5 text-on-surface-variant hover:text-white transition-colors"
            title="Next"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={cycleRepeat}
            className={`p-1.5 rounded-full transition-colors ${
              repeatMode !== 'off' ? 'text-primary-container' : 'text-on-surface-variant hover:text-white'
            }`}
            title={`Repeat: ${repeatMode.toUpperCase()}`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>
        </div>

        {/* Scrubber Bar */}
        <div className="flex items-center gap-3 w-full">
          <span className="text-[11px] font-mono text-on-surface-variant w-10 text-right">
            {formatSeconds(currentTime)}
          </span>

          <div className="relative flex-1 group py-2">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime || 0}
              onChange={(e) => seekTo(parseFloat(e.target.value))}
              className="w-full h-1 bg-[#292a2d] rounded-lg appearance-none cursor-pointer accent-primary-container focus:outline-none"
            />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary-container rounded-lg pointer-events-none group-hover:h-1.5 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <span className="text-[11px] font-mono text-on-surface-variant w-10">
            {formatSeconds(duration)}
          </span>
        </div>
      </div>

      {/* Desktop Right Zone: Lyrics, Queue, Volume (>= md) */}
      <div className="hidden md:flex items-center justify-end gap-3 w-1/4 min-w-[200px]">
        {/* Lyrics Button */}
        <button
          onClick={onToggleLyrics}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-all ${
            isLyricsOpen
              ? 'bg-primary-container text-on-primary-container shadow-[0_0_12px_var(--accent-glow)]'
              : 'bg-[#1b1b1f] border border-[#454934]/30 text-on-surface-variant hover:text-white hover:bg-[#292a2d]'
          }`}
          title="Toggle Lyrics"
        >
          <Mic className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Lyrics</span>
        </button>

        {/* Queue Button */}
        <button
          onClick={onToggleQueue}
          className={`relative p-2 rounded-lg transition-colors ${
            isQueueOpen
              ? 'bg-[#292a2d] text-primary-container'
              : 'text-on-surface-variant hover:text-white hover:bg-[#1b1b1f]'
          }`}
          title="Toggle Queue"
        >
          <ListMusic className="w-5 h-5" />
          {queue.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary-container text-on-primary-container font-mono text-[9px] font-bold flex items-center justify-center">
              {queue.length}
            </span>
          )}
        </button>

        {/* Volume */}
        <div className="flex items-center gap-2 group">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-on-surface-variant hover:text-white"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
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
            className="w-20 h-1 bg-[#292a2d] rounded-lg appearance-none cursor-pointer accent-primary-container"
          />
        </div>
      </div>
    </footer>
  );
}
