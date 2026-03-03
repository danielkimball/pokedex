/**
 * Scan a FileSystemDirectoryHandle for .sav/.dsv save files.
 * Determines which files are new or changed since last import.
 */

import type { SaveRecord } from '../../db/schema';

export interface SaveFileInfo {
  name: string;
  handle: FileSystemFileHandle;
  lastModified: number;
}

const SAVE_EXTENSIONS = /\.(sav|dsv)$/i;

/**
 * Scan a directory for save files (.sav, .dsv).
 */
export async function scanForSaveFiles(
  dirHandle: FileSystemDirectoryHandle,
): Promise<SaveFileInfo[]> {
  const results: SaveFileInfo[] = [];

  for await (const [name, entry] of dirHandle.entries()) {
    if (entry.kind === 'file' && SAVE_EXTENSIONS.test(name)) {
      const fileHandle = entry as FileSystemFileHandle;
      const file = await fileHandle.getFile();
      results.push({
        name,
        handle: fileHandle,
        lastModified: file.lastModified,
      });
    }
  }

  return results;
}

/**
 * Filter to only files that are new or changed since the last import.
 * Compares filenames and modification timestamps against existing saves.
 */
export function getChangedFiles(
  files: SaveFileInfo[],
  existingSaves: SaveRecord[],
): SaveFileInfo[] {
  return files.filter(file => {
    const existing = existingSaves.find(s => s.filename === file.name);
    if (!existing) return true; // new file
    // Re-import if file was modified after last import
    return file.lastModified > existing.importDate;
  });
}
