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
} from 'react-native';
import { useConversation } from '@elevenlabs/react-native';
import type { ConversationStatus, Role } from '@elevenlabs/react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
} from '../components/Icons';
import { colors, fonts } from '../theme';

const AGENT_ID = process.env.EXPO_PUBLIC_AGENT_ID ?? '';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function DillowChatScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;

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
    []
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

  // ── Animations ──

  useEffect(() => {
    if (conversation.status === 'connected' && mode === 'listening') {
      const p = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.12,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      p.start();
      return () => p.stop();
    }
    pulseAnim.setValue(1);
  }, [conversation.status, mode]);

  useEffect(() => {
    if (conversation.status === 'connected' && mode === 'speaking') {
      const r = Animated.loop(
        Animated.sequence([
          Animated.timing(ringAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(ringAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
      r.start();
      return () => r.stop();
    }
    ringAnim.setValue(0);
  }, [conversation.status, mode]);

  useEffect(() => {
    if (messages.length > 0 && showTranscript) {
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        100
      );
    }
  }, [messages.length, showTranscript]);

  // ── Cleanup on unmount / navigate away ──

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
        'The user has paused the conversation. Stay completely silent. Do not respond to any audio until the user resumes.'
      );
    } else {
      conversation.sendContextualUpdate(
        'The user has resumed the conversation. You may respond normally again.'
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

  // ── Derived ──

  const isConnected = conversation.status === 'connected';
  const isDisconnected = conversation.status === 'disconnected';

  const ringScale = ringAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.8],
  });
  const ringOpacity = ringAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0],
  });

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
    : 'Tap the mic to start';

  // ── Render ──

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ─── Header ─── */}
      <LinearGradient
        colors={[colors.tealDark, colors.teal]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Pressable
          onPress={handleGoBack}
          style={styles.headerBtn}
        >
          <View style={{ transform: [{ rotate: '180deg' }] }}>
            <ChevronRightIcon size={22} color={colors.cream} />
          </View>
        </Pressable>

        <View style={styles.headerCenter}>
          <DillowAvatar size={40} />
          <View>
            <Text style={styles.headerTitle}>Dillow</Text>
            <View style={styles.statusRow}>
              <View
                style={[styles.statusDot, { backgroundColor: statusColor }]}
              />
              <Text style={styles.statusText}>{statusLabel}</Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={() => setShowTranscript((v) => !v)}
          style={styles.headerBtn}
        >
          {showTranscript ? (
            <EyeIcon size={20} color={colors.cream} />
          ) : (
            <EyeOffIcon size={20} color={colors.cream} />
          )}
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('Notes')}
          style={styles.headerBtn}
        >
          <NotesIcon size={20} color={colors.cream} />
        </Pressable>

        {isConnected && (
          <Pressable onPress={endConversation} style={styles.endBtn}>
            <Text style={styles.endBtnText}>End</Text>
          </Pressable>
        )}
      </LinearGradient>

      {/* ─── Chat Area ─── */}
      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {showTranscript ? (
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
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <View style={styles.emptyAvatarWrap}>
                  <DillowAvatar size={80} />
                </View>
                <Text style={styles.emptyTitle}>Habla con Dillow</Text>
                <Text style={styles.emptySubtitle}>
                  Tap the microphone below to start a voice conversation.
                  Dillow speaks Spanish and English — just talk naturally.
                </Text>
              </View>
            }
          />
        ) : (
          <View style={styles.hiddenView}>
            <DillowAvatar size={64} />
            <Text style={styles.hiddenTitle}>
              {isConnected ? 'Conversation active' : 'Transcript hidden'}
            </Text>
            <Text style={styles.hiddenHint}>
              Tap the eye icon to show the transcript
            </Text>
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
              style={[
                styles.sendBtn,
                !textInput.trim() && styles.sendBtnDisabled,
              ]}
              disabled={!textInput.trim()}
            >
              <ChevronRightIcon size={18} color={colors.white} />
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* ─── Mic Button ─── */}
      <View style={[styles.micArea, { paddingBottom: insets.bottom + 16 }]}>
        {isConnected && mode === 'speaking' && !isPaused && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.micRing,
              {
                transform: [{ scale: ringScale }],
                opacity: ringOpacity,
              },
            ]}
          />
        )}

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            const s = conversation.status;
            if (s === 'disconnected') {
              startConversation();
            } else if (s === 'connected') {
              togglePause();
            }
          }}
          disabled={isStarting || conversation.status === 'connecting'}
          style={[
            styles.micButton,
            isConnected && !isPaused && styles.micActive,
            isConnected && mode === 'speaking' && !isPaused && styles.micSpeaking,
            isConnected && isPaused && styles.micPaused,
          ]}
        >
          {isStarting || conversation.status === 'connecting' ? (
            <Text style={styles.micLabel}>...</Text>
          ) : isConnected && isPaused ? (
            <PlayIcon size={28} color={colors.cream} />
          ) : (
            <MicIcon
              size={32}
              color={isConnected ? colors.white : colors.cream}
            />
          )}
        </TouchableOpacity>

        <Text style={styles.micHint}>
          {isConnected
            ? isPaused
              ? 'Paused — tap to resume'
              : 'Tap to pause'
            : isStarting
            ? 'Connecting to Dillow...'
            : '¿Sobre qué te gustaría hablar?'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontFamily: fonts.serif,
    fontSize: 20,
    color: colors.cream,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: fonts.light,
    color: 'rgba(245,237,224,0.7)',
  },
  endBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(194,85,58,0.8)',
  },
  endBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.cream,
  },

  // ── Chat Area ──
  chatArea: {
    flex: 1,
  },
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    flexGrow: 1,
  },

  // ── Empty State ──
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emptyAvatarWrap: {
    marginBottom: 24,
    shadowColor: colors.tealDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
  },
  emptyTitle: {
    fontFamily: fonts.serif,
    fontSize: 28,
    color: colors.charcoal,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.warmGray,
    textAlign: 'center',
    lineHeight: 22,
  },

  // ── Hidden Transcript ──
  hiddenView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  hiddenTitle: {
    fontFamily: fonts.serif,
    fontSize: 20,
    color: colors.charcoal,
  },
  hiddenHint: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.warmGray,
  },

  // ── Text Input ──
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
    borderRadius: 20,
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

  // ── Mic Button ──
  micArea: {
    alignItems: 'center',
    paddingTop: 12,
    backgroundColor: colors.cream,
    borderTopWidth: 1,
    borderTopColor: colors.creamDark,
  },
  micPaused: {
    backgroundColor: colors.warmGray,
  },
  micRing: {
    position: 'absolute',
    top: 12,
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: colors.teal,
  },
  micButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.tealDark,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.tealDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  micActive: {
    backgroundColor: colors.teal,
  },
  micSpeaking: {
    backgroundColor: colors.marigold,
  },
  micPressed: {
    transform: [{ scale: 0.92 }],
  },
  micLabel: {
    color: colors.cream,
    fontSize: 24,
    fontFamily: fonts.bold,
  },
  micHint: {
    marginTop: 10,
    fontFamily: fonts.serifItalic,
    fontSize: 14,
    color: colors.warmGray,
  },
});
