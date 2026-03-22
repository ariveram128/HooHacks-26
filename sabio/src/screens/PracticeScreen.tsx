import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, fonts, spacing, radii } from '../theme';
import { MicIcon, GamepadIcon, ChevronLeftIcon, ChevronRightIcon } from '../components/Icons';
import BottomNav from '../components/BottomNav';
import FadeIn from '../components/FadeIn';
import { getProgress, PracticeProgress } from '../store/practiceProgress';
import { phrases } from '../data/phrases';

const { width: SCREEN_W } = Dimensions.get('window');

type Nav = NativeStackNavigationProp<RootStackParamList>;

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
      <View style={[styles.content, { paddingTop: insets.top + 12 }]}>
        {/* Header */}
        <FadeIn delay={50}>
          <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
              <ChevronLeftIcon size={24} color={colors.charcoal} />
            </Pressable>
            <Text style={styles.title}>Práctica</Text>
            <View style={{ width: 24 }} />
          </View>

          <Text style={styles.subtitle}>
            Sharpen your pronunciation and vocabulary
          </Text>
        </FadeIn>

        {/* Streak banner */}
        {progress.bestStreak > 0 && (
          <FadeIn delay={150}>
            <View style={styles.streakBanner}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <View>
                <Text style={styles.streakLabel}>Best streak</Text>
                <Text style={styles.streakValue}>{progress.bestStreak} in a row</Text>
              </View>
            </View>
          </FadeIn>
        )}

        {/* Phrase Practice Card */}
        <FadeIn delay={200}>
          <Pressable
            onPress={() => navigation.navigate('PhrasePractice')}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconWrap, { backgroundColor: colors.teal }]}>
                <MicIcon size={26} color={colors.white} />
              </View>
              <ChevronRightIcon size={20} color={colors.warmGrayLight} />
            </View>

            <Text style={styles.cardTitle}>Frases</Text>
            <Text style={styles.cardDesc}>
              Practice saying key phrases aloud.{'\n'}Speak clearly and Sabio will check your pronunciation.
            </Text>

            <View style={styles.cardProgress}>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${masteredPct}%`, backgroundColor: colors.teal }]} />
              </View>
              <Text style={styles.progressLabel}>
                {masteredCount} / {totalPhrases} mastered
              </Text>
            </View>
          </Pressable>
        </FadeIn>

        {/* Color Game Card */}
        <FadeIn delay={350}>
          <Pressable
            onPress={() => navigation.navigate('ColorGame')}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconWrap, { backgroundColor: colors.terracotta }]}>
                <GamepadIcon size={26} color={colors.white} />
              </View>
              <ChevronRightIcon size={20} color={colors.warmGrayLight} />
            </View>

            <Text style={styles.cardTitle}>Plataformas</Text>
            <Text style={styles.cardDesc}>
              Say color names in Spanish to keep your character jumping!{'\n'}How far can you go?
            </Text>

            <View style={styles.cardScoreRow}>
              <View style={[styles.scoreBadge, { backgroundColor: 'rgba(194,85,58,0.1)' }]}>
                <Text style={[styles.scoreBadgeText, { color: colors.terracotta }]}>
                  🏆 High score: {progress.colorGameHighScore}
                </Text>
              </View>
            </View>
          </Pressable>
        </FadeIn>
      </View>

      <BottomNav
        activeTab="practice"
        onTabPress={(tabId) => {
          if (tabId === 'home') navigation.navigate('Home');
          else if (tabId === 'chat') navigation.navigate('DillowChat');
          else if (tabId === 'learn') navigation.navigate('Lessons');
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 28,
    color: colors.charcoal,
  },
  subtitle: {
    fontFamily: fonts.light,
    fontSize: 14,
    color: colors.warmGray,
    marginBottom: 24,
    textAlign: 'center',
  },

  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(232,168,56,0.1)',
    borderRadius: radii.md,
    padding: 14,
    marginBottom: 20,
  },
  streakEmoji: { fontSize: 28 },
  streakLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.warmGray,
  },
  streakValue: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.marigoldDark,
  },

  card: {
    backgroundColor: colors.creamLight,
    borderWidth: 1.5,
    borderColor: colors.creamDark,
    borderRadius: radii.xxl,
    padding: 24,
    marginBottom: 18,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    shadowColor: colors.charcoal,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: fonts.serif,
    fontSize: 24,
    color: colors.charcoal,
    marginBottom: 6,
  },
  cardDesc: {
    fontFamily: fonts.light,
    fontSize: 14,
    color: colors.warmGray,
    lineHeight: 20,
    marginBottom: 16,
  },

  cardProgress: {
    gap: 6,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.creamDark,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.warmGray,
  },

  cardScoreRow: {
    flexDirection: 'row',
  },
  scoreBadge: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: radii.sm,
  },
  scoreBadgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
});
