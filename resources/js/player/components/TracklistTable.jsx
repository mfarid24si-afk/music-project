import React from 'react';
import { useAudio } from '../context/AudioContext';
import { LuHeart, LuListPlus, LuPlus } from 'react-icons/lu';
export default function TracklistTable({ songs, onOpenPlaylistModal }) {
    const {
        currentSong,
        isPlaying,
        playSong,
        favorites,
        toggleFavorite,
        addToQueue,
    } = useAudio();

    return (
        <section className="flex flex-col gap-3">
            {/* Table Header */}
            <div className="flex items-center justify-between border-b border-line-strong/30 px-3 pb-2 font-mono text-[11px] tracking-wider text-on-surface-variant uppercase">
                <div className="flex items-center gap-3 sm:gap-6">
                    <span className="w-5 text-center">#</span>
                    <span>TITLE</span>
                </div>
                <div className="flex items-center gap-3 sm:gap-6 md:gap-10">
                    <span className="hidden md:inline">FIDELITY</span>
                    <span className="w-12 text-right sm:w-16">TIME</span>
                    <span className="w-16 text-right sm:w-20">ACTIONS</span>
                </div>
            </div>

            {/* Rows */}
            <div className="flex flex-col gap-1">
                {songs.map((song, idx) => {
                    const isCurrent = currentSong?.id === song.id;
                    const isSongPlaying = isCurrent && isPlaying;
                    const isLiked = favorites.includes(song.id);

                    return (
                        <div
                            key={song.id}
                            onClick={() => playSong(song)}
                            className={`group flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors ${
                                isCurrent
                                    ? 'border border-primary-container/40 bg-chip text-white'
                                    : 'text-ink-strong hover:bg-raised'
                            }`}
                        >
                            {/* Left col: Number/Equalizer + Title/Artist */}
                            <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-6">
                                <div className="flex w-5 flex-shrink-0 items-center justify-center font-mono text-xs">
                                    {isSongPlaying ? (
                                        <div className="flex h-3.5 items-end gap-0.5">
                                            <span className="h-3.5 w-1 animate-pulse bg-primary-container" />
                                            <span
                                                className="h-2 w-1 animate-pulse bg-primary-container"
                                                style={{
                                                    animationDelay: '100ms',
                                                }}
                                            />
                                            <span
                                                className="h-3 w-1 animate-pulse bg-primary-container"
                                                style={{
                                                    animationDelay: '200ms',
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <span className="font-mono text-on-surface-variant group-hover:text-primary-container">
                                            {idx < 9 ? `0${idx + 1}` : idx + 1}
                                        </span>
                                    )}
                                </div>

                                <div className="min-w-0">
                                    <p
                                        className={`truncate font-display text-sm font-semibold ${isCurrent ? 'text-primary-container' : 'text-white group-hover:text-primary-container'}`}
                                    >
                                        {song.title}
                                    </p>
                                    <div className="flex items-center gap-1.5 truncate text-xs text-on-surface-variant">
                                        <span className="truncate">
                                            {song.artist}
                                        </span>
                                        {song.uploader_name && (
                                            <span className="hidden flex-shrink-0 font-mono text-[10px] text-primary-container/80 md:inline">
                                                &bull; by {song.uploader_name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right col: Fidelity + Time + Actions */}
                            <div className="flex flex-shrink-0 items-center gap-2 font-mono text-xs sm:gap-6 md:gap-10">
                                <span className="hidden rounded border border-primary-container/20 bg-primary-container/10 px-2.5 py-0.5 text-[11px] text-primary-container md:inline">
                                    {song.genre === 'Rock'
                                        ? '24-bit / 96kHz'
                                        : 'Lossless FLAC'}
                                </span>

                                <span className="w-12 text-right text-on-surface-variant sm:w-16">
                                    {song.duration || '3:30'}
                                </span>

                                {/* Actions */}
                                <div
                                    className="flex items-center justify-end gap-0.5 sm:gap-1.5"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button
                                        onClick={() => toggleFavorite(song.id)}
                                        className={`rounded p-1.5 transition-colors hover:bg-white/10 ${isLiked ? 'text-primary-container' : 'text-on-surface-variant hover:text-white'}`}
                                        title={isLiked ? 'Unlike' : 'Like'}
                                    >
                                        <LuHeart
                                            className={`h-3.5 w-3.5 ${isLiked ? 'fill-current' : ''}`}
                                        />
                                    </button>
                                    <button
                                        onClick={() =>
                                            onOpenPlaylistModal(song)
                                        }
                                        className="rounded p-1.5 text-on-surface-variant transition-colors hover:bg-white/10 hover:text-white"
                                        title="Add to Playlist"
                                    >
                                        <LuPlus className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={() => addToQueue(song.id)}
                                        className="rounded p-1.5 text-on-surface-variant transition-colors hover:bg-white/10 hover:text-white"
                                        title="Add to Queue"
                                    >
                                        <LuListPlus className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
