import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { X, Check, ListMusic, Plus, Lock } from 'lucide-react';

export default function PlaylistModal({ song, isOpen, onClose }) {
  const { playlists, createPlaylist, addToPlaylist, removeFromPlaylist } = useAudio();
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
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-[#1f1f23] border border-[#454934]/40 rounded-2xl z-50 p-6 shadow-2xl flex flex-col gap-4 animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#343538]/60">
          <div>
            <h3 className="text-base font-bold text-white font-display">Add to Playlist</h3>
            <p className="text-xs text-on-surface-variant truncate max-w-[260px] mt-0.5">
              &quot;{song.title}&quot; by {song.artist}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#292a2d] text-on-surface-variant hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Existing Playlists */}
        <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1">
          {playlists.length === 0 ? (
            <p className="text-xs text-text-muted py-6 text-center">
              No playlists created yet.<br />Create your first playlist below!
            </p>
          ) : (
            playlists.map(pl => {
              const isAdded = pl.songs.includes(song.id);
              return (
                <button
                  key={pl.id}
                  onClick={() => handleToggle(pl)}
                  className={`flex items-center justify-between p-3 rounded-lg text-left transition-all border ${
                    isAdded
                      ? 'bg-primary-container/10 border-primary-container/50 text-primary-container'
                      : 'bg-[#1b1b1f] border-[#454934]/20 hover:bg-[#292a2d] text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {pl.customCover ? (
                      <img src={pl.customCover} alt={pl.name} className="w-5 h-5 rounded object-cover flex-shrink-0" />
                    ) : (
                      <span className="text-sm flex-shrink-0">{pl.emoji || '🎧'}</span>
                    )}
                    <span className="text-xs font-semibold truncate font-display">{pl.name}</span>
                    {pl.status !== 'approved' && pl.isLocked !== false && (
                      <span title="Menunggu persetujuan Admin" className="text-amber-400 text-[10px] flex items-center gap-0.5 flex-shrink-0">
                        <Lock className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-on-surface-variant">
                      {pl.songs.length} tracks
                    </span>
                    {isAdded && (
                      <span className="w-5 h-5 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Create and Add Form */}
        <form onSubmit={handleCreateAndAdd} className="flex gap-2 pt-2 border-t border-[#343538]/60">
          <input
            type="text"
            value={newPlName}
            onChange={(e) => setNewPlName(e.target.value)}
            placeholder="New playlist name..."
            maxLength={40}
            className="flex-1 bg-[#121316] border border-[#454934]/30 rounded-lg px-3 py-2 text-xs text-white placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary-container transition-colors"
          />
          <button
            type="submit"
            disabled={!newPlName.trim()}
            className="px-3.5 py-2 rounded-lg bg-primary-container text-on-primary-container font-display font-bold text-xs flex items-center gap-1 hover:opacity-90 disabled:opacity-40 transition-all flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create</span>
          </button>
        </form>
        <p className="text-[10px] text-amber-300/80 font-mono flex items-center gap-1.5 px-0.5">
          <Lock className="w-3 h-3 text-amber-400 flex-shrink-0" />
          <span>Pembuatan playlist baru memerlukan izin Administrator sebelum dapat diputar.</span>
        </p>
      </div>
    </>
  );
}
