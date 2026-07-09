/**
 * Registry of story-order catch guides for every supported Gen 1–4 game.
 */

import type {
  GameGuide,
  ProgressionArea,
  ProgressionEncounter,
  GymBadgeInfo,
  PlayerProgress,
} from './progression-types';
import {
  YELLOW_PROGRESSION,
  YELLOW_BADGES,
  countBadges as countYellowBadges,
  inferToolsFromBadges as yellowInferTools,
  TOOL_LABEL as YELLOW_TOOL_LABEL,
  yellowSpeciesAvailableNow,
  type ProgressionArea as YellowArea,
} from './progression-yellow';
import {
  HG_PROGRESSION,
  HG_BADGES,
  countJohtoBadges,
  countKantoBadges,
  inferToolsFromBadges as hgInferTools,
  TOOL_LABEL as HG_TOOL_LABEL,
  hgSpeciesAvailableNow,
  HG_META_AREA_IDS,
  type ProgressionArea as HgArea,
} from './progression-heartgold';
import {
  SINNOH_BADGES,
  PLATINUM_PROGRESSION,
  DIAMOND_PROGRESSION,
  PEARL_PROGRESSION,
} from './progression-sinnoh';

// ─── Badge helpers ───────────────────────────────────────────────────────────

function countBits(badges: number, lo: number, hi: number): number {
  let n = 0;
  for (let i = lo; i <= hi; i++) if ((badges >> i) & 1) n++;
  return n;
}

export function hasBadgeBit(badges: number, index: number): boolean {
  return ((badges >> index) & 1) === 1;
}

// ─── Adapters ────────────────────────────────────────────────────────────────

function yellowAreasToCommon(areas: YellowArea[]): ProgressionArea[] {
  return areas.map(a => ({
    id: a.id,
    name: a.name,
    minBadges: a.minBadges,
    minSecondaryBadges: 0,
    gymBadge: a.gymBadge,
    encounters: a.encounters as ProgressionEncounter[],
  }));
}

function hgAreasToCommon(areas: HgArea[]): ProgressionArea[] {
  return areas.map(a => ({
    id: a.id,
    name: a.name,
    minBadges: a.minBadges,
    minSecondaryBadges: a.minKantoBadges ?? 0,
    gymBadge: a.gymBadge,
    encounters: a.encounters as ProgressionEncounter[],
  }));
}

const YELLOW_META = new Set(['evolutions', 'trade-evos', 'unavailable', 'trade', 'event', 'breed']);

const KANTO_8: GymBadgeInfo[] = YELLOW_BADGES.map(b => ({
  index: b.index,
  bit: b.bit,
  name: b.name,
  city: b.city,
  leader: b.leader,
  emblem: b.emblem,
  unlocks: b.unlocks,
}));

const JOHTO_8: GymBadgeInfo[] = HG_BADGES.filter(b => b.region === 'johto').map(b => ({
  index: b.index,
  bit: b.bit,
  name: b.name,
  city: b.city,
  leader: b.leader,
  emblem: b.emblem,
  region: b.region,
  unlocks: b.unlocks,
}));

const HOENN_8: GymBadgeInfo[] = [
  { index: 0, bit: 0, name: 'Stone Badge', city: 'Rustboro City', leader: 'Roxanne', emblem: 'stone' },
  { index: 1, bit: 1, name: 'Knuckle Badge', city: 'Dewford Town', leader: 'Brawly', emblem: 'knuckle' },
  { index: 2, bit: 2, name: 'Dynamo Badge', city: 'Mauville City', leader: 'Wattson', emblem: 'dynamo' },
  { index: 3, bit: 3, name: 'Heat Badge', city: 'Lavaridge Town', leader: 'Flannery', emblem: 'heat' },
  { index: 4, bit: 4, name: 'Balance Badge', city: 'Petalburg City', leader: 'Norman', emblem: 'balance' },
  { index: 5, bit: 5, name: 'Feather Badge', city: 'Fortree City', leader: 'Winona', emblem: 'feather' },
  { index: 6, bit: 6, name: 'Mind Badge', city: 'Mossdeep City', leader: 'Tate & Liza', emblem: 'mind' },
  { index: 7, bit: 7, name: 'Rain Badge', city: 'Sootopolis City', leader: 'Wallace/Juan', emblem: 'rain' },
];

/** Minimal Hoenn / Gen2 / Gen3 path shells (story stops). Encounter lists filled where known. */
function pathAreas(
  stops: { id: string; name: string; minBadges: number; gymBadge?: number | null }[],
): ProgressionArea[] {
  return stops.map(s => ({
    id: s.id,
    name: s.name,
    minBadges: s.minBadges,
    minSecondaryBadges: 0,
    gymBadge: s.gymBadge ?? null,
    encounters: [],
  }));
}

const HOENN_PATH = pathAreas([
  { id: 'littleroot', name: 'Littleroot Town', minBadges: 0 },
  { id: 'route101', name: 'Route 101', minBadges: 0 },
  { id: 'oldale', name: 'Oldale Town', minBadges: 0 },
  { id: 'route102', name: 'Route 102', minBadges: 0 },
  { id: 'petalburg', name: 'Petalburg City', minBadges: 0 },
  { id: 'route104', name: 'Route 104', minBadges: 0 },
  { id: 'petalburg-woods', name: 'Petalburg Woods', minBadges: 0 },
  { id: 'rustboro', name: 'Rustboro City', minBadges: 0, gymBadge: 0 },
  { id: 'dewford', name: 'Dewford Town', minBadges: 1, gymBadge: 1 },
  { id: 'granite-cave', name: 'Granite Cave', minBadges: 1 },
  { id: 'slateport', name: 'Slateport City', minBadges: 2 },
  { id: 'mauville', name: 'Mauville City', minBadges: 2, gymBadge: 2 },
  { id: 'route111', name: 'Route 111', minBadges: 3 },
  { id: 'lavaridge', name: 'Lavaridge Town', minBadges: 3, gymBadge: 3 },
  { id: 'petalburg-gym', name: 'Petalburg Gym', minBadges: 4, gymBadge: 4 },
  { id: 'fortree', name: 'Fortree City', minBadges: 5, gymBadge: 5 },
  { id: 'mt-pyre', name: 'Mt. Pyre', minBadges: 5 },
  { id: 'mossdeep', name: 'Mossdeep City', minBadges: 6, gymBadge: 6 },
  { id: 'sootopolis', name: 'Sootopolis City', minBadges: 7, gymBadge: 7 },
  { id: 'victory-road-hoenn', name: 'Victory Road', minBadges: 8 },
  { id: 'ever-grande', name: 'Ever Grande City', minBadges: 8 },
  { id: 'trade', name: 'Trade / transfer', minBadges: 0 },
]);

const JOHTO_GSC_PATH = pathAreas([
  { id: 'new-bark', name: 'New Bark Town', minBadges: 0 },
  { id: 'route29', name: 'Route 29', minBadges: 0 },
  { id: 'cherrygrove', name: 'Cherrygrove City', minBadges: 0 },
  { id: 'route30', name: 'Route 30', minBadges: 0 },
  { id: 'route31', name: 'Route 31', minBadges: 0 },
  { id: 'violet', name: 'Violet City', minBadges: 0, gymBadge: 0 },
  { id: 'sprout-tower', name: 'Sprout Tower', minBadges: 0 },
  { id: 'route32', name: 'Route 32', minBadges: 1 },
  { id: 'union-cave', name: 'Union Cave', minBadges: 1 },
  { id: 'route33', name: 'Route 33', minBadges: 1 },
  { id: 'azalea', name: 'Azalea Town', minBadges: 1, gymBadge: 1 },
  { id: 'ilex', name: 'Ilex Forest', minBadges: 2 },
  { id: 'route34', name: 'Route 34', minBadges: 2 },
  { id: 'goldenrod', name: 'Goldenrod City', minBadges: 2, gymBadge: 2 },
  { id: 'route35', name: 'Route 35', minBadges: 2 },
  { id: 'national-park', name: 'National Park', minBadges: 2 },
  { id: 'route36', name: 'Route 36', minBadges: 3 },
  { id: 'route37', name: 'Route 37', minBadges: 3 },
  { id: 'ecruteak', name: 'Ecruteak City', minBadges: 3, gymBadge: 3 },
  { id: 'route38', name: 'Route 38', minBadges: 4 },
  { id: 'olivine', name: 'Olivine City', minBadges: 4 },
  { id: 'cianwood', name: 'Cianwood City', minBadges: 4, gymBadge: 4 },
  { id: 'olivine-gym', name: 'Olivine Gym', minBadges: 5, gymBadge: 5 },
  { id: 'mahogany', name: 'Mahogany Town', minBadges: 5, gymBadge: 6 },
  { id: 'lake-of-rage', name: 'Lake of Rage', minBadges: 5 },
  { id: 'blackthorn', name: 'Blackthorn City', minBadges: 7, gymBadge: 7 },
  { id: 'ice-path', name: 'Ice Path', minBadges: 7 },
  { id: 'victory-road', name: 'Victory Road', minBadges: 8 },
  { id: 'indigo', name: 'Indigo Plateau', minBadges: 8 },
  { id: 'trade', name: 'Trade / transfer', minBadges: 0 },
]);

/** Merge HG Johto encounter lists into GSC path where ids match. */
function fillFromHg(path: ProgressionArea[]): ProgressionArea[] {
  const hgById = new Map(HG_PROGRESSION.map(a => [a.id, a]));
  return path.map(a => {
    const src = hgById.get(a.id);
    if (!src || src.encounters.length === 0) return a;
    return {
      ...a,
      encounters: src.encounters.map(e => ({
        species: e.species,
        method: e.method as ProgressionEncounter['method'],
        note: e.note,
        firstHere: e.firstHere,
        requires: e.requires,
      })),
    };
  });
}

const GSC_FILLED = fillFromHg(JOHTO_GSC_PATH);

/** SoulSilver = HeartGold path with exclusives swapped via note; use HG areas. */
function soulsilverAreas(): ProgressionArea[] {
  // SS-only wild (show as available); HG-only → trade in SS guide
  const HG_ONLY = new Set([56, 57, 58, 59, 207, 472, 216, 217]);
  const SS_ONLY = new Set([37, 38, 52, 53, 200, 429, 231, 232]);
  return hgAreasToCommon(HG_PROGRESSION).map(area => {
    if (area.id === 'trade') {
      // Keep trade section; HG-only mons already may appear wild in HG path — demote to trade notes
      return area;
    }
    return {
      ...area,
      encounters: area.encounters
        .filter(e => !HG_ONLY.has(e.species) || e.method === 'evolve')
        .map(e => {
          if (SS_ONLY.has(e.species)) return e;
          return e;
        }),
    };
  });
}

function basicGuide(
  id: string,
  title: string,
  generation: number,
  badges: GymBadgeInfo[],
  areas: ProgressionArea[],
  match: GameGuide['matchSave'],
  metaExtra: string[] = [],
): GameGuide {
  const meta = new Set(['evolutions', 'trade', 'event', 'breed', 'trade-evos', 'unavailable', ...metaExtra]);
  return {
    id,
    title,
    generation,
    badges,
    areas,
    metaAreaIds: meta,
    inferTools: (b) => {
      const n = countBits(b, 0, Math.min(7, badges.length - 1));
      const t = new Set<string>();
      if (n >= 1) t.add('old-rod');
      if (n >= 2) { t.add('cut'); t.add('rock-smash'); }
      if (n >= 3) t.add('strength');
      if (n >= 4) { t.add('surf'); t.add('good-rod'); t.add('fly'); }
      if (n >= 5) t.add('waterfall');
      if (n >= 6) t.add('super-rod');
      return t;
    },
    countPrimaryBadges: (b) => countBits(b, 0, Math.min(7, badges.length - 1)),
    toolLabels: {
      'old-rod': 'Old Rod', 'good-rod': 'Good Rod', 'super-rod': 'Super Rod',
      cut: 'Cut', surf: 'Surf', strength: 'Strength', fly: 'Fly',
      'rock-smash': 'Rock Smash', waterfall: 'Waterfall', defog: 'Defog',
      'rock-climb': 'Rock Climb', 'national-dex': 'National Dex',
    },
    matchSave: match,
  };
}

function sinnohGuide(
  id: string,
  title: string,
  areas: ProgressionArea[],
  match: GameGuide['matchSave'],
): GameGuide {
  return {
    id,
    title,
    generation: 4,
    badges: SINNOH_BADGES,
    areas,
    metaAreaIds: new Set(['evolutions', 'trade', 'event']),
    inferTools: (b) => {
      const n = countBits(b, 0, 7);
      const t = new Set<string>();
      if (n >= 1) t.add('cut');
      if (n >= 2) t.add('rock-smash');
      if (n >= 3) { t.add('strength'); t.add('old-rod'); }
      if (n >= 4) { t.add('surf'); t.add('defog'); t.add('good-rod'); }
      if (n >= 5) t.add('fly');
      if (n >= 6) t.add('waterfall');
      if (n >= 7) { t.add('rock-climb'); t.add('super-rod'); }
      return t;
    },
    countPrimaryBadges: (b) => countBits(b, 0, 7),
    toolLabels: {
      'old-rod': 'Old Rod', 'good-rod': 'Good Rod', 'super-rod': 'Super Rod',
      cut: 'Cut', surf: 'Surf', strength: 'Strength', fly: 'Fly',
      'rock-smash': 'Rock Smash', waterfall: 'Waterfall', defog: 'Defog',
      'rock-climb': 'Rock Climb',
    },
    matchSave: match,
  };
}

// ─── Registry ────────────────────────────────────────────────────────────────

const YELLOW_COMMON = yellowAreasToCommon(YELLOW_PROGRESSION);
const HG_COMMON = hgAreasToCommon(HG_PROGRESSION);

export const GAME_GUIDES: Record<string, GameGuide> = {
  Yellow: {
    id: 'Yellow',
    title: 'Yellow',
    generation: 1,
    badges: KANTO_8,
    areas: YELLOW_COMMON,
    metaAreaIds: YELLOW_META,
    inferTools: (b) => yellowInferTools(countYellowBadges(b)) as Set<string>,
    countPrimaryBadges: countYellowBadges,
    toolLabels: YELLOW_TOOL_LABEL as Record<string, string>,
    matchSave: s => s.game === 'Yellow' || /yellow/i.test(s.filename || ''),
  },
  Red: basicGuide('Red', 'Red', 1, KANTO_8, YELLOW_COMMON, s => s.game === 'Red' || /\bred\b/i.test(s.filename || '')),
  Blue: basicGuide('Blue', 'Blue', 1, KANTO_8, YELLOW_COMMON, s => s.game === 'Blue' || /\bblue\b|\bgreen\b/i.test(s.filename || '')),

  Gold: basicGuide('Gold', 'Gold', 2, JOHTO_8, GSC_FILLED, s => s.game === 'Gold' || /\bgold\b/i.test(s.filename || '')),
  Silver: basicGuide('Silver', 'Silver', 2, JOHTO_8, GSC_FILLED, s => s.game === 'Silver' || /\bsilver\b/i.test(s.filename || '')),
  Crystal: basicGuide('Crystal', 'Crystal', 2, JOHTO_8, GSC_FILLED, s => s.game === 'Crystal' || /crystal/i.test(s.filename || '')),

  Ruby: basicGuide('Ruby', 'Ruby', 3, HOENN_8, HOENN_PATH, s => s.game === 'Ruby' || /\bruby\b/i.test(s.filename || '')),
  Sapphire: basicGuide('Sapphire', 'Sapphire', 3, HOENN_8, HOENN_PATH, s => s.game === 'Sapphire' || /sapphire/i.test(s.filename || '')),
  Emerald: basicGuide('Emerald', 'Emerald', 3, HOENN_8, HOENN_PATH, s => s.game === 'Emerald' || /emerald/i.test(s.filename || '')),
  FireRed: basicGuide('FireRed', 'FireRed', 3, KANTO_8, YELLOW_COMMON, s => s.game === 'FireRed' || /firered|fire.?red/i.test(s.filename || '')),
  LeafGreen: basicGuide('LeafGreen', 'LeafGreen', 3, KANTO_8, YELLOW_COMMON, s => s.game === 'LeafGreen' || /leafgreen|leaf.?green/i.test(s.filename || '')),

  Diamond: sinnohGuide('Diamond', 'Diamond', DIAMOND_PROGRESSION, s => s.game === 'Diamond' || /diamond/i.test(s.filename || '')),
  Pearl: sinnohGuide('Pearl', 'Pearl', PEARL_PROGRESSION, s => s.game === 'Pearl' || /\bpearl\b/i.test(s.filename || '')),
  Platinum: sinnohGuide('Platinum', 'Platinum', PLATINUM_PROGRESSION, s => s.game === 'Platinum' || /platinum/i.test(s.filename || '')),

  HeartGold: {
    id: 'HeartGold',
    title: 'HeartGold',
    generation: 4,
    badges: HG_BADGES.map(b => ({
      index: b.index, bit: b.bit, name: b.name, city: b.city,
      leader: b.leader, emblem: b.emblem, region: b.region, unlocks: b.unlocks,
    })),
    areas: HG_COMMON,
    metaAreaIds: HG_META_AREA_IDS,
    inferTools: (b) => hgInferTools(b) as Set<string>,
    countPrimaryBadges: countJohtoBadges,
    countSecondaryBadges: countKantoBadges,
    toolLabels: HG_TOOL_LABEL as Record<string, string>,
    matchSave: s =>
      s.game === 'HeartGold' ||
      (s.gameVersion === 'HGSS' && /heart/i.test(s.filename || '')) ||
      /heart\s*gold|heartgold/i.test(s.filename || ''),
  },
  SoulSilver: {
    id: 'SoulSilver',
    title: 'SoulSilver',
    generation: 4,
    badges: HG_BADGES.map(b => ({
      index: b.index, bit: b.bit, name: b.name, city: b.city,
      leader: b.leader, emblem: b.emblem, region: b.region, unlocks: b.unlocks,
    })),
    areas: soulsilverAreas(),
    metaAreaIds: HG_META_AREA_IDS,
    inferTools: (b) => hgInferTools(b) as Set<string>,
    countPrimaryBadges: countJohtoBadges,
    countSecondaryBadges: countKantoBadges,
    toolLabels: HG_TOOL_LABEL as Record<string, string>,
    matchSave: s =>
      s.game === 'SoulSilver' ||
      (s.gameVersion === 'HGSS' && /soul/i.test(s.filename || '')) ||
      /soul\s*silver|soulsilver/i.test(s.filename || ''),
  },
};

/** Ordered list for the Path dropdown. */
export const PROGRESSION_GAME_OPTIONS: { id: string | null; label: string; group?: string }[] = [
  { id: null, label: 'Off — National Dex' },
  { id: 'Red', label: 'Red', group: 'Gen I' },
  { id: 'Blue', label: 'Blue', group: 'Gen I' },
  { id: 'Yellow', label: 'Yellow', group: 'Gen I' },
  { id: 'Gold', label: 'Gold', group: 'Gen II' },
  { id: 'Silver', label: 'Silver', group: 'Gen II' },
  { id: 'Crystal', label: 'Crystal', group: 'Gen II' },
  { id: 'Ruby', label: 'Ruby', group: 'Gen III' },
  { id: 'Sapphire', label: 'Sapphire', group: 'Gen III' },
  { id: 'Emerald', label: 'Emerald', group: 'Gen III' },
  { id: 'FireRed', label: 'FireRed', group: 'Gen III' },
  { id: 'LeafGreen', label: 'LeafGreen', group: 'Gen III' },
  { id: 'Diamond', label: 'Diamond', group: 'Gen IV' },
  { id: 'Pearl', label: 'Pearl', group: 'Gen IV' },
  { id: 'Platinum', label: 'Platinum', group: 'Gen IV' },
  { id: 'HeartGold', label: 'HeartGold', group: 'Gen IV' },
  { id: 'SoulSilver', label: 'SoulSilver', group: 'Gen IV' },
];

export function getGuide(id: string | null | undefined): GameGuide | null {
  if (!id) return null;
  return GAME_GUIDES[id] ?? null;
}

export function areaUnlocked(guide: GameGuide, area: ProgressionArea, progress: PlayerProgress): boolean {
  const primary = guide.countPrimaryBadges(progress.badges);
  if (area.minBadges > primary) return false;
  const secondary = guide.countSecondaryBadges?.(progress.badges) ?? 0;
  if ((area.minSecondaryBadges ?? 0) > secondary) return false;
  return true;
}

export function encounterAvailable(
  guide: GameGuide,
  area: ProgressionArea,
  enc: ProgressionEncounter,
  progress: PlayerProgress,
): boolean {
  if (enc.method === 'unavailable' || enc.method === 'trade') return false;
  if (!areaUnlocked(guide, area, progress)) return false;
  for (const r of enc.requires ?? []) {
    if (!progress.tools.has(r)) return false;
  }
  return true;
}

export function speciesAvailableNow(guide: GameGuide, progress: PlayerProgress): Set<number> {
  // Prefer specialized calculators for rich guides
  if (guide.id === 'Yellow') return yellowSpeciesAvailableNow(progress as never);
  if (guide.id === 'HeartGold' || guide.id === 'SoulSilver') {
    return hgSpeciesAvailableNow(progress as never);
  }

  const set = new Set<number>();
  for (const area of guide.areas) {
    if (guide.metaAreaIds.has(area.id)) continue;
    for (const e of area.encounters) {
      if (!e.firstHere) continue;
      if (!encounterAvailable(guide, area, e, progress)) continue;
      set.add(e.species);
    }
  }
  return set;
}

export type { GameGuide, ProgressionArea, ProgressionEncounter, GymBadgeInfo, PlayerProgress, SpotMode } from './progression-types';
