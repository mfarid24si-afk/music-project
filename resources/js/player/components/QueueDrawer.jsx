import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { LuGripVertical, LuListMusic, LuTrash2, LuVolume2, LuX } from 'react-icons/lu';
export default function QueueDrawer({ isOpen, onClose }) {
    const {
        currentSong,
        queue,
        songs,
        playSong,
        removeFromQueue,
        reorderQueue,
    } = useAudio();
    const [draggedIdx, setDraggedIdx] = useState(null);

    if (!isOpen) return null;

    const queueSongs = queue
        .map((id) => songs.find((s) => s.id === id))
        .filter(Boolean);

    const handleDragStart = (e, index) => {
        setDraggedIdx(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, targetIdx) => {
        e.preventDefault();
        if (draggedIdx !== null && draggedIdx !== targetIdx) {
            reorderQueue(draggedIdx, targetIdx);
        }
        setDraggedIdx(null);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Drawer */}
            <aside className="animate-fadeSlideUp fixed top-0 right-0 z-50 flex h-screen w-full max-w-sm flex-col border-l border-line-strong/30 bg-raised shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-line/60 p-5">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary-container/30 bg-primary-container/10 text-primary-container">
                            <LuListMusic className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="font-display text-sm font-bold text-white">
                                Play Queue
                            </h3>
                            <p className="font-mono text-xs text-on-surface-variant">
                                {queue.length} track
                                {queue.length !== 1 ? 's' : ''} queued
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-chip text-on-surface-variant transition-colors hover:text-white"
                    >
                        <LuX className="h-4 w-4" />
                    </button>
                </div>

                {/* Scrollable list */}
                <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-5">
                    {/* Now Playing section */}
                    {currentSong && (
                        <div className="flex flex-col gap-2">
                            <h4 className="font-mono text-[11px] font-semibold tracking-wider text-primary-container uppercase">
                                NOW PLAYING
                            </h4>
                            <div className="flex items-center justify-between rounded-lg border border-primary-container/30 bg-chip p-2.5">
                                <div className="flex min-w-0 items-center gap-3">
                                    <img
                                        src={currentSong.img}
                                        alt={currentSong.title}
                                        className="h-10 w-10 flex-shrink-0 rounded object-cover"
                                    />
                                    <div className="min-w-0">
                                        <p className="truncate font-display text-xs font-bold text-white">
                                            {currentSong.title}
                                        </p>
                                        <p className="truncate text-[11px] text-on-surface-variant">
                                            {currentSong.artist}
                                        </p>
                                    </div>
                                </div>
                                <LuVolume2 className="h-4 w-4 flex-shrink-0 animate-pulse text-primary-container" />
                            </div>
                        </div>
                    )}

                    {/* Up Next section */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <h4 className="font-mono text-[11px] font-semibold tracking-wider text-on-surface-variant uppercase">
                                UP NEXT
                            </h4>
                        </div>

                        {queueSongs.length === 0 ? (
                            <p className="rounded-lg border border-line-strong/20 bg-canvas py-8 text-center text-xs text-text-muted">
                                Queue is empty.
                                <br />
                                Click + on any track to add it here.
                            </p>
                        ) : (
                            <div className="flex flex-col gap-1.5">
                                {queueSongs.map((song, idx) => (
                                    <div
                                        key={`${song.id}-${idx}`}
                                        draggable
                                        onDragStart={(e) =>
                                            handleDragStart(e, idx)
                                        }
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, idx)}
                                        onClick={() => playSong(song)}
                                        className="group flex cursor-pointer items-center justify-between rounded-lg border border-line-strong/20 bg-canvas p-2 transition-all hover:border-primary-container/40 hover:bg-overlay"
                                    >
                                        <div className="flex min-w-0 items-center gap-2.5">
                                            <LuGripVertical className="h-3.5 w-3.5 cursor-grab text-text-muted opacity-40 group-hover:opacity-100" />
                                            <img
                                                src={song.img}
                                                alt={song.title}
                                                className="h-9 w-9 flex-shrink-0 rounded object-cover"
                                            />
                                            <div className="min-w-0">
                                                <p className="truncate font-display text-xs font-semibold text-white transition-colors group-hover:text-primary-container">
                                                    {song.title}
                                                </p>
                                                <p className="truncate text-[10px] text-on-surface-variant">
                                                    {song.artist}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeFromQueue(song.id);
                                            }}
                                            className="rounded p-1 text-on-surface-variant opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white/5 hover:text-red-400"
                                            title="Remove from Queue"
                                        >
                                            <LuTrash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}
