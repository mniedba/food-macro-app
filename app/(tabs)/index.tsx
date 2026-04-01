import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GradientHeader } from '../../src/components/GradientHeader';
import { MacroDashboard } from '../../src/components/MacroDashboard';
import { useUserProfile } from '../../src/hooks/useUserProfile';
import { useMacroTargets } from '../../src/hooks/useMacroTargets';
import { useDailyLog } from '../../src/context/DailyLogContext';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { formatWeight } from '../../src/utils/formatters';
import { LogEntry } from '../../src/types';

export default function DashboardScreen() {
  const { profile } = useUserProfile();
  const targets = useMacroTargets(profile);
  const { entries, totals, removeEntry, clearLog } = useDailyLog();

  if (!profile || !targets) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GradientHeader title="Macro Fuel" goalType={targets.goalType} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        <MacroDashboard targets={targets} consumed={totals} />

        {/* Today's Log */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Today's Log</Text>
            {entries.length > 0 && (
              <TouchableOpacity onPress={clearLog}>
                <Text style={styles.clearAllText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>

          {entries.length === 0 ? (
            <Text style={styles.emptyLogText}>No meals logged yet.</Text>
          ) : (
            entries.map((entry: LogEntry) => {
              const entryCalories = Math.round(entry.caloriesPerServing * entry.servings);
              const entryProtein = Math.round(entry.proteinGPerServing * entry.servings);
              const entryCarbs = Math.round(entry.carbsGPerServing * entry.servings);
              const entryFat = Math.round(entry.fatGPerServing * entry.servings);
              const servingLabel = entry.servings === 1 ? '1 serving' : `${entry.servings} servings`;
              return (
                <View key={entry.id} style={styles.logRow}>
                  <View style={styles.logInfo}>
                    <Text style={styles.logName} numberOfLines={1}>{entry.itemName}</Text>
                    <Text style={styles.logMeta}>{servingLabel} · {entryCalories} kcal</Text>
                    <View style={styles.logMacroRow}>
                      <Text style={[styles.logMacro, { color: colors.protein }]}>P {entryProtein}g</Text>
                      <Text style={[styles.logMacro, { color: colors.carbs }]}>C {entryCarbs}g</Text>
                      <Text style={[styles.logMacro, { color: colors.fats }]}>F {entryFat}g</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeEntry(entry.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close-circle" size={22} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>

        {/* Log a Meal button */}
        <TouchableOpacity
          style={styles.logBtnWrapper}
          onPress={() => router.push('/log-meal')}
        >
          <LinearGradient
            colors={[colors.accent, colors.accentGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.logBtn}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.textPrimary} style={styles.logBtnIcon} />
            <Text style={styles.logBtnText}>Log a Meal</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Daily Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daily Summary</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>BMR</Text>
            <Text style={styles.statValue}>{targets.bmr} kcal</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>TDEE</Text>
            <Text style={styles.statValue}>{targets.tdee} kcal</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Daily Adjustment</Text>
            <Text style={[styles.statValue, {
              color: targets.dailyCalorieAdjustment < 0 ? colors.cut : targets.dailyCalorieAdjustment > 0 ? colors.bulk : colors.maintain
            }]}>
              {targets.dailyCalorieAdjustment > 0 ? '+' : ''}{targets.dailyCalorieAdjustment} kcal
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Weekly Change</Text>
            <Text style={styles.statValue}>
              {targets.weeklyWeightChangeKg > 0 ? '+' : ''}
              {formatWeight(Math.abs(targets.weeklyWeightChangeKg), profile.weightUnit)}/week
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.updateBtnWrapper}
          onPress={() => router.push('/profile')}
        >
          <LinearGradient
            colors={[colors.accent, colors.accentGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.updateBtn}
          >
            <Text style={styles.updateBtnText}>Update Goal</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: spacing.screenPadding,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bgPrimary,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: spacing.cardRadius,
    padding: spacing.cardPadding,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  clearAllText: {
    ...typography.caption,
    color: colors.danger,
    fontWeight: '600',
  },
  emptyLogText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  logName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  logMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  logMacroRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: 4,
  },
  logMacro: {
    ...typography.caption,
    fontWeight: '600',
  },
  removeBtn: {
    padding: 4,
  },
  logBtnWrapper: {
    marginBottom: spacing.md,
  },
  logBtn: {
    paddingVertical: 16,
    borderRadius: spacing.buttonRadius,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logBtnIcon: {
    marginRight: spacing.sm,
  },
  logBtnText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  statValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  updateBtnWrapper: {
    marginBottom: spacing.xxl,
  },
  updateBtn: {
    paddingVertical: 16,
    borderRadius: spacing.buttonRadius,
    alignItems: 'center',
  },
  updateBtnText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
});
