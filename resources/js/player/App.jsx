import React, { useState, useMemo } from 'react';
import { useAudio } from './context/AudioContext';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import TopNav from './components/TopNav';
import HeroSpotlight from './components/HeroSpotlight';
import SongGrid from './components/SongGrid';
import TracklistTable from './components/TracklistTable';
import PlayerDock from './components/PlayerDock';
import LyricsDrawer from './components/LyricsDrawer';
import QueueDrawer from './components/QueueDrawer';
import NowPlayingView from './components/NowPlayingView';
import PlaylistModal from './components/PlaylistModal';
import PlaylistView from './components/PlaylistView';
import PlaylistIcon from './components/PlaylistIcon';
import ToastContainer from './components/ToastContainer';
import { LuMusic, LuPlay, LuSparkles } from 'react-icons/lu';
import SettingsModal from './components/SettingsModal';
import SuggestSongModal from './components/SuggestSongModal';
import Preloader from './components/Preloader';

export default function App() {
    const {
        songs,
        favorites,
        recentlyPlayed,
        playlists,
        playPlaylist,
        profileName,
    } = useAudio();

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
    const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);
    const [isSuggestSongOpen, setIsSuggestSongOpen] = useState(false);
    const [showPreloader, setShowPreloader] = useState(true);
    // Library active tab
    const [libraryTab, setLibraryTab] = useState('liked'); // 'liked', 'recent'

    // Filtered Songs calculation
    const displayedSongs = useMemo(() => {
        let result = [...songs];

        // If searching
        if (searchVal.trim()) {
            const q = searchVal.toLowerCase();
            return result.filter(
                (s) =>
                    s.title.toLowerCase().includes(q) ||
                    s.artist.toLowerCase().includes(q) ||
                    s.album.toLowerCase().includes(q) ||
                    s.genre.toLowerCase().includes(q),
            );
        }

        // View specific filtering
        if (currentView === 'library') {
            if (libraryTab === 'liked') {
                return result.filter((s) => favorites.includes(s.id));
            }
            if (libraryTab === 'recent') {
                return recentlyPlayed
                    .map((id) => result.find((s) => s.id === id))
                    .filter(Boolean);
            }
        }

        // Filter Chips
        if (activeFilter === 'favorites') {
            return result.filter((s) => favorites.includes(s.id));
        }
        if (activeFilter === 'lossless') {
            return result.filter((s) => {
                const raw = (s.rawSrc || '').toLowerCase();
                return (
                    raw.includes('.flac') ||
                    raw.includes('.wav') ||
                    s.genre === 'Rock'
                );
            });
        }
        if (activeFilter !== 'all') {
            const g = activeFilter.toLowerCase();
            return result.filter((s) => (s.genre || '').toLowerCase() === g);
        }

        return result;
    }, [
        songs,
        searchVal,
        currentView,
        libraryTab,
        activeFilter,
        favorites,
        recentlyPlayed,
    ]);

    const { isPlaying } = useAudio();

    return (
        <>
            {showPreloader && <Preloader onComplete={() => setShowPreloader(false)} />}
            <div className="player-font relative flex h-dvh w-full overflow-hidden bg-canvas text-ink-strong select-none">
                <div
                    className="pointer-events-none absolute -top-40 left-1/4 h-[520px] w-[520px] rounded-full blur-[130px] transition-opacity duration-700"
                    style={{
                        background: 'var(--accent-glow)',
                        opacity: isPlaying ? 0.9 : 0.4,
                        animation: isPlaying ? 'dockBreath 1800ms ease-in-out infinite' : 'none',
                    }}
                />
                <div
                    className="pointer-events-none absolute bottom-[-160px] right-1/4 h-[620px] w-[620px] rounded-full blur-[130px] transition-opacity duration-700"
                    style={{
                        background: 'var(--accent-glow)',
                        opacity: isPlaying ? 0.8 : 0.35,
                        animation: isPlaying ? 'dockBreath 2200ms ease-in-out infinite' : 'none',
                    }}
                />
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
                onOpenSuggestSong={() => setIsSuggestSongOpen(true)}
            />

            {/* Main Viewport */}
            <div className="flex h-dvh flex-1 flex-col overflow-hidden bg-canvas lg:ml-64">
                {/* Top Navbar */}
                <TopNav
                    searchVal={searchVal}
                    setSearchVal={(v) => {
                        setSearchVal(v);
                        if (v && currentView !== 'search')
                            setCurrentView('search');
                    }}
                    onToggleMobileMenu={() =>
                        setIsMobileMenuOpen((prev) => !prev)
                    }
                    onOpenSettings={() => setIsSettingsOpen(true)}
                    onOpenSuggestSong={() => setIsSuggestSongOpen(true)}
                />
                {/* Scrollable Stream */}
                <main className="flex-1 overflow-y-auto px-4 pt-6 pb-52 md:px-8 lg:pb-36">
                    <div className="mx-auto flex max-w-7xl flex-col gap-8">
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
                                <div className="flex flex-col justify-between gap-4 border-b border-line-strong/20 pb-5 sm:flex-row sm:items-center">
                                    <div>
                                        <h2 className="font-display text-2xl font-bold text-ink-strong md:text-3xl">
                                            Your Library
                                        </h2>
                                        <p className="mt-1 font-mono text-xs text-on-surface-variant">
                                            {favorites.length} saved track
                                            {favorites.length !== 1
                                                ? 's'
                                                : ''}{' '}
                                            &bull; {recentlyPlayed.length}{' '}
                                            recently played
                                        </p>
                                    </div>

                                    {/* Library Subtabs */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <button
                                            onClick={() =>
                                                setLibraryTab('liked')
                                            }
                                            className={`focus-ring rounded-full px-4 py-2 font-mono text-xs font-medium transition-colors duration-200 ease-out motion-reduce:transition-none ${
                                                libraryTab === 'liked'
                                                    ? 'bg-primary-container font-bold text-on-primary-container shadow-[0_0_12px_var(--accent-glow)]'
                                                    : 'border border-line-strong/30 bg-raised text-on-surface-variant hover:text-ink-strong'
                                            }`}
                                        >
                                            Liked Songs ({favorites.length})
                                        </button>
                                        <button
                                            onClick={() =>
                                                setLibraryTab('recent')
                                            }
                                            className={`focus-ring rounded-full px-4 py-2 font-mono text-xs font-medium transition-colors duration-200 ease-out motion-reduce:transition-none ${
                                                libraryTab === 'recent'
                                                    ? 'bg-primary-container font-bold text-on-primary-container shadow-[0_0_12px_var(--accent-glow)]'
                                                    : 'border border-line-strong/30 bg-raised text-on-surface-variant hover:text-ink-strong'
                                            }`}
                                        >
                                            Recently Played (
                                            {recentlyPlayed.length})
                                        </button>
                                        <button
                                            onClick={() =>
                                                setLibraryTab('playlists')
                                            }
                                            className={`focus-ring rounded-full px-4 py-2 font-mono text-xs font-medium transition-colors duration-200 ease-out motion-reduce:transition-none ${
                                                libraryTab === 'playlists'
                                                    ? 'bg-primary-container font-bold text-on-primary-container shadow-[0_0_12px_var(--accent-glow)]'
                                                    : 'border border-line-strong/30 bg-raised text-on-surface-variant hover:text-ink-strong'
                                            }`}
                                        >
                                            Shared Playlists ({playlists.length}
                                            )
                                        </button>
                                    </div>
                                </div>

                                {libraryTab === 'playlists' ? (
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
                                        {playlists.map((pl) => (
                                            <div
                                                key={pl.id}
                                                className="group relative flex flex-col rounded-2xl border border-line-strong/20 bg-raised p-3 transition-colors duration-200 ease-out hover:border-primary-container/60 hover:bg-overlay motion-reduce:transition-none"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setActivePlaylistId(
                                                            pl.id,
                                                        );
                                                        setCurrentView(
                                                            'playlist',
                                                        );
                                                    }}
                                                    aria-label={`Buka playlist ${pl.name}`}
                                                    className="focus-ring absolute inset-0 z-0 rounded-2xl"
                                                />
                                                <div className="pointer-events-none relative z-10 mb-3 flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-chip">
                                                    {pl.customCover ? (
                                                        <img
                                                            src={pl.customCover}
                                                            alt=""
                                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full flex-col items-center justify-center bg-linear-to-br from-chip to-canvas">
                                                            <PlaylistIcon
                                                                value={
                                                                    pl.emoji
                                                                }
                                                                className="h-10 w-10 text-on-surface-variant"
                                                            />
                                                        </div>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            playPlaylist(
                                                                pl.id,
                                                                false,
                                                            )
                                                        }
                                                        aria-label={`Putar playlist ${pl.name}`}
                                                        className="pointer-events-auto focus-ring absolute right-2.5 bottom-2.5 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-on-primary-container opacity-90 shadow-xl transition-transform duration-200 hover:scale-110 active:scale-95 motion-reduce:transition-none sm:opacity-0 sm:group-hover:opacity-100"
                                                    >
                                                        <LuPlay
                                                            className="ml-0.5 h-4 w-4 fill-current"
                                                            aria-hidden="true"
                                                        />
                                                    </button>
                                                </div>
                                                <div className="pointer-events-none relative z-10 flex min-w-0 flex-col">
                                                    <h4 className="truncate font-display text-sm font-bold text-ink-strong transition-colors group-hover:text-primary-container">
                                                        {pl.name}
                                                    </h4>
                                                    <p className="mt-0.5 truncate text-xs text-on-surface-variant">
                                                        Created by{' '}
                                                        {pl.creator_name ||
                                                            'Admin'}{' '}
                                                        &bull; {pl.songs.length}{' '}
                                                        tracks
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
                                        onOpenPlaylistModal={(s) =>
                                            setPlaylistModalSong(s)
                                        }
                                    />
                                )}
                            </div>
                        ) : currentView === 'search' ? (
                            /* Search View */
                            <div className="flex flex-col gap-6">
                                <div className="border-b border-line-strong/20 pb-5">
                                    <h2 className="font-display text-2xl font-bold text-ink-strong md:text-3xl">
                                        {searchVal
                                            ? `Search Results for "${searchVal}"`
                                            : 'Browse & Search'}
                                    </h2>
                                    <p className="mt-1 font-mono text-xs text-on-surface-variant">
                                        Found {displayedSongs.length} matching
                                        track
                                        {displayedSongs.length !== 1 ? 's' : ''}
                                    </p>
                                </div>

                                <SongGrid
                                    songs={displayedSongs}
                                    activeFilter={activeFilter}
                                    setActiveFilter={setActiveFilter}
                                    onOpenPlaylistModal={(s) =>
                                        setPlaylistModalSong(s)
                                    }
                                />

                                <TracklistTable
                                    songs={displayedSongs}
                                    onOpenPlaylistModal={(s) =>
                                        setPlaylistModalSong(s)
                                    }
                                />
                            </div>
                        ) : (
                            /* Home View */
                            <>
                                {/* Greeting & Header section */}
                                <div className="flex flex-col justify-between gap-4 border-b border-line-strong/20 pb-5 md:flex-row md:items-end">
                                    <div>
                                        <div className="mb-2 inline-flex items-center gap-2 rounded border border-line-strong/30 bg-chip px-2.5 py-1 font-mono text-[11px] font-semibold tracking-wider text-primary-container">
                                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-container" />
                                            HIGH RESOLUTION MASTER &bull; 24-BIT
                                            / 96KHZ
                                        </div>
                                        <h2 className="font-display text-2xl font-bold tracking-tight text-ink-strong md:text-3xl">
                                            Welcome back,{' '}
                                            {profileName || 'Listener'}
                                        </h2>
                                        <p className="mt-1 font-mono text-xs text-on-surface-variant">
                                            Lossless Audio Archive &bull;{' '}
                                            {songs.length} curated tracks in
                                            priority rotation
                                        </p>
                                    </div>
                                </div>

                                {/* Hero Editorial Bento Spotlight */}
                                <HeroSpotlight
                                    onOpenLyrics={() => setIsLyricsOpen(true)}
                                />

                                {/* Song Cards Grid */}
                                <SongGrid
                                    songs={displayedSongs}
                                    activeFilter={activeFilter}
                                    setActiveFilter={setActiveFilter}
                                    onOpenPlaylistModal={(s) =>
                                        setPlaylistModalSong(s)
                                    }
                                />

                                {/* Tracklist Table */}
                                <TracklistTable
                                    songs={displayedSongs}
                                    onOpenPlaylistModal={(s) =>
                                        setPlaylistModalSong(s)
                                    }
                                />
                            </>
                        )}
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Navigation (below lg, where the rail is hidden) */}
            <BottomNav
                currentView={currentView}
                setView={(v) => {
                    setCurrentView(v);
                    setSearchVal('');
                }}
                onOpenProfile={() => setIsSettingsOpen(true)}
            />

            {/* Persistent Bottom Player Dock */}
            <PlayerDock
                onToggleLyrics={() => setIsLyricsOpen((prev) => !prev)}
                onToggleQueue={() => setIsQueueOpen((prev) => !prev)}
                onOpenNowPlaying={() => setIsNowPlayingOpen(true)}
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

            {/* Fullscreen Now Playing View */}
            <NowPlayingView
                isOpen={isNowPlayingOpen}
                onClose={() => setIsNowPlayingOpen(false)}
            />

            {/* In-App Settings Modal */}
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />

            {/* Member Suggest Song Modal */}
            <SuggestSongModal
                isOpen={isSuggestSongOpen}
                onClose={() => setIsSuggestSongOpen(false)}
            />
        </div>
        </>
    );
}
