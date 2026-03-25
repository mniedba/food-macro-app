import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ActivityLevel, WorkoutType } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface RadioCardProps {
  label: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}

function RadioCard({ label, description, selected, onPress }: RadioCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onPress}
    >
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioDot} />}
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardLabel}>{label}</Text>
        <Text style={styles.cardDesc}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
}

const activityOptions: { value: ActivityLevel; label: string; desc: string }[] = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Desk job, no exercise' },
  { value: 'light', label: 'Light', desc: 'Light exercise 1-3 days/week' },
  { value: 'moderate', label: 'Moderate', desc: 'Moderate exercise 3-5 days/week' },
  { value: 'active', label: 'Active', desc: 'Hard exercise 6-7 days/week' },
  { value: 'very_active', label: 'Very Active', desc: 'Very hard exercise, physical job' },
];

const workoutOptions: { value: WorkoutType; label: string; desc: string }[] = [
  { value: 'sedentary', label: 'Sedentary', desc: 'No regular workouts' },
  { value: 'weightlifting', label: 'Weightlifting', desc: 'Resistance training focus' },
  { value: 'cardio', label: 'Cardio', desc: 'Running, cycling, swimming' },
  { value: 'mixed', label: 'Mixed', desc: 'Combination of weights & cardio' },
];

interface ActivityPickerProps {
  activityLevel: ActivityLevel;
  workoutType: WorkoutType;
  onActivityChange: (level: ActivityLevel) => void;
  onWorkoutChange: (type: WorkoutType) => void;
}

export function ActivityPicker({
  activityLevel,
  workoutType,
  onActivityChange,
  onWorkoutChange,
}: ActivityPickerProps) {
  return (
    <View>
      <Text style={styles.sectionTitle}>Activity Level</Text>
      {activityOptions.map((opt) => (
        <RadioCard
          key={opt.value}
          label={opt.label}
          description={opt.desc}
          selected={activityLevel === opt.value}
          onPress={() => onActivityChange(opt.value)}
        />
      ))}
      <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Workout Type</Text>
      {workoutOptions.map((opt) => (
        <RadioCard
          key={opt.value}
          label={opt.label}
          description={opt.desc}
          selected={workoutType === opt.value}
          onPress={() => onWorkoutChange(opt.value)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: spacing.cardRadius,
    padding: spacing.cardPadding,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.bgInput,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  radioSelected: {
    borderColor: colors.accent,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent,
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  cardDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
