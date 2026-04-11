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
import { SPECIES } from '../../core/constants/species';

const SPRITE_URL = (n: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${n}.png`;

const styles = {
  container: {
    padding: '12px',
    fontFamily: "inherit",
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    minHeight: '100%',
    background: '#f4f1e8',
    color: '#111111',
  },
  masthead: {
    padding: '10px',
    border: '2px solid #222222',
    borderRadius: '6px',
    background: 'linear-gradient(180deg, #fffdf4 0%, #e9dfc9 100%)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7), 0 2px 0 rgba(0,0,0,0.14)',
  },
  title: {
    fontSize: '26px',
    fontWeight: 'bold' as const,
    color: '#111111',
    textAlign: 'left' as const,
    textShadow: 'none',
    letterSpacing: '2px',
    margin: 0,
  },
  subtitle: {
    fontSize: '12px',
    color: '#5d5142',
    margin: '2px 0 0',
  },
  menuGrid: {
    display: 'flex',
    gap: '7px',
    overflowX: 'auto' as const,
    paddingBottom: '2px',
    scrollbarWidth: 'none' as const,
  },
  menuButton: {
    flex: '0 0 118px',
    minHeight: '54px',
    padding: '7px 8px',
    border: '2px solid #2a1f1f',
    borderRadius: '6px',
    background: 'linear-gradient(180deg, #fffaf0 0%, #d9cab1 100%)',
    color: '#111111',
    fontFamily: 'inherit',
    cursor: 'pointer',
    textAlign: 'left' as const,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 3px 0 rgba(0,0,0,0.22)',
  },
  menuButtonActive: {
    background: 'linear-gradient(180deg, #cc001c 0%, #940014 100%)',
    color: '#fff8e8',
  },
  menuLabel: {
    display: 'block',
    fontSize: '11px',
    fontWeight: 'bold' as const,
    letterSpacing: '0.5px',
    marginBottom: '2px',
  },
  menuMeta: {
    display: 'block',
    fontSize: '9px',
    lineHeight: 1.25,
    opacity: 0.82,
  },
  progressSection: {
    padding: '10px',
    border: '1px solid #22222222',
    borderRadius: '6px',
    background: 'rgba(255,255,255,0.42)',
  },
  progressLabel: {
    fontSize: '11px',
    color: '#5d5142',
    letterSpacing: '0.8px',
    textTransform: 'uppercase' as const,
    marginBottom: '6px',
  },
  progressBarOuter: {
    width: '100%',
    height: '12px',
    background: '#d2c5ad',
    borderRadius: '6px',
    overflow: 'hidden' as const,
    border: '1px solid rgba(0,0,0,0.24)',
  },
  progressBarInner: (pct: number) => ({
    width: `${pct}%`,
    height: '100%',
    background: 'linear-gradient(90deg, #8f0014, #cc001c)',
    borderRadius: '6px',
    transition: 'width 0.5s ease',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22)',
  }),
  progressText: {
    fontSize: '14px',
    color: '#111111',
    textAlign: 'center' as const,
    marginTop: '6px',
  },
  button: {
    display: 'block',
    width: '100%',
    padding: '11px 14px',
    background: '#fffaf0',
    border: '2px solid #2a1f1f',
    borderRadius: '6px',
    color: '#111111',
    fontSize: '13px',
    fontWeight: 'bold' as const,
    fontFamily: "inherit",
    cursor: 'pointer',
    textAlign: 'center' as const,
    transition: 'background 0.2s, box-shadow 0.2s',
  },
  buttonHover: {
    background: '#f1e4cd',
    boxShadow: '0 2px 0 rgba(0,0,0,0.18)',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between' as const,
    fontSize: '11px',
    color: '#333333',
    padding: '4px 0',
    borderBottom: '1px solid rgba(0,0,0,0.1)',
  },
  error: {
    color: '#9b0014',
    fontSize: '12px',
    padding: '8px',
    border: '1px solid #9b001455',
    borderRadius: '4px',
    background: 'rgba(155,0,20,0.08)',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center' as const,
    gap: '8px',
    fontSize: '11px',
    color: '#333333',
  },
  dexPanel: {
    padding: '10px',
    border: '2px solid #222222',
    borderRadius: '6px',
    background: '#fffaf0',
  },
  dexHeader: {
    display: 'flex',
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    gap: '10px',
    marginBottom: '8px',
  },
  dexTitle: {
    fontSize: '15px',
    fontWeight: 'bold' as const,
    letterSpacing: '1px',
    color: '#111111',
  },
  dexGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '6px',
  },
  dexTile: {
    minHeight: '68px',
    border: '1px solid #2a1f1f33',
    borderRadius: '6px',
    background: '#f4f1e8',
    padding: '4px',
    display: 'grid',
    justifyItems: 'center' as const,
    alignContent: 'center' as const,
    gap: '1px',
    cursor: 'pointer',
  },
  dexSprite: {
    width: '34px',
    height: '34px',
    imageRendering: 'pixelated' as const,
  },
  dexNum: {
    fontSize: '9px',
    color: '#6a5d4a',
  },
  dexName: {
    maxWidth: '100%',
    fontSize: '9px',
    color: '#111111',
    overflow: 'hidden',
    whiteSpace: 'nowrap' as const,
    textOverflow: 'ellipsis',
  },
  sectionTitle: {
    fontSize: '12px',
    fontWeight: 'bold' as const,
    color: '#111111',
    letterSpacing: '0.8px',
  },
} as const;

export function HomeScreen() {
  const navigate = useNavigate();

  const caughtCount = useAppStore(s => s.caughtCount);
  const importing = useAppStore(s => s.importing);
  const importError = useAppStore(s => s.importError);
  const saves = useAppStore(s => s.saves);
  const lastDiffResult = useAppStore(s => s.lastDiffResult);
  const registryMap = useAppStore(s => s.registryMap);

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
  const [activeHomePanel, setActiveHomePanel] = useState<'save' | 'dropbox' | null>(null);

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
      const pickerWindow = window as Window & {
        showOpenFilePicker: (options: {
          types: { description: string; accept: Record<string, string[]> }[];
          multiple: boolean;
        }) => Promise<FileSystemFileHandle[]>;
      };
      const [handle] = await pickerWindow.showOpenFilePicker({
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
  const dexPreview = Array.from({ length: 24 }, (_, index) => index + 1);
  const nextMissing = Array.from({ length: totalDex }, (_, index) => index + 1)
    .find(dexNum => !(registryMap.get(dexNum)?.caught ?? false));

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
      <div style={styles.masthead}>
        <h1 style={styles.title}>POKEDEX</h1>
        <p style={styles.subtitle}>National Dex tracker for HeartGold, SoulSilver, and Gen IV saves.</p>
        <div style={{ ...styles.statusRow, marginTop: '10px' }}>
          <StatusLED color={importing ? 'yellow' : saves.length > 0 ? 'green' : 'red'} pulse={importing} />
          <span>
            {importing
              ? 'Reading save data'
              : saves.length > 0
                ? `${saves.length} save${saves.length !== 1 ? 's' : ''} connected`
                : 'Connect a save file to begin'}
          </span>
        </div>
      </div>

      <div style={styles.menuGrid}>
        <button
          style={styles.menuButton}
          onClick={() => navigate('/dex')}
        >
          <span style={styles.menuLabel}>View Pokédex</span>
          <span style={styles.menuMeta}>{caughtCount}/493 caught. Browse, filter, and open entries.</span>
        </button>
        <button
          style={activeHomePanel === 'save' ? { ...styles.menuButton, ...styles.menuButtonActive } : styles.menuButton}
          onClick={() => setActiveHomePanel(activeHomePanel === 'save' ? null : 'save')}
          disabled={importing}
        >
          <span style={styles.menuLabel}>Connect Save</span>
          <span style={styles.menuMeta}>{linkedFileRecord?.handle.name || deltaFilename || 'Link a Delta .sav or .dsv file.'}</span>
        </button>
        <button
          style={styles.menuButton}
          onClick={() => navigate('/saves')}
        >
          <span style={styles.menuLabel}>Save Files</span>
          <span style={styles.menuMeta}>{saves.length ? `${saves.length} loaded. Manage boxes and exports.` : 'No saves loaded yet.'}</span>
        </button>
        <button
          style={activeHomePanel === 'dropbox' ? { ...styles.menuButton, ...styles.menuButtonActive } : styles.menuButton}
          onClick={() => {
            setActiveHomePanel(activeHomePanel === 'dropbox' ? null : 'dropbox');
            if (!dropbox.appKey) setShowDropboxSetup(true);
          }}
        >
          <span style={styles.menuLabel}>Dropbox</span>
          <span style={styles.menuMeta}>{dropbox.connected ? 'Connected. Scan Delta cloud saves.' : 'Connect Delta Dropbox saves.'}</span>
        </button>
        <button
          style={styles.menuButton}
          onClick={() => navigate('/home')}
        >
          <span style={styles.menuLabel}>Pokémon Home</span>
          <span style={styles.menuMeta}>Future storage and transfer hub.</span>
        </button>
      </div>

      {/* Delta save file — two paths depending on browser */}
      {/* Hidden input for iOS/Safari file-pick flow */}
      <input
        ref={deltaInputRef}
        type="file"
        accept=".sav,.dsv"
        onChange={handleDeltaInputChange}
        style={{ display: 'none' }}
      />

      {activeHomePanel === 'save' && <>
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
            <div style={{ fontSize: '11px', color: '#5d5142', marginBottom: '8px' }}>
              Look for: <span style={{ color: '#111111' }}>{deltaFilename}</span>
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
      </>}

      {/* ── Dropbox Delta Save Sync ──────────────────────────────────── */}
      {activeHomePanel === 'dropbox' && (
      <div style={{ ...styles.progressSection, borderColor: '#11111155' }}>
        <div style={styles.progressLabel}>DROPBOX — DELTA SAVES</div>

        {!dropbox.appKey ? (
          /* Step 1: No app key yet — show setup */
          <>
            <button
              style={{
                background: 'none',
                border: 'none',
                color: '#111111',
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
                <div style={{ fontSize: '10px', color: '#5d5142', marginBottom: '8px' }}>
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
                      background: '#fffaf0',
                      border: '1px solid #11111155',
                      borderRadius: '4px',
                      color: '#111111',
                      fontFamily: 'inherit',
                      fontSize: '11px',
                    }}
                  />
                  <button
                    style={{
                      padding: '8px 14px',
                      background: '#fffaf0',
                      border: '1px solid #111111',
                      borderRadius: '4px',
                      color: '#111111',
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
                <span style={{ fontSize: '11px', color: '#5d5142' }}>Dropbox configured — sign in to scan for saves</span>
              </div>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#5d514288',
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
                <span style={{ fontSize: '11px', color: '#111111' }}>Dropbox connected</span>
              </div>
              <button
                style={{
                  background: 'none',
                  border: '1px solid #5d514255',
                  borderRadius: '4px',
                  color: '#5d5142',
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
                border: '1px solid #11111144',
                borderRadius: '6px',
                background: 'rgba(204,0,28,0.06)',
              }}>
                <div style={{ fontSize: '10px', color: '#5d5142', marginBottom: '6px' }}>ACTIVE SAVE</div>
                <div style={{ fontSize: '13px', color: '#111111', marginBottom: '8px' }}>
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
                  <div style={{ fontSize: '10px', color: '#5d514288', marginTop: '6px' }}>
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
              <div style={{ fontSize: '12px', color: '#5d5142', textAlign: 'center', padding: '12px' }}>
                Scanning Dropbox for Delta save files...
              </div>
            ) : (
              <>
                {dropbox.identifying && (
                  <div style={{ fontSize: '10px', color: '#5d5142', marginBottom: '8px' }}>
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
                        <div style={{ fontSize: '10px', color: '#5d5142', marginBottom: '8px' }}>
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
                              background: '#fffaf0',
                              border: '1px solid #11111122',
                              borderRadius: '6px',
                              color: '#5d5142',
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
                                background: isActive ? 'rgba(0,0,0,0.08)' : '#fffaf0',
                                border: `1px solid ${isActive ? '#111111' : '#11111144'}`,
                                borderRadius: '6px',
                                color: '#111111',
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
                                if (!isActive) e.currentTarget.style.background = '#f1e4cd';
                              }}
                              onMouseLeave={(e) => {
                                if (!isActive) e.currentTarget.style.background = '#fffaf0';
                              }}
                            >
                              <div style={{ flex: 1 }}>
                                <div>{isImporting ? 'Importing...' : game.gameName}</div>
                                <div style={{ fontSize: '10px', color: '#5d5142', marginTop: '2px' }}>
                                  Last saved: {modified}
                                </div>
                              </div>
                              {isActive && (
                                <span style={{ fontSize: '10px', color: '#111111', marginLeft: '8px', flexShrink: 0 }}>ACTIVE</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      {/* Show unknown games collapsed for debugging */}
                      {unknownGames.length > 0 && !dropbox.identifying && (
                        <div style={{ fontSize: '10px', color: '#5d514288', marginTop: '8px' }}>
                          {unknownGames.length} non-Gen 4 save{unknownGames.length !== 1 ? 's' : ''} hidden
                          {unknownGames.map(g => (
                            <div key={g.gameHash} style={{ marginTop: '2px', fontSize: '9px', color: '#5d514255' }}>
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
      )}

      {/* Directory sync controls (Chrome/Edge only) */}
      {activeHomePanel === 'save' && syncSupported && (
        connectedDirectory ? (
          <div style={styles.progressSection}>
            <div style={styles.progressLabel}>LINKED FOLDER</div>
            <div style={{ ...styles.statusRow, marginBottom: '8px' }}>
              <StatusLED color={syncing ? 'yellow' : 'green'} pulse={syncing} />
              <span style={{ flex: 1 }}>{connectedDirectory}</span>
            </div>
            {lastSyncTime && (
              <div style={{ fontSize: '10px', color: '#5d5142', marginBottom: '8px' }}>
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
              <div style={{ fontSize: '11px', color: '#111111', marginTop: '6px' }}>
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
          <div style={{ fontSize: '12px', color: '#111111' }}>
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

      <div style={styles.dexPanel}>
        <div style={styles.dexHeader}>
          <div>
            <div style={styles.dexTitle}>NATIONAL DEX</div>
            <div style={{ fontSize: '11px', color: '#5d5142' }}>
              {caughtCount} caught, {totalDex - caughtCount} missing
            </div>
          </div>
          <button style={{ ...styles.button, width: 'auto', padding: '7px 10px', fontSize: '11px' }} onClick={() => navigate('/dex')}>
            OPEN
          </button>
        </div>
        <div style={styles.progressBarOuter}>
          <div style={styles.progressBarInner(progressPct)} />
        </div>
        <div style={styles.progressText}>
          {progressPct.toFixed(1)}% complete{nextMissing ? ` · next missing: #${String(nextMissing).padStart(3, '0')} ${SPECIES[nextMissing]}` : ''}
        </div>
        <div style={styles.dexGrid}>
          {dexPreview.map(dexNum => {
            const caught = registryMap.get(dexNum)?.caught ?? false;
            return (
              <button
                key={dexNum}
                style={{
                  ...styles.dexTile,
                  opacity: caught ? 1 : 0.48,
                  borderColor: caught ? '#28784088' : '#2a1f1f33',
                }}
                onClick={() => navigate(`/dex/${dexNum}`)}
              >
                <img src={SPRITE_URL(dexNum)} alt={SPECIES[dexNum]} style={styles.dexSprite} />
                <span style={styles.dexNum}>#{String(dexNum).padStart(3, '0')}</span>
                <span style={styles.dexName}>{SPECIES[dexNum]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
