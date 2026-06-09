/**
 * Background auto-refresh of the active Dropbox-linked Delta save.
 *
 * Goal: the user saves in Delta on their phone (Delta syncs to Dropbox), then
 * opens/returns to the Pokedex PWA and it silently pulls the latest save — no
 * manual scan, re-upload, or app restart. Wired into the app's visibility
 * handler so it fires whenever the app regains focus.
 *
 * It is intentionally conservative: only runs when Dropbox is connected AND a
 * game has been marked active, debounces rapid focus events, and skips the
 * download entirely when Dropbox reports no newer file than what we last pulled.
 */

import { isDropboxConnected, findDeltaSaves, downloadFile } from '../../services/dropbox';
import { importSaveBuffer } from './import-save';

const HASH_KEY = 'pokedex-active-dropbox-game-hash';
const NAME_KEY = 'pokedex-active-dropbox-game-name';
const LAST_MODIFIED_KEY = 'pokedex-active-dropbox-last-modified';

let inFlight = false;
let lastAttempt = 0;

export interface AutoRefreshResult {
  status: 'skipped' | 'unchanged' | 'updated' | 'error';
  reason?: string;
}

/**
 * Pull the latest version of the active Dropbox save if it changed.
 * @param minIntervalMs debounce window — refuses to re-run within this period.
 */
export async function refreshActiveDropboxGame(minIntervalMs = 15000): Promise<AutoRefreshResult> {
  if (typeof window === 'undefined') return { status: 'skipped' };
  if (!isDropboxConnected()) return { status: 'skipped', reason: 'not connected' };

  const hash = localStorage.getItem(HASH_KEY);
  if (!hash) return { status: 'skipped', reason: 'no active game' };

  const now = Date.now();
  if (inFlight || now - lastAttempt < minIntervalMs) {
    return { status: 'skipped', reason: 'debounced' };
  }
  inFlight = true;
  lastAttempt = now;

  try {
    const games = await findDeltaSaves();
    const game = games.find(g => g.gameHash === hash);
    if (!game) return { status: 'skipped', reason: 'active game not found in Dropbox' };

    // Skip the (potentially slow) download when Dropbox's modified timestamp
    // matches what we last imported.
    const prevModified = localStorage.getItem(LAST_MODIFIED_KEY);
    if (prevModified && game.file.modified && game.file.modified === prevModified) {
      return { status: 'unchanged' };
    }

    const buffer = await downloadFile(game.file.path);
    await importSaveBuffer(buffer, game.gameName ?? game.file.name);
    if (game.file.modified) localStorage.setItem(LAST_MODIFIED_KEY, game.file.modified);
    if (game.gameName) localStorage.setItem(NAME_KEY, game.gameName);
    return { status: 'updated' };
  } catch (err) {
    return { status: 'error', reason: err instanceof Error ? err.message : 'refresh failed' };
  } finally {
    inFlight = false;
  }
}
