import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import SwipeModal from './SwipeModal';
import { useAudio } from '../context/AudioContext';
import { fetchLyricsFromAPI } from '../services/api';
import { THEME } from '../config';

export default function LyricsModal({ visible, onClose }) {
    const { currentSong, currentTime, seekTo, activeTheme } = useAudio();
    const [lyricsData, setLyricsData] = useState(null);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);
    const lineYMap = useRef({});

    const accentColor = activeTheme?.color || THEME.accent;

    // Load lyrics on song change
    useEffect(() => {
        if (!currentSong) return;
        let isCancelled = false;

        async function getLyrics() {
            setLoading(true);
            const data = await fetchLyricsFromAPI(
                currentSong.artist,
                currentSong.title,
            );
            if (!isCancelled) {
                setLyricsData(data);
                setLoading(false);
            }
        }

        void getLyrics();
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

    // Active line index
    const activeIndex = useMemo(() => {
        if (!parsedLines) return -1;
        let idx = -1;
        for (let i = 0; i < parsedLines.length; i++) {
            if (currentTime >= parsedLines[i].time) idx = i;
        }
        return idx;
    }, [parsedLines, currentTime]);

    // Auto scroll to active line
    useEffect(() => {
        if (visible && scrollRef.current && activeIndex >= 0) {
            const lineY = lineYMap.current[activeIndex] ?? activeIndex * 48;
            const targetY = Math.max(0, lineY - 140);
            scrollRef.current.scrollTo({
                y: targetY,
                animated: true,
            });
        }
    }, [activeIndex, visible]);

    if (!currentSong) return null;

    return (
        <SwipeModal visible={visible} onClose={onClose} height="90%">
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.titleBox}>
                        <View style={styles.liveBadge}>
                            <View
                                style={[
                                    styles.liveDot,
                                    { backgroundColor: accentColor },
                                ]}
                            />
                            <Text
                                style={[
                                    styles.liveText,
                                    { color: accentColor },
                                ]}
                            >
                                SYNCED LYRICS
                            </Text>
                        </View>
                        <Text numberOfLines={1} style={styles.songTitle}>
                            {currentSong.title}
                        </Text>
                        <Text numberOfLines={1} style={styles.songArtist}>
                            {currentSong.artist}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={onClose}
                        style={styles.closeBtn}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    >
                        <Ionicons
                            name="close"
                            size={24}
                            color={THEME.textMuted}
                        />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                {loading ? (
                    <View style={styles.centerBox}>
                        <ActivityIndicator size="large" color={accentColor} />
                        <Text style={styles.loadingText}>
                            Mengambil lirik dari database LRCLIB...
                        </Text>
                    </View>
                ) : parsedLines ? (
                    <ScrollView
                        ref={scrollRef}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.lyricsList}
                    >
                        {parsedLines.map((line, idx) => {
                            const isActive = idx === activeIndex;
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
                                            Haptics.ImpactFeedbackStyle.Light,
                                        ).catch(() => {});
                                    }}
                                    activeOpacity={0.7}
                                    style={styles.lineBox}
                                >
                                    <Text
                                        style={[
                                            styles.lineText,
                                            isActive && [
                                                styles.lineTextActive,
                                                { color: accentColor },
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
                    <View style={styles.centerBox}>
                        <Ionicons
                            name="mic-off-outline"
                            size={44}
                            color={THEME.textMuted}
                        />
                        <Text style={styles.emptyTitle}>
                            Lirik Tidak Tersedia
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            {lyricsData?.plainLyrics
                                ? lyricsData.plainLyrics
                                : 'Lirik tersinkronisasi belum ditemukan untuk lagu ini.'}
                        </Text>
                    </View>
                )}
            </View>
        </SwipeModal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    },
    titleBox: {
        flex: 1,
        marginRight: 12,
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    liveText: {
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 0.8,
    },
    songTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#fff',
    },
    songArtist: {
        fontSize: 12,
        color: THEME.textMuted,
    },
    closeBtn: {
        padding: 6,
    },
    lyricsList: {
        paddingVertical: 140, // Generous padding for clean center positioning!
        gap: 18,
    },
    lineBox: {
        paddingVertical: 4,
        alignItems: 'center',
    },
    lineText: {
        fontSize: 17,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.3)',
        textAlign: 'center',
        lineHeight: 26,
    },
    lineTextActive: {
        fontSize: 22,
        fontWeight: '800',
        lineHeight: 32,
        transform: [{ scale: 1.05 }],
    },
    centerBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        gap: 12,
    },
    loadingText: {
        fontSize: 13,
        color: THEME.textMuted,
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
