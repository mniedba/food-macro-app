import { WeightUnit, HeightUnit } from '../types';

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

export function feetInchesToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * 2.54;
}

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm * 0.393701;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

export function formatNumber(n: number, decimals: number = 0): string {
  return n.toFixed(decimals);
}

export function formatWeight(kg: number, unit: WeightUnit): string {
  if (unit === 'lbs') {
    return `${Math.round(kgToLbs(kg))} lbs`;
  }
  return `${Math.round(kg)} kg`;
}

export function formatHeight(cm: number, unit: HeightUnit): string {
  if (unit === 'in') {
    const { feet, inches } = cmToFeetInches(cm);
    return `${feet}'${inches}\"`;
  }
  return `${Math.round(cm)} cm`;
}
