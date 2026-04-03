import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, SafeAreaView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GradientHeader } from '../../src/components/GradientHeader';
import { ProfileForm } from '../../src/components/ProfileForm';
import { useUserProfile } from '../../src/hooks/useUserProfile';
import { useMacroTargets } from '../../src/hooks/useMacroTargets';
import { useWeightHistory } from '../../src/hooks/useWeightHistory';
import { clearAllData } from '../../src/utils/storage';
import { formatWeight, formatHeight } from '../../src/utils/formatters';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { UserProfile } from '../../src/types';
import { router } from 'expo-router';

const activityLabels: Record<string, string> = {
  sedentary: 'Sedentary',
  light: 'Light',
  moderate: 'Moderate',
  active: 'Active',
  very_active: 'Very Active',
};

const workoutLabels: Record<string, string> = {
  sedentary: 'Sedentary',
  weightlifting: 'Weightlifting',
  cardio: 'Cardio',
  mixed: 'Mixed',
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ProfileScreen() {
  const { profile, saveProfile, restartGoal } = useUserProfile();
  const targets = useMacroTargets(profile);
  const { entries: weightEntries } = useWeightHistory();
  const [editModalVisible, setEditModalVisible] = useState(false);

  if (!profile || !targets) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Loading...</Text>
      </View>
    );
  }

  const handleReset = () => {
    Alert.alert(
      'Reset All Data',
      'This will delete your profile and all settings. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  const handleSaveEdit = async (updatedProfile: UserProfile) => {
    await saveProfile(updatedProfile);
    setEditModalVisible(false);
  };

  const handleRestartGoal = () => {
    const latestWeight = weightEntries[0]?.weightKg ?? profile?.weightKg;
    Alert.alert(
      'Start New Goal Period',
      'This resets the goal timer to today, using your latest logged weight as the new starting point. Your goal weight and timeframe stay the same.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Restart', onPress: () => restartGoal(latestWeight) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <GradientHeader title="Profile" goalType={targets.goalType} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personal Info</Text>
          <InfoRow label="Sex" value={profile.sex === 'male' ? 'Male' : 'Female'} />
          <InfoRow label="Age" value={`${profile.age} years`} />
          <InfoRow label="Height" value={formatHeight(profile.heightCm, profile.heightUnit)} />
          <InfoRow label="Weight" value={formatWeight(profile.weightKg, profile.weightUnit)} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Goal</Text>
          <InfoRow label="Goal Weight" value={formatWeight(profile.goalWeightKg, profile.weightUnit)} />
          <InfoRow label="Timeframe" value={`${profile.goalTimeframeWeeks} weeks`} />
          {profile.goalStartDate && (
            <InfoRow label="Goal Started" value={formatDate(profile.goalStartDate)} />
          )}
          <View style={styles.badgeRow}>
            <Text style={styles.statLabel}>Goal Type</Text>
            <View style={[styles.badge, { backgroundColor: colors[targets.goalType] }]}>
              <Text style={styles.badgeText}>{targets.goalType.toUpperCase()}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.restartGoalBtn} onPress={handleRestartGoal}>
            <Ionicons name="refresh-outline" size={14} color={colors.accent} style={{ marginRight: 5 }} />
            <Text style={styles.restartGoalText}>Start New Goal Period</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Activity</Text>
          <InfoRow label="Activity Level" value={activityLabels[profile.activityLevel]} />
          <InfoRow label="Workout Type" value={workoutLabels[profile.workoutType]} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Computed Stats</Text>
          <InfoRow label="BMR" value={`${targets.bmr} kcal`} />
          <InfoRow label="TDEE" value={`${targets.tdee} kcal`} />
          <InfoRow label="Daily Target" value={`${targets.calories} kcal`} />
        </View>

        <TouchableOpacity style={styles.editBtn} onPress={() => setEditModalVisible(true)}>
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
          <Text style={styles.resetBtnText}>Reset All Data</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={editModalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Text style={styles.modalClose}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <ProfileForm initialProfile={profile} onSave={handleSaveEdit} />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
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
    paddingTop: spacing.md,
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  statLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  statValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  editBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: spacing.buttonRadius,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  editBtnText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  resetBtn: {
    paddingVertical: 16,
    borderRadius: spacing.buttonRadius,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.danger,
    marginBottom: spacing.xxl,
  },
  resetBtnText: {
    ...typography.bodyBold,
    color: colors.danger,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
  },
  modalClose: {
    ...typography.bodyBold,
    color: colors.accent,
  },
  restartGoalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    alignSelf: 'flex-start',
  },
  restartGoalText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
  },
});
