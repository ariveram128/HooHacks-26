import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  Pressable,
} from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
} from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, fonts, spacing, radii } from '../theme';
import { lessons, sections, Lesson } from '../data/lessons';
import { getProgress, LessonProgress } from '../store/lessonProgress';
import BottomNav from '../components/BottomNav';
import { ChevronLeftIcon, ChevronRightIcon, BookIcon, NotesIcon, ChatIcon, GamepadIcon, MicIcon, UsersIcon, PlayIcon, CheckCircleIcon } from '../components/Icons';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const { width: _dimW, height: _dimH } = Dimensions.get('window');
const SCREEN_W = _dimW || (typeof window !== 'undefined' ? window.innerWidth : 375);
const SCREEN_H = _dimH || (typeof window !== 'undefined' ? window.innerHeight : 812);

// ═══════════════════════════════════════════
// VINE MATH
// ═══════════════════════════════════════════
const VINE_CENTER_X = SCREEN_W / 2;
const AMPLITUDE = SCREEN_W * 0.14;
const FREQUENCY = 0.0038;
const NODE_SPACING = 155;
const TOP_PADDING = 160;
const CARD_W = 200;
const CARD_MARGIN = 10;

function vineX(y: number): number {
  return (
    VINE_CENTER_X +
    Math.sin(y * FREQUENCY) * AMPLITUDE +
    Math.sin(y * FREQUENCY * 2.3) * (AMPLITUDE * 0.25)
  );
}

function nodeY(index: number): number {
  return TOP_PADDING + index * NODE_SPACING;
}

// ═══════════════════════════════════════════
// SECTION ACCENTS
// ═══════════════════════════════════════════
const SECTION_ACCENT: Record<string, { border: string; bg: string; iconBg: string }> = {
  raices: { border: colors.teal, bg: colors.teal, iconBg: colors.tealDark },
  brotes: { border: colors.tealLight, bg: colors.tealLight, iconBg: colors.teal },
  ramas: { border: colors.terracotta, bg: colors.terracotta, iconBg: colors.terracottaDark },
  copa: { border: colors.marigold, bg: colors.marigold, iconBg: colors.marigoldDark },
};

const LEAF_COLORS = [colors.teal, colors.tealLight, colors.tealDark, '#2A8B7A', '#3A9B8A'];

// ═══════════════════════════════════════════
// ANIMATED LEAF (pure View, no SVG)
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

const AnimatedLeaf: React.FC<LeafProps> = ({ x, y, rotation, scale, delay, color }) => {
  const sway = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.loop(
          Animated.sequence([
            Animated.timing(sway, { toValue: 1, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            Animated.timing(sway, { toValue: 0, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          ]),
        ),
        Animated.timing(fadeIn, { toValue: 1, duration: 700, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ]).start();
    }, delay * 250);
    return () => clearTimeout(timeout);
  }, []);

  const swayDeg = sway.interpolate({ inputRange: [0, 1], outputRange: ['-4deg', '4deg'] });
  const s = Math.max(scale, 0.3);
  const size = Math.round(14 * s);
  const rotDeg = `${Math.round(rotation)}deg`;

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
        transform: [
          { rotate: swayDeg },
          { rotate: rotDeg },
          { scale: s },
        ],
      }}
    />
  );
};

// ═══════════════════════════════════════════
// WARM PARTICLE (replaces firefly)
// ═══════════════════════════════════════════
const WarmParticle: React.FC<{ delay: number; maxY: number }> = ({ delay, maxY }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const startX = useRef(Math.random() * SCREEN_W).current;
  const startY = useRef(100 + Math.random() * Math.min(maxY, SCREEN_H * 2)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(opacity, { toValue: 0.5, duration: 2000, useNativeDriver: true }),
            Animated.timing(translateX, { toValue: 20 - Math.random() * 40, duration: 5000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            Animated.timing(translateY, { toValue: -30 - Math.random() * 30, duration: 5000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(opacity, { toValue: 0, duration: 2000, useNativeDriver: true }),
            Animated.timing(translateX, { toValue: 0, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          ]),
        ]),
      ).start();
    }, delay * 1500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: startX,
        top: startY,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.marigoldLight,
        opacity,
        transform: [{ translateX }, { translateY }],
        ...Platform.select({
          ios: {
            shadowColor: colors.marigold,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.4,
            shadowRadius: 4,
          },
          android: { elevation: 2 },
        }),
      }}
    />
  );
};

// ═══════════════════════════════════════════
// VINE PATH (SVG)
// ═══════════════════════════════════════════
const VinePath: React.FC<{ containerHeight: number }> = ({ containerHeight }) => {
  if (containerHeight <= 0) return null;

  const safeH = Math.round(containerHeight);
  const points: string[] = [];
  for (let y = -50; y <= safeH + 50; y += 4) {
    const x = vineX(y);
    points.push(`${y === -50 ? 'M' : 'L'}${Math.round(x)},${y}`);
  }
  const pathD = points.join(' ');

  return (
    <Svg
      width={SCREEN_W}
      height={safeH}
      style={{ position: 'absolute', top: 0, left: 0 }}
      pointerEvents="none"
    >
      <Defs>
        <SvgGradient id="vineGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={colors.tealLight} />
          <Stop offset="50%" stopColor={colors.teal} />
          <Stop offset="100%" stopColor={colors.tealDark} />
        </SvgGradient>
      </Defs>

      {/* Shadow */}
      <Path d={pathD} fill="none" stroke="rgba(26,107,94,0.12)" strokeWidth={8} strokeLinecap="round" />
      {/* Main vine */}
      <Path d={pathD} fill="none" stroke="url(#vineGrad)" strokeWidth={5} strokeLinecap="round" />
      {/* Highlight */}
      <Path d={pathD} fill="none" stroke={colors.tealLight} strokeWidth={1.5} strokeLinecap="round" opacity={0.25} />
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
  const result: LeafData[] = [];
  let id = 0;
  for (let y = 40; y <= containerHeight; y += 35 + Math.sin(y) * 15) {
    const x = vineX(y);
    const tangentX =
      Math.cos(y * FREQUENCY) * AMPLITUDE * FREQUENCY +
      Math.cos(y * FREQUENCY * 2.3) * (AMPLITUDE * 0.25) * FREQUENCY * 2.3;
    const side = Math.sin(y * 0.7) > 0 ? 1 : -1;
    const rot = (Math.atan2(1, tangentX) * 180) / Math.PI + side * 50 + Math.sin(y * 0.3) * 20;

    result.push({
      key: `leaf-${id++}`,
      x: x + side * 16,
      y,
      rotation: rot,
      scale: 0.55 + Math.sin(y * 0.2) * 0.2,
      delay: y * 0.003,
      variant: 0,
      color: LEAF_COLORS[Math.floor(y * 0.07) % LEAF_COLORS.length],
    });

    if (Math.sin(y * 1.3) > 0.3) {
      result.push({
        key: `leaf-${id++}`,
        x: x - side * 12,
        y: y + 12,
        rotation: rot + 120,
        scale: 0.35 + Math.sin(y * 0.4) * 0.12,
        delay: y * 0.003 + 0.3,
        variant: 0,
        color: LEAF_COLORS[(Math.floor(y * 0.07) + 2) % LEAF_COLORS.length],
      });
    }
  }
  return result;
}

// ═══════════════════════════════════════════
// SHIMMER (pulse on current lesson)
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
        backgroundColor: 'rgba(194,85,58,0.06)',
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
  status: 'completed' | 'current' | 'available';
  onPress: (lesson: Lesson) => void;
}

const SECTION_ICON: Record<string, (props: { size: number; color: string }) => React.ReactNode> = {
  raices: (p) => <BookIcon {...p} />,
  brotes: (p) => <NotesIcon {...p} />,
  ramas: (p) => <ChatIcon {...p} />,
  copa: (p) => <GamepadIcon {...p} />,
};

const ICON: Record<string, (props: { size: number; color: string }) => React.ReactNode> = {
  // Raíces
  alfabeto: (p) => <BookIcon {...p} />,
  numeros: (p) => <GamepadIcon {...p} />,
  pronunciacion: (p) => <MicIcon {...p} />,
  saludos: (p) => <ChatIcon {...p} />,
  presentaciones: (p) => <UsersIcon {...p} />,
  // Brotes
  articulos: (p) => <NotesIcon {...p} />,
  sustantivos: (p) => <BookIcon {...p} />,
  pronombres: (p) => <UsersIcon {...p} />,
  'ser-estar': (p) => <CheckCircleIcon {...p} />,
  'presente-regular': (p) => <PlayIcon {...p} />,
  // Ramas
  'presente-irregular': (p) => <GamepadIcon {...p} />,
  preguntas: (p) => <ChatIcon {...p} />,
  adjetivos: (p) => <NotesIcon {...p} />,
  preterito: (p) => <BookIcon {...p} />,
  imperfecto: (p) => <BookIcon {...p} />,
  // Copa
  futuro: (p) => <PlayIcon {...p} />,
  subjuntivo: (p) => <ChatIcon {...p} />,
  condicional: (p) => <GamepadIcon {...p} />,
  'por-para': (p) => <CheckCircleIcon {...p} />,
  expresiones: (p) => <MicIcon {...p} />,
};

const LessonNode: React.FC<LessonNodeProps> = ({ lesson, index, status, onPress }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const yPos = nodeY(index);
  const xVine = vineX(yPos);
  const side = index % 2 === 0 ? 1 : -1;
  const rawLeft = xVine + side * 80 - CARD_W / 2;
  const nodeLeft = Math.max(CARD_MARGIN, Math.min(rawLeft, SCREEN_W - CARD_W - CARD_MARGIN));

  const accent = SECTION_ACCENT[lesson.sectionId] ?? SECTION_ACCENT.raices;
  const isCompleted = status === 'completed';
  const isCurrent = status === 'current';

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 500, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }),
      ]).start();
    }, 200 + index * 100);
    return () => clearTimeout(timeout);
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.94, friction: 8, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }).start();
  };

  const borderColor = isCurrent ? colors.terracotta : isCompleted ? accent.bg : colors.creamDark;
  const dotColor = isCurrent ? colors.terracotta : isCompleted ? accent.bg : colors.warmGrayLight;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: yPos - 40,
        left: nodeLeft,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        zIndex: 10,
      }}
    >
      {/* Dashed connector */}
      <View
        style={{
          position: 'absolute',
          top: '50%',
          left: side > 0 ? -42 : undefined,
          right: side < 0 ? -42 : undefined,
          width: 36,
          height: 1,
          borderStyle: 'dashed',
          borderBottomWidth: 1.5,
          borderColor: isCompleted || isCurrent
            ? accent.bg + '55'
            : colors.warmGrayLight + '55',
        }}
      />

      {/* Connector dot on vine */}
      <View
        style={{
          position: 'absolute',
          top: '48%',
          left: side > 0 ? -14 : undefined,
          right: side < 0 ? -14 : undefined,
          width: 9,
          height: 9,
          borderRadius: 4.5,
          backgroundColor: dotColor,
          ...Platform.select({
            ios: {
              shadowColor: dotColor,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: isCurrent ? 0.6 : 0.3,
              shadowRadius: isCurrent ? 6 : 3,
            },
            android: { elevation: 3 },
          }),
        }}
      />

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onPress(lesson)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View
          style={[
            styles.card,
            {
              borderColor,
              borderWidth: isCurrent ? 2 : 1.5,
              opacity: status === 'available' ? 0.75 : 1,
            },
            Platform.select({
              ios: {
                shadowColor: isCurrent ? colors.terracotta : colors.charcoal,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: isCurrent ? 0.2 : 0.08,
                shadowRadius: isCurrent ? 10 : 6,
              },
              android: { elevation: isCurrent ? 8 : 3 },
            }),
          ]}
        >
          {isCurrent && <Shimmer />}

          <View style={styles.cardRow}>
            {/* Icon */}
            <View style={[styles.iconBox, { backgroundColor: accent.iconBg + '20' }]}>
              {(ICON[lesson.id] ?? SECTION_ICON.raices)({ size: 22, color: accent.bg })}
            </View>

            {/* Text */}
            <View style={styles.cardTextWrap}>
              <Text style={styles.cardTitle} numberOfLines={1}>{lesson.title}</Text>
              <Text style={styles.cardSubtitle} numberOfLines={1}>{lesson.subtitle}</Text>
              {isCurrent && (
                <View style={[styles.continueBadge, { backgroundColor: colors.terracotta + '15' }]}>
                  <Text style={[styles.continueText, { color: colors.terracotta }]}>NEXT LESSON</Text>
                </View>
              )}
            </View>
          </View>

          {/* Completed checkmark */}
          {isCompleted && (
            <View style={[styles.checkBadge, { backgroundColor: colors.marigold }]}>
              <Text style={styles.checkText}>✓</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

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

  const sheetAnim = useRef(new Animated.Value(SCREEN_H)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  const containerHeight = lessons.length * NODE_SPACING + TOP_PADDING + 200;
  const leafData = useMemo(() => generateLeaves(containerHeight), [containerHeight]);

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
          setTimeout(() => {
            scrollRef.current?.scrollTo({ y: nodeY(target) - SCREEN_H * 0.35, animated: true });
          }, 500);
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
    Animated.parallel([
      Animated.spring(sheetAnim, { toValue: 0, friction: 9, tension: 50, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  };

  const dismissSheet = () => {
    Animated.parallel([
      Animated.timing(sheetAnim, { toValue: SCREEN_H, duration: 250, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setSelectedLesson(null));
  };

  const selectedAccent = selectedLesson
    ? (SECTION_ACCENT[selectedLesson.sectionId] ?? SECTION_ACCENT.raices)
    : SECTION_ACCENT.raices;
  const selectedSection = selectedLesson
    ? sections.find((s) => s.id === selectedLesson.sectionId)
    : null;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Scrollable vine area */}
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={{ height: containerHeight }}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* Vine SVG */}
        <VinePath containerHeight={containerHeight} />

        {/* Animated decorative leaves */}
        {leafData.map(({ key, ...leafProps }) => (
          <AnimatedLeaf key={key} {...leafProps} />
        ))}

        {/* Warm particles */}
        {Array.from({ length: 6 }).map((_, i) => (
          <WarmParticle key={`particle-${i}`} delay={i} maxY={containerHeight} />
        ))}

        {/* Lesson nodes */}
        {lessons.map((lesson, i) => (
          <LessonNode
            key={lesson.id}
            lesson={lesson}
            index={i}
            status={getStatus(lesson)}
            onPress={showSheet}
          />
        ))}

        {/* Bottom message */}
        <View style={[styles.bottomMsg, { top: containerHeight - 80 }]}>
          <Text style={styles.bottomMsgText}>Más lecciones pronto...</Text>
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
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
              <ChevronLeftIcon size={22} color={colors.charcoal} />
            </Pressable>
            <Text style={styles.headerTitle}>Lessons</Text>
            <View style={{ width: 40 }} />
          </View>

          <ProgressBar progress={progressPct} />
          <Text style={styles.progressLabel}>
            {completedCount} of {lessons.length} lessons complete
          </Text>
        </View>
      </LinearGradient>

      {/* Bottom sheet overlay */}
      <Animated.View
        style={[styles.overlay, { opacity: overlayAnim }]}
        pointerEvents={selectedLesson ? 'auto' : 'none'}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={dismissSheet} />
      </Animated.View>

      {/* Bottom sheet */}
      <Animated.View
        style={[
          styles.sheet,
          { paddingBottom: Math.max(insets.bottom, 20) },
          { transform: [{ translateY: sheetAnim }] },
        ]}
        pointerEvents={selectedLesson ? 'auto' : 'none'}
      >
        <View style={styles.sheetHandle} />
        <View style={[styles.sheetAccent, { backgroundColor: selectedAccent.bg }]} />

        {selectedLesson && (
          <>
            <View style={styles.sheetHeader}>
              <View style={[styles.sheetIconBox, { backgroundColor: selectedAccent.iconBg + '20' }]}>
                {(ICON[selectedLesson.id] ?? SECTION_ICON.raices)({ size: 26, color: selectedAccent.bg })}
              </View>
              <View style={{ flex: 1 }}>
                {selectedSection && (
                  <View style={[styles.sheetBadge, { backgroundColor: selectedAccent.bg + '18' }]}>
                    <Text style={[styles.sheetBadgeText, { color: selectedAccent.bg }]}>
                      {selectedSection.title}
                    </Text>
                  </View>
                )}
                <Text style={styles.sheetTitle}>{selectedLesson.title}</Text>
                <Text style={styles.sheetSubtitle}>{selectedLesson.subtitle}</Text>
              </View>
            </View>

            <Pressable
              style={[styles.startBtn, { backgroundColor: selectedAccent.bg }]}
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

      <View style={styles.bottomNavWrap}>
        <BottomNav
          activeTab="learn"
          onTabPress={(tabId) => {
            if (tabId === 'home') navigation.navigate('Home');
            else if (tabId === 'chat' || tabId === 'practice') navigation.navigate('DillowChat');
          }}
        />
      </View>
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

  // ── Card ──
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 14,
    paddingHorizontal: 16,
    width: CARD_W,
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextWrap: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.charcoal,
  },
  cardSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.warmGray,
    marginTop: 1,
  },
  continueBadge: {
    marginTop: 5,
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  continueText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 0.8,
  },
  checkBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  checkText: {
    fontSize: 11,
    color: colors.white,
    fontWeight: '700',
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

  // ── Overlay + sheet ──
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(42,35,32,0.3)',
    zIndex: 50,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.xl,
    paddingTop: 14,
    zIndex: 100,
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
  sheetIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetBadge: {
    alignSelf: 'flex-start',
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginBottom: 4,
  },
  sheetBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
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
  bottomNavWrap: {
    zIndex: 15,
  },
});
