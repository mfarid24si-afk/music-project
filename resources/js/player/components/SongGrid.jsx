import React from 'react';
import { useAudio } from '../context/AudioContext';
import { Play, Pause, Heart, ListPlus, Plus, Music } from 'lucide-react';

export default function SongGrid({ songs, activeFilter, setActiveFilter, onOpenPlaylistModal }) {
  const { currentSong, isPlaying, playSong, togglePlay, favorites, toggleFavorite, addToQueue } = useAudio();

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#454934]/20 pb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-white font-display tracking-tight">Essential Tracks</h3>
          <span className="text-[11px] font-mono text-on-surface-variant bg-[#292a2d] px-2.5 py-0.5 rounded-full border border-[#454934]/30">
            {songs.length} TRACKS
          </span>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {filterChips.map(chip => (
            <button
              key={chip.id}
              onClick={() => setActiveFilter(chip.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all ${
                activeFilter === chip.id
                  ? 'bg-[#292a2d] text-white border border-primary-container shadow-[0_0_12px_var(--accent-glow)]'
                  : 'bg-[#1b1b1f] text-on-surface-variant hover:text-white border border-[#454934]/20 hover:bg-[#292a2d]'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {songs.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <Music className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-base font-medium">No tracks found</p>
          <p className="text-xs mt-1">Try another filter or search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {songs.map((song, idx) => {
            const isCurrent = currentSong?.id === song.id;
            const isSongPlaying = isCurrent && isPlaying;
            const isLiked = favorites.includes(song.id);

            return (
              <div
                key={song.id}
                className={`group relative flex flex-col p-2.5 sm:p-3.5 rounded-2xl bg-[#1b1b1f] border transition-all duration-200 hover:bg-[#1f1f23] ${
                  isCurrent
                    ? 'border-primary-container/60 shadow-[0_0_16px_var(--accent-glow)]'
                    : 'border-[#454934]/20 hover:border-[#454934]/60'
                }`}
              >
                {/* Artwork Frame */}
                <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-[#292a2d] mb-3.5 flex items-center justify-center">
                  <img
                    src={song.img}
                    alt={song.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect width=%22200%22 height=%22200%22 fill=%22%23282828%22/%3E%3Ctext x=%22100%22 y=%22115%22 text-anchor=%22middle%22 fill=%22%23727272%22 font-size=%2260%22%3E%E2%9C%8D%3C/text%3E%3C/svg%3E';
                    }}
                  />

                  {/* Hi-Fi Badge */}
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[9px] font-mono text-primary-container font-semibold tracking-wider">
                    {song.genre || 'FLAC'}
                  </span>

                  {/* Quick Action Overlay (Queue & Playlist) */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); addToQueue(song.id); }}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/80 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:text-primary-container hover:scale-110 active:scale-95 transition-transform"
                      title="Add to Queue"
                    >
                      <ListPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onOpenPlaylistModal(song); }}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/80 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:text-primary-container hover:scale-110 active:scale-95 transition-transform"
                      title="Add to Playlist"
                    >
                      <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
                    className={`absolute bottom-2.5 right-2.5 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-primary-container text-on-primary-container shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${
                      isSongPlaying
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-90 sm:opacity-0 translate-y-0 sm:translate-y-2 sm:group-hover:opacity-100 sm:group-hover:translate-y-0'
                    }`}
                    title={isSongPlaying ? 'Pause' : 'Play'}
                  >
                    {isSongPlaying ? (
                      <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                    )}
                  </button>
                </div>

                {/* Details */}
                <div className="flex items-start justify-between gap-1.5 min-w-0">
                  <div className="min-w-0 flex-1">
                    <h4
                      onClick={() => playSong(song)}
                      className="text-xs sm:text-sm font-bold text-white truncate cursor-pointer hover:text-primary-container transition-colors font-display"
                    >
                      {song.title}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[11px] sm:text-xs text-on-surface-variant truncate">
                      <span className="truncate">{song.artist}</span>
                      {song.uploader_name && (
                        <span className="hidden sm:inline text-[9px] font-mono text-primary-container/80 flex-shrink-0">
                          &bull; {song.uploader_name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Favorite button */}
                  <button
                    onClick={() => toggleFavorite(song.id)}
                    className={`p-1.5 rounded-full transition-colors flex-shrink-0 ${
                      isLiked ? 'text-primary-container' : 'text-on-surface-variant hover:text-white'
                    }`}
                    title={isLiked ? 'Unlike' : 'Like'}
                  >
                    <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLiked ? 'fill-current' : ''}`} />
                  </button>
                </div>


                {/* Footer meta */}
                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#343538]/60 text-[11px] font-mono text-on-surface-variant">
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
