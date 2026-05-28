/**
 * Tests for the Gen 4 era TCG card-art resolver.
 *
 * The art exists under public/cards/gen4/<set>/<num>.jpg and is selected per
 * record.game so that HG/SS records get HGSS art, Platinum records get
 * Platinum art, and D&P records get D&P art — with cross-era fallback when
 * the chosen era doesn't have a card for that species.
 */
import { describe, it, expect } from 'vitest';
import {
  GEN4_CARD_ART_DP,
  GEN4_CARD_ART_PL,
  GEN4_CARD_ART_HGSS,
  gen4CardArt,
} from '../core/constants/gen4-card-art';
import { monCardArt } from '../core/constants/games';

describe('gen4 card art tables', () => {
  it('covers every Gen 4 species in at least one era', () => {
    // Kadabra (#64) is famously banned from the TCG since 2002 — Uri Geller
    // lawsuit — so it has no Gen 4 card. Every other dex 1-493 should appear.
    const missing: number[] = [];
    for (let d = 1; d <= 493; d++) {
      if (d === 64) continue;
      const inAny = GEN4_CARD_ART_DP[d] || GEN4_CARD_ART_PL[d] || GEN4_CARD_ART_HGSS[d];
      if (!inAny) missing.push(d);
    }
    expect(missing).toEqual([]);
  });

  it('all paths point under /cards/gen4/', () => {
    for (const map of [GEN4_CARD_ART_DP, GEN4_CARD_ART_PL, GEN4_CARD_ART_HGSS]) {
      for (const url of Object.values(map)) {
        expect(url).toMatch(/^\/cards\/gen4\/[a-z0-9]+\/[A-Za-z0-9-]+\.jpg$/);
      }
    }
  });
});

describe('gen4CardArt resolver', () => {
  it('prefers HGSS art for HeartGold + SoulSilver', () => {
    // Squirtle exists in all three eras — HGSS choice should win.
    const hg = gen4CardArt(7, 'HeartGold');
    expect(hg).toBe(GEN4_CARD_ART_HGSS[7]);
    expect(gen4CardArt(7, 'SoulSilver')).toBe(GEN4_CARD_ART_HGSS[7]);
  });

  it('prefers Platinum art for Platinum', () => {
    // Turtwig is in all three eras.
    expect(gen4CardArt(387, 'Platinum')).toBe(GEN4_CARD_ART_PL[387]);
  });

  it('prefers DP art for Diamond + Pearl', () => {
    expect(gen4CardArt(387, 'Diamond')).toBe(GEN4_CARD_ART_DP[387]);
    expect(gen4CardArt(387, 'Pearl')).toBe(GEN4_CARD_ART_DP[387]);
  });

  it('falls back across eras when chosen era is empty', () => {
    // Chikorita has no Platinum-era art; from Platinum we expect DP fallback.
    expect(GEN4_CARD_ART_PL[152]).toBeUndefined();
    expect(gen4CardArt(152, 'Platinum')).toBe(GEN4_CARD_ART_DP[152]);
  });

  it('returns null for species with no Gen 4 art (Kadabra)', () => {
    expect(gen4CardArt(64, 'HeartGold')).toBeNull();
    expect(gen4CardArt(64, 'Diamond')).toBeNull();
  });

  it('uses default order for unknown games', () => {
    // Default order is dp -> pl -> hgss.
    expect(gen4CardArt(387, null)).toBe(GEN4_CARD_ART_DP[387]);
    expect(gen4CardArt(387, 'SomeUnknownGame')).toBe(GEN4_CARD_ART_DP[387]);
  });
});

describe('monCardArt dispatch', () => {
  it('returns null for Gen 2 + Gen 3 records (no art on disk yet)', () => {
    expect(monCardArt({ species: 25, game: 'Silver', generation: 2 })).toBeNull();
    expect(monCardArt({ species: 252, game: 'Ruby', generation: 3 })).toBeNull();
  });

  it('returns gen1 art for Gen 1 records', () => {
    const art = monCardArt({ species: 25, game: 'Yellow', generation: 1 });
    expect(art).toMatch(/^\/cards\/gen1\//);
  });

  it('returns gen4 art for Gen 4 records, honoring game', () => {
    // Pikachu in HeartGold should pick the HGSS table.
    const hg = monCardArt({ species: 25, game: 'HeartGold', generation: 4 });
    expect(hg).toBe(GEN4_CARD_ART_HGSS[25]);
    // Pikachu in Diamond should pick the DP table.
    expect(monCardArt({ species: 25, game: 'Diamond', generation: 4 })).toBe(GEN4_CARD_ART_DP[25]);
  });
});
