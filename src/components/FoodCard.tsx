import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FoodItem, Recipe } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface FoodCardProps {
  item: FoodItem | Recipe;
  type: 'food' | 'recipe';
}

export function FoodCard({ item, type }: FoodCardProps) {
  const cal = type === 'food' ? (item as FoodItem).calories : (item as Recipe).totalCalories;
  const protein = type === 'food' ? (item as FoodItem).proteinG : (item as Recipe).totalProteinG;
  const carbs = type === 'food' ? (item as FoodItem).carbsG : (item as Recipe).totalCarbsG;
  const fat = type === 'food' ? (item as FoodItem).fatG : (item as Recipe).totalFatG;
  const total = protein + carbs + fat || 1;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.calories}>{Math.round(cal)} kcal</Text>
      </View>
      {type === 'food' && (
        <Text style={styles.serving}>{(item as FoodItem).servingSize}</Text>
      )}
      {type === 'recipe' && (
        <Text style={styles.serving}>
          {(item as Recipe).servings} servings · {(item as Recipe).prepTimeMin} min
        </Text>
      )}
      <View style={styles.macroBar}>
        <View style={[styles.macroSegment, { flex: protein / total, backgroundColor: colors.protein }]} />
        <View style={[styles.macroSegment, { flex: carbs / total, backgroundColor: colors.carbs }]} />
        <View style={[styles.macroSegment, { flex: fat / total, backgroundColor: colors.fats }]} />
      </View>
      <View style={styles.macroRow}>
        <Text style={[styles.macroText, { color: colors.protein }]}>P: {Math.round(protein)}g</Text>
        <Text style={[styles.macroText, { color: colors.carbs }]}>C: {Math.round(carbs)}g</Text>
        <Text style={[styles.macroText, { color: colors.fats }]}>F: {Math.round(fat)}g</Text>
      </View>
      <View style={styles.tags}>
        {item.tags.slice(0, 3).map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: spacing.cardRadius,
    padding: spacing.cardPadding,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  calories: {
    ...typography.bodyBold,
    color: colors.calories,
  },
  serving: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  macroBar: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  macroSegment: {
    height: '100%',
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  macroText: {
    ...typography.caption,
    fontWeight: '600',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: colors.bgInput,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
});
