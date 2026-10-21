// Asset-path audit: checks referenced covers/music paths in source against
// real files in public/ with exact case (Linux case-sensitivity).
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');

function existsExact(relPath) {
    relPath = relPath.replace(/^\//, '');
    let current = PUBLIC;
    for (const segment of relPath.split('/')) {
        if (!segment) continue;
        let entries;
        try { entries = fs.readdirSync(current); } catch { return { ok: false, reason: 'unreachable' }; }
        if (!entries.includes(segment)) {
            const lower = entries.find((e) => e.toLowerCase() === segment.toLowerCase());
            return lower ? { ok: false, reason: 'CASE->' + lower } : { ok: false, reason: 'MISSING' };
        }
        current = path.join(current, segment);
    }
    return { ok: true };
}

const filesOnly = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true })
        .filter((e) => e.isFile() && e.name.endsWith('.php'))
        .map((e) => path.relative(ROOT, path.join(dir, e.name)));

const scanFiles = [
    'resources/js/player/services/api.js',
    ...filesOnly(path.join(ROOT, 'database', 'seeders')),
    ...filesOnly(path.join(ROOT, 'app', 'Http', 'Controllers')),
];

const assetRe = /['"`](\/?assets\/(?:covers|music|image)\/[^'"`]+)['"`]/g;
const missing = [];
let checked = 0;

for (const rel of scanFiles) {
    const full = path.join(ROOT, rel);
    if (!fs.existsSync(full)) continue;
    const code = fs.readFileSync(full, 'utf8');
    let m;
    while ((m = assetRe.exec(code)) !== null) {
        checked++;
        const res = existsExact(m[1]);
        if (!res.ok) missing.push(`${rel} -> ${m[1]} (${res.reason})`);
    }
}

if (missing.length === 0) {
    console.log(`ASSET_OK ${checked} asset references verified against public/ with exact casing.`);
} else {
    console.log(`ASSET_ISSUES ${missing.length}`);
    for (const x of missing) console.log('  ' + x);
}
