import { useRef, useMemo, useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useAppStore, type DexSort, type DexShow, type DexVersion, type DexView } from '../../state/store';
import { SPECIES } from '../../core/constants/species';
import { TYPES, SPECIES_TYPES } from '../../core/constants/types';
import { LOCATIONS } from '../../core/constants/locations';
import { getAllPokemon } from '../../db/pokemon-store';
import { gameLabel, defaultSpriteUrl } from '../../core/constants/games';
import { ownedSpeciesFromSave } from '../../utils/owned-species';
import { TypeBadge } from '../ui/TypeBadge';
import { DexCardView } from './DexCardView';
import { GameProgressionView } from '../pokedex/GameProgressionView';
import { PROGRESSION_GAME_OPTIONS, getGuide } from '../../core/constants/progression-registry';

const SPRITE_URL = (n: number) => defaultSpriteUrl(n);

/** National Dex ranges per generation (inclusive). */
const GEN_RANGES: Record<number, [number, number]> = {
  1: [1, 151],
  2: [152, 251],
  3: [252, 386],
  4: [387, 493],
};

const GEN_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: 'All' },
  { value: 1, label: 'I' },
  { value: 2, label: 'II' },
  { value: 3, label: 'III' },
  { value: 4, label: 'IV' },
];

function getTypesForSpecies(speciesIndex: number): string[] {
  const pair = SPECIES_TYPES[speciesIndex];
  if (!pair) return [];
  const result: string[] = [];
  if (pair[0] >= 0) result.push(TYPES[pair[0]]);
  if (pair[1] >= 0) result.push(TYPES[pair[1]]);
  return result;
}

const SORT_OPTIONS: { value: DexSort; label: string }[] = [
  { value: 'number', label: '#' },
  { value: 'name', label: 'A-Z' },
];

const VERSION_OPTIONS: { value: DexVersion; label: string }[] = [
  { value: 'all', label: 'All Versions' },
  { value: 'heartgold', label: 'HeartGold Only' },
  { value: 'soulsilver', label: 'SoulSilver Only' },
  { value: 'diamond', label: 'Diamond Only' },
  { value: 'pearl', label: 'Pearl Only' },
  { value: 'platinum', label: 'Platinum Only' },
];

/** Returns true if locs represent a real catchable location (not just Trade/Event/empty) */
function hasRealLocations(locs: string[] | undefined): boolean {
  if (!locs || locs.length === 0) return false;
  return locs.some(l => l !== 'Trade' && l !== 'Event only');
}

/** Check if a Pokemon is exclusive to a given version */
function isVersionExclusive(dexNum: number, version: DexVersion): boolean {
  const loc = LOCATIONS[dexNum];
  if (!loc) return false;

  const has = (game: keyof typeof loc) => hasRealLocations(loc[game]);

  switch (version) {
    case 'heartgold':
      return has('heartgold') && !has('soulsilver');
    case 'soulsilver':
      return has('soulsilver') && !has('heartgold');
    case 'diamond':
      return has('diamond') && !has('pearl');
    case 'pearl':
      return has('pearl') && !has('diamond');
    case 'platinum':
      return has('platinum') && !(has('diamond') && has('pearl'));
    default:
      return true;
  }
}

export function PokedexListScreen() {
  const navigate = useNavigate();
  const parentRef = useRef<HTMLDivElement>(null);

  const searchQuery = useAppStore(s => s.searchQuery);
  const setSearchQuery = useAppStore(s => s.setSearchQuery);
  const registryMap = useAppStore(s => s.registryMap);
  const dexSort = useAppStore(s => s.dexSort);
  const setDexSort = useAppStore(s => s.setDexSort);
  const dexShow = useAppStore(s => s.dexShow);
  const setDexShow = useAppStore(s => s.setDexShow);
  const dexVersion = useAppStore(s => s.dexVersion);
  const setDexVersion = useAppStore(s => s.setDexVersion);
  const dexGen = useAppStore(s => s.dexGen);
  const setDexGen = useAppStore(s => s.setDexGen);
  const dexSaveId = useAppStore(s => s.dexSaveId);
  const setDexSaveId = useAppStore(s => s.setDexSaveId);
  const dexProgression = useAppStore(s => s.dexProgression);
  const setDexProgression = useAppStore(s => s.setDexProgression);
  const dexView = useAppStore(s => s.dexView);
  const setDexView = useAppStore(s => s.setDexView);
  const saves = useAppStore(s => s.saves);

  // Build max-level lookup per species (for level sorting) and the set of
  // species present in each save (for the per-game filter).
  // Live-parse raw saves so Day Care / party always count even on stale imports.
  const [levelMap, setLevelMap] = useState<Map<number, number>>(new Map());
  const [bySave, setBySave] = useState<Map<string, Set<number>>>(new Map());
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    getAllPokemon().then(records => {
      const map = new Map<number, number>();
      const saveMap = new Map<string, Set<number>>();
      for (const r of records) {
        const prev = map.get(r.species) ?? 0;
        if (r.level > prev) map.set(r.species, r.level);
        let set = saveMap.get(r.saveId);
        if (!set) { set = new Set(); saveMap.set(r.saveId, set); }
        set.add(r.species);
      }
      // Overlay live ownership from raw save bytes (party + PC + Day Care).
      for (const sv of saves) {
        const live = ownedSpeciesFromSave(sv);
        if (live.size === 0) continue;
        let set = saveMap.get(sv.id);
        if (!set) { set = new Set(); saveMap.set(sv.id, set); }
        for (const sp of live) set.add(sp);
      }
      setLevelMap(map);
      setBySave(saveMap);
    });
  }, [registryMap, saves]);

  // Selected save no longer exists (deleted) → reset to all.
  useEffect(() => {
    if (dexSaveId && !saves.some(s => s.id === dexSaveId)) setDexSaveId(null);
  }, [dexSaveId, saves, setDexSaveId]);

  // Species counted as "caught": focused save roster, or union of registry + all saves.
  const caughtSet = useMemo(() => {
    if (dexSaveId) return bySave.get(dexSaveId) ?? new Set<number>();
    const set = new Set<number>();
    for (const [species, entry] of registryMap) {
      if (entry.caught) set.add(species);
    }
    // Include live-parsed ownership (Day Care etc.) even if registry is stale.
    for (const owned of bySave.values()) {
      for (const sp of owned) set.add(sp);
    }
    return set;
  }, [dexSaveId, bySave, registryMap]);

  const handleLevelSort = useCallback(() => {
    if (dexSort === 'level-desc') setDexSort('level-asc');
    else setDexSort('level-desc');
  }, [dexSort, setDexSort]);

  const handleShowToggle = useCallback((value: DexShow) => {
    // Clicking active pill deselects back to 'all'
    setDexShow(dexShow === value ? 'all' : value);
  }, [dexShow, setDexShow]);

  const filteredEntries = useMemo(() => {
    const entries: number[] = [];
    const query = searchQuery.toLowerCase().trim();

    const [lo, hi] = dexGen ? GEN_RANGES[dexGen] : [1, 493];

    for (let i = lo; i <= hi; i++) {
      const name = SPECIES[i];
      if (!name) continue;

      // Text search filter
      if (query) {
        const matchesName = name.toLowerCase().includes(query);
        const matchesNumber = String(i).padStart(3, '0').includes(query) || String(i) === query;
        if (!matchesName && !matchesNumber) continue;
      }

      // Version exclusive filter
      if (dexVersion !== 'all' && !isVersionExclusive(i, dexVersion)) continue;

      // Caught/uncaught filter (caught = in the selected save, or anywhere)
      const isCaught = caughtSet.has(i);
      if (dexShow === 'caught' && !isCaught) continue;
      if (dexShow === 'uncaught' && isCaught) continue;

      entries.push(i);
    }

    // Sort
    entries.sort((a, b) => {
      switch (dexSort) {
        case 'name':
          return (SPECIES[a] || '').localeCompare(SPECIES[b] || '');
        case 'type': {
          // Primary type index (game order), then secondary, then dex #.
          const ap = SPECIES_TYPES[a] ?? [-1, -1];
          const bp = SPECIES_TYPES[b] ?? [-1, -1];
          const a0 = ap[0] < 0 ? 99 : ap[0];
          const b0 = bp[0] < 0 ? 99 : bp[0];
          if (a0 !== b0) return a0 - b0;
          const a1 = ap[1] < 0 ? 99 : ap[1];
          const b1 = bp[1] < 0 ? 99 : bp[1];
          if (a1 !== b1) return a1 - b1;
          return a - b;
        }
        case 'level-desc': {
          const aLv = levelMap.get(a) ?? 0;
          const bLv = levelMap.get(b) ?? 0;
          return aLv !== bLv ? bLv - aLv : a - b;
        }
        case 'level-asc': {
          const aLv = levelMap.get(a) ?? 0;
          const bLv = levelMap.get(b) ?? 0;
          return aLv !== bLv ? aLv - bLv : a - b;
        }
        default: // 'number'
          return a - b;
      }
    });

    return entries;
  }, [searchQuery, dexSort, dexShow, dexVersion, dexGen, caughtSet, levelMap]);

  const rowVirtualizer = useVirtualizer({
    count: filteredEntries.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 15,
  });

  // Restore scroll position on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('dex-scroll');
    if (saved) {
      requestAnimationFrame(() => {
        if (parentRef.current) {
          parentRef.current.scrollTop = Number(saved);
        }
      });
    }
  }, []);

  const handleRowClick = useCallback((dexNum: number) => {
    // Save scroll position before navigating away
    if (parentRef.current) {
      sessionStorage.setItem('dex-scroll', String(parentRef.current.scrollTop));
    }
    navigate(`/dex/${dexNum}`);
  }, [navigate]);

  const showingLabel = dexShow === 'caught'
    ? `${filteredEntries.length} caught`
    : dexShow === 'uncaught'
      ? `${filteredEntries.length} missing`
      : `${filteredEntries.length} total`;

  // Gen-aware progress for the header (e.g. "37/151" when focused on Gen I).
  const [genLo, genHi] = dexGen ? GEN_RANGES[dexGen] : [1, 493];
  const genTotal = genHi - genLo + 1;
  let caughtInView = 0;
  for (const sp of caughtSet) if (sp >= genLo && sp <= genHi) caughtInView++;

  const focusedSave = (dexSaveId ? saves.find(s => s.id === dexSaveId) : null) ?? null;

  // Migrate legacy progression keys; null = Collection mode
  const guideId = useMemo(() => {
    if (!dexProgression) return null;
    if (dexProgression === 'yellow') return 'Yellow';
    if (dexProgression === 'heartgold') return 'HeartGold';
    return getGuide(dexProgression) ? dexProgression : null;
  }, [dexProgression]);

  const isStory = guideId != null;

  /** Enter story mode for a cartridge; auto-focus a matching save when possible. */
  const enterStory = useCallback((gameId: string) => {
    setDexProgression(gameId);
    setDexVersion('all');
    const g = getGuide(gameId);
    if (g) {
      // Gen filter is collection-only; clear so it never fights story mode
      setDexGen(null);
      const match = saves.find(sv => g.matchSave(sv));
      if (match) setDexSaveId(match.id);
    }
  }, [setDexProgression, setDexVersion, setDexGen, setDexSaveId, saves]);

  const enterCollection = useCallback(() => {
    setDexProgression(null);
  }, [setDexProgression]);

  const collectionFilterCount = [
    dexShow !== 'all',
    dexVersion !== 'all',
    dexGen !== null,
    dexSort !== 'number',
  ].filter(Boolean).length;

  return (
    <div style={s.container}>
      {/* ── Masthead ── */}
      <div style={s.masthead}>
        <button type="button" style={s.backBtn} onClick={() => navigate('/')}>
          {'\u2039'} Back
        </button>
        <div style={s.mastheadCenter}>
          <div style={s.modeSeg}>
            <button
              type="button"
              style={!isStory ? s.modeSegOn : s.modeSegOff}
              onClick={enterCollection}
              title="National Dex living collection"
            >
              Collection
            </button>
            <button
              type="button"
              style={s.modeSegOff}
              onClick={() => navigate('/items')}
              title="Generation I–IV item acquisition guide"
            >
              Items
            </button>
            <button
              type="button"
              style={isStory ? s.modeSegOn : s.modeSegOff}
              onClick={() => {
                if (!isStory) {
                  // Prefer a save's game, else HeartGold / Yellow
                  const fromSave = focusedSave?.game && getGuide(focusedSave.game)
                    ? focusedSave.game
                    : saves.map(sv => sv.game).find(g => g && getGuide(g))
                      ?? 'HeartGold';
                  enterStory(fromSave);
                }
              }}
              title="Catch-as-you-play guide for one cartridge"
            >
              Story
            </button>
          </div>
        </div>
        <div style={s.mastheadRight}>
          {!isStory && (
            <div style={s.viewToggle}>
              {(['list', 'card'] as DexView[]).map(v => (
                <button
                  key={v}
                  type="button"
                  style={dexView === v ? s.viewToggleActive : s.viewToggleBtn}
                  onClick={() => setDexView(v)}
                >
                  {v === 'list' ? 'List' : 'Cards'}
                </button>
              ))}
            </div>
          )}
          <span style={s.headerCount}>
            {isStory
              ? (focusedSave ? gameLabel(focusedSave) : guideId)
              : `${caughtInView}/${genTotal}`}
          </span>
        </div>
      </div>

      {/* ── Search ── */}
      <div style={s.searchWrap}>
        <span style={s.searchIcon} aria-hidden>⌕</span>
        <input
          type="text"
          placeholder="Search name or number…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={s.searchInput}
          aria-label="Search Pokémon by name or number"
        />
      </div>

      {/* ── Context bar: owned-by + mode-specific primary control ── */}
      <div style={s.contextBar}>
        <div style={s.contextField}>
          <span style={s.contextLabel}>Owned by</span>
          <select
            value={dexSaveId ?? ''}
            onChange={(e) => setDexSaveId(e.target.value || null)}
            style={s.contextSelect}
            title="Which save marks species as caught"
          >
            <option value="">All saves</option>
            {saves.map(sv => (
              <option key={sv.id} value={sv.id}>
                {gameLabel(sv)} — {sv.trainerName}
              </option>
            ))}
          </select>
        </div>

        {isStory ? (
          <div style={s.contextField}>
            <span style={s.contextLabel}>Playing</span>
            <select
              value={guideId ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                if (v) enterStory(v);
                else enterCollection();
              }}
              style={s.contextSelect}
              title="Cartridge story guide"
            >
              {PROGRESSION_GAME_OPTIONS.filter(o => o.id != null).map(opt => (
                <option key={String(opt.id)} value={opt.id!}>
                  {opt.group ? `${opt.label} (${opt.group})` : opt.label}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div style={s.contextField}>
            <span style={s.contextLabel}>Show</span>
            <div style={s.pillGroup}>
              <button
                type="button"
                style={dexShow === 'all' ? s.pillOn : s.pillOff}
                onClick={() => setDexShow('all')}
              >
                All
              </button>
              <button
                type="button"
                style={dexShow === 'caught' ? s.pillOn : s.pillOff}
                onClick={() => handleShowToggle('caught')}
              >
                Caught
              </button>
              <button
                type="button"
                style={dexShow === 'uncaught' ? s.pillOn : s.pillOff}
                onClick={() => handleShowToggle('uncaught')}
              >
                Missing
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Collection-only: sort / gen / exclusives (collapsible) ── */}
      {!isStory && (
        <>
          <button
            type="button"
            style={s.refineToggle}
            onClick={() => setFiltersOpen(o => !o)}
            aria-expanded={filtersOpen}
          >
            {filtersOpen ? 'Hide filters' : 'Refine'}
            {collectionFilterCount > 0 && !filtersOpen ? ` · ${collectionFilterCount} active` : ''}
            <span style={s.chevron}>{filtersOpen ? '▴' : '▾'}</span>
          </button>
          {filtersOpen && (
            <div style={s.refinePanel}>
              <div style={s.refineBlock}>
                <span style={s.refineTitle}>Sort</span>
                <div style={s.pillGroup}>
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      style={dexSort === opt.value ? s.pillOn : s.pillOff}
                      onClick={() => setDexSort(opt.value)}
                    >
                      {opt.label === '#' ? 'Dex #' : opt.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    style={(dexSort === 'level-desc' || dexSort === 'level-asc') ? s.pillOn : s.pillOff}
                    onClick={handleLevelSort}
                  >
                    Level {dexSort === 'level-asc' ? '↑' : '↓'}
                  </button>
                  <button
                    type="button"
                    style={dexSort === 'type' ? s.pillOn : s.pillOff}
                    onClick={() => setDexSort('type')}
                  >
                    Type
                  </button>
                </div>
              </div>
              <div style={s.refineBlock}>
                <span style={s.refineTitle}>Generation</span>
                <div style={s.pillGroup}>
                  {GEN_OPTIONS.map(opt => (
                    <button
                      key={String(opt.value)}
                      type="button"
                      style={dexGen === opt.value ? s.pillOn : s.pillOff}
                      onClick={() => setDexGen(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={s.refineBlock}>
                <span style={s.refineTitle}>Version exclusives</span>
                <select
                  value={dexVersion}
                  onChange={(e) => setDexVersion(e.target.value as DexVersion)}
                  style={s.refineSelect}
                >
                  {VERSION_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          {/* Status strip for collection */}
          <div style={s.statusStrip}>
            <span>{showingLabel}</span>
            {focusedSave && <span style={s.statusMuted}> · owned in {gameLabel(focusedSave)}</span>}
          </div>
        </>
      )}

      {/* ── Story mode: catch filter only (status shared) ── */}
      {isStory && (
        <div style={s.storyMeta}>
          <div style={s.pillGroup}>
            <button type="button" style={dexShow === 'all' ? s.pillOn : s.pillOff} onClick={() => setDexShow('all')}>All</button>
            <button type="button" style={dexShow === 'caught' ? s.pillOn : s.pillOff} onClick={() => handleShowToggle('caught')}>Caught</button>
            <button type="button" style={dexShow === 'uncaught' ? s.pillOn : s.pillOff} onClick={() => handleShowToggle('uncaught')}>Missing</button>
          </div>
          <span style={s.statusMuted}>
            {focusedSave
              ? `Catch marks from ${svLabel(focusedSave)}`
              : 'Catch marks from all saves'}
          </span>
        </div>
      )}

      {isStory && guideId ? (
        <GameProgressionView
          guideId={guideId}
          caughtSet={caughtSet}
          focusedSave={focusedSave}
          saves={saves}
          searchQuery={searchQuery}
          show={dexShow}
        />
      ) : dexView === 'card' ? (
        <DexCardView />
      ) : (
        <div ref={parentRef} style={s.listParent}>
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const dexNum = filteredEntries[virtualRow.index];
              const name = SPECIES[dexNum];
              const isCaught = caughtSet.has(dexNum);
              const types = getTypesForSpecies(dexNum);

              return (
                <div
                  key={dexNum}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <div
                    style={{
                      ...s.row,
                      background: isCaught ? 'rgba(40,120,64,0.07)' : 'transparent',
                    }}
                    onClick={() => handleRowClick(dexNum)}
                  >
                    <span style={{
                      ...s.caughtDot,
                      color: isCaught ? '#1a7a3a' : '#bbb',
                    }}>
                      {isCaught ? '\u25CF' : '\u25CB'}
                    </span>
                    <span style={s.dexNum}>#{String(dexNum).padStart(3, '0')}</span>
                    <img
                      src={SPRITE_URL(dexNum)}
                      alt={name}
                      style={s.sprite}
                      loading="lazy"
                    />
                    <div style={s.nameCol}>
                      <span style={s.name}>{name}</span>
                      <span style={s.typeRow}>
                        {types.map(t => <TypeBadge key={t} type={t} />)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function svLabel(sv: { game?: string | null; gameVersion?: string | null; trainerName: string }) {
  return `${gameLabel(sv)} (${sv.trainerName})`;
}

const s = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    fontFamily: 'inherit',
    background: 'linear-gradient(180deg, #f7f3ea 0%, #f0ebe0 100%)',
    color: '#1a1510',
  },
  masthead: {
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr)',
    alignItems: 'center' as const,
    columnGap: '8px',
    rowGap: '6px',
    padding: '8px 10px',
    flexShrink: 0,
    background: 'linear-gradient(180deg, #cc001c 0%, #a00016 100%)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
  },
  backBtn: {
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.25)',
    borderRadius: '6px',
    color: '#fff8e8',
    fontSize: '11px',
    fontFamily: 'inherit',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    padding: '5px 10px',
    flexShrink: 0,
    alignSelf: 'center' as const,
  },
  mastheadCenter: {
    display: 'flex',
    justifyContent: 'flex-end' as const,
    minWidth: 0,
  },
  modeSeg: {
    display: 'flex',
    width: '100%',
    maxWidth: '214px',
    background: 'rgba(0,0,0,0.22)',
    borderRadius: '8px',
    padding: '2px',
    gap: '2px',
  },
  modeSegOn: {
    flex: '1 1 0',
    minWidth: 0,
    padding: '5px 7px',
    border: 'none',
    borderRadius: '6px',
    background: '#fff8e8',
    color: '#a00016',
    fontSize: '11px',
    fontFamily: 'inherit',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  },
  modeSegOff: {
    flex: '1 1 0',
    minWidth: 0,
    padding: '5px 7px',
    border: 'none',
    borderRadius: '6px',
    background: 'transparent',
    color: 'rgba(255,248,232,0.75)',
    fontSize: '11px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  },
  mastheadRight: {
    gridColumn: '1 / -1',
    display: 'flex',
    alignItems: 'center' as const,
    justifyContent: 'flex-end' as const,
    gap: '6px',
    minWidth: 0,
    flexShrink: 0,
  },
  headerCount: {
    fontSize: '11px',
    color: '#fff8e8',
    fontWeight: 'bold' as const,
    opacity: 0.95,
    whiteSpace: 'nowrap' as const,
  },
  viewToggle: {
    display: 'flex',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '6px',
    overflow: 'hidden' as const,
  },
  viewToggleBtn: {
    padding: '3px 8px',
    border: 'none',
    background: 'transparent',
    color: 'rgba(255,248,232,0.7)',
    fontSize: '10px',
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  viewToggleActive: {
    padding: '3px 8px',
    border: 'none',
    background: 'rgba(255,255,255,0.2)',
    color: '#fff8e8',
    fontSize: '10px',
    fontFamily: 'inherit',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
  },
  searchWrap: {
    display: 'flex',
    alignItems: 'center' as const,
    gap: '6px',
    margin: '8px 10px 0',
    padding: '0 10px',
    background: '#fffcf5',
    border: '1px solid rgba(0,0,0,0.1)',
    borderRadius: '8px',
    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
    flexShrink: 0,
  },
  searchIcon: {
    fontSize: '14px',
    color: '#8a7d6b',
    lineHeight: 1,
  },
  searchInput: {
    flex: 1,
    padding: '8px 0',
    background: 'transparent',
    border: 'none',
    color: '#1a1510',
    fontSize: '13px',
    fontFamily: 'inherit',
    outline: 'none',
  },
  contextBar: {
    display: 'flex',
    gap: '8px',
    padding: '8px 10px 6px',
    flexShrink: 0,
    flexWrap: 'wrap' as const,
  },
  contextField: {
    flex: '1 1 140px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '3px',
    minWidth: 0,
  },
  contextLabel: {
    fontSize: '9px',
    fontWeight: 'bold' as const,
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    color: '#8a7d6b',
  },
  contextSelect: {
    width: '100%',
    padding: '6px 8px',
    background: '#fffcf5',
    border: '1px solid rgba(0,0,0,0.12)',
    borderRadius: '6px',
    color: '#1a1510',
    fontSize: '11px',
    fontFamily: 'inherit',
    outline: 'none',
    cursor: 'pointer',
  },
  pillGroup: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '3px',
  },
  pillOn: {
    padding: '4px 10px',
    border: '1px solid #a00016',
    borderRadius: '999px',
    background: 'rgba(204,0,28,0.12)',
    color: '#8a0012',
    fontSize: '10px',
    fontFamily: 'inherit',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
  },
  pillOff: {
    padding: '4px 10px',
    border: '1px solid rgba(0,0,0,0.12)',
    borderRadius: '999px',
    background: '#fffcf5',
    color: '#5d5142',
    fontSize: '10px',
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  refineToggle: {
    alignSelf: 'flex-start',
    margin: '0 10px 4px',
    padding: '2px 0',
    border: 'none',
    background: 'transparent',
    color: '#8a7d6b',
    fontSize: '10px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center' as const,
    gap: '4px',
    flexShrink: 0,
  },
  chevron: { fontSize: '9px', opacity: 0.8 },
  refinePanel: {
    margin: '0 10px 6px',
    padding: '8px 10px',
    background: 'rgba(255,252,245,0.9)',
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    flexShrink: 0,
  },
  refineBlock: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  refineTitle: {
    fontSize: '9px',
    fontWeight: 'bold' as const,
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    color: '#8a7d6b',
  },
  refineSelect: {
    padding: '5px 8px',
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.12)',
    borderRadius: '6px',
    color: '#1a1510',
    fontSize: '11px',
    fontFamily: 'inherit',
    outline: 'none',
    cursor: 'pointer',
  },
  statusStrip: {
    padding: '2px 12px 6px',
    fontSize: '10px',
    color: '#5d5142',
    flexShrink: 0,
  },
  statusMuted: {
    color: '#8a7d6b',
  },
  storyMeta: {
    display: 'flex',
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    gap: '8px',
    padding: '0 10px 6px',
    flexShrink: 0,
    flexWrap: 'wrap' as const,
  },
  listParent: {
    flex: 1,
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const,
    minHeight: 0,
    background: 'rgba(255,252,245,0.55)',
  },
  row: {
    display: 'flex',
    alignItems: 'center' as const,
    gap: '6px',
    padding: '4px 12px',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
    cursor: 'pointer',
    height: '48px',
    boxSizing: 'border-box' as const,
  },
  caughtDot: {
    fontSize: '10px',
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
    width: '36px',
    height: '36px',
    imageRendering: 'pixelated' as const,
    flexShrink: 0,
  },
  nameCol: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
  },
  name: {
    fontSize: '12px',
    color: '#111111',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
  },
  typeRow: {
    display: 'flex',
    gap: '3px',
  },
} as const;
