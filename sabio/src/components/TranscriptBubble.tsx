import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  LayoutRectangle,
  ActivityIndicator,
} from 'react-native';
import DillowAvatar from './DillowAvatar';
import { colors, fonts } from '../theme';
import { translateText, isLikelySpanish } from '../utils/translate';
import { toggleNote, findNoteByOriginal } from '../store/notes';

export type ChatMessage = {
  id: string;
  text: string;
  source: 'user' | 'agent';
  timestamp: number;
};

type Props = {
  message: ChatMessage;
  isActive: boolean;
  onActivate: () => void;
};

export default function TranscriptBubble({
  message,
  isActive,
  onActivate,
}: Props) {
  const isAgent = message.source === 'agent';
  const spanish = isAgent && isLikelySpanish(message.text);

  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [translation, setTranslation] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [explSaved, setExplSaved] = useState(false);
  const [explFeedback, setExplFeedback] = useState<string | null>(null);

  const wordLayouts = useRef<Map<number, LayoutRectangle>>(new Map());
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const explTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const words = spanish
    ? message.text.split(/\s+/).filter((w) => w.length > 0)
    : [];

  // Clear selection when deactivated
  useEffect(() => {
    if (!isActive) {
      setSelectedIndices([]);
      setTranslation(null);
      setFeedback(null);
    }
  }, [isActive]);

  // Fetch translation when selection changes
  const indicesKey = selectedIndices.join(',');
  useEffect(() => {
    if (selectedIndices.length === 0) {
      setTranslation(null);
      return;
    }

    const phrase = selectedIndices.map((i) => words[i]).join(' ');
    const clean = phrase.replace(/[.,;:!?¿¡""''«»()—–\-]/g, '').trim();
    if (!clean) return;

    let cancelled = false;
    setIsTranslating(true);

    translateText(clean).then((result) => {
      if (cancelled) return;
      setTranslation(result);
      setIsTranslating(false);
      findNoteByOriginal(clean).then((existing) => {
        if (!cancelled) setIsSaved(!!existing);
      });
    });

    return () => {
      cancelled = true;
    };
  }, [indicesKey]);

  const handleWordTap = (index: number) => {
    onActivate();

    if (selectedIndices.length === 1 && selectedIndices[0] === index) {
      setSelectedIndices([]);
      return;
    }

    if (selectedIndices.length === 0) {
      setSelectedIndices([index]);
      return;
    }

    const min = Math.min(...selectedIndices);
    const max = Math.max(...selectedIndices);

    if (index === min - 1 || index === max + 1) {
      const newMin = Math.min(min, index);
      const newMax = Math.max(max, index);
      setSelectedIndices(
        Array.from({ length: newMax - newMin + 1 }, (_, i) => newMin + i)
      );
    } else {
      setSelectedIndices([index]);
    }
  };

  const handleTooltipPress = async () => {
    if (!translation || isTranslating) return;

    const phrase = selectedIndices.map((i) => words[i]).join(' ');
    const clean = phrase.replace(/[.,;:!?¿¡""''«»()—–\-]/g, '').trim();

    const result = await toggleNote({
      type: 'translation',
      originalText: clean,
      translatedText: translation,
    });

    setIsSaved(result.saved);
    showFeedback(result.saved ? 'Saved to notes' : 'Removed from notes');
  };

  const handleExplanationPress = async () => {
    const result = await toggleNote({
      type: 'explanation',
      originalText: message.text,
    });

    setExplSaved(result.saved);
    setExplFeedback(result.saved ? 'Saved to notes' : 'Removed from notes');
    if (explTimer.current) clearTimeout(explTimer.current);
    explTimer.current = setTimeout(() => setExplFeedback(null), 1500);
  };

  const showFeedback = (text: string) => {
    setFeedback(text);
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setFeedback(null), 1500);
  };

  const getTooltipPosition = () => {
    if (selectedIndices.length === 0) return null;
    const first = wordLayouts.current.get(selectedIndices[0]);
    const last = wordLayouts.current.get(
      selectedIndices[selectedIndices.length - 1]
    );
    if (!first || !last) return null;

    const left = first.x;
    const right = last.x + last.width;
    const centerX = (left + right) / 2;

    return {
      top: first.y - 44,
      left: Math.max(0, centerX - 70),
    };
  };

  // ── User message ──
  if (!isAgent) {
    return (
      <View style={[styles.row, styles.rowUser]}>
        <View style={[styles.bubble, styles.userBubble]}>
          <Text style={[styles.text, styles.userText]}>{message.text}</Text>
        </View>
      </View>
    );
  }

  // ── English agent message (Explanation) ──
  if (isAgent && !spanish) {
    return (
      <View style={[styles.row, styles.rowAgent]}>
        <View style={styles.avatar}>
          <DillowAvatar size={32} />
        </View>
        <View style={{ flexShrink: 1 }}>
          <Pressable
            onPress={handleExplanationPress}
            style={({ pressed }) => [
              styles.bubble,
              styles.agentBubble,
              pressed && styles.pressed,
              explSaved && styles.savedBubble,
            ]}
          >
            <Text style={styles.explanationLabel}>Explanation:</Text>
            <Text style={[styles.text, styles.agentText]}>{message.text}</Text>
          </Pressable>
          {explFeedback && (
            <Text style={styles.inlineFeedback}>{explFeedback}</Text>
          )}
        </View>
      </View>
    );
  }

  // ── Spanish agent message (tappable words) ──
  const tooltipPos = isActive ? getTooltipPosition() : null;

  return (
    <View style={[styles.row, styles.rowAgent]}>
      <View style={styles.avatar}>
        <DillowAvatar size={32} />
      </View>
      <View
        style={[styles.bubble, styles.agentBubble, { overflow: 'visible' }]}
      >
        {/* Tooltip */}
        {isActive &&
          tooltipPos &&
          (translation !== null || isTranslating) && (
            <Pressable
              onPress={handleTooltipPress}
              style={[
                styles.tooltip,
                { top: tooltipPos.top, left: tooltipPos.left },
                isSaved && styles.tooltipSaved,
              ]}
            >
              {isTranslating ? (
                <ActivityIndicator size="small" color={colors.cream} />
              ) : (
                <Text style={styles.tooltipText}>{translation}</Text>
              )}
              {feedback && (
                <Text style={styles.tooltipFeedback}>{feedback}</Text>
              )}
            </Pressable>
          )}

        {/* Tappable words */}
        <View style={styles.wordRow}>
          {words.map((word, i) => (
            <Pressable
              key={`${message.id}-w${i}`}
              onPress={() => handleWordTap(i)}
              onLayout={(e) =>
                wordLayouts.current.set(i, e.nativeEvent.layout)
              }
            >
              <Text
                style={[
                  styles.wordText,
                  selectedIndices.includes(i) && styles.wordSelected,
                ]}
              >
                {word}{' '}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: 14,
    maxWidth: '85%',
  },
  rowAgent: {
    alignSelf: 'flex-start',
    alignItems: 'flex-end',
  },
  rowUser: {
    alignSelf: 'flex-end',
  },
  avatar: {
    marginRight: 10,
    paddingBottom: 4,
  },
  bubble: {
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
  pressed: {
    opacity: 0.7,
  },
  savedBubble: {
    borderColor: colors.teal,
    borderWidth: 1.5,
  },
  text: {
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
  explanationLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: colors.teal,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  inlineFeedback: {
    fontFamily: fonts.light,
    fontSize: 12,
    color: colors.teal,
    marginTop: 4,
    marginLeft: 4,
  },

  // ── Tappable words ──
  wordRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  wordText: {
    fontSize: 15,
    lineHeight: 28,
    fontFamily: fonts.regular,
    color: colors.charcoal,
  },
  wordSelected: {
    backgroundColor: colors.marigoldLight,
    borderRadius: 3,
    overflow: 'hidden',
  },

  // ── Tooltip ──
  tooltip: {
    position: 'absolute',
    backgroundColor: colors.charcoal,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    zIndex: 100,
    minWidth: 60,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  tooltipSaved: {
    backgroundColor: colors.tealDark,
  },
  tooltipText: {
    color: colors.cream,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  tooltipFeedback: {
    color: colors.marigoldLight,
    fontFamily: fonts.light,
    fontSize: 11,
    marginTop: 2,
  },
});
