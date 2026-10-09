import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    Animated,
    PanResponder,
    Dimensions,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import BrandMark from './BrandMark';
import { useAudio } from '../context/AudioContext';
import { THEME, space, shape, font, elevation, ripple } from '../config';
import { CURRENT_APP_VERSION } from '../services/versionChecker';
import { getLocalStats } from '../services/localStats';
import {
    getCacheSizeBytes,
    clearAppCache,
    formatBytes,
} from '../services/cache';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(320, SCREEN_WIDTH * 0.82);

const ABOUT_MESSAGE =
    'Aplikasi ini tidak dibuat untuk menyaingi Spotify jadi enjoy saja mendengarkan musicnya oke.';

const NAV_ITEMS = [
    { id: 'tracks', label: 'Lagu', icon: 'musical-notes' },
    { id: 'search', label: 'Pencarian', icon: 'search' },
    { id: 'playlists', label: 'Playlist', icon: 'albums' },
    { id: 'settings', label: 'Pengaturan', icon: 'settings' },
];

export default function NavDrawer({ visible, onClose, onNavigate }) {
    const insets = useSafeAreaInsets();
    const { activeTheme } = useAudio();
    const accentColor = activeTheme?.color || THEME.accent;

    const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

    const [stats, setStats] = useState(null);
    const [cacheSize, setCacheSize] = useState(0);
    const [clearing, setClearing] = useState(false);

    const loadInfo = useCallback(async () => {
        const [statsData, size] = await Promise.all([
            getLocalStats(),
            Promise.resolve(getCacheSizeBytes()),
        ]);
        setStats(statsData);
        setCacheSize(size);
    }, []);

    useEffect(() => {
        if (visible) {
            Animated.spring(translateX, {
                toValue: 0,
                bounciness: 4,
                speed: 14,
                useNativeDriver: true,
            }).start();
            void loadInfo();
        } else {
            translateX.setValue(-DRAWER_WIDTH);
        }
    }, [visible, loadInfo]);

    const handleClose = useCallback(() => {
        Animated.timing(translateX, {
            toValue: -DRAWER_WIDTH,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            onClose();
        });
    }, [onClose, translateX]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return (
                    gestureState.dx < -8 &&
                    Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5
                );
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dx < 0) {
                    translateX.setValue(gestureState.dx);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dx < -60 || gestureState.vx < -0.3) {
                    handleClose();
                } else {
                    Animated.spring(translateX, {
                        toValue: 0,
                        bounciness: 4,
                        useNativeDriver: true,
                    }).start();
                }
            },
        }),
    ).current;

    const handleNavigate = (tab) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        if (onNavigate) onNavigate(tab);
        handleClose();
    };

    const handleClearCache = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        setClearing(true);
        await clearAppCache();
        setCacheSize(getCacheSizeBytes());
        setClearing(false);
        Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
        ).catch(() => {});
    };

    if (!visible) return null;

    const topSongs = stats?.topSongs || [];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={handleClose}
                />

                <Animated.View
                    style={[styles.drawer, { transform: [{ translateX }] }]}
                    {...panResponder.panHandlers}
                >
                    <View
                        style={{
                            paddingTop: Math.max(insets.top, space.lg),
                            paddingBottom: Math.max(insets.bottom, space.md),
                            flex: 1,
                        }}
                    >
                        {/* Brand Header */}
                        <View style={styles.brandRow}>
                            <BrandMark size={30} color={accentColor} />
                            <View style={styles.brandTextBox}>
                                <Text style={styles.brandTitle}>Spotirid</Text>
                                <Text style={styles.brandSubtitle}>
                                    Local Music Player
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={handleClose}
                                style={styles.closeBtn}
                                android_ripple={ripple.borderless(
                                    'rgba(255,255,255,0.16)',
                                    22,
                                )}
                                hitSlop={{
                                    top: 10,
                                    bottom: 10,
                                    left: 10,
                                    right: 10,
                                }}
                            >
                                <Ionicons name="close" size={22} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.scrollContent}
                        >
                            {/* Navigation */}
                            <View style={styles.navGroup}>
                                {NAV_ITEMS.map((item) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={styles.navItem}
                                        onPress={() => handleNavigate(item.id)}
                                        android_ripple={ripple.bounded()}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons
                                            name={item.icon}
                                            size={19}
                                            color={accentColor}
                                        />
                                        <Text style={styles.navItemText}>
                                            {item.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* About */}
                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>
                                    TENTANG APLIKASI
                                </Text>
                                <View style={styles.card}>
                                    <Text style={styles.aboutText}>
                                        {ABOUT_MESSAGE}
                                    </Text>
                                    <View style={styles.divider} />
                                    <Text style={styles.aboutSub}>
                                        Semua lagu diputar langsung di perangkat
                                        kamu (pemutaran lokal). Tidak ada audio
                                        yang diunggah atau disimpan ke server.
                                    </Text>
                                </View>
                            </View>

                            {/* Local Stats */}
                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>
                                    STATISTIK DIDENGARKAN
                                </Text>
                                <View style={styles.card}>
                                    {stats ? (
                                        <>
                                            <View style={styles.statsRow}>
                                                <View style={styles.statBox}>
                                                    <Text
                                                        style={[
                                                            styles.statValue,
                                                            {
                                                                color: accentColor,
                                                            },
                                                        ]}
                                                    >
                                                        {stats.totalPlays}
                                                    </Text>
                                                    <Text
                                                        style={styles.statLabel}
                                                    >
                                                        Lagu Diputar
                                                    </Text>
                                                </View>
                                                <View style={styles.statBox}>
                                                    <Text
                                                        style={[
                                                            styles.statValue,
                                                            {
                                                                color: accentColor,
                                                            },
                                                        ]}
                                                    >
                                                        {stats.uniqueSongs}
                                                    </Text>
                                                    <Text
                                                        style={styles.statLabel}
                                                    >
                                                        Lagu Unik
                                                    </Text>
                                                </View>
                                            </View>

                                            <View style={styles.divider} />

                                            <Text style={styles.topLabel}>
                                                TOP 5 PALING DIDENGARKAN
                                            </Text>
                                            {topSongs.length === 0 ? (
                                                <Text style={styles.emptyText}>
                                                    Belum ada riwayat. Putar
                                                    lagu untuk mulai mencatat.
                                                </Text>
                                            ) : (
                                                topSongs.map((song, index) => (
                                                    <View
                                                        key={song.id}
                                                        style={styles.topRow}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.topRank,
                                                                {
                                                                    color: accentColor,
                                                                },
                                                            ]}
                                                        >
                                                            {index + 1}
                                                        </Text>
                                                        <View
                                                            style={
                                                                styles.topInfo
                                                            }
                                                        >
                                                            <Text
                                                                numberOfLines={
                                                                    1
                                                                }
                                                                style={
                                                                    styles.topTitle
                                                                }
                                                            >
                                                                {song.title}
                                                            </Text>
                                                            <Text
                                                                numberOfLines={
                                                                    1
                                                                }
                                                                style={
                                                                    styles.topArtist
                                                                }
                                                            >
                                                                {song.artist}
                                                            </Text>
                                                        </View>
                                                        <Text
                                                            style={
                                                                styles.topCount
                                                            }
                                                        >
                                                            {song.count}x
                                                        </Text>
                                                    </View>
                                                ))
                                            )}
                                        </>
                                    ) : (
                                        <ActivityIndicator
                                            color={accentColor}
                                        />
                                    )}
                                    <Text style={styles.localNote}>
                                        Statistik disimpan hanya di perangkat
                                        ini, tidak dikirim ke server.
                                    </Text>
                                </View>
                            </View>

                            {/* Cache */}
                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>
                                    PENYIMPANAN
                                </Text>
                                <TouchableOpacity
                                    style={styles.cacheBtn}
                                    onPress={handleClearCache}
                                    android_ripple={ripple.bounded()}
                                    activeOpacity={0.8}
                                    disabled={clearing}
                                >
                                    <Ionicons
                                        name="trash-outline"
                                        size={18}
                                        color={accentColor}
                                    />
                                    <View style={styles.cacheText}>
                                        <Text style={styles.cacheTitle}>
                                            {clearing
                                                ? 'Membersihkan...'
                                                : 'Bersihkan Cache'}
                                        </Text>
                                        <Text style={styles.cacheSub}>
                                            {formatBytes(cacheSize)} terpakai
                                            untuk file sementara
                                        </Text>
                                    </View>
                                    <Ionicons
                                        name="chevron-forward"
                                        size={16}
                                        color={THEME.textMuted}
                                    />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.versionText}>
                                Spotirid v{CURRENT_APP_VERSION}
                            </Text>
                        </ScrollView>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        flexDirection: 'row',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    drawer: {
        width: DRAWER_WIDTH,
        height: '100%',
        backgroundColor: THEME.bg,
        borderRightWidth: 1,
        borderRightColor: 'rgba(255, 255, 255, 0.12)',
        elevation: 16,
    },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.md,
        paddingHorizontal: space.lg,
        paddingBottom: space.lg,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    },
    brandTextBox: {
        flex: 1,
    },
    brandTitle: {
        ...font.titleLarge,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: -0.4,
    },
    brandSubtitle: {
        ...font.labelSmall,
        color: THEME.textMuted,
        marginTop: 2,
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: shape.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        padding: space.lg,
        gap: space.lg,
    },
    navGroup: {
        gap: space.xs,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.md,
        paddingVertical: space.md,
        paddingHorizontal: space.md,
        borderRadius: shape.md,
        overflow: 'hidden',
    },
    navItemText: {
        ...font.bodyLarge,
        fontWeight: '600',
        color: '#fff',
    },
    section: {
        gap: space.sm,
    },
    sectionLabel: {
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
    aboutText: {
        ...font.bodyMedium,
        fontWeight: '600',
        color: '#fff',
        lineHeight: 21,
    },
    aboutSub: {
        ...font.bodySmall,
        color: THEME.textMuted,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        marginVertical: space.md,
    },
    statsRow: {
        flexDirection: 'row',
        gap: space.md,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: THEME.elevated,
        borderRadius: shape.md,
        paddingVertical: space.md,
    },
    statValue: {
        ...font.headlineSmall,
        fontWeight: '800',
    },
    statLabel: {
        ...font.labelSmall,
        color: THEME.textMuted,
        marginTop: space.xs,
    },
    topLabel: {
        ...font.labelSmall,
        fontWeight: '800',
        color: THEME.textMuted,
        letterSpacing: 0.6,
        marginBottom: space.sm,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.md,
        paddingVertical: space.sm,
    },
    topRank: {
        ...font.titleMedium,
        fontWeight: '800',
        width: 20,
        textAlign: 'center',
    },
    topInfo: {
        flex: 1,
    },
    topTitle: {
        ...font.bodyMedium,
        fontWeight: '700',
        color: '#fff',
    },
    topArtist: {
        ...font.labelSmall,
        color: THEME.textMuted,
    },
    topCount: {
        ...font.labelMedium,
        fontWeight: '800',
        color: THEME.textMuted,
    },
    emptyText: {
        ...font.bodySmall,
        color: THEME.textMuted,
    },
    localNote: {
        ...font.labelSmall,
        color: THEME.textMuted,
        marginTop: space.md,
        opacity: 0.8,
    },
    cacheBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.md,
        backgroundColor: THEME.surface,
        borderWidth: 1,
        borderColor: THEME.border,
        borderRadius: shape.lg,
        padding: space.lg,
        overflow: 'hidden',
    },
    cacheText: {
        flex: 1,
    },
    cacheTitle: {
        ...font.titleSmall,
        fontWeight: '700',
        color: '#fff',
    },
    cacheSub: {
        ...font.labelSmall,
        color: THEME.textMuted,
        marginTop: 2,
    },
    versionText: {
        ...font.labelSmall,
        color: THEME.textMuted,
        textAlign: 'center',
        opacity: 0.7,
    },
});
