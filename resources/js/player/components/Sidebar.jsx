import React from 'react';
import { useAudio } from '../context/AudioContext';
import { Disc3, Home, Search, Library, Plus, ListMusic, Check, BadgeCheck, X, Pin, Lock } from 'lucide-react';
import { getAppBaseUrl } from '../services/api';

const THEMES = [
  { id: 'default', color: '#ccf228', name: 'Acid Lime' },
  { id: 'purple', color: '#a855f7', name: 'Electric Violet' },
  { id: 'blue', color: '#3b82f6', name: 'Deep Cobalt' },
  { id: 'cyberpunk', color: '#ec4899', name: 'Hot Pink' },
  { id: 'sunset', color: '#f97316', name: 'Safety Amber' },
  { id: 'ocean', color: '#06b6d4', name: 'Cyan Laser' },
];

export default function Sidebar({ currentView, setView, activePlaylistId, setActivePlaylistId, isMobileOpen, setIsMobileOpen, onOpenSettings }) {
  const { theme, setTheme, playlists, createPlaylist, profileName } = useAudio();

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
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Your Library', icon: Library },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`fixed top-0 left-0 h-screen w-64 border-r border-[#454934]/30 bg-[#0d0e11] flex flex-col justify-between p-4 z-40 transition-transform duration-300 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Top Rail: Brand & Nav */}
        <div className="flex flex-col gap-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2 pt-2">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setView('home'); setActivePlaylistId(null); if (setIsMobileOpen) setIsMobileOpen(false); }}>
              <div className="h-9 w-9 rounded-lg bg-[#292a2d] border border-[#454934]/40 flex items-center justify-center text-primary-container shadow-inner">
                <Disc3 className="w-5 h-5 text-primary-container animate-spin-slow" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-white leading-none font-display">Spotirid</h1>
                <p className="text-[10px] tracking-wider uppercase text-on-surface-variant font-mono mt-1">High-Fidelity Player</p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-on-surface-variant hover:text-white hover:bg-[#1f1f23]"
              title="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Primary Nav */}
          <nav className="flex flex-col gap-1.5" aria-label="Primary Navigation">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id && !activePlaylistId;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setView(item.id);
                    setActivePlaylistId(null);
                    if (setIsMobileOpen) setIsMobileOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 text-left ${
                    isActive
                      ? 'bg-[#292a2d] text-white border-l-2 border-primary-container shadow-sm font-semibold'
                      : 'text-on-surface-variant hover:text-white hover:bg-[#1f1f23]'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary-container' : 'text-on-surface-variant'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="h-px w-full bg-[#343538]/60" />

          {/* Playlists Section */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-3 text-[11px] font-bold tracking-wider uppercase text-on-surface-variant font-display">
              <span>SHARED PLAYLISTS</span>
              <button
                onClick={handleCreatePlaylist}
                className="text-on-surface-variant hover:text-primary-container transition-colors p-1 rounded hover:bg-[#292a2d] flex items-center justify-center"
                title="Create Playlist"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Playlist list */}
            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
              {sortedPlaylists.length === 0 ? (
                <p className="text-xs text-text-muted px-3 py-2 text-center">No playlists yet.<br />Click + to add</p>
              ) : (
                sortedPlaylists.map(pl => {
                  const isActive = activePlaylistId === pl.id;
                  return (
                    <button
                      key={pl.id}
                      onClick={() => {
                        setActivePlaylistId(pl.id);
                        setView('playlist');
                        if (setIsMobileOpen) setIsMobileOpen(false);
                      }}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-left transition-all group ${
                        isActive
                          ? 'bg-[#292a2d] text-white border border-primary-container/40'
                          : 'text-[#e3e2e6] hover:bg-[#292a2d] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {pl.customCover ? (
                          <img src={pl.customCover} alt={pl.name} className="w-6 h-6 rounded object-cover flex-shrink-0" />
                        ) : (
                          <span className="text-sm flex-shrink-0">{pl.emoji || '🎧'}</span>
                        )}
                        <div className="flex flex-col min-w-0 leading-tight">
                          <span className="text-xs truncate font-medium">{pl.name}</span>
                          <span className="text-[9px] font-mono text-on-surface-variant/70 truncate">by {pl.creator_name || 'Admin'}</span>
                        </div>
                        {pl.isPinned && <Pin className="w-2.5 h-2.5 text-primary-container flex-shrink-0 ml-1" />}
                        {pl.status !== 'approved' && pl.isLocked !== false && (
                          <span title="Menunggu Izin Admin (Terkunci)" className="flex items-center text-amber-400 ml-1 flex-shrink-0">
                            <Lock className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-on-surface-variant px-1.5 py-0.5 rounded bg-[#1b1b1f] border border-[#454934]/30">
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
        <div className="flex flex-col gap-4 pt-4 border-t border-[#343538]/60">
          {/* Themes */}
          <div className="px-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2 font-display">THEMES</p>
            <div className="flex items-center gap-2">
              {THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`w-5 h-5 rounded-full transition-transform hover:scale-110 flex items-center justify-center ${
                    theme === t.id ? 'ring-2 ring-primary-container ring-offset-2 ring-offset-[#0d0e11]' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: t.color }}
                  title={t.name}
                >
                  {theme === t.id && <Check className="w-3 h-3 text-black stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Profile Card */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#1b1b1f] border border-[#454934]/20">
            <div
              onClick={onOpenSettings}
              className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer group"
              title="Buka Pengaturan Player"
            >
              <div className="h-7 w-7 rounded-full bg-primary-container text-on-primary-container font-mono text-xs font-bold flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                {profileName ? profileName.slice(0, 2).toUpperCase() : 'US'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white leading-tight truncate group-hover:text-primary-container transition-colors">
                  {profileName || 'Music Listener'}
                </span>
                <span className="text-[10px] font-mono text-on-surface-variant truncate">Pengaturan Player</span>
              </div>
            </div>
            <a
              href={`${getAppBaseUrl()}admin/login`}
              className="p-1.5 rounded-md text-on-surface-variant hover:text-primary-container hover:bg-white/5 transition-colors"
              title="Login Administrator"
            >
              <Lock className="w-4 h-4" />
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
