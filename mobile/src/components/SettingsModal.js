import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import SwipeModal from './SwipeModal';
import { useAudio } from '../context/AudioContext';
import { THEMES, THEME, APP_BASE_URL } from '../config';

export default function SettingsModal({ visible, onClose }) {
  const {
    profileName,
    setProfileName,
    activeTheme,
    setActiveTheme,
    currentUser,
    logout,
    setIsLoginOpen,
  } = useAudio();

  const [nameInput, setNameInput] = useState(profileName || 'Listener');
  const accentColor = activeTheme?.color || THEME.accent;

  const handleSaveName = () => {
    if (nameInput.trim()) {
      setProfileName(nameInput.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  };

  const handleSelectTheme = (t) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setActiveTheme(t);
  };

  const handleLogoutPress = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    await logout();
  };

  const currentThemeId = activeTheme?.id || 'default';

  return (
    <SwipeModal visible={visible} onClose={onClose} height="88%">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerTitleBox}>
            <Ionicons name="settings-sharp" size={20} color={accentColor} />
            <Text style={styles.headerTitle}>Pengaturan Player</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={24} color={THEME.textMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Account & Authentication Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>STATUS AKUN</Text>
            {currentUser ? (
              <View style={styles.card}>
                <View style={styles.userRow}>
                  <View style={[styles.avatar, { backgroundColor: accentColor }]}>
                    <Text style={styles.avatarText}>
                      {(currentUser.name || 'U').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{currentUser.name}</Text>
                    <Text style={styles.userEmail}>{currentUser.email}</Text>
                    <View style={styles.roleBadge}>
                      <Text style={styles.roleText}>
                        {(currentUser.role || 'MEMBER').toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.logoutBtn}
                  onPress={handleLogoutPress}
                  activeOpacity={0.7}
                >
                  <Ionicons name="log-out-outline" size={16} color="#ef4444" />
                  <Text style={styles.logoutBtnText}>Keluar dari Akun</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.card}>
                <Text style={styles.guestTitle}>Anda masuk sebagai Tamu (Guest)</Text>
                <Text style={styles.guestSubtitle}>
                  Login dengan akun Anda untuk sinkronisasi playlist dan pengajuan lagu.
                </Text>
                <TouchableOpacity
                  style={[styles.loginBtn, { backgroundColor: accentColor }]}
                  onPress={() => {
                    onClose();
                    setIsLoginOpen(true);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="log-in-outline" size={18} color="#000" />
                  <Text style={styles.loginBtnText}>Masuk ke Akun</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Profile Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>NAMA PANGGILAN</Text>
            <View style={styles.card}>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.textInput}
                  value={nameInput}
                  onChangeText={setNameInput}
                  placeholder="Nama sapaan..."
                  placeholderTextColor={THEME.textMuted}
                  maxLength={30}
                />
                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: accentColor }]} onPress={handleSaveName}>
                  <Text style={styles.saveBtnText}>Simpan</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Theme Selector Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>TEMA & AKSEN WARNA</Text>
            <View style={styles.card}>
              <View style={styles.themesGrid}>
                {THEMES.map((t) => {
                  const isSelected = currentThemeId === t.id;
                  return (
                    <TouchableOpacity
                      key={t.id}
                      style={[
                        styles.themeItem,
                        isSelected && { borderColor: t.color, backgroundColor: 'rgba(255,255,255,0.06)' },
                      ]}
                      onPress={() => handleSelectTheme(t)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.colorDot, { backgroundColor: t.color }]} />
                      <Text style={[styles.themeName, isSelected && { color: '#fff', fontWeight: '800' }]}>
                        {t.name}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={16} color={t.color} style={styles.checkIcon} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Audio Engine Specs */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>AUDIO SPECIFICATIONS</Text>
            <View style={styles.card}>
              <View style={styles.specRow}>
                <Text style={styles.specKey}>Audio Architecture</Text>
                <Text style={styles.specValue}>Expo Audio Native Core</Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.specKey}>Resolution</Text>
                <Text style={[styles.specValue, { color: accentColor }]}>
                  24-Bit / 96.0 kHz FLAC/WAV
                </Text>
              </View>
              <View style={styles.specRow}>
                <Text style={styles.specKey}>Background Audio</Text>
                <Text style={styles.specValue}>Aktif (iOS Lockscreen / Android)</Text>
              </View>
              <View style={[styles.specRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.specKey}>Lirik Tersinkronisasi</Text>
                <Text style={styles.specValue}>LRCLIB Realtime API</Text>
              </View>
            </View>
          </View>

          {/* Admin Portal Shortcut */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.adminBtn}
              onPress={() => {
                Linking.openURL(`${APP_BASE_URL}/admin/login`).catch(() => {});
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="shield-checkmark" size={18} color="#000" />
              <Text style={styles.adminBtnText}>Buka Web Admin Portal Spotirid</Text>
              <Ionicons name="open-outline" size={16} color="#000" style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SwipeModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
  },
  closeBtn: {
    padding: 6,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 40,
    gap: 20,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.textMuted,
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: THEME.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  userEmail: {
    fontSize: 12,
    color: THEME.textMuted,
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  roleText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fff',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  logoutBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fca5a5',
  },
  guestTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  guestSubtitle: {
    fontSize: 12,
    color: THEME.textMuted,
    lineHeight: 18,
    marginBottom: 14,
  },
  loginBtn: {
    height: 42,
    borderRadius: 21,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loginBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  textInput: {
    flex: 1,
    height: 42,
    backgroundColor: THEME.elevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingHorizontal: 12,
    color: '#fff',
    fontSize: 14,
  },
  saveBtn: {
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000',
  },
  themesGrid: {
    gap: 8,
  },
  themeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: THEME.elevated,
  },
  colorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 12,
  },
  themeName: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.textMuted,
    flex: 1,
  },
  checkIcon: {
    marginLeft: 8,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  specKey: {
    fontSize: 12,
    color: THEME.textMuted,
  },
  specValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  adminBtn: {
    height: 46,
    borderRadius: 23,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  adminBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000',
  },
});
