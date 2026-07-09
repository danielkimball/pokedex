/**
 * Live "owned species" set from a save's raw bytes.
 * Includes party, PC, and Day Care so catch status stays correct without a full re-import.
 */

import type { SaveRecord } from '../db/schema';
import { parseSaveFile } from '../core/parser/save-file';
import { detectGeneration, parseLegacySave } from '../core/parser/detect-any';

/** Species currently owned in this save (party + boxes + daycare). */
export function ownedSpeciesFromSave(save: SaveRecord): Set<number> {
  const set = new Set<number>();
  if (!save.rawData) return set;

  try {
    const bytes = new Uint8Array(save.rawData);
    const gen = save.generation ?? detectGeneration(bytes);

    if (gen === 4 || save.gameVersion === 'HGSS' || save.gameVersion === 'DP' || save.gameVersion === 'Pt') {
      const parsed = parseSaveFile(save.rawData);
      for (const sp of parsed.uniqueSpecies) set.add(sp);
      return set;
    }

    if (gen === 1 || gen === 2 || gen === 3) {
      const legacy = parseLegacySave(save.rawData, save.filename);
      if (legacy) {
        for (const m of legacy.mons) set.add(m.species);
      }
    }
  } catch {
    // Fall back to empty — caller merges IndexedDB records.
  }

  return set;
}
