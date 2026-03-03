import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../state/store';
import { deleteSave } from '../../db/save-store';
import { StatusLED } from '../ui/StatusLED';

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
    padding: '20px',
  },
  saveCard: {
    border: '1px solid #33ff3333',
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
    color: '#33ff33',
    fontWeight: 'bold' as const,
  },
  gameVersion: {
    fontSize: '11px',
    color: '#22aa22',
    padding: '2px 6px',
    border: '1px solid #22aa2255',
    borderRadius: '3px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between' as const,
    fontSize: '11px',
    color: '#22aa22',
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
    background: '#1a3a1a',
    border: '1px solid #33ff3355',
    borderRadius: '4px',
    color: '#33ff33',
    fontSize: '11px',
    fontFamily: "'Courier New', monospace",
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
    fontFamily: "'Courier New', monospace",
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
    background: '#1a2a1a',
    border: '2px solid #33ff33',
    borderRadius: '8px',
    padding: '20px',
    maxWidth: '300px',
    width: '90%',
    fontFamily: "'Courier New', monospace",
  },
  confirmTitle: {
    fontSize: '14px',
    color: '#ff4444',
    marginBottom: '12px',
    textAlign: 'center' as const,
  },
  confirmText: {
    fontSize: '12px',
    color: '#22aa22',
    marginBottom: '16px',
    textAlign: 'center' as const,
  },
  confirmButtons: {
    display: 'flex',
    gap: '10px',
  },
} as const;

export function SaveManagerScreen() {
  const navigate = useNavigate();
  const saves = useAppStore(s => s.saves);
  const setSaves = useAppStore(s => s.setSaves);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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
