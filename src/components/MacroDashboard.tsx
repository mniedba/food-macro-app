import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MacroRing } from './MacroRing';
import { MacroTargets, DailyTotals } from '../types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface MacroDashboardProps {
  targets: MacroTargets;
  consumed: DailyTotals;
}

function remainingLabel(consumed: number, target: number, unit: string): string {
  const diff = Math.round(target - consumed);
  if (diff <= 0) return `${Math.abs(diff)}${unit} over`;
  return `${diff}${unit} left`;
}

function remainingColor(consumed: number, target: number): string {
  return consumed > target ? colors.danger : colors.textMuted;
}

export function MacroDashboard({ targets, consumed }: MacroDashboardProps) {
  const calRemaining = Math.round(targets.calories - consumed.calories);

  return (
    <View style={styles.container}>
      <View style={styles.mainRing}>
        <MacroRing
          value={consumed.calories}
          maxValue={targets.calories}
          color={colors.calories}
          size={200}
          label="Calories"
          unit="kcal"
        />
        <Text style={[
          styles.remainingMain,
          { color: calRemaining < 0 ? colors.danger : colors.textSecondary },
        ]}>
          {calRemaining < 0
            ? `${Math.abs(calRemaining)} kcal over`
            : `${calRemaining} kcal remaining`}
        </Text>
      </View>

      <View style={styles.subRings}>
        <View style={styles.subRingItem}>
          <MacroRing
            value={consumed.proteinG}
            maxValue={targets.proteinGrams}
            color={colors.protein}
            size={100}
            label="Protein"
            unit="g"
          />
          <Text style={[styles.remainingSub, { color: remainingColor(consumed.proteinG, targets.proteinGrams) }]}>
            {remainingLabel(consumed.proteinG, targets.proteinGrams, 'g')}
          </Text>
        </View>

        <View style={styles.subRingItem}>
          <MacroRing
            value={consumed.carbsG}
            maxValue={targets.carbsGrams}
            color={colors.carbs}
            size={100}
            label="Carbs"
            unit="g"
          />
          <Text style={[styles.remainingSub, { color: remainingColor(consumed.carbsG, targets.carbsGrams) }]}>
            {remainingLabel(consumed.carbsG, targets.carbsGrams, 'g')}
          </Text>
        </View>

        <View style={styles.subRingItem}>
          <MacroRing
            value={consumed.fatG}
            maxValue={targets.fatGrams}
            color={colors.fats}
            size={100}
            label="Fat"
            unit="g"
          />
          <Text style={[styles.remainingSub, { color: remainingColor(consumed.fatG, targets.fatGrams) }]}>
            {remainingLabel(consumed.fatG, targets.fatGrams, 'g')}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  mainRing: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  remainingMain: {
    ...typography.caption,
    marginTop: spacing.sm,
  },
  subRings: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: spacing.md,
  },
  subRingItem: {
    alignItems: 'center',
  },
  remainingSub: {
    ...typography.caption,
    fontSize: 11,
    marginTop: 4,
  },
});
