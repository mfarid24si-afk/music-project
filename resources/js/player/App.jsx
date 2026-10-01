import React, { useState, useMemo } from 'react';
import { useAudio } from './context/AudioContext';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import HeroSpotlight from './components/HeroSpotlight';
import SongGrid from './components/SongGrid';
import TracklistTable from './components/TracklistTable';
import PlayerDock from './components/PlayerDock';
import LyricsDrawer from './components/LyricsDrawer';
import QueueDrawer from './components/QueueDrawer';
import PlaylistModal from './components/PlaylistModal';
import PlaylistView from './components/PlaylistView';
import ToastContainer from './components/ToastContainer';
import { Sparkles, Music, Play } from 'lucide-react';
import SettingsModal from './components/SettingsModal';

export default function App() {
  const { songs, favorites, recentlyPlayed, playlists, playPlaylist, profileName } = useAudio();

  const [currentView, setCurrentView] = useState('home');
  const [activePlaylistId, setActivePlaylistId] = useState(null);
  const [searchVal, setSearchVal] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Drawers & Modals
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [playlistModalSong, setPlaylistModalSong] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  // Library active tab
  const [libraryTab, setLibraryTab] = useState('liked'); // 'liked', 'recent'

  // Filtered Songs calculation
  const displayedSongs = useMemo(() => {
    let result = [...songs];

    // If searching
    if (searchVal.trim()) {
      const q = searchVal.toLowerCase();
      return result.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.album.toLowerCase().includes(q) ||
        s.genre.toLowerCase().includes(q)
      );
    }

    // View specific filtering
    if (currentView === 'library') {
      if (libraryTab === 'liked') {
        return result.filter(s => favorites.includes(s.id));
      }
      if (libraryTab === 'recent') {
        return recentlyPlayed
          .map(id => result.find(s => s.id === id))
          .filter(Boolean);
      }
    }

    // Filter Chips
    if (activeFilter === 'favorites') {
      return result.filter(s => favorites.includes(s.id));
    }
    if (activeFilter === 'lossless') {
      return result.filter(s => {
        const raw = (s.rawSrc || '').toLowerCase();
        return raw.includes('.flac') || raw.includes('.wav') || s.genre === 'Rock';
      });
    }
    if (activeFilter !== 'all') {
      const g = activeFilter.toLowerCase();
      return result.filter(s => (s.genre || '').toLowerCase() === g);
    }

    return result;
  }, [songs, searchVal, currentView, libraryTab, activeFilter, favorites, recentlyPlayed]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#121316] text-[#e3e2e6] select-none">
      <ToastContainer />

      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        setView={(v) => {
          setCurrentView(v);
          setSearchVal('');
        }}
        activePlaylistId={activePlaylistId}
        setActivePlaylistId={setActivePlaylistId}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Viewport */}
      <div className="flex-1 lg:ml-64 flex flex-col h-screen overflow-hidden bg-[#121316]">
        {/* Top Navbar */}
        <TopNav
          searchVal={searchVal}
          setSearchVal={(v) => {
            setSearchVal(v);
            if (v && currentView !== 'search') setCurrentView('search');
          }}
          onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
        {/* Scrollable Stream */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 pt-6 pb-36">
          <div className="max-w-7xl mx-auto flex flex-col gap-8">
            {/* View Routing */}
            {currentView === 'playlist' && activePlaylistId ? (
              <PlaylistView
                playlistId={activePlaylistId}
                onBack={() => {
                  setActivePlaylistId(null);
                  setCurrentView('home');
                }}
              />
            ) : currentView === 'library' ? (
              /* Library View */
              <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#454934]/20 pb-5">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white font-display">Your Library</h2>
                    <p className="text-xs text-on-surface-variant font-mono mt-1">
                      {favorites.length} saved track{favorites.length !== 1 ? 's' : ''} &bull; {recentlyPlayed.length} recently played
                    </p>
                  </div>

                  {/* Library Subtabs */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setLibraryTab('liked')}
                      className={`px-4 py-2 rounded-full text-xs font-mono font-medium transition-all ${
                        libraryTab === 'liked'
                          ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_12px_var(--accent-glow)]'
                          : 'bg-[#1b1b1f] text-on-surface-variant hover:text-white border border-[#454934]/30'
                      }`}
                    >
                      Liked Songs ({favorites.length})
                    </button>
                    <button
                      onClick={() => setLibraryTab('recent')}
                      className={`px-4 py-2 rounded-full text-xs font-mono font-medium transition-all ${
                        libraryTab === 'recent'
                          ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_12px_var(--accent-glow)]'
                          : 'bg-[#1b1b1f] text-on-surface-variant hover:text-white border border-[#454934]/30'
                      }`}
                    >
                      Recently Played ({recentlyPlayed.length})
                    </button>
                    <button
                      onClick={() => setLibraryTab('playlists')}
                      className={`px-4 py-2 rounded-full text-xs font-mono font-medium transition-all ${
                        libraryTab === 'playlists'
                          ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_12px_var(--accent-glow)]'
                          : 'bg-[#1b1b1f] text-on-surface-variant hover:text-white border border-[#454934]/30'
                      }`}
                    >
                      Shared Playlists ({playlists.length})
                    </button>
                   </div>
                </div>
 
                {libraryTab === 'playlists' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                    {playlists.map((pl) => (
                      <div
                        key={pl.id}
                        onClick={() => {
                          setActivePlaylistId(pl.id);
                          setCurrentView('playlist');
                        }}
                        className="group relative flex flex-col p-3 rounded-2xl bg-[#1b1b1f] border border-[#454934]/20 hover:border-primary-container/60 hover:bg-[#1f1f23] transition-all cursor-pointer"
                      >
                        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#292a2d] mb-3 flex items-center justify-center">
                          {pl.customCover ? (
                            <img src={pl.customCover} alt={pl.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#292a2d] to-[#121316]">
                              <span className="text-4xl">{pl.emoji || '🎧'}</span>
                            </div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              playPlaylist(pl.id, false);
                            }}
                            className="absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-primary-container text-on-primary-container shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
                            title="Play Playlist"
                          >
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </button>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <h4 className="text-sm font-bold text-white truncate font-display group-hover:text-primary-container transition-colors">
                            {pl.name}
                          </h4>
                          <p className="text-[11px] text-on-surface-variant truncate mt-0.5">
                            Created by {pl.creator_name || 'Admin'} &bull; {pl.songs.length} tracks
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <SongGrid
                    songs={displayedSongs}
                    activeFilter={activeFilter}
                    setActiveFilter={setActiveFilter}
                    onOpenPlaylistModal={(s) => setPlaylistModalSong(s)}
                  />
                )}
              </div>
            ) : currentView === 'search' ? (
              /* Search View */
              <div className="flex flex-col gap-6">
                <div className="border-b border-[#454934]/20 pb-5">
                  <h2 className="text-2xl md:text-3xl font-bold text-white font-display">
                    {searchVal ? `Search Results for "${searchVal}"` : 'Browse & Search'}
                  </h2>
                  <p className="text-xs text-on-surface-variant font-mono mt-1">
                    Found {displayedSongs.length} matching track{displayedSongs.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <SongGrid
                  songs={displayedSongs}
                  activeFilter={activeFilter}
                  setActiveFilter={setActiveFilter}
                  onOpenPlaylistModal={(s) => setPlaylistModalSong(s)}
                />

                <TracklistTable
                  songs={displayedSongs}
                  onOpenPlaylistModal={(s) => setPlaylistModalSong(s)}
                />
              </div>
            ) : (
              /* Home View */
              <>
                {/* Greeting & Header section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#454934]/20 pb-5">
                  <div>
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#292a2d] border border-[#454934]/30 text-primary-container text-[10px] font-mono tracking-wider font-semibold mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
                      HIGH RESOLUTION MASTER &bull; 24-BIT / 96KHZ
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight font-display">
                      Welcome back, {profileName || 'Listener'}
                    </h2>
                    <p className="text-xs text-on-surface-variant mt-1 font-mono">
                      Lossless Audio Archive &bull; {songs.length} curated tracks in priority rotation
                    </p>
                  </div>
                </div>

                {/* Hero Editorial Bento Spotlight */}
                <HeroSpotlight onOpenLyrics={() => setIsLyricsOpen(true)} />

                {/* Song Cards Grid */}
                <SongGrid
                  songs={displayedSongs}
                  activeFilter={activeFilter}
                  setActiveFilter={setActiveFilter}
                  onOpenPlaylistModal={(s) => setPlaylistModalSong(s)}
                />

                {/* Tracklist Table */}
                <TracklistTable
                  songs={displayedSongs}
                  onOpenPlaylistModal={(s) => setPlaylistModalSong(s)}
                />
              </>
            )}
          </div>
        </main>
      </div>

      {/* Persistent Bottom Player Dock */}
      <PlayerDock
        onToggleLyrics={() => setIsLyricsOpen(prev => !prev)}
        onToggleQueue={() => setIsQueueOpen(prev => !prev)}
        isLyricsOpen={isLyricsOpen}
        isQueueOpen={isQueueOpen}
      />

      {/* Synced Lyrics Drawer */}
      <LyricsDrawer
        isOpen={isLyricsOpen}
        onClose={() => setIsLyricsOpen(false)}
      />

      {/* Queue Drawer */}
      <QueueDrawer
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
      />

      {/* Add to Playlist Modal */}
      <PlaylistModal
        song={playlistModalSong}
        isOpen={!!playlistModalSong}
        onClose={() => setPlaylistModalSong(null)}
      />

      {/* In-App Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
