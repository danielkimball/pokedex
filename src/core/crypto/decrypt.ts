/**
 * Gen 4 Pokemon data decryption.
 *
 * Pokemon stored data (bytes 8-135, 128 bytes = 64 u16 words) is XOR'd
 * with a PRNG keystream seeded by the checksum.
 *
 * Party battle stats (bytes 136-235, 100 bytes = 50 u16 words) are XOR'd
 * with a PRNG keystream seeded by the PID.
 */

import { generateKeystream } from './prng';

/**
 * Decrypt Pokemon stored data (bytes 8-135).
 * @param encryptedData - 128 encrypted bytes (the 4 data blocks)
 * @param checksum - Checksum from bytes 6-7 (unencrypted), used as PRNG seed
 * @returns Decrypted 128 bytes
 */
export function decryptData(encryptedData: Uint8Array, checksum: number): Uint8Array {
  return xorWithKeystream(encryptedData, checksum);
}

/**
 * Decrypt party battle stats (bytes 136-235).
 * @param encryptedStats - 100 encrypted bytes
 * @param pid - Pokemon's PID (used as PRNG seed)
 * @returns Decrypted 100 bytes
 */
export function decryptBattleStats(encryptedStats: Uint8Array, pid: number): Uint8Array {
  return xorWithKeystream(encryptedStats, pid);
}

/**
 * XOR a byte array with a PRNG-generated keystream.
 * Data is processed as 16-bit little-endian words.
 */
function xorWithKeystream(data: Uint8Array, seed: number): Uint8Array {
  const wordCount = data.length >>> 1; // data.length / 2
  const keystream = generateKeystream(seed, wordCount);
  const result = new Uint8Array(data.length);
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const resultView = new DataView(result.buffer);

  for (let i = 0; i < wordCount; i++) {
    const word = view.getUint16(i * 2, true);
    resultView.setUint16(i * 2, word ^ keystream[i], true);
  }

  return result;
}
