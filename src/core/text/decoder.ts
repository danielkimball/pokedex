/**
 * Decode Gen 4 encoded text (Uint8Array of 16-bit LE values) to a JS string.
 */

import { CHAR_TERMINATOR, CHAR_TO_UNICODE } from './char-table';

/**
 * Decode a Gen 4 encoded string from raw bytes.
 * @param data - Uint8Array containing the encoded string (16-bit LE values)
 * @param offset - Start offset in the data
 * @param maxChars - Maximum number of characters to read
 * @returns Decoded string
 */
export function decodeString(data: Uint8Array, offset: number, maxChars: number): string {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const chars: string[] = [];

  for (let i = 0; i < maxChars; i++) {
    const byteOffset = offset + i * 2;
    if (byteOffset + 1 >= data.length) break;

    const charCode = view.getUint16(byteOffset, true);
    if (charCode === CHAR_TERMINATOR) break;

    const unicode = CHAR_TO_UNICODE.get(charCode);
    if (unicode !== undefined) {
      chars.push(unicode);
    } else {
      // Unknown character - use replacement
      chars.push('?');
    }
  }

  return chars.join('');
}

/**
 * Decode a Pokemon nickname (max 10 characters + terminator = 22 bytes).
 */
export function decodeNickname(data: Uint8Array, offset: number): string {
  return decodeString(data, offset, 10);
}

/**
 * Decode an OT (Original Trainer) name (max 7 characters + terminator = 16 bytes).
 */
export function decodeOTName(data: Uint8Array, offset: number): string {
  return decodeString(data, offset, 7);
}
