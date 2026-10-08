import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import {
  fetchSongsAPI,
  fetchPlaylistsAPI,
  publishPlaylistAPI,
  updatePlaylistAPI,
  deletePlaylistAPI,
  togglePlaylistSongAPI,
  recordPlayStatAPI,
  loginAPI,
  logoutAPI,
} from '../services/api';
import { THEMES } from '../config';

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // in seconds
  const [duration, setDuration] = useState(0); // in seconds
  const [isBuffering, setIsBuffering] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'all', 'one'
  const [isShuffle, setIsShuffle] = useState(false);
  const [activeQueue, setActiveQueue] = useState([]);

  // User Authentication & Profile
  const [currentUser, setCurrentUser] = useState(null); // { id, name, email, role }
  const [profileName, setProfileName] = useState('Listener');
  const [activeTheme, setActiveTheme] = useState(THEMES[0]);

  // Modal & Sheet visibility states
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [playlistModalSong, setPlaylistModalSong] = useState(null);

  const playerRef = useRef(null);
  const isSeekingRef = useRef(false);

  // Configure background playback for iOS & Android
  const ensureBackgroundAudioMode = async () => {
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionMode: 'doNotMix',
      });
    } catch (err) {
      console.warn('Audio mode config error:', err);
    }
  };

  useEffect(() => {
    ensureBackgroundAudioMode();
  }, []);

  // Fetch initial songs & playlists from Laravel API
  const refreshData = async () => {
    setLoading(true);
    const [songsData, playlistsData] = await Promise.all([
      fetchSongsAPI(),
      fetchPlaylistsAPI(),
    ]);
    setSongs(Array.isArray(songsData) ? songsData : []);
    setPlaylists(Array.isArray(playlistsData) ? playlistsData : []);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.pause();
          playerRef.current.remove();
        } catch (e) {}
      }
    };
  }, []);

  const playSong = async (song) => {
    if (!song) return;

    try {
      // Re-assert background audio mode before every playback
      await ensureBackgroundAudioMode();

      if (playerRef.current) {
        try {
          playerRef.current.pause();
          playerRef.current.remove();
        } catch (e) {}
        playerRef.current = null;
      }

      setCurrentSong(song);
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(true);
      setIsBuffering(true);

      const audioUri = song.src || song.audio_file;
      if (!audioUri) {
        console.warn('Song has no audio URI:', song);
        setIsBuffering(false);
        return;
      }

      const player = createAudioPlayer(
        { uri: audioUri },
        {
          updateInterval: 250,
          keepAudioSessionActive: true,
        }
      );
      player.loop = repeatMode === 'one';

      player.addListener('playbackStatusUpdate', (status) => {
        if (!isSeekingRef.current) {
          setCurrentTime(status.currentTime || 0);
          setDuration(status.duration || 0);
        }
        setIsPlaying(status.playing);
        setIsBuffering(status.isBuffering);

        if (status.didJustFinish && !player.loop) {
          handleSongFinished();
        }
      });

      player.setActiveForLockScreen(true, {
        title: song.title,
        artist: song.artist,
        albumTitle: song.album || 'Spotirid Archive',
        artworkUrl: song.img || song.cover_image,
      });

      player.play();
      playerRef.current = player;
      recordPlayStatAPI(song.id);
    } catch (error) {
      console.warn('Gagal memutar lagu:', error);
      setIsBuffering(false);
      setIsPlaying(false);
    }
  };

  const togglePlay = async () => {
    if (!playerRef.current) {
      if (currentSong) {
        playSong(currentSong);
      } else if (songs.length > 0) {
        playSong(songs[0]);
      }
      return;
    }

    try {
      if (playerRef.current.playing) {
        playerRef.current.pause();
      } else {
        await ensureBackgroundAudioMode();
        playerRef.current.play();
      }
    } catch (err) {
      console.warn('Toggle play error:', err);
    }
  };

  const seekTo = (seconds) => {
    if (!playerRef.current) return;
    try {
      isSeekingRef.current = true;
      setCurrentTime(seconds);
      playerRef.current.seekTo(seconds);
    } catch (err) {
      console.warn('Seek error:', err);
    } finally {
      setTimeout(() => {
        isSeekingRef.current = false;
      }, 300);
    }
  };

  const handleSongFinished = () => {
    if (repeatMode === 'one') {
      if (playerRef.current) {
        playerRef.current.seekTo(0);
        playerRef.current.play();
      }
      return;
    }
    nextSong();
  };

  const nextSong = () => {
    const list = activeQueue.length > 0 ? activeQueue : songs;
    if (!currentSong || list.length === 0) return;

    if (isShuffle) {
      const remaining = list.filter((s) => s.id !== currentSong.id);
      if (remaining.length > 0) {
        const randomSong = remaining[Math.floor(Math.random() * remaining.length)];
        playSong(randomSong);
        return;
      }
    }

    const currentIndex = list.findIndex((s) => s.id === currentSong.id);
    if (currentIndex >= 0 && currentIndex < list.length - 1) {
      playSong(list[currentIndex + 1]);
    } else if (repeatMode === 'all') {
      playSong(list[0]);
    } else {
      setIsPlaying(false);
    }
  };

  const prevSong = () => {
    const list = activeQueue.length > 0 ? activeQueue : songs;
    if (!currentSong || list.length === 0) return;

    if (currentTime > 3) {
      seekTo(0);
      return;
    }

    const currentIndex = list.findIndex((s) => s.id === currentSong.id);
    if (currentIndex > 0) {
      playSong(list[currentIndex - 1]);
    } else {
      playSong(list[list.length - 1]);
    }
  };

  const toggleFavorite = (songId) => {
    setFavorites((prev) =>
      prev.includes(songId) ? prev.filter((id) => id !== songId) : [...prev, songId]
    );
  };

  const cycleRepeat = () => {
    setRepeatMode((prev) => {
      const next = prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off';
      if (playerRef.current) {
        playerRef.current.loop = next === 'one';
      }
      return next;
    });
  };

  const toggleShuffle = () => {
    setIsShuffle((prev) => !prev);
  };

  // User Login & Logout
  const handleLogin = async (email, password) => {
    const res = await loginAPI(email, password);
    if (res && res.success && res.user) {
      setCurrentUser(res.user);
      setProfileName(res.user.name || 'User');
      return { success: true };
    }
    return { success: false, message: res?.message || 'Login gagal.' };
  };

  const handleLogout = async () => {
    await logoutAPI();
    setCurrentUser(null);
    setProfileName('Listener');
  };

  // Playlist management functions with MySQL server sync
  const playPlaylist = (playlist) => {
    if (!playlist) return;
    let trackList = [];
    if (Array.isArray(playlist.songs) && playlist.songs.length > 0) {
      if (typeof playlist.songs[0] === 'object') {
        trackList = playlist.songs;
      } else {
        trackList = playlist.songs
          .map((id) => songs.find((s) => String(s.id) === String(id)))
          .filter(Boolean);
      }
    }
    if (trackList.length > 0) {
      setActiveQueue(trackList);
      playSong(trackList[0]);
    }
  };

  const createPlaylist = async (name) => {
    if (!name || !name.trim()) return null;
    const author = currentUser ? currentUser.name : profileName || 'Listener';
    const tempId = `pl_${Date.now()}`;
    const newPl = {
      id: tempId,
      name: name.trim(),
      creator_name: author,
      songs: [],
      cover: currentSong?.img || 'https://farid-peminjaman.alwaysdata.net/assets/covers/believer.jpg',
    };

    setPlaylists((prev) => [newPl, ...prev]);

    try {
      const res = await publishPlaylistAPI({
        name: name.trim(),
        creator_name: author,
        songs: [],
      });
      if (res && res.success && res.data) {
        const realId = String(res.data.id);
        setPlaylists((prev) =>
          prev.map((p) => (p.id === tempId ? { ...p, id: realId } : p))
        );
        newPl.id = realId;
      }
    } catch (e) {
      console.warn('Sync playlist to MySQL failed:', e);
    }

    return newPl;
  };

  const updatePlaylist = async (playlistId, updates) => {
    setPlaylists((prev) =>
      prev.map((p) => (String(p.id) === String(playlistId) ? { ...p, ...updates } : p))
    );
    if (selectedPlaylist && String(selectedPlaylist.id) === String(playlistId)) {
      setSelectedPlaylist((prev) => ({ ...prev, ...updates }));
    }
    if (!String(playlistId).startsWith('pl_')) {
      await updatePlaylistAPI(playlistId, updates);
    }
  };

  const deletePlaylist = async (playlistId) => {
    setPlaylists((prev) => prev.filter((p) => String(p.id) !== String(playlistId)));
    if (selectedPlaylist && String(selectedPlaylist.id) === String(playlistId)) {
      setSelectedPlaylist(null);
    }
    if (!String(playlistId).startsWith('pl_')) {
      await deletePlaylistAPI(playlistId);
    }
  };

  const togglePlaylistSong = async (playlistId, songId) => {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (String(pl.id) !== String(playlistId)) return pl;
        const currentSongIds = Array.isArray(pl.songs)
          ? pl.songs.map((s) => (typeof s === 'object' ? s.id : s))
          : [];
        const exists = currentSongIds.includes(songId);
        const newSongs = exists
          ? currentSongIds.filter((id) => id !== songId)
          : [...currentSongIds, songId];
        return { ...pl, songs: newSongs };
      })
    );

    if (selectedPlaylist && String(selectedPlaylist.id) === String(playlistId)) {
      setSelectedPlaylist((prev) => {
        const currentSongIds = Array.isArray(prev.songs)
          ? prev.songs.map((s) => (typeof s === 'object' ? s.id : s))
          : [];
        const exists = currentSongIds.includes(songId);
        const newSongs = exists
          ? currentSongIds.filter((id) => id !== songId)
          : [...currentSongIds, songId];
        return { ...prev, songs: newSongs };
      });
    }

    if (!String(playlistId).startsWith('pl_')) {
      await togglePlaylistSongAPI(playlistId, songId);
    }
  };

  return (
    <AudioContext.Provider
      value={{
        songs,
        playlists,
        loading,
        refreshData,
        currentSong,
        isPlaying,
        currentTime,
        duration,
        isBuffering,
        playSong,
        togglePlay,
        seekTo,
        nextSong,
        prevSong,
        favorites,
        toggleFavorite,
        repeatMode,
        cycleRepeat,
        isShuffle,
        toggleShuffle,
        playPlaylist,
        createPlaylist,
        updatePlaylist,
        deletePlaylist,
        togglePlaylistSong,
        currentUser,
        login: handleLogin,
        logout: handleLogout,
        profileName,
        setProfileName,
        activeTheme,
        setActiveTheme,
        isNowPlayingOpen,
        setIsNowPlayingOpen,
        isLyricsOpen,
        setIsLyricsOpen,
        isSettingsOpen,
        setIsSettingsOpen,
        isLoginOpen,
        setIsLoginOpen,
        selectedPlaylist,
        setSelectedPlaylist,
        playlistModalSong,
        setPlaylistModalSong,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
