/**
 * Generation 1 (Red / Blue / Yellow) save parser — read-only.
 *
 * 32 KB SRAM, no encryption. Species are stored as internal index numbers
 * (NOT National Dex order) and must be remapped. There is no PID, nature,
 * ability, held item, or shininess in Gen 1.
 *
 * Layout (English R/B/Y):
 *   0x2598 player name (11)        0x2605 trainer ID (2, big-endian)
 *   0x284C current box number      0x2F2C party (count, species list, 6x44 mons,
 *                                          OT names, nicknames)
 *   0x30C0 current (open) box      Boxes 1-6 @ 0x4000, 7-12 @ 0x6000
 */

import { GEN1_INDEX_TO_DEX } from '../constants/species-gen1';
import { decodeGBText } from '../text/gb-text';
import type { Game } from '../constants/games';
import {
  type UniversalMon,
  type UniversalSave,
  type UniversalStats,
  zeroStats,
  syntheticPid,
} from './universal';

const PLAYER_NAME = 0x2598;
/** Owned badges bitfield: bit 0 = Boulder … bit 7 = Earth. */
const BADGES = 0x2602;
const TRAINER_ID = 0x2605;
const CURRENT_BOX_NUM = 0x284c;
const PARTY = 0x2f2c;
const PARTY_MONS = 0x2f34;
const PARTY_OT = 0x303c;
const PARTY_NICK = 0x307e;
const CURRENT_BOX = 0x30c0;

const BOX_COUNT = 12;
const MONS_PER_BOX = 20;
const PARTY_MON_SIZE = 44;
const BOX_MON_SIZE = 33;
const BOX_SIZE = 1122; // count(1) + species(21) + 20*33 + 20*11 OT + 20*11 nick
const BOX_MONS_OFFSET = 22;
const BOX_OT_OFFSET = 22 + MONS_PER_BOX * BOX_MON_SIZE; // 682
const BOX_NICK_OFFSET = BOX_OT_OFFSET + MONS_PER_BOX * 11; // 902

const CHECKSUM_START = 0x2598;
const CHECKSUM_END = 0x3522; // inclusive
const CHECKSUM_AT = 0x3523;

/** Validate the Gen 1 main-data checksum (8-bit complemented sum). */
export function isGen1Save(data: Uint8Array): boolean {
  if (data.length < 0x8000) return false;
  let sum = 0;
  for (let i = CHECKSUM_START; i <= CHECKSUM_END; i++) sum += data[i];
  return ((~sum) & 0xff) === data[CHECKSUM_AT];
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
  level: number,
  nickname: string,
  otName: string,
  location: 'party' | 'box',
  containerIndex: number,
  slotIndex: number,
): UniversalMon | null {
  const idx = data[monOff];
  const species = GEN1_INDEX_TO_DEX[idx] ?? 0;
  if (species === 0) return null;

  const otId = readU16BE(data, monOff + 0x0c);
  const moves: [number, number, number, number] = [
    data[monOff + 0x08],
    data[monOff + 0x09],
    data[monOff + 0x0a],
    data[monOff + 0x0b],
  ];
  const ivs = decodeDVs(data, monOff + 0x1b);

  return {
    species,
    nickname,
    level,
    otName,
    otId,
    otSid: 0,
    isShiny: false, // Gen 1 has no shininess
    isEgg: false, // Gen 1 has no eggs
    gender: 2, // Gen 1 stores no gender
    nature: 0,
    ability: 0,
    heldItem: 0,
    moves,
    ivs,
    evs: zeroStats(),
    pid: syntheticPid([species, otId, monOff, ivs.atk * 16 + ivs.def]),
    location,
    containerIndex,
    slotIndex,
  };
}

export function parseGen1(buffer: ArrayBuffer, game: Game): UniversalSave {
  const data = new Uint8Array(buffer);
  const mons: UniversalMon[] = [];

  // Party
  const partyCount = Math.min(data[PARTY], 6);
  for (let i = 0; i < partyCount; i++) {
    const monOff = PARTY_MONS + i * PARTY_MON_SIZE;
    const level = data[monOff + 0x21];
    const nickname = decodeGBText(data, PARTY_NICK + i * 11, 11);
    const otName = decodeGBText(data, PARTY_OT + i * 11, 11);
    const mon = buildMon(data, monOff, level, nickname, otName, 'party', 0, i);
    if (mon) mons.push(mon);
  }

  // Boxes (use the live copy at 0x30C0 for the currently-open box)
  const currentBox = data[CURRENT_BOX_NUM] & 0x7f;
  for (let b = 0; b < BOX_COUNT; b++) {
    const bankBase = b < 6 ? 0x4000 + b * BOX_SIZE : 0x6000 + (b - 6) * BOX_SIZE;
    const base = b === currentBox ? CURRENT_BOX : bankBase;
    const count = Math.min(data[base], MONS_PER_BOX);
    for (let i = 0; i < count; i++) {
      const monOff = base + BOX_MONS_OFFSET + i * BOX_MON_SIZE;
      const level = data[monOff + 0x03];
      const nickname = decodeGBText(data, base + BOX_NICK_OFFSET + i * 11, 11);
      const otName = decodeGBText(data, base + BOX_OT_OFFSET + i * 11, 11);
      const mon = buildMon(data, monOff, level, nickname, otName, 'box', b, i);
      if (mon) mons.push(mon);
    }
  }

  return {
    generation: 1,
    game,
    family: game === 'Yellow' ? 'Y' : 'RB',
    trainer: {
      name: decodeGBText(data, PLAYER_NAME, 11),
      trainerId: readU16BE(data, TRAINER_ID),
      secretId: 0,
      badges: data[BADGES] ?? 0,
    },
    mons,
  };
}

/**
 * Read the Gen 1 badge bitfield from a raw save buffer (English R/B/Y @ 0x2602).
 * Safe to call on any buffer; returns 0 when the offset is out of range.
 */
export function readGen1Badges(data: Uint8Array | ArrayBuffer): number {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  if (bytes.length <= BADGES) return 0;
  return bytes[BADGES] ?? 0;
}
