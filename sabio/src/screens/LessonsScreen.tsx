import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  LayoutChangeEvent,
  Animated,
  Dimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radii } from '../theme';

const STORAGE_KEY_LAST_LESSON = '@sabio:lastLessonId';

/* ─── Level color mapping ─── */
const levelColors: Record<string, { accent: string; bg: string; text: string; border: string }> = {
  Foundations: {
    accent: colors.teal,
    bg: 'rgba(26,107,94,0.06)',
    text: colors.teal,
    border: 'rgba(26,107,94,0.18)',
  },
  Beginner: {
    accent: colors.marigold,
    bg: 'rgba(232,168,56,0.06)',
    text: colors.marigoldDark,
    border: 'rgba(232,168,56,0.18)',
  },
  Intermediate: {
    accent: colors.terracotta,
    bg: 'rgba(194,85,58,0.06)',
    text: colors.terracotta,
    border: 'rgba(194,85,58,0.18)',
  },
  Advanced: {
    accent: colors.charcoal,
    bg: 'rgba(42,35,32,0.05)',
    text: colors.charcoal,
    border: 'rgba(42,35,32,0.14)',
  },
};

type Lesson = {
  id: string;
  title: string;
  subtitle: string;
  level: string;
};

const lessons: Lesson[] = [
  { id: 'alphabet', title: 'Alphabet', subtitle: 'A–Z in Spanish', level: 'Foundations' },
  { id: 'numbers', title: 'Numbers', subtitle: 'Count from 0 to 100', level: 'Foundations' },
  { id: 'pronunciation', title: 'Pronunciation', subtitle: 'Sound like a native', level: 'Foundations' },
  { id: 'basic-conversation', title: 'Basic Conversation', subtitle: 'Your first exchange', level: 'Foundations' },
  { id: 'greetings', title: 'Greetings', subtitle: 'Hello, goodbye & more', level: 'Beginner' },
  { id: 'common-verbs', title: 'Common Verbs', subtitle: 'Essential action words', level: 'Beginner' },
  { id: 'present-tense', title: 'Present Tense', subtitle: 'Talk about right now', level: 'Beginner' },
  { id: 'questions', title: 'Asking Questions', subtitle: 'Who, what, where, why', level: 'Beginner' },
  { id: 'daily-routine', title: 'Daily Routine', subtitle: 'Describe your day', level: 'Beginner' },
  { id: 'food-and-ordering', title: 'Food & Ordering', subtitle: 'At the restaurant', level: 'Intermediate' },
  { id: 'travel', title: 'Travel & Directions', subtitle: 'Navigate with ease', level: 'Intermediate' },
  { id: 'past-tense', title: 'Past Tense', subtitle: 'Talk about yesterday', level: 'Intermediate' },
  { id: 'future-tense', title: 'Future Plans', subtitle: 'What comes next', level: 'Intermediate' },
  { id: 'opinions', title: 'Opinions', subtitle: 'Share what you think', level: 'Intermediate' },
  { id: 'subjunctive-intro', title: 'Subjunctive', subtitle: 'Wishes & possibilities', level: 'Advanced' },
  { id: 'connectors', title: 'Complex Sentences', subtitle: 'Link your ideas', level: 'Advanced' },
  { id: 'idioms', title: 'Idioms', subtitle: 'Speak naturally', level: 'Advanced' },
  { id: 'storytelling', title: 'Storytelling', subtitle: 'Narrate with flair', level: 'Advanced' },
];

/* ─── Small leaf SVG icon ─── */
function LeafIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2-9.05 2.2"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2 21.5c2-2.5 4-6 6-8.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/* ─── Vine node (dot on the stem) ─── */
function VineNode({ color }: { color: string }) {
  return (
    <View style={styles.vineNodeOuter}>
      <View style={[styles.vineNode, { backgroundColor: colors.darkGreen }]} />
    </View>
  );
}

/* ─── Section header between level groups ─── */
function LevelHeader({ level }: { level: string }) {
  const lc = levelColors[level] ?? levelColors.Foundations;
  return (
    <View style={styles.levelHeader}>
      <View style={[styles.levelBadge, { backgroundColor: lc.accent }]}>
        <LeafIcon color={colors.white} size={14} />
        <Text style={styles.levelBadgeText}>{level}</Text>
      </View>
    </View>
  );
}

/* ─── Individual leaf card ─── */
type LeafCardProps = {
  lesson: Lesson;
  index: number;
  side: 'left' | 'right';
  isSelected: boolean;
  onSelect: (id: string) => void;
  onStart: (id: string) => void;
  onLayout: (id: string, y: number) => void;
};

function LeafCard({ lesson, index, side, isSelected, onSelect, onStart, onLayout }: LeafCardProps) {
  const isLeft = side === 'left';
  const lc = levelColors[lesson.level] ?? levelColors.Foundations;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const expandAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(expandAnim, {
      toValue: isSelected ? 1 : 0,
      friction: 8,
      tension: 80,
      useNativeDriver: false,
    }).start();
  }, [isSelected]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    onLayout(lesson.id, event.nativeEvent.layout.y);
  };

  const buttonHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 44],
  });

  const buttonOpacity = expandAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <View onLayout={handleLayout} style={styles.leafRow}>
      {/* Vine node */}
      <View style={[styles.vineNodePosition, isLeft ? styles.nodeFromLeft : styles.nodeFromRight]}>
        <VineNode color={lc.accent} />
      </View>

      {/* Lesson card */}
      <Animated.View
        style={[
          styles.leafCard,
          isLeft ? styles.leafCardLeft : styles.leafCardRight,
          {
            borderColor: isSelected ? lc.accent : lc.border,
            backgroundColor: isSelected ? lc.bg : colors.creamLight,
            transform: [{ scale: scaleAnim }],
          },
          isSelected && {
            shadowColor: lc.accent,
            shadowOpacity: 0.15,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 6 },
            elevation: 6,
          },
        ]}
      >
        <Pressable
          onPress={() => onSelect(lesson.id)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.leafCardInner}
        >
          <View style={styles.lessonContent}>
            <Text style={styles.lessonTitle}>{lesson.title}</Text>
            <Text style={[styles.lessonSubtitle, { color: isSelected ? lc.text : colors.warmGray }]}>
              {lesson.subtitle}
            </Text>
          </View>
        </Pressable>

        {/* Expandable "Do lesson" button */}
        <Animated.View style={[styles.startSection, { height: buttonHeight, opacity: buttonOpacity }]}>
          <Pressable
            onPress={() => onStart(lesson.id)}
            style={({ pressed }) => [
              styles.startButton,
              { backgroundColor: lc.accent },
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
          >
            <Text style={styles.startButtonText}>Start lesson</Text>
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Path
                d="M5 12h14M12 5l7 7-7 7"
                stroke={colors.white}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
}


/* ─── Main screen ─── */
export default function LessonsScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView | null>(null);
  const hasAutoScrolled = useRef(false);

  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [lastLessonId, setLastLessonId] = useState<string | null>(null);
  const [leafPositions, setLeafPositions] = useState<Record<string, number>>({});

  useEffect(() => {
    let mounted = true;
    const loadLastLesson = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY_LAST_LESSON);
        if (!mounted || !stored) return;
        setLastLessonId(stored);
        setSelectedLessonId(stored);
      } catch {
        // Ignore storage read failures.
      }
    };
    loadLastLesson();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!lastLessonId || hasAutoScrolled.current) return;
    const targetY = leafPositions[lastLessonId];
    if (typeof targetY !== 'number') return;
    scrollRef.current?.scrollTo({ y: Math.max(0, targetY - 18), animated: false });
    hasAutoScrolled.current = true;
  }, [lastLessonId, leafPositions]);

  const lessonLeaves = useMemo(
    () =>
      lessons.map((lesson, index) => ({
        lesson,
        index,
        side: (index % 2 === 0 ? 'left' : 'right') as 'left' | 'right',
      })),
    [],
  );

  // Group lessons by level to insert headers
  const groupedItems = useMemo(() => {
    const items: Array<
      | { type: 'header'; level: string }
      | { type: 'leaf'; lesson: Lesson; index: number; side: 'left' | 'right' }
    > = [];
    let currentLevel = '';
    lessonLeaves.forEach(({ lesson, index, side }) => {
      if (lesson.level !== currentLevel) {
        currentLevel = lesson.level;
        items.push({ type: 'header', level: currentLevel });
      }
      items.push({ type: 'leaf', lesson, index, side });
    });
    return items;
  }, [lessonLeaves]);

  const handleLeafLayout = (id: string, y: number) => {
    setLeafPositions((prev) => {
      if (prev[id] === y) return prev;
      return { ...prev, [id]: y };
    });
  };

  const handleStartLesson = async (lessonId: string) => {
    setLastLessonId(lessonId);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_LAST_LESSON, lessonId);
    } catch {
      // Ignore storage write failures.
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 118 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Lighter top band — title lives here */}
        <View style={[styles.soilTop, { paddingTop: insets.top + 20 }]}>
          <Text style={styles.soilTitle}>Lessons</Text>
        </View>

        {/* Darker bottom band — subtitle */}
        <View style={styles.soilBottom}>
          <Text style={styles.soilSubtitle}>Scroll to grow your Spanish</Text>
        </View>

        {/* SVG curved transition from dark soil to cream */}
        <Svg
          width={Dimensions.get('window').width}
          height={30}
          viewBox={`0 0 ${Dimensions.get('window').width} 30`}
          style={styles.soilCurveSvg}
        >
          <Path
            d={`M0 0 L0 0 Q${Dimensions.get('window').width / 2} 30 ${Dimensions.get('window').width} 0 L${Dimensions.get('window').width} 0 Z`}
            fill="#4A3228"
          />
        </Svg>

        {/* Vine area */}
        <View style={[styles.vineArea, styles.scrollContentPadding]}>
          {/* Central vine stem */}
          <View style={styles.vineStem} />
          <View style={styles.vineStemGlow} />

          {/* Lessons with level headers */}
          {groupedItems.map((item) => {
            if (item.type === 'header') {
              return <LevelHeader key={`header-${item.level}`} level={item.level} />;
            }
            return (
              <LeafCard
                key={item.lesson.id}
                lesson={item.lesson}
                index={item.index}
                side={item.side}
                isSelected={selectedLessonId === item.lesson.id}
                onSelect={setSelectedLessonId}
                onStart={handleStartLesson}
                onLayout={handleLeafLayout}
              />
            );
          })}

          <View style={styles.vineEnd} />
        </View>
      </ScrollView>
    </View>
  );
}

const VINE_CENTER = '50%';

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

  /* ── Soil top band (lighter) — title ── */
  soilTop: {
    backgroundColor: '#5A3E2B',
    alignItems: 'center',
    paddingBottom: 18,
    zIndex: 2,
  },
  soilTitle: {
    fontFamily: fonts.serif,
    fontSize: 36,
    color: '#F5EDE0',
    marginBottom: 0,
  },

  /* ── Soil bottom band (darker) — subtitle ── */
  soilBottom: {
    backgroundColor: '#4A3228',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    paddingVertical: 14,
    position: 'relative',
    zIndex: 2,
    // Close subpixel gap between this band and the SVG curve
    marginBottom: -1,
  },
  soilSubtitle: {
    fontFamily: fonts.light,
    color: 'rgba(245,237,224,0.6)',
    fontSize: 14,
    letterSpacing: 0.2,
  },

  /* ── Vine connector styles removed — vine stem extends up behind header instead ── */

  soilCurveSvg: {
    marginTop: -1,
    zIndex: 2,
  },
  scrollContentPadding: {
    paddingHorizontal: 20,
  },

  /* ── Vine area ── */
  vineArea: {
    position: 'relative',
    paddingBottom: 40,
    // Pull up behind the SVG curve + soilBottom so the stem looks rooted in soil.
    // paddingTop compensates so leaf content still starts at the right position.
    marginTop: -60,
    paddingTop: 60,
    zIndex: 1,
  },
  vineStem: {
    position: 'absolute',
    left: VINE_CENTER,
    marginLeft: -2,
    top: 0,
    bottom: 0,
    width: 4,
    borderRadius: 2,
    backgroundColor: colors.darkGreen,
    opacity: 0.8,
  },
  vineStemGlow: {
    position: 'absolute',
    left: VINE_CENTER,
    marginLeft: -6,
    top: 0,
    bottom: 0,
    width: 12,
    borderRadius: 6,
    backgroundColor: colors.teal,
    opacity: 0.3,
  },

  /* ── Level headers ── */
  levelHeader: {
    alignItems: 'center',
    marginVertical: 16,
    zIndex: 2,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.full,
  },
  levelBadgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },

  /* ── Leaf rows ── */
  leafRow: {
    minHeight: 80,
    marginVertical: 8,
    justifyContent: 'center',
    position: 'relative',
  },

  /* ── Vine nodes ── */
  vineNodePosition: {
    position: 'absolute',
    top: '50%',
    marginTop: -6,
    zIndex: 3,
  },
  nodeFromLeft: {
    right: '50%',
  },
  nodeFromRight: {
    left: '50%',
  },
  vineNodeOuter: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vineNode: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  /* ── Leaf cards ── */
  leafCard: {
    width: '46%',
    borderRadius: radii.xl,
    borderWidth: 1.5,
    overflow: 'hidden',
    zIndex: 2,
  },
  leafCardLeft: {
    alignSelf: 'flex-start',
  },
  leafCardRight: {
    alignSelf: 'flex-end',
  },
  leafCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.charcoal,
    lineHeight: 18,
  },
  lessonSubtitle: {
    fontFamily: fonts.light,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },

  /* ── Start button ── */
  startSection: {
    overflow: 'hidden',
    paddingHorizontal: 14,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radii.full,
    paddingVertical: 10,
    marginBottom: 12,
  },
  startButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.white,
    letterSpacing: 0.3,
  },

  /* ── Vine end ── */
  vineEnd: {
    height: 20,
  },
});