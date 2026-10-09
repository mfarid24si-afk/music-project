import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME, space, shape, font, ripple } from '../config';

export default function SearchBar({ value, onChangeText, onClear }) {
    return (
        <View style={styles.container}>
            <View style={styles.searchBox}>
                <Ionicons
                    name="search"
                    size={18}
                    color={THEME.textMuted}
                    style={styles.searchIcon}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Cari lagu, artist, album, genre..."
                    placeholderTextColor={THEME.textMuted}
                    value={value}
                    onChangeText={onChangeText}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="search"
                />
                {value.length > 0 && (
                    <TouchableOpacity
                        onPress={onClear}
                        style={styles.clearBtn}
                        android_ripple={ripple.borderless(
                            'rgba(255,255,255,0.16)',
                            16,
                        )}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons
                            name="close-circle"
                            size={18}
                            color={THEME.textMuted}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: space.lg,
        marginBottom: space.md,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.elevated,
        borderRadius: shape.full,
        borderWidth: 1,
        borderColor: THEME.border,
        paddingHorizontal: space.lg,
        height: 48,
    },
    searchIcon: {
        marginRight: space.sm,
    },
    input: {
        ...font.bodyMedium,
        flex: 1,
        color: '#fff',
        paddingVertical: 0,
    },
    clearBtn: {
        marginLeft: space.xs,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
