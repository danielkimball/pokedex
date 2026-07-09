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
  yellowSpeciesAvailableNow,
  mergeTools,
  inferToolsFromBadges,
} from '../core/constants/progression-yellow';
import { isGen1Save, parseGen1, readGen1Badges, readGen1KeyTools } from '../core/parser/gen1-parser';

const yellowPath = resolve(__dirname, '../../tmp/fixtures/yellow.sav');

function firstArea(species: number): string | undefined {
  for (const area of YELLOW_PROGRESSION) {
    for (const e of area.encounters) {
      if (e.firstHere && e.species === species) return area.id;
    }
  }
  return undefined;
}

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

  it('does not list Super Rod fish as first-catchable in Pallet', () => {
    expect(firstArea(25)).toBe('pallet'); // Pikachu gift only
    expect(firstArea(72)).not.toBe('pallet'); // Tentacool
    expect(firstArea(120)).not.toBe('pallet'); // Staryu
    // Efficient first spots after Super Rod
    expect(firstArea(120)).toBe('vermilion'); // Staryu dock
    expect(firstArea(90)).toBe('vermilion'); // Shellder
    expect(firstArea(116)).toBe('route12'); // Horsea — fish when you get the rod
    expect(firstArea(129)).toBe('route4'); // Magikarp salesman, no rod
  });

  it('tags Super Rod encounters with requires', () => {
    const pallet = YELLOW_PROGRESSION.find(a => a.id === 'pallet')!;
    const fish = pallet.encounters.filter(e => e.method === 'fish');
    expect(fish.length).toBeGreaterThan(0);
    for (const e of fish) {
      expect(e.requires).toContain('super-rod');
      expect(e.firstHere).toBe(false);
    }
  });

  it('has eight gym badges with correct bit indices', () => {
    expect(YELLOW_BADGES).toHaveLength(8);
    expect(countBadges(0b00000011)).toBe(2);
    expect(hasBadge(0b00000011, 0)).toBe(true);
  });

  it('hides Super Rod mons until tools unlock (badge approximation)', () => {
    const early = yellowSpeciesUpToBadges(0);
    const afterMisty = yellowSpeciesUpToBadges(2);
    const withRods = yellowSpeciesUpToBadges(4); // Super Rod era
    const withSurf = yellowSpeciesUpToBadges(5);

    expect(early.has(25)).toBe(true);
    expect(early.has(16)).toBe(true);
    // No fishing at start
    expect(early.has(120)).toBe(false); // Staryu
    expect(early.has(72)).toBe(false); // Tentacool (first is Super Rod)

    expect(afterMisty.has(50)).toBe(true); // Diglett
    expect(afterMisty.has(120)).toBe(false);

    expect(withRods.has(120)).toBe(true); // Staryu after Super Rod
    expect(withRods.has(116)).toBe(true); // Horsea on Route 12

    expect(afterMisty.has(144)).toBe(false);
    expect(withSurf.has(144)).toBe(true); // Articuno

    expect(withRods.size).toBeGreaterThan(afterMisty.size);
    expect(withSurf.size).toBeGreaterThanOrEqual(withRods.size);
  });

  it('respects bag tools over badge inference when provided', () => {
    // 0 badges but somehow have Super Rod in bag
    const withRod = yellowSpeciesAvailableNow({
      badges: 0,
      tools: mergeTools(0, ['super-rod']),
    });
    // Super Rod alone isn't enough without reaching Vermilion/Route12 areas by badges...
    // area minBadges still gates. Route12 needs 4 badges.
    expect(withRod.has(120)).toBe(false);

    // 4 badges + super rod → Staryu open
    const mid = yellowSpeciesAvailableNow({
      badges: 0b001111, // 4 badges
      tools: new Set(['old-rod', 'cut', 'super-rod', 'good-rod', 'poke-flute', 'silph-scope']),
    });
    expect(mid.has(120)).toBe(true);
  });

  it('excludes pure-Yellow unobtainables from obtainable set', () => {
    const set = yellowObtainableSpecies(false);
    expect(set.has(13)).toBe(false);
    expect(set.has(151)).toBe(false);
    expect(set.has(25)).toBe(true);
    expect(set.has(150)).toBe(true);
  });

  it('infers tools from badge milestones', () => {
    expect(inferToolsFromBadges(0).has('super-rod')).toBe(false);
    expect(inferToolsFromBadges(2).has('old-rod')).toBe(true);
    expect(inferToolsFromBadges(4).has('super-rod')).toBe(true);
    expect(inferToolsFromBadges(5).has('surf')).toBe(true);
  });
});

describe('Gen 1 badge + bag parsing', () => {
  it('reads badges from yellow.sav fixture', () => {
    const buf = readFileSync(yellowPath);
    const data = new Uint8Array(buf);
    expect(isGen1Save(data)).toBe(true);

    const badges = readGen1Badges(data);
    expect(badges).toBe(3);
    expect(countBadges(badges)).toBe(2);

    const save = parseGen1(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), 'Yellow');
    expect(save.trainer.badges).toBe(3);

    // Bag reader should not throw
    const tools = readGen1KeyTools(data);
    expect(typeof tools.superRod).toBe('boolean');
  });
});
