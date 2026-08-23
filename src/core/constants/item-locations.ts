import {
  GEN1_4_ITEM_LOCATIONS as GENERATED_ITEMS,
  ITEM_GAME_LABELS,
  ITEM_GENERATION_GAMES,
  type ItemAcquisitionSource,
  type ItemGame,
  type ItemLocationEntry,
  type ItemSourceKind,
} from './item-locations.generated';

export {
  ITEM_GAME_LABELS,
  ITEM_GENERATION_GAMES,
  type ItemAcquisitionSource,
  type ItemGame,
  type ItemLocationEntry,
  type ItemSourceKind,
};

type ItemPatch = {
  availableIn?: ItemGame[];
  games?: Partial<Record<ItemGame, ItemAcquisitionSource[]>>;
  researchUrls?: string[];
};

const unavailable = (text: string): ItemAcquisitionSource[] => [{ kind: 'Not normally obtainable', text }];
const event = (text: string): ItemAcquisitionSource[] => [{ kind: 'Event distribution', text }];
const found = (text: string): ItemAcquisitionSource[] => [{ kind: 'Found / gift', text }];
const shop = (text: string): ItemAcquisitionSource[] => [{ kind: 'Shop / exchange', text }];

const SAME_HGSS_DATA_CARD = shop('Pokéathlon Dome central reception desk; purchased with Athlete Points.');

const PATCHES: Record<string, ItemPatch> = {
  tm02: { games: { emerald: found('Meteor Falls.') } },
  tm22: { games: { emerald: found('Safari Zone.') } },
  tm23: { games: { emerald: found('Meteor Falls.') } },
  tm36: { games: { emerald: found('Dewford Town; also Trainer Hill in the Japanese e-Reader-exclusive layout.') } },
  tm42: { games: { emerald: found('Prize for defeating Norman at Petalburg Gym.') } },
  tm45: { games: { emerald: found('Verdanturf Town; also Trainer Hill in the Japanese e-Reader-exclusive layout.') } },
  dowsingmachine: {
    availableIn: ['red', 'blue', 'yellow', 'gold', 'silver', 'crystal', 'ruby', 'sapphire', 'emerald', 'firered', 'leafgreen', 'heartgold', 'soulsilver'],
    games: {
      red: found("Route 11 gate 2F, from Professor Oak's aide after registering 30 Pokémon."),
      blue: found("Route 11 gate 2F, from Professor Oak's aide after registering 30 Pokémon."),
      yellow: found("Route 11 gate 2F, from Professor Oak's aide after registering 30 Pokémon."),
      gold: found('Ecruteak City, from the man in the house next to the Gym.'),
      silver: found('Ecruteak City, from the man in the house next to the Gym.'),
      crystal: found('Ecruteak City, from the man in the house next to the Gym.'),
      ruby: found('Route 110, from Brendan/May after defeating them.'),
      sapphire: found('Route 110, from Brendan/May after defeating them.'),
      emerald: found('Route 110, from Brendan/May after defeating them.'),
      firered: found("Route 11 gate 2F, from Professor Oak's aide after registering 30 Pokémon."),
      leafgreen: found("Route 11 gate 2F, from Professor Oak's aide after registering 30 Pokémon."),
      heartgold: found('Ecruteak City, from the man in the house next to the Gym.'),
      soulsilver: found('Ecruteak City, from the man in the house next to the Gym.'),
    },
    researchUrls: ['https://bulbapedia.bulbagarden.net/wiki/Dowsing_Machine#Acquisition'],
  },
  pokeflute: {
    availableIn: ['red', 'blue', 'yellow', 'firered', 'leafgreen'],
    games: {
      red: found('Lavender Town Volunteer Pokémon House, from Mr. Fuji after defeating Team Rocket at Pokémon Tower.'),
      blue: found('Lavender Town Volunteer Pokémon House, from Mr. Fuji after defeating Team Rocket at Pokémon Tower.'),
      yellow: found('Lavender Town Volunteer Pokémon House, from Mr. Fuji after defeating Team Rocket at Pokémon Tower.'),
      firered: found('Lavender Town Volunteer Pokémon House, from Mr. Fuji after defeating Team Rocket at Pokémon Tower.'),
      leafgreen: found('Lavender Town Volunteer Pokémon House, from Mr. Fuji after defeating Team Rocket at Pokémon Tower.'),
    },
    researchUrls: ['https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9_Flute#Acquisition'],
  },
  goldleaf: {
    availableIn: ['gold', 'silver', 'crystal'],
    games: Object.fromEntries((['gold', 'silver', 'crystal'] as ItemGame[]).map(game => [game, found('Trade a Generation I Raichu, Parasect, Venomoth, Golduck, Primeape, Slowbro, Dewgong, Muk, Hypno, Marowak, Rhydon, or Seadra through the Time Capsule; its catch-rate byte becomes this held item.')])) as ItemPatch['games'],
    researchUrls: ['https://bulbapedia.bulbagarden.net/wiki/Gold_Leaf#Acquisition'],
  },
  silverleaf: {
    availableIn: ['gold', 'silver', 'crystal'],
    games: Object.fromEntries((['gold', 'silver', 'crystal'] as ItemGame[]).map(game => [game, found('Trade a Generation I Tentacruel, Rapidash, Magneton, Kingler, Electrode, Weezing, or Seaking through the Time Capsule; its catch-rate byte becomes this held item.')])) as ItemPatch['games'],
    researchUrls: ['https://bulbapedia.bulbagarden.net/wiki/Silver_Leaf#Acquisition'],
  },
  meteorite: {
    availableIn: ['ruby', 'sapphire', 'emerald', 'firered', 'leafgreen'],
    games: {
      ruby: found('Mt. Chimney, inside the machine beside the battle with Maxie.'),
      sapphire: found('Mt. Chimney, inside the machine beside the battle with Archie.'),
      emerald: found('Mt. Chimney, inside the machine beside the battle with Maxie.'),
      firered: found('One Island Pokémon Network Center, from Bill on the first visit.'),
      leafgreen: found('One Island Pokémon Network Center, from Bill on the first visit.'),
    },
    researchUrls: ['https://bulbapedia.bulbagarden.net/wiki/Meteorite#Acquisition'],
  },
  tea: {
    availableIn: ['firered', 'leafgreen'],
    games: {
      firered: found("Celadon Mansion 1F, from the manager in the Manager's Suite."),
      leafgreen: found("Celadon Mansion 1F, from the manager in the Manager's Suite."),
    },
    researchUrls: ['https://bulbapedia.bulbagarden.net/wiki/Tea#Acquisition'],
  },
  tmcase: {
    availableIn: ['firered', 'leafgreen'],
    games: {
      firered: found('Automatically obtained with the first TM; the earliest without trading is TM39 from Pewter Gym.'),
      leafgreen: found('Automatically obtained with the first TM; the earliest without trading is TM39 from Pewter Gym.'),
    },
    researchUrls: ['https://bulbapedia.bulbagarden.net/wiki/TM_Case#Acquisition'],
  },
  eonticket: {
    games: {
      ruby: event('Mystery Events: scan the Eon Ticket e-Reader card (North America), receive it at a regional Nintendo promotion, or receive a shared copy through record mixing.'),
      sapphire: event('Mystery Events: scan the Eon Ticket e-Reader card (North America), receive it at a regional Nintendo promotion, or receive a shared copy through record mixing.'),
      emerald: event('Record mix with a Ruby or Sapphire save that received the original event item. International Emerald cannot scan the e-Reader card directly.'),
    },
    researchUrls: ['https://bulbapedia.bulbagarden.net/wiki/Eon_Ticket#Distribution'],
  },
  oldseamap: {
    games: {
      ruby: unavailable('Programmed into the generation, but not obtainable in Ruby.'),
      sapphire: unavailable('Programmed into the generation, but not obtainable in Sapphire.'),
      emerald: event('Japanese-language Emerald only: distributed at Pokémon Festa and PokéPark in Japan in 2005, and at PokéPark Taiwan in 2006. It was never distributed for other language versions.'),
    },
    researchUrls: ['https://bulbapedia.bulbagarden.net/wiki/Old_Sea_Map#Distribution'],
  },
  azureflute: {
    games: Object.fromEntries((['diamond', 'pearl', 'platinum'] as ItemGame[]).map(game => [game, unavailable('Programmed into the game, but the planned Mystery Gift was never officially distributed.')])) as ItemPatch['games'],
    researchUrls: ['https://bulbapedia.bulbagarden.net/wiki/Azure_Flute#Generation_IV'],
  },
  enigmastone: {
    games: {
      heartgold: event('Nintendo Wi-Fi Connection Mystery Gift: Japan, Nov. 27, 2009–Jan. 11, 2010; North America/PAL, July 31–Aug. 27, 2010. The official service is no longer available.'),
      soulsilver: event('Nintendo Wi-Fi Connection Mystery Gift: Japan, Nov. 27, 2009–Jan. 11, 2010; North America/PAL, July 31–Aug. 27, 2010. The official service is no longer available.'),
    },
    researchUrls: ['https://bulbapedia.bulbagarden.net/wiki/Enigma_Stone#Distribution'],
  },
  lockcapsule: {
    games: {
      heartgold: unavailable('Unreleased item. It was never distributed and cannot be obtained legitimately.'),
      soulsilver: unavailable('Unreleased item. It was never distributed and cannot be obtained legitimately.'),
    },
    researchUrls: ['https://bulbapedia.bulbagarden.net/wiki/Lock_Capsule#Distribution'],
  },
  lootsack: {
    games: Object.fromEntries((['diamond', 'pearl', 'platinum'] as ItemGame[]).map(game => [game, found('Automatically used as the temporary treasure inventory while exploring the Underground; it is not placed in the normal Bag.')])) as ItemPatch['games'],
  },
  magmastone: {
    availableIn: ['diamond', 'pearl', 'platinum'],
    games: Object.fromEntries((['diamond', 'pearl', 'platinum'] as ItemGame[]).map(game => [game, unavailable('Story object at Stark Mountain. Buck takes it; the player never receives it as a Bag item.')])) as ItemPatch['games'],
  },
  membercard: {
    games: {
      diamond: unavailable('Programmed into the game, but never officially distributed for Diamond.'),
      pearl: unavailable('Programmed into the game, but never officially distributed for Pearl.'),
      platinum: event('Nintendo Wi-Fi Connection Mystery Gift: Japan, Dec. 1, 2008–Jan. 15, 2009; North America, Aug. 3–Sept. 13, 2009; PAL regions, Aug. 3–Sept. 13, 2009.'),
    },
    researchUrls: ['https://bulbapedia.bulbagarden.net/wiki/Member_Card#Acquisition'],
  },
  oaksletter: {
    games: {
      diamond: unavailable("Programmed into the game, but never officially distributed for Diamond."),
      pearl: unavailable("Programmed into the game, but never officially distributed for Pearl."),
      platinum: event("Nintendo Wi-Fi Connection Mystery Gift: Japan, Apr. 18–May 11, 2009; North America, Sept. 28–Nov. 8, 2009; PAL regions, Sept. 28–Nov. 8, 2009."),
    },
    researchUrls: ["https://bulbapedia.bulbagarden.net/wiki/Oak's_Letter#Acquisition"],
  },
  photoalbum: {
    games: {
      heartgold: unavailable('Unused Key Item. HGSS provides the Photo Album as a PC menu feature, not as an obtainable Bag item.'),
      soulsilver: unavailable('Unused Key Item. HGSS provides the Photo Album as a PC menu feature, not as an obtainable Bag item.'),
    },
  },
  redchain: {
    games: Object.fromEntries((['diamond', 'pearl', 'platinum'] as ItemGame[]).map(game => [game, unavailable('Story object created and used by Cyrus; the player never receives it as a Bag item.')])) as ItemPatch['games'],
  },
  rulebook: {
    games: Object.fromEntries((['diamond', 'pearl', 'platinum'] as ItemGame[]).map(game => [game, unavailable('Unused Key Item present in the game data; it cannot be obtained legitimately.')])) as ItemPatch['games'],
  },
  sealbag: {
    games: Object.fromEntries((['diamond', 'pearl', 'platinum', 'heartgold', 'soulsilver'] as ItemGame[]).map(game => [game, unavailable('Unused Key Item present in the game data; it cannot be obtained legitimately. The functional item in D/P/Pt is the Seal Case.')])) as ItemPatch['games'],
  },
  mosaicmail: {
    games: Object.fromEntries((['diamond', 'pearl', 'platinum', 'heartgold', 'soulsilver'] as ItemGame[]).map(game => [game, unavailable('Unused mail item present in the game data; it cannot be obtained legitimately.')])) as ItemPatch['games'],
    researchUrls: ['https://bulbapedia.bulbagarden.net/wiki/Mosaic_Mail#Acquisition'],
  },
  cherishball: {
    games: Object.fromEntries((['diamond', 'pearl', 'platinum', 'heartgold', 'soulsilver'] as ItemGame[]).map(game => [game, unavailable('Cannot be obtained as an empty Ball. It appears only as the Ball containing certain event Pokémon.')])) as ItemPatch['games'],
    researchUrls: ['https://bulbapedia.bulbagarden.net/wiki/Cherish_Ball#Acquisition'],
  },
};

for (let number = 1; number <= 27; number++) {
  PATCHES[`datacard${number}`] = {
    availableIn: ['heartgold', 'soulsilver'],
    games: { heartgold: SAME_HGSS_DATA_CARD, soulsilver: SAME_HGSS_DATA_CARD },
    researchUrls: ['https://bulbapedia.bulbagarden.net/wiki/Data_Card#Acquisition'],
  };
}

function mergePatch(item: ItemLocationEntry, patch: ItemPatch): ItemLocationEntry {
  const researchUrls = [...new Set([...(item.researchUrls ?? [item.sourceUrl]), ...(patch.researchUrls ?? [])])];
  const availableIn = patch.availableIn ?? [...new Set([
    ...item.availableIn,
    ...(Object.keys(patch.games ?? {}) as ItemGame[]),
  ])];
  const games = Object.fromEntries(
    Object.entries({ ...item.games, ...(patch.games ?? {}) }).filter(([game]) => availableIn.includes(game as ItemGame)),
  ) as ItemLocationEntry['games'];
  return {
    ...item,
    availableIn,
    games,
    researchUrls,
  };
}

export const GEN1_4_ITEM_LOCATIONS: ItemLocationEntry[] = GENERATED_ITEMS.map(item => {
  // The ItemDex grid includes several programmed-but-unobtainable cross-game
  // slots. Treat only documented acquisition rows as ordinary availability;
  // explicit historical/unreleased cases are restored by PATCHES above.
  const documentedGames = item.availableIn.filter(game => item.games[game]?.length);
  const documentedItem = { ...item, availableIn: documentedGames };
  return PATCHES[item.slug] ? mergePatch(documentedItem, PATCHES[item.slug]) : documentedItem;
});

function normalizeItemSlug(value: string): string {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/gi, '').toLowerCase();
}

const ITEM_BY_SLUG = new Map<string, ItemLocationEntry>();
for (const item of GEN1_4_ITEM_LOCATIONS) {
  ITEM_BY_SLUG.set(normalizeItemSlug(item.slug), item);
  ITEM_BY_SLUG.set(normalizeItemSlug(item.name), item);
}

export function getItemLocation(value: string): ItemLocationEntry | undefined {
  return ITEM_BY_SLUG.get(normalizeItemSlug(value));
}

export function itemLocationSlug(value: string): string | undefined {
  return getItemLocation(value)?.slug;
}
