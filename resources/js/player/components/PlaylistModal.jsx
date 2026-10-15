import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { useDialogA11y } from '../hooks/useDialogA11y';
import { LuCheck, LuListMusic, LuLock, LuPlus, LuX } from 'react-icons/lu';
import PlaylistIcon from './PlaylistIcon';
export default function PlaylistModal({ song, isOpen, onClose }) {
    const { playlists, createPlaylist, addToPlaylist, removeFromPlaylist } =
        useAudio();
    const [newPlName, setNewPlName] = useState('');
    const dialogRef = useDialogA11y({ isOpen, onClose });

    if (!isOpen || !song) return null;

    const handleCreateAndAdd = (e) => {
        e.preventDefault();
        if (!newPlName.trim()) return;
        const pl = createPlaylist(newPlName);
        if (pl) {
            addToPlaylist(pl.id, song.id);
            setNewPlName('');
        }
    };

    const handleToggle = (playlist) => {
        const isAdded = playlist.songs.includes(song.id);
        if (isAdded) {
            removeFromPlaylist(playlist.id, song.id);
        } else {
            addToPlaylist(playlist.id, song.id);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                aria-hidden="true"
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity motion-reduce:transition-none"
                onClick={onClose}
            />

            {/* Modal Dialog */}
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="playlist-modal-title"
                tabIndex={-1}
                className="animate-scaleUp fixed inset-x-4 top-1/2 z-50 mx-auto flex w-full max-w-sm -translate-y-1/2 flex-col gap-4 rounded-2xl border border-line-strong/40 bg-overlay p-6 shadow-2xl focus:outline-none sm:inset-x-0"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-line/60 pb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary-container/30 bg-primary-container/10 text-primary-container">
                            <LuListMusic className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <div>
                            <h3
                                id="playlist-modal-title"
                                className="font-display text-base font-bold text-ink-strong"
                            >
                                Add to Playlist
                            </h3>
                            <p className="mt-0.5 max-w-[220px] truncate text-xs text-on-surface-variant">
                                &quot;{song.title}&quot; by {song.artist}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close add to playlist"
                        className="focus-ring flex h-8 w-8 items-center justify-center rounded-full bg-chip text-on-surface-variant transition-colors duration-200 ease-out hover:text-ink-strong motion-reduce:transition-none"
                    >
                        <LuX className="h-4 w-4" aria-hidden="true" />
                    </button>
                </div>

                {/* Existing Playlists */}
                <div className="flex max-h-56 flex-col gap-1.5 overflow-y-auto pr-1">
                    {playlists.length === 0 ? (
                        <p className="py-6 text-center text-xs text-text-muted">
                            No playlists created yet.
                            <br />
                            Create your first playlist below!
                        </p>
                    ) : (
                        playlists.map((pl) => {
                            const isAdded = pl.songs.includes(song.id);
                            return (
                                <button
                                    key={pl.id}
                                    type="button"
                                    onClick={() => handleToggle(pl)}
                                    aria-pressed={isAdded}
                                    className={`focus-ring flex items-center justify-between rounded-lg border p-3 text-left transition-colors duration-200 ease-out motion-reduce:transition-none ${
                                        isAdded
                                            ? 'border-primary-container/50 bg-primary-container/10 text-primary-container'
                                            : 'border-line-strong/20 bg-raised text-ink-strong hover:bg-chip'
                                    }`}
                                >
                                    <div className="flex min-w-0 items-center gap-2.5">
                                        {pl.customCover ? (
                                            <img
                                                src={pl.customCover}
                                                alt=""
                                                className="h-5 w-5 flex-shrink-0 rounded object-cover"
                                            />
                                        ) : (
                                            <PlaylistIcon
                                                value={pl.emoji}
                                                className="h-4 w-4 flex-shrink-0 text-on-surface-variant"
                                            />
                                        )}
                                        <span className="truncate font-display text-xs font-semibold">
                                            {pl.name}
                                        </span>
                                        {pl.status !== 'approved' &&
                                            pl.isLocked !== false && (
                                                <span
                                                    title="Menunggu persetujuan Admin"
                                                    className="flex flex-shrink-0 items-center gap-0.5 text-warning"
                                                >
                                                    <LuLock
                                                        className="h-2.5 w-2.5"
                                                        aria-hidden="true"
                                                    />
                                                </span>
                                            )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-[11px] text-on-surface-variant">
                                            {pl.songs.length} tracks
                                        </span>
                                        {isAdded && (
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
                                                <LuCheck
                                                    className="h-3 w-3 stroke-[3]"
                                                    aria-hidden="true"
                                                />
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Create and Add Form */}
                <form
                    onSubmit={handleCreateAndAdd}
                    className="flex gap-2 border-t border-line/60 pt-2"
                >
                    <input
                        type="text"
                        value={newPlName}
                        onChange={(e) => setNewPlName(e.target.value)}
                        placeholder="New playlist name..."
                        maxLength={40}
                        aria-label="New playlist name"
                        className="focus-ring flex-1 rounded-lg border border-line-strong/30 bg-canvas px-3 py-2 text-xs text-ink-strong transition-colors duration-200 ease-out placeholder:text-on-surface-variant/60 motion-reduce:transition-none"
                    />
                    <button
                        type="submit"
                        disabled={!newPlName.trim()}
                        className="focus-ring flex flex-shrink-0 items-center gap-1 rounded-lg bg-primary-container px-3.5 py-2 font-display text-xs font-bold text-on-primary-container transition-opacity duration-200 ease-out hover:opacity-90 disabled:opacity-40 motion-reduce:transition-none"
                    >
                        <LuPlus className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Create</span>
                    </button>
                </form>
                <p className="flex items-center gap-1.5 px-0.5 font-mono text-xs text-warning/90">
                    <LuLock className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                    <span>Playlist baru menunggu izin Admin sebelum bisa diputar.</span>
                </p>
            </div>
        </>
    );
}
