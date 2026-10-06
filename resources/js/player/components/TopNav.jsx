import React from 'react';
import { usePage, router } from '@inertiajs/react';
import { LuChevronLeft, LuChevronRight, LuLock, LuLogIn, LuLogOut, LuMenu, LuPlus, LuSearch, LuSettings, LuX } from 'react-icons/lu';
import { useAudio } from '../context/AudioContext';
import { getAppBaseUrl } from '../services/api';

const getPortalUrl = (subpath) => {
    const base = getAppBaseUrl();
    const cleanSub = (subpath || '').replace(/^\/+/, '');
    return `${base}${cleanSub}`;
};

export default function TopNav({
    searchVal,
    setSearchVal,
    onToggleMobileMenu,
    onOpenSettings,
    onOpenSuggestSong,
}) {
    const { profileName } = useAudio();
    const { auth } = usePage().props;
    const user = auth?.user;

    const getInitials = (name) => {
        if (!name || !name.trim()) return 'US';
        const parts = name.trim().split(/\s+/).filter(Boolean);
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[1][0]).toUpperCase();
    };

    return (
        <header className="sticky top-0 right-0 z-20 flex h-16 w-full items-center justify-between border-b border-line-strong/20 bg-canvas/85 px-3 backdrop-blur-md sm:px-6">
            {/* Left zone: Mobile toggle, History, and Search */}
            <div className="flex max-w-xl flex-1 items-center gap-3">
                <button
                    onClick={onToggleMobileMenu}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-line-strong/30 bg-raised text-on-surface-variant hover:text-white lg:hidden"
                    title="Toggle Menu"
                >
                    <LuMenu className="h-5 w-5" />
                </button>

                <div className="hidden items-center gap-1 sm:flex">
                    <button
                        onClick={() => window.history.back()}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-raised text-on-surface-variant transition-colors hover:bg-chip hover:text-white"
                        title="Back"
                    >
                        <LuChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => window.history.forward()}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-raised text-on-surface-variant transition-colors hover:bg-chip hover:text-white"
                        title="Forward"
                    >
                        <LuChevronRight className="h-4 w-4" />
                    </button>
                </div>

                {/* Search Input Pill */}
                <div className="group relative flex-1">
                    <LuSearch className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within:text-primary-container" />
                    <input
                        type="text"
                        value={searchVal}
                        onChange={(e) => setSearchVal(e.target.value)}
                        placeholder="What do you want to listen to?"
                        className="h-10 w-full rounded-full border border-line-strong/30 bg-raised pr-9 pl-10 text-sm text-white transition-all placeholder:text-on-surface-variant/70 focus:border-primary-container focus:ring-1 focus:ring-primary-container focus:outline-none"
                    />
                    {searchVal && (
                        <button
                            onClick={() => setSearchVal('')}
                            className="absolute top-1/2 right-3 -translate-y-1/2 text-on-surface-variant hover:text-white"
                        >
                            <LuX className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Right zone: Suggest Song (if auth), Settings, Admin, and Profile */}
            <div className="flex flex-shrink-0 items-center gap-2 sm:gap-2.5">
                {user ? (
                    <>
                        {/* Admin Shortcut if Admin is logged in */}
                        {(user.role === 'admin' || user.email === 'admin@spotirid.com' || user.email?.startsWith('admin@')) ? (
                            <a
                                href={getPortalUrl('admin')}
                                className="flex h-9 items-center gap-1.5 rounded-full border border-primary-container/40 bg-raised px-3 text-xs font-bold text-primary-container transition-all hover:bg-primary-container hover:text-on-primary-container"
                                title="Buka Admin Control Center"
                            >
                                <LuLock className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Admin Panel</span>
                            </a>
                        ) : (
                            /* Member Special Action: Suggest Song */
                            <button
                                type="button"
                                onClick={onOpenSuggestSong}
                                className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-primary-container/50 bg-primary-container/15 px-3.5 text-xs font-bold text-primary-container shadow-sm transition-all hover:bg-primary-container hover:text-on-primary-container"
                                title="Ajukan Lagu Baru (Khusus Member)"
                            >
                                <LuPlus className="h-4 w-4" />
                                <span className="hidden sm:inline">Ajukan Lagu</span>
                            </button>
                        )}

                        {/* User Profile Chip */}
                        <div
                            className="flex items-center gap-2 rounded-full border border-line-strong/30 bg-raised py-1 pr-3 pl-2"
                            title={`Login sebagai ${user.name}`}
                        >
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-container font-mono text-[10px] font-bold text-on-primary-container">
                                {getInitials(user.name)}
                            </div>
                            <span className="hidden max-w-[120px] truncate text-xs font-medium text-white sm:inline">
                                {user.name}
                            </span>
                        </div>

                        {/* Logout button */}
                        <button
                            type="button"
                            onClick={() => router.post('/logout')}
                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-line-strong/30 bg-raised text-on-surface-variant transition-all hover:border-danger/40 hover:bg-danger/10 hover:text-danger"
                            title="Keluar dari akun"
                        >
                            <LuLogOut className="h-3.5 w-3.5" />
                        </button>
                    </>
                ) : (
                    <>
                        {/* Single Unified Login Button for Guests */}
                        <a
                            href={getPortalUrl('login')}
                            className="flex h-9 items-center gap-1.5 rounded-full border border-line-strong/30 bg-raised px-4 text-xs font-bold text-white transition-all hover:border-primary-container hover:bg-chip hover:text-primary-container shadow-sm"
                            title="Masuk ke Akun"
                        >
                            <LuLogIn className="h-3.5 w-3.5 text-primary-container" />
                            <span>Masuk</span>
                        </a>

                        {/* Guest: Listener Profile Chip */}
                        <div
                            onClick={onOpenSettings}
                            className="flex cursor-pointer items-center gap-2 rounded-full border border-line-strong/30 bg-raised py-1 pr-3 pl-2 transition-colors hover:border-primary-container"
                            title="Klik untuk membuka pengaturan profil & tema"
                        >
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-container font-mono text-[10px] font-bold text-on-primary-container">
                                {getInitials(profileName)}
                            </div>
                            <span className="hidden text-xs font-medium text-white sm:inline">
                                {profileName || 'Listener'}
                            </span>
                        </div>
                    </>
                )}

                <button
                    type="button"
                    onClick={onOpenSettings}
                    className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-line-strong/30 bg-raised px-3 text-xs font-semibold text-on-surface-variant transition-all hover:bg-chip hover:text-white"
                    title="Pengaturan Player"
                >
                    <LuSettings className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">Settings</span>
                </button>

            </div>
        </header>
    );
}
