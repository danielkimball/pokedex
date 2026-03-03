/**
 * Gen 4 (Diamond/Pearl/Platinum/HeartGold/SoulSilver) character encoding table.
 *
 * Gen 4 text is stored as 16-bit values using a proprietary encoding that bears
 * no systematic relationship to ASCII or Unicode -- it is a pure lookup table.
 * This module provides bidirectional maps between the Gen 4 character codes found
 * in save data and their Unicode equivalents.
 *
 * Based on PKHeX Gen4 character tables (StringConverter4Util).
 */

/** Marks the end of a Gen 4 encoded string. */
export const CHAR_TERMINATOR = 0xFFFF;

/**
 * Gen 4 character code -> Unicode character mapping.
 *
 * Only the Latin / English-relevant subset is included here.  The full table
 * also contains Japanese Hiragana (0x0002-0x0054) and Katakana (0x0055-0x00A7)
 * ranges which are omitted for brevity.
 */
export const CHAR_TO_UNICODE = new Map<number, string>([
  // ---- Latin accented uppercase (0x00A8 - 0x00C7) ----
  [0x00A8, '\u00C0'], // À
  [0x00A9, '\u00C1'], // Á
  [0x00AA, '\u00C2'], // Â
  [0x00AB, '\u00C3'], // Ã
  [0x00AC, '\u00C4'], // Ä
  [0x00AD, '\u00C5'], // Å
  [0x00AE, '\u00C6'], // Æ
  [0x00AF, '\u00C7'], // Ç
  [0x00B0, '\u00C8'], // È
  [0x00B1, '\u00C9'], // É
  [0x00B2, '\u00CA'], // Ê
  [0x00B3, '\u00CB'], // Ë
  [0x00B4, '\u00CC'], // Ì
  [0x00B5, '\u00CD'], // Í
  [0x00B6, '\u00CE'], // Î
  [0x00B7, '\u00CF'], // Ï
  [0x00B8, '\u00D0'], // Ð
  [0x00B9, '\u00D1'], // Ñ
  [0x00BA, '\u00D2'], // Ò
  [0x00BB, '\u00D3'], // Ó
  [0x00BC, '\u00D4'], // Ô
  [0x00BD, '\u00D5'], // Õ
  [0x00BE, '\u00D6'], // Ö
  [0x00BF, '\u00D7'], // ×
  [0x00C0, '\u00D8'], // Ø
  [0x00C1, '\u00D9'], // Ù
  [0x00C2, '\u00DA'], // Ú
  [0x00C3, '\u00DB'], // Û
  [0x00C4, '\u00DC'], // Ü
  [0x00C5, '\u00DD'], // Ý
  [0x00C6, '\u00DE'], // Þ
  [0x00C7, '\u00DF'], // ß

  // ---- Latin accented lowercase (0x00C8 - 0x00E7) ----
  [0x00C8, '\u00E0'], // à
  [0x00C9, '\u00E1'], // á
  [0x00CA, '\u00E2'], // â
  [0x00CB, '\u00E3'], // ã
  [0x00CC, '\u00E4'], // ä
  [0x00CD, '\u00E5'], // å
  [0x00CE, '\u00E6'], // æ
  [0x00CF, '\u00E7'], // ç
  [0x00D0, '\u00E8'], // è
  [0x00D1, '\u00E9'], // é  (the 'e' in Pokemon)
  [0x00D2, '\u00EA'], // ê
  [0x00D3, '\u00EB'], // ë
  [0x00D4, '\u00EC'], // ì
  [0x00D5, '\u00ED'], // í
  [0x00D6, '\u00EE'], // î
  [0x00D7, '\u00EF'], // ï
  [0x00D8, '\u00F0'], // ð
  [0x00D9, '\u00F1'], // ñ
  [0x00DA, '\u00F2'], // ò
  [0x00DB, '\u00F3'], // ó
  [0x00DC, '\u00F4'], // ô
  [0x00DD, '\u00F5'], // õ
  [0x00DE, '\u00F6'], // ö
  [0x00DF, '\u00F7'], // ÷
  [0x00E0, '\u00F8'], // ø
  [0x00E1, '\u00F9'], // ù
  [0x00E2, '\u00FA'], // ú
  [0x00E3, '\u00FB'], // û
  [0x00E4, '\u00FC'], // ü
  [0x00E5, '\u00FD'], // ý
  [0x00E6, '\u00FE'], // þ
  [0x00E7, '\u00FF'], // ÿ

  // ---- Digits (0x0121 - 0x012A) ----
  [0x0121, '0'],
  [0x0122, '1'],
  [0x0123, '2'],
  [0x0124, '3'],
  [0x0125, '4'],
  [0x0126, '5'],
  [0x0127, '6'],
  [0x0128, '7'],
  [0x0129, '8'],
  [0x012A, '9'],

  // ---- Uppercase Latin (0x012B - 0x0144) ----
  [0x012B, 'A'],
  [0x012C, 'B'],
  [0x012D, 'C'],
  [0x012E, 'D'],
  [0x012F, 'E'],
  [0x0130, 'F'],
  [0x0131, 'G'],
  [0x0132, 'H'],
  [0x0133, 'I'],
  [0x0134, 'J'],
  [0x0135, 'K'],
  [0x0136, 'L'],
  [0x0137, 'M'],
  [0x0138, 'N'],
  [0x0139, 'O'],
  [0x013A, 'P'],
  [0x013B, 'Q'],
  [0x013C, 'R'],
  [0x013D, 'S'],
  [0x013E, 'T'],
  [0x013F, 'U'],
  [0x0140, 'V'],
  [0x0141, 'W'],
  [0x0142, 'X'],
  [0x0143, 'Y'],
  [0x0144, 'Z'],

  // ---- Lowercase Latin (0x0145 - 0x015E) ----
  [0x0145, 'a'],
  [0x0146, 'b'],
  [0x0147, 'c'],
  [0x0148, 'd'],
  [0x0149, 'e'],
  [0x014A, 'f'],
  [0x014B, 'g'],
  [0x014C, 'h'],
  [0x014D, 'i'],
  [0x014E, 'j'],
  [0x014F, 'k'],
  [0x0150, 'l'],
  [0x0151, 'm'],
  [0x0152, 'n'],
  [0x0153, 'o'],
  [0x0154, 'p'],
  [0x0155, 'q'],
  [0x0156, 'r'],
  [0x0157, 's'],
  [0x0158, 't'],
  [0x0159, 'u'],
  [0x015A, 'v'],
  [0x015B, 'w'],
  [0x015C, 'x'],
  [0x015D, 'y'],
  [0x015E, 'z'],

  // ---- Punctuation & symbols (0x015F - 0x0178) ----
  [0x015F, '!'],
  [0x0160, '?'],
  [0x0161, ','],
  [0x0162, '.'],
  [0x0163, '\u2026'], // …  (ellipsis)
  [0x0164, '\u00B7'], // ·  (middle dot)
  [0x0165, '/'],
  [0x0166, "'"],
  [0x0167, '\u2018'], // '  (left single quote)
  [0x0168, '\u201C'], // "  (left double quote)
  [0x0169, '\u201D'], // "  (right double quote)
  [0x016A, '\u300C'], // 「 (left corner bracket)
  [0x016B, '\u300D'], // 」 (right corner bracket)
  [0x016C, '('],
  [0x016D, ')'],
  [0x016E, '\u2642'], // ♂  (male sign)
  [0x016F, '\u2640'], // ♀  (female sign)
  [0x0170, '+'],
  [0x0171, '-'],
  [0x0172, '*'],
  [0x0173, '#'],
  [0x0174, '='],
  [0x0175, '&'],
  [0x0176, '~'],
  [0x0177, ':'],
  [0x0178, ';'],

  // ---- Additional special characters (0x0190 - 0x01A2) ----
  [0x0190, '@'],
  [0x0191, '\u266D'], // ♭  (flat sign)
  [0x0192, '%'],
  [0x0193, '\u2660'], // ♠
  [0x0194, '\u2663'], // ♣
  [0x0195, '\u2665'], // ♥
  [0x0196, '\u2666'], // ♦
  [0x0197, '\u2605'], // ★
  [0x0198, '\u25CE'], // ◎
  [0x0199, '\u25CB'], // ○
  [0x019A, '\u25A1'], // □
  [0x019B, '\u25B3'], // △
  [0x019C, '\u25C7'], // ◇
  [0x019D, '\u266A'], // ♪
  [0x019E, '\u2600'], // ☀
  [0x019F, '\u2601'], // ☁
  [0x01A0, '\u2602'], // ☂
  [0x01A1, '\u2934'], // ⤴  (arrow curving up)
  [0x01A2, '\u2935'], // ⤵  (arrow curving down)

  // ---- Space (0x01AC) ----
  [0x01AC, ' '],

  // ---- Additional Latin ligatures (0x01AE - 0x01AF) ----
  [0x01AE, '\u0152'], // Œ
  [0x01AF, '\u0153'], // œ
]);

/**
 * Unicode character -> Gen 4 character code mapping.
 * Built as the reverse of CHAR_TO_UNICODE.
 *
 * When multiple Gen 4 codes map to the same Unicode character, the first
 * encountered code wins (preserving the Map insertion order from above).
 */
export const UNICODE_TO_CHAR = new Map<string, number>();
for (const [code, char] of CHAR_TO_UNICODE) {
  if (!UNICODE_TO_CHAR.has(char)) {
    UNICODE_TO_CHAR.set(char, code);
  }
}

// Ensure that encoding a space always produces 0x01AC
UNICODE_TO_CHAR.set(' ', 0x01AC);
