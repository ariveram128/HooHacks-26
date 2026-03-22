import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Ellipse } from 'react-native-svg';
import { colors } from '../theme';

type VineStemProps = {
  height?: number;
  showRoot?: boolean;
  enterDelay?: number;
  decorSide?: 'left' | 'right' | 'none';
};

const STEM_COLOR = colors.teal;
const STEM_W = 3;
const SVG_W = 70;

export default function VineStem({
  height = 70,
  showRoot = false,
  enterDelay = 0,
  decorSide = 'none',
}: VineStemProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, enterDelay);
    return () => clearTimeout(timeout);
  }, []);

  if (showRoot) {
    return (
      <Animated.View style={[styles.container, { height: 130, opacity: fadeAnim }]}>
        <Svg width={SVG_W} height={130} viewBox={`0 0 ${SVG_W} 130`}>
          {/* soil mound */}
          <Ellipse cx={35} cy={112} rx={26} ry={10} fill={colors.terracotta} opacity={0.2} />
          <Ellipse cx={35} cy={110} rx={18} ry={6} fill={colors.terracotta} opacity={0.15} />

          {/* seed */}
          <Ellipse cx={35} cy={105} rx={6} ry={4} fill={colors.terracotta} opacity={0.5} />

          {/* roots */}
          <Path d="M30 108 Q24 115 16 122" stroke={colors.terracotta} strokeWidth={1.5} fill="none" opacity={0.25} strokeLinecap="round" />
          <Path d="M28 110 Q22 118 20 126" stroke={colors.terracotta} strokeWidth={1} fill="none" opacity={0.2} strokeLinecap="round" />
          <Path d="M40 108 Q46 115 54 122" stroke={colors.terracotta} strokeWidth={1.5} fill="none" opacity={0.25} strokeLinecap="round" />
          <Path d="M42 110 Q48 118 50 126" stroke={colors.terracotta} strokeWidth={1} fill="none" opacity={0.2} strokeLinecap="round" />

          {/* main sprout stem */}
          <Path
            d="M35 102 Q33 80 35 55 Q37 35 35 12"
            stroke={STEM_COLOR}
            strokeWidth={STEM_W + 0.5}
            fill="none"
            strokeLinecap="round"
          />

          {/* sprout tip leaves */}
          <Path d="M35 14 Q28 4 35 0 Q42 4 35 14" fill={colors.tealLight} opacity={0.8} />
          <Path d="M35 12 Q30 6 35 2 Q40 6 35 12" fill={colors.teal} opacity={0.5} />

          {/* small side leaves on sprout */}
          <Path d="M35 60 Q25 50 20 44" stroke={STEM_COLOR} strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <Path d="M20 44 Q16 38 20 35 Q24 38 20 44" fill={colors.tealLight} opacity={0.5} />

          <Path d="M35 78 Q45 70 50 64" stroke={STEM_COLOR} strokeWidth={1.5} fill="none" strokeLinecap="round" />
          <Path d="M50 64 Q54 58 50 55 Q46 58 50 64" fill={colors.tealLight} opacity={0.4} />

          {/* tiny bud */}
          <Circle cx={35} cy={40} r={2} fill={STEM_COLOR} opacity={0.3} />
        </Svg>
      </Animated.View>
    );
  }

  const midX = SVG_W / 2;
  const wobble = 4;
  const h = height;

  return (
    <Animated.View style={[styles.container, { height, opacity: fadeAnim }]}>
      <Svg width={SVG_W} height={h} viewBox={`0 0 ${SVG_W} ${h}`}>
        {/* wavy vine stem */}
        <Path
          d={`M${midX} 0 C${midX - wobble} ${h * 0.25}, ${midX + wobble} ${h * 0.5}, ${midX} ${h * 0.5} C${midX - wobble} ${h * 0.5}, ${midX + wobble} ${h * 0.75}, ${midX} ${h}`}
          stroke={STEM_COLOR}
          strokeWidth={STEM_W}
          fill="none"
          strokeLinecap="round"
        />

        {/* node dot */}
        <Circle cx={midX} cy={h * 0.5} r={2.5} fill={STEM_COLOR} opacity={0.35} />

        {/* decorative mini leaf */}
        {decorSide === 'right' && (
          <>
            <Path
              d={`M${midX} ${h * 0.35} Q${midX + 10} ${h * 0.3} ${midX + 14} ${h * 0.22}`}
              stroke={STEM_COLOR}
              strokeWidth={1}
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d={`M${midX + 14} ${h * 0.22} Q${midX + 17} ${h * 0.14} ${midX + 14} ${h * 0.12} Q${midX + 11} ${h * 0.14} ${midX + 14} ${h * 0.22}`}
              fill={colors.tealLight}
              opacity={0.45}
            />
          </>
        )}
        {decorSide === 'left' && (
          <>
            <Path
              d={`M${midX} ${h * 0.65} Q${midX - 10} ${h * 0.6} ${midX - 14} ${h * 0.52}`}
              stroke={STEM_COLOR}
              strokeWidth={1}
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d={`M${midX - 14} ${h * 0.52} Q${midX - 17} ${h * 0.44} ${midX - 14} ${h * 0.42} Q${midX - 11} ${h * 0.44} ${midX - 14} ${h * 0.52}`}
              fill={colors.tealLight}
              opacity={0.45}
            />
          </>
        )}
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
