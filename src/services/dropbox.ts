/**
 * Dropbox integration for reading Delta emulator save files.
 * Uses OAuth2 PKCE flow (popup-based) and Dropbox API v2.
 *
 * Delta stores synced data in /Apps/Delta Emulator/ on Dropbox.
 */

// ── Storage keys ────────────────────────────────────────────────────────────

const KEY_APP_KEY = 'pokedex-dropbox-app-key';
const KEY_TOKEN = 'pokedex-dropbox-token';
const KEY_VERIFIER = 'pokedex-dropbox-pkce-verifier';

// ── PKCE helpers ────────────────────────────────────────────────────────────

function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(digest));
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// ── App key management ──────────────────────────────────────────────────────

export function getDropboxAppKey(): string | null {
  return localStorage.getItem(KEY_APP_KEY);
}

export function setDropboxAppKey(key: string): void {
  localStorage.setItem(KEY_APP_KEY, key);
}

export function clearDropboxAppKey(): void {
  localStorage.removeItem(KEY_APP_KEY);
  localStorage.removeItem(KEY_TOKEN);
  localStorage.removeItem(KEY_VERIFIER);
}

// ── Token management ────────────────────────────────────────────────────────

export function getDropboxToken(): string | null {
  return localStorage.getItem(KEY_TOKEN);
}

export function isDropboxConnected(): boolean {
  return !!localStorage.getItem(KEY_TOKEN);
}

export function disconnectDropbox(): void {
  localStorage.removeItem(KEY_TOKEN);
  localStorage.removeItem(KEY_VERIFIER);
}

// ── OAuth2 PKCE flow (redirect-based, works on iOS Safari) ─────────────────

/**
 * Start the Dropbox OAuth flow by redirecting the current page.
 * After auth, Dropbox redirects back to the app with a code in the URL.
 * Call handleDropboxRedirect() on app startup to complete the flow.
 */
export async function startDropboxAuth(): Promise<void> {
  const appKey = getDropboxAppKey();
  if (!appKey) throw new Error('No Dropbox App Key configured');

  const verifier = generateCodeVerifier();
  localStorage.setItem(KEY_VERIFIER, verifier);
  // Save current path so we can restore after redirect
  localStorage.setItem('pokedex-dropbox-return-path', window.location.pathname);
  const challenge = await generateCodeChallenge(verifier);

  const redirectUri = window.location.origin + '/';

  const authUrl = new URL('https://www.dropbox.com/oauth2/authorize');
  authUrl.searchParams.set('client_id', appKey);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('code_challenge', challenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('token_access_type', 'offline');

  // Navigate away — user will come back with ?code=... in the URL
  window.location.href = authUrl.toString();
}

/**
 * Call on app startup. If the URL has a Dropbox auth code, exchange it for a token.
 * Returns true if a redirect was handled.
 */
export async function handleDropboxRedirect(): Promise<boolean> {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (!code) return false;

  const verifier = localStorage.getItem(KEY_VERIFIER);
  const appKey = getDropboxAppKey();
  if (!verifier || !appKey) {
    // Stale redirect — clean up URL and bail
    cleanUrl();
    return false;
  }

  const redirectUri = window.location.origin + '/';

  try {
    const token = await exchangeCode(appKey, code, verifier, redirectUri);
    localStorage.setItem(KEY_TOKEN, token);
  } finally {
    localStorage.removeItem(KEY_VERIFIER);
    cleanUrl();
  }

  return true;
}

function cleanUrl(): void {
  // Remove ?code=... from the URL without a page reload
  const url = new URL(window.location.href);
  url.searchParams.delete('code');
  window.history.replaceState({}, '', url.pathname);
}

async function exchangeCode(
  appKey: string,
  code: string,
  verifier: string,
  redirectUri: string,
): Promise<string> {
  const body = new URLSearchParams({
    code,
    grant_type: 'authorization_code',
    client_id: appKey,
    redirect_uri: redirectUri,
    code_verifier: verifier,
  });

  const response = await fetch('https://api.dropboxapi.com/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Dropbox token exchange failed: ${text}`);
  }

  const data = await response.json();
  return data.access_token;
}

// ── Dropbox API v2 ──────────────────────────────────────────────────────────

export interface DropboxFile {
  name: string;
  path: string;
  id: string;
  size: number;
  modified: string;
  isFolder: boolean;
}

async function dbxFetch(url: string, body?: object, headers?: Record<string, string>): Promise<Response> {
  const token = getDropboxToken();
  if (!token) throw new Error('Not connected to Dropbox');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    localStorage.removeItem(KEY_TOKEN);
    throw new Error('Dropbox session expired. Please reconnect.');
  }
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Dropbox API error: ${response.status} ${text}`);
  }
  return response;
}

/**
 * List all files in a Dropbox folder recursively.
 */
export async function listFolderRecursive(path: string): Promise<DropboxFile[]> {
  const files: DropboxFile[] = [];

  let response = await dbxFetch('https://api.dropboxapi.com/2/files/list_folder', {
    path,
    recursive: true,
    limit: 500,
  });
  let data = await response.json();

  for (const entry of data.entries) {
    files.push(mapEntry(entry));
  }

  // Handle pagination
  while (data.has_more) {
    response = await dbxFetch('https://api.dropboxapi.com/2/files/list_folder/continue', {
      cursor: data.cursor,
    });
    data = await response.json();
    for (const entry of data.entries) {
      files.push(mapEntry(entry));
    }
  }

  return files;
}

function mapEntry(entry: any): DropboxFile {
  return {
    name: entry.name,
    path: entry.path_display || entry.path_lower,
    id: entry.id,
    size: entry.size || 0,
    modified: entry.server_modified || entry.client_modified || '',
    isFolder: entry['.tag'] === 'folder',
  };
}

/**
 * Download a file from Dropbox. Returns the raw bytes.
 */
export async function downloadFile(path: string): Promise<ArrayBuffer> {
  const token = getDropboxToken();
  if (!token) throw new Error('Not connected to Dropbox');

  const response = await fetch('https://content.dropboxapi.com/2/files/download', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Dropbox-API-Arg': JSON.stringify({ path }),
    },
  });

  if (response.status === 401) {
    localStorage.removeItem(KEY_TOKEN);
    throw new Error('Dropbox session expired. Please reconnect.');
  }
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Dropbox download failed: ${response.status} ${text}`);
  }

  return response.arrayBuffer();
}

/** A game save identified by its game hash, with the latest file selected. */
export interface DeltaGameSave {
  /** The game hash from the filename (identifies which game) */
  gameHash: string;
  /** The latest GameSave file for this game */
  file: DropboxFile;
  /** Detected game version after downloading (null until identified) */
  gameVersion: string | null;
  /** Human-readable game name (null until identified) */
  gameName: string | null;
  /** File size in bytes (populated after download) */
  fileSize: number | null;
  /** Debug info for troubleshooting */
  debugInfo: string | null;
}

/**
 * Find Delta emulator game saves in Dropbox.
 * Filters to only GameSave-* files, groups by game, keeps latest per game.
 */
export async function findDeltaSaves(): Promise<DeltaGameSave[]> {
  const possiblePaths = [
    '/Apps/Delta Emulator',
    '/Apps/Delta',
    '/Apps/delta',
    '/Apps/Delta Emulator Sync',
    '/Delta',
    '/Delta Emulator',
  ];

  const triedPaths: string[] = [];

  for (const basePath of possiblePaths) {
    let allFiles: DropboxFile[];
    try {
      allFiles = await listFolderRecursive(basePath);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('not_found') || msg.includes('409')) {
        triedPaths.push(basePath);
        continue;
      }
      throw err;
    }

    // Filter to GameSave-* files only (actual battery saves, not save states)
    const gameSaveFiles = allFiles.filter(f =>
      !f.isFolder && f.name.startsWith('GameSave-')
    );

    if (gameSaveFiles.length === 0) continue;

    // Group by game hash (the hex portion of the filename)
    // Format: GameSave-{hash}-gameSave
    const byGame = new Map<string, DropboxFile[]>();
    for (const file of gameSaveFiles) {
      const match = file.name.match(/^GameSave-([a-f0-9]+)-/i);
      const hash = match ? match[1] : file.name;
      const group = byGame.get(hash) ?? [];
      group.push(file);
      byGame.set(hash, group);
    }

    // Per game hash, pick the actual binary save (largest file).
    // Harmony stores multiple files per record: the save data (large)
    // and JSON metadata records (tiny, ~500 bytes starting with '{').
    const results: DeltaGameSave[] = [];
    for (const [hash, files] of byGame) {
      // Sort by size descending — the actual save data is the largest file
      files.sort((a, b) => b.size - a.size);
      // Skip tiny JSON metadata files (< 4KB) — real saves are 32KB+
      const saveFile = files.find(f => f.size >= 4096) ?? files[0];
      results.push({
        gameHash: hash,
        file: saveFile,
        gameVersion: null,
        gameName: null,
        fileSize: null,
        debugInfo: null,
      });
    }

    // Sort by most recently modified
    results.sort((a, b) => new Date(b.file.modified).getTime() - new Date(a.file.modified).getTime());
    return results;
  }

  // None of the known paths worked
  try {
    const rootFiles = await listFolderRecursive('');
    const folders = rootFiles.filter(f => f.isFolder).map(f => f.path);
    throw new Error(
      `Could not find Delta saves. Searched: ${triedPaths.join(', ')}. ` +
      `Your Dropbox folders: ${folders.slice(0, 20).join(', ') || '(empty)'}. ` +
      `Make sure Delta is set to sync via Dropbox in Delta Settings > Syncing.`
    );
  } catch (rootErr) {
    if (rootErr instanceof Error && rootErr.message.startsWith('Could not find')) {
      throw rootErr;
    }
    throw new Error(
      `Could not find Delta saves. Searched: ${triedPaths.join(', ')}. ` +
      `Also failed to list Dropbox root: ${rootErr instanceof Error ? rootErr.message : 'unknown error'}`
    );
  }
}
