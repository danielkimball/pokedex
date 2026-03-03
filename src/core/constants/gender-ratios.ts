/**
 * Gender ratio thresholds for Gen 1-4 Pokemon (species 1-493).
 *
 * Values represent the Gen IV gender threshold byte:
 *   0   = always male
 *   31  = 87.5% male / 12.5% female
 *   63  = 75% male / 25% female
 *   127 = 50% male / 50% female  (default — omitted from this map)
 *   191 = 25% male / 75% female
 *   254 = always female
 *   255 = genderless
 *
 * Species not present in this map default to 127 (50/50).
 */
export const GENDER_RATIOS: Record<number, number> = {
  // --- 87.5% male (31) ---
  // Bulbasaur line
  1: 31, 2: 31, 3: 31,
  // Charmander line
  4: 31, 5: 31, 6: 31,
  // Squirtle line
  7: 31, 8: 31, 9: 31,
  // Eevee + Gen I eeveelutions
  133: 31, 134: 31, 135: 31, 136: 31,
  // Omanyte line
  138: 31, 139: 31,
  // Kabuto line
  140: 31, 141: 31,
  // Aerodactyl
  142: 31,
  // Snorlax
  143: 31,
  // Chikorita line
  152: 31, 153: 31, 154: 31,
  // Cyndaquil line
  155: 31, 156: 31, 157: 31,
  // Totodile line
  158: 31, 159: 31, 160: 31,
  // Togepi, Togetic
  175: 31, 176: 31,
  // Espeon, Umbreon
  196: 31, 197: 31,
  // Treecko line
  252: 31, 253: 31, 254: 31,
  // Torchic line
  255: 31, 256: 31, 257: 31,
  // Mudkip line
  258: 31, 259: 31, 260: 31,
  // Lileep line
  345: 31, 346: 31,
  // Anorith line
  347: 31, 348: 31,
  // Turtwig line
  387: 31, 388: 31, 389: 31,
  // Chimchar line
  390: 31, 391: 31, 392: 31,
  // Piplup line
  393: 31, 394: 31, 395: 31,
  // Cranidos line
  408: 31, 409: 31,
  // Shieldon line
  410: 31, 411: 31,
  // Combee
  415: 31,
  // Munchlax
  446: 31,
  // Riolu, Lucario
  447: 31, 448: 31,
  // Togekiss
  468: 31,
  // Leafeon, Glaceon
  470: 31, 471: 31,

  // --- 75% male (63) ---
  // Growlithe line
  58: 63, 59: 63,
  // Abra line
  63: 63, 64: 63, 65: 63,
  // Machop line
  66: 63, 67: 63, 68: 63,
  // Electabuzz
  125: 63,
  // Magmar
  126: 63,
  // Elekid
  239: 63,
  // Magby
  240: 63,
  // Makuhita line
  296: 63, 297: 63,
  // Electivire
  466: 63,
  // Magmortar
  467: 63,

  // --- Always male (0) ---
  // Nidoran-M line
  32: 0, 33: 0, 34: 0,
  // Hitmonlee, Hitmonchan
  106: 0, 107: 0,
  // Tauros
  128: 0,
  // Tyrogue, Hitmontop
  236: 0, 237: 0,
  // Volbeat
  313: 0,
  // Latios
  381: 0,
  // Mothim
  414: 0,
  // Gallade
  475: 0,

  // --- 75% female (191) ---
  // Clefairy line
  35: 191, 36: 191,
  // Vulpix line
  37: 191, 38: 191,
  // Jigglypuff line
  39: 191, 40: 191,
  // Cleffa
  173: 191,
  // Igglybuff
  174: 191,
  // Corsola
  222: 191,
  // Azurill
  298: 191,
  // Skitty line
  300: 191, 301: 191,
  // Luvdisc
  370: 191,

  // --- Always female (254) ---
  // Nidoran-F line
  29: 254, 30: 254, 31: 254,
  // Chansey
  113: 254,
  // Kangaskhan
  115: 254,
  // Jynx
  124: 254,
  // Smoochum
  238: 254,
  // Miltank
  241: 254,
  // Blissey
  242: 254,
  // Illumise
  314: 254,
  // Latias
  380: 254,
  // Wormadam
  413: 254,
  // Vespiquen
  416: 254,
  // Happiny
  440: 254,
  // Froslass
  478: 254,
  // Cresselia
  488: 254,

  // --- Genderless (255) ---
  // Magnemite line
  81: 255, 82: 255,
  // Voltorb line
  100: 255, 101: 255,
  // Staryu line
  120: 255, 121: 255,
  // Ditto
  132: 255,
  // Porygon
  137: 255,
  // Legendary birds
  144: 255, 145: 255, 146: 255,
  // Mewtwo, Mew
  150: 255, 151: 255,
  // Unown
  201: 255,
  // Porygon2
  233: 255,
  // Legendary beasts
  243: 255, 244: 255, 245: 255,
  // Lugia, Ho-Oh, Celebi
  249: 255, 250: 255, 251: 255,
  // Shedinja
  292: 255,
  // Lunatone, Solrock
  337: 255, 338: 255,
  // Baltoy line
  343: 255, 344: 255,
  // Beldum line
  374: 255, 375: 255, 376: 255,
  // Regi trio
  377: 255, 378: 255, 379: 255,
  // Weather trio
  382: 255, 383: 255, 384: 255,
  // Jirachi, Deoxys
  385: 255, 386: 255,
  // Bronzor line
  436: 255, 437: 255,
  // Magnezone
  462: 255,
  // Porygon-Z
  474: 255,
  // Rotom
  479: 255,
  // Lake trio
  480: 255, 481: 255, 482: 255,
  // Dialga, Palkia
  483: 255, 484: 255,
  // Regigigas
  486: 255,
  // Giratina
  487: 255,
  // Phione, Manaphy
  489: 255, 490: 255,
  // Darkrai, Shaymin, Arceus
  491: 255, 492: 255, 493: 255,
};
