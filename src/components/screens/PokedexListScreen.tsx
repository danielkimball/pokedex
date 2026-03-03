import { useRef, useMemo, useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useAppStore, type DexSort, type DexShow, type DexVersion } from '../../state/store';
import { SPECIES } from '../../core/constants/species';
import { TYPES, SPECIES_TYPES } from '../../core/constants/types';
import { LOCATIONS } from '../../core/constants/locations';
import { getAllPokemon } from '../../db/pokemon-store';
import { TypeBadge } from '../ui/TypeBadge';

const SPRITE_URL = (n: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${n}.png`;

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
  const caughtCount = useAppStore(s => s.caughtCount);
  const dexSort = useAppStore(s => s.dexSort);
  const setDexSort = useAppStore(s => s.setDexSort);
  const dexShow = useAppStore(s => s.dexShow);
  const setDexShow = useAppStore(s => s.setDexShow);
  const dexVersion = useAppStore(s => s.dexVersion);
  const setDexVersion = useAppStore(s => s.setDexVersion);

  // Build max-level lookup per species (for level sorting)
  const [levelMap, setLevelMap] = useState<Map<number, number>>(new Map());
  useEffect(() => {
    getAllPokemon().then(records => {
      const map = new Map<number, number>();
      for (const r of records) {
        const prev = map.get(r.species) ?? 0;
        if (r.level > prev) map.set(r.species, r.level);
      }
      setLevelMap(map);
    });
  }, [registryMap]); // re-fetch when registry changes (new import)

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

    for (let i = 1; i <= 493; i++) {
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

      // Caught/uncaught filter
      const isCaught = registryMap.get(i)?.caught ?? false;
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
  }, [searchQuery, dexSort, dexShow, dexVersion, registryMap, levelMap]);

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

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => navigate('/')}>
          {'<'} BACK
        </button>
        <span style={s.headerCount}>{caughtCount}/493</span>
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
      </div>

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
            const isCaught = registryMap.get(dexNum)?.caught ?? false;
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
                    background: isCaught ? 'rgba(51,255,51,0.05)' : 'transparent',
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
    </div>
  );
}

const s = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    fontFamily: "'Courier New', monospace",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: '6px 10px',
    borderBottom: '1px solid #33ff3322',
    flexShrink: 0,
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#33ff33',
    fontSize: '12px',
    fontFamily: "'Courier New', monospace",
    cursor: 'pointer',
    padding: '4px 8px',
  },
  headerCount: {
    fontSize: '12px',
    color: '#33ff33',
    fontWeight: 'bold' as const,
  },
  toolbar: {
    padding: '6px 10px',
    flexShrink: 0,
  },
  searchInput: {
    width: '100%',
    padding: '6px 10px',
    background: '#0d1a0d',
    border: '1px solid #33ff3344',
    borderRadius: '4px',
    color: '#33ff33',
    fontSize: '12px',
    fontFamily: "'Courier New', monospace",
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
    color: '#22aa22',
    width: '32px',
    flexShrink: 0,
  },
  chip: {
    padding: '2px 8px',
    border: '1px solid #33ff3333',
    borderRadius: '10px',
    background: 'transparent',
    color: '#22aa22',
    fontSize: '10px',
    fontFamily: "'Courier New', monospace",
    cursor: 'pointer',
  },
  chipActive: {
    padding: '2px 8px',
    border: '1px solid #33ff33',
    borderRadius: '10px',
    background: 'rgba(51,255,51,0.15)',
    color: '#33ff33',
    fontSize: '10px',
    fontFamily: "'Courier New', monospace",
    cursor: 'pointer',
  },
  versionSelect: {
    padding: '2px 4px',
    background: '#0d1a0d',
    border: '1px solid #33ff3333',
    borderRadius: '10px',
    color: '#22aa22',
    fontSize: '10px',
    fontFamily: "'Courier New', monospace",
    outline: 'none',
    cursor: 'pointer',
    marginLeft: 'auto',
  },
  resultCount: {
    padding: '2px 10px 4px',
    fontSize: '10px',
    color: '#22aa2288',
    borderBottom: '1px solid #33ff3315',
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
    borderBottom: '1px solid rgba(51,255,51,0.06)',
    cursor: 'pointer',
    height: '48px',
    boxSizing: 'border-box' as const,
  },
  caughtDot: {
    fontSize: '10px',
    color: '#33ff33',
    width: '14px',
    textAlign: 'center' as const,
    flexShrink: 0,
  },
  dexNum: {
    fontSize: '11px',
    color: '#22aa22',
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
    color: '#33ff33',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
  },
  typeRow: {
    display: 'flex',
    gap: '3px',
  },
} as const;
