import { WeightUnit, HeightUnit } from '../types';

// Conversion helpers — kept for use in form components that accept user input
// in either unit and need to convert for internal storage (lbs/inches).
export function lbsToKg(lbs: number): number {
  return lbs * 0.453592;
}

export function kgToLbs(kg: number): number {
  return kg * 2.20462;
}

export function inchesToCm(inches: number): number {
  return inches * 2.54;
}

export function cmToInches(cm: number): number {
  return cm * 0.393701;
}

export function feetInchesToTotalInches(feet: number, inches: number): number {
  return feet * 12 + inches;
}

export function totalInchesToFeetInches(totalInches: number): { feet: number; inches: number } {
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

export function formatNumber(n: number, decimals: number = 0): string {
  return n.toFixed(decimals);
}

// Internal value is always lbs. Display converts to kg only when requested.
export function formatWeight(lbs: number, unit: WeightUnit): string {
  if (unit === 'lbs') {
    return `${Math.round(lbs)} lbs`;
  }
  return `${Math.round(lbs * 0.453592)} kg`;
}

// Internal value is always total inches. Display converts to cm only when requested.
export function formatHeight(totalInches: number, unit: HeightUnit): string {
  if (unit === 'in') {
    const { feet, inches } = totalInchesToFeetInches(totalInches);
    return `${feet}'${inches}"`;
  }
  return `${Math.round(totalInches * 2.54)} cm`;
}
