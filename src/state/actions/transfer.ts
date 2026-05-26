/**
 * Transfer Pokemon between a save file and Home storage.
 * Works for all supported generations (Gen 4: DP, Pt, HGSS).
 */

import { parseSaveFile, type ParsedSave } from '../../core/parser/save-file';
import { writeSaveFile, type SaveModification } from '../../core/writer/save-writer';
import type { GameVersion } from '../../core/parser/save-detector';
import { recordToPokemon } from '../../core/converter/record-to-pokemon';
import { getSave, getSaveRawData, refreshSaveAfterModification } from '../../db/save-store';
import { createBackup } from '../../db/backup-store';
import { getPokemonById, deletePokemon } from '../../db/pokemon-store';
import { addToHome, removeFromHome, getHomePokemon } from '../../db/home-store';
import type { PokemonRecord, HomePokemonRecord } from '../../db/schema';
import { useAppStore } from '../store';

function generateId(): string {
  return crypto.randomUUID();
}

/** Build a HomePokemonRecord from a PokemonRecord and source info. */
function toHomeRecord(
  record: PokemonRecord,
  sourceSaveId: string,
  sourceGameVersion: string,
): HomePokemonRecord {
  return {
    id: generateId(),
    identityKey: record.identityKey,
    species: record.species,
    nickname: record.nickname,
    level: record.level,
    pid: record.pid,
    otId: record.otId,
    otSid: record.otSid,
    otName: record.otName,
    isShiny: record.isShiny,
    isEgg: record.isEgg,
    nature: record.nature,
    ability: record.ability,
    heldItem: record.heldItem,
    moves: record.moves,
    ivs: record.ivs,
    evs: record.evs,
    originGame: record.originGame,
    game: record.game,
    generation: record.generation,
    sourceSaveId,
    sourceGameVersion,
    depositedAt: Date.now(),
  };
}

/** Find first empty slot in parsed save: party first, then boxes. */
function findFirstEmptySlot(parsed: ParsedSave): { location: 'party' | 'box'; containerIndex: number; slotIndex: number } {
  for (let i = 0; i < 6; i++) {
    if (!parsed.party.pokemon[i]) return { location: 'party', containerIndex: 0, slotIndex: i };
  }
  for (let boxIdx = 0; boxIdx < parsed.boxes.length; boxIdx++) {
    const box = parsed.boxes[boxIdx];
    for (let slot = 0; slot < box.pokemon.length; slot++) {
      if (!box.pokemon[slot]) return { location: 'box', containerIndex: boxIdx, slotIndex: slot };
    }
  }
  throw new Error('No empty slot in save (party and boxes are full)');
}

/**
 * Transfer a Pokemon from a save file into Home. Removes it from the save.
 */
export async function transferToHome(saveId: string, pokemonId: string): Promise<void> {
  const save = await getSave(saveId);
  if (!save) throw new Error('Save not found');
  const rawData = await getSaveRawData(saveId);
  if (!rawData) throw new Error('Save data not found');

  const pokemon = await getPokemonById(pokemonId);
  if (!pokemon || pokemon.saveId !== saveId) throw new Error('Pokemon not found in this save');

  // Auto-backup before modification
  await createBackup(saveId, rawData, 'transfer-to-home', save.trainerName, save.gameVersion);

  const version = save.gameVersion as GameVersion;
  const parsed = parseSaveFile(rawData);

  const homeRecord = toHomeRecord(pokemon, saveId, save.gameVersion);
  await addToHome(homeRecord);

  const mods: SaveModification[] = [];
  if (pokemon.location === 'party') {
    mods.push({ type: 'clear_party', containerIndex: 0, slotIndex: pokemon.slotIndex });
  } else {
    mods.push({ type: 'clear_box', containerIndex: pokemon.containerIndex, slotIndex: pokemon.slotIndex });
  }

  const currentPartyCount = parsed.party.pokemon.filter(Boolean).length;
  const newPartyCount = pokemon.location === 'party' ? currentPartyCount - 1 : currentPartyCount;
  const newBuffer = writeSaveFile(rawData, version, mods, {
    partyCount: mods.some(m => m.type === 'clear_party') ? newPartyCount : undefined,
  });

  await refreshSaveAfterModification(saveId, newBuffer);
  await deletePokemon(pokemonId);

  const store = useAppStore.getState();
  if (store.activeSaveId === saveId) {
    store.setActiveSave(saveId, parseSaveFile(newBuffer));
  }
  const { getAllSaves } = await import('../../db/save-store');
  store.setSaves(await getAllSaves());
}

/**
 * Transfer a Pokemon from Home into a save file. Places it in the first empty slot (party or box).
 */
export async function transferFromHome(homePokemonId: string, saveId: string): Promise<void> {
  const homeMon = await getHomePokemon(homePokemonId);
  if (!homeMon) throw new Error('Pokemon not found in Home');

  const save = await getSave(saveId);
  if (!save) throw new Error('Save not found');
  const rawData = await getSaveRawData(saveId);
  if (!rawData) throw new Error('Save data not found');

  // Auto-backup before modification
  await createBackup(saveId, rawData, 'transfer-from-home', save.trainerName, save.gameVersion);

  const parsed = parseSaveFile(rawData);
  const slot = findFirstEmptySlot(parsed);
  const version = save.gameVersion as GameVersion;
  const pokemon = recordToPokemon(homeMon, { includeBattleStats: slot.location === 'party' });

  const mods: SaveModification[] =
    slot.location === 'party'
      ? [{ type: 'set_party', pokemon, containerIndex: 0, slotIndex: slot.slotIndex }]
      : [{ type: 'set_box', pokemon, containerIndex: slot.containerIndex, slotIndex: slot.slotIndex }];

  const newPartyCount =
    slot.location === 'party'
      ? parsed.party.pokemon.filter(Boolean).length + 1
      : parsed.party.pokemon.filter(Boolean).length;
  const newBuffer = writeSaveFile(rawData, version, mods, {
    partyCount: slot.location === 'party' ? newPartyCount : undefined,
  });

  await refreshSaveAfterModification(saveId, newBuffer);
  await removeFromHome(homePokemonId);

  const store = useAppStore.getState();
  if (store.activeSaveId === saveId) {
    store.setActiveSave(saveId, parseSaveFile(newBuffer));
  }
  const { getAllSaves } = await import('../../db/save-store');
  store.setSaves(await getAllSaves());
}
