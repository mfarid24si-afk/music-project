import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import SwipeModal from './SwipeModal';
import SongItem from './SongItem';
import MiniPlayer from './MiniPlayer';
import { useAudio } from '../context/AudioContext';
import { DEFAULT_COVER, THEME, space, shape, ripple } from '../config';
import { styles } from './PlaylistDetailModal.styles';

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
    const [showPlayer, setShowPlayer] = useState(true);

    const accentColor = activeTheme?.color || THEME.accent;
    const isLocked = !!(
        playlist &&
        (playlist.isLocked ??
            (playlist.status && playlist.status !== 'approved'))
    );
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
        if (isLocked) {
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Warning,
            ).catch(() => {});
            Alert.alert(
                'Belum Disetujui',
                'Playlist ini masih menunggu persetujuan Administrator dan belum bisa diputar.',
            );
            return;
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        playPlaylist(playlist);
    };

    const handlePlaySong = (song) => {
        if (isLocked) {
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Warning,
            ).catch(() => {});
            Alert.alert(
                'Belum Disetujui',
                'Playlist ini masih menunggu persetujuan Administrator dan belum bisa diputar.',
            );
            return;
        }
        playSong(song, playlistSongs);
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
                    contentContainerStyle={styles.scrollContent}
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
                                        isLocked && styles.playAllBtnLocked,
                                    ]}
                                    onPress={handlePlayAll}
                                    android_ripple={ripple.bounded()}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons
                                        name={isLocked ? 'lock-closed' : 'play'}
                                        size={20}
                                        color="#000"
                                    />
                                    <Text style={styles.playAllText}>
                                        {isLocked
                                            ? 'Menunggu Persetujuan'
                                            : 'Putar Semua'}
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
                                                onPlay={() =>
                                                    handlePlaySong(song)
                                                }
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

                {/* Docked now-playing footer (does not overlap the tracklist) */}
                {currentSong ? (
                    showPlayer ? (
                        <View style={styles.playerDock}>
                            <MiniPlayer embedded />
                            <TouchableOpacity
                                style={styles.hidePlayerBtn}
                                onPress={() => {
                                    Haptics.impactAsync(
                                        Haptics.ImpactFeedbackStyle.Light,
                                    ).catch(() => {});
                                    setShowPlayer(false);
                                }}
                                android_ripple={ripple.borderless(
                                    'rgba(255,255,255,0.16)',
                                    24,
                                )}
                                hitSlop={{
                                    top: 8,
                                    bottom: 8,
                                    left: 8,
                                    right: 8,
                                }}
                            >
                                <Ionicons
                                    name="chevron-down"
                                    size={14}
                                    color={THEME.textMuted}
                                />
                                <Text style={styles.hidePlayerText}>
                                    Sembunyikan
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.showPlayerBtn}
                            onPress={() => {
                                Haptics.impactAsync(
                                    Haptics.ImpactFeedbackStyle.Light,
                                ).catch(() => {});
                                setShowPlayer(true);
                            }}
                            android_ripple={ripple.bounded()}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name="musical-notes"
                                size={16}
                                color={accentColor}
                            />
                            <Text
                                numberOfLines={1}
                                style={styles.showPlayerText}
                            >
                                {currentSong.title}
                            </Text>
                            <Ionicons
                                name="chevron-up"
                                size={14}
                                color={THEME.textMuted}
                            />
                        </TouchableOpacity>
                    )
                ) : null}
            </View>
        </SwipeModal>
    );
}
