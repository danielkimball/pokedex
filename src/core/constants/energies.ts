/**
 * Single source of truth for energy icons in the app.
 *
 * Maps each of the 17 game types into one of the 7 Base Set TCG energy
 * categories (the way the original 1999 sets folded them), and resolves each
 * to the flat era-correct icon at /cards/gen1/energies/. Used by both the
 * Base Set card renderer and the dex-list TypeBadge so the whole app shares
 * one icon style.
 */

export const TYPE_TO_TCG_ENERGY: Record<string, string> = {
  Electric: 'lightning',
  Fire: 'fire',
  Water: 'water', Ice: 'water',
  Grass: 'grass', Bug: 'grass', Poison: 'grass',
  Psychic: 'psychic', Ghost: 'psychic',
  Fighting: 'fighting', Rock: 'fighting', Ground: 'fighting',
  Normal: 'colorless', Flying: 'colorless', Dragon: 'colorless',
  // Steel + Dark have no Base Set counterpart; fall back to Colorless until we
  // add Neo-era Metal/Darkness energies alongside the Gen 2 frame.
  Steel: 'colorless', Dark: 'colorless',
  // Accept TCG names directly for code that already speaks TCG.
  Lightning: 'lightning', Colorless: 'colorless',
};

export function tcgEnergyUrl(type: string): string {
  const file = TYPE_TO_TCG_ENERGY[type] ?? 'colorless';
  return `/cards/gen1/energies/${file}.png`;
}
