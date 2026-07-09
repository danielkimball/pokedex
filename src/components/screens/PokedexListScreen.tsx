import { useRef, useMemo, useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useAppStore, type DexSort, type DexShow, type DexVersion, type DexView, type DexProgression } from '../../state/store';
import { SPECIES } from '../../core/constants/species';
import { TYPES, SPECIES_TYPES } from '../../core/constants/types';
import { LOCATIONS } from '../../core/constants/locations';
import { getAllPokemon } from '../../db/pokemon-store';
import { gameLabel, defaultSpriteUrl } from '../../core/constants/games';
import { TypeBadge } from '../ui/TypeBadge';
import { DexCardView } from './DexCardView';
import { YellowProgressionView } from '../pokedex/YellowProgressionView';
import { HeartGoldProgressionView } from '../pokedex/HeartGoldProgressionView';

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

const SHOW_OPTIONS: { value: DexShow; label: string }[] = [
  { value: 'caught', label: 'Caught' },
  { value: 'uncaught', label: 'Missing' },
];

const VERSION_OPTIONS: { value: DexVersion; label: string }[] = [
  { value: 'all', label: 'All Versions' },
  { value: 'heartgold', label: 'HeartGold Only' },
  { value: 'soulsilver', label: 'SoulSilver Only' },
  { value: 'diamond', label: 'Diamond Only' },
  { value: 'pearl', label: 'Pearl Only' },
  { value: 'platinum', label: 'Platinum Only' },
];

const PROGRESSION_OPTIONS: { value: DexProgression; label: string }[] = [
  { value: null, label: 'Off (National Dex)' },
  { value: 'yellow', label: 'Yellow — story order' },
  { value: 'heartgold', label: 'HeartGold — story order' },
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
  const [levelMap, setLevelMap] = useState<Map<number, number>>(new Map());
  const [bySave, setBySave] = useState<Map<string, Set<number>>>(new Map());
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
      setLevelMap(map);
      setBySave(saveMap);
    });
  }, [registryMap]); // re-fetch when registry changes (new import)

  // Selected save no longer exists (deleted) → reset to all.
  useEffect(() => {
    if (dexSaveId && !saves.some(s => s.id === dexSaveId)) setDexSaveId(null);
  }, [dexSaveId, saves, setDexSaveId]);

  // Species counted as "caught" for the current view: a specific save's roster,
  // or every caught species across all saves.
  const caughtSet = useMemo(() => {
    if (dexSaveId) return bySave.get(dexSaveId) ?? new Set<number>();
    const set = new Set<number>();
    for (const [species, entry] of registryMap) {
      if (entry.caught) set.add(species);
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

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => navigate('/')}>
          {'<'} BACK
        </button>
        <div style={s.headerRight}>
          <div style={s.viewToggle}>
            {(['list', 'card'] as DexView[]).map(v => (
              <button
                key={v}
                style={dexView === v ? s.viewToggleActive : s.viewToggleBtn}
                onClick={() => setDexView(v)}
              >
                {v === 'list' ? 'List' : 'Cards'}
              </button>
            ))}
          </div>
          <span style={s.headerCount}>
            {caughtInView}/{genTotal}
            {focusedSave ? ` · ${gameLabel(focusedSave)}` : dexGen ? ` · Gen ${GEN_OPTIONS.find(o => o.value === dexGen)?.label}` : ''}
          </span>
        </div>
      </div>

      {/* Search */}
      <div style={s.toolbar}>
        <input
          type="text"
          placeholder="Search name or #..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={s.searchInput}
        />
      </div>

      {/* Sort + Filter row */}
      <div style={s.controlRow}>
        <div style={s.controlGroup}>
          <span style={s.controlLabel}>Sort:</span>
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              style={dexSort === opt.value ? s.chipActive : s.chip}
              onClick={() => setDexSort(opt.value)}
            >
              {opt.label}
            </button>
          ))}
          <button
            style={(dexSort === 'level-desc' || dexSort === 'level-asc') ? s.chipActive : s.chip}
            onClick={handleLevelSort}
          >
            Lv{dexSort === 'level-asc' ? '\u25B2' : '\u25BC'}
          </button>
          {dexView === 'card' && (
            <button
              style={dexSort === 'type' ? s.chipActive : s.chip}
              onClick={() => setDexSort('type')}
            >
              Type
            </button>
          )}
        </div>
        <div style={s.controlGroup}>
          <span style={s.controlLabel}>Show:</span>
          {SHOW_OPTIONS.map(opt => (
            <button
              key={opt.value}
              style={dexShow === opt.value ? s.chipActive : s.chip}
              onClick={() => handleShowToggle(opt.value)}
            >
              {opt.label}
            </button>
          ))}
          <select
            value={dexVersion}
            onChange={(e) => setDexVersion(e.target.value as DexVersion)}
            style={s.versionSelect}
          >
            {VERSION_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div style={s.controlGroup}>
          <span style={s.controlLabel}>Gen:</span>
          {GEN_OPTIONS.map(opt => (
            <button
              key={String(opt.value)}
              style={dexGen === opt.value ? s.chipActive : s.chip}
              onClick={() => setDexGen(opt.value)}
            >
              {opt.label}
            </button>
          ))}
          <select
            value={dexSaveId ?? ''}
            onChange={(e) => setDexSaveId(e.target.value || null)}
            style={s.versionSelect}
          >
            <option value="">All games</option>
            {saves.map(sv => (
              <option key={sv.id} value={sv.id}>{gameLabel(sv)} — {sv.trainerName}</option>
            ))}
          </select>
        </div>
        <div style={s.controlGroup}>
          <span style={s.controlLabel}>Game:</span>
          <select
            value={dexProgression ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              const next = (v === '' ? null : v) as DexProgression;
              setDexProgression(next);
              // Story-order views are Gen-scoped.
              if (next === 'yellow') setDexGen(1);
              if (next === 'heartgold') setDexGen(null); // Johto+Kanto spans gens 1-2 (+ later via safari etc.)
            }}
            style={s.progressionSelect}
          >
            {PROGRESSION_OPTIONS.map(opt => (
              <option key={String(opt.value)} value={opt.value ?? ''}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {dexProgression === 'yellow' ? (
        <YellowProgressionView
          caughtSet={caughtSet}
          focusedSave={focusedSave}
          saves={saves}
          searchQuery={searchQuery}
          show={dexShow}
        />
      ) : dexProgression === 'heartgold' ? (
        <HeartGoldProgressionView
          caughtSet={caughtSet}
          focusedSave={focusedSave}
          saves={saves}
          searchQuery={searchQuery}
          show={dexShow}
        />
      ) : dexView === 'card' ? (
        <DexCardView />
      ) : (
        <>
      {/* Result count */}
      <div style={s.resultCount}>{showingLabel}</div>

      {/* Virtualized list */}
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
                    background: isCaught ? 'rgba(40,120,64,0.08)' : 'transparent',
                  }}
                  onClick={() => handleRowClick(dexNum)}
                >
                  <span style={s.caughtDot}>
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
        </>
      )}
    </div>
  );
}

const s = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    fontFamily: "inherit",
    background: '#f4f1e8',
    color: '#111111',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: '6px 10px',
    borderBottom: '1px solid #11111122',
    flexShrink: 0,
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#111111',
    fontSize: '12px',
    fontFamily: "inherit",
    cursor: 'pointer',
    padding: '4px 8px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center' as const,
    gap: '8px',
  },
  headerCount: {
    fontSize: '12px',
    color: '#111111',
    fontWeight: 'bold' as const,
  },
  viewToggle: {
    display: 'flex',
    border: '1px solid #11111133',
    borderRadius: '10px',
    overflow: 'hidden' as const,
  },
  viewToggleBtn: {
    padding: '3px 10px',
    border: 'none',
    background: 'transparent',
    color: '#5d5142',
    fontSize: '10px',
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  viewToggleActive: {
    padding: '3px 10px',
    border: 'none',
    background: '#cc001c',
    color: '#fff8e8',
    fontSize: '10px',
    fontFamily: 'inherit',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
  },
  toolbar: {
    padding: '6px 10px',
    flexShrink: 0,
  },
  searchInput: {
    width: '100%',
    padding: '6px 10px',
    background: '#fffaf0',
    border: '1px solid #11111144',
    borderRadius: '4px',
    color: '#111111',
    fontSize: '12px',
    fontFamily: "inherit",
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  controlRow: {
    padding: '2px 10px 4px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
    flexShrink: 0,
  },
  controlGroup: {
    display: 'flex',
    alignItems: 'center' as const,
    gap: '4px',
    flexWrap: 'wrap' as const,
  },
  controlLabel: {
    fontSize: '10px',
    color: '#5d5142',
    width: '32px',
    flexShrink: 0,
  },
  chip: {
    padding: '2px 8px',
    border: '1px solid #11111133',
    borderRadius: '10px',
    background: 'transparent',
    color: '#5d5142',
    fontSize: '10px',
    fontFamily: "inherit",
    cursor: 'pointer',
  },
  chipActive: {
    padding: '2px 8px',
    border: '1px solid #111111',
    borderRadius: '10px',
    background: 'rgba(204,0,28,0.10)',
    color: '#111111',
    fontSize: '10px',
    fontFamily: "inherit",
    cursor: 'pointer',
  },
  versionSelect: {
    padding: '2px 4px',
    background: '#fffaf0',
    border: '1px solid #11111133',
    borderRadius: '10px',
    color: '#5d5142',
    fontSize: '10px',
    fontFamily: "inherit",
    outline: 'none',
    cursor: 'pointer',
    marginLeft: 'auto',
  },
  progressionSelect: {
    padding: '2px 4px',
    background: '#fffaf0',
    border: '1px solid #11111133',
    borderRadius: '10px',
    color: '#5d5142',
    fontSize: '10px',
    fontFamily: "inherit",
    outline: 'none',
    cursor: 'pointer',
    flex: 1,
    minWidth: '140px',
  },
  resultCount: {
    padding: '2px 10px 4px',
    fontSize: '10px',
    color: '#5d514288',
    borderBottom: '1px solid #11111115',
    flexShrink: 0,
  },
  listParent: {
    flex: 1,
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const,
    minHeight: 0,
  },
  row: {
    display: 'flex',
    alignItems: 'center' as const,
    gap: '6px',
    padding: '4px 10px',
    borderBottom: '1px solid rgba(0,0,0,0.08)',
    cursor: 'pointer',
    height: '48px',
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
