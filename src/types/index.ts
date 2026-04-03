export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type WorkoutType = 'sedentary' | 'weightlifting' | 'cardio' | 'mixed';
export type GoalType = 'cut' | 'maintain' | 'bulk';
export type WeightUnit = 'lbs' | 'kg';
export type HeightUnit = 'in' | 'cm';

export interface UserProfile {
  sex: Sex;
  heightIn: number;             // always stored in inches internally
  weightLbs: number;            // always stored in lbs internally
  age: number;
  activityLevel: ActivityLevel;
  workoutType: WorkoutType;
  goalWeightLbs: number;
  goalTimeframeWeeks: number;   // 4-52 weeks
  weightUnit: WeightUnit;       // display preference
  heightUnit: HeightUnit;       // display preference
  goalStartDate?: string;       // 'YYYY-MM-DD' — when the current goal period began
  goalStartWeightLbs?: number;  // body weight (lbs) recorded at goal start
}

export interface WeightEntry {
  id: string;
  date: string;       // 'YYYY-MM-DD'
  weightLbs: number;
  note?: string;
}

export interface MacroTargets {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  goalType: GoalType;
  weeklyWeightChangeLbs: number;
  dailyCalorieAdjustment: number;
  bmr: number;
  tdee: number;
}

export interface FoodItem {
  id: string;
  name: string;
  category: 'protein' | 'carb' | 'fat' | 'vegetable' | 'fruit' | 'dairy' | 'grain';
  servingSize: string;         // e.g., "100g", "1 cup", "1 large"
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  tags: string[];              // e.g., ['high-protein', 'low-carb', 'meal-prep', 'quick']
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  prepTimeMin: number;
  ingredients: string[];       // human-readable ingredient list
  instructions: string[];      // step-by-step instructions
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  servings: number;
  tags: string[];
  goalAlignment: GoalType[];   // which goals this recipe suits
}

export interface LogEntry {
  id: string;                   // unique: Date.now().toString()
  date: string;                 // 'YYYY-MM-DD'
  itemId: string;               // food or recipe id
  itemName: string;
  itemType: 'food' | 'recipe';
  servings: number;
  caloriesPerServing: number;   // stored at log time so display is stable
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
