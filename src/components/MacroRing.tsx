import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface MacroRingProps {
  value: number;
  maxValue: number;
  color: string;
  size: number;
  label: string;
  unit: string;
}

export function MacroRing({ value, maxValue, color, size, label, unit }: MacroRingProps) {
  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(maxValue > 0 ? Math.min(value / maxValue, 1) : 0, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, maxValue]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View style={styles.wrapper}>
      <View style={[styles.ringContainer, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.bgCard}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        <View style={styles.labelContainer}>
          <Text style={[styles.fraction, { fontSize: size * 0.14 }]}>
            {Math.round(value)}/{Math.round(maxValue)}
          </Text>
          <Text style={[styles.unit, { fontSize: size * 0.09 }]}>{unit}</Text>
        </View>
      </View>
      <Text style={[styles.metricLabel, { fontSize: size * 0.11 }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  fraction: {
    color: colors.textPrimary,
    fontWeight: typography.macro.fontWeight,
  },
  unit: {
    color: colors.textSecondary,
    fontWeight: typography.macroUnit.fontWeight,
  },
  metricLabel: {
    color: colors.textSecondary,
    fontWeight: typography.caption.fontWeight,
    marginTop: 6,
  },
});
