/**
 * CRUD operations for persisting a FileSystemDirectoryHandle in IndexedDB.
 * Used by the auto-sync feature to remember the user's chosen save folder.
 */

import { getDB, type DirectoryRecord } from './schema';

const RECORD_ID = 'watched-dir';

export async function saveDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await getDB();
  const record: DirectoryRecord = {
    id: RECORD_ID,
    handle,
    lastScanTime: Date.now(),
  };
  await db.put('directories', record);
}

export async function getDirectoryRecord(): Promise<DirectoryRecord | null> {
  const db = await getDB();
  const record = await db.get('directories', RECORD_ID);
  return record ?? null;
}

export async function clearDirectoryHandle(): Promise<void> {
  const db = await getDB();
  await db.delete('directories', RECORD_ID);
}

export async function updateLastScanTime(): Promise<void> {
  const db = await getDB();
  const record = await db.get('directories', RECORD_ID);
  if (record) {
    record.lastScanTime = Date.now();
    await db.put('directories', record);
  }
}

// ── Single-file watch (for Delta .dsv / .sav direct linking) ──────────────

export interface FileRecord {
  id: 'watched-file';
  handle: FileSystemFileHandle;
  lastScanTime: number;
}

const FILE_RECORD_ID = 'watched-file';

export async function saveFileHandle(handle: FileSystemFileHandle): Promise<void> {
  const db = await getDB();
  await db.put('directories', { id: FILE_RECORD_ID, handle, lastScanTime: Date.now() } as any);
}

export async function getFileRecord(): Promise<FileRecord | null> {
  const db = await getDB();
  const record = await db.get('directories', FILE_RECORD_ID);
  return record ? (record as unknown as FileRecord) : null;
}

export async function clearFileHandle(): Promise<void> {
  const db = await getDB();
  await db.delete('directories', FILE_RECORD_ID);
}
