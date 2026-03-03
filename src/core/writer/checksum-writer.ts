/**
 * Recalculate and write CRC-16 checksums in save file block footers.
 * Also handles save counter increment and backup mirroring.
 */

import { crc16 } from '../crypto/crc16';
import type { GameVersion } from '../parser/save-detector';
import { getBlockConfig } from '../parser/block-reader';

const FOOTER_SIZE = 0x10;
const BACKUP_OFFSET = 0x40000;

/**
 * Update the CRC in a block's footer.
 * @param saveData - Full mutable save file
 * @param blockOffset - Start of the block
 * @param blockSize - Total block size including footer
 */
export function updateBlockCRC(saveData: Uint8Array, blockOffset: number, blockSize: number): void {
  const dataSize = blockSize - FOOTER_SIZE;
  const computed = crc16(saveData, blockOffset, dataSize);

  // Write CRC at footer + 0x0E (last 2 bytes of the 0x10-byte footer)
  const crcOffset = blockOffset + dataSize + 0x0E;
  saveData[crcOffset] = computed & 0xFF;
  saveData[crcOffset + 1] = (computed >>> 8) & 0xFF;
}

/**
 * Increment the save counter in a block's footer.
 */
export function incrementSaveCounter(saveData: Uint8Array, blockOffset: number, blockSize: number): number {
  const dataSize = blockSize - FOOTER_SIZE;
  const counterOffset = blockOffset + dataSize;

  // Read current counter (32-bit LE)
  const current = (
    saveData[counterOffset] |
    (saveData[counterOffset + 1] << 8) |
    (saveData[counterOffset + 2] << 16) |
    (saveData[counterOffset + 3] << 24)
  ) >>> 0;

  const next = (current + 1) >>> 0;

  // Write new counter
  saveData[counterOffset] = next & 0xFF;
  saveData[counterOffset + 1] = (next >>> 8) & 0xFF;
  saveData[counterOffset + 2] = (next >>> 16) & 0xFF;
  saveData[counterOffset + 3] = (next >>> 24) & 0xFF;

  return next;
}

/**
 * Mirror a block to its backup location (or primary if currently at backup).
 */
export function mirrorBlock(saveData: Uint8Array, blockOffset: number, blockSize: number): void {
  const isBackup = blockOffset >= BACKUP_OFFSET;
  const mirrorOffset = isBackup
    ? blockOffset - BACKUP_OFFSET
    : blockOffset + BACKUP_OFFSET;

  // Copy the entire block including footer
  const blockData = saveData.slice(blockOffset, blockOffset + blockSize);
  saveData.set(blockData, mirrorOffset);
}

/**
 * Finalize a save file: update CRCs for both blocks, increment counters, mirror.
 */
export function finalizeSave(saveData: Uint8Array, version: GameVersion): void {
  const config = getBlockConfig(version);

  // Update general block
  const generalSize = config.generalSize;
  updateBlockCRC(saveData, config.generalOffset, generalSize);
  incrementSaveCounter(saveData, config.generalOffset, generalSize);
  mirrorBlock(saveData, config.generalOffset, generalSize);

  // Update storage block
  const storageSize = config.storageSize;
  updateBlockCRC(saveData, config.storageOffset, storageSize);
  incrementSaveCounter(saveData, config.storageOffset, storageSize);
  mirrorBlock(saveData, config.storageOffset, storageSize);
}
