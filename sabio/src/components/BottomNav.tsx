import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeIcon, BookIcon, ChatIcon, MicIcon, UsersIcon } from './Icons';
import { colors, fonts } from '../theme';

type NavItem = {
  id: string;
  label: string;
  icon: (props: { color: string }) => React.ReactNode;
};

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: ({ color }) => <HomeIcon size={22} color={color} /> },
  { id: 'learn', label: 'Learn', icon: ({ color }) => <BookIcon size={22} color={color} /> },
  { id: 'chat', label: 'Dillow', icon: ({ color }) => <ChatIcon size={22} color={color} /> },
  { id: 'practice', label: 'Practice', icon: ({ color }) => <MicIcon size={22} color={color} /> },
  { id: 'social', label: 'Social', icon: ({ color }) => <UsersIcon size={22} color={color} /> },
];

type BottomNavProps = {
  activeTab: string;
  onTabPress: (tabId: string) => void;
};

export default function BottomNav({ activeTab, onTabPress }: BottomNavProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        const itemColor = isActive ? colors.terracotta : colors.warmGrayLight;

        return (
          <Pressable
            key={item.id}
            onPress={() => onTabPress(item.id)}
            style={styles.navItem}
          >
            {isActive && <View style={styles.activeIndicator} />}
            {item.icon({ color: itemColor })}
            <Text style={[styles.label, { color: itemColor }]}>
              {item.label}
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
    backgroundColor: 'rgba(245,237,224,0.85)',
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
    backgroundColor: colors.terracotta,
    borderRadius: 2,
  },
  label: {
    fontSize: 10,
    fontFamily: fonts.medium,
    letterSpacing: 0.3,
  },
});
