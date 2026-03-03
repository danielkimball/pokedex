/**
 * Binary utility functions for reading/writing typed data from ArrayBuffers.
 */

export function readU8(data: DataView, offset: number): number {
  return data.getUint8(offset);
}

export function readU16(data: DataView, offset: number): number {
  return data.getUint16(offset, true); // little-endian
}

export function readU32(data: DataView, offset: number): number {
  return data.getUint32(offset, true);
}

export function readI8(data: DataView, offset: number): number {
  return data.getInt8(offset);
}

export function readI16(data: DataView, offset: number): number {
  return data.getInt16(offset, true);
}

export function readI32(data: DataView, offset: number): number {
  return data.getInt32(offset, true);
}

export function writeU8(data: DataView, offset: number, value: number): void {
  data.setUint8(offset, value);
}

export function writeU16(data: DataView, offset: number, value: number): void {
  data.setUint16(offset, value, true);
}

export function writeU32(data: DataView, offset: number, value: number): void {
  data.setUint32(offset, value, true);
}

/** Read a slice of bytes as a new Uint8Array (copy). */
export function readBytes(data: Uint8Array, offset: number, length: number): Uint8Array {
  return data.slice(offset, offset + length);
}

/** Create a DataView over an ArrayBuffer or Uint8Array. */
export function toDataView(buf: ArrayBuffer | Uint8Array): DataView {
  if (buf instanceof Uint8Array) {
    return new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  }
  return new DataView(buf);
}

/** Create a Uint8Array view (no copy) of an ArrayBuffer. */
export function toUint8Array(buf: ArrayBuffer | Uint8Array): Uint8Array {
  if (buf instanceof Uint8Array) return buf;
  return new Uint8Array(buf);
}

/** Clone an ArrayBuffer. */
export function cloneBuffer(buf: ArrayBuffer): ArrayBuffer {
  return buf.slice(0);
}

/** Extract bits from a 32-bit value. */
export function extractBits(value: number, start: number, count: number): number {
  return (value >>> start) & ((1 << count) - 1);
}

/** Set bits in a 32-bit value. */
export function setBits(value: number, start: number, count: number, bits: number): number {
  const mask = ((1 << count) - 1) << start;
  return (value & ~mask) | ((bits & ((1 << count) - 1)) << start);
}
