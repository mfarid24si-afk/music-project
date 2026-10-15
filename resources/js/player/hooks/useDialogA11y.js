import { useEffect, useRef } from 'react';

const FOCUSABLE =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Shared dialog behaviour for modals and drawers: traps Tab focus inside the
 * dialog, closes on Escape, locks page scroll while open, focuses the first
 * usable control, and restores focus to the previously active element.
 *
 * @param {{ isOpen: boolean, onClose: () => void, initialFocusRef?: React.RefObject<HTMLElement> }} options
 * @returns {React.RefObject<HTMLElement>} ref to attach to the dialog element
 */
export function useDialogA11y({ isOpen, onClose, initialFocusRef }) {
    const dialogRef = useRef(null);
    const onCloseRef = useRef(onClose);

    onCloseRef.current = onClose;

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        const node = dialogRef.current;
        const previouslyFocused = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const getFocusable = () =>
            node
                ? Array.from(node.querySelectorAll(FOCUSABLE)).filter(
                      (el) => el.offsetParent !== null,
                  )
                : [];

        const focusFrame = window.requestAnimationFrame(() => {
            const target =
                initialFocusRef?.current ?? getFocusable()[0] ?? node;
            target?.focus?.();
        });

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onCloseRef.current?.();
                return;
            }

            if (event.key !== 'Tab' || !node) {
                return;
            }

            const focusable = getFocusable();

            if (focusable.length === 0) {
                event.preventDefault();
                node.focus?.();
                return;
            }

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown, true);

        return () => {
            window.cancelAnimationFrame(focusFrame);
            document.removeEventListener('keydown', handleKeyDown, true);
            document.body.style.overflow = previousOverflow;

            if (previouslyFocused instanceof HTMLElement) {
                previouslyFocused.focus();
            }
        };
    }, [isOpen, initialFocusRef]);

    return dialogRef;
}
