/**
 * IndexedDB schema for the Pokedex app.
 *
 * Stores:
 * - saves: Imported save file metadata + raw data
 * - pokemon: Individual Pokemon records with location info
 * - registry: Pokedex completion tracking (one entry per species)
 * - snapshots: Save state snapshots for diff comparisons
 */

import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

export interface SaveRecord {
  id: string; // UUID
  filename: string;
  gameVersion: string; // legacy family code (e.g. HGSS); kept for back-compat
  /** Specific game this save is from (e.g. "SoulSilver", "Silver"). */
  game?: string;
  /** Generation 1-4. Absent on records imported before multi-gen support. */
  generation?: number;
  trainerName: string;
  trainerId: number;
  secretId: number;
  /**
   * Gym badge bitfield when known.
   * Gen 1 (R/B/Y): bit 0 = Boulder … bit 7 = Earth.
   * Gen 4: from trainer block (Johto/Kanto badges packed).
   */
  badges?: number;
  importDate: number; // timestamp
  totalPokemon: number;
  uniqueSpecies: number;
  rawData: ArrayBuffer; // original .sav file
}

export interface PokemonRecord {
  id: string; // UUID
  saveId: string;
  identityKey: string; // pid-otId-otSid
  species: number;
  nickname: string;
  level: number;
  pid: number;
  otId: number;
  otSid: number;
  otName: string;
  isShiny: boolean;
  isEgg: boolean;
  location: 'party' | 'box';
  containerIndex: number;
  slotIndex: number;
  nature: number;
  ability: number;
  heldItem: number;
  moves: [number, number, number, number];
  ivs: { hp: number; atk: number; def: number; spe: number; spa: number; spd: number };
  evs: { hp: number; atk: number; def: number; spe: number; spa: number; spd: number };
  originGame?: number;
  /** Specific game this Pokemon's save is from (drives the card's sprite + label). */
  game?: string;
  /** Generation 1-4 of the source save. */
  generation?: number;
}

export interface RegistryEntry {
  species: number; // primary key
  caught: boolean;
  firstCaughtDate: number | null;
  lastSeenSaveId: string | null;
  locations: { saveId: string; location: string }[];
}

export interface SnapshotRecord {
  id: string; // UUID
  saveId: string;
  timestamp: number;
  pokemonKeys: string[]; // identity keys present in this snapshot
  pokemonData: PokemonRecord[]; // full pokemon data for diffing
}

export interface DirectoryRecord {
  id: 'watched-dir';
  handle: FileSystemDirectoryHandle;
  lastScanTime: number;
}

/** Pokemon deposited in "Home" storage — generation-agnostic dumping ground for transfer between games. */
export interface HomePokemonRecord {
  id: string;
  identityKey: string;
  species: number;
  nickname: string;
  level: number;
  pid: number;
  otId: number;
  otSid: number;
  otName: string;
  isShiny: boolean;
  isEgg: boolean;
  nature: number;
  ability: number;
  heldItem: number;
  moves: [number, number, number, number];
  ivs: { hp: number; atk: number; def: number; spe: number; spa: number; spd: number };
  evs: { hp: number; atk: number; def: number; spe: number; spa: number; spd: number };
  originGame?: number;
  /** Specific source game (e.g. "SoulSilver") — drives the card sprite. */
  game?: string;
  /** Generation 1-4 of the source save. */
  generation?: number;
  /** Save id this was transferred from */
  sourceSaveId: string;
  /** Game version of source (e.g. DP, Pt, HGSS) — supports future generations */
  sourceGameVersion: string;
  /** When deposited */
  depositedAt: number;
}

export interface BackupRecord {
  id: string; // UUID
  saveId: string;
  timestamp: number;
  reason: string; // e.g. "box-sort", "transfer-to-home", "transfer-from-home", "manual"
  trainerName: string;
  gameVersion: string;
  rawData: ArrayBuffer;
}

export interface PokedexDB extends DBSchema {
  saves: {
    key: string;
    value: SaveRecord;
    indexes: {
      'by-date': number;
      'by-trainer': string;
    };
  };
  pokemon: {
    key: string;
    value: PokemonRecord;
    indexes: {
      'by-save': string;
      'by-species': number;
      'by-identity': string;
    };
  };
  registry: {
    key: number;
    value: RegistryEntry;
  };
  snapshots: {
    key: string;
    value: SnapshotRecord;
    indexes: {
      'by-save': string;
      'by-date': number;
    };
  };
  directories: {
    key: string;
    value: DirectoryRecord;
  };
  home: {
    key: string;
    value: HomePokemonRecord;
    indexes: {
      'by-species': number;
      'by-source-save': string;
      'by-deposited': number;
    };
  };
  backups: {
    key: string;
    value: BackupRecord;
    indexes: {
      'by-save': string;
      'by-date': number;
    };
  };
}

const DB_NAME = 'pokedex-db';
const DB_VERSION = 4;

let dbPromise: Promise<IDBPDatabase<PokedexDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<PokedexDB>> {
  if (!dbPromise) {
    dbPromise = openDB<PokedexDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          // Saves store
          const saveStore = db.createObjectStore('saves', { keyPath: 'id' });
          saveStore.createIndex('by-date', 'importDate');
          saveStore.createIndex('by-trainer', 'trainerName');

          // Pokemon store
          const pokemonStore = db.createObjectStore('pokemon', { keyPath: 'id' });
          pokemonStore.createIndex('by-save', 'saveId');
          pokemonStore.createIndex('by-species', 'species');
          pokemonStore.createIndex('by-identity', 'identityKey');

          // Registry store (one entry per species)
          db.createObjectStore('registry', { keyPath: 'species' });

          // Snapshots store
          const snapshotStore = db.createObjectStore('snapshots', { keyPath: 'id' });
          snapshotStore.createIndex('by-save', 'saveId');
          snapshotStore.createIndex('by-date', 'timestamp');
        }

        if (oldVersion < 2) {
          // Directories store for persisting FileSystemDirectoryHandle
          db.createObjectStore('directories', { keyPath: 'id' });
        }

        if (oldVersion < 3) {
          const homeStore = db.createObjectStore('home', { keyPath: 'id' });
          homeStore.createIndex('by-species', 'species');
          homeStore.createIndex('by-source-save', 'sourceSaveId');
          homeStore.createIndex('by-deposited', 'depositedAt');
        }

        if (oldVersion < 4) {
          const backupStore = db.createObjectStore('backups', { keyPath: 'id' });
          backupStore.createIndex('by-save', 'saveId');
          backupStore.createIndex('by-date', 'timestamp');
        }
      },
    });
  }
  return dbPromise;
}
