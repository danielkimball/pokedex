export const NATURES: readonly string[] = [
  'Hardy', 'Lonely', 'Brave', 'Adamant', 'Naughty',
  'Bold', 'Docile', 'Relaxed', 'Impish', 'Lax',
  'Timid', 'Hasty', 'Serious', 'Jolly', 'Naive',
  'Modest', 'Mild', 'Quiet', 'Bashful', 'Rash',
  'Calm', 'Gentle', 'Sassy', 'Careful', 'Quirky',
];

export interface NatureEffect {
  increased: string | null;
  decreased: string | null;
}

export const NATURE_EFFECTS: readonly NatureEffect[] = [
  // nature % 5 == nature / 5 means neutral
  { increased: null, decreased: null },       // Hardy
  { increased: 'ATK', decreased: 'DEF' },     // Lonely
  { increased: 'ATK', decreased: 'SPE' },     // Brave
  { increased: 'ATK', decreased: 'SPA' },     // Adamant
  { increased: 'ATK', decreased: 'SPD' },     // Naughty
  { increased: 'DEF', decreased: 'ATK' },     // Bold
  { increased: null, decreased: null },       // Docile
  { increased: 'DEF', decreased: 'SPE' },     // Relaxed
  { increased: 'DEF', decreased: 'SPA' },     // Impish
  { increased: 'DEF', decreased: 'SPD' },     // Lax
  { increased: 'SPE', decreased: 'ATK' },     // Timid
  { increased: 'SPE', decreased: 'DEF' },     // Hasty
  { increased: null, decreased: null },       // Serious
  { increased: 'SPE', decreased: 'SPA' },     // Jolly
  { increased: 'SPE', decreased: 'SPD' },     // Naive
  { increased: 'SPA', decreased: 'ATK' },     // Modest
  { increased: 'SPA', decreased: 'DEF' },     // Mild
  { increased: 'SPA', decreased: 'SPE' },     // Quiet
  { increased: null, decreased: null },       // Bashful
  { increased: 'SPA', decreased: 'SPD' },     // Rash
  { increased: 'SPD', decreased: 'ATK' },     // Calm
  { increased: 'SPD', decreased: 'DEF' },     // Gentle
  { increased: 'SPD', decreased: 'SPE' },     // Sassy
  { increased: 'SPD', decreased: 'SPA' },     // Careful
  { increased: null, decreased: null },       // Quirky
];
