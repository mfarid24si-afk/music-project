import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAudio } from '../context/AudioContext';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import FilterChips from '../components/FilterChips';
import SongItem from '../components/SongItem';
import MiniPlayer from '../components/MiniPlayer';
import NowPlayingModal from '../components/NowPlayingModal';
import { THEME } from '../config';

export default function HomeScreen() {
  const {
    songs,
    loading,
    refreshSongs,
    currentSong,
    isPlaying,
    playSong,
    favorites,
    toggleFavorite,
  } = useAudio();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredSongs = useMemo(() => {
    let result = [...songs];

    // Filter query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          (s.title && s.title.toLowerCase().includes(q)) ||
          (s.artist && s.artist.toLowerCase().includes(q)) ||
          (s.album && s.album.toLowerCase().includes(q)) ||
          (s.genre && s.genre.toLowerCase().includes(q))
      );
    }

    // Filter Chips
    if (activeFilter === 'favorites') {
      result = result.filter((s) => favorites.includes(s.id));
    } else if (activeFilter !== 'all') {
      result = result.filter((s) =>
        s.genre && s.genre.toLowerCase().includes(activeFilter.toLowerCase())
      );
    }

    return result;
  }, [songs, searchQuery, activeFilter, favorites]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header trackCount={songs.length} />
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={() => setSearchQuery('')}
      />
      <FilterChips
        activeFilter={activeFilter}
        onSelectFilter={setActiveFilter}
      />

      {loading && songs.length === 0 ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={THEME.accent} />
          <Text style={styles.loadingText}>Menghubungkan ke Spotirid Server...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredSongs}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[
            styles.listContent,
            currentSong ? { paddingBottom: 110 } : { paddingBottom: 24 },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refreshSongs}
              tintColor={THEME.accent}
              colors={[THEME.accent]}
            />
          }
          renderItem={({ item }) => {
            const isCurrent = currentSong && currentSong.id === item.id;
            const isLiked = favorites.includes(item.id);
            return (
              <SongItem
                song={item}
                isCurrent={isCurrent}
                isPlaying={isPlaying}
                isLiked={isLiked}
                onPlay={() => playSong(item)}
                onToggleLike={() => toggleFavorite(item.id)}
              />
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="musical-notes-outline" size={48} color={THEME.textMuted} />
              <Text style={styles.emptyTitle}>Tidak ada lagu ditemukan</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? `Tidak ada hasil untuk "${searchQuery}"`
                  : activeFilter === 'favorites'
                  ? 'Belum ada lagu yang ditambahkan ke favorit'
                  : 'Tarik ke bawah untuk memuat ulang daftar'}
              </Text>
            </View>
          }
        />
      )}

      {/* Floating Bottom Mini Player (Spotify Style) */}
      <MiniPlayer />

      {/* Fullscreen Now Playing Modal */}
      <NowPlayingModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  listContent: {
    paddingHorizontal: 4,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: THEME.textMuted,
    fontWeight: '500',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 12,
    color: THEME.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
