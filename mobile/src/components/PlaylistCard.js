import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { THEME, space, shape, font, elevation, ripple } from '../config';

const DEFAULT_COVER =
    'https://farid-peminjaman.alwaysdata.net/assets/covers/believer.jpg';

export default function PlaylistCard({
    playlist,
    onOpen,
    onPlayAll,
    activeTheme,
}) {
    const accentColor = activeTheme?.color || THEME.accent;
    const coverUri = playlist.cover || playlist.custom_cover || DEFAULT_COVER;
    const songCount = Array.isArray(playlist.songs)
        ? playlist.songs.length
        : playlist.song_count || 0;
    const isPending = playlist.status === 'pending';

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onOpen}
            android_ripple={ripple.bounded()}
            activeOpacity={0.8}
        >
            <View style={styles.imageBox}>
                <Image source={{ uri: coverUri }} style={styles.image} />

                {/* Pending Badge */}
                {isPending && (
                    <View style={styles.pendingBadge}>
                        <Text style={styles.pendingText}>PENDING</Text>
                    </View>
                )}

                {/* Play Floating Button */}
                <TouchableOpacity
                    style={[styles.playBtn, { backgroundColor: accentColor }]}
                    onPress={onPlayAll}
                    android_ripple={ripple.borderless('rgba(0,0,0,0.18)', 20)}
                    activeOpacity={0.8}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Ionicons
                        name="play"
                        size={16}
                        color="#000"
                        style={{ marginLeft: 2 }}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.info}>
                <Text numberOfLines={1} style={styles.title}>
                    {playlist.name}
                </Text>
                <Text numberOfLines={1} style={styles.creator}>
                    {playlist.creator_name
                        ? `Oleh ${playlist.creator_name}`
                        : 'Spotirid Playlist'}
                </Text>
            </View>

            <View style={styles.bottomBar}>
                <Text style={styles.badge}>{songCount} TRACKS</Text>
                <Ionicons name="list" size={14} color={THEME.textMuted} />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '48.5%',
        backgroundColor: THEME.surface,
        borderRadius: shape.lg,
        borderWidth: 1,
        borderColor: THEME.border,
        padding: space.md,
        marginBottom: space.md,
        overflow: 'hidden',
    },
    imageBox: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: shape.md,
        overflow: 'hidden',
        backgroundColor: THEME.elevated,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    pendingBadge: {
        position: 'absolute',
        top: 6,
        left: 6,
        backgroundColor: 'rgba(234, 179, 8, 0.9)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    pendingText: {
        fontSize: 8,
        fontWeight: '800',
        color: '#000',
        letterSpacing: 0.5,
    },
    playBtn: {
        position: 'absolute',
        bottom: space.sm,
        right: space.sm,
        width: 40,
        height: 40,
        borderRadius: shape.full,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        ...elevation[3],
    },
    info: {
        marginTop: space.sm,
        marginBottom: space.xs,
    },
    title: {
        ...font.titleSmall,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 2,
    },
    creator: {
        ...font.bodySmall,
        color: THEME.textMuted,
    },
    bottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: space.sm,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
    },
    badge: {
        ...font.labelSmall,
        fontWeight: '800',
        color: THEME.textMuted,
        letterSpacing: 0.5,
    },
});
