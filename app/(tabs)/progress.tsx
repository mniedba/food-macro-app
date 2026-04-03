import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientHeader } from '../../src/components/GradientHeader';
import { useUserProfile } from '../../src/hooks/useUserProfile';
import { useMacroTargets } from '../../src/hooks/useMacroTargets';
import { useWeightHistory } from '../../src/hooks/useWeightHistory';
import { useGoalProgress } from '../../src/hooks/useGoalProgress';
import { loadDailyLog } from '../../src/utils/storage';
import { formatWeight } from '../../src/utils/formatters';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { WeightEntry } from '../../src/types';

interface DayHistory {
  date: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

export default function ProgressScreen() {
  const { profile, restartGoal } = useUserProfile();
  const targets = useMacroTargets(profile);
  const { entries: weightEntries, addEntry: addWeight, removeEntry: removeWeight } = useWeightHistory();
  const progress = useGoalProgress(profile, weightEntries);

  const [weightInput, setWeightInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [showLogForm, setShowLogForm] = useState(false);
  const [dayHistory, setDayHistory] = useState<DayHistory[]>([]);

  // Load the past N days of calorie logs for the history section
  useEffect(() => {
    if (!profile?.goalStartDate) return;
    const today = new Date().toISOString().split('T')[0];
    const startDate = profile.goalStartDate;

    // Collect dates from goal start up to today (newest first, max 60 days for perf)
    const dates: string[] = [];
    let cursor = today;
    while (cursor >= startDate && dates.length < 60) {
      dates.push(cursor);
      const d = new Date(cursor + 'T00:00:00');
      d.setDate(d.getDate() - 1);
      cursor = d.toISOString().split('T')[0];
    }

    (async () => {
      const results: DayHistory[] = [];
      for (const date of dates) {
        const entries = await loadDailyLog(date);
        if (entries.length > 0) {
          const calories = Math.round(entries.reduce((s, e) => s + e.caloriesPerServing * e.servings, 0));
          const proteinG = Math.round(entries.reduce((s, e) => s + e.proteinGPerServing * e.servings, 0));
          const carbsG = Math.round(entries.reduce((s, e) => s + e.carbsGPerServing * e.servings, 0));
          const fatG = Math.round(entries.reduce((s, e) => s + e.fatGPerServing * e.servings, 0));
          results.push({ date, calories, proteinG, carbsG, fatG });
        }
      }
      setDayHistory(results);
    })();
  }, [profile?.goalStartDate]);

  if (!profile || !targets) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Loading...</Text>
      </View>
    );
  }

  const unit = profile.weightUnit;

  const handleLogWeight = async () => {
    const val = parseFloat(weightInput);
    if (isNaN(val) || val <= 0) {
      Alert.alert('Invalid weight', 'Please enter a positive number.');
      return;
    }
    const weightKg = unit === 'lbs' ? val * 0.453592 : val;
    await addWeight(weightKg, noteInput.trim() || undefined);
    setWeightInput('');
    setNoteInput('');
    setShowLogForm(false);
  };

  const handleRemoveWeight = (entry: WeightEntry) => {
    Alert.alert(
      'Remove Entry',
      `Remove weight log for ${formatDate(entry.date)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeWeight(entry.id) },
      ]
    );
  };

  const handleRestartGoal = () => {
    const latestWeight = weightEntries[0]?.weightKg ?? profile.weightKg;
    Alert.alert(
      'Start New Goal Period',
      'This resets the goal timer to today, using your latest logged weight as the new starting point. Your goal weight and timeframe stay the same.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restart',
          onPress: () => restartGoal(latestWeight),
        },
      ]
    );
  };

  const suggestionConfig: Record<string, { color: string; icon: string; text: string }> = {
    on_track: { color: colors.success, icon: 'checkmark-circle', text: 'On track — keep it up!' },
    losing_too_slow: {
      color: colors.warning,
      icon: 'trending-down',
      text: `Progress is slower than planned. Consider reducing ~${Math.abs(progress?.suggestedCalAdjustment ?? 0)} kcal/day.`,
    },
    losing_too_fast: {
      color: colors.warning,
      icon: 'trending-up',
      text: `You're losing faster than planned. Consider adding ~${progress?.suggestedCalAdjustment ?? 0} kcal/day.`,
    },
    gaining_too_slow: {
      color: colors.warning,
      icon: 'trending-up',
      text: `Progress is slower than planned. Consider adding ~${progress?.suggestedCalAdjustment ?? 0} kcal/day.`,
    },
    gaining_too_fast: {
      color: colors.warning,
      icon: 'trending-down',
      text: `You're gaining faster than planned. Consider reducing ~${Math.abs(progress?.suggestedCalAdjustment ?? 0)} kcal/day.`,
    },
  };

  return (
    <View style={styles.container}>
      <GradientHeader title="Progress" goalType={targets.goalType} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Goal Timeline */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Goal Timeline</Text>
          {progress ? (
            <>
              <View style={styles.timelineRow}>
                <View>
                  <Text style={styles.dayLabel}>Day</Text>
                  <Text style={styles.dayCount}>
                    {progress.daysElapsed}
                    <Text style={styles.dayTotal}> / {progress.totalDays}</Text>
                  </Text>
                </View>
                <View style={[styles.goalBadge, { backgroundColor: colors[targets.goalType] }]}>
                  <Text style={styles.goalBadgeText}>{targets.goalType.toUpperCase()}</Text>
                </View>
              </View>

              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.min(progress.progressPercent * 100, 100)}%` },
                  ]}
                />
              </View>
              <View style={styles.dateRow}>
                <Text style={styles.dateLabel}>{formatShortDate(progress.startDate)}</Text>
                <Text style={styles.dateLabel}>
                  {Math.round(progress.progressPercent * 100)}%
                </Text>
                <Text style={styles.dateLabel}>{formatShortDate(progress.endDate)}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Start weight</Text>
                <Text style={styles.statValue}>{formatWeight(progress.startWeightKg, unit)}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Goal weight</Text>
                <Text style={styles.statValue}>{formatWeight(progress.goalWeightKg, unit)}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Expected now</Text>
                <Text style={styles.statValue}>{formatWeight(progress.expectedWeightKg, unit)}</Text>
              </View>

              {progress.isComplete && (
                <View style={[styles.banner, { backgroundColor: colors.success + '30', borderColor: colors.success }]}>
                  <Ionicons name="trophy" size={18} color={colors.success} />
                  <Text style={[styles.bannerText, { color: colors.success }]}>
                    Goal period complete!
                  </Text>
                </View>
              )}
            </>
          ) : (
            <Text style={styles.mutedText}>Complete onboarding to start tracking.</Text>
          )}

          <TouchableOpacity style={styles.restartBtn} onPress={handleRestartGoal}>
            <Ionicons name="refresh-outline" size={15} color={colors.accent} style={{ marginRight: 6 }} />
            <Text style={styles.restartBtnText}>Start New Goal Period</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Suggestion */}
        {progress?.suggestion && progress.suggestion !== 'on_track' && (
          <View
            style={[
              styles.banner,
              {
                backgroundColor: colors.warning + '20',
                borderColor: colors.warning,
                marginBottom: spacing.md,
              },
            ]}
          >
            <Ionicons
              name={suggestionConfig[progress.suggestion].icon as any}
              size={18}
              color={colors.warning}
              style={{ marginRight: 8 }}
            />
            <Text style={[styles.bannerText, { color: colors.warning, flex: 1 }]}>
              {suggestionConfig[progress.suggestion].text}
            </Text>
          </View>
        )}
        {progress?.suggestion === 'on_track' && (
          <View
            style={[
              styles.banner,
              {
                backgroundColor: colors.success + '20',
                borderColor: colors.success,
                marginBottom: spacing.md,
              },
            ]}
          >
            <Ionicons name="checkmark-circle" size={18} color={colors.success} style={{ marginRight: 8 }} />
            <Text style={[styles.bannerText, { color: colors.success }]}>On track — keep it up!</Text>
          </View>
        )}

        {/* Weight Tracking */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Weight Log</Text>
            {!showLogForm && (
              <TouchableOpacity onPress={() => setShowLogForm(true)} style={styles.addBtn}>
                <Ionicons name="add" size={18} color={colors.textPrimary} />
                <Text style={styles.addBtnText}>Log Weight</Text>
              </TouchableOpacity>
            )}
          </View>

          {showLogForm && (
            <View style={styles.logForm}>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.weightInput}
                  value={weightInput}
                  onChangeText={setWeightInput}
                  placeholder={`Weight (${unit})`}
                  placeholderTextColor={colors.textMuted}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                />
                <TextInput
                  style={[styles.weightInput, { flex: 2 }]}
                  value={noteInput}
                  onChangeText={setNoteInput}
                  placeholder="Note (optional)"
                  placeholderTextColor={colors.textMuted}
                  returnKeyType="done"
                />
              </View>
              <View style={styles.formBtns}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => { setShowLogForm(false); setWeightInput(''); setNoteInput(''); }}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveFormBtn} onPress={handleLogWeight}>
                  <LinearGradient
                    colors={[colors.accent, colors.accentGradientEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.saveFormGrad}
                  >
                    <Text style={styles.saveFormText}>Save</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {weightEntries.length === 0 ? (
            <Text style={styles.mutedText}>No weight entries yet. Tap "Log Weight" to start.</Text>
          ) : (
            weightEntries.map(entry => {
              const displayWeight = unit === 'lbs'
                ? (entry.weightKg * 2.20462).toFixed(1)
                : entry.weightKg.toFixed(1);
              return (
                <View key={entry.id} style={styles.weightRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.weightValue}>{displayWeight} {unit}</Text>
                    <Text style={styles.weightDate}>{formatDate(entry.date)}</Text>
                    {entry.note ? (
                      <Text style={styles.weightNote}>{entry.note}</Text>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveWeight(entry)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>

        {/* Calorie History */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Calorie History</Text>
          <Text style={styles.mutedText2}>Days with logged meals since goal start</Text>
          {dayHistory.length === 0 ? (
            <Text style={styles.mutedText}>No meal history yet.</Text>
          ) : (
            dayHistory.map(day => {
              const pct = targets.calories > 0 ? day.calories / targets.calories : 0;
              const barColor = pct > 1.1 ? colors.fats : pct < 0.85 ? colors.carbs : colors.success;
              return (
                <View key={day.date} style={styles.historyRow}>
                  <Text style={styles.historyDate}>{formatShortDate(day.date)}</Text>
                  <View style={styles.historyBarContainer}>
                    <View
                      style={[
                        styles.historyBar,
                        { width: `${Math.min(pct * 100, 100)}%`, backgroundColor: barColor },
                      ]}
                    />
                  </View>
                  <Text style={styles.historyKcal}>{day.calories} kcal</Text>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: spacing.xxl }} />
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
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  dayLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dayCount: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 40,
  },
  dayTotal: {
    fontSize: 18,
    fontWeight: '400',
    color: colors.textMuted,
  },
  goalBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  goalBadgeText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 10,
    backgroundColor: colors.bgInput,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: colors.accent,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  dateLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
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
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: spacing.buttonRadius,
    borderWidth: 1,
    marginTop: spacing.md,
  },
  bannerText: {
    ...typography.caption,
    fontWeight: '600',
    marginLeft: 6,
  },
  restartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    alignSelf: 'flex-start',
  },
  restartBtnText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: spacing.buttonRadius,
    gap: 4,
  },
  addBtnText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  logForm: {
    marginBottom: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  weightInput: {
    flex: 1,
    backgroundColor: colors.bgInput,
    borderRadius: spacing.buttonRadius,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    ...typography.body,
  },
  formBtns: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: spacing.buttonRadius,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelBtnText: {
    ...typography.bodyBold,
    color: colors.textSecondary,
  },
  saveFormBtn: {
    flex: 1,
    borderRadius: spacing.buttonRadius,
    overflow: 'hidden',
  },
  saveFormGrad: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveFormText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  mutedText: {
    ...typography.body,
    color: colors.textMuted,
    paddingVertical: spacing.sm,
    textAlign: 'center',
  },
  mutedText2: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  weightValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  weightDate: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  weightNote: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: spacing.sm,
  },
  historyDate: {
    ...typography.caption,
    color: colors.textSecondary,
    width: 52,
  },
  historyBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: colors.bgInput,
    borderRadius: 4,
    overflow: 'hidden',
  },
  historyBar: {
    height: '100%',
    borderRadius: 4,
  },
  historyKcal: {
    ...typography.caption,
    color: colors.textMuted,
    width: 68,
    textAlign: 'right',
  },
});
