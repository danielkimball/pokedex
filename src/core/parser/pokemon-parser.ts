/**
 * Gen 4 Pokemon data parser.
 *
 * Pokemon data structure:
 * - Bytes 0-3: PID (unencrypted)
 * - Bytes 4-5: unused/zero
 * - Bytes 6-7: Checksum (unencrypted)
 * - Bytes 8-135: Encrypted data (4 × 32-byte blocks A/B/C/D)
 * - Bytes 136-235: Battle stats (party only, encrypted with PID)
 *
 * Decryption pipeline:
 * 1. Read PID and checksum (unencrypted)
 * 2. XOR bytes 8-135 with PRNG keystream seeded by checksum
 * 3. Unshuffle 4 blocks using PID to canonical ABCD order
 * 4. Parse fields from each block
 */

import { decryptData, decryptBattleStats } from '../crypto/decrypt';
import { unshuffleBlocks } from '../crypto/shuffle';
import { decodeNickname, decodeOTName } from '../text/decoder';
import { readU8, readU16, readU32, toDataView, extractBits } from '../../utils/binary';

/** Size of a stored (PC) Pokemon in bytes */
export const STORED_SIZE = 136;

/** Size of a party Pokemon in bytes */
export const PARTY_SIZE = 236;

/** Parsed Pokemon data */
export interface Pokemon {
  // Header (unencrypted)
  pid: number;
  checksum: number;

  // Block A - Growth
  species: number;
  heldItem: number;
  otId: number;      // full 32-bit OT ID
  otIdPublic: number; // visible trainer ID (lower 16)
  otSid: number;      // secret ID (upper 16)
  experience: number;
  friendship: number;
  ability: number;
  markings: number;
  language: number;
  evHp: number;
  evAtk: number;
  evDef: number;
  evSpe: number;
  evSpa: number;
  evSpd: number;
  contestCool: number;
  contestBeauty: number;
  contestCute: number;
  contestSmart: number;
  contestTough: number;
  contestSheen: number;

  // Block B - Attacks
  move1: number;
  move2: number;
  move3: number;
  move4: number;
  pp1: number;
  pp2: number;
  pp3: number;
  pp4: number;
  ppUp1: number;
  ppUp2: number;
  ppUp3: number;
  ppUp4: number;
  ivHp: number;
  ivAtk: number;
  ivDef: number;
  ivSpe: number;
  ivSpa: number;
  ivSpd: number;
  isEgg: boolean;
  isNicknamed: boolean;

  // Block C - Condition
  nickname: string;
  originGame: number;

  // Block D - Origins
  otName: string;
  dateEggReceived: [number, number, number] | null;
  dateMet: [number, number, number] | null;
  eggLocationDP: number;
  metLocationDP: number;
  eggLocationPt: number;
  metLocationPt: number;
  pokerus: number;
  pokeball: number;
  metLevel: number;
  otGender: number; // 0 = male, 1 = female
  encounterType: number;

  // Derived
  nature: number;
  isShiny: boolean;
  gender: number; // 0 = male, 1 = female, 2 = genderless

  // Party battle stats (only present for party Pokemon)
  battleStats?: BattleStats;
}

export interface BattleStats {
  status: number;
  level: number;
  capsule: number;
  currentHp: number;
  maxHp: number;
  atk: number;
  def: number;
  spe: number;
  spa: number;
  spd: number;
}

/**
 * Parse a Pokemon from raw (encrypted) bytes.
 * @param raw - Raw bytes (136 for stored, 236 for party)
 * @returns Parsed Pokemon, or null if the slot is empty
 */
export function parsePokemon(raw: Uint8Array): Pokemon | null {
  if (raw.length < STORED_SIZE) {
    throw new Error(`Data too short: ${raw.length} bytes, need at least ${STORED_SIZE}`);
  }

  const headerView = toDataView(raw);

  // Read unencrypted header
  const pid = readU32(headerView, 0);
  const checksum = readU16(headerView, 6);

  // Empty slot check (all zeros)
  if (pid === 0 && checksum === 0) {
    // Could still be valid if species is set, but usually empty
    // Check a few more bytes
    let allZero = true;
    for (let i = 0; i < 16; i++) {
      if (raw[i] !== 0) { allZero = false; break; }
    }
    if (allZero) return null;
  }

  // Decrypt the 128-byte data region (bytes 8-135)
  const encryptedData = raw.slice(8, 136);
  const decryptedData = decryptData(encryptedData, checksum);

  // Unshuffle blocks to canonical ABCD order
  const blocks = unshuffleBlocks(decryptedData, pid);
  const blockView = toDataView(blocks);

  // Parse Block A (offset 0-31): Growth
  const species = readU16(blockView, 0x00);
  if (species === 0 || species > 493) return null; // invalid species

  const heldItem = readU16(blockView, 0x02);
  const otId = readU32(blockView, 0x04);
  const otIdPublic = otId & 0xFFFF;
  const otSid = (otId >>> 16) & 0xFFFF;
  const experience = readU32(blockView, 0x08);
  const friendship = readU8(blockView, 0x14);
  const ability = readU8(blockView, 0x15);
  const markings = readU8(blockView, 0x16);
  const language = readU8(blockView, 0x17);
  const evHp = readU8(blockView, 0x18);
  const evAtk = readU8(blockView, 0x19);
  const evDef = readU8(blockView, 0x1A);
  const evSpe = readU8(blockView, 0x1B);
  const evSpa = readU8(blockView, 0x1C);
  const evSpd = readU8(blockView, 0x1D);
  const contestCool = readU8(blockView, 0x1E);
  const contestBeauty = readU8(blockView, 0x1F);

  // Block A continued (some fields overflow into what might seem like B space,
  // but within the 32-byte block A boundary)

  // Parse Block B (offset 32-63): Attacks
  const bBase = 0x20;
  const move1 = readU16(blockView, bBase + 0x00);
  const move2 = readU16(blockView, bBase + 0x02);
  const move3 = readU16(blockView, bBase + 0x04);
  const move4 = readU16(blockView, bBase + 0x06);
  const pp1 = readU8(blockView, bBase + 0x08);
  const pp2 = readU8(blockView, bBase + 0x09);
  const pp3 = readU8(blockView, bBase + 0x0A);
  const pp4 = readU8(blockView, bBase + 0x0B);
  const ppUpByte1 = readU8(blockView, bBase + 0x0C);
  const ppUpByte2 = readU8(blockView, bBase + 0x0D);
  const ppUp1 = ppUpByte1 & 0x03;
  const ppUp2 = (ppUpByte1 >>> 2) & 0x03;
  const ppUp3 = (ppUpByte1 >>> 4) & 0x03;
  const ppUp4 = (ppUpByte1 >>> 6) & 0x03;

  // IV bit-packed in 32 bits at Block B offset 0x10 (absolute 0x30)
  const ivWord = readU32(blockView, bBase + 0x10);
  const ivHp = extractBits(ivWord, 0, 5);
  const ivAtk = extractBits(ivWord, 5, 5);
  const ivDef = extractBits(ivWord, 10, 5);
  const ivSpe = extractBits(ivWord, 15, 5);
  const ivSpa = extractBits(ivWord, 20, 5);
  const ivSpd = extractBits(ivWord, 25, 5);
  const isEgg = !!(ivWord & (1 << 30));
  const isNicknamed = !!(ivWord & (1 << 31));

  // Parse Block C (offset 64-95): Condition
  const cBase = 0x40;
  const nickname = decodeNickname(blocks, cBase + 0x00);
  const originGame = readU8(blockView, cBase + 0x18);

  // Parse Block D (offset 96-127): Origins
  const dBase = 0x60;
  const otName = decodeOTName(blocks, dBase + 0x00);

  const eggYear = readU8(blockView, dBase + 0x10);
  const eggMonth = readU8(blockView, dBase + 0x11);
  const eggDay = readU8(blockView, dBase + 0x12);
  const dateEggReceived: [number, number, number] | null =
    (eggYear || eggMonth || eggDay) ? [2000 + eggYear, eggMonth, eggDay] : null;

  const metYear = readU8(blockView, dBase + 0x13);
  const metMonth = readU8(blockView, dBase + 0x14);
  const metDay = readU8(blockView, dBase + 0x15);
  const dateMet: [number, number, number] | null =
    (metYear || metMonth || metDay) ? [2000 + metYear, metMonth, metDay] : null;

  const eggLocationDP = readU16(blockView, dBase + 0x16);
  const metLocationDP = readU16(blockView, dBase + 0x18);
  const pokerus = readU8(blockView, dBase + 0x1A);
  const pokeball = readU8(blockView, dBase + 0x1B);

  const metLevelByte = readU8(blockView, dBase + 0x1C);
  const metLevelFlags = readU8(blockView, dBase + 0x1D);
  const metLevel = metLevelByte & 0x7F;
  const otGender = (metLevelFlags >>> 7) & 1;
  const encounterType = readU8(blockView, dBase + 0x1E);

  const eggLocationPt = readU16(blockView, dBase + 0x1E); // Pt/HGSS extended location
  const metLocationPt = readU16(blockView, dBase + 0x1E); // shared field reuse

  // Contest stats continued from block A
  const contestCute = readU8(blockView, 0x1E);   // These are actually unused space
  const contestSmart = readU8(blockView, 0x1F);   // in block A
  const contestTough = 0;
  const contestSheen = 0;

  // Derived values
  const nature = pid % 25;
  const pidHigh = (pid >>> 16) & 0xFFFF;
  const pidLow = pid & 0xFFFF;
  const isShiny = ((otIdPublic ^ otSid) ^ (pidHigh ^ pidLow)) < 8;

  // Gender determination would need species gender ratio data
  // For now, use a simplified approach
  const gender = 2; // default genderless, will be resolved with species data

  // Parse party battle stats if present
  let battleStats: BattleStats | undefined;
  if (raw.length >= PARTY_SIZE) {
    const encryptedStats = raw.slice(136, 236);
    const decryptedStats = decryptBattleStats(encryptedStats, pid);
    const statsView = toDataView(decryptedStats);

    battleStats = {
      status: readU32(statsView, 0x00),
      level: readU8(statsView, 0x04),
      capsule: readU8(statsView, 0x05),
      currentHp: readU16(statsView, 0x08),
      maxHp: readU16(statsView, 0x0A),
      atk: readU16(statsView, 0x0C),
      def: readU16(statsView, 0x0E),
      spe: readU16(statsView, 0x10),
      spa: readU16(statsView, 0x12),
      spd: readU16(statsView, 0x14),
    };
  }

  return {
    pid, checksum,
    species, heldItem, otId, otIdPublic, otSid,
    experience, friendship, ability, markings, language,
    evHp, evAtk, evDef, evSpe, evSpa, evSpd,
    contestCool, contestBeauty, contestCute, contestSmart, contestTough, contestSheen,
    move1, move2, move3, move4,
    pp1, pp2, pp3, pp4,
    ppUp1, ppUp2, ppUp3, ppUp4,
    ivHp, ivAtk, ivDef, ivSpe, ivSpa, ivSpd,
    isEgg, isNicknamed,
    nickname, originGame,
    otName, dateEggReceived, dateMet,
    eggLocationDP, metLocationDP, eggLocationPt, metLocationPt,
    pokerus, pokeball, metLevel, otGender, encounterType,
    nature, isShiny, gender,
    battleStats,
  };
}

/**
 * Compute the checksum for decrypted Pokemon data blocks.
 * Sum of all 16-bit words in the 128-byte data, truncated to 16 bits.
 */
export function computeChecksum(decryptedBlocks: Uint8Array): number {
  const view = new DataView(decryptedBlocks.buffer, decryptedBlocks.byteOffset, decryptedBlocks.byteLength);
  let sum = 0;
  for (let i = 0; i < 128; i += 2) {
    sum = (sum + view.getUint16(i, true)) & 0xFFFF;
  }
  return sum;
}
