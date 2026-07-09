import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  YELLOW_PROGRESSION,
  YELLOW_BADGES,
  hasBadge,
  countBadges,
  yellowSpeciesUpToBadges,
  yellowObtainableSpecies,
} from '../core/constants/progression-yellow';
import { isGen1Save, parseGen1, readGen1Badges } from '../core/parser/gen1-parser';

const yellowPath = resolve(__dirname, '../../tmp/fixtures/yellow.sav');

describe('Yellow progression data', () => {
  it('covers all 151 National Dex numbers exactly once as firstHere', () => {
    const firsts = new Map<number, string>();
    for (const area of YELLOW_PROGRESSION) {
      for (const e of area.encounters) {
        if (!e.firstHere) continue;
        expect(firsts.has(e.species), `duplicate firstHere for #${e.species}`).toBe(false);
        firsts.set(e.species, area.id);
      }
    }
    expect(firsts.size).toBe(151);
    for (let i = 1; i <= 151; i++) {
      expect(firsts.has(i), `missing #${i}`).toBe(true);
    }
  });

  it('has eight gym badges with correct bit indices', () => {
    expect(YELLOW_BADGES).toHaveLength(8);
    expect(YELLOW_BADGES[0].name).toContain('Boulder');
    expect(YELLOW_BADGES[7].name).toContain('Earth');
    expect(countBadges(0b00000011)).toBe(2);
    expect(hasBadge(0b00000011, 0)).toBe(true);
    expect(hasBadge(0b00000011, 1)).toBe(true);
    expect(hasBadge(0b00000011, 2)).toBe(false);
  });

  it('gates Surf-era areas behind 5 badges', () => {
    const early = yellowSpeciesUpToBadges(0);
    const afterMisty = yellowSpeciesUpToBadges(2);
    const withSurf = yellowSpeciesUpToBadges(5);

    // Starter / Route 1 mons available from the start
    expect(early.has(25)).toBe(true); // Pikachu
    expect(early.has(16)).toBe(true); // Pidgey

    // Diglett's Cave after Cascade/Cut era
    expect(early.has(50)).toBe(false);
    expect(afterMisty.has(50)).toBe(true);

    // Articuno / Seafoam needs Surf era
    expect(afterMisty.has(144)).toBe(false);
    expect(withSurf.has(144)).toBe(true);

    // Obtainable total grows with badges
    expect(withSurf.size).toBeGreaterThan(afterMisty.size);
    expect(afterMisty.size).toBeGreaterThan(early.size);
  });

  it('excludes pure-Yellow unobtainables from obtainable set', () => {
    const set = yellowObtainableSpecies(false);
    expect(set.has(13)).toBe(false); // Weedle
    expect(set.has(151)).toBe(false); // Mew
    expect(set.has(25)).toBe(true); // Pikachu
    expect(set.has(150)).toBe(true); // Mewtwo (postgame, still obtainable)
  });
});

describe('Gen 1 badge parsing', () => {
  it('reads badges from yellow.sav fixture', () => {
    const buf = readFileSync(yellowPath);
    const data = new Uint8Array(buf);
    expect(isGen1Save(data)).toBe(true);

    const badges = readGen1Badges(data);
    // Fixture has bits 0+1 set (Boulder + Cascade) → value 3
    expect(badges).toBe(3);
    expect(countBadges(badges)).toBe(2);
    expect(hasBadge(badges, 0)).toBe(true);
    expect(hasBadge(badges, 1)).toBe(true);

    const save = parseGen1(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), 'Yellow');
    expect(save.trainer.badges).toBe(3);
    expect(save.trainer.name.length).toBeGreaterThan(0);
  });
});
