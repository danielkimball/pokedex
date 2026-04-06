/**
 * Pokemon Home storage — dumping ground for Pokemon transferred from any save.
 * Generation-agnostic; supports transfer to/from any supported game.
 * Can be exported/imported as a single file (.phome) for backup or use on another device.
 */

import { getDB, type HomePokemonRecord } from './schema';
import {
  parseHomeFile,
  buildHomeFile,
  serializeHomeFile,
  HOME_FILE_EXT,
} from './home-file';

function generateId(): string {
  return crypto.randomUUID();
}

export async function addToHome(record: HomePokemonRecord): Promise<void> {
  const db = await getDB();
  await db.put('home', record);
}

export async function removeFromHome(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('home', id);
}

export async function getHomePokemon(id: string): Promise<HomePokemonRecord | undefined> {
  const db = await getDB();
  return db.get('home', id);
}

export async function getAllHomePokemon(): Promise<HomePokemonRecord[]> {
  const db = await getDB();
  return db.getAllFromIndex('home', 'by-deposited');
}

export async function getHomePokemonBySpecies(species: number): Promise<HomePokemonRecord[]> {
  const db = await getDB();
  return db.getAllFromIndex('home', 'by-species', species);
}

export async function getHomeCount(): Promise<number> {
  const db = await getDB();
  return db.count('home');
}

/**
 * Export the entire Home storage to a single file (Blob).
 * Save to Google Drive, USB, etc. — then use Import to restore.
 */
export async function exportHomeToFile(): Promise<{ blob: Blob; filename: string }> {
  const pokemon = await getAllHomePokemon();
  const file = buildHomeFile(pokemon);
  const bytes = serializeHomeFile(file);
  const blob = new Blob([bytes], { type: 'application/json' });
  const date = new Date().toISOString().slice(0, 10);
  const filename = `pokemon-home-${date}${HOME_FILE_EXT}`;
  return { blob, filename };
}

/**
 * Validate and normalize a record from a file into HomePokemonRecord.
 */
function normalizeHomeRecord(r: unknown): HomePokemonRecord | null {
  if (!r || typeof r !== 'object') return null;
  const o = r as Record<string, unknown>;
  if (
    typeof o.species !== 'number' ||
    typeof o.pid !== 'number' ||
    typeof o.otId !== 'number' ||
    typeof o.otSid !== 'number' ||
    !Array.isArray(o.moves) ||
    o.moves.length !== 4
  ) {
    return null;
  }
  const moves = o.moves as number[];
  const ivs = (o.ivs && typeof o.ivs === 'object') ? o.ivs as HomePokemonRecord['ivs'] : { hp: 0, atk: 0, def: 0, spe: 0, spa: 0, spd: 0 };
  const evs = (o.evs && typeof o.evs === 'object') ? o.evs as HomePokemonRecord['evs'] : { hp: 0, atk: 0, def: 0, spe: 0, spa: 0, spd: 0 };
  return {
    id: generateId(),
    identityKey: typeof o.identityKey === 'string' ? o.identityKey : `${o.pid}-${o.otId}-${o.otSid}`,
    species: o.species,
    nickname: typeof o.nickname === 'string' ? o.nickname : '',
    level: typeof o.level === 'number' ? o.level : 1,
    pid: o.pid,
    otId: o.otId,
    otSid: o.otSid,
    otName: typeof o.otName === 'string' ? o.otName : '',
    isShiny: o.isShiny === true,
    isEgg: o.isEgg === true,
    nature: typeof o.nature === 'number' ? o.nature : 0,
    ability: typeof o.ability === 'number' ? o.ability : 0,
    heldItem: typeof o.heldItem === 'number' ? o.heldItem : 0,
    moves: [moves[0] ?? 0, moves[1] ?? 0, moves[2] ?? 0, moves[3] ?? 0],
    ivs,
    evs,
    originGame: typeof o.originGame === 'number' ? o.originGame : undefined,
    sourceSaveId: typeof o.sourceSaveId === 'string' ? o.sourceSaveId : '',
    sourceGameVersion: typeof o.sourceGameVersion === 'string' ? o.sourceGameVersion : 'Unknown',
    depositedAt: typeof o.depositedAt === 'number' ? o.depositedAt : Date.now(),
  };
}

/**
 * Import a Home storage file (e.g. from Google Drive or backup).
 * Replaces current Home contents with the file's contents.
 * @returns Number of Pokemon imported
 */
export async function importHomeFromFile(buffer: ArrayBuffer): Promise<number> {
  const { pokemon: raw } = parseHomeFile(buffer);
  const db = await getDB();
  const tx = db.transaction('home', 'readwrite');
  await tx.store.clear();
  let count = 0;
  for (const r of raw) {
    const record = normalizeHomeRecord(r);
    if (!record) continue;
    await tx.store.put(record);
    count++;
  }
  await tx.done;
  return count;
}
