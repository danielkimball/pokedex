export interface EvolutionInfo {
  /** Species numbers in the evolution chain, in order */
  chain: number[];
  /** How this Pokemon evolves from the previous stage. null for base forms. */
  method: string | null;
  /** What this Pokemon evolves INTO, if anything */
  evolvesTo: { species: number; method: string }[] | null;
}

// Key is species number (1-493)
export const EVOLUTIONS: Record<number, EvolutionInfo> = {
  // Pokemon #1 - Bulbasaur
  1: {
    chain: [1, 2, 3],
    method: null,
    evolvesTo: [{ species: 2, method: 'Level 16' }],
  },
  // Pokemon #2 - Ivysaur
  2: {
    chain: [1, 2, 3],
    method: 'Level 16',
    evolvesTo: [{ species: 3, method: 'Level 32' }],
  },
  // Pokemon #3 - Venusaur
  3: {
    chain: [1, 2, 3],
    method: 'Level 32',
    evolvesTo: null,
  },
  // Pokemon #4 - Charmander
  4: {
    chain: [4, 5, 6],
    method: null,
    evolvesTo: [{ species: 5, method: 'Level 16' }],
  },
  // Pokemon #5 - Charmeleon
  5: {
    chain: [4, 5, 6],
    method: 'Level 16',
    evolvesTo: [{ species: 6, method: 'Level 36' }],
  },
  // Pokemon #6 - Charizard
  6: {
    chain: [4, 5, 6],
    method: 'Level 36',
    evolvesTo: null,
  },
  // Pokemon #7 - Squirtle
  7: {
    chain: [7, 8, 9],
    method: null,
    evolvesTo: [{ species: 8, method: 'Level 16' }],
  },
  // Pokemon #8 - Wartortle
  8: {
    chain: [7, 8, 9],
    method: 'Level 16',
    evolvesTo: [{ species: 9, method: 'Level 36' }],
  },
  // Pokemon #9 - Blastoise
  9: {
    chain: [7, 8, 9],
    method: 'Level 36',
    evolvesTo: null,
  },
  // Pokemon #10 - Caterpie
  10: {
    chain: [10, 11, 12],
    method: null,
    evolvesTo: [{ species: 11, method: 'Level 7' }],
  },
  // Pokemon #11 - Metapod
  11: {
    chain: [10, 11, 12],
    method: 'Level 7',
    evolvesTo: [{ species: 12, method: 'Level 10' }],
  },
  // Pokemon #12 - Butterfree
  12: {
    chain: [10, 11, 12],
    method: 'Level 10',
    evolvesTo: null,
  },
  // Pokemon #13 - Weedle
  13: {
    chain: [13, 14, 15],
    method: null,
    evolvesTo: [{ species: 14, method: 'Level 7' }],
  },
  // Pokemon #14 - Kakuna
  14: {
    chain: [13, 14, 15],
    method: 'Level 7',
    evolvesTo: [{ species: 15, method: 'Level 10' }],
  },
  // Pokemon #15 - Beedrill
  15: {
    chain: [13, 14, 15],
    method: 'Level 10',
    evolvesTo: null,
  },
  // Pokemon #16 - Pidgey
  16: {
    chain: [16, 17, 18],
    method: null,
    evolvesTo: [{ species: 17, method: 'Level 18' }],
  },
  // Pokemon #17 - Pidgeotto
  17: {
    chain: [16, 17, 18],
    method: 'Level 18',
    evolvesTo: [{ species: 18, method: 'Level 36' }],
  },
  // Pokemon #18 - Pidgeot
  18: {
    chain: [16, 17, 18],
    method: 'Level 36',
    evolvesTo: null,
  },
  // Pokemon #19 - Rattata
  19: {
    chain: [19, 20],
    method: null,
    evolvesTo: [{ species: 20, method: 'Level 20' }],
  },
  // Pokemon #20 - Raticate
  20: {
    chain: [19, 20],
    method: 'Level 20',
    evolvesTo: null,
  },
  // Pokemon #21 - Spearow
  21: {
    chain: [21, 22],
    method: null,
    evolvesTo: [{ species: 22, method: 'Level 20' }],
  },
  // Pokemon #22 - Fearow
  22: {
    chain: [21, 22],
    method: 'Level 20',
    evolvesTo: null,
  },
  // Pokemon #23 - Ekans
  23: {
    chain: [23, 24],
    method: null,
    evolvesTo: [{ species: 24, method: 'Level 22' }],
  },
  // Pokemon #24 - Arbok
  24: {
    chain: [23, 24],
    method: 'Level 22',
    evolvesTo: null,
  },
  // Pokemon #25 - Pikachu
  25: {
    chain: [172, 25, 26],
    method: 'Friendship',
    evolvesTo: [{ species: 26, method: 'Thunder Stone' }],
  },
  // Pokemon #26 - Raichu
  26: {
    chain: [172, 25, 26],
    method: 'Thunder Stone',
    evolvesTo: null,
  },
  // Pokemon #27 - Sandshrew
  27: {
    chain: [27, 28],
    method: null,
    evolvesTo: [{ species: 28, method: 'Level 22' }],
  },
  // Pokemon #28 - Sandslash
  28: {
    chain: [27, 28],
    method: 'Level 22',
    evolvesTo: null,
  },
  // Pokemon #29 - Nidoran♀
  29: {
    chain: [29, 30, 31],
    method: null,
    evolvesTo: [{ species: 30, method: 'Level 16' }],
  },
  // Pokemon #30 - Nidorina
  30: {
    chain: [29, 30, 31],
    method: 'Level 16',
    evolvesTo: [{ species: 31, method: 'Moon Stone' }],
  },
  // Pokemon #31 - Nidoqueen
  31: {
    chain: [29, 30, 31],
    method: 'Moon Stone',
    evolvesTo: null,
  },
  // Pokemon #32 - Nidoran♂
  32: {
    chain: [32, 33, 34],
    method: null,
    evolvesTo: [{ species: 33, method: 'Level 16' }],
  },
  // Pokemon #33 - Nidorino
  33: {
    chain: [32, 33, 34],
    method: 'Level 16',
    evolvesTo: [{ species: 34, method: 'Moon Stone' }],
  },
  // Pokemon #34 - Nidoking
  34: {
    chain: [32, 33, 34],
    method: 'Moon Stone',
    evolvesTo: null,
  },
  // Pokemon #35 - Clefairy
  35: {
    chain: [173, 35, 36],
    method: 'Friendship',
    evolvesTo: [{ species: 36, method: 'Moon Stone' }],
  },
  // Pokemon #36 - Clefable
  36: {
    chain: [173, 35, 36],
    method: 'Moon Stone',
    evolvesTo: null,
  },
  // Pokemon #37 - Vulpix
  37: {
    chain: [37, 38],
    method: null,
    evolvesTo: [{ species: 38, method: 'Fire Stone' }],
  },
  // Pokemon #38 - Ninetales
  38: {
    chain: [37, 38],
    method: 'Fire Stone',
    evolvesTo: null,
  },
  // Pokemon #39 - Jigglypuff
  39: {
    chain: [174, 39, 40],
    method: 'Friendship',
    evolvesTo: [{ species: 40, method: 'Moon Stone' }],
  },
  // Pokemon #40 - Wigglytuff
  40: {
    chain: [174, 39, 40],
    method: 'Moon Stone',
    evolvesTo: null,
  },
  // Pokemon #41 - Zubat
  41: {
    chain: [41, 42, 169],
    method: null,
    evolvesTo: [{ species: 42, method: 'Level 22' }],
  },
  // Pokemon #42 - Golbat
  42: {
    chain: [41, 42, 169],
    method: 'Level 22',
    evolvesTo: [{ species: 169, method: 'Friendship' }],
  },
  // Pokemon #43 - Oddish
  43: {
    chain: [43, 44, 45, 182],
    method: null,
    evolvesTo: [{ species: 44, method: 'Level 21' }],
  },
  // Pokemon #44 - Gloom
  44: {
    chain: [43, 44, 45, 182],
    method: 'Level 21',
    evolvesTo: [
      { species: 45, method: 'Leaf Stone' },
      { species: 182, method: 'Sun Stone' },
    ],
  },
  // Pokemon #45 - Vileplume
  45: {
    chain: [43, 44, 45, 182],
    method: 'Leaf Stone',
    evolvesTo: null,
  },
  // Pokemon #46 - Paras
  46: {
    chain: [46, 47],
    method: null,
    evolvesTo: [{ species: 47, method: 'Level 24' }],
  },
  // Pokemon #47 - Parasect
  47: {
    chain: [46, 47],
    method: 'Level 24',
    evolvesTo: null,
  },
  // Pokemon #48 - Venonat
  48: {
    chain: [48, 49],
    method: null,
    evolvesTo: [{ species: 49, method: 'Level 31' }],
  },
  // Pokemon #49 - Venomoth
  49: {
    chain: [48, 49],
    method: 'Level 31',
    evolvesTo: null,
  },
  // Pokemon #50 - Diglett
  50: {
    chain: [50, 51],
    method: null,
    evolvesTo: [{ species: 51, method: 'Level 26' }],
  },
  // Pokemon #51 - Dugtrio
  51: {
    chain: [50, 51],
    method: 'Level 26',
    evolvesTo: null,
  },
  // Pokemon #52 - Meowth
  52: {
    chain: [52, 53],
    method: null,
    evolvesTo: [{ species: 53, method: 'Level 28' }],
  },
  // Pokemon #53 - Persian
  53: {
    chain: [52, 53],
    method: 'Level 28',
    evolvesTo: null,
  },
  // Pokemon #54 - Psyduck
  54: {
    chain: [54, 55],
    method: null,
    evolvesTo: [{ species: 55, method: 'Level 33' }],
  },
  // Pokemon #55 - Golduck
  55: {
    chain: [54, 55],
    method: 'Level 33',
    evolvesTo: null,
  },
  // Pokemon #56 - Mankey
  56: {
    chain: [56, 57],
    method: null,
    evolvesTo: [{ species: 57, method: 'Level 28' }],
  },
  // Pokemon #57 - Primeape
  57: {
    chain: [56, 57],
    method: 'Level 28',
    evolvesTo: null,
  },
  // Pokemon #58 - Growlithe
  58: {
    chain: [58, 59],
    method: null,
    evolvesTo: [{ species: 59, method: 'Fire Stone' }],
  },
  // Pokemon #59 - Arcanine
  59: {
    chain: [58, 59],
    method: 'Fire Stone',
    evolvesTo: null,
  },
  // Pokemon #60 - Poliwag
  60: {
    chain: [60, 61, 62, 186],
    method: null,
    evolvesTo: [{ species: 61, method: 'Level 25' }],
  },
  // Pokemon #61 - Poliwhirl
  61: {
    chain: [60, 61, 62, 186],
    method: 'Level 25',
    evolvesTo: [
      { species: 62, method: 'Water Stone' },
      { species: 186, method: "Trade holding King's Rock" },
    ],
  },
  // Pokemon #62 - Poliwrath
  62: {
    chain: [60, 61, 62, 186],
    method: 'Water Stone',
    evolvesTo: null,
  },
  // Pokemon #63 - Abra
  63: {
    chain: [63, 64, 65],
    method: null,
    evolvesTo: [{ species: 64, method: 'Level 16' }],
  },
  // Pokemon #64 - Kadabra
  64: {
    chain: [63, 64, 65],
    method: 'Level 16',
    evolvesTo: [{ species: 65, method: 'Trade' }],
  },
  // Pokemon #65 - Alakazam
  65: {
    chain: [63, 64, 65],
    method: 'Trade',
    evolvesTo: null,
  },
  // Pokemon #66 - Machop
  66: {
    chain: [66, 67, 68],
    method: null,
    evolvesTo: [{ species: 67, method: 'Level 28' }],
  },
  // Pokemon #67 - Machoke
  67: {
    chain: [66, 67, 68],
    method: 'Level 28',
    evolvesTo: [{ species: 68, method: 'Trade' }],
  },
  // Pokemon #68 - Machamp
  68: {
    chain: [66, 67, 68],
    method: 'Trade',
    evolvesTo: null,
  },
  // Pokemon #69 - Bellsprout
  69: {
    chain: [69, 70, 71],
    method: null,
    evolvesTo: [{ species: 70, method: 'Level 21' }],
  },
  // Pokemon #70 - Weepinbell
  70: {
    chain: [69, 70, 71],
    method: 'Level 21',
    evolvesTo: [{ species: 71, method: 'Leaf Stone' }],
  },
  // Pokemon #71 - Victreebel
  71: {
    chain: [69, 70, 71],
    method: 'Leaf Stone',
    evolvesTo: null,
  },
  // Pokemon #72 - Tentacool
  72: {
    chain: [72, 73],
    method: null,
    evolvesTo: [{ species: 73, method: 'Level 30' }],
  },
  // Pokemon #73 - Tentacruel
  73: {
    chain: [72, 73],
    method: 'Level 30',
    evolvesTo: null,
  },
  // Pokemon #74 - Geodude
  74: {
    chain: [74, 75, 76],
    method: null,
    evolvesTo: [{ species: 75, method: 'Level 25' }],
  },
  // Pokemon #75 - Graveler
  75: {
    chain: [74, 75, 76],
    method: 'Level 25',
    evolvesTo: [{ species: 76, method: 'Trade' }],
  },
  // Pokemon #76 - Golem
  76: {
    chain: [74, 75, 76],
    method: 'Trade',
    evolvesTo: null,
  },
  // Pokemon #77 - Ponyta
  77: {
    chain: [77, 78],
    method: null,
    evolvesTo: [{ species: 78, method: 'Level 40' }],
  },
  // Pokemon #78 - Rapidash
  78: {
    chain: [77, 78],
    method: 'Level 40',
    evolvesTo: null,
  },
  // Pokemon #79 - Slowpoke
  79: {
    chain: [79, 80, 199],
    method: null,
    evolvesTo: [
      { species: 80, method: 'Level 37' },
      { species: 199, method: "Trade holding King's Rock" },
    ],
  },
  // Pokemon #80 - Slowbro
  80: {
    chain: [79, 80, 199],
    method: 'Level 37',
    evolvesTo: null,
  },
  // Pokemon #81 - Magnemite
  81: {
    chain: [81, 82, 462],
    method: null,
    evolvesTo: [{ species: 82, method: 'Level 30' }],
  },
  // Pokemon #82 - Magneton
  82: {
    chain: [81, 82, 462],
    method: 'Level 30',
    evolvesTo: [{ species: 462, method: 'Level up at Mt. Coronet' }],
  },
  // Pokemon #83 - Farfetch'd
  83: {
    chain: [83],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #84 - Doduo
  84: {
    chain: [84, 85],
    method: null,
    evolvesTo: [{ species: 85, method: 'Level 31' }],
  },
  // Pokemon #85 - Dodrio
  85: {
    chain: [84, 85],
    method: 'Level 31',
    evolvesTo: null,
  },
  // Pokemon #86 - Seel
  86: {
    chain: [86, 87],
    method: null,
    evolvesTo: [{ species: 87, method: 'Level 34' }],
  },
  // Pokemon #87 - Dewgong
  87: {
    chain: [86, 87],
    method: 'Level 34',
    evolvesTo: null,
  },
  // Pokemon #88 - Grimer
  88: {
    chain: [88, 89],
    method: null,
    evolvesTo: [{ species: 89, method: 'Level 38' }],
  },
  // Pokemon #89 - Muk
  89: {
    chain: [88, 89],
    method: 'Level 38',
    evolvesTo: null,
  },
  // Pokemon #90 - Shellder
  90: {
    chain: [90, 91],
    method: null,
    evolvesTo: [{ species: 91, method: 'Water Stone' }],
  },
  // Pokemon #91 - Cloyster
  91: {
    chain: [90, 91],
    method: 'Water Stone',
    evolvesTo: null,
  },
  // Pokemon #92 - Gastly
  92: {
    chain: [92, 93, 94],
    method: null,
    evolvesTo: [{ species: 93, method: 'Level 25' }],
  },
  // Pokemon #93 - Haunter
  93: {
    chain: [92, 93, 94],
    method: 'Level 25',
    evolvesTo: [{ species: 94, method: 'Trade' }],
  },
  // Pokemon #94 - Gengar
  94: {
    chain: [92, 93, 94],
    method: 'Trade',
    evolvesTo: null,
  },
  // Pokemon #95 - Onix
  95: {
    chain: [95, 208],
    method: null,
    evolvesTo: [{ species: 208, method: 'Trade holding Metal Coat' }],
  },
  // Pokemon #96 - Drowzee
  96: {
    chain: [96, 97],
    method: null,
    evolvesTo: [{ species: 97, method: 'Level 26' }],
  },
  // Pokemon #97 - Hypno
  97: {
    chain: [96, 97],
    method: 'Level 26',
    evolvesTo: null,
  },
  // Pokemon #98 - Krabby
  98: {
    chain: [98, 99],
    method: null,
    evolvesTo: [{ species: 99, method: 'Level 28' }],
  },
  // Pokemon #99 - Kingler
  99: {
    chain: [98, 99],
    method: 'Level 28',
    evolvesTo: null,
  },
  // Pokemon #100 - Voltorb
  100: {
    chain: [100, 101],
    method: null,
    evolvesTo: [{ species: 101, method: 'Level 30' }],
  },
  // Pokemon #101 - Electrode
  101: {
    chain: [100, 101],
    method: 'Level 30',
    evolvesTo: null,
  },
  // Pokemon #102 - Exeggcute
  102: {
    chain: [102, 103],
    method: null,
    evolvesTo: [{ species: 103, method: 'Leaf Stone' }],
  },
  // Pokemon #103 - Exeggutor
  103: {
    chain: [102, 103],
    method: 'Leaf Stone',
    evolvesTo: null,
  },
  // Pokemon #104 - Cubone
  104: {
    chain: [104, 105],
    method: null,
    evolvesTo: [{ species: 105, method: 'Level 28' }],
  },
  // Pokemon #105 - Marowak
  105: {
    chain: [104, 105],
    method: 'Level 28',
    evolvesTo: null,
  },
  // Pokemon #106 - Hitmonlee
  106: {
    chain: [236, 106, 107, 237],
    method: 'Level 20 (Attack > Defense)',
    evolvesTo: null,
  },
  // Pokemon #107 - Hitmonchan
  107: {
    chain: [236, 106, 107, 237],
    method: 'Level 20 (Defense > Attack)',
    evolvesTo: null,
  },
  // Pokemon #108 - Lickitung
  108: {
    chain: [108, 463],
    method: null,
    evolvesTo: [{ species: 463, method: 'Level up knowing Rollout' }],
  },
  // Pokemon #109 - Koffing
  109: {
    chain: [109, 110],
    method: null,
    evolvesTo: [{ species: 110, method: 'Level 35' }],
  },
  // Pokemon #110 - Weezing
  110: {
    chain: [109, 110],
    method: 'Level 35',
    evolvesTo: null,
  },
  // Pokemon #111 - Rhyhorn
  111: {
    chain: [111, 112, 464],
    method: null,
    evolvesTo: [{ species: 112, method: 'Level 42' }],
  },
  // Pokemon #112 - Rhydon
  112: {
    chain: [111, 112, 464],
    method: 'Level 42',
    evolvesTo: [{ species: 464, method: 'Trade holding Protector' }],
  },
  // Pokemon #113 - Chansey
  113: {
    chain: [440, 113, 242],
    method: 'Oval Stone (Day)',
    evolvesTo: [{ species: 242, method: 'Friendship' }],
  },
  // Pokemon #114 - Tangela
  114: {
    chain: [114, 465],
    method: null,
    evolvesTo: [{ species: 465, method: 'Level up knowing Ancient Power' }],
  },
  // Pokemon #115 - Kangaskhan
  115: {
    chain: [115],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #116 - Horsea
  116: {
    chain: [116, 117, 230],
    method: null,
    evolvesTo: [{ species: 117, method: 'Level 32' }],
  },
  // Pokemon #117 - Seadra
  117: {
    chain: [116, 117, 230],
    method: 'Level 32',
    evolvesTo: [{ species: 230, method: 'Trade holding Dragon Scale' }],
  },
  // Pokemon #118 - Goldeen
  118: {
    chain: [118, 119],
    method: null,
    evolvesTo: [{ species: 119, method: 'Level 33' }],
  },
  // Pokemon #119 - Seaking
  119: {
    chain: [118, 119],
    method: 'Level 33',
    evolvesTo: null,
  },
  // Pokemon #120 - Staryu
  120: {
    chain: [120, 121],
    method: null,
    evolvesTo: [{ species: 121, method: 'Water Stone' }],
  },
  // Pokemon #121 - Starmie
  121: {
    chain: [120, 121],
    method: 'Water Stone',
    evolvesTo: null,
  },
  // Pokemon #122 - Mr. Mime
  122: {
    chain: [439, 122],
    method: 'Level up knowing Mimic',
    evolvesTo: null,
  },
  // Pokemon #123 - Scyther
  123: {
    chain: [123, 212],
    method: null,
    evolvesTo: [{ species: 212, method: 'Trade holding Metal Coat' }],
  },
  // Pokemon #124 - Jynx
  124: {
    chain: [238, 124],
    method: 'Level 30',
    evolvesTo: null,
  },
  // Pokemon #125 - Electabuzz
  125: {
    chain: [239, 125, 466],
    method: 'Level 30',
    evolvesTo: [{ species: 466, method: 'Trade holding Electirizer' }],
  },
  // Pokemon #126 - Magmar
  126: {
    chain: [240, 126, 467],
    method: 'Level 30',
    evolvesTo: [{ species: 467, method: 'Trade holding Magmarizer' }],
  },
  // Pokemon #127 - Pinsir
  127: {
    chain: [127],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #128 - Tauros
  128: {
    chain: [128],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #129 - Magikarp
  129: {
    chain: [129, 130],
    method: null,
    evolvesTo: [{ species: 130, method: 'Level 20' }],
  },
  // Pokemon #130 - Gyarados
  130: {
    chain: [129, 130],
    method: 'Level 20',
    evolvesTo: null,
  },
  // Pokemon #131 - Lapras
  131: {
    chain: [131],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #132 - Ditto
  132: {
    chain: [132],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #133 - Eevee
  133: {
    chain: [133, 134, 135, 136, 196, 197, 470, 471],
    method: null,
    evolvesTo: [
      { species: 134, method: 'Water Stone' },
      { species: 135, method: 'Thunder Stone' },
      { species: 136, method: 'Fire Stone' },
      { species: 196, method: 'Friendship (Day)' },
      { species: 197, method: 'Friendship (Night)' },
      { species: 470, method: 'Level up near Moss Rock' },
      { species: 471, method: 'Level up near Ice Rock' },
    ],
  },
  // Pokemon #134 - Vaporeon
  134: {
    chain: [133, 134, 135, 136, 196, 197, 470, 471],
    method: 'Water Stone',
    evolvesTo: null,
  },
  // Pokemon #135 - Jolteon
  135: {
    chain: [133, 134, 135, 136, 196, 197, 470, 471],
    method: 'Thunder Stone',
    evolvesTo: null,
  },
  // Pokemon #136 - Flareon
  136: {
    chain: [133, 134, 135, 136, 196, 197, 470, 471],
    method: 'Fire Stone',
    evolvesTo: null,
  },
  // Pokemon #137 - Porygon
  137: {
    chain: [137, 233, 474],
    method: null,
    evolvesTo: [{ species: 233, method: 'Trade holding Up-Grade' }],
  },
  // Pokemon #138 - Omanyte
  138: {
    chain: [138, 139],
    method: null,
    evolvesTo: [{ species: 139, method: 'Level 40' }],
  },
  // Pokemon #139 - Omastar
  139: {
    chain: [138, 139],
    method: 'Level 40',
    evolvesTo: null,
  },
  // Pokemon #140 - Kabuto
  140: {
    chain: [140, 141],
    method: null,
    evolvesTo: [{ species: 141, method: 'Level 40' }],
  },
  // Pokemon #141 - Kabutops
  141: {
    chain: [140, 141],
    method: 'Level 40',
    evolvesTo: null,
  },
  // Pokemon #142 - Aerodactyl
  142: {
    chain: [142],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #143 - Snorlax
  143: {
    chain: [446, 143],
    method: 'Friendship',
    evolvesTo: null,
  },
  // Pokemon #144 - Articuno
  144: {
    chain: [144],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #145 - Zapdos
  145: {
    chain: [145],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #146 - Moltres
  146: {
    chain: [146],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #147 - Dratini
  147: {
    chain: [147, 148, 149],
    method: null,
    evolvesTo: [{ species: 148, method: 'Level 30' }],
  },
  // Pokemon #148 - Dragonair
  148: {
    chain: [147, 148, 149],
    method: 'Level 30',
    evolvesTo: [{ species: 149, method: 'Level 55' }],
  },
  // Pokemon #149 - Dragonite
  149: {
    chain: [147, 148, 149],
    method: 'Level 55',
    evolvesTo: null,
  },
  // Pokemon #150 - Mewtwo
  150: {
    chain: [150],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #151 - Mew
  151: {
    chain: [151],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #152 - Chikorita
  152: {
    chain: [152, 153, 154],
    method: null,
    evolvesTo: [{ species: 153, method: 'Level 16' }],
  },
  // Pokemon #153 - Bayleef
  153: {
    chain: [152, 153, 154],
    method: 'Level 16',
    evolvesTo: [{ species: 154, method: 'Level 32' }],
  },
  // Pokemon #154 - Meganium
  154: {
    chain: [152, 153, 154],
    method: 'Level 32',
    evolvesTo: null,
  },
  // Pokemon #155 - Cyndaquil
  155: {
    chain: [155, 156, 157],
    method: null,
    evolvesTo: [{ species: 156, method: 'Level 14' }],
  },
  // Pokemon #156 - Quilava
  156: {
    chain: [155, 156, 157],
    method: 'Level 14',
    evolvesTo: [{ species: 157, method: 'Level 36' }],
  },
  // Pokemon #157 - Typhlosion
  157: {
    chain: [155, 156, 157],
    method: 'Level 36',
    evolvesTo: null,
  },
  // Pokemon #158 - Totodile
  158: {
    chain: [158, 159, 160],
    method: null,
    evolvesTo: [{ species: 159, method: 'Level 18' }],
  },
  // Pokemon #159 - Croconaw
  159: {
    chain: [158, 159, 160],
    method: 'Level 18',
    evolvesTo: [{ species: 160, method: 'Level 30' }],
  },
  // Pokemon #160 - Feraligatr
  160: {
    chain: [158, 159, 160],
    method: 'Level 30',
    evolvesTo: null,
  },
  // Pokemon #161 - Sentret
  161: {
    chain: [161, 162],
    method: null,
    evolvesTo: [{ species: 162, method: 'Level 15' }],
  },
  // Pokemon #162 - Furret
  162: {
    chain: [161, 162],
    method: 'Level 15',
    evolvesTo: null,
  },
  // Pokemon #163 - Hoothoot
  163: {
    chain: [163, 164],
    method: null,
    evolvesTo: [{ species: 164, method: 'Level 20' }],
  },
  // Pokemon #164 - Noctowl
  164: {
    chain: [163, 164],
    method: 'Level 20',
    evolvesTo: null,
  },
  // Pokemon #165 - Ledyba
  165: {
    chain: [165, 166],
    method: null,
    evolvesTo: [{ species: 166, method: 'Level 18' }],
  },
  // Pokemon #166 - Ledian
  166: {
    chain: [165, 166],
    method: 'Level 18',
    evolvesTo: null,
  },
  // Pokemon #167 - Spinarak
  167: {
    chain: [167, 168],
    method: null,
    evolvesTo: [{ species: 168, method: 'Level 22' }],
  },
  // Pokemon #168 - Ariados
  168: {
    chain: [167, 168],
    method: 'Level 22',
    evolvesTo: null,
  },
  // Pokemon #169 - Crobat
  169: {
    chain: [41, 42, 169],
    method: 'Friendship',
    evolvesTo: null,
  },
  // Pokemon #170 - Chinchou
  170: {
    chain: [170, 171],
    method: null,
    evolvesTo: [{ species: 171, method: 'Level 27' }],
  },
  // Pokemon #171 - Lanturn
  171: {
    chain: [170, 171],
    method: 'Level 27',
    evolvesTo: null,
  },
  // Pokemon #172 - Pichu
  172: {
    chain: [172, 25, 26],
    method: null,
    evolvesTo: [{ species: 25, method: 'Friendship' }],
  },
  // Pokemon #173 - Cleffa
  173: {
    chain: [173, 35, 36],
    method: null,
    evolvesTo: [{ species: 35, method: 'Friendship' }],
  },
  // Pokemon #174 - Igglybuff
  174: {
    chain: [174, 39, 40],
    method: null,
    evolvesTo: [{ species: 39, method: 'Friendship' }],
  },
  // Pokemon #175 - Togepi
  175: {
    chain: [175, 176, 468],
    method: null,
    evolvesTo: [{ species: 176, method: 'Friendship' }],
  },
  // Pokemon #176 - Togetic
  176: {
    chain: [175, 176, 468],
    method: 'Friendship',
    evolvesTo: [{ species: 468, method: 'Shiny Stone' }],
  },
  // Pokemon #177 - Natu
  177: {
    chain: [177, 178],
    method: null,
    evolvesTo: [{ species: 178, method: 'Level 25' }],
  },
  // Pokemon #178 - Xatu
  178: {
    chain: [177, 178],
    method: 'Level 25',
    evolvesTo: null,
  },
  // Pokemon #179 - Mareep
  179: {
    chain: [179, 180, 181],
    method: null,
    evolvesTo: [{ species: 180, method: 'Level 15' }],
  },
  // Pokemon #180 - Flaaffy
  180: {
    chain: [179, 180, 181],
    method: 'Level 15',
    evolvesTo: [{ species: 181, method: 'Level 30' }],
  },
  // Pokemon #181 - Ampharos
  181: {
    chain: [179, 180, 181],
    method: 'Level 30',
    evolvesTo: null,
  },
  // Pokemon #182 - Bellossom
  182: {
    chain: [43, 44, 45, 182],
    method: 'Sun Stone',
    evolvesTo: null,
  },
  // Pokemon #183 - Marill
  183: {
    chain: [298, 183, 184],
    method: 'Friendship',
    evolvesTo: [{ species: 184, method: 'Level 18' }],
  },
  // Pokemon #184 - Azumarill
  184: {
    chain: [298, 183, 184],
    method: 'Level 18',
    evolvesTo: null,
  },
  // Pokemon #185 - Sudowoodo
  185: {
    chain: [438, 185],
    method: 'Level up knowing Mimic',
    evolvesTo: null,
  },
  // Pokemon #186 - Politoed
  186: {
    chain: [60, 61, 62, 186],
    method: "Trade holding King's Rock",
    evolvesTo: null,
  },
  // Pokemon #187 - Hoppip
  187: {
    chain: [187, 188, 189],
    method: null,
    evolvesTo: [{ species: 188, method: 'Level 18' }],
  },
  // Pokemon #188 - Skiploom
  188: {
    chain: [187, 188, 189],
    method: 'Level 18',
    evolvesTo: [{ species: 189, method: 'Level 27' }],
  },
  // Pokemon #189 - Jumpluff
  189: {
    chain: [187, 188, 189],
    method: 'Level 27',
    evolvesTo: null,
  },
  // Pokemon #190 - Aipom
  190: {
    chain: [190, 424],
    method: null,
    evolvesTo: [{ species: 424, method: 'Level up knowing Double Hit' }],
  },
  // Pokemon #191 - Sunkern
  191: {
    chain: [191, 192],
    method: null,
    evolvesTo: [{ species: 192, method: 'Sun Stone' }],
  },
  // Pokemon #192 - Sunflora
  192: {
    chain: [191, 192],
    method: 'Sun Stone',
    evolvesTo: null,
  },
  // Pokemon #193 - Yanma
  193: {
    chain: [193, 469],
    method: null,
    evolvesTo: [{ species: 469, method: 'Level up knowing Ancient Power' }],
  },
  // Pokemon #194 - Wooper
  194: {
    chain: [194, 195],
    method: null,
    evolvesTo: [{ species: 195, method: 'Level 20' }],
  },
  // Pokemon #195 - Quagsire
  195: {
    chain: [194, 195],
    method: 'Level 20',
    evolvesTo: null,
  },
  // Pokemon #196 - Espeon
  196: {
    chain: [133, 134, 135, 136, 196, 197, 470, 471],
    method: 'Friendship (Day)',
    evolvesTo: null,
  },
  // Pokemon #197 - Umbreon
  197: {
    chain: [133, 134, 135, 136, 196, 197, 470, 471],
    method: 'Friendship (Night)',
    evolvesTo: null,
  },
  // Pokemon #198 - Murkrow
  198: {
    chain: [198, 430],
    method: null,
    evolvesTo: [{ species: 430, method: 'Dusk Stone' }],
  },
  // Pokemon #199 - Slowking
  199: {
    chain: [79, 80, 199],
    method: "Trade holding King's Rock",
    evolvesTo: null,
  },
  // Pokemon #200 - Misdreavus
  200: {
    chain: [200, 429],
    method: null,
    evolvesTo: [{ species: 429, method: 'Dusk Stone' }],
  },
  // Pokemon #201 - Unown
  201: {
    chain: [201],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #202 - Wobbuffet
  202: {
    chain: [360, 202],
    method: 'Level 15',
    evolvesTo: null,
  },
  // Pokemon #203 - Girafarig
  203: {
    chain: [203],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #204 - Pineco
  204: {
    chain: [204, 205],
    method: null,
    evolvesTo: [{ species: 205, method: 'Level 31' }],
  },
  // Pokemon #205 - Forretress
  205: {
    chain: [204, 205],
    method: 'Level 31',
    evolvesTo: null,
  },
  // Pokemon #206 - Dunsparce
  206: {
    chain: [206],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #207 - Gligar
  207: {
    chain: [207, 472],
    method: null,
    evolvesTo: [{ species: 472, method: 'Level up holding Razor Fang (Night)' }],
  },
  // Pokemon #208 - Steelix
  208: {
    chain: [95, 208],
    method: 'Trade holding Metal Coat',
    evolvesTo: null,
  },
  // Pokemon #209 - Snubbull
  209: {
    chain: [209, 210],
    method: null,
    evolvesTo: [{ species: 210, method: 'Level 23' }],
  },
  // Pokemon #210 - Granbull
  210: {
    chain: [209, 210],
    method: 'Level 23',
    evolvesTo: null,
  },
  // Pokemon #211 - Qwilfish
  211: {
    chain: [211],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #212 - Scizor
  212: {
    chain: [123, 212],
    method: 'Trade holding Metal Coat',
    evolvesTo: null,
  },
  // Pokemon #213 - Shuckle
  213: {
    chain: [213],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #214 - Heracross
  214: {
    chain: [214],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #215 - Sneasel
  215: {
    chain: [215, 461],
    method: null,
    evolvesTo: [{ species: 461, method: 'Level up holding Razor Claw (Night)' }],
  },
  // Pokemon #216 - Teddiursa
  216: {
    chain: [216, 217],
    method: null,
    evolvesTo: [{ species: 217, method: 'Level 30' }],
  },
  // Pokemon #217 - Ursaring
  217: {
    chain: [216, 217],
    method: 'Level 30',
    evolvesTo: null,
  },
  // Pokemon #218 - Slugma
  218: {
    chain: [218, 219],
    method: null,
    evolvesTo: [{ species: 219, method: 'Level 38' }],
  },
  // Pokemon #219 - Magcargo
  219: {
    chain: [218, 219],
    method: 'Level 38',
    evolvesTo: null,
  },
  // Pokemon #220 - Swinub
  220: {
    chain: [220, 221, 473],
    method: null,
    evolvesTo: [{ species: 221, method: 'Level 33' }],
  },
  // Pokemon #221 - Piloswine
  221: {
    chain: [220, 221, 473],
    method: 'Level 33',
    evolvesTo: [{ species: 473, method: 'Level up knowing Ancient Power' }],
  },
  // Pokemon #222 - Corsola
  222: {
    chain: [222],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #223 - Remoraid
  223: {
    chain: [223, 224],
    method: null,
    evolvesTo: [{ species: 224, method: 'Level 25' }],
  },
  // Pokemon #224 - Octillery
  224: {
    chain: [223, 224],
    method: 'Level 25',
    evolvesTo: null,
  },
  // Pokemon #225 - Delibird
  225: {
    chain: [225],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #226 - Mantine
  226: {
    chain: [458, 226],
    method: 'Level up with Remoraid in party',
    evolvesTo: null,
  },
  // Pokemon #227 - Skarmory
  227: {
    chain: [227],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #228 - Houndour
  228: {
    chain: [228, 229],
    method: null,
    evolvesTo: [{ species: 229, method: 'Level 24' }],
  },
  // Pokemon #229 - Houndoom
  229: {
    chain: [228, 229],
    method: 'Level 24',
    evolvesTo: null,
  },
  // Pokemon #230 - Kingdra
  230: {
    chain: [116, 117, 230],
    method: 'Trade holding Dragon Scale',
    evolvesTo: null,
  },
  // Pokemon #231 - Phanpy
  231: {
    chain: [231, 232],
    method: null,
    evolvesTo: [{ species: 232, method: 'Level 25' }],
  },
  // Pokemon #232 - Donphan
  232: {
    chain: [231, 232],
    method: 'Level 25',
    evolvesTo: null,
  },
  // Pokemon #233 - Porygon2
  233: {
    chain: [137, 233, 474],
    method: 'Trade holding Up-Grade',
    evolvesTo: [{ species: 474, method: 'Trade holding Dubious Disc' }],
  },
  // Pokemon #234 - Stantler
  234: {
    chain: [234],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #235 - Smeargle
  235: {
    chain: [235],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #236 - Tyrogue
  236: {
    chain: [236, 106, 107, 237],
    method: null,
    evolvesTo: [
      { species: 106, method: 'Level 20 (Attack > Defense)' },
      { species: 107, method: 'Level 20 (Defense > Attack)' },
      { species: 237, method: 'Level 20 (Attack = Defense)' },
    ],
  },
  // Pokemon #237 - Hitmontop
  237: {
    chain: [236, 106, 107, 237],
    method: 'Level 20 (Attack = Defense)',
    evolvesTo: null,
  },
  // Pokemon #238 - Smoochum
  238: {
    chain: [238, 124],
    method: null,
    evolvesTo: [{ species: 124, method: 'Level 30' }],
  },
  // Pokemon #239 - Elekid
  239: {
    chain: [239, 125, 466],
    method: null,
    evolvesTo: [{ species: 125, method: 'Level 30' }],
  },
  // Pokemon #240 - Magby
  240: {
    chain: [240, 126, 467],
    method: null,
    evolvesTo: [{ species: 126, method: 'Level 30' }],
  },
  // Pokemon #241 - Miltank
  241: {
    chain: [241],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #242 - Blissey
  242: {
    chain: [440, 113, 242],
    method: 'Friendship',
    evolvesTo: null,
  },
  // Pokemon #243 - Raikou
  243: {
    chain: [243],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #244 - Entei
  244: {
    chain: [244],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #245 - Suicune
  245: {
    chain: [245],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #246 - Larvitar
  246: {
    chain: [246, 247, 248],
    method: null,
    evolvesTo: [{ species: 247, method: 'Level 30' }],
  },
  // Pokemon #247 - Pupitar
  247: {
    chain: [246, 247, 248],
    method: 'Level 30',
    evolvesTo: [{ species: 248, method: 'Level 55' }],
  },
  // Pokemon #248 - Tyranitar
  248: {
    chain: [246, 247, 248],
    method: 'Level 55',
    evolvesTo: null,
  },
  // Pokemon #249 - Lugia
  249: {
    chain: [249],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #250 - Ho-Oh
  250: {
    chain: [250],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #251 - Celebi
  251: {
    chain: [251],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #252 - Treecko
  252: {
    chain: [252, 253, 254],
    method: null,
    evolvesTo: [{ species: 253, method: 'Level 16' }],
  },
  // Pokemon #253 - Grovyle
  253: {
    chain: [252, 253, 254],
    method: 'Level 16',
    evolvesTo: [{ species: 254, method: 'Level 36' }],
  },
  // Pokemon #254 - Sceptile
  254: {
    chain: [252, 253, 254],
    method: 'Level 36',
    evolvesTo: null,
  },
  // Pokemon #255 - Torchic
  255: {
    chain: [255, 256, 257],
    method: null,
    evolvesTo: [{ species: 256, method: 'Level 16' }],
  },
  // Pokemon #256 - Combusken
  256: {
    chain: [255, 256, 257],
    method: 'Level 16',
    evolvesTo: [{ species: 257, method: 'Level 36' }],
  },
  // Pokemon #257 - Blaziken
  257: {
    chain: [255, 256, 257],
    method: 'Level 36',
    evolvesTo: null,
  },
  // Pokemon #258 - Mudkip
  258: {
    chain: [258, 259, 260],
    method: null,
    evolvesTo: [{ species: 259, method: 'Level 16' }],
  },
  // Pokemon #259 - Marshtomp
  259: {
    chain: [258, 259, 260],
    method: 'Level 16',
    evolvesTo: [{ species: 260, method: 'Level 36' }],
  },
  // Pokemon #260 - Swampert
  260: {
    chain: [258, 259, 260],
    method: 'Level 36',
    evolvesTo: null,
  },
  // Pokemon #261 - Poochyena
  261: {
    chain: [261, 262],
    method: null,
    evolvesTo: [{ species: 262, method: 'Level 18' }],
  },
  // Pokemon #262 - Mightyena
  262: {
    chain: [261, 262],
    method: 'Level 18',
    evolvesTo: null,
  },
  // Pokemon #263 - Zigzagoon
  263: {
    chain: [263, 264],
    method: null,
    evolvesTo: [{ species: 264, method: 'Level 20' }],
  },
  // Pokemon #264 - Linoone
  264: {
    chain: [263, 264],
    method: 'Level 20',
    evolvesTo: null,
  },
  // Pokemon #265 - Wurmple
  265: {
    chain: [265, 266, 267, 268, 269],
    method: null,
    evolvesTo: [
      { species: 266, method: 'Level 7 (random, personality)' },
      { species: 268, method: 'Level 7 (random, personality)' },
    ],
  },
  // Pokemon #266 - Silcoon
  266: {
    chain: [265, 266, 267, 268, 269],
    method: 'Level 7 (random, personality)',
    evolvesTo: [{ species: 267, method: 'Level 10' }],
  },
  // Pokemon #267 - Beautifly
  267: {
    chain: [265, 266, 267, 268, 269],
    method: 'Level 10',
    evolvesTo: null,
  },
  // Pokemon #268 - Cascoon
  268: {
    chain: [265, 266, 267, 268, 269],
    method: 'Level 7 (random, personality)',
    evolvesTo: [{ species: 269, method: 'Level 10' }],
  },
  // Pokemon #269 - Dustox
  269: {
    chain: [265, 266, 267, 268, 269],
    method: 'Level 10',
    evolvesTo: null,
  },
  // Pokemon #270 - Lotad
  270: {
    chain: [270, 271, 272],
    method: null,
    evolvesTo: [{ species: 271, method: 'Level 14' }],
  },
  // Pokemon #271 - Lombre
  271: {
    chain: [270, 271, 272],
    method: 'Level 14',
    evolvesTo: [{ species: 272, method: 'Water Stone' }],
  },
  // Pokemon #272 - Ludicolo
  272: {
    chain: [270, 271, 272],
    method: 'Water Stone',
    evolvesTo: null,
  },
  // Pokemon #273 - Seedot
  273: {
    chain: [273, 274, 275],
    method: null,
    evolvesTo: [{ species: 274, method: 'Level 14' }],
  },
  // Pokemon #274 - Nuzleaf
  274: {
    chain: [273, 274, 275],
    method: 'Level 14',
    evolvesTo: [{ species: 275, method: 'Leaf Stone' }],
  },
  // Pokemon #275 - Shiftry
  275: {
    chain: [273, 274, 275],
    method: 'Leaf Stone',
    evolvesTo: null,
  },
  // Pokemon #276 - Taillow
  276: {
    chain: [276, 277],
    method: null,
    evolvesTo: [{ species: 277, method: 'Level 22' }],
  },
  // Pokemon #277 - Swellow
  277: {
    chain: [276, 277],
    method: 'Level 22',
    evolvesTo: null,
  },
  // Pokemon #278 - Wingull
  278: {
    chain: [278, 279],
    method: null,
    evolvesTo: [{ species: 279, method: 'Level 25' }],
  },
  // Pokemon #279 - Pelipper
  279: {
    chain: [278, 279],
    method: 'Level 25',
    evolvesTo: null,
  },
  // Pokemon #280 - Ralts
  280: {
    chain: [280, 281, 282, 475],
    method: null,
    evolvesTo: [{ species: 281, method: 'Level 20' }],
  },
  // Pokemon #281 - Kirlia
  281: {
    chain: [280, 281, 282, 475],
    method: 'Level 20',
    evolvesTo: [
      { species: 282, method: 'Level 30' },
      { species: 475, method: 'Dawn Stone (male)' },
    ],
  },
  // Pokemon #282 - Gardevoir
  282: {
    chain: [280, 281, 282, 475],
    method: 'Level 30',
    evolvesTo: null,
  },
  // Pokemon #283 - Surskit
  283: {
    chain: [283, 284],
    method: null,
    evolvesTo: [{ species: 284, method: 'Level 22' }],
  },
  // Pokemon #284 - Masquerain
  284: {
    chain: [283, 284],
    method: 'Level 22',
    evolvesTo: null,
  },
  // Pokemon #285 - Shroomish
  285: {
    chain: [285, 286],
    method: null,
    evolvesTo: [{ species: 286, method: 'Level 23' }],
  },
  // Pokemon #286 - Breloom
  286: {
    chain: [285, 286],
    method: 'Level 23',
    evolvesTo: null,
  },
  // Pokemon #287 - Slakoth
  287: {
    chain: [287, 288, 289],
    method: null,
    evolvesTo: [{ species: 288, method: 'Level 18' }],
  },
  // Pokemon #288 - Vigoroth
  288: {
    chain: [287, 288, 289],
    method: 'Level 18',
    evolvesTo: [{ species: 289, method: 'Level 36' }],
  },
  // Pokemon #289 - Slaking
  289: {
    chain: [287, 288, 289],
    method: 'Level 36',
    evolvesTo: null,
  },
  // Pokemon #290 - Nincada
  290: {
    chain: [290, 291, 292],
    method: null,
    evolvesTo: [
      { species: 291, method: 'Level 20' },
      { species: 292, method: 'Level 20 (empty party slot + Poke Ball)' },
    ],
  },
  // Pokemon #291 - Ninjask
  291: {
    chain: [290, 291, 292],
    method: 'Level 20',
    evolvesTo: null,
  },
  // Pokemon #292 - Shedinja
  292: {
    chain: [290, 291, 292],
    method: 'Level 20 (empty party slot + Poke Ball)',
    evolvesTo: null,
  },
  // Pokemon #293 - Whismur
  293: {
    chain: [293, 294, 295],
    method: null,
    evolvesTo: [{ species: 294, method: 'Level 20' }],
  },
  // Pokemon #294 - Loudred
  294: {
    chain: [293, 294, 295],
    method: 'Level 20',
    evolvesTo: [{ species: 295, method: 'Level 40' }],
  },
  // Pokemon #295 - Exploud
  295: {
    chain: [293, 294, 295],
    method: 'Level 40',
    evolvesTo: null,
  },
  // Pokemon #296 - Makuhita
  296: {
    chain: [296, 297],
    method: null,
    evolvesTo: [{ species: 297, method: 'Level 24' }],
  },
  // Pokemon #297 - Hariyama
  297: {
    chain: [296, 297],
    method: 'Level 24',
    evolvesTo: null,
  },
  // Pokemon #298 - Azurill
  298: {
    chain: [298, 183, 184],
    method: null,
    evolvesTo: [{ species: 183, method: 'Friendship' }],
  },
  // Pokemon #299 - Nosepass
  299: {
    chain: [299, 476],
    method: null,
    evolvesTo: [{ species: 476, method: 'Level up at Mt. Coronet' }],
  },
  // Pokemon #300 - Skitty
  300: {
    chain: [300, 301],
    method: null,
    evolvesTo: [{ species: 301, method: 'Moon Stone' }],
  },
  // Pokemon #301 - Delcatty
  301: {
    chain: [300, 301],
    method: 'Moon Stone',
    evolvesTo: null,
  },
  // Pokemon #302 - Sableye
  302: {
    chain: [302],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #303 - Mawile
  303: {
    chain: [303],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #304 - Aron
  304: {
    chain: [304, 305, 306],
    method: null,
    evolvesTo: [{ species: 305, method: 'Level 32' }],
  },
  // Pokemon #305 - Lairon
  305: {
    chain: [304, 305, 306],
    method: 'Level 32',
    evolvesTo: [{ species: 306, method: 'Level 42' }],
  },
  // Pokemon #306 - Aggron
  306: {
    chain: [304, 305, 306],
    method: 'Level 42',
    evolvesTo: null,
  },
  // Pokemon #307 - Meditite
  307: {
    chain: [307, 308],
    method: null,
    evolvesTo: [{ species: 308, method: 'Level 37' }],
  },
  // Pokemon #308 - Medicham
  308: {
    chain: [307, 308],
    method: 'Level 37',
    evolvesTo: null,
  },
  // Pokemon #309 - Electrike
  309: {
    chain: [309, 310],
    method: null,
    evolvesTo: [{ species: 310, method: 'Level 26' }],
  },
  // Pokemon #310 - Manectric
  310: {
    chain: [309, 310],
    method: 'Level 26',
    evolvesTo: null,
  },
  // Pokemon #311 - Plusle
  311: {
    chain: [311],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #312 - Minun
  312: {
    chain: [312],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #313 - Volbeat
  313: {
    chain: [313],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #314 - Illumise
  314: {
    chain: [314],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #315 - Roselia
  315: {
    chain: [406, 315, 407],
    method: 'Friendship (Day)',
    evolvesTo: [{ species: 407, method: 'Shiny Stone' }],
  },
  // Pokemon #316 - Gulpin
  316: {
    chain: [316, 317],
    method: null,
    evolvesTo: [{ species: 317, method: 'Level 26' }],
  },
  // Pokemon #317 - Swalot
  317: {
    chain: [316, 317],
    method: 'Level 26',
    evolvesTo: null,
  },
  // Pokemon #318 - Carvanha
  318: {
    chain: [318, 319],
    method: null,
    evolvesTo: [{ species: 319, method: 'Level 30' }],
  },
  // Pokemon #319 - Sharpedo
  319: {
    chain: [318, 319],
    method: 'Level 30',
    evolvesTo: null,
  },
  // Pokemon #320 - Wailmer
  320: {
    chain: [320, 321],
    method: null,
    evolvesTo: [{ species: 321, method: 'Level 40' }],
  },
  // Pokemon #321 - Wailord
  321: {
    chain: [320, 321],
    method: 'Level 40',
    evolvesTo: null,
  },
  // Pokemon #322 - Numel
  322: {
    chain: [322, 323],
    method: null,
    evolvesTo: [{ species: 323, method: 'Level 33' }],
  },
  // Pokemon #323 - Camerupt
  323: {
    chain: [322, 323],
    method: 'Level 33',
    evolvesTo: null,
  },
  // Pokemon #324 - Torkoal
  324: {
    chain: [324],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #325 - Spoink
  325: {
    chain: [325, 326],
    method: null,
    evolvesTo: [{ species: 326, method: 'Level 32' }],
  },
  // Pokemon #326 - Grumpig
  326: {
    chain: [325, 326],
    method: 'Level 32',
    evolvesTo: null,
  },
  // Pokemon #327 - Spinda
  327: {
    chain: [327],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #328 - Trapinch
  328: {
    chain: [328, 329, 330],
    method: null,
    evolvesTo: [{ species: 329, method: 'Level 35' }],
  },
  // Pokemon #329 - Vibrava
  329: {
    chain: [328, 329, 330],
    method: 'Level 35',
    evolvesTo: [{ species: 330, method: 'Level 45' }],
  },
  // Pokemon #330 - Flygon
  330: {
    chain: [328, 329, 330],
    method: 'Level 45',
    evolvesTo: null,
  },
  // Pokemon #331 - Cacnea
  331: {
    chain: [331, 332],
    method: null,
    evolvesTo: [{ species: 332, method: 'Level 32' }],
  },
  // Pokemon #332 - Cacturne
  332: {
    chain: [331, 332],
    method: 'Level 32',
    evolvesTo: null,
  },
  // Pokemon #333 - Swablu
  333: {
    chain: [333, 334],
    method: null,
    evolvesTo: [{ species: 334, method: 'Level 35' }],
  },
  // Pokemon #334 - Altaria
  334: {
    chain: [333, 334],
    method: 'Level 35',
    evolvesTo: null,
  },
  // Pokemon #335 - Zangoose
  335: {
    chain: [335],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #336 - Seviper
  336: {
    chain: [336],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #337 - Lunatone
  337: {
    chain: [337],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #338 - Solrock
  338: {
    chain: [338],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #339 - Barboach
  339: {
    chain: [339, 340],
    method: null,
    evolvesTo: [{ species: 340, method: 'Level 30' }],
  },
  // Pokemon #340 - Whiscash
  340: {
    chain: [339, 340],
    method: 'Level 30',
    evolvesTo: null,
  },
  // Pokemon #341 - Corphish
  341: {
    chain: [341, 342],
    method: null,
    evolvesTo: [{ species: 342, method: 'Level 30' }],
  },
  // Pokemon #342 - Crawdaunt
  342: {
    chain: [341, 342],
    method: 'Level 30',
    evolvesTo: null,
  },
  // Pokemon #343 - Baltoy
  343: {
    chain: [343, 344],
    method: null,
    evolvesTo: [{ species: 344, method: 'Level 36' }],
  },
  // Pokemon #344 - Claydol
  344: {
    chain: [343, 344],
    method: 'Level 36',
    evolvesTo: null,
  },
  // Pokemon #345 - Lileep
  345: {
    chain: [345, 346],
    method: null,
    evolvesTo: [{ species: 346, method: 'Level 40' }],
  },
  // Pokemon #346 - Cradily
  346: {
    chain: [345, 346],
    method: 'Level 40',
    evolvesTo: null,
  },
  // Pokemon #347 - Anorith
  347: {
    chain: [347, 348],
    method: null,
    evolvesTo: [{ species: 348, method: 'Level 40' }],
  },
  // Pokemon #348 - Armaldo
  348: {
    chain: [347, 348],
    method: 'Level 40',
    evolvesTo: null,
  },
  // Pokemon #349 - Feebas
  349: {
    chain: [349, 350],
    method: null,
    evolvesTo: [{ species: 350, method: 'Max Beauty condition' }],
  },
  // Pokemon #350 - Milotic
  350: {
    chain: [349, 350],
    method: 'Max Beauty condition',
    evolvesTo: null,
  },
  // Pokemon #351 - Castform
  351: {
    chain: [351],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #352 - Kecleon
  352: {
    chain: [352],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #353 - Shuppet
  353: {
    chain: [353, 354],
    method: null,
    evolvesTo: [{ species: 354, method: 'Level 37' }],
  },
  // Pokemon #354 - Banette
  354: {
    chain: [353, 354],
    method: 'Level 37',
    evolvesTo: null,
  },
  // Pokemon #355 - Duskull
  355: {
    chain: [355, 356, 477],
    method: null,
    evolvesTo: [{ species: 356, method: 'Level 37' }],
  },
  // Pokemon #356 - Dusclops
  356: {
    chain: [355, 356, 477],
    method: 'Level 37',
    evolvesTo: [{ species: 477, method: 'Trade holding Reaper Cloth' }],
  },
  // Pokemon #357 - Tropius
  357: {
    chain: [357],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #358 - Chimecho
  358: {
    chain: [433, 358],
    method: 'Friendship (Night)',
    evolvesTo: null,
  },
  // Pokemon #359 - Absol
  359: {
    chain: [359],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #360 - Wynaut
  360: {
    chain: [360, 202],
    method: null,
    evolvesTo: [{ species: 202, method: 'Level 15' }],
  },
  // Pokemon #361 - Snorunt
  361: {
    chain: [361, 362, 478],
    method: null,
    evolvesTo: [
      { species: 362, method: 'Level 42' },
      { species: 478, method: 'Dawn Stone (female)' },
    ],
  },
  // Pokemon #362 - Glalie
  362: {
    chain: [361, 362, 478],
    method: 'Level 42',
    evolvesTo: null,
  },
  // Pokemon #363 - Spheal
  363: {
    chain: [363, 364, 365],
    method: null,
    evolvesTo: [{ species: 364, method: 'Level 32' }],
  },
  // Pokemon #364 - Sealeo
  364: {
    chain: [363, 364, 365],
    method: 'Level 32',
    evolvesTo: [{ species: 365, method: 'Level 44' }],
  },
  // Pokemon #365 - Walrein
  365: {
    chain: [363, 364, 365],
    method: 'Level 44',
    evolvesTo: null,
  },
  // Pokemon #366 - Clamperl
  366: {
    chain: [366, 367, 368],
    method: null,
    evolvesTo: [
      { species: 367, method: 'Trade holding DeepSeaTooth' },
      { species: 368, method: 'Trade holding DeepSeaScale' },
    ],
  },
  // Pokemon #367 - Huntail
  367: {
    chain: [366, 367, 368],
    method: 'Trade holding DeepSeaTooth',
    evolvesTo: null,
  },
  // Pokemon #368 - Gorebyss
  368: {
    chain: [366, 367, 368],
    method: 'Trade holding DeepSeaScale',
    evolvesTo: null,
  },
  // Pokemon #369 - Relicanth
  369: {
    chain: [369],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #370 - Luvdisc
  370: {
    chain: [370],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #371 - Bagon
  371: {
    chain: [371, 372, 373],
    method: null,
    evolvesTo: [{ species: 372, method: 'Level 30' }],
  },
  // Pokemon #372 - Shelgon
  372: {
    chain: [371, 372, 373],
    method: 'Level 30',
    evolvesTo: [{ species: 373, method: 'Level 50' }],
  },
  // Pokemon #373 - Salamence
  373: {
    chain: [371, 372, 373],
    method: 'Level 50',
    evolvesTo: null,
  },
  // Pokemon #374 - Beldum
  374: {
    chain: [374, 375, 376],
    method: null,
    evolvesTo: [{ species: 375, method: 'Level 20' }],
  },
  // Pokemon #375 - Metang
  375: {
    chain: [374, 375, 376],
    method: 'Level 20',
    evolvesTo: [{ species: 376, method: 'Level 45' }],
  },
  // Pokemon #376 - Metagross
  376: {
    chain: [374, 375, 376],
    method: 'Level 45',
    evolvesTo: null,
  },
  // Pokemon #377 - Regirock
  377: {
    chain: [377],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #378 - Regice
  378: {
    chain: [378],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #379 - Registeel
  379: {
    chain: [379],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #380 - Latias
  380: {
    chain: [380],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #381 - Latios
  381: {
    chain: [381],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #382 - Kyogre
  382: {
    chain: [382],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #383 - Groudon
  383: {
    chain: [383],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #384 - Rayquaza
  384: {
    chain: [384],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #385 - Jirachi
  385: {
    chain: [385],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #386 - Deoxys
  386: {
    chain: [386],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #387 - Turtwig
  387: {
    chain: [387, 388, 389],
    method: null,
    evolvesTo: [{ species: 388, method: 'Level 18' }],
  },
  // Pokemon #388 - Grotle
  388: {
    chain: [387, 388, 389],
    method: 'Level 18',
    evolvesTo: [{ species: 389, method: 'Level 32' }],
  },
  // Pokemon #389 - Torterra
  389: {
    chain: [387, 388, 389],
    method: 'Level 32',
    evolvesTo: null,
  },
  // Pokemon #390 - Chimchar
  390: {
    chain: [390, 391, 392],
    method: null,
    evolvesTo: [{ species: 391, method: 'Level 14' }],
  },
  // Pokemon #391 - Monferno
  391: {
    chain: [390, 391, 392],
    method: 'Level 14',
    evolvesTo: [{ species: 392, method: 'Level 36' }],
  },
  // Pokemon #392 - Infernape
  392: {
    chain: [390, 391, 392],
    method: 'Level 36',
    evolvesTo: null,
  },
  // Pokemon #393 - Piplup
  393: {
    chain: [393, 394, 395],
    method: null,
    evolvesTo: [{ species: 394, method: 'Level 16' }],
  },
  // Pokemon #394 - Prinplup
  394: {
    chain: [393, 394, 395],
    method: 'Level 16',
    evolvesTo: [{ species: 395, method: 'Level 36' }],
  },
  // Pokemon #395 - Empoleon
  395: {
    chain: [393, 394, 395],
    method: 'Level 36',
    evolvesTo: null,
  },
  // Pokemon #396 - Starly
  396: {
    chain: [396, 397, 398],
    method: null,
    evolvesTo: [{ species: 397, method: 'Level 14' }],
  },
  // Pokemon #397 - Staravia
  397: {
    chain: [396, 397, 398],
    method: 'Level 14',
    evolvesTo: [{ species: 398, method: 'Level 34' }],
  },
  // Pokemon #398 - Staraptor
  398: {
    chain: [396, 397, 398],
    method: 'Level 34',
    evolvesTo: null,
  },
  // Pokemon #399 - Bidoof
  399: {
    chain: [399, 400],
    method: null,
    evolvesTo: [{ species: 400, method: 'Level 15' }],
  },
  // Pokemon #400 - Bibarel
  400: {
    chain: [399, 400],
    method: 'Level 15',
    evolvesTo: null,
  },
  // Pokemon #401 - Kricketot
  401: {
    chain: [401, 402],
    method: null,
    evolvesTo: [{ species: 402, method: 'Level 10' }],
  },
  // Pokemon #402 - Kricketune
  402: {
    chain: [401, 402],
    method: 'Level 10',
    evolvesTo: null,
  },
  // Pokemon #403 - Shinx
  403: {
    chain: [403, 404, 405],
    method: null,
    evolvesTo: [{ species: 404, method: 'Level 15' }],
  },
  // Pokemon #404 - Luxio
  404: {
    chain: [403, 404, 405],
    method: 'Level 15',
    evolvesTo: [{ species: 405, method: 'Level 30' }],
  },
  // Pokemon #405 - Luxray
  405: {
    chain: [403, 404, 405],
    method: 'Level 30',
    evolvesTo: null,
  },
  // Pokemon #406 - Budew
  406: {
    chain: [406, 315, 407],
    method: null,
    evolvesTo: [{ species: 315, method: 'Friendship (Day)' }],
  },
  // Pokemon #407 - Roserade
  407: {
    chain: [406, 315, 407],
    method: 'Shiny Stone',
    evolvesTo: null,
  },
  // Pokemon #408 - Cranidos
  408: {
    chain: [408, 409],
    method: null,
    evolvesTo: [{ species: 409, method: 'Level 30' }],
  },
  // Pokemon #409 - Rampardos
  409: {
    chain: [408, 409],
    method: 'Level 30',
    evolvesTo: null,
  },
  // Pokemon #410 - Shieldon
  410: {
    chain: [410, 411],
    method: null,
    evolvesTo: [{ species: 411, method: 'Level 30' }],
  },
  // Pokemon #411 - Bastiodon
  411: {
    chain: [410, 411],
    method: 'Level 30',
    evolvesTo: null,
  },
  // Pokemon #412 - Burmy
  412: {
    chain: [412, 413, 414],
    method: null,
    evolvesTo: [
      { species: 413, method: 'Level 20 (female)' },
      { species: 414, method: 'Level 20 (male)' },
    ],
  },
  // Pokemon #413 - Wormadam
  413: {
    chain: [412, 413, 414],
    method: 'Level 20 (female)',
    evolvesTo: null,
  },
  // Pokemon #414 - Mothim
  414: {
    chain: [412, 413, 414],
    method: 'Level 20 (male)',
    evolvesTo: null,
  },
  // Pokemon #415 - Combee
  415: {
    chain: [415, 416],
    method: null,
    evolvesTo: [{ species: 416, method: 'Level 21 (female)' }],
  },
  // Pokemon #416 - Vespiquen
  416: {
    chain: [415, 416],
    method: 'Level 21 (female)',
    evolvesTo: null,
  },
  // Pokemon #417 - Pachirisu
  417: {
    chain: [417],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #418 - Buizel
  418: {
    chain: [418, 419],
    method: null,
    evolvesTo: [{ species: 419, method: 'Level 26' }],
  },
  // Pokemon #419 - Floatzel
  419: {
    chain: [418, 419],
    method: 'Level 26',
    evolvesTo: null,
  },
  // Pokemon #420 - Cherubi
  420: {
    chain: [420, 421],
    method: null,
    evolvesTo: [{ species: 421, method: 'Level 25' }],
  },
  // Pokemon #421 - Cherrim
  421: {
    chain: [420, 421],
    method: 'Level 25',
    evolvesTo: null,
  },
  // Pokemon #422 - Shellos
  422: {
    chain: [422, 423],
    method: null,
    evolvesTo: [{ species: 423, method: 'Level 30' }],
  },
  // Pokemon #423 - Gastrodon
  423: {
    chain: [422, 423],
    method: 'Level 30',
    evolvesTo: null,
  },
  // Pokemon #424 - Ambipom
  424: {
    chain: [190, 424],
    method: 'Level up knowing Double Hit',
    evolvesTo: null,
  },
  // Pokemon #425 - Drifloon
  425: {
    chain: [425, 426],
    method: null,
    evolvesTo: [{ species: 426, method: 'Level 28' }],
  },
  // Pokemon #426 - Drifblim
  426: {
    chain: [425, 426],
    method: 'Level 28',
    evolvesTo: null,
  },
  // Pokemon #427 - Buneary
  427: {
    chain: [427, 428],
    method: null,
    evolvesTo: [{ species: 428, method: 'Friendship' }],
  },
  // Pokemon #428 - Lopunny
  428: {
    chain: [427, 428],
    method: 'Friendship',
    evolvesTo: null,
  },
  // Pokemon #429 - Mismagius
  429: {
    chain: [200, 429],
    method: 'Dusk Stone',
    evolvesTo: null,
  },
  // Pokemon #430 - Honchkrow
  430: {
    chain: [198, 430],
    method: 'Dusk Stone',
    evolvesTo: null,
  },
  // Pokemon #431 - Glameow
  431: {
    chain: [431, 432],
    method: null,
    evolvesTo: [{ species: 432, method: 'Level 38' }],
  },
  // Pokemon #432 - Purugly
  432: {
    chain: [431, 432],
    method: 'Level 38',
    evolvesTo: null,
  },
  // Pokemon #433 - Chingling
  433: {
    chain: [433, 358],
    method: null,
    evolvesTo: [{ species: 358, method: 'Friendship (Night)' }],
  },
  // Pokemon #434 - Stunky
  434: {
    chain: [434, 435],
    method: null,
    evolvesTo: [{ species: 435, method: 'Level 34' }],
  },
  // Pokemon #435 - Skuntank
  435: {
    chain: [434, 435],
    method: 'Level 34',
    evolvesTo: null,
  },
  // Pokemon #436 - Bronzor
  436: {
    chain: [436, 437],
    method: null,
    evolvesTo: [{ species: 437, method: 'Level 33' }],
  },
  // Pokemon #437 - Bronzong
  437: {
    chain: [436, 437],
    method: 'Level 33',
    evolvesTo: null,
  },
  // Pokemon #438 - Bonsly
  438: {
    chain: [438, 185],
    method: null,
    evolvesTo: [{ species: 185, method: 'Level up knowing Mimic' }],
  },
  // Pokemon #439 - Mime Jr.
  439: {
    chain: [439, 122],
    method: null,
    evolvesTo: [{ species: 122, method: 'Level up knowing Mimic' }],
  },
  // Pokemon #440 - Happiny
  440: {
    chain: [440, 113, 242],
    method: null,
    evolvesTo: [{ species: 113, method: 'Oval Stone (Day)' }],
  },
  // Pokemon #441 - Chatot
  441: {
    chain: [441],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #442 - Spiritomb
  442: {
    chain: [442],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #443 - Gible
  443: {
    chain: [443, 444, 445],
    method: null,
    evolvesTo: [{ species: 444, method: 'Level 24' }],
  },
  // Pokemon #444 - Gabite
  444: {
    chain: [443, 444, 445],
    method: 'Level 24',
    evolvesTo: [{ species: 445, method: 'Level 48' }],
  },
  // Pokemon #445 - Garchomp
  445: {
    chain: [443, 444, 445],
    method: 'Level 48',
    evolvesTo: null,
  },
  // Pokemon #446 - Munchlax
  446: {
    chain: [446, 143],
    method: null,
    evolvesTo: [{ species: 143, method: 'Friendship' }],
  },
  // Pokemon #447 - Riolu
  447: {
    chain: [447, 448],
    method: null,
    evolvesTo: [{ species: 448, method: 'Friendship (Day)' }],
  },
  // Pokemon #448 - Lucario
  448: {
    chain: [447, 448],
    method: 'Friendship (Day)',
    evolvesTo: null,
  },
  // Pokemon #449 - Hippopotas
  449: {
    chain: [449, 450],
    method: null,
    evolvesTo: [{ species: 450, method: 'Level 34' }],
  },
  // Pokemon #450 - Hippowdon
  450: {
    chain: [449, 450],
    method: 'Level 34',
    evolvesTo: null,
  },
  // Pokemon #451 - Skorupi
  451: {
    chain: [451, 452],
    method: null,
    evolvesTo: [{ species: 452, method: 'Level 40' }],
  },
  // Pokemon #452 - Drapion
  452: {
    chain: [451, 452],
    method: 'Level 40',
    evolvesTo: null,
  },
  // Pokemon #453 - Croagunk
  453: {
    chain: [453, 454],
    method: null,
    evolvesTo: [{ species: 454, method: 'Level 37' }],
  },
  // Pokemon #454 - Toxicroak
  454: {
    chain: [453, 454],
    method: 'Level 37',
    evolvesTo: null,
  },
  // Pokemon #455 - Carnivine
  455: {
    chain: [455],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #456 - Finneon
  456: {
    chain: [456, 457],
    method: null,
    evolvesTo: [{ species: 457, method: 'Level 31' }],
  },
  // Pokemon #457 - Lumineon
  457: {
    chain: [456, 457],
    method: 'Level 31',
    evolvesTo: null,
  },
  // Pokemon #458 - Mantyke
  458: {
    chain: [458, 226],
    method: null,
    evolvesTo: [{ species: 226, method: 'Level up with Remoraid in party' }],
  },
  // Pokemon #459 - Snover
  459: {
    chain: [459, 460],
    method: null,
    evolvesTo: [{ species: 460, method: 'Level 40' }],
  },
  // Pokemon #460 - Abomasnow
  460: {
    chain: [459, 460],
    method: 'Level 40',
    evolvesTo: null,
  },
  // Pokemon #461 - Weavile
  461: {
    chain: [215, 461],
    method: 'Level up holding Razor Claw (Night)',
    evolvesTo: null,
  },
  // Pokemon #462 - Magnezone
  462: {
    chain: [81, 82, 462],
    method: 'Level up at Mt. Coronet',
    evolvesTo: null,
  },
  // Pokemon #463 - Lickilicky
  463: {
    chain: [108, 463],
    method: 'Level up knowing Rollout',
    evolvesTo: null,
  },
  // Pokemon #464 - Rhyperior
  464: {
    chain: [111, 112, 464],
    method: 'Trade holding Protector',
    evolvesTo: null,
  },
  // Pokemon #465 - Tangrowth
  465: {
    chain: [114, 465],
    method: 'Level up knowing Ancient Power',
    evolvesTo: null,
  },
  // Pokemon #466 - Electivire
  466: {
    chain: [239, 125, 466],
    method: 'Trade holding Electirizer',
    evolvesTo: null,
  },
  // Pokemon #467 - Magmortar
  467: {
    chain: [240, 126, 467],
    method: 'Trade holding Magmarizer',
    evolvesTo: null,
  },
  // Pokemon #468 - Togekiss
  468: {
    chain: [175, 176, 468],
    method: 'Shiny Stone',
    evolvesTo: null,
  },
  // Pokemon #469 - Yanmega
  469: {
    chain: [193, 469],
    method: 'Level up knowing Ancient Power',
    evolvesTo: null,
  },
  // Pokemon #470 - Leafeon
  470: {
    chain: [133, 134, 135, 136, 196, 197, 470, 471],
    method: 'Level up near Moss Rock',
    evolvesTo: null,
  },
  // Pokemon #471 - Glaceon
  471: {
    chain: [133, 134, 135, 136, 196, 197, 470, 471],
    method: 'Level up near Ice Rock',
    evolvesTo: null,
  },
  // Pokemon #472 - Gliscor
  472: {
    chain: [207, 472],
    method: 'Level up holding Razor Fang (Night)',
    evolvesTo: null,
  },
  // Pokemon #473 - Mamoswine
  473: {
    chain: [220, 221, 473],
    method: 'Level up knowing Ancient Power',
    evolvesTo: null,
  },
  // Pokemon #474 - Porygon-Z
  474: {
    chain: [137, 233, 474],
    method: 'Trade holding Dubious Disc',
    evolvesTo: null,
  },
  // Pokemon #475 - Gallade
  475: {
    chain: [280, 281, 282, 475],
    method: 'Dawn Stone (male)',
    evolvesTo: null,
  },
  // Pokemon #476 - Probopass
  476: {
    chain: [299, 476],
    method: 'Level up at Mt. Coronet',
    evolvesTo: null,
  },
  // Pokemon #477 - Dusknoir
  477: {
    chain: [355, 356, 477],
    method: 'Trade holding Reaper Cloth',
    evolvesTo: null,
  },
  // Pokemon #478 - Froslass
  478: {
    chain: [361, 362, 478],
    method: 'Dawn Stone (female)',
    evolvesTo: null,
  },
  // Pokemon #479 - Rotom
  479: {
    chain: [479],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #480 - Uxie
  480: {
    chain: [480],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #481 - Mesprit
  481: {
    chain: [481],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #482 - Azelf
  482: {
    chain: [482],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #483 - Dialga
  483: {
    chain: [483],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #484 - Palkia
  484: {
    chain: [484],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #485 - Heatran
  485: {
    chain: [485],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #486 - Regigigas
  486: {
    chain: [486],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #487 - Giratina
  487: {
    chain: [487],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #488 - Cresselia
  488: {
    chain: [488],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #489 - Phione
  489: {
    chain: [489],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #490 - Manaphy
  490: {
    chain: [490],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #491 - Darkrai
  491: {
    chain: [491],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #492 - Shaymin
  492: {
    chain: [492],
    method: null,
    evolvesTo: null,
  },
  // Pokemon #493 - Arceus
  493: {
    chain: [493],
    method: null,
    evolvesTo: null,
  },
};
