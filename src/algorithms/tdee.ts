import { ActivityLevel, WorkoutType } from '../types';
import { activityMultipliers, workoutCalorieAdjustments } from '../data/activityMultipliers';

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel, workoutType: WorkoutType): number {
  return bmr * activityMultipliers[activityLevel] + workoutCalorieAdjustments[workoutType];
}
