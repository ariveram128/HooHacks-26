/**
 * SpanishLessonsScreen.tsx
 *
 * A vine-themed Spanish lesson path for React Native.
 *
 * ──────────────────────────────────────────────
 * DEPENDENCIES — install before running:
 *
 *   npm install react-native-svg react-native-linear-gradient
 *
 *   # — OR, if you're using Expo: —
 *   npx expo install react-native-svg expo-linear-gradient
 *
 * If you use expo-linear-gradient, change the import below:
 *   import LinearGradient from 'react-native-linear-gradient';
 *     →  import { LinearGradient } from 'expo-linear-gradient';
 * ──────────────────────────────────────────────
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import Svg, {
  Path,
  G,
  Line,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Circle as SvgCircle,
} from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
// ── Expo users: uncomment the line below and comment out the one above ──
// import { LinearGradient } from 'expo-linear-gradient';

// ═══════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════
interface Lesson {
  id: number;
  title: string;
  subtitle: string;
  xp: number;
  icon: string;
  status: 'completed' | 'current' | 'locked';
  stars: number;
}

const LESSONS: Lesson[] = [
  { id: 1, title: 'Hola Mundo', subtitle: 'Greetings & Introductions', xp: 50, icon: '👋', status: 'completed', stars: 3 },
  { id: 2, title: 'La Familia', subtitle: 'Family Members', xp: 60, icon: '👨‍👩‍👧‍👦', status: 'completed', stars: 2 },
  { id: 3, title: 'Los Colores', subtitle: 'Colors & Descriptions', xp: 55, icon: '🎨', status: 'completed', stars: 3 },
  { id: 4, title: '¿Qué Hora Es?', subtitle: 'Telling Time', xp: 70, icon: '🕐', status: 'current', stars: 0 },
  { id: 5, title: 'En El Mercado', subtitle: 'Shopping & Numbers', xp: 65, icon: '🛒', status: 'locked', stars: 0 },
  { id: 6, title: 'Mi Casa', subtitle: 'Home & Furniture', xp: 75, icon: '🏠', status: 'locked', stars: 0 },
  { id: 7, title: 'La Comida', subtitle: 'Food & Drinks', xp: 80, icon: '🍽️', status: 'locked', stars: 0 },
  { id: 8, title: 'El Clima', subtitle: 'Weather & Seasons', xp: 70, icon: '☀️', status: 'locked', stars: 0 },
  { id: 9, title: 'Los Animales', subtitle: 'Animals & Nature', xp: 85, icon: '🦋', status: 'locked', stars: 0 },
  { id: 10, title: 'Viajes', subtitle: 'Travel & Directions', xp: 90, icon: '✈️', status: 'locked', stars: 0 },
  { id: 11, title: 'El Cuerpo', subtitle: 'Body & Health', xp: 80, icon: '💪', status: 'locked', stars: 0 },
  { id: 12, title: 'Las Profesiones', subtitle: 'Jobs & Careers', xp: 95, icon: '👩‍🔬', status: 'locked', stars: 0 },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ═══════════════════════════════════════════
// MATH HELPERS  (vine curve)
// ═══════════════════════════════════════════
const VINE_CENTER_X = SCREEN_WIDTH / 2;
const AMPLITUDE = SCREEN_WIDTH * 0.22;
const FREQUENCY = 0.0035;
const NODE_SPACING = 160;

/** X position along the sine-wave vine at a given Y */
function vineX(y: number): number {
  return VINE_CENTER_X + Math.sin(y * FREQUENCY) * AMPLITUDE + Math.sin(y * FREQUENCY * 2.3) * (AMPLITUDE * 0.3);
}

/** Y position for the n-th lesson node */
function nodeY(index: number): number {
  return 120 + index * NODE_SPACING;
}

// ═══════════════════════════════════════════
// LEAF SHAPES  (SVG path data)
// ═══════════════════════════════════════════
const LEAF_SHAPES = [
  'M0,-20 C10,-22 18,-15 20,-5 C22,5 15,18 5,22 C0,24 -2,20 -3,15 C-5,8 -8,2 -10,-5 C-12,-12 -8,-18 0,-20Z',
  'M0,-24 C5,-20 8,-12 8,-2 C8,8 5,18 0,24 C-5,18 -8,8 -8,-2 C-8,-12 -5,-20 0,-24Z',
  'M0,-18 C8,-24 18,-18 18,-8 C18,4 8,16 0,22 C-8,16 -18,4 -18,-8 C-18,-18 -8,-24 0,-18Z',
];

const LEAF_COLORS = ['#2D5A27', '#4A7C3F', '#3E8B35', '#5A9B4E', '#2A6B22'];

// ═══════════════════════════════════════════
// ANIMATED LEAF
// ═══════════════════════════════════════════
interface LeafProps {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  delay: number;
  variant: number;
  color: string;
}

const AnimatedLeaf: React.FC<LeafProps> = ({ x, y, rotation, scale, delay, variant, color }) => {
  const sway = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.loop(
          Animated.sequence([
            Animated.timing(sway, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            Animated.timing(sway, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          ]),
        ),
        Animated.timing(fadeIn, { toValue: 1, duration: 600, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ]).start();
    }, delay * 300);
    return () => clearTimeout(timeout);
  }, []);

  const swayDeg = sway.interpolate({ inputRange: [0, 1], outputRange: ['-3deg', '3deg'] });

  const shape = LEAF_SHAPES[variant % LEAF_SHAPES.length];

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x - 20 * scale,
        top: y - 24 * scale,
        width: 40 * scale,
        height: 48 * scale,
        opacity: fadeIn,
        transform: [{ rotate: swayDeg }],
      }}
    >
      <Svg width={40 * scale} height={48 * scale} viewBox="-24 -24 48 48">
        <G rotation={rotation} origin="0,0">
          <Path d={shape} fill={color} opacity={0.85} />
          <Line x1={0} y1={-18} x2={0} y2={20} stroke="#1a3d17" strokeWidth={0.4} opacity={0.3} />
        </G>
      </Svg>
    </Animated.View>
  );
};

// ═══════════════════════════════════════════
// FIREFLY
// ═══════════════════════════════════════════
const Firefly: React.FC<{ delay: number }> = ({ delay }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const startX = useRef(Math.random() * SCREEN_WIDTH).current;
  const startY = useRef(80 + Math.random() * 300).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(opacity, { toValue: 0.8, duration: 1500, useNativeDriver: true }),
            Animated.timing(translateX, { toValue: 30 - Math.random() * 60, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            Animated.timing(translateY, { toValue: -40 - Math.random() * 40, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(opacity, { toValue: 0, duration: 1500, useNativeDriver: true }),
            Animated.timing(translateX, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          ]),
        ]),
      ).start();
    }, delay * 1200);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: startX,
        top: startY,
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: '#FFD700',
        opacity,
        transform: [{ translateX }, { translateY }],
        ...Platform.select({
          ios: {
            shadowColor: '#FFD700',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 6,
          },
          android: { elevation: 3 },
        }),
      }}
    />
  );
};

// ═══════════════════════════════════════════
// STAR DISPLAY
// ═══════════════════════════════════════════
const StarDisplay: React.FC<{ count: number; size?: number }> = ({ count, size = 14 }) => (
  <View style={{ flexDirection: 'row', gap: 2 }}>
    {[1, 2, 3].map((i) => (
      <Svg key={i} width={size} height={size} viewBox="0 0 24 24">
        <Path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill={i <= count ? '#FFD700' : '#3a3a3a'}
          stroke={i <= count ? '#FFA500' : '#555'}
          strokeWidth={1}
          opacity={i <= count ? 1 : 0.4}
        />
      </Svg>
    ))}
  </View>
);

// ═══════════════════════════════════════════
// SHIMMER  (golden pulse on current lesson)
// ═══════════════════════════════════════════
const Shimmer: React.FC = () => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        ...StyleSheet.absoluteFillObject,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.08)',
        opacity: anim,
      }}
    />
  );
};

// ═══════════════════════════════════════════
// LESSON NODE
// ═══════════════════════════════════════════
interface LessonNodeProps {
  lesson: Lesson;
  index: number;
  onPress?: (lesson: Lesson) => void;
}

const LessonNode: React.FC<LessonNodeProps> = ({ lesson, index, onPress }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const yPos = nodeY(index);
  const xVine = vineX(yPos);
  const side = index % 2 === 0 ? 1 : -1;
  const nodeLeft = xVine + side * 100 - 110; // half card width ≈ 110

  const isCompleted = lesson.status === 'completed';
  const isCurrent = lesson.status === 'current';
  const isLocked = lesson.status === 'locked';

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 500, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }),
      ]).start();
    }, index * 100);
    return () => clearTimeout(timeout);
  }, []);

  const handlePressIn = () => {
    if (!isLocked) {
      Animated.spring(scaleAnim, { toValue: 0.94, friction: 8, useNativeDriver: true }).start();
    }
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }).start();
  };

  const borderColor = isCompleted ? '#6BBF59' : isCurrent ? '#FFD700' : '#555';
  const glowColor = isCompleted ? 'rgba(107,191,89,0.35)' : isCurrent ? 'rgba(255,215,0,0.4)' : 'transparent';
  const gradientColors = isCompleted
    ? ['#2D5A27', '#4A7C3F']
    : isCurrent
    ? ['#D4A017', '#F2C94C']
    : ['#2a2a2a', '#3a3a3a'];

  // Connector dot position (absolute within the card's parent)
  const dotLeft = side > 0 ? -18 : undefined;
  const dotRight = side < 0 ? -18 : undefined;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: yPos - 42,
        left: nodeLeft,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        zIndex: 10,
      }}
    >
      {/* Dotted connector line */}
      <View
        style={{
          position: 'absolute',
          top: '50%',
          left: side > 0 ? -52 : undefined,
          right: side < 0 ? -52 : undefined,
          width: 40,
          height: 1,
          borderStyle: 'dashed',
          borderBottomWidth: 1.5,
          borderColor: isCompleted ? 'rgba(74,124,63,0.35)' : isCurrent ? 'rgba(255,215,0,0.35)' : 'rgba(85,85,85,0.25)',
        }}
      />

      {/* Connector dot */}
      <View
        style={{
          position: 'absolute',
          top: '48%',
          left: dotLeft,
          right: dotRight,
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: borderColor,
          zIndex: 11,
          ...Platform.select({
            ios: { shadowColor: glowColor, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 6 },
            android: { elevation: 4 },
          }),
        }}
      />

      <TouchableOpacity
        activeOpacity={isLocked ? 1 : 0.85}
        onPress={() => !isLocked && onPress?.(lesson)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isLocked}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.card,
            {
              borderColor,
              opacity: isLocked ? 0.55 : 1,
            },
            Platform.select({
              ios: { shadowColor: glowColor, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.8, shadowRadius: 12 },
              android: { elevation: isLocked ? 2 : 8 },
            }),
          ]}
        >
          {isCurrent && <Shimmer />}

          <View style={styles.cardRow}>
            {/* Icon */}
            <View style={styles.iconBox}>
              <Text style={styles.iconText}>{isLocked ? '🔒' : lesson.icon}</Text>
            </View>

            {/* Text content */}
            <View style={styles.cardTextWrap}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {lesson.title}
              </Text>
              <Text style={styles.cardSubtitle} numberOfLines={1}>
                {lesson.subtitle}
              </Text>
              {isCompleted && (
                <View style={{ marginTop: 4 }}>
                  <StarDisplay count={lesson.stars} />
                </View>
              )}
              {isCurrent && (
                <View style={styles.continueBadge}>
                  <Text style={styles.continueText}>▶ CONTINUAR</Text>
                </View>
              )}
            </View>
          </View>

          {/* XP badge */}
          {!isLocked && (
            <View style={[styles.xpBadge, { borderColor: isCurrent ? '#FFD700' : '#6BBF59' }]}>
              <Text style={[styles.xpText, { color: isCurrent ? '#FFD700' : '#6BBF59' }]}>
                +{lesson.xp}XP
              </Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ═══════════════════════════════════════════
// VINE PATH  (SVG)
// ═══════════════════════════════════════════
interface VinePathProps {
  containerHeight: number;
}

const VinePath: React.FC<VinePathProps> = ({ containerHeight }) => {
  // Build the sine-wave path string
  const points: string[] = [];
  for (let y = -50; y <= containerHeight + 50; y += 4) {
    const x = vineX(y);
    points.push(`${y === -50 ? 'M' : 'L'}${x.toFixed(1)},${y}`);
  }
  const pathD = points.join(' ');

  return (
    <Svg
      width={SCREEN_WIDTH}
      height={containerHeight}
      style={{ position: 'absolute', top: 0, left: 0 }}
      pointerEvents="none"
    >
      <Defs>
        <SvgLinearGradient id="vineGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#4A7C3F" />
          <Stop offset="50%" stopColor="#2D5A27" />
          <Stop offset="100%" stopColor="#1a3d17" />
        </SvgLinearGradient>
      </Defs>

      {/* Shadow vine (offset) */}
      <Path d={pathD} fill="none" stroke="rgba(10,26,8,0.3)" strokeWidth={8} strokeLinecap="round" />

      {/* Main vine */}
      <Path d={pathD} fill="none" stroke="url(#vineGrad)" strokeWidth={6} strokeLinecap="round" />

      {/* Highlight vine */}
      <Path d={pathD} fill="none" stroke="#5A9B4E" strokeWidth={2} strokeLinecap="round" opacity={0.3} />
    </Svg>
  );
};

// ═══════════════════════════════════════════
// GENERATE LEAF DATA
// ═══════════════════════════════════════════
interface LeafData {
  key: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  delay: number;
  variant: number;
  color: string;
}

function generateLeaves(containerHeight: number): LeafData[] {
  const leaves: LeafData[] = [];
  let id = 0;
  for (let y = 20; y <= containerHeight; y += 35 + Math.sin(y) * 15) {
    const x = vineX(y);
    const tangentX =
      Math.cos(y * FREQUENCY) * AMPLITUDE * FREQUENCY +
      Math.cos(y * FREQUENCY * 2.3) * (AMPLITUDE * 0.3) * FREQUENCY * 2.3;
    const side = Math.sin(y * 0.7) > 0 ? 1 : -1;
    const rot = (Math.atan2(1, tangentX) * 180) / Math.PI + side * 50 + Math.sin(y * 0.3) * 20;

    leaves.push({
      key: `leaf-${id++}`,
      x: x + side * 18,
      y,
      rotation: rot,
      scale: 0.6 + Math.sin(y * 0.2) * 0.25,
      delay: y * 0.003,
      variant: Math.floor(y * 0.1) % 3,
      color: LEAF_COLORS[Math.floor(y * 0.07) % LEAF_COLORS.length],
    });

    // Extra leaf on opposite side sometimes
    if (Math.sin(y * 1.3) > 0.3) {
      leaves.push({
        key: `leaf-${id++}`,
        x: x - side * 14,
        y: y + 12,
        rotation: rot + 120,
        scale: 0.4 + Math.sin(y * 0.4) * 0.15,
        delay: y * 0.003 + 0.3,
        variant: (Math.floor(y * 0.1) + 1) % 3,
        color: LEAF_COLORS[(Math.floor(y * 0.07) + 2) % LEAF_COLORS.length],
      });
    }
  }
  return leaves;
}

// ═══════════════════════════════════════════
// PROGRESS BAR
// ═══════════════════════════════════════════
const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
  const width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(width, { toValue: progress, duration: 1200, delay: 300, easing: Easing.out(Easing.ease), useNativeDriver: false }).start();
  }, [progress]);

  const animatedWidth = width.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.progressTrack}>
      <Animated.View style={[styles.progressFill, { width: animatedWidth }]} />
    </View>
  );
};

// ═══════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════
const SpanishLessonsScreen: React.FC = () => {
  const containerHeight = LESSONS.length * NODE_SPACING + 240;
  const completedLessons = LESSONS.filter((l) => l.status === 'completed');
  const totalXP = completedLessons.reduce((sum, l) => sum + l.xp, 0);
  const progress = completedLessons.length / LESSONS.length;
  const streak = 7;

  const leafData = React.useMemo(() => generateLeaves(containerHeight), [containerHeight]);

  const scrollRef = useRef<ScrollView>(null);

  // Scroll to current lesson on mount
  useEffect(() => {
    const currentIndex = LESSONS.findIndex((l) => l.status === 'current');
    if (currentIndex >= 0 && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: nodeY(currentIndex) - 200, animated: true });
      }, 600);
    }
  }, []);

  const handleLessonPress = (lesson: Lesson) => {
    // Hook into your navigation here, e.g.:
    // navigation.navigate('LessonDetail', { lessonId: lesson.id });
    console.log('Tapped lesson:', lesson.title);
  };

  return (
    <View style={styles.root}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#0a1a08', '#0d200a', '#112b0e', '#0a1a08']}
        locations={[0, 0.3, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Fireflies (fixed behind scroll) */}
      {Array.from({ length: 10 }).map((_, i) => (
        <Firefly key={`fly-${i}`} delay={i} />
      ))}

      {/* Scrollable area */}
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={{ height: containerHeight }}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* Vine */}
        <VinePath containerHeight={containerHeight} />

        {/* Leaves */}
        {leafData.map((leaf) => (
          <AnimatedLeaf key={leaf.key} {...leaf} />
        ))}

        {/* Lesson nodes */}
        {LESSONS.map((lesson, i) => (
          <LessonNode key={lesson.id} lesson={lesson} index={i} onPress={handleLessonPress} />
        ))}

        {/* Bottom message */}
        <View style={[styles.bottomMsg, { top: containerHeight - 70 }]}>
          <Text style={styles.bottomMsgText}>🌱 More lessons growing soon...</Text>
        </View>
      </ScrollView>

      {/* ── Fixed header (on top of scroll) ── */}
      <LinearGradient
        colors={['#0a1a08', '#0a1a08ee', 'transparent']}
        style={styles.header}
        pointerEvents="box-none"
      >
        <View style={styles.headerInner}>
          {/* Logo row */}
          <View style={styles.headerTop}>
            <View style={styles.logoRow}>
              <LinearGradient colors={['#2D5A27', '#4A7C3F']} style={styles.logoBox}>
                <Text style={styles.logoEmoji}>🌿</Text>
              </LinearGradient>
              <View>
                <Text style={styles.logoTitle}>Sendero Verde</Text>
                <Text style={styles.logoSubtitle}>LEARN SPANISH</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValueFire}>🔥 {streak}</Text>
                <Text style={styles.statLabel}>Streak</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValueXP}>{totalXP}</Text>
                <Text style={styles.statLabel}>XP</Text>
              </View>
            </View>
          </View>

          {/* Progress bar */}
          <ProgressBar progress={progress} />
          <Text style={styles.progressLabel}>
            {completedLessons.length} of {LESSONS.length} lessons complete
          </Text>
        </View>
      </LinearGradient>

      {/* Bottom fade */}
      <LinearGradient
        colors={['transparent', '#0a1a08']}
        style={styles.bottomFade}
        pointerEvents="none"
      />
    </View>
  );
};

export default SpanishLessonsScreen;

// ═══════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0a1a08',
  },
  scrollView: {
    flex: 1,
  },

  // ── Header ──
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingHorizontal: 20,
    paddingBottom: 32,
    zIndex: 100,
  },
  headerInner: {
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#6BBF59',
  },
  logoEmoji: {
    fontSize: 22,
  },
  logoTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Rounded Mplus 1c Bold' : 'sans-serif-medium',
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
  },
  logoSubtitle: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  statItem: {
    alignItems: 'center',
  },
  statValueFire: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FF6B35',
  },
  statValueXP: {
    fontSize: 17,
    fontWeight: '700',
    color: '#6BBF59',
  },
  statLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  // ── Progress ──
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#6BBF59',
  },
  progressLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)',
    marginTop: 4,
    textAlign: 'right',
  },

  // ── Card ──
  card: {
    borderRadius: 20,
    padding: 14,
    paddingHorizontal: 18,
    width: 220,
    borderWidth: 2,
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 26,
  },
  cardTextWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  cardSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 1,
  },
  continueBadge: {
    marginTop: 5,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  continueText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // ── XP badge ──
  xpBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderWidth: 1.5,
  },
  xpText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // ── Bottom ──
  bottomMsg: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bottomMsgText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.25)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  bottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
});
