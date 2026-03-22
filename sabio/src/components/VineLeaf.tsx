import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Pressable, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, fonts } from '../theme';

export type LeafState = 'available' | 'completed' | 'active';

type VineLeafProps = {
  side: 'left' | 'right';
  state: LeafState;
  title: string;
  subtitle: string;
  fillColor: string;
  enterDelay?: number;
  onPress: () => void;
  onLayout?: (y: number) => void;
};

const BRANCH_W = 30;

export default function VineLeaf({
  side,
  state,
  title,
  subtitle,
  fillColor,
  enterDelay = 0,
  onPress,
  onLayout,
}: VineLeafProps) {
  const isRight = side === 'right';

  const enterAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.spring(enterAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }, enterDelay);
    return () => clearTimeout(timeout);
  }, []);

  const translateX = enterAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [isRight ? 60 : -60, 0],
  });

  const fill = state === 'active' ? colors.terracotta : fillColor;
  const fillDark =
    state === 'active'
      ? colors.terracottaDark
      : fillColor === colors.teal
        ? colors.tealDark
        : fillColor === colors.tealLight
          ? colors.teal
          : fillColor === colors.terracotta
            ? colors.terracottaDark
            : colors.marigoldDark;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.93,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 120,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View
      style={[styles.row, isRight ? styles.rowRight : styles.rowLeft]}
      onLayout={(e) => onLayout?.(e.nativeEvent.layout.y)}
    >
      {/* Branch with leaf accent */}
      <View style={isRight ? styles.branchRight : styles.branchLeft}>
        <Svg width={BRANCH_W} height={36} viewBox={`0 0 ${BRANCH_W} 36`}>
          {/* curved branch */}
          <Path
            d={
              isRight
                ? `M0 18 Q${BRANCH_W * 0.4} 16 ${BRANCH_W} 18`
                : `M${BRANCH_W} 18 Q${BRANCH_W * 0.6} 16 0 18`
            }
            stroke={colors.teal}
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
          />
          {/* small leaf at junction */}
          <Path
            d={
              isRight
                ? 'M4 18 Q-1 10 5 4 Q11 10 5 18 Z'
                : `M${BRANCH_W - 4} 18 Q${BRANCH_W + 1} 10 ${BRANCH_W - 5} 4 Q${BRANCH_W - 11} 10 ${BRANCH_W - 5} 18 Z`
            }
            fill={colors.tealLight}
            opacity={0.6}
          />
        </Svg>
      </View>

      {/* Animated card */}
      <Animated.View
        style={{
          opacity: enterAnim,
          transform: [{ translateX }, { scale: scaleAnim }],
        }}
      >
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[
            styles.card,
            { backgroundColor: fill },
            isRight ? styles.cardShapeRight : styles.cardShapeLeft,
          ]}
        >
          {/* subtle inner highlight */}
          <View
            style={[
              styles.innerHighlight,
              isRight ? styles.highlightRight : styles.highlightLeft,
              { backgroundColor: fillDark },
            ]}
          />

          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

          {/* completed badge */}
          {state === 'completed' && (
            <View
              style={[styles.badge, isRight ? styles.badgeRight : styles.badgeLeft]}
            >
              <Svg width={22} height={22} viewBox="0 0 24 24">
                <Circle cx={12} cy={12} r={11} fill={colors.white} />
                <Circle cx={12} cy={12} r={10} fill={colors.marigold} />
                <Path
                  d="M8 12l3 3 5-6"
                  stroke="#FFF"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </Svg>
            </View>
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
  },
  rowRight: {
    justifyContent: 'center',
    paddingLeft: 0,
  },
  rowLeft: {
    justifyContent: 'center',
    flexDirection: 'row-reverse',
    paddingRight: 0,
  },
  branchRight: {
    marginRight: -4,
  },
  branchLeft: {
    marginLeft: -4,
  },
  card: {
    minWidth: 160,
    maxWidth: 190,
    paddingHorizontal: 20,
    paddingVertical: 16,
    overflow: 'hidden',
    shadowColor: '#1A3A33',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  cardShapeRight: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 26,
    borderTopRightRadius: 26,
    borderBottomRightRadius: 26,
  },
  cardShapeLeft: {
    borderTopLeftRadius: 26,
    borderBottomLeftRadius: 26,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 26,
  },
  innerHighlight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 5,
    opacity: 0.35,
  },
  highlightRight: {
    left: 0,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 26,
  },
  highlightLeft: {
    right: 0,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 26,
  },
  textContainer: {
    zIndex: 1,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 14.5,
    color: colors.white,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 3,
  },
  badge: {
    position: 'absolute',
    top: -7,
  },
  badgeRight: {
    right: -5,
  },
  badgeLeft: {
    left: -5,
  },
});
