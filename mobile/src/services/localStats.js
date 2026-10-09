import AsyncStorage from '@react-native-async-storage/async-storage';

const STATS_KEY = '@spotirid/listening_stats_v1';

function emptyStats() {
    return { totalPlays: 0, songs: {} };
}

export async function recordLocalPlay(song) {
    if (!song || song.id == null) return;
    try {
        const raw = await AsyncStorage.getItem(STATS_KEY);
        const stats = raw ? JSON.parse(raw) : emptyStats();
        const key = String(song.id);
        const prev = stats.songs[key] || {
            count: 0,
            title: song.title || 'Tanpa Judul',
            artist: song.artist || 'Artis Tidak Dikenal',
        };

        stats.songs[key] = {
            count: (prev.count || 0) + 1,
            title: song.title || prev.title,
            artist: song.artist || prev.artist,
        };
        stats.totalPlays = (stats.totalPlays || 0) + 1;

        await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (error) {
        console.debug('Gagal menyimpan statistik lokal:', error);
    }
}

export async function getLocalStats() {
    try {
        const raw = await AsyncStorage.getItem(STATS_KEY);
        const stats = raw ? JSON.parse(raw) : emptyStats();
        const songs = Object.entries(stats.songs || {}).map(([id, value]) => ({
            id,
            count: value.count || 0,
            title: value.title,
            artist: value.artist,
        }));
        const topSongs = [...songs]
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        return {
            totalPlays: stats.totalPlays || 0,
            uniqueSongs: songs.length,
            topSongs,
        };
    } catch (error) {
        console.debug('Gagal membaca statistik lokal:', error);
        return { totalPlays: 0, uniqueSongs: 0, topSongs: [] };
    }
}

export async function clearLocalStats() {
    try {
        await AsyncStorage.removeItem(STATS_KEY);
    } catch (error) {
        console.debug('Gagal menghapus statistik lokal:', error);
    }
}
