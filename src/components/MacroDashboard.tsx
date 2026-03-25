import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MacroRing } from './MacroRing';
import { MacroTargets } from '../types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface MacroDashboardProps {
  targets: MacroTargets;
}

export function MacroDashboard({ targets }: MacroDashboardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.mainRing}>
        <MacroRing
          value={targets.calories}
          maxValue={targets.calories}
          color={colors.calories}
          size={200}
          label="Calories"
          unit="kcal"
        />
      </View>
      <View style={styles.subRings}>
        <MacroRing
          value={targets.proteinGrams}
          maxValue={targets.proteinGrams}
          color={colors.protein}
          size={100}
          label="Protein"
          unit="g"
        />
        <MacroRing
          value={targets.carbsGrams}
          maxValue={targets.carbsGrams}
          color={colors.carbs}
          size={100}
          label="Carbs"
          unit="g"
        />
        <MacroRing
          value={targets.fatGrams}
          maxValue={targets.fatGrams}
          color={colors.fats}
          size={100}
          label="Fat"
          unit="g"
        />
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
    marginBottom: spacing.lg,
  },
  subRings: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: spacing.md,
  },
});
