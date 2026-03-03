/**
 * Hook for accessing and refreshing the Pokedex registry.
 */

import { useEffect, useCallback } from 'react';
import { useAppStore } from '../state/store';
import { getAllRegistryEntries } from '../db/registry-store';
import { getAllSaves } from '../db/save-store';
import { getDirectoryRecord } from '../db/directory-store';
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

    init();
  }, [setSaves, setSavesLoading, setRegistry, setConnectedDirectory, setLastSyncTime, setSyncing]);
}
