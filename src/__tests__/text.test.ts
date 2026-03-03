import { describe, it, expect } from 'vitest';
import { CHAR_TERMINATOR, CHAR_TO_UNICODE, UNICODE_TO_CHAR } from '../core/text/char-table';
import { decodeString, decodeNickname } from '../core/text/decoder';
import { encodeString, encodeNickname } from '../core/text/encoder';

describe('Char Table', () => {
  it('has terminator as 0xFFFF', () => {
    expect(CHAR_TERMINATOR).toBe(0xFFFF);
  });

  it('maps all ASCII uppercase letters', () => {
    for (let i = 0; i < 26; i++) {
      const char = String.fromCharCode(65 + i); // A-Z
      expect(CHAR_TO_UNICODE.get(0x012B + i)).toBe(char);
    }
  });

  it('maps all ASCII lowercase letters', () => {
    for (let i = 0; i < 26; i++) {
      const char = String.fromCharCode(97 + i); // a-z
      expect(CHAR_TO_UNICODE.get(0x0145 + i)).toBe(char);
    }
  });

  it('maps all digits', () => {
    for (let i = 0; i < 10; i++) {
      expect(CHAR_TO_UNICODE.get(0x0121 + i)).toBe(String(i));
    }
  });

  it('has reverse mapping for common chars', () => {
    expect(UNICODE_TO_CHAR.get('A')).toBe(0x012B);
    expect(UNICODE_TO_CHAR.get('z')).toBe(0x015E);
    expect(UNICODE_TO_CHAR.get('0')).toBe(0x0121);
    expect(UNICODE_TO_CHAR.get(' ')).toBe(0x01AC);
  });
});

describe('Text Decoder', () => {
  it('decodes a simple string', () => {
    // Encode "Abc" as Gen4 chars: A=0x012B, b=0x0146, c=0x0147, terminator
    const data = new Uint8Array(8);
    const view = new DataView(data.buffer);
    view.setUint16(0, 0x012B, true); // A
    view.setUint16(2, 0x0146, true); // b
    view.setUint16(4, 0x0147, true); // c
    view.setUint16(6, 0xFFFF, true); // terminator

    const result = decodeString(data, 0, 10);
    expect(result).toBe('Abc');
  });

  it('stops at terminator', () => {
    const data = new Uint8Array(10);
    const view = new DataView(data.buffer);
    view.setUint16(0, 0x012B, true); // A
    view.setUint16(2, 0xFFFF, true); // terminator
    view.setUint16(4, 0x012C, true); // B (should not be read)

    expect(decodeString(data, 0, 10)).toBe('A');
  });

  it('respects maxChars', () => {
    const data = new Uint8Array(20);
    const view = new DataView(data.buffer);
    for (let i = 0; i < 10; i++) {
      view.setUint16(i * 2, 0x012B + i, true); // A,B,C,D,...
    }

    expect(decodeString(data, 0, 3)).toBe('ABC');
  });

  it('decodeNickname handles 10 chars max', () => {
    const data = new Uint8Array(22); // 10 chars * 2 bytes + 2 byte terminator
    const view = new DataView(data.buffer);
    // Write "PIKACHU" then terminator
    const name = 'PIKACHU';
    for (let i = 0; i < name.length; i++) {
      const code = UNICODE_TO_CHAR.get(name[i])!;
      view.setUint16(i * 2, code, true);
    }
    view.setUint16(name.length * 2, 0xFFFF, true);

    expect(decodeNickname(data, 0)).toBe('PIKACHU');
  });
});

describe('Text Encoder', () => {
  it('encodes a simple string', () => {
    const encoded = encodeString('Hi', 10, 22);
    const view = new DataView(encoded.buffer);

    expect(view.getUint16(0, true)).toBe(UNICODE_TO_CHAR.get('H'));
    expect(view.getUint16(2, true)).toBe(UNICODE_TO_CHAR.get('i'));
    expect(view.getUint16(4, true)).toBe(CHAR_TERMINATOR);
  });

  it('pads with terminators', () => {
    const encoded = encodeString('A', 10, 22);
    const view = new DataView(encoded.buffer);

    expect(view.getUint16(0, true)).toBe(UNICODE_TO_CHAR.get('A'));
    // All remaining should be terminators
    for (let i = 1; i < 11; i++) {
      expect(view.getUint16(i * 2, true)).toBe(CHAR_TERMINATOR);
    }
  });

  it('round-trips encode -> decode', () => {
    const original = 'Pikachu';
    const encoded = encodeNickname(original);
    const decoded = decodeNickname(encoded, 0);
    expect(decoded).toBe(original);
  });

  it('truncates to maxChars', () => {
    const encoded = encodeString('ABCDEFGHIJKLMNO', 10, 22);
    const view = new DataView(encoded.buffer);
    // Should only encode 10 chars
    expect(view.getUint16(20, true)).toBe(CHAR_TERMINATOR);
  });
});
