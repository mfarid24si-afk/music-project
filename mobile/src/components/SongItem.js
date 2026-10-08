import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../config';

const DEFAULT_COVER =
    'https://farid-peminjaman.alwaysdata.net/assets/covers/believer.jpg';

export default function SongItem({
    song,
    isCurrent,
    isPlaying,
    isLiked,
    onPlay,
    onToggleLike,
    onAddToPlaylist,
    activeTheme,
}) {
    const [imgError, setImgError] = useState(false);
    const accentColor = activeTheme?.color || THEME.accent;
    const coverUri =
        !imgError && (song?.img || song?.cover_image)
            ? song?.img || song?.cover_image
            : DEFAULT_COVER;

    return (
        <TouchableOpacity
            style={[styles.row, isCurrent && styles.rowCurrent]}
            onPress={onPlay}
            activeOpacity={0.65}
        >
            {/* Artwork */}
            <View style={styles.coverWrapper}>
                <Image
                    source={{ uri: coverUri }}
                    style={styles.cover}
                    onError={() => setImgError(true)}
                />
                {isCurrent && isPlaying && (
                    <View
                        style={[
                            styles.playingOverlay,
                            { backgroundColor: accentColor + 'dd' },
                        ]}
                    >
                        <Ionicons name="volume-high" size={16} color="#000" />
                    </View>
                )}
            </View>

            {/* Info */}
            <View style={styles.info}>
                <Text
                    numberOfLines={1}
                    style={[
                        styles.title,
                        isCurrent && { color: accentColor, fontWeight: '700' },
                    ]}
                >
                    {String(song?.title || 'Unknown Title')}
                </Text>
                <Text numberOfLines={1} style={styles.artist}>
                    {String(song?.artist || 'Unknown Artist')}{' '}
                    {song?.album ? `• ${song.album}` : ''}
                </Text>
            </View>

            {/* Action Buttons: Add to Playlist & Like */}
            <View style={styles.actions}>
                {onAddToPlaylist && (
                    <TouchableOpacity
                        onPress={onAddToPlaylist}
                        style={styles.actionBtn}
                        hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                    >
                        <Ionicons
                            name="add-circle-outline"
                            size={20}
                            color={THEME.textMuted}
                        />
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    onPress={onToggleLike}
                    style={styles.actionBtn}
                    hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                >
                    <Ionicons
                        name={isLiked ? 'heart' : 'heart-outline'}
                        size={20}
                        color={isLiked ? accentColor : THEME.textMuted}
                    />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    rowCurrent: {
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
    },
    coverWrapper: {
        width: 50,
        height: 50,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: THEME.elevated,
        position: 'relative',
    },
    cover: {
        width: '100%',
        height: '100%',
    },
    playingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    info: {
        flex: 1,
        marginLeft: 12,
        marginRight: 8,
        justifyContent: 'center',
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    artist: {
        fontSize: 12,
        color: THEME.textMuted,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionBtn: {
        padding: 4,
    },
});
