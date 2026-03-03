import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../state/store';
import { getSaveRawData } from '../../db/save-store';

const screen = {
  padding: '16px',
  fontFamily: "'Courier New', monospace",
  color: '#33ff33',
  minHeight: '100%',
} as const;

const heading = {
  fontSize: '20px',
  marginBottom: '16px',
  textShadow: '0 0 8px rgba(51,255,51,0.4)',
} as const;

const info = {
  fontSize: '13px',
  color: '#22aa22',
  marginBottom: '20px',
  lineHeight: '1.6',
} as const;

const btn = {
  display: 'block',
  width: '100%',
  padding: '14px',
  marginBottom: '12px',
  background: '#1a3a1a',
  border: '1px solid #33ff33',
  borderRadius: '6px',
  color: '#33ff33',
  fontSize: '14px',
  fontFamily: "'Courier New', monospace",
  cursor: 'pointer',
  textAlign: 'center' as const,
} as const;

const btnSecondary = {
  ...btn,
  border: '1px solid #22aa22',
  color: '#22aa22',
} as const;

export function ExportScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const saves = useAppStore(s => s.saves);
  const save = saves.find(s => s.id === id);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const handleExport = async () => {
    if (!id) return;
    setExporting(true);
    try {
      const rawData = await getSaveRawData(id);
      if (!rawData) {
        alert('Save data not found');
        return;
      }

      const blob = new Blob([rawData], { type: 'application/octet-stream' });
      const filename = save?.filename || 'pokemon.sav';

      // Try Web Share API first (works better on iOS)
      if (navigator.share && navigator.canShare?.({ files: [new File([blob], filename)] })) {
        try {
          await navigator.share({
            files: [new File([blob], filename)],
            title: 'Pokemon Save File',
          });
          setExported(true);
          return;
        } catch {
          // User cancelled or share failed, fall through to download
        }
      }

      // Fallback: download via anchor
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExported(true);
    } finally {
      setExporting(false);
    }
  };

  if (!save) {
    return (
      <div style={screen}>
        <h2 style={heading}>Save Not Found</h2>
        <button style={btn} onClick={() => navigate('/saves')}>Back to Saves</button>
      </div>
    );
  }

  return (
    <div style={screen}>
      <h2 style={heading}>Export Save</h2>

      <div style={info}>
        <div>Trainer: {save.trainerName}</div>
        <div>Game: {save.gameVersion}</div>
        <div>File: {save.filename}</div>
        <div>Pokemon: {save.totalPokemon}</div>
      </div>

      <button
        style={btn}
        onClick={handleExport}
        disabled={exporting}
      >
        {exporting ? 'Exporting...' : exported ? 'Export Again' : 'Download .sav File'}
      </button>

      {exported && (
        <p style={{ color: '#66ff66', fontSize: '12px', textAlign: 'center', marginBottom: '16px' }}>
          Save file exported successfully!
        </p>
      )}

      <button style={btnSecondary} onClick={() => navigate(`/saves`)}>
        Back to Saves
      </button>
    </div>
  );
}
