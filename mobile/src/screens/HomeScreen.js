import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
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
import PlaylistCard from '../components/PlaylistCard';
import MiniPlayer from '../components/MiniPlayer';
import NowPlayingModal from '../components/NowPlayingModal';
import LyricsModal from '../components/LyricsModal';
import SettingsModal from '../components/SettingsModal';
import LoginModal from '../components/LoginModal';
import PlaylistDetailModal from '../components/PlaylistDetailModal';
import AddToPlaylistModal from '../components/AddToPlaylistModal';
import UpdateModal from '../components/UpdateModal';
import { checkAppUpdateAPI } from '../services/versionChecker';
import { THEME } from '../config';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const {
    songs,
    playlists,
    loading,
    refreshData,
    currentSong,
    isPlaying,
    playSong,
    playPlaylist,
    favorites,
    toggleFavorite,
    activeTheme,
    isLyricsOpen,
    setIsLyricsOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    isLoginOpen,
    setIsLoginOpen,
    selectedPlaylist,
    setSelectedPlaylist,
    playlistModalSong,
    setPlaylistModalSong,
  } = useAudio();

  const accentColor = activeTheme?.color || THEME.accent;

  // Search Bar Toggle State (starts closed by default, clean & uncluttered)
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const searchAnim = useRef(new Animated.Value(0)).current;

  const [mainTab, setMainTab] = useState('tracks'); // 'tracks' | 'playlists'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [updateInfo, setUpdateInfo] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // Animate search bar slide in/out
  useEffect(() => {
    Animated.spring(searchAnim, {
      toValue: isSearchVisible ? 1 : 0,
      friction: 9,
      tension: 60,
      useNativeDriver: false,
    }).start();
  }, [isSearchVisible]);

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

  const handleToggleSearch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setIsSearchVisible((prev) => !prev);
  };

  const handleToggleMainTab = (tab) => {
    if (tab !== mainTab) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      setMainTab(tab);
    }
  };

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
  const safePlaylists = Array.isArray(playlists) ? playlists : [];
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

  const searchMaxHeight = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 60],
  });

  const searchOpacity = searchAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Header */}
      <Header
        trackCount={safeSongs.length}
        isMenuExpanded={isSearchVisible}
        onToggleMenu={handleToggleSearch}
      />

      {/* Main Tab Switcher: Tracks vs Playlists */}
      <View style={styles.topControlSection}>
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[
              styles.tabItem,
              mainTab === 'tracks' && [styles.tabItemActive, { borderColor: accentColor }],
            ]}
            onPress={() => handleToggleMainTab('tracks')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="musical-notes"
              size={14}
              color={mainTab === 'tracks' ? accentColor : THEME.textMuted}
            />
            <Text
              style={[
                styles.tabLabel,
                mainTab === 'tracks' && { color: '#fff', fontWeight: '800' },
              ]}
            >
              Tracks
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabItem,
              mainTab === 'playlists' && [styles.tabItemActive, { borderColor: accentColor }],
            ]}
            onPress={() => handleToggleMainTab('playlists')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="albums"
              size={14}
              color={mainTab === 'playlists' ? accentColor : THEME.textMuted}
            />
            <Text
              style={[
                styles.tabLabel,
                mainTab === 'playlists' && { color: '#fff', fontWeight: '800' },
              ]}
            >
              Playlists ({safePlaylists.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Collapsible Search Bar: smoothly expands when search icon is tapped */}
        <Animated.View
          style={[
            styles.animatedSearchWrapper,
            {
              maxHeight: searchMaxHeight,
              opacity: searchOpacity,
            },
          ]}
        >
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
          />
        </Animated.View>

        {/* Filter Chips: Compact horizontal pills with strict height and safe margins */}
        {mainTab === 'tracks' && (
          <FilterChips
            activeFilter={activeFilter}
            onSelectFilter={handleFilterSelect}
          />
        )}
      </View>

      {/* Main Content Area */}
      {loading && safeSongs.length === 0 ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={accentColor} />
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
              onRefresh={refreshData}
              tintColor={accentColor}
            />
          }
        >
          {mainTab === 'tracks' ? (
            <>
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
                    style={[
                      styles.toggleBtn,
                      viewMode === 'grid' && [styles.toggleBtnActive, { backgroundColor: accentColor }],
                    ]}
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
                    style={[
                      styles.toggleBtn,
                      viewMode === 'list' && [styles.toggleBtnActive, { backgroundColor: accentColor }],
                    ]}
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
                        onAddToPlaylist={() => setPlaylistModalSong(item)}
                        activeTheme={activeTheme}
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
                        onAddToPlaylist={() => setPlaylistModalSong(item)}
                        activeTheme={activeTheme}
                      />
                    );
                  })}
                </View>
              )}
            </>
          ) : (
            /* Playlists Tab Content */
            <View style={styles.playlistsSection}>
              <View style={styles.playlistHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>Community Playlists</Text>
                  <Text style={styles.playlistSub}>Koleksi kurasi playlist publik & kustom</Text>
                </View>

                <TouchableOpacity
                  style={[styles.createPlBtn, { backgroundColor: accentColor }]}
                  onPress={() =>
                    setPlaylistModalSong({ id: 0, title: 'New Playlist', artist: 'Custom' })
                  }
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={16} color="#000" />
                  <Text style={styles.createPlText}>Buat</Text>
                </TouchableOpacity>
              </View>

              {safePlaylists.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Ionicons name="albums-outline" size={48} color={THEME.textMuted} />
                  <Text style={styles.emptyTitle}>Belum ada playlist</Text>
                  <Text style={styles.emptySubtitle}>Buat playlist pertamamu sekarang!</Text>
                </View>
              ) : (
                <View style={styles.gridContainer}>
                  {safePlaylists.map((pl) => (
                    <PlaylistCard
                      key={String(pl.id)}
                      playlist={pl}
                      onOpen={() => setSelectedPlaylist(pl)}
                      onPlayAll={() => playPlaylist(pl)}
                      activeTheme={activeTheme}
                    />
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      )}

      {/* Floating Bottom Mini Player (Spotify Style) */}
      <MiniPlayer />

      {/* Fullscreen Vinyl Turntable Modal */}
      <NowPlayingModal />

      {/* Synced Lyrics Sheet Modal */}
      <LyricsModal
        visible={isLyricsOpen}
        onClose={() => setIsLyricsOpen(false)}
      />

      {/* Settings Modal (Theme, Profile, Audio Engine) */}
      <SettingsModal
        visible={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Login Modal */}
      <LoginModal
        visible={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />

      {/* Playlist Detail Modal (Mounted only when a playlist is selected) */}
      {selectedPlaylist ? (
        <PlaylistDetailModal
          visible={!!selectedPlaylist}
          playlist={selectedPlaylist}
          onClose={() => setSelectedPlaylist(null)}
        />
      ) : null}

      {/* Add To Playlist Modal (Mounted only when a target song is selected) */}
      {playlistModalSong ? (
        <AddToPlaylistModal
          visible={!!playlistModalSong}
          song={playlistModalSong}
          onClose={() => setPlaylistModalSong(null)}
        />
      ) : null}

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
  topControlSection: {
    paddingBottom: 4,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  tabItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.textMuted,
  },
  animatedSearchWrapper: {
    overflow: 'hidden',
  },
  scrollContent: {
    paddingHorizontal: 8,
    paddingTop: 8,
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
    paddingTop: 8,
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
  toggleBtnActive: {},
  playlistsSection: {
    paddingHorizontal: 8,
  },
  playlistHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 14,
    marginTop: 4,
  },
  playlistSub: {
    fontSize: 12,
    color: THEME.textMuted,
    marginTop: 2,
  },
  createPlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  createPlText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000',
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
  },
  emptySubtitle: {
    fontSize: 12,
    color: THEME.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
