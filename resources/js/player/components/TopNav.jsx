import React from 'react';
import { Menu, ChevronLeft, ChevronRight, Search, Settings, X, Lock } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { getAppBaseUrl } from '../services/api';
const getPortalUrl = (subpath) => {
  const base = getAppBaseUrl();
  const cleanSub = (subpath || '').replace(/^\/+/, '');
  return `${base}${cleanSub}`;
};
export default function TopNav({ searchVal, setSearchVal, onToggleMobileMenu, onOpenSettings }) {
  const { profileName } = useAudio();

  const getInitials = (name) => {
    if (!name || !name.trim()) return 'US';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
   };

  return (
     <header className="sticky top-0 right-0 z-20 h-16 w-full border-b border-[#454934]/20 bg-[#121316]/85 backdrop-blur-md flex items-center justify-between px-3 sm:px-6">
      {/* Left zone: Mobile toggle, History, and Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden h-9 w-9 rounded-lg bg-[#1b1b1f] border border-[#454934]/30 flex items-center justify-center text-on-surface-variant hover:text-white"
          title="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-1">
          <button
            onClick={() => window.history.back()}
            className="h-8 w-8 rounded-full bg-[#1b1b1f] flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-[#292a2d] transition-colors"
            title="Back"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => window.history.forward()}
            className="h-8 w-8 rounded-full bg-[#1b1b1f] flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-[#292a2d] transition-colors"
            title="Forward"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input Pill */}
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary-container transition-colors" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="What do you want to listen to?"
            className="w-full h-10 pl-10 pr-9 bg-[#1b1b1f] border border-[#454934]/30 rounded-full text-sm text-white placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
          />
          {searchVal && (
            <button
              onClick={() => setSearchVal('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Right zone: Settings, Admin, and Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
        <a
          href={getPortalUrl('admin/login')}
          className="h-9 px-3 rounded-full bg-[#1b1b1f] border border-[#454934]/30 hidden sm:flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary-container hover:border-primary-container hover:bg-[#292a2d] transition-all"
          title="Login Khusus Administrator"
        >
          <Lock className="w-3.5 h-3.5 text-primary-container" />
          <span>Admin Portal</span>
        </a>
        <button
          type="button"
          onClick={onOpenSettings}
          className="h-9 px-3 rounded-full bg-[#1b1b1f] border border-[#454934]/30 flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-white hover:bg-[#292a2d] transition-all cursor-pointer"
          title="Pengaturan Player (Tema, Mode, Audio, Profil)"
        >
          <Settings className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Settings</span>
        </button>

        <div className="h-4 w-px bg-[#454934]/40 mx-0.5 hidden sm:block" />

        {/* Listener Chip */}
        <div
          onClick={onOpenSettings}
          className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-[#1b1b1f] border border-[#454934]/30 cursor-pointer hover:border-primary-container transition-colors"
          title="Klik untuk membuka pengaturan profil & tema"
        >
          <div className="h-6 w-6 rounded-full bg-primary-container text-on-primary-container font-mono font-bold text-[10px] flex items-center justify-center">
            {getInitials(profileName)}
          </div>
          <span className="text-xs font-medium text-white hidden sm:inline">{profileName || 'Listener'}</span>
        </div>
      </div>
    </header>
  );
}
