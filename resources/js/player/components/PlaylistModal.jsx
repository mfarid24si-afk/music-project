import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { LuCheck, LuListMusic, LuLock, LuPlus, LuX } from 'react-icons/lu';
export default function PlaylistModal({ song, isOpen, onClose }) {
    const { playlists, createPlaylist, addToPlaylist, removeFromPlaylist } =
        useAudio();
    const [newPlName, setNewPlName] = useState('');

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
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Dialog */}
            <div className="animate-scaleUp fixed top-1/2 left-1/2 z-50 flex w-full max-w-sm -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-2xl border border-line-strong/40 bg-overlay p-6 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-line/60 pb-3">
                    <div>
                        <h3 className="font-display text-base font-bold text-white">
                            Add to Playlist
                        </h3>
                        <p className="mt-0.5 max-w-[260px] truncate text-xs text-on-surface-variant">
                            &quot;{song.title}&quot; by {song.artist}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-chip text-on-surface-variant transition-colors hover:text-white"
                    >
                        <LuX className="h-4 w-4" />
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
                                    onClick={() => handleToggle(pl)}
                                    className={`flex items-center justify-between rounded-lg border p-3 text-left transition-all ${
                                        isAdded
                                            ? 'border-primary-container/50 bg-primary-container/10 text-primary-container'
                                            : 'border-line-strong/20 bg-raised text-white hover:bg-chip'
                                    }`}
                                >
                                    <div className="flex min-w-0 items-center gap-2.5">
                                        {pl.customCover ? (
                                            <img
                                                src={pl.customCover}
                                                alt={pl.name}
                                                className="h-5 w-5 flex-shrink-0 rounded object-cover"
                                            />
                                        ) : (
                                            <span className="flex-shrink-0 text-sm">
                                                {pl.emoji || '🎧'}
                                            </span>
                                        )}
                                        <span className="truncate font-display text-xs font-semibold">
                                            {pl.name}
                                        </span>
                                        {pl.status !== 'approved' &&
                                            pl.isLocked !== false && (
                                                <span
                                                    title="Menunggu persetujuan Admin"
                                                    className="flex flex-shrink-0 items-center gap-0.5 text-[10px] text-amber-400"
                                                >
                                                    <LuLock className="h-2.5 w-2.5" />
                                                </span>
                                            )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-[10px] text-on-surface-variant">
                                            {pl.songs.length} tracks
                                        </span>
                                        {isAdded && (
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
                                                <LuCheck className="h-3 w-3 stroke-[3]" />
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
                        className="flex-1 rounded-lg border border-line-strong/30 bg-canvas px-3 py-2 text-xs text-white transition-colors placeholder:text-on-surface-variant/60 focus:border-primary-container focus:outline-none"
                    />
                    <button
                        type="submit"
                        disabled={!newPlName.trim()}
                        className="flex flex-shrink-0 items-center gap-1 rounded-lg bg-primary-container px-3.5 py-2 font-display text-xs font-bold text-on-primary-container transition-all hover:opacity-90 disabled:opacity-40"
                    >
                        <LuPlus className="h-3.5 w-3.5" />
                        <span>Create</span>
                    </button>
                </form>
                <p className="flex items-center gap-1.5 px-0.5 font-mono text-[10px] text-amber-300/80">
                    <LuLock className="h-3 w-3 flex-shrink-0 text-amber-400" />
                    <span>
                        Pembuatan playlist baru memerlukan izin Administrator
                        sebelum dapat diputar.
                    </span>
                </p>
            </div>
        </>
    );
}
