import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSavePokemon } from '../../db/hooks';
import { SPECIES } from '../../core/constants/species';
import { TYPES, SPECIES_TYPES } from '../../core/constants/types';
import { TypeBadge } from '../ui/TypeBadge';
import { StatBar } from '../ui/StatBar';
import type { PokemonRecord } from '../../db/schema';

const SPRITE_URL = (n: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${n}.png`;

const styles = {
  container: {
    padding: '12px',
    fontFamily: "'Courier New', monospace",
    minHeight: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: '12px',
  },
  backButton: {
    background: 'none',
    border: '1px solid #33ff3355',
    borderRadius: '4px',
    color: '#33ff33',
    fontSize: '12px',
    fontFamily: "'Courier New', monospace",
    cursor: 'pointer',
    padding: '6px 12px',
  },
  title: {
    fontSize: '14px',
    color: '#33ff33',
    letterSpacing: '1px',
  },
  emptyState: {
    textAlign: 'center' as const,
    color: '#22aa22',
    fontSize: '13px',
    marginTop: '40px',
  },
  card: {
    border: '1px solid #33ff3333',
    borderRadius: '6px',
    padding: '10px',
    marginBottom: '8px',
    background: 'rgba(0,0,0,0.2)',
    display: 'flex',
    gap: '10px',
  },
  spriteCol: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    flexShrink: 0,
    width: '64px',
  },
  sprite: {
    width: '56px',
    height: '56px',
    imageRendering: 'pixelated' as const,
  },
  slotNum: {
    fontSize: '10px',
    color: '#22aa2288',
    marginTop: '2px',
  },
  infoCol: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    display: 'flex',
    justifyContent: 'space-between' as const,
    alignItems: 'baseline' as const,
    marginBottom: '4px',
  },
  pokemonName: {
    fontSize: '14px',
    color: '#33ff33',
    fontWeight: 'bold' as const,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
    whiteSpace: 'nowrap' as const,
  },
  level: {
    fontSize: '12px',
    color: '#22aa22',
    flexShrink: 0,
    marginLeft: '8px',
  },
  typeRow: {
    display: 'flex',
    gap: '4px',
    marginBottom: '6px',
  },
  hpBarOuter: {
    height: '6px',
    background: 'rgba(0,0,0,0.4)',
    borderRadius: '3px',
    overflow: 'hidden' as const,
    marginBottom: '4px',
    border: '1px solid rgba(51,255,51,0.15)',
  },
  hpBarInner: (pct: number) => ({
    height: '100%',
    width: `${pct}%`,
    background: pct > 50 ? '#33ff33' : pct > 25 ? '#ffcc33' : '#ff4444',
    borderRadius: '3px',
    transition: 'width 0.3s',
  }),
  hpText: {
    fontSize: '10px',
    color: '#22aa22',
    marginBottom: '4px',
  },
  itemRow: {
    fontSize: '10px',
    color: '#22aa22',
    display: 'flex',
    gap: '4px',
    alignItems: 'center' as const,
  },
  shinyBadge: {
    fontSize: '10px',
    color: '#ffcc33',
    fontWeight: 'bold' as const,
  },
} as const;

function getTypesForSpecies(speciesIndex: number): string[] {
  const pair = SPECIES_TYPES[speciesIndex];
  if (!pair) return [];
  const result: string[] = [];
  if (pair[0] >= 0) result.push(TYPES[pair[0]]);
  if (pair[1] >= 0) result.push(TYPES[pair[1]]);
  return result;
}

function PartyCard({ mon, slotIndex }: { mon: PokemonRecord; slotIndex: number }) {
  const name = SPECIES[mon.species] || '???';
  const types = getTypesForSpecies(mon.species);

  // HP info - we use EVs as a rough proxy for display since actual current HP
  // is only available in party battle stats which aren't stored in PokemonRecord.
  // For display we show level and stats from EVs/IVs.
  const hasHpData = mon.evs.hp > 0 || mon.ivs.hp > 0;

  return (
    <div style={styles.card}>
      <div style={styles.spriteCol}>
        <img
          src={SPRITE_URL(mon.species)}
          alt={name}
          style={styles.sprite}
          loading="lazy"
          onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
        />
        <span style={styles.slotNum}>Slot {slotIndex + 1}</span>
      </div>

      <div style={styles.infoCol}>
        <div style={styles.nameRow}>
          <span style={styles.pokemonName}>
            {mon.nickname && mon.nickname !== name ? mon.nickname : name}
          </span>
          <span style={styles.level}>Lv.{mon.level}</span>
        </div>

        <div style={styles.typeRow}>
          {types.map(t => <TypeBadge key={t} type={t} />)}
          {mon.isShiny && <span style={styles.shinyBadge}>SHINY</span>}
        </div>

        {/* HP bar visualization using IV HP as max and EV HP as current */}
        {hasHpData && (
          <>
            <StatBar label="HP" value={mon.ivs.hp} max={31} color="#33ff33" />
            <StatBar label="ATK" value={mon.ivs.atk} max={31} color="#ff6633" />
            <StatBar label="DEF" value={mon.ivs.def} max={31} color="#3399ff" />
          </>
        )}

        {mon.heldItem > 0 && (
          <div style={styles.itemRow}>
            <span style={{ color: '#33ff3366' }}>ITEM:</span>
            <span>#{mon.heldItem}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function PartyViewScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pokemon, loading } = useSavePokemon(id ?? null);

  // Filter to party pokemon and sort by slot index
  const partyPokemon = useMemo(() => {
    return pokemon
      .filter(p => p.location === 'party')
      .sort((a, b) => a.slotIndex - b.slotIndex);
  }, [pokemon]);

  if (!id) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>No save ID provided.</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate('/saves')}>
          {'<'} BACK
        </button>
        <span style={styles.title}>PARTY ({partyPokemon.length}/6)</span>
      </div>

      {loading && (
        <div style={styles.emptyState}>Loading party data...</div>
      )}

      {!loading && partyPokemon.length === 0 && (
        <div style={styles.emptyState}>No party Pokemon found.</div>
      )}

      {partyPokemon.map((mon, i) => (
        <PartyCard key={mon.id} mon={mon} slotIndex={i} />
      ))}

      {/* Empty slots */}
      {!loading && partyPokemon.length > 0 && partyPokemon.length < 6 && (
        <>
          {Array.from({ length: 6 - partyPokemon.length }, (_, i) => (
            <div
              key={`empty-${i}`}
              style={{
                ...styles.card,
                opacity: 0.3,
                justifyContent: 'center',
                padding: '20px',
              }}
            >
              <span style={{ color: '#22aa2244', fontSize: '12px' }}>
                -- EMPTY SLOT --
              </span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
