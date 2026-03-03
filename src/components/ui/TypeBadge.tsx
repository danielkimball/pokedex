// Maps type name (Title Case) to the actual image filename
const TYPE_IMAGES: Record<string, string> = {
  Normal: 'normal.png',
  Fighting: 'fighting.png',
  Flying: 'flying.png',
  Poison: 'poison.png',
  Ground: 'ground.png',
  Rock: 'Rock.png',
  Bug: 'bug.png',
  Ghost: 'ghost.png',
  Steel: 'steel.png',
  Fire: 'fire.png',
  Water: 'water.png',
  Grass: 'grass.png',
  Electric: 'Electric.png',
  Psychic: 'psychic.png',
  Ice: 'ice.png',
  Dragon: 'Dragon.png',
  Dark: 'dark.png',
};

export function TypeBadge({ type }: { type: string }) {
  const filename = TYPE_IMAGES[type];
  if (filename) {
    return (
      <img
        src={`/energyImages/${filename}`}
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
