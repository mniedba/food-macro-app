import { Sex } from '../types';

// Mifflin-St Jeor equation in imperial units
// Male:   BMR = (4.536 × weightLbs) + (12.7 × heightIn) - (5 × age) + 5
// Female: BMR = (4.536 × weightLbs) + (12.7 × heightIn) - (5 × age) - 161
export function calculateBMR(sex: Sex, weightLbs: number, heightIn: number, age: number): number {
  const base = 4.536 * weightLbs + 12.7 * heightIn - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}
