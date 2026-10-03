import React from 'react';
import { useAudio } from '../context/AudioContext';
import { LuBadgeCheck, LuCheck, LuDisc3, LuHouse, LuLibrary, LuListMusic, LuLock, LuPin, LuPlus, LuSearch, LuX } from 'react-icons/lu';
import { getAppBaseUrl } from '../services/api';

const THEMES = [
    { id: 'default', color: '#ccf228', name: 'Acid Lime' },
    { id: 'purple', color: '#a855f7', name: 'Electric Violet' },
    { id: 'blue', color: '#3b82f6', name: 'Deep Cobalt' },
    { id: 'cyberpunk', color: '#ec4899', name: 'Hot Pink' },
    { id: 'sunset', color: '#f97316', name: 'Safety Amber' },
    { id: 'ocean', color: '#06b6d4', name: 'Cyan Laser' },
];

export default function Sidebar({
    currentView,
    setView,
    activePlaylistId,
    setActivePlaylistId,
    isMobileOpen,
    setIsMobileOpen,
    onOpenSettings,
}) {
    const { theme, setTheme, playlists, createPlaylist, profileName } =
        useAudio();

    const handleCreatePlaylist = () => {
        const name = window.prompt('Enter playlist name:');
        if (name && name.trim()) {
            const pl = createPlaylist(name.trim());
            if (pl) {
                setActivePlaylistId(pl.id);
                setView('playlist');
                if (setIsMobileOpen) setIsMobileOpen(false);
            }
        }
    };

    const sortedPlaylists = [...playlists].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return 0;
    });

    const navItems = [
        { id: 'home', label: 'Home', icon: LuHouse },
        { id: 'search', label: 'Search', icon: LuSearch },
        { id: 'library', label: 'Your Library', icon: LuLibrary },
    ];

    return (
        <>
            {/* Mobile backdrop */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <aside
                className={`fixed top-0 left-0 z-40 flex h-screen w-64 flex-col justify-between border-r border-line-strong/30 bg-chrome p-4 transition-transform duration-300 ${
                    isMobileOpen
                        ? 'translate-x-0'
                        : '-translate-x-full lg:translate-x-0'
                }`}
            >
                {/* Top Rail: Brand & Nav */}
                <div className="flex min-h-0 flex-1 flex-col gap-6">
                    {/* Brand Header */}
                    <div className="flex items-center justify-between px-2 pt-2">
                        <div
                            className="flex cursor-pointer items-center gap-3"
                            onClick={() => {
                                setView('home');
                                setActivePlaylistId(null);
                                if (setIsMobileOpen) setIsMobileOpen(false);
                            }}
                        >
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-line-strong/40 bg-chip text-primary-container shadow-inner">
                                <LuDisc3 className="animate-spin-slow h-5 w-5 text-primary-container" />
                            </div>
                            <div>
                                <h1 className="font-display text-base leading-none font-bold tracking-tight text-white">
                                    Spotirid
                                </h1>
                                <p className="mt-1 font-mono text-[10px] leading-none font-medium tracking-[0.18em] whitespace-nowrap text-on-surface-variant uppercase">
                                    FREE MUSIC PLAYBACK
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsMobileOpen(false)}
                            className="rounded-lg p-1.5 text-on-surface-variant hover:bg-overlay hover:text-white lg:hidden"
                            title="Close Menu"
                        >
                            <LuX className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Primary Nav */}
                    <nav
                        className="flex shrink-0 flex-col gap-1.5"
                        aria-label="Primary Navigation"
                    >
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive =
                                currentView === item.id && !activePlaylistId;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setView(item.id);
                                        setActivePlaylistId(null);
                                        if (setIsMobileOpen)
                                            setIsMobileOpen(false);
                                    }}
                                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-all duration-150 ${
                                        isActive
                                            ? 'border-l-2 border-primary-container bg-chip font-semibold text-white shadow-sm'
                                            : 'text-on-surface-variant hover:bg-overlay hover:text-white'
                                    }`}
                                >
                                    <Icon
                                        className={`h-5 w-5 ${isActive ? 'text-primary-container' : 'text-on-surface-variant'}`}
                                    />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>

                    {/* Divider */}
                    <div className="h-px w-full bg-chip/60" />

                    {/* Playlists Section */}
                    <div className="flex min-h-0 flex-1 flex-col gap-2">
                        <div className="flex shrink-0 items-center justify-between px-3 font-display text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">
                            <span>SHARED PLAYLISTS</span>
                            <button
                                onClick={handleCreatePlaylist}
                                className="flex items-center justify-center rounded p-1 text-on-surface-variant transition-colors hover:bg-chip hover:text-primary-container"
                                title="Create Playlist"
                            >
                                <LuPlus className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Playlist list - fills remaining rail height and scrolls */}
                        <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain pr-1">
                            {sortedPlaylists.length === 0 ? (
                                <p className="px-3 py-2 text-center text-xs text-text-muted">
                                    No playlists yet.
                                    <br />
                                    Click + to add
                                </p>
                            ) : (
                                sortedPlaylists.map((pl) => {
                                    const isActive = activePlaylistId === pl.id;
                                    return (
                                        <button
                                            key={pl.id}
                                            onClick={() => {
                                                setActivePlaylistId(pl.id);
                                                setView('playlist');
                                                if (setIsMobileOpen)
                                                    setIsMobileOpen(false);
                                            }}
                                            className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-all ${
                                                isActive
                                                    ? 'border border-primary-container/40 bg-chip text-white'
                                                    : 'text-ink-strong hover:bg-chip hover:text-white'
                                            }`}
                                        >
                                            <div className="flex min-w-0 flex-1 items-center gap-2">
                                                {pl.customCover ? (
                                                    <img
                                                        src={pl.customCover}
                                                        alt={pl.name}
                                                        className="h-6 w-6 flex-shrink-0 rounded object-cover"
                                                    />
                                                ) : (
                                                    <span className="flex-shrink-0 text-sm">
                                                        {pl.emoji || '🎧'}
                                                    </span>
                                                )}
                                                <div className="flex min-w-0 flex-col leading-tight">
                                                    <span className="truncate text-xs font-medium">
                                                        {pl.name}
                                                    </span>
                                                    <span className="truncate font-mono text-[9px] text-on-surface-variant/70">
                                                        by{' '}
                                                        {pl.creator_name ||
                                                            'Admin'}
                                                    </span>
                                                </div>
                                                {pl.isPinned && (
                                                    <LuPin className="ml-1 h-2.5 w-2.5 flex-shrink-0 text-primary-container" />
                                                )}
                                                {pl.status !== 'approved' &&
                                                    pl.isLocked !== false && (
                                                        <span
                                                            title="Menunggu Izin Admin (Terkunci)"
                                                            className="ml-1 flex flex-shrink-0 items-center text-amber-400"
                                                        >
                                                            <LuLock className="h-2.5 w-2.5" />
                                                        </span>
                                                    )}
                                            </div>
                                            <span className="rounded border border-line-strong/30 bg-raised px-1.5 py-0.5 font-mono text-[10px] text-on-surface-variant">
                                                {pl.songs.length}
                                            </span>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Rail: Themes & Profile */}
                <div className="flex shrink-0 flex-col gap-4 border-t border-line/60 pt-4">
                    {/* Themes */}
                    <div className="px-2">
                        <p className="mb-2 font-display text-[10px] font-bold tracking-wider text-on-surface-variant uppercase">
                            THEMES
                        </p>
                        <div className="flex items-center gap-2">
                            {THEMES.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setTheme(t.id)}
                                    className={`flex h-5 w-5 items-center justify-center rounded-full transition-transform hover:scale-110 ${
                                        theme === t.id
                                            ? 'ring-2 ring-primary-container ring-offset-2 ring-offset-[#0d0e11]'
                                            : 'opacity-70 hover:opacity-100'
                                    }`}
                                    style={{ backgroundColor: t.color }}
                                    title={t.name}
                                >
                                    {theme === t.id && (
                                        <LuCheck className="h-3 w-3 stroke-[3] text-black" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Profile Card */}
                    <div className="flex items-center justify-between rounded-lg border border-line-strong/20 bg-raised p-2.5">
                        <div
                            onClick={onOpenSettings}
                            className="group flex min-w-0 flex-1 cursor-pointer items-center gap-2.5"
                            title="Buka Pengaturan Player"
                        >
                            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-container font-mono text-xs font-bold text-on-primary-container transition-transform group-hover:scale-105">
                                {profileName
                                    ? profileName.slice(0, 2).toUpperCase()
                                    : 'US'}
                            </div>
                            <div className="flex min-w-0 flex-col">
                                <span className="truncate text-xs leading-tight font-semibold text-white transition-colors group-hover:text-primary-container">
                                    {profileName || 'Music Listener'}
                                </span>
                                <span className="truncate font-mono text-[10px] text-on-surface-variant">
                                    Pengaturan Player
                                </span>
                            </div>
                        </div>
                        <a
                            href={`${getAppBaseUrl()}admin/login`}
                            className="rounded-md p-1.5 text-on-surface-variant transition-colors hover:bg-white/5 hover:text-primary-container"
                            title="Login Administrator"
                        >
                            <LuLock className="h-4 w-4" />
                        </a>
                    </div>
                </div>
            </aside>
        </>
    );
}
