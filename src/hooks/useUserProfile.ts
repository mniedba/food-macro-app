import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';
import { saveProfile as storageSave, loadProfile, setOnboardingComplete, isOnboardingComplete } from '../utils/storage';

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
    await storageSave(newProfile);
    await setOnboardingComplete();
    setProfile(newProfile);
    setIsOnboarded(true);
  }, []);

  return { profile, saveProfile: saveUserProfile, isLoading, isOnboarded };
}
