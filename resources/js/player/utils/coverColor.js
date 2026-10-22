/**
 * Extract a dominant colour from an image URL and apply it as
 * CSS custom properties on the document root. The algorithm is
 * intentionally simple (sampled pixels) so it runs in the main
 * thread without pulling in external dependencies.
 */

function hexToRgb(hex) {
    let h = hex.replace('#', '');
    if (h.length === 3) {
        h = h
            .split('')
            .map((c) => c + c)
            .join('');
    }
    const num = parseInt(h, 16);
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255,
    };
}

function rgbToHex(r, g, b) {
    const toHex = (v) => {
        const clamped = Math.max(0, Math.min(255, Math.round(v)));
        return clamped.toString(16).padStart(2, '0');
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function relativeLuminance({ r, g, b }) {
    const toLinear = (c) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    const R = toLinear(r);
    const G = toLinear(g);
    const B = toLinear(b);
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastRatio(a, b) {
    const l1 = relativeLuminance(a);
    const l2 = relativeLuminance(b);
    const [bright, dark] = l1 > l2 ? [l1, l2] : [l2, l1];
    return (bright + 0.05) / (dark + 0.05);
}

/**
 * Pick the "best" swatch: prefer saturated colours that stand out
 * against black, and fall back to the accent if nothing usable is
 * found.
 */
export function pickCoverAccent(pixels) {
    if (!pixels || pixels.length === 0) {
        return null;
    }

    const seen = new Map();
    let best = null;
    let bestScore = -1;

    for (let i = 0; i < pixels.length; i += 16) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3] ?? 255;
        if (a < 128) continue;
        // Skip near-greys and near-black/white
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const sat = max === 0 ? 0 : (max - min) / max;
        const lightness = (max + min) / 510;
        if (sat < 0.18) continue;
        if (lightness < 0.08 || lightness > 0.92) continue;

        const key = `${Math.round(r / 16)},${Math.round(g / 16)},${Math.round(b / 16)}`;
        seen.set(key, (seen.get(key) || 0) + 1);
    }

    for (const [key, count] of seen) {
        const [kr, kg, kb] = key.split(',').map((v) => parseInt(v, 10) * 16);
        const rgb = { r: kr, g: kg, b: kb };
        const sat = Math.max(kr, kg, kb) === 0 ? 0 : (Math.max(kr, kg, kb) - Math.min(kr, kg, kb)) / Math.max(kr, kg, kb);
        const score = count * (0.6 + sat);
        if (score > bestScore) {
            bestScore = score;
            best = rgb;
        }
    }

    if (!best) {
        return null;
    }

    // Ensure the accent has enough contrast against white text for the
    // glow/shadow to look intentional without going unreadable.
    const white = { r: 255, g: 255, b: 255 };
    const ratio = contrastRatio(best, white);
    let { r, g, b } = best;
    if (ratio < 3.0) {
        // Boost saturation/lightness slightly
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;
        if (delta < 10) {
            // Push away from grey
            if (r >= g && r >= b) r = Math.min(255, r + 24);
            else if (g >= r && g >= b) g = Math.min(255, g + 24);
            else b = Math.min(255, b + 24);
        } else {
            // Increase value a little
            r = Math.min(255, r + 12);
            g = Math.min(255, g + 12);
            b = Math.min(255, b + 12);
        }
    }

    return rgbToHex(r, g, b);
}

export function applyCoverAccent(imgElement) {
    if (typeof document === 'undefined' || !imgElement) return;

    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        // Downsample for speed
        const size = 48;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(imgElement, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;
        const accent = pickCoverAccent(data);
        if (!accent) {
            return;
        }

        const root = document.documentElement;
        root.style.setProperty('--cover-accent', accent);

        // Derive a cover-specific glow that does NOT stomp the
        // user-chosen theme accent (`--accent-color` stays with
        // the CSS theme selectors).
        root.style.setProperty('--cover-glow', `color-mix(in oklab, ${accent} 55%, transparent)`);
    } catch (e) {
        // CORS or tainted canvas - fall back to CSS default
    }
}

export function clearCoverAccent() {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.style.removeProperty('--cover-accent');
    root.style.removeProperty('--cover-glow');
}
