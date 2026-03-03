/**
 * Hook for syncing save files from a local directory via File System Access API.
 * Only works on Chromium browsers (Chrome, Edge). Falls back gracefully on Safari/Firefox.
 */

import { useCallback } from 'react';
import { useAppStore } from '../state/store';
import {
  saveDirectoryHandle,
  getDirectoryRecord,
  clearDirectoryHandle,
  updateLastScanTime,
} from '../db/directory-store';
import { scanForSaveFiles, getChangedFiles } from '../core/sync/directory-scanner';
import { importSaveBuffer } from '../state/actions/import-save';
import { getAllSaves } from '../db/save-store';
import { getAllRegistryEntries } from '../db/registry-store';

export interface SyncResult {
  scanned: number;
  imported: number;
  errors: string[];
}

export function useDirectorySync() {
  const isSupported = useAppStore(s => s.syncSupported);
  const connectedDirectory = useAppStore(s => s.connectedDirectory);
  const syncing = useAppStore(s => s.syncing);
  const lastSyncTime = useAppStore(s => s.lastSyncTime);

  const store = useAppStore;

  /**
   * Open a directory picker and store the handle.
   */
  const pickDirectory = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const dirHandle = await window.showDirectoryPicker({ mode: 'read' });
      await saveDirectoryHandle(dirHandle);
      store.getState().setConnectedDirectory(dirHandle.name);
      return true;
    } catch (err) {
      // User cancelled the picker
      if (err instanceof DOMException && err.name === 'AbortError') {
        return false;
      }
      throw err;
    }
  }, [isSupported, store]);

  /**
   * Sync: re-request permission, scan for changed files, import them.
   */
  const syncNow = useCallback(async (): Promise<SyncResult> => {
    const state = store.getState();
    state.setSyncing(true);
    state.setImportError(null);

    const result: SyncResult = { scanned: 0, imported: 0, errors: [] };

    try {
      const record = await getDirectoryRecord();
      if (!record) {
        state.setSyncing(false);
        return result;
      }

      // Re-request permission (required after page reload)
      const perm = await record.handle.requestPermission({ mode: 'read' });
      if (perm !== 'granted') {
        result.errors.push('Directory access denied. Please re-link the folder.');
        state.setConnectedDirectory(null);
        state.setSyncing(false);
        return result;
      }

      state.setConnectedDirectory(record.handle.name);

      // Scan for save files
      const files = await scanForSaveFiles(record.handle);
      result.scanned = files.length;

      // Get existing saves to determine which files are new/changed
      const existingSaves = await getAllSaves();
      const changedFiles = getChangedFiles(files, existingSaves);

      // Import each changed file
      for (const fileInfo of changedFiles) {
        try {
          const file = await fileInfo.handle.getFile();
          const buffer = await file.arrayBuffer();
          await importSaveBuffer(buffer, fileInfo.name);
          result.imported++;
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Unknown error';
          result.errors.push(`${fileInfo.name}: ${msg}`);
        }
      }

      // Update scan time and refresh state
      await updateLastScanTime();
      const now = Date.now();
      state.setLastSyncTime(now);

      // Refresh registry
      const entries = await getAllRegistryEntries();
      state.setRegistry(entries);

      // Refresh saves list
      const allSaves = await getAllSaves();
      state.setSaves(allSaves);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sync failed';
      result.errors.push(msg);
    } finally {
      state.setSyncing(false);
    }

    return result;
  }, [store]);

  /**
   * Disconnect the linked directory.
   */
  const disconnectDirectory = useCallback(async () => {
    await clearDirectoryHandle();
    store.getState().setConnectedDirectory(null);
    store.getState().setLastSyncTime(null);
  }, [store]);

  /**
   * Check if a directory handle is stored and load its name into state.
   * Called on app startup.
   */
  const loadStoredDirectory = useCallback(async () => {
    const record = await getDirectoryRecord();
    if (record) {
      store.getState().setConnectedDirectory(record.handle.name);
      store.getState().setLastSyncTime(record.lastScanTime);
    }
  }, [store]);

  return {
    isSupported,
    connectedDirectory,
    syncing,
    lastSyncTime,
    pickDirectory,
    syncNow,
    disconnectDirectory,
    loadStoredDirectory,
  };
}
