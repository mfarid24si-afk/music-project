import React, { useDeferredValue, useMemo, useState } from 'react';
import { useAudio } from '../context/AudioContext';
import {
    LuArrowLeft,
    LuCheck,
    LuClock,
    LuHeart,
    LuLayoutGrid,
    LuList,
    LuListPlus,
    LuLock,
    LuMusic,
    LuPause,
    LuPencil,
    LuPin,
    LuPinOff,
    LuPlay,
    LuSearch,
    LuShare2,
    LuShuffle,
    LuX,
} from 'react-icons/lu';
import {
    GRADIENT_PRESETS,
    formatTotalDuration,
    parseDurationToSeconds,
} from '../playlistHelpers';
import PlaylistCoverArt from './PlaylistCoverArt';
import PlaylistEditModal from './PlaylistEditModal';
import PlaylistIcon from './PlaylistIcon';
import PlaylistRecommendedSongs from './PlaylistRecommendedSongs';

const ICON_BUTTON =
    'focus-ring inline-flex items-center justify-center rounded-full border border-line-strong/30 bg-raised text-on-surface-variant transition-colors duration-200 ease-out hover:bg-chip hover:text-white motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50';

const PILL_BUTTON =
    'focus-ring inline-flex h-10 items-center gap-2 rounded-full px-4 font-mono text-xs font-semibold transition-colors duration-200 ease-out motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50';

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

    // Keep typing responsive while the (potentially long) list filters.
    const deferredFilterQuery = useDeferredValue(filterQuery);

    const filteredSongs = useMemo(() => {
        if (!deferredFilterQuery.trim()) return playlistSongs;
        const q = deferredFilterQuery.toLowerCase();
        return playlistSongs.filter(
            (s) =>
                s.title.toLowerCase().includes(q) ||
                s.artist.toLowerCase().includes(q) ||
                (s.album && s.album.toLowerCase().includes(q)),
        );
    }, [playlistSongs, deferredFilterQuery]);

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
                    <LuMusic className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-white">
                    Playlist not found
                </h3>
                <p className="max-w-xs text-xs text-on-surface-variant">
                    The playlist you are looking for may have been deleted or
                    moved.
                </p>
                <button
                    type="button"
                    onClick={onBack}
                    className="focus-ring mt-2 rounded-full bg-primary-container px-5 py-2 text-xs font-bold text-on-primary-container shadow-[0_0_12px_var(--accent-glow)] transition-transform duration-200 ease-out hover:scale-105 active:scale-95 motion-reduce:transition-none"
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

    const requestPlaySong = (song) => {
        if (isLocked) {
            showToast(
                'Playlist terkunci! Menunggu persetujuan Administrator sebelum lagu dapat diputar.',
                'warning',
            );
            return;
        }
        playSong(song);
    };

    const requestPlayPlaylist = (shuffle) => {
        if (isLocked) {
            showToast(
                'Playlist terkunci! Menunggu persetujuan Administrator.',
                'warning',
            );
            return;
        }
        playPlaylist(playlist.id, shuffle);
    };

    const handleOpenEdit = () => setIsEditing(true);

    return (
        <div className="animate-fadeIn flex flex-col gap-8">
            {/* Editorial Hero Header */}
            <section
                className={`relative overflow-hidden rounded-2xl border bg-linear-to-b ${currentGradient.class} ${currentGradient.border} p-6 shadow-2xl md:p-8`}
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
                            type="button"
                            onClick={onBack}
                            className="focus-ring inline-flex h-10 items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 text-xs text-white/80 backdrop-blur-md transition-colors duration-200 ease-out hover:text-white motion-reduce:transition-none"
                        >
                            <LuArrowLeft className="h-4 w-4" aria-hidden="true" />
                            <span>Back</span>
                        </button>
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => togglePinPlaylist(playlist.id)}
                                aria-label={
                                    playlist.isPinned
                                        ? 'Unpin playlist'
                                        : 'Pin playlist to top'
                                }
                                aria-pressed={!!playlist.isPinned}
                                className={`focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition-colors duration-200 ease-out motion-reduce:transition-none ${
                                    playlist.isPinned
                                        ? 'border-primary-container bg-primary-container text-on-primary-container'
                                        : 'border-white/10 bg-black/40 text-white/70 hover:text-white'
                                }`}
                            >
                                {playlist.isPinned ? (
                                    <LuPinOff
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    />
                                ) : (
                                    <LuPin
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    />
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={handleOpenEdit}
                                aria-label="Edit playlist details"
                                className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/70 backdrop-blur-md transition-colors duration-200 ease-out hover:text-white motion-reduce:transition-none"
                            >
                                <LuPencil
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                />
                            </button>
                        </div>
                    </div>

                    {/* Cover Collage / Art */}
                    <button
                        type="button"
                        onClick={handleOpenEdit}
                        aria-label="Edit playlist details"
                        className="group focus-ring relative cursor-pointer rounded-2xl"
                    >
                        <PlaylistCoverArt
                            playlist={playlist}
                            gradient={currentGradient}
                            songs={playlistSongs}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-black/50 text-xs font-semibold text-white opacity-0 backdrop-blur-xs transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">
                            <LuPencil
                                className="h-5 w-5 text-primary-container"
                                aria-hidden="true"
                            />
                            <span>Edit Details</span>
                        </div>
                    </button>

                    {/* Playlist Info */}
                    <div className="flex min-w-0 flex-1 flex-col justify-end">
                        {/* Top pill / badge */}
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={onBack}
                                className="focus-ring mr-2 hidden items-center gap-1 font-mono text-xs text-white/70 transition-colors duration-200 ease-out hover:text-white motion-reduce:transition-none md:flex"
                            >
                                <LuArrowLeft
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                />
                                <span>LIBRARY</span>
                            </button>
                            <span className="inline-flex items-center gap-1 rounded border border-white/10 bg-black/40 px-2 py-1 font-mono text-xs font-bold tracking-wider text-primary-container uppercase">
                                <PlaylistIcon
                                    value={playlist.emoji}
                                    className="h-3.5 w-3.5"
                                />
                                PERSONAL PLAYLIST
                            </span>
                            {playlist.isPinned && (
                                <span className="inline-flex items-center gap-1 rounded border border-primary-container/30 bg-primary-container/20 px-2 py-1 font-mono text-xs font-bold tracking-wider text-primary-container uppercase">
                                    <LuPin
                                        className="h-3 w-3"
                                        aria-hidden="true"
                                    />
                                    PINNED
                                </span>
                            )}
                            {isLocked ? (
                                <span className="inline-flex items-center gap-1 rounded border border-amber-500/40 bg-amber-500/20 px-2.5 py-1 font-mono text-xs font-bold tracking-wider text-amber-300 uppercase">
                                    <LuLock
                                        className="h-3 w-3 text-amber-400"
                                        aria-hidden="true"
                                    />
                                    MENUNGGU IZIN ADMIN (TERKUNCI)
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/20 px-2.5 py-1 font-mono text-xs font-bold tracking-wider text-emerald-300 uppercase">
                                    <LuCheck
                                        className="h-3 w-3 text-emerald-400"
                                        aria-hidden="true"
                                    />
                                    DISETUJUI ADMIN (AKTIF)
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="font-display text-3xl leading-tight font-black tracking-tight text-white md:text-5xl lg:text-6xl">
                            <button
                                type="button"
                                onClick={handleOpenEdit}
                                title="Click to rename"
                                className="focus-ring line-clamp-2 max-w-full rounded text-left text-balance break-words transition-colors duration-200 ease-out hover:text-primary-container motion-reduce:transition-none"
                            >
                                {playlist.name}
                            </button>
                        </h1>

                        {/* Description */}
                        <button
                            type="button"
                            onClick={handleOpenEdit}
                            title="Click to edit description"
                            className="focus-ring mt-2 line-clamp-2 block max-w-2xl rounded text-left text-xs leading-relaxed text-on-surface-variant transition-colors duration-200 ease-out hover:text-white motion-reduce:transition-none md:text-sm"
                        >
                            {playlist.description ||
                                'Add a personal note, description, or mood for this playlist...'}
                        </button>

                        {/* Meta Row */}
                        <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-xs text-white/70">
                            <span className="font-semibold text-white">
                                Admin
                            </span>
                            <span aria-hidden="true">&bull;</span>
                            <span>
                                {playlistSongs.length} track
                                {playlistSongs.length !== 1 ? 's' : ''}
                            </span>
                            <span aria-hidden="true">&bull;</span>
                            <span className="flex items-center gap-1">
                                <LuClock
                                    className="h-3 w-3 text-primary-container"
                                    aria-hidden="true"
                                />
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
                        <LuLock className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="flex-1 text-xs">
                        <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-amber-300">
                            <span>
                                Status Pengajuan: Menunggu Persetujuan
                                Administrator
                            </span>
                            <span className="rounded-full border border-amber-500/40 bg-amber-500/25 px-2 py-0.5 font-mono text-xs text-amber-300">
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
                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Main Play Button */}
                    <button
                        type="button"
                        onClick={() => {
                            if (isCurrentPlaylistPlaying) {
                                togglePlay();
                            } else {
                                requestPlayPlaylist(false);
                            }
                        }}
                        disabled={playlistSongs.length === 0}
                        aria-label={
                            isLocked
                                ? 'Playlist terkunci, menunggu persetujuan Admin'
                                : isCurrentPlaylistPlaying
                                  ? 'Pause playlist'
                                  : 'Play playlist'
                        }
                        className={`focus-ring inline-flex h-14 w-14 items-center justify-center rounded-full shadow-[0_0_20px_var(--accent-glow)] transition-transform duration-200 ease-out hover:scale-105 active:scale-95 motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 ${
                            isLocked
                                ? 'border-2 border-amber-400/50 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                                : 'bg-primary-container text-on-primary-container'
                        }`}
                    >
                        {isLocked ? (
                            <LuLock
                                className="h-6 w-6 text-amber-300"
                                aria-hidden="true"
                            />
                        ) : isCurrentPlaylistPlaying ? (
                            <LuPause
                                className="h-6 w-6 fill-current"
                                aria-hidden="true"
                            />
                        ) : (
                            <LuPlay
                                className="ml-0.5 h-6 w-6 fill-current"
                                aria-hidden="true"
                            />
                        )}
                    </button>

                    {/* Shuffle Button */}
                    <button
                        type="button"
                        onClick={() => requestPlayPlaylist(true)}
                        disabled={playlistSongs.length === 0}
                        className={`${PILL_BUTTON} border ${
                            isLocked
                                ? 'border-amber-500/30 bg-raised text-amber-300/80'
                                : 'border-line-strong/30 bg-raised text-on-surface-variant hover:border-primary-container hover:text-primary-container'
                        }`}
                    >
                        <LuShuffle className="h-4 w-4" aria-hidden="true" />
                        <span>SHUFFLE</span>
                    </button>

                    {/* Add to Queue */}
                    <button
                        type="button"
                        onClick={() => addPlaylistToQueue(playlist.id)}
                        disabled={playlistSongs.length === 0}
                        aria-label="Add all tracks to queue"
                        className={`${PILL_BUTTON} border border-line-strong/30 bg-raised text-on-surface-variant hover:bg-chip hover:text-white`}
                    >
                        <LuListPlus
                            className="h-4 w-4 text-primary-container"
                            aria-hidden="true"
                        />
                        <span className="hidden sm:inline">Add to Queue</span>
                    </button>

                    {/* Publish / Community Sync */}
                    <button
                        type="button"
                        onClick={() => publishPlaylist(playlist.id)}
                        aria-label={
                            playlist.isCommunity
                                ? 'Shared in community'
                                : 'Publish playlist to community'
                        }
                        className={`${PILL_BUTTON} border ${
                            playlist.isCommunity
                                ? 'border-primary-container bg-primary-container/20 text-primary-container'
                                : 'border-line-strong/30 bg-raised text-on-surface-variant hover:border-primary-container hover:text-white'
                        }`}
                    >
                        <LuShare2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="hidden lg:inline">
                            {playlist.isCommunity
                                ? 'Shared in Community'
                                : 'Publish to Community'}
                        </span>
                    </button>

                    {/* Pin Button (Desktop) */}
                    <button
                        type="button"
                        onClick={() => togglePinPlaylist(playlist.id)}
                        aria-label={
                            playlist.isPinned
                                ? 'Unpin playlist'
                                : 'Pin playlist to top of sidebar'
                        }
                        aria-pressed={!!playlist.isPinned}
                        className={`focus-ring ml-auto hidden h-11 w-11 items-center justify-center rounded-full border transition-colors duration-200 ease-out motion-reduce:transition-none md:inline-flex ${
                            playlist.isPinned
                                ? 'border-primary-container bg-primary-container text-on-primary-container shadow-[0_0_12px_var(--accent-glow)]'
                                : 'border-line-strong/30 bg-raised text-on-surface-variant hover:bg-chip hover:text-white'
                        }`}
                    >
                        {playlist.isPinned ? (
                            <LuPinOff
                                className="h-4 w-4"
                                aria-hidden="true"
                            />
                        ) : (
                            <LuPin className="h-4 w-4" aria-hidden="true" />
                        )}
                    </button>

                    {/* Edit Button (Desktop) */}
                    <button
                        type="button"
                        onClick={handleOpenEdit}
                        aria-label="Edit playlist details"
                        className={`${ICON_BUTTON} hidden h-11 w-11 md:inline-flex`}
                    >
                        <LuPencil className="h-4 w-4" aria-hidden="true" />
                    </button>
                </div>

                {/* Filter Input & View Switcher */}
                <div className="flex items-center gap-2.5">
                    {playlistSongs.length > 3 && (
                        <div className="relative flex-1 sm:w-48">
                            <LuSearch
                                className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-on-surface-variant"
                                aria-hidden="true"
                            />
                            <label htmlFor="playlist-filter" className="sr-only">
                                Filter tracks in this playlist
                            </label>
                            <input
                                id="playlist-filter"
                                type="search"
                                value={filterQuery}
                                onChange={(e) => setFilterQuery(e.target.value)}
                                placeholder="Filter tracks..."
                                className="focus-ring h-10 w-full rounded-full border border-line-strong/30 bg-raised pr-9 pl-8 text-xs text-white transition-colors duration-200 ease-out placeholder:text-on-surface-variant/60 motion-reduce:transition-none"
                            />
                            {filterQuery && (
                                <button
                                    type="button"
                                    onClick={() => setFilterQuery('')}
                                    aria-label="Clear filter"
                                    className="focus-ring absolute top-1/2 right-1.5 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-on-surface-variant transition-colors duration-200 ease-out hover:text-white motion-reduce:transition-none"
                                >
                                    <LuX
                                        className="h-3.5 w-3.5"
                                        aria-hidden="true"
                                    />
                                </button>
                            )}
                        </div>
                    )}

                    {/* View Mode Switcher */}
                    <div
                        className="flex items-center rounded-lg border border-line-strong/30 bg-raised p-0.5"
                        role="group"
                        aria-label="Track layout"
                    >
                        <button
                            type="button"
                            onClick={() => setViewMode('list')}
                            aria-label="List view"
                            aria-pressed={viewMode === 'list'}
                            className={`focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors duration-200 ease-out motion-reduce:transition-none ${
                                viewMode === 'list'
                                    ? 'bg-primary-container text-on-primary-container shadow-xs'
                                    : 'text-on-surface-variant hover:text-white'
                            }`}
                        >
                            <LuList className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('grid')}
                            aria-label="Grid view"
                            aria-pressed={viewMode === 'grid'}
                            className={`focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors duration-200 ease-out motion-reduce:transition-none ${
                                viewMode === 'grid'
                                    ? 'bg-primary-container text-on-primary-container shadow-xs'
                                    : 'text-on-surface-variant hover:text-white'
                            }`}
                        >
                            <LuLayoutGrid
                                className="h-4 w-4"
                                aria-hidden="true"
                            />
                        </button>
                    </div>
                </div>
            </section>

            {/* Main Track Section */}
            {playlistSongs.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-line-strong/30 bg-raised px-6 py-16 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-line-strong/40 bg-chip text-primary-container">
                        <PlaylistIcon
                            value={playlist.emoji}
                            className="h-7 w-7"
                        />
                    </div>
                    <h3 className="font-display text-lg font-bold text-white">
                        This playlist is completely empty
                    </h3>
                    <p className="max-w-sm text-xs leading-relaxed text-on-surface-variant">
                        Start personalizing this collection by clicking{' '}
                        <strong>&quot;+ Add&quot;</strong> on recommended tracks
                        below or using the add button across the library.
                    </p>
                </div>
            ) : filteredSongs.length === 0 ? (
                <div
                    role="status"
                    className="rounded-xl border border-line-strong/20 bg-raised py-12 text-center text-on-surface-variant"
                >
                    <p className="text-sm">
                        No tracks matching &quot;{filterQuery}&quot; in this
                        playlist.
                    </p>
                    <button
                        type="button"
                        onClick={() => setFilterQuery('')}
                        className="focus-ring mt-2 rounded text-xs text-primary-container underline"
                    >
                        Clear search
                    </button>
                </div>
            ) : viewMode === 'list' ? (
                /* ================= LIST / TABLE VIEW ================= */
                <div className="flex flex-col gap-1 rounded-2xl border border-line-strong/20 bg-raised/60 p-2 md:p-4">
                    {/* Table Header */}
                    <div className="flex items-center justify-between border-b border-line-strong/30 px-3 pb-2 font-mono text-xs tracking-wider text-on-surface-variant uppercase">
                        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-6">
                            <span className="w-6 flex-shrink-0 text-center">
                                #
                            </span>
                            <span>TITLE &amp; ARTIST</span>
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
                                key={song.id}
                                className={`group flex items-center justify-between gap-2 rounded-xl transition-colors duration-200 ease-out motion-reduce:transition-none ${
                                    isCurrent
                                        ? 'border border-primary-container/40 bg-chip text-white shadow-sm'
                                        : 'text-ink-strong hover:bg-raised'
                                }`}
                            >
                                <button
                                    type="button"
                                    onClick={() => requestPlaySong(song)}
                                    aria-label={`${
                                        isSongPlaying ? 'Pause' : 'Play'
                                    } ${song.title} by ${song.artist}`}
                                    className="focus-ring flex min-w-0 flex-1 items-center gap-3 rounded-xl p-2.5 text-left sm:gap-4 sm:p-3"
                                >
                                    <div className="flex w-6 flex-shrink-0 items-center justify-center font-mono text-xs text-on-surface-variant">
                                        {isSongPlaying ? (
                                            <span
                                                className="flex h-3.5 items-end gap-0.5"
                                                aria-hidden="true"
                                            >
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
                                            </span>
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
                                        alt=""
                                        loading="lazy"
                                        className="h-10 w-10 flex-shrink-0 rounded-md bg-chip object-cover"
                                    />

                                    <div className="min-w-0 flex-1 pr-2">
                                        <p
                                            className={`truncate font-display text-sm font-semibold transition-colors duration-200 motion-reduce:transition-none ${
                                                isCurrent
                                                    ? 'text-primary-container'
                                                    : 'text-white group-hover:text-primary-container'
                                            }`}
                                        >
                                            {song.title}
                                        </p>
                                        <p className="truncate text-xs text-on-surface-variant">
                                            {song.artist}
                                        </p>
                                    </div>
                                </button>

                                {/* Right: Album + Time + Action buttons */}
                                <div className="flex flex-shrink-0 items-center gap-1 pr-1 font-mono text-xs sm:gap-2">
                                    <span className="hidden w-24 truncate text-right text-on-surface-variant lg:inline">
                                        {song.album || 'Single'}
                                    </span>

                                    <span className="w-12 text-right text-on-surface-variant">
                                        {song.duration || '3:30'}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() => toggleFavorite(song.id)}
                                        aria-label={
                                            isLiked
                                                ? `Remove ${song.title} from liked songs`
                                                : `Add ${song.title} to liked songs`
                                        }
                                        aria-pressed={isLiked}
                                        className={`focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 ease-out motion-reduce:transition-none hover:bg-white/10 ${
                                            isLiked
                                                ? 'text-primary-container'
                                                : 'text-on-surface-variant hover:text-white'
                                        }`}
                                    >
                                        <LuHeart
                                            className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`}
                                            aria-hidden="true"
                                        />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeFromPlaylist(
                                                playlist.id,
                                                song.id,
                                            )
                                        }
                                        aria-label={`Remove ${song.title} from playlist`}
                                        className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors duration-200 ease-out hover:bg-white/10 hover:text-red-400 motion-reduce:transition-none"
                                    >
                                        <LuX
                                            className="h-4 w-4"
                                            aria-hidden="true"
                                        />
                                    </button>
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
                                key={song.id}
                                className={`group relative flex flex-col rounded-2xl border bg-raised p-3 transition duration-200 ease-out hover:-translate-y-1 hover:bg-overlay motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
                                    isCurrent
                                        ? 'border-primary-container/60 shadow-[0_0_16px_var(--accent-glow)]'
                                        : 'border-line-strong/20 hover:border-line-strong/60'
                                }`}
                            >
                                {/* Artwork */}
                                <div className="relative mb-3 flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-chip">
                                    <img
                                        src={song.img}
                                        alt=""
                                        loading="lazy"
                                        className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105 motion-reduce:transition-none"
                                    />

                                    {/* Remove button */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFromPlaylist(
                                                playlist.id,
                                                song.id,
                                            );
                                        }}
                                        aria-label={`Remove ${song.title} from playlist`}
                                        className="focus-ring absolute top-2 right-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/80 text-on-surface-variant opacity-0 backdrop-blur-sm transition duration-200 ease-out group-hover:opacity-100 group-focus-within:opacity-100 hover:scale-110 hover:text-red-400 motion-reduce:transition-none"
                                    >
                                        <LuX
                                            className="h-3.5 w-3.5"
                                            aria-hidden="true"
                                        />
                                    </button>

                                    {/* Hover Play Button */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (isCurrent) {
                                                togglePlay();
                                            } else {
                                                requestPlaySong(song);
                                            }
                                        }}
                                        aria-label={
                                            isSongPlaying
                                                ? `Pause ${song.title}`
                                                : `Play ${song.title} by ${song.artist}`
                                        }
                                        className={`focus-ring absolute right-2.5 bottom-2.5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary-container text-on-primary-container shadow-xl transition duration-200 ease-out hover:scale-110 active:scale-95 motion-reduce:transition-none ${
                                            isSongPlaying
                                                ? 'translate-y-0 opacity-100'
                                                : 'translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100'
                                        }`}
                                    >
                                        {isSongPlaying ? (
                                            <LuPause
                                                className="h-4 w-4 fill-current"
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            <LuPlay
                                                className="ml-0.5 h-4 w-4 fill-current"
                                                aria-hidden="true"
                                            />
                                        )}
                                    </button>
                                </div>

                                {/* Details */}
                                <div className="flex min-w-0 items-start justify-between gap-1.5">
                                    <div className="min-w-0 flex-1">
                                        <button
                                            type="button"
                                            onClick={() => requestPlaySong(song)}
                                            className="focus-ring block w-full truncate rounded text-left font-display text-xs font-bold text-white transition-colors duration-200 ease-out hover:text-primary-container motion-reduce:transition-none md:text-sm"
                                        >
                                            {song.title}
                                        </button>
                                        <p className="mt-0.5 truncate text-xs text-on-surface-variant">
                                            {song.artist}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => toggleFavorite(song.id)}
                                        aria-label={
                                            isLiked
                                                ? `Remove ${song.title} from liked songs`
                                                : `Add ${song.title} to liked songs`
                                        }
                                        aria-pressed={isLiked}
                                        className={`focus-ring inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-200 ease-out motion-reduce:transition-none ${
                                            isLiked
                                                ? 'text-primary-container'
                                                : 'text-on-surface-variant hover:text-white'
                                        }`}
                                    >
                                        <LuHeart
                                            className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`}
                                            aria-hidden="true"
                                        />
                                    </button>
                                </div>

                                {/* Card footer */}
                                <div className="mt-2.5 flex items-center justify-between border-t border-line/60 pt-2 font-mono text-xs text-on-surface-variant">
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
