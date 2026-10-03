import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { LuCheck, LuLaptop, LuLock, LuMoon, LuRotateCcw, LuShield, LuSlidersHorizontal, LuSmartphone, LuSparkles, LuSun, LuUser, LuVolume2, LuX, LuZap } from 'react-icons/lu';
const THEMES = [
    { id: 'default', color: '#ccf228', name: 'Acid Lime' },
    { id: 'purple', color: '#a855f7', name: 'Electric Violet' },
    { id: 'blue', color: '#3b82f6', name: 'Deep Cobalt' },
    { id: 'cyberpunk', color: '#ec4899', name: 'Hot Pink' },
    { id: 'sunset', color: '#f97316', name: 'Safety Amber' },
    { id: 'ocean', color: '#06b6d4', name: 'Cyan Laser' },
];

export default function SettingsModal({ isOpen, onClose }) {
    const {
        theme,
        setTheme,
        volume,
        setVolume,
        colorMode,
        setColorMode,
        profileName,
        setProfileName,
        autoplay,
        setAutoplay,
        keepAwake,
        setKeepAwake,
        favorites,
        playlists,
        queue,
        showToast,
    } = useAudio();

    const [tempName, setTempName] = useState(profileName || 'Listener');

    if (!isOpen) return null;

    const getInitials = (name) => {
        if (!name || !name.trim()) return 'US';
        const parts = name.trim().split(/\s+/).filter(Boolean);
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[1][0]).toUpperCase();
    };

    const handleSaveProfile = (e) => {
        e.preventDefault();
        const clean = tempName.trim() || 'Listener';
        setProfileName(clean);
        showToast(`Profil diperbarui: "${clean}"`, 'success');
    };

    const handleResetStorage = () => {
        if (
            window.confirm(
                'Reset semua data lokal (lagu favorit, antrean, dan preferensi)? Playlist di database pusat tidak akan terhapus.',
            )
        ) {
            try {
                localStorage.clear();
                showToast(
                    'Pengaturan lokal berhasil dibersihkan. Memuat ulang...',
                    'info',
                );
                setTimeout(() => {
                    window.location.reload();
                }, 800);
            } catch (err) {
                showToast('Gagal mereset cache: ' + err.message, 'error');
            }
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="animate-fadeIn fixed inset-0 z-50 bg-black/75 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Dialog */}
            <div className="animate-scaleUp fixed top-1/2 left-1/2 z-50 flex max-h-[90vh] w-full max-w-xl -translate-x-1/2 -translate-y-1/2 flex-col gap-6 overflow-y-auto rounded-2xl border border-line-strong/40 bg-raised p-6 shadow-2xl md:p-8">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-line/60 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary-container/30 bg-primary-container/15 text-primary-container">
                            <LuSlidersHorizontal className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="font-display text-lg font-bold text-white">
                                Pengaturan Player
                            </h2>
                            <p className="font-mono text-xs text-on-surface-variant">
                                Personalisasi audio, tampilan, & profil
                                pendengar
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-chip text-on-surface-variant transition-colors hover:text-white"
                        title="Tutup Pengaturan"
                    >
                        <LuX className="h-4 w-4" />
                    </button>
                </div>

                {/* ================= SECTION 1: PROFIL PENGUNJUNG ================= */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold tracking-wider text-primary-container uppercase">
                        <LuUser className="h-3.5 w-3.5" />
                        <span>Identitas Pendengar</span>
                    </div>

                    <form
                        onSubmit={handleSaveProfile}
                        className="flex flex-col justify-between gap-4 rounded-xl border border-line-strong/30 bg-canvas p-4 sm:flex-row sm:items-center"
                    >
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-container font-mono text-sm font-bold text-on-primary-container shadow-md">
                                {getInitials(tempName)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <label className="mb-1 block font-mono text-[11px] text-on-surface-variant">
                                    Nama Panggilan Kamu
                                </label>
                                <input
                                    type="text"
                                    value={tempName}
                                    onChange={(e) =>
                                        setTempName(e.target.value)
                                    }
                                    placeholder="contoh: Farid, Ari, Rian"
                                    maxLength={30}
                                    className="w-full rounded-lg border border-line-strong/40 bg-raised px-3 py-1.5 text-xs text-white placeholder:text-on-surface-variant/40 focus:border-primary-container focus:outline-none"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="h-9 flex-shrink-0 rounded-lg bg-primary-container px-4 font-mono text-xs font-bold text-on-primary-container transition-all hover:scale-105 active:scale-95"
                        >
                            Simpan Nama
                        </button>
                    </form>
                </div>

                {/* ================= SECTION 2: TAMPILAN & MODE ================= */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold tracking-wider text-primary-container uppercase">
                        <LuSun className="h-3.5 w-3.5" />
                        <span>Mode Tampilan & Warna</span>
                    </div>

                    <div className="flex flex-col gap-4 rounded-xl border border-line-strong/30 bg-canvas p-4">
                        {/* Dark / Light / System Mode */}
                        <div>
                            <span className="mb-2 block text-xs font-semibold text-white">
                                Tema Mode
                            </span>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setColorMode('dark')}
                                    className={`flex h-10 items-center justify-center gap-2 rounded-xl border text-xs font-semibold transition-all ${
                                        colorMode === 'dark'
                                            ? 'border-primary-container bg-primary-container/20 text-primary-container'
                                            : 'border-white/10 bg-raised text-on-surface-variant hover:text-white'
                                    }`}
                                >
                                    <LuMoon className="h-3.5 w-3.5" />
                                    <span>Dark Mode</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setColorMode('light')}
                                    className={`flex h-10 items-center justify-center gap-2 rounded-xl border text-xs font-semibold transition-all ${
                                        colorMode === 'light'
                                            ? 'border-primary-container bg-primary-container/20 text-primary-container'
                                            : 'border-white/10 bg-raised text-on-surface-variant hover:text-white'
                                    }`}
                                >
                                    <LuSun className="h-3.5 w-3.5" />
                                    <span>Light Mode</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setColorMode('system')}
                                    className={`flex h-10 items-center justify-center gap-2 rounded-xl border text-xs font-semibold transition-all ${
                                        colorMode === 'system'
                                            ? 'border-primary-container bg-primary-container/20 text-primary-container'
                                            : 'border-white/10 bg-raised text-on-surface-variant hover:text-white'
                                    }`}
                                >
                                    <LuLaptop className="h-3.5 w-3.5" />
                                    <span>Auto Sistem</span>
                                </button>
                            </div>
                        </div>

                        {/* Accent Color Palette */}
                        <div>
                            <span className="mb-2 block text-xs font-semibold text-white">
                                Aksen Warna Musik
                            </span>
                            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                                {THEMES.map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setTheme(t.id)}
                                        className={`flex h-9 items-center justify-center gap-1.5 rounded-lg border font-mono text-xs font-medium transition-all ${
                                            theme === t.id
                                                ? 'border-white text-white shadow-xs'
                                                : 'border-white/10 text-on-surface-variant hover:text-white'
                                        }`}
                                        style={{
                                            backgroundColor: `${t.color}22`,
                                            borderColor:
                                                theme === t.id
                                                    ? t.color
                                                    : undefined,
                                        }}
                                    >
                                        <span
                                            className="h-2.5 w-2.5 rounded-full"
                                            style={{ backgroundColor: t.color }}
                                        />
                                        <span className="truncate text-[11px]">
                                            {t.name}
                                        </span>
                                        {theme === t.id && (
                                            <LuCheck className="ml-0.5 h-3 w-3 text-white" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ================= SECTION 3: AUDIO & PEMUTARAN ================= */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold tracking-wider text-primary-container uppercase">
                        <LuVolume2 className="h-3.5 w-3.5" />
                        <span>Preferensi Audio & Layar</span>
                    </div>

                    <div className="flex flex-col gap-4 rounded-xl border border-line-strong/30 bg-canvas p-4">
                        {/* Volume slider */}
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <span className="block text-xs font-semibold text-white">
                                    Volume Bawaan
                                </span>
                                <span className="font-mono text-[11px] text-on-surface-variant">
                                    Tingkat volume awal saat membuka player
                                </span>
                            </div>
                            <div className="flex w-36 items-center gap-2.5">
                                <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    value={volume}
                                    onChange={(e) =>
                                        setVolume(parseFloat(e.target.value))
                                    }
                                    className="w-full cursor-pointer accent-primary-container"
                                />
                                <span className="w-9 text-right font-mono text-xs font-bold text-white">
                                    {Math.round(volume * 100)}%
                                </span>
                            </div>
                        </div>

                        <div className="h-px bg-chip/50" />

                        {/* Autoplay Next */}
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <span className="block text-xs font-semibold text-white">
                                    Autoplay Lagu Berikutnya
                                </span>
                                <span className="text-[11px] text-on-surface-variant">
                                    Lanjut memutar antrean otomatis saat lagu
                                    berakhir
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setAutoplay((prev) => !prev)}
                                className={`relative flex h-6 w-11 items-center rounded-full px-0.5 transition-colors ${
                                    autoplay
                                        ? 'bg-primary-container'
                                        : 'bg-chip'
                                }`}
                            >
                                <div
                                    className={`h-5 w-5 rounded-full bg-black transition-transform ${
                                        autoplay
                                            ? 'translate-x-5'
                                            : 'translate-x-0'
                                    }`}
                                />
                            </button>
                        </div>

                        <div className="h-px bg-chip/50" />

                        {/* Keep Awake Toggle */}
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <span className="block text-xs font-semibold text-white">
                                    Layar Tetap Menyala (Ambient Player)
                                </span>
                                <span className="text-[11px] text-on-surface-variant">
                                    Mencegah layar HP/laptop mati otomatis saat
                                    musik sedang aktif
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setKeepAwake((prev) => !prev)}
                                className={`relative flex h-6 w-11 items-center rounded-full px-0.5 transition-colors ${
                                    keepAwake
                                        ? 'bg-primary-container'
                                        : 'bg-chip'
                                }`}
                            >
                                <div
                                    className={`h-5 w-5 rounded-full bg-black transition-transform ${
                                        keepAwake
                                            ? 'translate-x-5'
                                            : 'translate-x-0'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ================= SECTION 4: PRIVASI & ADMIN ================= */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold tracking-wider text-primary-container uppercase">
                        <LuShield className="h-3.5 w-3.5" />
                        <span>Penyimpanan & Akses</span>
                    </div>

                    <div className="flex flex-col gap-3 rounded-xl border border-line-strong/30 bg-canvas p-4">
                        <div className="flex flex-col justify-between gap-2 text-xs sm:flex-row sm:items-center">
                            <span className="font-mono text-on-surface-variant">
                                Data Tersimpan: {favorites.length} favorit
                                &bull; {playlists.length} playlist
                            </span>
                            <button
                                type="button"
                                onClick={handleResetStorage}
                                className="inline-flex items-center gap-1.5 self-start font-mono text-xs text-red-400 hover:text-red-300 sm:self-auto"
                            >
                                <LuRotateCcw className="h-3.5 w-3.5" />
                                <span>Reset Cache Lokal</span>
                            </button>
                        </div>

                        <div className="h-px bg-chip/50" />

                        <div className="flex items-center justify-between gap-3 pt-1">
                            <div>
                                <span className="block text-xs font-semibold text-white">
                                    Portal Administrator
                                </span>
                                <span className="text-[11px] text-on-surface-variant">
                                    Login khusus admin untuk moderasi & upload
                                    lagu
                                </span>
                            </div>
                            <a
                                href="/admin/login"
                                className="flex h-8 flex-shrink-0 items-center gap-1.5 rounded-lg border border-line-strong/30 bg-raised px-3.5 text-xs font-semibold text-white transition-colors hover:border-primary-container hover:text-primary-container"
                            >
                                <LuLock className="h-3 w-3 text-primary-container" />
                                <span>Buka Portal</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Footer actions */}
                <div className="flex items-center justify-end border-t border-line/60 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full bg-primary-container px-6 py-2.5 font-mono text-xs font-bold text-on-primary-container shadow-[0_0_12px_var(--accent-glow)] transition-all hover:scale-105 active:scale-95"
                    >
                        Selesai
                    </button>
                </div>
            </div>
        </>
    );
}
