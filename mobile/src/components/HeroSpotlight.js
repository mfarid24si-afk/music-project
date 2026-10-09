import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Easing,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAudio } from '../context/AudioContext';
import { THEME, space, shape, font, elevation, ripple } from '../config';

const DEFAULT_COVER =
    'https://farid-peminjaman.alwaysdata.net/assets/covers/believer.jpg';

export default function HeroSpotlight() {
    const {
        songs,
        currentSong,
        isPlaying,
        togglePlay,
        playSong,
        favorites,
        toggleFavorite,
        setIsNowPlayingOpen,
        activeTheme,
    } = useAudio();

    const spinAnim = useRef(new Animated.Value(0)).current;
    const accentColor = activeTheme?.color || THEME.accent;

    // Use currently playing song or default to first song in archive
    const displaySong =
        currentSong ||
        (Array.isArray(songs) && songs.length > 0 ? songs[0] : null);
    const isCurrentlyPlayingThis =
        currentSong &&
        displaySong &&
        currentSong.id === displaySong.id &&
        isPlaying;

    useEffect(() => {
        let anim;
        if (isCurrentlyPlayingThis) {
            anim = Animated.loop(
                Animated.timing(spinAnim, {
                    toValue: 1,
                    duration: 6000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
            );
            anim.start();
        } else {
            spinAnim.stopAnimation();
        }
        return () => {
            if (anim) anim.stop();
        };
    }, [isCurrentlyPlayingThis]);

    const spin = spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    if (!displaySong) return null;

    const isLiked =
        Array.isArray(favorites) && favorites.includes(displaySong.id);
    const coverUri =
        displaySong.img || displaySong.cover_image || DEFAULT_COVER;

    const handlePlayPress = () => {
        if (currentSong && currentSong.id === displaySong.id) {
            togglePlay();
        } else {
            playSong(displaySong, songs);
        }
    };

    return (
        <View style={styles.card}>
            {/* Top Banner Tag */}
            <View style={styles.topBadgeRow}>
                <View
                    style={[
                        styles.hiresPill,
                        { borderColor: accentColor + '66' },
                    ]}
                >
                    <View
                        style={[
                            styles.pulseDot,
                            { backgroundColor: accentColor },
                        ]}
                    />
                    <Text style={[styles.hiresText, { color: accentColor }]}>
                        MASTER HI-RES • 24-BIT
                    </Text>
                </View>
                <Text style={styles.editorialLabel}>PILIHAN REDAKSI</Text>
            </View>

            {/* Center Showcase: Vinyl peeking anchored behind Album Sleeve */}
            <TouchableOpacity
                style={styles.showcase}
                activeOpacity={0.9}
                android_ripple={ripple.bounded()}
                onPress={() => {
                    if (!currentSong) {
                        playSong(displaySong, songs);
                    }
                    setIsNowPlayingOpen(true);
                }}
            >
                <View style={styles.recordCombo}>
                    {/* Spinning Vinyl Disc behind the sleeve */}
                    <Animated.View
                        style={[
                            styles.vinylDisc,
                            { transform: [{ rotate: spin }] },
                        ]}
                    >
                        <View style={styles.vinylGroove1}>
                            <View style={styles.vinylGroove2}>
                                <View
                                    style={[
                                        styles.vinylCenterLabel,
                                        { backgroundColor: accentColor },
                                    ]}
                                >
                                    <View style={styles.vinylCenterHole} />
                                </View>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Album Cover Jacket on top */}
                    <View style={styles.coverWrapper}>
                        <Image
                            source={{ uri: coverUri }}
                            style={styles.coverImage}
                            resizeMode="cover"
                        />
                        <View style={styles.coverOverlayBadge}>
                            <Text
                                style={[
                                    styles.coverBadgeText,
                                    { color: accentColor },
                                ]}
                            >
                                {isCurrentlyPlayingThis
                                    ? 'SEDANG DIPUTAR'
                                    : 'LAGU UNGGULAN'}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>

            {/* Metadata & Controls */}
            <View style={styles.metaContainer}>
                <View style={styles.textContainer}>
                    <Text numberOfLines={1} style={styles.title}>
                        {displaySong.title}
                    </Text>
                    <Text numberOfLines={1} style={styles.artist}>
                        {displaySong.artist}{' '}
                        {displaySong.album ? `• ${displaySong.album}` : ''}
                    </Text>
                </View>

                <View style={styles.actionsRow}>
                    <TouchableOpacity
                        style={styles.likeBtn}
                        onPress={() => toggleFavorite(displaySong.id)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        android_ripple={ripple.borderless(
                            'rgba(255, 255, 255, 0.16)',
                            22,
                        )}
                    >
                        <Ionicons
                            name={isLiked ? 'heart' : 'heart-outline'}
                            size={24}
                            color={isLiked ? accentColor : THEME.textMuted}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.playBtn,
                            { backgroundColor: accentColor },
                        ]}
                        onPress={handlePlayPress}
                        activeOpacity={0.8}
                        android_ripple={ripple.bounded()}
                    >
                        <Ionicons
                            name={isCurrentlyPlayingThis ? 'pause' : 'play'}
                            size={22}
                            color="#000"
                            style={
                                isCurrentlyPlayingThis ? {} : { marginLeft: 2 }
                            }
                        />
                        <Text style={styles.playBtnText}>
                            {isCurrentlyPlayingThis ? 'Jeda' : 'Putar Sekarang'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        marginHorizontal: space.md,
        marginTop: space.sm,
        marginBottom: space.lg,
        backgroundColor: THEME.surface,
        borderRadius: shape.lg,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        padding: space.lg,
        overflow: 'hidden',
        ...elevation[4],
    },
    topBadgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: space.lg,
    },
    hiresPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.xs,
        paddingHorizontal: space.sm,
        paddingVertical: space.xs,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: shape.sm,
        borderWidth: 1,
    },
    pulseDot: {
        width: 5,
        height: 5,
        borderRadius: shape.full,
    },
    hiresText: {
        ...font.labelSmall,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    editorialLabel: {
        ...font.labelSmall,
        fontWeight: '700',
        color: THEME.textMuted,
        letterSpacing: 0.6,
    },
    showcase: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 170,
        marginVertical: space.xs,
    },
    recordCombo: {
        width: 220,
        height: 160,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    coverWrapper: {
        position: 'absolute',
        left: 8,
        width: 152,
        height: 152,
        borderRadius: shape.md,
        overflow: 'hidden',
        backgroundColor: THEME.elevated,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        zIndex: 2,
        ...elevation[4],
    },
    coverImage: {
        width: '100%',
        height: '100%',
    },
    coverOverlayBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        paddingHorizontal: space.sm,
        paddingVertical: space.xs,
        borderRadius: shape.xs,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    coverBadgeText: {
        ...font.labelSmall,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    vinylDisc: {
        position: 'absolute',
        left: 68,
        width: 142,
        height: 142,
        borderRadius: shape.full,
        backgroundColor: '#050507',
        borderWidth: 2.5,
        borderColor: '#1e2025',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
        ...elevation[2],
    },
    vinylGroove1: {
        width: 114,
        height: 114,
        borderRadius: shape.full,
        borderWidth: 1,
        borderColor: '#23262d',
        alignItems: 'center',
        justifyContent: 'center',
    },
    vinylGroove2: {
        width: 86,
        height: 86,
        borderRadius: shape.full,
        borderWidth: 1,
        borderColor: '#2b2e38',
        alignItems: 'center',
        justifyContent: 'center',
    },
    vinylCenterLabel: {
        width: 46,
        height: 46,
        borderRadius: shape.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    vinylCenterHole: {
        width: 10,
        height: 10,
        borderRadius: shape.full,
        backgroundColor: '#000',
    },
    metaContainer: {
        marginTop: space.md,
        gap: space.md,
    },
    textContainer: {
        alignItems: 'flex-start',
    },
    title: {
        ...font.titleLarge,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: -0.4,
    },
    artist: {
        ...font.bodyMedium,
        fontWeight: '500',
        color: THEME.textMuted,
        marginTop: space.xs,
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.md,
    },
    likeBtn: {
        width: 44,
        height: 44,
        borderRadius: shape.full,
        backgroundColor: THEME.elevated,
        borderWidth: 1,
        borderColor: THEME.border,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    playBtn: {
        flex: 1,
        height: 44,
        borderRadius: shape.full,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: space.sm,
        overflow: 'hidden',
        ...elevation[2],
    },
    playBtnText: {
        ...font.labelLarge,
        fontWeight: '800',
        color: '#000',
        letterSpacing: -0.2,
    },
});
