import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { useDialogA11y } from '../hooks/useDialogA11y';
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
    const dialogRef = useDialogA11y({ isOpen, onClose });

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
                aria-hidden="true"
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity motion-reduce:transition-none"
                onClick={onClose}
            />

            {/* Drawer */}
            <aside
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="queue-drawer-title"
                tabIndex={-1}
                className="animate-fadeSlideUp fixed top-0 right-0 z-50 flex h-dvh w-full max-w-sm flex-col border-l border-line-strong/30 bg-raised shadow-2xl focus:outline-none"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-line/60 p-5">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary-container/30 bg-primary-container/10 text-primary-container">
                            <LuListMusic className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <div>
                            <h3
                                id="queue-drawer-title"
                                className="font-display text-sm font-bold text-ink-strong"
                            >
                                Play Queue
                            </h3>
                            <p className="font-mono text-xs text-on-surface-variant">
                                {queue.length} track
                                {queue.length !== 1 ? 's' : ''} queued
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close queue"
                        className="focus-ring flex h-8 w-8 items-center justify-center rounded-full bg-chip text-on-surface-variant transition-colors duration-200 ease-out hover:text-ink-strong motion-reduce:transition-none"
                    >
                        <LuX className="h-4 w-4" aria-hidden="true" />
                    </button>
                </div>

                {/* Scrollable list */}
                <div className="player-scroll flex flex-1 flex-col gap-6 overflow-y-auto p-5">
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
                                        <p className="truncate font-display text-xs font-bold text-ink-strong">
                                            {currentSong.title}
                                        </p>
                                        <p className="truncate text-[11px] text-on-surface-variant">
                                            {currentSong.artist}
                                        </p>
                                    </div>
                                </div>
                                <LuVolume2
                                    className="h-4 w-4 flex-shrink-0 animate-pulse text-primary-container"
                                    aria-hidden="true"
                                />
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
                                        className="group flex items-center justify-between gap-2 rounded-lg border border-line-strong/20 bg-canvas p-2 transition-colors duration-200 ease-out hover:border-primary-container/40 hover:bg-overlay motion-reduce:transition-none"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => playSong(song)}
                                            aria-label={`Play ${song.title} by ${song.artist}`}
                                            className="focus-ring flex min-w-0 flex-1 items-center gap-2.5 rounded text-left"
                                        >
                                            <LuGripVertical
                                                className="h-3.5 w-3.5 cursor-grab text-text-muted opacity-40 group-hover:opacity-100"
                                                aria-hidden="true"
                                            />
                                            <img
                                                src={song.img}
                                                alt=""
                                                className="h-9 w-9 flex-shrink-0 rounded object-cover"
                                            />
                                            <div className="min-w-0">
                                                <p className="truncate font-display text-xs font-semibold text-ink-strong transition-colors duration-200 ease-out group-hover:text-primary-container motion-reduce:transition-none">
                                                    {song.title}
                                                </p>
                                                <p className="truncate text-[11px] text-on-surface-variant">
                                                    {song.artist}
                                                </p>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeFromQueue(song.id)
                                            }
                                            aria-label={`Remove ${song.title} from queue`}
                                            className="focus-ring rounded p-1 text-on-surface-variant opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 hover:bg-hover-surface hover:text-danger motion-reduce:transition-none"
                                        >
                                            <LuTrash2
                                                className="h-3.5 w-3.5"
                                                aria-hidden="true"
                                            />
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
