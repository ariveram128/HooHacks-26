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
import { getLessonById, getSectionForLesson } from '../data/lessons';
import {
  completeLesson,
  isCompleted,
  setLastViewed,
} from '../store/lessonProgress';
import { ChevronLeftIcon, CheckCircleIcon, BookIcon, NotesIcon, ChatIcon, GamepadIcon } from '../components/Icons';
import FadeIn from '../components/FadeIn';

type Nav = NativeStackNavigationProp<RootStackParamList>;

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

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeftIcon size={22} color={colors.charcoal} />
        </Pressable>
        <View style={styles.headerCenter}>
          {section && (
            <Text style={styles.headerSection}>{section.title}</Text>
          )}
          <Text style={styles.headerTitle} numberOfLines={1}>
            {lesson.title}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title card */}
        <FadeIn delay={100}>
          <View style={styles.titleCard}>
            <View style={styles.lessonIconWrap}>
              {lesson.sectionId === 'brotes' ? <NotesIcon size={30} color={colors.white} /> :
               lesson.sectionId === 'ramas' ? <ChatIcon size={30} color={colors.white} /> :
               lesson.sectionId === 'copa' ? <GamepadIcon size={30} color={colors.white} /> :
               <BookIcon size={30} color={colors.white} />}
            </View>
            <Text style={styles.lessonTitle}>{lesson.title}</Text>
            <Text style={styles.lessonSubtitle}>{lesson.subtitle}</Text>
            {section && (
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>
                  {section.title} — {section.subtitle}
                </Text>
              </View>
            )}
          </View>
        </FadeIn>

        {/* Content blocks */}
        {lesson.content.map((block, idx) => (
          <FadeIn key={idx} delay={200 + idx * 100}>
            <View style={styles.contentBlock}>
              {block.heading && (
                <Text style={styles.contentHeading}>{block.heading}</Text>
              )}
              <Text style={styles.contentBody}>{block.body}</Text>
              {block.practiceLink && (
                <Pressable style={styles.practiceLink}>
                  <Text style={styles.practiceLinkText}>
                    {block.practiceLink.label}
                  </Text>
                </Pressable>
              )}
            </View>
          </FadeIn>
        ))}
      </ScrollView>

      {/* Bottom action */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {completed ? (
          <View style={styles.completedBtn}>
            <CheckCircleIcon size={20} color={colors.teal} />
            <Text style={styles.completedText}>Completed</Text>
          </View>
        ) : (
          <Pressable style={styles.completeBtn} onPress={handleComplete}>
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
    paddingVertical: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerSection: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.warmGray,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontFamily: fonts.serif,
    fontSize: 20,
    color: colors.charcoal,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  titleCard: {
    backgroundColor: colors.teal,
    borderRadius: radii.xxl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  lessonIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  lessonTitle: {
    fontFamily: fonts.serif,
    fontSize: 30,
    color: colors.white,
    textAlign: 'center',
  },
  lessonSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xs,
  },
  sectionBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    marginTop: spacing.md,
  },
  sectionBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
  },
  contentBlock: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  contentHeading: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.charcoal,
    marginBottom: spacing.sm,
  },
  contentBody: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.charcoalLight,
    lineHeight: 24,
  },
  practiceLink: {
    marginTop: spacing.md,
    backgroundColor: colors.creamDark,
    borderRadius: radii.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    alignSelf: 'flex-start',
  },
  practiceLinkText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.terracotta,
  },
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
    backgroundColor: colors.terracotta,
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
