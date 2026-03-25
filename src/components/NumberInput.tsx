import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface NumberInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  unit?: string;
  unitOptions?: string[];
  selectedUnit?: string;
  onUnitChange?: (unit: string) => void;
  placeholder?: string;
}

export function NumberInput({
  label,
  value,
  onChangeText,
  unit,
  unitOptions,
  selectedUnit,
  onUnitChange,
  placeholder,
}: NumberInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          placeholder={placeholder || '0'}
          placeholderTextColor={colors.textMuted}
        />
        {unitOptions && onUnitChange ? (
          <View style={styles.unitToggle}>
            {unitOptions.map((u) => (
              <TouchableOpacity
                key={u}
                style={[styles.unitButton, selectedUnit === u && styles.unitButtonActive]}
                onPress={() => onUnitChange(u)}
              >
                <Text
                  style={[styles.unitText, selectedUnit === u && styles.unitTextActive]}
                >
                  {u}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : unit ? (
          <Text style={styles.unitLabel}>{unit}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodyBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.buttonRadius,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    color: colors.textPrimary,
    fontSize: typography.body.fontSize,
  },
  unitLabel: {
    ...typography.bodyBold,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  unitToggle: {
    flexDirection: 'row',
    marginLeft: spacing.sm,
  },
  unitButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: spacing.buttonRadius,
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    marginLeft: 4,
  },
  unitButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  unitText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  unitTextActive: {
    color: colors.textPrimary,
  },
});
