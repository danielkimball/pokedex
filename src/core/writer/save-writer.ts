/**
 * Top-level save file writer.
 * Takes a parsed save + modifications and produces a valid .sav ArrayBuffer.
 */

import { cloneBuffer } from '../../utils/binary';
import type { GameVersion } from '../parser/save-detector';
import { getBlockConfig } from '../parser/block-reader';
import { serializePokemonStored, serializePokemonParty } from './pokemon-writer';
import { writePartySlot, writePartyCount, writeBoxSlot, clearBoxSlot } from './block-writer';
import { finalizeSave } from './checksum-writer';
import type { Pokemon } from '../parser/pokemon-parser';

export interface SaveModification {
  type: 'set_party' | 'set_box' | 'clear_box';
  pokemon?: Pokemon;
  /** Party slot (0-5) or box index (0-17) */
  containerIndex: number;
  /** Slot within container */
  slotIndex: number;
}

/**
 * Apply modifications to a save file and return a new valid .sav buffer.
 * @param originalBuffer - Original save file
 * @param version - Detected game version
 * @param modifications - List of changes to apply
 * @returns New ArrayBuffer with modifications applied and checksums updated
 */
export function writeSaveFile(
  originalBuffer: ArrayBuffer,
  version: GameVersion,
  modifications: SaveModification[],
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
  let partyCount = -1; // will be computed if party is modified

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
    }
  }

  // If party was modified, update party count
  const partyMods = modifications.filter(m => m.type === 'set_party');
  if (partyMods.length > 0) {
    // Count non-empty party slots
    // For simplicity, count the modifications that set party pokemon
    const maxSlot = Math.max(...partyMods.map(m => m.slotIndex));
    writePartyCount(generalBlock, version, maxSlot + 1);
  }

  // Recalculate checksums, increment save counter, mirror to backup
  finalizeSave(saveData, version);

  return buffer;
}
