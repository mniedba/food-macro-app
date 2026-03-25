import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NumberInput } from './NumberInput';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { WeightUnit } from '../types';
import { kgToLbs, lbsToKg } from '../utils/formatters';

interface GoalSelectorProps {
  goalWeight: string;
  onGoalWeightChange: (val: string) => void;
  timeframeWeeks: number;
  onTimeframeChange: (weeks: number) => void;
  currentWeightKg: number;
  weightUnit: WeightUnit;
  onWeightUnitChange: (unit: string) => void;
}

export function GoalSelector({
  goalWeight,
  onGoalWeightChange,
  timeframeWeeks,
  onTimeframeChange,
  currentWeightKg,
  weightUnit,
  onWeightUnitChange,
}: GoalSelectorProps) {
  const goalWeightNum = parseFloat(goalWeight) || 0;
  const goalKg = weightUnit === 'lbs' ? lbsToKg(goalWeightNum) : goalWeightNum;
  const diffKg = goalKg - currentWeightKg;
  const weeklyChange = timeframeWeeks > 0 ? diffKg / timeframeWeeks : 0;

  const isAggressive = weeklyChange < -1 || weeklyChange > 0.5;
  const months = Math.round((timeframeWeeks / 52) * 12 * 10) / 10;

  return (
    <View>
      <NumberInput
        label="Goal Weight"
        value={goalWeight}
        onChangeText={onGoalWeightChange}
        unitOptions={['lbs', 'kg']}
        selectedUnit={weightUnit}
        onUnitChange={onWeightUnitChange}
      />

      <Text style={styles.label}>
        Timeframe: {timeframeWeeks} weeks ({months} months)
      </Text>
      <View style={styles.stepperRow}>
        <TouchableOpacity
          style={styles.stepperBtn}
          onPress={() => onTimeframeChange(Math.max(4, timeframeWeeks - 1))}
        >
          <Text style={styles.stepperText}>−</Text>
        </TouchableOpacity>
        <View style={styles.stepperTrack}>
          <View
            style={[
              styles.stepperFill,
              { width: `${((timeframeWeeks - 4) / 48) * 100}%` },
            ]}
          />
        </View>
        <TouchableOpacity
          style={styles.stepperBtn}
          onPress={() => onTimeframeChange(Math.min(52, timeframeWeeks + 1))}
        >
          <Text style={styles.stepperText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.preview}>
        <Text style={styles.previewText}>
          Weekly change: {weeklyChange > 0 ? '+' : ''}
          {(weightUnit === 'lbs'
            ? weeklyChange * 2.20462
            : weeklyChange
          ).toFixed(2)}{' '}
          {weightUnit}/week
        </Text>
        {isAggressive && (
          <Text style={styles.warning}>
            {weeklyChange < -1
              ? 'Warning: Losing more than 1 kg/week may not be sustainable'
              : 'Warning: Gaining more than 0.5 kg/week may lead to excess fat gain'}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    ...typography.bodyBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
  },
  stepperTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.bgCard,
    borderRadius: 3,
    marginHorizontal: spacing.md,
    overflow: 'hidden',
  },
  stepperFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  preview: {
    backgroundColor: colors.bgCard,
    borderRadius: spacing.cardRadius,
    padding: spacing.cardPadding,
  },
  previewText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  warning: {
    ...typography.caption,
    color: colors.warning,
    marginTop: spacing.sm,
  },
});
