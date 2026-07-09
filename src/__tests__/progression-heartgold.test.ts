import { describe, it, expect } from 'vitest';
import {
  HG_PROGRESSION,
  HG_BADGES,
  HG_META_AREA_IDS,
  hasBadge,
  countJohtoBadges,
  hgSpeciesUpToJohtoBadges,
  hgObtainableSpecies,
  areaUnlocked,
  mergeTools,
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
  it('has 16 gym badges', () => {
    expect(HG_BADGES).toHaveLength(16);
    expect(HG_BADGES[0].name).toContain('Zephyr');
    expect(HG_BADGES[15].name).toContain('Earth');
  });

  it('includes full Johto story towns and routes in order', () => {
    const ids = HG_PROGRESSION.map(a => a.id);
    const must = [
      'new-bark', 'route29', 'cherrygrove', 'route30', 'route31', 'violet',
      'route32', 'union-cave', 'route33', 'azalea', 'ilex', 'route34', 'goldenrod',
      'route35', 'national-park', 'route36', 'route37', 'ecruteak',
      'route38', 'route39', 'olivine', 'route40', 'route41', 'cianwood',
      'route42', 'mahogany', 'route43', 'lake-of-rage', 'route44', 'ice-path',
      'blackthorn', 'route45', 'route46', 'route26', 'route27', 'victory-road',
    ];
    for (const id of must) {
      expect(ids, `missing ${id}`).toContain(id);
    }
    // Order: New Bark before Violet before Goldenrod before Blackthorn
    expect(ids.indexOf('new-bark')).toBeLessThan(ids.indexOf('violet'));
    expect(ids.indexOf('violet')).toBeLessThan(ids.indexOf('goldenrod'));
    expect(ids.indexOf('goldenrod')).toBeLessThan(ids.indexOf('cianwood'));
    expect(ids.indexOf('cianwood')).toBeLessThan(ids.indexOf('blackthorn'));
    expect(ids.indexOf('blackthorn')).toBeLessThan(ids.indexOf('victory-road'));
  });

  it('includes Kanto loop towns after Johto', () => {
    const ids = HG_PROGRESSION.map(a => a.id);
    expect(ids.indexOf('victory-road')).toBeLessThan(ids.indexOf('vermilion'));
    expect(ids).toContain('pewter');
    expect(ids).toContain('cerulean');
    expect(ids).toContain('route5');
    expect(ids).toContain('celadon');
    expect(ids).toContain('fuchsia');
    expect(ids).toContain('cinnabar');
    expect(ids).toContain('viridian');
    expect(ids).toContain('mt-silver');
  });

  it('places starters at New Bark; Magikarp after Old Rod era', () => {
    expect(firstArea(152)).toBe('new-bark');
    expect(firstArea(155)).toBe('new-bark');
    expect(firstArea(158)).toBe('new-bark');
    expect(firstArea(129)).toBe('route32');
    const early = hgSpeciesUpToJohtoBadges(0);
    expect(early.has(129)).toBe(false);
    expect(hgSpeciesUpToJohtoBadges(1).has(129)).toBe(true);
  });

  it('marks SoulSilver exclusives as trade, not wild first-catches', () => {
    // Vulpix / Meowth are SS exclusives
    expect(firstArea(37)).toBe('trade');
    expect(firstArea(52)).toBe('trade');
    // HG exclusives should not be trade-first
    expect(firstArea(56)).not.toBe('trade'); // Mankey
    expect(firstArea(58)).not.toBe('trade'); // Growlithe
  });

  it('progressive unlocks areas by badges', () => {
    const start = { badges: 0, tools: mergeTools(0) };
    const afterFalkner = { badges: 0b1, tools: mergeTools(0b1) };
    const violet = HG_PROGRESSION.find(a => a.id === 'violet')!;
    const route32 = HG_PROGRESSION.find(a => a.id === 'route32')!;
    expect(areaUnlocked(violet, start)).toBe(true);
    expect(areaUnlocked(route32, start)).toBe(false);
    expect(areaUnlocked(route32, afterFalkner)).toBe(true);
    expect(hasBadge(0b1, 0)).toBe(true);
    expect(countJohtoBadges(0b11)).toBe(2);
  });

  it('meta areas are tagged separately from story path', () => {
    expect(HG_META_AREA_IDS.has('trade')).toBe(true);
    expect(HG_META_AREA_IDS.has('new-bark')).toBe(false);
    expect(hgObtainableSpecies().size).toBeGreaterThan(200);
  });
});
