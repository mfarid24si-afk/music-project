import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BrandMark from './BrandMark';
import { useAudio } from '../context/AudioContext';
import { THEME, space, shape, font, ripple } from '../config';

export default function Header({ trackCount, onLogoPress }) {
    const { activeTheme } = useAudio();
    const accentColor = activeTheme?.color || THEME.accent;

    return (
        <View style={styles.header}>
            {/* Brand Logo & Name (tap to open navigation drawer) */}
            <TouchableOpacity
                style={styles.leftRow}
                onPress={onLogoPress}
                activeOpacity={0.7}
                android_ripple={ripple.borderless('rgba(255,255,255,0.16)', 24)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
                <BrandMark size={26} color={accentColor} />
                <Text style={styles.title}>Spotirid</Text>
            </TouchableOpacity>

            {/* Right Action: Clean Track Counter Badge (No Redundant Gear Button) */}
            <View style={styles.rightRow}>
                <View
                    style={[styles.badge, { borderColor: accentColor + '55' }]}
                >
                    <View
                        style={[
                            styles.liveDot,
                            { backgroundColor: accentColor },
                        ]}
                    />
                    <Text style={[styles.badgeText, { color: accentColor }]}>
                        {trackCount} LAGU
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: space.lg,
        paddingTop: space.sm,
        paddingBottom: space.md,
    },
    leftRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.sm,
        paddingVertical: space.xs,
        paddingRight: space.sm,
        borderRadius: shape.full,
    },
    title: {
        ...font.titleLarge,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: -0.5,
    },
    rightRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: space.md,
        paddingVertical: space.xs,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: shape.full,
        borderWidth: 1,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: shape.full,
    },
    badgeText: {
        ...font.labelSmall,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
});
