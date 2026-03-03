/**
 * Snapshot persistence for save file diff comparisons.
 */

import { getDB, type SnapshotRecord } from './schema';

export async function addSnapshot(snapshot: SnapshotRecord): Promise<void> {
  const db = await getDB();
  await db.put('snapshots', snapshot);
}

export async function getLatestSnapshot(saveId: string): Promise<SnapshotRecord | undefined> {
  const db = await getDB();
  const all = await db.getAllFromIndex('snapshots', 'by-save', saveId);
  if (all.length === 0) return undefined;
  // Return the one with highest timestamp
  return all.reduce((latest, s) => s.timestamp > latest.timestamp ? s : latest);
}

export async function getSnapshotsBySave(saveId: string): Promise<SnapshotRecord[]> {
  const db = await getDB();
  return db.getAllFromIndex('snapshots', 'by-save', saveId);
}
