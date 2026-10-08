import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudio } from '../context/AudioContext';
import { THEME } from '../config';

export default function Header({ trackCount }) {
  const { activeTheme } = useAudio();
  const accentColor = activeTheme?.color || THEME.accent;

  return (
    <View style={styles.header}>
      {/* Brand Logo & Name */}
      <View style={styles.leftRow}>
        <View style={[styles.iconCircle, { backgroundColor: accentColor }]}>
          <Ionicons name="musical-notes" size={16} color="#000" />
        </View>
        <Text style={styles.title}>Spotirid</Text>
      </View>

      {/* Right Action: Clean Track Counter Badge (No Redundant Gear Button) */}
      <View style={styles.rightRow}>
        <View style={[styles.badge, { borderColor: accentColor + '55' }]}>
          <View style={[styles.liveDot, { backgroundColor: accentColor }]} />
          <Text style={[styles.badgeText, { color: accentColor }]}>{trackCount} LAGU</Text>
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
