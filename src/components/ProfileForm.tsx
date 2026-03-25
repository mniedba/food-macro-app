import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { UserProfile, Sex, WeightUnit, HeightUnit } from '../types';
import { NumberInput } from './NumberInput';
import { ActivityPicker } from './ActivityPicker';
import { GoalSelector } from './GoalSelector';
import { MacroDashboard } from './MacroDashboard';
import { useMacroTargets } from '../hooks/useMacroTargets';
import { lbsToKg, kgToLbs, feetInchesToCm, cmToFeetInches, cmToInches, inchesToCm } from '../utils/formatters';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface ProfileFormProps {
  initialProfile?: UserProfile | null;
  onSave: (profile: UserProfile) => void;
}

const defaultProfile: UserProfile = {
  sex: 'male',
  heightCm: 175,
  weightKg: 75,
  age: 25,
  activityLevel: 'moderate',
  workoutType: 'mixed',
  goalWeightKg: 73,
  goalTimeframeWeeks: 12,
  weightUnit: 'lbs',
  heightUnit: 'in',
};

export function ProfileForm({ initialProfile, onSave }: ProfileFormProps) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>(initialProfile || defaultProfile);

  const [ageStr, setAgeStr] = useState(String(profile.age));
  const [weightStr, setWeightStr] = useState(
    profile.weightUnit === 'lbs'
      ? String(Math.round(kgToLbs(profile.weightKg)))
      : String(Math.round(profile.weightKg))
  );
  const [heightStr, setHeightStr] = useState(() => {
    if (profile.heightUnit === 'in') {
      const total = Math.round(cmToInches(profile.heightCm));
      return String(total);
    }
    return String(Math.round(profile.heightCm));
  });
  const [feetStr, setFeetStr] = useState(() => {
    const { feet } = cmToFeetInches(profile.heightCm);
    return String(feet);
  });
  const [inchesStr, setInchesStr] = useState(() => {
    const { inches } = cmToFeetInches(profile.heightCm);
    return String(inches);
  });
  const [goalWeightStr, setGoalWeightStr] = useState(
    profile.weightUnit === 'lbs'
      ? String(Math.round(kgToLbs(profile.goalWeightKg)))
      : String(Math.round(profile.goalWeightKg))
  );

  const macroTargets = useMacroTargets(profile);
  const steps = ['Basics', 'Body', 'Activity', 'Goal', 'Results'];

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((p) => ({ ...p, ...updates }));
  };

  const handleWeightChange = (val: string) => {
    setWeightStr(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      updateProfile({ weightKg: profile.weightUnit === 'lbs' ? lbsToKg(num) : num });
    }
  };

  const handleHeightChange = (field: 'feet' | 'inches' | 'cm', val: string) => {
    if (profile.heightUnit === 'in') {
      const newFeet = field === 'feet' ? val : feetStr;
      const newInches = field === 'inches' ? val : inchesStr;
      if (field === 'feet') setFeetStr(val);
      if (field === 'inches') setInchesStr(val);
      const f = parseInt(newFeet) || 0;
      const i = parseInt(newInches) || 0;
      updateProfile({ heightCm: feetInchesToCm(f, i) });
    } else {
      setHeightStr(val);
      const num = parseFloat(val);
      if (!isNaN(num) && num > 0) {
        updateProfile({ heightCm: num });
      }
    }
  };

  const handleGoalWeightChange = (val: string) => {
    setGoalWeightStr(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      updateProfile({ goalWeightKg: profile.weightUnit === 'lbs' ? lbsToKg(num) : num });
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View>
            <Text style={styles.stepTitle}>What's your sex?</Text>
            <View style={styles.toggleRow}>
              {(['male', 'female'] as Sex[]).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.toggleBtn, profile.sex === s && styles.toggleBtnActive]}
                  onPress={() => updateProfile({ sex: s })}
                >
                  <Text style={[styles.toggleText, profile.sex === s && styles.toggleTextActive]}>
                    {s === 'male' ? '\u2642 Male' : '\u2640 Female'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <NumberInput
              label="Age"
              value={ageStr}
              onChangeText={(val) => {
                setAgeStr(val);
                const num = parseInt(val);
                if (!isNaN(num) && num > 0) updateProfile({ age: num });
              }}
              unit="years"
            />
          </View>
        );
      case 1:
        return (
          <View>
            <Text style={styles.stepTitle}>Body Measurements</Text>
            {profile.heightUnit === 'in' ? (
              <View>
                <Text style={styles.fieldLabel}>Height</Text>
                <View style={styles.heightRow}>
                  <View style={styles.heightField}>
                    <NumberInput label="Feet" value={feetStr} onChangeText={(v) => handleHeightChange('feet', v)} />
                  </View>
                  <View style={styles.heightField}>
                    <NumberInput label="Inches" value={inchesStr} onChangeText={(v) => handleHeightChange('inches', v)} />
                  </View>
                </View>
                <TouchableOpacity onPress={() => {
                  updateProfile({ heightUnit: 'cm' });
                  setHeightStr(String(Math.round(profile.heightCm)));
                }}>
                  <Text style={styles.switchUnit}>Switch to cm</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <NumberInput
                  label="Height"
                  value={heightStr}
                  onChangeText={(v) => handleHeightChange('cm', v)}
                  unit="cm"
                />
                <TouchableOpacity onPress={() => {
                  updateProfile({ heightUnit: 'in' });
                  const { feet, inches } = cmToFeetInches(profile.heightCm);
                  setFeetStr(String(feet));
                  setInchesStr(String(inches));
                }}>
                  <Text style={styles.switchUnit}>Switch to ft/in</Text>
                </TouchableOpacity>
              </View>
            )}
            <NumberInput
              label="Weight"
              value={weightStr}
              onChangeText={handleWeightChange}
              unitOptions={['lbs', 'kg']}
              selectedUnit={profile.weightUnit}
              onUnitChange={(u) => {
                const unit = u as WeightUnit;
                updateProfile({ weightUnit: unit });
                setWeightStr(
                  unit === 'lbs'
                    ? String(Math.round(kgToLbs(profile.weightKg)))
                    : String(Math.round(profile.weightKg))
                );
                setGoalWeightStr(
                  unit === 'lbs'
                    ? String(Math.round(kgToLbs(profile.goalWeightKg)))
                    : String(Math.round(profile.goalWeightKg))
                );
              }}
            />
          </View>
        );
      case 2:
        return (
          <View>
            <Text style={styles.stepTitle}>Activity & Workout</Text>
            <ActivityPicker
              activityLevel={profile.activityLevel}
              workoutType={profile.workoutType}
              onActivityChange={(level) => updateProfile({ activityLevel: level })}
              onWorkoutChange={(type) => updateProfile({ workoutType: type })}
            />
          </View>
        );
      case 3:
        return (
          <View>
            <Text style={styles.stepTitle}>Set Your Goal</Text>
            <GoalSelector
              goalWeight={goalWeightStr}
              onGoalWeightChange={handleGoalWeightChange}
              timeframeWeeks={profile.goalTimeframeWeeks}
              onTimeframeChange={(w) => updateProfile({ goalTimeframeWeeks: w })}
              currentWeightKg={profile.weightKg}
              weightUnit={profile.weightUnit}
              onWeightUnitChange={(u) => {
                const unit = u as WeightUnit;
                updateProfile({ weightUnit: unit });
                setGoalWeightStr(
                  unit === 'lbs'
                    ? String(Math.round(kgToLbs(profile.goalWeightKg)))
                    : String(Math.round(profile.goalWeightKg))
                );
              }}
            />
          </View>
        );
      case 4:
        return (
          <View>
            <Text style={styles.stepTitle}>Your Daily Targets</Text>
            {macroTargets && <MacroDashboard targets={macroTargets} />}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.stepIndicator}>
        {steps.map((s, i) => (
          <View key={s} style={styles.stepDotRow}>
            <View style={[styles.stepDot, i <= step && styles.stepDotActive]} />
            {i < steps.length - 1 && (
              <View style={[styles.stepLine, i < step && styles.stepLineActive]} />
            )}
          </View>
        ))}
      </View>
      <Text style={styles.stepLabel}>
        Step {step + 1} of {steps.length}: {steps[step]}
      </Text>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStep()}
      </ScrollView>

      <View style={styles.buttons}>
        {step > 0 && (
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep(step - 1)}>
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.nextBtnWrapper}
          onPress={() => {
            if (step < steps.length - 1) {
              setStep(step + 1);
            } else {
              onSave(profile);
            }
          }}
        >
          <LinearGradient
            colors={[colors.accent, colors.accentGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextBtn}
          >
            <Text style={styles.nextBtnText}>
              {step === steps.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  stepDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.bgCard,
  },
  stepDotActive: {
    backgroundColor: colors.accent,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.bgCard,
  },
  stepLineActive: {
    backgroundColor: colors.accent,
  },
  stepLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenPadding,
  },
  stepTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    ...typography.bodyBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 18,
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: spacing.cardRadius,
    marginHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleBtnActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  toggleText: {
    ...typography.bodyBold,
    color: colors.textSecondary,
    fontSize: 18,
  },
  toggleTextActive: {
    color: colors.textPrimary,
  },
  heightRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  heightField: {
    flex: 1,
  },
  switchUnit: {
    ...typography.caption,
    color: colors.accent,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  buttons: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  backBtn: {
    paddingVertical: 16,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.buttonRadius,
    backgroundColor: colors.bgCard,
  },
  backBtnText: {
    ...typography.bodyBold,
    color: colors.textSecondary,
  },
  nextBtnWrapper: {
    flex: 1,
  },
  nextBtn: {
    paddingVertical: 16,
    borderRadius: spacing.buttonRadius,
    alignItems: 'center',
  },
  nextBtnText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
});
