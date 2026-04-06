/**
 * Write modified save data back to the linked Delta file.
 * Uses File System Access API (createWritable) on Chrome/Edge.
 * Falls back to download/share on iOS Safari.
 */

import { getSaveRawData } from '../../db/save-store';
import { getFileRecord } from '../../db/directory-store';

/**
 * Returns true if the File System Access API writeback is supported.
 */
export function supportsWriteback(): boolean {
  return typeof FileSystemFileHandle !== 'undefined' &&
    'createWritable' in FileSystemFileHandle.prototype;
}

/**
 * Write the current save data back to the linked Delta file.
 * @param saveId - Database ID of the save to write back
 * @returns 'written' if written to linked file, 'downloaded' if fell back to download, 'no-data' if save not found
 */
export async function writeBackToLinkedFile(saveId: string): Promise<'written' | 'downloaded' | 'no-data'> {
  const rawData = await getSaveRawData(saveId);
  if (!rawData) return 'no-data';

  // Try to write back via File System Access API
  if (supportsWriteback()) {
    const fileRecord = await getFileRecord();
    if (fileRecord) {
      // Verify we still have write permission
      const permission = await (fileRecord.handle as any).queryPermission({ mode: 'readwrite' });
      if (permission === 'granted') {
        const writable = await fileRecord.handle.createWritable();
        await writable.write(rawData);
        await writable.close();
        return 'written';
      }

      // Try to request permission
      const requested = await (fileRecord.handle as any).requestPermission({ mode: 'readwrite' });
      if (requested === 'granted') {
        const writable = await fileRecord.handle.createWritable();
        await writable.write(rawData);
        await writable.close();
        return 'written';
      }
    }
  }

  // Fallback: download/share
  const blob = new Blob([rawData], { type: 'application/octet-stream' });
  const filename = 'pokemon.sav';

  if (navigator.share && navigator.canShare?.({ files: [new File([blob], filename)] })) {
    try {
      await navigator.share({ files: [new File([blob], filename)], title: 'Save File' });
      return 'downloaded';
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
  return 'downloaded';
}
