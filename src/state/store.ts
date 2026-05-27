/**
 * Global application state using Zustand.
 */

import { create } from 'zustand';
import type { SaveRecord, RegistryEntry } from '../db/schema';
import type { ParsedSave } from '../core/parser/save-file';
import type { DiffResult } from '../core/diff/diff-types';

export interface AppState {
  // Current active save
  activeSaveId: string | null;
  activeParsedSave: ParsedSave | null;

  // Save list
  saves: SaveRecord[];
  savesLoading: boolean;

  // Pokedex registry
  registryMap: Map<number, RegistryEntry>;
  caughtCount: number;

  // Import state
  importing: boolean;
  importError: string | null;
  lastDiffResult: DiffResult | null;

  // UI state
  searchQuery: string;
  activeFilter: DexFilter;
  dexSort: DexSort;
  dexShow: DexShow;
  dexVersion: DexVersion;
  dexGen: number | null;      // National Dex generation slice (1-4), null = all
  dexSaveId: string | null;   // focus on a single imported save, null = all

  // Directory sync state
  syncSupported: boolean;
  connectedDirectory: string | null;
  syncing: boolean;
  lastSyncTime: number | null;

  // Actions
  setActiveSave: (id: string | null, parsed: ParsedSave | null) => void;
  setSaves: (saves: SaveRecord[]) => void;
  setSavesLoading: (loading: boolean) => void;
  setRegistry: (entries: RegistryEntry[]) => void;
  setImporting: (importing: boolean) => void;
  setImportError: (error: string | null) => void;
  setLastDiffResult: (result: DiffResult | null) => void;
  setSearchQuery: (query: string) => void;
  setActiveFilter: (filter: DexFilter) => void;
  setDexSort: (sort: DexSort) => void;
  setDexShow: (show: DexShow) => void;
  setDexVersion: (version: DexVersion) => void;
  setDexGen: (gen: number | null) => void;
  setDexSaveId: (id: string | null) => void;
  setConnectedDirectory: (name: string | null) => void;
  setSyncing: (syncing: boolean) => void;
  setLastSyncTime: (time: number | null) => void;
}

export type DexVersion = 'all' | 'heartgold' | 'soulsilver' | 'diamond' | 'pearl' | 'platinum';

export type DexSort = 'number' | 'name' | 'level-desc' | 'level-asc';

export type DexShow = 'all' | 'caught' | 'uncaught';

export interface DexFilter {
  caughtOnly: boolean;
  uncaughtOnly: boolean;
  types: number[];
  generation: number | null;
}

const DEFAULT_FILTER: DexFilter = {
  caughtOnly: false,
  uncaughtOnly: false,
  types: [],
  generation: null,
};

export const useAppStore = create<AppState>((set) => ({
  activeSaveId: null,
  activeParsedSave: null,
  saves: [],
  savesLoading: true,
  registryMap: new Map(),
  caughtCount: 0,
  importing: false,
  importError: null,
  lastDiffResult: null,
  searchQuery: '',
  activeFilter: DEFAULT_FILTER,
  dexSort: 'number' as DexSort,
  dexShow: 'all' as DexShow,
  dexVersion: 'all' as DexVersion,
  dexGen: null,
  dexSaveId: null,
  syncSupported: typeof window !== 'undefined' && 'showDirectoryPicker' in window,
  connectedDirectory: null,
  syncing: false,
  lastSyncTime: null,

  setActiveSave: (id, parsed) => set({ activeSaveId: id, activeParsedSave: parsed }),
  setSaves: (saves) => set({ saves }),
  setSavesLoading: (savesLoading) => set({ savesLoading }),
  setRegistry: (entries) => {
    const registryMap = new Map(entries.map(e => [e.species, e]));
    const caughtCount = entries.filter(e => e.caught).length;
    set({ registryMap, caughtCount });
  },
  setImporting: (importing) => set({ importing }),
  setImportError: (importError) => set({ importError }),
  setLastDiffResult: (lastDiffResult) => set({ lastDiffResult }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setActiveFilter: (activeFilter) => set({ activeFilter }),
  setDexSort: (dexSort) => set({ dexSort }),
  setDexShow: (dexShow) => set({ dexShow }),
  setDexVersion: (dexVersion) => set({ dexVersion }),
  setDexGen: (dexGen) => set({ dexGen }),
  setDexSaveId: (dexSaveId) => set({ dexSaveId }),
  setConnectedDirectory: (connectedDirectory) => set({ connectedDirectory }),
  setSyncing: (syncing) => set({ syncing }),
  setLastSyncTime: (lastSyncTime) => set({ lastSyncTime }),
}));
