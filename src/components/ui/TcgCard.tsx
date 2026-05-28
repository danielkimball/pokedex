/**
 * Base Set (Gen 1) trading-card renderer.
 *
 * Three layers: the user's recolored Base Set template (gold frame, cloud
 * texture, energy symbol + 1st-Edition stamp baked in), the original WotC
 * illustration in the art window, and the Pokemon's real game data on top.
 * Positions are % of the card; fonts use cqw container units so it scales.
 *
 * Styling matches the 1999 Base Set: black Gill Sans name with a small stage
 * label above it, red HP, and an illustrator/copyright credit line. Gen 1 has
 * no natures/EVs/held items, so the bottom shows DVs and the info row shows
 * type weakness + current location (retreat/resistance dropped).
 */

import type { PokemonRecord } from '../../db/schema';
import { SPECIES } from '../../core/constants/species';
import { TYPES, SPECIES_TYPES } from '../../core/constants/types';
import { MOVES } from '../../core/constants/moves';
import { MOVE_PP, MOVE_TYPE } from '../../core/constants/moves-data';
import { EVOLUTIONS } from '../../core/constants/evolutions';
import { gen1CardArt, defaultSpriteUrl, monSpriteUrl } from '../../core/constants/games';
import { TYPE_TO_TCG_ENERGY, tcgEnergyUrl } from '../../core/constants/energies';

/** Art-window coordinates per template (each generated template has its own ~1% offsets). */
const ART_WINDOW: Record<string, { left: number; top: number; width: number; height: number }> = {
  lightning: { left: 10.7, top: 12.3, width: 78.5, height: 40.2 },
  fighting:  { left: 11.4, top: 12.9, width: 77.1, height: 40.0 },
  fire:      { left: 11.1, top: 12.3, width: 77.4, height: 39.7 },
  grass:     { left: 11.4, top: 12.9, width: 77.1, height: 40.0 },
  colorless: { left: 11.2, top: 11.9, width: 77.1, height: 39.7 },
  psychic:   { left: 11.4, top: 13.1, width: 76.4, height: 39.3 },
  water:     { left: 10.4, top: 11.9, width: 78.9, height: 39.3 },
};

const energy = tcgEnergyUrl;

/**
 * Per-template subtitle position (the gold bar text). Each generated template
 * has the bar at a slightly different y, and stamps of varying width — these
 * are measured from each PNG so the OT/Game/dex line sits centered on the bar.
 */
const SUBTITLE_POS: Record<string, { top: string; left: string; right: string }> = {
  lightning:  { top: '55.2%', left: '13%', right: '7%' },
  fighting:   { top: '56.4%', left: '13%', right: '7%' },
  fire:       { top: '55.5%', left: '13%', right: '7%' },
  grass:      { top: '56.5%', left: '13%', right: '7%' },
  colorless:  { top: '54.9%', left: '13%', right: '7%' },
  psychic:    { top: '56.3%', left: '14%', right: '6%' },
  water:      { top: '54.4%', left: '13%', right: '7%' },
};

function getTcgEnergy(species: number): string {
  const pair = SPECIES_TYPES[species];
  const type = pair && pair[0] >= 0 ? TYPES[pair[0]] : 'Normal';
  return TYPE_TO_TCG_ENERGY[type] ?? 'colorless';
}

/** Per-type Base Set frame: route the Pokemon's primary type to its TCG energy template. */
function templateFor(species: number): string {
  return `/cards/gen1/templates/${getTcgEnergy(species)}.png`;
}

/**
 * Primary in-game type weakness (Gen 1). Many types have multiple weaknesses;
 * we pick the canonical one. The icon is then folded through the TCG energy
 * map (Bug -> Grass icon, Ground -> Fighting icon, etc.).
 */
const WEAKNESS: Record<string, string> = {
  Normal: 'Fighting',
  Fire: 'Water',
  Water: 'Electric',
  Electric: 'Ground',
  Grass: 'Fire',
  Ice: 'Fire',
  Fighting: 'Psychic',
  Poison: 'Psychic',
  Ground: 'Water',
  Flying: 'Electric',
  Psychic: 'Bug',
  Bug: 'Fire',
  Rock: 'Water',
  Ghost: 'Psychic',
  Dragon: 'Ice',
};
const GEN_MAX_DEX: Record<number, number> = { 1: 151, 2: 251, 3: 386, 4: 493 };

function primaryType(species: number): string {
  const pair = SPECIES_TYPES[species];
  return pair && pair[0] >= 0 ? TYPES[pair[0]] : 'Normal';
}

/** TCG evolution stage, scoped to the source generation (ignores later-gen babies). */
function stageLabel(species: number, generation: number): string {
  const maxDex = GEN_MAX_DEX[generation] ?? 493;
  const chain = (EVOLUTIONS[species]?.chain ?? [species]).filter(d => d <= maxDex);
  const idx = chain.indexOf(species);
  return idx <= 0 ? 'Basic' : idx === 1 ? 'Stage 1' : 'Stage 2';
}

/** Crude HP from level (rounded to 10) until a base-stat table lands. */
function approxHp(level: number): number {
  return Math.min(120, Math.max(30, Math.round((level * 2 + 12) / 10) * 10));
}

export function TcgCard({ record }: { record: PokemonRecord }) {
  const speciesName = SPECIES[record.species] ?? `#${record.species}`;
  const title = record.nickname && record.nickname.toLowerCase() !== speciesName.toLowerCase()
    ? record.nickname
    : speciesName;
  const art = gen1CardArt(record.species, record.generation) ?? monSpriteUrl(record);
  const moves = record.moves.filter(Boolean).map(id => ({
    name: MOVES[id] ?? `Move ${id}`,
    pp: MOVE_PP[id],
    type: MOVE_TYPE[id] ?? primaryType(record.species),
  }));
  const hp = approxHp(record.level);
  const dex3 = String(record.species).padStart(3, '0');
  const type = primaryType(record.species);
  const weakness = WEAKNESS[type];
  const game = record.game ?? 'Yellow';
  const location = record.location === 'party'
    ? 'In Party'
    : `Box ${record.containerIndex + 1}, Slot ${record.slotIndex + 1}`;
  const energyKey = getTcgEnergy(record.species);
  const dvs: [string, number][] = [
    ['HP', record.ivs.hp], ['ATK', record.ivs.atk], ['DEF', record.ivs.def],
    ['SPD', record.ivs.spe], ['SPC', record.ivs.spa],
  ];

  return (
    <div style={S.card}>
      <img src={templateFor(record.species)} alt="" style={S.template} aria-hidden />
      {(() => {
        const w = ART_WINDOW[energyKey] ?? ART_WINDOW.lightning;
        return (
          <img
            src={art}
            alt={speciesName}
            style={{ ...S.art, left: `${w.left}%`, top: `${w.top}%`, width: `${w.width}%`, height: `${w.height}%` }}
            onError={(e) => { e.currentTarget.src = defaultSpriteUrl(record.species); }}
          />
        );
      })()}

      {/* Stage + name */}
      <div style={S.stage}>{stageLabel(record.species, record.generation ?? 1)} Pokémon</div>
      <div style={S.name}>
        {title}{record.isShiny && <span style={S.shiny}> ★</span>}
        <span style={S.lv}> Lv{record.level}</span>
      </div>

      {/* HP (red) + energy */}
      <div style={S.hp}>
        <span style={S.hpNum}>{hp}</span><span style={S.hpLbl}>HP</span>
        <img src={energy(type)} alt="" style={S.hpEnergy} />
      </div>

      {/* Gold bar: OT / game / dex number (position is per-template) */}
      <div style={{ ...S.subtitle, ...(SUBTITLE_POS[energyKey] ?? SUBTITLE_POS.lightning) }}>
        OT: {record.otName || 'Unknown'} {'·'} Game: {game} {'·'} {dex3}/151
      </div>

      {/* Attacks: real moves with their energy + PP */}
      <div style={S.attacks}>
        {moves.map((mv, i) => (
          <div key={i} style={S.atkRow}>
            <img src={energy(mv.type)} alt="" style={S.atkIcon} />
            <span style={S.atkName}>{mv.name}</span>
            {mv.pp != null && <span style={S.atkPp}>{mv.pp}<span style={S.atkPpLbl}>&nbsp;PP</span></span>}
          </div>
        ))}
      </div>

      {/* Info row: type weakness + current location */}
      <div style={S.info}>
        <span style={S.infoCell}>
          <span style={S.infoLbl}>weakness</span>
          {weakness ? <img src={energy(weakness)} alt={weakness} style={S.infoIcon} /> : <span style={S.infoDash}>—</span>}
        </span>
        <span style={{ ...S.infoCell, alignItems: 'flex-end' as const }}>
          <span style={S.infoLbl}>location</span>
          <span style={S.infoVal}>{location}</span>
        </span>
      </div>

      {/* DVs (Gen 1 IV equivalent), centered */}
      <div style={S.dvBox}>
        <span style={S.dvLabel}>DV</span>
        {dvs.map(([k, v]) => (
          <span key={k} style={S.dvCell}><span style={S.dvStat}>{k}</span><span style={S.dvVal}>{v}</span></span>
        ))}
      </div>
    </div>
  );
}

const FONT = "'Gill Sans', 'Gill Sans MT', 'GillSans', 'Seravek', 'Trebuchet MS', sans-serif";
const RED = '#e3000f';
const INK = '#141414';

const S = {
  card: {
    position: 'relative' as const, width: '100%', maxWidth: '330px',
    // Templates are ~720x990 with their own rounded gold border + transparent
    // corners, so the card itself is a plain rectangle; no border-radius needed.
    aspectRatio: '720 / 990', margin: '0 auto',
    containerType: 'inline-size' as const, fontFamily: FONT, userSelect: 'none' as const,
  },
  // drop-shadow follows the template's rounded silhouette (vs box-shadow which is rectangular).
  template: {
    position: 'absolute' as const, inset: 0, width: '100%', height: '100%', display: 'block' as const,
    filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.30))',
  },
  art: { position: 'absolute' as const, objectFit: 'cover' as const, borderRadius: '1px' },

  stage: {
    position: 'absolute' as const, top: '3%', left: '12.5%',
    fontSize: '2.1cqw', fontWeight: 700 as const, color: INK,
    textShadow: '0 1px 0 rgba(255,255,255,0.4)',
  },
  name: {
    position: 'absolute' as const, top: '5.7%', left: '12.5%', right: '27%',
    fontSize: '5.4cqw', fontWeight: 700 as const, color: INK, lineHeight: 1,
    textShadow: '0 1px 0 rgba(255,255,255,0.45)',
    whiteSpace: 'nowrap' as const, overflow: 'hidden' as const, textOverflow: 'ellipsis' as const,
  },
  shiny: { color: '#b8860b', fontSize: '4cqw' },
  lv: { fontSize: '3cqw', fontWeight: 700 as const, color: '#3a3a3a' },

  hp: {
    position: 'absolute' as const, top: '5%', right: '11%',
    display: 'flex', alignItems: 'baseline' as const, gap: '0.6cqw',
    textShadow: '0 1px 0 rgba(255,255,255,0.45)',
  },
  hpNum: { fontSize: '5.4cqw', fontWeight: 700 as const, color: RED, lineHeight: 1 },
  hpLbl: { fontSize: '4.8cqw', fontWeight: 700 as const, color: RED },
  hpEnergy: { width: '5cqw', height: '5cqw', objectFit: 'contain' as const, alignSelf: 'center' as const, marginLeft: '0.6cqw' },

  subtitle: {
    position: 'absolute' as const, top: '54.9%', left: '17%', right: '7%',
    textAlign: 'center' as const, fontSize: '2.3cqw', fontWeight: 700 as const,
    color: '#2c2200', whiteSpace: 'nowrap' as const, overflow: 'hidden' as const, textOverflow: 'ellipsis' as const,
  },

  attacks: {
    position: 'absolute' as const, top: '60.5%', left: '11%', right: '11%',
    display: 'flex', flexDirection: 'column' as const, gap: '2cqw',
  },
  atkRow: { display: 'flex', alignItems: 'center' as const, gap: '2.4cqw' },
  atkIcon: { width: '5.8cqw', height: '5.8cqw', objectFit: 'contain' as const, flexShrink: 0 },
  atkName: { flex: 1, fontSize: '4.3cqw', fontWeight: 700 as const, color: INK, textShadow: '0 1px 0 rgba(255,255,255,0.35)' },
  atkPp: { fontSize: '3.8cqw', fontWeight: 700 as const, color: '#2a2a2a', flexShrink: 0 },
  atkPpLbl: { fontSize: '2.5cqw', color: '#5a5a5a' },

  info: {
    position: 'absolute' as const, top: '83.5%', left: '11%', right: '11%',
    display: 'flex', justifyContent: 'space-between' as const, alignItems: 'flex-start' as const,
  },
  infoCell: { display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-start' as const, gap: '0.5cqw' },
  infoLbl: { fontSize: '1.8cqw', textTransform: 'uppercase' as const, letterSpacing: '0.5px', color: '#5a4a10' },
  infoIcon: { width: '3.6cqw', height: '3.6cqw', objectFit: 'contain' as const },
  infoDash: { fontSize: '3cqw', color: '#5a4a10', lineHeight: 1 },
  infoVal: { fontSize: '2.6cqw', fontWeight: 700 as const, color: INK },

  dvBox: {
    position: 'absolute' as const, top: '91.5%', left: 0, right: 0,
    display: 'flex', alignItems: 'center' as const, justifyContent: 'center' as const,
    gap: '4.5cqw',
  },
  dvLabel: { fontSize: '2.3cqw', fontWeight: 700 as const, color: '#5a4a10', letterSpacing: '0.5px' },
  dvCell: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center' as const, lineHeight: 1.05 },
  dvStat: { fontSize: '2cqw', color: '#6a5a20', textTransform: 'uppercase' as const },
  dvVal: { fontSize: '3.2cqw', fontWeight: 700 as const, color: INK },
} as const;
