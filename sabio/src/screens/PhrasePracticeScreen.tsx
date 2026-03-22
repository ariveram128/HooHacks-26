import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Modal,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, fonts, spacing, radii } from '../theme';
import { ChevronLeftIcon, MicIcon, CheckCircleIcon, CloseIcon, ChatIcon } from '../components/Icons';
import FadeIn from '../components/FadeIn';
import DiscussionSection from '../components/DiscussionSection';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { phrases, Phrase } from '../data/phrases';
import { masterPhrase, updateStreak, getProgress } from '../store/practiceProgress';
import { isCloseEnough, similarity } from '../utils/similarity';

const { width: SCREEN_W } = Dimensions.get('window');

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Result = 'correct' | 'incorrect' | null;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PhrasePracticeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  const [queue, setQueue] = useState<Phrase[]>(() => shuffle(phrases));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState<Result>(null);
  const [streak, setStreak] = useState(0);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [finished, setFinished] = useState(false);
  const [showDiscussion, setShowDiscussion] = useState(false);

  const cardAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const micPulse = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  const currentPhrase = queue[currentIdx] ?? null;
  const totalInSession = queue.length;

  useEffect(() => {
    getProgress().then((p) => {
      setStreak(p.currentStreak);
      setMasteredIds(new Set(p.masteredPhrases));
    });
  }, []);

  // ── Speech recognition events ──
  useSpeechRecognitionEvent('start', () => setRecognizing(true));
  useSpeechRecognitionEvent('end', () => {
    setRecognizing(false);
    stopPulse();
  });
  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results[0]?.transcript ?? '';
    setTranscript(text);

    if (!event.isFinal) return;
    evaluateAnswer(text);
  });
  useSpeechRecognitionEvent('error', (event) => {
    console.log('STT error:', event.error, event.message);
    setRecognizing(false);
    stopPulse();
  });

  const startPulse = useCallback(() => {
    pulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(micPulse, { toValue: 1.15, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(micPulse, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    pulseLoop.current.start();
  }, [micPulse]);

  const stopPulse = useCallback(() => {
    pulseLoop.current?.stop();
    micPulse.setValue(1);
  }, [micPulse]);

  const handleMicPress = async () => {
    if (recognizing) {
      ExpoSpeechRecognitionModule.stop();
      return;
    }
    if (result) return;

    setTranscript('');
    setResult(null);

    const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!perm.granted) return;

    startPulse();
    ExpoSpeechRecognitionModule.start({
      lang: 'es-ES',
      interimResults: true,
      continuous: false,
    });
  };

  const evaluateAnswer = async (spoken: string) => {
    if (!currentPhrase) return;

    const correct = isCloseEnough(spoken, currentPhrase.spanish, 0.75);

    if (correct) {
      setResult('correct');
      await masterPhrase(currentPhrase.id);
      const p = await updateStreak(true);
      setStreak(p.currentStreak);
      setMasteredIds((prev) => new Set(prev).add(currentPhrase.id));

      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();

      setTimeout(() => advance(), 1800);
    } else {
      setResult('incorrect');
      await updateStreak(false);
      setStreak(0);

      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  };

  const advance = () => {
    cardAnim.setValue(0);
    shakeAnim.setValue(0);
    setResult(null);
    setTranscript('');

    if (currentIdx + 1 >= totalInSession) {
      setFinished(true);
    } else {
      setCurrentIdx((i) => i + 1);
    }
  };

  const skip = () => {
    advance();
  };

  const retry = () => {
    setResult(null);
    setTranscript('');
    shakeAnim.setValue(0);
  };

  const difficultyColor = (d: Phrase['difficulty']) => {
    if (d === 'beginner') return colors.teal;
    if (d === 'intermediate') return colors.marigold;
    return colors.terracotta;
  };

  // ── Finished state ──
  if (finished) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 20 }]}>
        <FadeIn delay={100}>
          <View style={styles.finishedWrap}>
            <Text style={styles.finishedEmoji}>🎉</Text>
            <Text style={styles.finishedTitle}>¡Bien hecho!</Text>
            <Text style={styles.finishedSub}>
              You completed the session.{'\n'}
              {masteredIds.size} phrases mastered total.
            </Text>
            <Pressable
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [styles.finishedBtn, pressed && { opacity: 0.8 }]}
            >
              <Text style={styles.finishedBtnText}>Back to Practice</Text>
            </Pressable>
          </View>
        </FadeIn>
      </View>
    );
  }

  if (!currentPhrase) return null;

  const cardBg = result === 'correct'
    ? 'rgba(42,139,122,0.08)'
    : result === 'incorrect'
      ? 'rgba(194,85,58,0.08)'
      : colors.creamLight;

  const cardBorder = result === 'correct'
    ? colors.teal
    : result === 'incorrect'
      ? colors.terracotta
      : colors.creamDark;

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <ChevronLeftIcon size={24} color={colors.charcoal} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerProgress}>
            {currentIdx + 1} / {totalInSession}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable onPress={() => setShowDiscussion(true)} hitSlop={8} style={styles.discussBtn}>
            <ChatIcon size={18} color={colors.warmGray} />
          </Pressable>
          <View style={styles.streakPill}>
            <Text style={styles.streakText}>🔥 {streak}</Text>
          </View>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${((currentIdx + 1) / totalInSession) * 100}%` }]} />
      </View>

      {/* Phrase Card */}
      <View style={styles.cardArea}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: cardBg,
              borderColor: cardBorder,
              transform: [
                { translateX: shakeAnim },
                { scale: cardAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.03, 1] }) },
              ],
            },
          ]}
        >
          <View style={[styles.diffBadge, { backgroundColor: `${difficultyColor(currentPhrase.difficulty)}18` }]}>
            <Text style={[styles.diffBadgeText, { color: difficultyColor(currentPhrase.difficulty) }]}>
              {currentPhrase.difficulty}
            </Text>
          </View>

          <Text style={styles.englishText}>{currentPhrase.english}</Text>
          <Text style={styles.prompt}>Say in Spanish:</Text>

          {result === 'correct' && (
            <View style={styles.resultRow}>
              <CheckCircleIcon size={22} color={colors.teal} />
              <Text style={[styles.resultText, { color: colors.teal }]}>¡Correcto!</Text>
            </View>
          )}

          {result === 'incorrect' && (
            <View style={styles.incorrectWrap}>
              <View style={styles.resultRow}>
                <CloseIcon size={18} color={colors.terracotta} />
                <Text style={[styles.resultText, { color: colors.terracotta }]}>Not quite</Text>
              </View>
              <Text style={styles.youSaid}>You said: "{transcript}"</Text>
              <Text style={styles.expected}>Expected: "{currentPhrase.spanish}"</Text>
            </View>
          )}
        </Animated.View>

        {/* Transcript preview */}
        {recognizing && transcript.length > 0 && !result && (
          <View style={styles.transcriptPreview}>
            <Text style={styles.transcriptText}>{transcript}</Text>
          </View>
        )}
      </View>

      {/* Bottom controls */}
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 20 }]}>
        {result === 'incorrect' ? (
          <View style={styles.retryRow}>
            <Pressable
              onPress={retry}
              style={({ pressed }) => [styles.retryBtn, pressed && { opacity: 0.8 }]}
            >
              <Text style={styles.retryBtnText}>Try again</Text>
            </Pressable>
            <Pressable
              onPress={skip}
              style={({ pressed }) => [styles.skipBtn, pressed && { opacity: 0.8 }]}
            >
              <Text style={styles.skipBtnText}>Skip</Text>
            </Pressable>
          </View>
        ) : result !== 'correct' ? (
          <Pressable onPress={handleMicPress}>
            <Animated.View
              style={[
                styles.micBtn,
                recognizing && styles.micBtnActive,
                { transform: [{ scale: micPulse }] },
              ]}
            >
              <MicIcon size={32} color={colors.white} />
            </Animated.View>
            <Text style={styles.micHint}>
              {recognizing ? 'Listening...' : 'Tap to speak'}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {/* Discussion Modal */}
      <Modal visible={showDiscussion} animationType="slide" transparent>
        <View style={styles.discussOverlay}>
          <View style={[styles.discussSheet, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.discussHeader}>
              <Text style={styles.discussTitle}>
                {currentPhrase.spanish}
              </Text>
              <Pressable onPress={() => setShowDiscussion(false)} hitSlop={8}>
                <CloseIcon size={20} color={colors.charcoal} />
              </Pressable>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <DiscussionSection contentType="phrase" contentId={currentPhrase.id} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerCenter: { alignItems: 'center' },
  headerProgress: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.charcoal,
  },
  streakPill: {
    backgroundColor: 'rgba(232,168,56,0.15)',
    borderRadius: radii.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  streakText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.marigoldDark,
  },

  progressBarBg: {
    height: 5,
    backgroundColor: colors.creamDark,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 24,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.teal,
    borderRadius: 3,
  },

  cardArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: SCREEN_W - 40,
    borderWidth: 2,
    borderRadius: radii.xxl,
    padding: 28,
  },
  diffBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: radii.sm,
    marginBottom: 16,
  },
  diffBadgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  englishText: {
    fontFamily: fonts.serif,
    fontSize: 28,
    color: colors.charcoal,
    lineHeight: 34,
    marginBottom: 12,
  },
  prompt: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.warmGray,
    fontStyle: 'italic',
  },

  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  resultText: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
  },
  incorrectWrap: {
    marginTop: 12,
  },
  youSaid: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.terracotta,
    marginTop: 10,
  },
  expected: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.teal,
    marginTop: 4,
  },

  transcriptPreview: {
    marginTop: 16,
    backgroundColor: 'rgba(42,139,122,0.08)',
    borderRadius: radii.md,
    padding: 12,
    paddingHorizontal: 18,
  },
  transcriptText: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.teal,
    textAlign: 'center',
  },

  bottom: {
    alignItems: 'center',
    paddingTop: 20,
  },
  micBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    shadowColor: colors.tealDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  micBtnActive: {
    backgroundColor: colors.terracotta,
  },
  micHint: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.warmGray,
    textAlign: 'center',
    marginTop: 10,
  },

  retryRow: {
    flexDirection: 'row',
    gap: 14,
  },
  retryBtn: {
    backgroundColor: colors.teal,
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  retryBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.white,
  },
  skipBtn: {
    backgroundColor: colors.creamDark,
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  skipBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.warmGray,
  },

  finishedWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingTop: 120,
  },
  finishedEmoji: { fontSize: 64, marginBottom: 16 },
  finishedTitle: {
    fontFamily: fonts.serif,
    fontSize: 36,
    color: colors.charcoal,
    marginBottom: 12,
  },
  finishedSub: {
    fontFamily: fonts.light,
    fontSize: 16,
    color: colors.warmGray,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  finishedBtn: {
    backgroundColor: colors.teal,
    borderRadius: radii.md,
    paddingVertical: 16,
    paddingHorizontal: 40,
  },
  finishedBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.white,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  discussBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discussOverlay: {
    flex: 1,
    backgroundColor: 'rgba(42,35,32,0.5)',
    justifyContent: 'flex-end',
  },
  discussSheet: {
    backgroundColor: colors.cream,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    paddingHorizontal: 20,
    paddingTop: 16,
    maxHeight: '75%',
  },
  discussHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  discussTitle: {
    fontFamily: fonts.serif,
    fontSize: 18,
    color: colors.charcoal,
    flex: 1,
    marginRight: 12,
  },
});
