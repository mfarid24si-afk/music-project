import { gsap } from 'gsap';

function animateFlashAlerts(): void {
    const alerts = gsap.utils.toArray<HTMLElement>('.alert');

    if (alerts.length === 0) {
        return;
    }

    gsap.from(alerts, {
        y: -12,
        autoAlpha: 0,
        duration: 0.35,
        ease: 'power2.out',
        stagger: 0.08,
        clearProps: 'opacity,visibility,transform',
    });
}

function animateTableRows(): void {
    const rows = gsap.utils.toArray<HTMLElement>(
        '.table-responsive tbody > tr',
    );

    if (rows.length === 0) {
        return;
    }

    gsap.from(rows, {
        y: 10,
        autoAlpha: 0,
        duration: 0.3,
        ease: 'power2.out',
        stagger: { amount: 0.4, from: 'start' },
        clearProps: 'opacity,visibility,transform',
    });
}

function initAdminAnimations(): void {
    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        animateFlashAlerts();
        animateTableRows();
    });
}

initAdminAnimations();
