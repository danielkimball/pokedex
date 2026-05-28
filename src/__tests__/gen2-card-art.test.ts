/**
 * Tests for the Gen 2 era TCG card-art resolver.
 *
 * Gen 2 uses ONE map (Gold/Silver/Crystal all share the Neo + e-Card visual
 * era). For species without a Gen 2 era card on TCGdex (Mr. Mime — TCGdex
 * only has empty-image crystal-card variants), the resolver falls back to
 * Gen 1 WotC art so every Kanto species still renders something.
 */
import { describe, it, expect } from 'vitest';
import { GEN2_CARD_ART, gen2CardArt } from '../core/constants/gen2-card-art';
import { GEN1_CARD_ART } from '../core/constants/gen1-card-art';
import { monCardArt } from '../core/constants/games';

describe('gen2 card art table', () => {
  it('covers every Johto species (1-251) directly or via Gen 1 fallback', () => {
    const missing: number[] = [];
    for (let d = 1; d <= 251; d++) {
      if (!gen2CardArt(d)) missing.push(d);
    }
    expect(missing).toEqual([]);
  });

  it('all GEN2 paths point under /cards/gen2/', () => {
    for (const url of Object.values(GEN2_CARD_ART)) {
      expect(url).toMatch(/^\/cards\/gen2\/[a-z0-9]+\/[A-Za-z0-9-]+\.jpg$/);
    }
  });

  it('Lugia + Ho-Oh resolve to Neo Revelation / Neo Genesis art', () => {
    expect(gen2CardArt(249)).toMatch(/\/cards\/gen2\/neo/); // Lugia
    expect(gen2CardArt(250)).toMatch(/\/cards\/gen2\/neo/); // Ho-Oh
    expect(gen2CardArt(251)).toMatch(/\/cards\/gen2\/neo/); // Celebi
  });

  it('falls back to Gen 1 art for species with no Gen 2 card', () => {
    // Mr. Mime (#122) has no usable Gen 2 card — TCGdex's only Gen-2-era
    // Mr. Mime entries are crystal variants without scans.
    expect(GEN2_CARD_ART[122]).toBeUndefined();
    expect(gen2CardArt(122)).toBe(GEN1_CARD_ART[122]);
    expect(gen2CardArt(122)).toMatch(/^\/cards\/gen1\//);
  });
});

describe('monCardArt dispatch — Gen 2', () => {
  it('returns gen2 art for Gen 2 records, irrespective of game (Gold/Silver/Crystal)', () => {
    const a = monCardArt({ species: 25, game: 'Gold', generation: 2 });
    const b = monCardArt({ species: 25, game: 'Silver', generation: 2 });
    const c = monCardArt({ species: 25, game: 'Crystal', generation: 2 });
    expect(a).toBe(GEN2_CARD_ART[25]);
    expect(b).toBe(a);
    expect(c).toBe(a);
  });

  it('still returns Gen 1 art for Gen 1 records (no regression)', () => {
    expect(monCardArt({ species: 25, game: 'Yellow', generation: 1 }))
      .toBe(GEN1_CARD_ART[25]);
  });

  it('returns null for Gen 3 (not yet on disk)', () => {
    expect(monCardArt({ species: 252, game: 'Ruby', generation: 3 })).toBeNull();
  });
});
