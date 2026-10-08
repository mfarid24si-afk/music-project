import React, { useRef, useEffect } from 'react';
import {
    View,
    Modal,
    StyleSheet,
    Animated,
    PanResponder,
    Dimensions,
    TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '../config';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SwipeModal({
    visible,
    onClose,
    children,
    height = '90%',
}) {
    const insets = useSafeAreaInsets();
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    useEffect(() => {
        if (visible) {
            Animated.spring(translateY, {
                toValue: 0,
                bounciness: 4,
                speed: 14,
                useNativeDriver: true,
            }).start();
        } else {
            translateY.setValue(SCREEN_HEIGHT);
        }
    }, [visible]);

    const handleClose = () => {
        Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            onClose();
        });
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return gestureState.dy > 5 && Math.abs(gestureState.dx) < 20;
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    translateY.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                // Lower threshold (50px or slight flick velocity) makes closing effortless
                if (gestureState.dy > 50 || gestureState.vy > 0.35) {
                    handleClose();
                } else {
                    Animated.spring(translateY, {
                        toValue: 0,
                        bounciness: 4,
                        useNativeDriver: true,
                    }).start();
                }
            },
        }),
    ).current;

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                {/* Backdrop touch to close */}
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={handleClose}
                />

                <Animated.View
                    style={[
                        styles.sheet,
                        {
                            height: height,
                            paddingBottom: Math.max(insets.bottom, 16),
                        },
                        { transform: [{ translateY }] },
                    ]}
                >
                    {/* Large Draggable Header Handle Bar */}
                    <View
                        style={styles.dragHandleArea}
                        {...panResponder.panHandlers}
                        hitSlop={{ top: 16, bottom: 16, left: 30, right: 30 }}
                    >
                        <View style={styles.dragBar} />
                    </View>

                    {/* Sheet Body Content */}
                    <View style={styles.content}>{children}</View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    sheet: {
        width: '100%',
        backgroundColor: THEME.bg,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
        overflow: 'hidden',
    },
    dragHandleArea: {
        width: '100%',
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    dragBar: {
        width: 48,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
    content: {
        flex: 1,
    },
});
