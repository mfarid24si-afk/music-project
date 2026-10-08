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
    return data.data || [];
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
    return data.data || [];
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
