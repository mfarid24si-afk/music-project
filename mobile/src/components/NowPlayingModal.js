import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Modal,
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
import { useLyrics } from '../hooks/useLyrics';
import { DEFAULT_COVER, THEME, ripple } from '../config';
import { styles } from './NowPlayingModal.styles';

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
    const [imgError, setImgError] = useState(false);
    const [sliderValue, setSliderValue] = useState(null);
    const [activeTab, setActiveTab] = useState('turntable'); // 'turntable' | 'lyrics'

    const {
        lyricsData,
        loading: lyricsLoading,
        lines: parsedLines,
        activeIndex: activeLyricIndex,
    } = useLyrics(currentSong, currentTime);

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
                                                    onError={() =>
                                                        setImgError(true)
                                                    }
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
