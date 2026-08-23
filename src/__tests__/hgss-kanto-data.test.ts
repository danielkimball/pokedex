import { describe, expect, it } from 'vitest';
import { HGSS_KANTO_DATA } from '../core/constants/hgss-kanto-data.generated';
import { SPECIES } from '../core/constants/species';

describe('HGSS National Dex 001-151 acquisition research', () => {
  it('covers every Kanto species with the correct English species name', () => {
    expect(Object.keys(HGSS_KANTO_DATA)).toHaveLength(151);
    for (let number = 1; number <= 151; number++) {
      expect(HGSS_KANTO_DATA[number]?.name).toBe(SPECIES[number]);
    }
  });

  it('contains only player-facing areas and valid encounter rates', () => {
    for (const entry of Object.values(HGSS_KANTO_DATA)) {
      expect(
        entry.versions.heartgold.length + entry.versions.soulsilver.length + entry.evolvesFrom.length,
        `${entry.name} has neither a direct method nor an evolution route`,
      ).toBeGreaterThan(0);
      for (const game of ['heartgold', 'soulsilver'] as const) {
        for (const method of entry.versions[game]) {
          expect(method.area.toLowerCase()).not.toContain('unknown area');
          if (method.chance) {
            const rate = Number.parseFloat(method.chance);
            expect(rate).toBeGreaterThan(0);
            expect(rate).toBeLessThanOrEqual(100);
          }
        }
      }
    }
  });

  it('models Caterpie and Weedle version exclusivity without losing the shared contest roster', () => {
    const caterpie = HGSS_KANTO_DATA[10];
    const weedle = HGSS_KANTO_DATA[13];
    expect(caterpie.versions.heartgold.some(method => method.area === 'Route 30')).toBe(true);
    expect(caterpie.versions.soulsilver.every(method => method.conditions.some(condition => condition.includes('Bug-Catching Contest')))).toBe(true);
    expect(weedle.versions.soulsilver.some(method => method.area === 'Route 30')).toBe(true);
    expect(weedle.versions.heartgold.every(method => method.conditions.some(condition => condition.includes('Bug-Catching Contest')))).toBe(true);
  });

  it('keeps Generation IV evolution rules and required item links', () => {
    expect(HGSS_KANTO_DATA[26].evolvesFrom).toContainEqual(expect.objectContaining({ from: 25, itemSlug: 'thunder-stone' }));
    expect(HGSS_KANTO_DATA[113].evolvesFrom).toContainEqual(expect.objectContaining({ from: 440, itemSlug: 'oval-stone' }));
    expect(HGSS_KANTO_DATA[113].evolvesFrom[0].text).toContain('during the day');
    expect(HGSS_KANTO_DATA[113].evolvesFrom[0].text).toContain('holding Oval Stone');

    const eeveeMethods = HGSS_KANTO_DATA[133].evolvesTo;
    expect(eeveeMethods.some(path => path.text === 'Level up at Eterna Forest')).toBe(true);
    expect(eeveeMethods.some(path => path.text === 'Level up at Sinnoh Route 217')).toBe(true);
    expect(eeveeMethods.some(path => path.itemSlug === 'ice-stone' || path.itemSlug === 'leaf-stone')).toBe(false);
    expect(eeveeMethods.some(path => path.text.includes('friendship (220+)'))).toBe(true);
  });

  it('distinguishes direct gifts, fossils, static encounters, and historical events', () => {
    expect(HGSS_KANTO_DATA[1].versions.heartgold).toContainEqual(expect.objectContaining({
      type: 'gift',
      conditions: expect.arrayContaining(['After defeating Red']),
    }));
    expect(HGSS_KANTO_DATA[138].versions.soulsilver).toContainEqual(expect.objectContaining({
      area: 'Pewter Museum of Science',
      conditions: expect.arrayContaining(['Revive a Helix Fossil']),
    }));
    expect(HGSS_KANTO_DATA[150].versions.heartgold).toContainEqual(expect.objectContaining({ type: 'static', levels: '70' }));
    expect(HGSS_KANTO_DATA[151].versions.soulsilver).toContainEqual(expect.objectContaining({ type: 'event', method: 'Mystery Gift (historical event)' }));
  });
});
