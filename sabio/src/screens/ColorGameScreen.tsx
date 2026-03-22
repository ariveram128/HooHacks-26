import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Modal,
  Platform as RNPlatform,
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
import { transcriptMatchesColor } from '../utils/similarity';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

type Nav = NativeStackNavigationProp<RootStackParamList>;
type GameState = 'idle' | 'playing' | 'gameover';

// ── Platform generation ──
const PLAT_W = SCREEN_W * 0.42;
const PLAT_H = 24;
const STEP_Y = 90; // vertical spacing between platforms
const MAX_OFFSET_X = (SCREEN_W - PLAT_W) / 2 - 16;

interface PlatformData {
  id: number;
  color: GameColor;
  x: number; // center-based offset from screen center
  y: number; // world Y (increases upward)
}

function pickRandom(exclude?: string): GameColor {
  const pool = exclude ? GAME_COLORS.filter((c) => c.name !== exclude) : GAME_COLORS;
  return pool[Math.floor(Math.random() * pool.length)];
}

function generatePlatform(id: number, prevX: number, prevColor?: string): PlatformData {
  // Alternate sides with some randomness for natural feel
  const direction = id % 2 === 0 ? 1 : -1;
  const randomOffset = (Math.random() * 0.6 + 0.4) * MAX_OFFSET_X * direction;
  const x = Math.max(-MAX_OFFSET_X, Math.min(MAX_OFFSET_X, randomOffset));
  return {
    id,
    color: pickRandom(prevColor),
    x,
    y: id * STEP_Y,
  };
}

function generateInitialPlatforms(count: number): PlatformData[] {
  const plats: PlatformData[] = [];
  for (let i = 0; i < count; i++) {
    plats.push(generatePlatform(i, i > 0 ? plats[i - 1].x : 0, i > 0 ? plats[i - 1].color.name : undefined));
  }
  return plats;
}

// ── Character component ──
function GameCharacter({ style }: { style: any }) {
  return (
    <Animated.View style={[charStyles.wrap, style]}>
      <View style={charStyles.body}>
        <View style={charStyles.eyeLeft} />
        <View style={charStyles.eyeRight} />
      </View>
    </Animated.View>
  );
}

const CHAR_SIZE = 32;
const charStyles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    width: CHAR_SIZE,
    height: CHAR_SIZE,
    zIndex: 10,
  },
  body: {
    width: CHAR_SIZE,
    height: CHAR_SIZE,
    borderRadius: CHAR_SIZE / 2,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
    ...RNPlatform.select({
      ios: { shadowColor: colors.tealDark, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 6 },
      android: { elevation: 6 },
    }),
  },
  eyeLeft: {
    width: 5,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
  },
  eyeRight: {
    width: 5,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
  },
});

// ── Timing ──
const TIMER_INITIAL = 4500;
const TIMER_MIN = 1800;
const TIMER_DECAY = 120;

export default function ColorGameScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [highScore, setHigh] = useState(0);
  const [isNewHigh, setIsNewHigh] = useState(false);
  const [platforms, setPlatforms] = useState<PlatformData[]>([]);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [clipHeight, setClipHeight] = useState(SCREEN_H * 0.5);

  // ── Refs so callbacks always read fresh state ──
  const gameStateRef = useRef<GameState>('idle');
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const bestComboRef = useRef(0);
  const platformsRef = useRef<PlatformData[]>([]);
  const currentLevelRef = useRef(0);
  const recognizingRef = useRef(false);
  const gameActiveRef = useRef(false);
  const jumpingRef = useRef(false);

  const timerDuration = useRef(TIMER_INITIAL);
  const timerRef = useRef<Animated.CompositeAnimation | null>(null);
  const timerBar = useRef(new Animated.Value(1)).current;

  // Camera scroll (world Y offset)
  const cameraY = useRef(new Animated.Value(0)).current;

  // Character position
  const charX = useRef(new Animated.Value(0)).current;
  const charY = useRef(new Animated.Value(0)).current;

  // Effects
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const comboScale = useRef(new Animated.Value(0)).current;
  const fallAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getProgress().then((p) => setHigh(p.colorGameHighScore));
  }, []);

  // ── Speech (always-on while playing, auto-restarts) ──
  useSpeechRecognitionEvent('start', () => {
    setRecognizing(true);
    recognizingRef.current = true;
  });
  useSpeechRecognitionEvent('end', () => {
    setRecognizing(false);
    recognizingRef.current = false;
    // Auto-restart if the game is still running
    if (gameActiveRef.current) {
      setTimeout(() => startListening(), 150);
    }
  });
  useSpeechRecognitionEvent('result', (event) => {
    if (!gameActiveRef.current) return;
    const text = event.results[0]?.transcript ?? '';
    setTranscript(text);
    // Check on every result (interim AND final) so correct answers register immediately
    if (text.trim()) checkAnswer(text);
  });
  useSpeechRecognitionEvent('error', () => {
    setRecognizing(false);
    recognizingRef.current = false;
    if (gameActiveRef.current) {
      setTimeout(() => startListening(), 300);
    }
  });

  const startListening = () => {
    if (recognizingRef.current) return;
    setTranscript('');
    ExpoSpeechRecognitionModule.requestPermissionsAsync().then((perm) => {
      if (!perm.granted || !gameActiveRef.current) return;
      ExpoSpeechRecognitionModule.start({
        lang: 'es-ES',
        interimResults: true,
        continuous: false, // one utterance per session → auto-restarts cleanly
      });
    });
  };

  // ── Timer ──
  const startTimer = () => {
    timerBar.setValue(1);
    const dur = Math.max(timerDuration.current, TIMER_MIN);
    timerRef.current = Animated.timing(timerBar, {
      toValue: 0,
      duration: dur,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    timerRef.current.start(({ finished }) => {
      if (finished && gameActiveRef.current) endGame();
    });
  };

  const stopTimer = () => {
    timerRef.current?.stop();
  };

  // ── Game logic (all reads from refs to avoid stale closures) ──
  const checkAnswer = (spoken: string) => {
    if (gameStateRef.current !== 'playing') return;
    if (jumpingRef.current) return;
    const level = currentLevelRef.current;
    const plats = platformsRef.current;
    const nextPlat = plats[level + 1];
    if (!nextPlat) return;

    const correct = transcriptMatchesColor(spoken, nextPlat.color.name, {
      english: nextPlat.color.english,
      threshold: 0.68,
      wordThreshold: 0.78,
    });

    if (correct) {
      jumpingRef.current = true;
      stopTimer();
      handleCorrect();
    } else {
      // Shake feedback
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
      comboRef.current = 0;
      setCombo(0);
    }
  };

  const handleCorrect = () => {
    const level = currentLevelRef.current;
    const plats = platformsRef.current;
    const nextLevel = level + 1;
    const nextPlat = plats[nextLevel];
    if (!nextPlat) return;

    const newCombo = comboRef.current + 1;
    const points = 1 + Math.floor(newCombo / 3);
    const newScore = scoreRef.current + points;

    scoreRef.current = newScore;
    comboRef.current = newCombo;
    currentLevelRef.current = nextLevel;
    if (newCombo > bestComboRef.current) bestComboRef.current = newCombo;
    timerDuration.current = Math.max(timerDuration.current - TIMER_DECAY, TIMER_MIN);

    // Sync UI state
    setScore(newScore);
    setCombo(newCombo);
    setCurrentLevel(nextLevel);
    setTranscript('');

    // Combo popup
    if (newCombo >= 3 && newCombo % 3 === 0) {
      comboScale.setValue(0);
      Animated.sequence([
        Animated.spring(comboScale, { toValue: 1, friction: 4, useNativeDriver: true }),
        Animated.delay(800),
        Animated.timing(comboScale, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }

    // Jump character to next platform (parabolic arc)
    const targetX = nextPlat.x;
    const jumpDuration = 400;

    Animated.parallel([
      Animated.timing(charX, {
        toValue: targetX,
        duration: jumpDuration,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(charY, {
          toValue: nextPlat.y + STEP_Y * 0.4,
          duration: jumpDuration * 0.5,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(charY, {
          toValue: nextPlat.y,
          duration: jumpDuration * 0.5,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(cameraY, {
        toValue: nextPlat.y,
        duration: jumpDuration + 100,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      jumpingRef.current = false;
      // Generate more platforms ahead if needed
      const lvl = currentLevelRef.current;
      const curPlats = platformsRef.current;
      if (lvl >= curPlats.length - 3) {
        setPlatforms((prev) => {
          const newPlats = [...prev];
          for (let i = 0; i < 5; i++) {
            const prevP = newPlats[newPlats.length - 1];
            newPlats.push(generatePlatform(prevP.id + 1, prevP.x, prevP.color.name));
          }
          platformsRef.current = newPlats;
          return newPlats;
        });
      }
      if (gameActiveRef.current) startTimer();
    });
  };

  const endGame = async () => {
    gameActiveRef.current = false;
    gameStateRef.current = 'gameover';
    stopTimer();
    setTranscript('');
    if (recognizingRef.current) ExpoSpeechRecognitionModule.stop();

    // Fall animation
    Animated.timing(fallAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start();

    const finalScore = scoreRef.current;
    if (finalScore > highScore) {
      setHigh(finalScore);
      setIsNewHigh(true);
      await setHighScore(finalScore);
    } else {
      setIsNewHigh(false);
    }

    setTimeout(() => setGameState('gameover'), 700);
  };

  const startGame = async () => {
    // Reset refs
    scoreRef.current = 0;
    comboRef.current = 0;
    bestComboRef.current = 0;
    currentLevelRef.current = 0;
    jumpingRef.current = false;

    // Reset state
    setScore(0);
    setCombo(0);
    setIsNewHigh(false);
    setCurrentLevel(0);
    timerDuration.current = TIMER_INITIAL;
    fallAnim.setValue(0);

    const plats = generateInitialPlatforms(8);
    setPlatforms(plats);
    platformsRef.current = plats;

    // Place character on first platform
    charX.setValue(plats[0].x);
    charY.setValue(plats[0].y);
    cameraY.setValue(0);
    shakeAnim.setValue(0);

    gameStateRef.current = 'playing';
    setGameState('playing');
    setTranscript('');
    gameActiveRef.current = true;

    setTimeout(() => {
      startTimer();
      startListening();
    }, 600);
  };

  const timerColor = timerBar.interpolate({
    inputRange: [0, 0.3, 0.6, 1],
    outputRange: [colors.terracotta, colors.terracotta, colors.marigold, colors.teal],
  });

  const nextPlatform = platforms[currentLevel + 1];

  // ── IDLE ──
  if (gameState === 'idle') {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
        <View style={styles.idleHeader}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <ChevronLeftIcon size={24} color={colors.charcoal} />
          </Pressable>
        </View>
        <View style={styles.idleCenter}>
          <View style={styles.idleTitleRow}>
            <View style={charStyles.body}>
              <View style={charStyles.eyeLeft} />
              <View style={charStyles.eyeRight} />
            </View>
            <Text style={styles.idleTitle}>Plataformas</Text>
          </View>
          <Text style={styles.idleSub}>
            Say the color of the next platform{'\n'}in Spanish to jump higher!
          </Text>

          <View style={styles.idleColors}>
            {GAME_COLORS.slice(0, 8).map((c) => (
              <View key={c.name} style={styles.idleColorChip}>
                <View style={[styles.idleColorDot, { backgroundColor: c.hex }]} />
                <Text style={styles.idleColorName}>{c.name}</Text>
              </View>
            ))}
          </View>

          {highScore > 0 && (
            <Text style={styles.idleHigh}>Best: {highScore}</Text>
          )}

          <Pressable
            onPress={startGame}
            style={({ pressed }) => [styles.playBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}
          >
            <PlayIcon size={22} color={colors.white} />
            <Text style={styles.playBtnText}>Play</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ── PLAYING + GAMEOVER ──

  // Platform 0 appears at ~60% down the clip area; camera scrolls everything
  const basePlatY = Math.round(clipHeight * 0.6);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12 }]}>
      {/* Top HUD */}
      <View style={styles.hud}>
        <Pressable onPress={() => endGame()} hitSlop={12}>
          <ChevronLeftIcon size={22} color={colors.charcoal} />
        </Pressable>

        <View style={styles.hudCenter}>
          <Text style={styles.hudScore}>{score}</Text>
          <Text style={styles.hudLabel}>SCORE</Text>
        </View>

        {combo >= 3 && (
          <Animated.View style={[styles.comboBadge, { transform: [{ scale: comboScale.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }]}>
            <Text style={styles.comboText}>{combo}x</Text>
          </Animated.View>
        )}

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

      {/* Color prompt */}
      {nextPlatform && (
        <View style={styles.promptRow}>
          <Text style={styles.promptLabel}>Say:</Text>
          <View style={[styles.promptSwatch, { backgroundColor: nextPlatform.color.hex }]} />
          <Text style={styles.promptEnglish}>({nextPlatform.color.english})</Text>
        </View>
      )}

      {/* Game world */}
      <View
        style={styles.worldClip}
        onLayout={(e) => setClipHeight(e.nativeEvent.layout.height)}
      >
        <Animated.View
          style={[
            styles.world,
            {
              transform: [
                { translateX: shakeAnim },
                { translateY: cameraY },
              ],
            },
          ]}
        >
          {/* Platforms */}
          {platforms.map((plat) => {
            const isCurrent = plat.id === currentLevel;
            const isNext = plat.id === currentLevel + 1;
            const platOpacity = plat.id < currentLevel - 2 ? 0.2 : plat.id < currentLevel ? 0.5 : 1;

            return (
              <View
                key={plat.id}
                style={[
                  styles.platform,
                  {
                    backgroundColor: plat.color.hex,
                    left: SCREEN_W / 2 - PLAT_W / 2 + plat.x,
                    top: basePlatY - plat.y,
                    opacity: platOpacity,
                    borderWidth: isNext ? 2 : 0,
                    borderColor: isNext ? colors.charcoal + '30' : 'transparent',
                  },
                ]}
              >
                {isNext && (
                  <Text style={[styles.platText, { color: plat.color.hex === '#2C3E50' || plat.color.hex === '#8E44AD' ? colors.white : colors.charcoal }]}>
                    ?
                  </Text>
                )}
                {isCurrent && (
                  <Text style={[styles.platText, { color: plat.color.hex === '#2C3E50' || plat.color.hex === '#8E44AD' ? colors.white : colors.charcoal, fontSize: 10 }]}>
                    {plat.color.name}
                  </Text>
                )}
              </View>
            );
          })}

          {/* Character */}
          <Animated.View
            style={{
              position: 'absolute',
              left: SCREEN_W / 2 - CHAR_SIZE / 2,
              top: basePlatY - CHAR_SIZE,
              transform: [
                { translateX: charX },
                { translateY: Animated.multiply(charY, -1) },
                { translateY: fallAnim.interpolate({ inputRange: [0, 1], outputRange: [0, SCREEN_H] }) },
              ],
              zIndex: 10,
            }}
          >
            <View style={charStyles.body}>
              <View style={charStyles.eyeLeft} />
              <View style={charStyles.eyeRight} />
            </View>
          </Animated.View>
        </Animated.View>
      </View>

      {/* Listening indicator + transcript */}
      <View style={[styles.micArea, { paddingBottom: insets.bottom + 16 }]}>
        {transcript.length > 0 && (
          <View style={styles.liveTranscript}>
            <Text style={styles.liveTranscriptText}>{transcript}</Text>
          </View>
        )}
        <View style={styles.micRow}>
          <View style={[styles.micIndicator, recognizing && styles.micIndicatorActive]}>
            <MicIcon size={18} color={recognizing ? colors.white : colors.warmGray} />
          </View>
          <Text style={styles.micLabel}>
            {recognizing ? 'Listening...' : 'Starting...'}
          </Text>
        </View>
      </View>

      {/* Game Over Modal */}
      <Modal visible={gameState === 'gameover'} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEmoji}>{isNewHigh ? '🎉' : '🏔️'}</Text>
            <Text style={styles.modalTitle}>
              {isNewHigh ? '¡Nuevo récord!' : '¡Buen intento!'}
            </Text>

            <View style={styles.modalStatsRow}>
              <View style={styles.modalStat}>
                <Text style={styles.modalStatValue}>{score}</Text>
                <Text style={styles.modalStatLabel}>Score</Text>
              </View>
              <View style={styles.modalStatDivider} />
              <View style={styles.modalStat}>
                <Text style={styles.modalStatValue}>{currentLevel}</Text>
                <Text style={styles.modalStatLabel}>Height</Text>
              </View>
              <View style={styles.modalStatDivider} />
              <View style={styles.modalStat}>
                <Text style={styles.modalStatValue}>{bestComboRef.current}</Text>
                <Text style={styles.modalStatLabel}>Best Combo</Text>
              </View>
            </View>

            {isNewHigh && <Text style={styles.modalHighLabel}>New high score!</Text>}
            {!isNewHigh && highScore > 0 && <Text style={styles.modalHighLabel}>Best: {highScore}</Text>}

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
  },

  // ── Idle ──
  idleHeader: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20 },
  idleCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  idleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  idleTitle: {
    fontFamily: fonts.serif,
    fontSize: 36,
    color: colors.charcoal,
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
    gap: 8,
    marginBottom: 28,
    paddingHorizontal: 30,
  },
  idleColorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.creamLight,
    borderWidth: 1,
    borderColor: colors.creamDark,
    borderRadius: radii.full,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  idleColorDot: { width: 12, height: 12, borderRadius: 6 },
  idleColorName: { fontFamily: fonts.medium, fontSize: 12, color: colors.charcoal },
  idleHigh: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.marigoldDark,
    marginBottom: 20,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.terracotta,
    borderRadius: radii.lg,
    paddingVertical: 16,
    paddingHorizontal: 40,
    ...RNPlatform.select({
      ios: { shadowColor: colors.terracottaDark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
  playBtnText: { fontFamily: fonts.semiBold, fontSize: 18, color: colors.white },

  // ── HUD ──
  hud: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  hudCenter: { alignItems: 'center' },
  hudScore: {
    fontFamily: fonts.bold,
    fontSize: 32,
    color: colors.charcoal,
    lineHeight: 36,
  },
  hudLabel: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.warmGray,
    letterSpacing: 2,
  },
  comboBadge: {
    backgroundColor: colors.marigold,
    borderRadius: radii.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  comboText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.white,
  },

  // ── Timer ──
  timerWrap: {
    height: 5,
    backgroundColor: colors.creamDark,
    borderRadius: 3,
    overflow: 'hidden',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  timerFill: { height: '100%', borderRadius: 3 },

  // ── Prompt ──
  promptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 8,
  },
  promptLabel: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.warmGray,
  },
  promptSwatch: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  promptEnglish: {
    fontFamily: fonts.light,
    fontSize: 13,
    color: colors.warmGrayLight,
    fontStyle: 'italic',
  },

  // ── World ──
  worldClip: {
    flex: 1,
    overflow: 'hidden',
  },
  world: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
  platform: {
    position: 'absolute',
    width: PLAT_W,
    height: PLAT_H,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...RNPlatform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  platText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    letterSpacing: 1,
  },

  // ── Mic area ──
  micArea: {
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.creamDark,
  },
  liveTranscript: {
    backgroundColor: 'rgba(42,139,122,0.08)',
    borderRadius: radii.md,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  liveTranscriptText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.teal,
  },
  micRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  micIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micIndicatorActive: { backgroundColor: colors.teal },
  micLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.warmGray,
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
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  modalEmoji: { fontSize: 48, marginBottom: 10 },
  modalTitle: {
    fontFamily: fonts.serif,
    fontSize: 26,
    color: colors.charcoal,
    marginBottom: 16,
  },
  modalStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalStat: { alignItems: 'center', paddingHorizontal: 16 },
  modalStatValue: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.teal,
  },
  modalStatLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.warmGray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.creamDark,
  },
  modalHighLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.marigoldDark,
    marginBottom: 20,
  },
  modalBtns: { flexDirection: 'row', gap: 12 },
  modalPlayAgain: {
    backgroundColor: colors.terracotta,
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  modalPlayAgainText: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.white },
  modalBack: {
    backgroundColor: colors.creamDark,
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  modalBackText: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.warmGray },
});
