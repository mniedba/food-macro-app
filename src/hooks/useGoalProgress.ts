import { useMemo } from 'react';
import { UserProfile, WeightEntry } from '../types';
import { localDateString } from '../utils/formatters';

export type ProgressSuggestion =
  | 'on_track'
  | 'losing_too_slow'
  | 'losing_too_fast'
  | 'gaining_too_slow'
  | 'gaining_too_fast';

export interface GoalProgressData {
  daysElapsed: number;
  totalDays: number;
  progressPercent: number;        // 0–1
  startDate: string;
  endDate: string;
  startWeightLbs: number;
  goalWeightLbs: number;
  expectedWeightLbs: number;      // where the user should be right now
  actualWeightLbs: number | null; // latest logged weight (null if never logged)
  deviationLbs: number | null;    // actual − expected (positive = heavier than expected)
  suggestion: ProgressSuggestion | null;
  suggestedCalAdjustment: number; // kcal/day to add (positive) or remove (negative)
  isComplete: boolean;
  weeklyChangeLbs: number;        // planned weekly change
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return localDateString(d);
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

    const today = localDateString();
    const startDate = profile.goalStartDate;
    const totalDays = profile.goalTimeframeWeeks * 7;
    const endDate = addDays(startDate, totalDays);

    const daysElapsed = Math.max(0, daysBetween(startDate, today));
    const weeksElapsed = daysElapsed / 7;

    const startWeightLbs = profile.goalStartWeightLbs ?? profile.weightLbs;
    const goalWeightLbs = profile.goalWeightLbs;
    const totalChange = goalWeightLbs - startWeightLbs;
    const weeklyChangeLbs = totalChange / profile.goalTimeframeWeeks;

    const expectedWeightLbs = startWeightLbs + weeklyChangeLbs * weeksElapsed;

    const latestEntry = weightEntries[0] ?? null; // already sorted newest-first
    const actualWeightLbs = latestEntry?.weightLbs ?? null;
    const deviationLbs = actualWeightLbs !== null ? actualWeightLbs - expectedWeightLbs : null;

    // Only suggest after at least one week with a logged weight
    // 1.1 lbs ≈ 0.5 kg threshold
    const THRESHOLD = 1.1;
    let suggestion: ProgressSuggestion | null = null;
    let suggestedCalAdjustment = 0;

    if (deviationLbs !== null && daysElapsed >= 7) {
      const daysRemaining = Math.max(totalDays - daysElapsed, 7);

      if (weeklyChangeLbs < -0.11) {
        // Cutting goal
        if (deviationLbs > THRESHOLD) {
          suggestion = 'losing_too_slow';
          suggestedCalAdjustment = -Math.min(
            Math.round((deviationLbs * 3500) / daysRemaining),
            300
          );
        } else if (deviationLbs < -THRESHOLD) {
          suggestion = 'losing_too_fast';
          suggestedCalAdjustment = Math.min(
            Math.round((Math.abs(deviationLbs) * 3500) / daysRemaining),
            300
          );
        } else {
          suggestion = 'on_track';
        }
      } else if (weeklyChangeLbs > 0.11) {
        // Bulking goal
        if (deviationLbs < -THRESHOLD) {
          suggestion = 'gaining_too_slow';
          suggestedCalAdjustment = Math.min(
            Math.round((Math.abs(deviationLbs) * 3500) / daysRemaining),
            300
          );
        } else if (deviationLbs > THRESHOLD) {
          suggestion = 'gaining_too_fast';
          suggestedCalAdjustment = -Math.min(
            Math.round((deviationLbs * 3500) / daysRemaining),
            300
          );
        } else {
          suggestion = 'on_track';
        }
      } else {
        // Maintenance goal — flag large swings either way
        if (Math.abs(deviationLbs) <= THRESHOLD) {
          suggestion = 'on_track';
        } else if (deviationLbs > THRESHOLD) {
          suggestion = 'gaining_too_fast';
          suggestedCalAdjustment = -Math.min(
            Math.round((deviationLbs * 3500) / daysRemaining),
            200
          );
        } else {
          suggestion = 'losing_too_fast';
          suggestedCalAdjustment = Math.min(
            Math.round((Math.abs(deviationLbs) * 3500) / daysRemaining),
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
      startWeightLbs,
      goalWeightLbs,
      expectedWeightLbs,
      actualWeightLbs,
      deviationLbs,
      suggestion,
      suggestedCalAdjustment,
      isComplete: daysElapsed >= totalDays,
      weeklyChangeLbs,
    };
  }, [profile, weightEntries]);
}
