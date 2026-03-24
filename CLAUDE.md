# Macro Fuel - Nutrition Macro Tracking App

## Overview

Macro Fuel is an Android mobile app (APK) that helps users achieve their body physique goals through personalized diet guidance. Users input their body metrics and fitness goals, and the app calculates optimal daily macronutrient targets, then suggests foods and recipes to meet those targets.

## Technology Stack

- **Framework**: React Native with Expo (SDK 52+), TypeScript
- **Navigation**: Expo Router (file-based routing) with bottom tab navigator
- **Storage**: @react-native-async-storage/async-storage for local persistence
- **Charts**: react-native-svg for circular macro progress rings
- **Animations**: react-native-reanimated for smooth transitions and ring animations
- **Gradients**: expo-linear-gradient for card and header backgrounds
- **Build**: EAS Build (cloud) for APK generation — no local Android SDK required

### Project Initialization

```bash
npx create-expo-app@latest . --template blank-typescript
npx expo install expo-router @react-native-async-storage/async-storage react-native-reanimated react-native-svg expo-linear-gradient
npm install -D eas-cli
```

---

## File Structure

```
food-macro-app/
├── app/                              # Expo Router file-based routing
│   ├── _layout.tsx                   # Root layout: checks onboarding, renders tabs or wizard
│   ├── onboarding.tsx                # Full-screen onboarding wizard (modal)
│   └── (tabs)/
│       ├── _layout.tsx               # Bottom tab bar configuration
│       ├── index.tsx                 # Dashboard screen (macro rings)
│       ├── meals.tsx                 # Food & recipe suggestions screen
│       └── profile.tsx               # User profile & settings screen
├── src/
│   ├── algorithms/
│   │   ├── bmr.ts                    # Mifflin-St Jeor BMR calculation
│   │   ├── tdee.ts                   # TDEE from BMR + activity + workout type
│   │   ├── macros.ts                 # Macro split calculator (cut/bulk/maintain)
│   │   └── goalPlanner.ts            # Weekly deficit/surplus from goal + timeframe
│   ├── components/
│   │   ├── MacroRing.tsx             # Animated circular progress ring (SVG)
│   │   ├── MacroDashboard.tsx        # Four-ring layout (calories, protein, carbs, fat)
│   │   ├── ProfileForm.tsx           # Multi-step swipeable onboarding form
│   │   ├── GoalSelector.tsx          # Goal weight + timeframe picker with live preview
│   │   ├── ActivityPicker.tsx        # Activity level and workout type radio cards
│   │   ├── FoodCard.tsx              # Individual food/recipe suggestion card
│   │   ├── GradientHeader.tsx        # Reusable gradient header bar
│   │   └── NumberInput.tsx           # Styled numeric input with unit toggle
│   ├── data/
│   │   ├── foods.ts                  # Embedded food database (~150-200 items)
│   │   ├── recipes.ts               # Embedded recipe database (~50 recipes)
│   │   ├── activityMultipliers.ts    # TDEE multiplier constants
│   │   └── macroPresets.ts           # Macro ratio presets by goal × workout type
│   ├── hooks/
│   │   ├── useUserProfile.ts         # Read/write user profile from AsyncStorage
│   │   ├── useMacroTargets.ts        # Derived macro targets from profile + goal
│   │   └── useFoodSuggestions.ts     # Filter/score foods matching macro targets
│   ├── theme/
│   │   ├── colors.ts                 # Color palette constants
│   │   ├── typography.ts             # Font sizes and weights
│   │   └── spacing.ts               # Margin/padding scale
│   ├── types/
│   │   └── index.ts                  # All TypeScript interfaces
│   └── utils/
│       ├── storage.ts                # AsyncStorage wrapper with JSON serialization
│       └── formatters.ts             # Number formatting, unit display helpers
├── app.json                          # Expo config (name, icon, splash, Android package)
├── eas.json                          # EAS Build config for APK
├── tsconfig.json
└── package.json
```

---

## TypeScript Interfaces

Define in `src/types/index.ts`:

```typescript
export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type WorkoutType = 'sedentary' | 'weightlifting' | 'cardio' | 'mixed';
export type GoalType = 'cut' | 'maintain' | 'bulk';
export type WeightUnit = 'lbs' | 'kg';
export type HeightUnit = 'in' | 'cm';

export interface UserProfile {
  sex: Sex;
  heightCm: number;           // always stored in cm internally
  weightKg: number;           // always stored in kg internally
  age: number;
  activityLevel: ActivityLevel;
  workoutType: WorkoutType;
  goalWeightKg: number;
  goalTimeframeWeeks: number;  // 4-52 weeks
  weightUnit: WeightUnit;      // display preference
  heightUnit: HeightUnit;      // display preference
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
```

---

## Nutrition Algorithms

### 1. BMR — Mifflin-St Jeor Equation (`src/algorithms/bmr.ts`)

The gold standard for estimating Basal Metabolic Rate:

```
Male:   BMR = (10 × weightKg) + (6.25 × heightCm) - (5 × age) + 5
Female: BMR = (10 × weightKg) + (6.25 × heightCm) - (5 × age) - 161
```

**Function**: `calculateBMR(sex: Sex, weightKg: number, heightCm: number, age: number): number`

### 2. TDEE — Total Daily Energy Expenditure (`src/algorithms/tdee.ts`)

Multiply BMR by activity factor, then apply workout-type adjustment:

**Activity Multipliers** (store in `src/data/activityMultipliers.ts`):

| Activity Level | Multiplier | Description |
|---|---|---|
| Sedentary | 1.2 | Desk job, no exercise |
| Light | 1.375 | Light exercise 1-3 days/week |
| Moderate | 1.55 | Moderate exercise 3-5 days/week |
| Active | 1.725 | Hard exercise 6-7 days/week |
| Very Active | 1.9 | Very hard exercise, physical job |

**Workout-Type Calorie Adjustments** (applied after activity multiplier):

| Workout Type | Extra kcal/day | Note |
|---|---|---|
| Sedentary | +0 | No additional adjustment |
| Weightlifting | +0 | No calorie bump, but shifts macro ratios to higher protein |
| Cardio | +75 | Higher caloric burn from cardio sessions |
| Mixed | +40 | Moderate additional burn |

**Function**: `calculateTDEE(bmr: number, activityLevel: ActivityLevel, workoutType: WorkoutType): number`

### 3. Goal Planner (`src/algorithms/goalPlanner.ts`)

Derives daily caloric adjustment from the user's goal:

```
totalWeightChangeKg = goalWeightKg - currentWeightKg
weeklyChangeKg = totalWeightChangeKg / timeframeWeeks

// 1 kg body weight ≈ 7700 kcal
dailyCalorieAdjustment = (weeklyChangeKg × 7700) / 7

// Safety clamp: max deficit -1000 kcal/day, max surplus +500 kcal/day
dailyCalorieAdjustment = clamp(dailyCalorieAdjustment, -1000, 500)

targetCalories = tdee + dailyCalorieAdjustment
```

**Goal Type Derivation**:
- `goalWeightKg < currentWeightKg` → **cut**
- `goalWeightKg === currentWeightKg` (within ±0.5kg) → **maintain**
- `goalWeightKg > currentWeightKg` → **bulk**

**Function**: `planGoal(currentWeightKg: number, goalWeightKg: number, timeframeWeeks: number, tdee: number): { targetCalories: number, goalType: GoalType, weeklyChangeKg: number, dailyCalorieAdjustment: number }`

### 4. Macro Split Calculator (`src/algorithms/macros.ts`)

Macro percentages vary by goal type × workout type. Store presets in `src/data/macroPresets.ts`:

**Cutting Macros:**

| Workout Type | Protein % | Carbs % | Fat % |
|---|---|---|---|
| Sedentary | 35 | 35 | 30 |
| Weightlifting | 40 | 30 | 30 |
| Cardio | 30 | 45 | 25 |
| Mixed | 35 | 35 | 30 |

**Maintaining Macros:**

| Workout Type | Protein % | Carbs % | Fat % |
|---|---|---|---|
| Sedentary | 25 | 45 | 30 |
| Weightlifting | 35 | 40 | 25 |
| Cardio | 25 | 50 | 25 |
| Mixed | 30 | 40 | 30 |

**Bulking Macros:**

| Workout Type | Protein % | Carbs % | Fat % |
|---|---|---|---|
| Sedentary | 25 | 50 | 25 |
| Weightlifting | 35 | 45 | 20 |
| Cardio | 25 | 50 | 25 |
| Mixed | 30 | 45 | 25 |

**Conversion to grams** (protein = 4 kcal/g, carbs = 4 kcal/g, fat = 9 kcal/g):

```
proteinGrams = (targetCalories × proteinPct) / 4
carbsGrams   = (targetCalories × carbsPct) / 4
fatGrams     = (targetCalories × fatPct) / 9
```

**Protein floor rule**: For weightlifters, enforce minimum 1.6g protein per kg body weight. If the percentage-based calculation falls below this floor, set protein to the floor value and redistribute the remaining calories proportionally between carbs and fat.

**Function**: `calculateMacros(targetCalories: number, goalType: GoalType, workoutType: WorkoutType, weightKg: number): MacroTargets`

---

## Navigation & Screen Design

### Navigation Architecture

Three-tab bottom navigator using Expo Router file-based routing. First-time users see a full-screen onboarding wizard before accessing tabs.

### Root Layout (`app/_layout.tsx`)

On mount, check AsyncStorage for existing `UserProfile`:
- **No profile found** → render onboarding wizard (modal stack)
- **Profile exists** → render tab navigator

### Tab 1: Dashboard (`app/(tabs)/index.tsx`)

The home screen showing the user's daily macro targets at a glance.

**Layout:**
- **Top**: Gradient header with app name and goal type badge (CUT / MAINTAIN / BULK)
- **Center**: Large calorie ring (prominent, ~200px diameter) showing daily calorie target
- **Below**: Row of three smaller rings for Protein (g), Carbs (g), Fat (g)
- **Summary card**: Shows TDEE, daily adjustment, weekly weight change target
- **Bottom**: "Update Goal" button linking to profile edit

### Tab 2: Meal Ideas (`app/(tabs)/meals.tsx`)

Scrollable food and recipe suggestions personalized to the user's macro targets.

**Layout:**
- **Top**: Horizontal scrollable filter chips: "All", "High Protein", "Low Carb", "Quick Prep", "Meal Prep", "Breakfast", "Lunch", "Dinner", "Snack"
- **Toggle**: Switch between "Foods" and "Recipes" view
- **List**: Vertical scrollable list of FoodCard / RecipeCard components
- Each card shows: name, macro breakdown mini-bar (colored segments), calories per serving, relevant tags

### Tab 3: Profile (`app/(tabs)/profile.tsx`)

Displays current user profile and allows editing.

**Layout:**
- **Profile card**: Sex, age, height, weight displayed in a clean card
- **Goal card**: Current goal weight, timeframe, goal type badge
- **Activity card**: Activity level and workout type
- **Computed stats card**: BMR, TDEE, daily calorie target
- **"Edit Profile" button**: Opens the profile form as a modal
- **"Reset All Data" button**: Clears AsyncStorage with confirmation dialog
- **Unit toggle**: Switch between imperial (lbs/ft-in) and metric (kg/cm)

### Onboarding Wizard (`app/onboarding.tsx`)

A full-screen multi-step form for first-time users. Uses a horizontal paged scroll or step counter.

**Step 1 — Basics:**
- Sex: Two large toggle buttons (Male / Female)
- Age: Numeric input with stepper buttons

**Step 2 — Body Measurements:**
- Height: Numeric input with unit toggle (ft/in or cm)
- Weight: Numeric input with unit toggle (lbs or kg)

**Step 3 — Activity:**
- Activity Level: 5 radio cards with icons and descriptions
- Workout Type: 4 radio cards (Sedentary, Weightlifting, Cardio, Mixed) with icons

**Step 4 — Goal:**
- Goal Weight: Numeric input with same unit as current weight
- Timeframe: Slider from 4 to 52 weeks with label showing months
- Live preview: Shows estimated weekly weight change and warns if too aggressive (>1 kg/week loss or >0.5 kg/week gain)

**Step 5 — Results:**
- Animated reveal of calculated macros with the donut chart
- Shows daily calories, protein, carbs, fat targets
- "Get Started" button saves profile and navigates to dashboard

---

## Food & Recipe Database

### Approach

Ship an embedded local database as TypeScript arrays — no external API dependency. This ensures offline functionality and instant loading.

### Food Database (`src/data/foods.ts`)

~150-200 common foods across these categories:

**Proteins (~40 items):** chicken breast, salmon, eggs, egg whites, Greek yogurt, cottage cheese, tofu, tempeh, lean ground beef (93/7), turkey breast, tuna (canned), shrimp, tilapia, pork tenderloin, whey protein powder, casein protein, edamame, lentils, black beans, chickpeas, etc.

**Carbs/Grains (~30 items):** white rice, brown rice, oats (rolled), oats (instant), sweet potato, russet potato, quinoa, whole wheat pasta, white bread, whole wheat bread, corn tortilla, flour tortilla, couscous, barley, etc.

**Fruits (~20 items):** banana, apple, blueberries, strawberries, orange, mango, pineapple, grapes, watermelon, avocado, etc.

**Vegetables (~25 items):** broccoli, spinach, kale, bell peppers, asparagus, green beans, zucchini, cauliflower, carrots, tomatoes, cucumber, mushrooms, onion, garlic, Brussels sprouts, etc.

**Dairy (~15 items):** whole milk, skim milk, cheddar cheese, mozzarella, parmesan, cream cheese, butter, heavy cream, almond milk, oat milk, etc.

**Fats/Nuts (~20 items):** olive oil, coconut oil, almonds, peanuts, peanut butter, almond butter, walnuts, cashews, chia seeds, flaxseed, dark chocolate (85%), etc.

Each food item includes accurate macros per standard serving size.

### Recipe Database (`src/data/recipes.ts`)

~50 recipes tagged with goal alignment:

**Cut-friendly recipes (~18):** High protein, moderate carb, controlled calories
- Grilled Chicken & Broccoli Bowl
- Egg White Veggie Omelette
- Turkey Lettuce Wraps
- Baked Salmon with Asparagus
- Greek Yogurt Protein Bowl
- Shrimp Stir-Fry with Cauliflower Rice
- Tuna Salad Stuffed Avocado
- Chicken Zucchini Noodle Soup
- etc.

**Bulk-friendly recipes (~18):** Higher calorie, balanced or carb-forward
- Peanut Butter Banana Oat Shake
- Chicken Pasta with Olive Oil
- Beef and Rice Power Bowl
- Sweet Potato Black Bean Burrito
- Mass Gainer Smoothie (oats, protein, banana, PB)
- Double Chicken Burrito Bowl
- Loaded Oatmeal with Nuts and Honey
- etc.

**Maintain/versatile recipes (~14):** Balanced macros
- Salmon Rice Bowl with Avocado
- Mediterranean Chicken Wrap
- Overnight Oats with Berries
- Steak and Sweet Potato Plate
- Tofu Veggie Stir-Fry with Brown Rice
- etc.

Each recipe includes: ingredients list, step-by-step instructions, total macros, prep time, and number of servings.

### Food Suggestion Algorithm (`src/hooks/useFoodSuggestions.ts`)

Score and rank foods/recipes by relevance to the user's current targets:

```
relevanceScore = 0

// Protein density bonus (higher when cutting or weightlifting)
if (goalType === 'cut' || workoutType === 'weightlifting') {
  relevanceScore += (item.proteinG / item.calories) * 100
}

// Goal alignment bonus (recipes only)
if (item.goalAlignment?.includes(goalType)) {
  relevanceScore += 20
}

// Tag filter match
if (activeFilter && item.tags.includes(activeFilter)) {
  relevanceScore += 10
}

// Calorie efficiency for bulking
if (goalType === 'bulk') {
  relevanceScore += (item.calories / 100)  // prefer calorie-dense foods
}

// Sort descending by relevanceScore
```

---

## UI Design System

### Color Palette (`src/theme/colors.ts`)

Modern dark-mode-first design with vibrant accents:

```typescript
export const colors = {
  // Backgrounds
  bgPrimary: '#0F0F1A',         // Deep navy-black (main background)
  bgSecondary: '#1A1A2E',       // Slightly lighter (card backgrounds)
  bgCard: '#222240',            // Card/surface color
  bgInput: '#2A2A4A',           // Input field background

  // Macro accent colors (used for rings and charts)
  calories: '#FF6B35',          // Vibrant orange
  protein: '#4ECDC4',           // Teal
  carbs: '#FFE66D',             // Golden yellow
  fats: '#FF6B6B',              // Coral/salmon

  // Primary actions
  accent: '#7C5CFC',            // Purple (buttons, links)
  accentLight: '#9B7FFF',       // Lighter purple (hover/active states)
  accentGradientEnd: '#00D2FF', // Cyan (gradient pair with accent)

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',     // Muted lavender-gray
  textMuted: '#6B6B8D',         // Very muted

  // Goal type badges
  cut: '#E74C3C',               // Red
  maintain: '#3498DB',          // Blue
  bulk: '#2ECC71',              // Green

  // System
  success: '#2ECC71',
  warning: '#F39C12',
  danger: '#E74C3C',
  border: '#333355',
};
```

### Typography (`src/theme/typography.ts`)

Use system fonts — no custom font loading:

```typescript
export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const },    // Screen titles
  h2: { fontSize: 24, fontWeight: '700' as const },    // Section headers
  h3: { fontSize: 20, fontWeight: '600' as const },    // Card titles
  body: { fontSize: 16, fontWeight: '400' as const },  // Body text
  bodyBold: { fontSize: 16, fontWeight: '600' as const },
  caption: { fontSize: 13, fontWeight: '400' as const }, // Labels, hints
  macro: { fontSize: 32, fontWeight: '700' as const },   // Big macro numbers
  macroUnit: { fontSize: 14, fontWeight: '600' as const }, // "g", "kcal" units
};
```

### Spacing (`src/theme/spacing.ts`)

```typescript
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  screenPadding: 20,
  cardPadding: 16,
  cardRadius: 16,
  buttonRadius: 12,
};
```

### Component Design Guidelines

- **MacroRing**: SVG circle with animated stroke-dashoffset via react-native-reanimated. Props: `value`, `maxValue`, `color`, `size`, `label`, `unit`. Animate from 0 to target on mount.
- **Cards**: Use `bgCard` background, `cardRadius` border radius, subtle `border` color, `cardPadding` padding.
- **Buttons**: Primary buttons use gradient from `accent` to `accentGradientEnd`. Rounded with `buttonRadius`. White bold text.
- **Inputs**: `bgInput` background, `border` outline, `textPrimary` text, `textSecondary` placeholder.
- **Tab bar**: `bgSecondary` background, `accent` color for active tab, `textMuted` for inactive.

---

## Data Persistence

### AsyncStorage Keys

```typescript
const STORAGE_KEYS = {
  USER_PROFILE: '@macrofuel/user_profile',
  ONBOARDING_COMPLETE: '@macrofuel/onboarding_complete',
} as const;
```

### Storage Utility (`src/utils/storage.ts`)

Thin wrapper over AsyncStorage with JSON serialization:
- `saveProfile(profile: UserProfile): Promise<void>`
- `loadProfile(): Promise<UserProfile | null>`
- `setOnboardingComplete(): Promise<void>`
- `isOnboardingComplete(): Promise<boolean>`
- `clearAllData(): Promise<void>`

### Custom Hooks

- **`useUserProfile()`**: Returns `{ profile, saveProfile, isLoading, isOnboarded }`. Reads from AsyncStorage on mount. `saveProfile` writes back and marks onboarding complete.
- **`useMacroTargets(profile)`**: Pure derivation. Runs BMR → TDEE → GoalPlanner → MacroSplit pipeline. Returns full `MacroTargets`. Memoized with `useMemo` on profile fields.
- **`useFoodSuggestions(macroTargets, filter)`**: Filters and scores food/recipe database. Returns sorted arrays. Memoized on targets and active filter.

---

## Unit Conversion Helpers (`src/utils/formatters.ts`)

- `lbsToKg(lbs: number): number` — multiply by 0.453592
- `kgToLbs(kg: number): number` — multiply by 2.20462
- `inchesToCm(inches: number): number` — multiply by 2.54
- `cmToInches(cm: number): number` — multiply by 0.393701
- `feetInchesToCm(feet: number, inches: number): number`
- `cmToFeetInches(cm: number): { feet: number, inches: number }`
- `formatNumber(n: number, decimals?: number): string` — rounds and formats
- `formatWeight(kg: number, unit: WeightUnit): string` — e.g., "185 lbs" or "84 kg"
- `formatHeight(cm: number, unit: HeightUnit): string` — e.g., "5'11\"" or "180 cm"

---

## APK Build Configuration

### app.json

```json
{
  "expo": {
    "name": "Macro Fuel",
    "slug": "macro-fuel",
    "version": "1.0.0",
    "orientation": "portrait",
    "scheme": "macrofuel",
    "userInterfaceStyle": "dark",
    "splash": {
      "backgroundColor": "#0F0F1A"
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#0F0F1A"
      },
      "package": "com.macrofuel.app"
    },
    "plugins": ["expo-router"]
  }
}
```

### eas.json

```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "distribution": "internal"
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

### Build Commands

```bash
# Build APK for testing/sideloading
npx eas-cli build --platform android --profile preview

# Build AAB for Google Play Store
npx eas-cli build --platform android --profile production
```

---

## Development Commands

```bash
# Start development server
npx expo start

# Run on Android device/emulator
npx expo start --android

# Run TypeScript check
npx tsc --noEmit

# Run linter
npx expo lint
```

---

## Implementation Priority Order

1. **Project setup**: Initialize Expo, install dependencies, configure app.json/eas.json
2. **Types & theme**: Define all interfaces, colors, typography, spacing
3. **Algorithms**: Implement BMR, TDEE, goal planner, macro calculator with unit tests
4. **Storage & hooks**: AsyncStorage wrapper, useUserProfile, useMacroTargets
5. **Onboarding wizard**: Multi-step form with all user inputs
6. **Dashboard screen**: Macro rings with animated progress
7. **Food/recipe data**: Build out the embedded databases
8. **Meals screen**: Food suggestion cards with filtering
9. **Profile screen**: Display and edit profile
10. **Polish**: Animations, gradients, responsive layout for tablets
11. **Build**: Configure EAS and generate APK
