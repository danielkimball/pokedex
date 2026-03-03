import { useRef, useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../state/store';
import { importSaveFile, importSaveBuffer } from '../../state/actions/import-save';
import { StatusLED } from '../ui/StatusLED';
import { useDirectorySync, type SyncResult } from '../../hooks/useDirectorySync';
import {
  saveFileHandle,
  getFileRecord,
  clearFileHandle,
  type FileRecord,
} from '../../db/directory-store';

const styles = {
  container: {
    padding: '16px',
    fontFamily: "'Courier New', monospace",
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
    minHeight: '100%',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold' as const,
    color: '#33ff33',
    textAlign: 'center' as const,
    textShadow: '0 0 10px rgba(51,255,51,0.5)',
    letterSpacing: '4px',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '11px',
    color: '#22aa22',
    textAlign: 'center' as const,
    marginTop: '-12px',
  },
  progressSection: {
    padding: '12px',
    border: '1px solid #33ff3333',
    borderRadius: '4px',
    background: 'rgba(0,0,0,0.2)',
  },
  progressLabel: {
    fontSize: '12px',
    color: '#22aa22',
    marginBottom: '6px',
  },
  progressBarOuter: {
    width: '100%',
    height: '12px',
    background: 'rgba(0,0,0,0.4)',
    borderRadius: '6px',
    overflow: 'hidden' as const,
    border: '1px solid rgba(51,255,51,0.2)',
  },
  progressBarInner: (pct: number) => ({
    width: `${pct}%`,
    height: '100%',
    background: 'linear-gradient(90deg, #22aa22, #33ff33)',
    borderRadius: '6px',
    transition: 'width 0.5s ease',
    boxShadow: '0 0 6px rgba(51,255,51,0.4)',
  }),
  progressText: {
    fontSize: '14px',
    color: '#33ff33',
    textAlign: 'center' as const,
    marginTop: '6px',
  },
  button: {
    display: 'block',
    width: '100%',
    padding: '12px 16px',
    background: '#1a3a1a',
    border: '1px solid #33ff33',
    borderRadius: '4px',
    color: '#33ff33',
    fontSize: '14px',
    fontFamily: "'Courier New', monospace",
    cursor: 'pointer',
    textAlign: 'center' as const,
    transition: 'background 0.2s, box-shadow 0.2s',
  },
  buttonHover: {
    background: '#2a4a2a',
    boxShadow: '0 0 8px rgba(51,255,51,0.3)',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between' as const,
    fontSize: '11px',
    color: '#22aa22',
    padding: '4px 0',
    borderBottom: '1px solid rgba(51,255,51,0.1)',
  },
  error: {
    color: '#ff4444',
    fontSize: '12px',
    padding: '8px',
    border: '1px solid #ff444433',
    borderRadius: '4px',
    background: 'rgba(255,0,0,0.1)',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center' as const,
    gap: '8px',
    fontSize: '11px',
    color: '#22aa22',
  },
} as const;

export function HomeScreen() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const caughtCount = useAppStore(s => s.caughtCount);
  const importing = useAppStore(s => s.importing);
  const importError = useAppStore(s => s.importError);
  const saves = useAppStore(s => s.saves);
  const lastDiffResult = useAppStore(s => s.lastDiffResult);

  const {
    isSupported: syncSupported,
    connectedDirectory,
    syncing,
    lastSyncTime,
    pickDirectory,
    syncNow,
    disconnectDirectory,
  } = useDirectorySync();

  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);

  // ── Delta save file ──────────────────────────────────────────────────────
  // Chrome/Edge: store a FileSystemFileHandle so we can re-read without picking each time.
  // iOS/Safari:  file handle API unavailable, so fall back to a dedicated <input type="file">
  //              and remember the filename in localStorage as a hint for next time.

  const deltaInputRef = useRef<HTMLInputElement>(null);
  const [linkedFileRecord, setLinkedFileRecord] = useState<FileRecord | null>(null);
  const [deltaFilename, setDeltaFilename] = useState<string>(
    () => localStorage.getItem('pokedex-delta-filename') || ''
  );
  const [fileRefreshing, setFileRefreshing] = useState(false);

  const canUseFileHandle = typeof window !== 'undefined' && 'showOpenFilePicker' in window;

  useEffect(() => {
    // Only try to load stored handle on browsers that support it
    if (canUseFileHandle) {
      getFileRecord().then(record => setLinkedFileRecord(record));
    }
  }, [canUseFileHandle]);

  // iOS path: user picks via <input>, we remember the filename
  const handleDeltaInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    localStorage.setItem('pokedex-delta-filename', file.name);
    setDeltaFilename(file.name);
    try {
      const diff = await importSaveFile(file);
      if (diff) navigate('/diff');
    } catch { /* error already in store */ }
    if (deltaInputRef.current) deltaInputRef.current.value = '';
  }, [navigate]);

  // Chrome path: pick and store a persistent file handle
  const handleLinkDeltaFile = useCallback(async () => {
    try {
      const [handle] = await (window as any).showOpenFilePicker({
        types: [{ description: 'Delta Save Files', accept: { 'application/octet-stream': ['.sav', '.dsv'] } }],
        multiple: false,
      });
      await saveFileHandle(handle);
      const record: FileRecord = { id: 'watched-file', handle, lastScanTime: Date.now() };
      setLinkedFileRecord(record);
      const file = await handle.getFile();
      const buffer = await file.arrayBuffer();
      const diff = await importSaveBuffer(buffer, file.name);
      if (diff) navigate('/diff');
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
    }
  }, [navigate]);

  // Chrome path: re-read without picking
  const handleRefreshDeltaFile = useCallback(async () => {
    if (!linkedFileRecord) return;
    setFileRefreshing(true);
    try {
      const perm = await linkedFileRecord.handle.requestPermission({ mode: 'read' });
      if (perm !== 'granted') {
        await clearFileHandle();
        setLinkedFileRecord(null);
        return;
      }
      const file = await linkedFileRecord.handle.getFile();
      const buffer = await file.arrayBuffer();
      const diff = await importSaveBuffer(buffer, file.name);
      if (diff) navigate('/diff');
    } finally {
      setFileRefreshing(false);
    }
  }, [linkedFileRecord, navigate]);

  const handleUnlinkDeltaFile = useCallback(async () => {
    await clearFileHandle();
    setLinkedFileRecord(null);
    localStorage.removeItem('pokedex-delta-filename');
    setDeltaFilename('');
  }, []);

  const totalDex = 493;
  const progressPct = (caughtCount / totalDex) * 100;

  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const diff = await importSaveFile(file);
      if (diff) {
        navigate('/diff');
      }
    } catch {
      // Error is already set in store
    }

    // Reset file input so the same file can be re-imported
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [navigate]);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleLinkFolder = useCallback(async () => {
    const linked = await pickDirectory();
    if (linked) {
      const result = await syncNow();
      setSyncResult(result);
    }
  }, [pickDirectory, syncNow]);

  const handleSyncNow = useCallback(async () => {
    const result = await syncNow();
    setSyncResult(result);
  }, [syncNow]);

  const handleDisconnect = useCallback(async () => {
    await disconnectDirectory();
    setSyncResult(null);
  }, [disconnectDirectory]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>POKEDEX</h1>
      <p style={styles.subtitle}>National Dex Tracker - Gen IV</p>

      {/* Status indicator */}
      <div style={styles.statusRow}>
        <StatusLED color={importing ? 'yellow' : saves.length > 0 ? 'green' : 'red'} pulse={importing} />
        <span>
          {importing
            ? 'Importing save file...'
            : saves.length > 0
              ? `${saves.length} save${saves.length !== 1 ? 's' : ''} loaded`
              : 'No saves imported'}
        </span>
      </div>

      {/* Dex progress */}
      <div style={styles.progressSection}>
        <div style={styles.progressLabel}>DEX COMPLETION</div>
        <div style={styles.progressBarOuter}>
          <div style={styles.progressBarInner(progressPct)} />
        </div>
        <div style={styles.progressText}>
          {caughtCount} / {totalDex} caught ({progressPct.toFixed(1)}%)
        </div>
      </div>

      {/* Import button */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".sav,.dsv"
        onChange={handleImport}
        style={{ display: 'none' }}
      />
      <button
        style={styles.button}
        onClick={handleImportClick}
        disabled={importing}
        onMouseEnter={(e) => {
          Object.assign(e.currentTarget.style, styles.buttonHover);
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = styles.button.background;
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {importing ? '[ IMPORTING... ]' : '[ IMPORT .SAV FILE ]'}
      </button>

      {/* Delta save file — two paths depending on browser */}
      {/* Hidden input for iOS/Safari file-pick flow */}
      <input
        ref={deltaInputRef}
        type="file"
        accept=".sav,.dsv"
        onChange={handleDeltaInputChange}
        style={{ display: 'none' }}
      />

      {canUseFileHandle ? (
        /* ── Chrome/Edge: persistent file handle, no re-picking needed ── */
        linkedFileRecord ? (
          <div style={styles.progressSection}>
            <div style={styles.progressLabel}>DELTA SAVE</div>
            <div style={{ ...styles.statusRow, marginBottom: '8px' }}>
              <StatusLED color={fileRefreshing ? 'yellow' : 'green'} pulse={fileRefreshing} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                {linkedFileRecord.handle.name}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                style={{ ...styles.button, flex: 1, padding: '10px', fontSize: '14px', fontWeight: 'bold' as const }}
                onClick={handleRefreshDeltaFile}
                disabled={fileRefreshing || importing}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.buttonHover)}
                onMouseLeave={(e) => { e.currentTarget.style.background = styles.button.background; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {fileRefreshing ? '[ REFRESHING... ]' : '[ ↺ REFRESH ]'}
              </button>
              <button
                style={{ ...styles.button, flex: 0, padding: '10px 14px', fontSize: '13px', borderColor: '#884444', color: '#ff6666' }}
                onClick={handleUnlinkDeltaFile}
                disabled={fileRefreshing}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#3a1a1a'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = styles.button.background; }}
              >
                X
              </button>
            </div>
          </div>
        ) : (
          <button
            style={styles.button}
            onClick={handleLinkDeltaFile}
            disabled={importing}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.buttonHover)}
            onMouseLeave={(e) => { e.currentTarget.style.background = styles.button.background; e.currentTarget.style.boxShadow = 'none'; }}
          >
            [ LINK DELTA SAVE FILE ]
          </button>
        )
      ) : (
        /* ── iOS/Safari: file input each time, filename remembered as hint ── */
        deltaFilename ? (
          <div style={styles.progressSection}>
            <div style={styles.progressLabel}>DELTA SAVE</div>
            <div style={{ fontSize: '11px', color: '#22aa22', marginBottom: '8px' }}>
              Look for: <span style={{ color: '#33ff33' }}>{deltaFilename}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                style={{ ...styles.button, flex: 1, padding: '10px', fontSize: '14px', fontWeight: 'bold' as const }}
                onClick={() => deltaInputRef.current?.click()}
                disabled={importing}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.buttonHover)}
                onMouseLeave={(e) => { e.currentTarget.style.background = styles.button.background; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {importing ? '[ IMPORTING... ]' : '[ ↺ REFRESH ]'}
              </button>
              <button
                style={{ ...styles.button, flex: 0, padding: '10px 14px', fontSize: '13px', borderColor: '#884444', color: '#ff6666' }}
                onClick={handleUnlinkDeltaFile}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#3a1a1a'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = styles.button.background; }}
              >
                X
              </button>
            </div>
          </div>
        ) : (
          <button
            style={styles.button}
            onClick={() => deltaInputRef.current?.click()}
            disabled={importing}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.buttonHover)}
            onMouseLeave={(e) => { e.currentTarget.style.background = styles.button.background; e.currentTarget.style.boxShadow = 'none'; }}
          >
            [ LINK DELTA SAVE FILE ]
          </button>
        )
      )}

      {/* Directory sync controls (Chrome/Edge only) */}
      {syncSupported && (
        connectedDirectory ? (
          <div style={styles.progressSection}>
            <div style={styles.progressLabel}>LINKED FOLDER</div>
            <div style={{ ...styles.statusRow, marginBottom: '8px' }}>
              <StatusLED color={syncing ? 'yellow' : 'green'} pulse={syncing} />
              <span style={{ flex: 1 }}>{connectedDirectory}</span>
            </div>
            {lastSyncTime && (
              <div style={{ fontSize: '10px', color: '#22aa22', marginBottom: '8px' }}>
                Last sync: {new Date(lastSyncTime).toLocaleString()}
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                style={{ ...styles.button, flex: 1, padding: '8px', fontSize: '12px' }}
                onClick={handleSyncNow}
                disabled={syncing || importing}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.buttonHover)}
                onMouseLeave={(e) => { e.currentTarget.style.background = styles.button.background; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {syncing ? '[ SYNCING... ]' : '[ SYNC NOW ]'}
              </button>
              <button
                style={{ ...styles.button, flex: 0, padding: '8px 12px', fontSize: '12px', borderColor: '#884444', color: '#ff6666' }}
                onClick={handleDisconnect}
                disabled={syncing}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#3a1a1a'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = styles.button.background; }}
              >
                X
              </button>
            </div>
            {syncResult && syncResult.imported > 0 && (
              <div style={{ fontSize: '11px', color: '#33ff33', marginTop: '6px' }}>
                Imported {syncResult.imported} save{syncResult.imported !== 1 ? 's' : ''}
              </div>
            )}
            {syncResult && syncResult.errors.length > 0 && (
              <div style={{ ...styles.error, marginTop: '6px', fontSize: '10px' }}>
                {syncResult.errors.join('; ')}
              </div>
            )}
          </div>
        ) : (
          <button
            style={styles.button}
            onClick={handleLinkFolder}
            disabled={importing || syncing}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.buttonHover)}
            onMouseLeave={(e) => { e.currentTarget.style.background = styles.button.background; e.currentTarget.style.boxShadow = 'none'; }}
          >
            [ LINK SAVE FOLDER ]
          </button>
        )
      )}

      {importError && (
        <div style={styles.error}>ERROR: {importError}</div>
      )}

      {/* Navigation buttons */}
      <button
        style={styles.button}
        onClick={() => navigate('/dex')}
        onMouseEnter={(e) => {
          Object.assign(e.currentTarget.style, styles.buttonHover);
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = styles.button.background;
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {'>'} VIEW POKEDEX
      </button>

      <button
        style={styles.button}
        onClick={() => navigate('/saves')}
        onMouseEnter={(e) => {
          Object.assign(e.currentTarget.style, styles.buttonHover);
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = styles.button.background;
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {'>'} MANAGE SAVES
      </button>

      {/* Info section */}
      {saves.length > 0 && (
        <div style={{ ...styles.progressSection, marginTop: '4px' }}>
          <div style={styles.progressLabel}>SAVE FILES</div>
          {saves.map(save => (
            <div key={save.id} style={styles.infoRow}>
              <span>{save.trainerName} ({save.gameVersion})</span>
              <span>{save.totalPokemon} mon</span>
            </div>
          ))}
          {saves.length > 0 && (
            <div style={{ ...styles.infoRow, borderBottom: 'none', marginTop: '4px' }}>
              <span>Last import:</span>
              <span>{new Date(Math.max(...saves.map(s => s.importDate))).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      )}

      {/* Last diff summary */}
      {lastDiffResult && (
        <div style={styles.progressSection}>
          <div style={styles.progressLabel}>LAST IMPORT CHANGES</div>
          <div style={{ fontSize: '12px', color: '#33ff33' }}>
            {lastDiffResult.summary}
          </div>
          <button
            style={{ ...styles.button, marginTop: '8px', padding: '8px', fontSize: '12px' }}
            onClick={() => navigate('/diff')}
          >
            VIEW DETAILS
          </button>
        </div>
      )}
    </div>
  );
}
