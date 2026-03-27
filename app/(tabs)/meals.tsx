import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { GradientHeader } from '../../src/components/GradientHeader';
import { FoodCard } from '../../src/components/FoodCard';
import { useUserProfile } from '../../src/hooks/useUserProfile';
import { useMacroTargets } from '../../src/hooks/useMacroTargets';
import { useFoodSuggestions } from '../../src/hooks/useFoodSuggestions';
import { FoodItem, Recipe } from '../../src/types';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';

const filters = [
  'All',
  'high-protein',
  'low-carb',
  'quick',
  'meal-prep',
  'breakfast',
  'lunch',
  'dinner',
  'snack',
];

export default function MealsScreen() {
  const { profile } = useUserProfile();
  const targets = useMacroTargets(profile);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'foods' | 'recipes'>('foods');

  const { foods, recipes } = useFoodSuggestions(
    targets,
    activeFilter === 'All' ? null : activeFilter
  );

  return (
    <View style={styles.container}>
      <GradientHeader title="Meal Ideas" goalType={targets?.goalType} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterContent}
      >
        {filters.map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterChip,
              (activeFilter === f || (f === 'All' && !activeFilter)) && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter(f === 'All' ? null : f)}
          >
            <Text
              style={[
                styles.filterText,
                (activeFilter === f || (f === 'All' && !activeFilter)) && styles.filterTextActive,
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.toggleRow}>
        {(['foods', 'recipes'] as const).map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[styles.toggleBtn, viewMode === mode && styles.toggleBtnActive]}
            onPress={() => setViewMode(mode)}
          >
            <Text style={[styles.toggleText, viewMode === mode && styles.toggleTextActive]}>
              {mode === 'foods' ? 'Foods' : 'Recipes'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={(viewMode === 'foods' ? foods : recipes) as (FoodItem | Recipe)[]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) =>
          viewMode === 'recipes' ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push(`/recipe/${item.id}`)}
            >
              <FoodCard item={item} type="recipe" />
            </TouchableOpacity>
          ) : (
            <FoodCard item={item} type="food" />
          )
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  filterRow: {
    maxHeight: 50,
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
  toggleRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screenPadding,
    marginBottom: spacing.md,
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
  list: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xxl,
  },
});
