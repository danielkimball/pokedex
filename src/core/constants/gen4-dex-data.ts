/**
 * Rich, structured Gen 4 acquisition data — the "deep dive" layer the data
 * panel reads from. Unlike the flat `LOCATIONS` map (one string array per game),
 * this captures HOW a Pokemon is obtained per game: wild encounter method,
 * rarity, level range, time of day, plus gift/evolve/event sourcing and
 * catch pro-tips.
 *
 * Coverage is per-species and per-game. When a species has no entry here (or a
 * game key is absent), the data panel falls back to the coarse `LOCATIONS`
 * strings. A game that is genuinely trade/transfer-only for a species is simply
 * OMITTED from `games` — the panel renders "Trade/transfer only" rather than
 * listing every game with the word "Trade".
 *
 * Generated + verified by the gen4-catch-data research workflow; hand-seeded
 * anchors below are authoritative and should not be overwritten by regen.
 */

import { LOCATIONS } from './locations';
import { GEN4_DEX_GENERATED } from './gen4-dex-data.generated';

export type Gen4Game = 'heartgold' | 'soulsilver' | 'platinum' | 'diamond' | 'pearl';

export const GEN4_GAMES: Gen4Game[] = ['heartgold', 'soulsilver', 'platinum', 'diamond', 'pearl'];

export const GEN4_GAME_LABEL: Record<Gen4Game, string> = {
  heartgold: 'HeartGold',
  soulsilver: 'SoulSilver',
  platinum: 'Platinum',
  diamond: 'Diamond',
  pearl: 'Pearl',
};

/** How a wild Pokemon is encountered. */
export type EncounterKind =
  | 'grass' | 'surf' | 'fish' | 'headbutt' | 'rock-smash'
  | 'swarm' | 'cave' | 'static' | 'gift' | 'special';

export interface Encounter {
  /** Specific area, e.g. "Viridian Forest", "Route 30", "Mt. Silver". */
  area: string;
  /** How it's found there. */
  kind?: EncounterKind;
  /** "Common" | "Uncommon" | "Rare" | a percent like "5%". */
  rarity?: string;
  /** Level range as shown in-game, e.g. "3-5". */
  levels?: string;
  /** "Morning" | "Day" | "Night" | "Morning/Day" | "Any". */
  times?: string;
  /** Conditions/qualifiers, e.g. "After National Dex", "Radio: Hoenn Sound". */
  note?: string;
}

/** How a Pokemon is obtained in one specific game. */
export interface GameAvail {
  via: 'wild' | 'gift' | 'evolve' | 'event' | 'breed';
  /** One-line summary for non-wild sources (gift/evolve/event). */
  summary?: string;
  /** Wild encounter list (when via === 'wild'). */
  encounters?: Encounter[];
}

export interface Gen4Entry {
  /** Species name (documentation aid on the generated entries). */
  name?: string;
  /** Acquisition pro-tips (encounter-rate tricks, swarm timing, etc.). */
  tips?: string[];
  /** Per-game availability. Absent game = trade/transfer-only for that game. */
  games: Partial<Record<Gen4Game, GameAvail>>;
}

/**
 * Hand-verified anchors. These OVERRIDE the generated data — kept small + correct
 * as ground truth and for spot-checking regen output.
 */
export const GEN4_DEX_SEED: Record<number, Gen4Entry> = {
  // #25 Pikachu
  25: {
    tips: [
      'Lead with a Static or Lightning Rod Pokemon (their ability) to roughly double the wild Electric-type encounter rate.',
      'In HG/SS the only wild Pikachu live in Viridian Forest — late-game Kanto, not Johto.',
    ],
    games: {
      heartgold: { via: 'wild', encounters: [{ area: 'Viridian Forest', kind: 'grass', rarity: 'Uncommon', levels: '3-5', times: 'Any' }] },
      soulsilver: { via: 'wild', encounters: [{ area: 'Viridian Forest', kind: 'grass', rarity: 'Uncommon', levels: '3-5', times: 'Any' }] },
      platinum: { via: 'wild', encounters: [{ area: 'Trophy Garden', kind: 'grass', rarity: 'Uncommon', levels: '15-17', note: "Mr. Backlot's daily guest Pokemon" }] },
      diamond: { via: 'wild', encounters: [{ area: 'Trophy Garden', kind: 'grass', rarity: 'Uncommon', levels: '15-17' }] },
      pearl: { via: 'wild', encounters: [{ area: 'Trophy Garden', kind: 'grass', rarity: 'Uncommon', levels: '15-17' }] },
    },
  },
};

/**
 * The full Gen 4 data map: web-verified generated entries as the base, with the
 * hand-verified seed taking precedence. Species not present here fall back to the
 * coarse LOCATIONS strings inside `gen4CatchView`.
 */
export const GEN4_DEX: Record<number, Gen4Entry> = { ...GEN4_DEX_GENERATED, ...GEN4_DEX_SEED };

/** Get the structured availability for a species in a game, if present. */
export function gen4Availability(species: number, game: Gen4Game): GameAvail | null {
  return GEN4_DEX[species]?.games[game] ?? null;
}

/** Pro-tips for acquiring a species in Gen 4, if any. */
export function gen4Tips(species: number): string[] {
  return GEN4_DEX[species]?.tips ?? [];
}

/** Whether we have any rich Gen 4 data for this species. */
export function hasGen4Data(species: number): boolean {
  return species in GEN4_DEX;
}

/**
 * Games (in canonical order) where the species is obtainable by playing — wild,
 * gift, or in-game event. Evolve/breed/trade are excluded since they aren't a
 * "go here and catch it" answer.
 */
export function gen4CatchableGames(species: number): Gen4Game[] {
  const entry = GEN4_DEX[species];
  if (!entry) return [];
  return GEN4_GAMES.filter(g => {
    const a = entry.games[g];
    return a && (a.via === 'wild' || a.via === 'gift' || a.via === 'event');
  });
}

const KIND_LABEL: Record<EncounterKind, string> = {
  grass: 'Grass', surf: 'Surf', fish: 'Fishing', headbutt: 'Headbutt tree',
  'rock-smash': 'Rock Smash', swarm: 'Swarm', cave: 'Cave', static: 'Static',
  gift: 'Gift', special: 'Special',
};

export interface CatchLine { area: string; detail: string; }
/** One game's catch info, label may be a merged pair e.g. "HeartGold/SoulSilver". */
export interface GameCatch { games: Gen4Game[]; label: string; via: 'wild' | 'gift' | 'event'; lines: CatchLine[]; }
export interface CatchView { catchable: GameCatch[]; tradeOnly: Gen4Game[]; hasRich: boolean; }

function detailOf(e: Encounter): string {
  return [
    e.kind && KIND_LABEL[e.kind],
    e.levels && `Lv ${e.levels}`,
    e.rarity,
    e.times && e.times !== 'Any' ? e.times : null,
    e.note,
  ].filter(Boolean).join(' · ');
}

/** Merge consecutive games whose catch info is identical (HG/SS, D/P) into one block. */
function mergeGames(raw: { game: Gen4Game; via: 'wild' | 'gift' | 'event'; lines: CatchLine[] }[]): GameCatch[] {
  const out: GameCatch[] = [];
  for (const r of raw) {
    const sig = r.via + '|' + JSON.stringify(r.lines);
    const prev = out[out.length - 1] as (GameCatch & { _sig?: string }) | undefined;
    if (prev && prev._sig === sig) {
      prev.games.push(r.game);
      prev.label += '/' + GEN4_GAME_LABEL[r.game];
    } else {
      out.push(Object.assign({ games: [r.game], label: GEN4_GAME_LABEL[r.game], via: r.via, lines: r.lines }, { _sig: sig }));
    }
  }
  return out.map(({ ...g }) => g); // strip _sig
}

/**
 * The "where to catch" view the data panel renders: per-game catchable areas
 * (wild/gift/event), the games that are trade/transfer-only, and whether the
 * rich data layer covered this species (vs the coarse LOCATIONS fallback).
 * Games obtainable only by evolution are omitted (the evolution row covers them).
 */
export function gen4CatchView(species: number, gen = 4): CatchView {
  if (gen !== 4) return { catchable: [], tradeOnly: [], hasRich: false };

  const entry = GEN4_DEX[species];
  if (entry) {
    const raw: { game: Gen4Game; via: 'wild' | 'gift' | 'event'; lines: CatchLine[] }[] = [];
    const tradeOnly: Gen4Game[] = [];
    for (const g of GEN4_GAMES) {
      const a = entry.games[g];
      if (!a) { tradeOnly.push(g); continue; }
      if (a.via === 'wild') {
        const lines = (a.encounters ?? []).map(e => ({ area: e.area, detail: detailOf(e) }));
        raw.push({ game: g, via: 'wild', lines: lines.length ? lines : [{ area: 'Wild', detail: '' }] });
      } else if (a.via === 'gift' || a.via === 'event') {
        raw.push({ game: g, via: a.via, lines: [{ area: a.summary ?? (a.via === 'gift' ? 'Gift' : 'Event'), detail: '' }] });
      }
      // evolve / breed: not a "go catch it" answer — skip, and not trade-only.
    }
    return { catchable: mergeGames(raw), tradeOnly, hasRich: true };
  }

  // Coarse fallback from the flat LOCATIONS strings.
  const loc = LOCATIONS[species];
  const raw: { game: Gen4Game; via: 'wild' | 'gift' | 'event'; lines: CatchLine[] }[] = [];
  const tradeOnly: Gen4Game[] = [];
  for (const g of GEN4_GAMES) {
    const locs = loc?.[g] ?? [];
    const real = locs.filter(l => l !== 'Trade' && l !== 'Event only' && !l.startsWith('Evolve'));
    if (real.length) {
      raw.push({ game: g, via: 'wild', lines: real.map(area => ({ area, detail: '' })) });
    } else if (locs.some(l => l === 'Trade')) {
      tradeOnly.push(g);
    }
    // evolve-only games: omit silently
  }
  return { catchable: mergeGames(raw), tradeOnly, hasRich: false };
}
