import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
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
import DillowAvatar from '../components/DillowAvatar';
import { MicIcon, ChevronRightIcon } from '../components/Icons';
import { colors, fonts, radii } from '../theme';

type ChatMessage = {
  id: string;
  text: string;
  source: 'user' | 'agent';
  timestamp: number;
};

const AGENT_ID = process.env.EXPO_PUBLIC_AGENT_ID ?? '';

export default function DillowChatScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [textInput, setTextInput] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [mode, setMode] = useState<'speaking' | 'listening'>('listening');

  const addMessage = useCallback((text: string, source: 'user' | 'agent') => {
    const msg: ChatMessage = {
      id: `${Date.now()}-${Math.random()}`,
      text,
      source,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, msg]);
  }, []);

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to Dillow');
    },
    onDisconnect: () => {
      console.log('Disconnected from Dillow');
    },
    onError: (message: string) => {
      console.error('Conversation error:', message);
    },
    onMessage: (props: { message: string; source: 'user' | 'ai'; role: Role }) => {
      if (props.message) {
        addMessage(props.message, props.role === 'user' ? 'user' : 'agent');
      }
    },
    onModeChange: ({ mode: newMode }: { mode: 'speaking' | 'listening' }) => {
      setMode(newMode);
    },
    onStatusChange: ({ status }: { status: ConversationStatus }) => {
      console.log('Status:', status);
    },
  });

  // Pulse animation for mic button when connected
  useEffect(() => {
    if (conversation.status === 'connected' && mode === 'listening') {
      const pulse = Animated.loop(
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
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [conversation.status, mode]);

  // Ring animation when Dillow is speaking
  useEffect(() => {
    if (conversation.status === 'connected' && mode === 'speaking') {
      const ring = Animated.loop(
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
      ring.start();
      return () => ring.stop();
    } else {
      ringAnim.setValue(0);
    }
  }, [conversation.status, mode]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const startConversation = async () => {
    if (isStarting) return;
    setIsStarting(true);
    try {
      await conversation.startSession({ agentId: AGENT_ID });
    } catch (error) {
      console.error('Failed to start conversation:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const endConversation = async () => {
    try {
      await conversation.endSession();
    } catch (error) {
      console.error('Failed to end conversation:', error);
    }
  };

  const handleSendText = () => {
    const trimmed = textInput.trim();
    if (!trimmed || conversation.status !== 'connected') return;
    conversation.sendUserMessage(trimmed);
    setTextInput('');
    Keyboard.dismiss();
  };

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

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isAgent = item.source === 'agent';
    return (
      <View style={[
        styles.messageRow,
        isAgent ? styles.messageRowAgent : styles.messageRowUser,
      ]}>
        {isAgent && (
          <View style={styles.messageAvatar}>
            <DillowAvatar size={32} />
          </View>
        )}
        <View style={[
          styles.messageBubble,
          isAgent ? styles.agentBubble : styles.userBubble,
        ]}>
          <Text style={[
            styles.messageText,
            isAgent ? styles.agentText : styles.userText,
          ]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  const statusColor = isConnected
    ? colors.teal
    : conversation.status === 'connecting'
    ? colors.marigold
    : colors.warmGrayLight;

  const statusLabel = isConnected
    ? mode === 'speaking'
      ? 'Dillow is speaking...'
      : 'Listening...'
    : conversation.status === 'connecting'
    ? 'Connecting...'
    : 'Tap the mic to start';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ─── Header ─── */}
      <LinearGradient
        colors={[colors.tealDark, colors.teal]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <View style={{ transform: [{ rotate: '180deg' }] }}>
            <ChevronRightIcon size={22} color={colors.cream} />
          </View>
        </Pressable>

        <View style={styles.headerCenter}>
          <DillowAvatar size={40} />
          <View>
            <Text style={styles.headerTitle}>Dillow</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={styles.statusText}>{statusLabel}</Text>
            </View>
          </View>
        </View>

        {isConnected && (
          <Pressable onPress={endConversation} style={styles.endBtn}>
            <Text style={styles.endBtnText}>End</Text>
          </Pressable>
        )}
      </LinearGradient>

      {/* ─── Chat Messages ─── */}
      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
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

        {/* ─── Text Input (visible when connected) ─── */}
        {isConnected && (
          <View style={styles.textInputRow}>
            <TextInput
              style={styles.textInput}
              value={textInput}
              onChangeText={(text) => {
                setTextInput(text);
                if (text.length > 0) {
                  conversation.sendUserActivity();
                }
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
              <ChevronRightIcon size={18} color={colors.white} />
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* ─── Mic Button ─── */}
      <View style={[styles.micArea, { paddingBottom: insets.bottom + 16 }]}>
        {/* Ring animation when speaking */}
        {isConnected && mode === 'speaking' && (
          <Animated.View style={[
            styles.micRing,
            {
              transform: [{ scale: ringScale }],
              opacity: ringOpacity,
            },
          ]} />
        )}

        <Animated.View style={{ transform: [{ scale: isConnected && mode === 'listening' ? pulseAnim : 1 }] }}>
          <Pressable
            onPress={isDisconnected ? startConversation : endConversation}
            style={({ pressed }) => [
              styles.micButton,
              isConnected && styles.micButtonActive,
              isConnected && mode === 'speaking' && styles.micButtonSpeaking,
              pressed && styles.micButtonPressed,
            ]}
            disabled={isStarting || conversation.status === 'connecting'}
          >
            {isStarting || conversation.status === 'connecting' ? (
              <Text style={styles.micButtonLabel}>...</Text>
            ) : (
              <MicIcon
                size={32}
                color={isConnected ? colors.white : colors.cream}
              />
            )}
          </Pressable>
        </Animated.View>

        <Text style={styles.micHint}>
          {isConnected
            ? 'Tap to end conversation'
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
    gap: 12,
  },
  backBtn: {
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

  // ── Messages ──
  messageRow: {
    flexDirection: 'row',
    marginBottom: 14,
    maxWidth: '85%',
  },
  messageRowAgent: {
    alignSelf: 'flex-start',
    alignItems: 'flex-end',
  },
  messageRowUser: {
    alignSelf: 'flex-end',
  },
  messageAvatar: {
    marginRight: 10,
    paddingBottom: 4,
  },
  messageBubble: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    maxWidth: '100%',
  },
  agentBubble: {
    backgroundColor: colors.creamLight,
    borderWidth: 1,
    borderColor: colors.creamDark,
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: colors.terracotta,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  agentText: {
    color: colors.charcoal,
    fontFamily: fonts.regular,
  },
  userText: {
    color: colors.cream,
    fontFamily: fonts.regular,
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
  micButtonActive: {
    backgroundColor: colors.teal,
  },
  micButtonSpeaking: {
    backgroundColor: colors.marigold,
  },
  micButtonPressed: {
    transform: [{ scale: 0.92 }],
  },
  micButtonLabel: {
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
