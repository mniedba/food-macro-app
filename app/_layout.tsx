import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, AppState } from 'react-native';
import { Stack } from 'expo-router';
import * as NavigationBar from 'expo-navigation-bar';
import { useUserProfile } from '../src/hooks/useUserProfile';
import { colors } from '../src/theme/colors';

export default function RootLayout() {
  const { isLoading } = useUserProfile();

  useEffect(() => {
    const enableImmersive = () => {
      NavigationBar.setVisibilityAsync('hidden');
      NavigationBar.setBehaviorAsync('overlay-swipe');
    };

    enableImmersive();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') enableImmersive();
    });

    return () => subscription.remove();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="onboarding"
        options={{ presentation: 'fullScreenModal' }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bgPrimary,
  },
});
