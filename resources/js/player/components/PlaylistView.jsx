import React, { useState, useMemo } from 'react';
import { useAudio } from '../context/AudioContext';
import { LuArrowLeft, LuCheck, LuClock, LuHeart, LuImage, LuLayoutGrid, LuList, LuListPlus, LuLock, LuMusic, LuPause, LuPencil, LuPin, LuPinOff, LuPlay, LuPlus, LuSearch, LuShare2, LuShuffle, LuSparkles, LuX } from 'react-icons/lu';
import {
    GRADIENT_PRESETS,
    formatTotalDuration,
    parseDurationToSeconds,
} from '../playlistHelpers';
import PlaylistCoverArt from './PlaylistCoverArt';
import PlaylistEditModal from './PlaylistEditModal';
import PlaylistRecommendedSongs from './PlaylistRecommendedSongs';

export default function PlaylistView({ playlistId, onBack }) {
    const {
        playlists,
        songs,
        currentSong,
        isPlaying,
        playSong,
        togglePlay,
        favorites,
        toggleFavorite,
        removeFromPlaylist,
        updatePlaylist,
        togglePinPlaylist,
        playPlaylist,
        addPlaylistToQueue,
        addToPlaylist,
        publishPlaylist,
        showToast,
    } = useAudio();

    const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
    const [filterQuery, setFilterQuery] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const playlist = playlists.find((p) => p.id === playlistId);


    const playlistSongs = useMemo(() => {
        return (playlist?.songs || [])
            .map((id) => songs.find((s) => s.id === id))
            .filter(Boolean);
    }, [playlist?.songs, songs]);

    const filteredSongs = useMemo(() => {
        if (!filterQuery.trim()) return playlistSongs;
        const q = filterQuery.toLowerCase();
        return playlistSongs.filter(
            (s) =>
                s.title.toLowerCase().includes(q) ||
                s.artist.toLowerCase().includes(q) ||
                (s.album && s.album.toLowerCase().includes(q)),
        );
    }, [playlistSongs, filterQuery]);

    // Songs not yet in this playlist (for recommended quick-add)
    const candidateSongs = useMemo(() => {
        const existingIds = new Set(playlist?.songs || []);
        return songs.filter((s) => !existingIds.has(s.id)).slice(0, 6);
    }, [songs, playlist?.songs]);

    const totalSeconds = useMemo(() => {
        return playlistSongs.reduce(
            (acc, s) => acc + parseDurationToSeconds(s.duration),
            0,
        );
    }, [playlistSongs]);


    if (!playlist) {
        return (
            <div className="animate-fadeIn flex flex-col items-center gap-3 py-20 text-center text-on-surface-variant">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-line-strong/30 bg-raised text-primary-container">
                    <LuMusic className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white">
                    Playlist not found
                </h3>
                <p className="max-w-xs text-xs text-on-surface-variant">
                    The playlist you are looking for may have been deleted or
                    moved.
                </p>
                <button
                    onClick={onBack}
                    className="mt-2 rounded-full bg-primary-container px-5 py-2 text-xs font-bold text-on-primary-container shadow-[0_0_12px_var(--accent-glow)] transition-all hover:scale-105 active:scale-95"
                >
                    Return to Library
                </button>
            </div>
        );
    }

    const currentGradient =
        GRADIENT_PRESETS.find(
            (g) => g.id === (playlist.gradient || 'default'),
        ) || GRADIENT_PRESETS[0];

    const isCurrentPlaylistPlaying =
        isPlaying && playlistSongs.some((s) => s.id === currentSong?.id);
    const isLocked =
        playlist.status !== 'approved' && playlist.isLocked !== false;

    const handleOpenEdit = () => setIsEditing(true);

    return (
        <div className="animate-fadeIn flex flex-col gap-8">
            {/* Editorial Hero Header */}
            <section
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-b ${currentGradient.class} border ${currentGradient.border} p-6 shadow-2xl md:p-8`}
            >
                {/* Glow ambient */}
                <div
                    className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full opacity-20 blur-3xl"
                    style={{ backgroundColor: currentGradient.color }}
                />

                <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:gap-8">
                    {/* Back button on mobile */}
                    <div className="flex w-full items-center justify-between md:hidden">
                        <button
                            onClick={onBack}
                            className="flex h-9 items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 text-xs text-white/80 backdrop-blur-md hover:text-white"
                        >
                            <LuArrowLeft className="h-4 w-4" />
                            <span>Back</span>
                        </button>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => togglePinPlaylist(playlist.id)}
                                className={`rounded-full border p-2 backdrop-blur-md transition-colors ${
                                    playlist.isPinned
                                        ? 'border-primary-container bg-primary-container text-on-primary-container'
                                        : 'border-white/10 bg-black/40 text-white/70 hover:text-white'
                                }`}
                                title={
                                    playlist.isPinned ? 'Unpin' : 'Pin to Top'
                                }
                            >
                                {playlist.isPinned ? (
                                    <LuPinOff className="h-4 w-4" />
                                ) : (
                                    <LuPin className="h-4 w-4" />
                                )}
                            </button>
                            <button
                                onClick={handleOpenEdit}
                                className="rounded-full border border-white/10 bg-black/40 p-2 text-white/70 backdrop-blur-md hover:text-white"
                                title="Edit Playlist"
                            >
                                <LuPencil className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Cover Collage / Art */}
                    <div
                        className="group relative cursor-pointer"
                        onClick={handleOpenEdit}
                        title="Click to edit playlist details"
                    >
                                <PlaylistCoverArt
                                    playlist={playlist}
                                    gradient={currentGradient}
                                    songs={playlistSongs}
                                />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-black/50 text-xs font-semibold text-white opacity-0 backdrop-blur-xs transition-opacity group-hover:opacity-100">
                            <LuPencil className="h-5 w-5 text-primary-container" />
                            <span>Edit Details</span>
                        </div>
                    </div>

                    {/* Playlist Info */}
                    <div className="flex min-w-0 flex-1 flex-col justify-end">
                        {/* Top pill / badge */}
                        <div className="mb-2 flex items-center gap-2">
                            <button
                                onClick={onBack}
                                className="mr-2 hidden items-center gap-1 font-mono text-xs text-white/60 transition-colors hover:text-white md:flex"
                                title="Back"
                            >
                                <LuArrowLeft className="h-3.5 w-3.5" />
                                <span>LIBRARY</span>
                            </button>
                            <span className="rounded border border-white/10 bg-black/40 px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest text-primary-container uppercase">
                                {playlist.emoji || '🎧'} PERSONAL PLAYLIST
                            </span>
                            {playlist.isPinned && (
                                <span className="flex items-center gap-1 rounded border border-primary-container/30 bg-primary-container/20 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-primary-container uppercase">
                                    <LuPin className="h-3 w-3" /> PINNED
                                </span>
                            )}
                            {isLocked ? (
                                <span className="flex items-center gap-1 rounded border border-amber-500/40 bg-amber-500/20 px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wider text-amber-300 uppercase">
                                    <LuLock className="h-3 w-3 text-amber-400" />{' '}
                                    MENUNGGU IZIN ADMIN (TERKUNCI)
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/20 px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wider text-emerald-300 uppercase">
                                    <LuCheck className="h-3 w-3 text-emerald-400" />{' '}
                                    DISETUJUI ADMIN (AKTIF)
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h1
                            onClick={handleOpenEdit}
                            className="cursor-pointer truncate font-display text-3xl leading-none font-black tracking-tight text-white transition-colors hover:text-primary-container md:text-5xl lg:text-6xl"
                            title="Click to rename"
                        >
                            {playlist.name}
                        </h1>

                        {/* Description */}
                        <p
                            onClick={handleOpenEdit}
                            className="mt-2 line-clamp-2 max-w-2xl cursor-pointer text-xs leading-relaxed text-on-surface-variant transition-colors hover:text-white md:text-sm"
                            title="Click to edit description"
                        >
                            {playlist.description ||
                                'Add a personal note, description, or mood for this playlist...'}
                        </p>

                        {/* Meta Row */}
                        <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-xs text-white/70">
                            <span className="font-semibold text-white">
                                Admin
                            </span>
                            <span>&bull;</span>
                            <span>
                                {playlistSongs.length} track
                                {playlistSongs.length !== 1 ? 's' : ''}
                            </span>
                            <span>&bull;</span>
                            <span className="flex items-center gap-1">
                                <LuClock className="h-3 w-3 text-primary-container" />
                                {formatTotalDuration(totalSeconds)}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Locked Submission Banner */}
            {isLocked && (
                <section className="animate-fadeIn flex items-start gap-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200">
                    <div className="mt-0.5 flex-shrink-0 rounded-lg bg-amber-500/20 p-2 text-amber-400">
                        <LuLock className="h-5 w-5" />
                    </div>
                    <div className="flex-1 text-xs">
                        <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-amber-300">
                            <span>
                                Status Pengajuan: Menunggu Persetujuan
                                Administrator
                            </span>
                            <span className="rounded-full border border-amber-500/40 bg-amber-500/25 px-2 py-0.5 font-mono text-[10px] text-amber-300">
                                TERKUNCI
                            </span>
                        </div>
                        <p className="mt-1 leading-relaxed text-amber-200/80">
                            Playlist ini telah diajukan ke sistem. Sebelum
                            disetujui di Portal Admin, seluruh lagu dalam
                            playlist ini berstatus terkunci dan belum dapat
                            diputar. Silakan tunggu Administrator menyetujuinya
                            di Dashboard Admin.
                        </p>
                    </div>
                </section>
            )}

            {/* Action Bar */}
            <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                {/* Playback Controls */}
                <div className="flex items-center gap-3">
                    {/* Main Play Button */}
                    <button
                        onClick={() => {
                            if (isLocked) {
                                showToast(
                                    '🔒 Playlist terkunci! Menunggu izin Administrator sebelum dapat diputar.',
                                    'warning',
                                );
                                return;
                            }
                            if (isCurrentPlaylistPlaying) {
                                togglePlay();
                            } else {
                                playPlaylist(playlist.id, false);
                            }
                        }}
                        disabled={playlistSongs.length === 0}
                        className={`flex h-14 w-14 items-center justify-center rounded-full shadow-[0_0_20px_var(--accent-glow)] transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                            isLocked
                                ? 'border-2 border-amber-400/50 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                                : 'bg-primary-container text-on-primary-container hover:scale-105 active:scale-95'
                        }`}
                        title={
                            isLocked
                                ? 'Playlist terkunci (Menunggu persetujuan Admin)'
                                : isCurrentPlaylistPlaying
                                  ? 'Pause Playlist'
                                  : 'Play Playlist'
                        }
                    >
                        {isLocked ? (
                            <LuLock className="h-6 w-6 text-amber-300" />
                        ) : isCurrentPlaylistPlaying ? (
                            <LuPause className="h-6 w-6 fill-current" />
                        ) : (
                            <LuPlay className="ml-0.5 h-6 w-6 fill-current" />
                        )}
                    </button>
                    {/* Shuffle Button */}
                    {/* Shuffle Button */}
                    <button
                        onClick={() => {
                            if (isLocked) {
                                showToast(
                                    '🔒 Playlist terkunci! Menunggu izin Administrator.',
                                    'warning',
                                );
                                return;
                            }
                            playPlaylist(playlist.id, true);
                        }}
                        disabled={playlistSongs.length === 0}
                        className={`flex h-10 items-center gap-2 rounded-full border px-4 font-mono text-xs font-semibold transition-all disabled:opacity-40 ${
                            isLocked
                                ? 'border-amber-500/30 bg-raised text-amber-300/80'
                                : 'border-line-strong/30 bg-raised text-on-surface-variant hover:border-primary-container hover:text-primary-container'
                        }`}
                        title={
                            isLocked
                                ? 'Playlist terkunci'
                                : 'Shuffle Play Playlist'
                        }
                    >
                        <LuShuffle className="h-4 w-4" />
                        <span>SHUFFLE</span>
                    </button>

                    {/* Add to Queue */}
                    <button
                        onClick={() => addPlaylistToQueue(playlist.id)}
                        disabled={playlistSongs.length === 0}
                        className="flex h-10 items-center gap-2 rounded-full border border-line-strong/30 bg-raised px-4 text-xs font-semibold text-on-surface-variant transition-all hover:bg-chip hover:text-white disabled:opacity-40"
                        title="Enqueue all tracks"
                    >
                        <LuListPlus className="h-4 w-4 text-primary-container" />
                        <span className="hidden sm:inline">Add to Queue</span>
                    </button>

                    {/* Publish / Community Sync */}
                    <button
                        onClick={() => publishPlaylist(playlist.id)}
                        className={`flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition-all ${
                            playlist.isCommunity
                                ? 'border-primary-container bg-primary-container/20 text-primary-container'
                                : 'border-line-strong/30 bg-raised text-on-surface-variant hover:border-primary-container hover:text-white'
                        }`}
                        title="Publish this playlist so all users and friends can see and stream it"
                    >
                        <LuShare2 className="h-3.5 w-3.5" />
                        <span className="hidden lg:inline">
                            {playlist.isCommunity
                                ? 'Shared in Community'
                                : 'Publish to Community'}
                        </span>
                    </button>
                    {/* Pin Button (Desktop) */}
                    <button
                        onClick={() => togglePinPlaylist(playlist.id)}
                        className={`ml-auto hidden rounded-full border p-2.5 transition-all md:flex ${
                            playlist.isPinned
                                ? 'border-primary-container bg-primary-container text-on-primary-container shadow-[0_0_12px_var(--accent-glow)]'
                                : 'border-line-strong/30 bg-raised text-on-surface-variant hover:bg-chip hover:text-white'
                        }`}
                        title={
                            playlist.isPinned
                                ? 'Unpin Playlist'
                                : 'Pin to Top of Sidebar'
                        }
                    >
                        {playlist.isPinned ? (
                            <LuPinOff className="h-4 w-4" />
                        ) : (
                            <LuPin className="h-4 w-4" />
                        )}
                    </button>

                    {/* Edit Button (Desktop) */}
                    <button
                        onClick={handleOpenEdit}
                        className="hidden rounded-full border border-line-strong/30 bg-raised p-2.5 text-on-surface-variant transition-all hover:bg-chip hover:text-white md:flex"
                        title="Edit Playlist Details"
                    >
                        <LuPencil className="h-4 w-4" />
                    </button>
                </div>

                {/* Filter Input & View Switcher */}
                <div className="flex items-center gap-2.5">
                    {playlistSongs.length > 3 && (
                        <div className="relative flex-1 sm:w-48">
                            <LuSearch className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-on-surface-variant" />
                            <input
                                type="text"
                                value={filterQuery}
                                onChange={(e) => setFilterQuery(e.target.value)}
                                placeholder="Filter tracks..."
                                className="h-9 w-full rounded-full border border-line-strong/30 bg-raised pr-7 pl-8 text-xs text-white transition-colors placeholder:text-on-surface-variant/60 focus:border-primary-container focus:outline-none"
                            />
                            {filterQuery && (
                                <button
                                    onClick={() => setFilterQuery('')}
                                    className="absolute top-1/2 right-2.5 -translate-y-1/2 text-on-surface-variant hover:text-white"
                                >
                                    <LuX className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    )}

                    {/* View Mode Switcher */}
                    <div className="flex items-center rounded-lg border border-line-strong/30 bg-raised p-0.5">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`rounded-md p-1.5 transition-colors ${
                                viewMode === 'list'
                                    ? 'bg-primary-container text-on-primary-container shadow-xs'
                                    : 'text-on-surface-variant hover:text-white'
                            }`}
                            title="Table List View"
                        >
                            <LuList className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`rounded-md p-1.5 transition-colors ${
                                viewMode === 'grid'
                                    ? 'bg-primary-container text-on-primary-container shadow-xs'
                                    : 'text-on-surface-variant hover:text-white'
                            }`}
                            title="Grid Cards View"
                        >
                            <LuLayoutGrid className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Main Track Section */}
            {playlistSongs.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-line-strong/30 bg-raised px-6 py-16 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-line-strong/40 bg-chip text-3xl">
                        {playlist.emoji || '🎧'}
                    </div>
                    <h3 className="font-display text-lg font-bold text-white">
                        This playlist is completely empty
                    </h3>
                    <p className="max-w-sm text-xs leading-relaxed text-on-surface-variant">
                        Start personalizing this collection by clicking{' '}
                        <strong>&quot;+ Add&quot;</strong> on recommended tracks
                        below or using the ➕ button across the library.
                    </p>
                </div>
            ) : filteredSongs.length === 0 ? (
                <div className="rounded-xl border border-line-strong/20 bg-raised py-12 text-center text-on-surface-variant">
                    <p className="text-sm">
                        No tracks matching &quot;{filterQuery}&quot; in this
                        playlist.
                    </p>
                    <button
                        onClick={() => setFilterQuery('')}
                        className="mt-2 text-xs text-primary-container underline"
                    >
                        Clear search
                    </button>
                </div>
            ) : viewMode === 'list' ? (
                /* ================= LIST / TABLE VIEW ================= */
                <div className="flex flex-col gap-1 rounded-2xl border border-line-strong/20 bg-raised/60 p-2 md:p-4">
                    {/* Table Header */}
                    <div className="flex items-center justify-between border-b border-line-strong/30 px-3 pb-2 font-mono text-[11px] tracking-wider text-on-surface-variant uppercase">
                        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-6">
                            <span className="w-6 flex-shrink-0 text-center">
                                #
                            </span>
                            <span>TITLE & ARTIST</span>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-3 sm:gap-6 md:gap-8">
                            <span className="hidden w-24 text-right lg:inline">
                                ALBUM
                            </span>
                            <span className="w-12 text-right">TIME</span>
                            <span className="w-16 text-right">ACTIONS</span>
                        </div>
                    </div>

                    {/* Rows */}
                    {filteredSongs.map((song, idx) => {
                        const isCurrent = currentSong?.id === song.id;
                        const isSongPlaying = isCurrent && isPlaying;
                        const isLiked = favorites.includes(song.id);

                        return (
                            <div
                                key={`${song.id}-${idx}`}
                                onClick={() => {
                                    if (isLocked) {
                                        showToast(
                                            '🔒 Playlist terkunci! Menunggu izin Administrator sebelum lagu dapat diputar.',
                                            'warning',
                                        );
                                        return;
                                    }
                                    playSong(song);
                                }}
                                className={`group flex cursor-pointer items-center justify-between rounded-xl p-2.5 transition-all sm:p-3 ${
                                    isCurrent
                                        ? 'border border-primary-container/40 bg-chip text-white shadow-sm'
                                        : 'text-ink-strong hover:bg-raised'
                                }`}
                            >
                                <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                                    <div className="flex w-6 flex-shrink-0 items-center justify-center font-mono text-xs text-on-surface-variant">
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
                                            <span className="group-hover:text-primary-container">
                                                {idx + 1 < 10
                                                    ? `0${idx + 1}`
                                                    : idx + 1}
                                            </span>
                                        )}
                                    </div>

                                    {/* Artwork thumbnail */}
                                    <img
                                        src={song.img}
                                        alt={song.title}
                                        className="h-10 w-10 flex-shrink-0 rounded-md bg-chip object-cover"
                                    />

                                    <div className="min-w-0 flex-1 pr-2">
                                        <p
                                            className={`truncate font-display text-sm font-semibold ${isCurrent ? 'text-primary-container' : 'text-white group-hover:text-primary-container'}`}
                                        >
                                            {song.title}
                                        </p>
                                        <p className="truncate text-xs text-on-surface-variant">
                                            {song.artist}
                                        </p>
                                    </div>
                                </div>

                                {/* Right: Album + Time + Action buttons */}
                                <div className="flex flex-shrink-0 items-center gap-3 font-mono text-xs sm:gap-6 md:gap-8">
                                    <span className="hidden w-24 truncate text-right text-on-surface-variant lg:inline">
                                        {song.album || 'Single'}
                                    </span>

                                    <span className="w-12 text-right text-on-surface-variant">
                                        {song.duration || '3:30'}
                                    </span>

                                    <div
                                        className="flex w-16 items-center justify-end gap-1"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            onClick={() =>
                                                toggleFavorite(song.id)
                                            }
                                            className={`rounded p-1.5 transition-colors hover:bg-white/10 ${
                                                isLiked
                                                    ? 'text-primary-container'
                                                    : 'text-on-surface-variant hover:text-white'
                                            }`}
                                            title={isLiked ? 'Unlike' : 'Like'}
                                        >
                                            <LuHeart
                                                className={`h-3.5 w-3.5 ${isLiked ? 'fill-current' : ''}`}
                                            />
                                        </button>

                                        <button
                                            onClick={() =>
                                                removeFromPlaylist(
                                                    playlist.id,
                                                    song.id,
                                                )
                                            }
                                            className="rounded p-1.5 text-on-surface-variant transition-colors hover:bg-white/10 hover:text-red-400"
                                            title="Remove from playlist"
                                        >
                                            <LuX className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* ================= GRID / CARDS VIEW ================= */
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
                    {filteredSongs.map((song, idx) => {
                        const isCurrent = currentSong?.id === song.id;
                        const isSongPlaying = isCurrent && isPlaying;
                        const isLiked = favorites.includes(song.id);

                        return (
                            <div
                                key={`${song.id}-${idx}`}
                                className={`group relative flex flex-col rounded-2xl border bg-raised p-3 transition-all duration-200 hover:bg-overlay ${
                                    isCurrent
                                        ? 'border-primary-container/60 shadow-[0_0_16px_var(--accent-glow)]'
                                        : 'border-line-strong/20 hover:border-line-strong/60'
                                }`}
                            >
                                {/* Artwork */}
                                <div className="relative mb-3 flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-chip">
                                    <img
                                        src={song.img}
                                        alt={song.title}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        loading="lazy"
                                    />

                                    {/* Remove button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFromPlaylist(
                                                playlist.id,
                                                song.id,
                                            );
                                        }}
                                        className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-black/80 text-on-surface-variant opacity-0 backdrop-blur-sm transition-transform group-hover:opacity-100 hover:scale-110 hover:text-red-400"
                                        title="Remove from playlist"
                                    >
                                        <LuX className="h-3.5 w-3.5" />
                                    </button>

                                    {/* Hover Play Button */}
                                    <button
                                        onClick={() => {
                                            if (isCurrent) {
                                                togglePlay();
                                            } else {
                                                playSong(song);
                                            }
                                        }}
                                        className={`absolute right-2.5 bottom-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-on-primary-container shadow-xl transition-all duration-200 hover:scale-110 active:scale-95 ${
                                            isSongPlaying
                                                ? 'translate-y-0 opacity-100'
                                                : 'translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'
                                        }`}
                                        title={isSongPlaying ? 'Pause' : 'Play'}
                                    >
                                        {isSongPlaying ? (
                                            <LuPause className="h-4 w-4 fill-current" />
                                        ) : (
                                            <LuPlay className="ml-0.5 h-4 w-4 fill-current" />
                                        )}
                                    </button>
                                </div>

                                {/* Details */}
                                <div className="flex min-w-0 items-start justify-between gap-1.5">
                                    <div className="min-w-0 flex-1">
                                        <h4
                                            onClick={() => playSong(song)}
                                            className="cursor-pointer truncate font-display text-xs font-bold text-white transition-colors hover:text-primary-container md:text-sm"
                                        >
                                            {song.title}
                                        </h4>
                                        <p className="mt-0.5 truncate text-[11px] text-on-surface-variant">
                                            {song.artist}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => toggleFavorite(song.id)}
                                        className={`flex-shrink-0 rounded p-1 transition-colors ${
                                            isLiked
                                                ? 'text-primary-container'
                                                : 'text-on-surface-variant hover:text-white'
                                        }`}
                                        title={isLiked ? 'Unlike' : 'Like'}
                                    >
                                        <LuHeart
                                            className={`h-3.5 w-3.5 ${isLiked ? 'fill-current' : ''}`}
                                        />
                                    </button>
                                </div>

                                {/* Card footer */}
                                <div className="mt-2.5 flex items-center justify-between border-t border-line/60 pt-2 font-mono text-[10px] text-on-surface-variant">
                                    <span>
                                        TRACK{' '}
                                        {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                                    </span>
                                    <span>{song.duration || '3:30'}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <PlaylistRecommendedSongs
                songs={candidateSongs}
                onAdd={(songId) => addToPlaylist(playlist.id, songId)}
            />

            {isEditing && (
                <PlaylistEditModal
                    playlist={playlist}
                    onClose={() => setIsEditing(false)}
                />
            )}
        </div>
    );
}

