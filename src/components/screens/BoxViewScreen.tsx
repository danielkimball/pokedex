import { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useSavePokemon } from '../../db/hooks';
import { SPECIES } from '../../core/constants/species';
import { TYPES, SPECIES_TYPES } from '../../core/constants/types';
import { TypeBadge } from '../ui/TypeBadge';
import { transferToHome } from '../../state/actions/transfer';
import { reorganizeBoxes, type BoxSortCriteria } from '../../state/actions/reorganize-boxes';
import { writeBackToLinkedFile, supportsWriteback } from '../../state/actions/save-to-file';
import { monSpriteUrl, defaultSpriteUrl } from '../../core/constants/games';
import type { PokemonRecord } from '../../db/schema';

const BOXES_TOTAL = 18;
const COLS = 6;
const ROWS = 5;
const SLOTS_PER_BOX = ROWS * COLS;

const styles = {
  container: {
    padding: '12px',
    fontFamily: "inherit",
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
    border: '1px solid #4FC3F755',
    borderRadius: '4px',
    color: '#4FC3F7',
    fontSize: '12px',
    fontFamily: "inherit",
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
    background: '#101833',
    border: '1px solid #4FC3F755',
    borderRadius: '4px',
    color: '#4FC3F7',
    fontSize: '16px',
    fontFamily: "inherit",
    cursor: 'pointer',
    padding: '6px 12px',
    lineHeight: 1,
  },
  boxLabel: {
    fontSize: '14px',
    color: '#4FC3F7',
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
    background: hasPokemon ? 'rgba(79,195,247,0.06)' : 'rgba(0,0,0,0.2)',
    border: '1px solid rgba(79,195,247,0.15)',
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
    background: 'rgba(79,195,247,0.08)',
  },
  boxCount: {
    textAlign: 'center' as const,
    fontSize: '11px',
    color: '#2E86C1',
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
    background: '#101822',
    border: '2px solid #4FC3F7',
    borderRadius: '8px',
    padding: '16px',
    maxWidth: '280px',
    width: '90%',
    fontFamily: "inherit",
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
    color: '#4FC3F7',
    fontWeight: 'bold' as const,
    marginBottom: '4px',
  },
  popupInfo: {
    fontSize: '11px',
    color: '#2E86C1',
    marginBottom: '2px',
  },
  popupClose: {
    marginTop: '12px',
    background: '#101833',
    border: '1px solid #4FC3F755',
    borderRadius: '4px',
    color: '#4FC3F7',
    fontSize: '12px',
    fontFamily: "inherit",
    cursor: 'pointer',
    padding: '6px 20px',
  },
  popupToHome: {
    marginTop: '8px',
    background: '#101833',
    border: '1px solid #2E86C1',
    borderRadius: '4px',
    color: '#2E86C1',
    fontSize: '11px',
    fontFamily: "inherit",
    cursor: 'pointer',
    padding: '6px 16px',
  },
  sortSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    gap: '4px',
    marginBottom: '10px',
  },
  sortRow: {
    display: 'flex',
    alignItems: 'center' as const,
    gap: '6px',
  },
  sortLabel: {
    fontSize: '10px',
    color: '#2E86C1',
    fontFamily: "inherit",
  },
  sortChip: {
    padding: '2px 8px',
    border: '1px solid #4FC3F733',
    borderRadius: '10px',
    background: 'transparent',
    color: '#2E86C1',
    fontSize: '10px',
    fontFamily: "inherit",
    cursor: 'pointer',
  },
  sortChipDisabled: {
    padding: '2px 8px',
    border: '1px solid #4FC3F733',
    borderRadius: '10px',
    background: 'transparent',
    color: '#2E86C155',
    fontSize: '10px',
    fontFamily: "inherit",
    cursor: 'not-allowed',
  },
  sortHint: {
    fontSize: '9px',
    color: '#2E86C1',
    opacity: 0.6,
    fontFamily: "inherit",
  },
  saveBar: {
    display: 'flex',
    justifyContent: 'center' as const,
    gap: '8px',
    marginBottom: '10px',
  },
  saveButton: {
    padding: '8px 16px',
    background: '#101833',
    border: '1px solid #4FC3F7',
    borderRadius: '4px',
    color: '#4FC3F7',
    fontSize: '12px',
    fontFamily: "inherit",
    cursor: 'pointer',
  },
  saveButtonDisabled: {
    padding: '8px 16px',
    background: '#101833',
    border: '1px solid #4FC3F733',
    borderRadius: '4px',
    color: '#4FC3F755',
    fontSize: '12px',
    fontFamily: "inherit",
    cursor: 'not-allowed',
  },
  saveStatus: {
    fontSize: '10px',
    color: '#81D4FA',
    textAlign: 'center' as const,
    marginBottom: '8px',
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
  const { pokemon, loading, refresh } = useSavePokemon(id ?? null);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonRecord | null>(null);
  const [sendingToHomeId, setSendingToHomeId] = useState<string | null>(null);
  const [sorting, setSorting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleSaveToFile = async () => {
    if (!id || saving) return;
    setSaving(true);
    setSaveStatus(null);
    try {
      const result = await writeBackToLinkedFile(id);
      if (result === 'written') {
        setSaveStatus('Saved to Delta file!');
      } else if (result === 'downloaded') {
        setSaveStatus('Downloaded save file');
      } else {
        setSaveStatus('No save data found');
      }
    } catch (e) {
      setSaveStatus(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleSort = async (criteria: BoxSortCriteria) => {
    if (!id || sorting) return;
    setSorting(true);
    try {
      await reorganizeBoxes(id, criteria);
      await refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Sort failed');
    } finally {
      setSorting(false);
    }
  };

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
        <div style={{ color: '#2E86C1', textAlign: 'center', marginTop: '40px' }}>
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
        <span style={{ fontSize: '12px', color: '#2E86C1' }}>
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

      {/* Sort controls */}
      <div style={styles.sortSection}>
        <div style={styles.sortRow}>
          <span style={styles.sortLabel}>Sort:</span>
          <button
            style={sorting ? styles.sortChipDisabled : styles.sortChip}
            disabled={sorting}
            onClick={() => handleSort('number')}
          >
            #
          </button>
          <button
            style={sorting ? styles.sortChipDisabled : styles.sortChip}
            disabled={sorting}
            onClick={() => handleSort('name')}
          >
            A-Z
          </button>
          <button
            style={sorting ? styles.sortChipDisabled : styles.sortChip}
            disabled={sorting}
            onClick={() => handleSort('level')}
          >
            Lv
          </button>
          {sorting && (
            <span style={styles.sortLabel}>Sorting...</span>
          )}
        </div>
        <span style={styles.sortHint}>Reorganizes all boxes</span>
      </div>

      {/* Save to Delta */}
      <div style={styles.saveBar}>
        <button
          style={saving ? styles.saveButtonDisabled : styles.saveButton}
          disabled={saving}
          onClick={handleSaveToFile}
        >
          {saving ? 'SAVING...' : supportsWriteback() ? 'SAVE TO DELTA' : 'DOWNLOAD .SAV'}
        </button>
      </div>
      {saveStatus && (
        <div style={styles.saveStatus}>{saveStatus}</div>
      )}

      {/* Grid */}
      <div style={styles.grid}>
        {boxSlots.map((slot, i) => (
          <div
            key={i}
            style={styles.cell(slot !== null)}
            onClick={() => { if (slot) setSelectedPokemon(slot); }}
            onMouseEnter={(e) => {
              if (slot) e.currentTarget.style.borderColor = '#4FC3F7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(79,195,247,0.15)';
            }}
          >
            {slot ? (
              <img
                src={monSpriteUrl(slot)}
                alt={SPECIES[slot.species] || '?'}
                style={styles.cellSprite}
                loading="lazy"
                onError={(e) => {
                  const d = defaultSpriteUrl(slot.species);
                  if (e.currentTarget.src !== d) e.currentTarget.src = d;
                  else e.currentTarget.style.display = 'none';
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
              src={monSpriteUrl(selectedPokemon)}
              alt={SPECIES[selectedPokemon.species]}
              style={styles.popupSprite}
              onError={(e) => {
                const d = defaultSpriteUrl(selectedPokemon.species);
                if (e.currentTarget.src !== d) e.currentTarget.src = d;
              }}
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
            {id && (
              <button
                style={styles.popupToHome}
                disabled={sendingToHomeId === selectedPokemon.id}
                onClick={async () => {
                  setSendingToHomeId(selectedPokemon.id);
                  try {
                    await transferToHome(id, selectedPokemon.id);
                    await refresh();
                    setSelectedPokemon(null);
                  } catch (e) {
                    alert(e instanceof Error ? e.message : 'Transfer failed');
                  } finally {
                    setSendingToHomeId(null);
                  }
                }}
              >
                {sendingToHomeId === selectedPokemon.id ? '...' : 'SEND TO HOME'}
              </button>
            )}
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
