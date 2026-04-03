import { useMemo } from 'react';
import { UserProfile, MacroTargets } from '../types';
import { calculateBMR } from '../algorithms/bmr';
import { calculateTDEE } from '../algorithms/tdee';
import { planGoal } from '../algorithms/goalPlanner';
import { calculateMacros } from '../algorithms/macros';

export function useMacroTargets(profile: UserProfile | null): MacroTargets | null {
  return useMemo(() => {
    if (!profile) return null;

    const bmr = calculateBMR(profile.sex, profile.weightLbs, profile.heightIn, profile.age);
    const tdee = calculateTDEE(bmr, profile.activityLevel, profile.workoutType);
    const goal = planGoal(profile.weightLbs, profile.goalWeightLbs, profile.goalTimeframeWeeks, tdee);

    return calculateMacros(
      goal.targetCalories,
      goal.goalType,
      profile.workoutType,
      profile.weightLbs,
      bmr,
      tdee,
      goal.weeklyChangeLbs,
      goal.dailyCalorieAdjustment
    );
  }, [profile]);
}
