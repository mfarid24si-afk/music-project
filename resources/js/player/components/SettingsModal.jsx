import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { useDialogA11y } from '../hooks/useDialogA11y';
import { THEMES } from '../themes';
import { LuCheck, LuLaptop, LuLock, LuMoon, LuRotateCcw, LuShield, LuSlidersHorizontal, LuSun, LuUser, LuVolume2, LuX } from 'react-icons/lu';

const SECTION_TITLE =
    'flex items-center gap-2 font-mono text-xs font-bold tracking-wider text-primary-container uppercase';

const TOGGLE_TRACK =
    'focus-ring relative flex h-6 w-11 items-center rounded-full px-0.5 transition-colors duration-200 ease-out motion-reduce:transition-none';

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
    const dialogRef = useDialogA11y({ isOpen, onClose });

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

    const colorModes = [
        { id: 'dark', label: 'Dark Mode', Icon: LuMoon },
        { id: 'light', label: 'Light Mode', Icon: LuSun },
        { id: 'system', label: 'Auto Sistem', Icon: LuLaptop },
    ];

    return (
        <>
            {/* Backdrop */}
            <div
                aria-hidden="true"
                className="animate-fadeIn fixed inset-0 z-50 bg-black/75 backdrop-blur-sm transition-opacity motion-reduce:transition-none"
                onClick={onClose}
            />

            {/* Modal Dialog */}
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="settings-modal-title"
                tabIndex={-1}
                className="animate-scaleUp fixed inset-x-4 top-1/2 z-50 mx-auto flex max-h-[90vh] w-full max-w-xl -translate-y-1/2 flex-col gap-6 overflow-y-auto rounded-2xl border border-line-strong/40 bg-raised p-6 shadow-2xl focus:outline-none md:p-8 sm:inset-x-0"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-line/60 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary-container/30 bg-primary-container/15 text-primary-container">
                            <LuSlidersHorizontal className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div>
                            <h2
                                id="settings-modal-title"
                                className="font-display text-lg font-bold text-ink-strong"
                            >
                                Pengaturan Player
                            </h2>
                            <p className="font-mono text-xs text-on-surface-variant">
                                Personalisasi audio, tampilan, & profil
                                pendengar
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="focus-ring flex h-8 w-8 items-center justify-center rounded-full bg-chip text-on-surface-variant transition-colors duration-200 ease-out hover:text-ink-strong motion-reduce:transition-none"
                        title="Tutup Pengaturan"
                        aria-label="Tutup Pengaturan"
                    >
                        <LuX className="h-4 w-4" aria-hidden="true" />
                    </button>
                </div>

                {/* ================= SECTION 1: PROFIL PENGUNJUNG ================= */}
                <div className="flex flex-col gap-3">
                    <div className={SECTION_TITLE}>
                        <LuUser className="h-3.5 w-3.5" aria-hidden="true" />
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
                                <label
                                    htmlFor="settings-profile-name"
                                    className="mb-1 block font-mono text-[11px] text-on-surface-variant"
                                >
                                    Nama Panggilan Kamu
                                </label>
                                <input
                                    id="settings-profile-name"
                                    type="text"
                                    value={tempName}
                                    onChange={(e) =>
                                        setTempName(e.target.value)
                                    }
                                    placeholder="contoh: Farid, Ari, Rian"
                                    maxLength={30}
                                    className="focus-ring w-full rounded-lg border border-line-strong/40 bg-raised px-3 py-1.5 text-xs text-ink-strong transition-colors duration-200 ease-out placeholder:text-on-surface-variant/40 motion-reduce:transition-none"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="focus-ring h-9 flex-shrink-0 rounded-lg bg-primary-container px-4 font-mono text-xs font-bold text-on-primary-container transition-transform duration-200 ease-out hover:scale-105 active:scale-95 motion-reduce:transition-none"
                        >
                            Simpan Nama
                        </button>
                    </form>
                </div>

                {/* ================= SECTION 2: TAMPILAN & MODE ================= */}
                <div className="flex flex-col gap-3">
                    <div className={SECTION_TITLE}>
                        <LuSun className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Mode Tampilan & Warna</span>
                    </div>

                    <div className="flex flex-col gap-4 rounded-xl border border-line-strong/30 bg-canvas p-4">
                        {/* Dark / Light / System Mode */}
                        <div>
                            <span className="mb-2 block text-xs font-semibold text-ink-strong">
                                Tema Mode
                            </span>
                            <div className="grid grid-cols-3 gap-2">
                                {colorModes.map(({ id, label, Icon }) => {
                                    const isActive = colorMode === id;
                                    return (
                                        <button
                                            key={id}
                                            type="button"
                                            onClick={() => setColorMode(id)}
                                            aria-pressed={isActive}
                                            className={`focus-ring flex h-10 items-center justify-center gap-2 rounded-xl border text-xs font-semibold transition-colors duration-200 ease-out motion-reduce:transition-none ${
                                                isActive
                                                    ? 'border-primary-container bg-primary-container/20 text-primary-container'
                                                    : 'border-line/40 bg-raised text-on-surface-variant hover:text-ink-strong'
                                            }`}
                                        >
                                            <Icon
                                                className="h-3.5 w-3.5"
                                                aria-hidden="true"
                                            />
                                            <span>{label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Accent Color Palette */}
                        <div>
                            <span className="mb-2 block text-xs font-semibold text-ink-strong">
                                Aksen Warna Musik
                            </span>
                            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                                {THEMES.map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setTheme(t.id)}
                                        aria-label={`Gunakan tema ${t.name}`}
                                        aria-pressed={theme === t.id}
                                        className={`focus-ring flex h-9 items-center justify-center gap-1.5 rounded-lg border font-mono text-xs font-medium transition-colors duration-200 ease-out motion-reduce:transition-none ${
                                            theme === t.id
                                                ? 'border-line-strong text-ink-strong shadow-xs'
                                                : 'border-line/40 text-on-surface-variant hover:text-ink-strong'
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
                                            aria-hidden="true"
                                        />
                                        <span className="truncate text-[11px]">
                                            {t.name}
                                        </span>
                                        {theme === t.id && (
                                            <LuCheck
                                                className="ml-0.5 h-3 w-3"
                                                aria-hidden="true"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ================= SECTION 3: AUDIO & PEMUTARAN ================= */}
                <div className="flex flex-col gap-3">
                    <div className={SECTION_TITLE}>
                        <LuVolume2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Preferensi Audio & Layar</span>
                    </div>

                    <div className="flex flex-col gap-4 rounded-xl border border-line-strong/30 bg-canvas p-4">
                        {/* Volume slider */}
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <span className="block text-xs font-semibold text-ink-strong">
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
                                    aria-label="Volume bawaan"
                                    className="focus-ring w-full cursor-pointer accent-primary-container"
                                />
                                <span className="w-9 text-right font-mono text-xs font-bold text-ink-strong">
                                    {Math.round(volume * 100)}%
                                </span>
                            </div>
                        </div>

                        <div className="h-px bg-chip/50" />

                        {/* Autoplay Next */}
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <span className="block text-xs font-semibold text-ink-strong">
                                    Autoplay Lagu Berikutnya
                                </span>
                                <span className="text-[11px] text-on-surface-variant">
                                    Lanjut memutar antrean otomatis saat lagu
                                    berakhir
                                </span>
                            </div>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={autoplay}
                                aria-label="Autoplay lagu berikutnya"
                                onClick={() => setAutoplay((prev) => !prev)}
                                className={`${TOGGLE_TRACK} ${
                                    autoplay
                                        ? 'bg-primary-container'
                                        : 'bg-chip'
                                }`}
                            >
                                <span
                                    className={`h-5 w-5 rounded-full bg-black transition-transform duration-200 ease-out motion-reduce:transition-none ${
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
                                <span className="block text-xs font-semibold text-ink-strong">
                                    Layar Tetap Menyala (Ambient Player)
                                </span>
                                <span className="text-[11px] text-on-surface-variant">
                                    Mencegah layar HP/laptop mati otomatis saat
                                    musik sedang aktif
                                </span>
                            </div>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={keepAwake}
                                aria-label="Layar tetap menyala"
                                onClick={() => setKeepAwake((prev) => !prev)}
                                className={`${TOGGLE_TRACK} ${
                                    keepAwake
                                        ? 'bg-primary-container'
                                        : 'bg-chip'
                                }`}
                            >
                                <span
                                    className={`h-5 w-5 rounded-full bg-black transition-transform duration-200 ease-out motion-reduce:transition-none ${
                                        keepAwake
                                            ? 'translate-x-5'
                                            : 'translate-x-0'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ================= SECTION 4: SISTEM ================= */}
                <div className="flex flex-col gap-3">
                    <div className={SECTION_TITLE}>
                        <LuShield className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Preferensi Sistem</span>
                    </div>

                    <div className="flex flex-col gap-3 rounded-xl border border-line-strong/30 bg-canvas p-4">
                        {/* Local data reset */}
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                            <div>
                                <span className="block text-xs font-semibold text-ink-strong">
                                    Data Tersimpan
                                </span>
                                <span className="text-[11px] text-on-surface-variant">
                                    {favorites.length} favorit &bull;{' '}
                                    {playlists.length} playlist &bull;{' '}
                                    {queue.length} antrean
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleResetStorage}
                                className="focus-ring flex h-9 flex-shrink-0 items-center gap-1.5 rounded-lg border border-danger/40 bg-danger/10 px-3.5 font-mono text-xs font-bold text-danger transition-colors duration-200 ease-out hover:bg-danger/20 motion-reduce:transition-none"
                            >
                                <LuRotateCcw
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                />
                                <span>Reset Data Lokal</span>
                            </button>
                        </div>

                        <div className="h-px bg-chip/50" />

                        {/* Admin portal */}
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <span className="block text-xs font-semibold text-ink-strong">
                                    Portal Administrator
                                </span>
                                <span className="text-[11px] text-on-surface-variant">
                                    Kelola lagu, playlist, dan pengguna
                                </span>
                            </div>
                            <a
                                href="/admin"
                                className="focus-ring flex h-9 flex-shrink-0 items-center gap-1.5 rounded-lg border border-line-strong/30 bg-raised px-3.5 text-xs font-semibold text-ink-strong transition-colors duration-200 ease-out hover:bg-chip hover:text-primary-container motion-reduce:transition-none"
                            >
                                <LuLock
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                />
                                <span>Buka Portal</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 border-t border-line/60 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="focus-ring rounded-full border border-line-strong/30 bg-raised px-5 py-2.5 font-mono text-xs font-bold text-on-surface-variant transition-colors duration-200 ease-out hover:text-ink-strong motion-reduce:transition-none"
                    >
                        Tutup
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="focus-ring rounded-full bg-primary-container px-5 py-2.5 font-mono text-xs font-bold text-on-primary-container shadow-[0_0_12px_var(--accent-glow)] transition-transform duration-200 ease-out hover:scale-105 active:scale-95 motion-reduce:transition-none"
                    >
                        Selesai
                    </button>
                </div>
            </div>
        </>
    );
}
