import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../config';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 44) / 2;
const DEFAULT_COVER = 'https://farid-peminjaman.alwaysdata.net/assets/covers/believer.jpg';

export default function SongCard({ song, isCurrent, isPlaying, isLiked, onPlay, onToggleLike }) {
  const [imgError, setImgError] = useState(false);
  const coverUri = !imgError && (song?.img || song?.cover_image)
    ? (song?.img || song?.cover_image)
    : DEFAULT_COVER;

  const rawGenre = String(song?.genre || '');
  const genreTag = rawGenre ? rawGenre.split('/')[0].trim().toUpperCase() : null;

  return (
    <TouchableOpacity
      style={[styles.card, isCurrent && styles.cardCurrent]}
      onPress={onPlay}
      activeOpacity={0.8}
    >
      {/* Cover Image Container */}
      <View style={styles.imageBox}>
        <Image
          source={{ uri: coverUri }}
          style={styles.image}
          onError={() => setImgError(true)}
        />

        {/* Genre Pill */}
        {genreTag ? (
          <View style={styles.genrePill}>
            <Text style={styles.genreText} numberOfLines={1}>
              {genreTag}
            </Text>
          </View>
        ) : null}

        {/* Play State Overlay */}
        {isCurrent && isPlaying ? (
          <View style={styles.playingBadge}>
            <Ionicons name="volume-high" size={14} color="#000" />
          </View>
        ) : null}
      </View>

      {/* Info Section */}
      <View style={styles.info}>
        <Text numberOfLines={1} style={[styles.title, isCurrent && styles.titleCurrent]}>
          {String(song?.title || 'Unknown Title')}
        </Text>
        <Text numberOfLines={1} style={styles.artist}>
          {String(song?.artist || 'Unknown Artist')}
        </Text>
      </View>

      {/* Bottom Bar: Duration & Like */}
      <View style={styles.bottomBar}>
        <Text style={styles.formatTag}>24-BIT MASTER</Text>
        <TouchableOpacity
          onPress={onToggleLike}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={18}
            color={isLiked ? THEME.accent : THEME.textMuted}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: THEME.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 10,
    marginBottom: 12,
  },
  cardCurrent: {
    borderColor: THEME.borderAccent,
    backgroundColor: 'rgba(204, 242, 40, 0.04)',
  },
  imageBox: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: THEME.elevated,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  genrePill: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  genreText: {
    fontSize: 8,
    fontWeight: '800',
    color: THEME.accent,
    letterSpacing: 0.5,
  },
  playingBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: THEME.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  info: {
    marginTop: 8,
    marginBottom: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  titleCurrent: {
    color: THEME.accent,
  },
  artist: {
    fontSize: 11,
    color: THEME.textMuted,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  formatTag: {
    fontSize: 8,
    fontWeight: '700',
    color: THEME.textMuted,
    letterSpacing: 0.4,
  },
});
