import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import {
  X, Check, User, Moon, Sun, Laptop, Volume2, Zap,
  Sparkles, Shield, Lock, RotateCcw, Sliders, Smartphone
} from 'lucide-react';

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
    theme, setTheme,
    volume, setVolume,
    colorMode, setColorMode,
    profileName, setProfileName,
    autoplay, setAutoplay,
    keepAwake, setKeepAwake,
    favorites, playlists, queue,
    showToast
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
    if (window.confirm('Reset semua data lokal (lagu favorit, antrean, dan preferensi)? Playlist di database pusat tidak akan terhapus.')) {
      try {
        localStorage.clear();
        showToast('Pengaturan lokal berhasil dibersihkan. Memuat ulang...', 'info');
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
        className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#1b1b1f] border border-[#454934]/40 rounded-2xl z-50 p-6 md:p-8 shadow-2xl flex flex-col gap-6 animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#343538]/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-container/15 border border-primary-container/30 flex items-center justify-center text-primary-container">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">Pengaturan Player</h2>
              <p className="text-xs text-on-surface-variant font-mono">Personalisasi audio, tampilan, & profil pendengar</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#292a2d] text-on-surface-variant hover:text-white flex items-center justify-center transition-colors"
            title="Tutup Pengaturan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ================= SECTION 1: PROFIL PENGUNJUNG ================= */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-primary-container tracking-wider">
            <User className="w-3.5 h-3.5" />
            <span>Identitas Pendengar</span>
          </div>

          <form onSubmit={handleSaveProfile} className="p-4 rounded-xl bg-[#121316] border border-[#454934]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container font-mono font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-md">
                {getInitials(tempName)}
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-[11px] text-on-surface-variant font-mono mb-1">Nama Panggilan Kamu</label>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="contoh: Farid, Ari, Rian"
                  maxLength={30}
                  className="w-full bg-[#1b1b1f] border border-[#454934]/40 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary-container"
                />
              </div>
            </div>

            <button
              type="submit"
              className="h-9 px-4 rounded-lg bg-primary-container text-on-primary-container text-xs font-bold font-mono hover:scale-105 active:scale-95 transition-all flex-shrink-0"
            >
              Simpan Nama
            </button>
          </form>
        </div>

        {/* ================= SECTION 2: TAMPILAN & MODE ================= */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-primary-container tracking-wider">
            <Sun className="w-3.5 h-3.5" />
            <span>Mode Tampilan & Warna</span>
          </div>

          <div className="p-4 rounded-xl bg-[#121316] border border-[#454934]/30 flex flex-col gap-4">
            {/* Dark / Light / System Mode */}
            <div>
              <span className="block text-xs font-semibold text-white mb-2">Tema Mode</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setColorMode('dark')}
                  className={`h-10 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                    colorMode === 'dark'
                      ? 'bg-primary-container/20 border-primary-container text-primary-container'
                      : 'bg-[#1b1b1f] border-white/10 text-on-surface-variant hover:text-white'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark Mode</span>
                </button>

                <button
                  type="button"
                  onClick={() => setColorMode('light')}
                  className={`h-10 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                    colorMode === 'light'
                      ? 'bg-primary-container/20 border-primary-container text-primary-container'
                      : 'bg-[#1b1b1f] border-white/10 text-on-surface-variant hover:text-white'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Light Mode</span>
                </button>

                <button
                  type="button"
                  onClick={() => setColorMode('system')}
                  className={`h-10 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                    colorMode === 'system'
                      ? 'bg-primary-container/20 border-primary-container text-primary-container'
                      : 'bg-[#1b1b1f] border-white/10 text-on-surface-variant hover:text-white'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span>Auto Sistem</span>
                </button>
              </div>
            </div>

            {/* Accent Color Palette */}
            <div>
              <span className="block text-xs font-semibold text-white mb-2">Aksen Warna Musik</span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {THEMES.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className={`h-9 rounded-lg border text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all ${
                      theme === t.id
                        ? 'border-white text-white shadow-xs'
                        : 'border-white/10 text-on-surface-variant hover:text-white'
                    }`}
                    style={{
                      backgroundColor: `${t.color}22`,
                      borderColor: theme === t.id ? t.color : undefined
                    }}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                    <span className="text-[11px] truncate">{t.name}</span>
                    {theme === t.id && <Check className="w-3 h-3 text-white ml-0.5" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ================= SECTION 3: AUDIO & PEMUTARAN ================= */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-primary-container tracking-wider">
            <Volume2 className="w-3.5 h-3.5" />
            <span>Preferensi Audio & Layar</span>
          </div>

          <div className="p-4 rounded-xl bg-[#121316] border border-[#454934]/30 flex flex-col gap-4">
            {/* Volume slider */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="block text-xs font-semibold text-white">Volume Bawaan</span>
                <span className="text-[11px] text-on-surface-variant font-mono">Tingkat volume awal saat membuka player</span>
              </div>
              <div className="flex items-center gap-2.5 w-36">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full accent-primary-container cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-white w-9 text-right">
                  {Math.round(volume * 100)}%
                </span>
              </div>
            </div>

            <div className="h-px bg-[#343538]/50" />

            {/* Autoplay Next */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="block text-xs font-semibold text-white">Autoplay Lagu Berikutnya</span>
                <span className="text-[11px] text-on-surface-variant">Lanjut memutar antrean otomatis saat lagu berakhir</span>
              </div>
              <button
                type="button"
                onClick={() => setAutoplay(prev => !prev)}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                  autoplay ? 'bg-primary-container' : 'bg-[#292a2d]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-black transition-transform ${
                    autoplay ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="h-px bg-[#343538]/50" />

            {/* Keep Awake Toggle */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="block text-xs font-semibold text-white">Layar Tetap Menyala (Ambient Player)</span>
                <span className="text-[11px] text-on-surface-variant">Mencegah layar HP/laptop mati otomatis saat musik sedang aktif</span>
              </div>
              <button
                type="button"
                onClick={() => setKeepAwake(prev => !prev)}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                  keepAwake ? 'bg-primary-container' : 'bg-[#292a2d]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-black transition-transform ${
                    keepAwake ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* ================= SECTION 4: PRIVASI & ADMIN ================= */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-primary-container tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>Penyimpanan & Akses</span>
          </div>

          <div className="p-4 rounded-xl bg-[#121316] border border-[#454934]/30 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="text-on-surface-variant font-mono">
                Data Tersimpan: {favorites.length} favorit &bull; {playlists.length} playlist
              </span>
              <button
                type="button"
                onClick={handleResetStorage}
                className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-mono self-start sm:self-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Cache Lokal</span>
              </button>
            </div>

            <div className="h-px bg-[#343538]/50" />

            <div className="flex items-center justify-between gap-3 pt-1">
              <div>
                <span className="block text-xs font-semibold text-white">Portal Administrator</span>
                <span className="text-[11px] text-on-surface-variant">Login khusus admin untuk moderasi & upload lagu</span>
              </div>
              <a
                href="/admin/login"
                className="h-8 px-3.5 rounded-lg bg-[#1b1b1f] border border-[#454934]/30 hover:border-primary-container hover:text-primary-container text-xs font-semibold text-white flex items-center gap-1.5 transition-colors flex-shrink-0"
              >
                <Lock className="w-3 h-3 text-primary-container" />
                <span>Buka Portal</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-2 border-t border-[#343538]/60 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-primary-container text-on-primary-container font-mono text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-[0_0_12px_var(--accent-glow)]"
          >
            Selesai
          </button>
        </div>
      </div>
    </>
  );
}
