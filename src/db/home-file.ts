/**
 * Pokemon Home storage file format.
 * A single portable file (e.g. .phome) you can save to Google Drive, USB, etc.
 * and load on any device to restore your Home storage.
 */

import type { HomePokemonRecord } from './schema';

/** Current format version for forwards compatibility. */
export const HOME_FILE_VERSION = 1;

/** Suggested file extension for Home storage files. */
export const HOME_FILE_EXT = '.phome';

export interface HomeStorageFile {
  /** Format version. */
  version: number;
  /** When this file was exported (timestamp). */
  exportedAt: number;
  /** All Pokemon in the Home storage at export time. */
  pokemon: HomePokemonRecord[];
}

/**
 * Parse a Home storage file from raw bytes.
 * @throws Error if invalid or unsupported version
 */
export function parseHomeFile(buffer: ArrayBuffer): HomeStorageFile {
  const text = new TextDecoder().decode(buffer);
  const data = JSON.parse(text) as unknown;
  if (!data || typeof data !== 'object' || !('version' in data) || !('pokemon' in data)) {
    throw new Error('Invalid Pokemon Home file: missing version or pokemon.');
  }
  const version = (data as { version: number }).version;
  if (version > HOME_FILE_VERSION) {
    throw new Error(`Unsupported Home file version: ${version}. This app supports up to ${HOME_FILE_VERSION}.`);
  }
  const exportedAt = typeof (data as { exportedAt?: number }).exportedAt === 'number'
    ? (data as { exportedAt: number }).exportedAt
    : Date.now();
  const pokemon = (data as { pokemon: unknown }).pokemon;
  if (!Array.isArray(pokemon)) {
    throw new Error('Invalid Pokemon Home file: pokemon is not an array.');
  }
  return { version, exportedAt, pokemon };
}

/**
 * Build a Home storage file from records (for export).
 */
export function buildHomeFile(pokemon: HomePokemonRecord[]): HomeStorageFile {
  return {
    version: HOME_FILE_VERSION,
    exportedAt: Date.now(),
    pokemon,
  };
}

/**
 * Serialize a Home storage file to UTF-8 bytes.
 */
export function serializeHomeFile(file: HomeStorageFile): Uint8Array {
  const json = JSON.stringify(file);
  return new TextEncoder().encode(json);
}
