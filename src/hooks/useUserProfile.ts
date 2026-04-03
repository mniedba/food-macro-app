import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';
import { saveProfile as storageSave, loadProfile, setOnboardingComplete, isOnboardingComplete } from '../utils/storage';

function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    (async () => {
      const [savedProfile, onboarded] = await Promise.all([
        loadProfile(),
        isOnboardingComplete(),
      ]);
      setProfile(savedProfile);
      setIsOnboarded(onboarded);
      setIsLoading(false);
    })();
  }, []);

  const saveUserProfile = useCallback(async (newProfile: UserProfile) => {
    let profileToSave: UserProfile = { ...newProfile };

    if (!profile?.goalStartDate) {
      // First save (onboarding) — stamp goal start date and starting weight
      profileToSave.goalStartDate = todayString();
      profileToSave.goalStartWeightKg = newProfile.weightKg;
    } else if (
      profile.goalWeightKg !== newProfile.goalWeightKg ||
      profile.goalTimeframeWeeks !== newProfile.goalTimeframeWeeks
    ) {
      // Goal target or timeframe changed — restart the goal period
      profileToSave.goalStartDate = todayString();
      profileToSave.goalStartWeightKg = newProfile.weightKg;
    }

    await storageSave(profileToSave);
    await setOnboardingComplete();
    setProfile(profileToSave);
    setIsOnboarded(true);
  }, [profile]);

  // Explicitly restart the goal period (e.g. from Profile screen "Start New Goal")
  const restartGoal = useCallback(async (currentWeightKg?: number) => {
    if (!profile) return;
    const updated: UserProfile = {
      ...profile,
      goalStartDate: todayString(),
      goalStartWeightKg: currentWeightKg ?? profile.weightKg,
    };
    await storageSave(updated);
    setProfile(updated);
  }, [profile]);

  return { profile, saveProfile: saveUserProfile, restartGoal, isLoading, isOnboarded };
}
