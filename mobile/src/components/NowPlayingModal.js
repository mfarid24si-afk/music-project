import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Dimensions,
    Animated,
    Easing,
    ScrollView,
    PanResponder,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { useAudio } from '../context/AudioContext';
import { fetchLyricsFromAPI } from '../services/api';
import { THEME, space, shape, font, elevation, ripple } from '../config';

const { width, height } = Dimensions.get('window');
const TURNTABLE_SIZE = Math.min(width - 64, height * 0.35, 300);
const DEFAULT_COVER =
    'https://farid-peminjaman.alwaysdata.net/assets/covers/believer.jpg';

function formatSeconds(sec) {
    if (!sec || isNaN(sec)) return '0:00';
    const totalSeconds = Math.floor(sec);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

export default function NowPlayingModal() {
    const insets = useSafeAreaInsets();
    const {
        currentSong,
        isPlaying,
        currentTime,
        duration,
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
        activeTheme,
    } = useAudio();

    const accentColor = activeTheme?.color || THEME.accent;
    const [imgError] = useState(false);
    const [sliderValue, setSliderValue] = useState(null);
    const [activeTab, setActiveTab] = useState('turntable'); // 'turntable' | 'lyrics'
    const [lyricsData, setLyricsData] = useState(null);
    const [lyricsLoading, setLyricsLoading] = useState(false);

    const spinAnim = useRef(new Animated.Value(0)).current;
    const modalTranslateY = useRef(new Animated.Value(0)).current;
    const lyricsScrollRef = useRef(null);
    const lineYMap = useRef({});

    // Swipe Down to minimize PanResponder
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) =>
                gestureState.dy > 5 && Math.abs(gestureState.dx) < 25,
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    modalTranslateY.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 60 || gestureState.vy > 0.4) {
                    Haptics.impactAsync(
                        Haptics.ImpactFeedbackStyle.Light,
                    ).catch(() => {});
                    setIsNowPlayingOpen(false);
                    modalTranslateY.setValue(0);
                } else {
                    Animated.spring(modalTranslateY, {
                        toValue: 0,
                        bounciness: 4,
                        useNativeDriver: true,
                    }).start();
                }
            },
        }),
    ).current;

    // Fetch lyrics whenever song changes
    useEffect(() => {
        if (!currentSong) return;
        let isCancelled = false;

        async function loadLyrics() {
            setLyricsLoading(true);
            const data = await fetchLyricsFromAPI(
                currentSong.artist,
                currentSong.title,
            );
            if (!isCancelled) {
                setLyricsData(data);
                setLyricsLoading(false);
            }
        }

        void loadLyrics();
        return () => {
            isCancelled = true;
        };
    }, [currentSong?.id]);

    // Parse LRC Synced lyrics
    const parsedLines = useMemo(() => {
        if (!lyricsData || !lyricsData.syncedLyrics) return null;
        const lines = [];
        for (const rawLine of lyricsData.syncedLyrics.split('\n')) {
            if (!rawLine.trim()) continue;
            const match = rawLine.match(/^\[(\d+):(\d+)(?:[.,](\d+))?\](.*)/);
            if (!match) continue;
            const m = parseInt(match[1], 10);
            const s = parseInt(match[2], 10);
            let ms = match[3] ? parseInt(match[3], 10) : 0;
            if (match[3] && match[3].length === 2) ms *= 10;
            lines.push({ time: m * 60 + s + ms / 1000, text: match[4].trim() });
        }
        return lines.length > 0 ? lines : null;
    }, [lyricsData]);

    // Find active lyric index
    const activeLyricIndex = useMemo(() => {
        if (!parsedLines) return -1;
        let idx = -1;
        for (let i = 0; i < parsedLines.length; i++) {
            if (currentTime >= parsedLines[i].time) idx = i;
        }
        return idx;
    }, [parsedLines, currentTime]);

    // Auto-scroll lyrics smoothly centered
    useEffect(() => {
        if (
            activeTab === 'lyrics' &&
            lyricsScrollRef.current &&
            activeLyricIndex >= 0
        ) {
            const lineY =
                lineYMap.current[activeLyricIndex] ?? activeLyricIndex * 48;
            const targetY = Math.max(0, lineY - 130);
            lyricsScrollRef.current.scrollTo({
                y: targetY,
                animated: true,
            });
        }
    }, [activeLyricIndex, activeTab]);

    // Vinyl Spin Loop Animation (ensures loop continues when switching back from lyrics!)
    useEffect(() => {
        let anim;
        if (isPlaying && activeTab === 'turntable') {
            anim = Animated.loop(
                Animated.timing(spinAnim, {
                    toValue: 1,
                    duration: 8000,
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
    }, [isPlaying, activeTab]);

    const spin = spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    if (!currentSong) return null;

    const isLiked =
        Array.isArray(favorites) && favorites.includes(currentSong.id);
    const coverUri =
        !imgError && (currentSong.img || currentSong.cover_image)
            ? currentSong.img || currentSong.cover_image
            : DEFAULT_COVER;

    const currentPosition = sliderValue !== null ? sliderValue : currentTime;

    const handleTogglePlay = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        togglePlay();
    };

    const handleNext = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        nextSong();
    };

    const handlePrev = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        prevSong();
    };

    const handleToggleLike = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        toggleFavorite(currentSong.id);
    };

    const handleShuffle = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        toggleShuffle();
    };

    const handleRepeat = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        cycleRepeat();
    };

    return (
        <Modal
            visible={isNowPlayingOpen}
            animationType="slide"
            presentationStyle="fullScreen"
            onRequestClose={() => setIsNowPlayingOpen(false)}
        >
            <View
                style={[
                    styles.backdrop,
                    {
                        paddingTop: insets.top,
                        paddingBottom: Math.max(insets.bottom, 20),
                    },
                ]}
            >
                <Animated.View
                    style={[
                        styles.container,
                        { transform: [{ translateY: modalTranslateY }] },
                    ]}
                >
                    {/* Top Drag Handle for intuitive swipe down */}
                    <View style={styles.dragArea} {...panResponder.panHandlers}>
                        <View style={styles.dragHandle} />
                    </View>

                    {/* Top Bar with both Chevron Click & Swipe down */}
                    <View style={styles.topBar} {...panResponder.panHandlers}>
                        <TouchableOpacity
                            onPress={() => setIsNowPlayingOpen(false)}
                            style={styles.iconBtn}
                            android_ripple={ripple.borderless(
                                'rgba(255,255,255,0.16)',
                                22,
                            )}
                            hitSlop={{
                                top: 12,
                                bottom: 12,
                                left: 12,
                                right: 12,
                            }}
                        >
                            <Ionicons
                                name="chevron-down"
                                size={28}
                                color="#fff"
                            />
                        </TouchableOpacity>

                        <View style={styles.topTitleBox}>
                            <Text style={styles.topSubtitle}>
                                DECK: AETHER ORBIT MK-IV
                            </Text>
                            <Text style={styles.topTitle} numberOfLines={1}>
                                {currentSong.album || 'Spotirid Archive'}
                            </Text>
                        </View>

                        {/* Mode Switcher: Turntable vs Lyrics */}
                        <TouchableOpacity
                            onPress={() => {
                                Haptics.impactAsync(
                                    Haptics.ImpactFeedbackStyle.Light,
                                ).catch(() => {});
                                setActiveTab((prev) =>
                                    prev === 'turntable'
                                        ? 'lyrics'
                                        : 'turntable',
                                );
                            }}
                            style={[
                                styles.iconBtn,
                                activeTab === 'lyrics' && [
                                    styles.iconBtnActive,
                                    { borderColor: accentColor + '66' },
                                ],
                            ]}
                            android_ripple={ripple.borderless(
                                'rgba(255,255,255,0.16)',
                                22,
                            )}
                        >
                            <Ionicons
                                name={
                                    activeTab === 'lyrics'
                                        ? 'musical-notes'
                                        : 'mic-outline'
                                }
                                size={22}
                                color={
                                    activeTab === 'lyrics'
                                        ? accentColor
                                        : '#fff'
                                }
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Telemetry Strip */}
                    <View style={styles.telemetryRow}>
                        <View style={styles.telemetryPill}>
                            <View
                                style={[
                                    styles.pulseDot,
                                    { backgroundColor: accentColor },
                                ]}
                            />
                            <Text style={styles.telemetryText}>
                                PHONO STAGE DIRECT
                            </Text>
                        </View>
                        <View
                            style={[
                                styles.hiresBadge,
                                { borderColor: accentColor + '55' },
                            ]}
                        >
                            <Ionicons
                                name="pulse"
                                size={12}
                                color={accentColor}
                            />
                            <Text
                                style={[
                                    styles.hiresText,
                                    { color: accentColor },
                                ]}
                            >
                                96.0 kHz / 24-BIT
                            </Text>
                        </View>
                    </View>

                    {/* Center Content: Either Turntable OR Synced Lyrics */}
                    <View style={styles.mainCenterBox}>
                        {/* Turntable Platter View */}
                        <View
                            style={[
                                styles.turntableContainer,
                                {
                                    display:
                                        activeTab === 'turntable'
                                            ? 'flex'
                                            : 'none',
                                },
                            ]}
                        >
                            <Animated.View
                                style={[
                                    styles.vinylPlatter,
                                    { transform: [{ rotate: spin }] },
                                ]}
                            >
                                {/* Outer Strobe Ring */}
                                <View style={styles.strobeRing}>
                                    {/* Grooves */}
                                    <View style={styles.vinylGroove1}>
                                        <View style={styles.vinylGroove2}>
                                            {/* Center Artwork Label */}
                                            <View
                                                style={[
                                                    styles.centerArtWrapper,
                                                    {
                                                        borderColor:
                                                            accentColor,
                                                    },
                                                ]}
                                            >
                                                <Image
                                                    source={{ uri: coverUri }}
                                                    style={styles.centerArt}
                                                />
                                                <View
                                                    style={styles.spindleHole}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </Animated.View>
                        </View>

                        {/* Synced Lyrics Stream View */}
                        <View
                            style={[
                                styles.lyricsContainer,
                                {
                                    display:
                                        activeTab === 'lyrics'
                                            ? 'flex'
                                            : 'none',
                                },
                            ]}
                        >
                            {lyricsLoading ? (
                                <View style={styles.lyricsCenter}>
                                    <Text style={styles.lyricsMuted}>
                                        Memuat lirik dari LRCLIB...
                                    </Text>
                                </View>
                            ) : parsedLines ? (
                                <ScrollView
                                    ref={lyricsScrollRef}
                                    style={styles.lyricsScroll}
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={styles.lyricsContent}
                                >
                                    {parsedLines.map((line, idx) => {
                                        const isActive =
                                            idx === activeLyricIndex;
                                        return (
                                            <TouchableOpacity
                                                key={idx}
                                                onLayout={(e) => {
                                                    lineYMap.current[idx] =
                                                        e.nativeEvent.layout.y;
                                                }}
                                                onPress={() => {
                                                    seekTo(line.time);
                                                    Haptics.impactAsync(
                                                        Haptics
                                                            .ImpactFeedbackStyle
                                                            .Light,
                                                    ).catch(() => {});
                                                }}
                                                activeOpacity={0.7}
                                                style={styles.lyricLineBox}
                                                android_ripple={ripple.bounded()}
                                            >
                                                <Text
                                                    style={[
                                                        styles.lyricText,
                                                        isActive && [
                                                            styles.lyricTextActive,
                                                            {
                                                                color: accentColor,
                                                            },
                                                        ],
                                                    ]}
                                                >
                                                    {line.text}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            ) : (
                                <View style={styles.lyricsCenter}>
                                    <Ionicons
                                        name="mic-off-outline"
                                        size={36}
                                        color={THEME.textMuted}
                                    />
                                    <Text style={styles.lyricsEmptyTitle}>
                                        Lirik Tidak Tersedia
                                    </Text>
                                    <Text style={styles.lyricsMuted}>
                                        {lyricsData?.plainLyrics
                                            ? lyricsData.plainLyrics
                                            : 'Lirik tersinkronisasi belum ditemukan untuk lagu ini.'}
                                    </Text>
                                </View>
                            )}
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
                            onPress={handleToggleLike}
                            hitSlop={{
                                top: 14,
                                bottom: 14,
                                left: 14,
                                right: 14,
                            }}
                            style={styles.likeBtn}
                            android_ripple={ripple.borderless(
                                'rgba(255,255,255,0.16)',
                                22,
                            )}
                        >
                            <Ionicons
                                name={isLiked ? 'heart' : 'heart-outline'}
                                size={26}
                                color={isLiked ? accentColor : THEME.textMuted}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Slider / Scrub bar */}
                    <View style={styles.sliderContainer}>
                        <Slider
                            style={styles.slider}
                            minimumValue={0}
                            maximumValue={duration > 0 ? duration : 1}
                            value={currentPosition}
                            minimumTrackTintColor={accentColor}
                            maximumTrackTintColor="rgba(255, 255, 255, 0.15)"
                            thumbTintColor={accentColor}
                            onValueChange={(val) => setSliderValue(val)}
                            onSlidingComplete={(val) => {
                                seekTo(val);
                                setSliderValue(null);
                            }}
                        />
                        <View style={styles.timeRow}>
                            <Text style={styles.timeText}>
                                {formatSeconds(currentPosition)}
                            </Text>
                            <Text style={styles.timeText}>
                                {formatSeconds(duration)}
                            </Text>
                        </View>
                    </View>

                    {/* Player Controls */}
                    <View style={styles.controlsRow}>
                        {/* Shuffle */}
                        <TouchableOpacity
                            onPress={handleShuffle}
                            style={styles.secondaryBtn}
                            android_ripple={ripple.borderless(
                                'rgba(255,255,255,0.16)',
                                22,
                            )}
                            hitSlop={{
                                top: 12,
                                bottom: 12,
                                left: 12,
                                right: 12,
                            }}
                        >
                            <Ionicons
                                name="shuffle"
                                size={22}
                                color={
                                    isShuffle ? accentColor : THEME.textMuted
                                }
                            />
                        </TouchableOpacity>

                        {/* Prev */}
                        <TouchableOpacity
                            onPress={handlePrev}
                            style={styles.mainNavBtn}
                            android_ripple={ripple.borderless(
                                'rgba(255,255,255,0.16)',
                                24,
                            )}
                            hitSlop={{
                                top: 12,
                                bottom: 12,
                                left: 12,
                                right: 12,
                            }}
                        >
                            <Ionicons
                                name="play-skip-back"
                                size={28}
                                color="#fff"
                            />
                        </TouchableOpacity>

                        {/* Big Play / Pause */}
                        <TouchableOpacity
                            onPress={handleTogglePlay}
                            style={[
                                styles.bigPlayBtn,
                                { backgroundColor: accentColor },
                            ]}
                            activeOpacity={0.8}
                            android_ripple={ripple.borderless(
                                'rgba(0,0,0,0.12)',
                                33,
                            )}
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
                            onPress={handleNext}
                            style={styles.mainNavBtn}
                            android_ripple={ripple.borderless(
                                'rgba(255,255,255,0.16)',
                                24,
                            )}
                            hitSlop={{
                                top: 12,
                                bottom: 12,
                                left: 12,
                                right: 12,
                            }}
                        >
                            <Ionicons
                                name="play-skip-forward"
                                size={28}
                                color="#fff"
                            />
                        </TouchableOpacity>

                        {/* Repeat */}
                        <TouchableOpacity
                            onPress={handleRepeat}
                            style={styles.secondaryBtn}
                            android_ripple={ripple.borderless(
                                'rgba(255,255,255,0.16)',
                                22,
                            )}
                            hitSlop={{
                                top: 12,
                                bottom: 12,
                                left: 12,
                                right: 12,
                            }}
                        >
                            <Ionicons
                                name="repeat"
                                size={22}
                                color={
                                    repeatMode !== 'off'
                                        ? accentColor
                                        : THEME.textMuted
                                }
                            />
                            {repeatMode === 'one' && (
                                <Text
                                    style={[
                                        styles.repeatBadge,
                                        { color: accentColor },
                                    ]}
                                >
                                    1
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: THEME.bg,
    },
    container: {
        flex: 1,
        paddingHorizontal: space.xl,
        justifyContent: 'space-between',
    },
    dragArea: {
        width: '100%',
        height: space.xl,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: -space.sm,
    },
    dragHandle: {
        width: 44,
        height: 4,
        borderRadius: shape.full,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: space.xs,
    },
    topTitleBox: {
        alignItems: 'center',
        flex: 1,
        marginHorizontal: space.md,
    },
    topSubtitle: {
        ...font.labelSmall,
        fontWeight: '800',
        color: THEME.textMuted,
        letterSpacing: 1,
    },
    topTitle: {
        ...font.titleSmall,
        fontWeight: '700',
        color: '#fff',
        marginTop: space.xs,
    },
    iconBtn: {
        padding: space.xs,
        width: 44,
        height: 44,
        borderRadius: shape.full,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    iconBtnActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: shape.full,
        borderWidth: 1,
    },
    telemetryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: space.sm,
        marginTop: space.xs,
    },
    telemetryPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.sm,
        paddingHorizontal: space.md,
        paddingVertical: space.xs,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: shape.full,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    pulseDot: {
        width: 6,
        height: 6,
        borderRadius: shape.full,
    },
    telemetryText: {
        ...font.labelSmall,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.6,
    },
    hiresBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.xs,
        paddingHorizontal: space.sm,
        paddingVertical: space.xs,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: shape.full,
        borderWidth: 1,
    },
    hiresText: {
        ...font.labelSmall,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    mainCenterBox: {
        marginVertical: space.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    turntableContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    lyricsContainer: {
        width: '100%',
        height: TURNTABLE_SIZE + 40,
        backgroundColor: THEME.surface,
        borderRadius: shape.lg,
        borderWidth: 1,
        borderColor: THEME.border,
        paddingHorizontal: space.lg,
        overflow: 'hidden',
    },
    lyricsScroll: {
        flex: 1,
    },
    lyricsContent: {
        paddingVertical: 140, // Generous padding so any line can be centered!
        gap: space.lg,
    },
    lyricsCenter: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: space.xl,
        gap: space.sm,
    },
    lyricsEmptyTitle: {
        ...font.titleMedium,
        fontWeight: '700',
        color: '#fff',
    },
    lyricsMuted: {
        ...font.bodySmall,
        color: THEME.textMuted,
        textAlign: 'center',
    },
    lyricLineBox: {
        paddingVertical: space.xs,
        alignItems: 'center',
    },
    lyricText: {
        ...font.titleMedium,
        color: 'rgba(255, 255, 255, 0.3)',
        textAlign: 'center',
    },
    lyricTextActive: {
        ...font.titleLarge,
        fontWeight: '800',
        transform: [{ scale: 1.05 }],
    },
    vinylPlatter: {
        width: TURNTABLE_SIZE,
        height: TURNTABLE_SIZE,
        borderRadius: TURNTABLE_SIZE / 2,
        backgroundColor: '#07080a',
        borderWidth: 4,
        borderColor: '#1e2025',
        alignItems: 'center',
        justifyContent: 'center',
        ...elevation[5],
    },
    strobeRing: {
        width: TURNTABLE_SIZE - 16,
        height: TURNTABLE_SIZE - 16,
        borderRadius: (TURNTABLE_SIZE - 16) / 2,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    vinylGroove1: {
        width: TURNTABLE_SIZE - 48,
        height: TURNTABLE_SIZE - 48,
        borderRadius: (TURNTABLE_SIZE - 48) / 2,
        borderWidth: 1.5,
        borderColor: '#191b22',
        alignItems: 'center',
        justifyContent: 'center',
    },
    vinylGroove2: {
        width: TURNTABLE_SIZE - 90,
        height: TURNTABLE_SIZE - 90,
        borderRadius: (TURNTABLE_SIZE - 90) / 2,
        borderWidth: 1.5,
        borderColor: '#242731',
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerArtWrapper: {
        width: TURNTABLE_SIZE * 0.45,
        height: TURNTABLE_SIZE * 0.45,
        borderRadius: (TURNTABLE_SIZE * 0.45) / 2,
        overflow: 'hidden',
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerArt: {
        width: '100%',
        height: '100%',
    },
    spindleHole: {
        position: 'absolute',
        width: 14,
        height: 14,
        borderRadius: shape.full,
        backgroundColor: '#000',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.6)',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: space.sm,
    },
    titleBox: {
        flex: 1,
        marginRight: space.lg,
    },
    songTitle: {
        ...font.titleLarge,
        fontWeight: '800',
        color: '#fff',
        marginBottom: space.xs,
        letterSpacing: -0.3,
    },
    songArtist: {
        ...font.bodyMedium,
        fontWeight: '500',
        color: THEME.textMuted,
    },
    likeBtn: {
        width: 44,
        height: 44,
        borderRadius: shape.full,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    sliderContainer: {
        marginVertical: space.sm,
    },
    slider: {
        width: '100%',
        height: 38,
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: space.xs,
        marginTop: -space.xs,
    },
    timeText: {
        ...font.labelSmall,
        color: THEME.textMuted,
        fontFamily: 'monospace',
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: space.xs,
        marginBottom: space.md,
    },
    secondaryBtn: {
        width: 44,
        height: 44,
        position: 'relative',
        borderRadius: shape.full,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    repeatBadge: {
        position: 'absolute',
        top: space.sm,
        right: space.sm,
        ...font.labelSmall,
        fontWeight: '800',
    },
    mainNavBtn: {
        width: 48,
        height: 48,
        borderRadius: shape.full,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    bigPlayBtn: {
        width: 66,
        height: 66,
        borderRadius: shape.full,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        ...elevation[4],
    },
});
