import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeIcon, BookIcon, ChatIcon, MicIcon, UserIcon } from './Icons';
import { colors, fonts } from '../theme';
import type { TabId } from '../navigation';

const SCREEN_W = Dimensions.get('window').width;
const TAB_COUNT = 5;
const TAB_W = SCREEN_W / TAB_COUNT;
const INDICATOR_W = 20;
const BUTTON_SIZE = 58;

function indicatorX(index: number) {
  return TAB_W * index + (TAB_W - INDICATOR_W) / 2;
}

const tabMeta: { id: TabId; label: string; icon: any; isCenter?: boolean }[] = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'learn', label: 'Learn', icon: BookIcon },
  { id: 'chat', label: 'Dillow', icon: ChatIcon, isCenter: true },
  { id: 'practice', label: 'Practice', icon: MicIcon },
  { id: 'account', label: 'Account', icon: UserIcon },
];

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

type BottomNavProps = {
  activeTab: TabId;
  onTabPress: (id: TabId) => void;
};

export default function BottomNav({ activeTab, onTabPress }: BottomNavProps) {
  const insets = useSafeAreaInsets();

  const activeVisualIndex = tabMeta.findIndex((t) => t.id === activeTab);
  const slideX = useRef(new Animated.Value(indicatorX(activeVisualIndex))).current;

  useEffect(() => {
    Animated.spring(slideX, {
      toValue: indicatorX(activeVisualIndex),
      damping: 20,
      stiffness: 200,
      useNativeDriver: true,
    }).start();
  }, [activeVisualIndex]);

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      {/* Sliding indicator — behind center button */}
      <Animated.View
        style={[
          styles.slidingIndicator,
          { transform: [{ translateX: slideX }] },
        ]}
      />

      {tabMeta.map((tab) => {
        if (tab.isCenter) {
          return (
            <CenterButton key={tab.id} onPress={() => onTabPress('chat')} />
          );
        }

        const isActive = activeTab === tab.id;
        const itemColor = isActive ? colors.teal : colors.warmGrayLight;
        const Icon = tab.icon;

        return (
          <Pressable
            key={tab.id}
            onPress={() => onTabPress(tab.id)}
            style={styles.navItem}
          >
            <Icon size={22} color={itemColor} />
            <Text style={[styles.label, { color: itemColor }]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

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
  slidingIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: INDICATOR_W,
    height: 3,
    backgroundColor: colors.teal,
    borderRadius: 2,
    zIndex: 1,
  },
  navItem: {
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 12,
    paddingVertical: 4,
    width: TAB_W,
  },
  label: {
    fontSize: 10,
    fontFamily: fonts.medium,
    letterSpacing: 0.3,
  },
  centerWrapper: {
    alignItems: 'center',
    marginTop: -(BUTTON_SIZE / 2 + 4),
    width: TAB_W,
    zIndex: 10,
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
