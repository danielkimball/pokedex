/**
 * Card view for the Pokedex — the 3-column TCG-style grid of the Pokemon you
 * actually own, grouped into generation sections and sorted within each section.
 * Multiple copies of a species collapse into a single stacked card (offset edges
 * behind + a count badge); tapping opens the full per-species swipe carousel on
 * the dex-entry screen. The flat list view is unchanged and lives in
 * PokedexListScreen — this renders only when `dexView === 'card'`.
 */

import { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../state/store';
import { SPECIES } from '../../core/constants/species';
import { TYPES, SPECIES_TYPES } from '../../core/constants/types';
import { getAllPokemon } from '../../db/pokemon-store';
import type { PokemonRecord } from '../../db/schema';
import { TcgCard } from '../ui/TcgCard';

const GEN_RANGES: Record<number, [number, number]> = {
  1: [1, 151], 2: [152, 251], 3: [252, 386], 4: [387, 493],
};
const GEN_LABEL: Record<number, string> = { 1: 'GEN I', 2: 'GEN II', 3: 'GEN III', 4: 'GEN IV' };

function typesFor(species: number): string[] {
  const pair = SPECIES_TYPES[species];
  if (!pair) return [];
  const out: string[] = [];
  if (pair[0] >= 0) out.push(TYPES[pair[0]]);
  if (pair[1] >= 0) out.push(TYPES[pair[1]]);
  return out;
}

function genOf(species: number): number {
  for (const g of [1, 2, 3, 4]) {
    const [lo, hi] = GEN_RANGES[g];
    if (species >= lo && species <= hi) return g;
  }
  return 4;
}

/** A species the user owns, with all their copies (for stacking + sorting). */
interface Stack {
  species: number;
  records: PokemonRecord[];
  rep: PokemonRecord;   // representative (highest level) — the card on top
  maxLevel: number;
  count: number;
}

export function DexCardView() {
  const navigate = useNavigate();
  const searchQuery = useAppStore(s => s.searchQuery);
  const dexGen = useAppStore(s => s.dexGen);
  const dexSaveId = useAppStore(s => s.dexSaveId);
  const dexSort = useAppStore(s => s.dexSort);
  const registryMap = useAppStore(s => s.registryMap);

  const [records, setRecords] = useState<PokemonRecord[]>([]);
  useEffect(() => {
    getAllPokemon().then(setRecords);
  }, [registryMap]); // refetch after a new import

  // Build stacks: species -> the copies you own, honoring the game + search filters.
  const stacks = useMemo<Stack[]>(() => {
    const query = searchQuery.toLowerCase().trim();
    const bySpecies = new Map<number, PokemonRecord[]>();
    for (const r of records) {
      if (dexSaveId && r.saveId !== dexSaveId) continue;
      if (dexGen && genOf(r.species) !== dexGen) continue;
      if (query) {
        const name = (SPECIES[r.species] || '').toLowerCase();
        const numMatch = String(r.species).padStart(3, '0').includes(query) || String(r.species) === query;
        if (!name.includes(query) && !numMatch) continue;
      }
      let arr = bySpecies.get(r.species);
      if (!arr) { arr = []; bySpecies.set(r.species, arr); }
      arr.push(r);
    }
    const out: Stack[] = [];
    for (const [species, recs] of bySpecies) {
      let rep = recs[0];
      let maxLevel = rep.level;
      for (const r of recs) if (r.level > maxLevel) { maxLevel = r.level; rep = r; }
      out.push({ species, records: recs, rep, maxLevel, count: recs.length });
    }
    return out;
  }, [records, dexSaveId, dexGen, searchQuery]);

  // Group by generation, sort within each gen by the active sort.
  const sections = useMemo(() => {
    const cmp = (a: Stack, b: Stack): number => {
      switch (dexSort) {
        case 'name': return (SPECIES[a.species] || '').localeCompare(SPECIES[b.species] || '');
        case 'type': {
          const at = typesFor(a.species)[0] || 'zzz';
          const bt = typesFor(b.species)[0] || 'zzz';
          return at !== bt ? at.localeCompare(bt) : a.species - b.species;
        }
        case 'level-desc': return b.maxLevel !== a.maxLevel ? b.maxLevel - a.maxLevel : a.species - b.species;
        case 'level-asc': return a.maxLevel !== b.maxLevel ? a.maxLevel - b.maxLevel : a.species - b.species;
        default: return a.species - b.species;
      }
    };
    const byGen = new Map<number, Stack[]>();
    for (const st of stacks) {
      const g = genOf(st.species);
      let arr = byGen.get(g);
      if (!arr) { arr = []; byGen.set(g, arr); }
      arr.push(st);
    }
    return [1, 2, 3, 4]
      .filter(g => byGen.has(g))
      .map(g => ({ gen: g, stacks: byGen.get(g)!.sort(cmp) }));
  }, [stacks, dexSort]);

  const totalOwned = stacks.length;

  if (records.length === 0) {
    return <div style={s.empty}>No Pokemon imported yet. Connect a save to build your card collection.</div>;
  }
  if (totalOwned === 0) {
    return <div style={s.empty}>No Pokemon match these filters.</div>;
  }

  return (
    <div style={s.scroll}>
      {sections.map(({ gen, stacks: genStacks }) => (
        <div key={gen} style={s.section}>
          <div style={s.sectionHeader}>
            <span style={s.sectionTitle}>{GEN_LABEL[gen]}</span>
            <span style={s.sectionCount}>{genStacks.length}</span>
          </div>
          <div style={s.grid}>
            {genStacks.map(st => (
              <CardCell key={st.species} stack={st} onClick={() => navigate(`/dex/${st.species}`)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function CardCell({ stack, onClick }: { stack: Stack; onClick: () => void }) {
  const { rep, count } = stack;
  const stackLayers = Math.min(count - 1, 3); // up to 3 visible edges behind

  return (
    <div style={s.cellWrap} onClick={onClick}>
      {/* Stacked-card edges peeking out behind the real card */}
      {Array.from({ length: stackLayers }).map((_, i) => (
        <div
          key={i}
          style={{
            ...s.stackEdge,
            transform: `translate(${(i + 1) * 3}px, ${(i + 1) * 3}px) rotate(${(i + 1) * 1}deg)`,
            zIndex: 0,
            opacity: 0.5 - i * 0.12,
          }}
        />
      ))}

      {/* The actual TcgCard, scaled down to fit the grid cell via its container query */}
      <div style={s.cardHolder}>
        <TcgCard record={rep} />
      </div>

      {/* Count badge (notification-style) */}
      {count > 1 && <div style={s.countBadge}>{count}</div>}
    </div>
  );
}

const s = {
  scroll: {
    flex: 1,
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const,
    minHeight: 0,
    padding: '6px 8px 16px',
    background: '#f4f1e8',
  },
  empty: {
    padding: '30px 16px',
    textAlign: 'center' as const,
    color: '#5d5142',
    fontSize: '12px',
    background: '#f4f1e8',
    flex: 1,
  },
  section: {
    marginBottom: '12px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center' as const,
    gap: '8px',
    padding: '6px 4px 5px',
    position: 'sticky' as const,
    top: 0,
    background: '#f4f1e8',
    zIndex: 2,
    borderBottom: '2px solid #cc001c44',
    marginBottom: '8px',
  },
  sectionTitle: {
    fontSize: '12px',
    fontWeight: 'bold' as const,
    letterSpacing: '2px',
    color: '#8f0014',
  },
  sectionCount: {
    fontSize: '10px',
    color: '#5d5142',
    background: '#fff',
    border: '1px solid #cc001c33',
    borderRadius: '8px',
    padding: '1px 7px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '16px 10px',
    padding: '4px 6px',
  },
  cellWrap: {
    position: 'relative' as const,
    cursor: 'pointer',
  },
  stackEdge: {
    position: 'absolute' as const,
    inset: 0,
    background: '#fdf6e3',
    border: '0.5px solid #c9a83a',
    borderRadius: '5px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
  },
  cardHolder: {
    position: 'relative' as const,
    zIndex: 1,
  },
  countBadge: {
    position: 'absolute' as const,
    top: '-6px',
    right: '-6px',
    zIndex: 3,
    minWidth: '20px',
    height: '20px',
    padding: '0 5px',
    borderRadius: '10px',
    background: '#cc001c',
    color: '#fff',
    fontSize: '11px',
    fontWeight: 'bold' as const,
    display: 'flex',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    border: '2px solid #fffaf0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.35)',
  },
} as const;
