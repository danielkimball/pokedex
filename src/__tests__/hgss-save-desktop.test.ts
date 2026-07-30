/**
 * Regression tests against the real HeartGold .dsv in ~/pokedex/game_saves.
 * Skips if the file is missing (CI).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseSaveFile } from '../core/parser/save-file';
import { parseTrainerInfo, readGen4BadgesFromSave } from '../core/parser/trainer-reader';
import { readGeneralBlock } from '../core/parser/block-reader';
import { countJohtoBadges, countKantoBadges } from '../core/constants/progression-heartgold';

const DESKTOP_SAV = resolve(
  process.env.HOME || '',
  'Projects/personal/pokedex/game_saves/Pokemon HeartGold Version.dsv',
);

const hasSave = existsSync(DESKTOP_SAV);

describe.skipIf(!hasSave)('HeartGold desktop save', () => {
  const buf = readFileSync(DESKTOP_SAV);
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

  it('reads all 16 badges (Johto + Kanto)', () => {
    const badges = readGen4BadgesFromSave(ab, 'HGSS');
    expect(countJohtoBadges(badges)).toBe(8);
    expect(countKantoBadges(badges)).toBe(8);
    expect(badges & 0xff).toBe(0xff);
    expect((badges >> 8) & 0xff).toBe(0xff);
  });

  it('parses trainer name DAN with correct gender byte', () => {
    const general = readGeneralBlock(new Uint8Array(ab), 'HGSS').data;
    const t = parseTrainerInfo(general, 'HGSS');
    expect(t.name).toBe('DAN');
    expect(t.trainerId).toBe(17004);
    expect(t.gender).toBe(0);
  });

  it('includes Day Care Ditto in unique species', () => {
    const save = parseSaveFile(ab);
    expect(save.daycare.pokemon.some(p => p?.species === 132)).toBe(true);
    expect(save.uniqueSpecies.has(132)).toBe(true);
    const dittoLoc = save.allPokemon.find(l => l.pokemon.species === 132);
    expect(dittoLoc?.location).toBe('daycare');
  });

  it('still finds party Pokemon', () => {
    const save = parseSaveFile(ab);
    expect(save.party.pokemon.filter(Boolean).length).toBeGreaterThan(0);
    expect(save.totalPokemon).toBeGreaterThan(200);
  });
});
