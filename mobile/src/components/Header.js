import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../config';

export default function Header({ trackCount }) {
  return (
    <View style={styles.header}>
      <View style={styles.leftRow}>
        <View style={styles.iconCircle}>
          <Ionicons name="musical-notes" size={16} color="#000" />
        </View>
        <Text style={styles.title}>Spotirid</Text>
      </View>
      <View style={styles.badge}>
        <View style={styles.liveDot} />
        <Text style={styles.badgeText}>{trackCount} TRACKS</Text>
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
    paddingBottom: 14,
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
    backgroundColor: THEME.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(204, 242, 40, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.borderAccent,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.accent,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.accent,
    letterSpacing: 0.5,
  },
});
