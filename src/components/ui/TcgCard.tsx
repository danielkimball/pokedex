/**
 * Multi-gen TCG-style card renderer.
 *
 * Composites a template (real PNG for Gen 1; HGSS real PNGs as they land;
 * a CSS-drawn placeholder for remaining Gen 2/3/4), the era illustration, and
 * the Pokemon's real game data. Branches on `record.generation`:
 *   Gen 1   -> DV row only, no ability/held item/nature.
 *   Gen 2   -> DVs + held item (DVs are still Gen 2's IV equivalent).
 *   Gen 3+  -> IVs (0-31) + EVs (0-252) + ability box + nature + held item.
 *
 * Positions are % of the card; fonts use cqw so the whole card scales together.
 */

import type { PokemonRecord } from '../../db/schema';
import { SPECIES } from '../../core/constants/species';
import { MOVES } from '../../core/constants/moves';
import { MOVE_PP, MOVE_TYPE } from '../../core/constants/moves-data';
import { NATURES } from '../../core/constants/natures';
import { ABILITIES } from '../../core/constants/abilities';
import { getItemName } from '../../core/constants/items';
import { gen4FormName } from '../../core/constants/forms-gen4';
import { defaultSpriteUrl, monSpriteUrl, monCardArt, spriteUrl } from '../../core/constants/games';
import { tcgEnergyUrlForGen } from '../../core/constants/energies';
import {
  GEN_MAX_DEX, getTcgEnergy, preEvolutionOf, primaryType, resolveHgssTemplate,
  stageLabel, tcgStageLabel,
} from '../../core/constants/tcg-card';

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
 * Gen 4 art window: smaller box (with frame breathing room around it) so the
 * full v5 crop — which includes the BASIC/Stage tab corner and the entire
 * subject — fits via objectFit:'contain' without any further cropping.
 * Aspect ~1.58 roughly matches the source-crop aspect (~1.57-1.61).
 */
const GEN4_ART_WINDOW = { left: 11.0, top: 13.5, width: 78.0, height: 36.0 };

/**
 * Gen 2 art window: shorter than Gen 4. Neo/e-Card cards have a tall species-
 * name header above the art, so we crop higher and end up with a more
 * landscape-oriented crop (~2.0:1 aspect). Box aspect ~2.0 matches.
 */
const GEN2_ART_WINDOW = { left: 11.0, top: 16.0, width: 78.0, height: 28.0 };

/**
 * Art window per energy (transparent hole).
 *
 * Tops sit just under the silver rail, ~10.2-10.6%, matching a real HGSS card
 * (measured at 10.16% on the Cyndaquil scan in HGSS_Card_Templates/actualcards).
 * The stage-tab capsule stays opaque and overhangs the art, as on a real card.
 * The blanks originally punched the hole at 12.30%, which left a band of flat
 * opaque colour between the tab and the illustration — re-punched by
 * tmp/hgss_repunch_hole.py.
 *
 * Stage 1 / Stage 2 frames are derived from the basics (only the tab lettering
 * differs — see tmp/hgss_make_stages.py), so one window per energy covers all
 * three stages.
 */
const HGSS_ART_WINDOW: Record<string, { left: number; top: number; width: number; height: number }> = {
  fire:      { left: 7.06, top: 10.27, width: 85.78, height: 42.19 },
  lightning: { left: 6.50, top: 10.47, width: 86.91, height: 43.01 },
  grass:     { left: 7.06, top: 10.47, width: 85.78, height: 43.95 },
  water:     { left: 6.50, top: 10.20, width: 86.91, height: 45.37 },
  fighting:  { left: 7.72, top: 10.41, width: 84.46, height: 42.13 },
  psychic:   { left: 6.50, top: 10.20, width: 86.91, height: 44.76 },
  colorless: { left: 6.50, top: 10.14, width: 86.91, height: 44.42 },
};
// Heights carry +0.10 over the measured alpha bbox: at some viewport widths the
// box rounded a device pixel short and left a hairline of bare hole along the
// bottom. The overshoot lands behind the opaque silver lip, so it never shows.
const HGSS_ART_DEFAULT = HGSS_ART_WINDOW.fire;

/**
 * Text anchors per template. Silver lip / bottom rule Y differ slightly across
 * PNGs, so OT / moves / stats / footer track each energy independently.
 */
const HGSS_LAYOUT: Record<string, {
  dataBarTop: string;
  attacksTop: string;
  statBoxTop: string;
  heldPillTop: string;
  footerTop: string;
}> = {
  fire: {
    dataBarTop: '53.31%',
    attacksTop: '56.81%',
    statBoxTop: '84.93%',
    heldPillTop: '86.68%',
    footerTop: '89.08%',
  },
  lightning: {
    dataBarTop: '54.33%',
    attacksTop: '57.83%',
    statBoxTop: '86.29%',
    heldPillTop: '88.04%',
    footerTop: '90.44%',
  },
  grass: {
    dataBarTop: '55.27%',
    attacksTop: '58.77%',
    statBoxTop: '87.43%',
    heldPillTop: '89.18%',
    footerTop: '91.58%',
  },
  water: {
    dataBarTop: '56.76%',
    attacksTop: '60.26%',
    statBoxTop: '88.04%',
    heldPillTop: '89.79%',
    footerTop: '92.19%',
  },
  fighting: {
    dataBarTop: '53.38%',
    attacksTop: '56.88%',
    statBoxTop: '85.68%',
    heldPillTop: '87.43%',
    footerTop: '89.83%',
  },
  psychic: {
    dataBarTop: '55.81%',
    attacksTop: '59.31%',
    statBoxTop: '87.97%',
    heldPillTop: '89.72%',
    footerTop: '92.12%',
  },
  colorless: {
    dataBarTop: '55.41%',
    attacksTop: '58.91%',
    statBoxTop: '87.57%',
    heldPillTop: '89.32%',
    footerTop: '91.72%',
  },
};

/**
 * The gen4 illustrations keep a sliver of the source card's OWN stage tab along
 * the top — measured at ~10px of 423 on the HGSS-era crops, e.g.
 * public/cards/gen4/hgss1/57.jpg. Now that the hole reaches up under our own
 * opaque tab, that sliver lands behind it and is hidden, so we only need to zoom
 * past the source's frame edge. Anything larger visibly shaves the artwork.
 */
const HGSS_ART_TAB_STRIP = 0.024;
const HGSS_ART_ZOOM = 1 / (1 - HGSS_ART_TAB_STRIP);

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

function approxHp(level: number): number {
  return Math.min(120, Math.max(30, Math.round((level * 2 + 12) / 10) * 10));
}

/** CSS-drawn placeholder template used until real PNG frames are supplied. */
function CssTemplate({ energyKey, gen }: { energyKey: string; gen: number }) {
  const c = TEMPLATE_COLORS[energyKey] ?? TEMPLATE_COLORS.colorless;
  // Modern (Gen 2+) frames: rounded art window, gold ring, drop the 1st-Ed dot.
  // Each modern gen has its own art-window aspect to match its source crop.
  const isModern = gen >= 2;
  const isGen4 = gen >= 4;
  const art =
    gen >= 4 ? GEN4_ART_WINDOW :
    gen === 2 ? GEN2_ART_WINDOW :
    { left: 10.7, top: 12.3, width: 78.5, height: 40.2 };
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
        borderRadius: isModern ? '1.2cqw' : '0',
      }} />
      {/* Modern gens (2 + 4): faint gold-shadow ring around the art window so
          the rounded crop reads as a deliberately framed card-window rather
          than a floating image. */}
      {isModern && (
        <div style={{
          position: 'absolute',
          left: `${art.left - 0.6}%`, top: `${art.top - 0.4}%`,
          width: `${art.width + 1.2}%`, height: `${art.height + 0.8}%`,
          borderRadius: '1.4cqw',
          boxShadow: '0 0 0 0.25cqw rgba(106, 74, 16, 0.35), 0 0.5cqw 1cqw rgba(0,0,0,0.25)',
          pointerEvents: 'none', zIndex: 0,
        }} />
      )}
      {/* gold subtitle bar — aligned with SUBTITLE_POS so the OT text sits on it. */}
      <div style={{
        position: 'absolute', left: '8%', right: '8%',
        top: '54.5%',
        height: '4cqw',
        background: 'linear-gradient(180deg, #f0c84a, #b08020 50%, #f0c84a 100%)',
        borderRadius: '0.4cqw', boxShadow: '0 0.2cqw 0.4cqw rgba(0,0,0,0.25)',
      }} />
      {/* Gen 1 only: 1st-Edition-style black stamp at the left of the subtitle bar.
          Later gens never had this — omit to avoid the "black hole" Dan flagged. */}
      {!isModern && (
        <div style={{
          position: 'absolute', left: '4.5%', top: '53.5%', width: '6cqw', height: '6cqw',
          background: '#1a1a1a', borderRadius: '50%',
          border: '0.3cqw solid #b08020',
        }} />
      )}
      {/* bottom stat-box outline — sized + positioned to hug the IV/EV rows.
          Gen 4 shows IV + EV (two rows), Gen 1/2 shows one DV row higher up. */}
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

/**
 * HGSS-era real-PNG card (Basic Fire first; more templates as they land).
 *
 * Layer order matters: art sits UNDER the template so the baked-in BASIC badge
 * and silver frame sit cleanly on top of the illustration. The pre-cropped
 * gen4 art still includes a stage tab — we clip that top strip so it doesn't
 * ghost under the template badge.
 */
function HgssTcgCard({
  record,
  templateUrl,
  energyKey,
  stage,
}: {
  record: PokemonRecord;
  templateUrl: string;
  energyKey: string;
  stage: string;
}) {
  const gen = record.generation ?? 4;
  const energy = (type: string) => tcgEnergyUrlForGen(type, gen);
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
  const game = record.game ?? 'HeartGold';
  const dexMax = GEN_MAX_DEX[gen] ?? 493;
  const dex3 = String(record.species).padStart(3, '0');
  // Stacked lines so footer doesn't collide with the set logo.
  const locationLines: string[] =
    record.location === 'party' ? ['In Party']
    : record.location === 'daycare' ? ['Day Care']
    : [`Box ${record.containerIndex + 1}`, `Slot ${record.slotIndex + 1}`];
  const natureName = NATURES[record.nature] ?? null;
  const formName = gen === 4 ? gen4FormName(record.species, record.form ?? 0) : null;
  const heldItemName = record.heldItem > 0 ? getItemName(record.heldItem) : null;

  const ivCells: [string, number][] = [
    ['HP', record.ivs.hp], ['ATK', record.ivs.atk], ['DEF', record.ivs.def],
    ['SPA', record.ivs.spa], ['SPD', record.ivs.spd], ['SPE', record.ivs.spe],
  ];
  const evCells: [string, number][] = [
    ['HP', record.evs.hp], ['ATK', record.evs.atk], ['DEF', record.evs.def],
    ['SPA', record.evs.spa], ['SPD', record.evs.spd], ['SPE', record.evs.spe],
  ];

  const win = HGSS_ART_WINDOW[energyKey] ?? HGSS_ART_DEFAULT;
  const lay = HGSS_LAYOUT[energyKey] ?? HGSS_LAYOUT.fire;
  // Gated on the TCG stage, not just on having a pre-evolution: the baby rule
  // keeps Pikachu Basic, and a Basic card never says "Evolves from".
  const preEvo = stage === 'Basic' ? null : preEvolutionOf(record.species, gen);

  // Meta sits immediately after the name (same header band), not pushed right.
  const metaBits = [
    `Lv${record.level}`,
    formName,
    natureName,
  ].filter(Boolean).join(' · ');

  return (
    <div style={H.card}>
      {/* Art under template — cover fill; crops matched to hole aspect. */}
      <div
        style={{
          position: 'absolute',
          left: `${win.left}%`,
          top: `${win.top}%`,
          width: `${win.width}%`,
          height: `${win.height}%`,
          overflow: 'hidden',
          zIndex: 0,
          background: '#f4f0e8',
        }}
      >
        <img
          src={art}
          alt={speciesName}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center',
            // Anchored at the bottom edge, so the zoom only eats the source
            // card's stage tab off the top (see HGSS_ART_TAB_STRIP).
            transform: `scale(${HGSS_ART_ZOOM})`,
            transformOrigin: '50% 100%',
          }}
          onError={(e) => { e.currentTarget.src = defaultSpriteUrl(record.species); }}
        />
      </div>

      <img src={templateUrl} alt="" style={{ ...S.template, zIndex: 1 }} aria-hidden />

      {/* Evolution badge — see EVO_BADGE. Sits over the art's top-left corner,
          under the stage tab, exactly where the D&P-era illustrations already
          carry one, so it lands on top of that leftover rather than beside it. */}
      {preEvo !== null && (
        <div style={H.evoRow}>
          <img
            src={spriteUrl(preEvo, record.game)}
            alt={SPECIES[preEvo] ?? `#${preEvo}`}
            style={H.evoSprite}
            onError={(e) => { e.currentTarget.src = defaultSpriteUrl(preEvo); }}
          />
          <span style={H.evoPill}>Evolves from {SPECIES[preEvo] ?? `#${preEvo}`}</span>
        </div>
      )}

      <div style={H.nameRow}>
        <span style={H.name}>
          {title}{record.isShiny && <span style={S.shiny}> ★</span>}
        </span>
        {metaBits && <span style={H.meta}>{metaBits}</span>}
      </div>

      <div style={H.hp}>
        <span style={H.hpLbl}>HP</span>
        <span style={H.hpNum}>{hp}</span>
      </div>

      <div style={{ ...H.dataBar, top: lay.dataBarTop }}>
        OT: {record.otName || 'Unknown'}
        {' · '}Game: {game}
        {' · '}{dex3}/{dexMax}
      </div>

      <div style={{ ...H.attacks, top: lay.attacksTop }}>
        {moves.map((mv, i) => (
          <div key={i} style={H.atkRow}>
            <img src={energy(mv.type)} alt="" style={H.atkIcon} />
            <span style={H.atkName}>{mv.name}</span>
            {mv.pp != null && (
              <span style={H.atkPp}>
                {mv.pp}<span style={H.atkPpLbl}>&nbsp;PP</span>
              </span>
            )}
          </div>
        ))}
      </div>

      <div style={{ ...H.statBox, top: lay.statBoxTop }}>
        <div style={H.statGrid}>
          <span style={H.statRowLabel}>IV</span>
          {ivCells.map(([k, v]) => (
            <span key={k} style={H.statCell}>
              <span style={H.statKey}>{k}</span>
              <span style={H.statVal}>{v}</span>
            </span>
          ))}
        </div>
        <div style={H.statGrid}>
          <span style={H.statRowLabel}>EV</span>
          {evCells.map(([k, v]) => (
            <span key={k} style={H.statCell}>
              <span style={H.statKey}>{k}</span>
              <span style={H.statVal}>{v}</span>
            </span>
          ))}
        </div>
      </div>

      <div style={{ ...H.heldPill, top: lay.heldPillTop }}>
        {heldItemName ? `Held: ${heldItemName}` : 'Held: —'}
      </div>

      <div style={{ ...H.footerRow, top: lay.footerTop }}>
        <div style={H.weakness}>
          <span style={H.infoLbl}>weakness</span>
          {weakness
            ? <img src={energy(weakness)} alt={weakness} style={H.infoIcon} />
            : <span style={H.infoDash}>—</span>}
        </div>
        <div style={H.location}>
          <span style={H.infoLbl}>location</span>
          {locationLines.map((line) => (
            <span key={line} style={H.locationLine}>{line}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TcgCard({ record }: { record: PokemonRecord }) {
  const gen = record.generation ?? 1;
  const energy = (type: string) => tcgEnergyUrlForGen(type, gen);
  const energyKey = getTcgEnergy(record.species, gen);
  // HGSS frames follow TCG stage (Pikachu = Basic), not game evo index.
  const stage = tcgStageLabel(record.species, gen);
  const hgssTpl = resolveHgssTemplate(record.game, energyKey, stage);
  if (hgssTpl) {
    return (
      <HgssTcgCard record={record} templateUrl={hgssTpl} energyKey={energyKey} stage={stage} />
    );
  }

  // Gen 4 stores the real ability id; Gen 3 stores only the slot index (needs a
  // species->abilities table to resolve). Gate to gen 4+ until that table lands.
  const showAbility = gen >= 4 && record.ability != null && record.ability > 0;
  const showHeldItem = gen >= 2 && record.heldItem > 0;
  const showEVs = gen >= 3;
  const showNature = gen >= 3;

  const dir = TEMPLATE_DIR[record.game ?? ''] ?? null;
  const usePng = dir !== null;

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
    : record.location === 'daycare'
      ? 'Day Care'
      : `Box ${record.containerIndex + 1}, Slot ${record.slotIndex + 1}`;
  const natureName = showNature ? (NATURES[record.nature] ?? null) : null;
  const formName = gen === 4 ? gen4FormName(record.species, record.form ?? 0) : null;
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
    : gen >= 4 ? GEN4_ART_WINDOW
    : gen === 2 ? GEN2_ART_WINDOW
    : DEFAULT_WINDOW;

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
        // Modern gens (2 + 4) use `contain` so the wider crops never lose
        // ears/tails to overflow; Gen 1 stays on `cover` so its painted scene
        // fills its tighter frame. Matching borderRadius on the wrapper
        // completes the cropped image's rounded corner.
        style={{
          ...S.art,
          left: `${win.left}%`, top: `${win.top}%`,
          width: `${win.width}%`, height: `${win.height}%`,
          objectFit: gen >= 2 ? 'contain' : 'cover',
          borderRadius: gen >= 2 ? '1cqw' : '1px',
          background: gen >= 2 ? '#ffffff' : undefined,
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
        {formName && <span style={S.natureInline}> {'·'} {formName}</span>}
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

/** Layout tokens for HGSS real-PNG templates — one shared layout for all basic-* energies. */
const H = {
  // Full template silhouette (yellow rounded corners are in the PNG — don't CSS-clip).
  card: {
    position: 'relative' as const, width: '100%', maxWidth: '330px',
    aspectRatio: '1062 / 1480', margin: '0 auto',
    containerType: 'inline-size' as const, fontFamily: FONT, userSelect: 'none' as const,
    background: 'transparent',
  },

  // Name + Lv/nature — match real HGSS header: sits mid in the red banner
  // (original Cyndaquil has more air above the name than we had at 2.0%).
  nameRow: {
    position: 'absolute' as const, top: '3.55%', left: '9%', right: '26%', height: '5.2%',
    zIndex: 2, display: 'flex', alignItems: 'center' as const, gap: '1.6cqw',
    minWidth: 0, overflow: 'hidden' as const,
  },
  name: {
    fontSize: '5.5cqw', fontWeight: 700 as const, color: INK, lineHeight: 1.05,
    whiteSpace: 'nowrap' as const, flexShrink: 0,
  },
  meta: {
    fontSize: '2.2cqw', fontWeight: 600 as const, color: '#2a2218',
    whiteSpace: 'nowrap' as const, overflow: 'hidden' as const, textOverflow: 'ellipsis' as const,
    minWidth: 0,
  },
  // Real HGSS: number vertically centers with the fire energy; "HP" rides its baseline.
  // Band spans the silver wedge mid-height (energy ~4–7% top) — not up in the red,
  // not slammed to the rail floor. right:15.8% → ~2% air before energy.
  hp: {
    position: 'absolute' as const, top: '3.4%', right: '15.8%', height: '5.6%',
    zIndex: 2, display: 'flex', alignItems: 'center' as const, justifyContent: 'flex-end' as const,
    gap: 0,
  },
  hpLbl: {
    fontSize: '2.15cqw', fontWeight: 700 as const, color: INK,
    letterSpacing: '-0.06em', lineHeight: 1,
    // Optical: small "HP" sits on the number baseline inside the centered band.
    position: 'relative' as const, top: '0.55cqw',
  },
  hpNum: {
    fontSize: '4.9cqw', fontWeight: 700 as const, color: INK, lineHeight: 1,
    // Original cards pack multi-digit HP tight (HP100 / HP130).
    letterSpacing: '-0.07em',
  },

  /**
   * Evolution badge: pre-evo sprite in a disc + "Evolves from X" on a silver
   * pill, over the art's top-left corner just below the stage tab.
   *
   * The Gen 4 illustrations come from ~21 sets across three blocks, and the
   * D&P-era ones (Great Encounters etc.) print their pre-evolution circle
   * *overhanging the artwork* — so the crop carries the bottom of that circle
   * into our card. HGSS-era cards instead put it in the header beside the name.
   * Putting ours where D&P puts its own covers that leftover instead of sitting
   * next to it, and reads as native on HGSS-sourced art too.
   *
   * Geometry: the leftover occupies roughly x 7-18%, y 10.4-17% of the card;
   * the stage tab already hides everything above 12.2%.
   */
  evoRow: {
    position: 'absolute' as const, left: '7.4%', top: '12.2%',
    zIndex: 2, display: 'flex', alignItems: 'center' as const, gap: '0.8cqw',
  },
  evoSprite: {
    width: '11cqw', height: '11cqw', objectFit: 'contain' as const,
    borderRadius: '50%', flexShrink: 0,
    background: 'radial-gradient(circle at 38% 32%, #ffffff 0%, #efece1 62%, #cfc7b2 100%)',
    boxShadow: '0 0 0 0.35cqw #cdc6b4, 0 0 0 0.62cqw rgba(90,70,25,0.42), 0 0.3cqw 0.7cqw rgba(0,0,0,0.35)',
  },
  evoPill: {
    marginLeft: '0.7cqw',
    padding: '0.5cqw 1.6cqw',
    borderRadius: '2cqw',
    background: 'linear-gradient(180deg, #fbfaf6 0%, #e6e1d3 52%, #cfc8b5 100%)',
    boxShadow: '0 0 0 0.18cqw rgba(90,70,25,0.38), 0 0.25cqw 0.6cqw rgba(0,0,0,0.3)',
    fontSize: '2.15cqw', fontWeight: 700 as const, fontStyle: 'italic' as const,
    color: '#2a2218', whiteSpace: 'nowrap' as const, letterSpacing: '0.01em',
  },

  // Centered ON the silver art-frame lip.
  dataBar: {
    position: 'absolute' as const, top: '53.15%', left: '9%', right: '9%',
    zIndex: 2, textAlign: 'center' as const,
    fontSize: '2.05cqw', fontWeight: 700 as const, color: '#1e1a14',
    whiteSpace: 'nowrap' as const, overflow: 'hidden' as const, textOverflow: 'ellipsis' as const,
    letterSpacing: '0.01em', lineHeight: 1.1,
  },

  attacks: {
    position: 'absolute' as const, top: '56.8%', left: '10%', right: '10%',
    zIndex: 2, display: 'flex', flexDirection: 'column' as const, gap: '2.3cqw',
  },
  atkRow: { display: 'flex', alignItems: 'center' as const, gap: '2.2cqw' },
  atkIcon: { width: '5.4cqw', height: '5.4cqw', objectFit: 'contain' as const, flexShrink: 0 },
  atkName: {
    flex: 1, fontSize: '4.1cqw', fontWeight: 700 as const, color: INK,
    textShadow: '0 1px 0 rgba(255,255,255,0.28)',
  },
  atkPp: { fontSize: '3.5cqw', fontWeight: 700 as const, color: '#2a2a2a', flexShrink: 0 },
  atkPpLbl: { fontSize: '2.3cqw', color: '#4a3a28' },

  // Under the bottom silver rule. Grid keeps IV/EV stat columns locked vertically.
  statBox: {
    position: 'absolute' as const, top: '85.4%', left: '8.5%', right: '40%',
    zIndex: 2, display: 'flex', flexDirection: 'column' as const, gap: '1.5cqw',
  },
  // label | HP | ATK | DEF | SPA | SPD | SPE — equal columns so 0-digit EVs don't scrunch.
  statGrid: {
    display: 'grid' as const,
    gridTemplateColumns: '3.2cqw repeat(6, minmax(0, 1fr))',
    columnGap: '0.9cqw',
    alignItems: 'baseline' as const,
  },
  statRowLabel: {
    fontSize: '1.85cqw', fontWeight: 700 as const, color: '#4a3418', letterSpacing: '0.3px',
  },
  statCell: {
    display: 'flex', alignItems: 'baseline' as const, gap: '0.35cqw',
    minWidth: 0, justifyContent: 'flex-start' as const,
  },
  statKey: { fontSize: '1.5cqw', color: '#5a4020', textTransform: 'uppercase' as const },
  statVal: {
    fontSize: '2.3cqw', fontWeight: 700 as const, color: INK,
    // Tabular nums so 7 / 13 / 0 / 252 all take the same digit width.
    fontVariantNumeric: 'tabular-nums' as const,
  },

  // Illus. silver pill — nudge up so text sits optically mid in the capsule.
  heldPill: {
    position: 'absolute' as const, top: '87.15%', left: '57%', right: '8%',
    zIndex: 2, height: '2.9%',
    display: 'flex', alignItems: 'center' as const, justifyContent: 'center' as const,
    fontSize: '1.65cqw', fontWeight: 700 as const, color: '#2a2218',
    whiteSpace: 'nowrap' as const, overflow: 'hidden' as const, textOverflow: 'ellipsis' as const,
    textAlign: 'center' as const, letterSpacing: '0.01em',
  },

  // Weakness + location share the same top edge (labels line up).
  footerRow: {
    position: 'absolute' as const, top: '90.4%', left: '8.5%', right: '12.5%',
    zIndex: 2, display: 'flex', alignItems: 'flex-start' as const,
    justifyContent: 'flex-end' as const, gap: '5cqw',
  },
  weakness: {
    display: 'flex', flexDirection: 'column' as const,
    alignItems: 'center' as const, gap: '0.25cqw',
  },
  infoLbl: {
    fontSize: '1.5cqw', textTransform: 'uppercase' as const, letterSpacing: '0.4px',
    color: '#5a4020',
  },
  infoIcon: { width: '3.1cqw', height: '3.1cqw', objectFit: 'contain' as const },
  infoDash: { fontSize: '2.3cqw', color: '#5a4020', lineHeight: 1 },
  location: {
    display: 'flex', flexDirection: 'column' as const,
    // Center Box / Slot under the LOCATION label (was right-edge stacked).
    alignItems: 'center' as const, gap: '0.15cqw',
    textAlign: 'center' as const, maxWidth: '36%',
  },
  locationLine: {
    fontSize: '1.85cqw', fontWeight: 700 as const, color: '#2a2218',
    letterSpacing: '0.01em', lineHeight: 1.15,
    whiteSpace: 'nowrap' as const,
  },
} as const;
