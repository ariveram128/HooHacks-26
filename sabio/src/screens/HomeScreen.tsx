import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle as SvgCircle, Line } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DillowAvatar from '../components/DillowAvatar';
import StreakBadge from '../components/StreakBadge';
import BottomNav from '../components/BottomNav';
import {
  BookIcon,
  MicIcon,
  NotesIcon,
  GamepadIcon,
  ChevronRightIcon,
} from '../components/Icons';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fonts, radii } from '../theme';
import type { RootStackParamList } from '../navigation';
import { useAuth } from '../context/AuthContext';
import { getProgress as getLessonProgress, LessonProgress } from '../store/lessonProgress';
import { getProgress as getPracticeProgress, PracticeProgress } from '../store/practiceProgress';
import { lessons, sections } from '../data/lessons';

const { width: SCREEN_W } = Dimensions.get('window');
const HERO_CARD_W = SCREEN_W * 0.78;
const SMALL_CARD_W = SCREEN_W * 0.42;

type Nav = NativeStackNavigationProp<RootStackParamList>;

const LESSON_ICON_NAME: Record<string, { lib: 'feather' | 'mci'; name: string }> = {
  alfabeto: { lib: 'mci', name: 'alpha-a-box-outline' },
  numeros: { lib: 'mci', name: 'numeric' },
  pronunciacion: { lib: 'mci', name: 'ear-hearing' },
  saludos: { lib: 'mci', name: 'hand-wave-outline' },
  presentaciones: { lib: 'mci', name: 'card-account-details-outline' },
  articulos: { lib: 'mci', name: 'format-text' },
  sustantivos: { lib: 'mci', name: 'cube-outline' },
  pronombres: { lib: 'mci', name: 'account-switch-outline' },
  'ser-estar': { lib: 'mci', name: 'scale-balance' },
  'presente-regular': { lib: 'feather', name: 'clock' },
  'presente-irregular': { lib: 'mci', name: 'lightning-bolt-outline' },
  preguntas: { lib: 'mci', name: 'comment-question-outline' },
  adjetivos: { lib: 'mci', name: 'palette-outline' },
  preterito: { lib: 'mci', name: 'history' },
  imperfecto: { lib: 'mci', name: 'update' },
  futuro: { lib: 'mci', name: 'rocket-launch-outline' },
  subjuntivo: { lib: 'mci', name: 'thought-bubble-outline' },
  condicional: { lib: 'mci', name: 'source-branch' },
  'por-para': { lib: 'mci', name: 'arrow-decision-outline' },
  expresiones: { lib: 'mci', name: 'format-quote-open' },
};

function LessonIcon({ lessonId, size, color }: { lessonId: string; size: number; color: string }) {
  const entry = LESSON_ICON_NAME[lessonId];
  if (!entry) return <BookIcon size={size} color={color} />;
  if (entry.lib === 'feather') return <Feather name={entry.name as any} size={size} color={color} />;
  return <MaterialCommunityIcons name={entry.name as any} size={size} color={color} />;
}

/* ══════════════════════════════════════ */
/* ── SVG Patterns ───────────────────── */
/* ══════════════════════════════════════ */

const WavePattern = () => (
  <Svg width="100%" height="100%" viewBox="0 0 400 400" style={StyleSheet.absoluteFill} preserveAspectRatio="xMidYMid slice">
    <Path d="M-40 220 Q100 160 200 210 T440 180" stroke="rgba(255,255,255,0.10)" strokeWidth={60} fill="none" />
    <Path d="M-40 300 Q120 260 240 290 T480 260" stroke="rgba(255,255,255,0.06)" strokeWidth={35} fill="none" />
  </Svg>
);

const CirclesPattern = () => (
  <Svg width="100%" height="100%" viewBox="0 0 400 300" style={StyleSheet.absoluteFill} preserveAspectRatio="xMidYMid slice">
    <SvgCircle cx={320} cy={60} r={80} fill="rgba(255,255,255,0.07)" />
    <SvgCircle cx={340} cy={80} r={45} fill="rgba(255,255,255,0.05)" />
    <SvgCircle cx={50} cy={240} r={55} fill="rgba(255,255,255,0.04)" />
  </Svg>
);

const DotsPattern = () => (
  <Svg width="100%" height="100%" viewBox="0 0 200 200" style={StyleSheet.absoluteFill} preserveAspectRatio="xMidYMid slice">
    {[30, 70, 110, 150].map((x) =>
      [30, 70, 110, 150].map((y) => (
        <SvgCircle key={`${x}-${y}`} cx={x} cy={y} r={3} fill="rgba(255,255,255,0.08)" />
      )),
    )}
  </Svg>
);

const DiagonalPattern = () => (
  <Svg width="100%" height="100%" viewBox="0 0 200 200" style={StyleSheet.absoluteFill} preserveAspectRatio="xMidYMid slice">
    {[0, 30, 60, 90, 120, 150, 180].map((x) => (
      <Line key={x} x1={x} y1={0} x2={x - 60} y2={200} stroke="rgba(255,255,255,0.04)" strokeWidth={12} />
    ))}
  </Svg>
);

/* ══════════════════════════════════════ */
/* ── Stagger animation ──────────────── */
/* ══════════════════════════════════════ */

function StaggerIn({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: any }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, damping: 18, stiffness: 130, useNativeDriver: true }),
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

/* ══════════════════════════════════════ */
/* ── Section header ─────────────────── */
/* ══════════════════════════════════════ */

function SectionHeader({ title, actionLabel, onAction }: { title: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={sectionStyles.row}>
      <Text style={sectionStyles.title}>{title}</Text>
      {actionLabel && onAction && (
        <Pressable onPress={onAction} hitSlop={8} style={sectionStyles.actionBtn}>
          <Text style={sectionStyles.actionText}>{actionLabel}</Text>
          <ChevronRightIcon size={12} color={colors.teal} />
        </Pressable>
      )}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.warmGray,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.teal,
  },
});

/* ══════════════════════════════════════ */
/* ── Phrase data ────────────────────── */
/* ══════════════════════════════════════ */

const dailyPhrases = [
  { es: '¿De dónde eres?', en: 'Where are you from?', level: 'Essentials' },
  { es: 'Estoy de acuerdo', en: 'I agree', level: 'Conversational' },
  { es: '¿Qué tal tu día?', en: "How's your day?", level: 'Essentials' },
  { es: 'Me gustaría saber más', en: "I'd like to know more", level: 'Intermediate' },
];

/* ══════════════════════════════════════ */
/* ── MAIN SCREEN ────────────────────── */
/* ══════════════════════════════════════ */

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [lessonProg, setLessonProg] = useState<LessonProgress>({ completedLessons: [], lastViewedLessonId: null });
  const [practiceProg, setPracticeProg] = useState<PracticeProgress>({ masteredPhrases: [], currentStreak: 0, bestStreak: 0, colorGameHighScore: 0 });

  useFocusEffect(
    useCallback(() => {
      getLessonProgress().then(setLessonProg);
      getPracticeProgress().then(setPracticeProg);
    }, []),
  );

  const userName = user?.user_metadata?.name || 'Welcome back';
  const currentPhrase = dailyPhrases[phraseIndex];
  const completedLessons = lessonProg.completedLessons.length;
  const nextLessonIdx = lessons.findIndex((l) => !lessonProg.completedLessons.includes(l.id));
  const nextLesson = nextLessonIdx >= 0 ? lessons[nextLessonIdx] : null;
  const nextLessonSection = nextLesson ? sections.find((s) => s.id === nextLesson.sectionId) : null;

  const greeting = new Date().getHours() < 12
    ? 'Buenos días'
    : new Date().getHours() < 19
      ? 'Buenas tardes'
      : 'Buenas noches';

  return (
    <View style={styles.root}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top bar ── */}
        <StaggerIn delay={0} style={{ paddingHorizontal: 20 }}>
          <View style={styles.topBar}>
            <Text style={styles.logo}>
              Sabio<Text style={styles.logoDot}>.</Text>
            </Text>
            <StreakBadge days={12} />
          </View>
        </StaggerIn>

        {/* ── Greeting ── */}
        <StaggerIn delay={60} style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text style={styles.greetingSub}>{greeting},</Text>
          <Text style={styles.greetingName}>{userName}</Text>
        </StaggerIn>

        {/* ── Today's Session — hero cards ── */}
        <StaggerIn delay={140}>
          <SectionHeader title="Today's Session" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            decelerationRate="fast"
            snapToInterval={HERO_CARD_W + 14}
          >
            {/* Dillow conversation card */}
            <Pressable
              onPress={() => navigation.navigate('DillowChat')}
              style={({ pressed }) => [styles.heroCard, pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] }]}
            >
              <LinearGradient
                colors={[colors.tealDark, colors.teal]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroGradient}
              >
                <WavePattern />
                <View style={styles.heroInner}>
                  <View style={styles.heroTopRow}>
                    <DillowAvatar size={48} />
                    <View style={styles.heroBadge}>
                      <Text style={styles.heroBadgeText}>AI TUTOR</Text>
                    </View>
                  </View>
                  <View style={{ flex: 1 }} />
                  <Text style={styles.heroTitle}>Talk with Dillow</Text>
                  <Text style={styles.heroSubtitle}>Personalized conversation practice</Text>
                  <View style={styles.heroBtn}>
                    <Text style={styles.heroBtnText}>Start</Text>
                  </View>
                </View>
              </LinearGradient>
            </Pressable>

            {/* Continue lesson card */}
            {nextLesson && (
              <Pressable
                onPress={() => navigation.navigate('Lessons')}
                style={({ pressed }) => [styles.heroCard, pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] }]}
              >
                <LinearGradient
                  colors={[colors.terracotta, colors.terracottaDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.heroGradient}
                >
                  <CirclesPattern />
                  <View style={styles.heroInner}>
                    <View style={styles.heroTopRow}>
                      <View style={styles.heroIconWrap}>
                        <LessonIcon lessonId={nextLesson.id} size={22} color={colors.white} />
                      </View>
                      <View style={styles.heroBadge}>
                        <Text style={styles.heroBadgeText}>LESSON</Text>
                      </View>
                    </View>
                    <View style={{ flex: 1 }} />
                    <Text style={styles.heroTitle}>{nextLesson.title}</Text>
                    <Text style={styles.heroSubtitle}>{nextLesson.subtitle}</Text>
                    <View style={styles.heroBtn}>
                      <Text style={styles.heroBtnText}>Continue</Text>
                    </View>
                  </View>
                </LinearGradient>
              </Pressable>
            )}
          </ScrollView>
        </StaggerIn>

        {/* ── Stats bar ── */}
        <StaggerIn delay={240} style={{ paddingHorizontal: 20, marginTop: 24, marginBottom: 0 }}>
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{completedLessons}</Text>
              <Text style={styles.statLabel}>Lessons</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{practiceProg.masteredPhrases.length}</Text>
              <Text style={styles.statLabel}>Phrases</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{practiceProg.bestStreak}</Text>
              <Text style={styles.statLabel}>Best streak</Text>
            </View>
            <View style={styles.statDivider} />
          </View>
        </StaggerIn>

        {/* ── Phrase of the Day ── */}
        <StaggerIn delay={340} style={{ marginTop: 18 }}>
          <SectionHeader title="Frase del Día" />
          <Pressable
            onPress={() => setShowTranslation(!showTranslation)}
            style={({ pressed }) => [styles.phraseCard, pressed && { borderColor: colors.marigold }]}
          >
            <View style={styles.phraseTop}>
              <View style={styles.phraseLevelBadge}>
                <Text style={styles.phraseLevelText}>{currentPhrase.level}</Text>
              </View>
            </View>
            <Text style={styles.phraseSpanish}>{currentPhrase.es}</Text>
            {showTranslation ? (
              <Text style={styles.phraseEnglish}>{currentPhrase.en}</Text>
            ) : (
              <Text style={styles.phraseTap}>Tap to reveal</Text>
            )}
            <View style={styles.phraseDots}>
              {dailyPhrases.map((_, i) => (
                <Pressable
                  key={i}
                  onPress={() => { setPhraseIndex(i); setShowTranslation(false); }}
                  style={[styles.phraseDot, i === phraseIndex && styles.phraseDotActive]}
                />
              ))}
            </View>
          </Pressable>
        </StaggerIn>

        {/* ── Quick Practice ── */}
        <StaggerIn delay={440} style={{ marginTop: 18 }}>
          <SectionHeader title="Quick Practice" actionLabel="See all" onAction={() => navigation.navigate('Practice')} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {/* Phrase practice */}
            <Pressable
              onPress={() => navigation.navigate('PhrasePractice')}
              style={({ pressed }) => [styles.smallCard, pressed && { opacity: 0.9, transform: [{ scale: 0.96 }] }]}
            >
              <LinearGradient colors={[colors.teal, colors.tealDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.smallGradient}>
                <WavePattern />
                <View style={styles.smallInner}>
                  <View style={styles.smallTagWrap}>
                    <Text style={styles.smallTag}>PRONUNCIATION</Text>
                  </View>
                  <View style={{ flex: 1 }} />
                  <View style={styles.smallIconWrap}>
                    <MicIcon size={20} color={colors.white} />
                  </View>
                  <Text style={styles.smallTitle}>Frases</Text>
                  <Text style={styles.smallSub}>Speak & get feedback</Text>
                </View>
              </LinearGradient>
            </Pressable>

            {/* Color game */}
            <Pressable
              onPress={() => navigation.navigate('ColorGame')}
              style={({ pressed }) => [styles.smallCard, pressed && { opacity: 0.9, transform: [{ scale: 0.96 }] }]}
            >
              <LinearGradient colors={[colors.terracotta, colors.terracottaDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.smallGradient}>
                <CirclesPattern />
                <View style={styles.smallInner}>
                  <View style={styles.smallTagWrap}>
                    <Text style={styles.smallTag}>COLORS</Text>
                  </View>
                  <View style={{ flex: 1 }} />
                  <View style={styles.smallIconWrap}>
                    <GamepadIcon size={20} color={colors.white} />
                  </View>
                  <Text style={styles.smallTitle}>Plataformas</Text>
                  <Text style={styles.smallSub}>Say colors to jump!</Text>
                </View>
              </LinearGradient>
            </Pressable>

            {/* Notes */}
            <Pressable
              onPress={() => navigation.navigate('Notes')}
              style={({ pressed }) => [styles.smallCard, pressed && { opacity: 0.9, transform: [{ scale: 0.96 }] }]}
            >
              <LinearGradient colors={[colors.marigold, colors.marigoldDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.smallGradient}>
                <DotsPattern />
                <View style={styles.smallInner}>
                  <View style={styles.smallTagWrap}>
                    <Text style={styles.smallTag}>REVIEW</Text>
                  </View>
                  <View style={{ flex: 1 }} />
                  <View style={styles.smallIconWrap}>
                    <NotesIcon size={20} color={colors.white} />
                  </View>
                  <Text style={styles.smallTitle}>My Notes</Text>
                  <Text style={styles.smallSub}>Saved tips & vocab</Text>
                </View>
              </LinearGradient>
            </Pressable>
          </ScrollView>
        </StaggerIn>

        {/* ── Dillow CTA banner ── */}
        <StaggerIn delay={540} style={{ marginTop: 28, paddingHorizontal: 20 }}>
          <Pressable
            onPress={() => navigation.navigate('DillowChat')}
            style={({ pressed }) => [styles.dillowBanner, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
          >
            <LinearGradient
              colors={[colors.charcoal, colors.charcoalLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.dillowBannerGradient}
            >
              <DiagonalPattern />
              <View style={styles.dillowBannerInner}>
                <Text style={styles.dillowBannerEmoji}>🦜</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dillowBannerTitle}>
                    ¡Hola! <Text style={{ fontFamily: fonts.light, color: 'rgba(255,255,255,0.6)' }}>¿Cómo estuvo tu día?</Text>
                  </Text>
                  <Text style={styles.dillowBannerSub}>Dillow is ready to chat in Spanish or English</Text>
                </View>
                <ChevronRightIcon size={16} color="rgba(255,255,255,0.4)" />
              </View>
            </LinearGradient>
          </Pressable>
        </StaggerIn>
      </ScrollView>

      <BottomNav
        activeTab="home"
        onTabPress={(tabId) => {
          if (tabId === 'chat') navigation.navigate('DillowChat');
          else if (tabId === 'learn') navigation.navigate('Lessons');
          else if (tabId === 'practice') navigation.navigate('Practice');
          else if (tabId === 'account') navigation.navigate('Account');
        }}
      />
    </View>
  );
}

/* ══════════════════════════════════════ */
/* ── STYLES ─────────────────────────── */
/* ══════════════════════════════════════ */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },

  /* ── Top bar ── */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
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

  /* ── Greeting ── */
  greetingSub: {
    fontFamily: fonts.serifItalic,
    fontSize: 16,
    color: colors.warmGray,
    marginBottom: 2,
  },
  greetingName: {
    fontFamily: fonts.serif,
    fontSize: 32,
    color: colors.charcoal,
    lineHeight: 36,
  },

  /* ── Hero cards ── */
  heroCard: {
    width: HERO_CARD_W,
    height: HERO_CARD_W * 0.72,
    borderRadius: radii.md,
    marginRight: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 16 },
      android: { elevation: 8 },
    }),
  },
  heroGradient: {
    flex: 1,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  heroInner: {
    flex: 1,
    padding: 22,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  heroBadgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 1,
  },
  heroTitle: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.white,
    marginBottom: 3,
  },
  heroSubtitle: {
    fontFamily: fonts.light,
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 16,
  },
  heroBtn: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  heroBtnText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.charcoal,
  },

  /* ── Stats bar ── */
  statsBar: {
    flexDirection: 'row',
    backgroundColor: colors.creamLight,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.creamDark,
    paddingVertical: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.charcoal,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: fonts.light,
    fontSize: 10,
    color: colors.warmGray,
    letterSpacing: 0.3,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.creamDark,
    marginVertical: 4,
  },

  /* ── Phrase card ── */
  phraseCard: {
    backgroundColor: colors.creamLight,
    borderWidth: 1.5,
    borderColor: colors.creamDark,
    borderRadius: radii.md,
    padding: 22,
    marginHorizontal: 20,
  },
  phraseTop: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  phraseLevelBadge: {
    backgroundColor: 'rgba(194,85,58,0.08)',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  phraseLevelText: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    color: colors.terracotta,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  phraseSpanish: {
    fontFamily: fonts.serif,
    fontSize: 26,
    color: colors.charcoal,
    lineHeight: 32,
    marginBottom: 6,
  },
  phraseEnglish: {
    fontFamily: fonts.light,
    fontSize: 15,
    color: colors.warmGray,
  },
  phraseTap: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.warmGrayLight,
    fontStyle: 'italic',
    marginTop: 6,
  },
  phraseDots: {
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

  /* ── Small cards ── */
  smallCard: {
    width: SMALL_CARD_W,
    height: SMALL_CARD_W * 1.15,
    borderRadius: radii.md,
    overflow: 'hidden',
    marginRight: 14,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 },
      android: { elevation: 6 },
    }),
  },
  smallGradient: {
    flex: 1,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  smallInner: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-end',
  },
  smallTagWrap: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  smallTag: {
    fontFamily: fonts.semiBold,
    fontSize: 9,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 1.2,
  },
  smallIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  smallTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.white,
    marginBottom: 2,
  },
  smallSub: {
    fontFamily: fonts.light,
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },

  /* ── Dillow banner ── */
  dillowBanner: {
    borderRadius: radii.md,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 10 },
      android: { elevation: 5 },
    }),
  },
  dillowBannerGradient: {
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  dillowBannerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
  },
  dillowBannerEmoji: {
    fontSize: 30,
  },
  dillowBannerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.white,
    marginBottom: 2,
  },
  dillowBannerSub: {
    fontFamily: fonts.light,
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
});
