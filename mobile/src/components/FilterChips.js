import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { THEME } from '../config';

const CHIPS = [
  { id: 'all', label: 'Semua' },
  { id: 'favorites', label: 'Favorit ❤️' },
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
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
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
    marginBottom: 14,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  chipActive: {
    backgroundColor: THEME.accent,
    borderColor: THEME.accent,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.textMuted,
  },
  chipTextActive: {
    color: '#000',
    fontWeight: '700',
  },
});
