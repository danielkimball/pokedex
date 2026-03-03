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
