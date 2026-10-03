import React from 'react';
import { useAudio } from '../context/AudioContext';
import { LuHeart, LuListPlus, LuMusic, LuPause, LuPlay, LuPlus } from 'react-icons/lu';
export default function SongGrid({
    songs,
    activeFilter,
    setActiveFilter,
    onOpenPlaylistModal,
}) {
    const {
        currentSong,
        isPlaying,
        playSong,
        togglePlay,
        favorites,
        toggleFavorite,
        addToQueue,
    } = useAudio();

    const filterChips = [
        { id: 'all', label: 'All Sessions' },
        { id: 'favorites', label: 'Favorites' },
        { id: 'lossless', label: 'Lossless Only' },
        { id: 'Pop', label: 'Pop' },
        { id: 'Rock', label: 'Rock' },
    ];

    return (
        <section className="flex flex-col gap-4">
            {/* Header and Filter chips */}
            <div className="flex flex-col justify-between gap-3 border-b border-line-strong/20 pb-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                    <h3 className="font-display text-xl font-bold tracking-tight text-white">
                        Essential Tracks
                    </h3>
                    <span className="rounded-full border border-line-strong/30 bg-chip px-2.5 py-0.5 font-mono text-[11px] text-on-surface-variant">
                        {songs.length} TRACKS
                    </span>
                </div>

                {/* Filter Chips */}
                <div className="flex flex-wrap items-center gap-2">
                    {filterChips.map((chip) => (
                        <button
                            key={chip.id}
                            onClick={() => setActiveFilter(chip.id)}
                            className={`rounded-full px-3.5 py-1.5 font-mono text-xs font-medium transition-all ${
                                activeFilter === chip.id
                                    ? 'border border-primary-container bg-chip text-white shadow-[0_0_12px_var(--accent-glow)]'
                                    : 'border border-line-strong/20 bg-raised text-on-surface-variant hover:bg-chip hover:text-white'
                            }`}
                        >
                            {chip.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {songs.length === 0 ? (
                <div className="py-16 text-center text-text-muted">
                    <LuMusic className="mx-auto mb-3 h-12 w-12 opacity-40" />
                    <p className="text-base font-medium">No tracks found</p>
                    <p className="mt-1 text-xs">
                        Try another filter or search term
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
                    {songs.map((song, idx) => {
                        const isCurrent = currentSong?.id === song.id;
                        const isSongPlaying = isCurrent && isPlaying;
                        const isLiked = favorites.includes(song.id);

                        return (
                            <div
                                key={song.id}
                                className={`group relative flex flex-col rounded-2xl border bg-raised p-2.5 transition-all duration-200 hover:bg-overlay sm:p-3.5 ${
                                    isCurrent
                                        ? 'border-primary-container/60 shadow-[0_0_16px_var(--accent-glow)]'
                                        : 'border-line-strong/20 hover:border-line-strong/60'
                                }`}
                            >
                                {/* Artwork Frame */}
                                <div className="relative mb-3.5 flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-chip">
                                    <img
                                        src={song.img}
                                        alt={song.title}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        loading="lazy"
                                        onError={(e) => {
                                            e.target.src =
                                                'data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect width=%22200%22 height=%22200%22 fill=%22%23282828%22/%3E%3Ctext x=%22100%22 y=%22115%22 text-anchor=%22middle%22 fill=%22%23727272%22 font-size=%2260%22%3E%E2%9C%8D%3C/text%3E%3C/svg%3E';
                                        }}
                                    />

                                     {/* Hi-Fi Badge / Genre */}
                                     <span 
                                         className="absolute top-2 left-2 max-w-[calc(100%-4rem)] truncate rounded bg-black/75 px-1.5 py-0.5 font-mono text-[9px] font-semibold tracking-wider text-primary-container backdrop-blur-sm"
                                         title={song.genre || 'FLAC'}
                                     >
                                         {song.genre || 'FLAC'}
                                     </span>

                                    {/* Quick Action Overlay (Queue & Playlist) */}
                                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-90 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addToQueue(song.id);
                                            }}
                                            className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-black/80 text-white backdrop-blur-sm transition-transform hover:scale-110 hover:text-primary-container active:scale-95 sm:h-8 sm:w-8"
                                            title="Add to Queue"
                                        >
                                            <LuListPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onOpenPlaylistModal(song);
                                            }}
                                            className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-black/80 text-white backdrop-blur-sm transition-transform hover:scale-110 hover:text-primary-container active:scale-95 sm:h-8 sm:w-8"
                                            title="Add to Playlist"
                                        >
                                            <LuPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        </button>
                                    </div>

                                    {/* Play Button (Always accessible on mobile touch) */}
                                    <button
                                        onClick={() => {
                                            if (isCurrent) {
                                                togglePlay();
                                            } else {
                                                playSong(song);
                                            }
                                        }}
                                        className={`absolute right-2.5 bottom-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-on-primary-container shadow-xl transition-all duration-200 hover:scale-110 active:scale-95 sm:h-11 sm:w-11 ${
                                            isSongPlaying
                                                ? 'translate-y-0 opacity-100'
                                                : 'translate-y-0 opacity-90 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100'
                                        }`}
                                        title={isSongPlaying ? 'Pause' : 'Play'}
                                    >
                                        {isSongPlaying ? (
                                            <LuPause className="h-4 w-4 fill-current sm:h-5 sm:w-5" />
                                        ) : (
                                            <LuPlay className="ml-0.5 h-4 w-4 fill-current sm:h-5 sm:w-5" />
                                        )}
                                    </button>
                                </div>

                                {/* Details */}
                                <div className="flex min-w-0 items-start justify-between gap-1.5">
                                    <div className="min-w-0 flex-1">
                                        <h4
                                            onClick={() => playSong(song)}
                                            className="cursor-pointer truncate font-display text-xs font-bold text-white transition-colors hover:text-primary-container sm:text-sm"
                                        >
                                            {song.title}
                                        </h4>
                                        <div className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] text-on-surface-variant sm:text-xs">
                                            <span className="truncate">
                                                {song.artist}
                                            </span>
                                            {song.uploader_name && (
                                                <span className="hidden flex-shrink-0 font-mono text-[9px] text-primary-container/80 sm:inline">
                                                    &bull; {song.uploader_name}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Favorite button */}
                                    <button
                                        onClick={() => toggleFavorite(song.id)}
                                        className={`flex-shrink-0 rounded-full p-1.5 transition-colors ${
                                            isLiked
                                                ? 'text-primary-container'
                                                : 'text-on-surface-variant hover:text-white'
                                        }`}
                                        title={isLiked ? 'Unlike' : 'Like'}
                                    >
                                        <LuHeart
                                            className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isLiked ? 'fill-current' : ''}`}
                                        />
                                    </button>
                                </div>

                                {/* Footer meta */}
                                <div className="mt-3 flex items-center justify-between border-t border-line/60 pt-2.5 font-mono text-[11px] text-on-surface-variant">
                                    <span>TRACK 0{idx + 1}</span>
                                    <span>{song.duration || '3:30'}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
