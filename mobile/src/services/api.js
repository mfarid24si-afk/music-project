import { API_BASE_URL } from '../config';

export async function fetchSongsAPI() {
  try {
    const res = await fetch(`${API_BASE_URL}/music`, {
      headers: {
        'Accept': 'application/json',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn('Gagal memuat lagu dari server:', error);
    return [];
  }
}

export async function fetchPlaylistsAPI() {
  try {
    const res = await fetch(`${API_BASE_URL}/playlists`, {
      headers: {
        'Accept': 'application/json',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn('Gagal memuat playlist dari server:', error);
    return [];
  }
}

export async function recordPlayStatAPI(songId) {
  try {
    await fetch(`${API_BASE_URL}/music/play-stat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ id: songId }),
    });
  } catch (err) {
    // Non-critical, swallow error
  }
}

// Synced lyrics from lrclib.net (same as web app)
export async function fetchLyricsFromAPI(artist, title) {
  try {
    const url = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(title)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (err) {
    return null;
  }
}
