/**
 * TCG card taxonomy — which frame a Pokemon gets, independent of rendering.
 *
 * Kept out of TcgCard.tsx so it can be imported and tested without pulling in
 * React (and so that file stays component-only for fast refresh).
 */

import { TYPES, SPECIES_TYPES } from './types';
import { EVOLUTIONS } from './evolutions';
import { tcgEnergyForGen } from './energies';

export const GEN_MAX_DEX: Record<number, number> = { 1: 151, 2: 251, 3: 386, 4: 493 };

/** HeartGold / SoulSilver — the games with real PNG card frames. */
const HGSS_GAMES = new Set(['HeartGold', 'SoulSilver']);

/**
 * Classic energy set with real frames under public/cards/gen4/templates/.
 * Every one exists in all three stages. Metal + Darkness are still missing, so
 * Steel/Dark Pokemon stay on Colorless (see ERA_TYPE_OVERRIDES in energies.ts).
 */
const HGSS_ENERGIES = new Set([
  'fire', 'lightning', 'grass', 'water', 'fighting', 'psychic', 'colorless',
]);

const HGSS_STAGE_KEY: Record<string, string> = {
  Basic: 'basic', 'Stage 1': 'stage1', 'Stage 2': 'stage2',
};

/** First type of the species' game typing, which drives the frame colour. */
export function primaryType(species: number): string {
  const pair = SPECIES_TYPES[species];
  return pair && pair[0] >= 0 ? TYPES[pair[0]] : 'Normal';
}

/** Energy the species' primary type was printed as in `generation`'s TCG era. */
export function getTcgEnergy(species: number, generation: number): string {
  return tcgEnergyForGen(primaryType(species), generation);
}

/** Position in the game's evolution chain — used for the card's caption line. */
export function stageLabel(species: number, generation: number): string {
  const maxDex = GEN_MAX_DEX[generation] ?? 493;
  const chain = (EVOLUTIONS[species]?.chain ?? [species]).filter(d => d <= maxDex);
  const idx = chain.indexOf(species);
  return idx <= 0 ? 'Basic' : idx === 1 ? 'Stage 1' : 'Stage 2';
}

/**
 * Gen 1–4 baby Pokémon. In the TCG, babies are Basic and evolve into *another*
 * Basic (not Stage 1) — e.g. Pichu → Pikachu (HS 78 is Basic), then Raichu is Stage 1.
 * Used only for card-template selection so frames match real cards.
 */
const TCG_BABY_SPECIES = new Set([
  172, 173, 174, 175, // Pichu, Cleffa, Igglybuff, Togepi
  236, 238, 239, 240, // Tyrogue, Smoochum, Elekid, Magby
  298, 360,           // Azurill, Wynaut
  406, 433, 438, 439, 440, 446, 447, 458, // Gen 4 babies
]);

/** TCG stage for card template filenames (basic / stage1 / stage2). */
export function tcgStageLabel(species: number, generation: number): string {
  const maxDex = GEN_MAX_DEX[generation] ?? 493;
  const chain = (EVOLUTIONS[species]?.chain ?? [species]).filter(d => d <= maxDex);
  const idx = chain.indexOf(species);
  if (idx <= 0) return 'Basic';
  // Evolving from a baby does not advance stage (classic TCG baby rule).
  let stage = 0;
  for (let i = 1; i <= idx; i++) {
    if (TCG_BABY_SPECIES.has(chain[i - 1]!)) continue;
    stage += 1;
  }
  return stage <= 0 ? 'Basic' : stage === 1 ? 'Stage 1' : 'Stage 2';
}

/**
 * Resolve an HGSS real card frame if one exists for this stage + energy.
 * Filenames: public/cards/gen4/templates/{basic|stage1|stage2}-{energy}.webp
 */
export function resolveHgssTemplate(
  game: string | null | undefined,
  energyKey: string,
  stage: string,
): string | null {
  if (!game || !HGSS_GAMES.has(game)) return null;
  const stageKey = HGSS_STAGE_KEY[stage];
  if (!stageKey || !HGSS_ENERGIES.has(energyKey)) return null;
  // ?v= bumps when templates are reprocessed (art hole / corners / tab).
  return `/cards/gen4/templates/${stageKey}-${energyKey}.webp?v=11`;
}
