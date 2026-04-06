import { useState, useCallback, useEffect } from 'react';
import {
  getDropboxAppKey,
  setDropboxAppKey as storeAppKey,
  clearDropboxAppKey,
  isDropboxConnected,
  startDropboxAuth,
  handleDropboxRedirect,
  disconnectDropbox,
  findDeltaSaves,
  downloadFile,
  type DeltaGameSave,
} from '../services/dropbox';
import { detectGameVersion, detectSpecificGame } from '../core/parser/save-detector';
import { parseSaveFile } from '../core/parser/save-file';
import { importSaveBuffer } from '../state/actions/import-save';

export interface DropboxSyncState {
  appKey: string | null;
  connected: boolean;
  games: DeltaGameSave[];
  scanning: boolean;
  /** True while identifying game versions (downloading + parsing) */
  identifying: boolean;
  importing: boolean;
  importingHash: string | null;
  lastScanTime: number | null;
  error: string | null;
}

export function useDropboxSync() {
  const [state, setState] = useState<DropboxSyncState>({
    appKey: getDropboxAppKey(),
    connected: isDropboxConnected(),
    games: [],
    scanning: false,
    identifying: false,
    importing: false,
    importingHash: null,
    lastScanTime: null,
    error: null,
  });

  // On mount: check if we're returning from a Dropbox OAuth redirect.
  const [didRedirect, setDidRedirect] = useState(false);
  useEffect(() => {
    handleDropboxRedirect().then(wasRedirect => {
      if (wasRedirect && isDropboxConnected()) {
        setState(s => ({ ...s, connected: true }));
        setDidRedirect(true);
      }
    });
  }, []);

  const setAppKey = useCallback((key: string) => {
    storeAppKey(key);
    setState(s => ({ ...s, appKey: key, error: null }));
  }, []);

  const removeAppKey = useCallback(() => {
    clearDropboxAppKey();
    setState({
      appKey: null,
      connected: false,
      games: [],
      scanning: false,
      identifying: false,
      importing: false,
      importingHash: null,
      lastScanTime: null,
      error: null,
    });
  }, []);

  const connect = useCallback(async () => {
    setState(s => ({ ...s, error: null }));
    try {
      await startDropboxAuth();
    } catch (err) {
      setState(s => ({
        ...s,
        error: err instanceof Error ? err.message : 'Connection failed',
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    disconnectDropbox();
    setState(s => ({
      ...s,
      connected: false,
      games: [],
      lastScanTime: null,
      error: null,
    }));
  }, []);

  /**
   * Try to detect a Gen 4 save and identify the specific game.
   * Returns the specific game name (e.g., "HeartGold") or null.
   */
  const tryIdentify = (buffer: ArrayBuffer): { specificGame: string | null; formatVersion: string | null; debug: string } => {
    const data = new Uint8Array(buffer);
    const size = data.length;

    // Try raw (offset 0) first — standard 512KB .sav
    if (size >= 0x80000) {
      const version = detectGameVersion(data);
      if (version) {
        try {
          const parsed = parseSaveFile(buffer);
          const pokemonData = parsed.allPokemon.map(loc => ({
            originGame: loc.pokemon.originGame,
            otId: loc.pokemon.otId,
            otSid: loc.pokemon.otSid,
          }));
          const specific = detectSpecificGame(
            version,
            parsed.trainer.trainerId,
            parsed.trainer.secretId,
            pokemonData,
          );
          return {
            specificGame: specific,
            formatVersion: version,
            debug: `${size} bytes, ${version} → ${specific}, ${parsed.totalPokemon} Pokemon`,
          };
        } catch {
          // Parse failed but detection succeeded — use family name
          return { specificGame: version, formatVersion: version, debug: `${size} bytes, detected ${version} but parse failed` };
        }
      }
    }

    // Try to find save data at various offsets (Delta might prepend metadata)
    const offsets = [0x100, 0x200, 0x400, 0x1000];
    for (const off of offsets) {
      if (size >= off + 0x80000) {
        const slice = data.slice(off, off + 0x80000);
        const version = detectGameVersion(slice);
        if (version) {
          return { specificGame: version, formatVersion: version, debug: `${size} bytes, found at offset 0x${off.toString(16)}` };
        }
      }
    }

    // Build debug info
    const header = Array.from(data.slice(0, 16)).map(b => b.toString(16).padStart(2, '0')).join(' ');
    return { specificGame: null, formatVersion: null, debug: `${size} bytes (${(size/1024).toFixed(0)} KB), header: ${header}` };
  };

  /** Identify game versions by downloading each save and running the parser */
  const identifyGames = useCallback(async (games: DeltaGameSave[]) => {
    setState(s => ({ ...s, identifying: true }));

    const identified = [...games];
    for (let i = 0; i < identified.length; i++) {
      try {
        const buffer = await downloadFile(identified[i].file.path);
        const { specificGame, formatVersion, debug } = tryIdentify(buffer);
        if (specificGame) {
          identified[i] = {
            ...identified[i],
            gameVersion: formatVersion,
            gameName: specificGame,
            fileSize: buffer.byteLength,
            debugInfo: debug,
          };
        } else {
          identified[i] = {
            ...identified[i],
            gameVersion: 'unknown',
            gameName: null,
            fileSize: buffer.byteLength,
            debugInfo: debug,
          };
        }
      } catch (err) {
        identified[i] = {
          ...identified[i],
          gameVersion: 'error',
          gameName: null,
          fileSize: null,
          debugInfo: err instanceof Error ? err.message : 'download failed',
        };
      }
      setState(s => ({ ...s, games: [...identified] }));
    }

    setState(s => ({ ...s, identifying: false }));
  }, []);

  /** Scan Dropbox for Delta game saves, then identify each one */
  const scan = useCallback(async () => {
    setState(s => ({ ...s, scanning: true, error: null }));
    try {
      const games = await findDeltaSaves();
      setState(s => ({
        ...s,
        games,
        scanning: false,
        lastScanTime: Date.now(),
      }));
      // Now download each to detect the game version
      identifyGames(games);
      return games;
    } catch (err) {
      setState(s => ({
        ...s,
        scanning: false,
        error: err instanceof Error ? err.message : 'Failed to scan Dropbox',
      }));
      return [];
    }
  }, [identifyGames]);

  // Auto-scan after returning from OAuth redirect
  useEffect(() => {
    if (didRedirect && state.connected && state.games.length === 0 && !state.scanning) {
      scan();
    }
  }, [didRedirect, state.connected, state.games.length, state.scanning, scan]);

  /** Import a game save from Dropbox */
  const importGame = useCallback(async (game: DeltaGameSave): Promise<boolean> => {
    setState(s => ({ ...s, importing: true, importingHash: game.gameHash, error: null }));
    try {
      const buffer = await downloadFile(game.file.path);
      await importSaveBuffer(buffer, game.gameName ?? game.file.name);
      setState(s => ({ ...s, importing: false, importingHash: null }));
      return true;
    } catch (err) {
      setState(s => ({
        ...s,
        importing: false,
        importingHash: null,
        error: err instanceof Error ? err.message : 'Failed to import save',
      }));
      return false;
    }
  }, []);

  /** Refresh: re-download and re-import a game by its hash */
  const refreshGame = useCallback(async (gameHash: string): Promise<boolean> => {
    // Find the game in current list
    const game = state.games.find(g => g.gameHash === gameHash);
    if (!game) {
      setState(s => ({ ...s, error: 'Game not found. Try re-scanning.' }));
      return false;
    }
    setState(s => ({ ...s, importing: true, importingHash: gameHash, error: null }));
    try {
      // Re-scan to pick up any newer file for this game hash
      const freshGames = await findDeltaSaves();
      const freshGame = freshGames.find(g => g.gameHash === gameHash);
      const target = freshGame ?? game;

      const buffer = await downloadFile(target.file.path);
      await importSaveBuffer(buffer, game.gameName ?? target.file.name);
      setState(s => ({
        ...s,
        importing: false,
        importingHash: null,
        lastScanTime: Date.now(),
        // Update file list with fresh data
        games: s.games.map(g => g.gameHash === gameHash && freshGame ? { ...g, file: freshGame.file } : g),
      }));
      return true;
    } catch (err) {
      setState(s => ({
        ...s,
        importing: false,
        importingHash: null,
        error: err instanceof Error ? err.message : 'Failed to refresh save',
      }));
      return false;
    }
  }, [state.games]);

  return {
    ...state,
    setAppKey,
    removeAppKey,
    connect,
    disconnect,
    scan,
    importGame,
    refreshGame,
  };
}
