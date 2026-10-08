import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../config';
import { openUpdateLink } from '../services/versionChecker';

export default function UpdateModal({ visible, updateInfo, onClose }) {
  if (!visible || !updateInfo) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={updateInfo.isMandatory ? undefined : onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Badge Icon */}
          <View style={styles.iconCircle}>
            <Ionicons name="sparkles" size={26} color="#000" />
          </View>

          <Text style={styles.title}>Pembaruan Tersedia 🚀</Text>
          <Text style={styles.versionTag}>Versi Baru: v{updateInfo.latestVersion}</Text>

          <Text style={styles.notesText}>
            {updateInfo.notes || 'Versi terbaru Spotirid menghadirkan performa audio yang lebih baik dan perbaikan antarmuka.'}
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => openUpdateLink(updateInfo.downloadUrl)}
              activeOpacity={0.8}
            >
              <Ionicons name="download-outline" size={18} color="#000" />
              <Text style={styles.primaryBtnText}>Perbarui Sekarang</Text>
            </TouchableOpacity>

            {!updateInfo.isMandatory && (
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.secondaryBtnText}>Nanti Saja</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: THEME.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: THEME.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.4,
    marginBottom: 6,
    textAlign: 'center',
  },
  versionTag: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.accent,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  notesText: {
    fontSize: 13,
    color: THEME.textMuted,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 22,
  },
  buttonGroup: {
    width: '100%',
    gap: 10,
  },
  primaryBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: THEME.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000',
  },
  secondaryBtn: {
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.textMuted,
  },
});
