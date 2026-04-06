/**
 * Top-level save file writer.
 * Takes a parsed save + modifications and produces a valid .sav ArrayBuffer.
 */

import { cloneBuffer } from '../../utils/binary';
import type { GameVersion } from '../parser/save-detector';
import { getBlockConfig } from '../parser/block-reader';
import { serializePokemonStored, serializePokemonParty } from './pokemon-writer';
import { writePartySlot, writePartyCount, writeBoxSlot, clearBoxSlot, clearPartySlot } from './block-writer';
import { finalizeSave } from './checksum-writer';
import type { Pokemon } from '../parser/pokemon-parser';

export interface SaveModification {
  type: 'set_party' | 'set_box' | 'clear_box' | 'clear_party';
  pokemon?: Pokemon;
  /** Party slot (0-5) or box index (0-17) */
  containerIndex: number;
  /** Slot within container */
  slotIndex: number;
}

export interface WriteSaveOptions {
  /** When clearing party slots, set this to the new party count (0-6). */
  partyCount?: number;
}

/**
 * Apply modifications to a save file and return a new valid .sav buffer.
 * @param originalBuffer - Original save file
 * @param version - Detected game version
 * @param modifications - List of changes to apply
 * @param options - Optional; use partyCount when clear_party is used
 * @returns New ArrayBuffer with modifications applied and checksums updated
 */
export function writeSaveFile(
  originalBuffer: ArrayBuffer,
  version: GameVersion,
  modifications: SaveModification[],
  options?: WriteSaveOptions,
): ArrayBuffer {
  // Clone the buffer so we don't modify the original
  const buffer = cloneBuffer(originalBuffer);
  const saveData = new Uint8Array(buffer);
  const config = getBlockConfig(version);

  // Determine block offsets (use primary blocks)
  const generalStart = config.generalOffset;
  const storageStart = config.storageOffset;

  // Get mutable views of the blocks within the save data
  const generalDataSize = config.generalSize - 0x14; // subtract footer
  const storageDataSize = config.storageSize - 0x14;

  const generalBlock = saveData.subarray(generalStart, generalStart + generalDataSize);
  const storageBlock = saveData.subarray(storageStart, storageStart + storageDataSize);

  // Apply modifications
  for (const mod of modifications) {
    switch (mod.type) {
      case 'set_party': {
        if (!mod.pokemon) throw new Error('Pokemon required for set_party');
        const partyData = serializePokemonParty(mod.pokemon);
        writePartySlot(generalBlock, version, mod.slotIndex, partyData);
        break;
      }
      case 'set_box': {
        if (!mod.pokemon) throw new Error('Pokemon required for set_box');
        const storedData = serializePokemonStored(mod.pokemon);
        writeBoxSlot(storageBlock, version, mod.containerIndex, mod.slotIndex, storedData);
        break;
      }
      case 'clear_box': {
        clearBoxSlot(storageBlock, version, mod.containerIndex, mod.slotIndex);
        break;
      }
      case 'clear_party': {
        clearPartySlot(generalBlock, version, mod.slotIndex);
        break;
      }
    }
  }

  // If party was modified, update party count
  const partyMods = modifications.filter(m => m.type === 'set_party');
  const clearPartyMods = modifications.filter(m => m.type === 'clear_party');
  if (options?.partyCount !== undefined && (partyMods.length > 0 || clearPartyMods.length > 0)) {
    writePartyCount(generalBlock, version, Math.max(0, Math.min(6, options.partyCount)));
  } else if (partyMods.length > 0) {
    const maxSlot = Math.max(...partyMods.map(m => m.slotIndex));
    writePartyCount(generalBlock, version, maxSlot + 1);
  }

  // Recalculate checksums, increment save counter, mirror to backup
  finalizeSave(saveData, version);

  return buffer;
}
