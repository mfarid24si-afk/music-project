import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../config';

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
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.elevated,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: THEME.border,
        paddingHorizontal: 14,
        height: 44,
    },
    searchIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        color: '#fff',
        fontSize: 14,
        paddingVertical: 0,
    },
    clearBtn: {
        marginLeft: 6,
    },
});
