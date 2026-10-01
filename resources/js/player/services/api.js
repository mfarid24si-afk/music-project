// API Service connecting to Laravel endpoints

export function getAppBaseUrl() {
  if (typeof document !== 'undefined') {
    const meta = document.querySelector('meta[name="app-url"]');
    if (meta && meta.content) {
      return meta.content.endsWith('/') ? meta.content : meta.content + '/';
    }
  }
  if (typeof window !== 'undefined') {
    return window.location.origin + '/';
  }
  return '/';
}

export function getAssetBaseUrl() {
  if (typeof document !== 'undefined') {
    const meta = document.querySelector('meta[name="asset-url"]');
    if (meta && meta.content) {
      return meta.content.endsWith('/') ? meta.content : meta.content + '/';
    }
  }
  return getAppBaseUrl();
}

export const API_BASE = (function() {
  if (typeof document !== 'undefined') {
    const meta = document.querySelector('meta[name="app-url"]');
    if (meta && meta.content) {
      const b = meta.content.endsWith('/') ? meta.content : meta.content + '/';
      return `${b}api`;
    }
  }
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api`;
  }
  return '/api';
})();

export function resolveAssetUrl(url) {
  if (!url) return '';
  if (url.startsWith('data:')) return url;

  // If backend returned http://localhost/... but the user is browsing on a live server (e.g. alwaysdata.net)
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    if (url.includes('://localhost') || url.includes('://127.0.0.1')) {
      try {
        const u = new URL(url);
        const cleanPath = u.pathname.replace(/^\/(Spotirid\/|Spotify\/|music\/)?/i, '').replace(/^\/?assets\//, 'assets/');
        return `${getAssetBaseUrl()}${cleanPath}`;
      } catch (e) {
        // ignore parse error
      }
    }
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
  const base = getAssetBaseUrl();
  return `${base}${cleanUrl}`;
}
export const FALLBACK_SONGS = [
  {
    id: '1',
    title: 'Believer',
    artist: 'Imagine Dragons',
    album: 'Evolve',
    genre: 'Rock',
    duration: '3:24',
    description: 'Driving percussion, explosive arena-rock dynamics, and raw lyrical urgency.',
    img: resolveAssetUrl('assets/covers/believer.jpg'),
    src: resolveAssetUrl('assets/music/believer.mp4'),
    rawSrc: 'assets/music/believer.mp4',
    youtubeUrl: 'https://www.youtube.com/watch?v=7wtfhZwyrcc',
    playCount: 124,
  },
  {
    id: '4',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    album: '÷ (Divide)',
    genre: 'Pop',
    duration: '3:54',
    description: 'Infectious pop rhythms with marimba-infused beats and vocal hooks.',
    img: resolveAssetUrl('assets/covers/shape-of-you.jpg'),
    src: resolveAssetUrl('assets/music/shape.mp4'),
    rawSrc: 'assets/music/shape.mp4',
    youtubeUrl: 'https://www.youtube.com/watch?v=JGwWNGJdvx8',
    playCount: 98,
  },
  {
    id: '5',
    title: 'Shape Of My Heart',
    artist: 'Backstreet Boys',
    album: 'Black & Blue',
    genre: 'Pop',
    duration: '4:23',
    description: 'Classic late-90s vocal harmony pop ballad with lush acoustic textures.',
    img: resolveAssetUrl('assets/covers/shape-of-my-heart.jpg'),
    src: resolveAssetUrl('assets/music/of my heart.mp4'),
    rawSrc: 'assets/music/of my heart.mp4',
    youtubeUrl: 'https://www.youtube.com/watch?v=OT5msu-dap8',
    playCount: 76,
  },
  {
    id: '6',
    title: 'Miss You',
    artist: 'Alex Si Alan',
    album: 'Acoustic Sessions',
    genre: 'Pop',
    duration: '3:45',
    description: 'Intimate acoustic arrangement with emotive vocal delivery.',
    img: resolveAssetUrl('assets/covers/i-miss-you.png'),
    src: resolveAssetUrl('assets/music/I Miss You.mp4'),
    rawSrc: 'assets/music/I Miss You.mp4',
    youtubeUrl: '',
    playCount: 42,
  },
  {
    id: '7',
    title: 'Jodoh Pasti Bertemu',
    artist: 'Afgan',
    album: 'L1ve to Love',
    genre: 'Pop',
    duration: '3:51',
    description: 'Soulful Indonesian pop ballad with sweeping orchestration.',
    img: resolveAssetUrl('assets/covers/bertemu.jpg'),
    src: resolveAssetUrl('assets/music/Jodoh Pasti Bertemu.mp3'),
    rawSrc: 'assets/music/Jodoh Pasti Bertemu.mp3',
    youtubeUrl: '',
    playCount: 55,
  }
];

export async function fetchSongsFromAPI(searchTerm = '') {
  try {
    const isSearch = searchTerm && searchTerm.trim().length > 0;
    const url = `${API_BASE}/music?limit=100${isSearch ? `&search=${encodeURIComponent(searchTerm.trim())}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.data) && data.data.length > 0) {
      return data.data.map(s => ({
        id: String(s.id),
        title: s.title,
        artist: s.artist,
        album: s.album || '',
        genre: s.genre || '',
        description: s.description || '',
        img: resolveAssetUrl(s.cover_image ? (s.cover_image.startsWith('http') ? s.cover_image : `assets/covers/${s.cover_image.replace(/^assets\/covers\//, '')}`) : s.img),
        src: resolveAssetUrl(s.audio_file ? (s.audio_file.startsWith('http') ? s.audio_file : `assets/music/${s.audio_file.replace(/^assets\/music\//, '')}`) : s.src),
        rawSrc: s.audio_file || s.src,
        duration: s.duration || '',
        youtubeUrl: s.youtube_url || '',
        playCount: s.play_count || 0,
        createdAt: s.created_at,
      }));
    }
    return FALLBACK_SONGS;
  } catch (err) {
    console.warn('API fetch failed, falling back to local songs:', err);
    return FALLBACK_SONGS;
  }
}

export async function sendPlayStat(songId) {
  try {
    const res = await fetch(`${API_BASE}/music/play-stat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: Number(songId) }),
    });
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function uploadSongToAPI(formData) {
  try {
    const res = await fetch(`${API_BASE}/music`, {
      method: 'POST',
      body: formData,
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function deleteSongFromAPI(songId) {
  try {
    const res = await fetch(`${API_BASE}/music/${songId}`, {
      method: 'DELETE',
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function fetchLyricsFromAPI(artist, title) {
  try {
    const url = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(title)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Not found');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchCommunityPlaylists() {
  try {
    const res = await fetch(`${API_BASE}/playlists`);
    if (!res.ok) return [];
    const json = await res.json();
    return json.success && Array.isArray(json.data) ? json.data : [];
  } catch (err) {
    return [];
  }
}

export async function publishPlaylistAPI(payload) {
  try {
    const res = await fetch(`${API_BASE}/playlists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function updatePlaylistAPI(id, payload) {
  try {
    const res = await fetch(`${API_BASE}/playlists/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function deleteCommunityPlaylistAPI(id) {
  try {
    const res = await fetch(`${API_BASE}/playlists/${id}`, {
      method: 'DELETE',
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function togglePlaylistSongAPI(playlistId, songId) {
  try {
    const res = await fetch(`${API_BASE}/playlists/${playlistId}/songs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ song_id: Number(songId) }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
}
