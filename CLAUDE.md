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
- **Icons**: @expo/vector-icons (Ionicons) for tab bar and UI icons
- **System UI**: expo-navigation-bar for Android immersive mode (hides system nav bar)
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
│   ├── _layout.tsx                   # Root layout: DailyLogProvider, immersive mode, tab/modal stack
│   ├── onboarding.tsx                # Full-screen onboarding wizard (modal)
│   ├── log-meal.tsx                  # Meal logging modal (browse + servings picker + custom entry form)
│   ├── recipe/
│   │   └── [id].tsx                  # Recipe detail screen (dynamic route)
│   └── (tabs)/
│       ├── _layout.tsx               # Bottom tab bar configuration (Ionicons, safe area)
│       ├── index.tsx                 # Dashboard screen (macro rings + daily log + progress mini-card)
│       ├── meals.tsx                 # Food & recipe suggestions screen
│       ├── progress.tsx              # Goal progress, weight log, calorie history
│       └── profile.tsx               # User profile & settings screen
├── src/
│   ├── algorithms/
│   │   ├── bmr.ts                    # Mifflin-St Jeor BMR calculation
│   │   ├── tdee.ts                   # TDEE from BMR + activity + workout type
│   │   ├── macros.ts                 # Macro split calculator (cut/bulk/maintain)
│   │   └── goalPlanner.ts            # Weekly deficit/surplus from goal + timeframe
│   ├── components/
│   │   ├── MacroRing.tsx             # Animated circular progress ring (SVG)
│   │   ├── MacroDashboard.tsx        # Four-ring layout showing consumed vs. target
│   │   ├── ProfileForm.tsx           # Multi-step swipeable onboarding form
│   │   ├── GoalSelector.tsx          # Goal weight + timeframe picker with live preview
│   │   ├── ActivityPicker.tsx        # Activity level and workout type radio cards
│   │   ├── FoodCard.tsx              # Individual food/recipe suggestion card
│   │   ├── GradientHeader.tsx        # Reusable gradient header bar
│   │   └── NumberInput.tsx           # Styled numeric input with unit toggle
│   ├── context/
│   │   └── DailyLogContext.tsx       # React context + provider for daily meal log state
│   ├── data/
│   │   ├── foods.ts                  # Embedded food database (~110 items)
│   │   ├── recipes.ts               # Embedded recipe database (~50 recipes)
│   │   ├── activityMultipliers.ts    # TDEE multiplier constants
│   │   └── macroPresets.ts           # Macro ratio presets by goal × workout type
│   ├── hooks/
│   │   ├── useUserProfile.ts         # Read/write user profile; stamps goalStartDate on save
│   │   ├── useMacroTargets.ts        # Derived macro targets from profile + goal
│   │   ├── useFoodSuggestions.ts     # Filter/score foods matching macro targets
│   │   ├── useWeightHistory.ts       # CRUD for WeightEntry records (AsyncStorage-backed)
│   │   └── useGoalProgress.ts        # Goal timeline, expected vs. actual weight, suggestions
│   ├── theme/
│   │   ├── colors.ts                 # Color palette constants
│   │   ├── typography.ts             # Font sizes and weights
│   │   └── spacing.ts               # Margin/padding scale
│   ├── types/
│   │   └── index.ts                  # All TypeScript interfaces
│   └── utils/
│       ├── storage.ts                # AsyncStorage wrapper with JSON serialization
│       └── formatters.ts             # Number/unit formatting helpers + localDateString
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
  heightIn: number;            // always stored in total inches internally
  weightLbs: number;           // always stored in lbs internally
  age: number;
  activityLevel: ActivityLevel;
  workoutType: WorkoutType;
  goalWeightLbs: number;
  goalTimeframeWeeks: number;  // 4-52 weeks
  weightUnit: WeightUnit;      // display preference
  heightUnit: HeightUnit;      // display preference
  goalStartDate?: string;      // 'YYYY-MM-DD' — stamped on first save; resets when goal target/timeframe changes
  goalStartWeightLbs?: number; // body weight (lbs) recorded at goal start
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
```

---

## Nutrition Algorithms

### 1. BMR — Mifflin-St Jeor Equation (`src/algorithms/bmr.ts`)

The gold standard for estimating Basal Metabolic Rate, expressed in imperial units:

```
Male:   BMR = (4.536 × weightLbs) + (12.7 × heightIn) - (5 × age) + 5
Female: BMR = (4.536 × weightLbs) + (12.7 × heightIn) - (5 × age) - 161
```

**Function**: `calculateBMR(sex: Sex, weightLbs: number, heightIn: number, age: number): number`

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
totalWeightChangeLbs = goalWeightLbs - currentWeightLbs
weeklyChangeLbs = totalWeightChangeLbs / timeframeWeeks

// 1 lb body weight ≈ 3500 kcal
dailyCalorieAdjustment = (weeklyChangeLbs × 3500) / 7

// Safety clamp: max deficit -1000 kcal/day, max surplus +500 kcal/day
dailyCalorieAdjustment = clamp(dailyCalorieAdjustment, -1000, 500)

targetCalories = tdee + dailyCalorieAdjustment
```

**Goal Type Derivation**:
- `goalWeightLbs < currentWeightLbs - 1.1` → **cut**
- within ±1.1 lbs → **maintain**
- `goalWeightLbs > currentWeightLbs + 1.1` → **bulk**

**Function**: `planGoal(currentWeightLbs: number, goalWeightLbs: number, timeframeWeeks: number, tdee: number): { targetCalories: number, goalType: GoalType, weeklyChangeLbs: number, dailyCalorieAdjustment: number }`

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

**Protein floor rule**: For weightlifters, enforce minimum 0.73g protein per lb body weight (≈1.6g/kg). If the percentage-based calculation falls below this floor, set protein to the floor value and redistribute the remaining calories proportionally between carbs and fat.

**Function**: `calculateMacros(targetCalories: number, goalType: GoalType, workoutType: WorkoutType, weightLbs: number, bmr: number, tdee: number, weeklyWeightChangeLbs: number, dailyCalorieAdjustment: number): MacroTargets`

---

## Navigation & Screen Design

### Navigation Architecture

Four-tab bottom navigator using Expo Router file-based routing. First-time users see a full-screen onboarding wizard before accessing tabs.

### Root Layout (`app/_layout.tsx`)

On mount, check AsyncStorage for existing `UserProfile`:
- **No profile found** → render onboarding wizard (modal stack)
- **Profile exists** → render tab navigator

The entire stack is wrapped in `DailyLogProvider` so all screens share the same log state. Android immersive mode is enabled here via `expo-navigation-bar` (`setVisibilityAsync('hidden')` + `setBehaviorAsync('overlay-swipe')`), and re-applied on `AppState` foreground transitions since Android clears it on focus loss. The `log-meal` modal route is also registered in this stack.

### Tab 1: Dashboard (`app/(tabs)/index.tsx`)

The home screen showing consumed macros vs. daily targets.

**Layout:**
- **Top**: Gradient header with app name and goal type badge (CUT / MAINTAIN / BULK)
- **Center**: Large calorie ring showing consumed/target kcal; "X kcal remaining" label below
- **Below rings**: Row of three smaller rings (Protein, Carbs, Fat) each with a "Xg left" / "Xg over" label
- **Goal Progress mini-card**: Shows "Day X of Y" with a mini progress bar; warning icon if off-track; taps through to the Progress tab
- **Today's Log card**: Lists every logged entry for the day with name, servings, kcal, P/C/F, and a remove button. "Clear All" link when entries exist.
- **Log a Meal button**: Opens the `log-meal` modal
- **Daily Summary card**: Shows BMR, TDEE, daily calorie adjustment, weekly weight change target
- **Update Goal button**: Links to profile edit

### Tab 2: Meal Ideas (`app/(tabs)/meals.tsx`)

Scrollable food and recipe suggestions personalized to the user's macro targets.

**Layout:**
- **Search bar**: Text input (with search icon and clear button) to filter the current list by name in real time
- **Toggle**: Switch between "Foods" and "Recipes" view (clears search query on switch)
- **Filter chips**: Horizontal scrollable row of human-readable chips — "All", "High Protein", "Low Carb", "Quick", "Meal Prep", "Breakfast", "Lunch", "Dinner", "Snack" — that narrow results by food/recipe tag
- **List**: Vertical scrollable list of FoodCard components; shows an empty state (search icon + "No results found") when search + filter combination yields nothing
- Each card shows: name, macro breakdown mini-bar (colored segments), calories per serving, relevant tags
- **Recipe cards are tappable**: navigates to `app/recipe/[id].tsx` for full detail

**Filter chip keys** (internal tag values mapped to display labels):
- `null` → "All", `high-protein` → "High Protein", `low-carb` → "Low Carb", `quick` → "Quick", `meal-prep` → "Meal Prep", `breakfast` → "Breakfast", `lunch` → "Lunch", `dinner` → "Dinner", `snack` → "Snack"

### Recipe Detail (`app/recipe/[id].tsx`)

Full-screen detail view for a single recipe, accessed by tapping a recipe card in the Meals tab.

**Layout:**
- Back button (← Back)
- Recipe name and description
- Goal alignment badges (CUT / MAINTAIN / BULK, color-coded)
- Stats row: prep time, servings, total calories
- Macro color bar + P/C/F gram breakdown
- Ingredients bulleted list
- Numbered instructions
- Tags

### Log Meal Modal (`app/log-meal.tsx`)

Full-screen modal for browsing and logging a food item or recipe to the daily log, or entering a completely custom meal by hand.

**Layout:**
- Header: "Cancel" (left), "Log a Meal" title (center)
- Foods / Recipes / Custom toggle (three buttons)

**Foods and Recipes modes:**
- Filter chips (same set as Meals tab)
- Item list — tapping an item selects it (highlighted border)
- **Bottom selection panel** (appears when an item is selected):
  - Item name + live macro preview (updates as servings change)
  - Servings picker: `[−]  N servings  [+]` (0.5 increments, min 0.5)
  - "Add to Today's Log" button — calls `addEntry` from `DailyLogContext` and dismisses

**Custom mode** (filter chips and item list are hidden):
- Meal Name field (required text input)
- Calories field (required numeric input)
- Protein / Carbs / Fat fields side-by-side (numeric, default 0 if blank), each labelled in its macro accent colour
- Live macro preview row appears once a calorie value is typed
- "Add to Today's Log" button — validates inputs, logs the entry with `servings: 1` and the entered values as per-serving macros, then dismisses

### Tab 3: Progress (`app/(tabs)/progress.tsx`)

Goal tracking and weight history screen.

**Layout:**
- **Goal Timeline card**: "Day X of Y" counter, progress bar between start/end dates, start weight, goal weight, expected weight today. "Start New Goal Period" resets timer to today.
- **On-track / off-track banner**: Appears after ≥7 days with a logged weight entry. Compares actual vs. expected weight (threshold: 0.5 kg). Tells the user how many kcal/day to add or remove to get back on schedule (capped at ±300 kcal/day).
- **Weight Log card**: Inline form to log today's weight (+ optional note). Shows full history list sorted newest-first with remove buttons. Weight stored in kg internally; displayed in user's chosen unit.
- **Calorie History**: Mini bar chart of every day (since goal start, up to 60 days) where meals were logged, colour-coded vs. daily calorie target (green = on target, yellow = under, red = over). Each row is tappable — tapping expands an inline panel showing every logged food/recipe for that day: name, serving count, kcal, and colour-coded P/C/F grams per entry, plus a "Day total" summary row at the bottom. Tapping again collapses. A chevron icon indicates the expanded state. All data comes from local AsyncStorage; no extra permissions required.

### Tab 4: Profile (`app/(tabs)/profile.tsx`)

Displays current user profile and allows editing.

**Layout:**
- **Profile card**: Sex, age, height, weight displayed in a clean card
- **Goal card**: Current goal weight, timeframe, goal start date, goal type badge. "Start New Goal Period" inline button resets the goal timer.
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

~110 common foods across these categories:

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
  DAILY_LOG_PREFIX: '@macrofuel/daily_log_',  // + 'YYYY-MM-DD' suffix
  WEIGHT_HISTORY: '@macrofuel/weight_history',
} as const;
```

### Storage Utility (`src/utils/storage.ts`)

Thin wrapper over AsyncStorage with JSON serialization:
- `saveProfile(profile: UserProfile): Promise<void>`
- `loadProfile(): Promise<UserProfile | null>`
- `setOnboardingComplete(): Promise<void>`
- `isOnboardingComplete(): Promise<boolean>`
- `clearAllData(): Promise<void>` — clears profile, onboarding flag, weight history, and today's daily log
- `saveDailyLog(date: string, entries: LogEntry[]): Promise<void>`
- `loadDailyLog(date: string): Promise<LogEntry[]>`
- `clearDailyLog(date: string): Promise<void>`
- `saveWeightHistory(entries: WeightEntry[]): Promise<void>`
- `loadWeightHistory(): Promise<WeightEntry[]>`

### Daily Log Context (`src/context/DailyLogContext.tsx`)

React context that holds today's meal log state and is the single source of truth shared across the dashboard and log-meal modal. Wrap the app in `<DailyLogProvider>` (done in `app/_layout.tsx`).

```typescript
useDailyLog(): {
  entries: LogEntry[];
  totals: DailyTotals;          // memoized sum of all entries
  addEntry: (entry: Omit<LogEntry, 'id' | 'date'>) => void;
  removeEntry: (id: string) => void;
  clearLog: () => void;
  isLoading: boolean;
}
```

Loads from AsyncStorage on mount using today's date (`YYYY-MM-DD`). All mutations persist immediately. Entries automatically start fresh the next calendar day because the key is date-scoped.

### Custom Hooks

- **`useUserProfile()`**: Returns `{ profile, saveProfile, restartGoal, isLoading, isOnboarded }`. Reads from AsyncStorage on mount. `saveProfile` stamps `goalStartDate` + `goalStartWeightLbs` on first save and resets them whenever `goalWeightLbs` or `goalTimeframeWeeks` changes. `restartGoal(weightLbs?)` resets the goal start date to today without changing any other profile fields.
- **`useMacroTargets(profile)`**: Pure derivation. Runs BMR → TDEE → GoalPlanner → MacroSplit pipeline. Returns full `MacroTargets`. Memoized with `useMemo` on profile fields.
- **`useFoodSuggestions(macroTargets, filter)`**: Filters and scores food/recipe database. Returns sorted arrays. Memoized on targets and active filter.
- **`useWeightHistory()`**: Returns `{ entries, addEntry, removeEntry, isLoading }`. Entries are sorted newest-first. Persists to `@macrofuel/weight_history` after every mutation.
- **`useGoalProgress(profile, weightEntries)`**: Pure derivation. Returns a `GoalProgressData` object with: `daysElapsed`, `totalDays`, `progressPercent`, `startDate`, `endDate`, `startWeightLbs`, `goalWeightLbs`, `expectedWeightLbs`, `actualWeightLbs`, `deviationLbs`, `suggestion`, `suggestedCalAdjustment`, `isComplete`, and `weeklyChangeLbs`. Suggestion is only produced after ≥7 days with at least one weight entry; threshold is 1.1 lbs deviation from expected (≈0.5 kg).

---

## Unit Conversion Helpers (`src/utils/formatters.ts`)

Internal values are always imperial (lbs, total inches). These helpers convert for display or when accepting user input in the alternate unit.

- `lbsToKg(lbs: number): number` — multiply by 0.453592
- `kgToLbs(kg: number): number` — multiply by 2.20462
- `inchesToCm(inches: number): number` — multiply by 2.54
- `cmToInches(cm: number): number` — multiply by 0.393701
- `feetInchesToTotalInches(feet: number, inches: number): number`
- `totalInchesToFeetInches(totalInches: number): { feet: number, inches: number }`
- `formatNumber(n: number, decimals?: number): string` — rounds and formats
- `formatWeight(lbs: number, unit: WeightUnit): string` — e.g., "185 lbs" or "84 kg" (converts lbs→kg when unit is 'kg')
- `formatHeight(totalInches: number, unit: HeightUnit): string` — e.g., "5'9\"" or "175 cm" (converts inches→cm when unit is 'cm')
- `localDateString(date?: Date): string` — returns `'YYYY-MM-DD'` in the **device's local timezone**. Use this everywhere a date string is needed; never use `new Date().toISOString().split('T')[0]` which returns a UTC date and will log meals to the wrong day for users in non-zero UTC offsets.

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

## What's Been Built

All core features are implemented and shipped:

1. **Project setup** — Expo SDK 55, TypeScript, Expo Router, EAS build config
2. **Types & theme** — All interfaces, color palette, typography, spacing scale
3. **Algorithms** — BMR (Mifflin-St Jeor), TDEE, goal planner, macro split calculator
4. **Storage & hooks** — AsyncStorage wrapper, useUserProfile, useMacroTargets, daily log persistence
5. **Onboarding wizard** — 5-step form: basics → measurements → activity → goal → results
6. **Dashboard** — Animated macro rings (consumed vs. target), goal progress mini-card, Today's Log card, Log a Meal button
7. **Food/recipe data** — ~110 foods and ~26 recipes embedded
8. **Meals screen** — Food/recipe cards with filter chips; recipe cards navigate to detail screen
9. **Recipe detail screen** — Full ingredients, instructions, macros, goal badges
10. **Meal logging** — Log Meal modal with browsing, servings picker, live macro preview
11. **Progress screen** — Goal timeline (Day X of Y, progress bar, expected vs. actual weight), on-track/off-track banner with kcal adjustment suggestion, weight log with full history, calorie history bar chart
12. **Profile screen** — Display and edit profile, goal start date, Start New Goal Period button, reset data, unit toggle
13. **Android system UI** — Immersive mode hides system nav bar; swipe up to reveal temporarily
