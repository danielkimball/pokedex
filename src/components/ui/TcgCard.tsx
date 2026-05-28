/**
 * Multi-gen TCG-style card renderer.
 *
 * Composites a template (real PNG for Gen 1; a CSS-drawn placeholder frame for
 * Gen 2/3/4 until the user supplies real templates), the era illustration, and
 * the Pokemon's real game data. Branches on `record.generation`:
 *   Gen 1   -> DV row only, no ability/held item/nature.
 *   Gen 2   -> DVs + held item (DVs are still Gen 2's IV equivalent).
 *   Gen 3+  -> IVs (0-31) + EVs (0-252) + ability box + nature + held item.
 *
 * Positions are % of the card; fonts use cqw so the whole card scales together.
 */

import type { PokemonRecord } from '../../db/schema';
import { SPECIES } from '../../core/constants/species';
import { TYPES, SPECIES_TYPES } from '../../core/constants/types';
import { MOVES } from '../../core/constants/moves';
import { MOVE_PP, MOVE_TYPE } from '../../core/constants/moves-data';
import { EVOLUTIONS } from '../../core/constants/evolutions';
import { NATURES } from '../../core/constants/natures';
import { ABILITIES } from '../../core/constants/abilities';
import { getItemName } from '../../core/constants/items';
import { defaultSpriteUrl, monSpriteUrl, monCardArt } from '../../core/constants/games';
import { TYPE_TO_TCG_ENERGY, tcgEnergyUrl } from '../../core/constants/energies';

/** Art-window coordinates per template (Gen 1 PNGs; each has its own ~1% offsets). */
const ART_WINDOW: Record<string, { left: number; top: number; width: number; height: number }> = {
  lightning: { left: 10.7, top: 12.3, width: 78.5, height: 40.2 },
  fighting:  { left: 11.4, top: 12.9, width: 77.1, height: 40.0 },
  fire:      { left: 11.1, top: 12.3, width: 77.4, height: 39.7 },
  grass:     { left: 11.4, top: 12.9, width: 77.1, height: 40.0 },
  colorless: { left: 11.2, top: 11.9, width: 77.1, height: 39.7 },
  psychic:   { left: 11.4, top: 13.1, width: 76.4, height: 39.3 },
  water:     { left: 10.4, top: 11.9, width: 78.9, height: 39.3 },
};
const DEFAULT_WINDOW = { left: 10.7, top: 12.3, width: 78.5, height: 40.2 };

/**
 * Gen 4 frames (DP/PL/HGSS) use a wider, slightly-lower art window than Gen 1.
 * Used by the CssTemplate-Gen4 placeholder and by `<img>` art positioning.
 */
const GEN4_ART_WINDOW = { left: 7.0, top: 11.5, width: 86.0, height: 37.5 };

const energy = tcgEnergyUrl;

const SUBTITLE_POS: Record<string, { top: string; left: string; right: string }> = {
  lightning:  { top: '55.2%', left: '13%', right: '7%' },
  fighting:   { top: '56.4%', left: '13%', right: '7%' },
  fire:       { top: '55.5%', left: '13%', right: '7%' },
  grass:      { top: '56.5%', left: '13%', right: '7%' },
  colorless:  { top: '54.9%', left: '13%', right: '7%' },
  psychic:    { top: '56.3%', left: '14%', right: '6%' },
  water:      { top: '54.4%', left: '13%', right: '7%' },
};

const WEAKNESS: Record<string, string> = {
  Normal: 'Fighting', Fire: 'Water', Water: 'Electric', Electric: 'Ground',
  Grass: 'Fire', Ice: 'Fire', Fighting: 'Psychic', Poison: 'Psychic',
  Ground: 'Water', Flying: 'Electric', Psychic: 'Bug', Bug: 'Fire',
  Rock: 'Water', Ghost: 'Psychic', Dragon: 'Ice',
};

const GEN_MAX_DEX: Record<number, number> = { 1: 151, 2: 251, 3: 386, 4: 493 };

/** Which game maps to which template directory (Gen 1 done; later gens are placeholders). */
const TEMPLATE_DIR: Record<string, string> = {
  Red: 'gen1', Blue: 'gen1', Yellow: 'gen1',
  // Gen 2/3/4 — fall through to CssTemplate placeholder until PNGs land.
};

/** Per-energy palette for the CSS placeholder template. */
const TEMPLATE_COLORS: Record<string, { light: string; mid: string; dark: string }> = {
  lightning: { light: '#fff3a8', mid: '#f0cb3a', dark: '#a98000' },
  fire:      { light: '#ffd0a8', mid: '#e75d36', dark: '#8e2a10' },
  water:     { light: '#cfe9ff', mid: '#5aa8e8', dark: '#1a4d8a' },
  grass:     { light: '#dcf2c8', mid: '#76c252', dark: '#2d6a1c' },
  psychic:   { light: '#ead4f1', mid: '#b97cd2', dark: '#643088' },
  fighting:  { light: '#efd9b9', mid: '#c79b6e', dark: '#7d4f1f' },
  colorless: { light: '#f4ecd6', mid: '#d8d3b8', dark: '#8a8268' },
  darkness:  { light: '#5a4663', mid: '#332537', dark: '#0e0712' },
  metal:     { light: '#ddddea', mid: '#a8a8b8', dark: '#525260' },
};

function primaryType(species: number): string {
  const pair = SPECIES_TYPES[species];
  return pair && pair[0] >= 0 ? TYPES[pair[0]] : 'Normal';
}

function getTcgEnergy(species: number): string {
  return TYPE_TO_TCG_ENERGY[primaryType(species)] ?? 'colorless';
}

function stageLabel(species: number, generation: number): string {
  const maxDex = GEN_MAX_DEX[generation] ?? 493;
  const chain = (EVOLUTIONS[species]?.chain ?? [species]).filter(d => d <= maxDex);
  const idx = chain.indexOf(species);
  return idx <= 0 ? 'Basic' : idx === 1 ? 'Stage 1' : 'Stage 2';
}

function approxHp(level: number): number {
  return Math.min(120, Math.max(30, Math.round((level * 2 + 12) / 10) * 10));
}

/** CSS-drawn placeholder template used until real PNG frames are supplied. */
function CssTemplate({ energyKey, gen }: { energyKey: string; gen: number }) {
  const c = TEMPLATE_COLORS[energyKey] ?? TEMPLATE_COLORS.colorless;
  // Gen 4 frame: wider art window (matches the diamond/angled frame shape we'll
  // swap in once Dan generates the real PNG templates), bigger inner gold border.
  const isGen4 = gen >= 4;
  const art = isGen4 ? GEN4_ART_WINDOW : { left: 10.7, top: 12.3, width: 78.5, height: 40.2 };
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 30% 22%, ${c.light} 0%, ${c.mid} 55%, ${c.dark} 100%)`,
        borderRadius: '4cqw',
        boxShadow: 'inset 0 0 0 1.7cqw #d8b34a, 0 4px 12px rgba(0,0,0,0.32)',
        overflow: 'hidden',
      }}
    >
      {/* art-window inner gold frame */}
      <div style={{
        position: 'absolute',
        left: `${art.left}%`, top: `${art.top}%`,
        width: `${art.width}%`, height: `${art.height}%`,
        border: '0.55cqw solid #d4a72a', background: '#ffffff', boxSizing: 'border-box',
        boxShadow: '0 0.2cqw 0.5cqw rgba(0,0,0,0.15)',
        // Gen 4 frames have a subtle parallelogram cut on the right edge;
        // approximate with a small clip-path that hints at the shape.
        clipPath: isGen4
          ? 'polygon(0 0, 96% 0, 100% 12%, 100% 100%, 4% 100%, 0 88%)'
          : undefined,
      }} />
      {/* gold subtitle bar — aligned with SUBTITLE_POS so the OT text sits on it. */}
      <div style={{
        position: 'absolute', left: '8%', right: '8%',
        top: '54.5%',
        height: '4cqw',
        background: 'linear-gradient(180deg, #f0c84a, #b08020 50%, #f0c84a 100%)',
        borderRadius: '0.4cqw', boxShadow: '0 0.2cqw 0.4cqw rgba(0,0,0,0.25)',
      }} />
      {/* Gen 1 only: 1st-Edition-style black stamp at the left of the subtitle bar.
          Gen 4 cards never had this — omit for non-Gen-1 to avoid the "black hole". */}
      {!isGen4 && (
        <div style={{
          position: 'absolute', left: '4.5%', top: '53.5%', width: '6cqw', height: '6cqw',
          background: '#1a1a1a', borderRadius: '50%',
          border: '0.3cqw solid #b08020',
        }} />
      )}
      {/* bottom stat-box outline — sized + positioned to hug the IV/EV rows. */}
      <div style={{
        position: 'absolute', left: '7%', right: '7%',
        top: isGen4 ? '90.5%' : '88.5%',
        bottom: '2%',
        border: '0.25cqw solid #b08020', borderRadius: '0.5cqw',
        background: 'rgba(255,255,255,0.08)',
      }} />
    </div>
  );
}

export function TcgCard({ record }: { record: PokemonRecord }) {
  const gen = record.generation ?? 1;
  // Gen 4 stores the real ability id; Gen 3 stores only the slot index (needs a
  // species->abilities table to resolve). Gate to gen 4+ until that table lands.
  const showAbility = gen >= 4 && record.ability != null && record.ability > 0;
  const showHeldItem = gen >= 2 && record.heldItem > 0;
  const showEVs = gen >= 3;
  const showNature = gen >= 3;

  const dir = TEMPLATE_DIR[record.game ?? ''] ?? null;
  const usePng = dir !== null;
  const energyKey = getTcgEnergy(record.species);

  const speciesName = SPECIES[record.species] ?? `#${record.species}`;
  const title = record.nickname && record.nickname.toLowerCase() !== speciesName.toLowerCase()
    ? record.nickname : speciesName;
  const art = monCardArt(record) ?? monSpriteUrl(record);
  const moves = record.moves.filter(Boolean).map(id => ({
    name: MOVES[id] ?? `Move ${id}`,
    pp: MOVE_PP[id],
    type: MOVE_TYPE[id] ?? primaryType(record.species),
  }));
  const hp = approxHp(record.level);
  const type = primaryType(record.species);
  const weakness = WEAKNESS[type];
  const game = record.game ?? 'Yellow';
  const dexMax = GEN_MAX_DEX[gen] ?? 493;
  const dex3 = String(record.species).padStart(3, '0');
  const location = record.location === 'party'
    ? 'In Party'
    : `Box ${record.containerIndex + 1}, Slot ${record.slotIndex + 1}`;
  const natureName = showNature ? (NATURES[record.nature] ?? null) : null;
  const abilityName = showAbility ? (ABILITIES[record.ability] ?? null) : null;
  const heldItemName = showHeldItem ? getItemName(record.heldItem) : null;

  // IVs differ Gen 1/2 (DVs, 5 stats merging spa/spd into Spc) vs Gen 3+ (IVs, 6 stats 0-31).
  const ivCells: [string, number][] = gen >= 3
    ? [['HP', record.ivs.hp], ['ATK', record.ivs.atk], ['DEF', record.ivs.def],
       ['SPA', record.ivs.spa], ['SPD', record.ivs.spd], ['SPE', record.ivs.spe]]
    : [['HP', record.ivs.hp], ['ATK', record.ivs.atk], ['DEF', record.ivs.def],
       ['SPD', record.ivs.spe], ['SPC', record.ivs.spa]];
  const evCells: [string, number][] = [
    ['HP', record.evs.hp], ['ATK', record.evs.atk], ['DEF', record.evs.def],
    ['SPA', record.evs.spa], ['SPD', record.evs.spd], ['SPE', record.evs.spe],
  ];

  // Ability now sits inline next to nature in the name row (no box), so attacks
  // always start at the same height regardless of generation.
  const attacksTop = '60.5%';

  const win = usePng
    ? (ART_WINDOW[energyKey] ?? DEFAULT_WINDOW)
    : (gen >= 4 ? GEN4_ART_WINDOW : DEFAULT_WINDOW);

  return (
    <div style={S.card}>
      {usePng ? (
        <img src={`/cards/${dir}/templates/${energyKey}.png`} alt="" style={S.template} aria-hidden />
      ) : (
        <CssTemplate energyKey={energyKey} gen={gen} />
      )}

      <img
        src={art}
        alt={speciesName}
        // Gen 4 uses `contain` so wider crops never lose ears/tails to overflow;
        // Gen 1 stays on `cover` so its painted scene fills its tighter frame.
        style={{
          ...S.art,
          left: `${win.left}%`, top: `${win.top}%`,
          width: `${win.width}%`, height: `${win.height}%`,
          objectFit: gen >= 4 ? 'contain' : 'cover',
        }}
        onError={(e) => { e.currentTarget.src = defaultSpriteUrl(record.species); }}
      />

      {/* Stage + name + ability + nature, all inline (Gen 3+ shows ability/nature). */}
      <div style={S.stage}>{stageLabel(record.species, gen)} Pokémon</div>
      <div style={S.name}>
        {title}{record.isShiny && <span style={S.shiny}> ★</span>}
        <span style={S.lv}> Lv{record.level}</span>
        {abilityName && <span style={S.abilityInline}> {'·'} {abilityName}</span>}
        {natureName && <span style={S.natureInline}> {'·'} {natureName}</span>}
      </div>

      {/* HP (red) + energy */}
      <div style={S.hp}>
        <span style={S.hpNum}>{hp}</span><span style={S.hpLbl}>HP</span>
        <img src={energy(type)} alt="" style={S.hpEnergy} />
      </div>

      {/* Gold bar: OT / game / dex number */}
      <div style={{ ...S.subtitle, ...(SUBTITLE_POS[energyKey] ?? SUBTITLE_POS.lightning) }}>
        OT: {record.otName || 'Unknown'} {'·'} Game: {game} {'·'} {dex3}/{dexMax}
      </div>

      {/* Attacks */}
      <div style={{ ...S.attacks, top: attacksTop }}>
        {moves.map((mv, i) => (
          <div key={i} style={S.atkRow}>
            <img src={energy(mv.type)} alt="" style={S.atkIcon} />
            <span style={S.atkName}>{mv.name}</span>
            {mv.pp != null && <span style={S.atkPp}>{mv.pp}<span style={S.atkPpLbl}>&nbsp;PP</span></span>}
          </div>
        ))}
      </div>

      {/* Info row: weakness + location (+ held item Gen 2+) */}
      <div style={S.info}>
        <span style={S.infoCell}>
          <span style={S.infoLbl}>weakness</span>
          {weakness ? <img src={energy(weakness)} alt={weakness} style={S.infoIcon} /> : <span style={S.infoDash}>—</span>}
        </span>
        <span style={{ ...S.infoCell, alignItems: 'center' as const }}>
          <span style={S.infoLbl}>location</span>
          <span style={S.infoValSmall}>{location}</span>
        </span>
        {showHeldItem ? (
          <span style={{ ...S.infoCell, alignItems: 'flex-end' as const }}>
            <span style={S.infoLbl}>held item</span>
            <span style={S.infoValSmall}>{heldItemName}</span>
          </span>
        ) : (
          <span style={S.infoCell} />
        )}
      </div>

      {/* Bottom box: Gen 3+ = IV row + EV row; Gen 1/2 = DV row */}
      {showEVs ? (
        <div style={S.statBoxGen4}>
          <div style={S.statRow}>
            <span style={S.statRowLabel}>IV</span>
            {ivCells.map(([k, v]) => (
              <span key={k} style={S.statCell}>
                <span style={S.statKey}>{k}</span>
                <span style={S.statVal}>{v}</span>
              </span>
            ))}
          </div>
          <div style={S.statRow}>
            <span style={S.statRowLabel}>EV</span>
            {evCells.map(([k, v]) => (
              <span key={k} style={S.statCell}>
                <span style={S.statKey}>{k}</span>
                <span style={S.statVal}>{v}</span>
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div style={S.dvBox}>
          <span style={S.dvLabel}>DV</span>
          {ivCells.map(([k, v]) => (
            <span key={k} style={S.dvCell}><span style={S.dvStat}>{k}</span><span style={S.dvVal}>{v}</span></span>
          ))}
        </div>
      )}
    </div>
  );
}

const FONT = "'Gill Sans', 'Gill Sans MT', 'GillSans', 'Seravek', 'Trebuchet MS', sans-serif";
const RED = '#e3000f';
const INK = '#141414';

const S = {
  card: {
    position: 'relative' as const, width: '100%', maxWidth: '330px',
    aspectRatio: '720 / 990', margin: '0 auto',
    containerType: 'inline-size' as const, fontFamily: FONT, userSelect: 'none' as const,
  },
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
  natureInline: { fontSize: '2.6cqw', fontWeight: 600 as const, color: '#4a3a00' },
  // Ability sits inline with nature in the name row (Gen 4+) — no separate box.
  abilityInline: { fontSize: '2.6cqw', fontWeight: 700 as const, color: '#8a3a00' },

  hp: {
    position: 'absolute' as const, top: '5%', right: '11%',
    display: 'flex', alignItems: 'baseline' as const, gap: '0.6cqw',
    textShadow: '0 1px 0 rgba(255,255,255,0.45)',
  },
  hpNum: { fontSize: '5.4cqw', fontWeight: 700 as const, color: RED, lineHeight: 1 },
  hpLbl: { fontSize: '4.8cqw', fontWeight: 700 as const, color: RED },
  hpEnergy: { width: '5cqw', height: '5cqw', objectFit: 'contain' as const, alignSelf: 'center' as const, marginLeft: '0.6cqw' },

  subtitle: {
    position: 'absolute' as const,
    textAlign: 'center' as const, fontSize: '2.3cqw', fontWeight: 700 as const,
    color: '#2c2200', whiteSpace: 'nowrap' as const, overflow: 'hidden' as const, textOverflow: 'ellipsis' as const,
  },

  attacks: {
    position: 'absolute' as const, left: '11%', right: '11%',
    display: 'flex', flexDirection: 'column' as const, gap: '2cqw',
  },
  atkRow: { display: 'flex', alignItems: 'center' as const, gap: '2.4cqw' },
  atkIcon: { width: '5.8cqw', height: '5.8cqw', objectFit: 'contain' as const, flexShrink: 0 },
  atkName: { flex: 1, fontSize: '4.3cqw', fontWeight: 700 as const, color: INK, textShadow: '0 1px 0 rgba(255,255,255,0.35)' },
  atkPp: { fontSize: '3.8cqw', fontWeight: 700 as const, color: '#2a2a2a', flexShrink: 0 },
  atkPpLbl: { fontSize: '2.5cqw', color: '#5a5a5a' },

  info: {
    position: 'absolute' as const, top: '83.5%', left: '11%', right: '11%',
    display: 'flex', justifyContent: 'space-between' as const, alignItems: 'flex-start' as const, gap: '1cqw',
  },
  infoCell: { display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-start' as const, gap: '0.5cqw', minWidth: 0 },
  infoLbl: { fontSize: '1.8cqw', textTransform: 'uppercase' as const, letterSpacing: '0.5px', color: '#5a4a10' },
  infoIcon: { width: '3.6cqw', height: '3.6cqw', objectFit: 'contain' as const },
  infoDash: { fontSize: '3cqw', color: '#5a4a10', lineHeight: 1 },
  infoVal: { fontSize: '2.6cqw', fontWeight: 700 as const, color: INK },
  infoValSmall: { fontSize: '2.3cqw', fontWeight: 700 as const, color: INK, whiteSpace: 'nowrap' as const, overflow: 'hidden' as const, textOverflow: 'ellipsis' as const },

  // Gen 1/2 single DV row
  dvBox: {
    position: 'absolute' as const, top: '91.5%', left: 0, right: 0,
    display: 'flex', alignItems: 'center' as const, justifyContent: 'center' as const, gap: '4.5cqw',
  },
  dvLabel: { fontSize: '2.3cqw', fontWeight: 700 as const, color: '#5a4a10', letterSpacing: '0.5px' },
  dvCell: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center' as const, lineHeight: 1.05 },
  dvStat: { fontSize: '2cqw', color: '#6a5a20', textTransform: 'uppercase' as const },
  dvVal: { fontSize: '3.2cqw', fontWeight: 700 as const, color: INK },

  // Gen 3+ two-row IV/EV box — dropped lower so the 4-attack list above doesn't
  // overlap once the ability box was removed.
  statBoxGen4: {
    position: 'absolute' as const, top: '91.5%', left: '9%', right: '9%',
    display: 'flex', flexDirection: 'column' as const, gap: '0.4cqw',
  },
  statRow: {
    display: 'flex', alignItems: 'center' as const, justifyContent: 'space-between' as const, gap: '1cqw',
  },
  statRowLabel: {
    fontSize: '1.9cqw', fontWeight: 700 as const, color: '#5a4a10', letterSpacing: '0.5px',
    minWidth: '3.5cqw',
  },
  statCell: { display: 'flex', alignItems: 'baseline' as const, gap: '0.6cqw', minWidth: 0 },
  statKey: { fontSize: '1.6cqw', color: '#6a5a20', textTransform: 'uppercase' as const },
  statVal: { fontSize: '2.5cqw', fontWeight: 700 as const, color: INK },
} as const;
