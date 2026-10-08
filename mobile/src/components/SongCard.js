import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../config';

const DEFAULT_COVER =
    'https://farid-peminjaman.alwaysdata.net/assets/covers/believer.jpg';

export default function SongCard({
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

    const rawGenre = String(song?.genre || '');
    const genreTag = rawGenre
        ? rawGenre.split('/')[0].trim().toUpperCase()
        : null;

    return (
        <TouchableOpacity
            style={[
                styles.card,
                isCurrent && {
                    borderColor: accentColor + '66',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                },
            ]}
            onPress={onPlay}
            activeOpacity={0.8}
        >
            {/* Cover Image Container */}
            <View style={styles.imageBox}>
                <Image
                    source={{ uri: coverUri }}
                    style={styles.image}
                    onError={() => setImgError(true)}
                />

                {/* Genre Pill */}
                {genreTag ? (
                    <View style={styles.genrePill}>
                        <Text
                            style={[styles.genreText, { color: accentColor }]}
                            numberOfLines={1}
                        >
                            {genreTag}
                        </Text>
                    </View>
                ) : null}

                {/* Play State Overlay */}
                {isCurrent && isPlaying ? (
                    <View
                        style={[
                            styles.playingBadge,
                            { backgroundColor: accentColor },
                        ]}
                    >
                        <Ionicons name="volume-high" size={14} color="#000" />
                    </View>
                ) : null}
            </View>

            {/* Info Section */}
            <View style={styles.info}>
                <Text
                    numberOfLines={1}
                    style={[styles.title, isCurrent && { color: accentColor }]}
                >
                    {String(song?.title || 'Unknown Title')}
                </Text>
                <Text numberOfLines={1} style={styles.artist}>
                    {String(song?.artist || 'Unknown Artist')}
                </Text>
            </View>

            {/* Bottom Bar: Add to Playlist & Like */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    onPress={onAddToPlaylist}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={styles.actionBtn}
                >
                    <Ionicons
                        name="add-circle-outline"
                        size={19}
                        color={THEME.textMuted}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onToggleLike}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={styles.actionBtn}
                >
                    <Ionicons
                        name={isLiked ? 'heart' : 'heart-outline'}
                        size={18}
                        color={isLiked ? accentColor : THEME.textMuted}
                    />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '48.5%',
        backgroundColor: THEME.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        padding: 10,
        marginBottom: 12,
    },
    imageBox: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: THEME.elevated,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    genrePill: {
        position: 'absolute',
        top: 6,
        left: 6,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    genreText: {
        fontSize: 8,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    playingBadge: {
        position: 'absolute',
        bottom: 6,
        right: 6,
        width: 26,
        height: 26,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.6,
        shadowRadius: 6,
        elevation: 4,
    },
    info: {
        marginTop: 8,
        marginBottom: 6,
    },
    title: {
        fontSize: 13,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 2,
    },
    artist: {
        fontSize: 11,
        color: THEME.textMuted,
    },
    bottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 6,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
    },
    actionBtn: {
        padding: 2,
    },
});
