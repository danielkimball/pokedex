/**
 * Google Drive integration for Pokemon Home storage sync.
 * Uses Google Identity Services (GIS) for OAuth2 and Drive REST API via fetch.
 */

// Configuration
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const HOME_FILE_NAME = 'pokemon-home.phome';
const HOME_MIME_TYPE = 'application/json';

// State
let accessToken: string | null = null;
let tokenClient: google.accounts.oauth2.TokenClient | null = null;

// Get/set client ID from localStorage
export function getGoogleClientId(): string | null {
  return localStorage.getItem('pokedex-google-client-id');
}

export function setGoogleClientId(clientId: string): void {
  localStorage.setItem('pokedex-google-client-id', clientId);
}

export function clearGoogleClientId(): void {
  localStorage.removeItem('pokedex-google-client-id');
  accessToken = null;
  tokenClient = null;
}

// Initialize the GIS token client
export function initTokenClient(clientId: string): void {
  // The google.accounts.oauth2 global is loaded from the GIS script
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: SCOPES,
    callback: (response) => {
      if (response.access_token) {
        accessToken = response.access_token;
      }
    },
  });
}

// Check if we have a valid token
export function isSignedIn(): boolean {
  return accessToken !== null;
}

// Request access token (triggers popup)
export function requestAccessToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Token client not initialized. Set a Google Client ID first.'));
      return;
    }
    // Override callback for this specific request
    tokenClient.callback = (response) => {
      if (response.error) {
        reject(new Error(response.error));
        return;
      }
      accessToken = response.access_token;
      resolve(response.access_token);
    };
    tokenClient.requestAccessToken();
  });
}

// Revoke token
export function revokeToken(): void {
  if (accessToken) {
    google.accounts.oauth2.revoke(accessToken, () => {});
    accessToken = null;
  }
}

// Drive API helpers using fetch
async function driveRequest(url: string, options?: RequestInit): Promise<Response> {
  if (!accessToken) throw new Error('Not signed in to Google');
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...options?.headers,
    },
  });
  if (response.status === 401) {
    accessToken = null;
    throw new Error('Google token expired. Please sign in again.');
  }
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google Drive API error: ${response.status} ${text}`);
  }
  return response;
}

// Find existing .phome files on Drive
export async function findHomeFiles(): Promise<{ id: string; name: string; modifiedTime: string }[]> {
  const query = encodeURIComponent(`name='${HOME_FILE_NAME}' and trashed=false`);
  const response = await driveRequest(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime)&spaces=drive`
  );
  const data = await response.json();
  return data.files || [];
}

// Read a file's contents
export async function readDriveFile(fileId: string): Promise<ArrayBuffer> {
  const response = await driveRequest(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`
  );
  return response.arrayBuffer();
}

// Create a new file on Drive
export async function createDriveFile(content: Uint8Array): Promise<string> {
  const metadata = {
    name: HOME_FILE_NAME,
    mimeType: HOME_MIME_TYPE,
  };

  // Use multipart upload
  const boundary = 'pokedex_boundary_' + Date.now();
  const body = buildMultipartBody(boundary, metadata, content);

  const response = await driveRequest(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
    {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );
  const data = await response.json();
  return data.id;
}

// Update an existing file on Drive
export async function updateDriveFile(fileId: string, content: Uint8Array): Promise<void> {
  const boundary = 'pokedex_boundary_' + Date.now();
  const metadata = { mimeType: HOME_MIME_TYPE };
  const body = buildMultipartBody(boundary, metadata, content);

  await driveRequest(
    `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );
}

// Helper to build multipart request body
function buildMultipartBody(boundary: string, metadata: object, content: Uint8Array): Blob {
  const metadataJson = JSON.stringify(metadata);
  const parts = [
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadataJson}\r\n`,
    `--${boundary}\r\nContent-Type: ${HOME_MIME_TYPE}\r\n\r\n`,
  ];

  return new Blob([
    parts[0],
    parts[1],
    content as BlobPart,
    `\r\n--${boundary}--`,
  ]);
}

// Get stored Drive file ID
export function getLinkedDriveFileId(): string | null {
  return localStorage.getItem('pokedex-drive-file-id');
}

export function setLinkedDriveFileId(fileId: string): void {
  localStorage.setItem('pokedex-drive-file-id', fileId);
}

export function clearLinkedDriveFileId(): void {
  localStorage.removeItem('pokedex-drive-file-id');
}

