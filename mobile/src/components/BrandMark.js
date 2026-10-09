import React from 'react';
import { View } from 'react-native';

export default function BrandMark({
    size = 28,
    color = '#fff',
    strokeWidth = 2,
}) {
    const innerSize = size * 0.3;

    return (
        <View
            style={{
                width: size,
                height: size,
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <View
                style={{
                    position: 'absolute',
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderWidth: strokeWidth,
                    borderColor: color,
                }}
            />
            <View
                style={{
                    width: innerSize,
                    height: innerSize,
                    borderRadius: innerSize / 2,
                    borderWidth: strokeWidth,
                    borderColor: color,
                }}
            />
        </View>
    );
}
