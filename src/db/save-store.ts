/**
 * Save file persistence operations.
 */

import { getDB, type SaveRecord, type PokemonRecord, type SnapshotRecord } from './schema';
import { parseSaveFile } from '../core/parser/save-file';
import { getPokemonIdentity } from '../core/diff/pokemon-identity';
import { addPokemonBatch, deletePokemonBySave } from './pokemon-store';
import { addSnapshot } from './snapshot-store';
import { updateRegistryFromSave } from './registry-store';

function generateId(): string {
  return crypto.randomUUID();
}

export async function addSave(save: SaveRecord): Promise<void> {
  const db = await getDB();
  await db.put('saves', save);
}

export async function getSave(id: string): Promise<SaveRecord | undefined> {
  const db = await getDB();
  return db.get('saves', id);
}

export async function getAllSaves(): Promise<SaveRecord[]> {
  const db = await getDB();
  return db.getAllFromIndex('saves', 'by-date');
}

export async function deleteSave(id: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['saves', 'pokemon', 'snapshots'], 'readwrite');
  await tx.objectStore('saves').delete(id);

  // Delete associated Pokemon records
  const pokemonIndex = tx.objectStore('pokemon').index('by-save');
  let cursor = await pokemonIndex.openCursor(id);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }

  // Delete associated snapshots
  const snapshotIndex = tx.objectStore('snapshots').index('by-save');
  let snapCursor = await snapshotIndex.openCursor(id);
  while (snapCursor) {
    await snapCursor.delete();
    snapCursor = await snapCursor.continue();
  }

  await tx.done;
}

export async function getSaveRawData(id: string): Promise<ArrayBuffer | undefined> {
  const save = await getSave(id);
  return save?.rawData;
}

/** Replace a save's raw data (e.g. after transferring a Pokemon to/from Home). */
export async function updateSaveRawData(id: string, rawData: ArrayBuffer): Promise<void> {
  const save = await getSave(id);
  if (!save) return;
  await addSave({ ...save, rawData });
}

/**
 * Re-parse a save's raw data and sync DB: update save record counts, replace Pokemon records and snapshot.
 * Call after modifying the save file (e.g. transfer to Home cleared a slot).
 */
export async function refreshSaveAfterModification(saveId: string, newRawData: ArrayBuffer): Promise<void> {
  const save = await getSave(saveId);
  if (!save) return;

  const parsed = parseSaveFile(newRawData);
  const pokemonRecords: PokemonRecord[] = parsed.allPokemon.map(loc => {
    const p = loc.pokemon;
    const identity = getPokemonIdentity(p);
    return {
      id: generateId(),
      saveId,
      identityKey: identity.key,
      species: p.species,
      nickname: p.nickname,
      level: p.battleStats?.level ?? p.metLevel,
      pid: p.pid,
      otId: p.otId,
      otSid: p.otSid,
      otName: p.otName,
      isShiny: p.isShiny,
      isEgg: p.isEgg,
      location: loc.location,
      containerIndex: loc.containerIndex,
      slotIndex: loc.slotIndex,
      nature: p.nature,
      ability: p.ability,
      heldItem: p.heldItem,
      moves: [p.move1, p.move2, p.move3, p.move4],
      ivs: { hp: p.ivHp, atk: p.ivAtk, def: p.ivDef, spe: p.ivSpe, spa: p.ivSpa, spd: p.ivSpd },
      evs: { hp: p.evHp, atk: p.evAtk, def: p.evDef, spe: p.evSpe, spa: p.evSpa, spd: p.evSpd },
      originGame: p.originGame,
    };
  });

  await addSave({
    ...save,
    rawData: newRawData,
    totalPokemon: parsed.totalPokemon,
    uniqueSpecies: parsed.uniqueSpecies.size,
  });
  await deletePokemonBySave(saveId);
  await addPokemonBatch(pokemonRecords);

  const registryEntries = parsed.allPokemon.map(loc => ({
    species: loc.pokemon.species,
    location: loc.location === 'party'
      ? `Party slot ${loc.slotIndex + 1}`
      : loc.location === 'daycare'
        ? `Day Care slot ${loc.slotIndex + 1}`
        : `Box ${loc.containerIndex + 1}`,
  }));
  await updateRegistryFromSave(registryEntries, saveId);

  const snapshot: SnapshotRecord = {
    id: generateId(),
    saveId,
    timestamp: Date.now(),
    pokemonKeys: pokemonRecords.map(p => p.identityKey),
    pokemonData: pokemonRecords,
  };
  await addSnapshot(snapshot);
}
