/**
 * Generation-agnostic parse result.
 *
 * Gen 1/2/3 save formats differ wildly from each other and from the Gen 4
 * format the rest of the app was built around. Rather than force them into the
 * Gen 4 `Pokemon` shape (PID + encrypted blocks + battle stats), each legacy
 * parser emits this minimal, common representation. The import action persists
 * it into the same IndexedDB `PokemonRecord` / `SaveRecord` stores the Gen 4
 * path uses, so every screen (Pokedex list, dex entry, PC, party) works
 * uniformly regardless of source generation.
 */

import type { Game } from '../constants/games';

export interface UniversalStats {
  hp: number;
  atk: number;
  def: number;
  spe: number;
  spa: number;
  spd: number;
}

export interface UniversalMon {
  /** National Dex number (already remapped from any internal index). */
  species: number;
  nickname: string;
  level: number;
  otName: string;
  otId: number; // visible trainer ID (16-bit for Gen 1/2/3)
  otSid: number; // secret ID (Gen 3 only; 0 otherwise)
  isShiny: boolean;
  isEgg: boolean;
  gender: number; // 0 male, 1 female, 2 genderless/unknown
  nature: number; // 0-24 (Gen 3); 0 when not applicable (Gen 1/2)
  ability: number; // 0 when not applicable
  heldItem: number; // 0 when not applicable (Gen 1)
  moves: [number, number, number, number];
  ivs: UniversalStats; // 0-31 (Gen 3) or DV*2-ish scaled; stored as-read
  evs: UniversalStats; // best-effort
  /** Real PID (Gen 3) or a deterministic synthetic id (Gen 1/2) for identity. */
  pid: number;
  /** Gen 3 caught-game origin byte, if known. */
  originGame?: number;
  location: 'party' | 'box';
  containerIndex: number;
  slotIndex: number;
}

export interface UniversalSave {
  generation: number; // 1-4
  game: Game; // specific game (e.g. SoulSilver)
  family: string; // legacy GameVersion-style family code (e.g. HGSS)
  trainer: {
    name: string;
    trainerId: number;
    secretId: number;
    /** Gym badge bitfield when the generation stores one (Gen 1: bit0=Boulder…bit7=Earth). */
    badges?: number;
  };
  mons: UniversalMon[];
}

/** Empty stat block. */
export function zeroStats(): UniversalStats {
  return { hp: 0, atk: 0, def: 0, spe: 0, spa: 0, spd: 0 };
}

/**
 * Deterministic 32-bit pseudo-PID for generations that have no real PID
 * (Gen 1/2). Built from immutable-ish identity fields so re-importing an
 * unchanged save yields stable identity keys (which the diff engine relies on).
 */
export function syntheticPid(parts: number[]): number {
  let h = 0x811c9dc5; // FNV-1a basis
  for (const p of parts) {
    for (let shift = 0; shift < 32; shift += 8) {
      h ^= (p >>> shift) & 0xff;
      h = Math.imul(h, 0x01000193);
    }
  }
  return h >>> 0;
}

/**
 * Gen 1/2 shininess: Def/Spe/Spc DVs all 10 and Atk DV in {2,3,6,7,10,11,14,15}.
 * (Gen 1 never displays shininess, so callers gate this on generation.)
 */
export function isGBShiny(dv: UniversalStats): boolean {
  return dv.def === 10 && dv.spe === 10 && dv.spa === 10 && (dv.atk & 2) !== 0;
}

/**
 * Gen 1/2 gender from the Attack DV vs the species gender ratio.
 * Female when AtkDV < (eighths-female * 2); genderRate -1 means genderless.
 */
export function gbGender(atkDV: number, genderRate: number): number {
  if (genderRate < 0) return 2; // genderless
  if (genderRate === 0) return 0; // always male
  if (genderRate === 8) return 1; // always female
  return atkDV < genderRate * 2 ? 1 : 0;
}
