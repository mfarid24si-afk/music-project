import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../config';

const DEFAULT_COVER = 'https://farid-peminjaman.alwaysdata.net/assets/covers/believer.jpg';

export default function SongItem({ song, isCurrent, isPlaying, isLiked, onPlay, onToggleLike }) {
  const [imgError, setImgError] = useState(false);
  const coverUri = !imgError && (song.img || song.cover_image) ? (song.img || song.cover_image) : DEFAULT_COVER;

  return (
    <TouchableOpacity
      style={[styles.row, isCurrent && styles.rowCurrent]}
      onPress={onPlay}
      activeOpacity={0.65}
    >
      {/* Artwork */}
      <View style={styles.coverWrapper}>
        <Image
          source={{ uri: coverUri }}
          style={styles.cover}
          onError={() => setImgError(true)}
        />
        {isCurrent && isPlaying && (
          <View style={styles.playingOverlay}>
            <Ionicons name="volume-high" size={16} color="#000" />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text
          numberOfLines={1}
          style={[styles.title, isCurrent && styles.titleCurrent]}
        >
          {song.title}
        </Text>
        <Text numberOfLines={1} style={styles.artist}>
          {song.artist} {song.album ? `• ${song.album}` : ''}
        </Text>
      </View>

      {/* Like Button */}
      <TouchableOpacity
        onPress={onToggleLike}
        style={styles.likeBtn}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons
          name={isLiked ? 'heart' : 'heart-outline'}
          size={20}
          color={isLiked ? THEME.accent : THEME.textMuted}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  rowCurrent: {
    backgroundColor: 'rgba(204, 242, 40, 0.05)',
  },
  coverWrapper: {
    width: 50,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: THEME.elevated,
    position: 'relative',
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  playingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(204, 242, 40, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  titleCurrent: {
    color: THEME.accent,
    fontWeight: '700',
  },
  artist: {
    fontSize: 12,
    color: THEME.textMuted,
  },
  likeBtn: {
    padding: 6,
  },
});
