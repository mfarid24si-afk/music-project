import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAudio } from '../context/AudioContext';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import FilterChips from '../components/FilterChips';
import HeroSpotlight from '../components/HeroSpotlight';
import SongCard from '../components/SongCard';
import SongItem from '../components/SongItem';
import MiniPlayer from '../components/MiniPlayer';
import NowPlayingModal from '../components/NowPlayingModal';
import UpdateModal from '../components/UpdateModal';
import { checkAppUpdateAPI } from '../services/versionChecker';
import { THEME } from '../config';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
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
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [updateInfo, setUpdateInfo] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // Check for app updates on mount
  useEffect(() => {
    async function checkForUpdates() {
      const info = await checkAppUpdateAPI();
      if (info && info.hasUpdate) {
        setUpdateInfo(info);
        setShowUpdateModal(true);
      }
    }
    checkForUpdates();
  }, []);

  const handleToggleView = (mode) => {
    if (mode !== viewMode) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      setViewMode(mode);
    }
  };

  const handleFilterSelect = (filterId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setActiveFilter(filterId);
  };

  const safeSongs = Array.isArray(songs) ? songs : [];
  const safeFavorites = Array.isArray(favorites) ? favorites : [];

  const filteredSongs = useMemo(() => {
    let result = [...safeSongs];

    // Filter query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s) => {
        const title = String(s?.title || '').toLowerCase();
        const artist = String(s?.artist || '').toLowerCase();
        const album = String(s?.album || '').toLowerCase();
        const genre = String(s?.genre || '').toLowerCase();
        return title.includes(q) || artist.includes(q) || album.includes(q) || genre.includes(q);
      });
    }

    // Filter Chips
    if (activeFilter === 'favorites') {
      result = result.filter((s) => safeFavorites.includes(s.id));
    } else if (activeFilter === 'lossless') {
      result = result.filter((s) => {
        const raw = String(s?.rawSrc || s?.audio_file || s?.src || '').toLowerCase();
        const genre = String(s?.genre || '').toLowerCase();
        return raw.includes('.flac') || raw.includes('.wav') || genre.includes('rock');
      });
    } else if (activeFilter !== 'all') {
      result = result.filter((s) =>
        String(s?.genre || '').toLowerCase().includes(activeFilter.toLowerCase())
      );
    }

    return result;
  }, [safeSongs, searchQuery, activeFilter, safeFavorites]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header trackCount={safeSongs.length} />

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={() => setSearchQuery('')}
      />

      <FilterChips
        activeFilter={activeFilter}
        onSelectFilter={handleFilterSelect}
      />

      {loading && safeSongs.length === 0 ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={THEME.accent} />
          <Text style={styles.loadingText}>Menghubungkan ke Spotirid Server...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: currentSong ? insets.bottom + 100 : insets.bottom + 30 },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refreshSongs}
              tintColor={THEME.accent}
            />
          }
        >
          {/* Bento Spotlight (Featured Vinyl) */}
          {!searchQuery && activeFilter === 'all' ? <HeroSpotlight /> : null}

          {/* Section Header with View Toggle (Grid / List) */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Essential Tracks</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{filteredSongs.length} TRACKS</Text>
              </View>
            </View>

            {/* Grid / List Mode Switcher */}
            <View style={styles.toggleGroup}>
              <TouchableOpacity
                onPress={() => handleToggleView('grid')}
                style={[styles.toggleBtn, viewMode === 'grid' && styles.toggleBtnActive]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name="grid"
                  size={14}
                  color={viewMode === 'grid' ? '#000' : THEME.textMuted}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleToggleView('list')}
                style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name="list"
                  size={15}
                  color={viewMode === 'list' ? '#000' : THEME.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Empty State */}
          {filteredSongs.length === 0 ? (
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
          ) : viewMode === 'grid' ? (
            /* 2-Column Grid Layout */
            <View style={styles.gridContainer}>
              {filteredSongs.map((item) => {
                const isCurrent = currentSong && currentSong.id === item.id;
                const isLiked = safeFavorites.includes(item.id);
                return (
                  <SongCard
                    key={String(item.id)}
                    song={item}
                    isCurrent={isCurrent}
                    isPlaying={isPlaying}
                    isLiked={isLiked}
                    onPlay={() => playSong(item)}
                    onToggleLike={() => toggleFavorite(item.id)}
                  />
                );
              })}
            </View>
          ) : (
            /* List Layout */
            <View style={styles.listContainer}>
              {filteredSongs.map((item) => {
                const isCurrent = currentSong && currentSong.id === item.id;
                const isLiked = safeFavorites.includes(item.id);
                return (
                  <SongItem
                    key={String(item.id)}
                    song={item}
                    isCurrent={isCurrent}
                    isPlaying={isPlaying}
                    isLiked={isLiked}
                    onPlay={() => playSong(item)}
                    onToggleLike={() => toggleFavorite(item.id)}
                  />
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      {/* Floating Bottom Mini Player (Spotify Style) */}
      <MiniPlayer />

      {/* Fullscreen Vinyl Turntable Modal with Synced Lyrics */}
      <NowPlayingModal />

      {/* In-App Update Modal (Android & iOS) */}
      <UpdateModal
        visible={showUpdateModal}
        updateInfo={updateInfo}
        onClose={() => setShowUpdateModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  scrollContent: {
    paddingHorizontal: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  listContainer: {
    paddingHorizontal: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 12,
    paddingTop: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
  },
  countBadge: {
    backgroundColor: THEME.elevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  countText: {
    fontSize: 9,
    fontWeight: '700',
    color: THEME.textMuted,
    letterSpacing: 0.4,
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: THEME.surface,
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  toggleBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: THEME.accent,
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
