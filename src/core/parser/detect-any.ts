/**
 * Cross-generation save format detection and dispatch.
 *
 * Routes a raw .sav buffer to the correct parser. Gen 4 keeps its existing
 * dedicated pipeline (this module only reports gen=4 so the caller can use it);
 * Gen 1/2/3 are parsed here into the generation-agnostic `UniversalSave`.
 */

import { detectGameVersion } from './save-detector';
import { isGen1Save, parseGen1 } from './gen1-parser';
import { detectGen2Family, parseGen2 } from './gen2-parser';
import { isGen3Save, parseGen3 } from './gen3-parser';
import { inferGameFromFilename, type Game } from '../constants/games';
import type { UniversalSave } from './universal';

export type DetectedGen = 1 | 2 | 3 | 4 | null;

/** Identify which generation a save buffer belongs to. */
export function detectGeneration(data: Uint8Array): DetectedGen {
  if (data.length >= 0x80000 && detectGameVersion(data)) return 4;
  if (data.length >= 0x20000 && isGen3Save(data)) return 3;
  if (data.length >= 0x8000) {
    if (detectGen2Family(data) !== null) return 2;
    if (isGen1Save(data)) return 1;
  }
  return null;
}

/**
 * Parse a Gen 1/2/3 save into a UniversalSave. Returns null when the buffer is
 * a Gen 4 save (handled by the dedicated pipeline) or an unrecognized format.
 */
export function parseLegacySave(buffer: ArrayBuffer, filename: string): UniversalSave | null {
  const data = new Uint8Array(buffer);
  const gen = detectGeneration(data);
  const hint = inferGameFromFilename(filename);

  if (gen === 3) return parseGen3(buffer, hint);

  if (gen === 2) {
    const family = detectGen2Family(data);
    let game: Game;
    if (family === 'C') game = 'Crystal';
    else game = hint === 'Gold' || hint === 'Silver' ? hint : 'Gold';
    return parseGen2(buffer, game);
  }

  if (gen === 1) {
    const game: Game = hint === 'Red' || hint === 'Blue' || hint === 'Yellow' ? hint : 'Red';
    return parseGen1(buffer, game);
  }

  return null;
}
