/**
 * Hook for handling .sav file import via file picker.
 */

import { useCallback, useRef } from 'react';
import { importSaveFile } from '../state/actions/import-save';
import { useAppStore } from '../state/store';

export function useFileImport() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const importing = useAppStore(s => s.importing);
  const importError = useAppStore(s => s.importError);

  const openFilePicker = useCallback(() => {
    // Create a hidden input if we don't have one
    if (!inputRef.current) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.sav,.dsv,.SAV,.DSV';
      input.style.display = 'none';
      input.addEventListener('change', async () => {
        const file = input.files?.[0];
        if (file) {
          try {
            await importSaveFile(file);
          } catch {
            // Error is set in store by importSaveFile
          }
        }
        // Reset so the same file can be re-imported
        input.value = '';
      });
      document.body.appendChild(input);
      inputRef.current = input;
    }
    inputRef.current.click();
  }, []);

  return { openFilePicker, importing, importError };
}
