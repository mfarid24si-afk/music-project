# Audit UI — Web Player Spotirid

- **Ruang lingkup:** `resources/js/player/` (shell `App.jsx` + 18 komponen) dan token tema di `resources/css/app.css`. Mobile (`mobile/`) tidak diikutkan.
- **Metode:** pembacaan seluruh file, cek token, breakpoint responsif, a11y, dan `prefers-reduced-motion`. Tanpa mengubah kode.
- **Tujuan:** arah desain "sederhana sekaligus menarik", nyaman di mobile & PC.

---

## TL;DR

Web player-nya sudah **cukup kaya dan konsisten di beberapa tempat**, tapi punya 3 penyakit utama:

1. **Bahasa visual tidak seragam** — sebagian file pakai token tema (`PlaylistView`, `PlaylistEditModal`, `PlaylistRecommendedSongs`), mayoritas masih pakai hardcode (`text-white`, `bg-black/*`, hex, `text-[7px]`–`text-[11px]`, `transition-all`).

- **Aksesibilitas belum merata:** masih banyak `<div onClick>` yang tidak bisa diakses keyboard, tombol ikon hanya pakai `title`, dan modal tanpa `role="dialog"`/Escape/focus-trap.
- **Simpel-nya kurang, bukan kurang menarik.** Beberapa layar (terutama Now Playing) punya terlalu banyak "telemetry" dekoratif yang bersaing secara visual.

**Rekomendasi:** bukan rombak 100%. Lakukan _evolusi_: satu bahasa desain (token + skala tipografi + pola tombol/focus), lalu rapikan layar satu per satu.

---

## Temuan Global

### Token tema (sumber kebenaran)

`resources/css/app.css:10-37` — tersedia: `text-ink`, `text-ink-strong`, `text-ink-secondary`, `text-ink-dim`, `text-on-surface-variant`, `text-text-muted`, `bg-canvas`, `bg-chrome`, `bg-raised`, `bg-overlay`, `bg-inset`, `bg-chip`, `border-line`, `border-line-strong`, `bg-primary-container`, `text-on-primary-container`.

- Light mode di-remap di `app.css:240-360`. **Catatan penting:** `.text-white`, `.text-white/80|/70|/60|/40`, `.border-white/10|/15|/25`, `.hover:bg-white/5|/10`, `.hover:text-white` **sudah** di-remap untuk light mode. Jadi klaim "light mode rusak parah" itu **berlebihan** — yang benar-benar bocor: `text-white/50|/30|/90`, `bg-black*`, dan hex literal.
- Namun mengandalkan remap ini rapuh: tambah varian opasitas baru = bocor. Lebih baik pakai token langsung.

### `focus-ring` utility

`app.css:380-387`. Baru dipakai di `PlaylistView`, `PlaylistRecommendedSongs`, `PlaylistEditModal`. Sebagian besar file lain memakai `focus:outline-none` tanpa pengganti → focus keyboard tidak terlihat.

### Reduced motion

`app.css:459-466` hanya mematikan animasi kustom. `animate-spin`/`animate-pulse` Tailwind, `transition-all`, dan `scrollIntoView({behavior:'smooth'})` **tidak** dijaga.

### Inkosistensi kelas

- Gradient: `bg-linear-to-*` (v4) vs `bg-gradient-to-*` (v3) campur.
- `transition-all` (~25 tempat) vs pola benar `transition-colors duration-200 ease-out … motion-reduce:transition-none` (dipakai rapi di `PlaylistView`/`PlaylistEditModal`/`PlaylistRecommendedSongs`).
- Ukuran teks arbitrer `text-[7px]`–`text-[11px]` dipakai berat (terutama `NowPlayingView`, `SuggestSongModal`).

---

## Temuan Per-File (ringkas)

### `App.jsx`

- Root `h-screen w-screen overflow-hidden` (`:105`) → `w-screen` bisa memicu scroll horizontal; `100vh` terpotong di browser mobile (pakai `dvh`).
- Kartu playlist `div onClick` tanpa role/tabIndex (`:215`).
- `text-white` hardcoded `:156,178,190,203,255,284,323`; `text-[11px]`/`[10px]` `:258,318`; `transition-all` `:175,187,200,221,248`.

### `Sidebar.jsx`

- Brand `:76` dan kartu profil `:269` = `<div onClick>` (tidak keyboardable).
- Tombol ikon pakai `title` saja; `LuPin` tanpa `aria-hidden`.
- Hex tema ter-hardcode `:8-13` (duplikat di SettingsModal). `ring-offset-[#0d0e11]`, `text-black`, `hover:bg-white/5`.
- Skala teks `text-[9px]/[10px]/[11px]`.

### `TopNav.jsx`

- Tombol clear-search **tanpa nama aksesibel** (`:71-77`); banyak tombol `title`-only.
- Guest chip `<div onClick>` (`:144`).
- Zona kanan `flex-shrink-0` berisiko sempit di layar kecil.

### `HeroSpotlight.jsx`

- `bg-black`/`bg-black/80` hardcoded `:33,39,55`; `text-white`.
- Like button `title`-only; disc dekoratif tidak `aria-hidden`.
- `transition-all duration-700` + `animate-pulse` tidak dijaga.

### `SongGrid.jsx`

- Judul lagu `<h4 onClick>` — **clickable heading, tidak fokusabel** (`:156`). Masalah ajaib.
- Tombol overlay (queue/add/play/favorite) `title`-only; favorite = warna saja, tanpa `aria-pressed`.
- Filter chip state hanya warna.
- `sm:grid-cols-2` duplikat base; overlay `bg-black/75|/80`.

### `TracklistTable.jsx`

- **Seluruh baris `<div onClick>`** (`:37`) — tidak bisa di-keyboard.
- Tombol `title`-only; favorit color-only.
- `text-[10px]/[11px]`.

### `PlayerDock.jsx`

- **Bug:** tombol Previous mobile `className="xs:flex hidden …"` (`:142`). Breakpoint `xs` tidak ada → tombol **selalu tersembunyi** di semua layar. Pengguna mobile kehilangan kontrol Previous.
- `py-0.2` (`:99`) bukan utility valid.
- Range seek/volume tanpa nama aksesibel & tanpa focus terlihat (`:266-274, 334-345`).
- Banyak `title`-only; `transition-all`.

### `LyricsDrawer.jsx`

- Lirik `<p onClick>` — tidak fokusabel (`:79`).
- Tombol close **tanpa `aria-label`** (`:54-59`).
- Tanpa `role="dialog"`, tanpa Escape, tanpa focus trap; backdrop tanpa `aria-hidden`.
- `scrollIntoView smooth` + `animate-spin` tidak dijaga.

### `QueueDrawer.jsx`

- Baris antrean `<div draggable onClick>` — clickable + drag-only, tidak bisa keyboard (`:120`).
- Tombol remove `opacity-0 group-hover:opacity-100` → tidak terlihat via keyboard (`:148-157`).
- Close tanpa label; tanpa dialog semantics; `animate-pulse`.

### `PlayerDock`/`LyricsDrawer`/`QueueDrawer` — pola dialog

Tidak ada `role="dialog"`/`aria-modal`/Escape/focus-trap.

### `PlaylistModal.jsx`

- `w-full max-w-sm` tanpa `inset-x` → mentok layar di mobile (`:40`).
- Close tanpa label; tidak ada dialog semantics/Esc/trap.

### `SettingsModal.jsx`

- `w-full max-w-xl` tanpa inset (`:81`); tanpa dialog/esc/trap.
- Label tanpa `htmlFor`; pilihan warna & toggle switch **hanya lewat warna** (tanpa `aria-pressed`/`role="switch"`).
- THEMES duplikat; `transition-all` + `text-[11px]` banyak.

### `SuggestSongModal.jsx`

- Tanpa dialog/esc/trap; close tanpa label; tab tanpa `aria-pressed`; error tanpa `role="alert"`; label tanpa `htmlFor`.
- Emoji sebagai ikon (`:230,241,291`) dan spinner emoji.
- Input `focus:outline-none` tanpa `focus-ring`.

### `PlaylistModal.jsx` / `SettingsModal.jsx` / `SuggestSongModal.jsx`

- Modal tanpa inset horizontal → sudut membulat terpotong di HP.

### `NowPlayingView.jsx`

- **Paling ramai**: header punya 4-5 label pseudo-teknis ("PHONO STAGE DIRECT", "DECK: AETHER ORBIT MK-IV", "96.0 kHz / 24-BIT LOSSLESS", "DAC LOCKED") yang bersaing. Kandidat terbaik untuk "disederhanakan".
- Banyak `text-[7px]`–`text-[11px]`; `bg-[#161922]`; SVG tonearm pakai hex hardcoded; `bg-gradient-*` (v3).
- Baris lirik `<div onClick>` — tidak fokusabel (`:674`).
- Range seek/volume `opacity-0` tanpa focus telihat.
- `animate-pulse`/`animate-spin`/`transition-all`/smooth scroll tidak dijaga.
- **Baik:** platter vinyl sudah `role="button" tabIndex=0` + keyboard handling (`:256-284`); transport punya `aria-label`.

### `PlaylistView.jsx` / `PlaylistEditModal.jsx` / `PlaylistRecommendedSongs.jsx`

- **Referensi terbaik.** `PlaylistEditModal` punya focus trap, Escape, `role="dialog"`, `role="alert"`, `aria-pressed`, `focus-ring`, `motion-reduce`.
- Sisa minor: emoji di toast, palet amber/emerald/red hardcoded tanpa token, bare `transition`, `text-white`.

### `ToastContainer.jsx`

- **Tanpa `role="status"`/`aria-live`** → toast tidak dibacakan screen reader.
- Warna-only; tanpa `max-width`; `transition-all`.

---

## Prioritas

### P0 — bug / a11y nyata

1. `PlayerDock.jsx:142` — tombol Previous mobile tidak pernah tampil (`xs:flex` tidak ada).
2. `ToastContainer.jsx:8` — tambah `role="status"` + `aria-live="polite"`.
3. Semantik dialog untuk `SettingsModal`, `PlaylistModal`, `SuggestSongModal`, `LyricsDrawer`, `QueueDrawer` (role/aria-modal/Escape/focus-trap).
4. Klik-able `<div>`/`<h4>` → `<button>`: `App.jsx:215`, `Sidebar.jsx:76,269`, `TopNav.jsx:144`, `SongGrid.jsx:156`, `TracklistTable.jsx:37`, `LyricsDrawer.jsx:79`, `QueueDrawer.jsx:120`, `NowPlayingView.jsx:674`.
5. Visible focus: ganti `focus:outline-none` tanpa pengganti → `focus-ring` / `focus-visible:ring-*`.

### P1 — konsistensi & ketahanan tema

6. Ganti `text-white` → `text-ink-strong`/`text-ink`; `bg-black*` → token; satukan `bg-linear-to-*`.
7. Skala tipografi: hilangkan `text-[7px]/[8px]/[9px]`, minim `text-xs` (12px); samakan label meta.
8. Ganti `transition-all` → transisi spesifik + `motion-reduce:transition-none`.
9. Jaga reduced-motion untuk `animate-spin`/`animate-pulse`/smooth-scroll.

### P2 — polish

10. Modal: tambah inset horizontal (`inset-x-4 sm:inset-x-0`) agar sudut tidak terpotong di HP.
11. Ekstrak token untuk palet status (amber/emerald/red/blue) dan `THEMES` agar tidak duplikat.
12. Kurangi noise pada `NowPlayingView` (header/telemetry).

---

## Arah Desain yang Disarankan

Prinsip: **sederhana, tapi khas.**

1. **Satu bahasa** — semua layar pakai token, satu skala tipografi, satu pola tombol + `focus-ring`.
2. **Kurangi, bukan tambah** — buang label dekoratif yang bersaing; sisakan satu aksen.
3. **Turntable tetap jadi identitas** — pertahankan vinyl/tonearm sebagai ciri khas, tapi tenangkan sekitarnya.
4. **Mobile-first, desktop enhancement** — satu layout yang menaikkan kelas di `lg`.
5. **Nyaman = aksesibel** — target 44px, kontras AA, fokus terlihat, `prefers-reduced-motion` dihormati.
