import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { useAudio } from '../context/AudioContext';
import { fetchLyricsFromAPI } from '../services/api';
import { THEME } from '../config';

const { width, height } = Dimensions.get('window');
const TURNTABLE_SIZE = Math.min(width - 64, height * 0.35, 300);
const DEFAULT_COVER = 'https://farid-peminjaman.alwaysdata.net/assets/covers/believer.jpg';

function formatSeconds(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  const totalSeconds = Math.floor(sec);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

export default function NowPlayingModal() {
  const insets = useSafeAreaInsets();
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
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
    activeTheme,
  } = useAudio();

  const accentColor = activeTheme?.color || THEME.accent;
  const [imgError, setImgError] = useState(false);
  const [sliderValue, setSliderValue] = useState(null);
  const [activeTab, setActiveTab] = useState('turntable'); // 'turntable' | 'lyrics'
  const [lyricsData, setLyricsData] = useState(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);

  const spinAnim = useRef(new Animated.Value(0)).current;
  const lyricsScrollRef = useRef(null);
  const lineYMap = useRef({});

  // Fetch lyrics whenever song changes
  useEffect(() => {
    if (!currentSong) return;
    let isCancelled = false;

    async function loadLyrics() {
      setLyricsLoading(true);
      const data = await fetchLyricsFromAPI(currentSong.artist, currentSong.title);
      if (!isCancelled) {
        setLyricsData(data);
        setLyricsLoading(false);
      }
    }

    loadLyrics();
    return () => {
      isCancelled = true;
    };
  }, [currentSong?.id]);

  // Parse LRC Synced lyrics
  const parsedLines = useMemo(() => {
    if (!lyricsData || !lyricsData.syncedLyrics) return null;
    const lines = [];
    for (const rawLine of lyricsData.syncedLyrics.split('\n')) {
      if (!rawLine.trim()) continue;
      const match = rawLine.match(/^\[(\d+):(\d+)(?:[.,](\d+))?\](.*)/);
      if (!match) continue;
      const m = parseInt(match[1], 10);
      const s = parseInt(match[2], 10);
      let ms = match[3] ? parseInt(match[3], 10) : 0;
      if (match[3] && match[3].length === 2) ms *= 10;
      lines.push({ time: m * 60 + s + ms / 1000, text: match[4].trim() });
    }
    return lines.length > 0 ? lines : null;
  }, [lyricsData]);

  // Find active lyric index
  const activeLyricIndex = useMemo(() => {
    if (!parsedLines) return -1;
    let idx = -1;
    for (let i = 0; i < parsedLines.length; i++) {
      if (currentTime >= parsedLines[i].time) idx = i;
    }
    return idx;
  }, [parsedLines, currentTime]);

  // Auto-scroll lyrics smoothly centered
  useEffect(() => {
    if (activeTab === 'lyrics' && lyricsScrollRef.current && activeLyricIndex >= 0) {
      const lineY = lineYMap.current[activeLyricIndex] ?? (activeLyricIndex * 48);
      // Target offset centers the line in the view
      const targetY = Math.max(0, lineY - 130);
      lyricsScrollRef.current.scrollTo({
        y: targetY,
        animated: true,
      });
    }
  }, [activeLyricIndex, activeTab]);

  // Vinyl Spin Loop Animation (ensures loop continues when switching back from lyrics!)
  useEffect(() => {
    let anim;
    if (isPlaying && activeTab === 'turntable') {
      anim = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 8000,
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
  }, [isPlaying, activeTab]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!currentSong) return null;

  const isLiked = Array.isArray(favorites) && favorites.includes(currentSong.id);
  const coverUri = !imgError && (currentSong.img || currentSong.cover_image)
    ? (currentSong.img || currentSong.cover_image)
    : DEFAULT_COVER;

  const currentPosition = sliderValue !== null ? sliderValue : currentTime;

  const handleTogglePlay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    togglePlay();
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    nextSong();
  };

  const handlePrev = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    prevSong();
  };

  const handleToggleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    toggleFavorite(currentSong.id);
  };

  const handleShuffle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    toggleShuffle();
  };

  const handleRepeat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    cycleRepeat();
  };

  return (
    <Modal
      visible={isNowPlayingOpen}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => setIsNowPlayingOpen(false)}
    >
      <View style={[styles.backdrop, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 20) }]}>
        <View style={styles.container}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => setIsNowPlayingOpen(false)}
              style={styles.iconBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="chevron-down" size={28} color="#fff" />
            </TouchableOpacity>

            <View style={styles.topTitleBox}>
              <Text style={styles.topSubtitle}>DECK: AETHER ORBIT MK-IV</Text>
              <Text style={styles.topTitle} numberOfLines={1}>
                {currentSong.album || 'Spotirid Archive'}
              </Text>
            </View>

            {/* Mode Switcher: Turntable vs Lyrics */}
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                setActiveTab((prev) => (prev === 'turntable' ? 'lyrics' : 'turntable'));
              }}
              style={[styles.iconBtn, activeTab === 'lyrics' && [styles.iconBtnActive, { borderColor: accentColor + '66' }]]}
            >
              <Ionicons
                name={activeTab === 'lyrics' ? 'musical-notes' : 'mic-outline'}
                size={22}
                color={activeTab === 'lyrics' ? accentColor : '#fff'}
              />
            </TouchableOpacity>
          </View>

          {/* Telemetry Strip */}
          <View style={styles.telemetryRow}>
            <View style={styles.telemetryPill}>
              <View style={[styles.pulseDot, { backgroundColor: accentColor }]} />
              <Text style={styles.telemetryText}>PHONO STAGE DIRECT</Text>
            </View>
            <View style={[styles.hiresBadge, { borderColor: accentColor + '55' }]}>
              <Ionicons name="pulse" size={12} color={accentColor} />
              <Text style={[styles.hiresText, { color: accentColor }]}>96.0 kHz / 24-BIT</Text>
            </View>
          </View>

          {/* Center Content: Either Turntable OR Synced Lyrics */}
          <View style={styles.mainCenterBox}>
            {/* Turntable Platter View */}
            <View style={[styles.turntableContainer, { display: activeTab === 'turntable' ? 'flex' : 'none' }]}>
              <Animated.View style={[styles.vinylPlatter, { transform: [{ rotate: spin }] }]}>
                {/* Outer Strobe Ring */}
                <View style={styles.strobeRing}>
                  {/* Grooves */}
                  <View style={styles.vinylGroove1}>
                    <View style={styles.vinylGroove2}>
                      {/* Center Artwork Label */}
                      <View style={[styles.centerArtWrapper, { borderColor: accentColor }]}>
                        <Image source={{ uri: coverUri }} style={styles.centerArt} />
                        <View style={styles.spindleHole} />
                      </View>
                    </View>
                  </View>
                </View>
              </Animated.View>
            </View>

            {/* Synced Lyrics Stream View */}
            <View style={[styles.lyricsContainer, { display: activeTab === 'lyrics' ? 'flex' : 'none' }]}>
              {lyricsLoading ? (
                <View style={styles.lyricsCenter}>
                  <Text style={styles.lyricsMuted}>Memuat lirik dari LRCLIB...</Text>
                </View>
              ) : parsedLines ? (
                <ScrollView
                  ref={lyricsScrollRef}
                  style={styles.lyricsScroll}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.lyricsContent}
                >
                  {parsedLines.map((line, idx) => {
                    const isActive = idx === activeLyricIndex;
                    return (
                      <TouchableOpacity
                        key={idx}
                        onLayout={(e) => {
                          lineYMap.current[idx] = e.nativeEvent.layout.y;
                        }}
                        onPress={() => {
                          seekTo(line.time);
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                        }}
                        activeOpacity={0.7}
                        style={styles.lyricLineBox}
                      >
                        <Text
                          style={[
                            styles.lyricText,
                            isActive && [styles.lyricTextActive, { color: accentColor }],
                          ]}
                        >
                          {line.text}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              ) : (
                <View style={styles.lyricsCenter}>
                  <Ionicons name="mic-off-outline" size={36} color={THEME.textMuted} />
                  <Text style={styles.lyricsEmptyTitle}>Lirik Tidak Tersedia</Text>
                  <Text style={styles.lyricsMuted}>
                    {lyricsData?.plainLyrics
                      ? lyricsData.plainLyrics
                      : 'Lirik tersinkronisasi belum ditemukan untuk lagu ini.'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Song Metadata */}
          <View style={styles.metaRow}>
            <View style={styles.titleBox}>
              <Text numberOfLines={1} style={styles.songTitle}>
                {currentSong.title}
              </Text>
              <Text numberOfLines={1} style={styles.songArtist}>
                {currentSong.artist}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleToggleLike}
              hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
              style={styles.likeBtn}
            >
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={26}
                color={isLiked ? accentColor : THEME.textMuted}
              />
            </TouchableOpacity>
          </View>

          {/* Slider / Scrub bar */}
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration > 0 ? duration : 1}
              value={currentPosition}
              minimumTrackTintColor={accentColor}
              maximumTrackTintColor="rgba(255, 255, 255, 0.15)"
              thumbTintColor={accentColor}
              onValueChange={(val) => setSliderValue(val)}
              onSlidingComplete={(val) => {
                seekTo(val);
                setSliderValue(null);
              }}
            />
            <View style={styles.timeRow}>
              <Text style={styles.timeText}>{formatSeconds(currentPosition)}</Text>
              <Text style={styles.timeText}>{formatSeconds(duration)}</Text>
            </View>
          </View>

          {/* Player Controls */}
          <View style={styles.controlsRow}>
            {/* Shuffle */}
            <TouchableOpacity
              onPress={handleShuffle}
              style={styles.secondaryBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons
                name="shuffle"
                size={22}
                color={isShuffle ? accentColor : THEME.textMuted}
              />
            </TouchableOpacity>

            {/* Prev */}
            <TouchableOpacity
              onPress={handlePrev}
              style={styles.mainNavBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="play-skip-back" size={28} color="#fff" />
            </TouchableOpacity>

            {/* Big Play / Pause */}
            <TouchableOpacity
              onPress={handleTogglePlay}
              style={[styles.bigPlayBtn, { backgroundColor: accentColor }]}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={34}
                color="#000"
                style={isPlaying ? {} : { marginLeft: 3 }}
              />
            </TouchableOpacity>

            {/* Next */}
            <TouchableOpacity
              onPress={handleNext}
              style={styles.mainNavBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="play-skip-forward" size={28} color="#fff" />
            </TouchableOpacity>

            {/* Repeat */}
            <TouchableOpacity
              onPress={handleRepeat}
              style={styles.secondaryBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons
                name="repeat"
                size={22}
                color={repeatMode !== 'off' ? accentColor : THEME.textMuted}
              />
              {repeatMode === 'one' && <Text style={[styles.repeatBadge, { color: accentColor }]}>1</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  topTitleBox: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 12,
  },
  topSubtitle: {
    fontSize: 9,
    fontWeight: '800',
    color: THEME.textMuted,
    letterSpacing: 1,
  },
  topTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    marginTop: 2,
  },
  iconBtn: {
    padding: 6,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 22,
    borderWidth: 1,
  },
  telemetryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  telemetryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  telemetryText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.6,
  },
  hiresBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
  },
  hiresText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  mainCenterBox: {
    marginVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  turntableContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lyricsContainer: {
    width: '100%',
    height: TURNTABLE_SIZE + 40,
    backgroundColor: THEME.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  lyricsScroll: {
    flex: 1,
  },
  lyricsContent: {
    paddingVertical: 140, // Generous padding so any line can be centered!
    gap: 18,
  },
  lyricsCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  lyricsEmptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  lyricsMuted: {
    fontSize: 12,
    color: THEME.textMuted,
    textAlign: 'center',
  },
  lyricLineBox: {
    paddingVertical: 4,
    alignItems: 'center',
  },
  lyricText: {
    fontSize: 17,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.3)',
    textAlign: 'center',
    lineHeight: 26,
  },
  lyricTextActive: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 32,
    transform: [{ scale: 1.05 }],
  },
  vinylPlatter: {
    width: TURNTABLE_SIZE,
    height: TURNTABLE_SIZE,
    borderRadius: TURNTABLE_SIZE / 2,
    backgroundColor: '#07080a',
    borderWidth: 4,
    borderColor: '#1e2025',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 16,
  },
  strobeRing: {
    width: TURNTABLE_SIZE - 16,
    height: TURNTABLE_SIZE - 16,
    borderRadius: (TURNTABLE_SIZE - 16) / 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vinylGroove1: {
    width: TURNTABLE_SIZE - 48,
    height: TURNTABLE_SIZE - 48,
    borderRadius: (TURNTABLE_SIZE - 48) / 2,
    borderWidth: 1.5,
    borderColor: '#191b22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vinylGroove2: {
    width: TURNTABLE_SIZE - 90,
    height: TURNTABLE_SIZE - 90,
    borderRadius: (TURNTABLE_SIZE - 90) / 2,
    borderWidth: 1.5,
    borderColor: '#242731',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerArtWrapper: {
    width: TURNTABLE_SIZE * 0.45,
    height: TURNTABLE_SIZE * 0.45,
    borderRadius: (TURNTABLE_SIZE * 0.45) / 2,
    overflow: 'hidden',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerArt: {
    width: '100%',
    height: '100%',
  },
  spindleHole: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  titleBox: {
    flex: 1,
    marginRight: 16,
  },
  songTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  songArtist: {
    fontSize: 14,
    fontWeight: '500',
    color: THEME.textMuted,
  },
  likeBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderContainer: {
    marginVertical: 6,
  },
  slider: {
    width: '100%',
    height: 38,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: -4,
  },
  timeText: {
    fontSize: 11,
    color: THEME.textMuted,
    fontFamily: 'monospace',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 10,
  },
  secondaryBtn: {
    width: 44,
    height: 44,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  repeatBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    fontSize: 9,
    fontWeight: '800',
  },
  mainNavBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigPlayBtn: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
