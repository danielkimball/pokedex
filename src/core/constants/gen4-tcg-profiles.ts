import { gen4CardArtSource } from './gen4-card-art';
import {
  GEN4_TCG_PROFILES_BY_ART,
  type Gen4TcgProfile,
  type Gen4TcgWeakness,
} from './gen4-tcg-profiles.generated';

export type { Gen4TcgProfile, Gen4TcgWeakness };

/**
 * Kadabra had no printed Gen IV card, so there is no exact source-card record
 * to attach to its custom save card. Keep it on the era's Psychic convention,
 * with the same Psychic x2 weakness used by the adjacent Gen IV Alakazam art.
 */
const KADABRA_FALLBACK: Gen4TcgProfile = {
  cardId: 'custom-gen4-kadabra',
  name: 'Kadabra',
  era: 'pl',
  type: 'Psychic',
  weaknesses: [{ type: 'Psychic', value: '×2' }],
  stage: 'Stage1',
  evolvesFrom: 'Abra',
  sourceUrl: 'https://api.tcgdex.net/v2/en/cards/pl2-38',
};

/** Metadata printed on the exact Gen IV source card selected for this record. */
export function gen4TcgProfile(species: number, game?: string | null): Gen4TcgProfile | null {
  if (species === 64) return KADABRA_FALLBACK;
  const source = gen4CardArtSource(species, game);
  return source ? GEN4_TCG_PROFILES_BY_ART[source.path] ?? null : null;
}

/** Lowercase key shared by card templates and energy assets. */
export function tcgTypeKey(type: string): string {
  return type.toLowerCase();
}
