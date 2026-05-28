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
import { GEN1_CARD_ARTIST } from '../../core/constants/gen1-card-artist';
import { gen1CardArt, defaultSpriteUrl, monSpriteUrl } from '../../core/constants/games';

const TEMPLATE = '/cards/gen1/templates/electric.jpg';
const WIN = { left: 10.7, top: 12.3, width: 78.5, height: 40.1 };

const ENERGY_IMG: Record<string, string> = {
  Normal: 'normal.png', Fighting: 'fighting.png', Flying: 'flying.png',
  Poison: 'poison.png', Ground: 'ground.png', Rock: 'Rock.png', Bug: 'bug.png',
  Ghost: 'ghost.png', Steel: 'steel.png', Fire: 'fire.png', Water: 'water.png',
  Grass: 'grass.png', Electric: 'Electric.png', Psychic: 'psychic.png',
  Ice: 'ice.png', Dragon: 'Dragon.png', Dark: 'dark.png',
};
const energy = (type: string) => `/energyImages/${ENERGY_IMG[type] ?? 'normal.png'}`;

const WEAKNESS: Record<string, string> = { Electric: 'Ground' };
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
  const dvs: [string, number][] = [
    ['HP', record.ivs.hp], ['ATK', record.ivs.atk], ['DEF', record.ivs.def],
    ['SPD', record.ivs.spe], ['SPC', record.ivs.spa],
  ];
  const artist = GEN1_CARD_ARTIST[record.species];

  return (
    <div style={S.card}>
      <img src={TEMPLATE} alt="" style={S.template} aria-hidden />
      <img
        src={art}
        alt={speciesName}
        style={{ ...S.art, left: `${WIN.left}%`, top: `${WIN.top}%`, width: `${WIN.width}%`, height: `${WIN.height}%` }}
        onError={(e) => { e.currentTarget.src = defaultSpriteUrl(record.species); }}
      />

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

      {/* Gold bar: OT / game / dex number */}
      <div style={S.subtitle}>OT: {record.otName || 'Unknown'} {'·'} Game: {game} {'·'} {dex3}/151</div>

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

      {/* Illustrator + copyright credit, spanning the width below the gold box */}
      <div style={S.credit}>
        <span>{artist ? `Illus. ${artist}` : ''}</span>
        <span>©1995, 96, 98 Nintendo, Creatures, GAMEFREAK</span>
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
    aspectRatio: '800 / 1106', margin: '0 auto',
    containerType: 'inline-size' as const, fontFamily: FONT, userSelect: 'none' as const,
    borderRadius: 'clamp(10px, 4.5vw, 20px)', overflow: 'hidden' as const,
    boxShadow: '0 5px 16px rgba(0,0,0,0.38)',
  },
  template: { position: 'absolute' as const, inset: 0, width: '100%', height: '100%', display: 'block' as const },
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
    position: 'absolute' as const, top: '60%', left: '11%', right: '11%',
    display: 'flex', flexDirection: 'column' as const, gap: '1.3cqw',
  },
  atkRow: { display: 'flex', alignItems: 'center' as const, gap: '2cqw' },
  atkIcon: { width: '5cqw', height: '5cqw', objectFit: 'contain' as const, flexShrink: 0 },
  atkName: { flex: 1, fontSize: '3.7cqw', fontWeight: 700 as const, color: INK, textShadow: '0 1px 0 rgba(255,255,255,0.35)' },
  atkPp: { fontSize: '3.3cqw', fontWeight: 700 as const, color: '#2a2a2a', flexShrink: 0 },
  atkPpLbl: { fontSize: '2.2cqw', color: '#5a5a5a' },

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
    position: 'absolute' as const, top: '91.5%', left: '10%', right: '10%',
    display: 'flex', alignItems: 'center' as const, justifyContent: 'space-between' as const,
  },
  dvLabel: { fontSize: '2.2cqw', fontWeight: 700 as const, color: '#5a4a10', letterSpacing: '0.5px' },
  dvCell: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center' as const, lineHeight: 1.05 },
  dvStat: { fontSize: '1.9cqw', color: '#6a5a20', textTransform: 'uppercase' as const },
  dvVal: { fontSize: '3.1cqw', fontWeight: 700 as const, color: INK },

  // Credit spans the width BELOW the bottom gold box (box ends ~95.9%, border ~98.2%).
  credit: {
    position: 'absolute' as const, top: '96.1%', left: '5%', right: '5%',
    display: 'flex', justifyContent: 'space-between' as const, alignItems: 'baseline' as const,
    gap: '2cqw', fontSize: '1.5cqw', color: '#3a2e00', whiteSpace: 'nowrap' as const,
  },
} as const;
