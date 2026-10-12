import { Dimensions, StyleSheet } from 'react-native';
import { THEME, space, shape, font, elevation } from '../config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(320, SCREEN_WIDTH * 0.82);

export const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        flexDirection: 'row',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    drawer: {
        width: DRAWER_WIDTH,
        height: '100%',
        backgroundColor: THEME.bg,
        borderRightWidth: 1,
        borderRightColor: 'rgba(255, 255, 255, 0.12)',
        elevation: 16,
    },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.md,
        paddingHorizontal: space.lg,
        paddingBottom: space.lg,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    },
    brandTextBox: {
        flex: 1,
    },
    brandTitle: {
        ...font.titleLarge,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: -0.4,
    },
    brandSubtitle: {
        ...font.labelSmall,
        color: THEME.textMuted,
        marginTop: 2,
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: shape.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        padding: space.lg,
        gap: space.lg,
    },
    navGroup: {
        gap: space.xs,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.md,
        paddingVertical: space.md,
        paddingHorizontal: space.md,
        borderRadius: shape.md,
        overflow: 'hidden',
    },
    navItemText: {
        ...font.bodyLarge,
        fontWeight: '600',
        color: '#fff',
    },
    section: {
        gap: space.sm,
    },
    sectionLabel: {
        ...font.labelSmall,
        fontWeight: '800',
        color: THEME.textMuted,
        letterSpacing: 0.8,
    },
    card: {
        backgroundColor: THEME.surface,
        borderRadius: shape.lg,
        borderWidth: 1,
        borderColor: THEME.border,
        padding: space.lg,
        ...elevation[1],
    },
    aboutText: {
        ...font.bodyMedium,
        fontWeight: '600',
        color: '#fff',
        lineHeight: 21,
    },
    aboutSub: {
        ...font.bodySmall,
        color: THEME.textMuted,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        marginVertical: space.md,
    },
    statsRow: {
        flexDirection: 'row',
        gap: space.md,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: THEME.elevated,
        borderRadius: shape.md,
        paddingVertical: space.md,
    },
    statValue: {
        ...font.headlineSmall,
        fontWeight: '800',
    },
    statLabel: {
        ...font.labelSmall,
        color: THEME.textMuted,
        marginTop: space.xs,
    },
    topLabel: {
        ...font.labelSmall,
        fontWeight: '800',
        color: THEME.textMuted,
        letterSpacing: 0.6,
        marginBottom: space.sm,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.md,
        paddingVertical: space.sm,
    },
    topRank: {
        ...font.titleMedium,
        fontWeight: '800',
        width: 20,
        textAlign: 'center',
    },
    topInfo: {
        flex: 1,
    },
    topTitle: {
        ...font.bodyMedium,
        fontWeight: '700',
        color: '#fff',
    },
    topArtist: {
        ...font.labelSmall,
        color: THEME.textMuted,
    },
    topCount: {
        ...font.labelMedium,
        fontWeight: '800',
        color: THEME.textMuted,
    },
    emptyText: {
        ...font.bodySmall,
        color: THEME.textMuted,
    },
    localNote: {
        ...font.labelSmall,
        color: THEME.textMuted,
        marginTop: space.md,
        opacity: 0.8,
    },
    cacheBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.md,
        backgroundColor: THEME.surface,
        borderWidth: 1,
        borderColor: THEME.border,
        borderRadius: shape.lg,
        padding: space.lg,
        overflow: 'hidden',
    },
    cacheText: {
        flex: 1,
    },
    cacheTitle: {
        ...font.titleSmall,
        fontWeight: '700',
        color: '#fff',
    },
    cacheSub: {
        ...font.labelSmall,
        color: THEME.textMuted,
        marginTop: 2,
    },
    versionText: {
        ...font.labelSmall,
        color: THEME.textMuted,
        textAlign: 'center',
        opacity: 0.7,
    },
});
