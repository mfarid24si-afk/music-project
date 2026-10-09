import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    TextInput,
    Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import SwipeModal from './SwipeModal';
import SongItem from './SongItem';
import MiniPlayer from './MiniPlayer';
import { useAudio } from '../context/AudioContext';
import {
    THEME,
    space,
    shape,
    font,
    elevation,
    ripple,
    touchTarget,
} from '../config';

const DEFAULT_COVER =
    'https://farid-peminjaman.alwaysdata.net/assets/covers/believer.jpg';

export default function PlaylistDetailModal({ visible, playlist, onClose }) {
    const {
        songs,
        currentSong,
        isPlaying,
        playSong,
        playPlaylist,
        updatePlaylist,
        deletePlaylist,
        togglePlaylistSong,
        favorites,
        toggleFavorite,
        activeTheme,
        currentUser,
    } = useAudio();

    const [isEditing, setIsEditing] = useState(false);
    const [nameInput, setNameInput] = useState('');
    const [descInput, setDescInput] = useState('');
    const [coverInput, setCoverInput] = useState('');

    const accentColor = activeTheme?.color || THEME.accent;
    const isAdmin =
        currentUser &&
        (currentUser.role === 'admin' ||
            currentUser.email?.startsWith('admin'));

    useEffect(() => {
        if (playlist) {
            setNameInput(playlist.name || '');
            setDescInput(playlist.description || '');
            setCoverInput(playlist.custom_cover || playlist.cover || '');
            setIsEditing(false);
        }
    }, [playlist?.id]);

    // Resolve playlist songs unconditionally
    const playlistSongs = React.useMemo(() => {
        if (!playlist) return [];
        if (Array.isArray(playlist.songs) && playlist.songs.length > 0) {
            if (typeof playlist.songs[0] === 'object') {
                return playlist.songs;
            }
            return playlist.songs
                .map((id) => songs.find((s) => String(s.id) === String(id)))
                .filter(Boolean);
        }
        return [];
    }, [playlist?.songs, songs]);

    if (!playlist) return null;

    const currentCover =
        coverInput || playlist.custom_cover || playlist.cover || DEFAULT_COVER;

    const handlePlayAll = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        playPlaylist(playlist);
    };

    const handleSaveEdit = async () => {
        if (!nameInput.trim()) return;
        Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
        ).catch(() => {});
        await updatePlaylist(playlist.id, {
            name: nameInput.trim(),
            description: descInput.trim(),
            custom_cover: coverInput.trim() || null,
        });
        setIsEditing(false);
    };

    const handleDeletePlaylist = () => {
        if (!isAdmin) {
            Alert.alert(
                'Akses Ditolak',
                'Hanya Administrator yang memiliki hak akses untuk menghapus playlist.',
            );
            return;
        }

        Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Warning,
        ).catch(() => {});
        Alert.alert(
            'Hapus Playlist',
            `Apakah Anda yakin ingin menghapus playlist "${playlist.name}" secara permanen?`,
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {
                        await deletePlaylist(playlist.id);
                        onClose();
                    },
                },
            ],
        );
    };

    const handleRemoveSong = (songId) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        togglePlaylistSong(playlist.id, songId);
    };

    return (
        <SwipeModal visible={visible} onClose={onClose} height="92%">
            <View style={styles.container}>
                {/* Top Header Bar */}
                <View style={styles.topBar}>
                    <TouchableOpacity
                        onPress={onClose}
                        style={styles.iconBtn}
                        android_ripple={ripple.borderless(
                            'rgba(255,255,255,0.16)',
                            22,
                        )}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    >
                        <Ionicons name="chevron-down" size={26} color="#fff" />
                    </TouchableOpacity>

                    <Text numberOfLines={1} style={styles.headerTitle}>
                        {isEditing ? 'Edit Playlist' : playlist.name}
                    </Text>

                    {/* Edit Button */}
                    <TouchableOpacity
                        onPress={() => {
                            Haptics.impactAsync(
                                Haptics.ImpactFeedbackStyle.Light,
                            ).catch(() => {});
                            setIsEditing(!isEditing);
                        }}
                        style={[
                            styles.iconBtn,
                            isEditing && {
                                backgroundColor: accentColor + '22',
                                borderRadius: shape.full,
                            },
                        ]}
                        android_ripple={ripple.borderless(
                            'rgba(255,255,255,0.16)',
                            22,
                        )}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    >
                        <Ionicons
                            name={isEditing ? 'checkmark-circle' : 'pencil'}
                            size={20}
                            color={isEditing ? accentColor : '#fff'}
                        />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingBottom: currentSong ? 130 : 40 },
                    ]}
                >
                    {/* Edit Form Mode */}
                    {isEditing ? (
                        <View style={styles.editSection}>
                            {/* Cover Preview & URL Input */}
                            <View style={styles.coverEditRow}>
                                <Image
                                    source={{ uri: currentCover }}
                                    style={styles.coverPreview}
                                />
                                <View style={{ flex: 1, gap: space.sm }}>
                                    <Text style={styles.fieldLabel}>
                                        URL GAMBAR COVER
                                    </Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={coverInput}
                                        onChangeText={setCoverInput}
                                        placeholder="https://... (link gambar)"
                                        placeholderTextColor={THEME.textMuted}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                    <Text style={styles.hintSub}>
                                        Mendukung link gambar JPG / PNG / WebP
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.fieldBox}>
                                <Text style={styles.fieldLabel}>
                                    NAMA PLAYLIST
                                </Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={nameInput}
                                    onChangeText={setNameInput}
                                    placeholder="Nama playlist..."
                                    placeholderTextColor={THEME.textMuted}
                                    maxLength={40}
                                />
                            </View>

                            <View style={styles.fieldBox}>
                                <Text style={styles.fieldLabel}>
                                    DESKRIPSI (OPSIONAL)
                                </Text>
                                <TextInput
                                    style={[
                                        styles.textInput,
                                        {
                                            height: 70,
                                            textAlignVertical: 'top',
                                            paddingTop: space.sm,
                                        },
                                    ]}
                                    value={descInput}
                                    onChangeText={setDescInput}
                                    placeholder="Deskripsi playlist..."
                                    placeholderTextColor={THEME.textMuted}
                                    multiline
                                    maxLength={150}
                                />
                            </View>

                            <View style={styles.editBtnRow}>
                                <TouchableOpacity
                                    style={[
                                        styles.saveBtn,
                                        { backgroundColor: accentColor },
                                    ]}
                                    onPress={handleSaveEdit}
                                    android_ripple={ripple.bounded()}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.saveBtnText}>
                                        Simpan Perubahan
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.cancelBtn}
                                    onPress={() => setIsEditing(false)}
                                    android_ripple={ripple.bounded()}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.cancelBtnText}>
                                        Batal
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Delete button: ONLY visible to Admin */}
                            {isAdmin && (
                                <TouchableOpacity
                                    style={styles.deleteBtn}
                                    onPress={handleDeletePlaylist}
                                    android_ripple={ripple.bounded()}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons
                                        name="trash-outline"
                                        size={16}
                                        color="#ef4444"
                                    />
                                    <Text style={styles.deleteBtnText}>
                                        Hapus Playlist Ini (Khusus Admin)
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        <>
                            {/* Banner & Cover */}
                            <View style={styles.bannerRow}>
                                <Image
                                    source={{ uri: currentCover }}
                                    style={styles.cover}
                                />
                                <View style={styles.bannerInfo}>
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>
                                            {playlist.status === 'pending'
                                                ? 'MENUNGGU PERSETUJUAN'
                                                : 'PLAYLIST'}
                                        </Text>
                                    </View>
                                    <Text
                                        numberOfLines={2}
                                        style={styles.playlistName}
                                    >
                                        {playlist.name}
                                    </Text>
                                    {playlist.description ? (
                                        <Text
                                            numberOfLines={2}
                                            style={styles.playlistDesc}
                                        >
                                            {playlist.description}
                                        </Text>
                                    ) : null}
                                    <Text
                                        numberOfLines={1}
                                        style={styles.playlistCreator}
                                    >
                                        {playlist.creator_name
                                            ? `Oleh ${playlist.creator_name}`
                                            : 'Spotirid Creator'}
                                    </Text>
                                    <Text style={styles.playlistCount}>
                                        {playlistSongs.length} Lagu
                                    </Text>
                                </View>
                            </View>

                            {/* Action Row */}
                            <View style={styles.actionsRow}>
                                <TouchableOpacity
                                    style={[
                                        styles.playAllBtn,
                                        { backgroundColor: accentColor },
                                    ]}
                                    onPress={handlePlayAll}
                                    android_ripple={ripple.bounded()}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons
                                        name="play"
                                        size={20}
                                        color="#000"
                                    />
                                    <Text style={styles.playAllText}>
                                        Putar Semua
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    {/* Tracklist Section */}
                    <View style={styles.tracklistContainer}>
                        <View style={styles.tracklistHeader}>
                            <Text style={styles.sectionLabel}>
                                {isEditing
                                    ? 'KELOLA LAGU (KETUK HAPUS UNTUK MENGELUARKAN LAGU)'
                                    : 'DAFTAR LAGU'}
                            </Text>
                        </View>

                        {playlistSongs.length === 0 ? (
                            <View style={styles.emptyBox}>
                                <Ionicons
                                    name="musical-notes-outline"
                                    size={40}
                                    color={THEME.textMuted}
                                />
                                <Text style={styles.emptyText}>
                                    Belum ada lagu di playlist ini
                                </Text>
                            </View>
                        ) : (
                            playlistSongs.map((song, idx) => {
                                const isCurrent =
                                    currentSong && currentSong.id === song.id;
                                const isLiked =
                                    Array.isArray(favorites) &&
                                    favorites.includes(song.id);
                                return (
                                    <View
                                        key={String(song.id || idx)}
                                        style={styles.songRowWrapper}
                                    >
                                        <View style={{ flex: 1 }}>
                                            <SongItem
                                                song={song}
                                                isCurrent={isCurrent}
                                                isPlaying={isPlaying}
                                                isLiked={isLiked}
                                                onPlay={() => playSong(song)}
                                                onToggleLike={() =>
                                                    toggleFavorite(song.id)
                                                }
                                                activeTheme={activeTheme}
                                            />
                                        </View>

                                        {/* Quick Remove from Playlist Icon */}
                                        <TouchableOpacity
                                            style={styles.removeSongBtn}
                                            onPress={() =>
                                                handleRemoveSong(song.id)
                                            }
                                            android_ripple={ripple.borderless(
                                                'rgba(255,255,255,0.16)',
                                                24,
                                            )}
                                            hitSlop={{
                                                top: 10,
                                                bottom: 10,
                                                left: 10,
                                                right: 10,
                                            }}
                                        >
                                            <Ionicons
                                                name="close-circle-outline"
                                                size={20}
                                                color="#ef4444"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                );
                            })
                        )}
                    </View>
                </ScrollView>

                {/* Floating MiniPlayer inside PlaylistDetailModal so active playback is always visible */}
                <MiniPlayer />
            </View>
        </SwipeModal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: space.lg,
        position: 'relative',
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: space.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    },
    headerTitle: {
        ...font.titleMedium,
        fontWeight: '700',
        color: '#fff',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: space.md,
    },
    iconBtn: {
        padding: space.sm,
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: shape.full,
    },
    scrollContent: {
        paddingTop: space.lg,
        gap: space.xl,
    },
    bannerRow: {
        flexDirection: 'row',
        gap: space.lg,
        alignItems: 'center',
    },
    cover: {
        width: 110,
        height: 110,
        borderRadius: shape.md,
        backgroundColor: THEME.elevated,
        ...elevation[2],
    },
    bannerInfo: {
        flex: 1,
        gap: space.xs,
    },
    badge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: space.sm,
        paddingVertical: space.xs,
        borderRadius: shape.xs,
    },
    badgeText: {
        ...font.labelSmall,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 0.6,
    },
    playlistName: {
        ...font.titleLarge,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: -0.3,
    },
    playlistDesc: {
        ...font.bodySmall,
        color: THEME.textMuted,
    },
    playlistCreator: {
        ...font.bodySmall,
        color: THEME.textMuted,
    },
    playlistCount: {
        ...font.labelSmall,
        color: THEME.textMuted,
        fontWeight: '600',
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    playAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.sm,
        paddingHorizontal: space.xl,
        paddingVertical: space.md,
        borderRadius: shape.full,
        overflow: 'hidden',
        ...elevation[3],
    },
    playAllText: {
        ...font.labelLarge,
        fontWeight: '800',
        color: '#000',
    },
    editSection: {
        backgroundColor: THEME.surface,
        borderRadius: shape.lg,
        borderWidth: 1,
        borderColor: THEME.border,
        padding: space.lg,
        gap: space.lg,
        ...elevation[1],
    },
    coverEditRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.md,
    },
    coverPreview: {
        width: 64,
        height: 64,
        borderRadius: shape.md,
        backgroundColor: THEME.elevated,
        ...elevation[1],
    },
    hintSub: {
        ...font.labelSmall,
        color: THEME.textMuted,
    },
    fieldBox: {
        gap: space.sm,
    },
    fieldLabel: {
        ...font.labelSmall,
        fontWeight: '800',
        color: THEME.textMuted,
        letterSpacing: 0.6,
    },
    textInput: {
        backgroundColor: THEME.elevated,
        borderRadius: shape.md,
        borderWidth: 1,
        borderColor: THEME.border,
        paddingHorizontal: space.md,
        color: '#fff',
        ...font.bodyMedium,
        height: 44,
    },
    editBtnRow: {
        flexDirection: 'row',
        gap: space.md,
        marginTop: space.xs,
    },
    saveBtn: {
        flex: 1,
        height: 42,
        borderRadius: shape.full,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    saveBtnText: {
        ...font.labelLarge,
        fontWeight: '800',
        color: '#000',
    },
    cancelBtn: {
        height: 42,
        paddingHorizontal: space.lg,
        borderRadius: shape.full,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: THEME.border,
        overflow: 'hidden',
    },
    cancelBtnText: {
        ...font.labelLarge,
        fontWeight: '600',
        color: THEME.textMuted,
    },
    deleteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: space.sm,
        paddingVertical: space.md,
        borderRadius: shape.md,
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
        marginTop: space.xs,
        overflow: 'hidden',
    },
    deleteBtnText: {
        ...font.labelMedium,
        fontWeight: '700',
        color: '#fca5a5',
    },
    tracklistContainer: {
        gap: space.sm,
    },
    tracklistHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: space.xs,
    },
    sectionLabel: {
        ...font.labelSmall,
        fontWeight: '800',
        color: THEME.textMuted,
        letterSpacing: 0.8,
    },
    songRowWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.surface,
        borderRadius: shape.md,
        marginBottom: space.sm,
        paddingRight: space.md,
    },
    removeSongBtn: {
        ...touchTarget,
        marginLeft: space.xs,
        borderRadius: shape.full,
    },
    emptyBox: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: space.xxl,
        gap: space.sm,
    },
    emptyText: {
        ...font.bodyMedium,
        color: THEME.textMuted,
    },
});
