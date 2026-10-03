import React from 'react';
import { useAudio } from '../context/AudioContext';
import { LuDisc3, LuHeart, LuMic, LuPause, LuPlay } from 'react-icons/lu';
export default function HeroSpotlight({ onOpenLyrics }) {
    const {
        currentSong,
        isPlaying,
        togglePlay,
        favorites,
        toggleFavorite,
        queue,
        songs,
    } = useAudio();

    if (!currentSong) return null;

    const isLiked = favorites.includes(currentSong.id);
    const queueIdx = queue.indexOf(currentSong.id);
    const queueText =
        queueIdx >= 0
            ? `0${queueIdx + 1} OF 0${queue.length} IN QUEUE`
            : `TRACK 01 OF 0${songs.length || 1} IN ROTATION`;

    return (
        <section className="group relative flex flex-col items-center gap-6 overflow-hidden rounded-2xl border border-line-strong/30 bg-raised p-4 shadow-xl sm:p-6 md:gap-8 md:p-8 lg:flex-row">
            {/* Ambient background glow */}
            <div className="pointer-events-none absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-primary-container/10 blur-3xl transition-all duration-700" />

            {/* Album Art with Vinyl Record Peeking Out */}
            <div className="relative flex h-40 w-40 flex-shrink-0 items-center justify-center sm:h-48 sm:w-48 md:h-56 md:w-56">
                {/* Grooved Vinyl Disc */}
                <div
                    className={`absolute top-1/2 -right-4 flex h-36 w-36 -translate-y-1/2 items-center justify-center rounded-full border-4 border-line bg-black shadow-2xl transition-transform duration-500 group-hover:translate-x-4 sm:-right-6 sm:h-44 sm:w-44 ${
                        isPlaying ? 'spinning-vinyl' : 'spinning-vinyl paused'
                    }`}
                >
                    <div className="flex h-28 w-28 items-center justify-center rounded-full border border-neutral-800">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-primary-container/40 bg-primary-container/20">
                            <div className="h-3.5 w-3.5 rounded-full bg-black" />
                        </div>
                    </div>
                </div>

                {/* Album Cover Sleeve */}
                <div className="relative z-10 h-full w-full overflow-hidden rounded-xl border border-line-strong/50 bg-chip shadow-2xl">
                    <img
                        src={currentSong.img}
                        alt={currentSong.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                            e.target.src =
                                'data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect width=%22200%22 height=%22200%22 fill=%22%23282828%22/%3E%3Ctext x=%22100%22 y=%22115%22 text-anchor=%22middle%22 fill=%22%23727272%22 font-size=%2260%22%3E%E2%9C%8D%3C/text%3E%3C/svg%3E';
                        }}
                    />
                    <div className="absolute top-2.5 left-2.5 rounded border border-white/10 bg-black/80 px-2.5 py-0.5 font-mono text-[9px] font-bold tracking-wider text-primary-container backdrop-blur-sm">
                        {isPlaying ? 'NOW PLAYING' : 'CURRENT SELECTION'}
                    </div>
                </div>
            </div>

            {/* Track Details */}
            <div className="z-10 flex w-full flex-1 flex-col justify-between">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <span className="font-display text-[11px] font-bold tracking-wider text-primary-container uppercase">
                            EDITORIAL SELECTION
                        </span>
                        <span className="font-mono text-[11px] text-on-surface-variant">
                            • {queueText}
                        </span>
                    </div>

                    <h3 className="font-display text-2xl leading-tight font-extrabold tracking-tight text-white md:text-3xl lg:text-4xl">
                        {currentSong.title}
                    </h3>

                    <p className="text-base font-medium text-on-surface-variant">
                        {currentSong.artist}{' '}
                        {currentSong.album && (
                            <>
                                —{' '}
                                <span className="text-white/80">
                                    {currentSong.album}
                                </span>
                            </>
                        )}
                    </p>

                    <p className="mt-1 max-w-xl text-sm leading-relaxed text-on-surface-variant/90">
                        {currentSong.description ||
                            'High-fidelity audio master with wide dynamic range, rich spatial separation, and crisp frequency reproduction.'}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-wrap items-center gap-3">
                    {/* Main Play Action */}
                    <button
                        onClick={togglePlay}
                        className="flex items-center gap-2 rounded-full bg-primary-container px-6 py-3 font-display text-xs font-bold tracking-wider text-on-primary-container uppercase shadow-[0_0_24px_var(--accent-glow)] transition-all duration-150 hover:opacity-90 active:scale-95"
                    >
                        {isPlaying ? (
                            <>
                                <LuPause className="h-4 w-4 fill-current" />
                                <span>PAUSE PLAYBACK</span>
                            </>
                        ) : (
                            <>
                                <LuPlay className="h-4 w-4 fill-current" />
                                <span>RESUME PLAYBACK</span>
                            </>
                        )}
                    </button>

                    {/* Favorite */}
                    <button
                        onClick={() => toggleFavorite(currentSong.id)}
                        className={`flex h-11 w-11 items-center justify-center rounded-full border bg-chip transition-all ${
                            isLiked
                                ? 'border-primary-container text-primary-container'
                                : 'border-line-strong/40 text-white hover:border-primary-container hover:text-primary-container'
                        }`}
                        title={isLiked ? 'Unlike' : 'Like'}
                    >
                        <LuHeart
                            className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`}
                        />
                    </button>

                    {/* Lyrics cue */}
                    <button
                        onClick={onOpenLyrics}
                        className="flex items-center gap-2 rounded-full border border-line-strong/30 bg-chip px-4 py-2.5 font-mono text-xs text-on-surface-variant transition-colors hover:text-white"
                    >
                        <LuMic className="h-4 w-4 text-primary-container" />
                        <span>&quot;Show synchronized lyrics&quot;</span>
                    </button>
                </div>
            </div>

            {/* Waveform / Visualizer rail */}
            <div className="z-10 hidden h-full min-w-[130px] flex-col items-end justify-center border-l border-line-strong/20 pl-6 xl:flex">
                <div className="mb-2 flex h-14 items-end gap-1.5">
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
                <span className="font-mono text-[11px] font-semibold text-on-surface-variant uppercase">
                    24-BIT / 96KHZ
                </span>
                <span className="font-mono text-[11px] font-bold text-primary-container uppercase">
                    {currentSong.duration || 'LOSSLESS'}
                </span>
            </div>
        </section>
    );
}
