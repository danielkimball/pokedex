/**
 * Generation 1 & 2 (Game Boy / Game Boy Color) text decoding.
 *
 * Gen 1 and Gen 2 share the same English character encoding for names.
 * Strings are fixed-length fields terminated by 0x50 (and padded with it).
 * This only needs to cover characters that appear in trainer names, OT names,
 * and nicknames — letters, digits, space, gender symbols, common punctuation.
 */

const GB_CHARS: Record<number, string> = {
  0x7f: ' ',
  0x9a: '(', 0x9b: ')', 0x9c: ':', 0x9d: ';', 0x9e: '[', 0x9f: ']',
  0xba: 'é', 0xbb: "'d", 0xbc: "'l", 0xbd: "'s", 0xbe: "'t", 0xbf: "'v",
  0xe0: "'", 0xe1: 'PK', 0xe2: 'MN', 0xe3: '-', 0xe4: "'r", 0xe5: "'m",
  0xe6: '?', 0xe7: '!', 0xe8: '.', 0xef: '♂', 0xf1: '×', 0xf2: '.',
  0xf3: '/', 0xf4: ',', 0xf5: '♀',
};
// A-Z : 0x80-0x99
for (let i = 0; i <= 0x19; i++) GB_CHARS[0x80 + i] = String.fromCharCode(0x41 + i);
// a-z : 0xa0-0xb9
for (let i = 0; i <= 0x19; i++) GB_CHARS[0xa0 + i] = String.fromCharCode(0x61 + i);
// 0-9 : 0xf6-0xff
for (let i = 0; i <= 9; i++) GB_CHARS[0xf6 + i] = String.fromCharCode(0x30 + i);

const GB_TERMINATOR = 0x50;

/**
 * Decode a Gen 1/2 text field.
 * @param data   raw save bytes
 * @param offset start of the field
 * @param maxLen maximum bytes to read (e.g. 11 for names)
 */
export function decodeGBText(data: Uint8Array, offset: number, maxLen: number): string {
  const out: string[] = [];
  for (let i = 0; i < maxLen; i++) {
    const b = data[offset + i];
    if (b === undefined || b === GB_TERMINATOR || b === 0x00) break;
    const ch = GB_CHARS[b];
    if (ch !== undefined) out.push(ch);
  }
  return out.join('').trim();
}
