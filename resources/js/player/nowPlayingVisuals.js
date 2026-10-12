export function qualityLabel(song) {
    const raw = (song?.rawSrc || '').toLowerCase();
    if (raw.endsWith('.flac')) return 'FLAC 24-BIT LOSSLESS';
    if (raw.endsWith('.wav')) return 'WAV STUDIO MASTER';
    if (raw.endsWith('.mp3')) return 'MP3 320 KBPS MASTER';
    return 'HIGH QUALITY STREAM';
}

// Decorative turntable textures, inlined so no global CSS is required.
export const STROBE_RING_STYLE = {
    background:
        'repeating-conic-gradient(from 0deg, #33343b 0deg 2deg, #0c0e14 2deg 4deg)',
};
export const GROOVE_OVERLAY_STYLE = {
    background:
        'radial-gradient(circle, transparent 38%, rgba(0,0,0,0.45) 39%, rgba(255,255,255,0.08) 40%, transparent 41%, rgba(0,0,0,0.35) 50%, rgba(255,255,255,0.06) 51%, transparent 52%, rgba(0,0,0,0.4) 62%, rgba(255,255,255,0.09) 63%, transparent 64%, rgba(0,0,0,0.5) 75%, rgba(255,255,255,0.05) 76%, transparent 77%, rgba(0,0,0,0.8) 98%)',
};
export const SPECULAR_SHEEN_STYLE = {
    background:
        'conic-gradient(from 140deg at 50% 50%, rgba(255,255,255,0.18) 0deg, transparent 25deg, transparent 155deg, rgba(255,255,255,0.16) 180deg, transparent 205deg, transparent 335deg, rgba(255,255,255,0.18) 360deg)',
    mixBlendMode: 'screen',
};
export const GRID_BACKDROP_STYLE = {
    backgroundImage:
        'linear-gradient(to right, rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.015) 1px, transparent 1px)',
    backgroundSize: '48px 48px',
};
