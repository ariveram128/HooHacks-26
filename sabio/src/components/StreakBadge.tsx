import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { FlameIcon } from './Icons';
import { colors, fonts } from '../theme';

type StreakBadgeProps = {
  days: number;
};

export default function StreakBadge({ days }: StreakBadgeProps) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.08,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const interval = setInterval(pulse, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Animated.View style={[styles.badge, { transform: [{ scale }] }]}>
      <FlameIcon size={18} />
      <Text style={styles.text}>{days} days</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.charcoal,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 24,
  },
  text: {
    color: colors.marigold,
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
});
