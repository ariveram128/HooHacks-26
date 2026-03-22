import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, fonts, spacing, radii } from '../theme';
import { getLessonById, getSectionForLesson, type LessonContentBlock } from '../data/lessons';
import {
  completeLesson,
  isCompleted,
  setLastViewed,
} from '../store/lessonProgress';
import { ChevronLeftIcon, CheckCircleIcon, BookIcon, NotesIcon, ChatIcon, GamepadIcon } from '../components/Icons';
import FadeIn from '../components/FadeIn';
import DiscussionSection from '../components/DiscussionSection';

type Nav = NativeStackNavigationProp<RootStackParamList>;

/* ── Table component ── */
function LessonTable({ headers, rows }: NonNullable<LessonContentBlock['table']>) {
  return (
    <View style={tableStyles.container}>
      {/* Header row */}
      <View style={tableStyles.headerRow}>
        {headers.map((h, i) => (
          <View key={i} style={[tableStyles.cell, i === 0 && tableStyles.firstCol]}>
            <Text style={tableStyles.headerText}>{h}</Text>
          </View>
        ))}
      </View>
      {/* Data rows */}
      {rows.map((row, ri) => (
        <View
          key={ri}
          style={[
            tableStyles.row,
            ri % 2 === 0 && tableStyles.rowEven,
          ]}
        >
          {row.map((cell, ci) => (
            <View key={ci} style={[tableStyles.cell, ci === 0 && tableStyles.firstCol]}>
              <Text style={[tableStyles.cellText, ci === 0 && tableStyles.firstColText]}>
                {cell}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const tableStyles = StyleSheet.create({
  container: {
    borderRadius: radii.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.creamDark,
    marginTop: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: colors.charcoal,
  },
  row: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.creamDark,
  },
  rowEven: {
    backgroundColor: colors.creamLight,
  },
  cell: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  firstCol: {
    flex: 0.5,
  },
  headerText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.white,
  },
  cellText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.charcoal,
  },
  firstColText: {
    fontFamily: fonts.bold,
  },
});

export default function LessonDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'LessonDetail'>>();
  const { lessonId } = route.params;

  const lesson = getLessonById(lessonId);
  const section = lesson ? getSectionForLesson(lesson) : null;

  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setLastViewed(lessonId);
    isCompleted(lessonId).then(setCompleted);
  }, [lessonId]);

  const handleComplete = async () => {
    await completeLesson(lessonId);
    setCompleted(true);
  };

  if (!lesson) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeftIcon size={22} color={colors.charcoal} />
          </Pressable>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Lesson not found.</Text>
        </View>
      </View>
    );
  }

  const accentColor =
    lesson.sectionId === 'brotes' ? colors.tealLight :
    lesson.sectionId === 'ramas' ? colors.terracotta :
    lesson.sectionId === 'copa' ? colors.marigold :
    colors.teal;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeftIcon size={22} color={colors.charcoal} />
        </Pressable>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title banner card */}
        <FadeIn delay={100}>
          <View style={[styles.titleCard, { backgroundColor: accentColor }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
              {section && (
                <Text style={styles.lessonSubtitle}>
                  {lesson.subtitle}, {section.title}
                </Text>
              )}
            </View>
            <View style={styles.lessonIconWrap}>
              {lesson.sectionId === 'brotes' ? <NotesIcon size={26} color={colors.white} /> :
               lesson.sectionId === 'ramas' ? <ChatIcon size={26} color={colors.white} /> :
               lesson.sectionId === 'copa' ? <GamepadIcon size={26} color={colors.white} /> :
               <BookIcon size={26} color={colors.white} />}
            </View>
          </View>
        </FadeIn>

        {/* Content blocks — plain text with optional tables */}
        {lesson.content.map((block, idx) => (
          <FadeIn key={idx} delay={200 + idx * 100}>
            <View style={styles.contentBlock}>
              {block.heading && (
                <Text style={styles.contentHeading}>{block.heading}</Text>
              )}
              <Text style={styles.contentBody}>{block.body}</Text>
              {block.table && (
                <LessonTable headers={block.table.headers} rows={block.table.rows} />
              )}
              {block.practiceLink && (
                <Pressable style={[styles.practiceLink, { borderColor: accentColor }]}>
                  <Text style={[styles.practiceLinkText, { color: accentColor }]}>
                    {block.practiceLink.label}
                  </Text>
                </Pressable>
              )}
            </View>
          </FadeIn>
        ))}

        {/* Community Discussion */}
        <FadeIn delay={200 + lesson.content.length * 100 + 100}>
          <DiscussionSection contentType="lesson" contentId={lessonId} />
        </FadeIn>
      </ScrollView>

      {/* Bottom action */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {completed ? (
          <View style={styles.completedBtn}>
            <CheckCircleIcon size={20} color={colors.teal} />
            <Text style={styles.completedText}>Completed</Text>
          </View>
        ) : (
          <Pressable style={[styles.completeBtn, { backgroundColor: accentColor }]} onPress={handleComplete}>
            <Text style={styles.completeBtnText}>Mark as Complete</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xs,
  },

  /* ── Title banner ── */
  titleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  lessonIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
  lessonTitle: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.white,
  },
  lessonSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },

  /* ── Content — plain text on background ── */
  contentBlock: {
    marginBottom: spacing.lg,
  },
  contentHeading: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.charcoal,
    marginBottom: spacing.sm,
    lineHeight: 28,
  },
  contentBody: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.charcoalLight,
    lineHeight: 26,
  },
  practiceLink: {
    marginTop: spacing.md,
    borderWidth: 1.5,
    borderRadius: radii.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    alignSelf: 'flex-start',
  },
  practiceLinkText: {
    fontFamily: fonts.medium,
    fontSize: 13,
  },

  /* ── Bottom bar ── */
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: 'rgba(245,237,224,0.95)',
    borderTopWidth: 1,
    borderTopColor: colors.creamDark,
  },
  completeBtn: {
    borderRadius: radii.full,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
  },
  completeBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.white,
    letterSpacing: 0.3,
  },
  completedBtn: {
    flexDirection: 'row',
    backgroundColor: colors.creamDark,
    borderRadius: radii.full,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  completedText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.teal,
    letterSpacing: 0.3,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.warmGray,
  },
});
