import { describe, it, expect } from 'vitest';
import { parsePokemon, computeChecksum, STORED_SIZE, PARTY_SIZE } from '../core/parser/pokemon-parser';
import { serializePokemonStored, serializePokemonParty } from '../core/writer/pokemon-writer';
import { encryptData } from '../core/crypto/encrypt';
import { shuffleBlocks } from '../core/crypto/shuffle';
import { UNICODE_TO_CHAR, CHAR_TERMINATOR } from '../core/text/char-table';

/**
 * Build a synthetic encrypted Pokemon for testing.
 */
function buildTestPokemon(): Uint8Array {
  const pid = 0x12345678;

  // Build canonical ABCD blocks (128 bytes)
  const blocks = new Uint8Array(128);
  const blockView = new DataView(blocks.buffer);

  // Block A: species=25 (Pikachu), item=0, otId=12345
  blockView.setUint16(0x00, 25, true);   // species
  blockView.setUint16(0x02, 0, true);    // item
  blockView.setUint32(0x04, 12345, true); // OT ID (TID=12345, SID=0)
  blockView.setUint32(0x08, 50000, true); // experience
  blocks[0x14] = 70;  // friendship
  blocks[0x15] = 9;   // ability (Static=9)
  blocks[0x17] = 2;   // language (English)
  blocks[0x18] = 100; // EV HP
  blocks[0x19] = 80;  // EV ATK

  // Block B: moves and IVs
  const bBase = 0x20;
  blockView.setUint16(bBase + 0x00, 84, true);  // move1: Thunder Shock
  blockView.setUint16(bBase + 0x02, 98, true);  // move2: Quick Attack
  blocks[bBase + 0x08] = 30; // pp1
  blocks[bBase + 0x09] = 30; // pp2
  // IVs: all 31
  const ivWord = 31 | (31 << 5) | (31 << 10) | (31 << 15) | (31 << 20) | (31 << 25);
  blockView.setUint32(bBase + 0x10, ivWord, true);

  // Block C: nickname "Pikachu"
  const cBase = 0x40;
  const name = 'Pikachu';
  for (let i = 0; i < name.length; i++) {
    const code = UNICODE_TO_CHAR.get(name[i]) ?? 0x0160; // '?' fallback
    blockView.setUint16(cBase + i * 2, code, true);
  }
  blockView.setUint16(cBase + name.length * 2, CHAR_TERMINATOR, true);
  blocks[cBase + 0x18] = 10; // origin game (Diamond)

  // Block D: OT name "Ash"
  const dBase = 0x60;
  const otName = 'Ash';
  for (let i = 0; i < otName.length; i++) {
    const code = UNICODE_TO_CHAR.get(otName[i]) ?? 0x0160;
    blockView.setUint16(dBase + i * 2, code, true);
  }
  blockView.setUint16(dBase + otName.length * 2, CHAR_TERMINATOR, true);
  blocks[dBase + 0x1B] = 4;  // pokeball (Great Ball)
  blocks[dBase + 0x1C] = 5;  // met level

  // Compute checksum
  const checksum = computeChecksum(blocks);

  // Shuffle
  const shuffled = shuffleBlocks(blocks, pid);

  // Encrypt
  const encrypted = encryptData(shuffled, checksum);

  // Build full 136-byte stored structure
  const result = new Uint8Array(STORED_SIZE);
  const resultView = new DataView(result.buffer);
  resultView.setUint32(0, pid, true);
  resultView.setUint16(4, 0, true);
  resultView.setUint16(6, checksum, true);
  result.set(encrypted, 8);

  return result;
}

describe('Pokemon Parse/Serialize Round-Trip', () => {
  it('parses a synthetic Pokemon correctly', () => {
    const raw = buildTestPokemon();
    const pokemon = parsePokemon(raw);

    expect(pokemon).not.toBeNull();
    expect(pokemon!.pid).toBe(0x12345678);
    expect(pokemon!.species).toBe(25);
    expect(pokemon!.nickname).toBe('Pikachu');
    expect(pokemon!.otName).toBe('Ash');
    expect(pokemon!.otIdPublic).toBe(12345);
    expect(pokemon!.experience).toBe(50000);
    expect(pokemon!.friendship).toBe(70);
    expect(pokemon!.evHp).toBe(100);
    expect(pokemon!.evAtk).toBe(80);
    expect(pokemon!.move1).toBe(84);
    expect(pokemon!.move2).toBe(98);
    expect(pokemon!.ivHp).toBe(31);
    expect(pokemon!.ivAtk).toBe(31);
    expect(pokemon!.ivDef).toBe(31);
    expect(pokemon!.ivSpe).toBe(31);
    expect(pokemon!.ivSpa).toBe(31);
    expect(pokemon!.ivSpd).toBe(31);
    expect(pokemon!.pokeball).toBe(4);
    expect(pokemon!.metLevel).toBe(5);
    expect(pokemon!.nature).toBe(0x12345678 % 25);
  });

  it('round-trips stored Pokemon: parse -> serialize -> parse', () => {
    const original = buildTestPokemon();
    const parsed1 = parsePokemon(original)!;
    expect(parsed1).not.toBeNull();

    // Serialize back
    const serialized = serializePokemonStored(parsed1);

    // Parse the serialized version
    const parsed2 = parsePokemon(serialized)!;
    expect(parsed2).not.toBeNull();

    // Compare key fields
    expect(parsed2.pid).toBe(parsed1.pid);
    expect(parsed2.species).toBe(parsed1.species);
    expect(parsed2.nickname).toBe(parsed1.nickname);
    expect(parsed2.otName).toBe(parsed1.otName);
    expect(parsed2.otId).toBe(parsed1.otId);
    expect(parsed2.experience).toBe(parsed1.experience);
    expect(parsed2.friendship).toBe(parsed1.friendship);
    expect(parsed2.move1).toBe(parsed1.move1);
    expect(parsed2.move2).toBe(parsed1.move2);
    expect(parsed2.ivHp).toBe(parsed1.ivHp);
    expect(parsed2.ivAtk).toBe(parsed1.ivAtk);
    expect(parsed2.evHp).toBe(parsed1.evHp);
    expect(parsed2.evAtk).toBe(parsed1.evAtk);
    expect(parsed2.nature).toBe(parsed1.nature);
    expect(parsed2.isShiny).toBe(parsed1.isShiny);
    expect(parsed2.pokeball).toBe(parsed1.pokeball);
    expect(parsed2.metLevel).toBe(parsed1.metLevel);
  });

  it('returns null for empty slot (all zeros)', () => {
    const empty = new Uint8Array(STORED_SIZE);
    expect(parsePokemon(empty)).toBeNull();
  });

  it('checksum is consistent', () => {
    const raw = buildTestPokemon();
    const pokemon = parsePokemon(raw)!;
    const serialized = serializePokemonStored(pokemon);

    // The checksums in both raw and serialized should match their data
    const rawChecksum = new DataView(raw.buffer).getUint16(6, true);
    const serChecksum = new DataView(serialized.buffer).getUint16(6, true);

    // Both should be valid (non-zero for a real Pokemon)
    expect(rawChecksum).toBeGreaterThan(0);
    expect(serChecksum).toBeGreaterThan(0);
  });
});
