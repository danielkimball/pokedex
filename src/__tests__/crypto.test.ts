import { describe, it, expect } from 'vitest';
import { nextSeed, highBits, generateKeystream } from '../core/crypto/prng';
import { crc16 } from '../core/crypto/crc16';
import { decryptData } from '../core/crypto/decrypt';
import { encryptData } from '../core/crypto/encrypt';
import { shuffleBlocks, unshuffleBlocks, getShuffleIndex, BLOCK_SIZE, BLOCK_COUNT } from '../core/crypto/shuffle';

describe('PRNG', () => {
  it('produces correct next seed', () => {
    // Known LCRNG sequence: seed=0 -> 0x6073
    const s1 = nextSeed(0);
    expect(s1).toBe(0x6073);

    // seed=0x6073 -> next value
    const s2 = nextSeed(s1);
    expect(s2).toBe((Math.imul(0x41C64E6D, 0x6073) + 0x6073) >>> 0);
  });

  it('extracts high bits correctly', () => {
    expect(highBits(0x12345678)).toBe(0x1234);
    expect(highBits(0xFFFF0000)).toBe(0xFFFF);
    expect(highBits(0x0000FFFF)).toBe(0x0000);
  });

  it('generates keystream of correct length', () => {
    const ks = generateKeystream(0, 10);
    expect(ks).toHaveLength(10);
    expect(ks).toBeInstanceOf(Uint16Array);
  });

  it('generates deterministic keystream', () => {
    const ks1 = generateKeystream(12345, 20);
    const ks2 = generateKeystream(12345, 20);
    expect(Array.from(ks1)).toEqual(Array.from(ks2));
  });

  it('generates different keystreams for different seeds', () => {
    const ks1 = generateKeystream(1, 5);
    const ks2 = generateKeystream(2, 5);
    expect(Array.from(ks1)).not.toEqual(Array.from(ks2));
  });
});

describe('CRC-16-CCITT', () => {
  it('computes CRC for empty data', () => {
    const data = new Uint8Array(0);
    expect(crc16(data)).toBe(0xFFFF); // initial seed with no data
  });

  it('computes CRC for known data', () => {
    // CRC-16-CCITT of "123456789" should be 0x29B1
    const data = new Uint8Array([0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39]);
    expect(crc16(data)).toBe(0x29B1);
  });

  it('handles offset and length', () => {
    const data = new Uint8Array([0x00, 0x31, 0x32, 0x33, 0x00]);
    const fullCrc = crc16(new Uint8Array([0x31, 0x32, 0x33]));
    const offsetCrc = crc16(data, 1, 3);
    expect(offsetCrc).toBe(fullCrc);
  });
});

describe('Encrypt/Decrypt', () => {
  it('encrypting then decrypting returns original data', () => {
    const original = new Uint8Array(128);
    for (let i = 0; i < 128; i++) original[i] = i;

    const checksum = 0x1234;
    const encrypted = encryptData(original, checksum);
    const decrypted = decryptData(encrypted, checksum);

    expect(Array.from(decrypted)).toEqual(Array.from(original));
  });

  it('encrypted data differs from original', () => {
    const original = new Uint8Array(128);
    for (let i = 0; i < 128; i++) original[i] = i + 1; // non-zero data

    const encrypted = encryptData(original, 0xABCD);
    expect(Array.from(encrypted)).not.toEqual(Array.from(original));
  });

  it('XOR is symmetric (encrypt = decrypt)', () => {
    const data = new Uint8Array(64);
    for (let i = 0; i < 64; i++) data[i] = Math.floor(Math.random() * 256);

    const seed = 0x5678;
    const pass1 = decryptData(data, seed);
    const pass2 = decryptData(pass1, seed);

    expect(Array.from(pass2)).toEqual(Array.from(data));
  });
});

describe('Block Shuffle', () => {
  it('getShuffleIndex returns values 0-23', () => {
    for (let i = 0; i < 100; i++) {
      const pid = Math.floor(Math.random() * 0xFFFFFFFF);
      const idx = getShuffleIndex(pid);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(24);
    }
  });

  it('unshuffle then shuffle returns original', () => {
    const original = new Uint8Array(BLOCK_SIZE * BLOCK_COUNT);
    for (let i = 0; i < original.length; i++) original[i] = i;

    const pid = 0x12345678;
    const unshuffled = unshuffleBlocks(original, pid);
    const reshuffled = shuffleBlocks(unshuffled, pid);

    expect(Array.from(reshuffled)).toEqual(Array.from(original));
  });

  it('shuffle then unshuffle returns original', () => {
    // Start with canonical ABCD blocks
    const canonical = new Uint8Array(BLOCK_SIZE * BLOCK_COUNT);
    // Block A = 0x00-0x1F, Block B = 0x20-0x3F, etc.
    for (let i = 0; i < canonical.length; i++) canonical[i] = i;

    const pid = 0xDEADBEEF;
    const shuffled = shuffleBlocks(canonical, pid);
    const unshuffled = unshuffleBlocks(shuffled, pid);

    expect(Array.from(unshuffled)).toEqual(Array.from(canonical));
  });

  it('shuffling with different PIDs produces different results', () => {
    const data = new Uint8Array(BLOCK_SIZE * BLOCK_COUNT);
    for (let i = 0; i < data.length; i++) data[i] = i;

    const s1 = shuffleBlocks(data, 0x00000000);
    const s2 = shuffleBlocks(data, 0x00002001); // different bits 13-17

    // They should differ (different shuffle index unless by coincidence)
    const idx1 = getShuffleIndex(0x00000000);
    const idx2 = getShuffleIndex(0x00002001);
    if (idx1 !== idx2) {
      expect(Array.from(s1)).not.toEqual(Array.from(s2));
    }
  });
});
