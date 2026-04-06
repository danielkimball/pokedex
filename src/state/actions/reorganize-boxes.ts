/**
 * Reorganize (sort) all PC box Pokemon in a save file.
 * Collects every Pokemon across all 18 boxes, sorts them by the chosen
 * criteria, and writes them back sequentially starting from Box 1 Slot 1.
 * Party Pokemon are never touched.
 */

import { parseSaveFile } from '../../core/parser/save-file';
import { writeSaveFile, type SaveModification } from '../../core/writer/save-writer';
import type { GameVersion } from '../../core/parser/save-detector';
import { getSave, getSaveRawData, refreshSaveAfterModification } from '../../db/save-store';
import { createBackup } from '../../db/backup-store';
import { SPECIES } from '../../core/constants/species';
import { useAppStore } from '../store';
import type { Pokemon } from '../../core/parser/pokemon-parser';

export type BoxSortCriteria = 'name' | 'number' | 'level';

const BOXES_TOTAL = 18;
const SLOTS_PER_BOX = 30;

/**
 * Sort all PC box Pokemon in a save file and write them back sequentially.
 *
 * @param saveId - Database ID of the save record
 * @param sortBy - Sorting criteria: 'name' (alphabetical), 'number' (Pokedex #), or 'level' (highest first)
 */
export async function reorganizeBoxes(saveId: string, sortBy: BoxSortCriteria): Promise<void> {
  // 1. Get save record and raw data
  const save = await getSave(saveId);
  if (!save) throw new Error('Save not found');
  const rawData = await getSaveRawData(saveId);
  if (!rawData) throw new Error('Save data not found');

  // 2. Auto-backup before modification
  await createBackup(saveId, rawData, 'box-sort', save.trainerName, save.gameVersion);

  // 3. Parse the save file
  const version = save.gameVersion as GameVersion;
  const parsed = parseSaveFile(rawData);

  // 3. Collect ALL box Pokemon across all 18 boxes (skip party)
  interface BoxPokemonEntry {
    pokemon: Pokemon;
    boxIndex: number;
    slotIndex: number;
  }

  const allBoxPokemon: BoxPokemonEntry[] = [];

  for (let boxIdx = 0; boxIdx < parsed.boxes.length; boxIdx++) {
    const box = parsed.boxes[boxIdx];
    for (let slotIdx = 0; slotIdx < box.pokemon.length; slotIdx++) {
      const p = box.pokemon[slotIdx];
      if (p) {
        allBoxPokemon.push({ pokemon: p, boxIndex: boxIdx, slotIndex: slotIdx });
      }
    }
  }

  // Nothing to sort
  if (allBoxPokemon.length === 0) return;

  // 4. Sort by the chosen criteria
  const sorted = [...allBoxPokemon];
  sorted.sort((a, b) => {
    switch (sortBy) {
      case 'name': {
        const nameA = (SPECIES[a.pokemon.species] ?? '').toLowerCase();
        const nameB = (SPECIES[b.pokemon.species] ?? '').toLowerCase();
        const cmp = nameA.localeCompare(nameB);
        if (cmp !== 0) return cmp;
        // Tiebreaker: species number
        return a.pokemon.species - b.pokemon.species;
      }
      case 'number':
        return a.pokemon.species - b.pokemon.species;
      case 'level': {
        const levelA = a.pokemon.battleStats?.level ?? a.pokemon.metLevel;
        const levelB = b.pokemon.battleStats?.level ?? b.pokemon.metLevel;
        // Descending by level
        if (levelB !== levelA) return levelB - levelA;
        // Tiebreaker: ascending by species number
        return a.pokemon.species - b.pokemon.species;
      }
      default:
        return 0;
    }
  });

  // 5. Generate SaveModification[]
  const mods: SaveModification[] = [];

  // First, clear every currently occupied slot
  for (const entry of allBoxPokemon) {
    mods.push({
      type: 'clear_box',
      containerIndex: entry.boxIndex,
      slotIndex: entry.slotIndex,
    });
  }

  // Then, place sorted Pokemon sequentially: Box 0 slots 0-29, Box 1 slots 0-29, etc.
  for (let i = 0; i < sorted.length; i++) {
    const targetBox = Math.floor(i / SLOTS_PER_BOX);
    const targetSlot = i % SLOTS_PER_BOX;

    if (targetBox >= BOXES_TOTAL) {
      // Should not happen unless there are more than 540 Pokemon, but guard anyway
      break;
    }

    mods.push({
      type: 'set_box',
      pokemon: sorted[i].pokemon,
      containerIndex: targetBox,
      slotIndex: targetSlot,
    });
  }

  // 6. Write the modified save file (no partyCount needed since party is untouched)
  const newBuffer = writeSaveFile(rawData, version, mods);

  // 7. Refresh the save in the database
  await refreshSaveAfterModification(saveId, newBuffer);

  // 8. Update app state
  const store = useAppStore.getState();
  if (store.activeSaveId === saveId) {
    store.setActiveSave(saveId, parseSaveFile(newBuffer));
  }
  const { getAllSaves } = await import('../../db/save-store');
  store.setSaves(await getAllSaves());
}
