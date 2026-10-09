import React, { useState, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    RefreshControl,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    TextInput,
    Linking,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import Ionicons from '@expo/vector-icons/Ionicons';
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
import LoginModal from '../components/LoginModal';
import PlaylistDetailModal from '../components/PlaylistDetailModal';
import AddToPlaylistModal from '../components/AddToPlaylistModal';
import UpdateModal from '../components/UpdateModal';
import NavDrawer from '../components/NavDrawer';
import { checkAppUpdateAPI } from '../services/versionChecker';
import {
    THEMES,
    THEME,
    APP_BASE_URL,
    space,
    shape,
    font,
    elevation,
    ripple,
    touchTarget,
} from '../config';

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
        setActiveTheme,
        profileName,
        setProfileName,
        currentUser,
        logout,
        isLyricsOpen,
        setIsLyricsOpen,
        isLoginOpen,
        setIsLoginOpen,
        selectedPlaylist,
        setSelectedPlaylist,
        playlistModalSong,
        setPlaylistModalSong,
    } = useAudio();

    const accentColor = activeTheme?.color || THEME.accent;

    // Active Bottom Navigation Tab: 'tracks' | 'search' | 'playlists' | 'settings'
    const [activeNavTab, setActiveNavTab] = useState('tracks');

    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [nameInput, setNameInput] = useState(profileName || 'Listener');

    const [updateInfo, setUpdateInfo] = useState(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Check for app updates on mount
    useEffect(() => {
        async function checkForUpdates() {
            const info = await checkAppUpdateAPI();
            if (info && info.hasUpdate) {
                setUpdateInfo(info);
                setShowUpdateModal(true);
            }
        }
        void checkForUpdates();
    }, []);

    const handleNavTabPress = (tab) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        setActiveNavTab(tab);
    };

    const handleToggleView = (mode) => {
        if (mode !== viewMode) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                () => {},
            );
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
                return (
                    title.includes(q) ||
                    artist.includes(q) ||
                    album.includes(q) ||
                    genre.includes(q)
                );
            });
        }

        // Filter Chips
        if (activeFilter === 'favorites') {
            result = result.filter((s) => safeFavorites.includes(s.id));
        } else if (activeFilter === 'lossless') {
            result = result.filter((s) => {
                const raw = String(
                    s?.rawSrc || s?.audio_file || s?.src || '',
                ).toLowerCase();
                const genre = String(s?.genre || '').toLowerCase();
                return (
                    raw.includes('.flac') ||
                    raw.includes('.wav') ||
                    genre.includes('rock')
                );
            });
        } else if (activeFilter !== 'all') {
            result = result.filter((s) =>
                String(s?.genre || '')
                    .toLowerCase()
                    .includes(activeFilter.toLowerCase()),
            );
        }

        return result;
    }, [safeSongs, searchQuery, activeFilter, safeFavorites]);

    const handleSaveProfileName = () => {
        if (nameInput.trim()) {
            setProfileName(nameInput.trim());
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
            ).catch(() => {});
        }
    };

    const handleSelectTheme = (t) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        setActiveTheme(t);
    };

    const handleLogoutPress = async () => {
        Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Warning,
        ).catch(() => {});
        await logout();
    };

    const currentThemeId = activeTheme?.id || 'default';

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Tab: TRACKS (Beranda Lagu) */}
            {activeNavTab === 'tracks' && (
                <View style={styles.tabScreen}>
                    <Header
                        trackCount={safeSongs.length}
                        onLogoPress={() => setIsDrawerOpen(true)}
                    />

                    {/* Filter Chips Row */}
                    <FilterChips
                        activeFilter={activeFilter}
                        onSelectFilter={handleFilterSelect}
                    />

                    {loading && safeSongs.length === 0 ? (
                        <View style={styles.centerBox}>
                            <ActivityIndicator
                                size="large"
                                color={accentColor}
                            />
                            <Text style={styles.loadingText}>
                                Menghubungkan ke Server Spotirid...
                            </Text>
                        </View>
                    ) : (
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={[
                                styles.scrollContent,
                                {
                                    paddingBottom: currentSong
                                        ? insets.bottom + 140
                                        : insets.bottom + 80,
                                },
                            ]}
                            refreshControl={
                                <RefreshControl
                                    refreshing={loading}
                                    onRefresh={refreshData}
                                    tintColor={accentColor}
                                />
                            }
                        >
                            {/* Bento Spotlight (Featured Vinyl) */}
                            {activeFilter === 'all' && <HeroSpotlight />}

                            {/* Section Header with View Toggle (Grid / List) */}
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionTitleRow}>
                                    <Text style={styles.sectionTitle}>
                                        Lagu Pilihan
                                    </Text>
                                    <View style={styles.countBadge}>
                                        <Text style={styles.countText}>
                                            {filteredSongs.length} LAGU
                                        </Text>
                                    </View>
                                </View>

                                {/* Grid / List Mode Switcher */}
                                <View style={styles.toggleGroup}>
                                    <TouchableOpacity
                                        onPress={() => handleToggleView('grid')}
                                        android_ripple={ripple.borderless(
                                            'rgba(255,255,255,0.16)',
                                            22,
                                        )}
                                        style={[
                                            styles.toggleBtn,
                                            viewMode === 'grid' && [
                                                styles.toggleBtnActive,
                                                {
                                                    backgroundColor:
                                                        accentColor,
                                                },
                                            ],
                                        ]}
                                        hitSlop={{
                                            top: 8,
                                            bottom: 8,
                                            left: 8,
                                            right: 8,
                                        }}
                                    >
                                        <Ionicons
                                            name="grid"
                                            size={14}
                                            color={
                                                viewMode === 'grid'
                                                    ? '#000'
                                                    : THEME.textMuted
                                            }
                                        />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => handleToggleView('list')}
                                        android_ripple={ripple.borderless(
                                            'rgba(255,255,255,0.16)',
                                            22,
                                        )}
                                        style={[
                                            styles.toggleBtn,
                                            viewMode === 'list' && [
                                                styles.toggleBtnActive,
                                                {
                                                    backgroundColor:
                                                        accentColor,
                                                },
                                            ],
                                        ]}
                                        hitSlop={{
                                            top: 8,
                                            bottom: 8,
                                            left: 8,
                                            right: 8,
                                        }}
                                    >
                                        <Ionicons
                                            name="list"
                                            size={15}
                                            color={
                                                viewMode === 'list'
                                                    ? '#000'
                                                    : THEME.textMuted
                                            }
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Tracks Display */}
                            {filteredSongs.length === 0 ? (
                                <View style={styles.emptyBox}>
                                    <Ionicons
                                        name="musical-notes-outline"
                                        size={48}
                                        color={THEME.textMuted}
                                    />
                                    <Text style={styles.emptyTitle}>
                                        Tidak ada lagu ditemukan
                                    </Text>
                                    <Text style={styles.emptySubtitle}>
                                        Belum ada lagu untuk filter ini
                                    </Text>
                                </View>
                            ) : viewMode === 'grid' ? (
                                <View style={styles.gridContainer}>
                                    {filteredSongs.map((item) => {
                                        const isCurrent =
                                            currentSong &&
                                            currentSong.id === item.id;
                                        const isLiked = safeFavorites.includes(
                                            item.id,
                                        );
                                        return (
                                            <SongCard
                                                key={String(item.id)}
                                                song={item}
                                                isCurrent={isCurrent}
                                                isPlaying={isPlaying}
                                                isLiked={isLiked}
                                                onPlay={() =>
                                                    playSong(
                                                        item,
                                                        filteredSongs,
                                                    )
                                                }
                                                onToggleLike={() =>
                                                    toggleFavorite(item.id)
                                                }
                                                onAddToPlaylist={() =>
                                                    setPlaylistModalSong(item)
                                                }
                                                activeTheme={activeTheme}
                                            />
                                        );
                                    })}
                                </View>
                            ) : (
                                <View style={styles.listContainer}>
                                    {filteredSongs.map((item) => {
                                        const isCurrent =
                                            currentSong &&
                                            currentSong.id === item.id;
                                        const isLiked = safeFavorites.includes(
                                            item.id,
                                        );
                                        return (
                                            <SongItem
                                                key={String(item.id)}
                                                song={item}
                                                isCurrent={isCurrent}
                                                isPlaying={isPlaying}
                                                isLiked={isLiked}
                                                onPlay={() =>
                                                    playSong(
                                                        item,
                                                        filteredSongs,
                                                    )
                                                }
                                                onToggleLike={() =>
                                                    toggleFavorite(item.id)
                                                }
                                                onAddToPlaylist={() =>
                                                    setPlaylistModalSong(item)
                                                }
                                                activeTheme={activeTheme}
                                            />
                                        );
                                    })}
                                </View>
                            )}
                        </ScrollView>
                    )}
                </View>
            )}

            {/* Tab: PENCARIAN (Search Screen) */}
            {activeNavTab === 'search' && (
                <View style={styles.tabScreen}>
                    <View style={styles.tabScreenHeader}>
                        <Text style={styles.tabScreenTitle}>Pencarian</Text>
                        <Text style={styles.tabScreenSub}>
                            Cari judul lagu, artis, atau album...
                        </Text>
                    </View>

                    <SearchBar
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onClear={() => setSearchQuery('')}
                    />

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={[
                            styles.scrollContent,
                            {
                                paddingBottom: currentSong
                                    ? insets.bottom + 140
                                    : insets.bottom + 80,
                            },
                        ]}
                    >
                        <View style={styles.listContainer}>
                            {filteredSongs.map((item) => {
                                const isCurrent =
                                    currentSong && currentSong.id === item.id;
                                const isLiked = safeFavorites.includes(item.id);
                                return (
                                    <SongItem
                                        key={String(item.id)}
                                        song={item}
                                        isCurrent={isCurrent}
                                        isPlaying={isPlaying}
                                        isLiked={isLiked}
                                        onPlay={() =>
                                            playSong(item, filteredSongs)
                                        }
                                        onToggleLike={() =>
                                            toggleFavorite(item.id)
                                        }
                                        onAddToPlaylist={() =>
                                            setPlaylistModalSong(item)
                                        }
                                        activeTheme={activeTheme}
                                    />
                                );
                            })}
                        </View>
                    </ScrollView>
                </View>
            )}

            {/* Tab: PLAYLIST (Playlists Screen) */}
            {activeNavTab === 'playlists' && (
                <View style={styles.tabScreen}>
                    <View style={styles.playlistHeaderRow}>
                        <View>
                            <Text style={styles.tabScreenTitle}>
                                Koleksi Playlist
                            </Text>
                            <Text style={styles.tabScreenSub}>
                                Daftar playlist yang siap didengarkan
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.createPlBtn,
                                { backgroundColor: accentColor },
                            ]}
                            onPress={() =>
                                setPlaylistModalSong({
                                    id: 0,
                                    title: 'Playlist Baru',
                                    artist: 'Kustom',
                                })
                            }
                            activeOpacity={0.8}
                            android_ripple={ripple.bounded()}
                        >
                            <Ionicons name="add" size={16} color="#000" />
                            <Text style={styles.createPlText}>
                                Buat Playlist
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={[
                            styles.scrollContent,
                            {
                                paddingBottom: currentSong
                                    ? insets.bottom + 140
                                    : insets.bottom + 80,
                            },
                        ]}
                        refreshControl={
                            <RefreshControl
                                refreshing={loading}
                                onRefresh={refreshData}
                                tintColor={accentColor}
                            />
                        }
                    >
                        {safePlaylists.length === 0 ? (
                            <View style={styles.emptyBox}>
                                <Ionicons
                                    name="albums-outline"
                                    size={48}
                                    color={THEME.textMuted}
                                />
                                <Text style={styles.emptyTitle}>
                                    Belum ada playlist
                                </Text>
                                <Text style={styles.emptySubtitle}>
                                    Buat playlist pertamamu sekarang!
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.gridContainer}>
                                {safePlaylists.map((pl) => (
                                    <PlaylistCard
                                        key={String(pl.id)}
                                        playlist={pl}
                                        onOpen={() => setSelectedPlaylist(pl)}
                                        onPlayAll={() => {
                                            const locked =
                                                pl.isLocked ??
                                                (pl.status &&
                                                    pl.status !== 'approved');
                                            if (
                                                locked &&
                                                currentUser?.role !== 'admin'
                                            ) {
                                                Alert.alert(
                                                    'Belum Disetujui',
                                                    'Playlist ini masih menunggu persetujuan admin.',
                                                );
                                                return;
                                            }
                                            playPlaylist(pl);
                                        }}
                                        activeTheme={activeTheme}
                                    />
                                ))}
                            </View>
                        )}
                    </ScrollView>
                </View>
            )}

            {/* Tab: PENGATURAN (Settings Screen) */}
            {activeNavTab === 'settings' && (
                <View style={styles.tabScreen}>
                    <View style={styles.tabScreenHeader}>
                        <Text style={styles.tabScreenTitle}>Pengaturan</Text>
                        <Text style={styles.tabScreenSub}>
                            Pengaturan profil, tema warna, dan sistem
                        </Text>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={[
                            styles.scrollContent,
                            {
                                paddingBottom: currentSong
                                    ? insets.bottom + 140
                                    : insets.bottom + 80,
                                gap: space.lg,
                            },
                        ]}
                    >
                        {/* Account Status */}
                        <View style={styles.settingsSection}>
                            <Text style={styles.settingsSectionLabel}>
                                STATUS AKUN
                            </Text>
                            {currentUser ? (
                                <View style={styles.card}>
                                    <View style={styles.userRow}>
                                        <View
                                            style={[
                                                styles.avatar,
                                                {
                                                    backgroundColor:
                                                        accentColor,
                                                },
                                            ]}
                                        >
                                            <Text style={styles.avatarText}>
                                                {(currentUser.name || 'U')
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </Text>
                                        </View>
                                        <View style={styles.userInfo}>
                                            <Text style={styles.userName}>
                                                {currentUser.name}
                                            </Text>
                                            <Text style={styles.userEmail}>
                                                {currentUser.email}
                                            </Text>
                                            <View style={styles.roleBadge}>
                                                <Text style={styles.roleText}>
                                                    {(
                                                        currentUser.role ||
                                                        'MEMBER'
                                                    ).toUpperCase()}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.logoutBtn}
                                        onPress={handleLogoutPress}
                                        activeOpacity={0.7}
                                        android_ripple={ripple.bounded()}
                                    >
                                        <Ionicons
                                            name="log-out-outline"
                                            size={16}
                                            color="#ef4444"
                                        />
                                        <Text style={styles.logoutBtnText}>
                                            Keluar dari Akun
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.card}>
                                    <Text style={styles.guestTitle}>
                                        Anda masuk sebagai Tamu (Guest)
                                    </Text>
                                    <Text style={styles.guestSubtitle}>
                                        Login dengan akun Anda untuk
                                        sinkronisasi playlist dan pengajuan
                                        lagu.
                                    </Text>
                                    <TouchableOpacity
                                        style={[
                                            styles.loginBtn,
                                            { backgroundColor: accentColor },
                                        ]}
                                        onPress={() => setIsLoginOpen(true)}
                                        activeOpacity={0.8}
                                        android_ripple={ripple.bounded()}
                                    >
                                        <Ionicons
                                            name="log-in-outline"
                                            size={18}
                                            color="#000"
                                        />
                                        <Text style={styles.loginBtnText}>
                                            Masuk ke Akun
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        {/* Profile Name */}
                        <View style={styles.settingsSection}>
                            <Text style={styles.settingsSectionLabel}>
                                NAMA PANGGILAN
                            </Text>
                            <View style={styles.card}>
                                <View style={styles.inputRow}>
                                    <TextInput
                                        style={styles.textInput}
                                        value={nameInput}
                                        onChangeText={setNameInput}
                                        placeholder="Nama sapaan..."
                                        placeholderTextColor={THEME.textMuted}
                                        maxLength={30}
                                    />
                                    <TouchableOpacity
                                        style={[
                                            styles.saveBtn,
                                            { backgroundColor: accentColor },
                                        ]}
                                        onPress={handleSaveProfileName}
                                        android_ripple={ripple.bounded()}
                                    >
                                        <Text style={styles.saveBtnText}>
                                            Simpan
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        {/* Theme Selector */}
                        <View style={styles.settingsSection}>
                            <Text style={styles.settingsSectionLabel}>
                                TEMA & AKSEN WARNA
                            </Text>
                            <View style={styles.card}>
                                <View style={styles.themesGrid}>
                                    {THEMES.map((t) => {
                                        const isSelected =
                                            currentThemeId === t.id;
                                        return (
                                            <TouchableOpacity
                                                key={t.id}
                                                style={[
                                                    styles.themeItem,
                                                    isSelected && {
                                                        borderColor: t.color,
                                                        backgroundColor:
                                                            'rgba(255,255,255,0.06)',
                                                    },
                                                ]}
                                                onPress={() =>
                                                    handleSelectTheme(t)
                                                }
                                                activeOpacity={0.7}
                                                android_ripple={ripple.bounded()}
                                            >
                                                <View
                                                    style={[
                                                        styles.colorDot,
                                                        {
                                                            backgroundColor:
                                                                t.color,
                                                        },
                                                    ]}
                                                />
                                                <Text
                                                    style={[
                                                        styles.themeName,
                                                        isSelected && {
                                                            color: '#fff',
                                                            fontWeight: '800',
                                                        },
                                                    ]}
                                                >
                                                    {t.name}
                                                </Text>
                                                {isSelected && (
                                                    <Ionicons
                                                        name="checkmark-circle"
                                                        size={16}
                                                        color={t.color}
                                                        style={styles.checkIcon}
                                                    />
                                                )}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        </View>

                        {/* Web Admin Portal Shortcut */}
                        <View style={styles.settingsSection}>
                            <TouchableOpacity
                                style={styles.adminBtn}
                                onPress={() => {
                                    Linking.openURL(
                                        `${APP_BASE_URL}/admin/login`,
                                    ).catch(() => {});
                                }}
                                activeOpacity={0.8}
                                android_ripple={ripple.bounded()}
                            >
                                <Ionicons
                                    name="shield-checkmark"
                                    size={18}
                                    color="#000"
                                />
                                <Text style={styles.adminBtnText}>
                                    Buka Web Admin Portal Spotirid
                                </Text>
                                <Ionicons
                                    name="open-outline"
                                    size={16}
                                    color="#000"
                                    style={{ marginLeft: 'auto' }}
                                />
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            )}

            {/* Floating Bottom Mini Player (Above Bottom Navigation Bar) */}
            <MiniPlayer />

            {/* Frosted Glass Bottom Navigation Bar (Instagram & Telegram Glassmorphism) */}
            <View
                style={[
                    styles.bottomNavBarWrapper,
                    { height: 56 + Math.max(insets.bottom, 10) },
                ]}
            >
                <BlurView
                    intensity={90}
                    tint="dark"
                    style={[
                        styles.glassNavBar,
                        { paddingBottom: Math.max(insets.bottom, 10) },
                    ]}
                >
                    <TouchableOpacity
                        style={styles.navBarItem}
                        onPress={() => handleNavTabPress('tracks')}
                        activeOpacity={0.7}
                        android_ripple={ripple.bounded()}
                    >
                        <View
                            style={[
                                styles.iconPill,
                                activeNavTab === 'tracks' && {
                                    backgroundColor: accentColor + '22',
                                },
                            ]}
                        >
                            <Ionicons
                                name={
                                    activeNavTab === 'tracks'
                                        ? 'musical-notes'
                                        : 'musical-notes-outline'
                                }
                                size={21}
                                color={
                                    activeNavTab === 'tracks'
                                        ? accentColor
                                        : THEME.textMuted
                                }
                            />
                        </View>
                        <Text
                            style={[
                                styles.navBarLabel,
                                activeNavTab === 'tracks' && [
                                    styles.navBarLabelActive,
                                    { color: accentColor },
                                ],
                            ]}
                        >
                            Lagu
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.navBarItem}
                        onPress={() => handleNavTabPress('search')}
                        activeOpacity={0.7}
                        android_ripple={ripple.bounded()}
                    >
                        <View
                            style={[
                                styles.iconPill,
                                activeNavTab === 'search' && {
                                    backgroundColor: accentColor + '22',
                                },
                            ]}
                        >
                            <Ionicons
                                name={
                                    activeNavTab === 'search'
                                        ? 'search'
                                        : 'search-outline'
                                }
                                size={21}
                                color={
                                    activeNavTab === 'search'
                                        ? accentColor
                                        : THEME.textMuted
                                }
                            />
                        </View>
                        <Text
                            style={[
                                styles.navBarLabel,
                                activeNavTab === 'search' && [
                                    styles.navBarLabelActive,
                                    { color: accentColor },
                                ],
                            ]}
                        >
                            Pencarian
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.navBarItem}
                        onPress={() => handleNavTabPress('playlists')}
                        activeOpacity={0.7}
                        android_ripple={ripple.bounded()}
                    >
                        <View
                            style={[
                                styles.iconPill,
                                activeNavTab === 'playlists' && {
                                    backgroundColor: accentColor + '22',
                                },
                            ]}
                        >
                            <Ionicons
                                name={
                                    activeNavTab === 'playlists'
                                        ? 'albums'
                                        : 'albums-outline'
                                }
                                size={21}
                                color={
                                    activeNavTab === 'playlists'
                                        ? accentColor
                                        : THEME.textMuted
                                }
                            />
                        </View>
                        <Text
                            style={[
                                styles.navBarLabel,
                                activeNavTab === 'playlists' && [
                                    styles.navBarLabelActive,
                                    { color: accentColor },
                                ],
                            ]}
                        >
                            Playlist
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.navBarItem}
                        onPress={() => handleNavTabPress('settings')}
                        activeOpacity={0.7}
                        android_ripple={ripple.bounded()}
                    >
                        <View
                            style={[
                                styles.iconPill,
                                activeNavTab === 'settings' && {
                                    backgroundColor: accentColor + '22',
                                },
                            ]}
                        >
                            <Ionicons
                                name={
                                    activeNavTab === 'settings'
                                        ? 'settings-sharp'
                                        : 'settings-outline'
                                }
                                size={21}
                                color={
                                    activeNavTab === 'settings'
                                        ? accentColor
                                        : THEME.textMuted
                                }
                            />
                        </View>
                        <Text
                            style={[
                                styles.navBarLabel,
                                activeNavTab === 'settings' && [
                                    styles.navBarLabelActive,
                                    { color: accentColor },
                                ],
                            ]}
                        >
                            Pengaturan
                        </Text>
                    </TouchableOpacity>
                </BlurView>
            </View>

            {/* Fullscreen Vinyl Turntable Modal with Synced Lyrics & Swipe Down to Minimize */}
            <NowPlayingModal />

            {/* Synced Lyrics Sheet Modal */}
            <LyricsModal
                visible={isLyricsOpen}
                onClose={() => setIsLyricsOpen(false)}
            />

            {/* Login Modal */}
            <LoginModal
                visible={isLoginOpen}
                onClose={() => setIsLoginOpen(false)}
            />

            {/* Playlist Detail Modal */}
            {selectedPlaylist ? (
                <PlaylistDetailModal
                    visible={!!selectedPlaylist}
                    playlist={selectedPlaylist}
                    onClose={() => setSelectedPlaylist(null)}
                />
            ) : null}

            {/* Add To Playlist Modal */}
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

            {/* Logo-triggered Navigation Drawer */}
            <NavDrawer
                visible={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                onNavigate={handleNavTabPress}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.bg,
    },
    tabScreen: {
        flex: 1,
    },
    tabScreenHeader: {
        paddingHorizontal: space.lg,
        paddingTop: space.md,
        paddingBottom: space.sm,
    },
    tabScreenTitle: {
        ...font.headlineSmall,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: -0.5,
    },
    tabScreenSub: {
        ...font.bodySmall,
        color: THEME.textMuted,
        marginTop: space.xs,
        marginBottom: space.sm,
    },
    scrollContent: {
        paddingHorizontal: space.sm,
        paddingTop: space.xs,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: space.sm,
    },
    listContainer: {
        paddingHorizontal: space.xs,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: space.md,
        marginBottom: space.md,
        paddingTop: space.sm,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.sm,
    },
    sectionTitle: {
        ...font.titleMedium,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: -0.3,
    },
    countBadge: {
        backgroundColor: THEME.elevated,
        paddingHorizontal: space.sm,
        paddingVertical: space.xs,
        borderRadius: shape.md,
        borderWidth: 1,
        borderColor: THEME.border,
    },
    countText: {
        ...font.labelSmall,
        fontWeight: '700',
        color: THEME.textMuted,
        letterSpacing: 0.4,
    },
    toggleGroup: {
        flexDirection: 'row',
        backgroundColor: THEME.surface,
        borderRadius: shape.full,
        padding: space.xs,
        borderWidth: 1,
        borderColor: THEME.border,
    },
    toggleBtn: {
        width: 44,
        height: 44,
        borderRadius: shape.full,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    toggleBtnActive: {},
    playlistHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: space.lg,
        marginBottom: space.md,
        paddingTop: space.sm,
    },
    createPlBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: space.sm,
        paddingHorizontal: space.lg,
        paddingVertical: space.sm,
        borderRadius: shape.full,
        overflow: 'hidden',
    },
    createPlText: {
        ...font.labelMedium,
        fontWeight: '800',
        color: '#000',
    },
    centerBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: space.md,
    },
    loadingText: {
        ...font.bodyMedium,
        color: THEME.textMuted,
        fontWeight: '500',
    },
    emptyBox: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: space.xxl,
        paddingHorizontal: space.xl,
        gap: space.sm,
    },
    emptyTitle: {
        ...font.titleMedium,
        fontWeight: '700',
        color: '#fff',
    },
    emptySubtitle: {
        ...font.bodySmall,
        color: THEME.textMuted,
        textAlign: 'center',
    },
    bottomNavBarWrapper: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.12)',
        overflow: 'hidden',
        ...elevation[3],
    },
    glassNavBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: 'rgba(13, 14, 17, 0.75)',
    },
    navBarItem: {
        flex: 1,
        ...touchTarget,
        paddingTop: space.sm,
        gap: space.xs,
    },
    iconPill: {
        paddingHorizontal: space.md,
        paddingVertical: space.xs,
        borderRadius: shape.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    navBarLabel: {
        ...font.labelSmall,
        fontWeight: '600',
        color: THEME.textMuted,
    },
    navBarLabelActive: {
        fontWeight: '800',
    },
    settingsSection: {
        gap: space.sm,
    },
    settingsSectionLabel: {
        ...font.labelSmall,
        fontWeight: '800',
        color: THEME.textMuted,
        letterSpacing: 0.8,
    },
    card: {
        backgroundColor: THEME.surface,
        borderRadius: shape.lg,
        borderWidth: 1,
        borderColor: THEME.border,
        padding: space.lg,
        ...elevation[1],
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.md,
        marginBottom: space.md,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: shape.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        ...font.titleMedium,
        fontWeight: '800',
        color: '#000',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        ...font.titleMedium,
        fontWeight: '800',
        color: '#fff',
    },
    userEmail: {
        ...font.bodySmall,
        color: THEME.textMuted,
        marginTop: space.xs,
    },
    roleBadge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        paddingHorizontal: space.sm,
        paddingVertical: space.xs,
        borderRadius: shape.xs,
        marginTop: space.xs,
    },
    roleText: {
        ...font.labelSmall,
        fontWeight: '800',
        color: '#fff',
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: space.sm,
        paddingVertical: space.md,
        borderRadius: shape.md,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.25)',
        overflow: 'hidden',
    },
    logoutBtnText: {
        ...font.labelMedium,
        fontWeight: '700',
        color: '#fca5a5',
    },
    guestTitle: {
        ...font.titleSmall,
        fontWeight: '700',
        color: '#fff',
        marginBottom: space.xs,
    },
    guestSubtitle: {
        ...font.bodySmall,
        color: THEME.textMuted,
        marginBottom: space.lg,
    },
    loginBtn: {
        height: 42,
        borderRadius: shape.full,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: space.sm,
        overflow: 'hidden',
    },
    loginBtnText: {
        ...font.labelLarge,
        fontWeight: '800',
        color: '#000',
    },
    inputRow: {
        flexDirection: 'row',
        gap: space.sm,
    },
    textInput: {
        ...font.bodyMedium,
        flex: 1,
        height: 42,
        backgroundColor: THEME.elevated,
        borderRadius: shape.md,
        borderWidth: 1,
        borderColor: THEME.border,
        paddingHorizontal: space.md,
        color: '#fff',
    },
    saveBtn: {
        height: 42,
        paddingHorizontal: space.lg,
        borderRadius: shape.md,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    saveBtnText: {
        ...font.labelLarge,
        fontWeight: '800',
        color: '#000',
    },
    themesGrid: {
        gap: space.sm,
    },
    themeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: space.md,
        borderRadius: shape.md,
        borderWidth: 1,
        borderColor: 'transparent',
        backgroundColor: THEME.elevated,
        overflow: 'hidden',
    },
    colorDot: {
        width: 18,
        height: 18,
        borderRadius: shape.full,
        marginRight: space.md,
    },
    themeName: {
        ...font.labelLarge,
        color: THEME.textMuted,
        flex: 1,
    },
    checkIcon: {
        marginLeft: space.sm,
    },
    adminBtn: {
        height: 46,
        borderRadius: shape.full,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: space.lg,
        gap: space.sm,
        overflow: 'hidden',
    },
    adminBtnText: {
        ...font.labelLarge,
        fontWeight: '800',
        color: '#000',
    },
});
