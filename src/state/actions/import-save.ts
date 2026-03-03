/**
 * Save file import action.
 * Reads a .sav file, parses it, persists to IndexedDB, and updates the registry.
 */

import { parseSaveFile, type PokemonLocation } from '../../core/parser/save-file';
import { getPokemonIdentity } from '../../core/diff/pokemon-identity';
import { diffSnapshots } from '../../core/diff/diff-engine';
import { addSave } from '../../db/save-store';
import { addPokemonBatch, deletePokemonBySave } from '../../db/pokemon-store';
import { updateRegistryFromSave } from '../../db/registry-store';
import { addSnapshot, getLatestSnapshot } from '../../db/snapshot-store';
import type { SaveRecord, PokemonRecord, SnapshotRecord } from '../../db/schema';
import type { DiffResult } from '../../core/diff/diff-types';
import { useAppStore } from '../store';

function generateId(): string {
  return crypto.randomUUID();
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
    // Parse
    const parsed = parseSaveFile(buffer);

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

    // Refresh saves list
    const { getAllSaves } = await import('../../db/save-store');
    const allSaves = await getAllSaves();
    store.setSaves(allSaves);

    return diffResult;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to import save file';
    store.setImportError(message);
    throw err;
  } finally {
    store.setImporting(false);
  }
}
