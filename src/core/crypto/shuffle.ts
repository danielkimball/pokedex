/**
 * Gen 4 Pokemon data block shuffling.
 *
 * Pokemon data (bytes 8-135) consists of 4 × 32-byte blocks (A, B, C, D).
 * The block order is determined by (PID >> 13) & 0x1F % 24, indexing into
 * one of 24 permutations.
 */

/** Block size in bytes */
export const BLOCK_SIZE = 32;

/** Number of blocks */
export const BLOCK_COUNT = 4;

/**
 * 24 permutations of blocks [A=0, B=1, C=2, D=3].
 * Index = ((PID & 0x3E000) >>> 13) % 24
 */
const SHUFFLE_ORDER: readonly (readonly [number, number, number, number])[] = [
  [0, 1, 2, 3], // 0  ABCD
  [0, 1, 3, 2], // 1  ABDC
  [0, 2, 1, 3], // 2  ACBD
  [0, 2, 3, 1], // 3  ACDB
  [0, 3, 1, 2], // 4  ADBC
  [0, 3, 2, 1], // 5  ADCB
  [1, 0, 2, 3], // 6  BACD
  [1, 0, 3, 2], // 7  BADC
  [1, 2, 0, 3], // 8  BCAD
  [1, 2, 3, 0], // 9  BCDA
  [1, 3, 0, 2], // 10 BDAC
  [1, 3, 2, 0], // 11 BDCA
  [2, 0, 1, 3], // 12 CABD
  [2, 0, 3, 1], // 13 CADB
  [2, 1, 0, 3], // 14 CBAD
  [2, 1, 3, 0], // 15 CBDA
  [2, 3, 0, 1], // 16 CDAB
  [2, 3, 1, 0], // 17 CDBA
  [3, 0, 1, 2], // 18 DABC
  [3, 0, 2, 1], // 19 DACB
  [3, 1, 0, 2], // 20 DBAC
  [3, 1, 2, 0], // 21 DBCA
  [3, 2, 0, 1], // 22 DCAB
  [3, 2, 1, 0], // 23 DCBA
];

/** Get the shuffle index from a PID. */
export function getShuffleIndex(pid: number): number {
  return ((pid & 0x3E000) >>> 13) % 24;
}

/**
 * Unshuffle (decrypt order -> ABCD) the 4 data blocks.
 * @param data - 128 bytes (4 blocks of 32 bytes) in shuffled order
 * @param pid - Pokemon's PID
 * @returns 128 bytes in canonical ABCD order
 */
export function unshuffleBlocks(data: Uint8Array, pid: number): Uint8Array {
  const idx = getShuffleIndex(pid);
  const order = SHUFFLE_ORDER[idx];
  const result = new Uint8Array(BLOCK_SIZE * BLOCK_COUNT);

  for (let i = 0; i < BLOCK_COUNT; i++) {
    // order[i] tells us which canonical block is at position i in the shuffled data
    // We want to place position i's data into the canonical slot order[i]
    const srcOffset = i * BLOCK_SIZE;
    const dstOffset = order[i] * BLOCK_SIZE;
    result.set(data.subarray(srcOffset, srcOffset + BLOCK_SIZE), dstOffset);
  }

  return result;
}

/**
 * Shuffle blocks from canonical ABCD order back to encrypted order.
 * @param data - 128 bytes in canonical ABCD order
 * @param pid - Pokemon's PID
 * @returns 128 bytes in shuffled order
 */
export function shuffleBlocks(data: Uint8Array, pid: number): Uint8Array {
  const idx = getShuffleIndex(pid);
  const order = SHUFFLE_ORDER[idx];
  const result = new Uint8Array(BLOCK_SIZE * BLOCK_COUNT);

  for (let i = 0; i < BLOCK_COUNT; i++) {
    // order[i] = canonical block index at shuffled position i
    // To reverse: place canonical block order[i] at position i
    const srcOffset = order[i] * BLOCK_SIZE;
    const dstOffset = i * BLOCK_SIZE;
    result.set(data.subarray(srcOffset, srcOffset + BLOCK_SIZE), dstOffset);
  }

  return result;
}
