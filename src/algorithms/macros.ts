import { GoalType, MacroTargets, WorkoutType } from '../types';
import { macroPresets } from '../data/macroPresets';

export function calculateMacros(
  targetCalories: number,
  goalType: GoalType,
  workoutType: WorkoutType,
  weightLbs: number,
  bmr: number,
  tdee: number,
  weeklyWeightChangeLbs: number,
  dailyCalorieAdjustment: number
): MacroTargets {
  const ratios = macroPresets[goalType][workoutType];

  let proteinGrams = (targetCalories * ratios.protein) / 4;
  let carbsGrams = (targetCalories * ratios.carbs) / 4;
  let fatGrams = (targetCalories * ratios.fat) / 9;

  // Protein floor rule for weightlifters: minimum 0.73g per lb (≈1.6g per kg)
  if (workoutType === 'weightlifting') {
    const proteinFloor = 0.73 * weightLbs;
    if (proteinGrams < proteinFloor) {
      proteinGrams = proteinFloor;
      const proteinCalories = proteinGrams * 4;
      const remainingCalories = targetCalories - proteinCalories;
      const carbFatRatio = ratios.carbs / (ratios.carbs + ratios.fat);
      carbsGrams = (remainingCalories * carbFatRatio) / 4;
      fatGrams = (remainingCalories * (1 - carbFatRatio)) / 9;
    }
  }

  return {
    calories: Math.round(targetCalories),
    proteinGrams: Math.round(proteinGrams),
    carbsGrams: Math.round(carbsGrams),
    fatGrams: Math.round(fatGrams),
    goalType,
    weeklyWeightChangeLbs,
    dailyCalorieAdjustment: Math.round(dailyCalorieAdjustment),
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
  };
}
