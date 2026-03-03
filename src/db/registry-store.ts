/**
 * Pokedex registry persistence — tracks which species have been caught.
 */

import { getDB, type RegistryEntry } from './schema';

export async function getRegistryEntry(species: number): Promise<RegistryEntry | undefined> {
  const db = await getDB();
  return db.get('registry', species);
}

export async function getAllRegistryEntries(): Promise<RegistryEntry[]> {
  const db = await getDB();
  return db.getAll('registry');
}

export async function updateRegistryEntry(entry: RegistryEntry): Promise<void> {
  const db = await getDB();
  await db.put('registry', entry);
}

/**
 * Mark a species as caught, updating its registry entry.
 */
export async function markCaught(
  species: number,
  saveId: string,
  locationDesc: string,
): Promise<void> {
  const db = await getDB();
  const existing = await db.get('registry', species);

  const entry: RegistryEntry = existing ?? {
    species,
    caught: false,
    firstCaughtDate: null,
    lastSeenSaveId: null,
    locations: [],
  };

  if (!entry.caught) {
    entry.caught = true;
    entry.firstCaughtDate = Date.now();
  }

  entry.lastSeenSaveId = saveId;

  // Add location if not already tracked
  const locExists = entry.locations.some(
    l => l.saveId === saveId && l.location === locationDesc,
  );
  if (!locExists) {
    entry.locations.push({ saveId, location: locationDesc });
  }

  await db.put('registry', entry);
}

/**
 * Batch update registry from a parsed save.
 */
export async function updateRegistryFromSave(
  pokemonEntries: { species: number; location: string }[],
  saveId: string,
): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('registry', 'readwrite');

  for (const { species, location } of pokemonEntries) {
    const existing = await tx.store.get(species);
    const entry: RegistryEntry = existing ?? {
      species,
      caught: false,
      firstCaughtDate: null,
      lastSeenSaveId: null,
      locations: [],
    };

    if (!entry.caught) {
      entry.caught = true;
      entry.firstCaughtDate = Date.now();
    }

    entry.lastSeenSaveId = saveId;

    const locExists = entry.locations.some(
      l => l.saveId === saveId && l.location === location,
    );
    if (!locExists) {
      entry.locations.push({ saveId, location });
    }

    await tx.store.put(entry);
  }

  await tx.done;
}

/**
 * Get the total count of caught species.
 */
export async function getCaughtCount(): Promise<number> {
  const entries = await getAllRegistryEntries();
  return entries.filter(e => e.caught).length;
}
