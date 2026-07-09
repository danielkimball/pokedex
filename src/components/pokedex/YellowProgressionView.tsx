/**
 * Story-order catch guide for Pokémon Yellow.
 * Groups species by city / route / dungeon as you progress, gated by badges
 * and tools (rods, Surf, Poké Flute…) from the selected Yellow save.
 */

import { useMemo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SPECIES } from '../../core/constants/species';
import { defaultSpriteUrl } from '../../core/constants/games';
import {
  YELLOW_PROGRESSION,
  YELLOW_BADGES,
  hasBadge,
  countBadges,
  yellowSpeciesAvailableNow,
  mergeTools,
  encounterAvailable,
  TOOL_LABEL,
  type ProgressionArea,
  type ProgressionEncounter,
  type EncounterMethod,
  type ProgressionReq,
  type PlayerProgress,
} from '../../core/constants/progression-yellow';
import type { SaveRecord } from '../../db/schema';
import { readGen1Badges, readGen1KeyTools } from '../../core/parser/gen1-parser';

const SPRITE_URL = (n: number) => defaultSpriteUrl(n);

const METHOD_LABEL: Record<EncounterMethod, string> = {
  wild: 'Wild',
  gift: 'Gift',
  static: 'Static',
  fish: 'Fish',
  fossil: 'Fossil',
  prize: 'Prize',
  trade: 'Trade',
  'trade-evo': 'Trade evo',
  evolve: 'Evolve',
  unavailable: 'N/A',
};

const BADGE_COLORS: Record<string, string> = {
  boulder: '#8B7355',
  cascade: '#4A90D9',
  thunder: '#E8C547',
  rainbow: '#7EC850',
  soul: '#C060C0',
  marsh: '#A050D0',
  volcano: '#E05030',
  earth: '#606060',
};

export interface YellowProgressionViewProps {
  caughtSet: Set<number>;
  focusedSave: SaveRecord | null;
  saves: SaveRecord[];
  searchQuery: string;
  show: 'all' | 'caught' | 'uncaught';
}

function toolsFromBag(raw: ArrayBuffer | undefined): ProgressionReq[] {
  if (!raw) return [];
  try {
    const k = readGen1KeyTools(raw);
    const t: ProgressionReq[] = [];
    if (k.oldRod) t.push('old-rod');
    if (k.goodRod) t.push('good-rod');
    if (k.superRod) t.push('super-rod');
    if (k.pokeFlute) t.push('poke-flute');
    if (k.silphScope) t.push('silph-scope');
    return t;
  } catch {
    return [];
  }
}

function resolveProgress(focused: SaveRecord | null, saves: SaveRecord[]): {
  progress: PlayerProgress;
  source: SaveRecord | null;
  bagTools: ProgressionReq[];
} {
  const yellowSaves = saves.filter(
    s => s.game === 'Yellow' || (s.generation === 1 && /yellow/i.test(s.filename)),
  );
  const pick =
    focused && (focused.game === 'Yellow' || focused.generation === 1)
      ? focused
      : yellowSaves[0] ?? null;

  if (!pick) {
    return {
      progress: { badges: 0, tools: mergeTools(0, []) },
      source: null,
      bagTools: [],
    };
  }

  let badges = typeof pick.badges === 'number' ? pick.badges : 0;
  if (typeof pick.badges !== 'number' && pick.rawData) {
    try { badges = readGen1Badges(pick.rawData); } catch { /* keep 0 */ }
  }
  const bagTools = toolsFromBag(pick.rawData);
  return {
    progress: { badges, tools: mergeTools(badges, bagTools) },
    source: pick,
    bagTools,
  };
}

function encounterMatchesShow(
  species: number,
  caughtSet: Set<number>,
  show: 'all' | 'caught' | 'uncaught',
): boolean {
  const caught = caughtSet.has(species);
  if (show === 'caught') return caught;
  if (show === 'uncaught') return !caught;
  return true;
}

function filterEncounters(
  area: ProgressionArea,
  encounters: ProgressionEncounter[],
  query: string,
  caughtSet: Set<number>,
  show: 'all' | 'caught' | 'uncaught',
  firstOnly: boolean,
  progress: PlayerProgress,
  /** When false, hide encounters the player cannot do yet. */
  showGated: boolean,
): ProgressionEncounter[] {
  const q = query.toLowerCase().trim();
  return encounters.filter(e => {
    if (firstOnly && !e.firstHere && area.id !== 'unavailable') return false;
    if (!encounterMatchesShow(e.species, caughtSet, show)) return false;
    const open = encounterAvailable(area, e, progress) || e.method === 'unavailable';
    if (!open && !showGated && e.method !== 'unavailable') return false;
    if (!q) return true;
    const name = (SPECIES[e.species] || '').toLowerCase();
    const num = String(e.species).padStart(3, '0');
    return name.includes(q) || num.includes(q) || String(e.species) === q;
  });
}

function missingReqs(enc: ProgressionEncounter, progress: PlayerProgress): ProgressionReq[] {
  return (enc.requires ?? []).filter(r => !progress.tools.has(r));
}

export function YellowProgressionView({
  caughtSet,
  focusedSave,
  saves,
  searchQuery,
  show,
}: YellowProgressionViewProps) {
  const navigate = useNavigate();
  const [showLocked, setShowLocked] = useState(false);
  const [showMeta, setShowMeta] = useState(false);
  const [firstOnly, setFirstOnly] = useState(true);
  /** Show encounters that need tools you don't have yet (dimmed). */
  const [showGated, setShowGated] = useState(false);

  const { progress, source, bagTools } = useMemo(
    () => resolveProgress(focusedSave, saves),
    [focusedSave, saves],
  );
  const badgeCount = countBadges(progress.badges);

  const availableSet = useMemo(
    () => yellowSpeciesAvailableNow(progress, false),
    [progress],
  );

  const progressStats = useMemo(() => {
    let caughtAvail = 0;
    for (const sp of availableSet) {
      if (caughtSet.has(sp)) caughtAvail++;
    }
    return {
      available: availableSet.size,
      caughtAvailable: caughtAvail,
      missingAvailable: availableSet.size - caughtAvail,
    };
  }, [availableSet, caughtSet]);

  const storyAreas = useMemo(
    () => YELLOW_PROGRESSION.filter(
      a => a.id !== 'evolutions' && a.id !== 'trade-evos' && a.id !== 'unavailable',
    ),
    [],
  );
  const metaAreas = useMemo(
    () => YELLOW_PROGRESSION.filter(
      a => a.id === 'evolutions' || a.id === 'trade-evos' || a.id === 'unavailable',
    ),
    [],
  );

  const handleRowClick = useCallback((dexNum: number) => {
    navigate(`/dex/${dexNum}`);
  }, [navigate]);

  const ownedToolLabels = useMemo(() => {
    const labels: string[] = [];
    for (const r of ['old-rod', 'good-rod', 'super-rod', 'poke-flute', 'silph-scope', 'cut', 'surf'] as ProgressionReq[]) {
      if (progress.tools.has(r)) labels.push(TOOL_LABEL[r]);
    }
    return labels;
  }, [progress]);

  const renderArea = (area: ProgressionArea, areaLocked: boolean) => {
    const visible = filterEncounters(
      area,
      area.encounters,
      searchQuery,
      caughtSet,
      show,
      firstOnly && area.id !== 'unavailable',
      progress,
      showGated || area.id === 'unavailable',
    );
    if (visible.length === 0 && searchQuery) return null;
    if (visible.length === 0 && areaLocked) return null;

    // Progress for this area: firstHere encounters that are currently open
    const firsts = area.encounters.filter(e => e.firstHere);
    const openFirsts = firsts.filter(e => encounterAvailable(area, e, progress));
    const caughtOpen = openFirsts.filter(e => caughtSet.has(e.species)).length;
    const gym = area.gymBadge != null ? YELLOW_BADGES[area.gymBadge] : null;
    const earnedGym = gym ? hasBadge(progress.badges, gym.index) : false;

    return (
      <section key={area.id} style={{ ...s.section, opacity: areaLocked ? 0.45 : 1 }}>
        <header style={s.sectionHeader}>
          <div style={s.sectionTitleRow}>
            {areaLocked && <span style={s.lockIcon} title={`Needs ${area.minBadges} badges`}>[L]</span>}
            <span style={s.sectionName}>{area.name}</span>
            {gym && (
              <span
                style={{
                  ...s.badgeEmblem,
                  background: earnedGym ? BADGE_COLORS[gym.emblem] : '#ccc',
                  borderColor: earnedGym ? '#111' : '#999',
                  opacity: earnedGym ? 1 : 0.4,
                }}
                title={earnedGym ? `${gym.name} — earned` : `${gym.name} — not yet`}
              >
                {gym.emblem.slice(0, 1).toUpperCase()}
              </span>
            )}
            {gym && earnedGym && (
              <span style={s.badgeLabel}>{gym.name}</span>
            )}
          </div>
          <span style={s.sectionMeta}>
            {openFirsts.length > 0 ? `${caughtOpen}/${openFirsts.length}` : firsts.length === 0 ? '—' : '0 open'}
            {area.minBadges > 0 && areaLocked ? ` · ${area.minBadges}+ badges` : ''}
          </span>
        </header>

        {visible.length === 0 ? (
          <div style={s.emptyArea}>
            {firsts.length === 0
              ? 'No encounters listed'
              : openFirsts.length === 0
                ? 'Nothing catchable here yet (need a rod / HM / etc.)'
                : show === 'caught'
                  ? 'None caught here yet'
                  : 'All caught!'}
          </div>
        ) : (
          visible.map(e => {
            const name = SPECIES[e.species] || '???';
            const isCaught = caughtSet.has(e.species);
            const open = encounterAvailable(area, e, progress) || e.method === 'unavailable';
            const missing = missingReqs(e, progress);
            return (
              <div
                key={`${area.id}-${e.species}-${e.method}`}
                style={{
                  ...s.row,
                  background: isCaught ? 'rgba(40,120,64,0.08)' : 'transparent',
                  opacity: open ? 1 : 0.4,
                }}
                onClick={() => handleRowClick(e.species)}
              >
                <span style={s.caughtDot}>{isCaught ? '\u25CF' : '\u25CB'}</span>
                <span style={s.dexNum}>#{String(e.species).padStart(3, '0')}</span>
                <img
                  src={SPRITE_URL(e.species)}
                  alt={name}
                  style={s.sprite}
                  loading="lazy"
                />
                <div style={s.nameCol}>
                  <span style={s.name}>{name}</span>
                  <span style={s.methodRow}>
                    <span style={s.methodChip}>{METHOD_LABEL[e.method]}</span>
                    {missing.map(r => (
                      <span key={r} style={s.needChip}>needs {TOOL_LABEL[r]}</span>
                    ))}
                    {e.note && open && <span style={s.note}>{e.note}</span>}
                    {!open && e.note && missing.length === 0 && (
                      <span style={s.note}>{e.note}</span>
                    )}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </section>
    );
  };

  const latestBadge = useMemo(() => {
    for (let i = 7; i >= 0; i--) {
      if (hasBadge(progress.badges, i)) return YELLOW_BADGES[i];
    }
    return null;
  }, [progress.badges]);

  return (
    <div style={s.wrap}>
      <div style={s.banner}>
        <div style={s.bannerTop}>
          <strong style={s.bannerTitle}>Yellow · Catch as you go</strong>
          <span style={s.bannerCount}>
            {progressStats.caughtAvailable}/{progressStats.available} open now
          </span>
        </div>
        <div style={s.bannerSub}>
          {source ? (
            <>
              Save: <strong>{source.trainerName || '???'}</strong>
              {latestBadge
                ? <> · latest badge: <strong>{latestBadge.name}</strong></>
                : ' · no badges yet'}
              {' · '}{badgeCount}/8
              {bagTools.length > 0 && (
                <> · bag: {bagTools.map(t => TOOL_LABEL[t]).join(', ')}</>
              )}
              {ownedToolLabels.length > 0 && bagTools.length === 0 && (
                <> · tools (inferred): {ownedToolLabels.join(', ')}</>
              )}
            </>
          ) : (
            <>No Yellow save — showing start-of-game (0 badges, no rods). Import a Yellow .sav to track live progress.</>
          )}
        </div>

        <div style={s.badgeStrip}>
          {YELLOW_BADGES.map(b => {
            const earned = hasBadge(progress.badges, b.index);
            return (
              <div
                key={b.index}
                title={`${b.name} (${b.leader}${b.unlocks ? ` · ${b.unlocks}` : ''})`}
                style={{
                  ...s.badgeDot,
                  background: earned ? BADGE_COLORS[b.emblem] : '#e8e0d0',
                  borderColor: earned ? '#111' : '#bbb',
                  color: earned ? '#fff' : '#888',
                }}
              >
                {b.index + 1}
              </div>
            );
          })}
        </div>

        {progressStats.missingAvailable === 0 && progressStats.available > 0 ? (
          <div style={s.greatLine}>Great — you&apos;ve caught everything you can right now!</div>
        ) : (
          <div style={s.missingLine}>
            {progressStats.missingAvailable} still catchable before your next badge/tool unlock
          </div>
        )}

        <div style={s.toggles}>
          <button
            type="button"
            style={showLocked ? s.toggleOn : s.toggleOff}
            onClick={() => setShowLocked(v => !v)}
          >
            Future areas
          </button>
          <button
            type="button"
            style={showGated ? s.toggleOn : s.toggleOff}
            onClick={() => setShowGated(v => !v)}
          >
            Need rod/HM
          </button>
          <button
            type="button"
            style={showMeta ? s.toggleOn : s.toggleOff}
            onClick={() => setShowMeta(v => !v)}
          >
            Evos / trades
          </button>
          <button
            type="button"
            style={firstOnly ? s.toggleOn : s.toggleOff}
            onClick={() => setFirstOnly(v => !v)}
          >
            Best first spot only
          </button>
        </div>
      </div>

      <div style={s.list}>
        {storyAreas.map(area => {
          const locked = area.minBadges > badgeCount;
          if (locked && !showLocked) return null;
          return renderArea(area, locked);
        })}
        {showMeta && metaAreas.map(area => renderArea(area, false))}
      </div>
    </div>
  );
}

const s = {
  wrap: {
    display: 'flex',
    flexDirection: 'column' as const,
    flex: 1,
    minHeight: 0,
  },
  banner: {
    padding: '8px 10px',
    borderBottom: '1px solid #11111122',
    background: 'rgba(255,250,240,0.9)',
    flexShrink: 0,
  },
  bannerTop: {
    display: 'flex',
    justifyContent: 'space-between' as const,
    alignItems: 'baseline' as const,
    gap: '8px',
  },
  bannerTitle: {
    fontSize: '12px',
    color: '#111',
  },
  bannerCount: {
    fontSize: '12px',
    fontWeight: 'bold' as const,
    color: '#111',
  },
  bannerSub: {
    fontSize: '10px',
    color: '#5d5142',
    marginTop: '2px',
    lineHeight: 1.35,
  },
  badgeStrip: {
    display: 'flex',
    gap: '4px',
    marginTop: '8px',
  },
  badgeDot: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    border: '1.5px solid #111',
    display: 'flex',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    fontSize: '9px',
    fontWeight: 'bold' as const,
    fontFamily: 'inherit',
  },
  greatLine: {
    marginTop: '6px',
    fontSize: '11px',
    fontWeight: 'bold' as const,
    color: '#1a7a3a',
  },
  missingLine: {
    marginTop: '6px',
    fontSize: '10px',
    color: '#5d5142',
  },
  toggles: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '4px',
    marginTop: '8px',
  },
  toggleOn: {
    padding: '2px 8px',
    border: '1px solid #111',
    borderRadius: '10px',
    background: 'rgba(204,0,28,0.10)',
    color: '#111',
    fontSize: '10px',
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  toggleOff: {
    padding: '2px 8px',
    border: '1px solid #11111133',
    borderRadius: '10px',
    background: 'transparent',
    color: '#5d5142',
    fontSize: '10px',
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  list: {
    flex: 1,
    overflowY: 'auto' as const,
    minHeight: 0,
  },
  section: {
    borderBottom: '1px solid #11111118',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: '6px 10px 4px',
    background: 'rgba(0,0,0,0.04)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 1,
  },
  sectionTitleRow: {
    display: 'flex',
    alignItems: 'center' as const,
    gap: '6px',
    minWidth: 0,
  },
  lockIcon: {
    fontSize: '10px',
    color: '#5d5142',
  },
  sectionName: {
    fontSize: '11px',
    fontWeight: 'bold' as const,
    color: '#111',
  },
  badgeEmblem: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: '1px solid #111',
    display: 'inline-flex',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    fontSize: '8px',
    fontWeight: 'bold' as const,
    color: '#fff',
    flexShrink: 0,
  },
  badgeLabel: {
    fontSize: '9px',
    color: '#1a7a3a',
    fontWeight: 'bold' as const,
  },
  sectionMeta: {
    fontSize: '10px',
    color: '#5d5142',
    flexShrink: 0,
  },
  emptyArea: {
    padding: '4px 10px 8px',
    fontSize: '10px',
    color: '#5d514288',
  },
  row: {
    display: 'flex',
    alignItems: 'center' as const,
    gap: '6px',
    padding: '4px 10px',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
    cursor: 'pointer',
    minHeight: '44px',
    boxSizing: 'border-box' as const,
  },
  caughtDot: {
    fontSize: '10px',
    color: '#111111',
    width: '14px',
    textAlign: 'center' as const,
    flexShrink: 0,
  },
  dexNum: {
    fontSize: '11px',
    color: '#5d5142',
    width: '34px',
    flexShrink: 0,
  },
  sprite: {
    width: '32px',
    height: '32px',
    imageRendering: 'pixelated' as const,
    flexShrink: 0,
  },
  nameCol: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1px',
  },
  name: {
    fontSize: '12px',
    color: '#111111',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
  },
  methodRow: {
    display: 'flex',
    alignItems: 'center' as const,
    gap: '4px',
    minWidth: 0,
    flexWrap: 'wrap' as const,
  },
  methodChip: {
    fontSize: '9px',
    color: '#5d5142',
    background: 'rgba(0,0,0,0.06)',
    borderRadius: '6px',
    padding: '0 5px',
    flexShrink: 0,
  },
  needChip: {
    fontSize: '9px',
    color: '#8a4020',
    background: 'rgba(200,80,20,0.12)',
    borderRadius: '6px',
    padding: '0 5px',
    flexShrink: 0,
  },
  note: {
    fontSize: '9px',
    color: '#5d514288',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
  },
} as const;
