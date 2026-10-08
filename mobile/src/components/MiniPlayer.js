import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAudio } from '../context/AudioContext';
import { THEME } from '../config';

const DEFAULT_COVER = 'https://farid-peminjaman.alwaysdata.net/assets/covers/believer.jpg';

export default function MiniPlayer() {
  const insets = useSafeAreaInsets();
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    nextSong,
    favorites,
    toggleFavorite,
    setIsNowPlayingOpen,
  } = useAudio();

  const [imgError, setImgError] = useState(false);

  if (!currentSong) return null;

  const isLiked = favorites.includes(currentSong.id);
  const coverUri = !imgError && (currentSong.img || currentSong.cover_image)
    ? (currentSong.img || currentSong.cover_image)
    : DEFAULT_COVER;

  const progressPercent = duration > 0
    ? Math.min(100, Math.max(0, (currentTime / duration) * 100))
    : 0;

  const handleToggleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    toggleFavorite(currentSong.id);
  };

  const handleTogglePlay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    togglePlay();
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    nextSong();
  };

  return (
    <View style={[styles.wrapper, { bottom: Math.max(insets.bottom, 10) }]}>
      {/* Top thin progress bar */}
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
      </View>

      <TouchableOpacity
        style={styles.container}
        activeOpacity={0.9}
        onPress={() => setIsNowPlayingOpen(true)}
      >
        {/* Cover Art */}
        <Image
          source={{ uri: coverUri }}
          style={styles.cover}
          onError={() => setImgError(true)}
        />

        {/* Title & Artist */}
        <View style={styles.info}>
          <Text numberOfLines={1} style={styles.title}>
            {currentSong.title}
          </Text>
          <Text numberOfLines={1} style={styles.artist}>
            {currentSong.artist}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={handleToggleLike}
            style={styles.controlBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={22}
              color={isLiked ? THEME.accent : THEME.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleTogglePlay}
            style={styles.playBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={20}
              color="#000"
              style={isPlaying ? {} : { marginLeft: 2 }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNext}
            style={styles.controlBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="play-skip-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 10,
    right: 10,
    backgroundColor: THEME.surface,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 8,
  },
  progressBarBackground: {
    height: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: THEME.accent,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 56,
  },
  cover: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: THEME.elevated,
  },
  info: {
    flex: 1,
    marginLeft: 10,
    marginRight: 6,
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.2,
  },
  artist: {
    fontSize: 12,
    color: THEME.textMuted,
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  controlBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: THEME.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
});
