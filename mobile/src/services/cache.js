import { Directory, Paths } from 'expo-file-system';

export function formatBytes(bytes) {
    if (!bytes || bytes <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const exponent = Math.min(
        Math.floor(Math.log(bytes) / Math.log(1024)),
        units.length - 1,
    );
    const value = bytes / Math.pow(1024, exponent);
    return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

export function getCacheSizeBytes() {
    try {
        const cacheDir = new Directory(Paths.cache);
        return typeof cacheDir.size === 'number' ? cacheDir.size : 0;
    } catch (error) {
        console.debug('Gagal membaca ukuran cache:', error);
        return 0;
    }
}

export async function clearAppCache() {
    try {
        const cacheDir = new Directory(Paths.cache);
        if (!cacheDir.exists) return;
        const entries = cacheDir.list();
        for (const entry of entries) {
            try {
                entry.delete();
            } catch (error) {
                console.debug('Gagal menghapus item cache:', error);
            }
        }
    } catch (error) {
        console.debug('Gagal membersihkan cache:', error);
    }
}
