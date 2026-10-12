import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
    LuCheck,
    LuCircleAlert,
    LuPencil,
    LuUpload,
    LuX,
} from 'react-icons/lu';
import { useAudio } from '../context/AudioContext';
import { EMOJI_OPTIONS, GRADIENT_PRESETS } from '../playlistHelpers';

export default function PlaylistEditModal({ playlist, onClose }) {
    const { updatePlaylist } = useAudio();

    const [editName, setEditName] = useState(playlist.name || '');
    const [editDesc, setEditDesc] = useState(playlist.description || '');
    const [editEmoji, setEditEmoji] = useState(playlist.emoji || '🎧');
    const [editGradient, setEditGradient] = useState(
        playlist.gradient || 'default',
    );
    const [editCustomCover, setEditCustomCover] = useState(
        playlist.customCover || '',
    );
    const [editNameError, setEditNameError] = useState('');
    const [coverError, setCoverError] = useState('');
    const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
    const editNameRef = useRef(null);

    // Lets the user tell what actually changed and blocks a no-op save.
    const isDirty = useMemo(() => {
        return (
            editName.trim() !== (playlist.name || '') ||
            editDesc.trim() !== (playlist.description || '') ||
            editEmoji !== (playlist.emoji || '🎧') ||
            editGradient !== (playlist.gradient || 'default') ||
            editCustomCover !== (playlist.customCover || '')
        );
    }, [playlist, editName, editDesc, editEmoji, editGradient, editCustomCover]);

    const requestCloseEdit = () => {
        if (isDirty) {
            setIsDiscardDialogOpen(true);
            return;
        }
        onClose();
    };

    // Escape closes the editor, but asks first when edits are pending.
    useEffect(() => {
        const onKey = (e) => {
            if (e.key !== 'Escape') {
                return;
            }
            if (isDiscardDialogOpen) {
                setIsDiscardDialogOpen(false);
                return;
            }
            requestCloseEdit();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isDiscardDialogOpen, isDirty]);

    const handleCoverFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }
        setCoverError('');
        if (file.size > 3 * 1024 * 1024) {
            setCoverError(
                'Maximum image size is 3MB. Please pick a smaller file.',
            );
            e.target.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            setEditCustomCover(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSaveEdit = (e) => {
        e.preventDefault();
        const trimmedName = editName.trim();
        if (!trimmedName) {
            setEditNameError('Playlist name cannot be empty.');
            editNameRef.current?.focus();
            return;
        }
        updatePlaylist(playlist.id, {
            name: trimmedName,
            description: editDesc.trim(),
            emoji: editEmoji,
            gradient: editGradient,
            customCover: editCustomCover,
        });
        onClose();
    };

    return createPortal(
                    <>
                        <div
                            aria-hidden="true"
                            className="fixed inset-0 z-[90] bg-black/75 backdrop-blur-sm transition-opacity"
                            onClick={requestCloseEdit}
                        />
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="edit-playlist-title"
                            className="animate-scaleUp fixed inset-x-4 top-1/2 z-[100] mx-auto max-h-[85vh] w-full max-w-sm -translate-y-1/2 overflow-y-auto rounded-2xl border border-line-strong/40 bg-overlay shadow-2xl sm:inset-x-0"
                        >
                            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-line/60 bg-overlay px-4 py-3 backdrop-blur-md">
                                <div className="flex items-center gap-2">
                                    <LuPencil className="h-4 w-4 text-primary-container" />
                                    <h3
                                        id="edit-playlist-title"
                                        className="font-display text-sm font-bold text-white"
                                    >
                                        Edit Playlist Details
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={requestCloseEdit}
                                    aria-label="Close dialog"
                                    className="flex h-7 w-7 items-center justify-center rounded-full bg-chip text-on-surface-variant transition-colors hover:bg-chip hover:text-white"
                                >
                                    <LuX className="h-4 w-4" />
                                </button>
                            </div>

                            <form
                                id="playlist-edit-form"
                                onSubmit={handleSaveEdit}
                                className="flex flex-col gap-3.5 p-4"
                            >
                                {/* Name */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="font-mono text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">
                                        Playlist Name
                                    </label>
                                    <input
                                        ref={editNameRef}
                                        id="edit-playlist-name"
                                        type="text"
                                        value={editName}
                                        onChange={(e) => {
                                            setEditName(e.target.value);
                                            if (editNameError)
                                                setEditNameError('');
                                        }}
                                        placeholder="e.g. Midnight Beats, Chill Vibes"
                                        maxLength={40}
                                        required
                                        aria-invalid={!!editNameError}
                                        aria-describedby={
                                            editNameError
                                                ? 'edit-playlist-name-error'
                                                : 'edit-playlist-name-counter'
                                        }
                                        className={`rounded-lg border bg-canvas px-3.5 py-2.5 text-sm text-white transition-colors placeholder:text-on-surface-variant/50 focus:outline-none ${
                                            editNameError
                                                ? 'border-red-400/70 focus:border-red-400'
                                                : 'border-line-strong/30 focus:border-primary-container'
                                        }`}
                                    />
                                    {editNameError ? (
                                        <p
                                            id="edit-playlist-name-error"
                                            role="alert"
                                            className="flex items-center gap-1.5 text-[11px] text-red-400"
                                        >
                                            <LuCircleAlert className="h-3.5 w-3.5 flex-shrink-0" />
                                            {editNameError}
                                        </p>
                                    ) : (
                                        <p
                                            id="edit-playlist-name-counter"
                                            className="text-right font-mono text-[10px] text-on-surface-variant/60 tabular-nums"
                                        >
                                            {editName.length}/40
                                        </p>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="font-mono text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">
                                        Personal Note / Description
                                    </label>
                                    <textarea
                                        value={editDesc}
                                        onChange={(e) =>
                                            setEditDesc(e.target.value)
                                        }
                                        placeholder="Write a personal mood, vibe, or memories about this playlist..."
                                        rows={3}
                                        maxLength={200}
                                        className="resize-none rounded-lg border border-line-strong/30 bg-canvas px-3.5 py-2 text-xs text-white transition-colors placeholder:text-on-surface-variant/50 focus:border-primary-container focus:outline-none"
                                    />
                                </div>
                                {/* Custom Cover Photo Upload */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="font-mono text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">
                                        Custom Cover Photo (Optional)
                                    </label>
                                    {editCustomCover ? (
                                        <div className="flex items-center gap-3 rounded-xl border border-line-strong/30 bg-canvas p-2">
                                            <img
                                                src={editCustomCover}
                                                alt="Cover preview"
                                                className="h-16 w-16 flex-shrink-0 rounded-lg border border-white/10 object-cover"
                                            />
                                            <div className="flex min-w-0 flex-1 flex-col gap-1">
                                                <span className="truncate text-xs font-semibold text-white">
                                                    Photo cover active
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setEditCustomCover('')
                                                    }
                                                    className="flex items-center gap-1 text-left font-mono text-[11px] text-red-400 transition-colors hover:text-red-300"
                                                >
                                                    <LuX className="h-3 w-3 flex-shrink-0" />
                                                    Remove &amp; use default
                                                    collage
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong/50 bg-canvas px-4 py-3 text-xs text-on-surface-variant transition-colors hover:border-primary-container hover:text-white">
                                                <LuUpload className="h-4 w-4 text-primary-container" />
                                                <span>
                                                    Upload Custom Cover Photo (JPG,
                                                    PNG)
                                                </span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleCoverFileUpload}
                                                    className="hidden"
                                                />
                                            </label>
                                            <input
                                                type="url"
                                                placeholder="Or paste an image URL (https://...)"
                                                value={editCustomCover}
                                                onChange={(e) =>
                                                    setEditCustomCover(
                                                        e.target.value,
                                                    )
                                                }
                                                className="rounded-lg border border-line-strong/30 bg-canvas px-3 py-1.5 text-xs text-white transition-colors placeholder:text-on-surface-variant/40 focus:border-primary-container focus:outline-none"
                                            />
                                        </div>
                                    )}
                                    {coverError && (
                                        <p
                                            role="alert"
                                            className="flex items-center gap-1.5 text-[11px] text-red-400"
                                        >
                                            <LuCircleAlert className="h-3.5 w-3.5 flex-shrink-0" />
                                            {coverError}
                                        </p>
                                    )}
                                </div>

                                {/* Emoji Badge */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="font-mono text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">
                                        Cover Icon / Emoji
                                    </label>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {EMOJI_OPTIONS.map((emoji) => (
                                            <button
                                                key={emoji}
                                                type="button"
                                                onClick={() => setEditEmoji(emoji)}
                                                className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-all ${
                                                    editEmoji === emoji
                                                        ? 'scale-110 border-2 border-primary-container bg-primary-container/20'
                                                        : 'border border-line-strong/30 bg-canvas hover:bg-chip'
                                                }`}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Theme Gradient */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="font-mono text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">
                                        Theme Ambient Glow
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {GRADIENT_PRESETS.map((preset) => (
                                            <button
                                                key={preset.id}
                                                type="button"
                                                onClick={() =>
                                                    setEditGradient(preset.id)
                                                }
                                                className={`flex h-9 items-center justify-center gap-1.5 rounded-lg border font-mono text-xs font-medium transition-all ${
                                                    editGradient === preset.id
                                                        ? 'border-white text-white shadow-sm'
                                                        : 'border-white/10 text-on-surface-variant hover:text-white'
                                                }`}
                                                style={{
                                                    backgroundColor: `${preset.color}22`,
                                                    borderColor:
                                                        editGradient === preset.id
                                                            ? preset.color
                                                            : undefined,
                                                }}
                                            >
                                                <span
                                                    className="h-2 w-2 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            preset.color,
                                                    }}
                                                />
                                                <span>{preset.name}</span>
                                                {editGradient === preset.id && (
                                                    <LuCheck className="ml-0.5 h-3 w-3 text-white" />
                                                )}
                                            </button>
                                        ))}
                                     </div>
                                 </div>

                                 {/* Actions */}
                                 <div className="flex items-center justify-between gap-3 border-t border-line/60 pt-4 mt-2">
                                     <span
                                         className={`flex items-center gap-1.5 font-mono text-[10px] tracking-wider uppercase transition-colors ${
                                             isDirty
                                                 ? 'text-amber-400'
                                                 : 'text-on-surface-variant/60'
                                         }`}
                                     >
                                         <span
                                             className={`h-1.5 w-1.5 rounded-full ${
                                                 isDirty
                                                     ? 'animate-pulse bg-amber-400'
                                                     : 'bg-on-surface-variant/40'
                                             }`}
                                         />
                                         {isDirty
                                             ? 'Unsaved changes'
                                             : 'All changes saved'}
                                     </span>

                                     <div className="flex items-center gap-2.5">
                                         <button
                                             type="button"
                                             onClick={requestCloseEdit}
                                             className="rounded-lg px-4 py-2 text-xs font-semibold text-on-surface-variant transition-colors hover:bg-white/5 hover:text-white"
                                         >
                                             Cancel
                                         </button>
                                         <button
                                             type="submit"
                                             className="rounded-lg bg-primary-container px-5 py-2 font-mono text-xs font-bold tracking-wider text-on-primary-container shadow-[0_0_12px_var(--accent-glow)] transition-all hover:scale-105 active:scale-95"
                                         >
                                             Save Changes
                                         </button>
                                     </div>
                                 </div>
                            </form>
                        </div>

                        {/* Discard confirmation - only when edits are pending */}
                        {isDiscardDialogOpen && (
                            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                                <div
                                    aria-hidden="true"
                                    className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                                    onClick={() => setIsDiscardDialogOpen(false)}
                                />
                                <div
                                    role="alertdialog"
                                    aria-modal="true"
                                    aria-labelledby="discard-playlist-title"
                                    aria-describedby="discard-playlist-desc"
                                    className="animate-scaleUp relative w-full max-w-sm rounded-2xl border border-line-strong/40 bg-overlay p-5 shadow-2xl"
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-amber-400">
                                            <LuCircleAlert className="h-5 w-5" />
                                        </span>
                                        <div className="min-w-0">
                                            <h4
                                                id="discard-playlist-title"
                                                className="font-display text-sm font-bold text-white"
                                            >
                                                Discard unsaved changes?
                                            </h4>
                                            <p
                                                id="discard-playlist-desc"
                                                className="mt-1 text-xs leading-relaxed text-on-surface-variant"
                                            >
                                                Your edits to this playlist have not
                                                been saved. Closing now will lose
                                                them.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 flex justify-end gap-2.5">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsDiscardDialogOpen(false)
                                            }
                                            className="rounded-lg px-4 py-2 text-xs font-semibold text-on-surface-variant transition-colors hover:bg-white/5 hover:text-white"
                                        >
                                            Keep Editing
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCloseEdit}
                                            className="rounded-lg bg-red-500/90 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-red-500"
                                        >
                                            Discard
                                        </button>
                                    </div>
                                </div>
                            </div>
                            )}
                    </>,
        document.body,
    );
}
