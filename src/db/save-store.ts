/**
 * Save file persistence operations.
 */

import { getDB, type SaveRecord } from './schema';

export async function addSave(save: SaveRecord): Promise<void> {
  const db = await getDB();
  await db.put('saves', save);
}

export async function getSave(id: string): Promise<SaveRecord | undefined> {
  const db = await getDB();
  return db.get('saves', id);
}

export async function getAllSaves(): Promise<SaveRecord[]> {
  const db = await getDB();
  return db.getAllFromIndex('saves', 'by-date');
}

export async function deleteSave(id: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['saves', 'pokemon', 'snapshots'], 'readwrite');
  await tx.objectStore('saves').delete(id);

  // Delete associated Pokemon records
  const pokemonIndex = tx.objectStore('pokemon').index('by-save');
  let cursor = await pokemonIndex.openCursor(id);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }

  // Delete associated snapshots
  const snapshotIndex = tx.objectStore('snapshots').index('by-save');
  let snapCursor = await snapshotIndex.openCursor(id);
  while (snapCursor) {
    await snapCursor.delete();
    snapCursor = await snapCursor.continue();
  }

  await tx.done;
}

export async function getSaveRawData(id: string): Promise<ArrayBuffer | undefined> {
  const save = await getSave(id);
  return save?.rawData;
}
