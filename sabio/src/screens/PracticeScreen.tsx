import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle as SvgCircle, Rect, Line } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, fonts, spacing, radii } from '../theme';
import { MicIcon, GamepadIcon, ChevronRightIcon } from '../components/Icons';
import BottomNav from '../components/BottomNav';
import { getProgress, PracticeProgress } from '../store/practiceProgress';
import { phrases } from '../data/phrases';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W * 0.42;
const FEATURED_H = 190;

type Nav = NativeStackNavigationProp<RootStackParamList>;

/* ══════════════════════════════════════ */
/* ── Decorative SVG patterns for cards ─ */
/* ══════════════════════════════════════ */

const WavePattern = () => (
  <Svg
    width="100%"
    height="100%"
    viewBox="0 0 200 200"
    style={StyleSheet.absoluteFill}
    preserveAspectRatio="xMidYMid slice"
  >
    <Path
      d="M-20 120 Q50 80 100 110 T220 90"
      stroke="rgba(255,255,255,0.12)"
      strokeWidth={40}
      fill="none"
    />
    <Path
      d="M-20 160 Q60 130 120 155 T240 130"
      stroke="rgba(255,255,255,0.07)"
      strokeWidth={25}
      fill="none"
    />
  </Svg>
);

const CirclesPattern = () => (
  <Svg
    width="100%"
    height="100%"
    viewBox="0 0 200 200"
    style={StyleSheet.absoluteFill}
    preserveAspectRatio="xMidYMid slice"
  >
    <SvgCircle cx={160} cy={40} r={50} fill="rgba(255,255,255,0.08)" />
    <SvgCircle cx={170} cy={50} r={30} fill="rgba(255,255,255,0.06)" />
    <SvgCircle cx={30} cy={170} r={35} fill="rgba(255,255,255,0.05)" />
  </Svg>
);

const DiagonalPattern = () => (
  <Svg
    width="100%"
    height="100%"
    viewBox="0 0 200 200"
    style={StyleSheet.absoluteFill}
    preserveAspectRatio="xMidYMid slice"
  >
    {[0, 30, 60, 90, 120, 150, 180].map((x) => (
      <Line
        key={x}
        x1={x}
        y1={0}
        x2={x - 60}
        y2={200}
        stroke="rgba(255,255,255,0.05)"
        strokeWidth={12}
      />
    ))}
  </Svg>
);

const DotsPattern = () => (
  <Svg
    width="100%"
    height="100%"
    viewBox="0 0 200 200"
    style={StyleSheet.absoluteFill}
    preserveAspectRatio="xMidYMid slice"
  >
    {[30, 70, 110, 150].map((x) =>
      [30, 70, 110, 150].map((y) => (
        <SvgCircle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r={3}
          fill="rgba(255,255,255,0.1)"
        />
      )),
    )}
  </Svg>
);

const GridPattern = () => (
  <Svg
    width="100%"
    height="100%"
    viewBox="0 0 200 200"
    style={StyleSheet.absoluteFill}
    preserveAspectRatio="xMidYMid slice"
  >
    <Rect x={120} y={20} width={55} height={55} rx={12} fill="rgba(255,255,255,0.07)" />
    <Rect x={135} y={35} width={55} height={55} rx={12} fill="rgba(255,255,255,0.05)" />
    <Rect x={20} y={130} width={40} height={40} rx={8} fill="rgba(255,255,255,0.06)" />
  </Svg>
);

/* ══════════════════════════════════════ */
/* ── Stagger animation wrapper ──────── */
/* ══════════════════════════════════════ */

function StaggerIn({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: any }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(28)).current;

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
/* ── Category tag component ─────────── */
/* ══════════════════════════════════════ */

function CategoryTag({ label, color: tagColor }: { label: string; color: string }) {
  return (
    <View style={[tagStyles.pill, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
      <Text style={[tagStyles.text, { color: tagColor }]}>{label}</Text>
    </View>
  );
}

const tagStyles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  text: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});

/* ══════════════════════════════════════ */
/* ── Stat pill ──────────────────────── */
/* ══════════════════════════════════════ */

function StatPill({ icon, value, label, accentColor }: { icon: string; value: string | number; label: string; accentColor: string }) {
  return (
    <View style={statStyles.pill}>
      <Text style={statStyles.icon}>{icon}</Text>
      <Text style={[statStyles.value, { color: accentColor }]}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  pill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: colors.creamLight,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.creamDark,
  },
  icon: { fontSize: 20, marginBottom: 4 },
  value: { fontFamily: fonts.bold, fontSize: 22, marginBottom: 1 },
  label: { fontFamily: fonts.light, fontSize: 11, color: colors.warmGray, letterSpacing: 0.3 },
});

/* ══════════════════════════════════════ */
/* ── Game card (small, for rows) ────── */
/* ══════════════════════════════════════ */

type GameCardProps = {
  title: string;
  subtitle: string;
  category: string;
  gradientColors: [string, string];
  pattern: React.ReactNode;
  icon: React.ReactNode;
  onPress: () => void;
  comingSoon?: boolean;
};

function GameCard({ title, subtitle, category, gradientColors, pattern, icon, onPress, comingSoon }: GameCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.95, damping: 15, stiffness: 200, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, damping: 12, stiffness: 180, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={comingSoon ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={cardStyles.wrapper}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={cardStyles.gradient}
        >
          {pattern}
          <View style={cardStyles.inner}>
            <CategoryTag label={category} color="rgba(255,255,255,0.85)" />
            <View style={{ flex: 1 }} />
            <View style={cardStyles.iconWrap}>{icon}</View>
            <Text style={cardStyles.title}>{title}</Text>
            <Text style={cardStyles.subtitle}>{subtitle}</Text>
          </View>
          {comingSoon && (
            <View style={cardStyles.comingSoonOverlay}>
              <View style={cardStyles.comingSoonBadge}>
                <Text style={cardStyles.comingSoonText}>SOON</Text>
              </View>
            </View>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const cardStyles = StyleSheet.create({
  wrapper: {
    width: CARD_W,
    height: CARD_W * 1.15,
    borderRadius: radii.xl,
    overflow: 'hidden',
    marginRight: 14,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 },
      android: { elevation: 6 },
    }),
  },
  gradient: {
    flex: 1,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  inner: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-end',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.white,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: fonts.light,
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 14,
  },
  comingSoonOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comingSoonBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  comingSoonText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 2,
  },
});

/* ══════════════════════════════════════ */
/* ── Featured card (wide hero) ──────── */
/* ══════════════════════════════════════ */

type FeaturedCardProps = {
  title: string;
  subtitle: string;
  category: string;
  gradientColors: [string, string];
  pattern: React.ReactNode;
  icon: React.ReactNode;
  meta?: string;
  onPress: () => void;
};

function FeaturedCard({ title, subtitle, category, gradientColors, pattern, icon, meta, onPress }: FeaturedCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, damping: 15, stiffness: 200, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, damping: 12, stiffness: 180, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={featStyles.wrapper}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={featStyles.gradient}
        >
          {pattern}
          <View style={featStyles.inner}>
            <View style={featStyles.topRow}>
              <CategoryTag label={category} color="rgba(255,255,255,0.9)" />
              {meta && (
                <View style={featStyles.metaBadge}>
                  <Text style={featStyles.metaText}>{meta}</Text>
                </View>
              )}
            </View>
            <View style={{ flex: 1 }} />
            <View style={featStyles.bottomRow}>
              <View style={{ flex: 1 }}>
                <Text style={featStyles.title}>{title}</Text>
                <Text style={featStyles.subtitle}>{subtitle}</Text>
              </View>
              <View style={featStyles.iconWrap}>{icon}</View>
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const featStyles = StyleSheet.create({
  wrapper: {
    height: FEATURED_H,
    borderRadius: radii.xxl,
    overflow: 'hidden',
    marginHorizontal: 20,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 16 },
      android: { elevation: 8 },
    }),
  },
  gradient: {
    flex: 1,
    borderRadius: radii.xxl,
    overflow: 'hidden',
  },
  inner: {
    flex: 1,
    padding: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  metaText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.white,
    marginBottom: 3,
  },
  subtitle: {
    fontFamily: fonts.light,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 17,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
});

/* ══════════════════════════════════════ */
/* ── Section header ─────────────────── */
/* ══════════════════════════════════════ */

function SectionHeader({ title }: { title: string }) {
  return (
    <Text style={sectionStyles.header}>{title}</Text>
  );
}

const sectionStyles = StyleSheet.create({
  header: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.warmGray,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 14,
    paddingHorizontal: 20,
  },
});

/* ══════════════════════════════════════ */
/* ── Custom icon components ─────────── */
/* ══════════════════════════════════════ */

const ListenIcon = ({ size = 24, color = '#fff' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 18v-6a9 9 0 0 1 18 0v6" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3v5zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3v5z" fill={color} opacity={0.8} />
  </Svg>
);

const PencilIcon = ({ size = 24, color = '#fff' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const BrainIcon = ({ size = 24, color = '#fff' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2a5 5 0 0 0-4.8 3.6A4 4 0 0 0 4 9.5a4 4 0 0 0 1.5 3.1A4.5 4.5 0 0 0 8 21h8a4.5 4.5 0 0 0 2.5-8.4A4 4 0 0 0 20 9.5a4 4 0 0 0-3.2-3.9A5 5 0 0 0 12 2z" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Path d="M12 2v20" stroke={color} strokeWidth={1.5} strokeLinecap="round" opacity={0.4} />
  </Svg>
);

const BookOpenIcon = ({ size = 24, color = '#fff' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

/* ══════════════════════════════════════ */
/* ── MAIN SCREEN ────────────────────── */
/* ══════════════════════════════════════ */

export default function PracticeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [progress, setProgress] = useState<PracticeProgress>({
    masteredPhrases: [],
    currentStreak: 0,
    bestStreak: 0,
    colorGameHighScore: 0,
  });

  useFocusEffect(
    useCallback(() => {
      getProgress().then(setProgress);
    }, []),
  );

  const masteredCount = progress.masteredPhrases.length;
  const totalPhrases = phrases.length;
  const masteredPct = totalPhrases > 0 ? Math.round((masteredCount / totalPhrases) * 100) : 0;

  return (
    <View style={styles.root}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <StaggerIn delay={0} style={{ paddingHorizontal: 20 }}>
          <Text style={styles.screenTitle}>Práctica</Text>
          <Text style={styles.screenSubtitle}>
            Train your ear, voice, and vocabulary
          </Text>
        </StaggerIn>

        {/* ── Stats row ── */}
        <StaggerIn delay={80} style={{ paddingHorizontal: 20, marginBottom: 28 }}>
          <View style={styles.statsRow}>
            <StatPill icon="🎯" value={masteredPct + '%'} label="Mastered" accentColor={colors.teal} />
            <StatPill icon="🔥" value={progress.bestStreak} label="Best streak" accentColor={colors.terracotta} />
            <StatPill icon="🏆" value={progress.colorGameHighScore} label="High score" accentColor={colors.marigold} />
          </View>
        </StaggerIn>

        {/* ── Featured: Activity of the day ── */}
        <StaggerIn delay={160}>
          <SectionHeader title="Pick up where you left off" />
          <FeaturedCard
            title="Frases"
            subtitle="Practice saying key phrases aloud — Sabio checks your pronunciation"
            category="Pronunciation"
            gradientColors={[colors.teal, colors.tealDark]}
            pattern={<WavePattern />}
            icon={<MicIcon size={28} color={colors.white} />}
            meta={`${masteredCount}/${totalPhrases}`}
            onPress={() => navigation.navigate('PhrasePractice')}
          />
        </StaggerIn>

        {/* ── Vocabulary Games ── */}
        <StaggerIn delay={280} style={{ marginTop: 30 }}>
          <SectionHeader title="Vocabulary Games" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            <GameCard
              title="Plataformas"
              subtitle="Say colors in Spanish to jump!"
              category="Colors"
              gradientColors={[colors.terracotta, colors.terracottaDark]}
              pattern={<CirclesPattern />}
              icon={<GamepadIcon size={22} color={colors.white} />}
              onPress={() => navigation.navigate('ColorGame')}
            />
            <GameCard
              title="Palabra Rápida"
              subtitle="Translate words against the clock"
              category="Speed"
              gradientColors={['#6C5CE7', '#4834D4']}
              pattern={<DiagonalPattern />}
              icon={<BrainIcon size={22} color={colors.white} />}
              onPress={() => {}}
              comingSoon
            />
            <GameCard
              title="Pares"
              subtitle="Match Spanish to English pairs"
              category="Memory"
              gradientColors={[colors.marigold, colors.marigoldDark]}
              pattern={<DotsPattern />}
              icon={<BookOpenIcon size={22} color={colors.white} />}
              onPress={() => {}}
              comingSoon
            />
          </ScrollView>
        </StaggerIn>

        {/* ── Listening & Speaking ── */}
        <StaggerIn delay={400} style={{ marginTop: 30 }}>
          <SectionHeader title="Listening & Speaking" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            <GameCard
              title="Frases"
              subtitle="Speak phrases and get instant feedback"
              category="Pronunciation"
              gradientColors={[colors.teal, '#1A8B7A']}
              pattern={<WavePattern />}
              icon={<MicIcon size={22} color={colors.white} />}
              onPress={() => navigation.navigate('PhrasePractice')}
            />
            <GameCard
              title="Dictado"
              subtitle="Listen and type what you hear"
              category="Listening"
              gradientColors={['#2D3436', '#636E72']}
              pattern={<GridPattern />}
              icon={<ListenIcon size={22} color={colors.white} />}
              onPress={() => {}}
              comingSoon
            />
            <GameCard
              title="Escritura"
              subtitle="Write translations from audio prompts"
              category="Writing"
              gradientColors={['#E17055', '#D63031']}
              pattern={<DiagonalPattern />}
              icon={<PencilIcon size={22} color={colors.white} />}
              onPress={() => {}}
              comingSoon
            />
          </ScrollView>
        </StaggerIn>

        {/* ── Talk to Dillow CTA ── */}
        <StaggerIn delay={520} style={{ marginTop: 30, paddingHorizontal: 20 }}>
          <Pressable
            onPress={() => navigation.navigate('DillowChat')}
            style={({ pressed }) => [styles.dillowCta, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
          >
            <LinearGradient
              colors={[colors.charcoal, colors.charcoalLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.dillowCtaGradient}
            >
              <DotsPattern />
              <View style={styles.dillowCtaInner}>
                <Text style={styles.dillowCtaEmoji}>🦜</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dillowCtaTitle}>Practice with Dillow</Text>
                  <Text style={styles.dillowCtaDesc}>Free conversation to sharpen your skills</Text>
                </View>
                <ChevronRightIcon size={18} color="rgba(255,255,255,0.5)" />
              </View>
            </LinearGradient>
          </Pressable>
        </StaggerIn>
      </ScrollView>

      <BottomNav
        activeTab="practice"
        onTabPress={(tabId) => {
          if (tabId === 'home') navigation.navigate('Home');
          else if (tabId === 'chat') navigation.navigate('DillowChat');
          else if (tabId === 'learn') navigation.navigate('Lessons');
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

  /* Header */
  screenTitle: {
    fontFamily: fonts.serif,
    fontSize: 36,
    color: colors.charcoal,
    marginBottom: 4,
  },
  screenSubtitle: {
    fontFamily: fonts.light,
    fontSize: 14,
    color: colors.warmGray,
    marginBottom: 24,
    letterSpacing: 0.3,
  },

  /* Stats */
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },

  /* Dillow CTA */
  dillowCta: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 },
      android: { elevation: 6 },
    }),
  },
  dillowCtaGradient: {
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  dillowCtaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
  },
  dillowCtaEmoji: {
    fontSize: 32,
  },
  dillowCtaTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.white,
    marginBottom: 2,
  },
  dillowCtaDesc: {
    fontFamily: fonts.light,
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
});
