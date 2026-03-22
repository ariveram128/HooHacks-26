import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, fonts, spacing, radii } from '../theme';
import { ChevronLeftIcon } from '../components/Icons';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const NOTIF_KEY = '@sabio_notif_prefs';

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { user, signOut } = useAuth();

  const displayName = user?.user_metadata?.name || '';
  const displayEmail = user?.email || '';

  // ── Name ──
  const [name, setName] = useState(displayName);
  const [nameSaving, setNameSaving] = useState(false);
  const [nameMsg, setNameMsg] = useState('');

  // ── Password ──
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passSaving, setPassSaving] = useState(false);
  const [passMsg, setPassMsg] = useState('');

  // ── Notifications ──
  const [lessonReminders, setLessonReminders] = useState(true);
  const [communityReplies, setCommunityReplies] = useState(true);

  React.useEffect(() => {
    AsyncStorage.getItem(NOTIF_KEY).then((raw) => {
      if (raw) {
        const prefs = JSON.parse(raw);
        setLessonReminders(prefs.lessonReminders ?? true);
        setCommunityReplies(prefs.communityReplies ?? true);
      }
    });
  }, []);

  const saveNotifPrefs = (lr: boolean, cr: boolean) => {
    AsyncStorage.setItem(NOTIF_KEY, JSON.stringify({ lessonReminders: lr, communityReplies: cr }));
  };

  const handleSaveName = async () => {
    if (!name.trim()) return;
    setNameSaving(true);
    setNameMsg('');
    const { error } = await supabase.auth.updateUser({ data: { name: name.trim() } });
    setNameSaving(false);
    setNameMsg(error ? error.message : 'Name updated!');
  };

  const handleChangePassword = async () => {
    if (!oldPass || !newPass) {
      setPassMsg('Please fill in both fields.');
      return;
    }
    if (newPass.length < 6) {
      setPassMsg('New password must be at least 6 characters.');
      return;
    }
    setPassSaving(true);
    setPassMsg('');

    const { error: verifyErr } = await supabase.auth.signInWithPassword({
      email: displayEmail,
      password: oldPass,
    });
    if (verifyErr) {
      setPassSaving(false);
      setPassMsg('Current password is incorrect.');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPass });
    setPassSaving(false);
    if (error) {
      setPassMsg(error.message);
    } else {
      setPassMsg('Password updated!');
      setOldPass('');
      setNewPass('');
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + 12, paddingBottom: 120 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
              <ChevronLeftIcon size={24} color={colors.charcoal} />
            </Pressable>
            <Text style={styles.title}>Account</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Profile */}
          <View style={styles.profileCard}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>
                {displayName ? displayName.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
            <Text style={styles.profileName}>{displayName || 'User'}</Text>
            <Text style={styles.profileEmail}>{displayEmail}</Text>
          </View>

          {/* Edit Name */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={colors.warmGrayLight}
              autoCapitalize="words"
            />
            {nameMsg.length > 0 && (
              <Text style={[styles.msg, nameMsg.includes('updated') ? styles.msgSuccess : styles.msgError]}>
                {nameMsg}
              </Text>
            )}
            <Pressable
              onPress={handleSaveName}
              disabled={nameSaving || name.trim() === displayName}
              style={[
                styles.saveBtn,
                (nameSaving || name.trim() === displayName) && { opacity: 0.5 },
              ]}
            >
              {nameSaving ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.saveBtnText}>Save Name</Text>
              )}
            </Pressable>
          </View>

          {/* Change Password */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Change Password</Text>
            <TextInput
              style={styles.input}
              value={oldPass}
              onChangeText={setOldPass}
              placeholder="Current password"
              placeholderTextColor={colors.warmGrayLight}
              secureTextEntry
            />
            <TextInput
              style={[styles.input, { marginTop: 10 }]}
              value={newPass}
              onChangeText={setNewPass}
              placeholder="New password"
              placeholderTextColor={colors.warmGrayLight}
              secureTextEntry
            />
            {passMsg.length > 0 && (
              <Text style={[styles.msg, passMsg.includes('updated') ? styles.msgSuccess : styles.msgError]}>
                {passMsg}
              </Text>
            )}
            <Pressable
              onPress={handleChangePassword}
              disabled={passSaving}
              style={[styles.saveBtn, styles.saveBtnSecondary, passSaving && { opacity: 0.5 }]}
            >
              {passSaving ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.saveBtnText}>Update Password</Text>
              )}
            </Pressable>
          </View>

          {/* Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Lesson reminders</Text>
              <Switch
                value={lessonReminders}
                onValueChange={(v) => {
                  setLessonReminders(v);
                  saveNotifPrefs(v, communityReplies);
                }}
                trackColor={{ false: colors.creamDark, true: colors.tealLight }}
                thumbColor={colors.white}
              />
            </View>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Community replies</Text>
              <Switch
                value={communityReplies}
                onValueChange={(v) => {
                  setCommunityReplies(v);
                  saveNotifPrefs(lessonReminders, v);
                }}
                trackColor={{ false: colors.creamDark, true: colors.tealLight }}
                thumbColor={colors.white}
              />
            </View>
          </View>

          {/* Sign Out */}
          <Pressable
            onPress={handleSignOut}
            style={({ pressed }) => [styles.signOutBtn, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomNav
        activeTab="account"
        onTabPress={(tabId) => {
          if (tabId === 'home') navigation.navigate('Home');
          else if (tabId === 'learn') navigation.navigate('Lessons');
          else if (tabId === 'chat') navigation.navigate('DillowChat');
          else if (tabId === 'practice') navigation.navigate('Practice');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  content: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 28,
    color: colors.charcoal,
  },

  profileCard: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarLargeText: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: colors.white,
  },
  profileName: {
    fontFamily: fonts.serif,
    fontSize: 24,
    color: colors.charcoal,
  },
  profileEmail: {
    fontFamily: fonts.light,
    fontSize: 14,
    color: colors.warmGray,
    marginTop: 2,
  },

  section: {
    backgroundColor: colors.creamLight,
    borderWidth: 1.5,
    borderColor: colors.creamDark,
    borderRadius: radii.xxl,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.charcoal,
    marginBottom: 12,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.creamDark,
    borderRadius: radii.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.charcoal,
  },
  msg: {
    fontFamily: fonts.regular,
    fontSize: 13,
    marginTop: 8,
  },
  msgSuccess: {
    color: colors.teal,
  },
  msgError: {
    color: colors.terracotta,
  },
  saveBtn: {
    backgroundColor: colors.teal,
    borderRadius: radii.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  saveBtnSecondary: {
    backgroundColor: colors.terracotta,
  },
  saveBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.white,
  },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.creamDark,
  },
  toggleLabel: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.charcoal,
  },

  signOutBtn: {
    backgroundColor: 'rgba(194,85,58,0.08)',
    borderRadius: radii.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  signOutText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.terracotta,
  },
});
