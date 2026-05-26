/**
 * Generation 2 (Gold / Silver / Crystal) save parser — read-only.
 *
 * 32 KB SRAM, no encryption. Unlike Gen 1, species are stored directly in
 * National Dex order (1-251), and Pokemon carry held items, gender and
 * shininess (both derived from DVs).
 *
 * Layout (English Gold/Silver):
 *   0x2009 trainer ID (2, big-endian)   0x200B player name (11)
 *   0x288A party (count, species list, 6x48 mons, OT names, nicknames)
 *   0x2D6C current (open) box           Boxes 1-7 @ 0x4000, 8-14 @ 0x6000
 */

import { decodeGBText } from '../text/gb-text';
import { GENDER_RATE } from '../constants/species-bio';
import type { Game } from '../constants/games';
import {
  type UniversalMon,
  type UniversalSave,
  type UniversalStats,
  zeroStats,
  syntheticPid,
  isGBShiny,
  gbGender,
} from './universal';

// Gold/Silver offsets.
const GS = {
  trainerId: 0x2009,
  playerName: 0x200b,
  party: 0x288a,
  partyMons: 0x2892,
  partyOt: 0x29b2,
  partyNick: 0x29f4,
  curBoxNum: 0x2724,
  curBox: 0x2d6c,
  checksumStart: 0x2009,
  checksumEnd: 0x2d68,
  checksumAt: 0x2d69,
};
// Crystal moved several blocks; its checksum covers a shorter region.
const CRYSTAL = {
  trainerId: 0x2009,
  playerName: 0x200b,
  party: 0x2865,
  partyMons: 0x286d,
  partyOt: 0x298d,
  partyNick: 0x29cf,
  curBoxNum: 0x2700,
  curBox: 0x2d10,
  checksumStart: 0x2009,
  checksumEnd: 0x2b82,
  checksumAt: 0x2d0d,
};

const BOX_COUNT = 14;
const MONS_PER_BOX = 20;
const PARTY_MON_SIZE = 48;
const BOX_MON_SIZE = 32;
const BOX_SIZE = 1102; // count(1) + species(21) + 20*32 + 20*11 OT + 20*11 nick
const BOX_MONS_OFFSET = 22;
const BOX_OT_OFFSET = 22 + MONS_PER_BOX * BOX_MON_SIZE; // 662
const BOX_NICK_OFFSET = BOX_OT_OFFSET + MONS_PER_BOX * 11; // 882
const EGG_MARKER = 0xfd;

function sum16(data: Uint8Array, start: number, end: number): number {
  let sum = 0;
  for (let i = start; i <= end; i++) sum = (sum + data[i]) & 0xffff;
  return sum;
}

/** Which Gen 2 layout a 32 KB save uses, or null if neither checksum matches. */
export function detectGen2Family(data: Uint8Array): 'GS' | 'C' | null {
  if (data.length < 0x8000) return null;
  if (isGS(data)) return 'GS';
  if (isCrystal(data)) return 'C';
  return null;
}

/** True if either the Gold/Silver or Crystal primary checksum matches. */
export function isGen2Save(data: Uint8Array): boolean {
  return detectGen2Family(data) !== null;
}
function isGS(data: Uint8Array): boolean {
  const stored = data[GS.checksumAt] | (data[GS.checksumAt + 1] << 8);
  return sum16(data, GS.checksumStart, GS.checksumEnd) === stored;
}
function isCrystal(data: Uint8Array): boolean {
  const stored = data[CRYSTAL.checksumAt] | (data[CRYSTAL.checksumAt + 1] << 8);
  return sum16(data, CRYSTAL.checksumStart, CRYSTAL.checksumEnd) === stored;
}

function readU16BE(data: Uint8Array, off: number): number {
  return (data[off] << 8) | data[off + 1];
}

function decodeDVs(data: Uint8Array, off: number): UniversalStats {
  const b0 = data[off];
  const b1 = data[off + 1];
  const atk = (b0 >> 4) & 0xf;
  const def = b0 & 0xf;
  const spe = (b1 >> 4) & 0xf;
  const spc = b1 & 0xf;
  const hp = ((atk & 1) << 3) | ((def & 1) << 2) | ((spe & 1) << 1) | (spc & 1);
  return { hp, atk, def, spe, spa: spc, spd: spc };
}

function buildMon(
  data: Uint8Array,
  monOff: number,
  nickname: string,
  otName: string,
  isEgg: boolean,
  location: 'party' | 'box',
  containerIndex: number,
  slotIndex: number,
): UniversalMon | null {
  const species = data[monOff]; // already National Dex in Gen 2
  if (species < 1 || species > 251) return null;

  const otId = readU16BE(data, monOff + 0x06);
  const ivs = decodeDVs(data, monOff + 0x15);
  const moves: [number, number, number, number] = [
    data[monOff + 0x02],
    data[monOff + 0x03],
    data[monOff + 0x04],
    data[monOff + 0x05],
  ];

  return {
    species,
    nickname,
    level: data[monOff + 0x1f],
    otName,
    otId,
    otSid: 0,
    isShiny: isGBShiny(ivs),
    isEgg,
    gender: gbGender(ivs.atk, GENDER_RATE[species] ?? -1),
    nature: 0,
    ability: 0,
    heldItem: data[monOff + 0x01],
    moves,
    ivs,
    evs: zeroStats(),
    pid: syntheticPid([species, otId, monOff, ivs.atk * 16 + ivs.def]),
    location,
    containerIndex,
    slotIndex,
  };
}

export function parseGen2(buffer: ArrayBuffer, game: Game): UniversalSave {
  const data = new Uint8Array(buffer);
  const o = game === 'Crystal' ? CRYSTAL : GS;
  const mons: UniversalMon[] = [];

  // Party
  const partyCount = Math.min(data[o.party], 6);
  for (let i = 0; i < partyCount; i++) {
    const listByte = data[o.party + 1 + i];
    const monOff = o.partyMons + i * PARTY_MON_SIZE;
    const nickname = decodeGBText(data, o.partyNick + i * 11, 11);
    const otName = decodeGBText(data, o.partyOt + i * 11, 11);
    const mon = buildMon(data, monOff, nickname, otName, listByte === EGG_MARKER, 'party', 0, i);
    if (mon) mons.push(mon);
  }

  // Boxes (live copy at curBox overrides its bank slot for the open box)
  const currentBox = data[o.curBoxNum] & 0x7f;
  for (let b = 0; b < BOX_COUNT; b++) {
    const bankBase = b < 7 ? 0x4000 + b * BOX_SIZE : 0x6000 + (b - 7) * BOX_SIZE;
    const base = b === currentBox ? o.curBox : bankBase;
    const count = Math.min(data[base], MONS_PER_BOX);
    for (let i = 0; i < count; i++) {
      const listByte = data[base + 1 + i];
      const monOff = base + BOX_MONS_OFFSET + i * BOX_MON_SIZE;
      const nickname = decodeGBText(data, base + BOX_NICK_OFFSET + i * 11, 11);
      const otName = decodeGBText(data, base + BOX_OT_OFFSET + i * 11, 11);
      const mon = buildMon(data, monOff, nickname, otName, listByte === EGG_MARKER, 'box', b, i);
      if (mon) mons.push(mon);
    }
  }

  return {
    generation: 2,
    game,
    family: game === 'Crystal' ? 'C' : 'GS',
    trainer: {
      name: decodeGBText(data, o.playerName, 11),
      trainerId: readU16BE(data, o.trainerId),
      secretId: 0,
    },
    mons,
  };
}
