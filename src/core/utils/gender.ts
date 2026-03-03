import { GENDER_RATIOS } from '../constants/gender-ratios';

/**
 * Derive a Pokemon's gender from its species number and PID.
 *
 * Uses the Gen IV gender threshold mechanic:
 *   threshold 255 → genderless
 *   threshold 254 → always female
 *   threshold 0   → always male
 *   otherwise     → (pid & 0xFF) >= threshold ? male : female
 *
 * Species not in GENDER_RATIOS default to threshold 127 (50/50).
 */
export function getGender(
  species: number,
  pid: number,
): 'male' | 'female' | 'genderless' {
  const threshold = GENDER_RATIOS[species] ?? 127;

  if (threshold === 255) return 'genderless';
  if (threshold === 254) return 'female';
  if (threshold === 0) return 'male';

  return (pid & 0xFF) >= threshold ? 'male' : 'female';
}
