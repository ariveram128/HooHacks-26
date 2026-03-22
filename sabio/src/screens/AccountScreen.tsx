import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle as SvgCircle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, fonts, spacing, radii } from '../theme';
import { ChevronLeftIcon, ChevronRightIcon } from '../components/Icons';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Nav = NativeStackNavigationProp<RootStackParamList>;

const NOTIF_KEY = '@sabio_notif_prefs';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

/* ── Decorative leaf SVG ── */
const DecoLeaf = ({ style }: { style?: any }) => (
  <Animated.View style={[{ position: 'absolute' }, style]}>
    <Svg width={120} height={120} viewBox="0 0 120 120" fill="none">
      <Path
        d="M20 100C20 100 25 40 80 20C80 20 70 80 20 100Z"
        fill={colors.teal}
        opacity={0.06}
      />
      <Path
        d="M50 110C50 110 40 55 90 25"
        stroke={colors.teal}
        strokeWidth={1}
        opacity={0.1}
      />
    </Svg>
  </Animated.View>
);

const DecoLeafSmall = ({ style }: { style?: any }) => (
  <Animated.View style={[{ position: 'absolute' }, style]}>
    <Svg width={60} height={60} viewBox="0 0 60 60" fill="none">
      <Path
        d="M45 50C45 50 42 25 15 12C15 12 22 42 45 50Z"
        fill={colors.marigold}
        opacity={0.08}
      />
    </Svg>
  </Animated.View>
);

/* ── Animated section wrapper ── */
function StaggerIn({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: any }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, damping: 18, stiffness: 120, useNativeDriver: true }),
      ]).start();
    }, delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

/* ── Custom toggle ── */
function SabioToggle({ value, onToggle }: { value: boolean; onToggle: (v: boolean) => void }) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, { toValue: value ? 1 : 0, damping: 15, stiffness: 200, useNativeDriver: false }).start();
  }, [value]);

  const trackBg = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.creamDark, colors.teal],
  });
  const thumbX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  });

  return (
    <Pressable onPress={() => onToggle(!value)}>
      <Animated.View style={[toggleStyles.track, { backgroundColor: trackBg }]}>
        <Animated.View style={[toggleStyles.thumb, { transform: [{ translateX: thumbX }] }]} />
      </Animated.View>
    </Pressable>
  );
}

const toggleStyles = StyleSheet.create({
  track: {
    width: 46,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
  },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.white,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 3 },
      android: { elevation: 2 },
    }),
  },
});

/* ── Collapsible section ── */
function CollapsibleSection({
  title,
  subtitle,
  children,
  defaultOpen = false,
  accentColor = colors.teal,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  accentColor?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const rotation = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Animated.spring(rotation, {
      toValue: open ? 0 : 1,
      damping: 14,
      stiffness: 160,
      useNativeDriver: true,
    }).start();
    setOpen(!open);
  };

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  return (
    <View style={sectionStyles.wrapper}>
      <Pressable onPress={toggle} style={sectionStyles.header}>
        <View style={{ flex: 1 }}>
          <Text style={sectionStyles.title}>{title}</Text>
          {subtitle && !open && <Text style={sectionStyles.subtitle}>{subtitle}</Text>}
        </View>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <ChevronRightIcon size={16} color={accentColor} />
        </Animated.View>
      </Pressable>
      {open && <View style={sectionStyles.body}>{children}</View>}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  wrapper: {
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.charcoal,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontFamily: fonts.light,
    fontSize: 12,
    color: colors.warmGray,
    marginTop: 2,
  },
  body: {
    paddingHorizontal: 4,
    paddingBottom: 12,
  },
});

/* ══════════════════════════════════════ */
/* ── MAIN SCREEN ── */
/* ══════════════════════════════════════ */
export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { user, signOut } = useAuth();

  const displayName = user?.user_metadata?.name || '';
  const displayEmail = user?.email || '';
  const initial = displayName ? displayName.charAt(0).toUpperCase() : '?';

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

  // ── Hero gradient animation ──
  const heroScale = useRef(new Animated.Value(0.8)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(heroScale, { toValue: 1, damping: 12, stiffness: 80, useNativeDriver: true }),
      Animated.timing(heroOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
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
            { paddingTop: insets.top, paddingBottom: 120 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Back button ── */}
          <StaggerIn delay={0}>
            <Pressable
              onPress={() => navigation.goBack()}
              hitSlop={12}
              style={styles.backBtn}
            >
              <ChevronLeftIcon size={20} color={colors.charcoal} />
            </Pressable>
          </StaggerIn>

          {/* ── Hero Profile ── */}
          <Animated.View style={[styles.heroContainer, { opacity: heroOpacity, transform: [{ scale: heroScale }] }]}>
            {/* Decorative botanicals */}
            <DecoLeaf style={{ top: -10, right: -10 }} />
            <DecoLeafSmall style={{ bottom: 10, left: -5 }} />

            {/* Avatar ring */}
            <View style={styles.avatarOuter}>
              <LinearGradient
                colors={[colors.teal, colors.tealLight, colors.marigold]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarGradientRing}
              >
                <View style={styles.avatarInner}>
                  <Text style={styles.avatarInitial}>{initial}</Text>
                </View>
              </LinearGradient>
            </View>

            {/* Name & email — left aligned for editorial feel */}
            <View style={styles.heroText}>
              <Text style={styles.heroName}>{displayName || 'User'}</Text>
              <Text style={styles.heroEmail}>{displayEmail}</Text>
            </View>

            {/* Thin accent line */}
            <View style={styles.accentLine} />
          </Animated.View>

          {/* ── Settings Sections ── */}
          <View style={styles.settingsContainer}>

            {/* Profile name */}
            <StaggerIn delay={150}>
              <CollapsibleSection
                title="Profile"
                subtitle={displayName}
                defaultOpen={false}
                accentColor={colors.teal}
              >
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Display name</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Your name"
                    placeholderTextColor={colors.warmGrayLight}
                    autoCapitalize="words"
                  />
                  {nameMsg.length > 0 && (
                    <Text style={[styles.msg, nameMsg.includes('updated') ? styles.msgOk : styles.msgErr]}>
                      {nameMsg}
                    </Text>
                  )}
                  <Pressable
                    onPress={handleSaveName}
                    disabled={nameSaving || name.trim() === displayName}
                    style={({ pressed }) => [
                      styles.actionBtn,
                      (nameSaving || name.trim() === displayName) && { opacity: 0.4 },
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    {nameSaving ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <Text style={styles.actionBtnText}>Save</Text>
                    )}
                  </Pressable>
                </View>
              </CollapsibleSection>
            </StaggerIn>

            <View style={styles.divider} />

            {/* Password */}
            <StaggerIn delay={250}>
              <CollapsibleSection
                title="Security"
                subtitle="Change password"
                defaultOpen={false}
                accentColor={colors.terracotta}
              >
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Current password</Text>
                  <TextInput
                    style={styles.input}
                    value={oldPass}
                    onChangeText={setOldPass}
                    placeholder="Enter current password"
                    placeholderTextColor={colors.warmGrayLight}
                    secureTextEntry
                  />
                  <Text style={[styles.fieldLabel, { marginTop: 14 }]}>New password</Text>
                  <TextInput
                    style={styles.input}
                    value={newPass}
                    onChangeText={setNewPass}
                    placeholder="Enter new password"
                    placeholderTextColor={colors.warmGrayLight}
                    secureTextEntry
                  />
                  {passMsg.length > 0 && (
                    <Text style={[styles.msg, passMsg.includes('updated') ? styles.msgOk : styles.msgErr]}>
                      {passMsg}
                    </Text>
                  )}
                  <Pressable
                    onPress={handleChangePassword}
                    disabled={passSaving}
                    style={({ pressed }) => [
                      styles.actionBtn,
                      { backgroundColor: colors.terracotta },
                      passSaving && { opacity: 0.4 },
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    {passSaving ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <Text style={styles.actionBtnText}>Update Password</Text>
                    )}
                  </Pressable>
                </View>
              </CollapsibleSection>
            </StaggerIn>

            <View style={styles.divider} />

            {/* Notifications */}
            <StaggerIn delay={350}>
              <CollapsibleSection
                title="Notifications"
                subtitle="Reminders & replies"
                defaultOpen={false}
                accentColor={colors.marigold}
              >
                <View style={styles.toggleRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.toggleLabel}>Lesson reminders</Text>
                    <Text style={styles.toggleDesc}>Daily nudge to keep your streak</Text>
                  </View>
                  <SabioToggle
                    value={lessonReminders}
                    onToggle={(v) => {
                      setLessonReminders(v);
                      saveNotifPrefs(v, communityReplies);
                    }}
                  />
                </View>
                <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.toggleLabel}>Community replies</Text>
                    <Text style={styles.toggleDesc}>When someone responds to you</Text>
                  </View>
                  <SabioToggle
                    value={communityReplies}
                    onToggle={(v) => {
                      setCommunityReplies(v);
                      saveNotifPrefs(lessonReminders, v);
                    }}
                  />
                </View>
              </CollapsibleSection>
            </StaggerIn>

            <View style={styles.divider} />

            {/* Sign out — understated */}
            <StaggerIn delay={450}>
              <Pressable
                onPress={handleSignOut}
                style={({ pressed }) => [styles.signOutRow, pressed && { opacity: 0.5 }]}
              >
                <Text style={styles.signOutText}>Sign out</Text>
                <ChevronRightIcon size={14} color={colors.terracotta} />
              </Pressable>
            </StaggerIn>

            {/* Version footer */}
            <StaggerIn delay={500}>
              <Text style={styles.versionText}>Sabio v1.0</Text>
            </StaggerIn>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

    </View>
  );
}

/* ══════════════════════════════════════ */
/* ── STYLES ── */
/* ══════════════════════════════════════ */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  content: {
    paddingHorizontal: 24,
  },

  /* ── Back ── */
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.creamLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 4,
    ...Platform.select({
      ios: { shadowColor: colors.charcoal, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4 },
      android: { elevation: 1 },
    }),
  },

  /* ── Hero ── */
  heroContainer: {
    paddingTop: 16,
    paddingBottom: 28,
    position: 'relative',
    overflow: 'visible',
  },
  avatarOuter: {
    marginBottom: 20,
  },
  avatarGradientRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: fonts.serif,
    fontSize: 38,
    color: colors.teal,
    marginTop: 4,
  },
  heroText: {
    // left-aligned, not centered — editorial
  },
  heroName: {
    fontFamily: fonts.serif,
    fontSize: 34,
    color: colors.charcoal,
    lineHeight: 38,
  },
  heroEmail: {
    fontFamily: fonts.light,
    fontSize: 14,
    color: colors.warmGray,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  accentLine: {
    width: 40,
    height: 2.5,
    backgroundColor: colors.marigold,
    borderRadius: 2,
    marginTop: 16,
  },

  /* ── Settings ── */
  settingsContainer: {
    paddingTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.creamDark,
    marginHorizontal: 4,
  },

  /* ── Fields ── */
  fieldGroup: {},
  fieldLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.warmGray,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.creamLight,
    borderWidth: 1.5,
    borderColor: colors.creamDark,
    borderRadius: radii.md,
    paddingVertical: 13,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.charcoal,
  },
  msg: {
    fontFamily: fonts.regular,
    fontSize: 13,
    marginTop: 8,
  },
  msgOk: {
    color: colors.teal,
  },
  msgErr: {
    color: colors.terracotta,
  },
  actionBtn: {
    backgroundColor: colors.teal,
    borderRadius: radii.full,
    paddingVertical: 12,
    paddingHorizontal: 28,
    alignSelf: 'flex-start',
    alignItems: 'center',
    marginTop: 14,
  },
  actionBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.white,
    letterSpacing: 0.3,
  },

  /* ── Toggles ── */
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.creamDark,
  },
  toggleLabel: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.charcoal,
  },
  toggleDesc: {
    fontFamily: fonts.light,
    fontSize: 12,
    color: colors.warmGray,
    marginTop: 2,
  },

  /* ── Sign out ── */
  signOutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 4,
  },
  signOutText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.terracotta,
    letterSpacing: 0.3,
  },

  /* ── Footer ── */
  versionText: {
    fontFamily: fonts.light,
    fontSize: 11,
    color: colors.warmGrayLight,
    textAlign: 'center',
    marginTop: 24,
    letterSpacing: 1,
  },
});
