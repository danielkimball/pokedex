/**
 * Diff engine: compare two save snapshots to detect changes.
 */

import type { PokemonLocation } from '../parser/save-file';
import type { DiffChange, DiffResult } from './diff-types';
import { getPokemonIdentity, isOriginalTrainer } from './pokemon-identity';

function locationString(loc: PokemonLocation): string {
  if (loc.location === 'party') {
    return `Party slot ${loc.slotIndex + 1}`;
  }
  return `Box ${loc.containerIndex + 1}, Slot ${loc.slotIndex + 1}`;
}

/**
 * Compare a previous snapshot with a current snapshot to detect changes.
 * @param previous - Pokemon from the previous save import
 * @param current - Pokemon from the current save import
 * @param trainerId - Current save's trainer ID
 * @param secretId - Current save's secret ID
 */
export function diffSnapshots(
  previous: PokemonLocation[],
  current: PokemonLocation[],
  trainerId: number,
  secretId: number,
): DiffResult {
  const changes: DiffChange[] = [];

  // Build maps by identity key
  const prevMap = new Map<string, PokemonLocation[]>();
  for (const loc of previous) {
    const id = getPokemonIdentity(loc.pokemon);
    const existing = prevMap.get(id.key) ?? [];
    existing.push(loc);
    prevMap.set(id.key, existing);
  }

  const currMap = new Map<string, PokemonLocation[]>();
  for (const loc of current) {
    const id = getPokemonIdentity(loc.pokemon);
    const existing = currMap.get(id.key) ?? [];
    existing.push(loc);
    currMap.set(id.key, existing);
  }

  let unchangedCount = 0;

  // Check current Pokemon against previous
  for (const [key, currLocs] of currMap) {
    const prevLocs = prevMap.get(key);

    if (!prevLocs || prevLocs.length === 0) {
      // New Pokemon
      for (const loc of currLocs) {
        const isOT = isOriginalTrainer(loc.pokemon, trainerId, secretId);
        changes.push({
          type: isOT ? 'new_catch' : 'traded_in',
          pokemon: loc.pokemon,
          location: locationString(loc),
        });
      }
    } else {
      // Pokemon existed before
      for (let i = 0; i < currLocs.length; i++) {
        const curr = currLocs[i];
        const prev = prevLocs[i] ?? prevLocs[0];

        // Check for evolution (same identity, different species)
        if (curr.pokemon.species !== prev.pokemon.species) {
          changes.push({
            type: 'evolved',
            pokemon: curr.pokemon,
            previousPokemon: prev.pokemon,
            location: locationString(curr),
            previousLocation: locationString(prev),
          });
        }
        // Check for level up (party Pokemon have battle stats with level)
        else if (
          curr.pokemon.battleStats && prev.pokemon.battleStats &&
          curr.pokemon.battleStats.level > prev.pokemon.battleStats.level
        ) {
          changes.push({
            type: 'leveled_up',
            pokemon: curr.pokemon,
            previousPokemon: prev.pokemon,
            location: locationString(curr),
          });
        }
        // Check for movement
        else if (
          curr.location !== prev.location ||
          curr.containerIndex !== prev.containerIndex ||
          curr.slotIndex !== prev.slotIndex
        ) {
          changes.push({
            type: 'moved',
            pokemon: curr.pokemon,
            location: locationString(curr),
            previousLocation: locationString(prev),
          });
        } else {
          unchangedCount++;
        }
      }
    }
  }

  // Check for Pokemon that disappeared
  for (const [key, prevLocs] of prevMap) {
    if (!currMap.has(key)) {
      for (const loc of prevLocs) {
        const isOT = isOriginalTrainer(loc.pokemon, trainerId, secretId);
        changes.push({
          type: isOT ? 'released' : 'traded_out',
          pokemon: loc.pokemon,
          location: locationString(loc),
        });
      }
    }
  }

  // Categorize changes
  const newCatches = changes.filter(c => c.type === 'new_catch');
  const tradedIn = changes.filter(c => c.type === 'traded_in');
  const released = changes.filter(c => c.type === 'released');
  const tradedOut = changes.filter(c => c.type === 'traded_out');
  const evolved = changes.filter(c => c.type === 'evolved');
  const moved = changes.filter(c => c.type === 'moved');
  const leveledUp = changes.filter(c => c.type === 'leveled_up');

  const parts: string[] = [];
  if (newCatches.length) parts.push(`+${newCatches.length} caught`);
  if (tradedIn.length) parts.push(`+${tradedIn.length} traded in`);
  if (released.length) parts.push(`-${released.length} released`);
  if (tradedOut.length) parts.push(`-${tradedOut.length} traded out`);
  if (evolved.length) parts.push(`${evolved.length} evolved`);
  if (leveledUp.length) parts.push(`${leveledUp.length} leveled up`);
  if (moved.length) parts.push(`${moved.length} moved`);

  return {
    changes,
    newCatches,
    tradedIn,
    released,
    tradedOut,
    evolved,
    moved,
    leveledUp,
    unchanged: unchangedCount,
    summary: parts.length ? parts.join(', ') : 'No changes',
  };
}
