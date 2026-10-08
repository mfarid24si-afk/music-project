import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { fetchSongsAPI, recordPlayStatAPI } from '../services/api';

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // in seconds
  const [duration, setDuration] = useState(0); // in seconds
  const [isBuffering, setIsBuffering] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'all', 'one'
  const [isShuffle, setIsShuffle] = useState(false);
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);

  const playerRef = useRef(null);
  const isSeekingRef = useRef(false);

  // Configure background playback for iOS & Android
  useEffect(() => {
    async function configureAudio() {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionMode: 'doNotMix',
        });
      } catch (err) {
        console.warn('Audio mode config error:', err);
      }
    }
    configureAudio();
  }, []);

  // Fetch initial songs from Laravel API
  const refreshSongs = async () => {
    setLoading(true);
    const data = await fetchSongsAPI();
    setSongs(data);
    setLoading(false);
  };

  useEffect(() => {
    refreshSongs();
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
        { updateInterval: 250 }
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

  const togglePlay = () => {
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
    if (!currentSong || songs.length === 0) return;

    if (isShuffle) {
      const remaining = songs.filter((s) => s.id !== currentSong.id);
      if (remaining.length > 0) {
        const randomSong = remaining[Math.floor(Math.random() * remaining.length)];
        playSong(randomSong);
        return;
      }
    }

    const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
    if (currentIndex >= 0 && currentIndex < songs.length - 1) {
      playSong(songs[currentIndex + 1]);
    } else if (repeatMode === 'all') {
      playSong(songs[0]);
    } else {
      setIsPlaying(false);
    }
  };

  const prevSong = () => {
    if (!currentSong || songs.length === 0) return;

    // If more than 3 seconds in, restart track
    if (currentTime > 3) {
      seekTo(0);
      return;
    }

    const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
    if (currentIndex > 0) {
      playSong(songs[currentIndex - 1]);
    } else {
      playSong(songs[songs.length - 1]);
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

  return (
    <AudioContext.Provider
      value={{
        songs,
        loading,
        refreshSongs,
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
        isNowPlayingOpen,
        setIsNowPlayingOpen,
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
