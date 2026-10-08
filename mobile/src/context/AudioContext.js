import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { fetchSongsAPI, recordPlayStatAPI } from '../services/api';

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'all', 'one'
  const [isShuffle, setIsShuffle] = useState(false);
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);

  const soundRef = useRef(null);
  const isSeekingRef = useRef(false);

  // Configure Audio Mode for background playback on iOS & Android
  useEffect(() => {
    async function configureAudio() {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
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
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, []);

  const onPlaybackStatusUpdate = (status) => {
    if (!status.isLoaded) {
      if (status.error) {
        console.warn(`Playback Error: ${status.error}`);
      }
      return;
    }

    if (!isSeekingRef.current) {
      setPositionMillis(status.positionMillis || 0);
      setDurationMillis(status.durationMillis || 0);
    }
    setIsPlaying(status.isPlaying);
    setIsBuffering(status.isBuffering);

    if (status.didJustFinish && !status.isLooping) {
      handleSongFinished();
    }
  };

  const playSong = async (song) => {
    if (!song) return;

    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync().catch(() => {});
        await soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }

      setCurrentSong(song);
      setPositionMillis(0);
      setDurationMillis(0);
      setIsPlaying(true);
      setIsBuffering(true);

      const audioUri = song.src || song.audio_file;
      if (!audioUri) {
        console.warn('Song has no audio URI:', song);
        setIsBuffering(false);
        return;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true, isLooping: repeatMode === 'one' },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      recordPlayStatAPI(song.id);
    } catch (error) {
      console.warn('Gagal memutar lagu:', error);
      setIsBuffering(false);
      setIsPlaying(false);
    }
  };

  const togglePlay = async () => {
    if (!soundRef.current) {
      if (currentSong) {
        await playSong(currentSong);
      } else if (songs.length > 0) {
        await playSong(songs[0]);
      }
      return;
    }

    try {
      if (isPlaying) {
        await soundRef.current.pauseAsync();
      } else {
        await soundRef.current.playAsync();
      }
    } catch (err) {
      console.warn('Toggle play error:', err);
    }
  };

  const seekTo = async (millis) => {
    if (!soundRef.current) return;
    try {
      isSeekingRef.current = true;
      setPositionMillis(millis);
      await soundRef.current.setPositionAsync(millis);
    } catch (err) {
      console.warn('Seek error:', err);
    } finally {
      isSeekingRef.current = false;
    }
  };

  const handleSongFinished = () => {
    if (repeatMode === 'one') {
      if (soundRef.current) {
        soundRef.current.replayAsync().catch(() => {});
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
    if (positionMillis > 3000) {
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
      if (soundRef.current) {
        soundRef.current.setIsLoopingAsync(next === 'one').catch(() => {});
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
        positionMillis,
        durationMillis,
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
