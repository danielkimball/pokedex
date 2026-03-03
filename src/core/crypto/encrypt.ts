/**
 * Gen 4 Pokemon data encryption.
 * Encryption is identical to decryption (XOR is its own inverse).
 */

import { decryptData, decryptBattleStats } from './decrypt';

/**
 * Encrypt Pokemon stored data (blocks A-D, 128 bytes).
 * XOR with PRNG keystream seeded by checksum.
 */
export const encryptData = decryptData;

/**
 * Encrypt party battle stats (100 bytes).
 * XOR with PRNG keystream seeded by PID.
 */
export const encryptBattleStats = decryptBattleStats;
