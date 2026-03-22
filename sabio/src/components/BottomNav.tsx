import React, { useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeIcon, BookIcon, ChatIcon, MicIcon, UserIcon } from './Icons';
import { colors, fonts } from '../theme';

type NavItem = {
  id: string;
  label: string;
  icon: (props: { color: string; size: number }) => React.ReactNode;
  isCenter?: boolean;
};

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: ({ color, size }) => <HomeIcon size={size} color={color} /> },
  { id: 'learn', label: 'Learn', icon: ({ color, size }) => <BookIcon size={size} color={color} /> },
  { id: 'chat', label: 'Dillow', icon: ({ color, size }) => <ChatIcon size={size} color={color} />, isCenter: true },
  { id: 'practice', label: 'Practice', icon: ({ color, size }) => <MicIcon size={size} color={color} /> },
  { id: 'account', label: 'Account', icon: ({ color, size }) => <UserIcon size={size} color={color} /> },
];

type BottomNavProps = {
  activeTab: string;
  onTabPress: (tabId: string) => void;
};

function CenterButton({ onPress }: { onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.9, useNativeDriver: true, friction: 6 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 4 }).start();
  };

  return (
    <View style={styles.centerWrapper}>
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Animated.View style={[styles.centerButton, { transform: [{ scale }] }]}>
          <ChatIcon size={26} color={colors.cream} />
        </Animated.View>
      </Pressable>
      <Text style={styles.centerLabel}>Dillow</Text>
    </View>
  );
}

export default function BottomNav({ activeTab, onTabPress }: BottomNavProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      {navItems.map((item) => {
        if (item.isCenter) {
          return (
            <CenterButton key={item.id} onPress={() => onTabPress(item.id)} />
          );
        }

        const isActive = activeTab === item.id;
        const itemColor = isActive ? colors.teal : colors.warmGrayLight;

        return (
          <Pressable
            key={item.id}
            onPress={() => onTabPress(item.id)}
            style={styles.navItem}
          >
            {isActive && <View style={styles.activeIndicator} />}
            {item.icon({ color: itemColor, size: 22 })}
            <Text style={[styles.label, { color: itemColor }]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const BUTTON_SIZE = 58;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    backgroundColor: colors.cream,
    borderTopWidth: 1,
    borderTopColor: colors.creamDark,
    paddingTop: 10,
  },
  navItem: {
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 12,
    paddingVertical: 4,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: -10,
    width: 20,
    height: 3,
    backgroundColor: colors.teal,
    borderRadius: 2,
  },
  label: {
    fontSize: 10,
    fontFamily: fonts.medium,
    letterSpacing: 0.3,
  },
  centerWrapper: {
    alignItems: 'center',
    marginTop: -(BUTTON_SIZE / 2 + 4), // pop up above the bar
  },
  centerButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.tealDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  centerLabel: {
    fontSize: 10,
    fontFamily: fonts.medium,
    letterSpacing: 0.3,
    color: colors.teal,
    marginTop: 3,
  },
});
