import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllHomePokemon, exportHomeToFile, importHomeFromFile } from '../../db/home-store';
import { useSaves } from '../../db/hooks';
import { transferFromHome } from '../../state/actions/transfer';
import { SPECIES } from '../../core/constants/species';
import { TYPES, SPECIES_TYPES } from '../../core/constants/types';
import { TypeBadge } from '../ui/TypeBadge';
import { StatusLED } from '../ui/StatusLED';
import { useGoogleDrive } from '../../hooks/useGoogleDrive';
import type { HomePokemonRecord } from '../../db/schema';

const SPRITE_URL = (n: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${n}.png`;

const styles = {
  container: {
    padding: '16px',
    fontFamily: "inherit",
    minHeight: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: '16px',
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
  title: {
    fontSize: '18px',
    color: '#4FC3F7',
    letterSpacing: '2px',
    textShadow: '0 0 8px rgba(79,195,247,0.4)',
  },
  subtitle: {
    fontSize: '11px',
    color: '#2E86C1',
    marginTop: '4px',
    marginBottom: '16px',
  },
  emptyState: {
    textAlign: 'center' as const,
    color: '#2E86C1',
    fontSize: '14px',
    marginTop: '40px',
  },
  sprite: {
    width: '48px',
    height: '48px',
    imageRendering: 'pixelated' as const,
    flexShrink: 0,
  },
  typeRow: {
    display: 'flex',
    gap: '4px',
    marginTop: '4px',
  },
  select: {
    marginLeft: '8px',
    padding: '4px 8px',
    background: '#0a1018',
    border: '1px solid #4FC3F755',
    borderRadius: '4px',
    color: '#4FC3F7',
    fontFamily: "inherit",
  },
  sectionLabel: {
    fontSize: '11px',
    color: '#2E86C1',
    marginBottom: '8px',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  },
  buttonRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  },
  buttonSecondary: {
    display: 'block',
    padding: '10px 14px',
    background: 'transparent',
    border: '1px solid #2E86C1',
    borderRadius: '4px',
    color: '#2E86C1',
    fontSize: '12px',
    fontFamily: "inherit",
    cursor: 'pointer',
  },
  sortRow: {
    display: 'flex',
    alignItems: 'center' as const,
    gap: '8px',
    marginBottom: '12px',
  },
  sortLabel: {
    fontSize: '11px',
    color: '#2E86C1',
  },
  legitNote: {
    fontSize: '10px',
    color: '#2E86C188',
    marginBottom: '12px',
    fontStyle: 'italic',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap: '8px',
  },
  gridCell: {
    aspectRatio: '1' as const,
    background: 'rgba(0,0,0,0.2)',
    border: '1px solid rgba(79,195,247,0.25)',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    cursor: 'pointer',
    padding: '4px',
    position: 'relative' as const,
  },
  gridSprite: {
    width: '56px',
    height: '56px',
    imageRendering: 'pixelated' as const,
    objectFit: 'contain' as const,
  },
  gridLabel: {
    fontSize: '9px',
    color: '#2E86C1',
    textAlign: 'center' as const,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
    whiteSpace: 'nowrap' as const,
    width: '100%',
  },
  gridBadge: {
    position: 'absolute' as const,
    top: '4px',
    right: '4px',
    minWidth: '18px',
    height: '18px',
    borderRadius: '50%',
    background: '#4FC3F7',
    color: '#0a1018',
    fontSize: '11px',
    fontWeight: 'bold' as const,
    display: 'flex',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  modalOverlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    zIndex: 1000,
    padding: '16px',
  },
  modal: {
    background: '#101822',
    border: '2px solid #4FC3F7',
    borderRadius: '12px',
    padding: '20px',
    maxWidth: '320px',
    width: '100%',
    fontFamily: "inherit",
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: '16px',
  },
  modalTitle: {
    fontSize: '16px',
    color: '#4FC3F7',
    fontWeight: 'bold' as const,
  },
  modalClose: {
    background: 'none',
    border: '1px solid #4FC3F755',
    borderRadius: '4px',
    color: '#4FC3F7',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '4px 10px',
  },
  modalSprite: {
    width: '96px',
    height: '96px',
    imageRendering: 'pixelated' as const,
    display: 'block',
    margin: '0 auto 12px',
  },
  modalRow: {
    fontSize: '12px',
    color: '#2E86C1',
    marginBottom: '6px',
  },
  modalTransferSection: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid rgba(79,195,247,0.2)',
  },
  modalSelect: {
    width: '100%',
    padding: '8px',
    marginBottom: '10px',
    background: '#0a1018',
    border: '1px solid #4FC3F755',
    borderRadius: '4px',
    color: '#4FC3F7',
    fontFamily: "inherit",
    fontSize: '12px',
  },
  modalTransferBtn: {
    width: '100%',
    padding: '12px',
    background: '#101833',
    border: '1px solid #4FC3F7',
    borderRadius: '6px',
    color: '#4FC3F7',
    fontSize: '14px',
    fontFamily: "inherit",
    cursor: 'pointer',
  },
} as const;

export type HomeSortOption = 'pokedex' | 'name' | 'level' | 'deposited';

function getTypesForSpecies(speciesIndex: number): string[] {
  const pair = SPECIES_TYPES[speciesIndex];
  if (!pair) return [];
  const result: string[] = [];
  if (pair[0] >= 0) result.push(TYPES[pair[0]]);
  if (pair[1] >= 0) result.push(TYPES[pair[1]]);
  return result;
}

/** Group by species; group order follows sortBy (default Pokedex #). Within group: newest deposited first. */
function groupBySpecies(list: HomePokemonRecord[], sortBy: HomeSortOption): { species: number; mons: HomePokemonRecord[] }[] {
  const bySpecies = new Map<number, HomePokemonRecord[]>();
  for (const mon of list) {
    const arr = bySpecies.get(mon.species) ?? [];
    arr.push(mon);
    bySpecies.set(mon.species, arr);
  }
  let speciesIds = [...bySpecies.keys()];
  if (sortBy === 'pokedex') {
    speciesIds.sort((a, b) => a - b);
  } else if (sortBy === 'name') {
    speciesIds.sort((a, b) => (SPECIES[a] ?? '').localeCompare(SPECIES[b] ?? ''));
  } else if (sortBy === 'level') {
    speciesIds.sort((a, b) => {
      const maxA = Math.max(...(bySpecies.get(a) ?? []).map(m => m.level));
      const maxB = Math.max(...(bySpecies.get(b) ?? []).map(m => m.level));
      return maxB - maxA;
    });
  } else {
    speciesIds.sort((a, b) => {
      const maxA = Math.max(...(bySpecies.get(a) ?? []).map(m => m.depositedAt));
      const maxB = Math.max(...(bySpecies.get(b) ?? []).map(m => m.depositedAt));
      return maxB - maxA;
    });
  }
  return speciesIds.map(species => ({
    species,
    mons: (bySpecies.get(species) ?? []).sort((a, b) => b.depositedAt - a.depositedAt),
  }));
}

export function PokemonHomeScreen() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [homePokemon, setHomePokemon] = useState<HomePokemonRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [transferringId, setTransferringId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [sortBy, setSortBy] = useState<HomeSortOption>('pokedex');
  const { saves } = useSaves();
  const drive = useGoogleDrive();
  const [showDriveSetup, setShowDriveSetup] = useState(false);
  const [clientIdInput, setClientIdInput] = useState('');

  const grouped = useMemo(() => groupBySpecies(homePokemon, sortBy), [homePokemon, sortBy]);
  const gridList = useMemo(() => grouped.flatMap(g => g.mons), [grouped]);
  const countBySpecies = useMemo(() => {
    const m = new Map<number, number>();
    for (const mon of homePokemon) {
      m.set(mon.species, (m.get(mon.species) ?? 0) + 1);
    }
    return m;
  }, [homePokemon]);

  const [selectedMon, setSelectedMon] = useState<HomePokemonRecord | null>(null);
  const [selectedSaveId, setSelectedSaveId] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    const list = await getAllHomePokemon();
    setHomePokemon(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleTransfer = async (homeId: string, saveId: string) => {
    setTransferringId(homeId);
    try {
      await transferFromHome(homeId, saveId);
      setSelectedMon(null);
      setSelectedSaveId('');
      await refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Transfer failed');
    } finally {
      setTransferringId(null);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const { blob, filename } = await exportHomeToFile();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const buffer = await file.arrayBuffer();
      const count = await importHomeFromFile(buffer);
      await refresh();
      alert(`Imported ${count} Pokemon into Home.`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Import failed. Not a valid Home file?');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate('/')}>
          {'<'} BACK
        </button>
        <span style={styles.title}>POKEMON HOME</span>
      </div>
      <div style={styles.subtitle}>
        Withdraw Pokemon into a save file. Works across all supported games (Gen 4: DP, Pt, HGSS).
      </div>
      <div style={styles.legitNote}>
        Legit-friendly: PID, IVs, EVs, and OT are never changed — only moved between saves.
      </div>

      <div style={styles.sectionLabel}>Storage file — save to Google Drive or anywhere</div>
      <div style={styles.buttonRow}>
        <button
          style={styles.buttonSecondary}
          onClick={handleExport}
          disabled={exporting || loading}
        >
          {exporting ? 'Exporting...' : 'EXPORT HOME (.phome)'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".phome,.json"
          onChange={handleImport}
          style={{ display: 'none' }}
        />
        <button
          style={styles.buttonSecondary}
          onClick={() => fileInputRef.current?.click()}
          disabled={importing || loading}
        >
          {importing ? 'Importing...' : 'IMPORT HOME'}
        </button>
      </div>
      <div style={{ fontSize: '10px', color: '#2E86C188', marginBottom: '12px' }}>
        Export downloads a single file with all Home Pokemon. Save it anywhere (Google Drive, USB, etc.) and use Import to restore on this or another device.
      </div>

      {/* Google Drive Sync Section */}
      <div style={{ marginBottom: '16px', border: '1px solid #4FC3F755', borderRadius: '8px', padding: '12px' }}>
        {!drive.clientId ? (
          <>
            <button
              style={{
                background: 'none',
                border: 'none',
                color: '#4FC3F7',
                fontSize: '12px',
                fontFamily: 'inherit',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onClick={() => setShowDriveSetup(!showDriveSetup)}
            >
              {showDriveSetup ? '\u25BC' : '\u25B6'} Connect to Google Drive
            </button>
            {showDriveSetup && (
              <div style={{ marginTop: '10px' }}>
                <div style={{ fontSize: '10px', color: '#2E86C1', marginBottom: '8px' }}>
                  Create a Google Cloud project, enable the Drive API, and create an OAuth2 Client ID.
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Paste Google OAuth Client ID"
                    value={clientIdInput}
                    onChange={(e) => setClientIdInput(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: '#0a1018',
                      border: '1px solid #4FC3F755',
                      borderRadius: '4px',
                      color: '#4FC3F7',
                      fontFamily: 'inherit',
                      fontSize: '11px',
                    }}
                  />
                  <button
                    style={{
                      padding: '8px 14px',
                      background: '#101833',
                      border: '1px solid #4FC3F7',
                      borderRadius: '4px',
                      color: '#4FC3F7',
                      fontSize: '12px',
                      fontFamily: 'inherit',
                      cursor: 'pointer',
                    }}
                    disabled={!clientIdInput.trim()}
                    onClick={() => {
                      drive.setClientId(clientIdInput.trim());
                      setClientIdInput('');
                      setShowDriveSetup(false);
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </>
        ) : !drive.connected ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <StatusLED color="yellow" />
                <span style={{ fontSize: '12px', color: '#2E86C1' }}>Google Drive configured</span>
              </div>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2E86C188',
                  fontSize: '10px',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
                onClick={drive.removeClientId}
              >
                Remove
              </button>
            </div>
            <button
              style={{
                width: '100%',
                padding: '10px',
                background: '#101833',
                border: '1px solid #4FC3F7',
                borderRadius: '6px',
                color: '#4FC3F7',
                fontSize: '13px',
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
              disabled={drive.syncing}
              onClick={drive.connect}
            >
              {drive.syncing ? 'Connecting...' : 'Connect to Google Drive'}
            </button>
            {drive.error && (
              <div style={{ fontSize: '10px', color: '#e74c3c', marginTop: '6px' }}>{drive.error}</div>
            )}
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <StatusLED color="green" pulse />
                <span style={{ fontSize: '12px', color: '#4FC3F7' }}>Connected to Google Drive</span>
              </div>
              <button
                style={{
                  background: 'none',
                  border: '1px solid #2E86C155',
                  borderRadius: '4px',
                  color: '#2E86C1',
                  fontSize: '10px',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  padding: '4px 8px',
                }}
                onClick={drive.disconnect}
              >
                Disconnect
              </button>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <button
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#101833',
                  border: '1px solid #4FC3F7',
                  borderRadius: '6px',
                  color: '#4FC3F7',
                  fontSize: '12px',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
                disabled={drive.syncing}
                onClick={async () => {
                  await drive.pullFromDrive();
                  await refresh();
                }}
              >
                {drive.syncing ? 'Syncing...' : 'Pull from Drive'}
              </button>
              <button
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#101833',
                  border: '1px solid #4FC3F7',
                  borderRadius: '6px',
                  color: '#4FC3F7',
                  fontSize: '12px',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
                disabled={drive.syncing}
                onClick={drive.pushToDrive}
              >
                {drive.syncing ? 'Syncing...' : 'Push to Drive'}
              </button>
            </div>
            {drive.lastSyncTime && (
              <div style={{ fontSize: '10px', color: '#2E86C188' }}>
                Last sync: {new Date(drive.lastSyncTime).toLocaleTimeString()}
              </div>
            )}
            {drive.error && (
              <div style={{ fontSize: '10px', color: '#e74c3c', marginTop: '4px' }}>{drive.error}</div>
            )}
          </div>
        )}
      </div>

      {loading && (
        <div style={styles.emptyState}>Loading...</div>
      )}

      {!loading && homePokemon.length === 0 && (
        <div style={styles.emptyState}>
          No Pokemon in Home. Transfer from Party or Box (Manage Saves → open a save → Send to Home).
        </div>
      )}

      {!loading && homePokemon.length > 0 && (
        <>
          <div style={styles.sortRow}>
            <span style={styles.sortLabel}>Sort:</span>
            <select
              style={styles.select}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as HomeSortOption)}
            >
              <option value="pokedex">Pokedex #</option>
              <option value="name">Name</option>
              <option value="level">Level</option>
              <option value="deposited">Date deposited</option>
            </select>
          </div>
          <div style={styles.grid}>
            {gridList.map((mon) => {
              const name = SPECIES[mon.species] || '???';
              const count = countBySpecies.get(mon.species) ?? 0;
              return (
                <button
                  key={mon.id}
                  type="button"
                  style={styles.gridCell}
                  onClick={() => setSelectedMon(mon)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#4FC3F7';
                    e.currentTarget.style.background = 'rgba(79,195,247,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(79,195,247,0.25)';
                    e.currentTarget.style.background = 'rgba(0,0,0,0.2)';
                  }}
                >
                  {count > 1 && <span style={styles.gridBadge}>{count}</span>}
                  <img
                    src={SPRITE_URL(mon.species)}
                    alt={name}
                    style={styles.gridSprite}
                    loading="lazy"
                    onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                  />
                  <span style={styles.gridLabel}>
                    #{String(mon.species).padStart(3, '0')} {mon.nickname && mon.nickname !== name ? mon.nickname : name}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedMon && (
            <div
              style={styles.modalOverlay}
              onClick={() => !transferringId && setSelectedMon(null)}
            >
              <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                  <span style={styles.modalTitle}>
                    #{String(selectedMon.species).padStart(3, '0')} {SPECIES[selectedMon.species] ?? '???'}
                  </span>
                  <button
                    style={styles.modalClose}
                    onClick={() => !transferringId && setSelectedMon(null)}
                    disabled={!!transferringId}
                  >
                    ✕
                  </button>
                </div>
                <img
                  src={SPRITE_URL(selectedMon.species)}
                  alt={SPECIES[selectedMon.species]}
                  style={styles.modalSprite}
                  onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                />
                <div style={styles.modalRow}>
                  {selectedMon.nickname && selectedMon.nickname !== (SPECIES[selectedMon.species] ?? '') && (
                    <div>Nickname: {selectedMon.nickname}</div>
                  )}
                  <div>Level {selectedMon.level}</div>
                  <div>OT: {selectedMon.otName}</div>
                  <div>From {selectedMon.sourceGameVersion}</div>
                  <div>Deposited {new Date(selectedMon.depositedAt).toLocaleDateString()}</div>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                    {getTypesForSpecies(selectedMon.species).map(t => (
                      <TypeBadge key={t} type={t} />
                    ))}
                    {selectedMon.isShiny && <span style={{ fontSize: '11px', color: '#ffcc33' }}>SHINY</span>}
                  </div>
                </div>
                <div style={styles.modalTransferSection}>
                  <label style={{ fontSize: '11px', color: '#2E86C1', display: 'block', marginBottom: '4px' }}>
                    Transfer to save:
                  </label>
                  <select
                    style={styles.modalSelect}
                    value={selectedSaveId}
                    onChange={(e) => setSelectedSaveId(e.target.value)}
                    disabled={saves.length === 0 || !!transferringId}
                  >
                    <option value="">Select save file</option>
                    {saves.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.trainerName} ({s.gameVersion})
                      </option>
                    ))}
                  </select>
                  <button
                    style={{
                      ...styles.modalTransferBtn,
                      ...(transferringId === selectedMon.id || !selectedSaveId ? { opacity: 0.6, cursor: 'not-allowed' } : {}),
                    }}
                    disabled={!selectedSaveId || transferringId === selectedMon.id}
                    onClick={() => {
                      if (selectedSaveId) handleTransfer(selectedMon.id, selectedSaveId);
                    }}
                  >
                    {transferringId === selectedMon.id ? 'Transferring...' : 'Transfer'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
