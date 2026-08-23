export const POKEDEX_BACK_EDGE_PX = 36;
export const POKEDEX_SWIPE_COMMIT_PX = 70;

export type PokedexShellSwipeAction = 'back-to-list' | 'show-data' | 'show-main' | 'snap-back';

/** A list-return gesture must begin just inside the visible Pokédex screen edge. */
export function isPokedexBackSwipeStart(clientX: number, surfaceLeft: number): boolean {
  const distanceFromLeft = clientX - surfaceLeft;
  return distanceFromLeft >= 0 && distanceFromLeft <= POKEDEX_BACK_EDGE_PX;
}

/** Resolve a completed horizontal swipe without coupling gesture policy to React or the DOM. */
export function resolvePokedexShellSwipe(
  activePanel: number,
  dx: number,
  canReturnToList: boolean,
): PokedexShellSwipeAction {
  if (activePanel === 0 && canReturnToList && dx > POKEDEX_SWIPE_COMMIT_PX) {
    return 'back-to-list';
  }
  if (activePanel === 0 && dx < -POKEDEX_SWIPE_COMMIT_PX) {
    return 'show-data';
  }
  if (activePanel === 1 && dx > POKEDEX_SWIPE_COMMIT_PX) {
    return 'show-main';
  }
  return 'snap-back';
}
