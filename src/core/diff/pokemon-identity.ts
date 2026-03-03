/**
 * Pokemon identity computation.
 *
 * A Pokemon's identity is stable across saves because:
 * - PID never changes
 * - OT ID/SID are set when caught and preserved through trades
 * - Species changes only on evolution (tracked separately)
 *
 * Identity key: `${pid}-${otId}-${otSid}`
 * (species excluded from key so we can detect evolution)
 */

import type { Pokemon } from '../parser/pokemon-parser';
import type { PokemonIdentity } from './diff-types';

/**
 * Compute the identity key for a Pokemon.
 * This key is stable across saves and location changes.
 * Species is NOT part of the key so evolution can be detected.
 */
export function getPokemonIdentity(pokemon: Pokemon): PokemonIdentity {
  return {
    key: `${pokemon.pid}-${pokemon.otId}-${pokemon.otSid}`,
    pid: pokemon.pid,
    otId: pokemon.otId,
    otSid: pokemon.otSid,
    species: pokemon.species,
  };
}

/**
 * Check if a Pokemon's OT matches a given trainer.
 */
export function isOriginalTrainer(
  pokemon: Pokemon,
  trainerId: number,
  secretId: number,
): boolean {
  return pokemon.otIdPublic === trainerId && pokemon.otSid === secretId;
}
