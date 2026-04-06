import { useState, useCallback } from 'react';
import {
  isSignedIn,
  requestAccessToken,
  findDeltaSaveFiles,
  readDriveFile,
  type DriveSaveFile,
} from '../services/google-drive';
import { importSaveBuffer } from '../state/actions/import-save';

export interface DeltaDriveSyncState {
  /** All .sav/.dsv files found on Drive */
  saveFiles: DriveSaveFile[];
  /** Whether we're currently scanning Drive */
  scanning: boolean;
  /** Whether we're currently importing a save */
  importing: boolean;
  /** ID of the file currently being imported */
  importingFileId: string | null;
  /** Last scan timestamp */
  lastScanTime: number | null;
  /** Error message */
  error: string | null;
}

export function useDeltaDriveSync() {
  const [state, setState] = useState<DeltaDriveSyncState>({
    saveFiles: [],
    scanning: false,
    importing: false,
    importingFileId: null,
    lastScanTime: null,
    error: null,
  });

  /** Ensure we have a valid token, re-requesting if expired */
  const ensureToken = async () => {
    if (!isSignedIn()) {
      await requestAccessToken();
    }
  };

  /** Scan Google Drive for Delta save files */
  const scan = useCallback(async () => {
    setState(s => ({ ...s, scanning: true, error: null }));
    try {
      await ensureToken();
      const files = await findDeltaSaveFiles();
      setState(s => ({
        ...s,
        saveFiles: files,
        scanning: false,
        lastScanTime: Date.now(),
      }));
      return files;
    } catch (err) {
      setState(s => ({
        ...s,
        scanning: false,
        error: err instanceof Error ? err.message : 'Failed to scan Drive',
      }));
      return [];
    }
  }, []);

  /** Import a specific save file from Drive */
  const importFile = useCallback(async (file: DriveSaveFile): Promise<boolean> => {
    setState(s => ({ ...s, importing: true, importingFileId: file.id, error: null }));
    try {
      await ensureToken();
      const buffer = await readDriveFile(file.id);
      await importSaveBuffer(buffer, file.name);
      setState(s => ({ ...s, importing: false, importingFileId: null }));
      return true;
    } catch (err) {
      setState(s => ({
        ...s,
        importing: false,
        importingFileId: null,
        error: err instanceof Error ? err.message : 'Failed to import save',
      }));
      return false;
    }
  }, []);

  /** Refresh: re-scan and re-import a specific file (by ID) if provided */
  const refreshFile = useCallback(async (fileId: string): Promise<boolean> => {
    setState(s => ({ ...s, importing: true, importingFileId: fileId, error: null }));
    try {
      await ensureToken();
      // Re-scan to get latest metadata
      const files = await findDeltaSaveFiles();
      const file = files.find(f => f.id === fileId);
      if (!file) {
        // File may have been renamed — try to find by same name
        setState(s => ({
          ...s,
          saveFiles: files,
          importing: false,
          importingFileId: null,
          lastScanTime: Date.now(),
          error: 'Save file no longer found on Drive',
        }));
        return false;
      }
      const buffer = await readDriveFile(fileId);
      await importSaveBuffer(buffer, file.name);
      setState(s => ({
        ...s,
        saveFiles: files,
        importing: false,
        importingFileId: null,
        lastScanTime: Date.now(),
      }));
      return true;
    } catch (err) {
      setState(s => ({
        ...s,
        importing: false,
        importingFileId: null,
        error: err instanceof Error ? err.message : 'Failed to refresh save',
      }));
      return false;
    }
  }, []);

  return {
    ...state,
    scan,
    importFile,
    refreshFile,
  };
}
