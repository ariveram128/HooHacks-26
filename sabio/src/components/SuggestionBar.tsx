import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Animated, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';

const TOPICS = [
  'comida',
  'música',
  'deportes',
  'cultura',
  'viajes',
  'películas',
  'historia',
  'familia',
  'naturaleza',
  'ciencia',
];

export default function SuggestionBar() {
  const [index, setIndex] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      Animated.timing(fade, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setIndex((i) => (i + 1) % TOPICS.length);
        Animated.timing(fade, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const topic = TOPICS[index];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scroll}
    >
      <View style={styles.chip}>
        <Text style={styles.chipText}>Tú escoje</Text>
      </View>

      <View style={styles.chip}>
        <Text style={styles.chipText}>Quiero hablar sobre </Text>
        <Animated.Text style={[styles.chipTopic, { opacity: fade }]}>
          {topic}
        </Animated.Text>
      </View>

      <View style={styles.chip}>
        <Text style={styles.chipText}>Encuéntrame una lección sobre </Text>
        <Animated.Text style={[styles.chipTopic, { opacity: fade }]}>
          {topic}
        </Animated.Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
    borderTopWidth: 1,
    borderTopColor: colors.creamDark,
    backgroundColor: colors.cream,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.creamLight,
    borderWidth: 1,
    borderColor: colors.creamDark,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: {
    fontFamily: fonts.serifItalic,
    fontSize: 14,
    color: colors.warmGray,
  },
  chipTopic: {
    fontFamily: fonts.serif,
    fontSize: 14,
    color: colors.terracotta,
  },
});
