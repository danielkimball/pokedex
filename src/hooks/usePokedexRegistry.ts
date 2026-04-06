/**
 * Hook for accessing and refreshing the Pokedex registry.
 */

import { useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '../state/store';
import { getAllRegistryEntries } from '../db/registry-store';
import { getAllSaves } from '../db/save-store';
import { getDirectoryRecord, getFileRecord } from '../db/directory-store';
import { scanForSaveFiles, getChangedFiles } from '../core/sync/directory-scanner';
import { importSaveBuffer } from '../state/actions/import-save';

export function usePokedexRegistry() {
  const registryMap = useAppStore(s => s.registryMap);
  const caughtCount = useAppStore(s => s.caughtCount);
  const setRegistry = useAppStore(s => s.setRegistry);

  const refresh = useCallback(async () => {
    const entries = await getAllRegistryEntries();
    setRegistry(entries);
  }, [setRegistry]);

  useEffect(() => { refresh(); }, [refresh]);

  return { registryMap, caughtCount, refresh };
}

export function useInitializeApp() {
  const setSaves = useAppStore(s => s.setSaves);
  const setSavesLoading = useAppStore(s => s.setSavesLoading);
  const setRegistry = useAppStore(s => s.setRegistry);
  const setConnectedDirectory = useAppStore(s => s.setConnectedDirectory);
  const setLastSyncTime = useAppStore(s => s.setLastSyncTime);
  const setSyncing = useAppStore(s => s.setSyncing);
  const lastDeltaSyncRef = useRef<number>(0);

  useEffect(() => {
    async function init() {
      setSavesLoading(true);
      try {
        const [saves, entries] = await Promise.all([
          getAllSaves(),
          getAllRegistryEntries(),
        ]);
        setSaves(saves);
        setRegistry(entries);

        // Check for stored directory handle and attempt auto-sync
        await tryAutoSync(saves);

        // Auto-sync delta file handle if one is linked
        await tryDeltaFileAutoSync();
      } finally {
        setSavesLoading(false);
      }
    }

    async function tryAutoSync(existingSaves: Awaited<ReturnType<typeof getAllSaves>>) {
      const record = await getDirectoryRecord();
      if (!record) return;

      // Load the directory name into state
      setConnectedDirectory(record.handle.name);
      setLastSyncTime(record.lastScanTime);

      // Try to get permission without a user gesture (works if already granted)
      try {
        const perm = await record.handle.queryPermission({ mode: 'read' });
        if (perm !== 'granted') return; // Need user interaction to re-request

        setSyncing(true);
        const files = await scanForSaveFiles(record.handle);
        const changed = getChangedFiles(files, existingSaves);

        for (const fileInfo of changed) {
          try {
            const file = await fileInfo.handle.getFile();
            const buffer = await file.arrayBuffer();
            await importSaveBuffer(buffer, fileInfo.name);
          } catch {
            // Skip files that fail to parse
          }
        }

        if (changed.length > 0) {
          // Refresh state after auto-sync
          const [updatedSaves, updatedEntries] = await Promise.all([
            getAllSaves(),
            getAllRegistryEntries(),
          ]);
          setSaves(updatedSaves);
          setRegistry(updatedEntries);
        }

        setLastSyncTime(Date.now());
      } catch {
        // Auto-sync failed silently — user can manually sync later
      } finally {
        setSyncing(false);
      }
    }

    async function tryDeltaFileAutoSync() {
      try {
        const fileRecord = await getFileRecord();
        if (!fileRecord) return;

        const perm = await fileRecord.handle.queryPermission({ mode: 'read' });
        if (perm !== 'granted') return;

        const file = await fileRecord.handle.getFile();
        const buffer = await file.arrayBuffer();
        await importSaveBuffer(buffer, file.name);

        lastDeltaSyncRef.current = Date.now();

        // Refresh saves and registry after successful import
        const [updatedSaves, updatedEntries] = await Promise.all([
          getAllSaves(),
          getAllRegistryEntries(),
        ]);
        setSaves(updatedSaves);
        setRegistry(updatedEntries);
      } catch {
        // Delta file auto-sync failed silently — user can manually refresh later
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState !== 'visible') return;

      // Debounce: skip if last sync was less than 5 seconds ago
      const now = Date.now();
      if (now - lastDeltaSyncRef.current < 5000) return;

      tryDeltaFileAutoSync();
    }

    init();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [setSaves, setSavesLoading, setRegistry, setConnectedDirectory, setLastSyncTime, setSyncing]);
}
