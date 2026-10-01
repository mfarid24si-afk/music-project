import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { X, ListMusic, Volume2, GripVertical, Trash2 } from 'lucide-react';

export default function QueueDrawer({ isOpen, onClose }) {
  const { currentSong, queue, songs, playSong, removeFromQueue, reorderQueue } = useAudio();
  const [draggedIdx, setDraggedIdx] = useState(null);

  if (!isOpen) return null;

  const queueSongs = queue
    .map(id => songs.find(s => s.id === id))
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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="fixed top-0 right-0 h-screen w-full max-w-sm bg-[#1b1b1f] border-l border-[#454934]/30 z-50 flex flex-col shadow-2xl animate-fadeSlideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#343538]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-container/10 border border-primary-container/30 flex items-center justify-center text-primary-container">
              <ListMusic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-display">Play Queue</h3>
              <p className="text-xs text-on-surface-variant font-mono">
                {queue.length} track{queue.length !== 1 ? 's' : ''} queued
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#292a2d] text-on-surface-variant hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
          {/* Now Playing section */}
          {currentSong && (
            <div className="flex flex-col gap-2">
              <h4 className="text-[11px] font-mono uppercase tracking-wider text-primary-container font-semibold">
                NOW PLAYING
              </h4>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#292a2d] border border-primary-container/30">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={currentSong.img}
                    alt={currentSong.title}
                    className="w-10 h-10 rounded object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate font-display">
                      {currentSong.title}
                    </p>
                    <p className="text-[11px] text-on-surface-variant truncate">
                      {currentSong.artist}
                    </p>
                  </div>
                </div>
                <Volume2 className="w-4 h-4 text-primary-container animate-pulse flex-shrink-0" />
              </div>
            </div>
          )}

          {/* Up Next section */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant font-semibold">
                UP NEXT
              </h4>
            </div>

            {queueSongs.length === 0 ? (
              <p className="text-xs text-text-muted py-8 text-center bg-[#121316] rounded-lg border border-[#454934]/20">
                Queue is empty.<br />Click + on any track to add it here.
              </p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {queueSongs.map((song, idx) => (
                  <div
                    key={`${song.id}-${idx}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, idx)}
                    onClick={() => playSong(song)}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#121316] border border-[#454934]/20 hover:border-primary-container/40 hover:bg-[#1f1f23] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <GripVertical className="w-3.5 h-3.5 text-text-muted opacity-40 group-hover:opacity-100 cursor-grab" />
                      <img
                        src={song.img}
                        alt={song.title}
                        className="w-9 h-9 rounded object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate font-display group-hover:text-primary-container transition-colors">
                          {song.title}
                        </p>
                        <p className="text-[10px] text-on-surface-variant truncate">
                          {song.artist}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromQueue(song.id);
                      }}
                      className="p-1 rounded text-on-surface-variant hover:text-red-400 hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove from Queue"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
