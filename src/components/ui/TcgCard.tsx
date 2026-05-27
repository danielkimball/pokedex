/**
 * Base Set (Gen 1) trading-card renderer.
 *
 * Composites three layers: the user's recolored Base Set template (the gold
 * frame, cloud texture, energy symbol and 1st-Edition stamp are baked into the
 * image), the original WotC illustration dropped into the art window, and the
 * Pokemon's real game data overlaid on top. Positions are percentages of the
 * card and fonts use container units (cqw) so the whole card scales cleanly.
 *
 * Coordinates were measured from the Electric template (electric.jpg). When the
 * other six type frames land they share this layout, so only TEMPLATE changes.
 */

import type { PokemonRecord } from '../../db/schema';
import { SPECIES } from '../../core/constants/species';
import { TYPES, SPECIES_TYPES } from '../../core/constants/types';
import { MOVES } from '../../core/constants/moves';
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
  const moves = record.moves.filter(Boolean).map(m => MOVES[m] ?? `Move ${m}`);
  const hp = approxHp(record.level);
  const dex3 = String(record.species).padStart(3, '0');
  const type = primaryType(record.species);

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
        <img src={energy(type === 'Electric' ? 'Electric' : type)} alt="" style={S.hpEnergy} />
      </div>

      {/* Species line on the gold bar */}
      <div style={S.subtitle}>NO.&nbsp;{dex3}</div>

      {/* Attacks (real moves) */}
      <div style={S.attacks}>
        {moves.map((mv, i) => (
          <div key={i} style={S.atkRow}>
            <img src={energy(type)} alt="" style={S.atkIcon} />
            <span style={S.atkName}>{mv}</span>
          </div>
        ))}
      </div>

      {/* Weakness / Resistance / Retreat */}
      <div style={S.wrr}>
        <span style={S.wrrCell}>
          <span style={S.wrrLbl}>weakness</span>
          <img src={energy('Fighting')} alt="Fighting" style={S.wrrIcon} />
        </span>
        <span style={S.wrrCell}>
          <span style={S.wrrLbl}>resistance</span>
          <span style={S.wrrDash}>—</span>
        </span>
        <span style={S.wrrCell}>
          <span style={S.wrrLbl}>retreat</span>
          <img src={energy('Normal')} alt="" style={S.wrrIcon} />
        </span>
      </div>

      {/* Bottom strip: original trainer + set + number */}
      <div style={S.bottom}>
        Caught by {record.otName || 'Unknown'} {'·'} YELLOW {'·'} {dex3}/151
      </div>
    </div>
  );
}

const S = {
  card: {
    position: 'relative' as const,
    width: '100%',
    maxWidth: '330px',
    aspectRatio: '800 / 1106',
    margin: '0 auto',
    containerType: 'size' as const,
    fontFamily: "'Cabin', 'Gill Sans', system-ui, sans-serif",
    userSelect: 'none' as const,
  },
  template: { position: 'absolute' as const, inset: 0, width: '100%', height: '100%', display: 'block' as const },
  art: { position: 'absolute' as const, objectFit: 'cover' as const, borderRadius: '1px' },

  name: {
    position: 'absolute' as const, top: '5.4%', left: '12.5%', right: '26%',
    fontSize: '5cqw', fontWeight: 800 as const, color: '#231a00',
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
  hpNum: { fontSize: '5.2cqw', fontWeight: 800 as const, color: '#231a00', lineHeight: 1 },
  hpLbl: { fontSize: '2.4cqw', fontWeight: 700 as const, color: '#231a00' },
  hpEnergy: { width: '5cqw', height: '5cqw', objectFit: 'contain' as const, alignSelf: 'center' as const },

  subtitle: {
    position: 'absolute' as const, top: '54.8%', left: '20%', right: '8%',
    textAlign: 'center' as const, fontSize: '2.5cqw', fontWeight: 700 as const,
    letterSpacing: '0.5px', color: '#2c2200',
  },

  attacks: {
    position: 'absolute' as const, top: '60%', left: '11%', right: '8%',
    display: 'flex', flexDirection: 'column' as const, gap: '1.4cqw',
  },
  atkRow: { display: 'flex', alignItems: 'center' as const, gap: '2cqw' },
  atkIcon: { width: '5cqw', height: '5cqw', objectFit: 'contain' as const, flexShrink: 0 },
  atkName: { fontSize: '3.7cqw', fontWeight: 700 as const, color: '#1a1500', textShadow: '0 1px 0 rgba(255,255,255,0.35)' },

  wrr: {
    position: 'absolute' as const, top: '84%', left: '10%', right: '10%',
    display: 'flex', justifyContent: 'space-between' as const, alignItems: 'center' as const,
  },
  wrrCell: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center' as const, gap: '0.6cqw' },
  wrrLbl: { fontSize: '1.7cqw', textTransform: 'uppercase' as const, letterSpacing: '0.5px', color: '#5a4a10' },
  wrrIcon: { width: '3.4cqw', height: '3.4cqw', objectFit: 'contain' as const },
  wrrDash: { fontSize: '3cqw', color: '#5a4a10', lineHeight: 1 },

  bottom: {
    position: 'absolute' as const, top: '91.3%', left: '8%', right: '8%',
    textAlign: 'center' as const, fontSize: '2cqw', fontStyle: 'italic' as const,
    color: '#3a2e00',
  },
} as const;
