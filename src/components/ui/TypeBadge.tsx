/**
 * Small type badge used in the dex list, party, PC and Pokedex Home.
 * Renders the flat 1999 Base Set TCG energy icon that the type folds into
 * (Bug -> Grass, Ice -> Water, etc.), keeping the whole app's icon style
 * consistent with the Base Set cards.
 */

import { TYPE_TO_TCG_ENERGY, tcgEnergyUrl } from '../../core/constants/energies';

export function TypeBadge({ type }: { type: string }) {
  if (TYPE_TO_TCG_ENERGY[type]) {
    return (
      <img
        src={tcgEnergyUrl(type)}
        alt={type}
        title={type}
        style={{ width: '16px', height: '16px', objectFit: 'contain' }}
      />
    );
  }
  // Fallback for ??? or unknown types
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '4px',
      background: '#888',
      color: '#fff',
      fontSize: '11px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
    }}>
      {type}
    </span>
  );
}
