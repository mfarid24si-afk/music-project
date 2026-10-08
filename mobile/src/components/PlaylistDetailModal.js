import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import SwipeModal from './SwipeModal';
import SongItem from './SongItem';
import { useAudio } from '../context/AudioContext';
import { THEME } from '../config';

const DEFAULT_COVER = 'https://farid-peminjaman.alwaysdata.net/assets/covers/believer.jpg';

export default function PlaylistDetailModal({ visible, playlist, onClose }) {
  const {
    songs,
    currentSong,
    isPlaying,
    playSong,
    playPlaylist,
    updatePlaylist,
    deletePlaylist,
    togglePlaylistSong,
    favorites,
    toggleFavorite,
    activeTheme,
  } = useAudio();

  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [descInput, setDescInput] = useState('');

  const accentColor = activeTheme?.color || THEME.accent;

  useEffect(() => {
    if (playlist) {
      setNameInput(playlist.name || '');
      setDescInput(playlist.description || '');
      setIsEditing(false);
    }
  }, [playlist?.id]);

  // Resolve playlist songs unconditionally (Rules of Hooks: called before any early return)
  const playlistSongs = React.useMemo(() => {
    if (!playlist) return [];
    if (Array.isArray(playlist.songs) && playlist.songs.length > 0) {
      if (typeof playlist.songs[0] === 'object') {
        return playlist.songs;
      }
      return playlist.songs
        .map((id) => songs.find((s) => String(s.id) === String(id)))
        .filter(Boolean);
    }
    return [];
  }, [playlist?.songs, songs]);

  if (!playlist) return null;

  const coverUri = playlist.cover || playlist.custom_cover || DEFAULT_COVER;

  const handlePlayAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    playPlaylist(playlist);
  };

  const handleSaveEdit = async () => {
    if (!nameInput.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    await updatePlaylist(playlist.id, {
      name: nameInput.trim(),
      description: descInput.trim(),
    });
    setIsEditing(false);
  };

  const handleDeletePlaylist = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    Alert.alert(
      'Hapus Playlist',
      `Apakah Anda yakin ingin menghapus playlist "${playlist.name}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            await deletePlaylist(playlist.id);
            onClose();
          },
        },
      ]
    );
  };

  const handleRemoveSong = (songId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    togglePlaylistSong(playlist.id, songId);
  };

  return (
    <SwipeModal visible={visible} onClose={onClose} height="92%">
      <View style={styles.container}>
        {/* Top Header Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="chevron-down" size={26} color="#fff" />
          </TouchableOpacity>

          <Text numberOfLines={1} style={styles.headerTitle}>
            {isEditing ? 'Edit Playlist' : playlist.name}
          </Text>

          {/* Edit Button */}
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              setIsEditing(!isEditing);
            }}
            style={[styles.iconBtn, isEditing && { backgroundColor: accentColor + '22', borderRadius: 18 }]}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons
              name={isEditing ? 'checkmark-circle' : 'pencil'}
              size={20}
              color={isEditing ? accentColor : '#fff'}
            />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Edit Form Mode */}
          {isEditing ? (
            <View style={styles.editSection}>
              <View style={styles.fieldBox}>
                <Text style={styles.fieldLabel}>NAMA PLAYLIST</Text>
                <TextInput
                  style={styles.textInput}
                  value={nameInput}
                  onChangeText={setNameInput}
                  placeholder="Nama playlist..."
                  placeholderTextColor={THEME.textMuted}
                  maxLength={40}
                />
              </View>

              <View style={styles.fieldBox}>
                <Text style={styles.fieldLabel}>DESKRIPSI (OPSIONAL)</Text>
                <TextInput
                  style={[styles.textInput, { height: 70, textAlignVertical: 'top', paddingTop: 8 }]}
                  value={descInput}
                  onChangeText={setDescInput}
                  placeholder="Deskripsi playlist..."
                  placeholderTextColor={THEME.textMuted}
                  multiline
                  maxLength={150}
                />
              </View>

              <View style={styles.editBtnRow}>
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: accentColor }]}
                  onPress={handleSaveEdit}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveBtnText}>Simpan Perubahan</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setIsEditing(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelBtnText}>Batal</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={handleDeletePlaylist}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={16} color="#ef4444" />
                <Text style={styles.deleteBtnText}>Hapus Playlist Ini</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Banner & Cover */}
              <View style={styles.bannerRow}>
                <Image source={{ uri: coverUri }} style={styles.cover} />
                <View style={styles.bannerInfo}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>PLAYLIST</Text>
                  </View>
                  <Text numberOfLines={2} style={styles.playlistName}>{playlist.name}</Text>
                  {playlist.description ? (
                    <Text numberOfLines={2} style={styles.playlistDesc}>{playlist.description}</Text>
                  ) : null}
                  <Text numberOfLines={1} style={styles.playlistCreator}>
                    {playlist.creator_name ? `Oleh ${playlist.creator_name}` : 'Spotirid Creator'}
                  </Text>
                  <Text style={styles.playlistCount}>{playlistSongs.length} Lagu</Text>
                </View>
              </View>

              {/* Action Row */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.playAllBtn, { backgroundColor: accentColor }]}
                  onPress={handlePlayAll}
                  activeOpacity={0.8}
                >
                  <Ionicons name="play" size={20} color="#000" />
                  <Text style={styles.playAllText}>Putar Semua</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Tracklist Section */}
          <View style={styles.tracklistContainer}>
            <View style={styles.tracklistHeader}>
              <Text style={styles.sectionLabel}>
                {isEditing ? 'KELOLA LAGU (KETUK TONG SAMPAH UNTUK HAPUS)' : 'DAFTAR LAGU'}
              </Text>
            </View>

            {playlistSongs.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="musical-notes-outline" size={40} color={THEME.textMuted} />
                <Text style={styles.emptyText}>Belum ada lagu di playlist ini</Text>
              </View>
            ) : (
              playlistSongs.map((song, idx) => {
                const isCurrent = currentSong && currentSong.id === song.id;
                const isLiked = Array.isArray(favorites) && favorites.includes(song.id);
                return (
                  <View key={String(song.id || idx)} style={styles.songRowWrapper}>
                    <View style={{ flex: 1 }}>
                      <SongItem
                        song={song}
                        isCurrent={isCurrent}
                        isPlaying={isPlaying}
                        isLiked={isLiked}
                        onPlay={() => playSong(song)}
                        onToggleLike={() => toggleFavorite(song.id)}
                        activeTheme={activeTheme}
                      />
                    </View>

                    {/* Quick Remove from Playlist Icon */}
                    <TouchableOpacity
                      style={styles.removeSongBtn}
                      onPress={() => handleRemoveSong(song.id)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="close-circle-outline" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>
    </SwipeModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  iconBtn: {
    padding: 6,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 40,
    gap: 20,
  },
  bannerRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  cover: {
    width: 110,
    height: 110,
    borderRadius: 12,
    backgroundColor: THEME.elevated,
  },
  bannerInfo: {
    flex: 1,
    gap: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.6,
  },
  playlistName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
  },
  playlistDesc: {
    fontSize: 12,
    color: THEME.textMuted,
    lineHeight: 16,
  },
  playlistCreator: {
    fontSize: 12,
    color: THEME.textMuted,
  },
  playlistCount: {
    fontSize: 11,
    color: THEME.textMuted,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  playAllText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000',
  },
  editSection: {
    backgroundColor: THEME.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 16,
    gap: 14,
  },
  fieldBox: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.textMuted,
    letterSpacing: 0.6,
  },
  textInput: {
    backgroundColor: THEME.elevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingHorizontal: 12,
    color: '#fff',
    fontSize: 14,
    height: 44,
  },
  editBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  saveBtn: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000',
  },
  cancelBtn: {
    height: 42,
    paddingHorizontal: 18,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.textMuted,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    marginTop: 4,
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fca5a5',
  },
  tracklistContainer: {
    gap: 8,
  },
  tracklistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.textMuted,
    letterSpacing: 0.8,
  },
  songRowWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.surface,
    borderRadius: 12,
    marginBottom: 6,
    paddingRight: 10,
  },
  removeSongBtn: {
    padding: 6,
    marginLeft: 4,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: THEME.textMuted,
  },
});
