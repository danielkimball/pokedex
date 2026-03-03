/**
 * Gen 4 Linear Congruential Random Number Generator (LCRNG).
 * Used for encrypting/decrypting Pokemon data in Gen 4 save files.
 *
 * Formula: seed = (0x41C64E6D * seed + 0x6073) & 0xFFFFFFFF
 * The upper 16 bits of each output are used as the keystream.
 */

const MULT = 0x41C64E6D;
const ADD = 0x6073;

/** Advance the PRNG by one step, returning the new seed. */
export function nextSeed(seed: number): number {
  return (Math.imul(MULT, seed) + ADD) >>> 0;
}

/** Get the upper 16 bits of a seed (used as PRNG output). */
export function highBits(seed: number): number {
  return seed >>> 16;
}

/**
 * Generate a keystream of 16-bit values for XOR encryption/decryption.
 * @param seed - Initial PRNG seed (checksum for data blocks, PID for battle stats)
 * @param count - Number of 16-bit values to generate
 * @returns Array of 16-bit keystream values
 */
export function generateKeystream(seed: number, count: number): Uint16Array {
  const keystream = new Uint16Array(count);
  let s = seed;
  for (let i = 0; i < count; i++) {
    s = nextSeed(s);
    keystream[i] = highBits(s);
  }
  return keystream;
}
