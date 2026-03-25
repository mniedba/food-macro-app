import { ActivityLevel, WorkoutType } from '../types';

export const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const workoutCalorieAdjustments: Record<WorkoutType, number> = {
  sedentary: 0,
  weightlifting: 0,
  cardio: 75,
  mixed: 40,
};
