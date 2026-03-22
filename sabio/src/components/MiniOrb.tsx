import React, { useRef, useEffect } from 'react';
import { View, Animated } from 'react-native';

export default function MiniOrb({ size = 48 }: { size?: number }) {
  const breathe = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1.08, duration: 1800, useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  const ringColors = ['rgba(255,255,255,0.12)', 'rgba(232,168,56,0.18)', 'rgba(194,85,58,0.14)'];

  return (
    <View style={{ width: size + 20, height: size + 20, alignItems: 'center', justifyContent: 'center' }}>
      {ringColors.map((c, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            width: size + 8 + i * 10,
            height: size + 8 + i * 10,
            borderRadius: (size + 8 + i * 10) / 2,
            borderWidth: 1.5,
            borderColor: c,
            transform: [{ scale: breathe }],
          }}
        />
      ))}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: 'rgba(255,255,255,0.15)',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 2,
          borderColor: 'rgba(255,255,255,0.25)',
        }}
      >
        <View
          style={{
            width: size * 0.45,
            height: size * 0.45,
            borderRadius: (size * 0.45) / 2,
            backgroundColor: 'rgba(255,255,255,0.5)',
          }}
        />
      </View>
    </View>
  );
}
