import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import SwipeModal from './SwipeModal';
import { useAudio } from '../context/AudioContext';
import {
    THEME,
    space,
    shape,
    font,
    elevation,
    touchTarget,
    ripple,
} from '../config';

export default function AddToPlaylistModal({ visible, song, onClose }) {
    const { playlists, createPlaylist, togglePlaylistSong, activeTheme } =
        useAudio();
    const [newPlaylistName, setNewPlaylistName] = useState('');

    if (!song) return null;

    const accentColor = activeTheme?.color || THEME.accent;

    const handleCreate = () => {
        if (newPlaylistName.trim()) {
            const pl = createPlaylist(newPlaylistName.trim());
            if (pl && song) {
                togglePlaylistSong(pl.id, song.id);
            }
            setNewPlaylistName('');
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
            ).catch(() => {});
        }
    };

    const handleToggleSong = (playlistId) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        togglePlaylistSong(playlistId, song.id);
    };

    return (
        <SwipeModal visible={visible} onClose={onClose} height="75%">
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerTitle}>
                            Tambahkan ke Playlist
                        </Text>
                        <Text numberOfLines={1} style={styles.songSub}>
                            {song.title} • {song.artist}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={onClose}
                        style={styles.closeBtn}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        android_ripple={ripple.borderless(
                            'rgba(255, 255, 255, 0.16)',
                            24,
                        )}
                    >
                        <Ionicons
                            name="close"
                            size={24}
                            color={THEME.textMuted}
                        />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Create New Playlist Input */}
                    <View style={styles.createBox}>
                        <TextInput
                            style={styles.input}
                            placeholder="Nama playlist baru..."
                            placeholderTextColor={THEME.textMuted}
                            value={newPlaylistName}
                            onChangeText={setNewPlaylistName}
                            maxLength={30}
                        />
                        <TouchableOpacity
                            style={[
                                styles.createBtn,
                                { backgroundColor: accentColor },
                            ]}
                            onPress={handleCreate}
                            android_ripple={ripple.bounded()}
                        >
                            <Ionicons name="add" size={20} color="#000" />
                            <Text style={styles.createBtnText}>Buat</Text>
                        </TouchableOpacity>
                    </View>

                    {/* List of Playlists */}
                    <View style={styles.list}>
                        <Text style={styles.sectionLabel}>PILIH PLAYLIST</Text>
                        {playlists.length === 0 ? (
                            <View style={styles.emptyBox}>
                                <Text style={styles.emptyText}>
                                    Belum ada playlist. Buat playlist pertama
                                    Anda di atas!
                                </Text>
                            </View>
                        ) : (
                            playlists.map((pl) => {
                                const songIds = Array.isArray(pl.songs)
                                    ? pl.songs.map((s) =>
                                          typeof s === 'object' ? s.id : s,
                                      )
                                    : [];
                                const isInPlaylist = songIds.includes(song.id);

                                return (
                                    <TouchableOpacity
                                        key={String(pl.id)}
                                        style={[
                                            styles.playlistRow,
                                            isInPlaylist &&
                                                styles.playlistRowActive,
                                        ]}
                                        onPress={() => handleToggleSong(pl.id)}
                                        activeOpacity={0.7}
                                        android_ripple={ripple.bounded()}
                                    >
                                        <View style={styles.rowLeft}>
                                            <View style={styles.iconBox}>
                                                <Ionicons
                                                    name="musical-notes"
                                                    size={18}
                                                    color={
                                                        isInPlaylist
                                                            ? accentColor
                                                            : THEME.textMuted
                                                    }
                                                />
                                            </View>
                                            <View style={styles.rowText}>
                                                <Text
                                                    numberOfLines={1}
                                                    style={[
                                                        styles.rowTitle,
                                                        isInPlaylist && {
                                                            color: accentColor,
                                                        },
                                                    ]}
                                                >
                                                    {pl.name}
                                                </Text>
                                                <Text style={styles.rowCount}>
                                                    {songIds.length} Lagu
                                                </Text>
                                            </View>
                                        </View>

                                        <View
                                            style={[
                                                styles.checkCircle,
                                                isInPlaylist && {
                                                    backgroundColor:
                                                        accentColor,
                                                    borderColor: accentColor,
                                                },
                                            ]}
                                        >
                                            {isInPlaylist && (
                                                <Ionicons
                                                    name="checkmark"
                                                    size={14}
                                                    color="#000"
                                                />
                                            )}
                                        </View>
                                    </TouchableOpacity>
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
        paddingHorizontal: space.lg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: space.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    },
    headerInfo: {
        flex: 1,
        marginRight: space.md,
    },
    headerTitle: {
        ...font.titleMedium,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: -0.3,
    },
    songSub: {
        ...font.bodySmall,
        color: THEME.textMuted,
        marginTop: space.xs,
    },
    closeBtn: {
        ...touchTarget,
        borderRadius: shape.full,
        overflow: 'hidden',
    },
    scrollContent: {
        paddingTop: space.lg,
        paddingBottom: space.xxl,
        gap: space.lg,
    },
    createBox: {
        flexDirection: 'row',
        gap: space.sm,
    },
    input: {
        flex: 1,
        height: 42,
        backgroundColor: THEME.surface,
        borderRadius: shape.md,
        borderWidth: 1,
        borderColor: THEME.border,
        paddingHorizontal: space.md,
        color: '#fff',
        ...font.bodyMedium,
    },
    createBtn: {
        height: 42,
        paddingHorizontal: space.lg,
        borderRadius: shape.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.xs,
        overflow: 'hidden',
        ...elevation[1],
    },
    createBtnText: {
        ...font.labelLarge,
        fontWeight: '800',
        color: '#000',
    },
    list: {
        gap: space.sm,
    },
    sectionLabel: {
        ...font.labelSmall,
        fontWeight: '800',
        color: THEME.textMuted,
        letterSpacing: 0.8,
        marginBottom: space.xs,
    },
    playlistRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: THEME.surface,
        padding: space.md,
        borderRadius: shape.md,
        borderWidth: 1,
        borderColor: 'transparent',
        overflow: 'hidden',
    },
    playlistRowActive: {
        borderColor: 'rgba(204, 242, 40, 0.25)',
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.md,
        flex: 1,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: shape.sm,
        backgroundColor: THEME.elevated,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rowText: {
        flex: 1,
    },
    rowTitle: {
        ...font.titleSmall,
        fontWeight: '700',
        color: '#fff',
    },
    rowCount: {
        ...font.labelSmall,
        color: THEME.textMuted,
        marginTop: space.xs,
    },
    checkCircle: {
        width: 24,
        height: 24,
        borderRadius: shape.full,
        borderWidth: 1.5,
        borderColor: THEME.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyBox: {
        paddingVertical: space.xl,
        alignItems: 'center',
    },
    emptyText: {
        ...font.bodySmall,
        color: THEME.textMuted,
        textAlign: 'center',
    },
});
