export const STORAGE_KEYS = {
    PLAYLISTS: 'spotify_ultra_playlists',
    FAVORITES: 'spotify_ultra_favorites',
    QUEUE: 'spotify_ultra_queue',
    VOLUME: 'spotify_ultra_volume',
    THEME: 'spotify_ultra_theme',
    RECENTLY_PLAYED: 'spotify_ultra_recently_played',
    COLOR_MODE: 'spotify_ultra_color_mode',
    PROFILE_NAME: 'spotify_ultra_profile_name',
    AUTOPLAY: 'spotify_ultra_autoplay',
    KEEP_AWAKE: 'spotify_ultra_keep_awake',
};

export const DEFAULT_COVER =
    'data:image/svg+xml,' +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">' +
            '<rect width="200" height="200" fill="#282828"/>' +
            '<text x="100" y="110" text-anchor="middle" fill="#727272" font-size="60">🎵</text>' +
            '</svg>',
    );

export function extractYouTubeId(urlOrStr) {
    if (!urlOrStr) return null;
    const str = String(urlOrStr).trim();
    if (str.startsWith('youtube:')) return str.replace('youtube:', '');
    const match = str.match(
        /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/,
    );
    return match ? match[1] : null;
}

export function isDirectAudioSource(urlOrStr) {
    if (!urlOrStr) return false;
    const str = String(urlOrStr).trim();
    if (str.startsWith('youtube:')) return false;
    if (/youtu\.be|youtube\.com/i.test(str)) return false;
    return (
        str.startsWith('http://') ||
        str.startsWith('https://') ||
        str.startsWith('/') ||
        str.startsWith('assets/') ||
        str.startsWith('data:audio')
    );
}
