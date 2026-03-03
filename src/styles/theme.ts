/**
 * Pokedex theme constants — anime-inspired red device styling.
 */

export const colors = {
  // Pokedex device
  deviceRed: '#CC0000',
  deviceRedDark: '#990000',
  deviceRedLight: '#E63333',
  deviceBorder: '#8B0000',
  deviceHinge: '#666666',

  // Screen
  screenBg: '#1a2a1a',
  screenBgLight: '#2a3a2a',
  screenText: '#33ff33',
  screenTextDim: '#22aa22',
  screenTextBright: '#66ff66',

  // LED indicators
  ledBlue: '#3399ff',
  ledGreen: '#33ff33',
  ledRed: '#ff3333',
  ledYellow: '#ffcc33',

  // UI
  bgDark: '#0d0d0d',
  bgMedium: '#1a1a1a',
  bgLight: '#2a2a2a',
  textPrimary: '#e0e0e0',
  textSecondary: '#999999',
  accent: '#CC0000',
  accentLight: '#ff3333',

  // Type colors
  typeNormal: '#A8A878',
  typeFighting: '#C03028',
  typeFlying: '#A890F0',
  typePoison: '#A040A0',
  typeGround: '#E0C068',
  typeRock: '#B8A038',
  typeBug: '#A8B820',
  typeGhost: '#705898',
  typeSteel: '#B8B8D0',
  typeFire: '#F08030',
  typeWater: '#6890F0',
  typeGrass: '#78C850',
  typeElectric: '#F8D030',
  typePsychic: '#F85888',
  typeIce: '#98D8D8',
  typeDragon: '#7038F8',
  typeDark: '#705848',
  typeMystery: '#68A090',
} as const;

export const TYPE_COLORS: Record<string, string> = {
  Normal: colors.typeNormal,
  Fighting: colors.typeFighting,
  Flying: colors.typeFlying,
  Poison: colors.typePoison,
  Ground: colors.typeGround,
  Rock: colors.typeRock,
  Bug: colors.typeBug,
  Ghost: colors.typeGhost,
  Steel: colors.typeSteel,
  Fire: colors.typeFire,
  Water: colors.typeWater,
  Grass: colors.typeGrass,
  Electric: colors.typeElectric,
  Psychic: colors.typePsychic,
  Ice: colors.typeIce,
  Dragon: colors.typeDragon,
  Dark: colors.typeDark,
  '???': colors.typeMystery,
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
} as const;

export const fontSizes = {
  xs: '10px',
  sm: '12px',
  md: '14px',
  lg: '18px',
  xl: '24px',
  xxl: '32px',
} as const;
