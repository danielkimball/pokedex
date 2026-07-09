/**
 * Story-order catch guide for Pokémon HeartGold.
 * Groups species by city/route/dungeon, gated by Johto+Kanto badges and HMs/rods.
 */

import { useMemo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SPECIES } from '../../core/constants/species';
import { defaultSpriteUrl } from '../../core/constants/games';
import {
  HG_PROGRESSION,
  HG_BADGES,
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
  type ProgressionReq,
  type PlayerProgress,
} from '../../core/constants/progression-heartgold';
import type { SaveRecord } from '../../db/schema';

const SPRITE_URL = (n: number) => defaultSpriteUrl(n);

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
  zephyr: '#87CEEB',
  hive: '#C8A84B',
  plain: '#E8A0BF',
  fog: '#7B68A6',
  storm: '#D08050',
  mineral: '#A0A0B0',
  glacier: '#70C0E0',
  rising: '#5060C0',
  boulder: '#8B7355',
  cascade: '#4A90D9',
  thunder: '#E8C547',
  rainbow: '#7EC850',
  soul: '#C060C0',
  marsh: '#A050D0',
  volcano: '#E05030',
  earth: '#606060',
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
    s => s.game === 'HeartGold' || (s.generation === 4 && /heart\s*gold|hgss|heartgold/i.test(s.filename)),
  );
  const pick =
    focused && (focused.game === 'HeartGold' || focused.game === 'SoulSilver' || focused.generation === 4)
      ? focused
      : hgSaves[0] ?? null;

  if (!pick) {
    return { progress: { badges: 0, tools: mergeTools(0, []) }, source: null };
  }

  const badges = typeof pick.badges === 'number' ? pick.badges : 0;
  return {
    progress: { badges, tools: mergeTools(badges, []) },
    source: pick,
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
  showGated: boolean,
): ProgressionEncounter[] {
  const q = query.toLowerCase().trim();
  return encounters.filter(e => {
    if (firstOnly && !e.firstHere && area.id !== 'trade' && area.id !== 'event') return false;
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

export function HeartGoldProgressionView({
  caughtSet,
  focusedSave,
  saves,
  searchQuery,
  show,
}: HeartGoldProgressionViewProps) {
  const navigate = useNavigate();
  const [showLocked, setShowLocked] = useState(false);
  const [showMeta, setShowMeta] = useState(false);
  const [firstOnly, setFirstOnly] = useState(true);
  const [showGated, setShowGated] = useState(false);
  const [showKanto, setShowKanto] = useState(true);

  const { progress, source } = useMemo(
    () => resolveProgress(focusedSave, saves),
    [focusedSave, saves],
  );
  const johto = countJohtoBadges(progress.badges);
  const kanto = countKantoBadges(progress.badges);
  const total = countBadges(progress.badges);

  const availableSet = useMemo(
    () => hgSpeciesAvailableNow(progress, false),
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
    () => HG_PROGRESSION.filter(
      a => !['evolutions', 'breed', 'trade', 'event'].includes(a.id),
    ),
    [],
  );
  const metaAreas = useMemo(
    () => HG_PROGRESSION.filter(
      a => ['evolutions', 'breed', 'trade', 'event'].includes(a.id),
    ),
    [],
  );

  const handleRowClick = useCallback((dexNum: number) => {
    navigate(`/dex/${dexNum}`);
  }, [navigate]);

  const ownedToolLabels = useMemo(() => {
    const order: ProgressionReq[] = [
      'old-rod', 'cut', 'rock-smash', 'headbutt', 'strength', 'surf', 'good-rod',
      'fly', 'whirlpool', 'super-rod', 'waterfall', 'national-dex', 'rock-climb',
    ];
    return order.filter(r => progress.tools.has(r)).map(r => TOOL_LABEL[r]);
  }, [progress]);

  const renderArea = (area: ProgressionArea, areaLocked: boolean) => {
    const visible = filterEncounters(
      area,
      area.encounters,
      searchQuery,
      caughtSet,
      show,
      firstOnly,
      progress,
      showGated || area.id === 'event' || area.id === 'trade',
    );
    if (visible.length === 0 && searchQuery) return null;
    if (visible.length === 0 && areaLocked) return null;

    const firsts = area.encounters.filter(e => e.firstHere);
    const openFirsts = firsts.filter(e => encounterAvailable(area, e, progress));
    const caughtOpen = openFirsts.filter(e => caughtSet.has(e.species)).length;
    const gym = area.gymBadge != null ? HG_BADGES[area.gymBadge] : null;
    const earnedGym = gym ? hasBadge(progress.badges, gym.index) : false;

    return (
      <section key={area.id} style={{ ...s.section, opacity: areaLocked ? 0.45 : 1 }}>
        <header style={s.sectionHeader}>
          <div style={s.sectionTitleRow}>
            {areaLocked && <span style={s.lockIcon} title="Not reachable yet">[L]</span>}
            <span style={s.sectionName}>{area.name}</span>
            {gym && (
              <span
                style={{
                  ...s.badgeEmblem,
                  background: earnedGym ? (BADGE_COLORS[gym.emblem] || '#888') : '#ccc',
                  borderColor: earnedGym ? '#111' : '#999',
                  opacity: earnedGym ? 1 : 0.4,
                }}
                title={earnedGym ? `${gym.name} — earned` : `${gym.name} — not yet`}
              >
                {gym.emblem.slice(0, 1).toUpperCase()}
              </span>
            )}
            {gym && earnedGym && <span style={s.badgeLabel}>{gym.name}</span>}
          </div>
          <span style={s.sectionMeta}>
            {openFirsts.length > 0 ? `${caughtOpen}/${openFirsts.length}` : firsts.length === 0 ? '—' : '0 open'}
          </span>
        </header>

        {visible.length === 0 ? (
          <div style={s.emptyArea}>
            {firsts.length === 0
              ? 'No encounters listed'
              : openFirsts.length === 0
                ? 'Nothing catchable here yet (need HM / rod / badges)'
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
                <img src={SPRITE_URL(e.species)} alt={name} style={s.sprite} loading="lazy" />
                <div style={s.nameCol}>
                  <span style={s.name}>{name}</span>
                  <span style={s.methodRow}>
                    <span style={s.methodChip}>{METHOD_LABEL[e.method]}</span>
                    {missing.map(r => (
                      <span key={r} style={s.needChip}>needs {TOOL_LABEL[r]}</span>
                    ))}
                    {e.note && open && <span style={s.note}>{e.note}</span>}
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
    for (let i = 15; i >= 0; i--) {
      if (hasBadge(progress.badges, i)) return HG_BADGES[i];
    }
    return null;
  }, [progress.badges]);

  return (
    <div style={s.wrap}>
      <div style={s.banner}>
        <div style={s.bannerTop}>
          <strong style={s.bannerTitle}>HeartGold · Catch as you go</strong>
          <span style={s.bannerCount}>
            {progressStats.caughtAvailable}/{progressStats.available} open now
          </span>
        </div>
        <div style={s.bannerSub}>
          {source ? (
            <>
              Save: <strong>{source.trainerName || '???'}</strong>
              {latestBadge ? <> · latest: <strong>{latestBadge.name}</strong></> : ' · no badges yet'}
              {' · '}Johto {johto}/8 · Kanto {kanto}/8 · total {total}/16
              {ownedToolLabels.length > 0 && (
                <> · tools: {ownedToolLabels.join(', ')}</>
              )}
            </>
          ) : (
            <>No HeartGold save focused — showing start-of-game. Import a HG .sav (or pick it under All games) to track badges.</>
          )}
        </div>

        <div style={s.badgeStrip}>
          {HG_BADGES.filter(b => b.region === 'johto').map(b => {
            const earned = hasBadge(progress.badges, b.index);
            return (
              <div
                key={b.index}
                title={`${b.name} (${b.leader}${b.unlocks ? ` · ${b.unlocks}` : ''})`}
                style={{
                  ...s.badgeDot,
                  background: earned ? (BADGE_COLORS[b.emblem] || '#888') : '#e8e0d0',
                  borderColor: earned ? '#111' : '#bbb',
                  color: earned ? '#fff' : '#888',
                }}
              >
                {b.index + 1}
              </div>
            );
          })}
          <span style={s.regionSep}>|</span>
          {HG_BADGES.filter(b => b.region === 'kanto').map(b => {
            const earned = hasBadge(progress.badges, b.index);
            return (
              <div
                key={b.index}
                title={`${b.name} (${b.leader}${b.unlocks ? ` · ${b.unlocks}` : ''})`}
                style={{
                  ...s.badgeDot,
                  background: earned ? (BADGE_COLORS[b.emblem] || '#888') : '#e8e0d0',
                  borderColor: earned ? '#111' : '#bbb',
                  color: earned ? '#fff' : '#888',
                }}
              >
                K{b.index - 7}
              </div>
            );
          })}
        </div>

        {progressStats.missingAvailable === 0 && progressStats.available > 0 ? (
          <div style={s.greatLine}>Great — you&apos;ve caught everything you can right now!</div>
        ) : (
          <div style={s.missingLine}>
            {progressStats.missingAvailable} still catchable before your next badge/HM unlock
          </div>
        )}

        <div style={s.toggles}>
          <button type="button" style={showLocked ? s.toggleOn : s.toggleOff} onClick={() => setShowLocked(v => !v)}>
            Future areas
          </button>
          <button type="button" style={showGated ? s.toggleOn : s.toggleOff} onClick={() => setShowGated(v => !v)}>
            Need HM/rod
          </button>
          <button type="button" style={showKanto ? s.toggleOn : s.toggleOff} onClick={() => setShowKanto(v => !v)}>
            Kanto
          </button>
          <button type="button" style={showMeta ? s.toggleOn : s.toggleOff} onClick={() => setShowMeta(v => !v)}>
            Evos / trades
          </button>
          <button type="button" style={firstOnly ? s.toggleOn : s.toggleOff} onClick={() => setFirstOnly(v => !v)}>
            Best first spot only
          </button>
        </div>
      </div>

      <div style={s.list}>
        {storyAreas.map(area => {
          const locked = !areaUnlocked(area, progress);
          // Kanto areas: minBadges >= 8 and often minKanto or post-E4 names
          const isKanto = area.minBadges >= 8 && area.id !== 'route46' && area.id !== 'dark-cave'
            && !['route26', 'route27', 'tohjo', 'victory-road', 'indigo', 'route28', 'mt-silver',
              'dragons-den', 'route45', 'bell-tower', 'whirl-islands', 'embedded-tower', 'ss-aqua',
              'roaming-johto', 'safari-zone', 'headbutt', 'any-water'].includes(area.id)
            && (area.minKantoBadges > 0 || ['viridian', 'route1', 'pallet', 'route2', 'viridian-forest',
              'pewter', 'route3', 'mt-moon', 'route4', 'cerulean', 'route24', 'route25', 'route5', 'route6',
              'vermilion', 'route9', 'route10', 'rock-tunnel', 'lavender', 'route8', 'route7', 'celadon',
              'route16', 'route17', 'route18', 'fuchsia', 'route12', 'route13', 'route14', 'route15',
              'route11', 'saffron', 'route19', 'route20', 'seafoam', 'cinnabar', 'route21', 'route22',
              'cerulean-cave', 'roaming-kanto', 'sinjoh', 'mt-silver'].includes(area.id));
          if (isKanto && !showKanto) return null;
          if (locked && !showLocked) return null;
          return renderArea(area, locked);
        })}
        {showMeta && metaAreas.map(area => renderArea(area, false))}
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
  badgeStrip: { display: 'flex', gap: '3px', marginTop: '8px', flexWrap: 'wrap' as const, alignItems: 'center' as const },
  regionSep: { fontSize: '10px', color: '#5d514288', margin: '0 2px' },
  badgeDot: {
    width: '20px', height: '20px', borderRadius: '50%', border: '1.5px solid #111',
    display: 'flex', alignItems: 'center' as const, justifyContent: 'center' as const,
    fontSize: '8px', fontWeight: 'bold' as const, fontFamily: 'inherit',
  },
  greatLine: { marginTop: '6px', fontSize: '11px', fontWeight: 'bold' as const, color: '#1a7a3a' },
  missingLine: { marginTop: '6px', fontSize: '10px', color: '#5d5142' },
  toggles: { display: 'flex', flexWrap: 'wrap' as const, gap: '4px', marginTop: '8px' },
  toggleOn: {
    padding: '2px 8px', border: '1px solid #111', borderRadius: '10px',
    background: 'rgba(204,0,28,0.10)', color: '#111', fontSize: '10px',
    fontFamily: 'inherit', cursor: 'pointer',
  },
  toggleOff: {
    padding: '2px 8px', border: '1px solid #11111133', borderRadius: '10px',
    background: 'transparent', color: '#5d5142', fontSize: '10px',
    fontFamily: 'inherit', cursor: 'pointer',
  },
  list: { flex: 1, overflowY: 'auto' as const, minHeight: 0 },
  section: { borderBottom: '1px solid #11111118' },
  sectionHeader: {
    display: 'flex', justifyContent: 'space-between' as const, alignItems: 'center' as const,
    padding: '6px 10px 4px', background: 'rgba(0,0,0,0.04)', position: 'sticky' as const, top: 0, zIndex: 1,
  },
  sectionTitleRow: { display: 'flex', alignItems: 'center' as const, gap: '6px', minWidth: 0 },
  lockIcon: { fontSize: '10px', color: '#5d5142' },
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
  needChip: {
    fontSize: '9px', color: '#8a4020', background: 'rgba(200,80,20,0.12)',
    borderRadius: '6px', padding: '0 5px', flexShrink: 0,
  },
  note: {
    fontSize: '9px', color: '#5d514288', whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const, textOverflow: 'ellipsis' as const,
  },
} as const;
