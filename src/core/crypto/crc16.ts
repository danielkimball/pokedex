/**
 * CRC-16-CCITT used by Gen 4 Pokemon save files.
 * Polynomial: 0x1021, Initial value: 0xFFFF
 */

// Precomputed CRC-16-CCITT lookup table
const CRC_TABLE = new Uint16Array(256);

(function initTable() {
  for (let i = 0; i < 256; i++) {
    let crc = i << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
    CRC_TABLE[i] = crc;
  }
})();

/**
 * Compute CRC-16-CCITT over a byte array.
 * @param data - Input bytes
 * @param offset - Start offset (default 0)
 * @param length - Number of bytes (default: data.length - offset)
 * @returns 16-bit CRC value
 */
export function crc16(data: Uint8Array, offset = 0, length?: number): number {
  const len = length ?? (data.length - offset);
  let crc = 0xFFFF;
  for (let i = 0; i < len; i++) {
    const byte = data[offset + i];
    crc = ((crc << 8) & 0xFFFF) ^ CRC_TABLE[((crc >>> 8) ^ byte) & 0xFF];
  }
  return crc;
}
