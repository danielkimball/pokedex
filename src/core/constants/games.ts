/**
 * Canonical registry of supported main-series games across Generations 1-4.
 *
 * A "game" is the specific cartridge (e.g. SoulSilver), as opposed to the
 * older `GameVersion` family code ('HGSS') that the save parser detects.
 * This is the single source of truth for:
 *   - which generation a game belongs to
 *   - the human-readable display name (what the card shows instead of "hg/ss")
 *   - which PokeAPI sprite set to render so each gen's Pokemon looks era-correct
 */

export type Game =
  | 'Red' | 'Blue' | 'Yellow'
  | 'Gold' | 'Silver' | 'Crystal'
  | 'Ruby' | 'Sapphire' | 'Emerald' | 'FireRed' | 'LeafGreen'
  | 'Diamond' | 'Pearl' | 'Platinum' | 'HeartGold' | 'SoulSilver';

export interface GameInfo {
  /** Human-readable name shown in the UI. */
  display: string;
  /** Generation number 1-4. */
  generation: number;
  /** Legacy family code used by the Gen 4 save detector / older records. */
  family: string;
  /** PokeAPI sprite-set path segment, e.g. "generation-i/yellow". */
  spritePath: string;
  /** Whether the game can produce shiny Pokemon (Gen 1 cannot). */
  hasShiny: boolean;
}

export const GAME_INFO: Record<Game, GameInfo> = {
  Red:        { display: 'Red',        generation: 1, family: 'RB',   spritePath: 'generation-i/red-blue',            hasShiny: false },
  Blue:       { display: 'Blue',       generation: 1, family: 'RB',   spritePath: 'generation-i/red-blue',            hasShiny: false },
  Yellow:     { display: 'Yellow',     generation: 1, family: 'Y',    spritePath: 'generation-i/yellow',              hasShiny: false },
  Gold:       { display: 'Gold',       generation: 2, family: 'GS',   spritePath: 'generation-ii/gold',               hasShiny: true },
  Silver:     { display: 'Silver',     generation: 2, family: 'GS',   spritePath: 'generation-ii/silver',             hasShiny: true },
  Crystal:    { display: 'Crystal',    generation: 2, family: 'C',    spritePath: 'generation-ii/crystal',            hasShiny: true },
  Ruby:       { display: 'Ruby',       generation: 3, family: 'RS',   spritePath: 'generation-iii/ruby-sapphire',     hasShiny: true },
  Sapphire:   { display: 'Sapphire',   generation: 3, family: 'RS',   spritePath: 'generation-iii/ruby-sapphire',     hasShiny: true },
  Emerald:    { display: 'Emerald',    generation: 3, family: 'E',    spritePath: 'generation-iii/emerald',           hasShiny: true },
  FireRed:    { display: 'FireRed',    generation: 3, family: 'FRLG', spritePath: 'generation-iii/firered-leafgreen', hasShiny: true },
  LeafGreen:  { display: 'LeafGreen',  generation: 3, family: 'FRLG', spritePath: 'generation-iii/firered-leafgreen', hasShiny: true },
  Diamond:    { display: 'Diamond',    generation: 4, family: 'DP',   spritePath: 'generation-iv/diamond-pearl',      hasShiny: true },
  Pearl:      { display: 'Pearl',      generation: 4, family: 'DP',   spritePath: 'generation-iv/diamond-pearl',      hasShiny: true },
  Platinum:   { display: 'Platinum',   generation: 4, family: 'Pt',   spritePath: 'generation-iv/platinum',           hasShiny: true },
  HeartGold:  { display: 'HeartGold',  generation: 4, family: 'HGSS', spritePath: 'generation-iv/heartgold-soulsilver', hasShiny: true },
  SoulSilver: { display: 'SoulSilver', generation: 4, family: 'HGSS', spritePath: 'generation-iv/heartgold-soulsilver', hasShiny: true },
};

const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

/**
 * Era-correct front sprite for a National Dex number as it appeared in `game`.
 * Falls back to the generation-neutral default sprite when `game` is unknown.
 * Accepts a loose string so DB record fields can be passed without casting.
 */
export function spriteUrl(dex: number, game?: Game | string | null, shiny = false): string {
  const info = game ? GAME_INFO[game as Game] : undefined;
  if (!info) return `${SPRITE_BASE}/${dex}.png`;
  const shinySeg = shiny && info.hasShiny ? '/shiny' : '';
  return `${SPRITE_BASE}/versions/${info.spritePath}${shinySeg}/${dex}.png`;
}

/** Generation-neutral fallback sprite, used for onError when a versioned sprite 404s. */
export function defaultSpriteUrl(dex: number): string {
  return `${SPRITE_BASE}/${dex}.png`;
}

import { GEN1_CARD_ART } from './gen1-card-art';
import { gen4CardArt } from './gen4-card-art';

/**
 * Original WotC TCG illustration (Base/Jungle/Fossil) for a Gen 1 species, if one
 * exists — the painted card art with its scene, dropped into the card's art window.
 * Returns null for species with no early-set card (falls back to the sprite).
 */
export function gen1CardArt(species: number, generation?: number | null): string | null {
  if (generation !== 1) return null;
  return GEN1_CARD_ART[species] ?? null;
}

/**
 * Era-correct TCG illustration for any supported generation. Branches on the
 * record's generation; per-game art selection inside Gen 4 lives in gen4-card-art.
 * Returns null when no era illustration is on hand (caller falls back to sprite).
 */
export function monCardArt(rec: { species: number; game?: string | null; generation?: number | null }): string | null {
  const gen = rec.generation ?? 0;
  if (gen === 1) return GEN1_CARD_ART[rec.species] ?? null;
  if (gen === 4) return gen4CardArt(rec.species, rec.game ?? null);
  return null; // Gen 2/3 art not yet on disk
}

const SURF_MOVE_ID = 57;
const PIKACHU_DEX = 25;
/** Local asset: the Gen 1 Pikachu's-Beach surfing-Pikachu sprite. */
const SURFING_PIKACHU_SPRITE = '/sprites/pikachu-surf.png';

/** Minimal shape needed to pick a Pokemon's card sprite. */
export interface SpriteSource {
  species: number;
  game?: string | null;
  generation?: number | null;
  isShiny?: boolean;
  moves?: number[];
}

/**
 * Card sprite for a specific Pokemon, including Easter eggs.
 *
 * Easter egg: a Gen 1 Pikachu that knows Surf (the Pokemon Yellow "Pikachu's
 * Beach" surfing Pikachu) rides a surfboard instead of using its normal sprite.
 */
export function monSpriteUrl(rec: SpriteSource): string {
  if (
    rec.species === PIKACHU_DEX &&
    rec.generation === 1 &&
    rec.moves?.includes(SURF_MOVE_ID)
  ) {
    return SURFING_PIKACHU_SPRITE;
  }
  return spriteUrl(rec.species, rec.game, rec.isShiny);
}

export function generationOf(game: Game): number {
  return GAME_INFO[game].generation;
}

/** Roman-numeral generation label, e.g. "Gen I". */
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V'];
export function genLabel(generation: number): string {
  return `Gen ${ROMAN[generation] ?? generation}`;
}

/**
 * Expand a legacy `GameVersion` family code (stored on older save records that
 * predate per-game detection) into a readable label. Used as a display fallback
 * when a record has no specific `game` set.
 */
export function expandFamily(code: string | undefined | null): string {
  switch (code) {
    case 'DP': return 'Diamond/Pearl';
    case 'Pt': return 'Platinum';
    case 'HGSS': return 'HeartGold/SoulSilver';
    case 'RB': return 'Red/Blue';
    case 'GS': return 'Gold/Silver';
    case 'FRLG': return 'FireRed/LeafGreen';
    case 'RS': return 'Ruby/Sapphire';
    default: return code || 'Unknown';
  }
}

/**
 * Resolve the best display label for a save or Pokemon record.
 * Prefers the specific game; falls back to expanding a legacy family code.
 */
export function gameLabel(rec: { game?: string | null; gameVersion?: string | null }): string {
  if (rec.game && rec.game in GAME_INFO) return GAME_INFO[rec.game as Game].display;
  if (rec.game) return rec.game;
  return expandFamily(rec.gameVersion);
}

/**
 * Best-effort inference of the specific game from an emulator save filename.
 * Emulators name battery saves after the ROM (e.g. "Pokemon Silver Version.sav"),
 * which is the most reliable signal for games whose specific identity cannot be
 * recovered from save bytes alone (Red/Blue/Yellow, Gold/Silver).
 */
export function inferGameFromFilename(filename: string): Game | null {
  const n = filename.toLowerCase();
  // Order matters: check two-word names before substrings they contain.
  if (n.includes('leafgreen') || n.includes('leaf green')) return 'LeafGreen';
  if (n.includes('firered') || n.includes('fire red')) return 'FireRed';
  if (n.includes('heartgold') || n.includes('heart gold')) return 'HeartGold';
  if (n.includes('soulsilver') || n.includes('soul silver')) return 'SoulSilver';
  if (n.includes('yellow')) return 'Yellow';
  if (n.includes('crystal')) return 'Crystal';
  if (n.includes('emerald')) return 'Emerald';
  if (n.includes('platinum')) return 'Platinum';
  if (n.includes('sapphire')) return 'Sapphire';
  if (n.includes('ruby')) return 'Ruby';
  if (n.includes('diamond')) return 'Diamond';
  if (n.includes('pearl')) return 'Pearl';
  if (n.includes('silver')) return 'Silver';
  if (n.includes('gold')) return 'Gold';
  if (n.includes('blue') || n.includes('green')) return 'Blue';
  if (n.includes('red')) return 'Red';
  return null;
}
