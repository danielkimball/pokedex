import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { tcgEnergyForGen } from '../core/constants/energies';
import { gen4CardArtSource } from '../core/constants/gen4-card-art';
import {
  gen4TcgProfile,
  tcgTypeKey,
} from '../core/constants/gen4-tcg-profiles';

const PUBLIC_DIR = resolve(__dirname, '../../public');
const PRINTED_TYPES = new Set([
  'Colorless', 'Darkness', 'Fighting', 'Fire', 'Grass',
  'Lightning', 'Metal', 'Psychic', 'Water',
]);

describe('Gen IV Kanto printed-card metadata', () => {
  it('covers every one of the first 151 in all five Gen IV games', () => {
    for (const game of ['Diamond', 'Pearl', 'Platinum', 'HeartGold', 'SoulSilver']) {
      for (let species = 1; species <= 151; species++) {
        const profile = gen4TcgProfile(species, game);
        expect(profile, `${game} is missing #${species}`).not.toBeNull();
        expect(PRINTED_TYPES.has(profile!.type), `${game} #${species} type`).toBe(true);
        for (const weakness of profile!.weaknesses) {
          expect(PRINTED_TYPES.has(weakness.type), `${game} #${species} weakness`).toBe(true);
        }
      }
    }
  });

  it('matches each selected illustration to that exact card record', () => {
    for (let species = 1; species <= 151; species++) {
      if (species === 64) continue; // Kadabra had no Gen IV printing.
      const source = gen4CardArtSource(species, 'HeartGold');
      const profile = gen4TcgProfile(species, 'HeartGold');
      expect(source, `missing art #${species}`).not.toBeNull();
      expect(profile, `missing profile #${species}`).not.toBeNull();
      expect(source!.path).toContain(`/${profile!.cardId.replace('-', '/')}.jpg`);
    }
  });

  it('uses Call of Legends Gengar: Psychic card, Darkness x2 weakness', () => {
    expect(gen4TcgProfile(94, 'HeartGold')).toMatchObject({
      cardId: 'hgss4-94',
      type: 'Psychic',
      weaknesses: [{ type: 'Darkness', value: '×2' }],
    });
  });

  it('preserves card-specific weakness modifiers instead of inventing a type-chart value', () => {
    expect(gen4TcgProfile(6, 'HeartGold')).toMatchObject({
      cardId: 'pl4-1',
      type: 'Fire',
      weaknesses: [{ type: 'Water', value: '+30' }],
    });
    expect(gen4TcgProfile(81, 'HeartGold')).toMatchObject({
      cardId: 'hgss4-68',
      type: 'Lightning',
      weaknesses: [{ type: 'Fighting', value: '×2' }],
    });
  });

  it('supplies an explicit Psychic-era fallback for unprinted Gen IV Kadabra', () => {
    expect(gen4TcgProfile(64, 'HeartGold')).toMatchObject({
      cardId: 'custom-gen4-kadabra',
      type: 'Psychic',
      weaknesses: [{ type: 'Psychic', value: '×2' }],
      evolvesFrom: 'Abra',
    });
  });
});

describe('Gen IV printed energy assets', () => {
  it('accepts exact TCG type names and ships weakness icons', () => {
    expect(tcgTypeKey('Lightning')).toBe('lightning');
    expect(tcgEnergyForGen('Darkness', 4)).toBe('darkness');
    expect(tcgEnergyForGen('Metal', 4)).toBe('metal');
    expect(existsSync(resolve(PUBLIC_DIR, 'cards/gen1/energies/darkness.png'))).toBe(true);
    expect(existsSync(resolve(PUBLIC_DIR, 'cards/gen1/energies/metal.png'))).toBe(true);
  });
});
