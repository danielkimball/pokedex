/**
 * Read and validate save file blocks.
 *
 * Gen 4 save files have two copies of each block (primary + backup).
 * Each copy has a save counter; the higher counter is the active one.
 * Each block has a footer with CRC-16 for integrity verification.
 */

import { crc16 } from '../crypto/crc16';
import type { GameVersion } from './save-detector';

export interface BlockInfo {
  /** Offset of the active block within the save file */
  offset: number;
  /** Size of the block data (excluding footer) */
  dataSize: number;
  /** Save counter value */
  saveCounter: number;
  /** Whether this is the primary (vs backup) copy */
  isPrimary: boolean;
  /** Whether CRC validated */
  valid: boolean;
}

/** Footer size in Gen 4 save blocks (16 bytes) */
const FOOTER_SIZE = 0x10;

/** Backup block offset */
const BACKUP_OFFSET = 0x40000;

interface BlockConfig {
  generalOffset: number;
  generalSize: number;
  storageOffset: number;
  storageSize: number;
}

const BLOCK_CONFIGS: Record<GameVersion, BlockConfig> = {
  DP: {
    generalOffset: 0x0,
    generalSize: 0xC100,
    storageOffset: 0xC100,
    storageSize: 0x121E4,
  },
  Pt: {
    generalOffset: 0x0,
    generalSize: 0xCF2C,
    storageOffset: 0xCF2C,
    storageSize: 0x121E4,
  },
  HGSS: {
    generalOffset: 0x0,
    generalSize: 0xF628,
    storageOffset: 0xF700,
    storageSize: 0x12310,
  },
};

/**
 * Read the active general block from a save file.
 */
export function readGeneralBlock(data: Uint8Array, version: GameVersion): { data: Uint8Array; info: BlockInfo } {
  const config = BLOCK_CONFIGS[version];
  return readActiveBlock(data, config.generalOffset, config.generalSize);
}

/**
 * Read the active storage block from a save file.
 */
export function readStorageBlock(data: Uint8Array, version: GameVersion): { data: Uint8Array; info: BlockInfo } {
  const config = BLOCK_CONFIGS[version];
  return readActiveBlock(data, config.storageOffset, config.storageSize);
}

/**
 * Read the active copy of a block (comparing primary vs backup save counters).
 */
function readActiveBlock(
  data: Uint8Array,
  primaryOffset: number,
  blockSize: number
): { data: Uint8Array; info: BlockInfo } {
  const primaryInfo = readBlockInfo(data, primaryOffset, blockSize);
  const backupInfo = readBlockInfo(data, primaryOffset + BACKUP_OFFSET, blockSize);

  // Use the copy with the higher save counter (or primary if equal)
  let activeOffset: number;
  let activeInfo: BlockInfo;

  if (!primaryInfo.valid && backupInfo.valid) {
    activeOffset = primaryOffset + BACKUP_OFFSET;
    activeInfo = backupInfo;
  } else if (primaryInfo.valid && !backupInfo.valid) {
    activeOffset = primaryOffset;
    activeInfo = primaryInfo;
  } else if (backupInfo.saveCounter > primaryInfo.saveCounter) {
    activeOffset = primaryOffset + BACKUP_OFFSET;
    activeInfo = backupInfo;
  } else {
    activeOffset = primaryOffset;
    activeInfo = primaryInfo;
  }

  const dataSize = blockSize - FOOTER_SIZE;
  const blockData = data.slice(activeOffset, activeOffset + dataSize);

  return {
    data: blockData,
    info: { ...activeInfo, offset: activeOffset },
  };
}

/**
 * Read block metadata from the footer.
 */
function readBlockInfo(data: Uint8Array, offset: number, blockSize: number): BlockInfo {
  const dataSize = blockSize - FOOTER_SIZE;
  const footerOffset = offset + dataSize;

  // Read save counter (first 4 bytes of footer)
  const saveCounter = readU32LE(data, footerOffset);

  // Read stored CRC (at footer + 0x0E, last 2 bytes of the 0x10-byte footer)
  const storedCrc = readU16LE(data, footerOffset + 0x0E);

  // Compute CRC over data portion
  const computedCrc = crc16(data, offset, dataSize);

  return {
    offset,
    dataSize,
    saveCounter,
    isPrimary: offset < BACKUP_OFFSET,
    valid: computedCrc === storedCrc,
  };
}

function readU16LE(data: Uint8Array, offset: number): number {
  return data[offset] | (data[offset + 1] << 8);
}

function readU32LE(data: Uint8Array, offset: number): number {
  return (data[offset] | (data[offset + 1] << 8) | (data[offset + 2] << 16) | (data[offset + 3] << 24)) >>> 0;
}

/**
 * Get block configuration for a game version.
 */
export function getBlockConfig(version: GameVersion): BlockConfig {
  return BLOCK_CONFIGS[version];
}
