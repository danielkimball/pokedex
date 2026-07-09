/**
 * Pokémon Yellow story-order catch progression.
 *
 * Encounters can require tools/HMs (`requires`). `firstHere` is the earliest
 * place you can ACTUALLY obtain the species (area reached + tools unlocked),
 * so Super Rod mons do not appear as "catchable" in Pallet at game start.
 *
 * Tool unlock order (Yellow):
 *   Old Rod → Vermilion
 *   Poké Flute → after Pokémon Tower
 *   Super Rod → Route 12 (Silence Bridge Fishing Guru)
 *   Good Rod → Fuchsia
 *   Surf → after Soul Badge (then water routes)
 *
 * Wild tables sourced from pret/pokeyellow data/wild/maps.
 */

export type EncounterMethod =
  | 'wild'
  | 'gift'
  | 'static'
  | 'fish'
  | 'fossil'
  | 'prize'
  | 'trade'
  | 'trade-evo'
  | 'evolve'
  | 'unavailable';

/** Story tools / field moves that gate encounters. */
export type ProgressionReq =
  | 'old-rod'
  | 'good-rod'
  | 'super-rod'
  | 'surf'
  | 'cut'
  | 'poke-flute'
  | 'silph-scope';

export interface ProgressionEncounter {
  species: number;
  method: EncounterMethod;
  note?: string;
  /** True if this is the earliest feasible obtain location. */
  firstHere: boolean;
  /** Tools/HMs required beyond simply being in this area. */
  requires?: ProgressionReq[];
}

export interface ProgressionArea {
  id: string;
  name: string;
  minBadges: number;
  gymBadge: number | null;
  encounters: ProgressionEncounter[];
}

export interface GymBadgeInfo {
  index: number;
  bit: number;
  name: string;
  city: string;
  leader: string;
  emblem: string;
  unlocks?: string;
}

export const YELLOW_BADGES: GymBadgeInfo[] = [
  { index: 0, bit: 0, name: 'Boulder Badge', city: 'Pewter City', leader: 'Brock', emblem: 'boulder', unlocks: 'Flash' },
  { index: 1, bit: 1, name: 'Cascade Badge', city: 'Cerulean City', leader: 'Misty', emblem: 'cascade', unlocks: 'Cut' },
  { index: 2, bit: 2, name: 'Thunder Badge', city: 'Vermilion City', leader: 'Lt. Surge', emblem: 'thunder', unlocks: 'Fly' },
  { index: 3, bit: 3, name: 'Rainbow Badge', city: 'Celadon City', leader: 'Erika', emblem: 'rainbow', unlocks: 'Strength' },
  { index: 4, bit: 4, name: 'Soul Badge', city: 'Fuchsia City', leader: 'Koga', emblem: 'soul', unlocks: 'Surf' },
  { index: 5, bit: 5, name: 'Marsh Badge', city: 'Saffron City', leader: 'Sabrina', emblem: 'marsh' },
  { index: 6, bit: 6, name: 'Volcano Badge', city: 'Cinnabar Island', leader: 'Blaine', emblem: 'volcano' },
  { index: 7, bit: 7, name: 'Earth Badge', city: 'Viridian City', leader: 'Giovanni', emblem: 'earth' },
];

export function hasBadge(badges: number, index: number): boolean {
  return ((badges >> index) & 1) === 1;
}

export function countBadges(badges: number): number {
  let n = 0;
  for (let i = 0; i < 8; i++) if (hasBadge(badges, i)) n++;
  return n;
}

export function highestBadgeIndex(badges: number): number {
  let hi = -1;
  for (let i = 0; i < 8; i++) if (hasBadge(badges, i)) hi = i;
  return hi;
}

/** Area id where each tool first becomes available in a normal Yellow playthrough. */
export const TOOL_UNLOCK_AREA: Record<ProgressionReq, string> = {
  'old-rod': 'vermilion',
  'cut': 'vermilion',
  'silph-scope': 'pokemon-tower',
  'poke-flute': 'pokemon-tower',
  'super-rod': 'route12',
  'good-rod': 'fuchsia',
  'surf': 'route19',
};

export const TOOL_LABEL: Record<ProgressionReq, string> = {
  'old-rod': 'Old Rod',
  'good-rod': 'Good Rod',
  'super-rod': 'Super Rod',
  'surf': 'Surf',
  'cut': 'Cut',
  'poke-flute': 'Poké Flute',
  'silph-scope': 'Silph Scope',
};

/** Gen 1 item IDs for key tools (English R/B/Y). */
export const GEN1_TOOL_ITEM_IDS: Record<ProgressionReq, number | null> = {
  'old-rod': 0x4c,
  'good-rod': 0x4d,
  'super-rod': 0x4e,
  'poke-flute': 0x49,
  'silph-scope': 0x48,
  'surf': null, // HM, inferred from Soul Badge
  'cut': null,  // HM, inferred from Cascade Badge
};

export interface PlayerProgress {
  badges: number;
  /** Tools the player currently has (from save bag and/or badge inference). */
  tools: Set<ProgressionReq>;
}

/** Infer tools from badge count when bag data is missing (story approximation). */
export function inferToolsFromBadges(badgeCount: number): Set<ProgressionReq> {
  const t = new Set<ProgressionReq>();
  if (badgeCount >= 1) { /* Cascade often paired with Cut after Anne */ }
  if (badgeCount >= 2) {
    t.add('old-rod');
    t.add('cut');
  }
  if (badgeCount >= 4) {
    t.add('poke-flute');
    t.add('silph-scope');
    t.add('super-rod');
    t.add('good-rod');
  }
  if (badgeCount >= 5) {
    t.add('surf');
  }
  return t;
}

export function mergeTools(badges: number, fromBag: Iterable<ProgressionReq> = []): Set<ProgressionReq> {
  const t = inferToolsFromBadges(countBadges(badges));
  // Bag is authoritative for rods / flute / scope when present
  for (const r of fromBag) t.add(r);
  // HM usage still badge-gated in Gen 1
  if (!hasBadge(badges, 1)) t.delete('cut');
  if (!hasBadge(badges, 4)) t.delete('surf');
  return t;
}

export function encounterAvailable(
  area: ProgressionArea,
  enc: ProgressionEncounter,
  progress: PlayerProgress,
): boolean {
  if (enc.method === 'unavailable') return false;
  const badgeCount = countBadges(progress.badges);
  if (area.minBadges > badgeCount) return false;
  for (const r of enc.requires ?? []) {
    if (!progress.tools.has(r)) return false;
  }
  return true;
}

export const YELLOW_PROGRESSION: ProgressionArea[] = [
  {
    id: "pallet",
    name: "Pallet Town",
    minBadges: 0,
    gymBadge: null,
    encounters: [
      { species: 25, method: "gift", firstHere: true, note: "Starter from Prof. Oak" },
      { species: 72, method: "fish", firstHere: false, note: "Super Rod \u2014 optional return (first Tentacool is Vermilion dock after Super Rod)", requires: ["super-rod"] },
      { species: 120, method: "fish", firstHere: false, note: "Super Rod \u2014 optional return (first Staryu is Vermilion dock after Super Rod)", requires: ["super-rod"] },
    ],
  },
  {
    id: "route1",
    name: "Route 1",
    minBadges: 0,
    gymBadge: null,
    encounters: [
      { species: 16, method: "wild", firstHere: true },
      { species: 19, method: "wild", firstHere: true },
    ],
  },
  {
    id: "viridian",
    name: "Viridian City",
    minBadges: 0,
    gymBadge: null,
    encounters: [
      { species: 60, method: "fish", firstHere: false, note: "Super Rod (pond) \u2014 optional return after Route 12", requires: ["super-rod"] },
    ],
  },
  {
    id: "route22",
    name: "Route 22",
    minBadges: 0,
    gymBadge: null,
    encounters: [
      { species: 19, method: "wild", firstHere: false },
      { species: 21, method: "wild", firstHere: true },
      { species: 29, method: "wild", firstHere: true },
      { species: 32, method: "wild", firstHere: true },
      { species: 56, method: "wild", firstHere: true },
      { species: 60, method: "fish", firstHere: true, note: "Super Rod", requires: ["super-rod"] },
      { species: 61, method: "fish", firstHere: true, note: "Super Rod", requires: ["super-rod"] },
    ],
  },
  {
    id: "route2",
    name: "Route 2",
    minBadges: 0,
    gymBadge: null,
    encounters: [
      { species: 16, method: "wild", firstHere: false },
      { species: 19, method: "wild", firstHere: false },
      { species: 29, method: "wild", firstHere: false },
      { species: 32, method: "wild", firstHere: false },
      { species: 122, method: "trade", firstHere: true, note: "In-game trade: give Clefairy, get Mr. Mime" },
    ],
  },
  {
    id: "viridian-forest",
    name: "Viridian Forest",
    minBadges: 0,
    gymBadge: null,
    encounters: [
      { species: 10, method: "wild", firstHere: true },
      { species: 11, method: "wild", firstHere: true },
      { species: 16, method: "wild", firstHere: false },
      { species: 17, method: "wild", firstHere: true },
    ],
  },
  {
    id: "pewter",
    name: "Pewter City",
    minBadges: 0,
    gymBadge: 0,
    encounters: [
      { species: 142, method: "fossil", firstHere: true, note: "Old Amber in Museum (needs Cut) \u2192 revive at Cinnabar", requires: ["cut"] },
    ],
  },
  {
    id: "route3",
    name: "Route 3",
    minBadges: 1,
    gymBadge: null,
    encounters: [
      { species: 19, method: "wild", firstHere: false },
      { species: 21, method: "wild", firstHere: false },
      { species: 27, method: "wild", firstHere: true },
      { species: 56, method: "wild", firstHere: false },
    ],
  },
  {
    id: "mt-moon",
    name: "Mt. Moon",
    minBadges: 1,
    gymBadge: null,
    encounters: [
      { species: 27, method: "wild", firstHere: false },
      { species: 35, method: "wild", firstHere: true },
      { species: 41, method: "wild", firstHere: true },
      { species: 46, method: "wild", firstHere: true },
      { species: 74, method: "wild", firstHere: true },
      { species: 138, method: "fossil", firstHere: true, note: "Helix OR Dome Fossil (one)" },
      { species: 140, method: "fossil", firstHere: true, note: "Helix OR Dome Fossil (one)" },
    ],
  },
  {
    id: "route4",
    name: "Route 4",
    minBadges: 1,
    gymBadge: null,
    encounters: [
      { species: 19, method: "wild", firstHere: false },
      { species: 21, method: "wild", firstHere: false },
      { species: 27, method: "wild", firstHere: false },
      { species: 56, method: "wild", firstHere: false },
      { species: 118, method: "fish", firstHere: false, note: "Super Rod", requires: ["super-rod"] },
      { species: 119, method: "fish", firstHere: false, note: "Super Rod", requires: ["super-rod"] },
      { species: 129, method: "gift", firstHere: true, note: "Magikarp salesman ($500) \u2014 no rod needed" },
    ],
  },
  {
    id: "cerulean",
    name: "Cerulean City",
    minBadges: 1,
    gymBadge: 1,
    encounters: [
      { species: 1, method: "gift", firstHere: true, note: "Bulbasaur from girl (high Pikachu happiness, after Cascade)" },
      { species: 118, method: "fish", firstHere: false, note: "Super Rod", requires: ["super-rod"] },
      { species: 119, method: "fish", firstHere: true, note: "Super Rod", requires: ["super-rod"] },
    ],
  },
  {
    id: "route24",
    name: "Route 24",
    minBadges: 1,
    gymBadge: null,
    encounters: [
      { species: 4, method: "gift", firstHere: true, note: "Charmander from man after Nugget Bridge" },
      { species: 16, method: "wild", firstHere: false },
      { species: 17, method: "wild", firstHere: false },
      { species: 43, method: "wild", firstHere: true },
      { species: 48, method: "wild", firstHere: true },
      { species: 69, method: "wild", firstHere: true },
      { species: 118, method: "fish", firstHere: false, note: "Super Rod", requires: ["super-rod"] },
    ],
  },
  {
    id: "route25",
    name: "Route 25",
    minBadges: 1,
    gymBadge: null,
    encounters: [
      { species: 16, method: "wild", firstHere: false },
      { species: 17, method: "wild", firstHere: false },
      { species: 43, method: "wild", firstHere: false },
      { species: 48, method: "wild", firstHere: false },
      { species: 69, method: "wild", firstHere: false },
      { species: 98, method: "fish", firstHere: false, note: "Super Rod", requires: ["super-rod"] },
      { species: 99, method: "fish", firstHere: true, note: "Super Rod", requires: ["super-rod"] },
    ],
  },
  {
    id: "route5",
    name: "Route 5",
    minBadges: 2,
    gymBadge: null,
    encounters: [
      { species: 16, method: "wild", firstHere: false },
      { species: 17, method: "wild", firstHere: false },
      { species: 19, method: "wild", firstHere: false },
      { species: 39, method: "wild", firstHere: true },
      { species: 63, method: "wild", firstHere: true },
      { species: 67, method: "trade", firstHere: true, note: "In-game trade: give Cubone, get Machoke" },
    ],
  },
  {
    id: "route6",
    name: "Route 6",
    minBadges: 2,
    gymBadge: null,
    encounters: [
      { species: 16, method: "wild", firstHere: false },
      { species: 17, method: "wild", firstHere: false },
      { species: 19, method: "wild", firstHere: false },
      { species: 39, method: "wild", firstHere: false },
      { species: 54, method: "wild", firstHere: true },
      { species: 55, method: "wild", firstHere: true },
      { species: 63, method: "wild", firstHere: false },
      { species: 118, method: "fish", firstHere: false, note: "Super Rod", requires: ["super-rod"] },
    ],
  },
  {
    id: "vermilion",
    name: "Vermilion City",
    minBadges: 2,
    gymBadge: 2,
    encounters: [
      { species: 7, method: "gift", firstHere: true, note: "Squirtle from Officer Jenny after SS Anne" },
      { species: 72, method: "fish", firstHere: false, note: "Super Rod at dock \u2014 best first Tentacool once you have Super Rod (Fly back)", requires: ["super-rod"] },
      { species: 90, method: "fish", firstHere: true, note: "Super Rod (dock) \u2014 best first Shellder after Super Rod", requires: ["super-rod"] },
      { species: 116, method: "fish", firstHere: false, note: "Super Rod", requires: ["super-rod"] },
      { species: 120, method: "fish", firstHere: true, note: "Super Rod (dock) \u2014 best first Staryu after Super Rod", requires: ["super-rod"] },
      { species: 129, method: "fish", firstHere: false, note: "Old Rod (only Magikarp)", requires: ["old-rod"] },
    ],
  },
  {
    id: "digletts-cave",
    name: "Diglett's Cave",
    minBadges: 2,
    gymBadge: null,
    encounters: [
      { species: 50, method: "wild", firstHere: true },
      { species: 51, method: "wild", firstHere: true },
    ],
  },
  {
    id: "route11",
    name: "Route 11",
    minBadges: 2,
    gymBadge: null,
    encounters: [
      { species: 16, method: "wild", firstHere: false },
      { species: 17, method: "wild", firstHere: false },
      { species: 19, method: "wild", firstHere: false },
      { species: 20, method: "wild", firstHere: true },
      { species: 51, method: "trade", firstHere: false, note: "In-game trade: give Lickitung, get Dugtrio" },
      { species: 72, method: "fish", firstHere: true, note: "Super Rod", requires: ["super-rod"] },
      { species: 96, method: "wild", firstHere: true },
    ],
  },
  {
    id: "route9",
    name: "Route 9",
    minBadges: 2,
    gymBadge: null,
    encounters: [
      { species: 19, method: "wild", firstHere: false },
      { species: 20, method: "wild", firstHere: false },
      { species: 21, method: "wild", firstHere: false },
      { species: 22, method: "wild", firstHere: true },
      { species: 29, method: "wild", firstHere: false },
      { species: 30, method: "wild", firstHere: true },
      { species: 32, method: "wild", firstHere: false },
      { species: 33, method: "wild", firstHere: true },
    ],
  },
  {
    id: "route10",
    name: "Route 10",
    minBadges: 2,
    gymBadge: null,
    encounters: [
      { species: 19, method: "wild", firstHere: false },
      { species: 20, method: "wild", firstHere: false },
      { species: 29, method: "wild", firstHere: false },
      { species: 32, method: "wild", firstHere: false },
      { species: 66, method: "wild", firstHere: true },
      { species: 81, method: "wild", firstHere: true },
      { species: 98, method: "fish", firstHere: true, note: "Super Rod", requires: ["super-rod"] },
      { species: 116, method: "fish", firstHere: false, note: "Super Rod", requires: ["super-rod"] },
    ],
  },
  {
    id: "rock-tunnel",
    name: "Rock Tunnel",
    minBadges: 2,
    gymBadge: null,
    encounters: [
      { species: 41, method: "wild", firstHere: false },
      { species: 66, method: "wild", firstHere: false },
      { species: 74, method: "wild", firstHere: false },
      { species: 95, method: "wild", firstHere: true },
    ],
  },
  {
    id: "lavender",
    name: "Lavender Town",
    minBadges: 2,
    gymBadge: null,
    encounters: [
    ],
  },
  {
    id: "route8",
    name: "Route 8",
    minBadges: 2,
    gymBadge: null,
    encounters: [
      { species: 16, method: "wild", firstHere: false },
      { species: 17, method: "wild", firstHere: false },
      { species: 19, method: "wild", firstHere: false },
      { species: 39, method: "wild", firstHere: false },
      { species: 63, method: "wild", firstHere: false },
      { species: 64, method: "wild", firstHere: true },
    ],
  },
  {
    id: "route7",
    name: "Route 7",
    minBadges: 3,
    gymBadge: null,
    encounters: [
      { species: 16, method: "wild", firstHere: false },
      { species: 17, method: "wild", firstHere: false },
      { species: 19, method: "wild", firstHere: false },
      { species: 39, method: "wild", firstHere: false },
      { species: 63, method: "wild", firstHere: false },
    ],
  },
  {
    id: "celadon",
    name: "Celadon City",
    minBadges: 3,
    gymBadge: 3,
    encounters: [
      { species: 30, method: "prize", firstHere: false, note: "Game Corner \u2014 Nidorina" },
      { species: 33, method: "prize", firstHere: false, note: "Game Corner \u2014 Nidorino" },
      { species: 35, method: "prize", firstHere: false, note: "Game Corner coins" },
      { species: 63, method: "prize", firstHere: false, note: "Game Corner coins" },
      { species: 118, method: "fish", firstHere: true, note: "Super Rod (pond)", requires: ["super-rod"] },
      { species: 123, method: "prize", firstHere: true, note: "Game Corner \u2014 Scyther" },
      { species: 127, method: "prize", firstHere: true, note: "Game Corner \u2014 Pinsir" },
      { species: 133, method: "gift", firstHere: true, note: "Eevee \u2014 Celadon Mansion roof" },
      { species: 137, method: "prize", firstHere: true, note: "Game Corner \u2014 Porygon" },
      { species: 147, method: "prize", firstHere: true, note: "Game Corner \u2014 Dratini" },
    ],
  },
  {
    id: "pokemon-tower",
    name: "Pok\u00e9mon Tower",
    minBadges: 4,
    gymBadge: null,
    encounters: [
      { species: 92, method: "wild", firstHere: true },
      { species: 93, method: "wild", firstHere: true },
      { species: 104, method: "wild", firstHere: true },
    ],
  },
  {
    id: "route12",
    name: "Route 12",
    minBadges: 4,
    gymBadge: null,
    encounters: [
      { species: 16, method: "wild", firstHere: false },
      { species: 17, method: "wild", firstHere: false },
      { species: 43, method: "wild", firstHere: false },
      { species: 44, method: "wild", firstHere: true },
      { species: 69, method: "wild", firstHere: false },
      { species: 70, method: "wild", firstHere: true },
      { species: 79, method: "wild", firstHere: true },
      { species: 80, method: "wild", firstHere: true },
      { species: 83, method: "wild", firstHere: true },
      { species: 116, method: "fish", firstHere: true, note: "Super Rod \u2014 Fishing Guru gives Super Rod HERE; fish immediately for Horsea/Seadra", requires: ["super-rod"] },
      { species: 117, method: "fish", firstHere: true, note: "Super Rod \u2014 fish here right after getting the rod", requires: ["super-rod"] },
      { species: 143, method: "static", firstHere: true, note: "Snorlax (Pok\u00e9 Flute)", requires: ["poke-flute"] },
    ],
  },
  {
    id: "route13",
    name: "Route 13",
    minBadges: 4,
    gymBadge: null,
    encounters: [
      { species: 16, method: "wild", firstHere: false },
      { species: 17, method: "wild", firstHere: false },
      { species: 43, method: "wild", firstHere: false },
      { species: 44, method: "wild", firstHere: false },
      { species: 69, method: "wild", firstHere: false },
      { species: 70, method: "wild", firstHere: false },
      { species: 79, method: "wild", firstHere: false },
      { species: 80, method: "wild", firstHere: false },
      { species: 83, method: "wild", firstHere: false },
      { species: 116, method: "fish", firstHere: false, note: "Super Rod", requires: ["super-rod"] },
    ],
  },
  {
    id: "route14",
    name: "Route 14",
    minBadges: 4,
    gymBadge: null,
    encounters: [
      { species: 17, method: "wild", firstHere: false },
      { species: 43, method: "wild", firstHere: false },
      { species: 44, method: "wild", firstHere: false },
      { species: 48, method: "wild", firstHere: false },
      { species: 49, method: "wild", firstHere: true },
      { species: 69, method: "wild", firstHere: false },
      { species: 70, method: "wild", firstHere: false },
    ],
  },
  {
    id: "route15",
    name: "Route 15",
    minBadges: 4,
    gymBadge: null,
    encounters: [
      { species: 17, method: "wild", firstHere: false },
      { species: 43, method: "wild", firstHere: false },
      { species: 44, method: "wild", firstHere: false },
      { species: 48, method: "wild", firstHere: false },
      { species: 49, method: "wild", firstHere: false },
      { species: 69, method: "wild", firstHere: false },
      { species: 70, method: "wild", firstHere: false },
    ],
  },
  {
    id: "fuchsia",
    name: "Fuchsia City",
    minBadges: 4,
    gymBadge: 4,
    encounters: [
      { species: 60, method: "fish", firstHere: false, note: "Good Rod (pond) \u2014 Fishing Guru in town", requires: ["good-rod"] },
      { species: 118, method: "fish", firstHere: false, note: "Good Rod (pond)", requires: ["good-rod"] },
      { species: 129, method: "fish", firstHere: false, note: "Super Rod", requires: ["super-rod"] },
      { species: 130, method: "fish", firstHere: true, note: "Super Rod (rare)", requires: ["super-rod"] },
    ],
  },
  {
    id: "safari-zone",
    name: "Safari Zone",
    minBadges: 4,
    gymBadge: null,
    encounters: [
      { species: 29, method: "wild", firstHere: false },
      { species: 30, method: "wild", firstHere: false },
      { species: 32, method: "wild", firstHere: false },
      { species: 33, method: "wild", firstHere: false },
      { species: 46, method: "wild", firstHere: false },
      { species: 47, method: "wild", firstHere: true },
      { species: 102, method: "wild", firstHere: true },
      { species: 104, method: "wild", firstHere: false },
      { species: 105, method: "wild", firstHere: true },
      { species: 111, method: "wild", firstHere: true },
      { species: 113, method: "wild", firstHere: true },
      { species: 114, method: "wild", firstHere: true },
      { species: 115, method: "wild", firstHere: true },
      { species: 123, method: "wild", firstHere: false },
      { species: 127, method: "wild", firstHere: false },
      { species: 128, method: "wild", firstHere: true },
      { species: 129, method: "fish", firstHere: false, note: "Super Rod", requires: ["super-rod"] },
      { species: 147, method: "fish", firstHere: false, note: "Super Rod \u2014 Dratini", requires: ["super-rod"] },
      { species: 148, method: "fish", firstHere: true, note: "Super Rod \u2014 Dragonair", requires: ["super-rod"] },
    ],
  },
  {
    id: "route16",
    name: "Route 16",
    minBadges: 5,
    gymBadge: null,
    encounters: [
      { species: 19, method: "wild", firstHere: false },
      { species: 20, method: "wild", firstHere: false },
      { species: 21, method: "wild", firstHere: false },
      { species: 22, method: "wild", firstHere: false },
      { species: 84, method: "wild", firstHere: true },
      { species: 143, method: "static", firstHere: false, note: "Snorlax (Pok\u00e9 Flute)", requires: ["poke-flute"] },
    ],
  },
  {
    id: "route17",
    name: "Route 17",
    minBadges: 5,
    gymBadge: null,
    encounters: [
      { species: 22, method: "wild", firstHere: false },
      { species: 72, method: "fish", firstHere: false, note: "Super Rod", requires: ["super-rod"] },
      { species: 77, method: "wild", firstHere: true },
      { species: 84, method: "wild", firstHere: false },
      { species: 85, method: "wild", firstHere: true },
      { species: 90, method: "fish", firstHere: false, note: "Super Rod", requires: ["super-rod"] },
    ],
  },
  {
    id: "route18",
    name: "Route 18",
    minBadges: 5,
    gymBadge: null,
    encounters: [
      { species: 19, method: "wild", firstHere: false },
      { species: 20, method: "wild", firstHere: false },
      { species: 21, method: "wild", firstHere: false },
      { species: 22, method: "wild", firstHere: false },
      { species: 47, method: "trade", firstHere: false, note: "In-game trade: give Tangela, get Parasect" },
      { species: 84, method: "wild", firstHere: false },
      { species: 90, method: "fish", firstHere: false, note: "Super Rod", requires: ["super-rod"] },
    ],
  },
  {
    id: "route19",
    name: "Route 19",
    minBadges: 5,
    gymBadge: null,
    encounters: [
      { species: 72, method: "wild", firstHere: false, requires: ["surf"] },
      { species: 120, method: "fish", firstHere: false, note: "Super Rod", requires: ["super-rod", "surf"] },
    ],
  },
  {
    id: "route20",
    name: "Route 20",
    minBadges: 5,
    gymBadge: null,
    encounters: [
      { species: 72, method: "wild", firstHere: false, requires: ["surf"] },
    ],
  },
  {
    id: "seafoam",
    name: "Seafoam Islands",
    minBadges: 5,
    gymBadge: null,
    encounters: [
      { species: 41, method: "wild", firstHere: false },
      { species: 42, method: "wild", firstHere: true },
      { species: 72, method: "wild", firstHere: false },
      { species: 79, method: "wild", firstHere: false },
      { species: 80, method: "wild", firstHere: false },
      { species: 86, method: "wild", firstHere: true },
      { species: 87, method: "wild", firstHere: true },
      { species: 98, method: "wild", firstHere: false },
      { species: 99, method: "wild", firstHere: false },
      { species: 120, method: "wild", firstHere: false },
      { species: 144, method: "static", firstHere: true, note: "Articuno", requires: ["surf"] },
    ],
  },
  {
    id: "cinnabar",
    name: "Cinnabar Island",
    minBadges: 5,
    gymBadge: 6,
    encounters: [
      { species: 87, method: "trade", firstHere: false, note: "In-game trade receives Dewgong" },
      { species: 89, method: "trade", firstHere: true, note: "In-game trade receives Muk" },
      { species: 112, method: "trade", firstHere: true, note: "In-game trade receives Rhydon" },
      { species: 120, method: "fish", firstHere: false, note: "Super Rod", requires: ["super-rod"] },
      { species: 138, method: "fossil", firstHere: false, note: "Revive Helix Fossil \u2192 Omanyte" },
      { species: 140, method: "fossil", firstHere: false, note: "Revive Dome Fossil \u2192 Kabuto" },
      { species: 142, method: "fossil", firstHere: false, note: "Revive Old Amber \u2192 Aerodactyl" },
    ],
  },
  {
    id: "pokemon-mansion",
    name: "Pok\u00e9mon Mansion",
    minBadges: 5,
    gymBadge: null,
    encounters: [
      { species: 19, method: "wild", firstHere: false },
      { species: 20, method: "wild", firstHere: false },
      { species: 58, method: "wild", firstHere: true },
      { species: 88, method: "wild", firstHere: true },
      { species: 89, method: "wild", firstHere: false },
      { species: 132, method: "wild", firstHere: true },
    ],
  },
  {
    id: "power-plant",
    name: "Power Plant",
    minBadges: 5,
    gymBadge: null,
    encounters: [
      { species: 81, method: "wild", firstHere: false },
      { species: 82, method: "wild", firstHere: true },
      { species: 88, method: "wild", firstHere: false },
      { species: 89, method: "wild", firstHere: false },
      { species: 100, method: "wild", firstHere: true },
      { species: 145, method: "static", firstHere: true, note: "Zapdos" },
    ],
  },
  {
    id: "route21",
    name: "Route 21",
    minBadges: 5,
    gymBadge: null,
    encounters: [
      { species: 16, method: "wild", firstHere: false },
      { species: 17, method: "wild", firstHere: false },
      { species: 19, method: "wild", firstHere: false },
      { species: 20, method: "wild", firstHere: false },
      { species: 72, method: "wild", firstHere: false, requires: ["surf"] },
    ],
  },
  {
    id: "saffron",
    name: "Saffron City",
    minBadges: 4,
    gymBadge: 5,
    encounters: [
      { species: 106, method: "gift", firstHere: true, note: "Fighting Dojo \u2014 Hitmonlee OR Hitmonchan" },
      { species: 107, method: "gift", firstHere: true, note: "Fighting Dojo \u2014 Hitmonlee OR Hitmonchan" },
      { species: 131, method: "gift", firstHere: true, note: "Lapras \u2014 Silph Co. employee" },
    ],
  },
  {
    id: "viridian-gym",
    name: "Viridian Gym",
    minBadges: 7,
    gymBadge: 7,
    encounters: [
    ],
  },
  {
    id: "route23",
    name: "Route 23",
    minBadges: 8,
    gymBadge: null,
    encounters: [
      { species: 22, method: "wild", firstHere: false },
      { species: 30, method: "wild", firstHere: false },
      { species: 33, method: "wild", firstHere: false },
      { species: 56, method: "wild", firstHere: false },
      { species: 57, method: "wild", firstHere: true },
      { species: 60, method: "fish", firstHere: false, note: "Super Rod", requires: ["super-rod"] },
      { species: 61, method: "fish", firstHere: false, note: "Super Rod", requires: ["super-rod"] },
    ],
  },
  {
    id: "victory-road",
    name: "Victory Road",
    minBadges: 8,
    gymBadge: null,
    encounters: [
      { species: 41, method: "wild", firstHere: false },
      { species: 42, method: "wild", firstHere: false },
      { species: 67, method: "wild", firstHere: false },
      { species: 74, method: "wild", firstHere: false },
      { species: 75, method: "wild", firstHere: true },
      { species: 95, method: "wild", firstHere: false },
      { species: 146, method: "static", firstHere: true, note: "Moltres" },
    ],
  },
  {
    id: "cerulean-cave",
    name: "Cerulean Cave",
    minBadges: 8,
    gymBadge: null,
    encounters: [
      { species: 28, method: "wild", firstHere: true },
      { species: 42, method: "wild", firstHere: false },
      { species: 44, method: "wild", firstHere: false },
      { species: 47, method: "wild", firstHere: false },
      { species: 49, method: "wild", firstHere: false },
      { species: 70, method: "wild", firstHere: false },
      { species: 75, method: "wild", firstHere: false },
      { species: 108, method: "wild", firstHere: true },
      { species: 111, method: "wild", firstHere: false },
      { species: 112, method: "wild", firstHere: false },
      { species: 113, method: "wild", firstHere: false },
      { species: 132, method: "wild", firstHere: false },
      { species: 150, method: "static", firstHere: true, note: "Mewtwo (post-Elite Four)" },
    ],
  },
  {
    id: "evolutions",
    name: "Evolutions (stones / levels)",
    minBadges: 0,
    gymBadge: null,
    encounters: [
      { species: 2, method: "evolve", firstHere: true, note: "Evolve Bulbasaur (Lv 16)" },
      { species: 3, method: "evolve", firstHere: true, note: "Evolve Ivysaur (Lv 32)" },
      { species: 5, method: "evolve", firstHere: true, note: "Evolve Charmander (Lv 16)" },
      { species: 6, method: "evolve", firstHere: true, note: "Evolve Charmeleon (Lv 36)" },
      { species: 8, method: "evolve", firstHere: true, note: "Evolve Squirtle (Lv 16)" },
      { species: 9, method: "evolve", firstHere: true, note: "Evolve Wartortle (Lv 36)" },
      { species: 12, method: "evolve", firstHere: true, note: "Evolve Metapod (Lv 10)" },
      { species: 18, method: "evolve", firstHere: true, note: "Evolve Pidgeotto (Lv 36)" },
      { species: 31, method: "evolve", firstHere: true, note: "Moon Stone on Nidorina" },
      { species: 34, method: "evolve", firstHere: true, note: "Moon Stone on Nidorino" },
      { species: 36, method: "evolve", firstHere: true, note: "Moon Stone on Clefairy" },
      { species: 40, method: "evolve", firstHere: true, note: "Moon Stone on Jigglypuff" },
      { species: 45, method: "evolve", firstHere: true, note: "Leaf Stone on Gloom" },
      { species: 59, method: "evolve", firstHere: true, note: "Fire Stone on Growlithe" },
      { species: 62, method: "evolve", firstHere: true, note: "Water Stone on Poliwhirl" },
      { species: 71, method: "evolve", firstHere: true, note: "Leaf Stone on Weepinbell" },
      { species: 73, method: "evolve", firstHere: true, note: "Evolve Tentacool (Lv 30)" },
      { species: 78, method: "evolve", firstHere: true, note: "Evolve Ponyta (Lv 40)" },
      { species: 91, method: "evolve", firstHere: true, note: "Water Stone on Shellder" },
      { species: 97, method: "evolve", firstHere: true, note: "Evolve Drowzee (Lv 26)" },
      { species: 101, method: "evolve", firstHere: true, note: "Evolve Voltorb (Lv 30)" },
      { species: 103, method: "evolve", firstHere: true, note: "Leaf Stone on Exeggcute" },
      { species: 121, method: "evolve", firstHere: true, note: "Water Stone on Staryu" },
      { species: 134, method: "evolve", firstHere: true, note: "Water Stone on Eevee" },
      { species: 135, method: "evolve", firstHere: true, note: "Thunder Stone on Eevee" },
      { species: 136, method: "evolve", firstHere: true, note: "Fire Stone on Eevee" },
      { species: 139, method: "evolve", firstHere: true, note: "Evolve Omanyte (Lv 40)" },
      { species: 141, method: "evolve", firstHere: true, note: "Evolve Kabuto (Lv 40)" },
      { species: 149, method: "evolve", firstHere: true, note: "Evolve Dragonair (Lv 55)" },
    ],
  },
  {
    id: "trade-evos",
    name: "Trade evolutions (link cable)",
    minBadges: 0,
    gymBadge: null,
    encounters: [
      { species: 65, method: "trade-evo", firstHere: true, note: "Trade Kadabra \u2192 Alakazam" },
      { species: 68, method: "trade-evo", firstHere: true, note: "Trade Machoke \u2192 Machamp" },
      { species: 76, method: "trade-evo", firstHere: true, note: "Trade Graveler \u2192 Golem" },
      { species: 94, method: "trade-evo", firstHere: true, note: "Trade Haunter \u2192 Gengar" },
    ],
  },
  {
    id: "unavailable",
    name: "Not in Yellow (trade / event)",
    minBadges: 0,
    gymBadge: null,
    encounters: [
      { species: 13, method: "unavailable", firstHere: true, note: "Weedle line \u2014 not in Yellow (Red/Blue)" },
      { species: 14, method: "unavailable", firstHere: true, note: "Weedle line \u2014 not in Yellow" },
      { species: 15, method: "unavailable", firstHere: true, note: "Weedle line \u2014 not in Yellow" },
      { species: 23, method: "unavailable", firstHere: true, note: "Ekans \u2014 Red exclusive" },
      { species: 24, method: "unavailable", firstHere: true, note: "Arbok \u2014 Red exclusive" },
      { species: 26, method: "unavailable", firstHere: true, note: "Raichu \u2014 Pikachu won't take Thunderstone in Yellow" },
      { species: 37, method: "unavailable", firstHere: true, note: "Vulpix \u2014 Red exclusive" },
      { species: 38, method: "unavailable", firstHere: true, note: "Ninetales \u2014 Red exclusive" },
      { species: 52, method: "unavailable", firstHere: true, note: "Meowth \u2014 Blue exclusive" },
      { species: 53, method: "unavailable", firstHere: true, note: "Persian \u2014 Blue exclusive" },
      { species: 109, method: "unavailable", firstHere: true, note: "Koffing \u2014 not in Yellow" },
      { species: 110, method: "unavailable", firstHere: true, note: "Weezing \u2014 not in Yellow" },
      { species: 124, method: "unavailable", firstHere: true, note: "Jynx \u2014 not in Yellow" },
      { species: 125, method: "unavailable", firstHere: true, note: "Electabuzz \u2014 not in Yellow (Red)" },
      { species: 126, method: "unavailable", firstHere: true, note: "Magmar \u2014 not in Yellow (Blue)" },
      { species: 151, method: "unavailable", firstHere: true, note: "Mew \u2014 event / glitch only" },
    ],
  },
];
const EVO_REQUIRES_BASE: Record<number, number> = {
  2: 1, 3: 1, 5: 4, 6: 4, 8: 7, 9: 7, 12: 10, 18: 16,
  31: 29, 34: 32, 36: 35, 40: 39, 45: 43, 59: 58, 62: 60,
  71: 69, 73: 72, 78: 77, 91: 90, 97: 96, 101: 100,
  103: 102, 121: 120, 134: 133, 135: 133, 136: 133,
  139: 138, 141: 140, 149: 147, 65: 63, 68: 66, 76: 74, 94: 92,
};

/** Species first-obtainable in pure Yellow (no external trade exclusives). */
export function yellowObtainableSpecies(includeTradeEvos = false): Set<number> {
  const set = new Set<number>();
  for (const area of YELLOW_PROGRESSION) {
    for (const e of area.encounters) {
      if (!e.firstHere) continue;
      if (e.method === 'unavailable') continue;
      if (e.method === 'trade-evo' && !includeTradeEvos) continue;
      set.add(e.species);
    }
  }
  return set;
}

/**
 * Species you can obtain right now given badges + tools.
 * Uses firstHere encounters that pass area + tool gates.
 */
export function yellowSpeciesAvailableNow(
  progress: PlayerProgress,
  includeTradeEvos = false,
): Set<number> {
  const set = new Set<number>();
  for (const area of YELLOW_PROGRESSION) {
    if (area.id === 'unavailable') continue;
    if (area.id === 'trade-evos' && !includeTradeEvos) continue;
    if (area.id === 'evolutions' || area.id === 'trade-evos') continue;
    for (const e of area.encounters) {
      if (!e.firstHere) continue;
      if (!encounterAvailable(area, e, progress)) continue;
      set.add(e.species);
    }
  }
  // Evolutions once base is available
  for (const area of YELLOW_PROGRESSION) {
    if (area.id !== 'evolutions') continue;
    for (const e of area.encounters) {
      if (!e.firstHere) continue;
      const base = EVO_REQUIRES_BASE[e.species];
      if (base == null || set.has(base)) set.add(e.species);
    }
  }
  if (includeTradeEvos) {
    for (const area of YELLOW_PROGRESSION) {
      if (area.id !== 'trade-evos') continue;
      for (const e of area.encounters) {
        if (!e.firstHere) continue;
        const base = EVO_REQUIRES_BASE[e.species];
        if (base == null || set.has(base)) set.add(e.species);
      }
    }
  }
  return set;
}

/** @deprecated Use yellowSpeciesAvailableNow with tools. Badge-only approximation. */
export function yellowSpeciesUpToBadges(badgeCount: number, includeTradeEvos = false): Set<number> {
  // Reconstruct a synthetic badge bitfield with `badgeCount` low bits set.
  let bits = 0;
  for (let i = 0; i < badgeCount && i < 8; i++) bits |= 1 << i;
  return yellowSpeciesAvailableNow(
    { badges: bits, tools: inferToolsFromBadges(badgeCount) },
    includeTradeEvos,
  );
}
