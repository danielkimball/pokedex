/**
 * Unit tests for the multi-generation (Gen 1/2/3) support.
 * Covers the pure logic — index remaps, sprite URLs, text decoding, DV-based
 * gender/shininess, and Gen 3 experience->level. Parsing of full save files is
 * validated separately against real .sav fixtures (not committed: personal data).
 */

import { describe, it, expect } from 'vitest';
import { GEN1_INDEX_TO_DEX } from '../core/constants/species-gen1';
import { GEN3_INDEX_TO_DEX } from '../core/constants/species-gen3';
import {
  spriteUrl,
  defaultSpriteUrl,
  monSpriteUrl,
  gameLabel,
  expandFamily,
  inferGameFromFilename,
  genLabel,
} from '../core/constants/games';
import { gbGender, isGBShiny, syntheticPid } from '../core/parser/universal';
import { decodeGBText } from '../core/text/gb-text';
import { decodeGBAText } from '../core/text/gba-text';
import { expToLevel } from '../core/parser/gen3-parser';

describe('Gen 1 species index remap', () => {
  it('maps internal indices to National Dex', () => {
    expect(GEN1_INDEX_TO_DEX[84]).toBe(25); // Pikachu
    expect(GEN1_INDEX_TO_DEX[153]).toBe(1); // Bulbasaur
    expect(GEN1_INDEX_TO_DEX[21]).toBe(151); // Mew
    expect(GEN1_INDEX_TO_DEX[180]).toBe(6); // Charizard
  });
  it('leaves glitch/unused slots as 0', () => {
    expect(GEN1_INDEX_TO_DEX[31]).toBe(0); // MissingNo slot
  });
});

describe('Gen 3 species index remap', () => {
  it('maps Kanto dex directly and Hoenn block by offset', () => {
    expect(GEN3_INDEX_TO_DEX[1]).toBe(1); // Bulbasaur
    expect(GEN3_INDEX_TO_DEX[251]).toBe(251); // Celebi
    expect(GEN3_INDEX_TO_DEX[277]).toBe(252); // Treecko (Hoenn block start)
  });
});

describe('spriteUrl', () => {
  const BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
  it('picks the era-correct versioned sprite per game', () => {
    expect(spriteUrl(25, 'Yellow')).toBe(`${BASE}/versions/generation-i/yellow/25.png`);
    expect(spriteUrl(25, 'Silver')).toBe(`${BASE}/versions/generation-ii/silver/25.png`);
    expect(spriteUrl(25, 'LeafGreen')).toBe(`${BASE}/versions/generation-iii/firered-leafgreen/25.png`);
    expect(spriteUrl(25, 'SoulSilver')).toBe(`${BASE}/versions/generation-iv/heartgold-soulsilver/25.png`);
  });
  it('omits shiny for Gen 1 (no shininess) but includes it for Gen 2+', () => {
    expect(spriteUrl(25, 'Yellow', true)).toBe(`${BASE}/versions/generation-i/yellow/25.png`);
    expect(spriteUrl(25, 'Silver', true)).toBe(`${BASE}/versions/generation-ii/silver/shiny/25.png`);
  });
  it('falls back to the neutral default when game is unknown', () => {
    expect(spriteUrl(25)).toBe(`${BASE}/25.png`);
    expect(spriteUrl(25, undefined)).toBe(defaultSpriteUrl(25));
  });
});

describe('game labels', () => {
  it('prefers the specific game over the family code', () => {
    expect(gameLabel({ game: 'SoulSilver', gameVersion: 'HGSS' })).toBe('SoulSilver');
    expect(gameLabel({ game: 'Silver', gameVersion: 'GS' })).toBe('Silver');
  });
  it('expands a bare family code when no specific game is set', () => {
    expect(gameLabel({ gameVersion: 'HGSS' })).toBe('HeartGold/SoulSilver');
    expect(expandFamily('DP')).toBe('Diamond/Pearl');
  });
  it('formats roman-numeral generations', () => {
    expect(genLabel(2)).toBe('Gen II');
    expect(genLabel(4)).toBe('Gen IV');
  });
});

describe('inferGameFromFilename', () => {
  it('recognizes the real emulator filenames', () => {
    expect(inferGameFromFilename('Pokémon Yellow Version Special Pikachu Edition.sav')).toBe('Yellow');
    expect(inferGameFromFilename('Pokémon Silver Version.sav')).toBe('Silver');
    expect(inferGameFromFilename('Pokémon Leaf Green Version.sav')).toBe('LeafGreen');
  });
  it('matches two-word names before the substrings they contain', () => {
    expect(inferGameFromFilename('Pokemon SoulSilver.dsv')).toBe('SoulSilver');
    expect(inferGameFromFilename('Pokemon FireRed.sav')).toBe('FireRed');
  });
});

describe('Gen 1/2 DV-derived gender & shininess', () => {
  it('gender splits on the Attack DV vs the gender ratio', () => {
    expect(gbGender(0, 4)).toBe(1); // 50/50, low Atk DV -> female
    expect(gbGender(8, 4)).toBe(0); // 50/50, high Atk DV -> male
    expect(gbGender(15, 0)).toBe(0); // always-male species
    expect(gbGender(0, 8)).toBe(1); // always-female species
    expect(gbGender(5, -1)).toBe(2); // genderless
  });
  it('shiny requires the classic DV pattern', () => {
    expect(isGBShiny({ hp: 0, atk: 2, def: 10, spe: 10, spa: 10, spd: 10 })).toBe(true);
    expect(isGBShiny({ hp: 0, atk: 0, def: 10, spe: 10, spa: 10, spd: 10 })).toBe(false);
    expect(isGBShiny({ hp: 0, atk: 2, def: 5, spe: 10, spa: 10, spd: 10 })).toBe(false);
  });
});

describe('syntheticPid', () => {
  it('is deterministic for identical inputs', () => {
    expect(syntheticPid([25, 12345, 100, 7])).toBe(syntheticPid([25, 12345, 100, 7]));
  });
  it('differs for different inputs', () => {
    expect(syntheticPid([25, 12345, 100, 7])).not.toBe(syntheticPid([26, 12345, 100, 7]));
  });
});

describe('GB / GBA text decoding', () => {
  it('decodes Gen 1/2 names', () => {
    // D=0x83, A=0x80, N=0x8D, terminator 0x50
    expect(decodeGBText(new Uint8Array([0x83, 0x80, 0x8d, 0x50, 0x00]), 0, 11)).toBe('DAN');
  });
  it('decodes Gen 3 names', () => {
    // D=0xBE, A=0xBB, N=0xC8, terminator 0xFF
    expect(decodeGBAText(new Uint8Array([0xbe, 0xbb, 0xc8, 0xff, 0x00]), 0, 10)).toBe('DAN');
  });
});

describe('monSpriteUrl — Surfing Pikachu Easter egg', () => {
  it('shows the surfboard sprite for a Gen 1 Pikachu that knows Surf', () => {
    expect(monSpriteUrl({ species: 25, generation: 1, game: 'Yellow', moves: [84, 57, 39, 86] }))
      .toBe('/sprites/pikachu-surf.png');
  });
  it('uses the normal sprite for a Gen 1 Pikachu that does not know Surf', () => {
    expect(monSpriteUrl({ species: 25, generation: 1, game: 'Yellow', moves: [84, 21, 39, 86] }))
      .toBe(spriteUrl(25, 'Yellow'));
  });
  it('does not trigger outside Gen 1', () => {
    expect(monSpriteUrl({ species: 25, generation: 4, game: 'HeartGold', moves: [57] }))
      .toBe(spriteUrl(25, 'HeartGold'));
  });
  it('does not trigger for a non-Pikachu that knows Surf', () => {
    expect(monSpriteUrl({ species: 9, generation: 1, moves: [57] })).toBe(spriteUrl(9));
  });
});

describe('Gen 3 experience -> level', () => {
  it('inverts the medium-fast curve (n^3)', () => {
    expect(expToLevel(125000, 2)).toBe(50); // 50^3
    expect(expToLevel(124999, 2)).toBe(49);
    expect(expToLevel(1000000, 2)).toBe(100);
  });
  it('handles the fast and slow curves', () => {
    expect(expToLevel(800000, 3)).toBe(100); // fast: 0.8 * 100^3
    expect(expToLevel(1250000, 1)).toBe(100); // slow: 1.25 * 100^3
  });
});
