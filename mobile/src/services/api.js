import { API_BASE_URL } from '../config';

const LYRICS_HEADERS = {
    'User-Agent': 'Spotirid/1.0.0 (https://farid-peminjaman.alwaysdata.net)',
    Accept: 'application/json',
};

export async function fetchSongsAPI() {
    try {
        const res = await fetch(`${API_BASE_URL}/music`, {
            headers: {
                Accept: 'application/json',
            },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return Array.isArray(data.data)
            ? data.data
            : Array.isArray(data)
              ? data
              : [];
    } catch (error) {
        console.warn('Gagal memuat lagu dari server:', error);
        return [];
    }
}

export async function fetchPlaylistsAPI() {
    try {
        const res = await fetch(`${API_BASE_URL}/playlists`, {
            headers: {
                Accept: 'application/json',
            },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return Array.isArray(data.data)
            ? data.data
            : Array.isArray(data)
              ? data
              : [];
    } catch (error) {
        console.warn('Gagal memuat playlist dari server:', error);
        return [];
    }
}

export async function publishPlaylistAPI(payload) {
    try {
        const res = await fetch(`${API_BASE_URL}/playlists`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(payload),
        });
        return await res.json();
    } catch (err) {
        return { success: false, message: err.message };
    }
}

export async function updatePlaylistAPI(playlistId, payload) {
    try {
        const res = await fetch(`${API_BASE_URL}/playlists/${playlistId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(payload),
        });
        return await res.json();
    } catch (err) {
        return { success: false, message: err.message };
    }
}

export async function deletePlaylistAPI(playlistId) {
    try {
        const res = await fetch(`${API_BASE_URL}/playlists/${playlistId}`, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
            },
        });
        return await res.json();
    } catch (err) {
        return { success: false, message: err.message };
    }
}

export async function togglePlaylistSongAPI(playlistId, songId) {
    try {
        const res = await fetch(
            `${API_BASE_URL}/playlists/${playlistId}/songs`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ song_id: Number(songId) }),
            },
        );
        return await res.json();
    } catch (err) {
        return { success: false, message: err.message };
    }
}

export async function recordPlayStatAPI(songId) {
    try {
        await fetch(`${API_BASE_URL}/music/play-stat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({ id: songId }),
        });
    } catch {
        // Non-critical, swallow error
    }
}

// Mobile Login API
export async function loginAPI(email, password) {
    try {
        const res = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
            if (res.status === 404) {
                return {
                    success: false,
                    message:
                        'Route /api/login belum ditarik (git pull) di server Alwaysdata Anda.',
                };
            }
            const data = await res.json().catch(() => null);
            return {
                success: false,
                message: data?.message || `Login gagal (Status ${res.status}).`,
            };
        }
        return await res.json();
    } catch (err) {
        return {
            success: false,
            message: 'Gagal terhubung ke server login: ' + err.message,
        };
    }
}

// Mobile Logout API
export async function logoutAPI() {
    try {
        const res = await fetch(`${API_BASE_URL}/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        });
        return await res.json();
    } catch {
        return { success: true };
    }
}

// Clean title/artist strings for maximum LRCLIB match rate
function cleanQueryTerm(str) {
    if (!str) return '';
    return str
        .replace(
            /\s*[([](feat|ft|with|remix|single|version|official|video)[.\s][^)\]]+[)\]]/gi,
            '',
        )
        .replace(/\s*[([].*?[)\]]/g, '')
        .trim();
}

// Robust Synced Lyrics Fetcher from LRCLIB
export async function fetchLyricsFromAPI(artist, title) {
    try {
        const rawArtist = (artist || '').trim();
        const rawTitle = (title || '').trim();
        const cleanArtist = cleanQueryTerm(rawArtist) || rawArtist;
        const cleanTitle = cleanQueryTerm(rawTitle) || rawTitle;

        // 1. Try exact match with cleaned title & artist
        const exactUrl = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(cleanArtist)}&track_name=${encodeURIComponent(cleanTitle)}`;
        const res = await fetch(exactUrl, { headers: LYRICS_HEADERS });
        if (res.ok) {
            const data = await res.json();
            if (data && (data.syncedLyrics || data.plainLyrics)) {
                return data;
            }
        }

        // 2. Try raw title & artist if cleaned was different
        if (cleanArtist !== rawArtist || cleanTitle !== rawTitle) {
            const rawUrl = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(rawArtist)}&track_name=${encodeURIComponent(rawTitle)}`;
            const rawRes = await fetch(rawUrl, { headers: LYRICS_HEADERS });
            if (rawRes.ok) {
                const rawData = await rawRes.json();
                if (rawData && (rawData.syncedLyrics || rawData.plainLyrics)) {
                    return rawData;
                }
            }
        }

        // 3. Fallback: Search endpoint (returns array of matching tracks)
        const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(cleanArtist + ' ' + cleanTitle)}`;
        const searchRes = await fetch(searchUrl, { headers: LYRICS_HEADERS });
        if (searchRes.ok) {
            const searchData = await searchRes.json();
            if (Array.isArray(searchData) && searchData.length > 0) {
                const withSync = searchData.find((item) => item.syncedLyrics);
                return withSync || searchData[0];
            }
        }

        return null;
    } catch (err) {
        console.debug('Lyrics fetch error:', err);
        return null;
    }
}
