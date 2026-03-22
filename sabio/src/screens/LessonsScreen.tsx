import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  Platform,
  Pressable,
  Modal,
} from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Circle as SvgCircle,
} from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, fonts, spacing, radii } from '../theme';
import { lessons, Lesson } from '../data/lessons';
import { getProgress, LessonProgress } from '../store/lessonProgress';
import {
  ChevronRightIcon, BookIcon,
  AlphaIcon, NumericIcon, EarIcon, HandIcon, IdCardIcon, TextIcon, CubeIcon,
  SwitchAccountIcon, ScaleIcon, ClockIcon, BoltIcon, QuestionBubbleIcon,
  PaletteIcon, HistoryIcon, UpdateIcon, RocketIcon, ThoughtIcon, BranchIcon,
  DecisionIcon, QuoteIcon,
} from '../components/Icons';

type Nav = NativeStackNavigationProp<RootStackParamList>;
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ═══════════════════════════════════════════
// LAYOUT CONSTANTS
// ═══════════════════════════════════════════
const VINE_CENTER_X = SCREEN_W * 0.22;
const AMPLITUDE = SCREEN_W * 0.06;
const FREQUENCY = 0.005;
const NODE_SPACING = 110;
const TOP_PADDING = 160;
const HEX_SIZE = 52;

// ═══════════════════════════════════════════
// SECTION ACCENTS
// ═══════════════════════════════════════════
const SECTION_ACCENT: Record<string, { primary: string; dark: string; light: string }> = {
  raices: { primary: colors.teal, dark: colors.tealDark, light: colors.tealLight },
  brotes: { primary: colors.tealLight, dark: colors.teal, light: '#3AAB9A' },
  ramas: { primary: colors.terracotta, dark: colors.terracottaDark, light: colors.terracottaLight },
  copa: { primary: colors.marigold, dark: colors.marigoldDark, light: colors.marigoldLight },
};

const LESSON_ICON: Record<string, (p: { size: number; color: string }) => React.ReactNode> = {
  // Raíces
  alfabeto: (p) => <AlphaIcon {...p} />,
  numeros: (p) => <NumericIcon {...p} />,
  pronunciacion: (p) => <EarIcon {...p} />,
  saludos: (p) => <HandIcon {...p} />,
  presentaciones: (p) => <IdCardIcon {...p} />,
  // Brotes
  articulos: (p) => <TextIcon {...p} />,
  sustantivos: (p) => <CubeIcon {...p} />,
  pronombres: (p) => <SwitchAccountIcon {...p} />,
  'ser-estar': (p) => <ScaleIcon {...p} />,
  'presente-regular': (p) => <ClockIcon {...p} />,
  // Ramas
  'presente-irregular': (p) => <BoltIcon {...p} />,
  preguntas: (p) => <QuestionBubbleIcon {...p} />,
  adjetivos: (p) => <PaletteIcon {...p} />,
  preterito: (p) => <HistoryIcon {...p} />,
  imperfecto: (p) => <UpdateIcon {...p} />,
  // Copa
  futuro: (p) => <RocketIcon {...p} />,
  subjuntivo: (p) => <ThoughtIcon {...p} />,
  condicional: (p) => <BranchIcon {...p} />,
  'por-para': (p) => <DecisionIcon {...p} />,
  expresiones: (p) => <QuoteIcon {...p} />,
};

const DEFAULT_ICON = (p: { size: number; color: string }) => <BookIcon {...p} />;

// ═══════════════════════════════════════════
// VINE MATH
// ═══════════════════════════════════════════
function vineX(y: number): number {
  return VINE_CENTER_X + Math.sin(y * FREQUENCY) * AMPLITUDE + Math.sin(y * FREQUENCY * 2.6) * (AMPLITUDE * 0.3);
}

// Build node positions with section headers interleaved
type NodeItem =
  | { type: 'section'; sectionId: string; title: string; subtitle: string; y: number }
  | { type: 'lesson'; lesson: Lesson; index: number; y: number };

function buildNodeList(): { items: NodeItem[]; totalHeight: number } {
  const items: NodeItem[] = [];
  let y = TOP_PADDING;

  lessons.forEach((lesson, i) => {
    items.push({ type: 'lesson', lesson, index: i, y });
    y += NODE_SPACING;
  });

  return { items, totalHeight: y + 120 };
}

// ═══════════════════════════════════════════
// VINE PATH (SVG) — color transitions per section
// ═══════════════════════════════════════════
const VinePath: React.FC<{ containerHeight: number }> = ({ containerHeight }) => {
  if (containerHeight <= 0) return null;

  const safeH = Math.round(containerHeight);
  const points: string[] = [];
  for (let y = -200; y <= safeH + 50; y += 3) {
    const x = vineX(y);
    points.push(`${y === -200 ? 'M' : 'L'}${x.toFixed(1)},${y}`);
  }
  const pathD = points.join(' ');

  return (
    <Svg width={SCREEN_W} height={safeH} style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <SvgGradient id="vineGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={colors.teal} />
          <Stop offset="25%" stopColor={colors.tealLight} />
          <Stop offset="50%" stopColor={colors.marigold} />
          <Stop offset="75%" stopColor={colors.marigoldLight} />
          <Stop offset="100%" stopColor={colors.terracotta} />
        </SvgGradient>
      </Defs>
      {/* Fading glow layers */}
      <Path d={pathD} fill="none" stroke="rgba(26,107,94,0.02)" strokeWidth={32} strokeLinecap="round" />
      <Path d={pathD} fill="none" stroke="rgba(26,107,94,0.04)" strokeWidth={20} strokeLinecap="round" />
      <Path d={pathD} fill="none" stroke="rgba(26,107,94,0.08)" strokeWidth={12} strokeLinecap="round" />
      {/* Main vine */}
      <Path d={pathD} fill="none" stroke="url(#vineGrad)" strokeWidth={4} strokeLinecap="round" />
    </Svg>
  );
};

// ═══════════════════════════════════════════
// COLOR-BY-POSITION (matches vine gradient)
// ═══════════════════════════════════════════
// Vine gradient: 0% teal → 25% tealLight → 50% marigold → 75% marigoldLight → 100% terracotta
// We lerp between hex colors based on y / containerHeight

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('');
}
function lerpColor(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}

const VINE_COLOR_STOPS: { pos: number; color: string }[] = [
  { pos: 0, color: colors.teal },
  { pos: 0.25, color: colors.tealLight },
  { pos: 0.5, color: colors.marigold },
  { pos: 0.75, color: colors.marigoldLight },
  { pos: 1, color: colors.terracotta },
];

function vineColorAt(t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  for (let i = 0; i < VINE_COLOR_STOPS.length - 1; i++) {
    const a = VINE_COLOR_STOPS[i];
    const b = VINE_COLOR_STOPS[i + 1];
    if (clamped >= a.pos && clamped <= b.pos) {
      const local = (clamped - a.pos) / (b.pos - a.pos);
      return lerpColor(a.color, b.color, local);
    }
  }
  return VINE_COLOR_STOPS[VINE_COLOR_STOPS.length - 1].color;
}

// Variant shades: slightly darker or lighter for variety
function vineColorVariant(t: number, seed: number): string {
  const base = vineColorAt(t);
  // Shift the t slightly based on seed for neighboring color variation
  const offset = (Math.sin(seed * 3.7) * 0.06);
  return vineColorAt(Math.max(0, Math.min(1, t + offset)));
}

// ═══════════════════════════════════════════
// VINE DOTS (dots along the vine, color-matched)
// ═══════════════════════════════════════════
interface VineDotData { key: string; x: number; y: number; size: number; color: string; opacity: number }

function generateVineDots(containerHeight: number): VineDotData[] {
  const result: VineDotData[] = [];
  let id = 0;
  for (let y = 30; y <= containerHeight; y += 18 + Math.sin(y * 0.3) * 6) {
    const x = vineX(y);
    const side = Math.sin(y * 1.1) > 0 ? 1 : -1;
    const dist = 2 + Math.abs(Math.sin(y * 0.4)) * 5;
    const t = y / containerHeight;
    result.push({
      key: `dot-${id++}`,
      x: x + side * dist,
      y,
      size: 3 + Math.abs(Math.sin(y * 0.7)) * 3,
      color: vineColorVariant(t, y),
      opacity: 0.25 + Math.abs(Math.sin(y * 0.5)) * 0.3,
    });
  }
  return result;
}

const VineDot: React.FC<VineDotData> = ({ x, y, size, color, opacity }) => (
  <View
    pointerEvents="none"
    style={{
      position: 'absolute',
      left: Math.round(x) - size / 2,
      top: Math.round(y) - size / 2,
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color,
      opacity,
    }}
  />
);

// ═══════════════════════════════════════════
// ANIMATED LEAF (dense, lush, color-matched)
// ═══════════════════════════════════════════

interface LeafData { key: string; x: number; y: number; rotation: number; scale: number; delay: number; color: string }

function generateLeaves(containerHeight: number): LeafData[] {
  const result: LeafData[] = [];
  let id = 0;
  // Primary leaves — every ~30px along vine
  for (let y = 40; y <= containerHeight; y += 28 + Math.sin(y * 0.6) * 10) {
    const x = vineX(y);
    const t = y / containerHeight;
    const tangentX =
      Math.cos(y * FREQUENCY) * AMPLITUDE * FREQUENCY +
      Math.cos(y * FREQUENCY * 2.6) * (AMPLITUDE * 0.3) * FREQUENCY * 2.6;
    const side = Math.sin(y * 0.7) > 0 ? 1 : -1;
    const rot = (Math.atan2(1, tangentX) * 180) / Math.PI + side * 50 + Math.sin(y * 0.3) * 20;

    result.push({
      key: `leaf-${id++}`,
      x: x + side * 12,
      y,
      rotation: rot,
      scale: 0.5 + Math.sin(y * 0.2) * 0.2,
      delay: y * 0.003,
      color: vineColorVariant(t, y),
    });

    // Secondary leaf on opposite side (every other)
    if (Math.sin(y * 1.3) > 0.2) {
      result.push({
        key: `leaf-${id++}`,
        x: x - side * 10,
        y: y + 10,
        rotation: rot + 120,
        scale: 0.35 + Math.sin(y * 0.4) * 0.12,
        delay: y * 0.003 + 0.3,
        color: vineColorVariant(t, y + 50),
      });
    }

    // Occasional third tiny leaf cluster
    if (Math.sin(y * 2.1) > 0.6) {
      result.push({
        key: `leaf-${id++}`,
        x: x + side * 5,
        y: y - 8,
        rotation: rot - 60,
        scale: 0.25 + Math.sin(y * 0.8) * 0.08,
        delay: y * 0.003 + 0.5,
        color: vineColorVariant(t, y + 100),
      });
    }
  }
  return result;
}

const AnimatedLeaf: React.FC<LeafData> = ({ x, y, rotation, scale, delay, color }) => {
  const sway = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.loop(Animated.sequence([
          Animated.timing(sway, { toValue: 1, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(sway, { toValue: 0, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])),
        Animated.timing(fadeIn, { toValue: 1, duration: 700, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ]).start();
    }, delay * 250);
    return () => clearTimeout(t);
  }, []);

  const swayDeg = sway.interpolate({ inputRange: [0, 1], outputRange: ['-4deg', '4deg'] });
  const s = Math.max(scale, 0.25);
  const size = Math.round(14 * s);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: Math.round(x),
        top: Math.round(y),
        width: size,
        height: size * 1.4,
        borderTopLeftRadius: size,
        borderTopRightRadius: size,
        borderBottomLeftRadius: size * 0.2,
        borderBottomRightRadius: size,
        backgroundColor: color,
        opacity: fadeIn,
        transform: [{ rotate: swayDeg }, { rotate: `${rotation}deg` }, { scale: s }],
      }}
    />
  );
};

// ═══════════════════════════════════════════
// SHIMMER (pulse on current lesson hex)
// ═══════════════════════════════════════════
const Shimmer: React.FC<{ color: string }> = ({ color }) => {
  const anim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0.4, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: -6,
        left: -6,
        width: HEX_SIZE + 12,
        height: HEX_SIZE + 12,
        borderRadius: (HEX_SIZE + 12) * 0.32,
        borderWidth: 2.5,
        borderColor: color,
        opacity: anim,
      }}
    />
  );
};

// ═══════════════════════════════════════════
// HEX ICON NODE
// ═══════════════════════════════════════════
interface HexNodeProps {
  lesson: Lesson;
  yPos: number;
  status: 'completed' | 'current' | 'available';
  onPress: (lesson: Lesson) => void;
  animDelay: number;
}

const HexNode: React.FC<HexNodeProps> = ({ lesson, yPos, status, onPress, animDelay }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const accent = SECTION_ACCENT[lesson.sectionId] ?? SECTION_ACCENT.raices;
  const isCompleted = status === 'completed';
  const isCurrent = status === 'current';
  const xPos = vineX(yPos);

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, damping: 16, stiffness: 130, useNativeDriver: true }),
      ]).start();
    }, animDelay);
    return () => clearTimeout(t);
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.93, damping: 12, stiffness: 200, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, damping: 10, stiffness: 160, useNativeDriver: true }).start();
  };

  const hexBg = isCompleted ? accent.primary : isCurrent ? accent.primary : colors.creamDark;
  const hexBorderColor = isCompleted ? accent.dark : isCurrent ? accent.primary : colors.warmGrayLight;
  const iconColor = isCompleted || isCurrent ? colors.white : colors.warmGray;
  const titleColor = status === 'available' ? colors.warmGray : colors.charcoal;
  const subtitleColor = status === 'available' ? colors.warmGrayLight : colors.warmGray;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: yPos - HEX_SIZE / 2,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        opacity: fadeAnim,
        transform: [{ translateX: slideAnim }, { scale: scaleAnim }],
        zIndex: isCurrent ? 20 : 10,
      }}
    >
      <Pressable
        onPress={() => onPress(lesson)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={nodeStyles.pressable}
      >
        {/* Hex icon */}
        <View style={[nodeStyles.hexOuter, { left: xPos - HEX_SIZE / 2 }]}>
          {isCurrent && <Shimmer color={accent.primary} />}
          <View
            style={[
              nodeStyles.hex,
              {
                backgroundColor: hexBg,
                borderColor: hexBorderColor,
                borderWidth: isCurrent ? 2.5 : isCompleted ? 0 : 1.5,
              },
              !isCompleted && !isCurrent && { backgroundColor: colors.creamLight },
              Platform.select({
                ios: {
                  shadowColor: isCompleted || isCurrent ? accent.primary : 'transparent',
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: isCurrent ? 0.35 : isCompleted ? 0.2 : 0,
                  shadowRadius: isCurrent ? 10 : 6,
                },
                android: { elevation: isCurrent ? 8 : isCompleted ? 4 : 1 },
              }),
            ]}
          >
            {/* Lesson icon (section-based) */}
            {(LESSON_ICON[lesson.id] ?? DEFAULT_ICON)({ size: 22, color: iconColor })}

            {/* Completed checkmark overlay */}
            {isCompleted && (
              <View style={nodeStyles.checkOverlay}>
                <Text style={nodeStyles.checkText}>✓</Text>
              </View>
            )}
          </View>
        </View>

        {/* Text content — always right of the hex area */}
        <View style={[nodeStyles.textContainer, { marginLeft: xPos + HEX_SIZE / 2 + 16 }]}>
          <Text style={[nodeStyles.title, { color: titleColor }]} numberOfLines={1}>
            {lesson.title}
          </Text>
          <Text style={[nodeStyles.subtitle, { color: subtitleColor }]} numberOfLines={1}>
            {lesson.subtitle}
          </Text>
          {isCurrent && (
            <View style={[nodeStyles.continueBadge, { backgroundColor: accent.primary + '15' }]}>
              <Text style={[nodeStyles.continueText, { color: accent.primary }]}>CONTINUAR</Text>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};

const nodeStyles = StyleSheet.create({
  pressable: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  hexOuter: {
    position: 'absolute',
    width: HEX_SIZE,
    height: HEX_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hex: {
    width: HEX_SIZE,
    height: HEX_SIZE,
    borderRadius: HEX_SIZE * 0.3,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '0deg' }],
  },
  checkOverlay: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.marigold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.cream,
  },
  checkText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '700',
  },
  textContainer: {
    flex: 1,
    paddingRight: 20,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    marginTop: 2,
  },
  continueBadge: {
    marginTop: 6,
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  continueText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 1,
  },
});


// ═══════════════════════════════════════════
// PROGRESS BAR
// ═══════════════════════════════════════════
const ProgressBar: React.FC<{ progress: number }> = ({ progress: pct }) => {
  const width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(width, {
      toValue: pct,
      duration: 1000,
      delay: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [pct]);

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
export default function LessonsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const scrollRef = useRef<ScrollView>(null);

  const [progress, setProgress] = useState<LessonProgress>({
    completedLessons: [],
    lastViewedLessonId: null,
  });
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const sheetAnim = useRef(new Animated.Value(SCREEN_H)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  const { items: nodeItems, totalHeight: containerHeight } = useMemo(() => buildNodeList(), []);
  const leafData = useMemo(() => generateLeaves(containerHeight), [containerHeight]);
  const dotData = useMemo(() => generateVineDots(containerHeight), [containerHeight]);

  const completedCount = progress.completedLessons.length;
  const progressPct = completedCount / lessons.length;

  const currentLessonIndex = useMemo(() => {
    const idx = lessons.findIndex((l) => !progress.completedLessons.includes(l.id));
    return idx >= 0 ? idx : lessons.length - 1;
  }, [progress.completedLessons]);

  useFocusEffect(
    useCallback(() => {
      getProgress().then((p) => {
        setProgress(p);
        const target = p.lastViewedLessonId
          ? lessons.findIndex((l) => l.id === p.lastViewedLessonId)
          : lessons.findIndex((l) => !p.completedLessons.includes(l.id));
        if (target > 0 && scrollRef.current) {
          // find the y position from our items list
          const lessonItem = nodeItems.find((item) => item.type === 'lesson' && item.index === target);
          if (lessonItem) {
            setTimeout(() => {
              scrollRef.current?.scrollTo({ y: lessonItem.y - 180, animated: true });
            }, 500);
          }
        }
      });
      dismissSheet();
    }, []),
  );

  const getStatus = (lesson: Lesson): 'completed' | 'current' | 'available' => {
    if (progress.completedLessons.includes(lesson.id)) return 'completed';
    const idx = lessons.indexOf(lesson);
    if (idx === currentLessonIndex) return 'current';
    return 'available';
  };

  const showSheet = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setSheetVisible(true);
    // Reset positions before animating in
    sheetAnim.setValue(SCREEN_H);
    overlayAnim.setValue(0);
    requestAnimationFrame(() => {
      Animated.parallel([
        Animated.spring(sheetAnim, { toValue: 0, friction: 9, tension: 50, useNativeDriver: true }),
        Animated.timing(overlayAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    });
  };

  const dismissSheet = () => {
    Animated.parallel([
      Animated.timing(sheetAnim, { toValue: SCREEN_H, duration: 250, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setSheetVisible(false);
      setSelectedLesson(null);
    });
  };

  const selectedAccent = selectedLesson
    ? (SECTION_ACCENT[selectedLesson.sectionId] ?? SECTION_ACCENT.raices)
    : SECTION_ACCENT.raices;

  let animIdx = 0;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Scrollable vine area */}
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={{ height: containerHeight }}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
        {/* Vine SVG */}
        <VinePath containerHeight={containerHeight} />

        {/* Green dots along the vine */}
        {dotData.map(({ key, ...dot }) => (
          <VineDot key={key} {...dot} />
        ))}

        {/* Lush decorative leaves */}
        {leafData.map(({ key, ...lp }) => (
          <AnimatedLeaf key={key} {...lp} />
        ))}

        {/* Render nodes */}
        {nodeItems.map((item, i) => {
          if (item.type !== 'lesson') return null;
          return (
            <HexNode
              key={item.lesson.id}
              lesson={item.lesson}
              yPos={item.y}
              status={getStatus(item.lesson)}
              onPress={showSheet}
              animDelay={200 + animIdx++ * 60}
            />
          );
        })}

        {/* Bottom message */}
        <View style={[styles.bottomMsg, { top: containerHeight - 80 }]}>
          <Text style={styles.bottomMsgText}>Mas lecciones pronto...</Text>
        </View>
      </ScrollView>

      {/* Fixed header */}
      <LinearGradient
        colors={[colors.cream, colors.cream + 'EE', colors.cream + '00']}
        style={[styles.header, { paddingTop: insets.top }]}
        pointerEvents="box-none"
      >
        <View style={styles.headerInner}>
          <View style={styles.headerTop}>
            <View style={{ width: 40 }} />
            <Text style={styles.headerTitle}>Lessons</Text>
            <View style={{ width: 40 }} />
          </View>

          <ProgressBar progress={progressPct} />
          
        </View>
        <Text style={styles.progressLabel}>
            {completedCount} of {lessons.length} complete
          </Text>
      </LinearGradient>

      {/* Bottom sheet modal */}
      <Modal visible={sheetVisible} transparent animationType="none" statusBarTranslucent>
        <View style={styles.modalRoot}>
          {/* Overlay */}
          <Animated.View
            style={[styles.overlay, { opacity: overlayAnim }]}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={dismissSheet} />
          </Animated.View>

          {/* Sheet */}
          <Animated.View
            style={[
              styles.sheet,
              { paddingBottom: Math.max(insets.bottom, 20) },
              { transform: [{ translateY: sheetAnim }] },
            ]}
          >
            <View style={styles.sheetHandle} />
            <View style={[styles.sheetAccent, { backgroundColor: selectedAccent.primary }]} />

            {selectedLesson && (
              <>
                <View style={styles.sheetHeader}>
                  <View style={[styles.sheetHex, { backgroundColor: selectedAccent.primary }]}>
                    {(LESSON_ICON[selectedLesson.id] ?? DEFAULT_ICON)({ size: 26, color: colors.white })}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sheetTitle}>{selectedLesson.title}</Text>
                    <Text style={styles.sheetSubtitle}>{selectedLesson.subtitle}</Text>
                  </View>
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.startBtn,
                    { backgroundColor: selectedAccent.primary },
                    pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                  ]}
                  onPress={() => {
                    dismissSheet();
                    navigation.navigate('LessonDetail', { lessonId: selectedLesson.id });
                  }}
                >
                  <Text style={styles.startBtnText}>Start Lesson</Text>
                  <ChevronRightIcon size={16} color={colors.white} />
                </Pressable>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>

    </View>
  );
}

// ═══════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
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
    paddingHorizontal: spacing.lg,
    paddingBottom: 28,
    zIndex: 100,
  },
  headerInner: {
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
    paddingTop: 20,
    backgroundColor: colors.cream,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fonts.serif,
    fontSize: 28,
    color: colors.charcoal,
  },

  // ── Progress ──
  progressTrack: {
    height: 5,
    backgroundColor: colors.creamDark,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.full,
    backgroundColor: colors.teal,
  },
  progressLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.warmGray,
    marginTop: 4,
    textAlign: 'right',
  },

  // ── Bottom ──
  bottomMsg: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bottomMsgText: {
    fontFamily: fonts.serifItalic,
    fontSize: 14,
    color: colors.warmGray,
    letterSpacing: 1,
  },

  // ── Modal + sheet ──
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(42,35,32,0.3)',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.xl,
    paddingTop: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.charcoal,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: { elevation: 20 },
    }),
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.creamDark,
    alignSelf: 'center',
    marginBottom: 18,
  },
  sheetAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: spacing.lg,
  },
  sheetHex: {
    width: 52,
    height: 52,
    borderRadius: 52 * 0.3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    fontFamily: fonts.serif,
    fontSize: 24,
    color: colors.charcoal,
  },
  sheetSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.warmGray,
    marginTop: 2,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.full,
    paddingVertical: 16,
    gap: 6,
    marginBottom: 10,
  },
  startBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.white,
    letterSpacing: 0.3,
  },
});
