import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, LogEntry } from '../types';

const STORAGE_KEYS = {
  USER_PROFILE: '@macrofuel/user_profile',
  ONBOARDING_COMPLETE: '@macrofuel/onboarding_complete',
  DAILY_LOG_PREFIX: '@macrofuel/daily_log_',
} as const;

export async function saveProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
}

export async function loadProfile(): Promise<UserProfile | null> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
  return data ? JSON.parse(data) : null;
}

export async function setOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
}

export async function isOnboardingComplete(): Promise<boolean> {
  const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
  return value === 'true';
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
  await AsyncStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
  const today = new Date().toISOString().split('T')[0];
  await AsyncStorage.removeItem(STORAGE_KEYS.DAILY_LOG_PREFIX + today);
}

export async function saveDailyLog(date: string, entries: LogEntry[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.DAILY_LOG_PREFIX + date, JSON.stringify(entries));
}

export async function loadDailyLog(date: string): Promise<LogEntry[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_LOG_PREFIX + date);
  return data ? JSON.parse(data) : [];
}

export async function clearDailyLog(date: string): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.DAILY_LOG_PREFIX + date);
}
