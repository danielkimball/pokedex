/**
 * Convert a PokemonRecord or HomePokemonRecord into the full Pokemon type
 * required by the save writer. Fills in Gen 4 defaults for fields not stored in records.
 *
 * Legitimacy: We never alter PID, IVs, EVs, OT (ID/SID/name), species, or encryption.
 * Only non-identity fields get defaults (e.g. friendship, PP, met location) within valid ranges.
 */

import type { Pokemon, BattleStats } from '../parser/pokemon-parser';

/** Minimal record shape shared by PokemonRecord and HomePokemonRecord. */
export interface RecordLike {
  species: number;
  nickname: string;
  level: number;
  pid: number;
  otId: number;
  otSid: number;
  otName: string;
  isShiny: boolean;
  isEgg: boolean;
  nature: number;
  ability: number;
  heldItem: number;
  form?: number;
  gender?: number;
  moves: [number, number, number, number];
  ivs: { hp: number; atk: number; def: number; spe: number; spa: number; spd: number };
  evs: { hp: number; atk: number; def: number; spe: number; spa: number; spd: number };
  originGame?: number;
}

/** Gen 4 medium-fast experience at level (capped at 1,640,000). */
function experienceAtLevel(level: number): number {
  const exp = level ** 3;
  return Math.min(Math.floor(exp), 1640000);
}

/** Default max PP when unknown (most moves have 40 or less). */
function defaultPp(moveId: number): number {
  return moveId > 0 ? 40 : 0;
}

/**
 * Convert a record (from DB or Home) to full Pokemon for serialization.
 * Used when writing a Pokemon into a save file (e.g. transfer from Home).
 */
export function recordToPokemon(record: RecordLike, options?: { includeBattleStats?: boolean }): Pokemon {
  const level = Math.max(1, Math.min(100, record.level));
  const otIdPublic = record.otId & 0xffff;

  const battleStats: BattleStats | undefined =
    options?.includeBattleStats !== false
      ? {
          status: 0,
          level,
          capsule: 0,
          currentHp: 100,
          maxHp: 100,
          atk: 100,
          def: 100,
          spe: 100,
          spa: 100,
          spd: 100,
        }
      : undefined;

  return {
    pid: record.pid,
    checksum: 0, // writer recomputes
    species: record.species,
    heldItem: record.heldItem,
    form: record.form ?? 0,
    otId: record.otId,
    otIdPublic,
    otSid: record.otSid,
    experience: experienceAtLevel(level),
    friendship: 255,
    ability: record.ability,
    markings: 0,
    language: 0,
    evHp: record.evs.hp,
    evAtk: record.evs.atk,
    evDef: record.evs.def,
    evSpe: record.evs.spe,
    evSpa: record.evs.spa,
    evSpd: record.evs.spd,
    contestCool: 0,
    contestBeauty: 0,
    contestCute: 0,
    contestSmart: 0,
    contestTough: 0,
    contestSheen: 0,
    move1: record.moves[0],
    move2: record.moves[1],
    move3: record.moves[2],
    move4: record.moves[3],
    pp1: defaultPp(record.moves[0]),
    pp2: defaultPp(record.moves[1]),
    pp3: defaultPp(record.moves[2]),
    pp4: defaultPp(record.moves[3]),
    ppUp1: 0,
    ppUp2: 0,
    ppUp3: 0,
    ppUp4: 0,
    ivHp: record.ivs.hp,
    ivAtk: record.ivs.atk,
    ivDef: record.ivs.def,
    ivSpe: record.ivs.spe,
    ivSpa: record.ivs.spa,
    ivSpd: record.ivs.spd,
    isEgg: record.isEgg,
    isNicknamed: record.nickname.length > 0,
    nickname: record.nickname,
    originGame: record.originGame ?? 0,
    otName: record.otName,
    dateEggReceived: null,
    dateMet: null,
    eggLocationDP: 0,
    metLocationDP: 0,
    eggLocationPt: 0,
    metLocationPt: 0,
    pokerus: 0,
    pokeball: 4,
    metLevel: level,
    otGender: 0,
    encounterType: 0,
    nature: record.nature,
    isShiny: record.isShiny,
    gender: record.gender ?? 2,
    battleStats,
  };
}
