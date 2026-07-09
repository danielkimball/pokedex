/**
 * Top-level save file parser.
 * Orchestrates detection, block reading, and data extraction.
 */

import { detectGameVersion, type GameVersion } from './save-detector';
import { readGeneralBlock, readStorageBlock } from './block-reader';
import { parseTrainerInfo, type TrainerInfo } from './trainer-reader';
import { readParty, type PartyData } from './party-reader';
import { readPC, type BoxData } from './pc-reader';
import { readDaycare, type DaycareData } from './daycare-reader';
import type { Pokemon } from './pokemon-parser';

export interface ParsedSave {
  /** Detected game version */
  version: GameVersion;
  /** Trainer information */
  trainer: TrainerInfo;
  /** Party Pokemon (up to 6) */
  party: PartyData;
  /** PC boxes (18 boxes × 30 slots) */
  boxes: BoxData[];
  /** Day Care (up to 2) */
  daycare: DaycareData;
  /** All non-null Pokemon found in the save */
  allPokemon: PokemonLocation[];
  /** Total Pokemon count */
  totalPokemon: number;
  /** Unique species seen */
  uniqueSpecies: Set<number>;
}

export interface PokemonLocation {
  pokemon: Pokemon;
  location: 'party' | 'box' | 'daycare';
  /** Party slot (0-5), box index (0-17), or daycare slot (0-1) */
  containerIndex: number;
  /** Slot within box (0-29) or party/daycare (0-5 / 0-1) */
  slotIndex: number;
}

/**
 * Parse a complete .sav file.
 * @param buffer - Raw save file contents
 * @returns Parsed save data
 * @throws Error if the file format is unrecognized
 */
export function parseSaveFile(buffer: ArrayBuffer): ParsedSave {
  const data = new Uint8Array(buffer);

  // Detect game version
  const version = detectGameVersion(data);
  if (!version) {
    throw new Error('Unrecognized save file format. Expected a Gen 4 Pokemon save (DP/Pt/HGSS).');
  }

  // Read active blocks
  const generalResult = readGeneralBlock(data, version);
  const storageResult = readStorageBlock(data, version);

  // Parse trainer info
  const trainer = parseTrainerInfo(generalResult.data, version);

  // Parse party
  const party = readParty(generalResult.data, version);

  // Parse PC boxes
  const boxes = readPC(storageResult.data, version);

  // Parse Day Care (Ditto etc. live here — must count as caught)
  const daycare = readDaycare(generalResult.data, version);

  // Collect all Pokemon with their locations
  const allPokemon: PokemonLocation[] = [];
  const uniqueSpecies = new Set<number>();

  // Add party Pokemon
  for (let i = 0; i < party.pokemon.length; i++) {
    const p = party.pokemon[i];
    if (p) {
      allPokemon.push({
        pokemon: p,
        location: 'party',
        containerIndex: 0,
        slotIndex: i,
      });
      uniqueSpecies.add(p.species);
    }
  }

  // Add PC Pokemon
  for (const box of boxes) {
    for (let i = 0; i < box.pokemon.length; i++) {
      const p = box.pokemon[i];
      if (p) {
        allPokemon.push({
          pokemon: p,
          location: 'box',
          containerIndex: box.boxIndex,
          slotIndex: i,
        });
        uniqueSpecies.add(p.species);
      }
    }
  }

  // Add Day Care Pokemon
  for (let i = 0; i < daycare.pokemon.length; i++) {
    const p = daycare.pokemon[i];
    if (p) {
      allPokemon.push({
        pokemon: p,
        location: 'daycare',
        containerIndex: 0,
        slotIndex: i,
      });
      uniqueSpecies.add(p.species);
    }
  }

  return {
    version,
    trainer,
    party,
    boxes,
    daycare,
    allPokemon,
    totalPokemon: allPokemon.length,
    uniqueSpecies,
  };
}

/**
 * Get a summary string for a parsed save.
 */
export function saveSummary(save: ParsedSave): string {
  const partyCount = save.party.pokemon.filter(p => p !== null).length;
  return [
    `Game: ${save.version}`,
    `Trainer: ${save.trainer.name} (ID: ${save.trainer.trainerId})`,
    `Party: ${partyCount}/6`,
    `Total Pokemon: ${save.totalPokemon}`,
    `Unique Species: ${save.uniqueSpecies.size}/493`,
    `Play Time: ${save.trainer.playTimeHours}:${String(save.trainer.playTimeMinutes).padStart(2, '0')}`,
  ].join('\n');
}
