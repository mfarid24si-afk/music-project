import { API_BASE_URL } from '../config';
import { durationToSeconds } from '../utils/lyrics';

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

// Robust Synced Lyrics Fetcher from LRCLIB.
//
// Pinning the track duration makes LRCLIB return the recording version whose
// timings actually match the audio we play. This is what keeps imported
// (English/other) songs from drifting without touching the local tracks that
// already matched.
export async function fetchLyricsFromAPI(artist, title, duration) {
    try {
        const rawArtist = (artist || '').trim();
        const rawTitle = (title || '').trim();
        const cleanArtist = cleanQueryTerm(rawArtist) || rawArtist;
        const cleanTitle = cleanQueryTerm(rawTitle) || rawTitle;
        const seconds = durationToSeconds(duration);

        const getJson = async (url) => {
            const res = await fetch(url, { headers: LYRICS_HEADERS });
            if (!res.ok) {
                return null;
            }
            return await res.json();
        };

        const exactUrl = (a, t) => {
            const base = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(a)}&track_name=${encodeURIComponent(t)}`;
            return seconds ? `${base}&duration=${seconds}` : base;
        };

        // 1. Exact match first (identical to the previous behaviour, so tracks
        //    that already synced perfectly are left untouched).
        const exact = await getJson(
            `https://lrclib.net/api/get?artist_name=${encodeURIComponent(cleanArtist)}&track_name=${encodeURIComponent(cleanTitle)}`,
        );
        if (exact && (exact.syncedLyrics || exact.plainLyrics)) {
            return exact;
        }

        // 2. Exact match pinned to our track length, so importing a different
        //    version still lines up with the audio we actually play.
        if (seconds) {
            const scoped = await getJson(exactUrl(cleanArtist, cleanTitle));
            if (scoped && (scoped.syncedLyrics || scoped.plainLyrics)) {
                return scoped;
            }
        }

        // 3. Raw title/artist variants.
        if (cleanArtist !== rawArtist || cleanTitle !== rawTitle) {
            const raw = await getJson(
                `https://lrclib.net/api/get?artist_name=${encodeURIComponent(rawArtist)}&track_name=${encodeURIComponent(rawTitle)}`,
            );
            if (raw && (raw.syncedLyrics || raw.plainLyrics)) {
                return raw;
            }
        }

        // 4. Search fallback, preferring a version whose length matches ours.
        const searchData = await getJson(
            `https://lrclib.net/api/search?q=${encodeURIComponent(cleanArtist + ' ' + cleanTitle)}`,
        );
        if (Array.isArray(searchData) && searchData.length > 0) {
            const synced = searchData.filter((item) => item.syncedLyrics);
            if (seconds) {
                const matched = synced.find(
                    (item) =>
                        typeof item.duration === 'number' &&
                        Math.abs(item.duration - seconds) <= 3,
                );
                if (matched) {
                    return matched;
                }
            }
            return synced[0] || searchData[0];
        }

        return null;
    } catch (err) {
        console.debug('Lyrics fetch error:', err);
        return null;
    }
}
