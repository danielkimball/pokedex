/**
 * Shared story-order catch guide for every Gen 1–4 game.
 *
 * Modes:
 *   Progressive — only reachable areas + currently catchable mons
 *   All spots   — full path, every mon at each stop (dupes allowed)
 */

import { useMemo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SPECIES } from '../../core/constants/species';
import { defaultSpriteUrl } from '../../core/constants/games';
import {
  getGuide,
  areaUnlocked,
  encounterAvailable,
  speciesAvailableNow,
  hasBadgeBit,
  type GameGuide,
  type ProgressionArea,
  type ProgressionEncounter,
  type PlayerProgress,
  type SpotMode,
} from '../../core/constants/progression-registry';
import type { SaveRecord } from '../../db/schema';
import { readGen1Badges, readGen1KeyTools } from '../../core/parser/gen1-parser';
import { readGen4BadgesFromSave } from '../../core/parser/trainer-reader';

const SPRITE_URL = (n: number) => defaultSpriteUrl(n);

const METHOD_LABEL: Record<string, string> = {
  wild: 'Wild', gift: 'Gift', static: 'Static', fish: 'Fish',
  fossil: 'Fossil', prize: 'Prize', trade: 'Trade', 'trade-evo': 'Trade evo',
  evolve: 'Evolve', breed: 'Breed', unavailable: 'N/A',
};

const BADGE_FALLBACK = '#8a8a8a';

export interface GameProgressionViewProps {
  guideId: string;
  caughtSet: Set<number>;
  focusedSave: SaveRecord | null;
  saves: SaveRecord[];
  searchQuery: string;
  show: 'all' | 'caught' | 'uncaught';
}

function resolveProgress(guide: GameGuide, focused: SaveRecord | null, saves: SaveRecord[]): {
  progress: PlayerProgress;
  source: SaveRecord | null;
} {
  const pick =
    (focused && guide.matchSave(focused) ? focused : null) ??
    saves.find(s => guide.matchSave(s)) ??
    null;

  if (!pick) {
    return { progress: { badges: 0, tools: guide.inferTools(0) }, source: null };
  }

  let badges = typeof pick.badges === 'number' ? pick.badges : 0;
  const bagTools: string[] = [];

  if (pick.rawData) {
    try {
      if (guide.generation === 1) {
        badges = readGen1Badges(pick.rawData);
        const k = readGen1KeyTools(pick.rawData);
        if (k.oldRod) bagTools.push('old-rod');
        if (k.goodRod) bagTools.push('good-rod');
        if (k.superRod) bagTools.push('super-rod');
        if (k.pokeFlute) bagTools.push('poke-flute');
        if (k.silphScope) bagTools.push('silph-scope');
      } else if (guide.generation === 4) {
        const v = pick.gameVersion === 'Pt' || pick.gameVersion === 'DP' ? pick.gameVersion : 'HGSS';
        badges = readGen4BadgesFromSave(pick.rawData, v);
      } else {
        // Gen 2/3 badge offsets not wired yet — unlock full path for Progressive.
        badges = 0xff;
      }
    } catch {
      if (guide.generation === 2 || guide.generation === 3) badges = 0xff;
    }
  } else if (guide.generation === 2 || guide.generation === 3) {
    badges = 0xff;
  }

  const tools = guide.inferTools(badges);
  for (const t of bagTools) tools.add(t);

  return { progress: { badges, tools }, source: pick };
}

function matchesShow(species: number, caughtSet: Set<number>, show: 'all' | 'caught' | 'uncaught') {
  if (show === 'caught') return caughtSet.has(species);
  if (show === 'uncaught') return !caughtSet.has(species);
  return true;
}

function matchesQuery(species: number, query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  const name = (SPECIES[species] || '').toLowerCase();
  const num = String(species).padStart(3, '0');
  return name.includes(q) || num.includes(q) || String(species) === q;
}

function encountersForMode(
  guide: GameGuide,
  area: ProgressionArea,
  mode: SpotMode,
  progress: PlayerProgress,
  caughtSet: Set<number>,
  show: 'all' | 'caught' | 'uncaught',
  searchQuery: string,
): ProgressionEncounter[] {
  return area.encounters.filter(e => {
    if (!matchesQuery(e.species, searchQuery)) return false;
    if (!matchesShow(e.species, caughtSet, show)) return false;
    if (mode === 'progressive') {
      if (!e.firstHere) return false;
      if (!encounterAvailable(guide, area, e, progress)) return false;
    } else {
      if (e.method === 'unavailable' && area.id !== 'event' && area.id !== 'unavailable') return false;
      if (e.method === 'trade' && area.id !== 'trade') return false;
      if ((e.method === 'evolve' || e.method === 'trade-evo') && !['evolutions', 'trade-evos'].includes(area.id)) {
        // still show evolve notes if listed on path areas
      }
    }
    return true;
  });
}

export function GameProgressionView({
  guideId,
  caughtSet,
  focusedSave,
  saves,
  searchQuery,
  show,
}: GameProgressionViewProps) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<SpotMode>('progressive');
  const guide = getGuide(guideId);

  const { progress, source } = useMemo(
    () => (guide ? resolveProgress(guide, focusedSave, saves) : { progress: { badges: 0, tools: new Set<string>() }, source: null }),
    [guide, focusedSave, saves],
  );

  const primary = guide ? guide.countPrimaryBadges(progress.badges) : 0;
  const secondary = guide?.countSecondaryBadges?.(progress.badges) ?? 0;
  const totalBadges = guide?.badges.length ?? 8;

  const availableSet = useMemo(
    () => (guide ? speciesAvailableNow(guide, progress) : new Set<number>()),
    [guide, progress],
  );
  const progressStats = useMemo(() => {
    let caught = 0;
    for (const sp of availableSet) if (caughtSet.has(sp)) caught++;
    return { available: availableSet.size, caught, missing: availableSet.size - caught };
  }, [availableSet, caughtSet]);

  const storyAreas = useMemo(
    () => (guide ? guide.areas.filter(a => !guide.metaAreaIds.has(a.id)) : []),
    [guide],
  );
  const metaAreas = useMemo(
    () => (guide ? guide.areas.filter(a => guide.metaAreaIds.has(a.id)) : []),
    [guide],
  );

  const handleRowClick = useCallback((dexNum: number) => {
    navigate(`/dex/${dexNum}`);
  }, [navigate]);

  const visibleAreas = useMemo(() => {
    if (!guide) return [];
    const list = mode === 'all' ? [...storyAreas, ...metaAreas] : storyAreas;
    return list
      .filter(area => {
        if (mode === 'progressive' && !areaUnlocked(guide, area, progress)) return false;
        const enc = encountersForMode(guide, area, mode, progress, caughtSet, show, searchQuery);
        if (mode === 'progressive') {
          return enc.length > 0 || (area.gymBadge != null && hasBadgeBit(progress.badges, area.gymBadge));
        }
        if (searchQuery.trim()) return enc.length > 0;
        return true;
      })
      .map(area => ({
        area,
        enc: encountersForMode(guide, area, mode, progress, caughtSet, show, searchQuery),
      }));
  }, [guide, mode, storyAreas, metaAreas, progress, caughtSet, show, searchQuery]);

  if (!guide) {
    return <div style={s.empty}>No story guide for this game yet.</div>;
  }

  const earnedCount = primary + secondary;

  return (
    <div style={s.wrap}>
      <div style={s.banner}>
        <div style={s.badgeStrip}>
          {guide.badges.map(b => (
            <div
              key={b.index}
              title={`${b.name} (${b.leader}${b.unlocks ? ` · ${b.unlocks}` : ''})`}
              style={{
                ...s.badgeDot,
                background: hasBadgeBit(progress.badges, b.index) ? (BADGE_COLORS[b.emblem] || BADGE_FALLBACK) : '#e8e0d0',
                borderColor: hasBadgeBit(progress.badges, b.index) ? '#111' : '#ccc',
              }}
            />
          ))}
          <span style={s.badgeMeta}>
            {source ? `${earnedCount}/${totalBadges}` : `?/${totalBadges}`}
            {mode === 'progressive' && availableSet.size > 0
              ? ` · ${progressStats.caught}/${progressStats.available}`
              : ''}
          </span>
        </div>
        <div style={s.modeRow}>
          <button
            type="button"
            style={mode === 'progressive' ? s.modeOn : s.modeOff}
            onClick={() => setMode('progressive')}
            title="Only areas you can reach and Pokémon you can catch right now"
          >
            Progressive
          </button>
          <button
            type="button"
            style={mode === 'all' ? s.modeOn : s.modeOff}
            onClick={() => setMode('all')}
            title="Full story path — every town and route in play order"
          >
            All spots
          </button>
        </div>
      </div>

      <div style={s.list}>
        {visibleAreas.map(({ area, enc }, step) => {
          const gym = area.gymBadge != null ? guide.badges[area.gymBadge] : null;
          const earnedGym = gym ? hasBadgeBit(progress.badges, gym.index) : false;
          const openCount = enc.filter(e => caughtSet.has(e.species)).length;

          return (
            <section key={area.id} style={s.section}>
              <header style={s.sectionHeader}>
                <div style={s.sectionTitleRow}>
                  {mode === 'all' && (
                    <span style={s.stepNum}>{String(step + 1).padStart(2, '0')}</span>
                  )}
                  <span style={s.sectionName}>{area.name}</span>
                  {gym && earnedGym && (
                    <span
                      style={{
                        ...s.badgeEmblem,
                        background: BADGE_COLORS[gym.emblem] || BADGE_FALLBACK,
                      }}
                      title={gym.name}
                    >
                      {gym.emblem.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  {gym && earnedGym && <span style={s.badgeLabel}>{gym.name}</span>}
                </div>
                <span style={s.sectionMeta}>
                  {enc.length > 0 ? `${openCount}/${enc.length}` : '—'}
                </span>
              </header>

              {enc.length === 0 ? (
                mode === 'all' ? (
                  <div style={s.emptyArea}>Story stop (no wild list here yet)</div>
                ) : null
              ) : (
                enc.map(e => {
                  const name = SPECIES[e.species] || '???';
                  const isCaught = caughtSet.has(e.species);
                  return (
                    <div
                      key={`${area.id}-${e.species}-${e.method}-${e.note ?? ''}`}
                      style={{
                        ...s.row,
                        background: isCaught ? 'rgba(40,120,64,0.08)' : 'transparent',
                      }}
                      onClick={() => handleRowClick(e.species)}
                    >
                      <span style={s.caughtDot}>{isCaught ? '\u25CF' : '\u25CB'}</span>
                      <span style={s.dexNum}>#{String(e.species).padStart(3, '0')}</span>
                      <img src={SPRITE_URL(e.species)} alt={name} style={s.sprite} loading="lazy" />
                      <div style={s.nameCol}>
                        <span style={s.name}>{name}</span>
                        <span style={s.methodRow}>
                          <span style={s.methodChip}>{METHOD_LABEL[e.method] || e.method}</span>
                          {mode === 'all' && (e.requires ?? []).map(r => (
                            <span key={r} style={s.reqChip}>{guide.toolLabels[r] || r}</span>
                          ))}
                          {e.note && <span style={s.note}>{e.note}</span>}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

const BADGE_COLORS: Record<string, string> = {
  boulder: '#8B7355', cascade: '#4A90D9', thunder: '#E8C547', rainbow: '#7EC850',
  soul: '#C060C0', marsh: '#A050D0', volcano: '#E05030', earth: '#606060',
  zephyr: '#87CEEB', hive: '#C8A84B', plain: '#E8A0BF', fog: '#7B68A6',
  storm: '#D08050', mineral: '#A0A0B0', glacier: '#70C0E0', rising: '#5060C0',
  coal: '#6B5B4F', forest: '#5A9E4B', cobble: '#9B6B9B', fen: '#C07090',
  relic: '#4A90C0', mine: '#8A8A9A', icicle: '#A0D8E8', beacon: '#E8C040',
  stone: '#A09080', knuckle: '#C06040', dynamo: '#E0C040', heat: '#E05030',
  balance: '#6080C0', feather: '#80C0E0', mind: '#C080E0', rain: '#4080C0',
};

const s = {
  wrap: { display: 'flex', flexDirection: 'column' as const, flex: 1, minHeight: 0 },
  empty: { padding: '12px', fontSize: '12px', color: '#5d5142' },
  banner: {
    padding: '4px 8px 5px',
    borderBottom: '1px solid #11111122',
    background: 'rgba(255,250,240,0.9)',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  badgeStrip: {
    display: 'flex', gap: '2px', flexWrap: 'wrap' as const, alignItems: 'center' as const,
  },
  badgeDot: {
    width: '9px', height: '9px', borderRadius: '50%', border: '1px solid #111', flexShrink: 0,
  },
  badgeMeta: {
    marginLeft: '6px', fontSize: '10px', color: '#5d5142', fontWeight: 'bold' as const,
  },
  modeRow: { display: 'flex', gap: '4px' },
  modeOn: {
    flex: 1, padding: '4px 8px', border: '1px solid #111', borderRadius: '6px',
    background: 'rgba(204,0,28,0.12)', color: '#111', fontSize: '11px',
    fontFamily: 'inherit', fontWeight: 'bold' as const, cursor: 'pointer',
  },
  modeOff: {
    flex: 1, padding: '4px 8px', border: '1px solid #11111133', borderRadius: '6px',
    background: '#fffaf0', color: '#5d5142', fontSize: '11px',
    fontFamily: 'inherit', cursor: 'pointer',
  },
  list: { flex: 1, overflowY: 'auto' as const, minHeight: 0 },
  section: { borderBottom: '1px solid #11111118' },
  sectionHeader: {
    display: 'flex', justifyContent: 'space-between' as const, alignItems: 'center' as const,
    padding: '6px 10px 4px', background: 'rgba(0,0,0,0.04)',
    position: 'sticky' as const, top: 0, zIndex: 1,
  },
  sectionTitleRow: { display: 'flex', alignItems: 'center' as const, gap: '6px', minWidth: 0 },
  stepNum: {
    fontSize: '10px', color: '#5d5142', fontWeight: 'bold' as const, width: '18px', flexShrink: 0,
  },
  sectionName: { fontSize: '11px', fontWeight: 'bold' as const, color: '#111' },
  badgeEmblem: {
    width: '16px', height: '16px', borderRadius: '50%', border: '1px solid #111',
    display: 'inline-flex', alignItems: 'center' as const, justifyContent: 'center' as const,
    fontSize: '8px', fontWeight: 'bold' as const, color: '#fff', flexShrink: 0,
  },
  badgeLabel: { fontSize: '9px', color: '#1a7a3a', fontWeight: 'bold' as const },
  sectionMeta: { fontSize: '10px', color: '#5d5142', flexShrink: 0 },
  emptyArea: { padding: '4px 10px 8px', fontSize: '10px', color: '#5d514288' },
  row: {
    display: 'flex', alignItems: 'center' as const, gap: '6px', padding: '4px 10px',
    borderBottom: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer', minHeight: '44px',
    boxSizing: 'border-box' as const,
  },
  caughtDot: { fontSize: '10px', color: '#111', width: '14px', textAlign: 'center' as const, flexShrink: 0 },
  dexNum: { fontSize: '11px', color: '#5d5142', width: '34px', flexShrink: 0 },
  sprite: { width: '32px', height: '32px', imageRendering: 'pixelated' as const, flexShrink: 0 },
  nameCol: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' as const, gap: '1px' },
  name: {
    fontSize: '12px', color: '#111', whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const, textOverflow: 'ellipsis' as const,
  },
  methodRow: { display: 'flex', alignItems: 'center' as const, gap: '4px', minWidth: 0, flexWrap: 'wrap' as const },
  methodChip: {
    fontSize: '9px', color: '#5d5142', background: 'rgba(0,0,0,0.06)',
    borderRadius: '6px', padding: '0 5px', flexShrink: 0,
  },
  reqChip: {
    fontSize: '9px', color: '#5d5142', background: 'rgba(0,0,0,0.04)',
    borderRadius: '6px', padding: '0 5px', flexShrink: 0,
  },
  note: {
    fontSize: '9px', color: '#5d514288', whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const, textOverflow: 'ellipsis' as const,
  },
} as const;
