interface StatBarProps {
  label: string;
  value: number;
  max: number;
  color?: string;
}

export function StatBar({ label, value, max, color = '#33ff33' }: StatBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '4px',
      fontFamily: "'Courier New', monospace",
    }}>
      <span style={{
        width: '36px',
        fontSize: '11px',
        color: '#22aa22',
        textAlign: 'right',
        flexShrink: 0,
      }}>
        {label}
      </span>
      <span style={{
        width: '30px',
        fontSize: '11px',
        color: '#33ff33',
        textAlign: 'right',
        flexShrink: 0,
      }}>
        {value}
      </span>
      <div style={{
        flex: 1,
        height: '8px',
        background: 'rgba(0,0,0,0.4)',
        borderRadius: '4px',
        overflow: 'hidden',
        border: '1px solid rgba(51,255,51,0.2)',
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: color,
          borderRadius: '4px',
          transition: 'width 0.3s ease',
          boxShadow: `0 0 4px ${color}40`,
        }} />
      </div>
    </div>
  );
}
