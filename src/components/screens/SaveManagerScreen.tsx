import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../state/store';
import { deleteSave } from '../../db/save-store';
import { listBackups, downloadBackup, restoreBackup, deleteBackup } from '../../db/backup-store';
import { writeBackToLinkedFile, supportsWriteback } from '../../state/actions/save-to-file';
import { StatusLED } from '../ui/StatusLED';
import type { BackupRecord } from '../../db/schema';

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
  title: {
    fontSize: '14px',
    color: '#4FC3F7',
    letterSpacing: '1px',
  },
  emptyState: {
    textAlign: 'center' as const,
    color: '#2E86C1',
    fontSize: '13px',
    marginTop: '40px',
    padding: '20px',
  },
  saveCard: {
    border: '1px solid #4FC3F733',
    borderRadius: '4px',
    padding: '12px',
    marginBottom: '10px',
    background: 'rgba(0,0,0,0.2)',
  },
  saveHeader: {
    display: 'flex',
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: '8px',
  },
  trainerName: {
    fontSize: '15px',
    color: '#4FC3F7',
    fontWeight: 'bold' as const,
  },
  gameVersion: {
    fontSize: '11px',
    color: '#2E86C1',
    padding: '2px 6px',
    border: '1px solid #2E86C155',
    borderRadius: '3px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between' as const,
    fontSize: '11px',
    color: '#2E86C1',
    padding: '3px 0',
  },
  buttonRow: {
    display: 'flex',
    gap: '6px',
    marginTop: '10px',
    flexWrap: 'wrap' as const,
  },
  actionButton: {
    flex: 1,
    padding: '8px 6px',
    background: '#101833',
    border: '1px solid #4FC3F755',
    borderRadius: '4px',
    color: '#4FC3F7',
    fontSize: '11px',
    fontFamily: "inherit",
    cursor: 'pointer',
    textAlign: 'center' as const,
    minWidth: '80px',
  },
  deleteButton: {
    flex: 1,
    padding: '8px 6px',
    background: '#3a1a1a',
    border: '1px solid #ff333355',
    borderRadius: '4px',
    color: '#ff4444',
    fontSize: '11px',
    fontFamily: "inherit",
    cursor: 'pointer',
    textAlign: 'center' as const,
    minWidth: '80px',
  },
  confirmOverlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    zIndex: 100,
  },
  confirmBox: {
    background: '#101822',
    border: '2px solid #4FC3F7',
    borderRadius: '8px',
    padding: '20px',
    maxWidth: '300px',
    width: '90%',
    fontFamily: "inherit",
  },
  confirmTitle: {
    fontSize: '14px',
    color: '#ff4444',
    marginBottom: '12px',
    textAlign: 'center' as const,
  },
  confirmText: {
    fontSize: '12px',
    color: '#2E86C1',
    marginBottom: '16px',
    textAlign: 'center' as const,
  },
  confirmButtons: {
    display: 'flex',
    gap: '10px',
  },
  backupSection: {
    marginTop: '8px',
    borderTop: '1px solid #4FC3F722',
    paddingTop: '8px',
  },
  backupToggle: {
    background: 'none',
    border: 'none',
    color: '#2E86C1',
    fontSize: '11px',
    fontFamily: "inherit",
    cursor: 'pointer',
    padding: '2px 0',
  },
  backupList: {
    marginTop: '6px',
  },
  backupItem: {
    display: 'flex',
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: '6px 0',
    borderBottom: '1px solid #4FC3F711',
    fontSize: '11px',
    color: '#2E86C1',
  },
  backupActions: {
    display: 'flex',
    gap: '4px',
  },
  backupBtn: {
    padding: '3px 8px',
    background: '#101833',
    border: '1px solid #4FC3F733',
    borderRadius: '3px',
    color: '#4FC3F7',
    fontSize: '10px',
    fontFamily: "inherit",
    cursor: 'pointer',
  },
  backupBtnDanger: {
    padding: '3px 8px',
    background: '#2a1515',
    border: '1px solid #ff333333',
    borderRadius: '3px',
    color: '#ff6666',
    fontSize: '10px',
    fontFamily: "inherit",
    cursor: 'pointer',
  },
  saveToFileBtn: {
    flex: 1,
    padding: '8px 6px',
    background: '#101833',
    border: '1px solid #81D4FA',
    borderRadius: '4px',
    color: '#81D4FA',
    fontSize: '11px',
    fontFamily: "inherit",
    cursor: 'pointer',
    textAlign: 'center' as const,
    minWidth: '80px',
  },
} as const;

export function SaveManagerScreen() {
  const navigate = useNavigate();
  const saves = useAppStore(s => s.saves);
  const setSaves = useAppStore(s => s.setSaves);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [expandedBackups, setExpandedBackups] = useState<string | null>(null);
  const [backups, setBackups] = useState<Omit<BackupRecord, 'rawData'>[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [savingToFile, setSavingToFile] = useState<string | null>(null);
  const [saveFileStatus, setSaveFileStatus] = useState<string | null>(null);

  const handleDelete = useCallback(async (saveId: string) => {
    setDeleting(true);
    try {
      await deleteSave(saveId);
      setSaves(saves.filter(s => s.id !== saveId));
    } catch (err) {
      console.error('Failed to delete save:', err);
    } finally {
      setDeleting(false);
      setDeleteConfirmId(null);
    }
  }, [saves, setSaves]);

  const toggleBackups = useCallback(async (saveId: string) => {
    if (expandedBackups === saveId) {
      setExpandedBackups(null);
      return;
    }
    setExpandedBackups(saveId);
    setLoadingBackups(true);
    try {
      setBackups(await listBackups(saveId));
    } finally {
      setLoadingBackups(false);
    }
  }, [expandedBackups]);

  const handleRestore = useCallback(async (backupId: string, saveId: string) => {
    if (!confirm('Restore this backup? A backup of the current state will be created first.')) return;
    setRestoringId(backupId);
    try {
      await restoreBackup(backupId);
      setBackups(await listBackups(saveId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Restore failed');
    } finally {
      setRestoringId(null);
    }
  }, []);

  const handleDeleteBackup = useCallback(async (backupId: string, saveId: string) => {
    await deleteBackup(backupId);
    setBackups(await listBackups(saveId));
  }, []);

  const handleSaveToFile = useCallback(async (saveId: string) => {
    setSavingToFile(saveId);
    setSaveFileStatus(null);
    try {
      const result = await writeBackToLinkedFile(saveId);
      if (result === 'written') setSaveFileStatus('Saved to Delta!');
      else if (result === 'downloaded') setSaveFileStatus('Downloaded');
      else setSaveFileStatus('No data');
    } catch (e) {
      setSaveFileStatus(e instanceof Error ? e.message : 'Failed');
    } finally {
      setSavingToFile(null);
      setTimeout(() => setSaveFileStatus(null), 3000);
    }
  }, []);

  const saveToDelete = deleteConfirmId ? saves.find(s => s.id === deleteConfirmId) : null;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate('/')}>
          {'<'} BACK
        </button>
        <span style={styles.title}>SAVE MANAGER</span>
      </div>

      {saves.length === 0 && (
        <div style={styles.emptyState}>
          No save files imported yet.
          <br /><br />
          Go to the home screen to import a .sav file.
        </div>
      )}

      {saves.map(save => (
        <div key={save.id} style={styles.saveCard}>
          {/* Save header */}
          <div style={styles.saveHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <StatusLED color="green" />
              <span style={styles.trainerName}>{save.trainerName}</span>
            </div>
            <span style={styles.gameVersion}>{save.gameVersion}</span>
          </div>

          {/* Info rows */}
          <div style={styles.infoRow}>
            <span>File:</span>
            <span>{save.filename}</span>
          </div>
          <div style={styles.infoRow}>
            <span>Imported:</span>
            <span>{new Date(save.importDate).toLocaleDateString()}</span>
          </div>
          <div style={styles.infoRow}>
            <span>Total Pokemon:</span>
            <span>{save.totalPokemon}</span>
          </div>
          <div style={styles.infoRow}>
            <span>Unique Species:</span>
            <span>{save.uniqueSpecies}</span>
          </div>

          {/* Action buttons */}
          <div style={styles.buttonRow}>
            <button
              style={styles.actionButton}
              onClick={() => navigate(`/saves/${save.id}/boxes`)}
            >
              VIEW BOXES
            </button>
            <button
              style={styles.actionButton}
              onClick={() => navigate(`/saves/${save.id}/party`)}
            >
              VIEW PARTY
            </button>
            <button
              style={styles.actionButton}
              onClick={() => navigate(`/saves/${save.id}/export`)}
            >
              EXPORT
            </button>
            <button
              style={styles.deleteButton}
              onClick={() => setDeleteConfirmId(save.id)}
            >
              DELETE
            </button>
          </div>

          {/* Save to file button */}
          <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
            <button
              style={styles.saveToFileBtn}
              disabled={savingToFile === save.id}
              onClick={() => handleSaveToFile(save.id)}
            >
              {savingToFile === save.id
                ? 'SAVING...'
                : supportsWriteback()
                  ? 'SAVE TO DELTA'
                  : 'DOWNLOAD .SAV'}
            </button>
          </div>
          {saveFileStatus && savingToFile === null && (
            <div style={{ fontSize: '10px', color: '#81D4FA', textAlign: 'center', marginTop: '4px' }}>
              {saveFileStatus}
            </div>
          )}

          {/* Backups section */}
          <div style={styles.backupSection}>
            <button
              style={styles.backupToggle}
              onClick={() => toggleBackups(save.id)}
            >
              {expandedBackups === save.id ? '▼' : '▶'} BACKUPS
            </button>

            {expandedBackups === save.id && (
              <div style={styles.backupList}>
                {loadingBackups ? (
                  <div style={{ fontSize: '11px', color: '#2E86C155' }}>Loading...</div>
                ) : backups.length === 0 ? (
                  <div style={{ fontSize: '11px', color: '#2E86C155' }}>
                    No backups yet. Backups are created automatically before modifications.
                  </div>
                ) : (
                  backups.map(b => (
                    <div key={b.id} style={styles.backupItem}>
                      <div>
                        <div>{new Date(b.timestamp).toLocaleString()}</div>
                        <div style={{ fontSize: '10px', opacity: 0.7 }}>{b.reason}</div>
                      </div>
                      <div style={styles.backupActions}>
                        <button
                          style={styles.backupBtn}
                          onClick={() => downloadBackup(b.id)}
                        >
                          DL
                        </button>
                        <button
                          style={styles.backupBtn}
                          disabled={restoringId === b.id}
                          onClick={() => handleRestore(b.id, save.id)}
                        >
                          {restoringId === b.id ? '...' : 'RESTORE'}
                        </button>
                        <button
                          style={styles.backupBtnDanger}
                          onClick={() => handleDeleteBackup(b.id, save.id)}
                        >
                          X
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Delete confirmation overlay */}
      {deleteConfirmId && saveToDelete && (
        <div style={styles.confirmOverlay} onClick={() => setDeleteConfirmId(null)}>
          <div style={styles.confirmBox} onClick={(e) => e.stopPropagation()}>
            <div style={styles.confirmTitle}>DELETE SAVE?</div>
            <div style={styles.confirmText}>
              Remove &quot;{saveToDelete.trainerName} ({saveToDelete.gameVersion})&quot;?
              <br />
              This cannot be undone.
            </div>
            <div style={styles.confirmButtons}>
              <button
                style={{ ...styles.actionButton, flex: 1 }}
                onClick={() => setDeleteConfirmId(null)}
                disabled={deleting}
              >
                CANCEL
              </button>
              <button
                style={{ ...styles.deleteButton, flex: 1 }}
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deleting}
              >
                {deleting ? 'DELETING...' : 'CONFIRM'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
