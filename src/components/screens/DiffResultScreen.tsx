import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../state/store';
import { SPECIES } from '../../core/constants/species';

const screen = {
  padding: '16px',
  fontFamily: "inherit",
  color: '#4FC3F7',
  minHeight: '100%',
} as const;

const heading = {
  fontSize: '20px',
  marginBottom: '16px',
  textShadow: '0 0 8px rgba(79,195,247,0.4)',
} as const;

const summary = {
  fontSize: '14px',
  color: '#81D4FA',
  marginBottom: '20px',
  padding: '8px 12px',
  background: 'rgba(79,195,247,0.08)',
  borderRadius: '4px',
  border: '1px solid #4FC3F744',
} as const;

const section = {
  marginBottom: '20px',
} as const;

const sectionTitle = {
  fontSize: '14px',
  color: '#2E86C1',
  marginBottom: '8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
} as const;

const pokemonRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '6px 0',
  borderBottom: '1px solid #4FC3F722',
  fontSize: '13px',
} as const;

const sprite = {
  width: '32px',
  height: '32px',
  imageRendering: 'pixelated' as const,
} as const;

const btn = {
  display: 'block',
  width: '100%',
  padding: '12px',
  marginTop: '16px',
  background: '#101833',
  border: '1px solid #4FC3F7',
  borderRadius: '6px',
  color: '#4FC3F7',
  fontSize: '14px',
  fontFamily: "inherit",
  cursor: 'pointer',
  textAlign: 'center' as const,
} as const;

const CHANGE_LABELS: Record<string, { label: string; icon: string }> = {
  newCatches: { label: 'New Catches', icon: '+' },
  tradedIn: { label: 'Traded In', icon: '<-' },
  released: { label: 'Released', icon: '-' },
  tradedOut: { label: 'Traded Out', icon: '->' },
  evolved: { label: 'Evolved', icon: '*' },
  leveledUp: { label: 'Leveled Up', icon: '^' },
  moved: { label: 'Moved', icon: '~' },
};

export function DiffResultScreen() {
  const navigate = useNavigate();
  const diffResult = useAppStore(s => s.lastDiffResult);

  if (!diffResult) {
    return (
      <div style={screen}>
        <h2 style={heading}>No Changes</h2>
        <p style={{ color: '#2E86C1', fontSize: '13px' }}>
          No diff data available. Import a save file that was previously imported to see changes.
        </p>
        <button style={btn} onClick={() => navigate('/')}>Back to Home</button>
      </div>
    );
  }

  const sections = Object.entries(CHANGE_LABELS)
    .map(([key, { label, icon }]) => ({
      key,
      label,
      icon,
      changes: diffResult[key as keyof typeof diffResult] as typeof diffResult.newCatches,
    }))
    .filter(s => Array.isArray(s.changes) && s.changes.length > 0);

  return (
    <div style={screen}>
      <h2 style={heading}>Save Changes</h2>

      <div style={summary}>{diffResult.summary}</div>

      {diffResult.unchanged > 0 && (
        <p style={{ color: '#2E86C1', fontSize: '12px', marginBottom: '16px' }}>
          {diffResult.unchanged} Pokemon unchanged
        </p>
      )}

      {sections.map(({ key, label, icon, changes }) => (
        <div key={key} style={section}>
          <div style={sectionTitle}>{icon} {label} ({changes.length})</div>
          {changes.map((change, i) => (
            <div key={i} style={pokemonRow}>
              <img
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${change.pokemon.species}.png`}
                alt=""
                style={sprite}
                loading="lazy"
              />
              <span>
                #{String(change.pokemon.species).padStart(3, '0')}{' '}
                {SPECIES[change.pokemon.species] || '???'}
              </span>
              <span style={{ color: '#2E86C1', marginLeft: 'auto', fontSize: '11px' }}>
                {change.location}
              </span>
            </div>
          ))}
        </div>
      ))}

      <button style={btn} onClick={() => navigate('/')}>Back to Home</button>
    </div>
  );
}
