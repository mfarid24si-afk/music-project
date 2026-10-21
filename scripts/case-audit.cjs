// Case-sensitivity audit: verifies every relative import in resources/js
// resolves to an EXACT-case path on disk (Linux/Vercel is case-sensitive).
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'resources', 'js');

function walk(dir, out = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full, out);
        else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) out.push(full);
    }
    return out;
}

function caseExact(absolutePath) {
    // Walk each segment and confirm the exact casing exists on disk.
    let rel = path.relative(ROOT, absolutePath);
    let current = ROOT;
    for (const segment of rel.split(path.sep)) {
        const entries = fs.readdirSync(current);
        if (!entries.includes(segment)) {
            const lower = entries.find((e) => e.toLowerCase() === segment.toLowerCase());
            if (lower) return { ok: false, actual: lower };
            return { ok: false, actual: null };
        }
        current = path.join(current, segment);
    }
    return { ok: true };
}

const files = walk(SRC);
const importRe = /(?:^|\n)\s*import\s+(?:[^'"]*?from\s+)?['"](\.{1,2}\/[^'"]+)['"]/g;
const issues = [];

for (const file of files) {
    const code = fs.readFileSync(file, 'utf8');
    let m;
    while ((m = importRe.exec(code)) !== null) {
        const spec = m[1];
        const base = path.resolve(path.dirname(file), spec);
        const candidates = [
            base,
            base + '.js', base + '.jsx', base + '.ts', base + '.tsx',
            path.join(base, 'index.js'), path.join(base, 'index.jsx'),
            path.join(base, 'index.ts'), path.join(base, 'index.tsx'),
        ];
        let resolved = null;
        for (const c of candidates) {
            if (fs.existsSync(c)) { resolved = c; break; }
        }
        if (!resolved) {
            issues.push(`${path.relative(ROOT, file)} -> ${spec} : MISSING`);
            continue;
        }
        const check = caseExact(resolved);
        if (!check.ok) {
            issues.push(
                `${path.relative(ROOT, file)} -> ${spec} : CASE MISMATCH (disk: ${check.actual})`,
            );
        }
    }
}

if (issues.length === 0) {
    console.log(`CASE_OK ${files.length} files scanned, all relative imports match disk casing exactly.`);
} else {
    console.log(`CASE_ISSUES ${issues.length}`);
    for (const i of issues) console.log('  ' + i);
}
