import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Keyboard,
  Dimensions,
  Easing,
} from 'react-native';
import { useConversation } from '@elevenlabs/react-native';
import type { ConversationStatus, Role } from '@elevenlabs/react-native';
import Svg, { Path, Circle as SvgCircle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import DillowAvatar from '../components/DillowAvatar';
import TranscriptBubble from '../components/TranscriptBubble';
import type { ChatMessage } from '../components/TranscriptBubble';
import SuggestionBar from '../components/SuggestionBar';
import {
  MicIcon,
  ChevronRightIcon,
  EyeIcon,
  EyeOffIcon,
  NotesIcon,
  PlayIcon,
  CloseIcon,
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
  isStarting: boolean;
  onPress: () => void;
  compact?: boolean;
}

function DillowOrb({ status, mode, isPaused, isStarting, onPress, compact }: OrbProps) {
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';
  const breathe = useRef(new Animated.Value(1)).current;

  const intensity: WaveRingProps['intensity'] = !isConnected
    ? 'idle'
    : isPaused
    ? 'paused'
    : mode === 'speaking'
    ? 'speaking'
    : 'listening';

  const orbSize = compact ? 100 : 140;
  const ringColors = [
    colors.teal + '60',
    colors.tealLight + '45',
    colors.marigold + '35',
    colors.terracottaLight + '25',
  ];

  // Gentle idle breathe for the orb itself
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

  const orbBg = isConnected
    ? isPaused
      ? colors.warmGray
      : mode === 'speaking'
      ? colors.marigold
      : colors.teal
    : isConnecting
    ? colors.warmGray
    : colors.tealDark;

  return (
    <View style={[orbStyles.container, compact && { paddingVertical: 16 }]}>
      {/* Wave rings */}
      {ringColors.map((c, i) => (
        <WaveRing
          key={i}
          baseSize={orbSize + 30 + i * 28}
          color={c}
          delay={i * 120}
          isActive={isConnected}
          intensity={intensity}
        />
      ))}

      {/* Outer glow */}
      <Animated.View
        pointerEvents="none"
        style={[
          orbStyles.glow,
          {
            width: orbSize + 40,
            height: orbSize + 40,
            borderRadius: (orbSize + 40) / 2,
            backgroundColor: orbBg,
            transform: [{ scale: breathe }],
          },
        ]}
      />

      {/* Main orb */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        disabled={isStarting || isConnecting}
      >
        <Animated.View
          style={[
            orbStyles.orb,
            {
              width: orbSize,
              height: orbSize,
              borderRadius: orbSize / 2,
              backgroundColor: orbBg,
              transform: [{ scale: breathe }],
            },
            Platform.select({
              ios: { shadowColor: orbBg, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 20 },
              android: { elevation: 12 },
            }),
          ]}
        >
          {isStarting || isConnecting ? (
            <Text style={orbStyles.dots}>...</Text>
          ) : isConnected && isPaused ? (
            <PlayIcon size={compact ? 26 : 32} color={colors.cream} />
          ) : (
            <MicIcon size={compact ? 28 : 36} color={colors.white} />
          )}
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const orbStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  glow: {
    position: 'absolute',
    opacity: 0.12,
  },
  orb: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    color: colors.cream,
    fontSize: 28,
    fontFamily: fonts.bold,
  },
});

/* ══════════════════════════════════════ */
/* ── MAIN SCREEN ────────────────────── */
/* ══════════════════════════════════════ */

export default function DillowChatScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [textInput, setTextInput] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [mode, setMode] = useState<'speaking' | 'listening'>('listening');
  const [showTranscript, setShowTranscript] = useState(true);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  const sessionActive = useRef(false);

  const addMessage = useCallback(
    (text: string, source: 'user' | 'agent') => {
      const msg: ChatMessage = {
        id: `${Date.now()}-${Math.random()}`,
        text,
        source,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, msg]);
    },
    [],
  );

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
        addMessage(props.message, props.role === 'user' ? 'user' : 'agent');
      }
    },
    onModeChange: ({ mode: m }: { mode: 'speaking' | 'listening' }) =>
      setMode(m),
    onStatusChange: ({ status }: { status: ConversationStatus }) =>
      console.log('Status:', status),
  });

  useEffect(() => {
    if (messages.length > 0 && showTranscript) {
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        100,
      );
    }
  }, [messages.length, showTranscript]);

  // ── Cleanup on unmount ──
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
    if (isStarting) return;
    setIsStarting(true);
    try {
      await conversation.startSession({ agentId: AGENT_ID });
    } catch (e) {
      console.error('Failed to start:', e);
    } finally {
      setIsStarting(false);
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
  }, [conversation]);

  const handleGoBack = useCallback(() => {
    endConversation();
    navigation.goBack();
  }, [endConversation, navigation]);

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

  const handleSendText = () => {
    const t = textInput.trim();
    if (!t || conversation.status !== 'connected') return;
    conversation.sendUserMessage(t);
    setTextInput('');
    Keyboard.dismiss();
  };

  const handleOrbPress = () => {
    const s = conversation.status;
    if (s === 'disconnected') startConversation();
    else if (s === 'connected') togglePause();
  };

  // ── Derived ──

  const isConnected = conversation.status === 'connected';
  const isDisconnected = conversation.status === 'disconnected';

  const statusColor = isConnected
    ? isPaused
      ? colors.marigold
      : colors.teal
    : conversation.status === 'connecting'
    ? colors.marigold
    : colors.warmGrayLight;

  const statusLabel = isConnected
    ? isPaused
      ? 'Paused'
      : mode === 'speaking'
      ? 'Dillow is speaking...'
      : 'Listening...'
    : conversation.status === 'connecting'
    ? 'Connecting...'
    : '';

  const hasMessages = messages.length > 0;

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
          {isConnected && (
            <Pressable onPress={() => setShowTranscript((v) => !v)} style={styles.headerBtn}>
              {showTranscript ? (
                <EyeIcon size={18} color={colors.charcoal} />
              ) : (
                <EyeOffIcon size={18} color={colors.charcoal} />
              )}
            </Pressable>
          )}
          <Pressable onPress={() => navigation.navigate('Notes')} style={styles.headerBtn}>
            <NotesIcon size={18} color={colors.charcoal} />
          </Pressable>
          {isConnected && (
            <Pressable onPress={endConversation} style={styles.endBtn}>
              <Text style={styles.endBtnText}>End</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* ─── Main Content ─── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Orb + transcript layout */}
        {!hasMessages || !showTranscript ? (
          /* ── Full orb view (pre-conversation or transcript hidden) ── */
          <View style={styles.orbFullView}>
            <DillowOrb
              status={conversation.status}
              mode={mode}
              isPaused={isPaused}
              isStarting={isStarting}
              onPress={handleOrbPress}
            />

            {!isConnected && !isStarting && (
              <View style={styles.idleText}>
                <Text style={styles.idleTitle}>Habla con Dillow</Text>
                <Text style={styles.idleSub}>
                  Tap the mic to start a voice conversation.{'\n'}
                  Spanish or English — just talk naturally.
                </Text>
              </View>
            )}

            {isConnected && (
              <Text style={styles.orbHint}>
                {isPaused ? 'Paused — tap to resume' : 'Tap to pause'}
              </Text>
            )}
          </View>
        ) : (
          /* ── Compact orb + transcript ── */
          <View style={{ flex: 1 }}>
            {/* Compact orb at top */}
            <DillowOrb
              status={conversation.status}
              mode={mode}
              isPaused={isPaused}
              isStarting={isStarting}
              onPress={handleOrbPress}
              compact
            />

            {/* Transcript */}
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={({ item }) => (
                <TranscriptBubble
                  message={item}
                  isActive={activeMessageId === item.id}
                  onActivate={() => setActiveMessageId(item.id)}
                />
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messageList}
              showsVerticalScrollIndicator={false}
              onScrollBeginDrag={() => setActiveMessageId(null)}
              style={{ flex: 1 }}
            />
          </View>
        )}

        {/* ─── Suggestions ─── */}
        {isConnected && <SuggestionBar />}

        {/* ─── Text Input ─── */}
        {isConnected && showTranscript && (
          <View style={styles.textInputRow}>
            <TextInput
              style={styles.textInput}
              value={textInput}
              onChangeText={(t) => {
                setTextInput(t);
                if (t.length > 0) conversation.sendUserActivity();
              }}
              placeholder="Or type a message..."
              placeholderTextColor={colors.warmGrayLight}
              returnKeyType="send"
              onSubmitEditing={handleSendText}
              blurOnSubmit
            />
            <Pressable
              onPress={handleSendText}
              style={[styles.sendBtn, !textInput.trim() && styles.sendBtnDisabled]}
              disabled={!textInput.trim()}
            >
              <ChevronRightIcon size={16} color={colors.white} />
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* ─── Bottom hint (when no text input shown) ─── */}
      {(!isConnected || !showTranscript) && (
        <View style={[styles.bottomHint, { paddingBottom: insets.bottom + 12 }]}>
          <Text style={styles.bottomHintText}>
            {isConnected
              ? isPaused
                ? 'Conversation paused'
                : mode === 'speaking'
                ? '🦜 Dillow is speaking...'
                : '🎙 Listening...'
              : isStarting
              ? 'Connecting to Dillow...'
              : '¿Sobre qué te gustaría hablar?'}
          </Text>
        </View>
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

  /* ── Orb full view ── */
  orbFullView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  idleText: {
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 8,
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
  orbHint: {
    fontFamily: fonts.light,
    fontSize: 13,
    color: colors.warmGray,
    marginTop: 8,
  },

  /* ── Messages ── */
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    flexGrow: 1,
  },

  /* ── Text Input ── */
  textInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.creamDark,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.creamLight,
    borderRadius: radii.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.charcoal,
    borderWidth: 1,
    borderColor: colors.creamDark,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: colors.warmGrayLight,
  },

  /* ── Bottom hint ── */
  bottomHint: {
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.creamDark,
  },
  bottomHintText: {
    fontFamily: fonts.serifItalic,
    fontSize: 14,
    color: colors.warmGray,
  },
});
