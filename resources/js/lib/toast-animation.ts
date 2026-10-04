import { gsap } from 'gsap';
import { toast } from 'sonner';
import type { FlashToast } from '@/types/ui';

const TOAST_SELECTOR = '[data-sonner-toast]';
const LOOKUP_TIMEOUT_MS = 1000;

function getToastElements(): Element[] {
    return Array.from(document.querySelectorAll(TOAST_SELECTOR));
}

function prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function animateToastElement(element: Element): void {
    if (prefersReducedMotion()) {
        return;
    }

    const content = element.querySelector('[data-content]');
    const icon = element.querySelector('[data-icon]');

    if (content) {
        gsap.from(content, {
            y: -6,
            duration: 0.34,
            ease: 'power3.out',
            clearProps: 'transform',
        });
    }

    if (icon) {
        gsap.from(icon, {
            scale: 0.5,
            duration: 0.38,
            ease: 'back.out(2.2)',
            clearProps: 'transform',
        });
    }
}

function animateNewToasts(previous: Set<Element>): void {
    const startedAt = performance.now();

    const findNewToasts = () => {
        const added = getToastElements().filter(
            (element) => !previous.has(element),
        );

        if (added.length > 0) {
            added.forEach(animateToastElement);

            return;
        }

        if (performance.now() - startedAt > LOOKUP_TIMEOUT_MS) {
            return;
        }

        requestAnimationFrame(findNewToasts);
    };

    requestAnimationFrame(findNewToasts);
}

export function showFlashToast(
    type: FlashToast['type'],
    message: string,
): void {
    const existing = new Set(getToastElements());

    toast[type](message);

    animateNewToasts(existing);
}
