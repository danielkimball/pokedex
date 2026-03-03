import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useSavePokemon } from '../../db/hooks';
import { SPECIES } from '../../core/constants/species';
import { TYPES, SPECIES_TYPES } from '../../core/constants/types';
import { TypeBadge } from '../ui/TypeBadge';
import type { PokemonRecord } from '../../db/schema';

const SPRITE_URL = (n: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${n}.png`;

const BOXES_TOTAL = 18;
const COLS = 6;
const ROWS = 5;
const SLOTS_PER_BOX = ROWS * COLS;

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
  boxNav: {
    display: 'flex',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: '12px',
    marginBottom: '12px',
  },
  navButton: {
    background: '#1a3a1a',
    border: '1px solid #33ff3355',
    borderRadius: '4px',
    color: '#33ff33',
    fontSize: '16px',
    fontFamily: "'Courier New', monospace",
    cursor: 'pointer',
    padding: '6px 12px',
    lineHeight: 1,
  },
  boxLabel: {
    fontSize: '14px',
    color: '#33ff33',
    minWidth: '80px',
    textAlign: 'center' as const,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: `repeat(${COLS}, 1fr)`,
    gap: '4px',
    marginBottom: '12px',
  },
  cell: (hasPokemon: boolean) => ({
    aspectRatio: '1' as const,
    background: hasPokemon ? 'rgba(51,255,51,0.06)' : 'rgba(0,0,0,0.2)',
    border: '1px solid rgba(51,255,51,0.15)',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    cursor: hasPokemon ? 'pointer' : 'default',
    transition: 'border-color 0.15s, background 0.15s',
  }),
  cellSprite: {
    width: '80%',
    height: '80%',
    objectFit: 'contain' as const,
    imageRendering: 'pixelated' as const,
  },
  emptySlot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'rgba(51,255,51,0.08)',
  },
  boxCount: {
    textAlign: 'center' as const,
    fontSize: '11px',
    color: '#22aa22',
    marginBottom: '8px',
  },
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.75)',
    display: 'flex',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    zIndex: 100,
  },
  popup: {
    background: '#1a2a1a',
    border: '2px solid #33ff33',
    borderRadius: '8px',
    padding: '16px',
    maxWidth: '280px',
    width: '90%',
    fontFamily: "'Courier New', monospace",
    textAlign: 'center' as const,
  },
  popupSprite: {
    width: '80px',
    height: '80px',
    imageRendering: 'pixelated' as const,
    marginBottom: '8px',
  },
  popupName: {
    fontSize: '16px',
    color: '#33ff33',
    fontWeight: 'bold' as const,
    marginBottom: '4px',
  },
  popupInfo: {
    fontSize: '11px',
    color: '#22aa22',
    marginBottom: '2px',
  },
  popupClose: {
    marginTop: '12px',
    background: '#1a3a1a',
    border: '1px solid #33ff3355',
    borderRadius: '4px',
    color: '#33ff33',
    fontSize: '12px',
    fontFamily: "'Courier New', monospace",
    cursor: 'pointer',
    padding: '6px 20px',
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

export function BoxViewScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentBox = Number(searchParams.get('box') ?? 0);
  const { pokemon, loading } = useSavePokemon(id ?? null);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonRecord | null>(null);

  // Organize pokemon into box slots
  const boxSlots = useMemo(() => {
    const slots: (PokemonRecord | null)[] = new Array(SLOTS_PER_BOX).fill(null);
    const boxPokemon = pokemon.filter(
      p => p.location === 'box' && p.containerIndex === currentBox,
    );
    for (const p of boxPokemon) {
      if (p.slotIndex >= 0 && p.slotIndex < SLOTS_PER_BOX) {
        slots[p.slotIndex] = p;
      }
    }
    return slots;
  }, [pokemon, currentBox]);

  const filledCount = boxSlots.filter(s => s !== null).length;

  const goToBox = (boxIndex: number) => {
    setSearchParams({ box: String(boxIndex) });
  };

  if (!id) {
    return (
      <div style={styles.container}>
        <div style={{ color: '#22aa22', textAlign: 'center', marginTop: '40px' }}>
          No save ID provided.
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate(`/saves`)}>
          {'<'} BACK
        </button>
        <span style={{ fontSize: '12px', color: '#22aa22' }}>
          {loading ? 'Loading...' : `${pokemon.length} total`}
        </span>
      </div>

      {/* Box navigation */}
      <div style={styles.boxNav}>
        <button
          style={styles.navButton}
          onClick={() => goToBox(Math.max(0, currentBox - 1))}
          disabled={currentBox <= 0}
        >
          {'<'}
        </button>
        <span style={styles.boxLabel}>BOX {currentBox + 1}</span>
        <button
          style={styles.navButton}
          onClick={() => goToBox(Math.min(BOXES_TOTAL - 1, currentBox + 1))}
          disabled={currentBox >= BOXES_TOTAL - 1}
        >
          {'>'}
        </button>
      </div>

      <div style={styles.boxCount}>
        {filledCount}/{SLOTS_PER_BOX} slots filled
      </div>

      {/* Grid */}
      <div style={styles.grid}>
        {boxSlots.map((slot, i) => (
          <div
            key={i}
            style={styles.cell(slot !== null)}
            onClick={() => { if (slot) setSelectedPokemon(slot); }}
            onMouseEnter={(e) => {
              if (slot) e.currentTarget.style.borderColor = '#33ff33';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(51,255,51,0.15)';
            }}
          >
            {slot ? (
              <img
                src={SPRITE_URL(slot.species)}
                alt={SPECIES[slot.species] || '?'}
                style={styles.cellSprite}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div style={styles.emptySlot} />
            )}
          </div>
        ))}
      </div>

      {/* Pokemon detail popup */}
      {selectedPokemon && (
        <div style={styles.overlay} onClick={() => setSelectedPokemon(null)}>
          <div style={styles.popup} onClick={(e) => e.stopPropagation()}>
            <img
              src={SPRITE_URL(selectedPokemon.species)}
              alt={SPECIES[selectedPokemon.species]}
              style={styles.popupSprite}
            />
            <div style={styles.popupName}>
              {selectedPokemon.nickname || SPECIES[selectedPokemon.species]}
            </div>
            <div style={styles.popupInfo}>
              #{String(selectedPokemon.species).padStart(3, '0')} {SPECIES[selectedPokemon.species]}
            </div>
            <div style={styles.popupInfo}>
              Lv. {selectedPokemon.level}
            </div>
            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', margin: '6px 0' }}>
              {getTypesForSpecies(selectedPokemon.species).map(t => (
                <TypeBadge key={t} type={t} />
              ))}
            </div>
            <div style={styles.popupInfo}>
              OT: {selectedPokemon.otName}
            </div>
            {selectedPokemon.isShiny && (
              <div style={{ ...styles.popupInfo, color: '#ffcc33' }}>
                SHINY
              </div>
            )}
            <div style={styles.popupInfo}>
              Box {currentBox + 1}, Slot {selectedPokemon.slotIndex + 1}
            </div>
            <button
              style={styles.popupClose}
              onClick={() => setSelectedPokemon(null)}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
