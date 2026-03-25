import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ProfileForm } from '../src/components/ProfileForm';
import { useUserProfile } from '../src/hooks/useUserProfile';
import { UserProfile } from '../src/types';
import { colors } from '../src/theme/colors';

export default function OnboardingScreen() {
  const { saveProfile } = useUserProfile();

  const handleSave = async (profile: UserProfile) => {
    await saveProfile(profile);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ProfileForm onSave={handleSave} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
});
