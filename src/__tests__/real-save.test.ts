import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { parseSaveFile, saveSummary } from '../core/parser/save-file';
import { SPECIES } from '../core/constants/species';

const SAVE_PATH = '/Users/dankimball/Desktop/Pokemon HeartGold Version.dsv';
const HAS_SAVE = existsSync(SAVE_PATH);

// Read lazily: describe.skipIf only skips the it() blocks, not the callback
// body, so the file read must be guarded to avoid throwing when it's absent.
const save = HAS_SAVE ? parseSaveFile(readFileSync(SAVE_PATH).buffer) : undefined;

describe.skipIf(!HAS_SAVE)('Real HGSS save file', () => {
  it('detects HGSS version', () => {
    expect(save!.version).toBe('HGSS');
  });

  it('reads trainer name', () => {
    expect(save!.trainer.name).toBe('DAN');
  });

  it('reads trainer ID', () => {
    expect(save!.trainer.trainerId).toBe(17004);
  });

  it('has party Pokemon', () => {
    const partyPokemon = save!.party.pokemon.filter(p => p !== null);
    expect(partyPokemon.length).toBeGreaterThan(0);
  });

  it('party contains known Pokemon', () => {
    const names = save!.party.pokemon
      .filter(p => p !== null)
      .map(p => SPECIES[p!.species]);
    console.log('Party:', names.join(', '));

    expect(names).toContain('Heracross');
    expect(names).toContain('Crobat');
    expect(names).toContain('Typhlosion');
  });

  it('party Pokemon have valid levels', () => {
    for (const p of save!.party.pokemon) {
      if (!p) continue;
      if (p.battleStats) {
        expect(p.battleStats.level).toBeGreaterThan(0);
        expect(p.battleStats.level).toBeLessThanOrEqual(100);
      }
    }
  });

  it('reads PC boxes', () => {
    expect(save!.boxes).toHaveLength(18);
  });

  it('finds Pokemon across party and PC', () => {
    expect(save!.totalPokemon).toBeGreaterThan(0);
    console.log(saveSummary(save!));
  });

  it('Pokemon have valid species numbers', () => {
    for (const loc of save!.allPokemon) {
      expect(loc.pokemon.species).toBeGreaterThan(0);
      expect(loc.pokemon.species).toBeLessThanOrEqual(493);
    }
  });
});
