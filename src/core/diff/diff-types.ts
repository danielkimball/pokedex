/**
 * Types for the save diff system.
 */

import type { Pokemon } from '../parser/pokemon-parser';

/** Unique identity for a Pokemon across saves */
export interface PokemonIdentity {
  /** Composite key: pid-otId-otSid-species */
  key: string;
  pid: number;
  otId: number;
  otSid: number;
  species: number;
}

export type DiffChangeType =
  | 'new_catch'     // New Pokemon with matching OT
  | 'traded_in'     // New Pokemon with different OT
  | 'released'      // Pokemon missing, OT matches trainer
  | 'traded_out'    // Pokemon missing, OT differs (or explicitly traded)
  | 'evolved'       // Same identity, different species
  | 'moved'         // Same identity, different box/slot
  | 'leveled_up'    // Same identity, higher level
  | 'unchanged';    // No change

export interface DiffChange {
  type: DiffChangeType;
  pokemon: Pokemon;
  /** Previous state (for evolved/moved/leveled_up) */
  previousPokemon?: Pokemon;
  /** Location description */
  location: string;
  /** Previous location (for moved) */
  previousLocation?: string;
}

export interface DiffResult {
  changes: DiffChange[];
  newCatches: DiffChange[];
  tradedIn: DiffChange[];
  released: DiffChange[];
  tradedOut: DiffChange[];
  evolved: DiffChange[];
  moved: DiffChange[];
  leveledUp: DiffChange[];
  unchanged: number;
  summary: string;
}
