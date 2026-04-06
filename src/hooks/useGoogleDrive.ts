import { useState, useCallback } from 'react';
import { getAllHomePokemon, importHomeFromFile } from '../db/home-store';
import { buildHomeFile, serializeHomeFile } from '../db/home-file';
import {
  getGoogleClientId,
  setGoogleClientId as storeClientId,
  clearGoogleClientId,
  initTokenClient,
  isSignedIn,
  requestAccessToken,
  revokeToken,
  findHomeFiles,
  readDriveFile,
  createDriveFile,
  updateDriveFile,
  getLinkedDriveFileId,
  setLinkedDriveFileId,
  clearLinkedDriveFileId,
} from '../services/google-drive';

export interface GoogleDriveState {
  clientId: string | null;
  connected: boolean;
  linkedFileId: string | null;
  syncing: boolean;
  lastSyncTime: number | null;
  error: string | null;
}

export function useGoogleDrive() {
  const [state, setState] = useState<GoogleDriveState>({
    clientId: getGoogleClientId(),
    connected: false,
    linkedFileId: getLinkedDriveFileId(),
    syncing: false,
    lastSyncTime: null,
    error: null,
  });

  // Check if GIS script is loaded
  const gisLoaded = typeof google !== 'undefined' && !!google.accounts?.oauth2;

  // Set client ID
  const setClientId = useCallback((clientId: string) => {
    storeClientId(clientId);
    initTokenClient(clientId);
    setState(s => ({ ...s, clientId, error: null }));
  }, []);

  // Connect (sign in)
  const connect = useCallback(async () => {
    setState(s => ({ ...s, error: null, syncing: true }));
    try {
      if (!state.clientId) throw new Error('No Google Client ID configured');
      if (!gisLoaded) throw new Error('Google Identity Services not loaded');

      initTokenClient(state.clientId);
      await requestAccessToken();

      // Find or create home file
      const files = await findHomeFiles();
      let fileId: string;

      if (files.length > 0) {
        fileId = files[0].id;
      } else {
        // Create a new empty home file
        const pokemon = await getAllHomePokemon();
        const homeFile = buildHomeFile(pokemon);
        const bytes = serializeHomeFile(homeFile);
        fileId = await createDriveFile(bytes);
      }

      setLinkedDriveFileId(fileId);
      setState(s => ({ ...s, connected: true, linkedFileId: fileId, syncing: false }));
    } catch (err) {
      setState(s => ({
        ...s,
        syncing: false,
        error: err instanceof Error ? err.message : 'Connection failed',
      }));
    }
  }, [state.clientId, gisLoaded]);

  // Disconnect
  const disconnect = useCallback(() => {
    revokeToken();
    clearLinkedDriveFileId();
    setState(s => ({
      ...s,
      connected: false,
      linkedFileId: null,
      lastSyncTime: null,
      error: null,
    }));
  }, []);

  // Remove client ID entirely
  const removeClientId = useCallback(() => {
    revokeToken();
    clearGoogleClientId();
    clearLinkedDriveFileId();
    setState({
      clientId: null,
      connected: false,
      linkedFileId: null,
      syncing: false,
      lastSyncTime: null,
      error: null,
    });
  }, []);

  // Pull from Drive (download and import)
  const pullFromDrive = useCallback(async () => {
    if (!state.linkedFileId) return;
    setState(s => ({ ...s, syncing: true, error: null }));
    try {
      if (!isSignedIn()) await requestAccessToken();
      const buffer = await readDriveFile(state.linkedFileId);
      await importHomeFromFile(buffer);
      setState(s => ({ ...s, syncing: false, lastSyncTime: Date.now() }));
    } catch (err) {
      setState(s => ({
        ...s,
        syncing: false,
        error: err instanceof Error ? err.message : 'Pull failed',
      }));
    }
  }, [state.linkedFileId]);

  // Push to Drive (export and upload)
  const pushToDrive = useCallback(async () => {
    setState(s => ({ ...s, syncing: true, error: null }));
    try {
      if (!isSignedIn()) await requestAccessToken();
      const pokemon = await getAllHomePokemon();
      const homeFile = buildHomeFile(pokemon);
      const bytes = serializeHomeFile(homeFile);

      if (state.linkedFileId) {
        await updateDriveFile(state.linkedFileId, bytes);
      } else {
        const fileId = await createDriveFile(bytes);
        setLinkedDriveFileId(fileId);
        setState(s => ({ ...s, linkedFileId: fileId }));
      }
      setState(s => ({ ...s, syncing: false, lastSyncTime: Date.now() }));
    } catch (err) {
      setState(s => ({
        ...s,
        syncing: false,
        error: err instanceof Error ? err.message : 'Push failed',
      }));
    }
  }, [state.linkedFileId]);

  return {
    ...state,
    gisLoaded,
    setClientId,
    connect,
    disconnect,
    removeClientId,
    pullFromDrive,
    pushToDrive,
  };
}
