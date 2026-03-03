import { colors } from '../../styles/theme';

type LEDColor = 'blue' | 'red' | 'green' | 'yellow';

interface StatusLEDProps {
  color: LEDColor;
  pulse?: boolean;
  blink?: boolean;
  size?: number;
}

const COLOR_MAP: Record<LEDColor, string> = {
  blue: colors.ledBlue,
  red: colors.ledRed,
  green: colors.ledGreen,
  yellow: colors.ledYellow,
};

export function StatusLED({ color, pulse = false, blink = false, size = 10 }: StatusLEDProps) {
  const ledColor = COLOR_MAP[color];

  const animationName = pulse ? 'statusLedPulse' : blink ? 'statusLedBlink' : undefined;

  return (
    <>
      {(pulse || blink) && (
        <style>{`
          @keyframes statusLedPulse {
            0%, 100% { box-shadow: 0 0 ${size * 0.4}px ${ledColor}99; }
            50% { box-shadow: 0 0 ${size * 0.8}px ${ledColor}ff; }
          }
          @keyframes statusLedBlink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `}</style>
      )}
      <span
        style={{
          display: 'inline-block',
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 35%, ${ledColor}cc, ${ledColor} 50%, ${ledColor}88 90%)`,
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: `0 0 ${size * 0.4}px ${ledColor}99`,
          animation: animationName ? `${animationName} 1.5s ease-in-out infinite` : undefined,
        }}
        role="status"
        aria-label={`${color} LED indicator`}
      />
    </>
  );
}
