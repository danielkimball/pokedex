import { useRef, useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../state/store';
import { importSaveFile, importSaveBuffer } from '../../state/actions/import-save';
import { StatusLED } from '../ui/StatusLED';
import { useDirectorySync, type SyncResult } from '../../hooks/useDirectorySync';
import { useDropboxSync } from '../../hooks/useDropboxSync';
import {
  saveFileHandle,
  getFileRecord,
  clearFileHandle,
  type FileRecord,
} from '../../db/directory-store';

const styles = {
  container: {
    padding: '16px',
    fontFamily: "inherit",
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
    minHeight: '100%',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold' as const,
    color: '#4FC3F7',
    textAlign: 'center' as const,
    textShadow: '0 0 10px rgba(79,195,247,0.5)',
    letterSpacing: '4px',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '11px',
    color: '#2E86C1',
    textAlign: 'center' as const,
    marginTop: '-12px',
  },
  progressSection: {
    padding: '12px',
    border: '1px solid #4FC3F733',
    borderRadius: '4px',
    background: 'rgba(0,0,0,0.2)',
  },
  progressLabel: {
    fontSize: '12px',
    color: '#2E86C1',
    marginBottom: '6px',
  },
  progressBarOuter: {
    width: '100%',
    height: '12px',
    background: 'rgba(0,0,0,0.4)',
    borderRadius: '6px',
    overflow: 'hidden' as const,
    border: '1px solid rgba(79,195,247,0.2)',
  },
  progressBarInner: (pct: number) => ({
    width: `${pct}%`,
    height: '100%',
    background: 'linear-gradient(90deg, #2E86C1, #4FC3F7)',
    borderRadius: '6px',
    transition: 'width 0.5s ease',
    boxShadow: '0 0 6px rgba(79,195,247,0.4)',
  }),
  progressText: {
    fontSize: '14px',
    color: '#4FC3F7',
    textAlign: 'center' as const,
    marginTop: '6px',
  },
  button: {
    display: 'block',
    width: '100%',
    padding: '12px 16px',
    background: '#101833',
    border: '1px solid #4FC3F7',
    borderRadius: '4px',
    color: '#4FC3F7',
    fontSize: '14px',
    fontFamily: "inherit",
    cursor: 'pointer',
    textAlign: 'center' as const,
    transition: 'background 0.2s, box-shadow 0.2s',
  },
  buttonHover: {
    background: '#162845',
    boxShadow: '0 0 8px rgba(79,195,247,0.3)',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between' as const,
    fontSize: '11px',
    color: '#2E86C1',
    padding: '4px 0',
    borderBottom: '1px solid rgba(79,195,247,0.1)',
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
    color: '#2E86C1',
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

  // ── Dropbox Delta save sync ───────────────────────────────────────────────
  const dropbox = useDropboxSync();
  const [showDropboxSetup, setShowDropboxSetup] = useState(false);
  const [appKeyInput, setAppKeyInput] = useState('');
  // Track which game was last imported so we can offer a targeted refresh
  const [activeGameHash, setActiveGameHash] = useState<string | null>(
    () => localStorage.getItem('pokedex-active-dropbox-game-hash')
  );
  const [activeGameName, setActiveGameName] = useState<string>(
    () => localStorage.getItem('pokedex-active-dropbox-game-name') || ''
  );

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
            <div style={{ fontSize: '11px', color: '#2E86C1', marginBottom: '8px' }}>
              Look for: <span style={{ color: '#4FC3F7' }}>{deltaFilename}</span>
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

      {/* ── Dropbox Delta Save Sync ──────────────────────────────────── */}
      <div style={{ ...styles.progressSection, borderColor: '#4FC3F755' }}>
        <div style={styles.progressLabel}>DROPBOX — DELTA SAVES</div>

        {!dropbox.appKey ? (
          /* Step 1: No app key yet — show setup */
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
              onClick={() => setShowDropboxSetup(!showDropboxSetup)}
            >
              {showDropboxSetup ? '\u25BC' : '\u25B6'} Connect Dropbox
            </button>
            {showDropboxSetup && (
              <div style={{ marginTop: '10px' }}>
                <div style={{ fontSize: '10px', color: '#2E86C1', marginBottom: '8px' }}>
                  1. In Delta: Settings &gt; Syncing &gt; switch to Dropbox{'\n'}
                  2. Go to dropbox.com/developers, create an app with &quot;Scoped access&quot; and &quot;Full Dropbox&quot;{'\n'}
                  3. Under Permissions, enable files.metadata.read and files.content.read{'\n'}
                  4. Paste the App Key below
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Paste Dropbox App Key"
                    value={appKeyInput}
                    onChange={(e) => setAppKeyInput(e.target.value)}
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
                    disabled={!appKeyInput.trim()}
                    onClick={() => {
                      dropbox.setAppKey(appKeyInput.trim());
                      setAppKeyInput('');
                      setShowDropboxSetup(false);
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </>
        ) : !dropbox.connected ? (
          /* Step 2: App key set but not connected */
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <StatusLED color="yellow" />
                <span style={{ fontSize: '11px', color: '#2E86C1' }}>Dropbox configured — sign in to scan for saves</span>
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
                onClick={dropbox.removeAppKey}
              >
                Remove
              </button>
            </div>
            <button
              style={{ ...styles.button, padding: '10px', fontSize: '13px' }}
              onClick={() => dropbox.connect()}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.buttonHover)}
              onMouseLeave={(e) => { e.currentTarget.style.background = styles.button.background; e.currentTarget.style.boxShadow = 'none'; }}
            >
              [ CONNECT TO DROPBOX ]
            </button>
            {dropbox.error && (
              <div style={{ fontSize: '10px', color: '#e74c3c', marginTop: '6px' }}>{dropbox.error}</div>
            )}
          </div>
        ) : (
          /* Step 3: Connected — show saves or scan button */
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <StatusLED color="green" pulse={dropbox.scanning || dropbox.importing} />
                <span style={{ fontSize: '11px', color: '#4FC3F7' }}>Dropbox connected</span>
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
                onClick={() => {
                  dropbox.disconnect();
                  setActiveGameHash(null);
                  setActiveGameName('');
                  localStorage.removeItem('pokedex-active-dropbox-game-hash');
                  localStorage.removeItem('pokedex-active-dropbox-game-name');
                }}
              >
                Disconnect
              </button>
            </div>

            {/* Active game — show refresh prominently */}
            {activeGameHash && (
              <div style={{
                padding: '10px',
                marginBottom: '10px',
                border: '1px solid #4FC3F744',
                borderRadius: '6px',
                background: 'rgba(79,195,247,0.05)',
              }}>
                <div style={{ fontSize: '10px', color: '#2E86C1', marginBottom: '6px' }}>ACTIVE SAVE</div>
                <div style={{ fontSize: '13px', color: '#4FC3F7', marginBottom: '8px' }}>
                  {activeGameName}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    style={{ ...styles.button, flex: 1, padding: '10px', fontSize: '14px', fontWeight: 'bold' as const }}
                    disabled={dropbox.importing || importing}
                    onClick={async () => {
                      const ok = await dropbox.refreshGame(activeGameHash);
                      if (ok) navigate('/diff');
                    }}
                    onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.buttonHover)}
                    onMouseLeave={(e) => { e.currentTarget.style.background = styles.button.background; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    {dropbox.importingHash === activeGameHash ? '[ REFRESHING... ]' : '[ \u21BA REFRESH FROM DROPBOX ]'}
                  </button>
                  <button
                    style={{ ...styles.button, flex: 0, padding: '10px 14px', fontSize: '13px', borderColor: '#884444', color: '#ff6666' }}
                    onClick={() => {
                      setActiveGameHash(null);
                      setActiveGameName('');
                      localStorage.removeItem('pokedex-active-dropbox-game-hash');
                      localStorage.removeItem('pokedex-active-dropbox-game-name');
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#3a1a1a'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = styles.button.background; }}
                  >
                    X
                  </button>
                </div>
                {dropbox.lastScanTime && (
                  <div style={{ fontSize: '10px', color: '#2E86C188', marginTop: '6px' }}>
                    Last refreshed: {new Date(dropbox.lastScanTime).toLocaleString()}
                  </div>
                )}
              </div>
            )}

            {/* Scan / game list */}
            {dropbox.games.length === 0 && !dropbox.scanning && !dropbox.identifying ? (
              <button
                style={{ ...styles.button, padding: '10px', fontSize: '13px' }}
                disabled={dropbox.scanning}
                onClick={dropbox.scan}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.buttonHover)}
                onMouseLeave={(e) => { e.currentTarget.style.background = styles.button.background; e.currentTarget.style.boxShadow = 'none'; }}
              >
                [ SCAN DROPBOX FOR SAVE FILES ]
              </button>
            ) : dropbox.scanning ? (
              <div style={{ fontSize: '12px', color: '#2E86C1', textAlign: 'center', padding: '12px' }}>
                Scanning Dropbox for Delta save files...
              </div>
            ) : (
              <>
                {dropbox.identifying && (
                  <div style={{ fontSize: '10px', color: '#2E86C1', marginBottom: '8px' }}>
                    Downloading and identifying games... ({dropbox.games.filter(g => g.gameName !== null).length}/{dropbox.games.length})
                  </div>
                )}
                {(() => {
                  const gen4Games = dropbox.games.filter(g => g.gameVersion !== 'unknown' && g.gameVersion !== 'error');
                  const unknownGames = dropbox.games.filter(g => g.gameVersion === 'unknown' || g.gameVersion === 'error');
                  const pendingGames = dropbox.games.filter(g => g.gameVersion === null);
                  return (
                    <>
                      {gen4Games.length > 0 && (
                        <div style={{ fontSize: '10px', color: '#2E86C1', marginBottom: '8px' }}>
                          Found {gen4Games.length} Gen 4 game{gen4Games.length !== 1 ? 's' : ''}.
                          Tap one to load your Pokedex from it.
                        </div>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '6px' }}>
                        {/* Pending (still detecting) */}
                        {pendingGames.map(game => (
                          <div
                            key={game.gameHash}
                            style={{
                              padding: '12px',
                              background: '#101833',
                              border: '1px solid #4FC3F722',
                              borderRadius: '6px',
                              color: '#2E86C1',
                              fontSize: '12px',
                            }}
                          >
                            Detecting... ({(game.file.size / 1024).toFixed(0)} KB)
                          </div>
                        ))}
                        {/* Gen 4 games */}
                        {gen4Games.map(game => {
                          const isActive = activeGameHash === game.gameHash;
                          const isImporting = dropbox.importingHash === game.gameHash;
                          const modified = game.file.modified ? new Date(game.file.modified).toLocaleDateString() : '';
                          return (
                            <button
                              key={game.gameHash}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px',
                                background: isActive ? 'rgba(79,195,247,0.1)' : '#101833',
                                border: `1px solid ${isActive ? '#4FC3F7' : '#4FC3F744'}`,
                                borderRadius: '6px',
                                color: '#4FC3F7',
                                fontSize: '13px',
                                fontFamily: 'inherit',
                                cursor: isImporting ? 'wait' : 'pointer',
                                textAlign: 'left' as const,
                              }}
                              disabled={dropbox.importing}
                              onClick={async () => {
                                const ok = await dropbox.importGame(game);
                                if (ok) {
                                  const name = game.gameName ?? game.file.name;
                                  setActiveGameHash(game.gameHash);
                                  setActiveGameName(name);
                                  localStorage.setItem('pokedex-active-dropbox-game-hash', game.gameHash);
                                  localStorage.setItem('pokedex-active-dropbox-game-name', name);
                                  navigate('/diff');
                                }
                              }}
                              onMouseEnter={(e) => {
                                if (!isActive) e.currentTarget.style.background = '#162845';
                              }}
                              onMouseLeave={(e) => {
                                if (!isActive) e.currentTarget.style.background = '#101833';
                              }}
                            >
                              <div style={{ flex: 1 }}>
                                <div>{isImporting ? 'Importing...' : game.gameName}</div>
                                <div style={{ fontSize: '10px', color: '#2E86C1', marginTop: '2px' }}>
                                  Last saved: {modified}
                                </div>
                              </div>
                              {isActive && (
                                <span style={{ fontSize: '10px', color: '#4FC3F7', marginLeft: '8px', flexShrink: 0 }}>ACTIVE</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      {/* Show unknown games collapsed for debugging */}
                      {unknownGames.length > 0 && !dropbox.identifying && (
                        <div style={{ fontSize: '10px', color: '#2E86C188', marginTop: '8px' }}>
                          {unknownGames.length} non-Gen 4 save{unknownGames.length !== 1 ? 's' : ''} hidden
                          {unknownGames.map(g => (
                            <div key={g.gameHash} style={{ marginTop: '2px', fontSize: '9px', color: '#2E86C155' }}>
                              {g.debugInfo}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
                <button
                  style={{ ...styles.button, marginTop: '8px', padding: '8px', fontSize: '11px' }}
                  disabled={dropbox.scanning}
                  onClick={dropbox.scan}
                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.buttonHover)}
                  onMouseLeave={(e) => { e.currentTarget.style.background = styles.button.background; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  [ RE-SCAN ]
                </button>
              </>
            )}

            {dropbox.error && (
              <div style={{ ...styles.error, marginTop: '8px', fontSize: '11px' }}>
                {dropbox.error}
              </div>
            )}
          </div>
        )}
      </div>

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
              <div style={{ fontSize: '10px', color: '#2E86C1', marginBottom: '8px' }}>
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
              <div style={{ fontSize: '11px', color: '#4FC3F7', marginTop: '6px' }}>
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

      <button
        style={styles.button}
        onClick={() => navigate('/home')}
        onMouseEnter={(e) => {
          Object.assign(e.currentTarget.style, styles.buttonHover);
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = styles.button.background;
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {'>'} POKEMON HOME
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
          <div style={{ fontSize: '12px', color: '#4FC3F7' }}>
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
