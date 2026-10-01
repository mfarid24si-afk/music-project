import React from 'react';
import { useAudio } from '../context/AudioContext';
import { Plus, ListPlus, Heart } from 'lucide-react';

export default function TracklistTable({ songs, onOpenPlaylistModal }) {
  const { currentSong, isPlaying, playSong, favorites, toggleFavorite, addToQueue } = useAudio();

  return (
    <section className="flex flex-col gap-3">
      {/* Table Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#454934]/30 text-[11px] font-mono uppercase tracking-wider text-on-surface-variant px-3">
        <div className="flex items-center gap-3 sm:gap-6">
          <span className="w-5 text-center">#</span>
          <span>TITLE</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-6 md:gap-10">
          <span className="hidden md:inline">FIDELITY</span>
          <span className="w-12 sm:w-16 text-right">TIME</span>
          <span className="w-16 sm:w-20 text-right">ACTIONS</span>
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
              className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer group ${
                isCurrent
                  ? 'bg-[#292a2d] border border-primary-container/40 text-white'
                  : 'hover:bg-[#1b1b1f] text-[#e3e2e6]'
              }`}
            >
              {/* Left col: Number/Equalizer + Title/Artist */}
              <div className="flex items-center gap-3 sm:gap-6 min-w-0 flex-1">
                <div className="w-5 flex items-center justify-center font-mono text-xs flex-shrink-0">
                  {isSongPlaying ? (
                    <div className="flex items-end gap-0.5 h-3.5">
                      <span className="w-1 bg-primary-container h-3.5 animate-pulse" />
                      <span className="w-1 bg-primary-container h-2 animate-pulse" style={{ animationDelay: '100ms' }} />
                      <span className="w-1 bg-primary-container h-3 animate-pulse" style={{ animationDelay: '200ms' }} />
                    </div>
                  ) : (
                    <span className="text-on-surface-variant group-hover:text-primary-container font-mono">
                      {idx < 9 ? `0${idx + 1}` : idx + 1}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <p className={`text-sm font-semibold truncate font-display ${isCurrent ? 'text-primary-container' : 'text-white group-hover:text-primary-container'}`}>
                    {song.title}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-on-surface-variant truncate">
                    <span className="truncate">{song.artist}</span>
                    {song.uploader_name && (
                      <span className="hidden md:inline text-[10px] font-mono text-primary-container/80 flex-shrink-0">
                        &bull; by {song.uploader_name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right col: Fidelity + Time + Actions */}
              <div className="flex items-center gap-2 sm:gap-6 md:gap-10 text-xs font-mono flex-shrink-0">
                <span className="hidden md:inline text-primary-container bg-primary-container/10 px-2.5 py-0.5 rounded border border-primary-container/20 text-[11px]">
                  {song.genre === 'Rock' ? '24-bit / 96kHz' : 'Lossless FLAC'}
                </span>

                <span className="w-12 sm:w-16 text-right text-on-surface-variant">
                  {song.duration || '3:30'}
                </span>

                {/* Actions */}
                <div className="flex items-center justify-end gap-0.5 sm:gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => toggleFavorite(song.id)}
                    className={`p-1.5 rounded hover:bg-white/10 transition-colors ${isLiked ? 'text-primary-container' : 'text-on-surface-variant hover:text-white'}`}
                    title={isLiked ? 'Unlike' : 'Like'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => onOpenPlaylistModal(song)}
                    className="p-1.5 rounded hover:bg-white/10 text-on-surface-variant hover:text-white transition-colors"
                    title="Add to Playlist"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => addToQueue(song.id)}
                    className="p-1.5 rounded hover:bg-white/10 text-on-surface-variant hover:text-white transition-colors"
                    title="Add to Queue"
                  >
                    <ListPlus className="w-3.5 h-3.5" />
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
