import { describe, expect, it } from 'vitest';
import {
  POKEDEX_BACK_EDGE_PX,
  isPokedexBackSwipeStart,
  resolvePokedexShellSwipe,
} from '../utils/pokedex-gestures';

describe('Pokédex detail gestures', () => {
  it('recognizes the back edge relative to the inner Pokédex screen', () => {
    const screenLeft = 24;
    expect(isPokedexBackSwipeStart(screenLeft, screenLeft)).toBe(true);
    expect(isPokedexBackSwipeStart(screenLeft + POKEDEX_BACK_EDGE_PX, screenLeft)).toBe(true);
    expect(isPokedexBackSwipeStart(screenLeft + POKEDEX_BACK_EDGE_PX + 1, screenLeft)).toBe(false);
    expect(isPokedexBackSwipeStart(screenLeft - 1, screenLeft)).toBe(false);
  });

  it('returns to the list only for a committed, eligible right swipe', () => {
    expect(resolvePokedexShellSwipe(0, 90, true)).toBe('back-to-list');
    expect(resolvePokedexShellSwipe(0, 90, false)).toBe('snap-back');
    expect(resolvePokedexShellSwipe(0, 50, true)).toBe('snap-back');
  });

  it('keeps the main/data panel gestures intact', () => {
    expect(resolvePokedexShellSwipe(0, -90, false)).toBe('show-data');
    expect(resolvePokedexShellSwipe(1, 90, false)).toBe('show-main');
    expect(resolvePokedexShellSwipe(1, -90, false)).toBe('snap-back');
  });
});
