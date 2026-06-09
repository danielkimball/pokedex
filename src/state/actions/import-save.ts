/**
 * Save file import action.
 * Reads a .sav file, parses it, persists to IndexedDB, and updates the registry.
 *
 * Gen 4 (DP/Pt/HGSS) uses the original dedicated pipeline. Gen 1/2/3 saves are
 * parsed into a generation-agnostic `UniversalSave` and persisted into the same
 * stores so every screen treats them uniformly.
 */

import { parseSaveFile, type PokemonLocation } from '../../core/parser/save-file';
import { detectSpecificGame } from '../../core/parser/save-detector';
import { detectGeneration, parseLegacySave } from '../../core/parser/detect-any';
import type { UniversalSave } from '../../core/parser/universal';
import { getPokemonIdentity } from '../../core/diff/pokemon-identity';
import { diffSnapshots } from '../../core/diff/diff-engine';
import { addSave, getAllSaves } from '../../db/save-store';
import { addPokemonBatch, deletePokemonBySave } from '../../db/pokemon-store';
import { updateRegistryFromSave, getAllRegistryEntries } from '../../db/registry-store';
import { addSnapshot, getLatestSnapshot } from '../../db/snapshot-store';
import type { SaveRecord, PokemonRecord, SnapshotRecord } from '../../db/schema';
import type { DiffResult } from '../../core/diff/diff-types';
import { useAppStore } from '../store';

function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Push freshly-persisted save + registry data into the in-memory store so every
 * screen reflects the import immediately. Without this, the Zustand `registryMap`
 * stays stale after a Dropbox/Drive/file re-import and the app appears unchanged
 * until a full reload — the "I have to completely exit the app" bug.
 */
async function refreshStoreAfterImport(): Promise<void> {
  const store = useAppStore.getState();
  const [saves, entries] = await Promise.all([getAllSaves(), getAllRegistryEntries()]);
  store.setSaves(saves);
  store.setRegistry(entries);
}

/**
 * Import a save file from a File object.
 */
export async function importSaveFile(file: File): Promise<DiffResult | null> {
  const buffer = await file.arrayBuffer();
  return importSaveBuffer(buffer, file.name);
}

/**
 * Import a save from a raw ArrayBuffer + filename.
 * Core import logic shared by manual file import and directory sync.
 */
export async function importSaveBuffer(buffer: ArrayBuffer, filename: string): Promise<DiffResult | null> {
  const store = useAppStore.getState();
  store.setImporting(true);
  store.setImportError(null);

  try {
    const generation = detectGeneration(new Uint8Array(buffer));

    // Gen 1/2/3 take the universal path.
    if (generation === 1 || generation === 2 || generation === 3) {
      const universal = parseLegacySave(buffer, filename);
      if (!universal) throw new Error('Failed to parse save file.');
      await persistLegacySave(universal, filename, buffer);
      return null;
    }

    // Gen 4 path.
    const parsed = parseSaveFile(buffer);

    // Resolve the specific game (HeartGold vs SoulSilver, etc.) so the UI can
    // show "SoulSilver" instead of the family code "HGSS".
    const specificGame = detectSpecificGame(
      parsed.version,
      parsed.trainer.trainerId,
      parsed.trainer.secretId,
      parsed.allPokemon.map(l => ({
        originGame: l.pokemon.originGame,
        otId: l.pokemon.otId,
        otSid: l.pokemon.otSid,
      })),
    );

    // Check if we've imported this save before (same trainer ID)
    const existingSaves = store.saves;
    const existingSave = existingSaves.find(
      s => s.trainerId === parsed.trainer.trainerId &&
           s.secretId === parsed.trainer.secretId &&
           s.gameVersion === parsed.version,
    );

    const saveId = existingSave?.id ?? generateId();

    // If re-importing, clear old pokemon records
    if (existingSave) {
      await deletePokemonBySave(saveId);
    }

    // Create save record
    const saveRecord: SaveRecord = {
      id: saveId,
      filename,
      gameVersion: parsed.version,
      game: specificGame,
      generation: 4,
      trainerName: parsed.trainer.name,
      trainerId: parsed.trainer.trainerId,
      secretId: parsed.trainer.secretId,
      importDate: Date.now(),
      totalPokemon: parsed.totalPokemon,
      uniqueSpecies: parsed.uniqueSpecies.size,
      rawData: buffer,
    };

    // Convert parsed Pokemon to records
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
        game: specificGame,
        generation: 4,
      };
    });

    // Diff with previous snapshot
    let diffResult: DiffResult | null = null;
    if (existingSave) {
      const prevSnapshot = await getLatestSnapshot(saveId);
      if (prevSnapshot) {
        // Convert previous snapshot pokemon records to PokemonLocation format for diffing
        const prevLocations: PokemonLocation[] = prevSnapshot.pokemonData.map(pr => ({
          pokemon: {
            pid: pr.pid,
            otId: pr.otId,
            otSid: pr.otSid,
            otIdPublic: pr.otId & 0xFFFF,
            species: pr.species,
            nickname: pr.nickname,
            isShiny: pr.isShiny,
            isEgg: pr.isEgg,
            nature: pr.nature,
            ability: pr.ability,
            heldItem: pr.heldItem,
            battleStats: pr.level ? { level: pr.level, status: 0, capsule: 0, currentHp: 0, maxHp: 0, atk: 0, def: 0, spe: 0, spa: 0, spd: 0 } : undefined,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
          location: pr.location,
          containerIndex: pr.containerIndex,
          slotIndex: pr.slotIndex,
        }));

        diffResult = diffSnapshots(
          prevLocations,
          parsed.allPokemon,
          parsed.trainer.trainerId,
          parsed.trainer.secretId,
        );
      }
    }

    // Persist
    await addSave(saveRecord);
    await addPokemonBatch(pokemonRecords);

    // Update registry
    const registryEntries = parsed.allPokemon.map(loc => ({
      species: loc.pokemon.species,
      location: loc.location === 'party'
        ? `Party slot ${loc.slotIndex + 1}`
        : `Box ${loc.containerIndex + 1}`,
    }));
    await updateRegistryFromSave(registryEntries, saveId);

    // Save snapshot for future diffs
    const snapshot: SnapshotRecord = {
      id: generateId(),
      saveId,
      timestamp: Date.now(),
      pokemonKeys: pokemonRecords.map(p => p.identityKey),
      pokemonData: pokemonRecords,
    };
    await addSnapshot(snapshot);

    // Update app state
    store.setActiveSave(saveId, parsed);
    if (diffResult) {
      store.setLastDiffResult(diffResult);
    }

    // Refresh saves list + registry so the UI updates without an app restart.
    await refreshStoreAfterImport();

    return diffResult;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to import save file';
    store.setImportError(message);
    throw err;
  } finally {
    store.setImporting(false);
  }
}

/**
 * Persist a Gen 1/2/3 save (parsed into the universal shape). Read-only: no
 * diffing or writer support, but records flow into the same stores + registry
 * as Gen 4 so the Pokedex, PC and dex-entry screens render them identically.
 */
async function persistLegacySave(
  save: UniversalSave,
  filename: string,
  buffer: ArrayBuffer,
): Promise<void> {
  const store = useAppStore.getState();

  const existingSave = store.saves.find(
    s => s.trainerId === save.trainer.trainerId &&
         s.secretId === save.trainer.secretId &&
         s.game === save.game,
  );
  const saveId = existingSave?.id ?? generateId();
  if (existingSave) await deletePokemonBySave(saveId);

  const uniqueSpecies = new Set(save.mons.map(m => m.species));

  const saveRecord: SaveRecord = {
    id: saveId,
    filename,
    gameVersion: save.family,
    game: save.game,
    generation: save.generation,
    trainerName: save.trainer.name,
    trainerId: save.trainer.trainerId,
    secretId: save.trainer.secretId,
    importDate: Date.now(),
    totalPokemon: save.mons.length,
    uniqueSpecies: uniqueSpecies.size,
    rawData: buffer,
  };

  const pokemonRecords: PokemonRecord[] = save.mons.map(m => ({
    id: generateId(),
    saveId,
    identityKey: `${m.pid}-${m.otId}-${m.species}`,
    species: m.species,
    nickname: m.nickname,
    level: m.level,
    pid: m.pid,
    otId: m.otId,
    otSid: m.otSid,
    otName: m.otName,
    isShiny: m.isShiny,
    isEgg: m.isEgg,
    location: m.location,
    containerIndex: m.containerIndex,
    slotIndex: m.slotIndex,
    nature: m.nature,
    ability: m.ability,
    heldItem: m.heldItem,
    moves: m.moves,
    ivs: m.ivs,
    evs: m.evs,
    originGame: m.originGame,
    game: save.game,
    generation: save.generation,
  }));

  await addSave(saveRecord);
  await addPokemonBatch(pokemonRecords);

  await updateRegistryFromSave(
    save.mons.map(m => ({
      species: m.species,
      location: m.location === 'party'
        ? `Party slot ${m.slotIndex + 1}`
        : `Box ${m.containerIndex + 1}`,
    })),
    saveId,
  );

  const snapshot: SnapshotRecord = {
    id: generateId(),
    saveId,
    timestamp: Date.now(),
    pokemonKeys: pokemonRecords.map(p => p.identityKey),
    pokemonData: pokemonRecords,
  };
  await addSnapshot(snapshot);

  store.setActiveSave(saveId, null);
  await refreshStoreAfterImport();
}
