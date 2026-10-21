import React, { useRef, useState } from 'react';

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

export function MagneticButton({
    children,
    className = '',
    strength = 6,
    spring = 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    ...props
}) {
    const ref = useRef(null);
    const [style, setStyle] = useState({});

    const onMouseMove = (e) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const dx = (x / rect.width) * strength;
        const dy = (y / rect.height) * strength;
        setStyle({
            transform: `translate3d(${dx}px, ${dy}px, 0)`,
            transition: `transform 120ms ${spring}`,
        });
    };

    const onMouseLeave = () => {
        setStyle({
            transform: 'translate3d(0px, 0px, 0)',
            transition: `transform 280ms ${spring}`,
        });
    };

    return (
        <button
            ref={ref}
            {...props}
            className={className}
            style={{ ...(props.style || {}), ...style }}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
        >
            {children}
        </button>
    );
}

export function useHoloTilt(strengthX = 7, strengthY = 7, translateY = -4) {
    const [vars, setVars] = useState({
        '--rx': '0deg',
        '--ry': '0deg',
        '--spot-x': '50%',
        '--spot-y': '50%',
        '--ty': '0px',
    });

    const onMouseMove = (e) => {
        const el = e.currentTarget;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const px = (x / rect.width - 0.5) * 2;
        const py = (y / rect.height - 0.5) * 2;
        const rx = clamp(py * -strengthX, -7, 7);
        const ry = clamp(px * strengthY, -7, 7);
        setVars({
            '--rx': `${rx}deg`,
            '--ry': `${ry}deg`,
            '--spot-x': `${x}px`,
            '--spot-y': `${y}px`,
            '--ty': `${translateY}px`,
        });
    };

    const onMouseLeave = () => {
        setVars({
            '--rx': '0deg',
            '--ry': '0deg',
            '--spot-x': '50%',
            '--spot-y': '50%',
            '--ty': '0px',
        });
    };

    return { vars, onMouseMove, onMouseLeave };
}
