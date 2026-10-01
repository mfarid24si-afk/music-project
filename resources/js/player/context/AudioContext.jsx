import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  fetchSongsFromAPI, sendPlayStat, resolveAssetUrl, FALLBACK_SONGS,
  fetchCommunityPlaylists, publishPlaylistAPI, deleteCommunityPlaylistAPI,
  updatePlaylistAPI, togglePlaylistSongAPI
} from '../services/api';

const AudioContext = createContext(null);

const STORAGE_KEYS = {
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

const DEFAULT_COVER = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">' +
  '<rect width="200" height="200" fill="#282828"/>' +
  '<text x="100" y="110" text-anchor="middle" fill="#727272" font-size="60">🎵</text>' +
  '</svg>'
);

export function AudioProvider({ children }) {
  const audioRef = useRef(null);
  if (!audioRef.current && typeof Audio !== 'undefined') {
    const a = new Audio();
    a.playsInline = true;
    a.setAttribute('playsinline', 'true');
    a.setAttribute('webkit-playsinline', 'true');
    a.preload = 'auto';
    audioRef.current = a;
  }
  const [songs, setSongs] = useState(FALLBACK_SONGS);
  const [currentSong, setCurrentSong] = useState(FALLBACK_SONGS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => {
    const v = localStorage.getItem(STORAGE_KEYS.VOLUME);
    return v !== null ? parseFloat(v) : 0.8;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'all', 'one'
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEYS.THEME) || 'default');
  const [colorMode, setColorMode] = useState(() => localStorage.getItem(STORAGE_KEYS.COLOR_MODE) || 'dark');
  const [profileName, setProfileName] = useState(() => localStorage.getItem(STORAGE_KEYS.PROFILE_NAME) || 'Listener');
  const [autoplay, setAutoplay] = useState(() => {
    const val = localStorage.getItem(STORAGE_KEYS.AUTOPLAY);
    return val !== null ? val === 'true' : true;
  });
  const [keepAwake, setKeepAwake] = useState(() => {
    const val = localStorage.getItem(STORAGE_KEYS.KEEP_AWAKE);
    return val !== null ? val === 'true' : true;
  });
  const [toasts, setToasts] = useState([]);
  // Queue & Playlists
  const [queue, setQueue] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.QUEUE)) || []; } catch { return []; }
  });
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || []; } catch { return []; }
  });
  const [playlists, setPlaylists] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.PLAYLISTS)) || []; } catch { return []; }
  });
  const [recentlyPlayed, setRecentlyPlayed] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENTLY_PLAYED)) || []; } catch { return []; }
  });

  // Track play count tracker flag
  const playStatRecordedRef = useRef(false);
  // Ensure audio element is appended to DOM for rock-solid mobile & background lifecycle
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && typeof document !== 'undefined') {
      audio.playsInline = true;
      audio.setAttribute('playsinline', 'true');
      audio.setAttribute('webkit-playsinline', 'true');
      audio.preload = 'auto';
      audio.style.display = 'none';
      if (!audio.parentNode) {
        document.body.appendChild(audio);
      }
    }
    return () => {
      if (audio && audio.parentNode) {
        audio.parentNode.removeChild(audio);
      }
    };
  }, []);

  // Toast Notification helper
  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 4);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2800);
  };

  // Color Mode (Dark / Light / Auto System)
  useEffect(() => {
    function applyColorMode(mode) {
      let isDark = true;
      if (mode === 'light') {
        isDark = false;
      } else if (mode === 'system') {
        isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        document.documentElement.setAttribute('data-color-mode', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        document.documentElement.setAttribute('data-color-mode', 'light');
      }
    }

    applyColorMode(colorMode);
    localStorage.setItem(STORAGE_KEYS.COLOR_MODE, colorMode);

    if (colorMode === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyColorMode('system');
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
  }, [colorMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE_NAME, profileName);
  }, [profileName]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUTOPLAY, String(autoplay));
  }, [autoplay]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.KEEP_AWAKE, String(keepAwake));
  }, [keepAwake]);

  // Theme application
  useEffect(() => {
    if (theme === 'default') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);
  // Initial song & community playlist fetch from API
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [data, communityPls] = await Promise.all([
          fetchSongsFromAPI(),
          fetchCommunityPlaylists(),
        ]);

        if (data && data.length > 0) {
          setSongs(data);
          if (!currentSong) {
            setCurrentSong(data[0]);
          }
        }

        if (communityPls && communityPls.length > 0) {
          setPlaylists(localPls => {
            const map = new Map();
            for (const cp of communityPls) {
              const isApproved = cp.status === 'approved' || (cp.is_public && !cp.status);
              map.set(cp.id, {
                ...cp,
                status: cp.status || (isApproved ? 'approved' : 'pending'),
                isLocked: !isApproved,
                isCommunity: true,
              });
            }
            for (const lp of localPls) {
              const serverMatch = map.get(lp.id);
              if (serverMatch) {
                map.set(lp.id, { ...lp, ...serverMatch });
              } else {
                map.set(lp.id, {
                  ...lp,
                  status: lp.status || 'pending',
                  isLocked: lp.status !== 'approved',
                });
              }
            }
            return Array.from(map.values());
          });
        }
      } catch (e) {
        console.warn('Initial data load error:', e);
      }
    }
    loadInitialData();
  }, []);

  // Real-time synchronization across browser tabs & on page focus
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEYS.PLAYLISTS && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          if (Array.isArray(updated)) {
            setPlaylists(updated);
          }
        } catch (err) {}
      }
      if (e.key === STORAGE_KEYS.FAVORITES && e.newValue) {
        try {
          const updatedFavs = JSON.parse(e.newValue);
          if (Array.isArray(updatedFavs)) {
            setFavorites(updatedFavs);
          }
        } catch (err) {}
      }
    };

    const handleWindowFocus = async () => {
      try {
        const communityPls = await fetchCommunityPlaylists();
        if (communityPls && communityPls.length > 0) {
          setPlaylists(localPls => {
            const map = new Map();
            for (const cp of communityPls) {
              map.set(String(cp.id), { ...cp, id: String(cp.id), isCommunity: true });
            }
            for (const lp of localPls) {
              if (!map.has(String(lp.id))) {
                map.set(String(lp.id), lp);
              }
            }
            return Array.from(map.values());
          });
        }
      } catch (err) {}
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleWindowFocus);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(queue));
  }, [queue]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VOLUME, String(volume));
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Audio Event Listeners
  useEffect(() => {
    const audio = audioRef.current;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
      // Auto increment play count after 15 seconds continuous listening
      if (!playStatRecordedRef.current && audio.currentTime >= 15 && currentSong) {
        playStatRecordedRef.current = true;
        sendPlayStat(currentSong.id);
      }
    };
    const onEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        const p = audio.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      } else if (autoplay) {
        handleNextSong(true);
      }
    };
    const onError = (err) => {
      console.warn('Audio playback error:', err);
      setIsPlaying(false);
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [currentSong, repeatMode, queue, songs, isShuffle, autoplay]);

  // Media Session API Sync (Desktop & Mobile Lockscreen Widget)
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentSong) return;
    try {
      const rawCover = currentSong.img || DEFAULT_COVER;
      const coverUrl = (typeof window !== 'undefined' && !rawCover.startsWith('http') && !rawCover.startsWith('data:'))
        ? new URL(rawCover, window.location.href).href
        : rawCover;

      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artist,
        album: currentSong.album || 'Spotirid',
        artwork: [
          { src: coverUrl, sizes: '96x96', type: 'image/jpeg' },
          { src: coverUrl, sizes: '128x128', type: 'image/jpeg' },
          { src: coverUrl, sizes: '256x256', type: 'image/jpeg' },
          { src: coverUrl, sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => handleTogglePlay());
      navigator.mediaSession.setActionHandler('pause', () => handleTogglePlay());
      navigator.mediaSession.setActionHandler('previoustrack', () => handlePrevSong());
      navigator.mediaSession.setActionHandler('nexttrack', () => handleNextSong());
      navigator.mediaSession.setActionHandler('stop', () => {
        const audio = audioRef.current;
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined && !isNaN(details.seekTime)) {
          seekTo(details.seekTime);
        }
      });
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const skip = details.seekOffset || 5;
        seekTo(Math.max(0, (audioRef.current?.currentTime || 0) - skip));
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const skip = details.seekOffset || 5;
        seekTo(Math.min(audioRef.current?.duration || 0, (audioRef.current?.currentTime || 0) + skip));
      });
    } catch (e) {
      console.debug('MediaSession error:', e);
    }
  }, [currentSong]);

  // Keep MediaSession Playback State synchronized with audio state
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    } catch (e) {}
  }, [isPlaying]);

  // Keep MediaSession Position State synchronized for mobile lockscreen progress bar
  useEffect(() => {
    if (!('mediaSession' in navigator) || typeof navigator.mediaSession.setPositionState !== 'function') return;
    if (!duration || isNaN(duration) || duration <= 0) return;
    try {
      navigator.mediaSession.setPositionState({
        duration: Math.max(0, duration),
        playbackRate: 1,
        position: Math.min(Math.max(0, currentTime), duration),
      });
    } catch (e) {}
  }, [currentTime, duration]);

  // Screen Wake Lock API: Keep screen awake while playing in foreground
  const wakeLockRef = useRef(null);
  useEffect(() => {
    let isSubscribed = true;

    async function requestLock() {
      if (!('wakeLock' in navigator) || !isSubscribed) return;
      if (isPlaying && document.visibilityState === 'visible') {
        try {
          if (!wakeLockRef.current) {
            wakeLockRef.current = await navigator.wakeLock.request('screen');
            wakeLockRef.current.addEventListener('release', () => {
              wakeLockRef.current = null;
            });
          }
        } catch (err) {
          console.debug('Screen WakeLock request:', err.message);
        }
      } else {
        if (wakeLockRef.current) {
          wakeLockRef.current.release().catch(() => {});
          wakeLockRef.current = null;
        }
      }
    }

    requestLock();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && isPlaying) {
        requestLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      isSubscribed = false;
      document.removeEventListener('visibilitychange', handleVisibility);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [isPlaying]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (e.shiftKey) {
          handlePrevSong();
        } else {
          seekTo(Math.max(0, audioRef.current.currentTime - 5));
          showToast('⏪ -5s', 'info');
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (e.shiftKey) {
          handleNextSong();
        } else {
          seekTo(Math.min(audioRef.current.duration || 0, audioRef.current.currentTime + 5));
          showToast('⏩ +5s', 'info');
        }
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        setVolume(v => {
          const nv = Math.min(1, Math.round((v + 0.05) * 100) / 100);
          showToast(`🔊 ${Math.round(nv * 100)}%`, 'info');
          return nv;
        });
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setVolume(v => {
          const nv = Math.max(0, Math.round((v - 0.05) * 100) / 100);
          showToast(`🔉 ${Math.round(nv * 100)}%`, 'info');
          return nv;
        });
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        setIsMuted(m => {
          showToast(!m ? '🔇 Muted' : '🔊 Unmuted', 'info');
          return !m;
        });
      } else if (e.code === 'KeyL') {
        e.preventDefault();
        if (currentSong) toggleFavorite(currentSong.id);
      } else if (e.code === 'KeyS') {
        e.preventDefault();
        toggleShuffle();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        cycleRepeat();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSong]);

  // Audio Actions
  const playSong = (song) => {
    if (!song) return;
    const audio = audioRef.current;
    playStatRecordedRef.current = false;
    setCurrentSong(song);

    audio.playsInline = true;
    audio.setAttribute('playsinline', 'true');
    audio.setAttribute('webkit-playsinline', 'true');
    audio.src = song.src;
    audio.load();

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.warn('Playback error or user gesture needed:', err);
      });
    }

    // Add to recently played
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(id => id !== song.id);
      const updated = [song.id, ...filtered].slice(0, 25);
      localStorage.setItem(STORAGE_KEYS.RECENTLY_PLAYED, JSON.stringify(updated));
      return updated;
    });
  };

  const handleTogglePlay = () => {
    const audio = audioRef.current;
    if (!currentSong && songs.length > 0) {
      playSong(songs[0]);
      return;
    }
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  };

  const handleNextSong = (fromAutoEnd = false) => {
    // 1. If queue has items, play next in queue
    if (queue.length > 0) {
      const nextId = queue[0];
      const nextSongInQueue = songs.find(s => s.id === nextId);
      setQueue(prev => prev.slice(1));
      if (nextSongInQueue) {
        playSong(nextSongInQueue);
        return;
      }
    }

    if (songs.length === 0) return;
    const currentIdx = songs.findIndex(s => s.id === currentSong?.id);
    let nextIdx = 0;

    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * songs.length);
    } else {
      nextIdx = (currentIdx + 1) % songs.length;
    }

    if (fromAutoEnd && repeatMode === 'off' && currentIdx === songs.length - 1) {
      // Reached end of playlist with repeat off
      return;
    }

    playSong(songs[nextIdx]);
  };

  const handlePrevSong = () => {
    const audio = audioRef.current;
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    if (songs.length === 0) return;
    const currentIdx = songs.findIndex(s => s.id === currentSong?.id);
    let prevIdx = 0;
    if (isShuffle) {
      prevIdx = Math.floor(Math.random() * songs.length);
    } else {
      prevIdx = (currentIdx - 1 + songs.length) % songs.length;
    }
    playSong(songs[prevIdx]);
  };

  const seekTo = (seconds) => {
    const audio = audioRef.current;
    if (audio && !isNaN(seconds)) {
      audio.currentTime = Math.max(0, Math.min(seconds, audio.duration || 0));
      setCurrentTime(audio.currentTime);
    }
  };

  const toggleShuffle = () => {
    setIsShuffle(s => {
      showToast(!s ? '🔀 Shuffle: ON' : '➡️ Shuffle: OFF', 'info');
      return !s;
    });
  };

  const cycleRepeat = () => {
    setRepeatMode(m => {
      if (m === 'off') { showToast('🔁 Repeat: ALL', 'info'); return 'all'; }
      if (m === 'all') { showToast('🔂 Repeat: ONE', 'info'); return 'one'; }
      showToast('➡️ Repeat: OFF', 'info'); return 'off';
    });
  };

  const toggleFavorite = (songId) => {
    setFavorites(prev => {
      const exists = prev.includes(songId);
      const updated = exists ? prev.filter(id => id !== songId) : [...prev, songId];
      const s = songs.find(x => x.id === songId);
      showToast(exists ? `Unliked "${s?.title || 'Song'}"` : `❤️ Liked "${s?.title || 'Song'}"`, exists ? 'info' : 'success');
      return updated;
    });
  };

  // Queue management
  const addToQueue = (songId) => {
    setQueue(prev => [...prev, songId]);
    const s = songs.find(x => x.id === songId);
    showToast(`Added "${s?.title || 'Song'}" to Queue`, 'success');
  };

  const removeFromQueue = (songId) => {
    setQueue(prev => prev.filter(id => id !== songId));
  };

  const reorderQueue = (fromIndex, toIndex) => {
    setQueue(prev => {
      const copy = [...prev];
      const [item] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, item);
      return copy;
    });
  };

  // Playlist management
  // Centralized Database Playlist management
  const createPlaylist = async (name, description = '', emoji = '🎧', gradient = 'default', customCover = null) => {
    const trimmed = (name || '').trim();
    if (!trimmed) return null;
    const tempId = `pl_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const uploader = (typeof localStorage !== 'undefined' ? localStorage.getItem('spotify_ultra_profile_name') : 'Admin') || 'Admin';

    const newPl = {
      id: tempId,
      name: trimmed,
      description: description.trim(),
      emoji: emoji || '🎧',
      gradient: gradient || 'default',
      customCover: customCover || null,
      creator_name: uploader,
      status: 'pending',
      is_public: false,
      isLocked: true,
      isPinned: false,
      isCommunity: true,
      songs: [],
      createdAt: new Date().toISOString()
    };

    // Optimistic local update
    setPlaylists(prev => [newPl, ...prev]);
    showToast(`⏳ Pengajuan playlist "${trimmed}" berhasil dibuat! Menunggu persetujuan Admin sebelum dapat diputar.`, 'info');

    // Centralized database save
    try {
      const res = await publishPlaylistAPI({
        name: trimmed,
        description: description.trim(),
        emoji: emoji || '🎧',
        gradient: gradient || 'default',
        custom_cover: customCover || null,
        creator_name: uploader,
        songs: [],
      });
      if (res && res.success && res.data) {
        const dbId = String(res.data.id);
        const serverStatus = res.data.status || 'pending';
        const isLocked = serverStatus !== 'approved';
        setPlaylists(prev => prev.map(p => p.id === tempId ? {
          ...p,
          id: dbId,
          status: serverStatus,
          isLocked: isLocked,
          isCommunity: true
        } : p));
        newPl.id = dbId;
        newPl.status = serverStatus;
        newPl.isLocked = isLocked;
      }
    } catch (err) {
      console.debug('Failed to sync playlist to MySQL:', err);
    }

    return newPl;
  };

  const updatePlaylist = (playlistId, updates) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        return { ...p, ...updates };
      }
      return p;
    }));
    showToast('✨ Playlist updated', 'success');

    // Sync to centralized database if numeric ID or community playlist
    if (/^\d+$/.test(String(playlistId))) {
      updatePlaylistAPI(playlistId, {
        name: updates.name,
        description: updates.description,
        emoji: updates.emoji,
        gradient: updates.gradient,
        custom_cover: updates.customCover,
      }).catch(() => {});
    }
  };

  const togglePinPlaylist = (playlistId) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        const nextPinned = !p.isPinned;
        showToast(nextPinned ? '📌 Playlist pinned' : 'Unpinned playlist', 'info');
        return { ...p, isPinned: nextPinned };
      }
      return p;
    }));
  };

  const deletePlaylist = (playlistId) => {
    const pl = playlists.find(p => p.id === playlistId);
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
    showToast(`🗑️ Deleted playlist "${pl?.name || ''}"`, 'info');

    if (/^\d+$/.test(String(playlistId))) {
      deleteCommunityPlaylistAPI(playlistId).catch(() => {});
    }
  };

  const addToPlaylist = (playlistId, songId) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId && !p.songs.includes(songId)) {
        return { ...p, songs: [...p.songs, songId] };
      }
      return p;
    }));
    const pl = playlists.find(p => p.id === playlistId);
    showToast(`Added to "${pl?.name || 'Playlist'}"`, 'success');

    if (/^\d+$/.test(String(playlistId))) {
      togglePlaylistSongAPI(playlistId, songId).catch(() => {});
    }
  };

  const removeFromPlaylist = (playlistId, songId) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        return { ...p, songs: p.songs.filter(id => id !== songId) };
      }
      return p;
    }));
    showToast('🗑️ Removed song from playlist', 'info');

    if (/^\d+$/.test(String(playlistId))) {
      togglePlaylistSongAPI(playlistId, songId).catch(() => {});
    }
  };

  const playPlaylist = (playlistId, shuffle = false) => {
    const pl = playlists.find(p => p.id === playlistId);
    if (!pl) return;
    if (pl.status !== 'approved' && pl.isLocked !== false) {
      showToast('🔒 Playlist terkunci! Menunggu izin persetujuan dari Administrator sebelum dapat diputar.', 'warning');
      return;
    }
    if (pl.songs.length === 0) {
      showToast('⚠️ Playlist is empty', 'info');
      return;
    }
    const plSongs = pl.songs
      .map(id => songs.find(s => s.id === id))
      .filter(Boolean);

    if (plSongs.length === 0) {
      showToast('⚠️ No available tracks found', 'info');
      return;
    }

    let order = [...plSongs];
    if (shuffle) {
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
    }

    const [first, ...rest] = order;
    setQueue(rest.map(s => s.id));
    playSong(first);
    showToast(`${shuffle ? '🔀 Shuffling' : '▶ Playing'} "${pl.name}"`, 'success');
  };

  const addPlaylistToQueue = (playlistId) => {
    const pl = playlists.find(p => p.id === playlistId);
    if (!pl) return;
    if (pl.status !== 'approved' && pl.isLocked !== false) {
      showToast('🔒 Playlist terkunci! Menunggu izin persetujuan dari Administrator.', 'warning');
      return;
    }
    if (pl.songs.length === 0) {
      showToast('⚠️ Playlist is empty', 'info');
      return;
    }
    setQueue(prev => [...prev, ...pl.songs]);
    showToast(`Added ${pl.songs.length} tracks to Queue`, 'success');
  };

  const publishPlaylist = async (playlistId) => {
    const pl = playlists.find(p => p.id === playlistId);
    if (!pl) return;
    showToast('Publishing playlist to community...', 'info');
    const uploader = (typeof localStorage !== 'undefined' ? localStorage.getItem('spotify_ultra_profile_name') : 'Admin') || 'Admin';
    const res = await publishPlaylistAPI({
      name: pl.name,
      description: pl.description || '',
      emoji: pl.emoji || '🎧',
      gradient: pl.gradient || 'default',
      custom_cover: pl.customCover || null,
      creator_name: uploader,
      songs: (pl.songs || []).map(Number).filter(n => !isNaN(n) && n > 0),
    });
    if (res.success) {
      showToast('🌍 Playlist published for everyone to see!', 'success');
      setPlaylists(prev => prev.map(p => p.id === playlistId ? { ...p, isCommunity: true } : p));
    } else {
      showToast('Publish failed: ' + (res.message || 'Database connection required'), 'error');
    }
  };
  return (
    <AudioContext.Provider value={{
      songs,
      setSongs,
      currentSong,
      isPlaying,
      currentTime,
      duration,
      volume,
      setVolume,
      isMuted,
      setIsMuted,
      isShuffle,
      repeatMode,
      theme,
      setTheme,
      queue,
      favorites,
      playlists,
      recentlyPlayed,
      toasts,
      showToast,
      playSong,
      togglePlay: handleTogglePlay,
      nextSong: handleNextSong,
      prevSong: handlePrevSong,
      seekTo,
      toggleShuffle,
      cycleRepeat,
      toggleFavorite,
      addToQueue,
      removeFromQueue,
      reorderQueue,
      createPlaylist,
      updatePlaylist,
      deletePlaylist,
      addToPlaylist,
      removeFromPlaylist,
      togglePinPlaylist,
      playPlaylist,
      addPlaylistToQueue,
      publishPlaylist,
      colorMode,
      setColorMode,
      profileName,
      setProfileName,
      autoplay,
      setAutoplay,
      keepAwake,
      setKeepAwake,
      DEFAULT_COVER
    }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within an AudioProvider');
  return context;
}
