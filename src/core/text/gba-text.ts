/**
 * Generation 3 (Game Boy Advance) text decoding.
 *
 * Gen 3 uses a different single-byte encoding from Gen 1/2. 0x00 is a space
 * and 0xFF terminates. Only name-relevant characters are mapped.
 */

const GBA_CHARS: Record<number, string> = {
  0x00: ' ',
  0xab: '!', 0xac: '?', 0xad: '.', 0xae: '-',
  0xb0: '…', 0xb1: '“', 0xb2: '”', 0xb3: '‘', 0xb4: '’',
  0xb5: '♂', 0xb6: '♀', 0xb8: ',', 0xb9: '×', 0xba: '/',
  0xf0: ':',
};
// digits 0-9 : 0xA1-0xAA
for (let i = 0; i <= 9; i++) GBA_CHARS[0xa1 + i] = String.fromCharCode(0x30 + i);
// A-Z : 0xBB-0xD4
for (let i = 0; i <= 0x19; i++) GBA_CHARS[0xbb + i] = String.fromCharCode(0x41 + i);
// a-z : 0xD5-0xEE
for (let i = 0; i <= 0x19; i++) GBA_CHARS[0xd5 + i] = String.fromCharCode(0x61 + i);

const GBA_TERMINATOR = 0xff;

/** Decode a Gen 3 fixed-length text field. */
export function decodeGBAText(data: Uint8Array, offset: number, maxLen: number): string {
  const out: string[] = [];
  for (let i = 0; i < maxLen; i++) {
    const b = data[offset + i];
    if (b === undefined || b === GBA_TERMINATOR) break;
    const ch = GBA_CHARS[b];
    if (ch !== undefined) out.push(ch);
  }
  return out.join('').trim();
}
