import React, { useState, useMemo } from 'react';
import { useAudio } from '../context/AudioContext';
import {
  ArrowLeft, Trash2, Music, Play, Pause, Heart, X, Edit3,
  Shuffle, ListPlus, LayoutGrid, List, Search, Plus, Clock,
  Pin, PinOff, Sparkles, Check, Upload, Image as ImageIcon, Share2, Lock
} from 'lucide-react';

const EMOJI_OPTIONS = ['🎧', '🔥', '🌙', '☕', '⚡', '💎', '🌊', '🌸', '🚀', '💿', '🎸', '🎹', '✨', '🪐'];

const GRADIENT_PRESETS = [
  { id: 'default', name: 'Acid Lime', class: 'from-[#ccf228]/25 via-[#1b1b1f] to-[#121316]', border: 'border-[#ccf228]/30', color: '#ccf228' },
  { id: 'purple', name: 'Violet', class: 'from-[#a855f7]/25 via-[#1b1b1f] to-[#121316]', border: 'border-[#a855f7]/30', color: '#a855f7' },
  { id: 'pink', name: 'Hot Pink', class: 'from-[#ec4899]/25 via-[#1b1b1f] to-[#121316]', border: 'border-[#ec4899]/30', color: '#ec4899' },
  { id: 'sunset', name: 'Amber', class: 'from-[#f97316]/25 via-[#1b1b1f] to-[#121316]', border: 'border-[#f97316]/30', color: '#f97316' },
  { id: 'ocean', name: 'Cyan', class: 'from-[#06b6d4]/25 via-[#1b1b1f] to-[#121316]', border: 'border-[#06b6d4]/30', color: '#06b6d4' },
  { id: 'slate', name: 'Cobalt', class: 'from-[#3b82f6]/25 via-[#1b1b1f] to-[#121316]', border: 'border-[#3b82f6]/30', color: '#3b82f6' }
];

function parseDurationToSeconds(str) {
  if (!str) return 210;
  const parts = str.split(':').map(Number);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 210;
}

function formatTotalDuration(seconds) {
  if (!seconds || seconds <= 0) return '0 min';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs} hr ${mins} min`;
  }
  return `${mins} min ${secs > 0 ? `${secs} sec` : ''}`;
}

export default function PlaylistView({ playlistId, onBack }) {
  const {
    playlists, songs, currentSong, isPlaying, playSong, togglePlay,
    favorites, toggleFavorite, removeFromPlaylist, deletePlaylist,
    updatePlaylist, togglePinPlaylist, playPlaylist, addPlaylistToQueue,
    addToPlaylist, publishPlaylist
  } = useAudio();

  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [filterQuery, setFilterQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const playlist = playlists.find(p => p.id === playlistId);

  // Form states for editing
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editEmoji, setEditEmoji] = useState('🎧');
  const [editGradient, setEditGradient] = useState('default');
  const [editCustomCover, setEditCustomCover] = useState('');
  if (!playlist) {
    return (
      <div className="py-20 text-center text-on-surface-variant flex flex-col items-center gap-3 animate-fadeIn">
        <div className="w-14 h-14 rounded-full bg-[#1b1b1f] border border-[#454934]/30 flex items-center justify-center text-primary-container">
          <Music className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">Playlist not found</h3>
        <p className="text-xs text-on-surface-variant max-w-xs">
          The playlist you are looking for may have been deleted or moved.
        </p>
        <button
          onClick={onBack}
          className="mt-2 px-5 py-2 rounded-full bg-primary-container text-on-primary-container text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-[0_0_12px_var(--accent-glow)]"
        >
          Return to Library
        </button>
      </div>
    );
  }

  const playlistSongs = useMemo(() => {
    return (playlist.songs || [])
      .map(id => songs.find(s => s.id === id))
      .filter(Boolean);
  }, [playlist.songs, songs]);

  const filteredSongs = useMemo(() => {
    if (!filterQuery.trim()) return playlistSongs;
    const q = filterQuery.toLowerCase();
    return playlistSongs.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q) ||
      (s.album && s.album.toLowerCase().includes(q))
    );
  }, [playlistSongs, filterQuery]);

  // Songs not yet in this playlist (for recommended quick-add)
  const candidateSongs = useMemo(() => {
    const existingIds = new Set(playlist.songs || []);
    return songs.filter(s => !existingIds.has(s.id)).slice(0, 6);
  }, [songs, playlist.songs]);

  const totalSeconds = useMemo(() => {
    return playlistSongs.reduce((acc, s) => acc + parseDurationToSeconds(s.duration), 0);
  }, [playlistSongs]);

  const currentGradient = GRADIENT_PRESETS.find(g => g.id === (playlist.gradient || 'default')) || GRADIENT_PRESETS[0];

  const isCurrentPlaylistPlaying = isPlaying && playlistSongs.some(s => s.id === currentSong?.id);
  const isLocked = playlist.status !== 'approved' && playlist.isLocked !== false;

  const handleOpenEdit = () => {
    setEditName(playlist.name);
    setEditDesc(playlist.description || '');
    setEditEmoji(playlist.emoji || '🎧');
    setEditGradient(playlist.gradient || 'default');
    setEditCustomCover(playlist.customCover || '');
    setIsEditing(true);
  };

  const handleCoverFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert('Please select an image smaller than 3MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setEditCustomCover(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    updatePlaylist(playlist.id, {
      name: editName.trim(),
      description: editDesc.trim(),
      emoji: editEmoji,
      gradient: editGradient,
      customCover: editCustomCover,
    });
    setIsEditing(false);
  };

  const handleDeletePlaylist = () => {
    if (window.confirm(`Delete playlist "${playlist.name}"? This cannot be undone.`)) {
      deletePlaylist(playlist.id);
      onBack();
    }
  };

  // Collage artwork component
  // Artwork component (custom cover > 4-image collage > single cover > gradient emoji)
  const renderCoverArt = () => {
    if (playlist.customCover) {
      return (
        <div className="relative w-40 h-40 md:w-52 md:h-52 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex-shrink-0 bg-[#1b1b1f] group">
          <img
            src={playlist.customCover}
            alt={playlist.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2.5 right-2.5 w-9 h-9 rounded-full bg-black/70 backdrop-blur-md border border-white/15 flex items-center justify-center text-lg shadow-md">
            {playlist.emoji || '🎧'}
          </div>
        </div>
      );
    }

    const covers = playlistSongs.slice(0, 4).map(s => s.img).filter(Boolean);
    if (covers.length >= 4) {
      return (
        <div className="grid grid-cols-2 grid-rows-2 w-40 h-40 md:w-52 md:h-52 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex-shrink-0 group">
          {covers.slice(0, 4).map((c, i) => (
            <img key={i} src={c} alt="Cover" className="w-full h-full object-cover" />
          ))}
        </div>
      );
    }
    if (covers.length > 0) {
      return (
        <div className="relative w-40 h-40 md:w-52 md:h-52 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex-shrink-0 bg-[#1b1b1f]">
          <img src={covers[0]} alt={playlist.name} className="w-full h-full object-cover" />
          <div className="absolute top-2.5 right-2.5 w-9 h-9 rounded-full bg-black/70 backdrop-blur-md border border-white/15 flex items-center justify-center text-lg">
            {playlist.emoji || '🎧'}
          </div>
        </div>
      );
    }
    return (
      <div className={`w-40 h-40 md:w-52 md:h-52 rounded-2xl bg-gradient-to-br ${currentGradient.class} border ${currentGradient.border} shadow-2xl flex flex-col items-center justify-center gap-2 flex-shrink-0`}>
        <span className="text-5xl">{playlist.emoji || '🎧'}</span>
        <span className="text-[10px] font-mono uppercase tracking-wider text-white/60 font-bold">Curated Mix</span>
      </div>
    );
  };
  return (
    <div className="flex flex-col gap-8 animate-fadeIn">
      {/* Editorial Hero Header */}
      <section className={`relative overflow-hidden rounded-2xl bg-gradient-to-b ${currentGradient.class} border ${currentGradient.border} p-6 md:p-8 shadow-2xl`}>
        {/* Glow ambient */}
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: currentGradient.color }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end gap-6 md:gap-8">
          {/* Back button on mobile */}
          <div className="flex items-center justify-between md:hidden w-full">
            <button
              onClick={onBack}
              className="h-9 px-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center gap-1.5 text-xs text-white/80 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => togglePinPlaylist(playlist.id)}
                className={`p-2 rounded-full backdrop-blur-md border transition-colors ${
                  playlist.isPinned
                    ? 'bg-primary-container text-on-primary-container border-primary-container'
                    : 'bg-black/40 text-white/70 border-white/10 hover:text-white'
                }`}
                title={playlist.isPinned ? 'Unpin' : 'Pin to Top'}
              >
                {playlist.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
              </button>
              <button
                onClick={handleOpenEdit}
                className="p-2 rounded-full bg-black/40 text-white/70 hover:text-white backdrop-blur-md border border-white/10"
                title="Edit Playlist"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cover Collage / Art */}
          <div className="relative group cursor-pointer" onClick={handleOpenEdit} title="Click to edit playlist details">
            {renderCoverArt()}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-xs rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-opacity text-white text-xs font-semibold">
              <Edit3 className="w-5 h-5 text-primary-container" />
              <span>Edit Details</span>
            </div>
          </div>

          {/* Playlist Info */}
          <div className="flex-1 flex flex-col justify-end min-w-0">
            {/* Top pill / badge */}
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={onBack}
                className="hidden md:flex items-center gap-1 text-xs font-mono text-white/60 hover:text-white transition-colors mr-2"
                title="Back"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>LIBRARY</span>
              </button>
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold px-2 py-0.5 rounded bg-black/40 border border-white/10 text-primary-container">
                {playlist.emoji || '🎧'} PERSONAL PLAYLIST
              </span>
              {playlist.isPinned && (
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-primary-container/20 text-primary-container border border-primary-container/30 font-bold flex items-center gap-1">
                  <Pin className="w-3 h-3" /> PINNED
                </span>
              )}
              {isLocked ? (
                <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-400" /> MENUNGGU IZIN ADMIN (TERKUNCI)
                </span>
              ) : (
                <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-400" /> DISETUJUI ADMIN (AKTIF)
                </span>
              )}
            </div>

            {/* Title */}
            <h1
              onClick={handleOpenEdit}
              className="text-3xl md:text-5xl lg:text-6xl font-black text-white font-display tracking-tight leading-none truncate cursor-pointer hover:text-primary-container transition-colors"
              title="Click to rename"
            >
              {playlist.name}
            </h1>

            {/* Description */}
            <p
              onClick={handleOpenEdit}
              className="text-xs md:text-sm text-on-surface-variant mt-2 max-w-2xl line-clamp-2 leading-relaxed cursor-pointer hover:text-white transition-colors"
              title="Click to edit description"
            >
              {playlist.description || 'Add a personal note, description, or mood for this playlist...'}
            </p>

            {/* Meta Row */}
            <div className="flex items-center gap-2 mt-4 text-xs font-mono text-white/70 flex-wrap">
              <span className="font-semibold text-white">Admin</span>
              <span>&bull;</span>
              <span>{playlistSongs.length} track{playlistSongs.length !== 1 ? 's' : ''}</span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-primary-container" />
                {formatTotalDuration(totalSeconds)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Locked Submission Banner */}
      {isLocked && (
        <section className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5 text-amber-200 animate-fadeIn">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 flex-shrink-0 mt-0.5">
            <Lock className="w-5 h-5" />
          </div>
          <div className="flex-1 text-xs">
            <div className="font-bold text-amber-300 text-sm flex items-center gap-2 flex-wrap">
              <span>Status Pengajuan: Menunggu Persetujuan Administrator</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/25 border border-amber-500/40 text-amber-300 font-mono">
                TERKUNCI
              </span>
            </div>
            <p className="mt-1 text-amber-200/80 leading-relaxed">
              Playlist ini telah diajukan ke sistem. Sebelum disetujui di Portal Admin, seluruh lagu dalam playlist ini berstatus terkunci dan belum dapat diputar. Silakan tunggu Administrator menyetujuinya di Dashboard Admin.
            </p>
          </div>
        </section>
      )}

      {/* Action Bar */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Playback Controls */}
        <div className="flex items-center gap-3">
          {/* Main Play Button */}
          <button
            onClick={() => {
              if (isLocked) {
                showToast('🔒 Playlist terkunci! Menunggu izin Administrator sebelum dapat diputar.', 'warning');
                return;
              }
              if (isCurrentPlaylistPlaying) {
                togglePlay();
              } else {
                playPlaylist(playlist.id, false);
              }
            }}
            disabled={playlistSongs.length === 0}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-[0_0_20px_var(--accent-glow)] disabled:opacity-50 disabled:cursor-not-allowed ${
              isLocked
                ? 'bg-amber-500/20 border-2 border-amber-400/50 text-amber-300 hover:bg-amber-500/30'
                : 'bg-primary-container text-on-primary-container hover:scale-105 active:scale-95'
            }`}
            title={isLocked ? 'Playlist terkunci (Menunggu persetujuan Admin)' : (isCurrentPlaylistPlaying ? 'Pause Playlist' : 'Play Playlist')}
          >
            {isLocked ? (
              <Lock className="w-6 h-6 text-amber-300" />
            ) : isCurrentPlaylistPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            )}
          </button>
          {/* Shuffle Button */}
          {/* Shuffle Button */}
          <button
            onClick={() => {
              if (isLocked) {
                showToast('🔒 Playlist terkunci! Menunggu izin Administrator.', 'warning');
                return;
              }
              playPlaylist(playlist.id, true);
            }}
            disabled={playlistSongs.length === 0}
            className={`h-10 px-4 rounded-full border flex items-center gap-2 text-xs font-semibold font-mono transition-all disabled:opacity-40 ${
              isLocked
                ? 'bg-[#1b1b1f] border-amber-500/30 text-amber-300/80'
                : 'bg-[#1b1b1f] border-[#454934]/30 hover:border-primary-container hover:text-primary-container text-on-surface-variant'
            }`}
            title={isLocked ? 'Playlist terkunci' : 'Shuffle Play Playlist'}
          >
            <Shuffle className="w-4 h-4" />
            <span>SHUFFLE</span>
          </button>

          {/* Add to Queue */}
          <button
            onClick={() => addPlaylistToQueue(playlist.id)}
            disabled={playlistSongs.length === 0}
            className="h-10 px-4 rounded-full bg-[#1b1b1f] border border-[#454934]/30 hover:bg-[#292a2d] text-on-surface-variant hover:text-white flex items-center gap-2 text-xs font-semibold transition-all disabled:opacity-40"
            title="Enqueue all tracks"
          >
            <ListPlus className="w-4 h-4 text-primary-container" />
            <span className="hidden sm:inline">Add to Queue</span>
          </button>

          {/* Publish / Community Sync */}
          <button
            onClick={() => publishPlaylist(playlist.id)}
            className={`h-10 px-3.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              playlist.isCommunity
                ? 'bg-primary-container/20 border-primary-container text-primary-container'
                : 'bg-[#1b1b1f] border-[#454934]/30 text-on-surface-variant hover:text-white hover:border-primary-container'
            }`}
            title="Publish this playlist so all users and friends can see and stream it"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{playlist.isCommunity ? 'Shared in Community' : 'Publish to Community'}</span>
          </button>
          {/* Pin Button (Desktop) */}
          <button
            onClick={() => togglePinPlaylist(playlist.id)}
            className={`hidden md:flex p-2.5 rounded-full border transition-all ${
              playlist.isPinned
                ? 'bg-primary-container text-on-primary-container border-primary-container shadow-[0_0_12px_var(--accent-glow)]'
                : 'bg-[#1b1b1f] border-[#454934]/30 text-on-surface-variant hover:text-white hover:bg-[#292a2d]'
            }`}
            title={playlist.isPinned ? 'Unpin Playlist' : 'Pin to Top of Sidebar'}
          >
            {playlist.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
          </button>

          {/* Edit Button (Desktop) */}
          <button
            onClick={handleOpenEdit}
            className="hidden md:flex p-2.5 rounded-full bg-[#1b1b1f] border border-[#454934]/30 text-on-surface-variant hover:text-white hover:bg-[#292a2d] transition-all"
            title="Edit Playlist Details"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {/* Delete Button */}
          <button
            onClick={handleDeletePlaylist}
            className="p-2.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all ml-auto sm:ml-0"
            title="Delete Playlist"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Input & View Switcher */}
        <div className="flex items-center gap-2.5">
          {playlistSongs.length > 3 && (
            <div className="relative flex-1 sm:w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter tracks..."
                className="w-full h-9 pl-8 pr-7 bg-[#1b1b1f] border border-[#454934]/30 rounded-full text-xs text-white placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary-container transition-colors"
              />
              {filterQuery && (
                <button
                  onClick={() => setFilterQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* View Mode Switcher */}
          <div className="flex items-center rounded-lg bg-[#1b1b1f] border border-[#454934]/30 p-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary-container text-on-primary-container shadow-xs'
                  : 'text-on-surface-variant hover:text-white'
              }`}
              title="Table List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-primary-container text-on-primary-container shadow-xs'
                  : 'text-on-surface-variant hover:text-white'
              }`}
              title="Grid Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Main Track Section */}
      {playlistSongs.length === 0 ? (
        <div className="py-16 px-6 text-center bg-[#1b1b1f] rounded-2xl border border-[#454934]/30 flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-[#292a2d] border border-[#454934]/40 flex items-center justify-center text-3xl">
            {playlist.emoji || '🎧'}
          </div>
          <h3 className="text-lg font-bold text-white font-display">This playlist is completely empty</h3>
          <p className="text-xs text-on-surface-variant max-w-sm leading-relaxed">
            Start personalizing this collection by clicking <strong>&quot;+ Add&quot;</strong> on recommended tracks below or using the ➕ button across the library.
          </p>
        </div>
      ) : filteredSongs.length === 0 ? (
        <div className="py-12 text-center text-on-surface-variant bg-[#1b1b1f] rounded-xl border border-[#454934]/20">
          <p className="text-sm">No tracks matching &quot;{filterQuery}&quot; in this playlist.</p>
          <button
            onClick={() => setFilterQuery('')}
            className="mt-2 text-xs text-primary-container underline"
          >
            Clear search
          </button>
        </div>
      ) : viewMode === 'list' ? (
        /* ================= LIST / TABLE VIEW ================= */
        <div className="flex flex-col gap-1 bg-[#1b1b1f]/60 rounded-2xl border border-[#454934]/20 p-2 md:p-4">
          {/* Table Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#454934]/30 text-[11px] font-mono uppercase tracking-wider text-on-surface-variant px-3">
            <div className="flex items-center gap-3 sm:gap-6 min-w-0 flex-1">
              <span className="w-6 text-center flex-shrink-0">#</span>
              <span>TITLE & ARTIST</span>
            </div>
            <div className="flex items-center gap-3 sm:gap-6 md:gap-8 flex-shrink-0">
              <span className="hidden lg:inline text-right w-24">ALBUM</span>
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
                    showToast('🔒 Playlist terkunci! Menunggu izin Administrator sebelum lagu dapat diputar.', 'warning');
                    return;
                  }
                  playSong(song);
                }}
                className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl transition-all cursor-pointer group ${
                  isCurrent
                    ? 'bg-[#292a2d] border border-primary-container/40 text-white shadow-sm'
                    : 'hover:bg-[#222327] text-[#e3e2e6]'
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-6 flex items-center justify-center font-mono text-xs flex-shrink-0 text-on-surface-variant">
                    {isSongPlaying ? (
                      <div className="flex items-end gap-0.5 h-3.5">
                        <span className="w-1 bg-primary-container h-3.5 animate-pulse" />
                        <span className="w-1 bg-primary-container h-2 animate-pulse" style={{ animationDelay: '100ms' }} />
                        <span className="w-1 bg-primary-container h-3 animate-pulse" style={{ animationDelay: '200ms' }} />
                      </div>
                    ) : (
                      <span className="group-hover:text-primary-container">
                        {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                      </span>
                    )}
                  </div>

                  {/* Artwork thumbnail */}
                  <img
                    src={song.img}
                    alt={song.title}
                    className="w-10 h-10 rounded-md object-cover flex-shrink-0 bg-[#292a2d]"
                  />

                  <div className="min-w-0 flex-1 pr-2">
                    <p className={`text-sm font-semibold truncate font-display ${isCurrent ? 'text-primary-container' : 'text-white group-hover:text-primary-container'}`}>
                      {song.title}
                    </p>
                    <p className="text-xs text-on-surface-variant truncate">
                      {song.artist}
                    </p>
                  </div>
                </div>

                {/* Right: Album + Time + Action buttons */}
                <div className="flex items-center gap-3 sm:gap-6 md:gap-8 text-xs font-mono flex-shrink-0">
                  <span className="hidden lg:inline text-right w-24 text-on-surface-variant truncate">
                    {song.album || 'Single'}
                  </span>

                  <span className="w-12 text-right text-on-surface-variant">
                    {song.duration || '3:30'}
                  </span>

                  <div className="w-16 flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => toggleFavorite(song.id)}
                      className={`p-1.5 rounded hover:bg-white/10 transition-colors ${
                        isLiked ? 'text-primary-container' : 'text-on-surface-variant hover:text-white'
                      }`}
                      title={isLiked ? 'Unlike' : 'Like'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      onClick={() => removeFromPlaylist(playlist.id, song.id)}
                      className="p-1.5 rounded hover:bg-white/10 text-on-surface-variant hover:text-red-400 transition-colors"
                      title="Remove from playlist"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= GRID / CARDS VIEW ================= */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {filteredSongs.map((song, idx) => {
            const isCurrent = currentSong?.id === song.id;
            const isSongPlaying = isCurrent && isPlaying;
            const isLiked = favorites.includes(song.id);

            return (
              <div
                key={`${song.id}-${idx}`}
                className={`group relative flex flex-col p-3 rounded-2xl bg-[#1b1b1f] border transition-all duration-200 hover:bg-[#1f1f23] ${
                  isCurrent
                    ? 'border-primary-container/60 shadow-[0_0_16px_var(--accent-glow)]'
                    : 'border-[#454934]/20 hover:border-[#454934]/60'
                }`}
              >
                {/* Artwork */}
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#292a2d] mb-3 flex items-center justify-center">
                  <img
                    src={song.img}
                    alt={song.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromPlaylist(playlist.id, song.id);
                    }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/80 backdrop-blur-sm border border-white/10 flex items-center justify-center text-on-surface-variant hover:text-red-400 hover:scale-110 transition-transform opacity-0 group-hover:opacity-100"
                    title="Remove from playlist"
                  >
                    <X className="w-3.5 h-3.5" />
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
                    className={`absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-primary-container text-on-primary-container shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${
                      isSongPlaying
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
                    }`}
                    title={isSongPlaying ? 'Pause' : 'Play'}
                  >
                    {isSongPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>
                </div>

                {/* Details */}
                <div className="flex items-start justify-between gap-1.5 min-w-0">
                  <div className="min-w-0 flex-1">
                    <h4
                      onClick={() => playSong(song)}
                      className="text-xs md:text-sm font-bold text-white truncate cursor-pointer hover:text-primary-container transition-colors font-display"
                    >
                      {song.title}
                    </h4>
                    <p className="text-[11px] text-on-surface-variant truncate mt-0.5">
                      {song.artist}
                    </p>
                  </div>

                  <button
                    onClick={() => toggleFavorite(song.id)}
                    className={`p-1 rounded transition-colors flex-shrink-0 ${
                      isLiked ? 'text-primary-container' : 'text-on-surface-variant hover:text-white'
                    }`}
                    title={isLiked ? 'Unlike' : 'Like'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Card footer */}
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#343538]/60 text-[10px] font-mono text-on-surface-variant">
                  <span>TRACK {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</span>
                  <span>{song.duration || '3:30'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= QUICK ADD / RECOMMENDED SECTION ================= */}
      {candidateSongs.length > 0 && (
        <section className="mt-4 pt-6 border-t border-[#454934]/30 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-container" />
              <h3 className="text-base font-bold text-white font-display">
                Recommended for this Playlist
              </h3>
            </div>
            <span className="text-[11px] font-mono text-on-surface-variant">
              Quickly build your soundtrack
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {candidateSongs.map(song => (
              <div
                key={song.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#1b1b1f] border border-[#454934]/20 hover:border-primary-container/40 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                  <img
                    src={song.img}
                    alt={song.title}
                    className="w-10 h-10 rounded-md object-cover flex-shrink-0 bg-[#292a2d]"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate font-display">
                      {song.title}
                    </p>
                    <p className="text-[11px] text-on-surface-variant truncate">
                      {song.artist}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => addToPlaylist(playlist.id, song.id)}
                  className="h-8 px-3 rounded-full bg-[#292a2d] hover:bg-primary-container hover:text-on-primary-container text-xs font-mono font-semibold text-primary-container flex items-center gap-1.5 transition-all shadow-xs flex-shrink-0"
                  title="Add to this playlist"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ================= EDIT PLAYLIST MODAL ================= */}
      {isEditing && (
        <>
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 transition-opacity"
            onClick={() => setIsEditing(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#1f1f23] border border-[#454934]/40 rounded-2xl z-50 p-6 shadow-2xl flex flex-col gap-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#343538]/60">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-primary-container" />
                <h3 className="text-base font-bold text-white font-display">Edit Playlist Details</h3>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="w-7 h-7 rounded-full bg-[#292a2d] text-on-surface-variant hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-4">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant font-bold">
                  Playlist Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Midnight Beats, Chill Vibes"
                  maxLength={40}
                  required
                  className="bg-[#121316] border border-[#454934]/30 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary-container transition-colors"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant font-bold">
                  Personal Note / Description
                </label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Write a personal mood, vibe, or memories about this playlist..."
                  rows={3}
                  maxLength={200}
                  className="bg-[#121316] border border-[#454934]/30 rounded-lg px-3.5 py-2 text-xs text-white placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary-container transition-colors resize-none"
                />
              </div>
              {/* Custom Cover Photo Upload */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant font-bold">
                  Custom Cover Photo (Optional)
                </label>
                {editCustomCover ? (
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-[#121316] border border-[#454934]/30">
                    <img
                      src={editCustomCover}
                      alt="Cover preview"
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-white/10"
                    />
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <span className="text-xs font-semibold text-white truncate">Photo cover active</span>
                      <button
                        type="button"
                        onClick={() => setEditCustomCover('')}
                        className="text-[11px] text-red-400 hover:text-red-300 text-left font-mono"
                      >
                        ✕ Remove & use default collage
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#121316] border border-dashed border-[#454934]/50 hover:border-primary-container text-xs text-on-surface-variant hover:text-white cursor-pointer transition-colors">
                      <Upload className="w-4 h-4 text-primary-container" />
                      <span>Upload Custom Cover Photo (JPG, PNG)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverFileUpload}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="url"
                      placeholder="Or paste an image URL (https://...)"
                      value={editCustomCover}
                      onChange={(e) => setEditCustomCover(e.target.value)}
                      className="bg-[#121316] border border-[#454934]/30 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary-container transition-colors"
                    />
                  </div>
                )}
              </div>

              {/* Emoji Badge */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant font-bold">
                  Cover Icon / Emoji
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {EMOJI_OPTIONS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setEditEmoji(emoji)}
                      className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                        editEmoji === emoji
                          ? 'bg-primary-container/20 border-2 border-primary-container scale-110'
                          : 'bg-[#121316] border border-[#454934]/30 hover:bg-[#292a2d]'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Gradient */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant font-bold">
                  Theme Ambient Glow
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {GRADIENT_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setEditGradient(preset.id)}
                      className={`h-9 rounded-lg border text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all ${
                        editGradient === preset.id
                          ? 'border-white text-white shadow-sm'
                          : 'border-white/10 text-on-surface-variant hover:text-white'
                      }`}
                      style={{
                        backgroundColor: `${preset.color}22`,
                        borderColor: editGradient === preset.id ? preset.color : undefined
                      }}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: preset.color }} />
                      <span>{preset.name}</span>
                      {editGradient === preset.id && <Check className="w-3 h-3 text-white ml-0.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#343538]/60 mt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-primary-container text-on-primary-container text-xs font-bold font-mono tracking-wider hover:scale-105 active:scale-95 transition-all shadow-[0_0_12px_var(--accent-glow)]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
