import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { LuCheck, LuMusic, LuPause, LuPlay, LuSparkles, LuX } from 'react-icons/lu';

export default function SuggestSongModal({ isOpen, onClose }) {
    const { showToast } = useAudio();

    const [mode, setMode] = useState('audio'); // 'audio' | 'youtube'
    const [audioUrl, setAudioUrl] = useState('');
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [coverUrl, setCoverUrl] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [album, setAlbum] = useState('');
    const [genre, setGenre] = useState('');
    const [description, setDescription] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [previewAudio, setPreviewAudio] = useState(null);
    const [isPlayingPreview, setIsPlayingPreview] = useState(false);
    const [isPlayingYtPreview, setIsPlayingYtPreview] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);

    if (!isOpen) return null;

    const handleAudioUrlChange = (e) => {
        const val = e.target.value;
        setAudioUrl(val);

        if (val && (!title || !artist)) {
            try {
                const pathname = new URL(val).pathname;
                let filename = pathname.substring(pathname.lastIndexOf('/') + 1);
                filename = decodeURIComponent(filename);
                filename = filename.replace(/\.(mp3|wav|flac|m4a|ogg|mp4)$/i, '');

                if (filename.includes(' - ')) {
                    const parts = filename.split(' - ');
                    if (!artist && parts[0]) setArtist(parts[0].trim());
                    if (!title && parts.slice(1).join(' - ')) setTitle(parts.slice(1).join(' - ').trim());
                } else if (!title && filename) {
                    setTitle(filename.trim());
                }
            } catch (err) {
                // Ignore url parse error
            }
        }
    };

    const getYoutubeId = (url) => {
        if (!url) return null;
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        return match ? match[1] : null;
    };

    const togglePreview = () => {
        if (!audioUrl.trim()) {
            setErrorMsg('Masukkan direct audio URL terlebih dahulu untuk test putar.');
            return;
        }

        if (isPlayingPreview && previewAudio) {
            previewAudio.pause();
            setIsPlayingPreview(false);
            return;
        }

        if (previewAudio) {
            previewAudio.pause();
        }

        setPreviewLoading(true);
        const audio = new Audio(audioUrl.trim());

        audio.oncanplay = () => {
            setPreviewLoading(false);
            audio.play().then(() => {
                setIsPlayingPreview(true);
            }).catch(() => {
                setIsPlayingPreview(false);
                setErrorMsg('Gagal memutar audio: format tidak didukung atau URL terblokir CORS.');
            });
        };

        audio.onerror = () => {
            setPreviewLoading(false);
            setIsPlayingPreview(false);
            setErrorMsg('Link audio tidak valid atau file tidak ditemukan (404).');
        };

        audio.onended = () => {
            setIsPlayingPreview(false);
        };

        setPreviewAudio(audio);
    };

    const handleClose = () => {
        if (previewAudio) {
            previewAudio.pause();
        }
        setIsPlayingPreview(false);
        setIsPlayingYtPreview(false);
        setErrorMsg('');
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        let finalAudioUrl = audioUrl.trim();
        let finalCoverUrl = coverUrl.trim();
        let finalYoutubeUrl = youtubeUrl.trim();

        if (mode === 'youtube') {
            if (!finalYoutubeUrl) {
                setErrorMsg('Harap masukkan tautan link video YouTube.');
                return;
            }
            const ytId = getYoutubeId(finalYoutubeUrl);
            if (!ytId) {
                setErrorMsg('Format tautan YouTube tidak valid. Gunakan format youtube.com/watch?v=... atau youtu.be/...');
                return;
            }
            finalAudioUrl = finalYoutubeUrl;
            finalCoverUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
        }

        if (!title.trim() || !artist.trim() || !finalAudioUrl || !finalCoverUrl || !album.trim() || !genre.trim() || !description.trim()) {
            setErrorMsg('Harap lengkapi seluruh kolom formulir pengajuan lagu (semua field wajib diisi).');
            return;
        }

        setIsSubmitting(true);

        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

            const res = await fetch('/music/suggest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': token,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    title: title.trim(),
                    artist: artist.trim(),
                    audio_url: finalAudioUrl,
                    cover_url: finalCoverUrl,
                    youtube_url: finalYoutubeUrl || null,
                    album: album.trim(),
                    genre: genre.trim(),
                    description: description.trim(),
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                showToast(`⏳ Lagu "${title}" berhasil diajukan! Menunggu persetujuan Admin.`, 'success');
                setAudioUrl('');
                setTitle('');
                setArtist('');
                setCoverUrl('');
                setYoutubeUrl('');
                setAlbum('');
                setGenre('');
                setDescription('');
                handleClose();
            } else {
                setErrorMsg(data.message || (data.errors ? Object.values(data.errors).flat().join(', ') : 'Gagal mengajukan lagu.'));
            }
        } catch (err) {
            setErrorMsg('Koneksi bermasalah: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentYtId = mode === 'youtube' ? getYoutubeId(youtubeUrl) : null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
            />

            {/* Modal Dialog */}
            <div className="fixed top-1/2 left-1/2 z-50 flex max-h-[92vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col gap-4 overflow-y-auto rounded-2xl border border-line-strong/40 bg-overlay p-6 shadow-2xl animate-scaleUp">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-line/60 pb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-container/15 text-primary-container">
                            <LuMusic className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="font-display text-base font-bold text-white">
                                Ajukan Lagu Baru
                            </h3>
                            <p className="text-[11px] text-on-surface-variant">
                                Lagu akan ditinjau oleh Administrator sebelum terbit
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-chip text-on-surface-variant transition-colors hover:text-white"
                    >
                        <LuX className="h-4 w-4" />
                    </button>
                </div>

                {/* Mode Selector Tabs */}
                <div className="flex gap-2 rounded-xl border border-line-strong/30 bg-canvas p-1">
                    <button
                        type="button"
                        onClick={() => { setMode('audio'); setErrorMsg(''); }}
                        className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                            mode === 'audio'
                                ? 'border border-line-strong/40 bg-raised text-white shadow-sm'
                                : 'text-on-surface-variant hover:text-white'
                        }`}
                    >
                        🌐 Direct Audio URL
                    </button>
                    <button
                        type="button"
                        onClick={() => { setMode('youtube'); setErrorMsg(''); }}
                        className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                            mode === 'youtube'
                                ? 'border border-danger/40 bg-danger/20 text-danger shadow-sm'
                                : 'text-on-surface-variant hover:text-white'
                        }`}
                    >
                        🔴 Link Video YouTube
                    </button>
                </div>

                {/* Info Note */}
                <div className="flex items-start gap-2.5 rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
                    <LuSparkles className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>
                        {mode === 'youtube'
                            ? <strong>Mode YouTube Streaming: Cukup masukkan tautan YouTube. Cover thumbnail akan otomatis diambil dari video YouTube tanpa memakan memori server!</strong>
                            : <strong>Mode Audio URL: Masukkan link direct audio (.mp3) dan lengkapi data lagu. Semua kolom wajib diisi.</strong>
                        }
                    </span>
                </div>

                {errorMsg && (
                    <div className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                    {mode === 'audio' ? (
                        <>
                            {/* Audio URL Field with Quick Preview */}
                            <div className="flex flex-col gap-1.5">
                                <label className="font-mono text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">
                                    Direct Audio URL (HTTP/HTTPS) *
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        required
                                        value={audioUrl}
                                        onChange={handleAudioUrlChange}
                                        placeholder="https://cdn.example.com/audio/Artist - Song.mp3"
                                        className="flex-1 rounded-xl border border-line-strong/40 bg-canvas px-3.5 py-2.5 text-xs text-white placeholder:text-text-muted focus:border-primary-container focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePreview}
                                        disabled={previewLoading}
                                        title="Test putar lagu"
                                        className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                                            isPlayingPreview
                                                ? 'border-primary-container bg-primary-container/20 text-primary-container'
                                                : 'border-line-strong/30 bg-raised text-on-surface-variant hover:border-primary-container hover:text-white'
                                        }`}
                                    >
                                        {previewLoading ? (
                                            <span className="animate-spin text-xs">⏳</span>
                                        ) : isPlayingPreview ? (
                                            <>
                                                <LuPause className="h-3.5 w-3.5 text-primary-container" />
                                                <span>Stop</span>
                                            </>
                                        ) : (
                                            <>
                                                <LuPlay className="h-3.5 w-3.5" />
                                                <span>Dengar</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Cover URL & YouTube URL Grid */}
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="flex flex-col gap-1.5">
                                    <label className="font-mono text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">
                                        Cover Image URL (HTTP/HTTPS) *
                                    </label>
                                    <input
                                        type="url"
                                        required
                                        value={coverUrl}
                                        onChange={(e) => setCoverUrl(e.target.value)}
                                        placeholder="https://cdn.example.com/cover.jpg"
                                        className="rounded-xl border border-line-strong/40 bg-canvas px-3.5 py-2.5 text-xs text-white placeholder:text-text-muted focus:border-primary-container focus:outline-none"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="font-mono text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">
                                        Link Video YouTube *
                                    </label>
                                    <input
                                        type="url"
                                        required
                                        value={youtubeUrl}
                                        onChange={(e) => setYoutubeUrl(e.target.value)}
                                        placeholder="https://youtube.com/watch?v=..."
                                        className="rounded-xl border border-line-strong/40 bg-canvas px-3.5 py-2.5 text-xs text-white placeholder:text-text-muted focus:border-primary-container focus:outline-none"
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* YouTube URL Field with Quick Test Play */}
                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="font-mono text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">
                                        Link Video YouTube (HTTP/HTTPS) *
                                    </label>
                                    {currentYtId && (
                                        <span className="font-mono text-[10px] text-primary-container">
                                            ID Terdeteksi: {currentYtId}
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        required
                                        value={youtubeUrl}
                                        onChange={(e) => {
                                            setYoutubeUrl(e.target.value);
                                            setIsPlayingYtPreview(false);
                                        }}
                                        placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                                        className="flex-1 rounded-xl border border-line-strong/40 bg-canvas px-3.5 py-2.5 text-xs text-white placeholder:text-text-muted focus:border-primary-container focus:outline-none"
                                    />
                                    {currentYtId && (
                                        <button
                                            type="button"
                                            onClick={() => setIsPlayingYtPreview(!isPlayingYtPreview)}
                                            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                                                isPlayingYtPreview
                                                    ? 'border-danger bg-danger/20 text-danger'
                                                    : 'border-line-strong/30 bg-raised text-on-surface-variant hover:border-danger hover:text-white'
                                            }`}
                                            title="Test putar video YouTube"
                                        >
                                            {isPlayingYtPreview ? (
                                                <>
                                                    <LuPause className="h-3.5 w-3.5 text-danger" />
                                                    <span>Tutup</span>
                                                </>
                                            ) : (
                                                <>
                                                    <LuPlay className="h-3.5 w-3.5 text-danger" />
                                                    <span>Tes Dengar</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Mini Player / Cover Preview */}
                            {currentYtId && (
                                <div className="flex flex-col gap-2 rounded-xl border border-line-strong/30 bg-canvas p-2.5">
                                    {isPlayingYtPreview ? (
                                        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                                            <iframe
                                                src={`https://www.youtube-nocookie.com/embed/${currentYtId}?autoplay=1&controls=1&modestbranding=1`}
                                                title="YouTube Test Player"
                                                className="h-full w-full border-0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={`https://img.youtube.com/vi/${currentYtId}/hqdefault.jpg`}
                                                    alt="Thumbnail Preview"
                                                    className="h-12 w-18 rounded-lg object-cover"
                                                />
                                                <div className="text-xs">
                                                    <div className="font-bold text-white">Cover Otomatis Terhubung</div>
                                                    <div className="text-[11px] text-on-surface-variant">Klik &quot;Tes Dengar&quot; untuk memastikan video bisa diputar</div>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setIsPlayingYtPreview(true)}
                                                className="flex items-center gap-1 rounded-lg border border-line-strong/30 bg-raised px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:border-danger hover:text-danger"
                                            >
                                                <LuPlay className="h-3 w-3 text-danger" />
                                                <span>Cek Suara</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {/* Title & Artist Grid */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <label className="font-mono text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">
                                Judul Lagu *
                            </label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="contoh: Fix You"
                                className="rounded-xl border border-line-strong/40 bg-canvas px-3.5 py-2.5 text-xs text-white placeholder:text-text-muted focus:border-primary-container focus:outline-none"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="font-mono text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">
                                Nama Artist *
                            </label>
                            <input
                                type="text"
                                required
                                value={artist}
                                onChange={(e) => setArtist(e.target.value)}
                                placeholder="contoh: Coldplay"
                                className="rounded-xl border border-line-strong/40 bg-canvas px-3.5 py-2.5 text-xs text-white placeholder:text-text-muted focus:border-primary-container focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Album & Genre Grid */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <label className="font-mono text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">
                                Nama Album *
                            </label>
                            <input
                                type="text"
                                required
                                value={album}
                                onChange={(e) => setAlbum(e.target.value)}
                                placeholder="contoh: X&Y"
                                className="rounded-xl border border-line-strong/40 bg-canvas px-3.5 py-2.5 text-xs text-white placeholder:text-text-muted focus:border-primary-container focus:outline-none"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="font-mono text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">
                                Genre Musik *
                            </label>
                            <input
                                type="text"
                                required
                                value={genre}
                                onChange={(e) => setGenre(e.target.value)}
                                placeholder="Pop, Rock, Acoustic"
                                className="rounded-xl border border-line-strong/40 bg-canvas px-3.5 py-2.5 text-xs text-white placeholder:text-text-muted focus:border-primary-container focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Description Field */}
                    <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">
                            Catatan / Deskripsi Rilis *
                        </label>
                        <textarea
                            rows={2}
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Catatan singkat tentang versi atau aransemen lagu..."
                            className="rounded-xl border border-line-strong/40 bg-canvas px-3.5 py-2.5 text-xs text-white placeholder:text-text-muted focus:border-primary-container focus:outline-none resize-none"
                        />
                    </div>

                    {/* Submit Actions */}
                    <div className="mt-2 flex items-center justify-end gap-3 border-t border-line/40 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="rounded-full border border-line-strong/30 bg-raised px-4 py-2 text-xs font-semibold text-on-surface-variant transition-colors hover:text-white"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 rounded-full bg-primary-container px-5 py-2 font-mono text-xs font-bold text-on-primary-container transition-all hover:brightness-110 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <span>Mengirim...</span>
                            ) : (
                                <>
                                    <LuCheck className="h-4 w-4" />
                                    <span>Ajukan Lagu ke Admin</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
