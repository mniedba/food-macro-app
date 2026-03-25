import { GoalType } from '../types';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function planGoal(
  currentWeightKg: number,
  goalWeightKg: number,
  timeframeWeeks: number,
  tdee: number
): {
  targetCalories: number;
  goalType: GoalType;
  weeklyChangeKg: number;
  dailyCalorieAdjustment: number;
} {
  const totalWeightChangeKg = goalWeightKg - currentWeightKg;
  const weeklyChangeKg = totalWeightChangeKg / timeframeWeeks;
  const dailyCalorieAdjustment = clamp((weeklyChangeKg * 7700) / 7, -1000, 500);
  const targetCalories = Math.round(tdee + dailyCalorieAdjustment);

  let goalType: GoalType;
  if (goalWeightKg < currentWeightKg - 0.5) {
    goalType = 'cut';
  } else if (goalWeightKg > currentWeightKg + 0.5) {
    goalType = 'bulk';
  } else {
    goalType = 'maintain';
  }

  return { targetCalories, goalType, weeklyChangeKg, dailyCalorieAdjustment };
}
