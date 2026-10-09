import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME, space, shape, font, ripple } from '../config';

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
            android_ripple={ripple.bounded()}
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
                        android_ripple={ripple.borderless(
                            'rgba(255,255,255,0.16)',
                            20,
                        )}
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
                    android_ripple={ripple.borderless(
                        'rgba(255,255,255,0.16)',
                        20,
                    )}
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
        paddingHorizontal: space.lg,
        paddingVertical: space.sm,
        borderRadius: shape.md,
        overflow: 'hidden',
    },
    rowCurrent: {
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
    },
    coverWrapper: {
        width: 50,
        height: 50,
        borderRadius: shape.sm,
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
        marginLeft: space.md,
        marginRight: space.sm,
        justifyContent: 'center',
    },
    title: {
        ...font.titleSmall,
        fontWeight: '600',
        color: '#fff',
        marginBottom: space.xs,
    },
    artist: {
        ...font.bodySmall,
        color: THEME.textMuted,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.sm,
    },
    actionBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: shape.full,
        overflow: 'hidden',
    },
});
