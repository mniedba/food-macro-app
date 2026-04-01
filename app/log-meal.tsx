import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { FoodCard } from '../src/components/FoodCard';
import { useDailyLog } from '../src/context/DailyLogContext';
import { useFoodSuggestions } from '../src/hooks/useFoodSuggestions';
import { useUserProfile } from '../src/hooks/useUserProfile';
import { useMacroTargets } from '../src/hooks/useMacroTargets';
import { FoodItem, Recipe } from '../src/types';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import { spacing } from '../src/theme/spacing';

const FILTERS = [
  'All', 'high-protein', 'low-carb', 'quick',
  'meal-prep', 'breakfast', 'lunch', 'dinner', 'snack',
];

type SelectedItem = {
  item: FoodItem | Recipe;
  type: 'food' | 'recipe';
};

export default function LogMealScreen() {
  const { profile } = useUserProfile();
  const targets = useMacroTargets(profile);
  const { addEntry } = useDailyLog();

  const [viewMode, setViewMode] = useState<'foods' | 'recipes'>('foods');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selected, setSelected] = useState<SelectedItem | null>(null);
  const [servings, setServings] = useState(1);

  const { foods, recipes } = useFoodSuggestions(
    targets,
    activeFilter === 'All' ? null : activeFilter
  );

  const listData = (viewMode === 'foods' ? foods : recipes) as (FoodItem | Recipe)[];

  function getPerServingMacros(item: FoodItem | Recipe, type: 'food' | 'recipe') {
    if (type === 'food') {
      const f = item as FoodItem;
      return { cal: f.calories, protein: f.proteinG, carbs: f.carbsG, fat: f.fatG };
    }
    const r = item as Recipe;
    const s = r.servings || 1;
    return {
      cal: r.totalCalories / s,
      protein: r.totalProteinG / s,
      carbs: r.totalCarbsG / s,
      fat: r.totalFatG / s,
    };
  }

  const preview = useMemo(() => {
    if (!selected) return null;
    const m = getPerServingMacros(selected.item, selected.type);
    return {
      calories: Math.round(m.cal * servings),
      protein: Math.round(m.protein * servings),
      carbs: Math.round(m.carbs * servings),
      fat: Math.round(m.fat * servings),
      perServing: m,
    };
  }, [selected, servings]);

  function handleSelectItem(item: FoodItem | Recipe, type: 'food' | 'recipe') {
    if (selected?.item.id === item.id) {
      setSelected(null);
    } else {
      setSelected({ item, type });
      setServings(1);
    }
  }

  function handleAdd() {
    if (!selected || !preview) return;
    const m = preview.perServing;
    addEntry({
      itemId: selected.item.id,
      itemName: selected.item.name,
      itemType: selected.type,
      servings,
      caloriesPerServing: m.cal,
      proteinGPerServing: m.protein,
      carbsGPerServing: m.carbs,
      fatGPerServing: m.fat,
    });
    router.back();
  }

  function changeServings(delta: number) {
    setServings((prev) => Math.max(0.5, Math.round((prev + delta) * 2) / 2));
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log a Meal</Text>
        <View style={styles.cancelBtn} />
      </View>

      {/* Foods / Recipes toggle */}
      <View style={styles.toggleRow}>
        {(['foods', 'recipes'] as const).map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[styles.toggleBtn, viewMode === mode && styles.toggleBtnActive]}
            onPress={() => { setViewMode(mode); setSelected(null); }}
          >
            <Text style={[styles.toggleText, viewMode === mode && styles.toggleTextActive]}>
              {mode === 'foods' ? 'Foods' : 'Recipes'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filter chips */}
      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={(f) => f}
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterContent}
        renderItem={({ item: f }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              (activeFilter === f || (f === 'All' && !activeFilter)) && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter(f === 'All' ? null : f)}
          >
            <Text style={[
              styles.filterText,
              (activeFilter === f || (f === 'All' && !activeFilter)) && styles.filterTextActive,
            ]}>
              {f}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Item list */}
      <FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, selected && styles.listWithPanel]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const type = viewMode === 'foods' ? 'food' : 'recipe';
          const isSelected = selected?.item.id === item.id;
          return (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleSelectItem(item, type)}
              style={[styles.cardWrapper, isSelected && styles.cardWrapperSelected]}
            >
              <FoodCard item={item} type={type} />
            </TouchableOpacity>
          );
        }}
      />

      {/* Bottom selection panel */}
      {selected && preview && (
        <View style={styles.panel}>
          <Text style={styles.panelName} numberOfLines={1}>{selected.item.name}</Text>

          <View style={styles.panelMacroRow}>
            <Text style={[styles.panelMacro, { color: colors.calories }]}>{preview.calories} kcal</Text>
            <Text style={[styles.panelMacro, { color: colors.protein }]}>P {preview.protein}g</Text>
            <Text style={[styles.panelMacro, { color: colors.carbs }]}>C {preview.carbs}g</Text>
            <Text style={[styles.panelMacro, { color: colors.fats }]}>F {preview.fat}g</Text>
          </View>

          <View style={styles.servingsRow}>
            <TouchableOpacity style={styles.servingBtn} onPress={() => changeServings(-0.5)}>
              <Ionicons name="remove" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.servingsLabel}>
              {servings % 1 === 0 ? servings : servings.toFixed(1)} serving{servings !== 1 ? 's' : ''}
            </Text>
            <TouchableOpacity style={styles.servingBtn} onPress={() => changeServings(0.5)}>
              <Ionicons name="add" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleAdd} style={styles.addBtnWrapper}>
            <LinearGradient
              colors={[colors.accent, colors.accentGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.addBtn}
            >
              <Text style={styles.addBtnText}>Add to Today's Log</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cancelBtn: {
    width: 64,
  },
  cancelText: {
    ...typography.body,
    color: colors.accent,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  toggleRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: spacing.buttonRadius,
    backgroundColor: colors.bgCard,
  },
  toggleBtnActive: {
    backgroundColor: colors.accent,
  },
  toggleText: {
    ...typography.bodyBold,
    color: colors.textSecondary,
  },
  toggleTextActive: {
    color: colors.textPrimary,
  },
  filterRow: {
    maxHeight: 50,
    marginTop: spacing.sm,
  },
  filterContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.textPrimary,
  },
  list: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  listWithPanel: {
    paddingBottom: 240,
  },
  cardWrapper: {
    borderRadius: spacing.cardRadius,
    marginBottom: spacing.md,
  },
  cardWrapperSelected: {
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: spacing.cardRadius,
  },
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bgSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.cardPadding,
    paddingBottom: spacing.lg,
  },
  panelName: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  panelMacroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  panelMacro: {
    ...typography.caption,
    fontWeight: '600',
  },
  servingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  servingBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  servingsLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    minWidth: 110,
    textAlign: 'center',
  },
  addBtnWrapper: {
    borderRadius: spacing.buttonRadius,
    overflow: 'hidden',
  },
  addBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: spacing.buttonRadius,
  },
  addBtnText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
});
