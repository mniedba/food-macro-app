import { useMemo } from 'react';
import { UserProfile, MacroTargets } from '../types';
import { calculateBMR } from '../algorithms/bmr';
import { calculateTDEE } from '../algorithms/tdee';
import { planGoal } from '../algorithms/goalPlanner';
import { calculateMacros } from '../algorithms/macros';

export function useMacroTargets(profile: UserProfile | null): MacroTargets | null {
  return useMemo(() => {
    if (!profile) return null;

    const bmr = calculateBMR(profile.sex, profile.weightKg, profile.heightCm, profile.age);
    const tdee = calculateTDEE(bmr, profile.activityLevel, profile.workoutType);
    const goal = planGoal(profile.weightKg, profile.goalWeightKg, profile.goalTimeframeWeeks, tdee);

    return calculateMacros(
      goal.targetCalories,
      goal.goalType,
      profile.workoutType,
      profile.weightKg,
      bmr,
      tdee,
      goal.weeklyChangeKg,
      goal.dailyCalorieAdjustment
    );
  }, [profile]);
}
