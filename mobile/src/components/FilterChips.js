import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { THEME, space, shape, font, ripple } from '../config';

const CHIPS = [
    { id: 'all', label: 'All Sessions' },
    { id: 'favorites', label: 'Favorites' },
    { id: 'lossless', label: 'Lossless Only' },
    { id: 'Pop', label: 'Pop' },
    { id: 'Rock', label: 'Rock' },
    { id: 'Dance', label: 'Dance' },
    { id: 'Indie', label: 'Indie' },
    { id: 'K-Pop', label: 'K-Pop' },
];

export default function FilterChips({ activeFilter, onSelectFilter }) {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            style={styles.container}
        >
            {CHIPS.map((chip) => {
                const isActive = activeFilter === chip.id;
                return (
                    <TouchableOpacity
                        key={chip.id}
                        onPress={() => onSelectFilter(chip.id)}
                        style={[styles.chip, isActive && styles.chipActive]}
                        android_ripple={ripple.bounded()}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.chipText,
                                isActive && styles.chipTextActive,
                            ]}
                        >
                            {chip.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 48,
        maxHeight: 48,
        flexGrow: 0,
        marginBottom: space.md,
    },
    scrollContent: {
        paddingHorizontal: space.lg,
        gap: space.sm,
        alignItems: 'center',
        height: 48,
    },
    chip: {
        height: 36,
        paddingHorizontal: space.lg,
        borderRadius: shape.full,
        backgroundColor: THEME.surface,
        borderWidth: 1,
        borderColor: THEME.border,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    chipActive: {
        backgroundColor: THEME.accent,
        borderColor: THEME.accent,
    },
    chipText: {
        ...font.labelMedium,
        fontWeight: '600',
        color: THEME.textMuted,
    },
    chipTextActive: {
        color: '#000',
        fontWeight: '700',
    },
});
