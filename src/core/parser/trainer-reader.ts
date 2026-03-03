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
  badges: number;      // badge bitfield
  playTimeHours: number;
  playTimeMinutes: number;
  playTimeSeconds: number;
  gameVersion: GameVersion;
}

interface TrainerOffsets {
  name: number;
  tid: number;
  gender: number;
  badges: number;
  playTime: number;
}

const TRAINER_OFFSETS: Record<GameVersion, TrainerOffsets> = {
  DP: {
    name: 0x64,
    tid: 0x74,
    gender: 0x80,
    badges: 0x82,
    playTime: 0x86,
  },
  Pt: {
    name: 0x68,
    tid: 0x78,
    gender: 0x80,
    badges: 0x82,
    playTime: 0x86,
  },
  HGSS: {
    name: 0x64,
    tid: 0x74,
    gender: 0x80,
    badges: 0x82,
    playTime: 0x86,
  },
};

/**
 * Parse trainer info from the general block.
 */
export function parseTrainerInfo(generalBlock: Uint8Array, version: GameVersion): TrainerInfo {
  const offsets = TRAINER_OFFSETS[version];
  const view = toDataView(generalBlock);

  const name = decodeOTName(generalBlock, offsets.name);
  const fullId = readU32(view, offsets.tid);
  const trainerId = fullId & 0xFFFF;
  const secretId = (fullId >>> 16) & 0xFFFF;

  // Gender byte
  const gender = generalBlock[offsets.gender] & 1;

  // Badges
  const badges = readU16(view, offsets.badges);

  // Play time
  const playTimeHours = readU16(view, offsets.playTime);
  const playTimeMinutes = generalBlock[offsets.playTime + 2];
  const playTimeSeconds = generalBlock[offsets.playTime + 3];

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
