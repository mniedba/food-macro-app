import React, { useEffect } from 'react';
import { Tabs, router } from 'expo-router';
import { Text } from 'react-native';
import { useUserProfile } from '../../src/hooks/useUserProfile';
import { colors } from '../../src/theme/colors';

export default function TabLayout() {
  const { isOnboarded, isLoading } = useUserProfile();

  useEffect(() => {
    if (!isLoading && !isOnboarded) {
      router.replace('/onboarding');
    }
  }, [isLoading, isOnboarded]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bgSecondary,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>\ud83d\udcca</Text>,
        }}
      />
      <Tabs.Screen
        name="meals"
        options={{
          title: 'Meals',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>\ud83c\udf7d</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>\ud83d\udc64</Text>,
        }}
      />
    </Tabs>
  );
}
