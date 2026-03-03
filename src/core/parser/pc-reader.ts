/**
 * Read PC box Pokemon from the storage block.
 *
 * PC storage layout:
 * - 18 boxes × 30 slots per box
 * - Each slot is 136 bytes (stored Pokemon, no battle stats)
 * - DP/Pt: 30 × 136 = 4080 bytes per box (0xFF0)
 * - HGSS: 4096 bytes per box (0x1000) — 16 bytes padding per box
 */

import { parsePokemon, STORED_SIZE, type Pokemon } from './pokemon-parser';
import type { GameVersion } from './save-detector';

export const BOX_COUNT = 18;
export const SLOTS_PER_BOX = 30;

interface PCOffsets {
  startOffset: number;
  boxSize: number;
}

const PC_OFFSETS: Record<GameVersion, PCOffsets> = {
  DP: { startOffset: 0x0, boxSize: SLOTS_PER_BOX * STORED_SIZE }, // 4080
  Pt: { startOffset: 0x0, boxSize: SLOTS_PER_BOX * STORED_SIZE },
  HGSS: { startOffset: 0x0, boxSize: 0x1000 }, // 4096 (16 bytes padding)
};

export interface BoxData {
  boxIndex: number;
  pokemon: (Pokemon | null)[];
}

/**
 * Read all PC boxes from the storage block.
 */
export function readPC(storageBlock: Uint8Array, version: GameVersion): BoxData[] {
  const config = PC_OFFSETS[version];
  const boxes: BoxData[] = [];

  for (let box = 0; box < BOX_COUNT; box++) {
    const boxOffset = config.startOffset + box * config.boxSize;
    const pokemon: (Pokemon | null)[] = [];

    for (let slot = 0; slot < SLOTS_PER_BOX; slot++) {
      const slotOffset = boxOffset + slot * STORED_SIZE;

      if (slotOffset + STORED_SIZE > storageBlock.length) {
        pokemon.push(null);
        continue;
      }

      const raw = storageBlock.slice(slotOffset, slotOffset + STORED_SIZE);
      try {
        const parsed = parsePokemon(raw);
        pokemon.push(parsed);
      } catch {
        pokemon.push(null);
      }
    }

    boxes.push({ boxIndex: box, pokemon });
  }

  return boxes;
}

/**
 * Read a single box from the storage block.
 */
export function readBox(storageBlock: Uint8Array, version: GameVersion, boxIndex: number): BoxData {
  if (boxIndex < 0 || boxIndex >= BOX_COUNT) {
    throw new Error(`Invalid box index: ${boxIndex}`);
  }

  const config = PC_OFFSETS[version];
  const boxOffset = config.startOffset + boxIndex * config.boxSize;
  const pokemon: (Pokemon | null)[] = [];

  for (let slot = 0; slot < SLOTS_PER_BOX; slot++) {
    const slotOffset = boxOffset + slot * STORED_SIZE;

    if (slotOffset + STORED_SIZE > storageBlock.length) {
      pokemon.push(null);
      continue;
    }

    const raw = storageBlock.slice(slotOffset, slotOffset + STORED_SIZE);
    try {
      const parsed = parsePokemon(raw);
      pokemon.push(parsed);
    } catch {
      pokemon.push(null);
    }
  }

  return { boxIndex, pokemon };
}
