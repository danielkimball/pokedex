/**
 * HeartGold story-order catch guide.
 *
 * Two modes only:
 *   Progressive — only areas you can reach + mons you can catch right now
 *   All spots   — full optimal path, every town/route in play order
 */

import { useMemo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SPECIES } from '../../core/constants/species';
import { defaultSpriteUrl } from '../../core/constants/games';
import {
  HG_PROGRESSION,
  HG_BADGES,
  HG_META_AREA_IDS,
  hasBadge,
  countJohtoBadges,
  countKantoBadges,
  countBadges,
  hgSpeciesAvailableNow,
  mergeTools,
  encounterAvailable,
  areaUnlocked,
  TOOL_LABEL,
  type ProgressionArea,
  type ProgressionEncounter,
  type EncounterMethod,
  type PlayerProgress,
} from '../../core/constants/progression-heartgold';
import type { SaveRecord } from '../../db/schema';

const SPRITE_URL = (n: number) => defaultSpriteUrl(n);

type SpotMode = 'progressive' | 'all';

const METHOD_LABEL: Record<EncounterMethod, string> = {
  wild: 'Wild',
  gift: 'Gift',
  static: 'Static',
  fish: 'Fish',
  breed: 'Breed',
  evolve: 'Evolve',
  trade: 'Trade',
  unavailable: 'N/A',
};

const BADGE_COLORS: Record<string, string> = {
  zephyr: '#87CEEB', hive: '#C8A84B', plain: '#E8A0BF', fog: '#7B68A6',
  storm: '#D08050', mineral: '#A0A0B0', glacier: '#70C0E0', rising: '#5060C0',
  boulder: '#8B7355', cascade: '#4A90D9', thunder: '#E8C547', rainbow: '#7EC850',
  soul: '#C060C0', marsh: '#A050D0', volcano: '#E05030', earth: '#606060',
};

export interface HeartGoldProgressionViewProps {
  caughtSet: Set<number>;
  focusedSave: SaveRecord | null;
  saves: SaveRecord[];
  searchQuery: string;
  show: 'all' | 'caught' | 'uncaught';
}

function resolveProgress(focused: SaveRecord | null, saves: SaveRecord[]): {
  progress: PlayerProgress;
  source: SaveRecord | null;
} {
  const hgSaves = saves.filter(
    s => s.game === 'HeartGold' || (s.generation === 4 && /heart\s*gold|heartgold/i.test(s.filename)),
  );
  const pick =
    focused && focused.game === 'HeartGold'
      ? focused
      : focused && (focused.game === 'SoulSilver' || focused.generation === 4)
        ? focused
        : hgSaves[0] ?? null;

  if (!pick) {
    return { progress: { badges: 0, tools: mergeTools(0, []) }, source: null };
  }
  const badges = typeof pick.badges === 'number' ? pick.badges : 0;
  return { progress: { badges, tools: mergeTools(badges, []) }, source: pick };
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

/** Progressive: firstHere + currently obtainable. All spots: every encounter at the location. */
function encountersForMode(
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
      if (!encounterAvailable(area, e, progress)) return false;
    } else {
      // All spots: hide pure trade/event meta noise except their own sections
      if (e.method === 'unavailable') return area.id === 'event';
    }
    return true;
  });
}

export function HeartGoldProgressionView({
  caughtSet,
  focusedSave,
  saves,
  searchQuery,
  show,
}: HeartGoldProgressionViewProps) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<SpotMode>('progressive');

  const { progress, source } = useMemo(
    () => resolveProgress(focusedSave, saves),
    [focusedSave, saves],
  );
  const johto = countJohtoBadges(progress.badges);
  const kanto = countKantoBadges(progress.badges);
  const total = countBadges(progress.badges);

  const availableSet = useMemo(() => hgSpeciesAvailableNow(progress), [progress]);
  const progressStats = useMemo(() => {
    let caughtAvail = 0;
    for (const sp of availableSet) if (caughtSet.has(sp)) caughtAvail++;
    return { available: availableSet.size, caught: caughtAvail, missing: availableSet.size - caughtAvail };
  }, [availableSet, caughtSet]);

  const storyAreas = useMemo(
    () => HG_PROGRESSION.filter(a => !HG_META_AREA_IDS.has(a.id)),
    [],
  );
  const metaAreas = useMemo(
    () => HG_PROGRESSION.filter(a => HG_META_AREA_IDS.has(a.id)),
    [],
  );

  const handleRowClick = useCallback((dexNum: number) => {
    navigate(`/dex/${dexNum}`);
  }, [navigate]);

  const latestBadge = useMemo(() => {
    for (let i = 15; i >= 0; i--) {
      if (hasBadge(progress.badges, i)) return HG_BADGES[i];
    }
    return null;
  }, [progress.badges]);

  const visibleAreas = useMemo(() => {
    const list = mode === 'all' ? [...storyAreas, ...metaAreas] : storyAreas;
    return list.filter(area => {
      if (mode === 'progressive' && !areaUnlocked(area, progress)) return false;
      const enc = encountersForMode(area, mode, progress, caughtSet, show, searchQuery);
      // Progressive: only areas with something to catch (or gym you just unlocked)
      if (mode === 'progressive') {
        return enc.length > 0 || (area.gymBadge != null && hasBadge(progress.badges, area.gymBadge));
      }
      // All spots: always show every town/route on the path
      if (searchQuery.trim()) return enc.length > 0;
      return true;
    }).map(area => ({
      area,
      enc: encountersForMode(area, mode, progress, caughtSet, show, searchQuery),
    }));
  }, [mode, storyAreas, metaAreas, progress, caughtSet, show, searchQuery]);

  return (
    <div style={s.wrap}>
      <div style={s.banner}>
        <div style={s.bannerTop}>
          <strong style={s.bannerTitle}>HeartGold · Story path</strong>
          <span style={s.bannerCount}>
            {mode === 'progressive'
              ? `${progressStats.caught}/${progressStats.available} open`
              : `${storyAreas.length} stops`}
          </span>
        </div>

        <div style={s.bannerSub}>
          {source ? (
            <>
              <strong>{source.trainerName || '???'}</strong>
              {latestBadge ? <> · {latestBadge.name}</> : ' · no badges yet'}
              {' · '}{johto}/8 Johto · {kanto}/8 Kanto
            </>
          ) : (
            <>Import a HeartGold save (or select it under All games) to track badges.</>
          )}
        </div>

        <div style={s.badgeStrip}>
          {HG_BADGES.filter(b => b.region === 'johto').map(b => (
            <div
              key={b.index}
              title={`${b.name} (${b.leader})`}
              style={{
                ...s.badgeDot,
                background: hasBadge(progress.badges, b.index) ? (BADGE_COLORS[b.emblem] || '#888') : '#e8e0d0',
                borderColor: hasBadge(progress.badges, b.index) ? '#111' : '#bbb',
                color: hasBadge(progress.badges, b.index) ? '#fff' : '#888',
              }}
            >
              {b.index + 1}
            </div>
          ))}
          <span style={s.regionSep}>K</span>
          {HG_BADGES.filter(b => b.region === 'kanto').map(b => (
            <div
              key={b.index}
              title={`${b.name} (${b.leader})`}
              style={{
                ...s.badgeDot,
                background: hasBadge(progress.badges, b.index) ? (BADGE_COLORS[b.emblem] || '#888') : '#e8e0d0',
                borderColor: hasBadge(progress.badges, b.index) ? '#111' : '#bbb',
                color: hasBadge(progress.badges, b.index) ? '#fff' : '#888',
              }}
            >
              {b.index - 7}
            </div>
          ))}
        </div>

        {mode === 'progressive' && (
          <div style={progressStats.missing === 0 && progressStats.available > 0 ? s.greatLine : s.missingLine}>
            {progressStats.missing === 0 && progressStats.available > 0
              ? "You're caught up — everything open right now is checked off."
              : `${progressStats.missing} still open before your next badge or HM.`}
          </div>
        )}

        {/* Only two filters */}
        <div style={s.modeRow}>
          <button
            type="button"
            style={mode === 'progressive' ? s.modeOn : s.modeOff}
            onClick={() => setMode('progressive')}
          >
            Progressive
          </button>
          <button
            type="button"
            style={mode === 'all' ? s.modeOn : s.modeOff}
            onClick={() => setMode('all')}
          >
            All spots
          </button>
        </div>
        <div style={s.modeHint}>
          {mode === 'progressive'
            ? 'Only places you can reach and mons you can catch now.'
            : 'Full optimal path — every town and route in play order.'}
        </div>
      </div>

      <div style={s.list}>
        {visibleAreas.map(({ area, enc }, step) => {
          const gym = area.gymBadge != null ? HG_BADGES[area.gymBadge] : null;
          const earnedGym = gym ? hasBadge(progress.badges, gym.index) : false;
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
                        background: BADGE_COLORS[gym.emblem] || '#888',
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
                <div style={s.emptyArea}>
                  {mode === 'all'
                    ? 'Story stop (gym / story beats — no new first-catches here)'
                    : null}
                </div>
              ) : (
                enc.map(e => {
                  const name = SPECIES[e.species] || '???';
                  const isCaught = caughtSet.has(e.species);
                  return (
                    <div
                      key={`${area.id}-${e.species}-${e.method}`}
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
                          <span style={s.methodChip}>{METHOD_LABEL[e.method]}</span>
                          {mode === 'all' && (e.requires ?? []).map(r => (
                            <span key={r} style={s.reqChip}>{TOOL_LABEL[r]}</span>
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

const s = {
  wrap: { display: 'flex', flexDirection: 'column' as const, flex: 1, minHeight: 0 },
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
  bannerTitle: { fontSize: '12px', color: '#111' },
  bannerCount: { fontSize: '12px', fontWeight: 'bold' as const, color: '#111' },
  bannerSub: { fontSize: '10px', color: '#5d5142', marginTop: '2px', lineHeight: 1.35 },
  badgeStrip: {
    display: 'flex', gap: '3px', marginTop: '8px', flexWrap: 'wrap' as const,
    alignItems: 'center' as const,
  },
  regionSep: { fontSize: '10px', color: '#5d514288', margin: '0 3px', fontWeight: 'bold' as const },
  badgeDot: {
    width: '20px', height: '20px', borderRadius: '50%', border: '1.5px solid #111',
    display: 'flex', alignItems: 'center' as const, justifyContent: 'center' as const,
    fontSize: '8px', fontWeight: 'bold' as const, fontFamily: 'inherit',
  },
  greatLine: { marginTop: '6px', fontSize: '11px', fontWeight: 'bold' as const, color: '#1a7a3a' },
  missingLine: { marginTop: '6px', fontSize: '10px', color: '#5d5142' },
  modeRow: { display: 'flex', gap: '6px', marginTop: '8px' },
  modeOn: {
    flex: 1, padding: '6px 10px', border: '1px solid #111', borderRadius: '8px',
    background: 'rgba(204,0,28,0.12)', color: '#111', fontSize: '12px',
    fontFamily: 'inherit', fontWeight: 'bold' as const, cursor: 'pointer',
  },
  modeOff: {
    flex: 1, padding: '6px 10px', border: '1px solid #11111133', borderRadius: '8px',
    background: '#fffaf0', color: '#5d5142', fontSize: '12px',
    fontFamily: 'inherit', cursor: 'pointer',
  },
  modeHint: { fontSize: '10px', color: '#5d514288', marginTop: '4px' },
  list: { flex: 1, overflowY: 'auto' as const, minHeight: 0 },
  section: { borderBottom: '1px solid #11111118' },
  sectionHeader: {
    display: 'flex', justifyContent: 'space-between' as const, alignItems: 'center' as const,
    padding: '6px 10px 4px', background: 'rgba(0,0,0,0.04)',
    position: 'sticky' as const, top: 0, zIndex: 1,
  },
  sectionTitleRow: { display: 'flex', alignItems: 'center' as const, gap: '6px', minWidth: 0 },
  stepNum: {
    fontSize: '10px', color: '#5d5142', fontWeight: 'bold' as const,
    width: '18px', flexShrink: 0,
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
