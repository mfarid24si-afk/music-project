import React, { useEffect, useRef, useState } from 'react';

const CURVE = 'cubic-bezier(0.83, 0, 0.17, 1)';

export default function Preloader({ onComplete }) {
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState('loading'); // loading | split
    const completedRef = useRef(false);
    const intervalRef = useRef(null);
    const timeoutRef = useRef(null);

    const finish = () => {
        if (completedRef.current) return;
        completedRef.current = true;
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setPhase('split');
        setTimeout(() => {
            if (onComplete) onComplete();
        }, 750);
    };

    useEffect(() => {
        const alreadyBooted = sessionStorage.getItem('spotirid_booted');
        const duration = alreadyBooted ? 500 : 1400;
        const steps = alreadyBooted ? 40 : 70;
        const stepMs = duration / steps;

        intervalRef.current = setInterval(() => {
            setProgress((prev) => {
                const next = Math.min(100, prev + Math.ceil(100 / steps));
                if (next >= 100) {
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                    }
                    setTimeout(finish, 180);
                    return 100;
                }
                return next;
            });
        }, stepMs);

        // Hard fail-safe: never let the preloader trap the user on a dark
        // screen, even if the interval is throttled or an asset stalls.
        timeoutRef.current = setTimeout(finish, 2200);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    // Surface a boot error instead of an eternal black screen if the app
    // never finishes booting (e.g. the Vite bundle failed to load).
    useEffect(() => {
        const watchdog = setTimeout(() => {
            if (!completedRef.current && typeof window.__spotiridShowBootError === 'function') {
                window.__spotiridShowBootError(
                    'Preloader did not complete within 9s. An asset may have failed to load.',
                );
            }
        }, 9000);
        return () => clearTimeout(watchdog);
    }, []);

    useEffect(() => {
        if (phase === 'split') {
            try {
                sessionStorage.setItem('spotirid_booted', '1');
            } catch (e) {
                // ignore
            }
        }
    }, [phase]);

    const hidden = phase === 'split';

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            aria-live="polite"
            aria-label="Loading Spotirid"
            role="status"
        >
            <div
                className={`absolute inset-x-0 top-0 h-1/2 bg-canvas transition-transform ease-[${CURVE}] duration-[700ms] ${hidden ? '-translate-y-full' : 'translate-y-0'}`}
                style={{ transitionTimingFunction: CURVE }}
            />
            <div
                className={`absolute inset-x-0 bottom-0 h-1/2 bg-canvas transition-transform ease-[${CURVE}] duration-[700ms] ${hidden ? 'translate-y-full' : 'translate-y-0'}`}
                style={{ transitionTimingFunction: CURVE }}
            />
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        'radial-gradient(60% 60% at 50% 50%, var(--accent-glow), transparent 70%)',
                }}
            />
            <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="relative flex h-40 w-40 items-center justify-center">
                    <div className="absolute inset-0 rounded-full backdrop-blur-xl border border-line-strong/40" />
                    <div
                        className="absolute inset-2 rounded-full border"
                        style={{
                            borderColor: 'color-mix(in srgb, var(--accent-color) 60%, transparent)',
                            boxShadow: '0 0 80px var(--accent-glow)',
                        }}
                    />
                    <div className="absolute inset-6 rounded-full border border-white/10" />
                    <div className="relative flex items-center gap-1.5">
                        {[0, 1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="w-1 rounded-full sonic-bar"
                                style={{
                                    height: '10px',
                                    background: 'var(--accent-color)',
                                    animationDelay: `${i * 90}ms`,
                                    boxShadow: '0 0 18px var(--accent-glow)',
                                }}
                            />
                        ))}
                    </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="font-display text-xl tracking-[0.25em] font-bold text-ink-strong">
                        SPOTIRID
                    </div>
                    <div className="font-mono text-xs tracking-[0.4em] text-on-surface-variant">
                        {String(progress).padStart(2, '0')}%
                    </div>
                </div>
                <div className="relative h-[2px] w-48 overflow-hidden rounded-full bg-chip">
                    <div
                        className="absolute inset-y-0 left-0 transition-[width] duration-150 ease-out"
                        style={{
                            width: `${progress}%`,
                            background: 'var(--accent-color)',
                            boxShadow: '0 0 16px var(--accent-glow)',
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
