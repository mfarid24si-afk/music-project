import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME, space, shape, font, elevation, ripple } from '../config';
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
                    <Text style={styles.versionTag}>
                        Versi Baru: v{updateInfo.latestVersion}
                    </Text>

                    <Text style={styles.notesText}>
                        {updateInfo.notes ||
                            'Versi terbaru Spotirid menghadirkan performa audio yang lebih baik dan perbaikan antarmuka.'}
                    </Text>

                    {/* Action Buttons */}
                    <View style={styles.buttonGroup}>
                        <TouchableOpacity
                            style={styles.primaryBtn}
                            onPress={() =>
                                openUpdateLink(updateInfo.downloadUrl)
                            }
                            android_ripple={ripple.bounded()}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name="download-outline"
                                size={18}
                                color="#000"
                            />
                            <Text style={styles.primaryBtnText}>
                                Perbarui Sekarang
                            </Text>
                        </TouchableOpacity>

                        {!updateInfo.isMandatory && (
                            <TouchableOpacity
                                style={styles.secondaryBtn}
                                onPress={onClose}
                                android_ripple={ripple.bounded()}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.secondaryBtnText}>
                                    Nanti Saja
                                </Text>
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
        paddingHorizontal: space.xl,
    },
    dialog: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: THEME.surface,
        borderRadius: shape.xl,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
        padding: space.xl,
        alignItems: 'center',
        ...elevation[5],
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: shape.full,
        backgroundColor: THEME.accent,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: space.lg,
        shadowColor: THEME.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 6,
    },
    title: {
        ...font.titleLarge,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: -0.4,
        marginBottom: space.sm,
        textAlign: 'center',
    },
    versionTag: {
        ...font.bodySmall,
        fontWeight: '700',
        color: THEME.accent,
        letterSpacing: 0.5,
        marginBottom: space.md,
    },
    notesText: {
        ...font.bodyMedium,
        color: THEME.textMuted,
        textAlign: 'center',
        marginBottom: space.xl,
    },
    buttonGroup: {
        width: '100%',
        gap: space.md,
    },
    primaryBtn: {
        height: 48,
        borderRadius: shape.full,
        backgroundColor: THEME.accent,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: space.sm,
        overflow: 'hidden',
        shadowColor: THEME.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryBtnText: {
        ...font.labelLarge,
        fontWeight: '800',
        color: '#000',
    },
    secondaryBtn: {
        height: 44,
        borderRadius: shape.full,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    secondaryBtnText: {
        ...font.labelLarge,
        fontWeight: '600',
        color: THEME.textMuted,
    },
});
