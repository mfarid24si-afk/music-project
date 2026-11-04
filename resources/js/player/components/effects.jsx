import React from 'react';

// A headline that shimmers with an accent-coloured aurora sweep.
// Pairs with the `.aurora-text` helper in app.css. Falls back to the
// surrounding text colour when the background-clip effect is unsupported.
export function AuroraText({ children, className = '', as: Tag = 'span', ...props }) {
    return (
        <Tag className={`aurora-text ${className}`.trim()} {...props}>
            {children}
        </Tag>
    );
}

// Tracks the pointer over an element and exposes the cursor position as
// CSS custom properties consumed by the `.beam-border` helper. Setting
// them imperatively (no state) keeps the hover path allocation-free.
export function useBeamBorder() {
    const onMouseMove = (e) => {
        const el = e.currentTarget;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        el.style.setProperty('--beam-x', `${e.clientX - rect.left}px`);
        el.style.setProperty('--beam-y', `${e.clientY - rect.top}px`);
    };
    return { onMouseMove };
}

// Wraps a standalone card in the electro/spotlight border effect
// (Lightswind-style). For elements that already render their own box
// (e.g. HeroSpotlight), `useBeamBorder` + the `.beam-border` class is
// lighter-weight; use this for cards that have no other hover wiring.
export function BeamBorder({ as: Tag = 'div', children, className = '', style, ...props }) {
    const { onMouseMove } = useBeamBorder();
    return (
        <Tag
            {...props}
            onMouseMove={onMouseMove}
            className={`beam-border ${className}`.trim()}
            style={style}
        >
            {children}
        </Tag>
    );
}