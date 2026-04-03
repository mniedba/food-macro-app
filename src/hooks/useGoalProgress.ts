import { useMemo } from 'react';
import { UserProfile, WeightEntry } from '../types';

export type ProgressSuggestion =
  | 'on_track'
  | 'losing_too_slow'
  | 'losing_too_fast'
  | 'gaining_too_slow'
  | 'gaining_too_fast';

export interface GoalProgressData {
  daysElapsed: number;
  totalDays: number;
  progressPercent: number;       // 0–1
  startDate: string;
  endDate: string;
  startWeightKg: number;
  goalWeightKg: number;
  expectedWeightKg: number;      // where the user should be right now
  actualWeightKg: number | null; // latest logged weight (null if never logged)
  deviationKg: number | null;    // actual − expected (positive = heavier than expected)
  suggestion: ProgressSuggestion | null;
  suggestedCalAdjustment: number; // kcal/day to add (positive) or remove (negative)
  isComplete: boolean;
  weeklyChangeKg: number;        // planned weekly change
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

export function useGoalProgress(
  profile: UserProfile | null,
  weightEntries: WeightEntry[]
): GoalProgressData | null {
  return useMemo(() => {
    if (!profile?.goalStartDate) return null;

    const today = new Date().toISOString().split('T')[0];
    const startDate = profile.goalStartDate;
    const totalDays = profile.goalTimeframeWeeks * 7;
    const endDate = addDays(startDate, totalDays);

    const daysElapsed = Math.max(0, daysBetween(startDate, today));
    const weeksElapsed = daysElapsed / 7;

    const startWeightKg = profile.goalStartWeightKg ?? profile.weightKg;
    const goalWeightKg = profile.goalWeightKg;
    const totalChange = goalWeightKg - startWeightKg;
    const weeklyChangeKg = totalChange / profile.goalTimeframeWeeks;

    const expectedWeightKg = startWeightKg + weeklyChangeKg * weeksElapsed;

    const latestEntry = weightEntries[0] ?? null; // already sorted newest-first
    const actualWeightKg = latestEntry?.weightKg ?? null;
    const deviationKg = actualWeightKg !== null ? actualWeightKg - expectedWeightKg : null;

    // Only suggest after at least one week with a logged weight
    const THRESHOLD = 0.5; // kg
    let suggestion: ProgressSuggestion | null = null;
    let suggestedCalAdjustment = 0;

    if (deviationKg !== null && daysElapsed >= 7) {
      const daysRemaining = Math.max(totalDays - daysElapsed, 7);

      if (weeklyChangeKg < -0.05) {
        // Cutting goal
        if (deviationKg > THRESHOLD) {
          suggestion = 'losing_too_slow';
          suggestedCalAdjustment = -Math.min(
            Math.round((deviationKg * 7700) / daysRemaining),
            300
          );
        } else if (deviationKg < -THRESHOLD) {
          suggestion = 'losing_too_fast';
          suggestedCalAdjustment = Math.min(
            Math.round((Math.abs(deviationKg) * 7700) / daysRemaining),
            300
          );
        } else {
          suggestion = 'on_track';
        }
      } else if (weeklyChangeKg > 0.05) {
        // Bulking goal
        if (deviationKg < -THRESHOLD) {
          suggestion = 'gaining_too_slow';
          suggestedCalAdjustment = Math.min(
            Math.round((Math.abs(deviationKg) * 7700) / daysRemaining),
            300
          );
        } else if (deviationKg > THRESHOLD) {
          suggestion = 'gaining_too_fast';
          suggestedCalAdjustment = -Math.min(
            Math.round((deviationKg * 7700) / daysRemaining),
            300
          );
        } else {
          suggestion = 'on_track';
        }
      } else {
        // Maintenance goal — flag large swings either way
        if (Math.abs(deviationKg) <= THRESHOLD) {
          suggestion = 'on_track';
        } else if (deviationKg > THRESHOLD) {
          suggestion = 'gaining_too_fast';
          suggestedCalAdjustment = -Math.min(
            Math.round((deviationKg * 7700) / daysRemaining),
            200
          );
        } else {
          suggestion = 'losing_too_fast';
          suggestedCalAdjustment = Math.min(
            Math.round((Math.abs(deviationKg) * 7700) / daysRemaining),
            200
          );
        }
      }
    }

    return {
      daysElapsed,
      totalDays,
      progressPercent: Math.min(daysElapsed / Math.max(totalDays, 1), 1),
      startDate,
      endDate,
      startWeightKg,
      goalWeightKg,
      expectedWeightKg,
      actualWeightKg,
      deviationKg,
      suggestion,
      suggestedCalAdjustment,
      isComplete: daysElapsed >= totalDays,
      weeklyChangeKg,
    };
  }, [profile, weightEntries]);
}
