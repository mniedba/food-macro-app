import { GoalType } from '../types';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// 1 lb body weight ≈ 3500 kcal
export function planGoal(
  currentWeightLbs: number,
  goalWeightLbs: number,
  timeframeWeeks: number,
  tdee: number
): {
  targetCalories: number;
  goalType: GoalType;
  weeklyChangeLbs: number;
  dailyCalorieAdjustment: number;
} {
  const totalWeightChangeLbs = goalWeightLbs - currentWeightLbs;
  const weeklyChangeLbs = totalWeightChangeLbs / timeframeWeeks;
  const dailyCalorieAdjustment = clamp((weeklyChangeLbs * 3500) / 7, -1000, 500);
  const targetCalories = Math.round(tdee + dailyCalorieAdjustment);

  let goalType: GoalType;
  if (goalWeightLbs < currentWeightLbs - 1.1) {
    goalType = 'cut';
  } else if (goalWeightLbs > currentWeightLbs + 1.1) {
    goalType = 'bulk';
  } else {
    goalType = 'maintain';
  }

  return { targetCalories, goalType, weeklyChangeLbs, dailyCalorieAdjustment };
}
