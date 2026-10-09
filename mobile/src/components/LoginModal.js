import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import SwipeModal from './SwipeModal';
import { useAudio } from '../context/AudioContext';
import {
    THEME,
    space,
    shape,
    font,
    touchTarget,
    elevation,
    ripple,
} from '../config';

export default function LoginModal({ visible, onClose }) {
    const { login, activeTheme } = useAudio();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const accentColor = activeTheme?.color || THEME.accent;

    const handleSubmit = async () => {
        Keyboard.dismiss();
        if (!email.trim() || !password) {
            setErrorMessage('Silakan isi email dan password.');
            return;
        }

        setLoading(true);
        setErrorMessage('');

        const res = await login(email.trim(), password);
        setLoading(false);

        if (res.success) {
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
            ).catch(() => {});
            setEmail('');
            setPassword('');
            onClose();
        } else {
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error,
            ).catch(() => {});
            setErrorMessage(res.message || 'Email atau password tidak sesuai.');
        }
    };

    return (
        <SwipeModal visible={visible} onClose={onClose} height="85%">
            <KeyboardAvoidingView
                style={styles.keyboardAvoid}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={styles.scrollContainer}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.badge}>
                                <Ionicons
                                    name="lock-closed"
                                    size={14}
                                    color={accentColor}
                                />
                                <Text
                                    style={[
                                        styles.badgeText,
                                        { color: accentColor },
                                    ]}
                                >
                                    AUTHENTICATION
                                </Text>
                            </View>
                            <Text style={styles.title}>
                                Masuk ke Akun Spotirid
                            </Text>
                            <Text style={styles.subtitle}>
                                Gunakan kredensial akun yang sama dengan yang
                                terdaftar di website.
                            </Text>
                        </View>

                        {/* Error Alert */}
                        {errorMessage ? (
                            <View style={styles.errorBox}>
                                <Ionicons
                                    name="alert-circle"
                                    size={18}
                                    color="#ef4444"
                                />
                                <Text style={styles.errorText}>
                                    {errorMessage}
                                </Text>
                            </View>
                        ) : null}

                        {/* Form Fields */}
                        <View style={styles.form}>
                            {/* Email Field */}
                            <View style={styles.field}>
                                <Text style={styles.label}>EMAIL ADDRESS</Text>
                                <View style={styles.inputBox}>
                                    <Ionicons
                                        name="mail-outline"
                                        size={18}
                                        color={THEME.textMuted}
                                        style={styles.fieldIcon}
                                    />
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="contoh@gmail.com"
                                        placeholderTextColor={THEME.textMuted}
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        returnKeyType="next"
                                    />
                                </View>
                            </View>

                            {/* Password Field */}
                            <View style={styles.field}>
                                <Text style={styles.label}>PASSWORD</Text>
                                <View style={styles.inputBox}>
                                    <Ionicons
                                        name="key-outline"
                                        size={18}
                                        color={THEME.textMuted}
                                        style={styles.fieldIcon}
                                    />
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="Masukkan password Anda..."
                                        placeholderTextColor={THEME.textMuted}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        returnKeyType="done"
                                        onSubmitEditing={handleSubmit}
                                    />
                                    <TouchableOpacity
                                        style={styles.eyeBtn}
                                        onPress={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        hitSlop={{
                                            top: 12,
                                            bottom: 12,
                                            left: 12,
                                            right: 12,
                                        }}
                                        android_ripple={ripple.borderless(
                                            'rgba(255,255,255,0.16)',
                                            24,
                                        )}
                                    >
                                        <Ionicons
                                            name={
                                                showPassword
                                                    ? 'eye-off-outline'
                                                    : 'eye-outline'
                                            }
                                            size={20}
                                            color={
                                                showPassword
                                                    ? accentColor
                                                    : THEME.textMuted
                                            }
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Submit Button */}
                            <TouchableOpacity
                                style={[
                                    styles.submitBtn,
                                    { backgroundColor: accentColor },
                                ]}
                                onPress={handleSubmit}
                                disabled={loading}
                                android_ripple={ripple.bounded()}
                                activeOpacity={0.8}
                            >
                                {loading ? (
                                    <ActivityIndicator
                                        size="small"
                                        color="#000"
                                    />
                                ) : (
                                    <View style={styles.btnRow}>
                                        <Ionicons
                                            name="log-in-outline"
                                            size={18}
                                            color="#000"
                                        />
                                        <Text style={styles.submitBtnText}>
                                            Masuk Sekarang
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SwipeModal>
    );
}

const styles = StyleSheet.create({
    keyboardAvoid: {
        flex: 1,
    },
    scrollContainer: {
        paddingHorizontal: space.xl,
        paddingTop: space.sm,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: space.xl,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.sm,
        paddingHorizontal: space.md,
        paddingVertical: space.xs,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: shape.full,
        marginBottom: space.sm,
    },
    badgeText: {
        ...font.labelSmall,
        fontWeight: '800',
        letterSpacing: 0.8,
    },
    title: {
        ...font.titleLarge,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: -0.4,
        marginBottom: space.xs,
    },
    subtitle: {
        ...font.bodySmall,
        color: THEME.textMuted,
        textAlign: 'center',
    },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.sm,
        backgroundColor: 'rgba(239, 68, 68, 0.12)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        borderRadius: shape.md,
        padding: space.md,
        marginBottom: space.lg,
    },
    errorText: {
        ...font.bodySmall,
        color: '#fca5a5',
        flex: 1,
    },
    form: {
        gap: space.lg,
    },
    field: {
        gap: space.sm,
    },
    label: {
        ...font.labelSmall,
        fontWeight: '800',
        color: THEME.textMuted,
        letterSpacing: 0.6,
    },
    inputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.surface,
        borderRadius: shape.lg,
        borderWidth: 1,
        borderColor: THEME.border,
        height: 52,
        paddingHorizontal: space.md,
    },
    fieldIcon: {
        marginRight: space.sm,
    },
    textInput: {
        flex: 1,
        height: '100%',
        color: '#fff',
        ...font.bodyMedium,
        paddingVertical: 0,
    },
    eyeBtn: {
        ...touchTarget,
        borderRadius: shape.full,
        marginLeft: space.xs,
        overflow: 'hidden',
    },
    submitBtn: {
        height: 50,
        borderRadius: shape.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: space.sm,
        overflow: 'hidden',
        ...elevation[3],
    },
    btnRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.sm,
    },
    submitBtnText: {
        ...font.labelLarge,
        fontWeight: '800',
        color: '#000',
    },
});
