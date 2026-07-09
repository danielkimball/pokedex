/**
 * Day Care slots (Gen 4).
 *
 * PKHeX SAV4: DaycareSlotSize = SIZE_4PARTY (236), 2 slots, stored PKM is
 * SIZE_4STORED (136) at the start of each slot.
 * HGSS DaycareOffset = 0x15FC within the general block.
 */

import { parsePokemon, STORED_SIZE, PARTY_SIZE, type Pokemon } from './pokemon-parser';
import type { GameVersion } from './save-detector';

const DAYCARE_OFFSET: Record<GameVersion, number> = {
  // DP/Pt daycare offsets (PKHeX); HGSS confirmed 0x15FC
  DP: 0x1408,
  Pt: 0x1654,
  HGSS: 0x15FC,
};

const DAYCARE_SLOTS = 2;

export interface DaycareData {
  pokemon: (Pokemon | null)[];
}

/**
 * Parse the two Day Care slots from the general block.
 * Empty slots return null (species 0 / decrypt failure).
 */
export function readDaycare(generalBlock: Uint8Array, version: GameVersion): DaycareData {
  const base = DAYCARE_OFFSET[version];
  const pokemon: (Pokemon | null)[] = [];

  for (let i = 0; i < DAYCARE_SLOTS; i++) {
    const off = base + i * PARTY_SIZE;
    if (off + STORED_SIZE > generalBlock.length) {
      pokemon.push(null);
      continue;
    }
    const raw = generalBlock.slice(off, off + STORED_SIZE);
    try {
      const parsed = parsePokemon(raw);
      if (parsed == null || parsed.species === 0) {
        pokemon.push(null);
      } else {
        pokemon.push(parsed);
      }
    } catch {
      pokemon.push(null);
    }
  }

  return { pokemon };
}
