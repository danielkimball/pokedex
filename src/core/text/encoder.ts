/**
 * Encode a JS string to Gen 4 character encoding (16-bit LE values).
 */

import { CHAR_TERMINATOR, UNICODE_TO_CHAR } from './char-table';

/**
 * Encode a string to Gen 4 format.
 * @param text - The string to encode
 * @param maxChars - Maximum number of characters (excluding terminator)
 * @param totalBytes - Total byte length of the output buffer (including terminator space)
 * @returns Uint8Array with encoded characters + terminator, padded with 0xFFFF
 */
export function encodeString(text: string, maxChars: number, totalBytes: number): Uint8Array {
  const result = new Uint8Array(totalBytes);
  const view = new DataView(result.buffer);

  // Fill with terminators
  for (let i = 0; i < totalBytes; i += 2) {
    view.setUint16(i, CHAR_TERMINATOR, true);
  }

  const len = Math.min(text.length, maxChars);
  for (let i = 0; i < len; i++) {
    const char = text[i];
    const code = UNICODE_TO_CHAR.get(char);
    if (code !== undefined) {
      view.setUint16(i * 2, code, true);
    } else {
      // Unknown char - encode as '?'
      const fallback = UNICODE_TO_CHAR.get('?');
      if (fallback !== undefined) {
        view.setUint16(i * 2, fallback, true);
      }
    }
  }

  // Ensure terminator after last character
  if (len < totalBytes / 2) {
    view.setUint16(len * 2, CHAR_TERMINATOR, true);
  }

  return result;
}

/**
 * Encode a Pokemon nickname (max 10 chars, 22 bytes total).
 */
export function encodeNickname(name: string): Uint8Array {
  return encodeString(name, 10, 22);
}

/**
 * Encode an OT name (max 7 chars, 16 bytes total).
 */
export function encodeOTName(name: string): Uint8Array {
  return encodeString(name, 7, 16);
}
