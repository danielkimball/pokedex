/**
 * Detect which Gen 4 game variant a .sav file belongs to.
 *
 * Detection strategy: Check CRC-16 at known footer offsets for each game.
 * Each game has a different general block size, so the footer (which contains
 * the CRC) is at a different offset.
 *
 * Footer layout (0x10 bytes at end of each block):
 *   +0x00: u32 save counter
 *   +0x04: u32 block size
 *   +0x08: u32 unknown
 *   +0x0C: u16 unknown
 *   +0x0E: u16 CRC-16 (computed over all bytes before the footer)
 */

import { crc16 } from '../crypto/crc16';

export type GameVersion = 'DP' | 'Pt' | 'HGSS';

/** Specific game within a version family */
export type SpecificGame = 'Diamond' | 'Pearl' | 'Platinum' | 'HeartGold' | 'SoulSilver';

/**
 * Origin game IDs stored in Pokemon data (Block C, offset 0x18).
 * Used to determine which specific game a Pokemon was caught in.
 */
const ORIGIN_GAME_MAP: Record<number, SpecificGame> = {
  7: 'HeartGold',
  8: 'SoulSilver',
  10: 'Diamond',
  11: 'Pearl',
  12: 'Platinum',
};

/**
 * Determine the specific game (e.g., HeartGold vs SoulSilver) by examining
 * the origin game field of Pokemon in the save.
 *
 * Strategy: look at Pokemon whose OT ID matches the trainer — those were
 * caught in this save's game. Fall back to most common origin game.
 */
export function detectSpecificGame(
  version: GameVersion,
  trainerId: number,
  secretId: number,
  pokemonOriginGames: { originGame: number; otId: number; otSid: number }[],
): SpecificGame {
  // Expected origin game IDs for each version family
  const familyIds: Record<GameVersion, number[]> = {
    DP: [10, 11],      // Diamond, Pearl
    Pt: [12],           // Platinum
    HGSS: [7, 8],      // HeartGold, SoulSilver
  };

  const validIds = familyIds[version];

  // First: check Pokemon that belong to this trainer (caught in this game)
  const ownPokemon = pokemonOriginGames.filter(
    p => (p.otId & 0xFFFF) === trainerId && ((p.otId >>> 16) & 0xFFFF) === secretId
  );

  for (const p of ownPokemon) {
    if (validIds.includes(p.originGame) && ORIGIN_GAME_MAP[p.originGame]) {
      return ORIGIN_GAME_MAP[p.originGame];
    }
  }

  // Fallback: count origin games from all Pokemon in the valid set
  const counts = new Map<number, number>();
  for (const p of pokemonOriginGames) {
    if (validIds.includes(p.originGame)) {
      counts.set(p.originGame, (counts.get(p.originGame) ?? 0) + 1);
    }
  }

  let bestId = validIds[0];
  let bestCount = 0;
  for (const [id, count] of counts) {
    if (count > bestCount) {
      bestId = id;
      bestCount = count;
    }
  }

  return ORIGIN_GAME_MAP[bestId] ?? (version === 'DP' ? 'Diamond' : version === 'Pt' ? 'Platinum' : 'HeartGold');
}

interface DetectionConfig {
  version: GameVersion;
  generalBlockSize: number;
  storageBlockSize: number;
  generalOffset: number;
  storageOffset: number;
}

const DETECTION_CONFIGS: DetectionConfig[] = [
  {
    version: 'DP',
    generalBlockSize: 0xC100,
    storageBlockSize: 0x121E4,
    generalOffset: 0x0,
    storageOffset: 0xC100,
  },
  {
    version: 'Pt',
    generalBlockSize: 0xCF2C,
    storageBlockSize: 0x121E4,
    generalOffset: 0x0,
    storageOffset: 0xCF2C,
  },
  {
    version: 'HGSS',
    generalBlockSize: 0xF628,
    storageBlockSize: 0x12310,
    generalOffset: 0x0,
    storageOffset: 0xF700,
  },
];

const EXPECTED_SAVE_SIZE = 0x80000; // 512 KB

/** Footer is the last 0x10 (16) bytes of each block */
export const FOOTER_SIZE = 0x10;

/** CRC-16 is at offset 0x0E within the footer (last 2 bytes) */
const CRC_OFFSET_IN_FOOTER = 0x0E;

/**
 * Detect the game version from a save file.
 * @param data - Complete save file as Uint8Array
 * @returns Detected game version, or null if unrecognized
 */
export function detectGameVersion(data: Uint8Array): GameVersion | null {
  if (data.length < EXPECTED_SAVE_SIZE) {
    return null;
  }

  // Try primary blocks first
  for (const config of DETECTION_CONFIGS) {
    if (validateBlock(data, config.generalOffset, config.generalBlockSize)) {
      return config.version;
    }
  }

  // Try backup blocks (at +0x40000)
  for (const config of DETECTION_CONFIGS) {
    if (validateBlock(data, config.generalOffset + 0x40000, config.generalBlockSize)) {
      return config.version;
    }
  }

  return null;
}

/**
 * Validate a save block by checking its CRC-16 in the footer.
 * CRC is computed over [offset, offset + blockSize - FOOTER_SIZE).
 * Stored CRC is at offset + blockSize - FOOTER_SIZE + 0x0E.
 */
function validateBlock(data: Uint8Array, offset: number, blockSize: number): boolean {
  if (offset + blockSize > data.length) return false;

  const dataSize = blockSize - FOOTER_SIZE;
  if (dataSize <= 0) return false;

  const computed = crc16(data, offset, dataSize);

  const crcOffset = offset + dataSize + CRC_OFFSET_IN_FOOTER;
  const stored = data[crcOffset] | (data[crcOffset + 1] << 8);

  return computed === stored;
}

/**
 * Get the configuration for a detected game version.
 */
export function getGameConfig(version: GameVersion): DetectionConfig {
  const config = DETECTION_CONFIGS.find(c => c.version === version);
  if (!config) throw new Error(`Unknown game version: ${version}`);
  return config;
}
