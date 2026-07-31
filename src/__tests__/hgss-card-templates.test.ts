/**
 * Every HeartGold / SoulSilver Pokemon must land on a real PNG frame.
 *
 * Before Stage 1 / Stage 2 frames existed, ~40% of an HGSS collection fell
 * through to the CSS placeholder, so a dex was a mix of two unrelated card
 * designs. These tests pin: full stage x energy coverage, a file on disk for
 * every combination the resolver can name, and the era retyping that puts
 * Gen 3+ Poison Pokemon on Psychic instead of the Base Set's Grass.
 */
import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  getTcgEnergy, preEvolutionOf, resolveHgssTemplate, tcgStageLabel,
} from '../core/constants/tcg-card';
import { tcgEnergyForGen } from '../core/constants/energies';
import { SPECIES } from '../core/constants/species';

const PUBLIC_DIR = resolve(__dirname, '../../public');
const TEMPLATE_DIR = resolve(PUBLIC_DIR, 'cards/gen4/templates');
const ENERGIES = ['fire', 'lightning', 'grass', 'water', 'fighting', 'psychic', 'colorless'];
const STAGES = ['basic', 'stage1', 'stage2'];
/** Gen 1-4 babies — mirrors TCG_BABY_SPECIES in tcg-card.ts. */
const BABIES = new Set([
  172, 173, 174, 175, 236, 238, 239, 240, 298, 360,
  406, 433, 438, 439, 440, 446, 447, 458,
]);

/** "/cards/gen4/templates/basic-grass.webp?v=11" -> absolute path under public/. */
function templatePath(url: string): string {
  return resolve(PUBLIC_DIR, url.split('?')[0]!.replace(/^\//, ''));
}

describe('HGSS template files', () => {
  it('ships all 21 stage x energy frames', () => {
    for (const stage of STAGES) {
      for (const e of ENERGIES) {
        const file = resolve(TEMPLATE_DIR, `${stage}-${e}.webp`);
        expect(existsSync(file), `missing ${stage}-${e}.webp`).toBe(true);
      }
    }
  });
});

describe('resolveHgssTemplate', () => {
  it('resolves every stage', () => {
    expect(resolveHgssTemplate('HeartGold', 'grass', 'Basic')).toMatch(/\/basic-grass\.webp/);
    expect(resolveHgssTemplate('HeartGold', 'grass', 'Stage 1')).toMatch(/\/stage1-grass\.webp/);
    expect(resolveHgssTemplate('SoulSilver', 'fire', 'Stage 2')).toMatch(/\/stage2-fire\.webp/);
  });

  it('only fires for HGSS games', () => {
    expect(resolveHgssTemplate('Platinum', 'grass', 'Basic')).toBeNull();
    expect(resolveHgssTemplate('Yellow', 'grass', 'Basic')).toBeNull();
    expect(resolveHgssTemplate(null, 'grass', 'Basic')).toBeNull();
  });

  it('has no frame for energies we never drew', () => {
    expect(resolveHgssTemplate('HeartGold', 'metal', 'Basic')).toBeNull();
    expect(resolveHgssTemplate('HeartGold', 'darkness', 'Basic')).toBeNull();
  });

  it('gives all 493 species a frame that exists on disk', () => {
    const unresolved: string[] = [];
    const missingFile: string[] = [];
    for (let s = 1; s <= 493; s++) {
      const url = resolveHgssTemplate('HeartGold', getTcgEnergy(s, 4), tcgStageLabel(s, 4));
      if (!url) { unresolved.push(`#${s} ${SPECIES[s]}`); continue; }
      if (!existsSync(templatePath(url))) missingFile.push(`#${s} ${SPECIES[s]} -> ${url}`);
    }
    expect(unresolved).toEqual([]);
    expect(missingFile).toEqual([]);
  });
});

describe('tcgStageLabel', () => {
  it('follows the game evolution chain', () => {
    expect(tcgStageLabel(1, 4)).toBe('Basic');      // Bulbasaur
    expect(tcgStageLabel(2, 4)).toBe('Stage 1');    // Ivysaur
    expect(tcgStageLabel(3, 4)).toBe('Stage 2');    // Venusaur
    expect(tcgStageLabel(19, 4)).toBe('Basic');     // Rattata
    expect(tcgStageLabel(20, 4)).toBe('Stage 1');   // Raticate
  });

  it('keeps the TCG baby rule (a baby evolves into another Basic)', () => {
    expect(tcgStageLabel(172, 4)).toBe('Basic');    // Pichu
    expect(tcgStageLabel(25, 4)).toBe('Basic');     // Pikachu
    expect(tcgStageLabel(26, 4)).toBe('Stage 1');   // Raichu
  });
});

describe('preEvolutionOf', () => {
  it('names the immediate game pre-evolution', () => {
    expect(preEvolutionOf(24, 4)).toBe(23);    // Arbok  <- Ekans
    expect(preEvolutionOf(3, 4)).toBe(2);      // Venusaur <- Ivysaur
    expect(preEvolutionOf(169, 4)).toBe(42);   // Crobat <- Golbat
  });

  it('skips the baby: Raichu evolves from Pikachu, not Pichu', () => {
    expect(preEvolutionOf(26, 4)).toBe(25);
    expect(preEvolutionOf(36, 4)).toBe(35);    // Clefable <- Clefairy
  });

  it('returns null for a species with nothing before it', () => {
    expect(preEvolutionOf(1, 4)).toBeNull();   // Bulbasaur
    expect(preEvolutionOf(172, 4)).toBeNull(); // Pichu
  });

  /**
   * The badge is gated on the TCG stage, so a baby's evolution never claims to
   * evolve from it — HS-era Pikachu is a Basic card with no "Evolves from" line
   * even though Pichu exists.
   */
  it('pairs with tcgStageLabel so no Basic card shows an evolves-from line', () => {
    const wrong: string[] = [];
    for (let s = 1; s <= 493; s++) {
      if (tcgStageLabel(s, 4) === 'Basic' && preEvolutionOf(s, 4) !== null) {
        // Only acceptable when the thing before it is a baby (Pikachu, Clefairy…).
        if (!BABIES.has(preEvolutionOf(s, 4)!)) wrong.push(`#${s} ${SPECIES[s]}`);
      }
    }
    expect(wrong).toEqual([]);
  });
});

describe('era energy retyping', () => {
  it('moves Poison from Grass to Psychic for Gen 3+ cards', () => {
    expect(tcgEnergyForGen('Poison', 1)).toBe('grass');
    expect(tcgEnergyForGen('Poison', 2)).toBe('grass');
    expect(tcgEnergyForGen('Poison', 3)).toBe('psychic');
    expect(tcgEnergyForGen('Poison', 4)).toBe('psychic');
  });

  it('leaves the rest of the Base Set fold alone', () => {
    for (const gen of [1, 2, 3, 4]) {
      expect(tcgEnergyForGen('Bug', gen)).toBe('grass');
      expect(tcgEnergyForGen('Ghost', gen)).toBe('psychic');
      expect(tcgEnergyForGen('Ice', gen)).toBe('water');
      expect(tcgEnergyForGen('Rock', gen)).toBe('fighting');
      expect(tcgEnergyForGen('Ground', gen)).toBe('fighting');
      expect(tcgEnergyForGen('Electric', gen)).toBe('lightning');
      expect(tcgEnergyForGen('Flying', gen)).toBe('colorless');
      expect(tcgEnergyForGen('Dragon', gen)).toBe('colorless');
    }
  });

  it('keeps Steel/Dark on Colorless until Metal + Darkness frames exist', () => {
    // Era-wrong on purpose: routing them anywhere else drops those Pokemon
    // back to the CSS placeholder. Revisit when those assets land.
    expect(tcgEnergyForGen('Steel', 4)).toBe('colorless');
    expect(tcgEnergyForGen('Dark', 4)).toBe('colorless');
  });

  it('retypes the Gen 1 Poison line on an HGSS card', () => {
    expect(getTcgEnergy(23, 4)).toBe('psychic');   // Ekans
    expect(getTcgEnergy(24, 4)).toBe('psychic');   // Arbok
    expect(getTcgEnergy(41, 4)).toBe('psychic');   // Zubat
    expect(getTcgEnergy(23, 1)).toBe('grass');     // ...but Base Set Ekans is Grass
    expect(getTcgEnergy(1, 4)).toBe('grass');      // Bulbasaur is Grass/Poison -> Grass
    expect(getTcgEnergy(13, 4)).toBe('grass');     // Weedle is Bug/Poison -> Grass
  });
});
