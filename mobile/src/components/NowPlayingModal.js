import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useAudio } from '../context/AudioContext';
import { THEME } from '../config';

const { width } = Dimensions.get('window');
const COVER_SIZE = Math.min(width - 64, 340);
const DEFAULT_COVER = 'https://farid-peminjaman.alwaysdata.net/assets/covers/believer.jpg';

function formatSeconds(millis) {
  if (!millis || isNaN(millis)) return '0:00';
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

export default function NowPlayingModal() {
  const {
    currentSong,
    isPlaying,
    positionMillis,
    durationMillis,
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
  } = useAudio();

  const [imgError, setImgError] = useState(false);
  const [sliderValue, setSliderValue] = useState(null);

  if (!currentSong) return null;

  const isLiked = favorites.includes(currentSong.id);
  const coverUri = !imgError && (currentSong.img || currentSong.cover_image)
    ? (currentSong.img || currentSong.cover_image)
    : DEFAULT_COVER;

  const currentPosition = sliderValue !== null ? sliderValue : positionMillis;

  return (
    <Modal
      visible={isNowPlayingOpen}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => setIsNowPlayingOpen(false)}
    >
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.safeArea}>
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
              <Text style={styles.topSubtitle}>MEMUTAR DARI SERVER</Text>
              <Text style={styles.topTitle} numberOfLines={1}>
                {currentSong.album || 'Spotirid Archive'}
              </Text>
            </View>

            <View style={styles.iconBtn}>
              <Ionicons name="ellipsis-horizontal" size={24} color={THEME.textMuted} />
            </View>
          </View>

          {/* Album Cover */}
          <View style={styles.coverContainer}>
            <View style={styles.coverWrapper}>
              <Image
                source={{ uri: coverUri }}
                style={styles.cover}
                onError={() => setImgError(true)}
              />
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
              onPress={() => toggleFavorite(currentSong.id)}
              hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
              style={styles.likeBtn}
            >
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={26}
                color={isLiked ? THEME.accent : THEME.textMuted}
              />
            </TouchableOpacity>
          </View>

          {/* Slider / Scrub bar */}
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={durationMillis > 0 ? durationMillis : 1}
              value={currentPosition}
              minimumTrackTintColor={THEME.accent}
              maximumTrackTintColor="rgba(255, 255, 255, 0.2)"
              thumbTintColor="#fff"
              onValueChange={(val) => setSliderValue(val)}
              onSlidingComplete={(val) => {
                seekTo(val);
                setSliderValue(null);
              }}
            />
            <View style={styles.timeRow}>
              <Text style={styles.timeText}>{formatSeconds(currentPosition)}</Text>
              <Text style={styles.timeText}>{formatSeconds(durationMillis)}</Text>
            </View>
          </View>

          {/* Player Controls */}
          <View style={styles.controlsRow}>
            {/* Shuffle */}
            <TouchableOpacity
              onPress={toggleShuffle}
              style={styles.secondaryBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="shuffle"
                size={22}
                color={isShuffle ? THEME.accent : THEME.textMuted}
              />
            </TouchableOpacity>

            {/* Prev */}
            <TouchableOpacity
              onPress={prevSong}
              style={styles.mainNavBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="play-skip-back" size={28} color="#fff" />
            </TouchableOpacity>

            {/* Big Play / Pause */}
            <TouchableOpacity
              onPress={togglePlay}
              style={styles.bigPlayBtn}
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
              onPress={nextSong}
              style={styles.mainNavBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="play-skip-forward" size={28} color="#fff" />
            </TouchableOpacity>

            {/* Repeat */}
            <TouchableOpacity
              onPress={cycleRepeat}
              style={styles.secondaryBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={repeatMode === 'one' ? 'repeat' : 'repeat'}
                size={22}
                color={repeatMode !== 'off' ? THEME.accent : THEME.textMuted}
              />
              {repeatMode === 'one' && <Text style={styles.repeatBadge}>1</Text>}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  topTitleBox: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 12,
  },
  topSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.textMuted,
    letterSpacing: 0.8,
  },
  topTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    marginTop: 2,
  },
  iconBtn: {
    padding: 6,
    width: 40,
    alignItems: 'center',
  },
  coverContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 18,
  },
  coverWrapper: {
    width: COVER_SIZE,
    height: COVER_SIZE,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: THEME.elevated,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 16,
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  },
  songArtist: {
    fontSize: 15,
    fontWeight: '500',
    color: THEME.textMuted,
  },
  likeBtn: {
    padding: 6,
  },
  sliderContainer: {
    marginVertical: 10,
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
    marginTop: 8,
    marginBottom: 16,
  },
  secondaryBtn: {
    padding: 10,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  repeatBadge: {
    position: 'absolute',
    top: 6,
    right: 4,
    fontSize: 9,
    fontWeight: '800',
    color: THEME.accent,
  },
  mainNavBtn: {
    padding: 10,
  },
  bigPlayBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: THEME.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
  },
});
