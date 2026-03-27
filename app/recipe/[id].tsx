import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { recipes } from '../../src/data/recipes';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { GoalType } from '../../src/types';

const goalBadgeColor: Record<GoalType, string> = {
  cut: colors.cut,
  maintain: colors.maintain,
  bulk: colors.bulk,
};

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipe = recipes.find((r) => r.id === id);

  if (!recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Recipe not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const total = recipe.totalProteinG + recipe.totalCarbsG + recipe.totalFatG || 1;

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Title & description */}
        <Text style={styles.title}>{recipe.name}</Text>
        <Text style={styles.description}>{recipe.description}</Text>

        {/* Goal alignment badges */}
        <View style={styles.badgeRow}>
          {recipe.goalAlignment.map((goal) => (
            <View
              key={goal}
              style={[styles.badge, { backgroundColor: goalBadgeColor[goal] }]}
            >
              <Text style={styles.badgeText}>{goal.toUpperCase()}</Text>
            </View>
          ))}
        </View>

        {/* Stats row */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{recipe.prepTimeMin} min</Text>
            <Text style={styles.statLabel}>Prep Time</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{recipe.servings}</Text>
            <Text style={styles.statLabel}>Servings</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.calories }]}>
              {Math.round(recipe.totalCalories)}
            </Text>
            <Text style={styles.statLabel}>kcal</Text>
          </View>
        </View>

        {/* Macro bar */}
        <View style={styles.section}>
          <View style={styles.macroBar}>
            <View
              style={[
                styles.macroSegment,
                { flex: recipe.totalProteinG / total, backgroundColor: colors.protein },
              ]}
            />
            <View
              style={[
                styles.macroSegment,
                { flex: recipe.totalCarbsG / total, backgroundColor: colors.carbs },
              ]}
            />
            <View
              style={[
                styles.macroSegment,
                { flex: recipe.totalFatG / total, backgroundColor: colors.fats },
              ]}
            />
          </View>
          <View style={styles.macroRow}>
            <Text style={[styles.macroText, { color: colors.protein }]}>
              Protein: {Math.round(recipe.totalProteinG)}g
            </Text>
            <Text style={[styles.macroText, { color: colors.carbs }]}>
              Carbs: {Math.round(recipe.totalCarbsG)}g
            </Text>
            <Text style={[styles.macroText, { color: colors.fats }]}>
              Fat: {Math.round(recipe.totalFatG)}g
            </Text>
          </View>
        </View>

        {/* Ingredients */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          <View style={styles.card}>
            {recipe.ingredients.map((ingredient, i) => (
              <View key={i} style={styles.listRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>{ingredient}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <View style={styles.card}>
            {recipe.instructions.map((step, i) => (
              <View key={i} style={styles.listRow}>
                <Text style={styles.stepNumber}>{i + 1}.</Text>
                <Text style={styles.listText}>{step}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tags */}
        <View style={styles.tagRow}>
          {recipe.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  backBtn: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
  },
  backText: {
    ...typography.bodyBold,
    color: colors.accent,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  content: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xxl,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.bgCard,
    borderRadius: spacing.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.cardPadding,
    marginBottom: spacing.lg,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: spacing.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.cardPadding,
    gap: spacing.sm,
  },
  macroBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  macroSegment: {
    height: '100%',
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroText: {
    ...typography.caption,
    fontWeight: '600',
  },
  listRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  bullet: {
    ...typography.body,
    color: colors.accent,
    lineHeight: 22,
  },
  stepNumber: {
    ...typography.bodyBold,
    color: colors.accent,
    minWidth: 20,
    lineHeight: 22,
  },
  listText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 22,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tag: {
    backgroundColor: colors.bgInput,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
});
