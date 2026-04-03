export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type WorkoutType = 'sedentary' | 'weightlifting' | 'cardio' | 'mixed';
export type GoalType = 'cut' | 'maintain' | 'bulk';
export type WeightUnit = 'lbs' | 'kg';
export type HeightUnit = 'in' | 'cm';

export interface UserProfile {
  sex: Sex;
  heightCm: number;
  weightKg: number;
  age: number;
  activityLevel: ActivityLevel;
  workoutType: WorkoutType;
  goalWeightKg: number;
  goalTimeframeWeeks: number;
  weightUnit: WeightUnit;
  heightUnit: HeightUnit;
  goalStartDate?: string;       // 'YYYY-MM-DD' — when the current goal period began
  goalStartWeightKg?: number;   // body weight (kg) recorded at goal start
}

export interface WeightEntry {
  id: string;
  date: string;       // 'YYYY-MM-DD'
  weightKg: number;
  note?: string;
}

export interface MacroTargets {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  goalType: GoalType;
  weeklyWeightChangeKg: number;
  dailyCalorieAdjustment: number;
  bmr: number;
  tdee: number;
}

export interface FoodItem {
  id: string;
  name: string;
  category: 'protein' | 'carb' | 'fat' | 'vegetable' | 'fruit' | 'dairy' | 'grain';
  servingSize: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  tags: string[];
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  prepTimeMin: number;
  ingredients: string[];
  instructions: string[];
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  servings: number;
  tags: string[];
  goalAlignment: GoalType[];
}

export interface LogEntry {
  id: string;                   // unique: Date.now().toString()
  date: string;                 // 'YYYY-MM-DD'
  itemId: string;
  itemName: string;
  itemType: 'food' | 'recipe';
  servings: number;
  caloriesPerServing: number;
  proteinGPerServing: number;
  carbsGPerServing: number;
  fatGPerServing: number;
}

export interface DailyTotals {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}
