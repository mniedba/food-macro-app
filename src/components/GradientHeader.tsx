import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { GoalType } from '../types';

interface GradientHeaderProps {
  title: string;
  goalType?: GoalType;
}

const goalLabels: Record<GoalType, string> = {
  cut: 'CUT',
  maintain: 'MAINTAIN',
  bulk: 'BULK',
};

export function GradientHeader({ title, goalType }: GradientHeaderProps) {
  return (
    <LinearGradient
      colors={[colors.accent, colors.accentGradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <Text style={styles.title}>{title}</Text>
      {goalType && (
        <View style={[styles.badge, { backgroundColor: colors[goalType] }]}>
          <Text style={styles.badgeText}>{goalLabels[goalType]}</Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 56,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 13,
  },
});
