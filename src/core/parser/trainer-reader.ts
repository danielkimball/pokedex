/**
 * Parse trainer data from the general block.
 */

import { readU16, readU32, toDataView } from '../../utils/binary';
import { decodeOTName } from '../text/decoder';
import type { GameVersion } from './save-detector';

export interface TrainerInfo {
  name: string;
  trainerId: number;   // visible TID (lower 16 bits)
  secretId: number;    // SID (upper 16 bits)
  fullId: number;      // full 32-bit ID
  gender: number;      // 0 = male, 1 = female
  /**
   * Badge bitfield.
   * DP/Pt: 8 Sinnoh badges in low byte.
   * HGSS: bits 0-7 Johto, bits 8-15 Kanto (matches PKHeX Badges + Badges16).
   */
  badges: number;
  playTimeHours: number;
  playTimeMinutes: number;
  playTimeSeconds: number;
  gameVersion: GameVersion;
}

/**
 * Trainer1 base offsets (absolute within general block).
 * Field layout from PKHeX SAV4:
 *   +0x00 name, +0x10 ID32, +0x14 money, +0x18 gender, +0x19 language,
 *   +0x1A badges (8), +0x1F Badges16 (HGSS Kanto), +0x22 play time hours…
 */
interface TrainerOffsets {
  /** Trainer1 base */
  base: number;
}

const TRAINER_OFFSETS: Record<GameVersion, TrainerOffsets> = {
  DP: { base: 0x64 },
  Pt: { base: 0x68 },
  HGSS: { base: 0x64 },
};

/**
 * Parse trainer info from the general block.
 */
export function parseTrainerInfo(generalBlock: Uint8Array, version: GameVersion): TrainerInfo {
  const { base } = TRAINER_OFFSETS[version];
  const view = toDataView(generalBlock);

  const name = decodeOTName(generalBlock, base);
  const fullId = readU32(view, base + 0x10);
  const trainerId = fullId & 0xFFFF;
  const secretId = (fullId >>> 16) & 0xFFFF;

  const gender = generalBlock[base + 0x18] & 1;

  // Johto/Sinnoh badges: single byte at +0x1A
  const badges8 = generalBlock[base + 0x1A] ?? 0;
  // HGSS Kanto badges: single byte at +0x1F (PKHeX Badges16)
  const kanto8 = version === 'HGSS' ? (generalBlock[base + 0x1F] ?? 0) : 0;
  const badges = badges8 | (kanto8 << 8);

  const playTimeHours = readU16(view, base + 0x22);
  const playTimeMinutes = generalBlock[base + 0x24] ?? 0;
  const playTimeSeconds = generalBlock[base + 0x25] ?? 0;

  return {
    name,
    trainerId,
    secretId,
    fullId,
    gender,
    badges,
    playTimeHours,
    playTimeMinutes,
    playTimeSeconds,
    gameVersion: version,
  };
}

/**
 * Re-read HGSS/DP/Pt badges from a raw Gen 4 save buffer (uses active general block).
 * Safe fallback when SaveRecord.badges was never stored.
 */
export function readGen4BadgesFromSave(raw: ArrayBuffer | Uint8Array, version: GameVersion): number {
  const data = raw instanceof Uint8Array ? raw : new Uint8Array(raw);
  // Prefer primary general; if footer looks empty fall back to backup partition.
  const gSize = version === 'HGSS' ? 0xF628 : version === 'Pt' ? 0xCF2C : 0xC100;
  const dataSize = gSize - 0x10;
  let general = data.slice(0, dataSize);
  // If name/TID region is blank, try backup
  if (general[TRAINER_OFFSETS[version].base] === 0xFF || general[TRAINER_OFFSETS[version].base] === 0) {
    const backup = data.slice(0x40000, 0x40000 + dataSize);
    if (backup.length >= dataSize) general = backup;
  }
  return parseTrainerInfo(general, version).badges;
}
