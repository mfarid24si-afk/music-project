import { gsap } from 'gsap';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

type Props = {
    active: boolean;
    className?: string;
};

export default function IndeterminateProgress({ active, className }: Props) {
    const barRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const bar = barRef.current;

        if (!bar) {
            return;
        }

        if (!active) {
            gsap.set(bar, { scaleX: 0, autoAlpha: 0 });

            return;
        }

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            gsap.set(bar, { scaleX: 1, autoAlpha: 1 });

            return;
        }

        gsap.set(bar, {
            scaleX: 0,
            autoAlpha: 1,
            transformOrigin: 'left center',
        });

        const tween = gsap.to(bar, {
            scaleX: 1,
            duration: 1.1,
            ease: 'power2.inOut',
            repeat: -1,
            yoyo: true,
            repeatDelay: 0.15,
        });

        return () => {
            tween.kill();
        };
    }, [active]);

    return (
        <span
            aria-hidden="true"
            className={cn(
                'pointer-events-none absolute inset-x-0 bottom-0 block h-0.5 overflow-hidden',
                className,
            )}
        >
            <span
                ref={barRef}
                className="block h-full w-full origin-left scale-x-0 bg-current opacity-80"
            />
        </span>
    );
}
