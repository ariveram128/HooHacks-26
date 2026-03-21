import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

type DillowAvatarProps = {
  size?: number;
};

export default function DillowAvatar({ size = 56 }: DillowAvatarProps) {
  return (
    <View style={[styles.container, {
      width: size,
      height: size,
      borderRadius: size / 2,
    }]}>
      <Text style={{ fontSize: size * 0.5 }}>🦜</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.cream,
    shadowColor: colors.tealDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
});
