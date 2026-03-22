import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  Dimensions,
  Easing,
} from 'react-native';
import { useConversation } from '@elevenlabs/react-native';
import type { ConversationStatus, Role } from '@elevenlabs/react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import {
  MicIcon,
  PlayIcon,
  CloseIcon,
  NotesIcon,
} from '../components/Icons';
import { colors, fonts, radii } from '../theme';

const AGENT_ID = process.env.EXPO_PUBLIC_AGENT_ID ?? '';
const { width: SCREEN_W } = Dimensions.get('window');

type Nav = NativeStackNavigationProp<RootStackParamList>;

/* ══════════════════════════════════════ */
/* ── Animated Wave Ring ─────────────── */
/* ══════════════════════════════════════ */

interface WaveRingProps {
  baseSize: number;
  color: string;
  delay: number;
  isActive: boolean;
  intensity: 'idle' | 'listening' | 'speaking' | 'paused';
}

function WaveRing({ baseSize, color, delay, isActive, intensity }: WaveRingProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    animRef.current?.stop();

    if (!isActive) {
      Animated.parallel([
        Animated.timing(scale, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
      return;
    }

    const maxScale = intensity === 'speaking' ? 1.45 : intensity === 'listening' ? 1.25 : intensity === 'paused' ? 1.08 : 1.15;
    const minScale = intensity === 'speaking' ? 1.1 : intensity === 'listening' ? 1.02 : intensity === 'paused' ? 1.02 : 1.0;
    const dur = intensity === 'speaking' ? 800 : intensity === 'listening' ? 1200 : intensity === 'paused' ? 3000 : 2000;
    const maxOp = intensity === 'speaking' ? 0.5 : intensity === 'listening' ? 0.35 : intensity === 'paused' ? 0.12 : 0.2;

    const t = setTimeout(() => {
      Animated.timing(opacity, { toValue: maxOp, duration: 400, useNativeDriver: true }).start();
      animRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(scale, { toValue: maxScale, duration: dur, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(scale, { toValue: minScale, duration: dur, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      );
      animRef.current.start();
    }, delay);

    return () => { clearTimeout(t); animRef.current?.stop(); };
  }, [isActive, intensity]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: baseSize,
        height: baseSize,
        borderRadius: baseSize / 2,
        borderWidth: intensity === 'speaking' ? 3 : 2,
        borderColor: color,
        opacity,
        transform: [{ scale }],
      }}
    />
  );
}

/* ══════════════════════════════════════ */
/* ── Orb Visualizer ─────────────────── */
/* ══════════════════════════════════════ */

interface OrbProps {
  status: ConversationStatus;
  mode: 'speaking' | 'listening';
  isPaused: boolean;
  onPress: () => void;
}

function DillowOrb({ status, mode, isPaused, onPress }: OrbProps) {
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';
  const breathe = useRef(new Animated.Value(1)).current;

  // Smooth color blend: 0 = teal (listening/idle), 0.5 = warmGray (paused), 1 = marigold (speaking)
  const colorAnim = useRef(new Animated.Value(0)).current;

  const intensity: WaveRingProps['intensity'] = !isConnected
    ? 'idle'
    : isPaused
    ? 'paused'
    : mode === 'speaking'
    ? 'speaking'
    : 'listening';

  const orbSize = 110;
  const ringColors = [
    colors.teal + '60',
    colors.tealLight + '45',
    colors.marigold + '35',
    colors.terracottaLight + '25',
  ];

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1.04, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 1, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, []);

  // Smoothly animate color value when state changes
  useEffect(() => {
    const target = !isConnected
      ? 0
      : isPaused
      ? 0.5
      : mode === 'speaking'
      ? 1
      : 0;

    Animated.timing(colorAnim, {
      toValue: target,
      duration: 600,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false, // color interpolation requires JS driver
    }).start();
  }, [isConnected, isPaused, mode]);

  // Interpolated background color: smooth blend between teal → warmGray → marigold
  const orbBg = colorAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [colors.teal, colors.warmGray, colors.marigold],
  });

  return (
    <View style={orbStyles.container}>
      {ringColors.map((c, i) => (
        <WaveRing
          key={i}
          baseSize={orbSize + 26 + i * 24}
          color={c}
          delay={i * 120}
          isActive={isConnected || isConnecting}
          intensity={isConnecting ? 'idle' : intensity}
        />
      ))}

      {/* Outer: native-driver scale only. Inner: JS-driver backgroundColor — never mix on one node. */}
      <Animated.View
        pointerEvents="none"
        style={[
          orbStyles.glow,
          {
            width: orbSize + 36,
            height: orbSize + 36,
            borderRadius: (orbSize + 36) / 2,
            transform: [{ scale: breathe }],
          },
        ]}
      >
        <Animated.View
          style={{
            width: '100%',
            height: '100%',
            borderRadius: (orbSize + 36) / 2,
            backgroundColor: orbBg,
          }}
        />
      </Animated.View>

      <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
        <Animated.View
          style={{
            width: orbSize,
            height: orbSize,
            borderRadius: orbSize / 2,
            transform: [{ scale: breathe }],
          }}
        >
          <Animated.View
            style={[
              orbStyles.orb,
              {
                flex: 1,
                borderRadius: orbSize / 2,
                backgroundColor: orbBg,
              },
              Platform.select({
                ios: {
                  shadowColor: colors.tealDark,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.4,
                  shadowRadius: 20,
                },
                android: { elevation: 12 },
              }),
            ]}
          >
            {isConnected && isPaused ? (
              <PlayIcon size={28} color={colors.cream} />
            ) : (
              <MicIcon size={30} color={colors.white} />
            )}
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const orbStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  glow: {
    position: 'absolute',
    opacity: 0.12,
  },
  orb: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

/* ══════════════════════════════════════ */
/* ── Live Transcript Text ──────────── */
/* ══════════════════════════════════════ */

interface LiveTextProps {
  text: string;
  speaker: string;
}

function LiveText({ text, speaker }: LiveTextProps) {
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeIn.setValue(0);
    Animated.timing(fadeIn, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, [text]);

  if (!text) return null;

  return (
    <Animated.View style={[liveTextStyles.container, { opacity: fadeIn }]}>
      <Text style={liveTextStyles.text}>
        <Text style={liveTextStyles.speaker}>{speaker}: </Text>
        {text}
      </Text>
    </Animated.View>
  );
}

const liveTextStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 28,
    paddingBottom: 20,
  },
  text: {
    fontFamily: fonts.regular,
    fontSize: 18,
    color: colors.charcoal,
    lineHeight: 26,
  },
  speaker: {
    fontFamily: fonts.bold,
    color: colors.charcoal,
  },
});

/* ══════════════════════════════════════ */
/* ── MAIN SCREEN ────────────────────── */
/* ══════════════════════════════════════ */

export default function DillowChatScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  const [isLive, setIsLive] = useState(false); // true once user taps mic
  const [mode, setMode] = useState<'speaking' | 'listening'>('listening');
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  const sessionActive = useRef(false);

  // Track latest message from each side
  const [latestText, setLatestText] = useState('');
  const [latestSpeaker, setLatestSpeaker] = useState('');

  // Fade for idle → live transition
  const liveOpacity = useRef(new Animated.Value(0)).current;

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to Dillow');
      sessionActive.current = true;
    },
    onDisconnect: () => {
      console.log('Disconnected from Dillow');
      sessionActive.current = false;
      setIsPaused(false);
    },
    onError: (message: string) =>
      console.error('Conversation error:', message),
    onMessage: (props: {
      message: string;
      source: 'user' | 'ai';
      role: Role;
    }) => {
      if (props.message) {
        setLatestText(props.message);
        setLatestSpeaker(props.role === 'user' ? 'You' : 'Dillow');
      }
    },
    onModeChange: ({ mode: m }: { mode: 'speaking' | 'listening' }) =>
      setMode(m),
    onStatusChange: ({ status }: { status: ConversationStatus }) =>
      console.log('Status:', status),
  });

  // Cleanup on unmount
  const conversationRef = useRef(conversation);
  conversationRef.current = conversation;

  useEffect(() => {
    return () => {
      if (sessionActive.current) {
        conversationRef.current.endSession().catch(() => {});
      }
    };
  }, []);

  // ── Actions ──

  const startConversation = async () => {
    // Immediately show live view
    setIsLive(true);
    Animated.timing(liveOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();

    try {
      await conversation.startSession({ agentId: AGENT_ID });
    } catch (e) {
      console.error('Failed to start:', e);
      // If connection fails, go back to idle
      setIsLive(false);
      liveOpacity.setValue(0);
    }
  };

  const endConversation = useCallback(async () => {
    if (!sessionActive.current) return;
    sessionActive.current = false;
    isPausedRef.current = false;
    setIsPaused(false);
    try {
      await conversation.endSession('user');
    } catch (e) {
      console.error('End session error:', e);
    }
    // Go back to idle view
    Animated.timing(liveOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
      setIsLive(false);
      setLatestText('');
      setLatestSpeaker('');
    });
  }, [conversation, liveOpacity]);

  const handleGoBack = useCallback(() => {
    if (sessionActive.current) {
      conversation.endSession('user').catch(() => {});
      sessionActive.current = false;
    }
    navigation.goBack();
  }, [conversation, navigation]);

  const pauseDebounce = useRef(false);
  const togglePause = useCallback(() => {
    if (!sessionActive.current || pauseDebounce.current) return;
    pauseDebounce.current = true;
    setTimeout(() => { pauseDebounce.current = false; }, 800);

    const next = !isPausedRef.current;
    isPausedRef.current = next;
    setIsPaused(next);
    try {
      conversation.setMicMuted(next);
    } catch {}
    if (next) {
      conversation.sendContextualUpdate(
        'The user has paused the conversation. Stay completely silent. Do not respond to any audio until the user resumes.',
      );
    } else {
      conversation.sendContextualUpdate(
        'The user has resumed the conversation. You may respond normally again.',
      );
    }
  }, [conversation]);

  const handleOrbPress = () => {
    const s = conversation.status;
    if (s === 'disconnected') startConversation();
    else if (s === 'connected') togglePause();
  };

  // ── Derived ──

  const isConnected = conversation.status === 'connected';
  const isConnecting = conversation.status === 'connecting';

  const statusLabel = isConnected
    ? isPaused
      ? 'Paused'
      : mode === 'speaking'
      ? 'Dillow is speaking...'
      : 'Listening...'
    : isConnecting
    ? 'Connecting...'
    : '';

  const statusColor = isConnected
    ? isPaused
      ? colors.marigold
      : colors.teal
    : isConnecting
    ? colors.marigold
    : colors.warmGrayLight;

  // ── Render ──

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ─── Header ─── */}
      <View style={styles.header}>
        <Pressable onPress={handleGoBack} hitSlop={12} style={styles.headerBtn}>
          <CloseIcon size={20} color={colors.charcoal} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Dillow</Text>
          {statusLabel ? (
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={styles.statusText}>{statusLabel}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.headerActions}>
          <Pressable onPress={() => navigation.navigate('Notes')} style={styles.headerBtn}>
            <NotesIcon size={18} color={colors.charcoal} />
          </Pressable>
          {isLive && (
            <Pressable onPress={endConversation} style={styles.endBtn}>
              <Text style={styles.endBtnText}>End</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* ─── Idle View (pre-conversation) ─── */}
      {!isLive && (
        <View style={styles.idleView}>
          <View style={styles.idleText}>
            <Text style={styles.idleTitle}>Habla con Dillow</Text>
            <Text style={styles.idleSub}>
              Tap the mic to start a voice conversation.{'\n'}
              Spanish or English — just talk naturally.
            </Text>
          </View>

          <DillowOrb
            status={conversation.status}
            mode={mode}
            isPaused={isPaused}
            onPress={handleOrbPress}
          />

          <View style={[styles.idleFooter, { paddingBottom: insets.bottom + 12 }]}>
            <Text style={styles.idleFooterText}>¿Sobre qué te gustaría hablar?</Text>
          </View>
        </View>
      )}

      {/* ─── Live View (Gemini-style) ─── */}
      {isLive && (
        <Animated.View style={[styles.liveView, { opacity: liveOpacity }]}>
          {/* Spacer pushes text + orb to bottom */}
          <View style={{ flex: 1 }} />

          {/* Latest transcript text — Gemini style */}
          <LiveText text={latestText} speaker={latestSpeaker} />

          {/* Orb */}
          <DillowOrb
            status={conversation.status}
            mode={mode}
            isPaused={isPaused}
            onPress={handleOrbPress}
          />

          {/* Bottom hint */}
          <View style={[styles.liveFooter, { paddingBottom: insets.bottom + 12 }]}>
            <Text style={styles.liveFooterText}>
              {isPaused ? 'Paused — tap orb to resume' : isConnecting ? 'Connecting...' : 'Tap orb to pause'}
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

/* ══════════════════════════════════════ */
/* ── STYLES ─────────────────────────── */
/* ══════════════════════════════════════ */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },

  /* ── Header ── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.creamDark,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.creamLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontFamily: fonts.serif,
    fontSize: 22,
    color: colors.charcoal,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 1,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusText: {
    fontSize: 12,
    fontFamily: fonts.light,
    color: colors.warmGray,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  endBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.full,
    backgroundColor: colors.terracotta,
  },
  endBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.white,
  },

  /* ── Idle view ── */
  idleView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  idleText: {
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 16,
  },
  idleTitle: {
    fontFamily: fonts.serif,
    fontSize: 28,
    color: colors.charcoal,
    marginBottom: 10,
  },
  idleSub: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.warmGray,
    textAlign: 'center',
    lineHeight: 22,
  },
  idleFooter: {
    alignItems: 'center',
    marginTop: 20,
  },
  idleFooterText: {
    fontFamily: fonts.serifItalic,
    fontSize: 14,
    color: colors.warmGray,
  },

  /* ── Live view ── */
  liveView: {
    flex: 1,
  },
  liveFooter: {
    alignItems: 'center',
    paddingTop: 8,
  },
  liveFooterText: {
    fontFamily: fonts.light,
    fontSize: 13,
    color: colors.warmGray,
  },
});
