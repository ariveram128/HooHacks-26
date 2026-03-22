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
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle as SvgCircle, Rect, Line } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, fonts, spacing, radii } from '../theme';
import { MicIcon, GamepadIcon, ChevronRightIcon, CloseIcon } from '../components/Icons';
import BottomNav from '../components/BottomNav';
import { getProgress, PracticeProgress } from '../store/practiceProgress';
import { phrases } from '../data/phrases';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const CARD_W = SCREEN_W * 0.42;
const FEATURED_H = 190;

type Nav = NativeStackNavigationProp<RootStackParamList>;

/* ══════════════════════════════════════ */
/* ── Game definition type ───────────── */
/* ══════════════════════════════════════ */

type GameDef = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  gradientColors: [string, string];
  pattern: React.ReactNode;
  icon: React.ReactNode;
  iconLarge: React.ReactNode;
  screen: keyof RootStackParamList | null;
  comingSoon?: boolean;
  benefits: string[];
  stats: (p: PracticeProgress) => { label: string; value: string | number }[];
};

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

const WavePatternLarge = () => (
  <Svg
    width="100%"
    height="100%"
    viewBox="0 0 400 800"
    style={StyleSheet.absoluteFill}
    preserveAspectRatio="xMidYMid slice"
  >
    <Path d="M-40 200 Q100 140 200 190 T440 160" stroke="rgba(255,255,255,0.08)" strokeWidth={80} fill="none" />
    <Path d="M-40 350 Q120 300 240 340 T480 300" stroke="rgba(255,255,255,0.05)" strokeWidth={50} fill="none" />
    <Path d="M-40 500 Q80 460 180 490 T420 460" stroke="rgba(255,255,255,0.04)" strokeWidth={35} fill="none" />
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

const CirclesPatternLarge = () => (
  <Svg
    width="100%"
    height="100%"
    viewBox="0 0 400 800"
    style={StyleSheet.absoluteFill}
    preserveAspectRatio="xMidYMid slice"
  >
    <SvgCircle cx={320} cy={100} r={120} fill="rgba(255,255,255,0.06)" />
    <SvgCircle cx={340} cy={130} r={70} fill="rgba(255,255,255,0.04)" />
    <SvgCircle cx={60} cy={350} r={90} fill="rgba(255,255,255,0.04)" />
    <SvgCircle cx={280} cy={550} r={60} fill="rgba(255,255,255,0.03)" />
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

const DiagonalPatternLarge = () => (
  <Svg
    width="100%"
    height="100%"
    viewBox="0 0 400 800"
    style={StyleSheet.absoluteFill}
    preserveAspectRatio="xMidYMid slice"
  >
    {[0, 50, 100, 150, 200, 250, 300, 350, 400].map((x) => (
      <Line key={x} x1={x} y1={0} x2={x - 120} y2={800} stroke="rgba(255,255,255,0.04)" strokeWidth={20} />
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

const DotsPatternLarge = () => (
  <Svg
    width="100%"
    height="100%"
    viewBox="0 0 400 800"
    style={StyleSheet.absoluteFill}
    preserveAspectRatio="xMidYMid slice"
  >
    {[40, 100, 160, 220, 280, 340].map((x) =>
      [40, 120, 200, 280, 360, 440, 520, 600].map((y) => (
        <SvgCircle key={`${x}-${y}`} cx={x} cy={y} r={4} fill="rgba(255,255,255,0.06)" />
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

const GridPatternLarge = () => (
  <Svg
    width="100%"
    height="100%"
    viewBox="0 0 400 800"
    style={StyleSheet.absoluteFill}
    preserveAspectRatio="xMidYMid slice"
  >
    <Rect x={240} y={80} width={110} height={110} rx={24} fill="rgba(255,255,255,0.05)" />
    <Rect x={270} y={110} width={110} height={110} rx={24} fill="rgba(255,255,255,0.04)" />
    <Rect x={40} y={350} width={80} height={80} rx={16} fill="rgba(255,255,255,0.04)" />
    <Rect x={280} y={500} width={60} height={60} rx={12} fill="rgba(255,255,255,0.03)" />
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

function CategoryTag({ label, color: tagColor, size = 'sm' }: { label: string; color: string; size?: 'sm' | 'lg' }) {
  const isLg = size === 'lg';
  return (
    <View style={[tagStyles.pill, { backgroundColor: 'rgba(255,255,255,0.2)' }, isLg && tagStyles.pillLg]}>
      <Text style={[tagStyles.text, { color: tagColor }, isLg && tagStyles.textLg]}>{label}</Text>
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
  pillLg: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 8,
  },
  text: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  textLg: {
    fontSize: 12,
    letterSpacing: 1.5,
  },
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
        onPress={onPress}
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
/* ── Game Detail Modal ──────────────── */
/* ══════════════════════════════════════ */

function GameDetailModal({
  game,
  progress,
  visible,
  onClose,
  onPlay,
}: {
  game: GameDef | null;
  progress: PracticeProgress;
  visible: boolean;
  onClose: () => void;
  onPlay: () => void;
}) {
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.92);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, damping: 16, stiffness: 120, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!game) return null;

  const gameStats = game.stats(progress);

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[modalStyles.backdrop, { opacity: opacityAnim }]}>
        <Animated.View style={[modalStyles.container, { transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient
            colors={game.gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={modalStyles.gradient}
          >
            {/* Large background pattern */}
            {game.id === 'frases' && <WavePatternLarge />}
            {game.id === 'plataformas' && <CirclesPatternLarge />}
            {game.id === 'palabra-rapida' && <DiagonalPatternLarge />}
            {game.id === 'pares' && <DotsPatternLarge />}
            {game.id === 'dictado' && <GridPatternLarge />}
            {game.id === 'escritura' && <DiagonalPatternLarge />}

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={[modalStyles.scrollContent, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 100 }]}
              showsVerticalScrollIndicator={false}
            >
              {/* Close button */}
              <Pressable onPress={onClose} hitSlop={16} style={modalStyles.closeBtn}>
                <CloseIcon size={22} color="rgba(255,255,255,0.7)" />
              </Pressable>

              {/* Icon */}
              <View style={modalStyles.iconContainer}>
                <View style={modalStyles.iconHex}>
                  {game.iconLarge}
                </View>
              </View>

              {/* Title & category */}
              <Text style={modalStyles.title}>{game.title}</Text>
              <View style={{ alignItems: 'center', marginBottom: 32 }}>
                <CategoryTag label={game.category} color="rgba(255,255,255,0.7)" size="lg" />
              </View>

              {/* Stats */}
              {gameStats.length > 0 && (
                <View style={modalStyles.statsCard}>
                  {gameStats.map((stat, i) => (
                    <React.Fragment key={stat.label}>
                      {i > 0 && <View style={modalStyles.statsDividerV} />}
                      <View style={modalStyles.statItem}>
                        <Text style={modalStyles.statValue}>{stat.value}</Text>
                        <Text style={modalStyles.statLabel}>{stat.label}</Text>
                      </View>
                    </React.Fragment>
                  ))}
                </View>
              )}

              {/* Benefits */}
              <View style={modalStyles.benefitsSection}>
                <Text style={modalStyles.benefitsTitle}>BENEFITS</Text>
                {game.benefits.map((benefit, i) => (
                  <View key={i} style={modalStyles.benefitRow}>
                    <View style={modalStyles.benefitDot} />
                    <Text style={modalStyles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>

              {/* Description */}
              <Text style={modalStyles.description}>{game.subtitle}</Text>
            </ScrollView>

            {/* Play button - pinned at bottom */}
            <View style={[modalStyles.playBtnContainer, { paddingBottom: insets.bottom + 16 }]}>
              {game.comingSoon ? (
                <View style={[modalStyles.playBtn, modalStyles.playBtnDisabled]}>
                  <Text style={modalStyles.playBtnText}>Coming Soon</Text>
                </View>
              ) : (
                <Pressable
                  onPress={onPlay}
                  style={({ pressed }) => [modalStyles.playBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
                >
                  <Text style={modalStyles.playBtnText}>Play</Text>
                </Pressable>
              )}
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 28,
  },

  /* Close */
  closeBtn: {
    alignSelf: 'flex-start',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },

  /* Icon */
  iconContainer: {
    marginBottom: 20,
  },
  iconHex: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },

  /* Title */
  title: {
    fontFamily: fonts.bold,
    fontSize: 30,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 8,
  },

  /* Stats */
  statsCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 20,
    marginBottom: 32,
    alignSelf: 'stretch',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statsDividerV: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginVertical: 4,
  },

  /* Benefits */
  benefitsSection: {
    alignSelf: 'stretch',
    marginBottom: 24,
  },
  benefitsTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    paddingRight: 12,
  },
  benefitDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginTop: 6,
    marginRight: 14,
  },
  benefitText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 21,
    flex: 1,
  },

  /* Description */
  description: {
    fontFamily: fonts.light,
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    lineHeight: 18,
  },

  /* Play button */
  playBtnContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: 'transparent',
  },
  playBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radii.lg,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  playBtnDisabled: {
    opacity: 0.5,
  },
  playBtnText: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.white,
    letterSpacing: 0.5,
  },
});

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
  const [selectedGame, setSelectedGame] = useState<GameDef | null>(null);

  useFocusEffect(
    useCallback(() => {
      getProgress().then(setProgress);
    }, []),
  );

  const masteredCount = progress.masteredPhrases.length;
  const totalPhrases = phrases.length;

  /* ── Game definitions ── */
  const games: Record<string, GameDef> = {
    frases: {
      id: 'frases',
      title: 'Frases',
      subtitle: 'Practice saying key phrases aloud and get instant pronunciation feedback from Sabio.',
      category: 'Pronunciation',
      gradientColors: [colors.teal, colors.tealDark],
      pattern: <WavePattern />,
      icon: <MicIcon size={22} color={colors.white} />,
      iconLarge: <MicIcon size={40} color={colors.white} />,
      screen: 'PhrasePractice',
      benefits: [
        'Build confidence speaking Spanish out loud',
        'Improve pronunciation with real-time feedback',
        'Master essential phrases for daily conversation',
      ],
      stats: (p) => [
        { label: 'Mastered', value: `${p.masteredPhrases.length}/${totalPhrases}` },
        { label: 'Best Streak', value: p.bestStreak },
      ],
    },
    plataformas: {
      id: 'plataformas',
      title: 'Plataformas',
      subtitle: 'Say color names in Spanish to keep your character jumping from platform to platform!',
      category: 'Colors',
      gradientColors: [colors.terracotta, colors.terracottaDark],
      pattern: <CirclesPattern />,
      icon: <GamepadIcon size={22} color={colors.white} />,
      iconLarge: <GamepadIcon size={40} color={colors.white} />,
      screen: 'ColorGame',
      benefits: [
        'Learn Spanish color vocabulary through play',
        'Train quick recall under time pressure',
        'Improve Spanish pronunciation speed',
      ],
      stats: (p) => [
        { label: 'High Score', value: p.colorGameHighScore },
        { label: 'Difficulty', value: 'Adaptive' },
      ],
    },
    'palabra-rapida': {
      id: 'palabra-rapida',
      title: 'Palabra Rapida',
      subtitle: 'Translate words as fast as you can before the timer runs out.',
      category: 'Speed',
      gradientColors: ['#6C5CE7', '#4834D4'],
      pattern: <DiagonalPattern />,
      icon: <BrainIcon size={22} color={colors.white} />,
      iconLarge: <BrainIcon size={40} color={colors.white} />,
      screen: null,
      comingSoon: true,
      benefits: [
        'Expand your working vocabulary rapidly',
        'Develop faster translation instincts',
        'Challenge yourself with progressive difficulty',
      ],
      stats: () => [],
    },
    pares: {
      id: 'pares',
      title: 'Pares',
      subtitle: 'Find matching Spanish-English word pairs in a memory card game.',
      category: 'Memory',
      gradientColors: [colors.marigold, colors.marigoldDark],
      pattern: <DotsPattern />,
      icon: <BookOpenIcon size={22} color={colors.white} />,
      iconLarge: <BookOpenIcon size={40} color={colors.white} />,
      screen: null,
      comingSoon: true,
      benefits: [
        'Strengthen word association and recall',
        'Learn vocabulary through visual memory',
        'Build connections between Spanish and English',
      ],
      stats: () => [],
    },
    dictado: {
      id: 'dictado',
      title: 'Dictado',
      subtitle: 'Listen carefully to spoken Spanish and type exactly what you hear.',
      category: 'Listening',
      gradientColors: ['#2D3436', '#636E72'],
      pattern: <GridPattern />,
      icon: <ListenIcon size={22} color={colors.white} />,
      iconLarge: <ListenIcon size={40} color={colors.white} />,
      screen: null,
      comingSoon: true,
      benefits: [
        'Sharpen your ear for natural Spanish speech',
        'Improve spelling and written accuracy',
        'Train comprehension at native speed',
      ],
      stats: () => [],
    },
    escritura: {
      id: 'escritura',
      title: 'Escritura',
      subtitle: 'Write out translations from audio prompts to practice written Spanish.',
      category: 'Writing',
      gradientColors: ['#E17055', '#D63031'],
      pattern: <DiagonalPattern />,
      icon: <PencilIcon size={22} color={colors.white} />,
      iconLarge: <PencilIcon size={40} color={colors.white} />,
      screen: null,
      comingSoon: true,
      benefits: [
        'Practice forming sentences in Spanish',
        'Reinforce grammar through active writing',
        'Bridge the gap between hearing and writing',
      ],
      stats: () => [],
    },
  };

  const handleOpenGame = (gameId: string) => {
    setSelectedGame(games[gameId] ?? null);
  };

  const handlePlay = () => {
    if (!selectedGame?.screen) return;
    setSelectedGame(null);
    navigation.navigate(selectedGame.screen as any);
  };

  return (
    <View style={styles.root}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <StaggerIn delay={0} style={{ paddingHorizontal: 20 }}>
          <Text style={styles.screenTitle}>Practica</Text>
          <Text style={styles.screenSubtitle}>
            Train your ear, voice, and vocabulary
          </Text>
        </StaggerIn>

        {/* ── Featured: Activity of the day ── */}
        <StaggerIn delay={100}>
          <SectionHeader title="Pick up where you left off" />
          <FeaturedCard
            title="Frases"
            subtitle="Practice saying key phrases aloud — Sabio checks your pronunciation"
            category="Pronunciation"
            gradientColors={[colors.teal, colors.tealDark]}
            pattern={<WavePattern />}
            icon={<MicIcon size={28} color={colors.white} />}
            meta={`${masteredCount}/${totalPhrases}`}
            onPress={() => handleOpenGame('frases')}
          />
        </StaggerIn>

        {/* ── Vocabulary Games ── */}
        <StaggerIn delay={220} style={{ marginTop: 30 }}>
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
              onPress={() => handleOpenGame('plataformas')}
            />
            <GameCard
              title="Palabra Rapida"
              subtitle="Translate words against the clock"
              category="Speed"
              gradientColors={['#6C5CE7', '#4834D4']}
              pattern={<DiagonalPattern />}
              icon={<BrainIcon size={22} color={colors.white} />}
              onPress={() => handleOpenGame('palabra-rapida')}
              comingSoon
            />
            <GameCard
              title="Pares"
              subtitle="Match Spanish to English pairs"
              category="Memory"
              gradientColors={[colors.marigold, colors.marigoldDark]}
              pattern={<DotsPattern />}
              icon={<BookOpenIcon size={22} color={colors.white} />}
              onPress={() => handleOpenGame('pares')}
              comingSoon
            />
          </ScrollView>
        </StaggerIn>

        {/* ── Listening & Speaking ── */}
        <StaggerIn delay={340} style={{ marginTop: 30 }}>
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
              onPress={() => handleOpenGame('frases')}
            />
            <GameCard
              title="Dictado"
              subtitle="Listen and type what you hear"
              category="Listening"
              gradientColors={['#2D3436', '#636E72']}
              pattern={<GridPattern />}
              icon={<ListenIcon size={22} color={colors.white} />}
              onPress={() => handleOpenGame('dictado')}
              comingSoon
            />
            <GameCard
              title="Escritura"
              subtitle="Write translations from audio prompts"
              category="Writing"
              gradientColors={['#E17055', '#D63031']}
              pattern={<DiagonalPattern />}
              icon={<PencilIcon size={22} color={colors.white} />}
              onPress={() => handleOpenGame('escritura')}
              comingSoon
            />
          </ScrollView>
        </StaggerIn>

        {/* ── Talk to Dillow CTA ── */}
        <StaggerIn delay={460} style={{ marginTop: 30, paddingHorizontal: 20 }}>
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

      {/* ── Game detail modal ── */}
      <GameDetailModal
        game={selectedGame}
        progress={progress}
        visible={selectedGame !== null}
        onClose={() => setSelectedGame(null)}
        onPlay={handlePlay}
      />

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
