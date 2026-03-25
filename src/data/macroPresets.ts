import { GoalType, WorkoutType } from '../types';

interface MacroRatios {
  protein: number;
  carbs: number;
  fat: number;
}

export const macroPresets: Record<GoalType, Record<WorkoutType, MacroRatios>> = {
  cut: {
    sedentary: { protein: 0.35, carbs: 0.35, fat: 0.30 },
    weightlifting: { protein: 0.40, carbs: 0.30, fat: 0.30 },
    cardio: { protein: 0.30, carbs: 0.45, fat: 0.25 },
    mixed: { protein: 0.35, carbs: 0.35, fat: 0.30 },
  },
  maintain: {
    sedentary: { protein: 0.25, carbs: 0.45, fat: 0.30 },
    weightlifting: { protein: 0.35, carbs: 0.40, fat: 0.25 },
    cardio: { protein: 0.25, carbs: 0.50, fat: 0.25 },
    mixed: { protein: 0.30, carbs: 0.40, fat: 0.30 },
  },
  bulk: {
    sedentary: { protein: 0.25, carbs: 0.50, fat: 0.25 },
    weightlifting: { protein: 0.35, carbs: 0.45, fat: 0.20 },
    cardio: { protein: 0.25, carbs: 0.50, fat: 0.25 },
    mixed: { protein: 0.30, carbs: 0.45, fat: 0.25 },
  },
};
