import React from 'react';
import { useAudio } from '../context/AudioContext';
import { Play, Pause, Heart, Mic, Disc3 } from 'lucide-react';

export default function HeroSpotlight({ onOpenLyrics }) {
  const { currentSong, isPlaying, togglePlay, favorites, toggleFavorite, queue, songs } = useAudio();

  if (!currentSong) return null;

  const isLiked = favorites.includes(currentSong.id);
  const queueIdx = queue.indexOf(currentSong.id);
  const queueText = queueIdx >= 0
    ? `0${queueIdx + 1} OF 0${queue.length} IN QUEUE`
    : `TRACK 01 OF 0${songs.length || 1} IN ROTATION`;

  return (
    <section className="relative overflow-hidden rounded-2xl bg-[#1b1b1f] border border-[#454934]/30 p-4 sm:p-6 md:p-8 flex flex-col lg:flex-row items-center gap-6 md:gap-8 group shadow-xl">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 transition-all duration-700" />

      {/* Album Art with Vinyl Record Peeking Out */}
      <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 flex-shrink-0 flex items-center justify-center">
        {/* Grooved Vinyl Disc */}
        <div className={`absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-black border-4 border-[#222] shadow-2xl flex items-center justify-center transition-transform duration-500 group-hover:translate-x-4 ${
          isPlaying ? 'spinning-vinyl' : 'spinning-vinyl paused'
        }`}>
          <div className="w-28 h-28 rounded-full border border-neutral-800 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-primary-container/20 border border-primary-container/40 flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-full bg-black" />
            </div>
          </div>
        </div>

        {/* Album Cover Sleeve */}
        <div className="relative w-full h-full rounded-xl overflow-hidden border border-[#454934]/50 shadow-2xl z-10 bg-[#292a2d]">
          <img
            src={currentSong.img}
            alt={currentSong.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect width=%22200%22 height=%22200%22 fill=%22%23282828%22/%3E%3Ctext x=%22100%22 y=%22115%22 text-anchor=%22middle%22 fill=%22%23727272%22 font-size=%2260%22%3E%E2%9C%8D%3C/text%3E%3C/svg%3E';
            }}
          />
          <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded bg-black/80 backdrop-blur-sm border border-white/10 text-[9px] font-mono font-bold text-primary-container tracking-wider">
            {isPlaying ? 'NOW PLAYING' : 'CURRENT SELECTION'}
          </div>
        </div>
      </div>

      {/* Track Details */}
      <div className="flex-1 flex flex-col justify-between w-full z-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold tracking-wider text-primary-container font-display uppercase">EDITORIAL SELECTION</span>
            <span className="text-on-surface-variant text-[11px] font-mono">• {queueText}</span>
          </div>

          <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight font-display tracking-tight">
            {currentSong.title}
          </h3>

          <p className="text-base text-on-surface-variant font-medium">
            {currentSong.artist} {currentSong.album && <>— <span className="text-white/80">{currentSong.album}</span></>}
          </p>

          <p className="text-sm text-on-surface-variant/90 max-w-xl mt-1 leading-relaxed">
            {currentSong.description || 'High-fidelity audio master with wide dynamic range, rich spatial separation, and crisp frequency reproduction.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-6 flex-wrap">
          {/* Main Play Action */}
          <button
            onClick={togglePlay}
            className="px-6 py-3 rounded-full bg-primary-container text-on-primary-container font-display font-bold text-xs tracking-wider uppercase flex items-center gap-2 hover:opacity-90 transition-all duration-150 active:scale-95 shadow-[0_0_24px_var(--accent-glow)]"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>PAUSE PLAYBACK</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>RESUME PLAYBACK</span>
              </>
            )}
          </button>

          {/* Favorite */}
          <button
            onClick={() => toggleFavorite(currentSong.id)}
            className={`h-11 w-11 rounded-full bg-[#292a2d] border flex items-center justify-center transition-all ${
              isLiked
                ? 'border-primary-container text-primary-container'
                : 'border-[#454934]/40 text-white hover:border-primary-container hover:text-primary-container'
            }`}
            title={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>

          {/* Lyrics cue */}
          <button
            onClick={onOpenLyrics}
            className="px-4 py-2.5 rounded-full bg-[#292a2d] border border-[#454934]/30 flex items-center gap-2 text-xs font-mono text-on-surface-variant hover:text-white transition-colors"
          >
            <Mic className="w-4 h-4 text-primary-container" />
            <span>&quot;Show synchronized lyrics&quot;</span>
          </button>
        </div>
      </div>

      {/* Waveform / Visualizer rail */}
      <div className="hidden xl:flex flex-col items-end justify-center h-full pl-6 border-l border-[#454934]/20 z-10 min-w-[130px]">
        <div className="flex items-end gap-1.5 h-14 mb-2">
          {[8, 14, 11, 16, 6, 12, 10, 15].map((h, i) => (
            <div
              key={i}
              className={`w-1 rounded-full bg-primary-container transition-all ${isPlaying ? 'animate-pulse' : 'opacity-40'}`}
              style={{
                height: `${isPlaying ? h * 2.5 : 8}px`,
                animationDelay: `${i * 120}ms`,
              }}
            />
          ))}
        </div>
        <span className="text-[11px] font-mono text-on-surface-variant uppercase font-semibold">24-BIT / 96KHZ</span>
        <span className="text-[11px] font-mono text-primary-container uppercase font-bold">{currentSong.duration || 'LOSSLESS'}</span>
      </div>
    </section>
  );
}
