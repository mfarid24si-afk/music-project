import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
    LuCheck,
    LuCircleAlert,
    LuImagePlus,
    LuPencil,
    LuRefreshCw,
    LuTrash2,
    LuX,
} from 'react-icons/lu';
import { useAudio } from '../context/AudioContext';
import {
    GRADIENT_PRESETS,
    PLAYLIST_ICON_OPTIONS,
    resolvePlaylistIconId,
} from '../playlistHelpers';

const MAX_COVER_BYTES = 3 * 1024 * 1024;
const FOCUSABLE =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function PlaylistEditModal({ playlist, onClose }) {
    const { updatePlaylist } = useAudio();

    const [editName, setEditName] = useState(playlist.name || '');
    const [editDesc, setEditDesc] = useState(playlist.description || '');
    const [editEmoji, setEditEmoji] = useState(
        resolvePlaylistIconId(playlist.emoji),
    );
    const [editGradient, setEditGradient] = useState(
        playlist.gradient || 'default',
    );
    const [editCustomCover, setEditCustomCover] = useState(
        playlist.customCover || '',
    );
    const [coverFileName, setCoverFileName] = useState('');
    const [isCoverDragActive, setIsCoverDragActive] = useState(false);
    const [editNameError, setEditNameError] = useState('');
    const [coverError, setCoverError] = useState('');
    const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
    const editNameRef = useRef(null);
    const dialogRef = useRef(null);

    // Lets the user tell what actually changed and blocks a no-op save.
    const isDirty = useMemo(() => {
        return (
            editName.trim() !== (playlist.name || '') ||
            editDesc.trim() !== (playlist.description || '') ||
            editEmoji !== resolvePlaylistIconId(playlist.emoji) ||
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

    const confirmDiscard = () => {
        setIsDiscardDialogOpen(false);
        onClose();
    };

    // Focus the first field on open, and keep Tab inside the dialog.
    useEffect(() => {
        editNameRef.current?.focus();
    }, []);

    useEffect(() => {
        const node = dialogRef.current;
        if (!node) {
            return;
        }
        const onKeyDown = (e) => {
            if (e.key !== 'Tab') {
                return;
            }
            const focusable = Array.from(
                node.querySelectorAll(FOCUSABLE),
            ).filter((el) => el.offsetParent !== null);
            if (focusable.length === 0) {
                return;
            }
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };
        node.addEventListener('keydown', onKeyDown);
        return () => node.removeEventListener('keydown', onKeyDown);
    }, []);

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

    const processCoverFile = (file) => {
        setCoverError('');
        if (!file.type.startsWith('image/')) {
            setCoverError('Please choose an image file (JPG, PNG, or WebP).');
            return;
        }
        if (file.size > MAX_COVER_BYTES) {
            setCoverError(
                'Maximum image size is 3MB. Please pick a smaller file.',
            );
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            setEditCustomCover(reader.result);
            setCoverFileName(file.name);
        };
        reader.readAsDataURL(file);
    };

    const handleCoverFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            processCoverFile(file);
        }
        e.target.value = '';
    };

    const handleCoverDragOver = (e) => {
        e.preventDefault();
        setIsCoverDragActive(true);
    };

    const handleCoverDragLeave = (e) => {
        e.preventDefault();
        setIsCoverDragActive(false);
    };

    const handleCoverDrop = (e) => {
        e.preventDefault();
        setIsCoverDragActive(false);
        const file = e.dataTransfer?.files?.[0];
        if (file) {
            processCoverFile(file);
        }
    };

    const removeCover = () => {
        setEditCustomCover('');
        setCoverFileName('');
        setCoverError('');
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
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-playlist-title"
                className="animate-scaleUp fixed inset-x-4 top-1/2 z-[100] mx-auto max-h-[85vh] w-full max-w-sm -translate-y-1/2 overflow-y-auto rounded-2xl border border-line-strong/40 bg-overlay shadow-2xl sm:inset-x-0"
            >
                <div className="sticky top-0 z-20 flex items-center justify-between border-b border-line/60 bg-overlay px-4 py-3 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                        <LuPencil
                            className="h-4 w-4 text-primary-container"
                            aria-hidden="true"
                        />
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
                        className="focus-ring flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors duration-200 ease-out hover:bg-chip hover:text-white motion-reduce:transition-none"
                    >
                        <LuX className="h-4 w-4" aria-hidden="true" />
                    </button>
                </div>

                <form
                    id="playlist-edit-form"
                    onSubmit={handleSaveEdit}
                    className="flex flex-col gap-3.5 p-4"
                >
                    {/* Name */}
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="edit-playlist-name"
                            className="font-mono text-xs font-bold tracking-wider text-on-surface-variant uppercase"
                        >
                            Playlist Name
                        </label>
                        <input
                            ref={editNameRef}
                            id="edit-playlist-name"
                            type="text"
                            value={editName}
                            onChange={(e) => {
                                setEditName(e.target.value);
                                if (editNameError) {
                                    setEditNameError('');
                                }
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
                            className={`focus-ring rounded-lg border bg-canvas px-3.5 py-2.5 text-sm text-white transition-colors duration-200 ease-out placeholder:text-on-surface-variant/50 motion-reduce:transition-none ${
                                editNameError
                                    ? 'border-red-400/70'
                                    : 'border-line-strong/30'
                            }`}
                        />
                        {editNameError ? (
                            <p
                                id="edit-playlist-name-error"
                                role="alert"
                                className="flex items-center gap-1.5 text-xs text-red-400"
                            >
                                <LuCircleAlert
                                    className="h-3.5 w-3.5 flex-shrink-0"
                                    aria-hidden="true"
                                />
                                {editNameError}
                            </p>
                        ) : (
                            <p
                                id="edit-playlist-name-counter"
                                className="text-right font-mono text-xs text-on-surface-variant/60 tabular-nums"
                            >
                                {editName.length}/40
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="edit-playlist-desc"
                            className="font-mono text-xs font-bold tracking-wider text-on-surface-variant uppercase"
                        >
                            Personal Note / Description
                        </label>
                        <textarea
                            id="edit-playlist-desc"
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            placeholder="Write a personal mood, vibe, or memories about this playlist..."
                            rows={3}
                            maxLength={200}
                            className="focus-ring resize-none rounded-lg border border-line-strong/30 bg-canvas px-3.5 py-2 text-xs text-white transition-colors duration-200 ease-out placeholder:text-on-surface-variant/50 motion-reduce:transition-none"
                        />
                    </div>

                    {/* Custom Cover Photo Upload */}
                    <div className="flex flex-col gap-1.5">
                        <span className="font-mono text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                            Custom Cover Photo{' '}
                            <span className="font-normal normal-case">
                                (optional)
                            </span>
                        </span>
                        {editCustomCover ? (
                            <div className="flex items-center gap-3 rounded-xl border border-line-strong/30 bg-canvas p-2.5">
                                <img
                                    src={editCustomCover}
                                    alt="Selected cover preview"
                                    className="h-16 w-16 flex-shrink-0 rounded-lg border border-white/10 object-cover"
                                />
                                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                                    <span className="truncate text-xs font-semibold text-white">
                                        {coverFileName || 'Cover image active'}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <label className="focus-within:text-primary-container flex cursor-pointer items-center gap-1 font-mono text-xs text-on-surface-variant transition-colors duration-200 ease-out hover:text-white motion-reduce:transition-none">
                                            <LuRefreshCw
                                                className="h-3.5 w-3.5"
                                                aria-hidden="true"
                                            />
                                            Replace
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleCoverFileUpload}
                                                className="sr-only"
                                            />
                                        </label>
                                        <button
                                            type="button"
                                            onClick={removeCover}
                                            className="focus-ring flex items-center gap-1 rounded font-mono text-xs text-red-400 transition-colors duration-200 ease-out hover:text-red-300 motion-reduce:transition-none"
                                        >
                                            <LuTrash2
                                                className="h-3.5 w-3.5"
                                                aria-hidden="true"
                                            />
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <label
                                    onDragOver={handleCoverDragOver}
                                    onDragLeave={handleCoverDragLeave}
                                    onDrop={handleCoverDrop}
                                    className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed px-4 py-5 text-center transition-colors duration-200 ease-out focus-within:ring-2 focus-within:ring-primary-container/40 motion-reduce:transition-none ${
                                        isCoverDragActive
                                            ? 'border-primary-container bg-primary-container/10'
                                            : 'border-line-strong/50 bg-canvas hover:border-primary-container hover:bg-chip/40'
                                    }`}
                                >
                                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-container/15 text-primary-container">
                                        <LuImagePlus
                                            className="h-5 w-5"
                                            aria-hidden="true"
                                        />
                                    </span>
                                    <span className="text-xs font-semibold text-white">
                                        Choose a cover image
                                    </span>
                                    <span className="text-xs leading-relaxed text-on-surface-variant">
                                        Drag &amp; drop or click to browse
                                        &middot; JPG, PNG, WebP &middot; up to 3MB
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleCoverFileUpload}
                                        className="sr-only"
                                    />
                                </label>
                                <div className="flex items-center gap-2">
                                    <span
                                        className="h-px flex-1 bg-line-strong/30"
                                        aria-hidden="true"
                                    />
                                    <span className="font-mono text-xs text-on-surface-variant/60 uppercase">
                                        or
                                    </span>
                                    <span
                                        className="h-px flex-1 bg-line-strong/30"
                                        aria-hidden="true"
                                    />
                                </div>
                                <input
                                    type="url"
                                    aria-label="Or paste an image URL"
                                    placeholder="Paste an image URL (https://...)"
                                    value={
                                        editCustomCover.startsWith('data:')
                                            ? ''
                                            : editCustomCover
                                    }
                                    onChange={(e) =>
                                        setEditCustomCover(e.target.value)
                                    }
                                    className="focus-ring rounded-lg border border-line-strong/30 bg-canvas px-3 py-2 text-xs text-white transition-colors duration-200 ease-out placeholder:text-on-surface-variant/40 motion-reduce:transition-none"
                                />
                            </div>
                        )}
                        {coverError && (
                            <p
                                role="alert"
                                className="flex items-center gap-1.5 text-xs text-red-400"
                            >
                                <LuCircleAlert
                                    className="h-3.5 w-3.5 flex-shrink-0"
                                    aria-hidden="true"
                                />
                                {coverError}
                            </p>
                        )}
                    </div>

                    {/* Cover Icon */}
                    <div className="flex flex-col gap-1.5">
                        <span className="font-mono text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                            Cover Icon
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {PLAYLIST_ICON_OPTIONS.map(
                                ({ id, label, Icon }) => {
                                    const isSelected = editEmoji === id;
                                    return (
                                        <button
                                            key={id}
                                            type="button"
                                            onClick={() => setEditEmoji(id)}
                                            title={label}
                                            aria-label={`Use ${label} icon`}
                                            aria-pressed={isSelected}
                                            className={`focus-ring flex h-11 w-11 items-center justify-center rounded-lg border transition-colors duration-200 ease-out motion-reduce:transition-none ${
                                                isSelected
                                                    ? 'border-primary-container bg-primary-container/20 text-primary-container'
                                                    : 'border-line-strong/30 bg-canvas text-on-surface-variant hover:bg-chip hover:text-white'
                                            }`}
                                        >
                                            <Icon
                                                className="h-5 w-5"
                                                aria-hidden="true"
                                            />
                                        </button>
                                    );
                                },
                            )}
                        </div>
                    </div>

                    {/* Theme Gradient */}
                    <div className="flex flex-col gap-1.5">
                        <span className="font-mono text-xs font-bold tracking-wider text-on-surface-variant uppercase">
                            Theme Ambient Glow
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                            {GRADIENT_PRESETS.map((preset) => {
                                const isSelected =
                                    editGradient === preset.id;
                                return (
                                    <button
                                        key={preset.id}
                                        type="button"
                                        onClick={() =>
                                            setEditGradient(preset.id)
                                        }
                                        aria-pressed={isSelected}
                                        className={`focus-ring flex h-11 items-center justify-center gap-1.5 rounded-lg border font-mono text-xs font-medium transition-colors duration-200 ease-out motion-reduce:transition-none ${
                                            isSelected
                                                ? 'border-white text-white shadow-sm'
                                                : 'border-white/10 text-on-surface-variant hover:text-white'
                                        }`}
                                        style={{
                                            backgroundColor: `${preset.color}22`,
                                            borderColor: isSelected
                                                ? preset.color
                                                : undefined,
                                        }}
                                    >
                                        <span
                                            className="h-2 w-2 rounded-full"
                                            style={{
                                                backgroundColor: preset.color,
                                            }}
                                            aria-hidden="true"
                                        />
                                        <span>{preset.name}</span>
                                        {isSelected && (
                                            <LuCheck
                                                className="ml-0.5 h-3 w-3 text-white"
                                                aria-hidden="true"
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-2 flex items-center justify-between gap-3 border-t border-line/60 pt-4">
                        <span
                            className={`flex items-center gap-1.5 font-mono text-xs tracking-wider uppercase transition-colors ${
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
                                aria-hidden="true"
                            />
                            {isDirty
                                ? 'Unsaved changes'
                                : 'All changes saved'}
                        </span>

                        <div className="flex items-center gap-2.5">
                            <button
                                type="button"
                                onClick={requestCloseEdit}
                                className="focus-ring rounded-lg px-4 py-2 text-xs font-semibold text-on-surface-variant transition-colors duration-200 ease-out hover:bg-white/5 hover:text-white motion-reduce:transition-none"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="focus-ring rounded-lg bg-primary-container px-5 py-2 font-mono text-xs font-bold tracking-wider text-on-primary-container shadow-[0_0_12px_var(--accent-glow)] transition-transform duration-200 ease-out hover:scale-105 active:scale-95 motion-reduce:transition-none"
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
                                <LuCircleAlert
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                />
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
                                    Your edits to this playlist have not been
                                    saved. Closing now will lose them.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 flex justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => setIsDiscardDialogOpen(false)}
                                className="focus-ring rounded-lg px-4 py-2 text-xs font-semibold text-on-surface-variant transition-colors duration-200 ease-out hover:bg-white/5 hover:text-white motion-reduce:transition-none"
                            >
                                Keep Editing
                            </button>
                            <button
                                type="button"
                                onClick={confirmDiscard}
                                className="focus-ring rounded-lg bg-red-500/90 px-4 py-2 text-xs font-bold text-white transition-colors duration-200 ease-out hover:bg-red-500 motion-reduce:transition-none"
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
