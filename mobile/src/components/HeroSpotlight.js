import React, { useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudio } from '../context/AudioContext';
import { THEME } from '../config';

const DEFAULT_COVER = 'https://farid-peminjaman.alwaysdata.net/assets/covers/believer.jpg';

export default function HeroSpotlight() {
  const {
    songs,
    currentSong,
    isPlaying,
    togglePlay,
    playSong,
    favorites,
    toggleFavorite,
    setIsNowPlayingOpen,
    activeTheme,
  } = useAudio();

  const spinAnim = useRef(new Animated.Value(0)).current;
  const accentColor = activeTheme?.color || THEME.accent;

  // Use currently playing song or default to first song in archive
  const displaySong = currentSong || (Array.isArray(songs) && songs.length > 0 ? songs[0] : null);
  const isCurrentlyPlayingThis = currentSong && displaySong && currentSong.id === displaySong.id && isPlaying;

  useEffect(() => {
    let anim;
    if (isCurrentlyPlayingThis) {
      anim = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 6000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      anim.start();
    } else {
      spinAnim.stopAnimation();
    }
    return () => {
      if (anim) anim.stop();
    };
  }, [isCurrentlyPlayingThis]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!displaySong) return null;

  const isLiked = Array.isArray(favorites) && favorites.includes(displaySong.id);
  const coverUri = displaySong.img || displaySong.cover_image || DEFAULT_COVER;

  const handlePlayPress = () => {
    if (currentSong && currentSong.id === displaySong.id) {
      togglePlay();
    } else {
      playSong(displaySong);
    }
  };

  return (
    <View style={styles.card}>
      {/* Top Banner Tag */}
      <View style={styles.topBadgeRow}>
        <View style={[styles.hiresPill, { borderColor: accentColor + '66' }]}>
          <View style={[styles.pulseDot, { backgroundColor: accentColor }]} />
          <Text style={[styles.hiresText, { color: accentColor }]}>HIGH RESOLUTION MASTER • 24-BIT</Text>
        </View>
        <Text style={styles.editorialLabel}>EDITORIAL SELECTION</Text>
      </View>

      {/* Center Showcase: Vinyl peeking anchored behind Album Sleeve */}
      <TouchableOpacity
        style={styles.showcase}
        activeOpacity={0.9}
        onPress={() => {
          if (!currentSong) {
            playSong(displaySong);
          }
          setIsNowPlayingOpen(true);
        }}
      >
        <View style={styles.recordCombo}>
          {/* Spinning Vinyl Disc behind the sleeve */}
          <Animated.View style={[styles.vinylDisc, { transform: [{ rotate: spin }] }]}>
            <View style={styles.vinylGroove1}>
              <View style={styles.vinylGroove2}>
                <View style={[styles.vinylCenterLabel, { backgroundColor: accentColor }]}>
                  <View style={styles.vinylCenterHole} />
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Album Cover Jacket on top */}
          <View style={styles.coverWrapper}>
            <Image source={{ uri: coverUri }} style={styles.coverImage} resizeMode="cover" />
            <View style={styles.coverOverlayBadge}>
              <Text style={[styles.coverBadgeText, { color: accentColor }]}>
                {isCurrentlyPlayingThis ? 'NOW PLAYING' : 'EDITORIAL PICK'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Metadata & Controls */}
      <View style={styles.metaContainer}>
        <View style={styles.textContainer}>
          <Text numberOfLines={1} style={styles.title}>
            {displaySong.title}
          </Text>
          <Text numberOfLines={1} style={styles.artist}>
            {displaySong.artist} {displaySong.album ? `• ${displaySong.album}` : ''}
          </Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.likeBtn}
            onPress={() => toggleFavorite(displaySong.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={24}
              color={isLiked ? accentColor : THEME.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.playBtn, { backgroundColor: accentColor }]}
            onPress={handlePlayPress}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isCurrentlyPlayingThis ? 'pause' : 'play'}
              size={22}
              color="#000"
              style={isCurrentlyPlayingThis ? {} : { marginLeft: 2 }}
            />
            <Text style={styles.playBtnText}>
              {isCurrentlyPlayingThis ? 'Jeda' : 'Putar Sekarang'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 20,
    backgroundColor: THEME.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 8,
  },
  topBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  hiresPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
    borderWidth: 1,
  },
  pulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  hiresText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  editorialLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.textMuted,
    letterSpacing: 0.6,
  },
  showcase: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 170,
    marginVertical: 4,
  },
  recordCombo: {
    width: 220,
    height: 160,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverWrapper: {
    position: 'absolute',
    left: 8,
    width: 152,
    height: 152,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: THEME.elevated,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverOverlayBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  coverBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  vinylDisc: {
    position: 'absolute',
    left: 68,
    width: 142,
    height: 142,
    borderRadius: 71,
    backgroundColor: '#050507',
    borderWidth: 2.5,
    borderColor: '#1e2025',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 4,
  },
  vinylGroove1: {
    width: 114,
    height: 114,
    borderRadius: 57,
    borderWidth: 1,
    borderColor: '#23262d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vinylGroove2: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 1,
    borderColor: '#2b2e38',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vinylCenterLabel: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vinylCenterHole: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#000',
  },
  metaContainer: {
    marginTop: 14,
    gap: 12,
  },
  textContainer: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.4,
  },
  artist: {
    fontSize: 13,
    fontWeight: '500',
    color: THEME.textMuted,
    marginTop: 3,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  likeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.elevated,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  playBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000',
    letterSpacing: -0.2,
  },
});
