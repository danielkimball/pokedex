/**
 * Serialize a Pokemon back into encrypted binary format.
 *
 * Pipeline (reverse of parsing):
 * 1. Write fields into 4 × 32-byte blocks (ABCD order)
 * 2. Compute checksum over the 128 bytes
 * 3. Shuffle blocks using PID
 * 4. Encrypt with PRNG seeded by checksum
 * 5. Write PID + checksum header
 * 6. For party: encrypt battle stats with PRNG seeded by PID
 */

import { encryptData, encryptBattleStats } from '../crypto/encrypt';
import { shuffleBlocks } from '../crypto/shuffle';
import { encodeNickname, encodeOTName } from '../text/encoder';
import { writeU8, writeU16, writeU32, setBits } from '../../utils/binary';
import { computeChecksum, STORED_SIZE, PARTY_SIZE, type Pokemon } from '../parser/pokemon-parser';

/**
 * Serialize a Pokemon to stored (PC) format (136 bytes).
 */
export function serializePokemonStored(pokemon: Pokemon): Uint8Array {
  const result = new Uint8Array(STORED_SIZE);
  const view = new DataView(result.buffer);

  // Build the 128-byte data in canonical ABCD order
  const blocks = buildBlocks(pokemon);

  // Compute checksum
  const checksum = computeChecksum(blocks);

  // Shuffle blocks
  const shuffled = shuffleBlocks(blocks, pokemon.pid);

  // Encrypt
  const encrypted = encryptData(shuffled, checksum);

  // Write header (unencrypted)
  writeU32(view, 0, pokemon.pid);
  writeU16(view, 4, 0); // unused
  writeU16(view, 6, checksum);

  // Write encrypted data
  result.set(encrypted, 8);

  return result;
}

/**
 * Serialize a Pokemon to party format (236 bytes).
 */
export function serializePokemonParty(pokemon: Pokemon): Uint8Array {
  const result = new Uint8Array(PARTY_SIZE);

  // First 136 bytes = stored format
  const stored = serializePokemonStored(pokemon);
  result.set(stored, 0);

  // Build and encrypt battle stats (bytes 136-235)
  if (pokemon.battleStats) {
    const stats = buildBattleStats(pokemon);
    const encrypted = encryptBattleStats(stats, pokemon.pid);
    result.set(encrypted, 136);
  }

  return result;
}

/**
 * Build the 128-byte data blocks in canonical ABCD order.
 */
function buildBlocks(pokemon: Pokemon): Uint8Array {
  const blocks = new Uint8Array(128);
  const view = new DataView(blocks.buffer);

  // Block A (offset 0-31): Growth
  writeU16(view, 0x00, pokemon.species);
  writeU16(view, 0x02, pokemon.heldItem);
  writeU32(view, 0x04, pokemon.otId);
  writeU32(view, 0x08, pokemon.experience);
  writeU8(view, 0x0C, pokemon.friendship);
  writeU8(view, 0x0D, pokemon.ability);
  writeU8(view, 0x0E, pokemon.markings);
  writeU8(view, 0x0F, pokemon.language);
  writeU8(view, 0x10, pokemon.evHp);
  writeU8(view, 0x11, pokemon.evAtk);
  writeU8(view, 0x12, pokemon.evDef);
  writeU8(view, 0x13, pokemon.evSpe);
  writeU8(view, 0x14, pokemon.evSpa);
  writeU8(view, 0x15, pokemon.evSpd);
  writeU8(view, 0x16, pokemon.contestCool);
  writeU8(view, 0x17, pokemon.contestBeauty);
  writeU8(view, 0x18, pokemon.contestCute);
  writeU8(view, 0x19, pokemon.contestSmart);
  writeU8(view, 0x1A, pokemon.contestTough);
  writeU8(view, 0x1B, pokemon.contestSheen);

  // Block B (offset 32-63): Attacks
  const bBase = 0x20;
  writeU16(view, bBase + 0x00, pokemon.move1);
  writeU16(view, bBase + 0x02, pokemon.move2);
  writeU16(view, bBase + 0x04, pokemon.move3);
  writeU16(view, bBase + 0x06, pokemon.move4);
  writeU8(view, bBase + 0x08, pokemon.pp1);
  writeU8(view, bBase + 0x09, pokemon.pp2);
  writeU8(view, bBase + 0x0A, pokemon.pp3);
  writeU8(view, bBase + 0x0B, pokemon.pp4);

  writeU8(view, bBase + 0x0C, pokemon.ppUp1);
  writeU8(view, bBase + 0x0D, pokemon.ppUp2);
  writeU8(view, bBase + 0x0E, pokemon.ppUp3);
  writeU8(view, bBase + 0x0F, pokemon.ppUp4);

  // IVs bit-packed into 32 bits
  let ivWord = 0;
  ivWord = setBits(ivWord, 0, 5, pokemon.ivHp);
  ivWord = setBits(ivWord, 5, 5, pokemon.ivAtk);
  ivWord = setBits(ivWord, 10, 5, pokemon.ivDef);
  ivWord = setBits(ivWord, 15, 5, pokemon.ivSpe);
  ivWord = setBits(ivWord, 20, 5, pokemon.ivSpa);
  ivWord = setBits(ivWord, 25, 5, pokemon.ivSpd);
  if (pokemon.isEgg) ivWord |= (1 << 30);
  if (pokemon.isNicknamed) ivWord |= (1 << 31);
  writeU32(view, bBase + 0x10, ivWord >>> 0);
  const formFlags = (pokemon.fatefulEncounter ? 1 : 0)
    | (((pokemon.gender ?? 2) & 0x03) << 1)
    | (((pokemon.form ?? 0) & 0x1F) << 3);
  writeU8(view, bBase + 0x18, formFlags);
  writeU8(view, bBase + 0x19, pokemon.shinyLeaf ?? 0);
  writeU16(view, bBase + 0x1C, pokemon.eggLocationPt);
  writeU16(view, bBase + 0x1E, pokemon.metLocationPt);

  // Block C (offset 64-95): Condition
  const cBase = 0x40;
  const nicknameBytes = encodeNickname(pokemon.nickname);
  blocks.set(nicknameBytes, cBase + 0x00);
  writeU8(view, cBase + 0x17, pokemon.originGame);

  // Block D (offset 96-127): Origins
  const dBase = 0x60;
  const otNameBytes = encodeOTName(pokemon.otName);
  blocks.set(otNameBytes, dBase + 0x00);

  if (pokemon.dateEggReceived) {
    writeU8(view, dBase + 0x10, pokemon.dateEggReceived[0] - 2000);
    writeU8(view, dBase + 0x11, pokemon.dateEggReceived[1]);
    writeU8(view, dBase + 0x12, pokemon.dateEggReceived[2]);
  }

  if (pokemon.dateMet) {
    writeU8(view, dBase + 0x13, pokemon.dateMet[0] - 2000);
    writeU8(view, dBase + 0x14, pokemon.dateMet[1]);
    writeU8(view, dBase + 0x15, pokemon.dateMet[2]);
  }

  writeU16(view, dBase + 0x16, pokemon.eggLocationDP);
  writeU16(view, dBase + 0x18, pokemon.metLocationDP);
  writeU8(view, dBase + 0x1A, pokemon.pokerus);
  writeU8(view, dBase + 0x1B, pokemon.pokeballDPPt ?? (pokemon.pokeball <= 16 ? pokemon.pokeball : 4));

  const metLevelByte = (pokemon.metLevel & 0x7F) | ((pokemon.otGender & 1) << 7);
  writeU8(view, dBase + 0x1C, metLevelByte);
  writeU8(view, dBase + 0x1D, pokemon.encounterType);
  writeU8(view, dBase + 0x1E, pokemon.pokeballHGSS ?? 0);

  return blocks;
}

/**
 * Build the 100-byte battle stats block.
 */
function buildBattleStats(pokemon: Pokemon): Uint8Array {
  const stats = new Uint8Array(100);
  const view = new DataView(stats.buffer);

  if (!pokemon.battleStats) return stats;

  const bs = pokemon.battleStats;
  writeU32(view, 0x00, bs.status);
  writeU8(view, 0x04, bs.level);
  writeU8(view, 0x05, bs.capsule);
  writeU16(view, 0x08, bs.currentHp);
  writeU16(view, 0x0A, bs.maxHp);
  writeU16(view, 0x0C, bs.atk);
  writeU16(view, 0x0E, bs.def);
  writeU16(view, 0x10, bs.spe);
  writeU16(view, 0x12, bs.spa);
  writeU16(view, 0x14, bs.spd);

  return stats;
}
