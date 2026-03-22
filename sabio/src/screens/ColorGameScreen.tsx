import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, fonts, radii } from '../theme';
import { ChevronLeftIcon, MicIcon, PlayIcon } from '../components/Icons';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { GAME_COLORS, GameColor } from '../data/phrases';
import { setHighScore, getProgress } from '../store/practiceProgress';
import { isCloseEnough } from '../utils/similarity';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

type Nav = NativeStackNavigationProp<RootStackParamList>;
type GameState = 'idle' | 'playing' | 'gameover';

const PLATFORM_W = SCREEN_W * 0.55;
const PLATFORM_H = 28;
const CHARACTER_SIZE = 44;
const TIMER_INITIAL = 4000;
const TIMER_MIN = 1800;
const TIMER_DECAY = 150;

function pickRandom(exclude?: string): GameColor {
  const pool = exclude ? GAME_COLORS.filter((c) => c.name !== exclude) : GAME_COLORS;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function ColorGameScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHigh] = useState(0);
  const [isNewHigh, setIsNewHigh] = useState(false);

  const [currentColor, setCurrentColor] = useState<GameColor>(GAME_COLORS[0]);
  const [nextColor, setNextColor] = useState<GameColor>(GAME_COLORS[1]);
  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState('');

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerDuration = useRef(TIMER_INITIAL);

  const platformSlide = useRef(new Animated.Value(0)).current;
  const characterBounce = useRef(new Animated.Value(0)).current;
  const timerBar = useRef(new Animated.Value(1)).current;
  const timerAnim = useRef<Animated.CompositeAnimation | null>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const micPulse = useRef(new Animated.Value(1)).current;
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    getProgress().then((p) => setHigh(p.colorGameHighScore));
  }, []);

  // ── Speech events ──
  useSpeechRecognitionEvent('start', () => setRecognizing(true));
  useSpeechRecognitionEvent('end', () => {
    setRecognizing(false);
    stopMicPulse();
  });
  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results[0]?.transcript ?? '';
    setTranscript(text);
    if (!event.isFinal) return;
    checkAnswer(text);
  });
  useSpeechRecognitionEvent('error', () => {
    setRecognizing(false);
    stopMicPulse();
  });

  const startMicPulse = useCallback(() => {
    pulseRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(micPulse, { toValue: 1.12, duration: 500, useNativeDriver: true }),
        Animated.timing(micPulse, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
    );
    pulseRef.current.start();
  }, [micPulse]);

  const stopMicPulse = useCallback(() => {
    pulseRef.current?.stop();
    micPulse.setValue(1);
  }, [micPulse]);

  const startTimer = useCallback(() => {
    timerBar.setValue(1);
    const dur = Math.max(timerDuration.current, TIMER_MIN);
    timerAnim.current = Animated.timing(timerBar, {
      toValue: 0,
      duration: dur,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    timerAnim.current.start(({ finished }) => {
      if (finished) handleTimeout();
    });
  }, []);

  const stopTimer = useCallback(() => {
    timerAnim.current?.stop();
  }, []);

  const handleTimeout = () => {
    endGame();
  };

  const startListening = async () => {
    if (recognizing) return;
    setTranscript('');
    const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!perm.granted) return;
    startMicPulse();
    ExpoSpeechRecognitionModule.start({
      lang: 'es-ES',
      interimResults: true,
      continuous: false,
    });
  };

  const checkAnswer = (spoken: string) => {
    if (gameState !== 'playing') return;

    const correct = isCloseEnough(spoken, nextColor.name, 0.7);

    if (correct) {
      stopTimer();
      handleCorrect();
    } else {
      shake();
      setTimeout(() => startListening(), 400);
    }
  };

  const handleCorrect = () => {
    const newScore = score + 1;
    setScore(newScore);
    timerDuration.current = Math.max(timerDuration.current - TIMER_DECAY, TIMER_MIN);

    Animated.sequence([
      Animated.timing(characterBounce, { toValue: -20, duration: 150, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(characterBounce, { toValue: 0, duration: 200, easing: Easing.bounce, useNativeDriver: true }),
    ]).start();

    Animated.timing(platformSlide, {
      toValue: 1,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      platformSlide.setValue(0);
      setCurrentColor(nextColor);
      const nc = pickRandom(nextColor.name);
      setNextColor(nc);
      startTimer();
      startListening();
    });
  };

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const endGame = async () => {
    stopTimer();
    if (recognizing) {
      ExpoSpeechRecognitionModule.stop();
    }
    stopMicPulse();

    const finalScore = score;
    if (finalScore > highScore) {
      setHigh(finalScore);
      setIsNewHigh(true);
      await setHighScore(finalScore);
    } else {
      setIsNewHigh(false);
    }
    setGameState('gameover');
  };

  const startGame = async () => {
    setScore(0);
    timerDuration.current = TIMER_INITIAL;
    setIsNewHigh(false);

    const first = pickRandom();
    const second = pickRandom(first.name);
    setCurrentColor(first);
    setNextColor(second);
    setGameState('playing');
    setTranscript('');
    platformSlide.setValue(0);
    characterBounce.setValue(0);
    shakeAnim.setValue(0);

    setTimeout(() => {
      startTimer();
      startListening();
    }, 500);
  };

  const timerColor = timerBar.interpolate({
    inputRange: [0, 0.3, 0.6, 1],
    outputRange: [colors.terracotta, colors.terracotta, colors.marigold, colors.teal],
  });

  // ── IDLE screen ──
  if (gameState === 'idle') {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
        <View style={styles.idleHeader}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <ChevronLeftIcon size={24} color={colors.charcoal} />
          </Pressable>
        </View>
        <View style={styles.idleCenter}>
          <Text style={styles.idleTitle}>Plataformas</Text>
          <Text style={styles.idleSub}>
            Say the color of the next platform in Spanish{'\n'}before yours falls!
          </Text>

          <View style={styles.idleColors}>
            {GAME_COLORS.slice(0, 6).map((c) => (
              <View key={c.name} style={styles.idleColorChip}>
                <View style={[styles.idleColorDot, { backgroundColor: c.hex }]} />
                <Text style={styles.idleColorName}>{c.name}</Text>
              </View>
            ))}
          </View>

          {highScore > 0 && (
            <Text style={styles.idleHigh}>🏆 High score: {highScore}</Text>
          )}

          <Pressable
            onPress={startGame}
            style={({ pressed }) => [styles.playBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}
          >
            <PlayIcon size={24} color={colors.white} />
            <Text style={styles.playBtnText}>Play</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ── PLAYING + GAMEOVER ──
  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      {/* Top bar */}
      <View style={styles.gameTopBar}>
        <Pressable onPress={() => { endGame(); }} hitSlop={12}>
          <ChevronLeftIcon size={22} color={colors.charcoal} />
        </Pressable>
        <View style={styles.scorePill}>
          <Text style={styles.scoreText}>Score: {score}</Text>
        </View>
        <View style={{ width: 22 }} />
      </View>

      {/* Timer */}
      <View style={styles.timerWrap}>
        <Animated.View
          style={[
            styles.timerFill,
            {
              width: timerBar.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
              backgroundColor: timerColor,
            },
          ]}
        />
      </View>

      {/* Prompt */}
      <View style={styles.promptWrap}>
        <Text style={styles.promptLabel}>Say the color:</Text>
        <View style={[styles.colorPreview, { backgroundColor: nextColor.hex, borderColor: nextColor.hex === '#ECF0F1' || nextColor.hex === '#F1C40F' ? colors.warmGrayLight : 'transparent' }]}>
          <Text style={[styles.colorPreviewText, { color: nextColor.hex === '#2C3E50' || nextColor.hex === '#8E44AD' ? colors.white : colors.charcoal }]}>
            ?
          </Text>
        </View>
        <Text style={styles.promptHint}>({nextColor.english})</Text>
      </View>

      {/* Platforms */}
      <View style={styles.platformArea}>
        {/* Character */}
        <Animated.View
          style={[
            styles.character,
            { transform: [{ translateY: characterBounce }, { translateX: shakeAnim }] },
          ]}
        >
          <Text style={styles.characterEmoji}>🦜</Text>
        </Animated.View>

        {/* Current platform */}
        <View style={[styles.platform, { backgroundColor: currentColor.hex, borderColor: currentColor.hex === '#ECF0F1' || currentColor.hex === '#F1C40F' ? colors.warmGrayLight : 'transparent' }]}>
          <Text style={[styles.platformText, { color: currentColor.hex === '#2C3E50' || currentColor.hex === '#8E44AD' ? colors.white : colors.charcoal }]}>
            {currentColor.name}
          </Text>
        </View>

        {/* Next platform */}
        <Animated.View
          style={[
            styles.nextPlatform,
            {
              backgroundColor: nextColor.hex,
              borderColor: nextColor.hex === '#ECF0F1' || nextColor.hex === '#F1C40F' ? colors.warmGrayLight : 'transparent',
              transform: [{
                translateY: platformSlide.interpolate({ inputRange: [0, 1], outputRange: [0, -60] }),
              }],
              opacity: platformSlide.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] }),
            },
          ]}
        />

        {/* Shadow platforms below */}
        <View style={[styles.shadowPlatform, { top: 200, opacity: 0.15 }]} />
        <View style={[styles.shadowPlatform, { top: 260, opacity: 0.08 }]} />
      </View>

      {/* Mic + transcript */}
      <View style={[styles.micArea, { paddingBottom: insets.bottom + 20 }]}>
        {transcript.length > 0 && (
          <View style={styles.liveTranscript}>
            <Text style={styles.liveTranscriptText}>{transcript}</Text>
          </View>
        )}

        <Pressable onPress={startListening}>
          <Animated.View
            style={[
              styles.micBtn,
              recognizing && styles.micBtnListening,
              { transform: [{ scale: micPulse }] },
            ]}
          >
            <MicIcon size={28} color={colors.white} />
          </Animated.View>
        </Pressable>
        <Text style={styles.micLabel}>
          {recognizing ? 'Listening...' : 'Tap to speak'}
        </Text>
      </View>

      {/* Game Over Modal */}
      <Modal visible={gameState === 'gameover'} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEmoji}>{isNewHigh ? '🎉' : '🦜'}</Text>
            <Text style={styles.modalTitle}>
              {isNewHigh ? '¡Nuevo récord!' : '¡Buen intento!'}
            </Text>
            <Text style={styles.modalScore}>Score: {score}</Text>
            {isNewHigh && (
              <Text style={styles.modalHighLabel}>New high score!</Text>
            )}
            {!isNewHigh && highScore > 0 && (
              <Text style={styles.modalHighLabel}>Best: {highScore}</Text>
            )}

            <View style={styles.modalBtns}>
              <Pressable
                onPress={startGame}
                style={({ pressed }) => [styles.modalPlayAgain, pressed && { opacity: 0.85 }]}
              >
                <Text style={styles.modalPlayAgainText}>Play again</Text>
              </Pressable>
              <Pressable
                onPress={() => navigation.goBack()}
                style={({ pressed }) => [styles.modalBack, pressed && { opacity: 0.85 }]}
              >
                <Text style={styles.modalBackText}>Back</Text>
              </Pressable>
            </View>
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

  // ── Idle ──
  idleHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  idleCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  idleTitle: {
    fontFamily: fonts.serif,
    fontSize: 38,
    color: colors.charcoal,
    marginBottom: 10,
  },
  idleSub: {
    fontFamily: fonts.light,
    fontSize: 15,
    color: colors.warmGray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  idleColors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 28,
    paddingHorizontal: 20,
  },
  idleColorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.creamLight,
    borderWidth: 1,
    borderColor: colors.creamDark,
    borderRadius: radii.full,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  idleColorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  idleColorName: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.charcoal,
  },
  idleHigh: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.marigoldDark,
    marginBottom: 24,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.terracotta,
    borderRadius: radii.lg,
    paddingVertical: 16,
    paddingHorizontal: 40,
    shadowColor: colors.terracottaDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  playBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.white,
  },

  // ── Playing ──
  gameTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  scorePill: {
    backgroundColor: 'rgba(42,139,122,0.12)',
    borderRadius: radii.full,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  scoreText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.teal,
  },

  timerWrap: {
    height: 6,
    backgroundColor: colors.creamDark,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 20,
  },
  timerFill: {
    height: '100%',
    borderRadius: 3,
  },

  promptWrap: {
    alignItems: 'center',
    marginBottom: 20,
  },
  promptLabel: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.warmGray,
    marginBottom: 10,
  },
  colorPreview: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginBottom: 6,
  },
  colorPreviewText: {
    fontFamily: fonts.bold,
    fontSize: 28,
  },
  promptHint: {
    fontFamily: fonts.light,
    fontSize: 13,
    color: colors.warmGrayLight,
    fontStyle: 'italic',
  },

  platformArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  character: {
    marginBottom: -6,
    zIndex: 2,
  },
  characterEmoji: {
    fontSize: 40,
  },
  platform: {
    width: PLATFORM_W,
    height: PLATFORM_H,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  platformText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  nextPlatform: {
    width: PLATFORM_W,
    height: PLATFORM_H,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  shadowPlatform: {
    position: 'absolute',
    width: PLATFORM_W * 0.8,
    height: PLATFORM_H * 0.7,
    borderRadius: 8,
    backgroundColor: colors.creamDark,
  },

  micArea: {
    alignItems: 'center',
    paddingTop: 10,
  },
  liveTranscript: {
    backgroundColor: 'rgba(42,139,122,0.08)',
    borderRadius: radii.md,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  liveTranscriptText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.teal,
  },
  micBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.tealDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  micBtnListening: {
    backgroundColor: colors.terracotta,
  },
  micLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.warmGray,
    marginTop: 6,
  },

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(42,35,32,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  modalCard: {
    backgroundColor: colors.creamLight,
    borderRadius: radii.xxl,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  modalEmoji: { fontSize: 56, marginBottom: 12 },
  modalTitle: {
    fontFamily: fonts.serif,
    fontSize: 28,
    color: colors.charcoal,
    marginBottom: 8,
  },
  modalScore: {
    fontFamily: fonts.bold,
    fontSize: 36,
    color: colors.teal,
    marginBottom: 4,
  },
  modalHighLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.marigoldDark,
    marginBottom: 24,
  },
  modalBtns: {
    flexDirection: 'row',
    gap: 12,
  },
  modalPlayAgain: {
    backgroundColor: colors.terracotta,
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  modalPlayAgainText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.white,
  },
  modalBack: {
    backgroundColor: colors.creamDark,
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  modalBackText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.warmGray,
  },
});
