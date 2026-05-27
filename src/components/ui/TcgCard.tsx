/**
 * Base Set (Gen 1) trading-card renderer.
 *
 * Three layers: the user's recolored Base Set template (gold frame, cloud
 * texture, energy symbol + 1st-Edition stamp baked in), the original WotC
 * illustration in the art window, and the Pokemon's real game data on top.
 * Positions are % of the card; fonts use container units (cqw) so it scales.
 *
 * Gen 1 has no natures and no held items, and uses DVs (0-15) rather than EVs,
 * so the layout reflects that: gold bar = OT / game / dex no.; bottom box = DVs;
 * the info row shows type weakness + current location (retreat/resistance, which
 * are TCG-only concepts, are dropped — the right slot is reserved for held items
 * in later gens).
 */

import type { PokemonRecord } from '../../db/schema';
import { SPECIES } from '../../core/constants/species';
import { TYPES, SPECIES_TYPES } from '../../core/constants/types';
import { MOVES } from '../../core/constants/moves';
import { MOVE_PP, MOVE_TYPE } from '../../core/constants/moves-data';
import { gen1CardArt, defaultSpriteUrl, monSpriteUrl } from '../../core/constants/games';

const TEMPLATE = '/cards/gen1/templates/electric.jpg';

/** Art-window rectangle measured from the template (white interior). */
const WIN = { left: 10.7, top: 12.3, width: 78.5, height: 40.1 };

/** Type name -> energy icon in /energyImages (matches TypeBadge). */
const ENERGY_IMG: Record<string, string> = {
  Normal: 'normal.png', Fighting: 'fighting.png', Flying: 'flying.png',
  Poison: 'poison.png', Ground: 'ground.png', Rock: 'Rock.png', Bug: 'bug.png',
  Ghost: 'ghost.png', Steel: 'steel.png', Fire: 'fire.png', Water: 'water.png',
  Grass: 'grass.png', Electric: 'Electric.png', Psychic: 'psychic.png',
  Ice: 'ice.png', Dragon: 'Dragon.png', Dark: 'dark.png',
};
const energy = (type: string) => `/energyImages/${ENERGY_IMG[type] ?? 'normal.png'}`;

/** In-game type weakness (single, primary). Full chart lands with the other gens. */
const WEAKNESS: Record<string, string> = { Electric: 'Ground' };

function primaryType(species: number): string {
  const pair = SPECIES_TYPES[species];
  return pair && pair[0] >= 0 ? TYPES[pair[0]] : 'Normal';
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

  return (
    <div style={S.card}>
      <img src={TEMPLATE} alt="" style={S.template} aria-hidden />

      {/* Original WotC illustration in the art window */}
      <img
        src={art}
        alt={speciesName}
        style={{ ...S.art, left: `${WIN.left}%`, top: `${WIN.top}%`, width: `${WIN.width}%`, height: `${WIN.height}%` }}
        onError={(e) => { e.currentTarget.src = defaultSpriteUrl(record.species); }}
      />

      {/* Name + level */}
      <div style={S.name}>
        {title}{record.isShiny && <span style={S.shiny}> ★</span>}
        <span style={S.lv}> Lv{record.level}</span>
      </div>

      {/* HP + energy */}
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

      {/* Info row: type weakness + current location (retreat slot left blank for items) */}
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

      {/* Bottom box: DVs (Gen 1 IV equivalent) */}
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

const S = {
  card: {
    position: 'relative' as const,
    width: '100%',
    maxWidth: '330px',
    aspectRatio: '800 / 1106',
    margin: '0 auto',
    containerType: 'size' as const,
    fontFamily: FONT,
    userSelect: 'none' as const,
    borderRadius: 'clamp(10px, 4.5vw, 20px)',
    overflow: 'hidden' as const,
    boxShadow: '0 5px 16px rgba(0,0,0,0.38)',
  },
  template: { position: 'absolute' as const, inset: 0, width: '100%', height: '100%', display: 'block' as const },
  art: { position: 'absolute' as const, objectFit: 'cover' as const, borderRadius: '1px' },

  name: {
    position: 'absolute' as const, top: '5.4%', left: '12.5%', right: '26%',
    fontSize: '5cqw', fontWeight: 700 as const, color: '#231a00',
    lineHeight: 1, textShadow: '0 1px 0 rgba(255,255,255,0.45)',
    whiteSpace: 'nowrap' as const, overflow: 'hidden' as const, textOverflow: 'ellipsis' as const,
  },
  shiny: { color: '#b8860b', fontSize: '4cqw' },
  lv: { fontSize: '3cqw', fontWeight: 700 as const, color: '#4a3a00' },

  hp: {
    position: 'absolute' as const, top: '5%', right: '11.5%',
    display: 'flex', alignItems: 'baseline' as const, gap: '0.6cqw',
    textShadow: '0 1px 0 rgba(255,255,255,0.45)',
  },
  hpNum: { fontSize: '5.2cqw', fontWeight: 700 as const, color: '#231a00', lineHeight: 1 },
  hpLbl: { fontSize: '2.4cqw', fontWeight: 700 as const, color: '#231a00' },
  hpEnergy: { width: '5cqw', height: '5cqw', objectFit: 'contain' as const, alignSelf: 'center' as const },

  subtitle: {
    position: 'absolute' as const, top: '54.9%', left: '17%', right: '7%',
    textAlign: 'center' as const, fontSize: '2.3cqw', fontWeight: 700 as const,
    color: '#2c2200', whiteSpace: 'nowrap' as const, overflow: 'hidden' as const, textOverflow: 'ellipsis' as const,
  },

  attacks: {
    position: 'absolute' as const, top: '60%', left: '11%', right: '7%',
    display: 'flex', flexDirection: 'column' as const, gap: '1.3cqw',
  },
  atkRow: { display: 'flex', alignItems: 'center' as const, gap: '2cqw' },
  atkIcon: { width: '5cqw', height: '5cqw', objectFit: 'contain' as const, flexShrink: 0 },
  atkName: { flex: 1, fontSize: '3.7cqw', fontWeight: 700 as const, color: '#1a1500', textShadow: '0 1px 0 rgba(255,255,255,0.35)' },
  atkPp: { fontSize: '3.3cqw', fontWeight: 700 as const, color: '#3a3000', flexShrink: 0 },
  atkPpLbl: { fontSize: '2.2cqw', color: '#6a5a20' },

  info: {
    position: 'absolute' as const, top: '83.5%', left: '11%', right: '9%',
    display: 'flex', justifyContent: 'space-between' as const, alignItems: 'flex-start' as const,
  },
  infoCell: { display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-start' as const, gap: '0.5cqw' },
  infoLbl: { fontSize: '1.8cqw', textTransform: 'uppercase' as const, letterSpacing: '0.5px', color: '#5a4a10' },
  infoIcon: { width: '3.6cqw', height: '3.6cqw', objectFit: 'contain' as const },
  infoDash: { fontSize: '3cqw', color: '#5a4a10', lineHeight: 1 },
  infoVal: { fontSize: '2.6cqw', fontWeight: 700 as const, color: '#231a00' },

  dvBox: {
    position: 'absolute' as const, top: '91%', left: '9%', right: '9%',
    display: 'flex', alignItems: 'center' as const, justifyContent: 'space-between' as const, gap: '1cqw',
  },
  dvLabel: { fontSize: '2cqw', fontWeight: 700 as const, color: '#5a4a10', letterSpacing: '0.5px' },
  dvCell: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center' as const, lineHeight: 1.1 },
  dvStat: { fontSize: '1.6cqw', color: '#6a5a20', textTransform: 'uppercase' as const },
  dvVal: { fontSize: '2.6cqw', fontWeight: 700 as const, color: '#231a00' },
} as const;
