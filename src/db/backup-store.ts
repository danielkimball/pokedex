/**
 * Backup CRUD operations.
 * Auto-backups are created before any save file modification (box sort, transfers).
 * Keeps the last 10 backups per save to prevent unbounded storage growth.
 */

import { getDB, type BackupRecord } from './schema';

const MAX_BACKUPS_PER_SAVE = 10;

function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Create a backup of a save file's raw data before modification.
 */
export async function createBackup(
  saveId: string,
  rawData: ArrayBuffer,
  reason: string,
  trainerName: string,
  gameVersion: string,
): Promise<BackupRecord> {
  const db = await getDB();
  const record: BackupRecord = {
    id: generateId(),
    saveId,
    timestamp: Date.now(),
    reason,
    trainerName,
    gameVersion,
    rawData,
  };
  await db.put('backups', record);

  // Prune old backups beyond the limit
  await pruneBackups(saveId);

  return record;
}

/**
 * List all backups for a save, newest first.
 */
export async function listBackups(saveId: string): Promise<Omit<BackupRecord, 'rawData'>[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('backups', 'by-save', saveId);
  // Sort newest first, return without rawData to save memory
  return all
    .sort((a, b) => b.timestamp - a.timestamp)
    .map(({ rawData: _, ...rest }) => rest);
}

/**
 * Get a single backup including its raw data.
 */
export async function getBackup(backupId: string): Promise<BackupRecord | undefined> {
  const db = await getDB();
  return db.get('backups', backupId);
}

/**
 * Delete a single backup.
 */
export async function deleteBackup(backupId: string): Promise<void> {
  const db = await getDB();
  await db.delete('backups', backupId);
}

/**
 * Delete all backups for a save.
 */
export async function deleteBackupsForSave(saveId: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('backups', 'readwrite');
  const index = tx.store.index('by-save');
  let cursor = await index.openCursor(saveId);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}

/**
 * Keep only the newest MAX_BACKUPS_PER_SAVE backups for a save.
 */
async function pruneBackups(saveId: string): Promise<void> {
  const db = await getDB();
  const all = await db.getAllFromIndex('backups', 'by-save', saveId);
  if (all.length <= MAX_BACKUPS_PER_SAVE) return;

  // Sort newest first, delete the rest
  all.sort((a, b) => b.timestamp - a.timestamp);
  const toDelete = all.slice(MAX_BACKUPS_PER_SAVE);

  const tx = db.transaction('backups', 'readwrite');
  for (const backup of toDelete) {
    await tx.store.delete(backup.id);
  }
  await tx.done;
}

/**
 * Download a backup as a .sav file.
 */
export async function downloadBackup(backupId: string): Promise<void> {
  const backup = await getBackup(backupId);
  if (!backup) throw new Error('Backup not found');

  const blob = new Blob([backup.rawData], { type: 'application/octet-stream' });
  const filename = `backup_${backup.trainerName}_${new Date(backup.timestamp).toISOString().slice(0, 19).replace(/[:-]/g, '')}.sav`;

  // Try share API (iOS), else download
  if (navigator.share && navigator.canShare?.({ files: [new File([blob], filename)] })) {
    try {
      await navigator.share({ files: [new File([blob], filename)], title: 'Pokemon Save Backup' });
      return;
    } catch { /* fall through */ }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Restore a backup: replaces the save's raw data with the backup's data and re-parses everything.
 */
export async function restoreBackup(backupId: string): Promise<void> {
  const backup = await getBackup(backupId);
  if (!backup) throw new Error('Backup not found');

  const { refreshSaveAfterModification } = await import('./save-store');
  const { parseSaveFile } = await import('../core/parser/save-file');
  const { useAppStore } = await import('../state/store');

  // Create a backup of the CURRENT state before restoring (so restore is reversible)
  const { getSaveRawData, getSave } = await import('./save-store');
  const currentRaw = await getSaveRawData(backup.saveId);
  const currentSave = await getSave(backup.saveId);
  if (currentRaw && currentSave) {
    await createBackup(
      backup.saveId,
      currentRaw,
      'pre-restore',
      currentSave.trainerName,
      currentSave.gameVersion,
    );
  }

  await refreshSaveAfterModification(backup.saveId, backup.rawData);

  const store = useAppStore.getState();
  if (store.activeSaveId === backup.saveId) {
    store.setActiveSave(backup.saveId, parseSaveFile(backup.rawData));
  }
  const { getAllSaves } = await import('./save-store');
  store.setSaves(await getAllSaves());
}
