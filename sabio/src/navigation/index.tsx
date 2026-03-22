import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

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

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type RootStackParamList = {
  Home: undefined;
  DillowChat: undefined;
  Notes: undefined;
  Lessons: undefined;
  LessonDetail: { lessonId: string };
  Practice: undefined;
  PhrasePractice: undefined;
  ColorGame: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<RootStackParamList>();

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
      <MainStack.Screen name="Home" component={HomeScreen} />
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
        name="Lessons"
        component={LessonsScreen}
        options={{ animation: 'slide_from_right', gestureEnabled: true }}
      />
      <MainStack.Screen
        name="LessonDetail"
        component={LessonDetailScreen}
        options={{ animation: 'slide_from_right', gestureEnabled: true }}
      />
      <MainStack.Screen
        name="Practice"
        component={PracticeScreen}
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
