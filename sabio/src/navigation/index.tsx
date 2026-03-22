import React, { useRef, useState, useCallback, createContext, useContext } from 'react';
import { ActivityIndicator, View, Animated, Dimensions, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
import CustomTabBar from '../components/BottomNav';

import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import DillowChatScreen from '../screens/DillowChatScreen';
import NotesScreen from '../screens/NotesScreen';
import LessonsScreen from '../screens/LessonsScreen';
import LessonDetailScreen from '../screens/LessonDetailScreen';
import PracticeScreen from '../screens/PracticeScreen';
import PhrasePracticeScreen from '../screens/PhrasePracticeScreen';
import ColorGameScreen from '../screens/ColorGameScreen';
import AccountScreen from '../screens/AccountScreen';

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type RootStackParamList = {
  Tabs: undefined;
  DillowChat: undefined;
  Notes: undefined;
  LessonDetail: { lessonId: string };
  PhrasePractice: undefined;
  ColorGame: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<RootStackParamList>();

const { width: SCREEN_W } = Dimensions.get('window');

// Tab order: Home(0)  Lessons(1)  [Dillow=skip]  Practice(2)  Account(3)
// The paging strip has 4 pages; Dillow is not a page, it pushes a stack screen.
const TAB_IDS = ['home', 'learn', 'chat', 'practice', 'account'] as const;
export type TabId = (typeof TAB_IDS)[number];

// Maps tab id → page index in the horizontal strip (Dillow has no page)
const PAGE_INDEX: Record<string, number> = { home: 0, learn: 1, practice: 2, account: 3 };

// Context so child screens can switch tabs
const TabSwitchContext = createContext<(id: TabId) => void>(() => {});
export const useTabSwitch = () => useContext(TabSwitchContext);

const pages: { id: TabId; component: React.ComponentType<any> }[] = [
  { id: 'home', component: HomeScreen },
  { id: 'learn', component: LessonsScreen },
  { id: 'practice', component: PracticeScreen },
  { id: 'account', component: AccountScreen },
];

function TabsScreen({ navigation }: any) {
  const [activePageIdx, setActivePageIdx] = useState(0);
  const stripX = useRef(new Animated.Value(0)).current;
  const activeRef = useRef(0);

  const switchTo = useCallback((id: TabId) => {
    if (id === 'chat') {
      navigation.navigate('DillowChat');
      return;
    }
    const idx = PAGE_INDEX[id];
    if (idx === undefined || idx === activeRef.current) return;

    activeRef.current = idx;
    setActivePageIdx(idx);

    Animated.spring(stripX, {
      toValue: -idx * SCREEN_W,
      damping: 24,
      stiffness: 200,
      mass: 0.9,
      useNativeDriver: true,
    }).start();
  }, [navigation, stripX]);

  // Convert page index back to tab id for the BottomNav
  const activeTabId = pages[activePageIdx].id;

  return (
    <TabSwitchContext.Provider value={switchTo}>
      <View style={styles.container}>
        {/* Horizontal strip of all tab screens */}
        <Animated.View
          style={[
            styles.strip,
            {
              width: SCREEN_W * pages.length,
              transform: [{ translateX: stripX }],
            },
          ]}
        >
          {pages.map((page) => {
            const Screen = page.component;
            return (
              <View key={page.id} style={{ width: SCREEN_W, flex: 1 }}>
                <Screen />
              </View>
            );
          })}
        </Animated.View>

        {/* Persistent bottom nav */}
        <CustomTabBar activeTab={activeTabId} onTabPress={switchTo} />
      </View>
    </TabSwitchContext.Provider>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{ animation: 'slide_from_right', gestureEnabled: true }}
      />
    </AuthStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="Tabs" component={TabsScreen} />
      <MainStack.Screen
        name="DillowChat"
        component={DillowChatScreen}
        options={{ animation: 'slide_from_bottom', gestureEnabled: true }}
      />
      <MainStack.Screen
        name="Notes"
        component={NotesScreen}
        options={{ animation: 'slide_from_right', gestureEnabled: true }}
      />
      <MainStack.Screen
        name="LessonDetail"
        component={LessonDetailScreen}
        options={{ animation: 'slide_from_right', gestureEnabled: true }}
      />
      <MainStack.Screen
        name="PhrasePractice"
        component={PhrasePracticeScreen}
        options={{ animation: 'slide_from_right', gestureEnabled: true }}
      />
      <MainStack.Screen
        name="ColorGame"
        component={ColorGameScreen}
        options={{ animation: 'slide_from_right', gestureEnabled: true }}
      />
    </MainStack.Navigator>
  );
}

export default function RootNavigator() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.teal} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {session ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  strip: {
    flex: 1,
    flexDirection: 'row',
  },
});
