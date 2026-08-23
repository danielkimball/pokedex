import { describe, expect, it } from 'vitest';
import { HGSS_KANTO_DATA } from '../core/constants/hgss-kanto-data.generated';
import {
  GEN1_4_ITEM_LOCATIONS,
  ITEM_GAME_LABELS,
  getItemLocation,
  type ItemGame,
} from '../core/constants/item-locations';
import { getItemName } from '../core/constants/items';

describe('Generation I-IV item acquisition catalog', () => {
  it('contains exactly the 563 indexed items with unique slugs', () => {
    expect(GEN1_4_ITEM_LOCATIONS).toHaveLength(563);
    expect(new Set(GEN1_4_ITEM_LOCATIONS.map(item => item.slug)).size).toBe(563);
    expect(GEN1_4_ITEM_LOCATIONS.every(item => item.generation >= 1 && item.generation <= 4)).toBe(true);
  });

  it('documents availability or unavailability for every listed game', () => {
    const missing: string[] = [];
    for (const item of GEN1_4_ITEM_LOCATIONS) {
      expect(item.availableIn.length).toBeGreaterThan(0);
      for (const game of item.availableIn) {
        expect(ITEM_GAME_LABELS[game]).toBeTruthy();
        if (!item.games[game]?.length) missing.push(`${item.name} in ${ITEM_GAME_LABELS[game]}`);
      }
      for (const game of Object.keys(item.games) as ItemGame[]) {
        expect(item.availableIn).toContain(game);
      }
    }
    expect(missing).toEqual([]);
  });

  it('resolves every evolution item referenced by the Kanto HGSS guide', () => {
    const slugs = new Set(Object.values(HGSS_KANTO_DATA).flatMap(entry => (
      [...entry.evolvesFrom, ...entry.evolvesTo].map(path => path.itemSlug).filter(Boolean) as string[]
    )));
    for (const slug of slugs) expect(getItemLocation(slug), slug).toBeTruthy();
  });

  it('keeps machine moves and cartridge-specific locations separate', () => {
    const tm01 = getItemLocation('tm01')!;
    expect(tm01.machineMoves?.red).toBe('Mega Punch');
    expect(tm01.machineMoves?.crystal).toBe('Dynamic Punch');
    expect(tm01.machineMoves?.heartgold).toBe('Focus Punch');
    expect(tm01.games.crystal?.some(source => source.text.includes('Cianwood'))).toBe(true);

    const hm05 = getItemLocation('hm05')!;
    expect(hm05.machineMoves?.red).toBe('Flash');
    expect(hm05.machineMoves?.diamond).toBe('Defog');
    expect(hm05.machineMoves?.heartgold).toBe('Whirlpool');
    expect(hm05.games.heartgold?.some(source => source.text.includes('Lance'))).toBe(true);
  });

  it('labels released historical events and unreleased items explicitly', () => {
    expect(getItemLocation('old-sea-map')?.games.emerald?.[0].text).toContain('Japanese-language Emerald only');
    expect(getItemLocation('member-card')?.games.platinum?.[0].kind).toBe('Event distribution');
    expect(getItemLocation('azure-flute')?.games.diamond?.[0].kind).toBe('Not normally obtainable');
    expect(getItemLocation('lock-capsule')?.games.heartgold?.[0].text).toContain('never distributed');
  });

  it('uses the actual PK4 game-index table for held-item names', () => {
    expect(getItemName(149)).toBe('Cheri Berry');
    expect(getItemName(172)).toBe('Hondew Berry');
    expect(getItemName(289)).toBe('Power Bracer');
    expect(getItemName(397)).toBe('TM70');
    expect(getItemName(536)).toBe('Enigma Stone');
  });
});
