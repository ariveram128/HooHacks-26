import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import FadeIn from '../components/FadeIn';
import DillowAvatar from '../components/DillowAvatar';
import StreakBadge from '../components/StreakBadge';
import BottomNav from '../components/BottomNav';
import {
  BookIcon,
  MicIcon,
  NotesIcon,
  UsersIcon,
  ForumIcon,
  VideoIcon,
  ChevronRightIcon,
} from '../components/Icons';
import { colors, fonts, radii } from '../theme';
import type { RootStackParamList } from '../navigation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const phrases = [
  { es: '¿De dónde eres?', en: 'Where are you from?', level: 'Essentials' },
  { es: 'Estoy de acuerdo', en: 'I agree', level: 'Conversational' },
  { es: '¿Qué tal tu día?', en: "How's your day?", level: 'Essentials' },
  { es: 'Me gustaría saber más', en: "I'd like to know more", level: 'Intermediate' },
];

type QuickAction = {
  title: string;
  desc: string;
  icon: React.ReactNode;
  iconBg: string;
  accentColor: string;
};

const quickActions: QuickAction[] = [
  {
    title: 'Lessons',
    desc: 'Conjugations, accents & rules',
    icon: <BookIcon size={22} color={colors.white} />,
    iconBg: colors.teal,
    accentColor: colors.teal,
  },
  {
    title: 'Practice',
    desc: 'Key phrases & pronunciation',
    icon: <MicIcon size={22} color={colors.white} />,
    iconBg: colors.terracotta,
    accentColor: colors.terracotta,
  },
  {
    title: 'My Notes',
    desc: 'Saved explanations & tips',
    icon: <NotesIcon size={22} color={colors.white} />,
    iconBg: colors.marigold,
    accentColor: colors.marigold,
  },
  {
    title: 'Social',
    desc: 'Ask a native speaker',
    icon: <UsersIcon size={22} color={colors.white} />,
    iconBg: colors.charcoal,
    accentColor: colors.charcoal,
  },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeNav, setActiveNav] = useState('home');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);

  const currentPhrase = phrases[phraseIndex];

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 12, paddingBottom: 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Header ─── */}
        <FadeIn delay={100}>
          <View style={styles.topBar}>
            <Text style={styles.logo}>
              Sabio<Text style={styles.logoDot}>.</Text>
            </Text>
            <StreakBadge days={12} />
          </View>

          <View style={styles.greetingSection}>
            <Text style={styles.greetingHello}>Buenas tardes,</Text>
            <Text style={styles.greetingName}>Welcome back</Text>
            <Text style={styles.greetingSub}>
              You're 34% through this week's goals
            </Text>
          </View>
        </FadeIn>

        {/* ─── Weekly Progress ─── */}
        <FadeIn delay={200}>
          <View style={styles.progressSection}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '34%' }]} />
            </View>
            <View style={styles.progressStats}>
              <Text style={styles.progressStat}>
                <Text style={styles.progressStatBold}>3</Text> lessons
              </Text>
              <Text style={styles.progressStat}>
                <Text style={styles.progressStatBold}>47</Text> words learned
              </Text>
              <Text style={styles.progressStat}>
                <Text style={styles.progressStatBold}>12</Text> min today
              </Text>
            </View>
          </View>
        </FadeIn>

        {/* ─── Dillow AI Chat Card ─── */}
        <FadeIn delay={350}>
          <Pressable
            onPress={() => navigation.navigate('DillowChat')}
            style={({ pressed }) => [
              styles.dillowPressable,
              pressed && styles.dillowPressed,
            ]}
          >
            <LinearGradient
              colors={[colors.tealDark, colors.teal]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.dillowCard}
            >
              {/* Decorative glow */}
              <View style={styles.dillowGlow} />

              <View style={styles.dillowTop}>
                <DillowAvatar size={56} />
                <View style={styles.dillowInfo}>
                  <Text style={styles.dillowTitle}>Chat with Dillow</Text>
                  <Text style={styles.dillowSubtitle}>
                    Your AI Spanish companion
                  </Text>
                </View>
              </View>

              <View style={styles.dillowBubble}>
                <Text style={styles.dillowBubbleText}>
                  ¡Hola!{' '}
                  <Text style={styles.dillowBubbleEmphasis}>
                    ¿Cómo estuvo tu día?
                  </Text>{' '}
                  Tell me about it — in Spanish or English, your choice. I'll
                  help along the way.
                </Text>
              </View>

              <View style={styles.dillowCta}>
                <Text style={styles.dillowCtaText}>Start a conversation</Text>
                <ChevronRightIcon size={18} color={colors.marigoldLight} />
              </View>
            </LinearGradient>
          </Pressable>
        </FadeIn>

        {/* ─── Phrase of the Day ─── */}
        <FadeIn delay={450}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Frase del día</Text>
          </View>

          <Pressable
            onPress={() => setShowTranslation(!showTranslation)}
            style={({ pressed }) => [
              styles.phraseCard,
              pressed && styles.phraseCardPressed,
            ]}
          >
            <View style={styles.phraseLabel}>
              <Text style={styles.phraseLabelText}>{currentPhrase.level}</Text>
            </View>
            <Text style={styles.phraseSpanish}>{currentPhrase.es}</Text>

            {showTranslation ? (
              <Text style={styles.phraseEnglish}>{currentPhrase.en}</Text>
            ) : (
              <Text style={styles.phraseTap}>Tap to reveal translation</Text>
            )}

            <View style={styles.phraseNav}>
              {phrases.map((_, i) => (
                <Pressable
                  key={i}
                  onPress={() => {
                    setPhraseIndex(i);
                    setShowTranslation(false);
                  }}
                  style={[
                    styles.phraseDot,
                    i === phraseIndex && styles.phraseDotActive,
                  ]}
                />
              ))}
            </View>
          </Pressable>
        </FadeIn>

        {/* ─── Quick Actions Grid ─── */}
        <FadeIn delay={550}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your toolkit</Text>
          </View>

          <View style={styles.quickGrid}>
            {quickActions.map((action) => (
              <Pressable
                key={action.title}
                style={({ pressed }) => [
                  styles.quickCard,
                  pressed && styles.quickCardPressed,
                ]}
                onPress={() => {}}
              >
                <View style={[styles.quickIcon, { backgroundColor: action.iconBg }]}>
                  {action.icon}
                </View>
                <Text style={styles.quickCardTitle}>{action.title}</Text>
                <Text style={styles.quickCardDesc}>{action.desc}</Text>
              </Pressable>
            ))}
          </View>
        </FadeIn>

        {/* ─── Forum & Video Row ─── */}
        <FadeIn delay={650}>
          <View style={styles.featureRow}>
            <Pressable
              style={({ pressed }) => [
                styles.featureCard,
                pressed && styles.featureCardPressed,
              ]}
              onPress={() => {}}
            >
              <View style={[styles.featureIcon, { backgroundColor: 'rgba(26,107,94,0.1)' }]}>
                <ForumIcon size={24} color={colors.teal} />
              </View>
              <Text style={styles.featureCardTitle}>Foro</Text>
              <Text style={styles.featureCardDesc}>Community discussions</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.featureCard,
                pressed && styles.featureCardPressed,
              ]}
              onPress={() => {}}
            >
              <View style={[styles.featureIcon, { backgroundColor: 'rgba(194,85,58,0.1)' }]}>
                <VideoIcon size={24} color={colors.terracotta} />
              </View>
              <Text style={styles.featureCardTitle}>Video</Text>
              <Text style={styles.featureCardDesc}>Watch & learn clips</Text>
            </Pressable>
          </View>
        </FadeIn>
      </ScrollView>

      <BottomNav
        activeTab={activeNav}
        onTabPress={(tabId) => {
          if (tabId === 'chat') {
            navigation.navigate('DillowChat');
          } else {
            setActiveNav(tabId);
          }
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },

  // ── Header ──
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  logo: {
    fontFamily: fonts.serif,
    fontSize: 32,
    color: colors.charcoal,
    letterSpacing: -0.5,
  },
  logoDot: {
    color: colors.terracotta,
    fontSize: 38,
  },

  // ── Greeting ──
  greetingSection: {
    marginBottom: 28,
  },
  greetingHello: {
    fontFamily: fonts.serifItalic,
    fontSize: 18,
    color: colors.warmGray,
    marginBottom: 2,
  },
  greetingName: {
    fontFamily: fonts.serif,
    fontSize: 34,
    color: colors.charcoal,
    lineHeight: 38,
  },
  greetingSub: {
    fontSize: 14,
    color: colors.warmGray,
    marginTop: 6,
    fontFamily: fonts.regular,
  },

  // ── Progress ──
  progressSection: {
    marginBottom: 28,
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: colors.creamDark,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 10,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.teal,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressStat: {
    fontSize: 12,
    color: colors.warmGray,
    fontFamily: fonts.regular,
  },
  progressStatBold: {
    color: colors.charcoal,
    fontFamily: fonts.semiBold,
  },

  // ── Dillow Card ──
  dillowPressable: {
    marginBottom: 24,
    borderRadius: radii.xxl,
    shadowColor: colors.tealDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 10,
  },
  dillowPressed: {
    transform: [{ scale: 0.98 }],
  },
  dillowCard: {
    borderRadius: radii.xxl,
    padding: 24,
    overflow: 'hidden',
  },
  dillowGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(232,168,56,0.15)',
  },
  dillowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  dillowInfo: {
    flex: 1,
  },
  dillowTitle: {
    fontFamily: fonts.serif,
    fontSize: 22,
    color: colors.cream,
  },
  dillowSubtitle: {
    fontSize: 13,
    color: 'rgba(245,237,224,0.65)',
    fontFamily: fonts.light,
  },
  dillowBubble: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  dillowBubbleText: {
    color: colors.cream,
    fontSize: 15,
    fontFamily: fonts.light,
    lineHeight: 22,
  },
  dillowBubbleEmphasis: {
    color: colors.marigoldLight,
    fontFamily: fonts.medium,
  },
  dillowCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  dillowCtaText: {
    color: colors.marigoldLight,
    fontFamily: fonts.medium,
    fontSize: 14,
  },

  // ── Section Headers ──
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: fonts.serif,
    fontSize: 22,
    color: colors.charcoal,
  },

  // ── Phrase Card ──
  phraseCard: {
    backgroundColor: colors.creamLight,
    borderWidth: 2,
    borderColor: colors.creamDark,
    borderRadius: radii.xl,
    padding: 22,
    marginBottom: 24,
  },
  phraseCardPressed: {
    borderColor: colors.marigold,
  },
  phraseLabel: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(194,85,58,0.08)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radii.sm,
    marginBottom: 10,
  },
  phraseLabelText: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: colors.terracotta,
  },
  phraseSpanish: {
    fontFamily: fonts.serif,
    fontSize: 26,
    color: colors.charcoal,
    marginBottom: 6,
    lineHeight: 32,
  },
  phraseEnglish: {
    fontSize: 15,
    color: colors.warmGray,
    fontFamily: fonts.light,
  },
  phraseTap: {
    fontSize: 12,
    color: colors.warmGrayLight,
    marginTop: 10,
    fontFamily: fonts.regular,
    fontStyle: 'italic',
  },
  phraseNav: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 14,
  },
  phraseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.creamDark,
  },
  phraseDotActive: {
    backgroundColor: colors.terracotta,
    width: 24,
    borderRadius: 4,
  },

  // ── Quick Actions ──
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 28,
  },
  quickCard: {
    width: (SCREEN_WIDTH - 54) / 2,
    backgroundColor: colors.creamLight,
    borderWidth: 1.5,
    borderColor: colors.creamDark,
    borderRadius: radii.lg,
    padding: 20,
    paddingHorizontal: 18,
  },
  quickCardPressed: {
    transform: [{ scale: 0.96 }],
    shadowColor: colors.charcoal,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  quickIcon: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickCardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.charcoal,
    marginBottom: 3,
  },
  quickCardDesc: {
    fontSize: 12,
    color: colors.warmGray,
    fontFamily: fonts.light,
    lineHeight: 17,
  },

  // ── Feature Row ──
  featureRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 28,
  },
  featureCard: {
    flex: 1,
    backgroundColor: colors.creamLight,
    borderWidth: 1.5,
    borderColor: colors.creamDark,
    borderRadius: radii.lg,
    padding: 20,
    alignItems: 'center',
  },
  featureCardPressed: {
    transform: [{ scale: 0.96 }],
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureCardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.charcoal,
    marginBottom: 2,
  },
  featureCardDesc: {
    fontSize: 11,
    color: colors.warmGray,
    fontFamily: fonts.light,
  },
});
