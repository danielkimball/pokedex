/**
 * Single source of truth for energy icons in the app.
 *
 * Maps each of the 17 game types into one of the 7 Base Set TCG energy
 * categories (the way the original 1999 sets folded them), and resolves each
 * to the flat era-correct icon at /cards/gen1/energies/. Used by both the
 * Base Set card renderer and the dex-list TypeBadge so the whole app shares
 * one icon style.
 */

/**
 * The 1999 Base Set fold. Correct for Gen 1 cards; later eras re-typed a few
 * of these (see `tcgEnergyForGen`), so prefer that helper anywhere a card is
 * being rendered for a specific generation.
 */
export const TYPE_TO_TCG_ENERGY: Record<string, string> = {
  Electric: 'lightning',
  Fire: 'fire',
  Water: 'water', Ice: 'water',
  Grass: 'grass', Bug: 'grass', Poison: 'grass',
  Psychic: 'psychic', Ghost: 'psychic',
  Fighting: 'fighting', Rock: 'fighting', Ground: 'fighting',
  Normal: 'colorless', Flying: 'colorless', Dragon: 'colorless',
  // Video-game Steel + Dark have no Base Set counterpart. Their era-specific
  // frame routing still falls back to Colorless until those frames are added.
  Steel: 'colorless', Dark: 'colorless',
  // Accept TCG names directly for code that already speaks TCG.
  Lightning: 'lightning', Colorless: 'colorless',
  Metal: 'metal', Darkness: 'darkness',
};

/**
 * Era corrections to the Base Set fold.
 *
 * EX Ruby & Sapphire (2003) moved every Poison-type Pokemon out of Grass and
 * into Psychic, and that is still how they were printed through the Gen 4
 * D&P / Platinum / HGSS blocks — so an HGSS Ekans is a Psychic card, not a
 * Grass one. Gen 1 and Gen 2 cards keep the original Grass fold.
 *
 * Steel -> Metal and Dark -> Darkness (Neo Genesis, 2000) are NOT applied
 * here because those card frames have not been built yet. Exact printed-card
 * metadata may still request the Metal/Darkness icons directly for weaknesses.
 */
const ERA_TYPE_OVERRIDES: Record<number, Record<string, string>> = {
  3: { Poison: 'psychic' },
};

/** TCG energy for a game type, as that type was printed in `generation`'s era. */
export function tcgEnergyForGen(type: string, generation: number): string {
  if (generation >= 3) {
    const era = ERA_TYPE_OVERRIDES[3][type];
    if (era) return era;
  }
  return TYPE_TO_TCG_ENERGY[type] ?? 'colorless';
}

/** Bump when energy icon PNGs are replaced so clients fetch the new asset. */
const ENERGY_CACHE_VER = '3';

function energyAsset(file: string): string {
  return `/cards/gen1/energies/${file}.png?v=${ENERGY_CACHE_VER}`;
}

export function tcgEnergyUrl(type: string): string {
  return energyAsset(TYPE_TO_TCG_ENERGY[type] ?? 'colorless');
}

/** Era-correct energy icon — use on cards, where the printing year matters. */
export function tcgEnergyUrlForGen(type: string, generation: number): string {
  return energyAsset(tcgEnergyForGen(type, generation));
}
