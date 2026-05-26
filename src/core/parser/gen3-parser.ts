/**
 * Generation 3 (Ruby / Sapphire / Emerald / FireRed / LeafGreen) save parser — read-only.
 *
 * 128 KB flash. Two save slots (A @ 0x0000, B @ 0xE000); the one with the higher
 * save index is current. Each slot is 14 sections of 0x1000 bytes in rotating
 * order, each tagged with a section ID and the signature 0x08012025.
 *
 * Each Pokemon's 48-byte data region is four 12-byte substructures
 * (Growth / Attacks / EVs / Misc), XOR-encrypted with (OTID ^ PID) and ordered
 * by PID % 24. Species are stored as a Gen 3 internal index and remapped.
 */

import { GEN3_INDEX_TO_DEX } from '../constants/species-gen3';
import { GENDER_RATE, GROWTH_RATE } from '../constants/species-bio';
import { decodeGBAText } from '../text/gba-text';
import { readU16, readU32, toDataView } from '../../utils/binary';
import type { Game } from '../constants/games';
import {
  type UniversalMon,
  type UniversalSave,
  type UniversalStats,
} from './universal';

const SLOT_SIZE = 0xe000;
const SECTION_SIZE = 0x1000;
const SECTION_COUNT = 14;
const FOOTER_ID = 0xff4;
const FOOTER_SIG = 0xff8;
const FOOTER_SAVE_INDEX = 0xffc;
const SIGNATURE = 0x08012025;

const BOX_COUNT = 14;
const MONS_PER_BOX = 30;
const BOX_MON_SIZE = 80;
const PARTY_MON_SIZE = 100;

// Substructure ordering by PID % 24 (G=Growth, A=Attacks, E=EVs, M=Misc).
const SUBSTRUCT_ORDER = [
  'GAEM', 'GAME', 'GEAM', 'GEMA', 'GMAE', 'GMEA',
  'AGEM', 'AGME', 'AEGM', 'AEMG', 'AMGE', 'AMEG',
  'EGAM', 'EGMA', 'EAGM', 'EAMG', 'EMGA', 'EMAG',
  'MGAE', 'MGEA', 'MAGE', 'MAEG', 'MEGA', 'MEAG',
];

interface Slot {
  sections: Map<number, number>; // section ID -> absolute byte offset
  saveIndex: number;
}

function readSlot(data: Uint8Array, base: number): Slot | null {
  const view = toDataView(data);
  const sections = new Map<number, number>();
  let saveIndex = -1;
  for (let s = 0; s < SECTION_COUNT; s++) {
    const off = base + s * SECTION_SIZE;
    if (readU32(view, off + FOOTER_SIG) !== SIGNATURE) continue;
    const id = readU16(view, off + FOOTER_ID);
    sections.set(id, off);
    saveIndex = readU32(view, off + FOOTER_SAVE_INDEX);
  }
  if (sections.size === 0) return null;
  return { sections, saveIndex };
}

/** True if the buffer looks like a Gen 3 save (valid section signatures present). */
export function isGen3Save(data: Uint8Array): boolean {
  if (data.length < 0x20000) return false;
  return readSlot(data, 0) !== null || readSlot(data, SLOT_SIZE) !== null;
}

/** Choose the active slot (highest valid save index). */
function activeSlot(data: Uint8Array): Slot | null {
  const a = readSlot(data, 0);
  const b = readSlot(data, SLOT_SIZE);
  if (!a) return b;
  if (!b) return a;
  return b.saveIndex > a.saveIndex ? b : a;
}

/** Gen 3 family from the game code in section 0 (refined to a game by filename). */
function familyFromGameCode(code: number): { family: string; fallback: Game } {
  if (code === 0) return { family: 'RS', fallback: 'Ruby' };
  if (code === 1) return { family: 'FRLG', fallback: 'FireRed' };
  return { family: 'E', fallback: 'Emerald' };
}

function gen3Gender(pid: number, genderRate: number): number {
  if (genderRate < 0) return 2;
  if (genderRate === 0) return 0;
  if (genderRate === 8) return 1;
  return (pid & 0xff) < genderRate * 32 ? 1 : 0;
}

/** Minimum experience to be at `level` for a growth-rate group (1-6). */
function expAtLevel(level: number, growth: number): number {
  const n = level;
  switch (growth) {
    case 1: return Math.floor((5 * n ** 3) / 4); // slow
    case 3: return Math.floor((4 * n ** 3) / 5); // fast
    case 4: return Math.floor((6 / 5) * n ** 3 - 15 * n ** 2 + 100 * n - 140); // medium-slow
    case 5: // erratic
      if (n <= 50) return Math.floor((n ** 3 * (100 - n)) / 50);
      if (n <= 68) return Math.floor((n ** 3 * (150 - n)) / 100);
      if (n <= 98) return Math.floor((n ** 3 * (1274 + (n % 3) ** 2 - 9 * (n % 3) - 20 * Math.floor(n / 3))) / 1000);
      return Math.floor((n ** 3 * (160 - n)) / 100);
    case 6: // fluctuating
      if (n <= 15) return Math.floor(n ** 3 * ((Math.floor((n + 1) / 3) + 24) / 50));
      if (n <= 35) return Math.floor(n ** 3 * ((n + 14) / 50));
      return Math.floor(n ** 3 * ((Math.floor(n / 2) + 32) / 50));
    default: return n ** 3; // medium-fast
  }
}

export function expToLevel(exp: number, growth: number): number {
  for (let lvl = 100; lvl >= 1; lvl--) {
    if (exp >= expAtLevel(lvl, growth)) return lvl;
  }
  return 1;
}

function buildMon(
  raw: Uint8Array,
  storedLevel: number | null,
  location: 'party' | 'box',
  containerIndex: number,
  slotIndex: number,
): UniversalMon | null {
  const view = toDataView(raw);
  const pid = readU32(view, 0x00);
  const otId = readU32(view, 0x04);
  if (pid === 0 && otId === 0) return null; // empty slot

  // Decrypt the 48-byte data region with key = OTID ^ PID, then unshuffle.
  const key = (otId ^ pid) >>> 0;
  const dec = new Uint8Array(48);
  const decView = toDataView(dec);
  for (let i = 0; i < 12; i++) {
    const word = (readU32(view, 0x20 + i * 4) ^ key) >>> 0;
    decView.setUint32(i * 4, word, true);
  }

  const order = SUBSTRUCT_ORDER[pid % 24];
  const at = (letter: string) => order.indexOf(letter) * 12;
  const g = at('G');
  const a = at('A');
  const e = at('E');
  const m = at('M');

  // Growth
  const speciesIdx = readU16(decView, g + 0x00);
  const species = GEN3_INDEX_TO_DEX[speciesIdx] ?? 0;
  if (species === 0) return null;
  const heldItem = readU16(decView, g + 0x02);
  const experience = readU32(decView, g + 0x04);

  // Attacks
  const moves: [number, number, number, number] = [
    readU16(decView, a + 0x00),
    readU16(decView, a + 0x02),
    readU16(decView, a + 0x04),
    readU16(decView, a + 0x06),
  ];

  // EVs
  const evs: UniversalStats = {
    hp: dec[e + 0x00], atk: dec[e + 0x01], def: dec[e + 0x02],
    spe: dec[e + 0x03], spa: dec[e + 0x04], spd: dec[e + 0x05],
  };

  // Misc
  const origins = readU16(decView, m + 0x02);
  const originGame = (origins >> 7) & 0xf;
  const ivWord = readU32(decView, m + 0x04);
  const ivs: UniversalStats = {
    hp: ivWord & 0x1f,
    atk: (ivWord >> 5) & 0x1f,
    def: (ivWord >> 10) & 0x1f,
    spe: (ivWord >> 15) & 0x1f,
    spa: (ivWord >> 20) & 0x1f,
    spd: (ivWord >> 25) & 0x1f,
  };
  const isEgg = ((ivWord >> 30) & 1) === 1;

  const tid = otId & 0xffff;
  const sid = (otId >>> 16) & 0xffff;
  const isShiny = ((tid ^ sid ^ (pid & 0xffff) ^ (pid >>> 16)) & 0xffff) < 8;
  const growth = GROWTH_RATE[species] ?? 2;
  const level = storedLevel ?? expToLevel(experience, growth);

  return {
    species,
    nickname: decodeGBAText(raw, 0x08, 10),
    level,
    otName: decodeGBAText(raw, 0x14, 7),
    otId: tid,
    otSid: sid,
    isShiny,
    isEgg,
    gender: gen3Gender(pid, GENDER_RATE[species] ?? -1),
    nature: pid % 25,
    ability: (ivWord >> 31) & 1,
    heldItem,
    moves,
    ivs,
    evs,
    pid,
    originGame,
    location,
    containerIndex,
    slotIndex,
  };
}

export function parseGen3(buffer: ArrayBuffer, gameHint: Game | null): UniversalSave {
  const data = new Uint8Array(buffer);
  const slot = activeSlot(data);
  if (!slot) throw new Error('No valid Gen 3 save slot found.');

  const view = toDataView(data);
  const sec0 = slot.sections.get(0);
  if (sec0 === undefined) throw new Error('Gen 3 trainer section missing.');

  const gameCode = readU32(view, sec0 + 0x00ac);
  const { family, fallback } = familyFromGameCode(gameCode);
  // Filename hint refines Ruby/Sapphire & FireRed/LeafGreen; otherwise use the
  // family's default. Only accept a hint that belongs to the detected family.
  const isFrlg = family === 'FRLG';
  const isRs = family === 'RS';
  let game = fallback;
  if (gameHint) {
    if (isFrlg && (gameHint === 'FireRed' || gameHint === 'LeafGreen')) game = gameHint;
    else if (isRs && (gameHint === 'Ruby' || gameHint === 'Sapphire')) game = gameHint;
    else if (family === 'E' && gameHint === 'Emerald') game = gameHint;
  }

  const trainer = {
    name: decodeGBAText(data, sec0 + 0x00, 7),
    trainerId: readU16(view, sec0 + 0x0a),
    secretId: readU16(view, sec0 + 0x0c),
  };

  const mons: UniversalMon[] = [];

  // Party lives in section 1; its offset differs between FRLG and RS/E.
  const sec1 = slot.sections.get(1);
  if (sec1 !== undefined) {
    const partyCountOff = isFrlg ? 0x0034 : 0x0234;
    const partyDataOff = isFrlg ? 0x0038 : 0x0238;
    const partyCount = Math.min(readU32(view, sec1 + partyCountOff), 6);
    for (let i = 0; i < partyCount; i++) {
      const off = sec1 + partyDataOff + i * PARTY_MON_SIZE;
      const raw = data.subarray(off, off + PARTY_MON_SIZE);
      const level = data[off + 0x54];
      const mon = buildMon(raw, level, 'party', 0, i);
      if (mon) mons.push(mon);
    }
  }

  // PC boxes span sections 5-13, concatenated in section-ID order.
  // Sections 5-12 contribute 0xF80 data bytes each; section 13 contributes 0x7D0.
  const pcParts: Uint8Array[] = [];
  for (let id = 5; id <= 13; id++) {
    const off = slot.sections.get(id);
    if (off === undefined) continue;
    const size = id === 13 ? 0x7d0 : 0xf80;
    pcParts.push(data.subarray(off, off + size));
  }
  if (pcParts.length > 0) {
    const total = pcParts.reduce((n, p) => n + p.length, 0);
    const pc = new Uint8Array(total);
    let p = 0;
    for (const part of pcParts) { pc.set(part, p); p += part.length; }

    for (let b = 0; b < BOX_COUNT; b++) {
      for (let s = 0; s < MONS_PER_BOX; s++) {
        const idx = b * MONS_PER_BOX + s;
        const off = 0x04 + idx * BOX_MON_SIZE;
        const raw = pc.subarray(off, off + BOX_MON_SIZE);
        if (raw.length < BOX_MON_SIZE) continue;
        const mon = buildMon(raw, null, 'box', b, s);
        if (mon) mons.push(mon);
      }
    }
  }

  return { generation: 3, game, family, trainer, mons };
}
