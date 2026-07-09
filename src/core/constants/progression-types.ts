/**
 * Shared types for story-order catch guides (all Gen 1–4 games).
 */

export type EncounterMethod =
  | 'wild'
  | 'gift'
  | 'static'
  | 'fish'
  | 'fossil'
  | 'prize'
  | 'breed'
  | 'trade'
  | 'trade-evo'
  | 'evolve'
  | 'unavailable';

export type ProgressionReq = string;

export interface ProgressionEncounter {
  species: number;
  method: EncounterMethod;
  note?: string;
  /** Earliest feasible obtain location for this species in this guide. */
  firstHere: boolean;
  requires?: ProgressionReq[];
}

export interface ProgressionArea {
  id: string;
  name: string;
  /** Primary-region badges typically needed to reach this area. */
  minBadges: number;
  /** Secondary-region badges (e.g. Kanto in HGSS). Default 0. */
  minSecondaryBadges?: number;
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
  region?: string;
  unlocks?: string;
}

export interface PlayerProgress {
  badges: number;
  tools: Set<string>;
}

export type SpotMode = 'progressive' | 'all';

export interface GameGuide {
  /** Store / dropdown key, e.g. "Yellow", "HeartGold". */
  id: string;
  title: string;
  generation: number;
  badges: GymBadgeInfo[];
  areas: ProgressionArea[];
  /** Area ids that are meta (evo/trade/event) — progressive path skips these. */
  metaAreaIds: ReadonlySet<string>;
  /** Infer tools from badge bitfield when bag items unknown. */
  inferTools: (badges: number) => Set<string>;
  /** Count primary-region badges (for unlock + UI). */
  countPrimaryBadges: (badges: number) => number;
  countSecondaryBadges?: (badges: number) => number;
  /** Human labels for tool requirements. */
  toolLabels: Record<string, string>;
  /** Match an imported save to this guide. */
  matchSave: (s: { game?: string | null; gameVersion?: string | null; filename?: string; generation?: number | null }) => boolean;
}
