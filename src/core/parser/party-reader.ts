/**
 * Read party Pokemon from the general block.
 *
 * Party data layout:
 * - Party count at offset (version-dependent)
 * - 6 party slots of 236 bytes each immediately after
 */

import { parsePokemon, PARTY_SIZE, type Pokemon } from './pokemon-parser';
import type { GameVersion } from './save-detector';

interface PartyOffsets {
  count: number;
  data: number;
}

const PARTY_OFFSETS: Record<GameVersion, PartyOffsets> = {
  DP: { count: 0x9C, data: 0xA0 },
  Pt: { count: 0xA0, data: 0xA4 },
  // PKHeX: Party @ 0x98, count @ Party - 4 = 0x94
  HGSS: { count: 0x94, data: 0x98 },
}

export interface PartyData {
  count: number;
  pokemon: (Pokemon | null)[];
}

/**
 * Parse party Pokemon from the general block.
 * @param generalBlock - The decrypted general block data
 * @param version - Game version
 * @returns Party data with count and up to 6 Pokemon
 */
export function readParty(generalBlock: Uint8Array, version: GameVersion): PartyData {
  const offsets = PARTY_OFFSETS[version];

  // Party count is a 32-bit value but only lower byte matters
  const count = Math.min(generalBlock[offsets.count], 6);

  const pokemon: (Pokemon | null)[] = [];

  for (let i = 0; i < 6; i++) {
    const offset = offsets.data + i * PARTY_SIZE;
    if (offset + PARTY_SIZE > generalBlock.length) {
      pokemon.push(null);
      continue;
    }

    const raw = generalBlock.slice(offset, offset + PARTY_SIZE);
    try {
      const parsed = parsePokemon(raw);
      pokemon.push(parsed);
    } catch {
      pokemon.push(null);
    }
  }

  return { count, pokemon };
}
