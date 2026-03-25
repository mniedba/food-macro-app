import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { GradientHeader } from '../../src/components/GradientHeader';
import { MacroDashboard } from '../../src/components/MacroDashboard';
import { useUserProfile } from '../../src/hooks/useUserProfile';
import { useMacroTargets } from '../../src/hooks/useMacroTargets';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { formatWeight } from '../../src/utils/formatters';
import { router } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function DashboardScreen() {
  const { profile } = useUserProfile();
  const targets = useMacroTargets(profile);

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
        <MacroDashboard targets={targets} />

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
  cardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
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
