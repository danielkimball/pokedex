const UNOWN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!?'.split('');

const FORM_NAMES: Record<number, string[]> = {
  172: ['Normal', 'Spiky-eared'],
  201: UNOWN,
  351: ['Normal', 'Sunny', 'Rainy', 'Snowy'],
  386: ['Normal', 'Attack', 'Defense', 'Speed'],
  412: ['Plant Cloak', 'Sandy Cloak', 'Trash Cloak'],
  413: ['Plant Cloak', 'Sandy Cloak', 'Trash Cloak'],
  414: ['Plant Cloak origin', 'Sandy Cloak origin', 'Trash Cloak origin'],
  421: ['Overcast', 'Sunshine'],
  422: ['West Sea', 'East Sea'],
  423: ['West Sea', 'East Sea'],
  479: ['Normal', 'Heat', 'Wash', 'Frost', 'Fan', 'Mow'],
  487: ['Altered', 'Origin'],
  492: ['Land', 'Sky'],
  493: [
    'Normal', 'Fighting', 'Flying', 'Poison', 'Ground', 'Rock', 'Bug', 'Ghost',
    'Steel', '???', 'Fire', 'Water', 'Grass', 'Electric', 'Psychic', 'Ice', 'Dragon',
  ],
};

/** Human-readable Generation IV form label; null for species without forms. */
export function gen4FormName(species: number, form = 0): string | null {
  const names = FORM_NAMES[species];
  if (!names) return null;
  return names[form] ?? `Form ${form}`;
}

/** Filename suffix used by PokeAPI's era-specific Gen IV sprite archive. */
export function gen4FormSpriteSuffix(species: number, form = 0): string | null {
  if (species === 201) {
    const label = UNOWN[form];
    if (!label) return null;
    return label === '!' ? 'exclamation' : label === '?' ? 'question' : label.toLowerCase();
  }
  if (species === 412) return ['plant', 'sandy', 'trash'][form] ?? null;
  if (species === 421) return ['overcast', 'sunshine'][form] ?? null;
  if (species === 422 || species === 423) return ['west', 'east'][form] ?? null;
  if (species === 493) {
    return ['normal', 'fighting', 'flying', 'poison', 'ground', 'rock', 'bug', 'ghost', 'steel', 'unknown', 'fire', 'water', 'grass', 'electric', 'psychic', 'ice', 'dragon'][form] ?? null;
  }
  return null;
}

/** PokeAPI's form-specific sprite species id for forms stored separately. */
export function gen4FormSpriteId(species: number, form = 0): number | null {
  if (form === 0) return null;
  if (species === 386 && form <= 3) return 10000 + form;
  if (species === 413 && form <= 2) return 10003 + form;
  if (species === 492 && form === 1) return 10006;
  if (species === 487 && form === 1) return 10007;
  if (species === 479 && form <= 5) return 10007 + form;
  if (species === 351 && form <= 3) return 10012 + form;
  return null;
}
