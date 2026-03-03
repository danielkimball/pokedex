/**
 * Pokemon record persistence operations.
 */

import { getDB, type PokemonRecord } from './schema';

export async function addPokemon(pokemon: PokemonRecord): Promise<void> {
  const db = await getDB();
  await db.put('pokemon', pokemon);
}

export async function addPokemonBatch(pokemon: PokemonRecord[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('pokemon', 'readwrite');
  for (const p of pokemon) {
    await tx.store.put(p);
  }
  await tx.done;
}

export async function getPokemonBySave(saveId: string): Promise<PokemonRecord[]> {
  const db = await getDB();
  return db.getAllFromIndex('pokemon', 'by-save', saveId);
}

export async function getPokemonBySpecies(species: number): Promise<PokemonRecord[]> {
  const db = await getDB();
  return db.getAllFromIndex('pokemon', 'by-species', species);
}

export async function getPokemonByIdentity(identityKey: string): Promise<PokemonRecord[]> {
  const db = await getDB();
  return db.getAllFromIndex('pokemon', 'by-identity', identityKey);
}

export async function getAllPokemon(): Promise<PokemonRecord[]> {
  const db = await getDB();
  return db.getAll('pokemon');
}

export async function deletePokemonBySave(saveId: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('pokemon', 'readwrite');
  const index = tx.store.index('by-save');
  let cursor = await index.openCursor(saveId);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}
