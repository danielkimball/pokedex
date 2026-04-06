/**
 * Write Pokemon data back into save file blocks.
 */

import { STORED_SIZE, PARTY_SIZE } from '../parser/pokemon-parser';
import { BOX_COUNT, SLOTS_PER_BOX } from '../parser/pc-reader';
import type { GameVersion } from '../parser/save-detector';

interface WriteConfig {
  partyCountOffset: number;
  partyDataOffset: number;
  pcBoxSize: number;
}

const WRITE_CONFIGS: Record<GameVersion, WriteConfig> = {
  DP: { partyCountOffset: 0x9C, partyDataOffset: 0xA0, pcBoxSize: SLOTS_PER_BOX * STORED_SIZE },
  Pt: { partyCountOffset: 0xA0, partyDataOffset: 0xA4, pcBoxSize: SLOTS_PER_BOX * STORED_SIZE },
  HGSS: { partyCountOffset: 0x9C, partyDataOffset: 0xA0, pcBoxSize: 0x1000 },
};

/**
 * Write a party Pokemon into the general block.
 * @param generalBlock - Mutable general block data
 * @param version - Game version
 * @param slotIndex - Party slot (0-5)
 * @param pokemonData - 236-byte serialized party Pokemon
 */
export function writePartySlot(
  generalBlock: Uint8Array,
  version: GameVersion,
  slotIndex: number,
  pokemonData: Uint8Array,
): void {
  if (slotIndex < 0 || slotIndex >= 6) throw new Error(`Invalid party slot: ${slotIndex}`);
  if (pokemonData.length !== PARTY_SIZE) throw new Error(`Expected ${PARTY_SIZE} bytes, got ${pokemonData.length}`);

  const config = WRITE_CONFIGS[version];
  const offset = config.partyDataOffset + slotIndex * PARTY_SIZE;
  generalBlock.set(pokemonData, offset);
}

/**
 * Write the party count into the general block.
 */
export function writePartyCount(
  generalBlock: Uint8Array,
  version: GameVersion,
  count: number,
): void {
  const config = WRITE_CONFIGS[version];
  // Party count is stored as a 32-bit value
  generalBlock[config.partyCountOffset] = count & 0xFF;
  generalBlock[config.partyCountOffset + 1] = 0;
  generalBlock[config.partyCountOffset + 2] = 0;
  generalBlock[config.partyCountOffset + 3] = 0;
}

/**
 * Write a stored Pokemon into a PC box in the storage block.
 * @param storageBlock - Mutable storage block data
 * @param version - Game version
 * @param boxIndex - Box index (0-17)
 * @param slotIndex - Slot within box (0-29)
 * @param pokemonData - 136-byte serialized stored Pokemon
 */
export function writeBoxSlot(
  storageBlock: Uint8Array,
  version: GameVersion,
  boxIndex: number,
  slotIndex: number,
  pokemonData: Uint8Array,
): void {
  if (boxIndex < 0 || boxIndex >= BOX_COUNT) throw new Error(`Invalid box: ${boxIndex}`);
  if (slotIndex < 0 || slotIndex >= SLOTS_PER_BOX) throw new Error(`Invalid slot: ${slotIndex}`);
  if (pokemonData.length !== STORED_SIZE) throw new Error(`Expected ${STORED_SIZE} bytes, got ${pokemonData.length}`);

  const config = WRITE_CONFIGS[version];
  const boxOffset = boxIndex * config.pcBoxSize;
  const offset = boxOffset + slotIndex * STORED_SIZE;
  storageBlock.set(pokemonData, offset);
}

/**
 * Clear a box slot (fill with zeros).
 */
export function clearBoxSlot(
  storageBlock: Uint8Array,
  version: GameVersion,
  boxIndex: number,
  slotIndex: number,
): void {
  const emptyData = new Uint8Array(STORED_SIZE);
  writeBoxSlot(storageBlock, version, boxIndex, slotIndex, emptyData);
}

/**
 * Clear a party slot (fill with zeros).
 */
export function clearPartySlot(
  generalBlock: Uint8Array,
  version: GameVersion,
  slotIndex: number,
): void {
  const emptyData = new Uint8Array(PARTY_SIZE);
  writePartySlot(generalBlock, version, slotIndex, emptyData);
}
