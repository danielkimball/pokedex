import { describe, it, expect } from 'vitest';
import {
  HG_PROGRESSION,
  HG_BADGES,
  hasBadge,
  countJohtoBadges,
  countKantoBadges,
  hgSpeciesUpToJohtoBadges,
  hgObtainableSpecies,
  inferToolsFromBadges,
} from '../core/constants/progression-heartgold';

function firstArea(species: number): string | undefined {
  for (const area of HG_PROGRESSION) {
    for (const e of area.encounters) {
      if (e.firstHere && e.species === species) return area.id;
    }
  }
  return undefined;
}

describe('HeartGold progression data', () => {
  it('has 16 gym badges (8 Johto + 8 Kanto)', () => {
    expect(HG_BADGES).toHaveLength(16);
    expect(HG_BADGES[0].name).toContain('Zephyr');
    expect(HG_BADGES[7].name).toContain('Rising');
    expect(HG_BADGES[15].name).toContain('Earth');
    expect(countJohtoBadges(0xff)).toBe(8);
    expect(countKantoBadges(0xff00)).toBe(8);
    expect(hasBadge(0b1, 0)).toBe(true);
  });

  it('places starters at New Bark as gifts', () => {
    expect(firstArea(152)).toBe('new-bark'); // Chikorita
    expect(firstArea(155)).toBe('new-bark'); // Cyndaquil
    expect(firstArea(158)).toBe('new-bark'); // Totodile
    const nb = HG_PROGRESSION.find(a => a.id === 'new-bark')!;
    const starters = nb.encounters.filter(e => [152, 155, 158].includes(e.species) && e.firstHere);
    expect(starters.every(e => e.method === 'gift')).toBe(true);
  });

  it('does not open Magikarp before Old Rod era', () => {
    const early = hgSpeciesUpToJohtoBadges(0);
    expect(early.has(152) || early.has(155) || early.has(158)).toBe(true);
    expect(early.has(129)).toBe(false); // Magikarp needs Old Rod
    const afterFalkner = hgSpeciesUpToJohtoBadges(1);
    expect(afterFalkner.has(129)).toBe(true);
  });

  it('gates Surf-era catches behind Fog Badge tools', () => {
    const beforeSurf = hgSpeciesUpToJohtoBadges(3);
    const withSurf = hgSpeciesUpToJohtoBadges(4);
    // Lake of Rage Gyarados / water routes open later
    expect(withSurf.size).toBeGreaterThan(beforeSurf.size);
  });

  it('covers a large firstHere set', () => {
    const firsts = new Set<number>();
    for (const area of HG_PROGRESSION) {
      for (const e of area.encounters) {
        if (e.firstHere) firsts.add(e.species);
      }
    }
    // Full national-ish coverage from LOCATIONS map
    expect(firsts.size).toBeGreaterThanOrEqual(400);
    expect(hgObtainableSpecies(false).size).toBeGreaterThan(200);
  });

  it('infers tools from Johto badge milestones', () => {
    expect(inferToolsFromBadges(0).has('surf')).toBe(false);
    expect(inferToolsFromBadges(0b1111).has('surf')).toBe(true); // 4 badges
    expect(inferToolsFromBadges(0b11111111).has('waterfall')).toBe(true);
  });
});
