/**
 * AUTO-GENERATED Gen 4 catch data (research + adversarial web-verify workflow).
 * 96 species covered in the first run (1-12, 37-60, 85-96, 109-120, 133-168);
 * remaining species fall back to the coarse LOCATIONS strings until a follow-up
 * run fills them. Do NOT hand-edit — regenerate from the workflow output. The
 * hand-seeded anchors in gen4-dex-data.ts (GEN4_DEX_SEED) override these.
 */
/* eslint-disable */
import type { Gen4Entry } from "./gen4-dex-data";

export const GEN4_DEX_GENERATED: Record<number, Gen4Entry> = {
  "1": {
    "name": "Bulbasaur",
    "tips": [
      "In HGSS, Prof. Oak only offers a Kanto starter after you beat Red at Mt. Silver (all 16 badges); the other two starters are then trade-only.",
      "In Diamond/Pearl/Platinum, Bulbasaur is not catchable in normal play; it requires trade or Pal Park migration from a GBA game."
    ],
    "games": {
      "heartgold": {
        "via": "gift",
        "summary": "Gift from Prof. Oak at his lab in Pallet Town (Kanto) after earning all 16 badges and defeating Red at Mt. Silver; choose one Kanto starter, received at Lv 5"
      },
      "soulsilver": {
        "via": "gift",
        "summary": "Gift from Prof. Oak at his lab in Pallet Town (Kanto) after earning all 16 badges and defeating Red at Mt. Silver; choose one Kanto starter, received at Lv 5"
      }
    }
  },
  "2": {
    "name": "Ivysaur",
    "games": {
      "heartgold": {
        "via": "evolve",
        "summary": "Evolve Bulbasaur at Lv 16"
      },
      "soulsilver": {
        "via": "evolve",
        "summary": "Evolve Bulbasaur at Lv 16"
      }
    }
  },
  "3": {
    "name": "Venusaur",
    "games": {
      "heartgold": {
        "via": "evolve",
        "summary": "Evolve Ivysaur at Lv 32"
      },
      "soulsilver": {
        "via": "evolve",
        "summary": "Evolve Ivysaur at Lv 32"
      }
    }
  },
  "4": {
    "name": "Charmander",
    "tips": [
      "Diamond/Pearl/Platinum: trade or Pal Park only, not obtainable by normal play."
    ],
    "games": {
      "heartgold": {
        "via": "gift",
        "summary": "Gift from Prof. Oak at his lab in Pallet Town (Kanto) after earning all 16 badges and defeating Red at Mt. Silver; choose one Kanto starter, received at Lv 5"
      },
      "soulsilver": {
        "via": "gift",
        "summary": "Gift from Prof. Oak at his lab in Pallet Town (Kanto) after earning all 16 badges and defeating Red at Mt. Silver; choose one Kanto starter, received at Lv 5"
      }
    }
  },
  "5": {
    "name": "Charmeleon",
    "games": {
      "heartgold": {
        "via": "evolve",
        "summary": "Evolve Charmander at Lv 16"
      },
      "soulsilver": {
        "via": "evolve",
        "summary": "Evolve Charmander at Lv 16"
      }
    }
  },
  "6": {
    "name": "Charizard",
    "games": {
      "heartgold": {
        "via": "evolve",
        "summary": "Evolve Charmeleon at Lv 36"
      },
      "soulsilver": {
        "via": "evolve",
        "summary": "Evolve Charmeleon at Lv 36"
      }
    }
  },
  "7": {
    "name": "Squirtle",
    "tips": [
      "Diamond/Pearl/Platinum: trade or Pal Park only, not obtainable by normal play."
    ],
    "games": {
      "heartgold": {
        "via": "gift",
        "summary": "Gift from Prof. Oak at his lab in Pallet Town (Kanto) after earning all 16 badges and defeating Red at Mt. Silver; choose one Kanto starter, received at Lv 5"
      },
      "soulsilver": {
        "via": "gift",
        "summary": "Gift from Prof. Oak at his lab in Pallet Town (Kanto) after earning all 16 badges and defeating Red at Mt. Silver; choose one Kanto starter, received at Lv 5"
      }
    }
  },
  "8": {
    "name": "Wartortle",
    "games": {
      "heartgold": {
        "via": "evolve",
        "summary": "Evolve Squirtle at Lv 16"
      },
      "soulsilver": {
        "via": "evolve",
        "summary": "Evolve Squirtle at Lv 16"
      }
    }
  },
  "9": {
    "name": "Blastoise",
    "games": {
      "heartgold": {
        "via": "evolve",
        "summary": "Evolve Wartortle at Lv 36"
      },
      "soulsilver": {
        "via": "evolve",
        "summary": "Evolve Wartortle at Lv 36"
      }
    }
  },
  "10": {
    "name": "Caterpie",
    "tips": [
      "Caterpie is the HeartGold-version bug line: in SoulSilver it appears only through the National Park Bug-Catching Contest (Tue/Thu/Sat), while Weedle fills the open-route grass.",
      "HGSS Caterpie is morning/day only; you won't find it at night.",
      "In Diamond/Pearl/Platinum, Caterpie only spawns with a GBA FireRed cartridge inserted via dual-slot mode; without it, Caterpie is unobtainable in those games except by trade."
    ],
    "games": {
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 204",
            "kind": "grass",
            "times": "Morning/Day",
            "note": "Only with a Game Boy Advance FireRed cartridge inserted (dual-slot mode)"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 204",
            "kind": "grass",
            "times": "Morning/Day",
            "note": "Only with a Game Boy Advance FireRed cartridge inserted (dual-slot mode)"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 204",
            "kind": "grass",
            "times": "Morning/Day",
            "note": "Only with a Game Boy Advance FireRed cartridge inserted (dual-slot mode)"
          },
          {
            "area": "Eterna Forest",
            "kind": "grass",
            "times": "Morning/Day",
            "note": "Only with a Game Boy Advance FireRed cartridge inserted (dual-slot mode)"
          }
        ]
      },
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 2",
            "kind": "grass",
            "times": "Morning/Day"
          },
          {
            "area": "Route 30",
            "kind": "grass",
            "rarity": "Common",
            "times": "Morning/Day"
          },
          {
            "area": "Route 31",
            "kind": "grass",
            "times": "Morning/Day"
          },
          {
            "area": "Ilex Forest",
            "kind": "grass",
            "times": "Morning/Day"
          },
          {
            "area": "National Park",
            "kind": "grass",
            "times": "Morning/Day"
          },
          {
            "area": "Viridian Forest",
            "kind": "grass",
            "rarity": "Common",
            "times": "Morning/Day"
          },
          {
            "area": "National Park",
            "kind": "special",
            "note": "Bug-Catching Contest (Tue/Thu/Sat)"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "National Park",
            "kind": "special",
            "note": "Bug-Catching Contest only (Tue/Thu/Sat); Weedle takes the wild-grass slots in SoulSilver"
          }
        ]
      }
    }
  },
  "11": {
    "name": "Metapod",
    "tips": [
      "Easiest path is to catch Caterpie and evolve it at Lv 7; Metapod's own wild rate is lower.",
      "In SoulSilver, Metapod (like Caterpie) only appears in the Bug-Catching Contest, not in open grass.",
      "In Diamond/Pearl/Platinum, Metapod is found only in Eterna Forest with a GBA FireRed cartridge inserted (dual-slot mode), not on Route 204."
    ],
    "games": {
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Eterna Forest",
            "kind": "grass",
            "rarity": "Rare",
            "times": "Morning/Day",
            "note": "Only with a Game Boy Advance FireRed cartridge inserted (dual-slot mode)"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Eterna Forest",
            "kind": "grass",
            "rarity": "Rare",
            "times": "Morning/Day",
            "note": "Only with a Game Boy Advance FireRed cartridge inserted (dual-slot mode)"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Eterna Forest",
            "kind": "grass",
            "times": "Morning/Day",
            "note": "Only with a Game Boy Advance FireRed cartridge inserted (dual-slot mode)"
          }
        ]
      },
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 2",
            "kind": "grass",
            "rarity": "Uncommon",
            "times": "Morning/Day"
          },
          {
            "area": "Route 30",
            "kind": "grass",
            "rarity": "Uncommon",
            "times": "Morning/Day"
          },
          {
            "area": "Route 31",
            "kind": "grass",
            "rarity": "Uncommon",
            "times": "Morning/Day"
          },
          {
            "area": "Ilex Forest",
            "kind": "grass",
            "times": "Morning/Day"
          },
          {
            "area": "National Park",
            "kind": "grass",
            "times": "Morning/Day"
          },
          {
            "area": "Viridian Forest",
            "kind": "grass",
            "times": "Morning/Day"
          },
          {
            "area": "National Park",
            "kind": "special",
            "note": "Bug-Catching Contest (Tue/Thu/Sat)"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "National Park",
            "kind": "special",
            "note": "Bug-Catching Contest only (Tue/Thu/Sat)"
          }
        ]
      }
    }
  },
  "12": {
    "name": "Butterfree",
    "tips": [
      "Fastest route in every game is evolving the line: Caterpie -> Metapod (Lv 7) -> Butterfree (Lv 10).",
      "In HeartGold, Butterfree appears wild (Lv 7) in Viridian Forest and on Route 2 in addition to the Bug-Catching Contest; in SoulSilver it is Bug-Catching Contest only.",
      "In the National Park Bug-Catching Contest, Butterfree is a rare prize-tier catch in both versions."
    ],
    "games": {
      "diamond": {
        "via": "evolve",
        "summary": "Evolve Metapod at Lv 10 (the Caterpie/Metapod line requires a GBA FireRed cartridge inserted via dual-slot mode to catch on Route 204/Eterna Forest)"
      },
      "pearl": {
        "via": "evolve",
        "summary": "Evolve Metapod at Lv 10 (the Caterpie/Metapod line requires a GBA FireRed cartridge inserted via dual-slot mode to catch on Route 204/Eterna Forest)"
      },
      "platinum": {
        "via": "evolve",
        "summary": "Evolve Metapod at Lv 10 (the Caterpie/Metapod line requires a GBA FireRed cartridge inserted via dual-slot mode to catch in Eterna Forest/Route 204)"
      },
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Viridian Forest",
            "kind": "grass",
            "rarity": "10%",
            "levels": "7",
            "times": "Morning/Day"
          },
          {
            "area": "Route 2",
            "kind": "grass",
            "rarity": "Uncommon",
            "levels": "7",
            "times": "Morning/Day"
          },
          {
            "area": "National Park",
            "kind": "grass",
            "times": "Morning/Day"
          },
          {
            "area": "National Park",
            "kind": "special",
            "rarity": "Rare",
            "note": "Bug-Catching Contest (Tue/Thu/Sat)"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "National Park",
            "kind": "special",
            "rarity": "Rare",
            "note": "Bug-Catching Contest only (Tue/Thu/Sat); wild Butterfree grass spawns are HeartGold-exclusive"
          }
        ]
      }
    }
  },
  "37": {
    "name": "Vulpix",
    "tips": [
      "Wild Vulpix is SoulSilver-exclusive; in HeartGold it is trade/transfer-only.",
      "In Diamond/Pearl/Platinum, Vulpix only appears with Pokemon LeafGreen inserted in the DS GBA (slot-2) cartridge slot and the National Dex obtained."
    ],
    "games": {
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 209",
            "kind": "grass",
            "rarity": "8%",
            "levels": "16",
            "times": "Any",
            "note": "Requires Pokemon LeafGreen in DS GBA slot; National Dex"
          },
          {
            "area": "Route 214",
            "kind": "grass",
            "rarity": "8%",
            "levels": "24",
            "times": "Any",
            "note": "Requires Pokemon LeafGreen in DS GBA slot; National Dex"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 209",
            "kind": "grass",
            "rarity": "8%",
            "levels": "16",
            "times": "Any",
            "note": "Requires Pokemon LeafGreen in DS GBA slot; National Dex"
          },
          {
            "area": "Route 214",
            "kind": "grass",
            "rarity": "8%",
            "levels": "24",
            "times": "Any",
            "note": "Requires Pokemon LeafGreen in DS GBA slot; National Dex"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 209",
            "kind": "grass",
            "rarity": "8%",
            "levels": "17-20",
            "times": "Any",
            "note": "Requires Pokemon LeafGreen in DS GBA slot; National Dex"
          },
          {
            "area": "Route 214",
            "kind": "grass",
            "rarity": "8%",
            "levels": "24",
            "times": "Any",
            "note": "Requires Pokemon LeafGreen in DS GBA slot; National Dex"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 36",
            "kind": "grass",
            "rarity": "10-15%",
            "levels": "13-15",
            "times": "Morning/Day",
            "note": "10% morning/night, 15% day"
          },
          {
            "area": "Route 37",
            "kind": "grass",
            "rarity": "10-15%",
            "levels": "14-15",
            "times": "Morning/Day",
            "note": "10% morning/night, 15% day"
          },
          {
            "area": "Route 48",
            "kind": "grass",
            "rarity": "9-29%",
            "levels": "21-25",
            "times": "Any",
            "note": "9% morning/day, 29% night"
          },
          {
            "area": "Route 7 (Kanto)",
            "kind": "grass",
            "rarity": "20-25%",
            "levels": "15-18",
            "times": "Any",
            "note": "25% day, 20% morning/night"
          },
          {
            "area": "Route 8 (Kanto)",
            "kind": "grass",
            "rarity": "5-10%",
            "levels": "8-17",
            "times": "Any",
            "note": "10% morning/day, 5% night"
          }
        ]
      }
    }
  },
  "38": {
    "name": "Ninetales",
    "tips": [
      "Fire Stones in HGSS/DPPt come from the Department Store, underground digging (Sinnoh), or rotating shops; no wild Ninetales in any Gen 4 game."
    ],
    "games": {
      "diamond": {
        "via": "evolve",
        "summary": "Evolve Vulpix with a Fire Stone"
      },
      "pearl": {
        "via": "evolve",
        "summary": "Evolve Vulpix with a Fire Stone"
      },
      "platinum": {
        "via": "evolve",
        "summary": "Evolve Vulpix with a Fire Stone"
      },
      "heartgold": {
        "via": "evolve",
        "summary": "Evolve Vulpix (trade-only species in HG) with a Fire Stone"
      },
      "soulsilver": {
        "via": "evolve",
        "summary": "Evolve Vulpix with a Fire Stone"
      }
    }
  },
  "39": {
    "name": "Jigglypuff",
    "tips": [
      "In Sinnoh, Jigglypuff is a Trophy Garden daily-rotation Pokemon: re-enter the garden each day (and after talking to Mr. Backlot) until it is one of the two visiting species.",
      "In HGSS, Kanto Routes 3 and 4 are the easiest wild source once you reach Kanto."
    ],
    "games": {
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Trophy Garden (Pokemon Mansion, Route 212)",
            "kind": "grass",
            "rarity": "5%",
            "levels": "16-18",
            "times": "Any",
            "note": "Daily rotation Pokemon; after National Dex, set by Mr. Backlot"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Trophy Garden (Pokemon Mansion, Route 212)",
            "kind": "grass",
            "rarity": "5%",
            "levels": "16-18",
            "times": "Any",
            "note": "Daily rotation Pokemon; after National Dex, set by Mr. Backlot"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Trophy Garden (Pokemon Mansion, Route 212)",
            "kind": "grass",
            "rarity": "5%",
            "levels": "16-18",
            "times": "Any",
            "note": "Daily rotation Pokemon; after National Dex, set by Mr. Backlot"
          }
        ]
      },
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 3 (Kanto)",
            "kind": "grass",
            "rarity": "10%",
            "levels": "6",
            "times": "Any"
          },
          {
            "area": "Route 4 (Kanto)",
            "kind": "grass",
            "rarity": "10%",
            "levels": "6",
            "times": "Any"
          },
          {
            "area": "Safari Zone - Meadow",
            "kind": "grass",
            "levels": "15-17",
            "times": "Any"
          },
          {
            "area": "Safari Zone - Swamp",
            "kind": "grass",
            "levels": "15-17",
            "times": "Morning/Day"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 3 (Kanto)",
            "kind": "grass",
            "rarity": "10%",
            "levels": "6",
            "times": "Any"
          },
          {
            "area": "Route 4 (Kanto)",
            "kind": "grass",
            "rarity": "10%",
            "levels": "6",
            "times": "Any"
          },
          {
            "area": "Safari Zone - Meadow",
            "kind": "grass",
            "levels": "15-17",
            "times": "Any"
          },
          {
            "area": "Safari Zone - Swamp",
            "kind": "grass",
            "levels": "15-17",
            "times": "Morning/Day"
          }
        ]
      }
    }
  },
  "40": {
    "name": "Wigglytuff",
    "tips": [
      "Moon Stones: Sinnoh via Underground digging; in HGSS held by wild Clefairy (Mt. Moon) or from rotating sources. No wild Wigglytuff in Gen 4."
    ],
    "games": {
      "diamond": {
        "via": "evolve",
        "summary": "Evolve Jigglypuff with a Moon Stone"
      },
      "pearl": {
        "via": "evolve",
        "summary": "Evolve Jigglypuff with a Moon Stone"
      },
      "platinum": {
        "via": "evolve",
        "summary": "Evolve Jigglypuff with a Moon Stone"
      },
      "heartgold": {
        "via": "evolve",
        "summary": "Evolve Jigglypuff with a Moon Stone"
      },
      "soulsilver": {
        "via": "evolve",
        "summary": "Evolve Jigglypuff with a Moon Stone"
      }
    }
  },
  "41": {
    "name": "Zubat",
    "tips": [
      "Zubat is one of the most common cave Pokemon; nearly any cave in either region works.",
      "On overworld routes it only appears at night in both regions."
    ],
    "games": {
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Oreburgh Gate",
            "kind": "cave",
            "rarity": "Common",
            "levels": "5-9",
            "times": "Any"
          },
          {
            "area": "Ravaged Path",
            "kind": "cave",
            "rarity": "Common",
            "levels": "4-7",
            "times": "Any"
          },
          {
            "area": "Mt. Coronet",
            "kind": "cave",
            "rarity": "Common",
            "levels": "Varies",
            "times": "Any"
          },
          {
            "area": "Wayward Cave",
            "kind": "cave",
            "rarity": "Uncommon",
            "levels": "14-17",
            "times": "Any"
          },
          {
            "area": "Various routes (203, 204, 206-209, 211, 216)",
            "kind": "grass",
            "rarity": "10%",
            "levels": "Varies",
            "times": "Night"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Oreburgh Gate",
            "kind": "cave",
            "rarity": "Common",
            "levels": "5-9",
            "times": "Any"
          },
          {
            "area": "Ravaged Path",
            "kind": "cave",
            "rarity": "Common",
            "levels": "4-7",
            "times": "Any"
          },
          {
            "area": "Mt. Coronet",
            "kind": "cave",
            "rarity": "Common",
            "levels": "Varies",
            "times": "Any"
          },
          {
            "area": "Wayward Cave",
            "kind": "cave",
            "rarity": "Uncommon",
            "levels": "14-17",
            "times": "Any"
          },
          {
            "area": "Various routes (203, 204, 206-209, 211, 216)",
            "kind": "grass",
            "rarity": "10%",
            "levels": "Varies",
            "times": "Night"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Oreburgh Gate",
            "kind": "cave",
            "rarity": "Common",
            "levels": "5-9",
            "times": "Any"
          },
          {
            "area": "Ravaged Path",
            "kind": "cave",
            "rarity": "Common",
            "levels": "3-7",
            "times": "Any"
          },
          {
            "area": "Mt. Coronet",
            "kind": "cave",
            "rarity": "Common",
            "levels": "14-30",
            "times": "Any"
          },
          {
            "area": "Various routes (203, 204, 206-214)",
            "kind": "grass",
            "rarity": "10%",
            "levels": "Varies",
            "times": "Night"
          }
        ]
      },
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Dark Cave",
            "kind": "cave",
            "rarity": "Common",
            "levels": "Varies",
            "times": "Any"
          },
          {
            "area": "Union Cave",
            "kind": "cave",
            "rarity": "Uncommon",
            "levels": "Varies",
            "times": "Any"
          },
          {
            "area": "Slowpoke Well",
            "kind": "cave",
            "rarity": "Common",
            "levels": "Varies",
            "times": "Any"
          },
          {
            "area": "Mt. Mortar",
            "kind": "cave",
            "rarity": "Common",
            "levels": "Varies",
            "times": "Any"
          },
          {
            "area": "Ice Path",
            "kind": "cave",
            "rarity": "Common",
            "levels": "Varies",
            "times": "Any"
          },
          {
            "area": "Mt. Moon (Kanto)",
            "kind": "cave",
            "rarity": "30%",
            "levels": "Varies",
            "times": "Any"
          },
          {
            "area": "Routes 3, 4, 32, 33, 42",
            "kind": "grass",
            "rarity": "30%",
            "levels": "Varies",
            "times": "Night"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Dark Cave",
            "kind": "cave",
            "rarity": "Common",
            "levels": "Varies",
            "times": "Any"
          },
          {
            "area": "Union Cave",
            "kind": "cave",
            "rarity": "Uncommon",
            "levels": "Varies",
            "times": "Any"
          },
          {
            "area": "Slowpoke Well",
            "kind": "cave",
            "rarity": "Common",
            "levels": "Varies",
            "times": "Any"
          },
          {
            "area": "Mt. Mortar",
            "kind": "cave",
            "rarity": "Common",
            "levels": "Varies",
            "times": "Any"
          },
          {
            "area": "Ice Path",
            "kind": "cave",
            "rarity": "Common",
            "levels": "Varies",
            "times": "Any"
          },
          {
            "area": "Mt. Moon (Kanto)",
            "kind": "cave",
            "rarity": "30%",
            "levels": "Varies",
            "times": "Any"
          },
          {
            "area": "Routes 3, 4, 32, 33, 42",
            "kind": "grass",
            "rarity": "30%",
            "levels": "Varies",
            "times": "Night"
          }
        ]
      }
    }
  },
  "42": {
    "name": "Golbat",
    "tips": [
      "Easiest method is to evolve Zubat at Lv 22; wild Golbat appear in deeper/late-game caves.",
      "Golbat evolves into Crobat with high friendship, so a wild Golbat is a shortcut to Crobat."
    ],
    "games": {
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Mt. Coronet",
            "kind": "cave",
            "rarity": "10%",
            "levels": "31-41",
            "times": "Any"
          },
          {
            "area": "Victory Road",
            "kind": "cave",
            "rarity": "20%",
            "levels": "44-52",
            "times": "Any"
          },
          {
            "area": "Snowpoint Temple",
            "kind": "cave",
            "rarity": "35%",
            "levels": "50-56",
            "times": "Any"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Mt. Coronet",
            "kind": "cave",
            "rarity": "10%",
            "levels": "31-41",
            "times": "Any"
          },
          {
            "area": "Victory Road",
            "kind": "cave",
            "rarity": "20%",
            "levels": "44-52",
            "times": "Any"
          },
          {
            "area": "Snowpoint Temple",
            "kind": "cave",
            "rarity": "35%",
            "levels": "50-56",
            "times": "Any"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Mt. Coronet",
            "kind": "cave",
            "rarity": "5-15%",
            "levels": "33-38",
            "times": "Any"
          },
          {
            "area": "Victory Road",
            "kind": "cave",
            "rarity": "5-15%",
            "levels": "42-50",
            "times": "Any"
          },
          {
            "area": "Snowpoint Temple",
            "kind": "cave",
            "rarity": "80%",
            "levels": "47-50",
            "times": "Any"
          }
        ]
      },
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Ice Path",
            "kind": "cave",
            "rarity": "30%",
            "levels": "22-23",
            "times": "Any"
          },
          {
            "area": "Seafoam Islands (Kanto)",
            "kind": "cave",
            "rarity": "30%",
            "levels": "30-40",
            "times": "Any"
          },
          {
            "area": "Cerulean Cave (Kanto)",
            "kind": "cave",
            "rarity": "10-50%",
            "levels": "38-42",
            "times": "Any"
          },
          {
            "area": "Mt. Silver",
            "kind": "cave",
            "rarity": "5-40%",
            "levels": "45-51",
            "times": "Any"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Ice Path",
            "kind": "cave",
            "rarity": "30%",
            "levels": "22-23",
            "times": "Any"
          },
          {
            "area": "Seafoam Islands (Kanto)",
            "kind": "cave",
            "rarity": "30%",
            "levels": "30-40",
            "times": "Any"
          },
          {
            "area": "Cerulean Cave (Kanto)",
            "kind": "cave",
            "rarity": "10-50%",
            "levels": "38-42",
            "times": "Any"
          },
          {
            "area": "Mt. Silver",
            "kind": "cave",
            "rarity": "5-40%",
            "levels": "45-51",
            "times": "Any"
          }
        ]
      }
    }
  },
  "43": {
    "name": "Oddish",
    "tips": [
      "In HGSS, Oddish only appears at night; Ilex Forest is the earliest reliable spot.",
      "In Diamond/Pearl, Oddish is locked behind the National Dex post-game Routes 229/230 (Platinum moves it to Routes 224/230 at night)."
    ],
    "games": {
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 229",
            "kind": "grass",
            "rarity": "5%",
            "levels": "20-22",
            "times": "Day",
            "note": "Post-National Dex area"
          },
          {
            "area": "Route 230",
            "kind": "grass",
            "rarity": "11%",
            "levels": "18-23",
            "times": "Day",
            "note": "Post-National Dex area"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 229",
            "kind": "grass",
            "rarity": "5%",
            "levels": "20-22",
            "times": "Day",
            "note": "Post-National Dex area"
          },
          {
            "area": "Route 230",
            "kind": "grass",
            "rarity": "11%",
            "levels": "18-23",
            "times": "Day",
            "note": "Post-National Dex area"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 224",
            "kind": "grass",
            "rarity": "20%",
            "levels": "49",
            "times": "Night"
          },
          {
            "area": "Route 230",
            "kind": "grass",
            "rarity": "20%",
            "levels": "47",
            "times": "Night"
          }
        ]
      },
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Ilex Forest",
            "kind": "grass",
            "rarity": "60%",
            "levels": "5-6",
            "times": "Night"
          },
          {
            "area": "Route 5 (Kanto)",
            "kind": "grass",
            "rarity": "60%",
            "levels": "13",
            "times": "Night"
          },
          {
            "area": "Route 6 (Kanto)",
            "kind": "grass",
            "rarity": "60%",
            "levels": "13",
            "times": "Night"
          },
          {
            "area": "Route 24",
            "kind": "grass",
            "rarity": "30%",
            "levels": "10",
            "times": "Night"
          },
          {
            "area": "Route 25",
            "kind": "grass",
            "rarity": "30%",
            "levels": "10",
            "times": "Night"
          },
          {
            "area": "Safari Zone - Marshland",
            "kind": "grass",
            "levels": "15-17",
            "times": "Night"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Ilex Forest",
            "kind": "grass",
            "rarity": "60%",
            "levels": "5-6",
            "times": "Night"
          },
          {
            "area": "Route 5 (Kanto)",
            "kind": "grass",
            "rarity": "30%",
            "levels": "13",
            "times": "Night"
          },
          {
            "area": "Route 6 (Kanto)",
            "kind": "grass",
            "rarity": "30%",
            "levels": "13",
            "times": "Night"
          },
          {
            "area": "Route 24",
            "kind": "grass",
            "rarity": "30%",
            "levels": "10",
            "times": "Night"
          },
          {
            "area": "Route 25",
            "kind": "grass",
            "rarity": "30%",
            "levels": "10",
            "times": "Night"
          },
          {
            "area": "Safari Zone - Marshland",
            "kind": "grass",
            "levels": "15-17",
            "times": "Night"
          }
        ]
      }
    }
  },
  "44": {
    "name": "Gloom",
    "tips": [
      "Easiest acquisition is evolving Oddish at Lv 21.",
      "Wild Gloom in DPPt is post-game only; in HGSS Route 48 is the most accessible wild source."
    ],
    "games": {
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 224",
            "kind": "grass",
            "rarity": "5%",
            "levels": "53",
            "times": "Any",
            "note": "Post-National Dex"
          },
          {
            "area": "Route 229",
            "kind": "grass",
            "rarity": "10-20%",
            "levels": "51-52",
            "times": "Day",
            "note": "Post-National Dex"
          },
          {
            "area": "Route 230",
            "kind": "grass",
            "rarity": "20%",
            "levels": "50",
            "times": "Any",
            "note": "Post-National Dex"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 224",
            "kind": "grass",
            "rarity": "5%",
            "levels": "53",
            "times": "Any",
            "note": "Post-National Dex"
          },
          {
            "area": "Route 229",
            "kind": "grass",
            "rarity": "10-20%",
            "levels": "51-52",
            "times": "Day",
            "note": "Post-National Dex"
          },
          {
            "area": "Route 230",
            "kind": "grass",
            "rarity": "20%",
            "levels": "50",
            "times": "Any",
            "note": "Post-National Dex"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 224",
            "kind": "grass",
            "rarity": "5%",
            "levels": "51",
            "times": "Any"
          },
          {
            "area": "Route 230",
            "kind": "grass",
            "rarity": "5%",
            "levels": "49",
            "times": "Any"
          }
        ]
      },
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 47",
            "kind": "grass",
            "rarity": "5%",
            "levels": "32",
            "times": "Any"
          },
          {
            "area": "Route 48",
            "kind": "grass",
            "rarity": "20%",
            "levels": "22-24",
            "times": "Any"
          },
          {
            "area": "Route 5 (Kanto)",
            "kind": "grass",
            "rarity": "10%",
            "levels": "15",
            "times": "Night"
          },
          {
            "area": "Route 6 (Kanto)",
            "kind": "grass",
            "rarity": "10%",
            "levels": "15",
            "times": "Night"
          },
          {
            "area": "Safari Zone - Marshland",
            "kind": "grass",
            "levels": "17",
            "times": "Night"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 47",
            "kind": "grass",
            "rarity": "5%",
            "levels": "32",
            "times": "Any"
          },
          {
            "area": "Route 48",
            "kind": "grass",
            "rarity": "20%",
            "levels": "22-24",
            "times": "Any"
          },
          {
            "area": "Route 5 (Kanto)",
            "kind": "grass",
            "rarity": "10%",
            "levels": "15",
            "times": "Night"
          },
          {
            "area": "Route 6 (Kanto)",
            "kind": "grass",
            "rarity": "10%",
            "levels": "15",
            "times": "Night"
          },
          {
            "area": "Safari Zone - Marshland",
            "kind": "grass",
            "levels": "17",
            "times": "Night"
          }
        ]
      }
    }
  },
  "45": {
    "name": "Vileplume",
    "tips": [
      "Gloom can alternatively evolve into Bellossom with a Sun Stone; use a Leaf Stone for Vileplume.",
      "Leaf Stones: Sinnoh Underground or Floaroma/Eterna shops; HGSS Department Store and Bug-Catching Contest prizes."
    ],
    "games": {
      "diamond": {
        "via": "evolve",
        "summary": "Evolve Gloom with a Leaf Stone"
      },
      "pearl": {
        "via": "evolve",
        "summary": "Evolve Gloom with a Leaf Stone"
      },
      "platinum": {
        "via": "evolve",
        "summary": "Evolve Gloom with a Leaf Stone"
      },
      "heartgold": {
        "via": "evolve",
        "summary": "Evolve Gloom with a Leaf Stone"
      },
      "soulsilver": {
        "via": "evolve",
        "summary": "Evolve Gloom with a Leaf Stone"
      }
    }
  },
  "46": {
    "name": "Paras",
    "tips": [
      "In Sinnoh, Paras is a Great Marsh rotation Pokemon available only after the National Dex; check the daily marsh listing.",
      "In HGSS, Ilex Forest is the earliest source; the Bug-Catching Contest is a reliable way to catch a higher-level one."
    ],
    "games": {
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Great Marsh (Pastoria City)",
            "kind": "grass",
            "rarity": "10%",
            "levels": "20-26",
            "times": "Any",
            "note": "Post-National Dex rotation Pokemon"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Great Marsh (Pastoria City)",
            "kind": "grass",
            "rarity": "10%",
            "levels": "20-26",
            "times": "Any",
            "note": "Post-National Dex rotation Pokemon"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Great Marsh (Pastoria City)",
            "kind": "grass",
            "rarity": "10%",
            "levels": "20-26",
            "times": "Any",
            "note": "Post-National Dex rotation Pokemon"
          }
        ]
      },
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Ilex Forest",
            "kind": "grass",
            "rarity": "5-15%",
            "levels": "5-6",
            "times": "Any",
            "note": "15% morning/night, 5% day"
          },
          {
            "area": "Mt. Moon (Kanto)",
            "kind": "cave",
            "rarity": "10%",
            "levels": "12",
            "times": "Any"
          },
          {
            "area": "National Park",
            "kind": "grass",
            "levels": "10-17",
            "times": "Any",
            "note": "Bug-Catching Contest only (Tu/Th/Sa)"
          },
          {
            "area": "Safari Zone - Swamp",
            "kind": "grass",
            "levels": "15-17",
            "times": "Morning/Day"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Ilex Forest",
            "kind": "grass",
            "rarity": "5-15%",
            "levels": "5-6",
            "times": "Any",
            "note": "15% morning/night, 5% day"
          },
          {
            "area": "Mt. Moon (Kanto)",
            "kind": "cave",
            "rarity": "10%",
            "levels": "12",
            "times": "Any"
          },
          {
            "area": "National Park",
            "kind": "grass",
            "levels": "10-17",
            "times": "Any",
            "note": "Bug-Catching Contest only (Tu/Th/Sa)"
          },
          {
            "area": "Safari Zone - Swamp",
            "kind": "grass",
            "levels": "15-17",
            "times": "Morning/Day"
          }
        ]
      }
    }
  },
  "47": {
    "name": "Parasect",
    "tips": [
      "In Diamond/Pearl/Platinum, Parasect is not found wild (only Paras appears in the Great Marsh); evolve Paras at Lv 24.",
      "In HGSS, the easiest route is still evolving Paras, but wild Parasect appear in late-game Cerulean Cave."
    ],
    "games": {
      "diamond": {
        "via": "evolve",
        "summary": "Evolve Paras at Lv 24"
      },
      "pearl": {
        "via": "evolve",
        "summary": "Evolve Paras at Lv 24"
      },
      "platinum": {
        "via": "evolve",
        "summary": "Evolve Paras at Lv 24"
      },
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Cerulean Cave (Kanto)",
            "kind": "cave",
            "rarity": "10-25%",
            "levels": "38-47",
            "times": "Any"
          },
          {
            "area": "Safari Zone - Swamp",
            "kind": "grass",
            "levels": "41",
            "times": "Any",
            "note": "Requires placing terrain blocks"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Cerulean Cave (Kanto)",
            "kind": "cave",
            "rarity": "10-25%",
            "levels": "38-47",
            "times": "Any"
          },
          {
            "area": "Safari Zone - Swamp",
            "kind": "grass",
            "levels": "41",
            "times": "Any",
            "note": "Requires placing terrain blocks"
          }
        ]
      }
    }
  },
  "48": {
    "name": "Venonat",
    "tips": [
      "In Sinnoh, Venonat is a rare PokeRadar-only encounter on Route 229; it requires the National Dex and PokeRadar chaining.",
      "In HGSS, Routes 24/25 (Kanto) at night are the easiest wild source; Bug-Catching Contest is an alternative."
    ],
    "games": {
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 229",
            "kind": "grass",
            "rarity": "2%",
            "levels": "22",
            "times": "Any",
            "note": "PokeRadar chain only; post-National Dex"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 229",
            "kind": "grass",
            "rarity": "2%",
            "levels": "22",
            "times": "Any",
            "note": "PokeRadar chain only; post-National Dex"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 229",
            "kind": "grass",
            "rarity": "2%",
            "levels": "48",
            "times": "Any",
            "note": "PokeRadar chain only; post-National Dex"
          }
        ]
      },
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 24",
            "kind": "grass",
            "rarity": "5-30%",
            "levels": "8",
            "times": "Any",
            "note": "30% night, 5% morning"
          },
          {
            "area": "Route 25",
            "kind": "grass",
            "rarity": "20-30%",
            "levels": "8-10",
            "times": "Any",
            "note": "30% night, 20% morning"
          },
          {
            "area": "Route 43",
            "kind": "grass",
            "rarity": "5-15%",
            "levels": "15-17",
            "times": "Any",
            "note": "15% night, 5% morning"
          },
          {
            "area": "National Park",
            "kind": "grass",
            "levels": "10-16",
            "times": "Any",
            "note": "Bug-Catching Contest only (Tu/Th/Sa)"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 24",
            "kind": "grass",
            "rarity": "5-30%",
            "levels": "8",
            "times": "Any",
            "note": "30% night, 5% morning"
          },
          {
            "area": "Route 25",
            "kind": "grass",
            "rarity": "20-30%",
            "levels": "8-10",
            "times": "Any",
            "note": "30% night, 20% morning"
          },
          {
            "area": "Route 43",
            "kind": "grass",
            "rarity": "5-15%",
            "levels": "15-17",
            "times": "Any",
            "note": "15% night, 5% morning"
          },
          {
            "area": "National Park",
            "kind": "grass",
            "levels": "10-16",
            "times": "Any",
            "note": "Bug-Catching Contest only (Tu/Th/Sa)"
          }
        ]
      }
    }
  },
  "49": {
    "name": "Venomoth",
    "tips": [
      "Easiest route is to evolve Venonat (Lv 31) rather than hunt wild Venomoth, which is rare in every Gen 4 game.",
      "In Diamond/Pearl/Platinum, Venomoth only appears via PokeRadar chains on Route 229 after getting the National Dex."
    ],
    "games": {
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Kanto Route 24",
            "kind": "grass",
            "rarity": "Rare",
            "levels": "14",
            "times": "Night"
          },
          {
            "area": "Kanto Route 25",
            "kind": "grass",
            "rarity": "Rare",
            "levels": "14",
            "times": "Night"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Kanto Route 24",
            "kind": "grass",
            "rarity": "Rare",
            "levels": "14",
            "times": "Night"
          },
          {
            "area": "Kanto Route 25",
            "kind": "grass",
            "rarity": "Rare",
            "levels": "14",
            "times": "Night"
          }
        ]
      },
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 229",
            "kind": "grass",
            "rarity": "Uncommon",
            "levels": "49-50",
            "times": "Any",
            "note": "PokeRadar only; after National Dex"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 229",
            "kind": "grass",
            "rarity": "Uncommon",
            "levels": "49-50",
            "times": "Any",
            "note": "PokeRadar only; after National Dex"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 229",
            "kind": "grass",
            "rarity": "Uncommon",
            "levels": "50",
            "times": "Any",
            "note": "PokeRadar only; after National Dex"
          }
        ]
      }
    }
  },
  "50": {
    "name": "Diglett",
    "tips": [
      "In HGSS Diglett's Cave it is by far the most common species, so encounters come fast.",
      "Access HGSS Diglett's Cave between Route 2 and Vermilion City after the Snorlax route in Kanto."
    ],
    "games": {
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Diglett's Cave",
            "kind": "cave",
            "rarity": "Common",
            "levels": "13-19",
            "times": "Any"
          },
          {
            "area": "Johto Route 48",
            "kind": "grass",
            "rarity": "Rare",
            "levels": "20",
            "times": "Any"
          },
          {
            "area": "Vermilion City",
            "kind": "grass",
            "rarity": "Common",
            "levels": "13-19",
            "times": "Any",
            "note": "Patch of grass near Diglett's Cave entrance"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Diglett's Cave",
            "kind": "cave",
            "rarity": "Common",
            "levels": "13-19",
            "times": "Any"
          },
          {
            "area": "Johto Route 48",
            "kind": "grass",
            "rarity": "Rare",
            "levels": "20",
            "times": "Any"
          },
          {
            "area": "Vermilion City",
            "kind": "grass",
            "rarity": "Common",
            "levels": "13-19",
            "times": "Any",
            "note": "Patch of grass near Diglett's Cave entrance"
          }
        ]
      },
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 228",
            "kind": "grass",
            "rarity": "Rare",
            "levels": "23-25",
            "times": "Any",
            "note": "After National Dex"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 228",
            "kind": "grass",
            "rarity": "Rare",
            "levels": "23-25",
            "times": "Any",
            "note": "After National Dex"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 228",
            "kind": "grass",
            "rarity": "Rare",
            "levels": "49",
            "times": "Any",
            "note": "After National Dex"
          }
        ]
      }
    }
  },
  "51": {
    "name": "Dugtrio",
    "tips": [
      "Can also be obtained by evolving Diglett at Lv 26.",
      "On Route 228 (DPP) Dugtrio appears in the grass at a ~10% rate post-National Dex."
    ],
    "games": {
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Diglett's Cave",
            "kind": "cave",
            "rarity": "Uncommon",
            "levels": "19-29",
            "times": "Any"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Diglett's Cave",
            "kind": "cave",
            "rarity": "Uncommon",
            "levels": "19-29",
            "times": "Any"
          }
        ]
      },
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 228",
            "kind": "grass",
            "rarity": "Uncommon",
            "levels": "50-52",
            "times": "Any",
            "note": "After National Dex"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 228",
            "kind": "grass",
            "rarity": "Uncommon",
            "levels": "52-54",
            "times": "Any",
            "note": "After National Dex"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 228",
            "kind": "grass",
            "rarity": "Uncommon",
            "levels": "52-54",
            "times": "Any",
            "note": "After National Dex"
          }
        ]
      }
    }
  },
  "52": {
    "name": "Meowth",
    "tips": [
      "Version exclusive: in the Johto remakes Meowth is SoulSilver-only (HeartGold gets Growlithe instead). HeartGold must trade for it.",
      "In DPP, talk to Mr. Backlot in the Trophy Garden mansion daily; he names two bonus species that then appear in the garden grass. Save and check daily until he announces Meowth."
    ],
    "games": {
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Kanto Route 5",
            "kind": "grass",
            "rarity": "Common",
            "levels": "16-17",
            "times": "Any"
          },
          {
            "area": "Kanto Route 6",
            "kind": "grass",
            "rarity": "Common",
            "levels": "16-17",
            "times": "Any"
          },
          {
            "area": "Kanto Route 7",
            "kind": "grass",
            "rarity": "Common",
            "levels": "17",
            "times": "Any"
          },
          {
            "area": "Kanto Route 8",
            "kind": "grass",
            "rarity": "Common",
            "levels": "17-18",
            "times": "Any"
          },
          {
            "area": "Johto Route 38",
            "kind": "grass",
            "rarity": "Common",
            "levels": "13-15",
            "times": "Any"
          },
          {
            "area": "Johto Route 39",
            "kind": "grass",
            "rarity": "Common",
            "levels": "13-15",
            "times": "Any"
          }
        ]
      },
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Trophy Garden",
            "kind": "special",
            "rarity": "Rare",
            "levels": "16-18",
            "times": "Any",
            "note": "Daily rotating Pokemon placed by Mr. Backlot; after National Dex"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Trophy Garden",
            "kind": "special",
            "rarity": "Rare",
            "levels": "16-18",
            "times": "Any",
            "note": "Daily rotating Pokemon placed by Mr. Backlot; after National Dex"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Trophy Garden",
            "kind": "special",
            "rarity": "Rare",
            "levels": "16-18",
            "times": "Any",
            "note": "Daily rotating Pokemon placed by Mr. Backlot; after National Dex"
          }
        ]
      }
    }
  },
  "53": {
    "name": "Persian",
    "tips": [
      "Only SoulSilver can catch Persian in the wild; HeartGold must evolve a traded Meowth or trade for Persian.",
      "Can also be obtained in any game by evolving Meowth at Lv 28."
    ],
    "games": {
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Kanto Route 7",
            "kind": "grass",
            "rarity": "Rare",
            "levels": "19",
            "times": "Any"
          },
          {
            "area": "Cerulean Cave",
            "kind": "cave",
            "rarity": "Uncommon",
            "levels": "46-49",
            "times": "Any",
            "note": "After Red is defeated at Mt. Silver"
          }
        ]
      },
      "diamond": {
        "via": "evolve",
        "summary": "Evolve Meowth at Lv 28 (Meowth via Trophy Garden daily Pokemon)"
      },
      "pearl": {
        "via": "evolve",
        "summary": "Evolve Meowth at Lv 28 (Meowth via Trophy Garden daily Pokemon)"
      },
      "platinum": {
        "via": "evolve",
        "summary": "Evolve Meowth at Lv 28 (Meowth via Trophy Garden daily Pokemon)"
      }
    }
  },
  "54": {
    "name": "Psyduck",
    "tips": [
      "Surf almost any early-game water in DPP or the Kanto/Johto rivers in HGSS; Psyduck is the most common surf encounter on many of them."
    ],
    "games": {
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Kanto Route 6",
            "kind": "surf",
            "rarity": "Common",
            "levels": "5-10",
            "times": "Any"
          },
          {
            "area": "Johto Route 35",
            "kind": "surf",
            "rarity": "Common",
            "levels": "5-10",
            "times": "Any"
          },
          {
            "area": "Ilex Forest",
            "kind": "surf",
            "rarity": "Common",
            "levels": "5-10",
            "times": "Any"
          },
          {
            "area": "Seafoam Islands",
            "kind": "surf",
            "rarity": "Common",
            "levels": "20-30",
            "times": "Any"
          },
          {
            "area": "Cerulean Cave",
            "kind": "surf",
            "rarity": "Common",
            "levels": "35-45",
            "times": "Any"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Kanto Route 6",
            "kind": "surf",
            "rarity": "Common",
            "levels": "5-10",
            "times": "Any"
          },
          {
            "area": "Johto Route 35",
            "kind": "surf",
            "rarity": "Common",
            "levels": "5-10",
            "times": "Any"
          },
          {
            "area": "Ilex Forest",
            "kind": "surf",
            "rarity": "Common",
            "levels": "5-10",
            "times": "Any"
          },
          {
            "area": "Seafoam Islands",
            "kind": "surf",
            "rarity": "Common",
            "levels": "20-30",
            "times": "Any"
          },
          {
            "area": "Cerulean Cave",
            "kind": "surf",
            "rarity": "Common",
            "levels": "35-45",
            "times": "Any"
          }
        ]
      },
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 203",
            "kind": "surf",
            "rarity": "Common",
            "levels": "20-40",
            "times": "Any"
          },
          {
            "area": "Route 204",
            "kind": "surf",
            "rarity": "Common",
            "levels": "20-40",
            "times": "Any"
          },
          {
            "area": "Great Marsh",
            "kind": "grass",
            "rarity": "Uncommon",
            "levels": "22-26",
            "times": "Any",
            "note": "Rotates with marsh area"
          },
          {
            "area": "Lake Verity",
            "kind": "surf",
            "rarity": "Common",
            "levels": "20-40",
            "times": "Any"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 203",
            "kind": "surf",
            "rarity": "Common",
            "levels": "20-40",
            "times": "Any"
          },
          {
            "area": "Route 204",
            "kind": "surf",
            "rarity": "Common",
            "levels": "20-40",
            "times": "Any"
          },
          {
            "area": "Great Marsh",
            "kind": "grass",
            "rarity": "Uncommon",
            "levels": "22-26",
            "times": "Any",
            "note": "Rotates with marsh area"
          },
          {
            "area": "Lake Verity",
            "kind": "surf",
            "rarity": "Common",
            "levels": "20-40",
            "times": "Any"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 203",
            "kind": "surf",
            "rarity": "Common",
            "levels": "20-40",
            "times": "Any"
          },
          {
            "area": "Route 204",
            "kind": "surf",
            "rarity": "Common",
            "levels": "20-40",
            "times": "Any"
          },
          {
            "area": "Lake Verity",
            "kind": "surf",
            "rarity": "Common",
            "levels": "20-40",
            "times": "Any"
          },
          {
            "area": "Resort Area",
            "kind": "surf",
            "rarity": "Common",
            "levels": "20-40",
            "times": "Any"
          }
        ]
      }
    }
  },
  "55": {
    "name": "Golduck",
    "tips": [
      "Surf-only in every Gen 4 game; the simplest route is to catch and evolve a Psyduck (Lv 33) instead of hunting wild Golduck."
    ],
    "games": {
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Kanto Route 6",
            "kind": "surf",
            "rarity": "Uncommon",
            "levels": "10",
            "times": "Any"
          },
          {
            "area": "Johto Route 35",
            "kind": "surf",
            "rarity": "Uncommon",
            "levels": "10",
            "times": "Any"
          },
          {
            "area": "Seafoam Islands",
            "kind": "surf",
            "rarity": "Uncommon",
            "levels": "20-30",
            "times": "Any"
          },
          {
            "area": "Cerulean Cave",
            "kind": "surf",
            "rarity": "Uncommon",
            "levels": "35-45",
            "times": "Any"
          },
          {
            "area": "Mt. Silver",
            "kind": "surf",
            "rarity": "Uncommon",
            "levels": "35-45",
            "times": "Any"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Kanto Route 6",
            "kind": "surf",
            "rarity": "Uncommon",
            "levels": "10",
            "times": "Any"
          },
          {
            "area": "Johto Route 35",
            "kind": "surf",
            "rarity": "Uncommon",
            "levels": "10",
            "times": "Any"
          },
          {
            "area": "Seafoam Islands",
            "kind": "surf",
            "rarity": "Uncommon",
            "levels": "20-30",
            "times": "Any"
          },
          {
            "area": "Cerulean Cave",
            "kind": "surf",
            "rarity": "Uncommon",
            "levels": "35-45",
            "times": "Any"
          },
          {
            "area": "Mt. Silver",
            "kind": "surf",
            "rarity": "Uncommon",
            "levels": "35-45",
            "times": "Any"
          }
        ]
      },
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 225",
            "kind": "surf",
            "rarity": "Uncommon",
            "levels": "20-40",
            "times": "Any",
            "note": "After National Dex"
          },
          {
            "area": "Route 226",
            "kind": "surf",
            "rarity": "Uncommon",
            "levels": "20-40",
            "times": "Any"
          },
          {
            "area": "Sendoff Spring",
            "kind": "surf",
            "rarity": "Uncommon",
            "levels": "20-40",
            "times": "Any"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 225",
            "kind": "surf",
            "rarity": "Uncommon",
            "levels": "20-40",
            "times": "Any",
            "note": "After National Dex"
          },
          {
            "area": "Route 226",
            "kind": "surf",
            "rarity": "Uncommon",
            "levels": "20-40",
            "times": "Any"
          },
          {
            "area": "Sendoff Spring",
            "kind": "surf",
            "rarity": "Uncommon",
            "levels": "20-40",
            "times": "Any"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 225",
            "kind": "surf",
            "rarity": "Uncommon",
            "levels": "20-40",
            "times": "Any"
          },
          {
            "area": "Route 212",
            "kind": "surf",
            "rarity": "Uncommon",
            "levels": "20-40",
            "times": "Any"
          },
          {
            "area": "Resort Area",
            "kind": "surf",
            "rarity": "Uncommon",
            "levels": "20-40",
            "times": "Any"
          }
        ]
      }
    }
  },
  "56": {
    "name": "Mankey",
    "tips": [
      "Version exclusive: Mankey is HeartGold-only in the Johto remakes (SoulSilver gets Meowth/Persian instead and must trade for Mankey).",
      "Kanto Route 9 (HG) is the easiest place to catch one; in DPP it is PokeRadar-only on Routes 225/226."
    ],
    "games": {
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Kanto Route 9",
            "kind": "grass",
            "rarity": "Common",
            "levels": "13",
            "times": "Any"
          },
          {
            "area": "Johto Route 42",
            "kind": "grass",
            "rarity": "Uncommon",
            "levels": "15",
            "times": "Any"
          }
        ]
      },
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 225",
            "kind": "grass",
            "rarity": "Rare",
            "levels": "22",
            "times": "Any",
            "note": "PokeRadar only; after National Dex"
          },
          {
            "area": "Route 226",
            "kind": "grass",
            "rarity": "Rare",
            "levels": "22",
            "times": "Any",
            "note": "PokeRadar only; after National Dex"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 225",
            "kind": "grass",
            "rarity": "Rare",
            "levels": "22",
            "times": "Any",
            "note": "PokeRadar only; after National Dex"
          },
          {
            "area": "Route 226",
            "kind": "grass",
            "rarity": "Rare",
            "levels": "22",
            "times": "Any",
            "note": "PokeRadar only; after National Dex"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 225",
            "kind": "grass",
            "rarity": "Rare",
            "levels": "47",
            "times": "Any",
            "note": "PokeRadar only; after National Dex"
          },
          {
            "area": "Route 226",
            "kind": "grass",
            "rarity": "Rare",
            "levels": "47",
            "times": "Any",
            "note": "PokeRadar only; after National Dex"
          }
        ]
      }
    }
  },
  "57": {
    "name": "Primeape",
    "tips": [
      "Version exclusive: Primeape is HeartGold-only in the Johto remakes (SoulSilver must trade for it).",
      "Can also be obtained in any game by evolving Mankey at Lv 28."
    ],
    "games": {
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Kanto Route 9",
            "kind": "grass",
            "rarity": "Uncommon",
            "levels": "16",
            "times": "Any"
          },
          {
            "area": "Cerulean Cave",
            "kind": "cave",
            "rarity": "Uncommon",
            "levels": "38-39",
            "times": "Any",
            "note": "After Red is defeated at Mt. Silver"
          }
        ]
      },
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 225",
            "kind": "grass",
            "rarity": "Uncommon",
            "levels": "49-50",
            "times": "Any",
            "note": "PokeRadar only; after National Dex"
          },
          {
            "area": "Route 226",
            "kind": "grass",
            "rarity": "Uncommon",
            "levels": "49-50",
            "times": "Any",
            "note": "PokeRadar only; after National Dex"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 225",
            "kind": "grass",
            "rarity": "Uncommon",
            "levels": "49-50",
            "times": "Any",
            "note": "PokeRadar only; after National Dex"
          },
          {
            "area": "Route 226",
            "kind": "grass",
            "rarity": "Uncommon",
            "levels": "49-50",
            "times": "Any",
            "note": "PokeRadar only; after National Dex"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 225",
            "kind": "grass",
            "rarity": "Uncommon",
            "levels": "51-52",
            "times": "Any",
            "note": "PokeRadar only; after National Dex"
          },
          {
            "area": "Route 226",
            "kind": "grass",
            "rarity": "Uncommon",
            "levels": "51-53",
            "times": "Any",
            "note": "PokeRadar only; after National Dex"
          }
        ]
      }
    }
  },
  "58": {
    "name": "Growlithe",
    "tips": [
      "Version exclusive: Growlithe is HeartGold-only in the Johto remakes (SoulSilver gets Vulpix and must trade for Growlithe).",
      "In DPP, Growlithe only appears on Routes 201/202 when a Pokemon FireRed cartridge is inserted in the DS GBA slot (dual-slot mode), after obtaining the National Dex."
    ],
    "games": {
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Kanto Route 7",
            "kind": "grass",
            "rarity": "Common",
            "levels": "18-19",
            "times": "Morning/Day"
          },
          {
            "area": "Kanto Route 8",
            "kind": "grass",
            "rarity": "Common",
            "levels": "18-19",
            "times": "Morning/Day"
          },
          {
            "area": "Johto Route 36",
            "kind": "grass",
            "rarity": "Common",
            "levels": "13-15",
            "times": "Morning/Day"
          },
          {
            "area": "Johto Route 37",
            "kind": "grass",
            "rarity": "Common",
            "levels": "15",
            "times": "Morning/Day"
          },
          {
            "area": "Johto Route 48",
            "kind": "grass",
            "rarity": "Common",
            "levels": "21-25",
            "times": "Night"
          }
        ]
      },
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 201",
            "kind": "special",
            "rarity": "Rare",
            "levels": "2",
            "times": "Any",
            "note": "Dual-slot only: requires Pokemon FireRed in the GBA slot; after National Dex"
          },
          {
            "area": "Route 202",
            "kind": "special",
            "rarity": "Rare",
            "levels": "2",
            "times": "Any",
            "note": "Dual-slot only: requires Pokemon FireRed in the GBA slot; after National Dex"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 201",
            "kind": "special",
            "rarity": "Rare",
            "levels": "2",
            "times": "Any",
            "note": "Dual-slot only: requires Pokemon FireRed in the GBA slot; after National Dex"
          },
          {
            "area": "Route 202",
            "kind": "special",
            "rarity": "Rare",
            "levels": "2",
            "times": "Any",
            "note": "Dual-slot only: requires Pokemon FireRed in the GBA slot; after National Dex"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 201",
            "kind": "special",
            "rarity": "Rare",
            "levels": "2",
            "times": "Any",
            "note": "Dual-slot only: requires Pokemon FireRed in the GBA slot; after National Dex"
          },
          {
            "area": "Route 202",
            "kind": "special",
            "rarity": "Rare",
            "levels": "2",
            "times": "Any",
            "note": "Dual-slot only: requires Pokemon FireRed in the GBA slot; after National Dex"
          }
        ]
      }
    }
  },
  "59": {
    "name": "Arcanine",
    "tips": [
      "Arcanine is never found wild in any Gen 4 game; always evolve Growlithe with a Fire Stone.",
      "SoulSilver has no wild Growlithe, so a SoulSilver player must trade in a Growlithe or Arcanine to obtain it."
    ],
    "games": {
      "heartgold": {
        "via": "evolve",
        "summary": "Evolve Growlithe with a Fire Stone (Growlithe wild on Kanto/Johto routes in HeartGold)"
      },
      "diamond": {
        "via": "evolve",
        "summary": "Evolve Growlithe with a Fire Stone (Growlithe via dual-slot FireRed on Route 201/202)"
      },
      "pearl": {
        "via": "evolve",
        "summary": "Evolve Growlithe with a Fire Stone (Growlithe via dual-slot FireRed on Route 201/202)"
      },
      "platinum": {
        "via": "evolve",
        "summary": "Evolve Growlithe with a Fire Stone (Growlithe via dual-slot FireRed on Route 201/202)"
      }
    }
  },
  "60": {
    "name": "Poliwag",
    "tips": [
      "In HGSS, Poliwag is an easy early surf/Good Rod catch right outside Cherrygrove on Routes 30/31.",
      "In DPP, Poliwag is surf-only and concentrated in the post-game Victory Road / Pokemon League routes (225/227/228)."
    ],
    "games": {
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Johto Route 30",
            "kind": "surf",
            "rarity": "Common",
            "levels": "10-25",
            "times": "Any"
          },
          {
            "area": "Johto Route 30",
            "kind": "fish",
            "rarity": "Common",
            "levels": "20",
            "times": "Any",
            "note": "Good Rod"
          },
          {
            "area": "Johto Route 31",
            "kind": "surf",
            "rarity": "Common",
            "levels": "10-25",
            "times": "Any"
          },
          {
            "area": "Johto Route 44",
            "kind": "surf",
            "rarity": "Common",
            "levels": "20-30",
            "times": "Any"
          },
          {
            "area": "Ilex Forest",
            "kind": "surf",
            "rarity": "Common",
            "levels": "10-25",
            "times": "Any"
          },
          {
            "area": "Ruins of Alph",
            "kind": "surf",
            "rarity": "Common",
            "levels": "10-25",
            "times": "Any"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Johto Route 30",
            "kind": "surf",
            "rarity": "Common",
            "levels": "10-25",
            "times": "Any"
          },
          {
            "area": "Johto Route 30",
            "kind": "fish",
            "rarity": "Common",
            "levels": "20",
            "times": "Any",
            "note": "Good Rod"
          },
          {
            "area": "Johto Route 31",
            "kind": "surf",
            "rarity": "Common",
            "levels": "10-25",
            "times": "Any"
          },
          {
            "area": "Johto Route 44",
            "kind": "surf",
            "rarity": "Common",
            "levels": "20-30",
            "times": "Any"
          },
          {
            "area": "Ilex Forest",
            "kind": "surf",
            "rarity": "Common",
            "levels": "10-25",
            "times": "Any"
          },
          {
            "area": "Ruins of Alph",
            "kind": "surf",
            "rarity": "Common",
            "levels": "10-25",
            "times": "Any"
          }
        ]
      },
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 225",
            "kind": "surf",
            "rarity": "Common",
            "levels": "20-40",
            "times": "Any",
            "note": "After National Dex"
          },
          {
            "area": "Route 227",
            "kind": "surf",
            "rarity": "Common",
            "levels": "20-45",
            "times": "Any"
          },
          {
            "area": "Route 228",
            "kind": "surf",
            "rarity": "Common",
            "levels": "20-40",
            "times": "Any"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 225",
            "kind": "surf",
            "rarity": "Common",
            "levels": "20-40",
            "times": "Any",
            "note": "After National Dex"
          },
          {
            "area": "Route 227",
            "kind": "surf",
            "rarity": "Common",
            "levels": "20-45",
            "times": "Any"
          },
          {
            "area": "Route 228",
            "kind": "surf",
            "rarity": "Common",
            "levels": "20-40",
            "times": "Any"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 227",
            "kind": "surf",
            "rarity": "Common",
            "levels": "20-45",
            "times": "Any",
            "note": "After National Dex"
          },
          {
            "area": "Route 228",
            "kind": "surf",
            "rarity": "Common",
            "levels": "20-40",
            "times": "Any"
          }
        ]
      }
    }
  },
  "85": {
    "name": "Dodrio",
    "tips": [
      "In DPPt, evolve Doduo (catch on Route 201/202/206/209/Trophy Garden) at Lv 31.",
      "In HGSS the version difference is Route 26 (HeartGold) vs Route 27 (SoulSilver); both share Route 28 and Mt. Silver, and Dodrio also appears in Cerulean Cave."
    ],
    "games": {
      "diamond": {
        "via": "evolve",
        "summary": "Evolve Doduo at Lv 31"
      },
      "pearl": {
        "via": "evolve",
        "summary": "Evolve Doduo at Lv 31"
      },
      "platinum": {
        "via": "evolve",
        "summary": "Evolve Doduo at Lv 31"
      },
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 26",
            "kind": "grass",
            "rarity": "5%",
            "levels": "30",
            "times": "Morning/Day"
          },
          {
            "area": "Route 17",
            "kind": "grass",
            "rarity": "1%",
            "levels": "29",
            "times": "Any"
          },
          {
            "area": "Route 28",
            "kind": "grass",
            "rarity": "5%",
            "levels": "43",
            "times": "Morning/Day"
          },
          {
            "area": "Mt. Silver (Outside)",
            "kind": "grass",
            "rarity": "5%",
            "levels": "43",
            "times": "Morning/Day"
          },
          {
            "area": "Cerulean Cave (1F)",
            "kind": "cave",
            "rarity": "10%",
            "levels": "49",
            "times": "Any"
          },
          {
            "area": "Cerulean Cave (2F)",
            "kind": "cave",
            "rarity": "20%",
            "levels": "51",
            "times": "Any"
          },
          {
            "area": "Safari Zone - Rocky Beach",
            "kind": "special",
            "levels": "42",
            "times": "Any",
            "note": "Requires 10 Plains objects placed in Rocky Beach"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 27",
            "kind": "grass",
            "rarity": "5%",
            "levels": "30",
            "times": "Morning/Day"
          },
          {
            "area": "Route 17",
            "kind": "grass",
            "rarity": "1%",
            "levels": "29",
            "times": "Any"
          },
          {
            "area": "Route 28",
            "kind": "grass",
            "rarity": "5%",
            "levels": "43",
            "times": "Morning/Day"
          },
          {
            "area": "Mt. Silver (Outside)",
            "kind": "grass",
            "rarity": "5%",
            "levels": "43",
            "times": "Morning/Day"
          },
          {
            "area": "Cerulean Cave (1F)",
            "kind": "cave",
            "rarity": "10%",
            "levels": "49",
            "times": "Any"
          },
          {
            "area": "Cerulean Cave (2F)",
            "kind": "cave",
            "rarity": "20%",
            "levels": "51",
            "times": "Any"
          },
          {
            "area": "Safari Zone - Rocky Beach",
            "kind": "special",
            "levels": "42",
            "times": "Any",
            "note": "Requires 10 Plains objects placed in Rocky Beach"
          }
        ]
      }
    }
  },
  "86": {
    "name": "Seel",
    "tips": [
      "In DPPt, Seel is only available post-game in the Battle Zone (Routes 226/230 by surfing).",
      "In HGSS, Whirl Islands is the earliest source; Seafoam Islands has the densest population once accessible in Kanto."
    ],
    "games": {
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 226",
            "kind": "surf",
            "rarity": "30%",
            "levels": "35-45",
            "times": "Any"
          },
          {
            "area": "Route 230",
            "kind": "surf",
            "rarity": "30%",
            "levels": "35-45",
            "times": "Any"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 226",
            "kind": "surf",
            "rarity": "30%",
            "levels": "35-45",
            "times": "Any"
          },
          {
            "area": "Route 230",
            "kind": "surf",
            "rarity": "30%",
            "levels": "35-45",
            "times": "Any"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 226",
            "kind": "surf",
            "rarity": "30%",
            "levels": "35-45",
            "times": "Any"
          },
          {
            "area": "Route 230",
            "kind": "surf",
            "rarity": "30%",
            "levels": "35-45",
            "times": "Any"
          }
        ]
      },
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Whirl Islands (1F, B1F, B2F, B3F)",
            "kind": "cave",
            "rarity": "15%",
            "levels": "22-26",
            "times": "Any"
          },
          {
            "area": "Route 47",
            "kind": "surf",
            "rarity": "30%",
            "levels": "10-20",
            "times": "Any"
          },
          {
            "area": "Seafoam Islands (B1F-B3F)",
            "kind": "cave",
            "rarity": "30%",
            "levels": "22-47",
            "times": "Any"
          },
          {
            "area": "Seafoam Islands (B3F-B4F)",
            "kind": "surf",
            "rarity": "60%",
            "levels": "25-40",
            "times": "Any"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Whirl Islands (1F, B1F, B2F, B3F)",
            "kind": "cave",
            "rarity": "15%",
            "levels": "22-26",
            "times": "Any"
          },
          {
            "area": "Route 47",
            "kind": "surf",
            "rarity": "30%",
            "levels": "10-20",
            "times": "Any"
          },
          {
            "area": "Seafoam Islands (B1F-B3F)",
            "kind": "cave",
            "rarity": "30%",
            "levels": "22-47",
            "times": "Any"
          },
          {
            "area": "Seafoam Islands (B3F-B4F)",
            "kind": "surf",
            "rarity": "60%",
            "levels": "25-40",
            "times": "Any"
          }
        ]
      }
    }
  },
  "87": {
    "name": "Dewgong",
    "tips": [
      "Fastest route everywhere is evolving a Seel at Lv 34; in HGSS you can also surf one up in Seafoam Islands B4F."
    ],
    "games": {
      "diamond": {
        "via": "evolve",
        "summary": "Evolve Seel at Lv 34"
      },
      "pearl": {
        "via": "evolve",
        "summary": "Evolve Seel at Lv 34"
      },
      "platinum": {
        "via": "evolve",
        "summary": "Evolve Seel at Lv 34"
      },
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Seafoam Islands (B4F)",
            "kind": "surf",
            "rarity": "Uncommon",
            "levels": "30-35",
            "times": "Any",
            "note": "Also obtainable by evolving Seel at Lv 34"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Seafoam Islands (B4F)",
            "kind": "surf",
            "rarity": "Uncommon",
            "levels": "30-35",
            "times": "Any",
            "note": "Also obtainable by evolving Seel at Lv 34"
          }
        ]
      }
    }
  },
  "88": {
    "name": "Grimer",
    "tips": [
      "In DPPt, Grimer is a PokeRadar-exclusive on Route 212 South (22% chained encounter) — you cannot find it in normal grass.",
      "In HGSS it is a common Kanto-route catch (Routes 16-18, ~20%) once you reach Kanto, and very common surfing in Celadon City."
    ],
    "games": {
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 212 (South)",
            "kind": "grass",
            "rarity": "22%",
            "levels": "18-20",
            "times": "Any",
            "note": "PokeRadar only"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 212 (South)",
            "kind": "grass",
            "rarity": "22%",
            "levels": "18-20",
            "times": "Any",
            "note": "PokeRadar only"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 212 (South)",
            "kind": "grass",
            "rarity": "22%",
            "levels": "23-26",
            "times": "Any",
            "note": "PokeRadar only"
          }
        ]
      },
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 16",
            "kind": "grass",
            "rarity": "20%",
            "levels": "26",
            "times": "Any"
          },
          {
            "area": "Route 17",
            "kind": "grass",
            "rarity": "20%",
            "levels": "27-29",
            "times": "Any"
          },
          {
            "area": "Route 18",
            "kind": "grass",
            "rarity": "20%",
            "levels": "26",
            "times": "Any"
          },
          {
            "area": "Celadon City",
            "kind": "surf",
            "rarity": "90%",
            "levels": "15-24",
            "times": "Any"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 16",
            "kind": "grass",
            "rarity": "20%",
            "levels": "26",
            "times": "Any"
          },
          {
            "area": "Route 17",
            "kind": "grass",
            "rarity": "20%",
            "levels": "27-29",
            "times": "Any"
          },
          {
            "area": "Route 18",
            "kind": "grass",
            "rarity": "20%",
            "levels": "26",
            "times": "Any"
          },
          {
            "area": "Celadon City",
            "kind": "surf",
            "rarity": "90%",
            "levels": "15-24",
            "times": "Any"
          }
        ]
      }
    }
  },
  "89": {
    "name": "Muk",
    "tips": [
      "Muk is evolve-only in all five games; raise a Grimer to Lv 38. In DPPt the Grimer itself is PokeRadar-only on Route 212 South."
    ],
    "games": {
      "diamond": {
        "via": "evolve",
        "summary": "Evolve Grimer at Lv 38"
      },
      "pearl": {
        "via": "evolve",
        "summary": "Evolve Grimer at Lv 38"
      },
      "platinum": {
        "via": "evolve",
        "summary": "Evolve Grimer at Lv 38"
      },
      "heartgold": {
        "via": "evolve",
        "summary": "Evolve Grimer at Lv 38"
      },
      "soulsilver": {
        "via": "evolve",
        "summary": "Evolve Grimer at Lv 38"
      }
    }
  },
  "90": {
    "name": "Shellder",
    "tips": [
      "Shellder is fishing-only everywhere; the Super Rod gives the best rate (30% in HGSS, 15% in DPPt).",
      "In DPPt it is restricted to a few Super Rod spots (Route 205 South, Valley Windworks, Fuego Ironworks)."
    ],
    "games": {
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 205 (South)",
            "kind": "fish",
            "rarity": "15%",
            "levels": "20-40",
            "times": "Any",
            "note": "Super Rod"
          },
          {
            "area": "Valley Windworks",
            "kind": "fish",
            "rarity": "15%",
            "levels": "20-40",
            "times": "Any",
            "note": "Super Rod"
          },
          {
            "area": "Fuego Ironworks",
            "kind": "fish",
            "rarity": "15%",
            "levels": "20-40",
            "times": "Any",
            "note": "Super Rod"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 205 (South)",
            "kind": "fish",
            "rarity": "15%",
            "levels": "20-40",
            "times": "Any",
            "note": "Super Rod"
          },
          {
            "area": "Valley Windworks",
            "kind": "fish",
            "rarity": "15%",
            "levels": "20-40",
            "times": "Any",
            "note": "Super Rod"
          },
          {
            "area": "Fuego Ironworks",
            "kind": "fish",
            "rarity": "15%",
            "levels": "20-40",
            "times": "Any",
            "note": "Super Rod"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 205 (South)",
            "kind": "fish",
            "rarity": "15%",
            "levels": "20-50",
            "times": "Any",
            "note": "Super Rod"
          },
          {
            "area": "Valley Windworks",
            "kind": "fish",
            "rarity": "15%",
            "levels": "20-50",
            "times": "Any",
            "note": "Super Rod"
          },
          {
            "area": "Fuego Ironworks",
            "kind": "fish",
            "rarity": "15%",
            "levels": "20-50",
            "times": "Any",
            "note": "Super Rod"
          }
        ]
      },
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 41",
            "kind": "fish",
            "rarity": "30%",
            "levels": "40",
            "times": "Any",
            "note": "Super Rod (10% Good Rod at Lv 20)"
          },
          {
            "area": "Route 47",
            "kind": "fish",
            "rarity": "30%",
            "levels": "40",
            "times": "Any",
            "note": "Super Rod (10% Good Rod at Lv 20)"
          },
          {
            "area": "New Bark Town",
            "kind": "fish",
            "rarity": "30%",
            "levels": "40",
            "times": "Any",
            "note": "Super Rod (10% Good Rod at Lv 20)"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 41",
            "kind": "fish",
            "rarity": "30%",
            "levels": "40",
            "times": "Any",
            "note": "Super Rod (10% Good Rod at Lv 20)"
          },
          {
            "area": "Route 47",
            "kind": "fish",
            "rarity": "30%",
            "levels": "40",
            "times": "Any",
            "note": "Super Rod (10% Good Rod at Lv 20)"
          },
          {
            "area": "New Bark Town",
            "kind": "fish",
            "rarity": "30%",
            "levels": "40",
            "times": "Any",
            "note": "Super Rod (10% Good Rod at Lv 20)"
          }
        ]
      }
    }
  },
  "91": {
    "name": "Cloyster",
    "tips": [
      "Cloyster is evolve-only in all five games — use a Water Stone on a Shellder."
    ],
    "games": {
      "diamond": {
        "via": "evolve",
        "summary": "Evolve Shellder with a Water Stone"
      },
      "pearl": {
        "via": "evolve",
        "summary": "Evolve Shellder with a Water Stone"
      },
      "platinum": {
        "via": "evolve",
        "summary": "Evolve Shellder with a Water Stone"
      },
      "heartgold": {
        "via": "evolve",
        "summary": "Evolve Shellder with a Water Stone"
      },
      "soulsilver": {
        "via": "evolve",
        "summary": "Evolve Shellder with a Water Stone"
      }
    }
  },
  "92": {
    "name": "Gastly",
    "tips": [
      "In HGSS, Gastly only appears at NIGHT (8pm-4am) — Sprout Tower 2F/3F is the earliest and easiest spot.",
      "In DPPt, the Old Chateau is a 100% Gastly encounter, making it the fastest source.",
      "In DPPt, Route 209's grass Gastly only appears at night; Eterna Forest is Platinum-only."
    ],
    "games": {
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Old Chateau (rooms / dining room / entrance)",
            "kind": "cave",
            "rarity": "100%",
            "levels": "12-16",
            "times": "Any"
          },
          {
            "area": "Lost Tower (1F-5F)",
            "kind": "cave",
            "rarity": "50%",
            "levels": "16-22",
            "times": "Any"
          },
          {
            "area": "Route 209",
            "kind": "grass",
            "rarity": "10%",
            "levels": "16",
            "times": "Night"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Old Chateau (rooms / dining room / entrance)",
            "kind": "cave",
            "rarity": "100%",
            "levels": "12-16",
            "times": "Any"
          },
          {
            "area": "Lost Tower (1F-5F)",
            "kind": "cave",
            "rarity": "50%",
            "levels": "16-22",
            "times": "Any"
          },
          {
            "area": "Route 209",
            "kind": "grass",
            "rarity": "10%",
            "levels": "16",
            "times": "Night"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Old Chateau (rooms / dining room / entrance)",
            "kind": "cave",
            "rarity": "100%",
            "levels": "14-17",
            "times": "Any"
          },
          {
            "area": "Lost Tower (1F-5F)",
            "kind": "cave",
            "rarity": "45-65%",
            "levels": "17-22",
            "times": "Any"
          },
          {
            "area": "Eterna Forest",
            "kind": "grass",
            "rarity": "4%",
            "levels": "13",
            "times": "Any"
          },
          {
            "area": "Turnback Cave (entrance to 1st pillar)",
            "kind": "cave",
            "rarity": "30-40%",
            "levels": "15-17",
            "times": "Any"
          }
        ]
      },
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Sprout Tower (2F, 3F)",
            "kind": "cave",
            "rarity": "85%",
            "levels": "3-6",
            "times": "Night"
          },
          {
            "area": "Bell Tower (2F-10F)",
            "kind": "cave",
            "rarity": "80%",
            "levels": "20-22",
            "times": "Night"
          },
          {
            "area": "Safari Zone - Forest",
            "kind": "grass",
            "levels": "15-17",
            "times": "Night"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Sprout Tower (2F, 3F)",
            "kind": "cave",
            "rarity": "85%",
            "levels": "3-6",
            "times": "Night"
          },
          {
            "area": "Bell Tower (2F-10F)",
            "kind": "cave",
            "rarity": "80%",
            "levels": "20-22",
            "times": "Night"
          },
          {
            "area": "Safari Zone - Forest",
            "kind": "grass",
            "levels": "15-17",
            "times": "Night"
          }
        ]
      }
    }
  },
  "93": {
    "name": "Haunter",
    "tips": [
      "Evolve a Gastly at Lv 25 if you want it early; otherwise wild Haunter appears at night on Kanto Route 8 (HGSS) or in Turnback Cave / Old Chateau (DPPt).",
      "In DPPt the Old Chateau Haunter only spawns with a Gen III cartridge in the DS slot-2."
    ],
    "games": {
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Old Chateau (2F TV room)",
            "kind": "cave",
            "rarity": "8%",
            "levels": "16",
            "times": "Any",
            "note": "Requires a Gen III game in slot 2; also evolve Gastly at Lv 25"
          },
          {
            "area": "Turnback Cave",
            "kind": "cave",
            "rarity": "30%",
            "levels": "25-27",
            "times": "Any"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Old Chateau (2F TV room)",
            "kind": "cave",
            "rarity": "8%",
            "levels": "16",
            "times": "Any",
            "note": "Requires a Gen III game in slot 2; also evolve Gastly at Lv 25"
          },
          {
            "area": "Turnback Cave",
            "kind": "cave",
            "rarity": "30%",
            "levels": "25-27",
            "times": "Any"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Old Chateau (2F TV room)",
            "kind": "cave",
            "rarity": "8%",
            "levels": "15-17",
            "times": "Any",
            "note": "Requires a Gen III game in slot 2; also evolve Gastly at Lv 25"
          },
          {
            "area": "Turnback Cave",
            "kind": "cave",
            "rarity": "30%",
            "levels": "25-27",
            "times": "Any"
          }
        ]
      },
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 8",
            "kind": "grass",
            "rarity": "30%",
            "levels": "17-20",
            "times": "Night",
            "note": "Also evolve Gastly at Lv 25"
          },
          {
            "area": "Safari Zone - Forest",
            "kind": "grass",
            "levels": "15-17",
            "times": "Night"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 8",
            "kind": "grass",
            "rarity": "30%",
            "levels": "17-20",
            "times": "Night",
            "note": "Also evolve Gastly at Lv 25"
          },
          {
            "area": "Safari Zone - Forest",
            "kind": "grass",
            "levels": "15-17",
            "times": "Night"
          }
        ]
      }
    }
  },
  "94": {
    "name": "Gengar",
    "tips": [
      "Gengar requires trading a Haunter in all Gen 4 games — there is no in-game wild encounter or level-up evolution."
    ],
    "games": {
      "diamond": {
        "via": "evolve",
        "summary": "Trade-evolve Haunter (evolves when traded)"
      },
      "pearl": {
        "via": "evolve",
        "summary": "Trade-evolve Haunter (evolves when traded)"
      },
      "platinum": {
        "via": "evolve",
        "summary": "Trade-evolve Haunter (evolves when traded)"
      },
      "heartgold": {
        "via": "evolve",
        "summary": "Trade-evolve Haunter (evolves when traded)"
      },
      "soulsilver": {
        "via": "evolve",
        "summary": "Trade-evolve Haunter (evolves when traded)"
      }
    }
  },
  "95": {
    "name": "Onix",
    "tips": [
      "Wild Onix occasionally holds a Hard Stone (Steelix evolution item); catch a few for the trade evolution.",
      "Earliest catch is Oreburgh Mine (DPPt) or Union Cave (HGSS).",
      "Snowpoint Temple and Stark Mountain are Diamond/Pearl only; Platinum swaps in Wayward Cave instead."
    ],
    "games": {
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Oreburgh Mine (1F, B1F)",
            "kind": "cave",
            "rarity": "10%",
            "levels": "8-9",
            "times": "Any"
          },
          {
            "area": "Iron Island (interior)",
            "kind": "cave",
            "rarity": "10-30%",
            "levels": "31-33",
            "times": "Any"
          },
          {
            "area": "Victory Road",
            "kind": "cave",
            "rarity": "10%",
            "levels": "44-50",
            "times": "Any"
          },
          {
            "area": "Snowpoint Temple",
            "kind": "cave",
            "rarity": "5-15%",
            "levels": "50-53",
            "times": "Any"
          },
          {
            "area": "Stark Mountain",
            "kind": "cave",
            "rarity": "5%",
            "levels": "54-56",
            "times": "Any"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Oreburgh Mine (1F, B1F)",
            "kind": "cave",
            "rarity": "10%",
            "levels": "8-9",
            "times": "Any"
          },
          {
            "area": "Iron Island (interior)",
            "kind": "cave",
            "rarity": "10-30%",
            "levels": "31-33",
            "times": "Any"
          },
          {
            "area": "Victory Road",
            "kind": "cave",
            "rarity": "10%",
            "levels": "44-50",
            "times": "Any"
          },
          {
            "area": "Snowpoint Temple",
            "kind": "cave",
            "rarity": "5-15%",
            "levels": "50-53",
            "times": "Any"
          },
          {
            "area": "Stark Mountain",
            "kind": "cave",
            "rarity": "5%",
            "levels": "54-56",
            "times": "Any"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Oreburgh Mine",
            "kind": "cave",
            "rarity": "10%",
            "levels": "6-9",
            "times": "Any"
          },
          {
            "area": "Wayward Cave (1F, B1F)",
            "kind": "cave",
            "rarity": "11%",
            "levels": "18-20",
            "times": "Any"
          },
          {
            "area": "Iron Island",
            "kind": "cave",
            "rarity": "10-20%",
            "levels": "31-33",
            "times": "Any"
          },
          {
            "area": "Victory Road",
            "kind": "cave",
            "rarity": "5-20%",
            "levels": "41-50",
            "times": "Any"
          }
        ]
      },
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Union Cave (1F, B1F, B2F)",
            "kind": "cave",
            "rarity": "5-10%",
            "levels": "6-23",
            "times": "Any"
          },
          {
            "area": "Rock Tunnel (1F, B1F)",
            "kind": "cave",
            "rarity": "20%",
            "levels": "13-22",
            "times": "Any"
          },
          {
            "area": "Cliff Cave",
            "kind": "cave",
            "rarity": "10%",
            "levels": "20",
            "times": "Any"
          },
          {
            "area": "Victory Road",
            "kind": "cave",
            "rarity": "10%",
            "levels": "40-46",
            "times": "Any"
          },
          {
            "area": "Mt. Silver (2F / Mountainside)",
            "kind": "cave",
            "rarity": "30%",
            "levels": "42-48",
            "times": "Any"
          },
          {
            "area": "Safari Zone - Wasteland",
            "kind": "grass",
            "levels": "15-17",
            "times": "Any"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Union Cave (1F, B1F, B2F)",
            "kind": "cave",
            "rarity": "5-10%",
            "levels": "6-23",
            "times": "Any"
          },
          {
            "area": "Rock Tunnel (1F, B1F)",
            "kind": "cave",
            "rarity": "20%",
            "levels": "13-22",
            "times": "Any"
          },
          {
            "area": "Cliff Cave",
            "kind": "cave",
            "rarity": "10%",
            "levels": "20",
            "times": "Any"
          },
          {
            "area": "Victory Road",
            "kind": "cave",
            "rarity": "10%",
            "levels": "40-46",
            "times": "Any"
          },
          {
            "area": "Mt. Silver (2F / Mountainside)",
            "kind": "cave",
            "rarity": "30%",
            "levels": "42-48",
            "times": "Any"
          },
          {
            "area": "Safari Zone - Wasteland",
            "kind": "grass",
            "levels": "15-17",
            "times": "Any"
          }
        ]
      }
    }
  },
  "96": {
    "name": "Drowzee",
    "tips": [
      "In DPPt, Drowzee is SWARM-ONLY on Route 215 — check the Trainers' School / Sinnoh radio daily for the swarm before you can catch one.",
      "In HGSS it is a common early-game catch on Route 34 (50%)."
    ],
    "games": {
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 215",
            "kind": "swarm",
            "rarity": "40%",
            "levels": "20-21",
            "times": "Any",
            "note": "Swarm only"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 215",
            "kind": "swarm",
            "rarity": "40%",
            "levels": "20-21",
            "times": "Any",
            "note": "Swarm only"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 215",
            "kind": "swarm",
            "rarity": "40%",
            "levels": "19-20",
            "times": "Any",
            "note": "Swarm only"
          }
        ]
      },
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 34",
            "kind": "grass",
            "rarity": "50%",
            "levels": "10-12",
            "times": "Any"
          },
          {
            "area": "Route 35",
            "kind": "grass",
            "rarity": "20%",
            "levels": "12-14",
            "times": "Any"
          },
          {
            "area": "Route 11",
            "kind": "grass",
            "rarity": "30%",
            "levels": "14-16",
            "times": "Any"
          },
          {
            "area": "Safari Zone - Swamp",
            "kind": "grass",
            "levels": "15-17",
            "times": "Any",
            "note": "Requires 15 Forest objects placed in Swamp"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 34",
            "kind": "grass",
            "rarity": "50%",
            "levels": "10-12",
            "times": "Any"
          },
          {
            "area": "Route 35",
            "kind": "grass",
            "rarity": "20%",
            "levels": "12-14",
            "times": "Any"
          },
          {
            "area": "Route 11",
            "kind": "grass",
            "rarity": "30%",
            "levels": "14-16",
            "times": "Any"
          },
          {
            "area": "Safari Zone - Swamp",
            "kind": "grass",
            "levels": "15-17",
            "times": "Any",
            "note": "Requires 15 Forest objects placed in Swamp"
          }
        ]
      }
    }
  },
  "109": {
    "name": "Koffing",
    "tips": [
      "In Diamond/Pearl, Koffing is not in any wild table; the only in-game route is breeding a Weezing.",
      "HGSS: easiest early catch is Burned Tower 1F/B1F right after arriving in Ecruteak (it is the most common spawn on B1F)."
    ],
    "games": {
      "diamond": {
        "via": "breed",
        "summary": "Egg-only: breed Weezing (Koffing has no wild encounter in Diamond)"
      },
      "pearl": {
        "via": "breed",
        "summary": "Egg-only: breed Weezing (Koffing has no wild encounter in Pearl)"
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Stark Mountain",
            "kind": "cave",
            "rarity": "Uncommon",
            "levels": "52-54",
            "times": "Any",
            "note": "Post-National-Dex area"
          }
        ]
      },
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Burned Tower 1F",
            "kind": "grass",
            "rarity": "35%",
            "levels": "14-16",
            "times": "Any"
          },
          {
            "area": "Burned Tower B1F",
            "kind": "grass",
            "rarity": "50%",
            "levels": "14-16",
            "times": "Any"
          },
          {
            "area": "Safari Zone (Marshland, default)",
            "kind": "grass",
            "levels": "15-30",
            "times": "Any"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Burned Tower 1F",
            "kind": "grass",
            "rarity": "35%",
            "levels": "14-16",
            "times": "Any"
          },
          {
            "area": "Burned Tower B1F",
            "kind": "grass",
            "rarity": "50%",
            "levels": "14-16",
            "times": "Any"
          },
          {
            "area": "Safari Zone (Marshland, default)",
            "kind": "grass",
            "levels": "15-30",
            "times": "Any"
          }
        ]
      }
    }
  },
  "110": {
    "name": "Weezing",
    "tips": [
      "Fastest path everywhere is evolving Koffing at Lv 35.",
      "DPPt also spawn wild Weezing in the post-game Battle Zone (Route 227 / Stark Mountain).",
      "HGSS: wild Weezing only appears in the Marshland Safari area once 18 Plains Objects are placed; otherwise evolve Koffing."
    ],
    "games": {
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 227",
            "kind": "grass",
            "rarity": "Uncommon",
            "levels": "52-54",
            "times": "Any",
            "note": "Post-National-Dex Battle Zone"
          },
          {
            "area": "Stark Mountain",
            "kind": "cave",
            "rarity": "Uncommon",
            "levels": "52-54",
            "times": "Any"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 227",
            "kind": "grass",
            "rarity": "Uncommon",
            "levels": "52-54",
            "times": "Any",
            "note": "Post-National-Dex Battle Zone"
          },
          {
            "area": "Stark Mountain",
            "kind": "cave",
            "rarity": "Uncommon",
            "levels": "52-54",
            "times": "Any"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 227",
            "kind": "grass",
            "rarity": "Uncommon",
            "levels": "52-54",
            "times": "Any",
            "note": "Post-National-Dex Battle Zone"
          },
          {
            "area": "Stark Mountain",
            "kind": "cave",
            "rarity": "Uncommon",
            "levels": "52-54",
            "times": "Any"
          }
        ]
      },
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Safari Zone (Marshland)",
            "kind": "grass",
            "times": "Any",
            "note": "Appears after placing 18 Plains Objects in Marshland"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Safari Zone (Marshland)",
            "kind": "grass",
            "times": "Any",
            "note": "Appears after placing 18 Plains Objects in Marshland"
          }
        ]
      }
    }
  },
  "111": {
    "name": "Rhyhorn",
    "tips": [
      "DP only offer Rhyhorn in the post-game Battle Zone (Route 227 / Stark Mountain); Platinum lets you grab it mid-game on Route 214 and in Victory Road.",
      "HGSS Safari Zone Savannah: place 5 Peak Objects to make Rhyhorn appear at any time of day instead of only Morning/Day."
    ],
    "games": {
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 227",
            "kind": "grass",
            "rarity": "Uncommon",
            "levels": "52",
            "times": "Any",
            "note": "Post-National-Dex area"
          },
          {
            "area": "Stark Mountain",
            "kind": "cave",
            "rarity": "Uncommon",
            "levels": "52",
            "times": "Any"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 227",
            "kind": "grass",
            "rarity": "Uncommon",
            "levels": "52",
            "times": "Any",
            "note": "Post-National-Dex area"
          },
          {
            "area": "Stark Mountain",
            "kind": "cave",
            "rarity": "Uncommon",
            "levels": "52",
            "times": "Any"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 214",
            "kind": "grass",
            "rarity": "5%",
            "levels": "21-24",
            "times": "Any"
          },
          {
            "area": "Victory Road 1F",
            "kind": "cave",
            "rarity": "20%",
            "levels": "41",
            "times": "Any"
          },
          {
            "area": "Route 227",
            "kind": "grass",
            "rarity": "Uncommon",
            "levels": "52",
            "times": "Any"
          },
          {
            "area": "Stark Mountain",
            "kind": "cave",
            "rarity": "Uncommon",
            "levels": "52",
            "times": "Any"
          }
        ]
      },
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Victory Road (Kanto)",
            "kind": "cave",
            "rarity": "Common",
            "times": "Any"
          },
          {
            "area": "Safari Zone (Savannah, default)",
            "kind": "grass",
            "levels": "25",
            "times": "Morning/Day",
            "note": "Any time once 5 Peak Objects placed in Savannah"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Victory Road (Kanto)",
            "kind": "cave",
            "rarity": "Common",
            "times": "Any"
          },
          {
            "area": "Safari Zone (Savannah, default)",
            "kind": "grass",
            "levels": "25",
            "times": "Morning/Day",
            "note": "Any time once 5 Peak Objects placed in Savannah"
          }
        ]
      }
    }
  },
  "112": {
    "name": "Rhydon",
    "tips": [
      "Simplest method in every game is evolving Rhyhorn at Lv 42.",
      "HGSS: raising Savannah Peak Objects to 10 swaps the Safari grass to include Rhydon directly."
    ],
    "games": {
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 227",
            "kind": "grass",
            "rarity": "Uncommon",
            "levels": "52",
            "times": "Any",
            "note": "Post-National-Dex"
          },
          {
            "area": "Route 228",
            "kind": "grass",
            "rarity": "Uncommon",
            "levels": "52",
            "times": "Any"
          },
          {
            "area": "Stark Mountain",
            "kind": "cave",
            "rarity": "Uncommon",
            "levels": "52",
            "times": "Any"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 227",
            "kind": "grass",
            "rarity": "Uncommon",
            "levels": "52",
            "times": "Any",
            "note": "Post-National-Dex"
          },
          {
            "area": "Route 228",
            "kind": "grass",
            "rarity": "Uncommon",
            "levels": "52",
            "times": "Any"
          },
          {
            "area": "Stark Mountain",
            "kind": "cave",
            "rarity": "Uncommon",
            "levels": "52",
            "times": "Any"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Victory Road",
            "kind": "cave",
            "rarity": "Uncommon",
            "times": "Any"
          },
          {
            "area": "Route 227",
            "kind": "grass",
            "rarity": "Uncommon",
            "levels": "52",
            "times": "Any"
          },
          {
            "area": "Route 228",
            "kind": "grass",
            "rarity": "Uncommon",
            "levels": "52",
            "times": "Any"
          },
          {
            "area": "Stark Mountain",
            "kind": "cave",
            "rarity": "Uncommon",
            "times": "Any"
          }
        ]
      },
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Safari Zone (Savannah)",
            "kind": "grass",
            "times": "Any",
            "note": "Appears after placing 10 Peak Objects in Savannah"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Safari Zone (Savannah)",
            "kind": "grass",
            "times": "Any",
            "note": "Appears after placing 10 Peak Objects in Savannah"
          }
        ]
      }
    }
  },
  "113": {
    "name": "Chansey",
    "tips": [
      "DPPt: the Trophy Garden daily list is your most reliable Chansey source; check Mr. Backlot/the butler each day and reset the date to re-roll its two daily slots.",
      "Chansey often holds a Lucky Egg (~5% chance) when caught; a Pokemon with the Compound Eyes ability boosts wild held-item rates.",
      "Can also be obtained by evolving a high-friendship Happiny holding an Oval Stone during the daytime."
    ],
    "games": {
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 209",
            "kind": "grass",
            "rarity": "1%",
            "levels": "16-19",
            "times": "Any"
          },
          {
            "area": "Route 210 (south)",
            "kind": "grass",
            "rarity": "1%",
            "levels": "18-21",
            "times": "Any"
          },
          {
            "area": "Trophy Garden (Pokemon Mansion)",
            "kind": "grass",
            "rarity": "Rare",
            "times": "Any",
            "note": "Daily rotation Pokemon (Mr. Backlot)"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 209",
            "kind": "grass",
            "rarity": "1%",
            "levels": "16-19",
            "times": "Any"
          },
          {
            "area": "Route 210 (south)",
            "kind": "grass",
            "rarity": "1%",
            "levels": "18-21",
            "times": "Any"
          },
          {
            "area": "Trophy Garden (Pokemon Mansion)",
            "kind": "grass",
            "rarity": "Rare",
            "times": "Any",
            "note": "Daily rotation Pokemon (Mr. Backlot)"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 209",
            "kind": "grass",
            "rarity": "1%",
            "levels": "16-19",
            "times": "Any"
          },
          {
            "area": "Route 210 (south)",
            "kind": "grass",
            "rarity": "1%",
            "levels": "18-21",
            "times": "Any"
          },
          {
            "area": "Trophy Garden (Pokemon Mansion)",
            "kind": "grass",
            "rarity": "Rare",
            "times": "Any",
            "note": "Daily rotation Pokemon (Mr. Backlot)"
          }
        ]
      },
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Routes 13, 14, 15 (Kanto)",
            "kind": "grass",
            "rarity": "Rare",
            "times": "Any"
          },
          {
            "area": "Safari Zone (Meadow)",
            "kind": "grass",
            "rarity": "Rare",
            "times": "Any",
            "note": "Requires 12 Plains Objects placed in Meadow area"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Routes 13, 14, 15 (Kanto)",
            "kind": "grass",
            "rarity": "Rare",
            "times": "Any"
          },
          {
            "area": "Safari Zone (Meadow)",
            "kind": "grass",
            "rarity": "Rare",
            "times": "Any",
            "note": "Requires 12 Plains Objects placed in Meadow area"
          }
        ]
      }
    }
  },
  "114": {
    "name": "Tangela",
    "tips": [
      "Diamond/Pearl have no wild Tangela; obtain it by trade or by breeding a Tangrowth. Only Platinum adds it to the wild (Great Marsh).",
      "Platinum: Tangela only appears in the Great Marsh's daily-rotation slots, so check the binoculars and revisit until it's the active spawn.",
      "HGSS: Route 44 (near Mahogany) is the earliest accessible spot; it can also be found via Headbutt trees and on the Pokewalker."
    ],
    "games": {
      "diamond": {
        "via": "breed",
        "summary": "Trade/breed only in Diamond: breed Tangrowth (no wild Tangela in Diamond)"
      },
      "pearl": {
        "via": "breed",
        "summary": "Trade/breed only in Pearl: breed Tangrowth (no wild Tangela in Pearl)"
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Great Marsh (Pastoria)",
            "kind": "grass",
            "rarity": "Uncommon",
            "levels": "27-30",
            "times": "Any",
            "note": "Daily rotation; not in every Great Marsh area each day"
          }
        ]
      },
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 28",
            "kind": "grass",
            "rarity": "Common",
            "levels": "39",
            "times": "Any"
          },
          {
            "area": "Route 44",
            "kind": "grass",
            "rarity": "Common",
            "levels": "23",
            "times": "Any"
          },
          {
            "area": "Route 21",
            "kind": "grass",
            "levels": "20-30",
            "times": "Any"
          },
          {
            "area": "Mt. Silver (outside)",
            "kind": "grass",
            "rarity": "Common",
            "levels": "41",
            "times": "Any"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 28",
            "kind": "grass",
            "rarity": "Common",
            "levels": "39",
            "times": "Any"
          },
          {
            "area": "Route 44",
            "kind": "grass",
            "rarity": "Common",
            "levels": "23",
            "times": "Any"
          },
          {
            "area": "Route 21",
            "kind": "grass",
            "levels": "20-30",
            "times": "Any"
          },
          {
            "area": "Mt. Silver (outside)",
            "kind": "grass",
            "rarity": "Common",
            "levels": "41",
            "times": "Any"
          }
        ]
      }
    }
  },
  "115": {
    "name": "Kangaskhan",
    "tips": [
      "DPPt: Kangaskhan appears in the Great Marsh's daily rotation after you get the National Pokedex; check the binoculars and revisit until it's the active spawn.",
      "HGSS: the Kanto Rock Tunnel gives an early, cheap Kangaskhan without Safari Object setup."
    ],
    "games": {
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Great Marsh (Pastoria)",
            "kind": "grass",
            "rarity": "Uncommon",
            "times": "Any",
            "note": "After obtaining the National Pokedex; daily rotation"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Great Marsh (Pastoria)",
            "kind": "grass",
            "rarity": "Uncommon",
            "times": "Any",
            "note": "After obtaining the National Pokedex; daily rotation"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Great Marsh (Pastoria)",
            "kind": "grass",
            "rarity": "Uncommon",
            "times": "Any",
            "note": "After obtaining the National Pokedex; daily rotation"
          }
        ]
      },
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Rock Tunnel B1F",
            "kind": "cave",
            "rarity": "5%",
            "levels": "14-15",
            "times": "Any"
          },
          {
            "area": "Safari Zone (Wasteland)",
            "kind": "grass",
            "rarity": "Uncommon",
            "levels": "25-33",
            "times": "Morning/Day",
            "note": "Requires 15 Plains Objects placed in Wasteland"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Rock Tunnel B1F",
            "kind": "cave",
            "rarity": "5%",
            "levels": "14-15",
            "times": "Any"
          },
          {
            "area": "Safari Zone (Wasteland)",
            "kind": "grass",
            "rarity": "Uncommon",
            "levels": "25-33",
            "times": "Morning/Day",
            "note": "Requires 15 Plains Objects placed in Wasteland"
          }
        ]
      }
    }
  },
  "116": {
    "name": "Horsea",
    "tips": [
      "DPPt: Horsea only bites on the Good Rod at Sea Route 226, which is in the post-game Battle Zone (needs National Dex).",
      "HGSS: the Whirl Islands (reached by Surf/Whirlpool near Cianwood) are the only wild source - Super Rod yields Lv 40 Horsea."
    ],
    "games": {
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Sea Route 226",
            "kind": "fish",
            "rarity": "45%",
            "levels": "10-25",
            "times": "Any",
            "note": "Good Rod; post-National-Dex area"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Sea Route 226",
            "kind": "fish",
            "rarity": "45%",
            "levels": "10-25",
            "times": "Any",
            "note": "Good Rod; post-National-Dex area"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Sea Route 226",
            "kind": "fish",
            "rarity": "45%",
            "levels": "10-25",
            "times": "Any",
            "note": "Good Rod; post-National-Dex area"
          }
        ]
      },
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Whirl Islands (1F/B2F/B3F)",
            "kind": "fish",
            "rarity": "Common",
            "levels": "20-40",
            "times": "Any",
            "note": "Good Rod (Lv 20) / Super Rod (Lv 40)"
          },
          {
            "area": "Whirl Islands (interior water)",
            "kind": "surf",
            "levels": "10-25",
            "times": "Any"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Whirl Islands (1F/B2F/B3F)",
            "kind": "fish",
            "rarity": "Common",
            "levels": "20-40",
            "times": "Any",
            "note": "Good Rod (Lv 20) / Super Rod (Lv 40)"
          },
          {
            "area": "Whirl Islands (interior water)",
            "kind": "surf",
            "levels": "10-25",
            "times": "Any"
          }
        ]
      }
    }
  },
  "117": {
    "name": "Seadra",
    "tips": [
      "Diamond/Pearl have no wild Seadra; evolve Horsea at Lv 32.",
      "Platinum adds a wild Super Rod Seadra at post-game Sea Route 226; HGSS offers wild Seadra in the Whirl Islands."
    ],
    "games": {
      "diamond": {
        "via": "evolve",
        "summary": "Evolve Horsea at Lv 32 (no wild Seadra in Diamond)"
      },
      "pearl": {
        "via": "evolve",
        "summary": "Evolve Horsea at Lv 32 (no wild Seadra in Pearl)"
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Sea Route 226",
            "kind": "fish",
            "rarity": "45%",
            "levels": "30-55",
            "times": "Any",
            "note": "Super Rod; post-National-Dex area"
          }
        ]
      },
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Whirl Islands (1F/B2F/B3F)",
            "kind": "fish",
            "rarity": "10%",
            "levels": "40",
            "times": "Any",
            "note": "Super Rod"
          },
          {
            "area": "Whirl Islands (interior water)",
            "kind": "surf",
            "rarity": "10%",
            "levels": "15-30",
            "times": "Any"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Whirl Islands (1F/B2F/B3F)",
            "kind": "fish",
            "rarity": "10%",
            "levels": "40",
            "times": "Any",
            "note": "Super Rod"
          },
          {
            "area": "Whirl Islands (interior water)",
            "kind": "surf",
            "rarity": "10%",
            "levels": "15-30",
            "times": "Any"
          }
        ]
      }
    }
  },
  "118": {
    "name": "Goldeen",
    "tips": [
      "Goldeen is one of the most common Good Rod catches in both regions; almost any fishable water with a Good Rod works."
    ],
    "games": {
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Routes 203/204/209/212/214, Lakes Verity/Valor/Acuity, Resort Area",
            "kind": "fish",
            "rarity": "45%",
            "levels": "10-25",
            "times": "Any",
            "note": "Good Rod (many water routes throughout Sinnoh)"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Routes 203/204/209/212/214, Lakes Verity/Valor/Acuity, Resort Area",
            "kind": "fish",
            "rarity": "45%",
            "levels": "10-25",
            "times": "Any",
            "note": "Good Rod (many water routes throughout Sinnoh)"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Lakes Verity/Valor/Acuity, Routes 203/204/208/209/212/214/229, Celestic Town",
            "kind": "fish",
            "rarity": "40-45%",
            "levels": "15-35",
            "times": "Any",
            "note": "Good Rod"
          }
        ]
      },
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Most water routes/caves (Union Cave, Mt. Mortar, Route 42, Cerulean City, etc.)",
            "kind": "fish",
            "rarity": "Common",
            "levels": "10-40",
            "times": "Any",
            "note": "Good Rod / Super Rod"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Most water routes/caves (Union Cave, Mt. Mortar, Route 42, Cerulean City, etc.)",
            "kind": "fish",
            "rarity": "Common",
            "levels": "10-40",
            "times": "Any",
            "note": "Good Rod / Super Rod"
          }
        ]
      }
    }
  },
  "119": {
    "name": "Seaking",
    "tips": [
      "Easiest in every game is evolving Goldeen at Lv 33.",
      "Wild Seaking needs the Super Rod, which in DPPt is a post-National-Dex item from the Fight Area fisherman.",
      "HGSS: Surfing inside Mt. Silver Cave gives Seaking at a very high 90% rate."
    ],
    "games": {
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Lakes Verity/Valor/Acuity, Routes 203/204/209/212/214, Twinleaf Town, Resort Area",
            "kind": "fish",
            "rarity": "45%",
            "levels": "20-50",
            "times": "Any",
            "note": "Super Rod (post-National-Dex)"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Lakes Verity/Valor/Acuity, Routes 203/204/209/212/214, Twinleaf Town, Resort Area",
            "kind": "fish",
            "rarity": "45%",
            "levels": "20-50",
            "times": "Any",
            "note": "Super Rod (post-National-Dex)"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Lakes Verity/Valor/Acuity, Routes 203/204/208/209/212/214/229, Celestic Town, Twinleaf Town",
            "kind": "fish",
            "rarity": "45%",
            "levels": "20-55",
            "times": "Any",
            "note": "Super Rod (post-National-Dex); also Good Rod at the Lakes"
          }
        ]
      },
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Mt. Silver Cave (interior water)",
            "kind": "surf",
            "rarity": "90%",
            "levels": "35-44",
            "times": "Any"
          },
          {
            "area": "Union Cave, Mt. Mortar, Dark Cave, Route 42, Slowpoke Well, Tohjo Falls",
            "kind": "fish",
            "rarity": "Uncommon",
            "levels": "40",
            "times": "Any",
            "note": "Super Rod"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Mt. Silver Cave (interior water)",
            "kind": "surf",
            "rarity": "90%",
            "levels": "35-44",
            "times": "Any"
          },
          {
            "area": "Union Cave, Mt. Mortar, Dark Cave, Route 42, Slowpoke Well, Tohjo Falls",
            "kind": "fish",
            "rarity": "Uncommon",
            "levels": "40",
            "times": "Any",
            "note": "Super Rod"
          }
        ]
      }
    }
  },
  "120": {
    "name": "Staryu",
    "tips": [
      "DPPt: Staryu is non-exclusive (both versions) but only via the post-game Super Rod at Canalave or Sunyshore.",
      "HGSS: Staryu only bites at NIGHT on the Good/Super Rod, so fish after dark; daytime fishing won't yield it (Route 47 surf is the exception, any time)."
    ],
    "games": {
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Canalave City / Sunyshore City",
            "kind": "fish",
            "rarity": "15%",
            "levels": "20-50",
            "times": "Any",
            "note": "Super Rod (post-National-Dex)"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Canalave City / Sunyshore City",
            "kind": "fish",
            "rarity": "15%",
            "levels": "20-50",
            "times": "Any",
            "note": "Super Rod (post-National-Dex)"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Canalave City / Sunyshore City",
            "kind": "fish",
            "rarity": "15%",
            "levels": "20-50",
            "times": "Any",
            "note": "Super Rod (post-National-Dex)"
          }
        ]
      },
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 47",
            "kind": "surf",
            "rarity": "10%",
            "levels": "15-25",
            "times": "Any"
          },
          {
            "area": "Cherrygrove/Olivine/Cianwood, Routes 19/34/40, Union Cave B2F",
            "kind": "fish",
            "levels": "20-40",
            "times": "Night",
            "note": "Good Rod (Lv 20) / Super Rod (Lv 40), night only"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 47",
            "kind": "surf",
            "rarity": "10%",
            "levels": "15-25",
            "times": "Any"
          },
          {
            "area": "Cherrygrove/Olivine/Cianwood, Routes 19/34/40, Union Cave B2F",
            "kind": "fish",
            "levels": "20-40",
            "times": "Night",
            "note": "Good Rod (Lv 20) / Super Rod (Lv 40), night only"
          }
        ]
      }
    }
  },
  "133": {
    "name": "Eevee",
    "tips": [
      "In Diamond/Pearl/Platinum, Eevee rotates into Mr. Backlot's Trophy Garden (Route 212) after the National Dex at about a 5% rate; talk to Mr. Backlot daily to bias the spawn (soft-reset to reroll the species he mentions).",
      "HGSS gives two Eevee sources: the free Lv 5 Bill gift and a second Lv 15 Eevee at the Celadon Game Corner for 6666 coins, useful if you want multiple eeveelutions."
    ],
    "games": {
      "heartgold": {
        "via": "gift",
        "summary": "Gift (Lv 5) from Bill in his house in Goldenrod City, after first meeting him in Ecruteak City; also buyable for 6666 coins at the Celadon Game Corner (received at Lv 15)"
      },
      "soulsilver": {
        "via": "gift",
        "summary": "Gift (Lv 5) from Bill in his house in Goldenrod City, after first meeting him in Ecruteak City; also buyable for 6666 coins at the Celadon Game Corner (received at Lv 15)"
      },
      "platinum": {
        "via": "gift",
        "summary": "Gift (Lv 20) from Bebe in her house next to the Hearthome City Pokemon Center; available immediately, no National Dex required. Also wild in the Trophy Garden (Route 212) after National Dex"
      },
      "diamond": {
        "via": "gift",
        "summary": "Gift (Lv 5) from Bebe in her house next to the Hearthome City Pokemon Center, after obtaining the National Pokedex. Also wild in the Trophy Garden (Route 212) after National Dex"
      },
      "pearl": {
        "via": "gift",
        "summary": "Gift (Lv 5) from Bebe in her house next to the Hearthome City Pokemon Center, after obtaining the National Pokedex. Also wild in the Trophy Garden (Route 212) after National Dex"
      }
    }
  },
  "134": {
    "name": "Vaporeon",
    "games": {
      "heartgold": {
        "via": "evolve",
        "summary": "Evolve Eevee with a Water Stone"
      },
      "soulsilver": {
        "via": "evolve",
        "summary": "Evolve Eevee with a Water Stone"
      },
      "platinum": {
        "via": "evolve",
        "summary": "Evolve Eevee with a Water Stone"
      },
      "diamond": {
        "via": "evolve",
        "summary": "Evolve Eevee with a Water Stone"
      },
      "pearl": {
        "via": "evolve",
        "summary": "Evolve Eevee with a Water Stone"
      }
    }
  },
  "135": {
    "name": "Jolteon",
    "games": {
      "heartgold": {
        "via": "evolve",
        "summary": "Evolve Eevee with a Thunder Stone"
      },
      "soulsilver": {
        "via": "evolve",
        "summary": "Evolve Eevee with a Thunder Stone"
      },
      "platinum": {
        "via": "evolve",
        "summary": "Evolve Eevee with a Thunder Stone"
      },
      "diamond": {
        "via": "evolve",
        "summary": "Evolve Eevee with a Thunder Stone"
      },
      "pearl": {
        "via": "evolve",
        "summary": "Evolve Eevee with a Thunder Stone"
      }
    }
  },
  "136": {
    "name": "Flareon",
    "games": {
      "heartgold": {
        "via": "evolve",
        "summary": "Evolve Eevee with a Fire Stone"
      },
      "soulsilver": {
        "via": "evolve",
        "summary": "Evolve Eevee with a Fire Stone"
      },
      "platinum": {
        "via": "evolve",
        "summary": "Evolve Eevee with a Fire Stone"
      },
      "diamond": {
        "via": "evolve",
        "summary": "Evolve Eevee with a Fire Stone"
      },
      "pearl": {
        "via": "evolve",
        "summary": "Evolve Eevee with a Fire Stone"
      }
    }
  },
  "137": {
    "name": "Porygon",
    "tips": [
      "In Diamond/Pearl, Porygon only appears in the Trophy Garden after the National Dex; talk to Mr. Backlot each day (or soft-reset) to set Porygon as the daily bonus species, then catch it in the grass at about 5%.",
      "Platinum is the easiest source: just claim the free Lv 25 gift behind the Veilstone Pokemon Center (the Trophy Garden also works there)."
    ],
    "games": {
      "heartgold": {
        "via": "gift",
        "summary": "Buy for 9999 coins at the Celadon Game Corner (received at Lv 5)"
      },
      "soulsilver": {
        "via": "gift",
        "summary": "Buy for 9999 coins at the Celadon Game Corner (received at Lv 5)"
      },
      "platinum": {
        "via": "gift",
        "summary": "Gift (Lv 25) from the man in the house directly behind the Veilstone City Pokemon Center. Also wild in the Trophy Garden (Route 212) after National Dex"
      },
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Trophy Garden (Route 212, Mr. Backlot's estate)",
            "kind": "grass",
            "rarity": "5%",
            "levels": "16-18",
            "times": "Any",
            "note": "After National Dex; rotated in by Mr. Backlot's butler"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Trophy Garden (Route 212, Mr. Backlot's estate)",
            "kind": "grass",
            "rarity": "5%",
            "levels": "16-18",
            "times": "Any",
            "note": "After National Dex; rotated in by Mr. Backlot's butler"
          }
        ]
      }
    }
  },
  "138": {
    "name": "Omanyte",
    "tips": [
      "Helix Fossil (Omanyte) is the HeartGold-exclusive fossil at the Ruins of Alph; SoulSilver gets the Dome Fossil (Kabuto) instead, so Omanyte is trade-only in SoulSilver.",
      "In DPPt the Gen 1 fossils only appear in the Underground after you have the National Dex."
    ],
    "games": {
      "heartgold": {
        "via": "gift",
        "summary": "Revive a Helix Fossil at the Pewter City Museum of Science (received at Lv 20). Helix Fossils are found via Rock Smash on rocks in the Ruins of Alph (HeartGold-exclusive fossil)"
      },
      "platinum": {
        "via": "gift",
        "summary": "Revive a Helix Fossil at the Oreburgh Mining Museum (received at Lv 20). Helix Fossils are dug up in the Underground after obtaining the National Dex"
      },
      "diamond": {
        "via": "gift",
        "summary": "Revive a Helix Fossil at the Oreburgh Mining Museum (received at Lv 20). Helix Fossils are dug up in the Underground after obtaining the National Dex"
      },
      "pearl": {
        "via": "gift",
        "summary": "Revive a Helix Fossil at the Oreburgh Mining Museum (received at Lv 20). Helix Fossils are dug up in the Underground after obtaining the National Dex"
      }
    }
  },
  "139": {
    "name": "Omastar",
    "games": {
      "heartgold": {
        "via": "evolve",
        "summary": "Evolve Omanyte at Lv 40"
      },
      "soulsilver": {
        "via": "evolve",
        "summary": "Evolve Omanyte at Lv 40 (Omanyte itself is trade-only in SoulSilver)"
      },
      "platinum": {
        "via": "evolve",
        "summary": "Evolve Omanyte at Lv 40"
      },
      "diamond": {
        "via": "evolve",
        "summary": "Evolve Omanyte at Lv 40"
      },
      "pearl": {
        "via": "evolve",
        "summary": "Evolve Omanyte at Lv 40"
      }
    }
  },
  "140": {
    "name": "Kabuto",
    "tips": [
      "Dome Fossil (Kabuto) is the SoulSilver-exclusive fossil at the Ruins of Alph; HeartGold gets the Helix Fossil (Omanyte) instead, so Kabuto is trade-only in HeartGold.",
      "In DPPt the Gen 1 fossils only appear in the Underground after you have the National Dex."
    ],
    "games": {
      "soulsilver": {
        "via": "gift",
        "summary": "Revive a Dome Fossil at the Pewter City Museum of Science (received at Lv 20). Dome Fossils are found via Rock Smash on rocks in the Ruins of Alph (SoulSilver-exclusive fossil)"
      },
      "platinum": {
        "via": "gift",
        "summary": "Revive a Dome Fossil at the Oreburgh Mining Museum (received at Lv 20). Dome Fossils are dug up in the Underground after obtaining the National Dex"
      },
      "diamond": {
        "via": "gift",
        "summary": "Revive a Dome Fossil at the Oreburgh Mining Museum (received at Lv 20). Dome Fossils are dug up in the Underground after obtaining the National Dex"
      },
      "pearl": {
        "via": "gift",
        "summary": "Revive a Dome Fossil at the Oreburgh Mining Museum (received at Lv 20). Dome Fossils are dug up in the Underground after obtaining the National Dex"
      }
    }
  },
  "141": {
    "name": "Kabutops",
    "games": {
      "soulsilver": {
        "via": "evolve",
        "summary": "Evolve Kabuto at Lv 40"
      },
      "heartgold": {
        "via": "evolve",
        "summary": "Evolve Kabuto at Lv 40 (Kabuto itself is trade-only in HeartGold)"
      },
      "platinum": {
        "via": "evolve",
        "summary": "Evolve Kabuto at Lv 40"
      },
      "diamond": {
        "via": "evolve",
        "summary": "Evolve Kabuto at Lv 40"
      },
      "pearl": {
        "via": "evolve",
        "summary": "Evolve Kabuto at Lv 40"
      }
    }
  },
  "142": {
    "name": "Aerodactyl",
    "tips": [
      "Old Amber is available in both HeartGold and SoulSilver (unlike the Helix/Dome split) by Rock Smashing rocks at the Ruins of Alph.",
      "In DPPt, Old Amber is one of the Underground fossils and only spawns after the National Dex."
    ],
    "games": {
      "heartgold": {
        "via": "gift",
        "summary": "Revive an Old Amber at the Pewter City Museum of Science (received at Lv 20). Old Amber is found via Rock Smash on rocks in the Ruins of Alph (both versions)"
      },
      "soulsilver": {
        "via": "gift",
        "summary": "Revive an Old Amber at the Pewter City Museum of Science (received at Lv 20). Old Amber is found via Rock Smash on rocks in the Ruins of Alph (both versions)"
      },
      "platinum": {
        "via": "gift",
        "summary": "Revive an Old Amber at the Oreburgh Mining Museum (received at Lv 20). Old Amber is dug up in the Underground after obtaining the National Dex"
      },
      "diamond": {
        "via": "gift",
        "summary": "Revive an Old Amber at the Oreburgh Mining Museum (received at Lv 20). Old Amber is dug up in the Underground after obtaining the National Dex"
      },
      "pearl": {
        "via": "gift",
        "summary": "Revive an Old Amber at the Oreburgh Mining Museum (received at Lv 20). Old Amber is dug up in the Underground after obtaining the National Dex"
      }
    }
  },
  "143": {
    "name": "Snorlax",
    "tips": [
      "In HGSS the Route 11 Snorlax is a guaranteed Lv 50 catch; save before waking it and don't KO it accidentally (it respawns on Route 12 after you re-enter the Hall of Fame).",
      "In DPPt, Munchlax only appears on 4 of the 21 Honey Trees (determined by your Trainer ID/Secret ID) at roughly a 1% rate, so the Snorlax line is the rarest Honey Tree target."
    ],
    "games": {
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Kanto Route 11 (blocking Diglett's Cave, east of Vermilion City)",
            "kind": "static",
            "rarity": "1 (one-time)",
            "levels": "50",
            "times": "Any",
            "note": "Wake it with the Poke Flute on the radio (need the Expn Card from Lavender Radio Tower), then interact; respawns on Route 12 after re-beating the Elite Four if defeated/fled"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Kanto Route 11 (blocking Diglett's Cave, east of Vermilion City)",
            "kind": "static",
            "rarity": "1 (one-time)",
            "levels": "50",
            "times": "Any",
            "note": "Wake it with the Poke Flute on the radio (need the Expn Card from Lavender Radio Tower), then interact; respawns on Route 12 after re-beating the Elite Four if defeated/fled"
          }
        ]
      },
      "platinum": {
        "via": "evolve",
        "summary": "Evolve Munchlax (raise friendship, then level up). Munchlax is found only by slathering Honey on trees (rare; only specific player-determined trees, ~1% rate)"
      },
      "diamond": {
        "via": "evolve",
        "summary": "Evolve Munchlax (raise friendship, then level up). Munchlax is found only by slathering Honey on trees (rare; only specific player-determined trees, ~1% rate)"
      },
      "pearl": {
        "via": "evolve",
        "summary": "Evolve Munchlax (raise friendship, then level up). Munchlax is found only by slathering Honey on trees (rare; only specific player-determined trees, ~1% rate)"
      }
    }
  },
  "144": {
    "name": "Articuno",
    "tips": [
      "In HGSS, save before the Lv 50 Seafoam Islands encounter; it's a single one-time battle.",
      "In Platinum, the legendary birds only begin roaming after you have the National Dex, visit Pal Park to see Oak, and then talk to Oak at his house in Eterna City; use a Pokemon with Mean Look plus a level-imbalance/false-swipe strategy since they flee each turn.",
      "Articuno cannot be caught in Diamond or Pearl (those games omit the roaming-bird event), so it is trade/transfer-only there."
    ],
    "games": {
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Seafoam Islands B4F",
            "kind": "static",
            "rarity": "1 (one-time)",
            "levels": "50",
            "times": "Any",
            "note": "Available after obtaining all 16 Gym Badges (Johto + Kanto)"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Seafoam Islands B4F",
            "kind": "static",
            "rarity": "1 (one-time)",
            "levels": "50",
            "times": "Any",
            "note": "Available after obtaining all 16 Gym Badges (Johto + Kanto)"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Roaming Sinnoh (grass throughout the region)",
            "kind": "grass",
            "rarity": "1 (roaming)",
            "levels": "60",
            "times": "Any",
            "note": "Roams Sinnoh after getting the National Dex, visiting Pal Park to see Prof. Oak, then talking to Oak at his house in Eterna City; track with the Poketch Marking Map"
          }
        ]
      }
    }
  },
  "145": {
    "name": "Zapdos",
    "tips": [
      "Diamond/Pearl: trade-only, no in-game encounter.",
      "Platinum roamer: use Mean Look or a Wobbuffet (Shadow Tag) lead to stop it fleeing.",
      "HGSS: save in front of it; it respawns after re-beating the Elite Four if defeated."
    ],
    "games": {
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Roaming Sinnoh",
            "kind": "static",
            "rarity": "Only one",
            "levels": "60",
            "times": "Any",
            "note": "Roams Sinnoh after obtaining the National Pokedex (visit Pal Park) and speaking to Prof. Oak in Eterna City; track with Marking Map"
          }
        ]
      },
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 10 (outside Kanto Power Plant)",
            "kind": "static",
            "rarity": "Only one",
            "levels": "50",
            "times": "Any",
            "note": "Appears after completing the Power Plant Machine Part sidequest (part hidden in Cerulean Gym) and obtaining all 16 Badges"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 10 (outside Kanto Power Plant)",
            "kind": "static",
            "rarity": "Only one",
            "levels": "50",
            "times": "Any",
            "note": "Appears after completing the Power Plant Machine Part sidequest (part hidden in Cerulean Gym) and obtaining all 16 Badges"
          }
        ]
      }
    }
  },
  "146": {
    "name": "Moltres",
    "tips": [
      "Diamond/Pearl: trade-only, no in-game encounter.",
      "Platinum roamer: use Mean Look or a Wobbuffet (Shadow Tag) lead to stop it fleeing.",
      "HGSS: Dusk Balls work well in-cave; save before engaging."
    ],
    "games": {
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Roaming Sinnoh",
            "kind": "static",
            "rarity": "Only one",
            "levels": "60",
            "times": "Any",
            "note": "Roams Sinnoh after obtaining the National Pokedex (visit Pal Park) and speaking to Prof. Oak in Eterna City; track with Marking Map"
          }
        ]
      },
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Mt. Silver (Silver Cave)",
            "kind": "static",
            "rarity": "Only one",
            "levels": "50",
            "times": "Any",
            "note": "Requires all 16 Badges; reach deep in the cave"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Mt. Silver (Silver Cave)",
            "kind": "static",
            "rarity": "Only one",
            "levels": "50",
            "times": "Any",
            "note": "Requires all 16 Badges; reach deep in the cave"
          }
        ]
      }
    }
  },
  "147": {
    "name": "Dratini",
    "tips": [
      "HGSS: the Dragon's Den Master gives a one-time Lv15 Dratini after Clair's gym + the Dragon Shrine quiz; it knows ExtremeSpeed if you answer all questions correctly, Leer if you answer any wrong.",
      "DPPt: Mt. Coronet 4F is the only spot; you need Surf + Waterfall to reach the inner water and a Super Rod (Good Rod won't hook it)."
    ],
    "games": {
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Mt. Coronet (4F)",
            "kind": "fish",
            "rarity": "30%",
            "levels": "15-20",
            "times": "Any",
            "note": "Super Rod only"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Mt. Coronet (4F)",
            "kind": "fish",
            "rarity": "30%",
            "levels": "15-20",
            "times": "Any",
            "note": "Super Rod only"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Mt. Coronet (4F)",
            "kind": "fish",
            "rarity": "30%",
            "levels": "15-25",
            "times": "Any",
            "note": "Super Rod only"
          }
        ]
      },
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Dragon's Den",
            "kind": "fish",
            "rarity": "32%",
            "levels": "40",
            "times": "Any",
            "note": "Super Rod (also ~10% at Lv20 on Good Rod); requires National Dex"
          },
          {
            "area": "Dragon's Den",
            "kind": "surf",
            "rarity": "10%",
            "levels": "5-15",
            "times": "Any"
          },
          {
            "area": "Safari Zone (Swamp area)",
            "kind": "fish",
            "rarity": "Uncommon",
            "levels": "36-37",
            "times": "Any",
            "note": "Super Rod; requires National Dex"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Dragon's Den",
            "kind": "fish",
            "rarity": "32%",
            "levels": "40",
            "times": "Any",
            "note": "Super Rod (also ~10% at Lv20 on Good Rod); requires National Dex"
          },
          {
            "area": "Dragon's Den",
            "kind": "surf",
            "rarity": "10%",
            "levels": "5-15",
            "times": "Any"
          },
          {
            "area": "Safari Zone (Swamp area)",
            "kind": "fish",
            "rarity": "Uncommon",
            "levels": "36-37",
            "times": "Any",
            "note": "Super Rod; requires National Dex"
          }
        ]
      }
    }
  },
  "148": {
    "name": "Dragonair",
    "tips": [
      "Fastest route everywhere is to catch a Dratini and evolve it at Lv30.",
      "DPPt Dragonair is rare on the Super Rod (5%); evolving a caught Dratini is far more reliable."
    ],
    "games": {
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Mt. Coronet (4F)",
            "kind": "fish",
            "rarity": "5%",
            "levels": "15-40",
            "times": "Any",
            "note": "Super Rod only; otherwise evolve Dratini at Lv30"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Mt. Coronet (4F)",
            "kind": "fish",
            "rarity": "5%",
            "levels": "15-40",
            "times": "Any",
            "note": "Super Rod only; otherwise evolve Dratini at Lv30"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Mt. Coronet (4F)",
            "kind": "fish",
            "rarity": "5%",
            "levels": "20-55",
            "times": "Any",
            "note": "Super Rod only; otherwise evolve Dratini at Lv30"
          }
        ]
      },
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Dragon's Den",
            "kind": "fish",
            "rarity": "10%",
            "levels": "40",
            "times": "Any",
            "note": "Super Rod only; requires National Dex"
          },
          {
            "area": "Safari Zone (Swamp area)",
            "kind": "fish",
            "rarity": "Uncommon",
            "levels": "42-45",
            "times": "Any",
            "note": "Super Rod after placing waterside blocks in the Swamp; requires National Dex"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Dragon's Den",
            "kind": "fish",
            "rarity": "10%",
            "levels": "40",
            "times": "Any",
            "note": "Super Rod only; requires National Dex"
          },
          {
            "area": "Safari Zone (Swamp area)",
            "kind": "fish",
            "rarity": "Uncommon",
            "levels": "42-45",
            "times": "Any",
            "note": "Super Rod after placing waterside blocks in the Swamp; requires National Dex"
          }
        ]
      }
    }
  },
  "149": {
    "name": "Dragonite",
    "tips": [
      "Not found wild in any Gen 4 game; only by evolving Dragonair (Lv55) or Pal Park transfer."
    ],
    "games": {
      "diamond": {
        "via": "evolve",
        "summary": "Evolve Dragonair at Lv55"
      },
      "pearl": {
        "via": "evolve",
        "summary": "Evolve Dragonair at Lv55"
      },
      "platinum": {
        "via": "evolve",
        "summary": "Evolve Dragonair at Lv55"
      },
      "heartgold": {
        "via": "evolve",
        "summary": "Evolve Dragonair at Lv55"
      },
      "soulsilver": {
        "via": "evolve",
        "summary": "Evolve Dragonair at Lv55"
      }
    }
  },
  "150": {
    "name": "Mewtwo",
    "tips": [
      "Diamond/Pearl/Platinum: trade-only, no in-game encounter.",
      "HGSS: respawns after re-beating the Elite Four if you accidentally defeat it; save before engaging."
    ],
    "games": {
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Cerulean Cave",
            "kind": "static",
            "rarity": "Only one",
            "levels": "70",
            "times": "Any",
            "note": "Requires all 16 Badges; bring Surf, Rock Smash, Rock Climb and Flash"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Cerulean Cave",
            "kind": "static",
            "rarity": "Only one",
            "levels": "70",
            "times": "Any",
            "note": "Requires all 16 Badges; bring Surf, Rock Smash, Rock Climb and Flash"
          }
        ]
      }
    }
  },
  "151": {
    "name": "Mew",
    "tips": [
      "No official Mew event was distributed natively for Diamond/Pearl/Platinum, so those games are transfer-only and are omitted here.",
      "Mew is never a wild encounter in any Gen 4 game."
    ],
    "games": {
      "heartgold": {
        "via": "event",
        "summary": "Event-only (e.g., the October 2010 10th-Anniversary Mew Wi-Fi distribution); never available in normal play"
      },
      "soulsilver": {
        "via": "event",
        "summary": "Event-only (e.g., the October 2010 10th-Anniversary Mew Wi-Fi distribution); never available in normal play"
      }
    }
  },
  "152": {
    "name": "Chikorita",
    "tips": [
      "Diamond/Pearl/Platinum: only via trade or Pal Park (Field), so those games are omitted."
    ],
    "games": {
      "heartgold": {
        "via": "gift",
        "summary": "Starter from Prof. Elm's Lab, New Bark Town (choose at Lv5)"
      },
      "soulsilver": {
        "via": "gift",
        "summary": "Starter from Prof. Elm's Lab, New Bark Town (choose at Lv5)"
      }
    }
  },
  "153": {
    "name": "Bayleef",
    "tips": [
      "Diamond/Pearl/Platinum: trade/Pal Park-only line; omitted."
    ],
    "games": {
      "heartgold": {
        "via": "evolve",
        "summary": "Evolve Chikorita at Lv16"
      },
      "soulsilver": {
        "via": "evolve",
        "summary": "Evolve Chikorita at Lv16"
      }
    }
  },
  "154": {
    "name": "Meganium",
    "tips": [
      "Diamond/Pearl/Platinum: trade/Pal Park-only line; omitted."
    ],
    "games": {
      "heartgold": {
        "via": "evolve",
        "summary": "Evolve Bayleef at Lv32"
      },
      "soulsilver": {
        "via": "evolve",
        "summary": "Evolve Bayleef at Lv32"
      }
    }
  },
  "155": {
    "name": "Cyndaquil",
    "tips": [
      "Diamond/Pearl/Platinum: only via trade or Pal Park (Field), so those games are omitted."
    ],
    "games": {
      "heartgold": {
        "via": "gift",
        "summary": "Starter from Prof. Elm's Lab, New Bark Town (choose at Lv5)"
      },
      "soulsilver": {
        "via": "gift",
        "summary": "Starter from Prof. Elm's Lab, New Bark Town (choose at Lv5)"
      }
    }
  },
  "156": {
    "name": "Quilava",
    "tips": [
      "Diamond/Pearl/Platinum: trade/Pal Park-only line; omitted."
    ],
    "games": {
      "heartgold": {
        "via": "evolve",
        "summary": "Evolve Cyndaquil at Lv14"
      },
      "soulsilver": {
        "via": "evolve",
        "summary": "Evolve Cyndaquil at Lv14"
      }
    }
  },
  "157": {
    "name": "Typhlosion",
    "tips": [
      "Only obtainable in-game by choosing Cyndaquil as your HGSS starter and evolving the line; in Sinnoh games it can only be traded/transferred in."
    ],
    "games": {
      "heartgold": {
        "via": "evolve",
        "summary": "Evolve Quilava at Lv 36 (from Cyndaquil starter line)"
      },
      "soulsilver": {
        "via": "evolve",
        "summary": "Evolve Quilava at Lv 36 (from Cyndaquil starter line)"
      }
    }
  },
  "158": {
    "name": "Totodile",
    "tips": [
      "Starter choice in HGSS; not catchable in Sinnoh games (trade/transfer only there)."
    ],
    "games": {
      "heartgold": {
        "via": "gift",
        "summary": "Starter from Prof. Elm, New Bark Town (Lv 5)"
      },
      "soulsilver": {
        "via": "gift",
        "summary": "Starter from Prof. Elm, New Bark Town (Lv 5)"
      }
    }
  },
  "159": {
    "name": "Croconaw",
    "tips": [
      "Only via the Totodile starter line in HGSS; not obtainable in Sinnoh games."
    ],
    "games": {
      "heartgold": {
        "via": "evolve",
        "summary": "Evolve Totodile at Lv 18"
      },
      "soulsilver": {
        "via": "evolve",
        "summary": "Evolve Totodile at Lv 18"
      }
    }
  },
  "160": {
    "name": "Feraligatr",
    "tips": [
      "Only via the Totodile starter line in HGSS; not obtainable in Sinnoh games."
    ],
    "games": {
      "heartgold": {
        "via": "evolve",
        "summary": "Evolve Croconaw at Lv 30"
      },
      "soulsilver": {
        "via": "evolve",
        "summary": "Evolve Croconaw at Lv 30"
      }
    }
  },
  "161": {
    "name": "Sentret",
    "tips": [
      "In Sinnoh it is a PokeRadar-only chained encounter on Route 202; use the PokeRadar to find it."
    ],
    "games": {
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 29",
            "kind": "grass",
            "rarity": "Common",
            "levels": "2-4",
            "times": "Morning/Day"
          },
          {
            "area": "Route 1 (Kanto)",
            "kind": "grass",
            "rarity": "Common",
            "levels": "2-4",
            "times": "Morning/Day"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 29",
            "kind": "grass",
            "rarity": "Common",
            "levels": "2-4",
            "times": "Morning/Day"
          },
          {
            "area": "Route 1 (Kanto)",
            "kind": "grass",
            "rarity": "Common",
            "levels": "2-4",
            "times": "Morning/Day"
          }
        ]
      },
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 202",
            "kind": "grass",
            "rarity": "22%",
            "levels": "2-4",
            "times": "Any",
            "note": "PokeRadar only"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 202",
            "kind": "grass",
            "rarity": "22%",
            "levels": "2-4",
            "times": "Any",
            "note": "PokeRadar only"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 202",
            "kind": "grass",
            "rarity": "22%",
            "levels": "2-4",
            "times": "Any",
            "note": "PokeRadar only"
          }
        ]
      }
    }
  },
  "162": {
    "name": "Furret",
    "tips": [
      "Easiest to obtain by catching Sentret and leveling to 15; wild Furret also appears on Route 1 in Kanto in HGSS."
    ],
    "games": {
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 1 (Kanto)",
            "kind": "grass",
            "rarity": "Uncommon",
            "levels": "6",
            "times": "Morning/Day"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 1 (Kanto)",
            "kind": "grass",
            "rarity": "Uncommon",
            "levels": "6",
            "times": "Morning/Day"
          }
        ]
      },
      "diamond": {
        "via": "evolve",
        "summary": "Evolve Sentret at Lv 15 (Sentret via PokeRadar, Route 202)"
      },
      "pearl": {
        "via": "evolve",
        "summary": "Evolve Sentret at Lv 15 (Sentret via PokeRadar, Route 202)"
      },
      "platinum": {
        "via": "evolve",
        "summary": "Evolve Sentret at Lv 15 (Sentret via PokeRadar, Route 202)"
      }
    }
  },
  "163": {
    "name": "Hoothoot",
    "tips": [
      "Night-only in every Gen 4 game. In HGSS it is very common at night in the National Park (~60%). In Sinnoh it is night-only on Route 210/211 and the Great Marsh."
    ],
    "games": {
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 29",
            "kind": "grass",
            "rarity": "45%",
            "levels": "2-4",
            "times": "Night"
          },
          {
            "area": "Route 30",
            "kind": "grass",
            "rarity": "10%",
            "levels": "4",
            "times": "Night"
          },
          {
            "area": "National Park",
            "kind": "grass",
            "rarity": "60%",
            "levels": "10-14",
            "times": "Night"
          },
          {
            "area": "Viridian Forest (Kanto)",
            "kind": "grass",
            "rarity": "40%",
            "levels": "3-5",
            "times": "Night"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 29",
            "kind": "grass",
            "rarity": "45%",
            "levels": "2-4",
            "times": "Night"
          },
          {
            "area": "Route 30",
            "kind": "grass",
            "rarity": "10%",
            "levels": "4",
            "times": "Night"
          },
          {
            "area": "National Park",
            "kind": "grass",
            "rarity": "60%",
            "levels": "10-14",
            "times": "Night"
          },
          {
            "area": "Viridian Forest (Kanto)",
            "kind": "grass",
            "rarity": "40%",
            "levels": "3-5",
            "times": "Night"
          }
        ]
      },
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 210 (North)",
            "kind": "grass",
            "rarity": "10%",
            "levels": "20-27",
            "times": "Night"
          },
          {
            "area": "Route 211 (West)",
            "kind": "grass",
            "rarity": "10%",
            "levels": "15",
            "times": "Night"
          },
          {
            "area": "Great Marsh",
            "kind": "grass",
            "rarity": "10-20%",
            "levels": "24-27",
            "times": "Night",
            "note": "Areas vary"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 210 (North)",
            "kind": "grass",
            "rarity": "10%",
            "levels": "20-27",
            "times": "Night"
          },
          {
            "area": "Route 211 (West)",
            "kind": "grass",
            "rarity": "10%",
            "levels": "15",
            "times": "Night"
          },
          {
            "area": "Great Marsh",
            "kind": "grass",
            "rarity": "10-20%",
            "levels": "24-27",
            "times": "Night",
            "note": "Areas vary"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 205 (North)",
            "kind": "grass",
            "rarity": "10%",
            "levels": "12",
            "times": "Night"
          },
          {
            "area": "Route 210 (North)",
            "kind": "grass",
            "rarity": "10%",
            "levels": "27",
            "times": "Night"
          },
          {
            "area": "Eterna Forest",
            "kind": "grass",
            "rarity": "10%",
            "levels": "12",
            "times": "Night"
          },
          {
            "area": "Great Marsh",
            "kind": "grass",
            "rarity": "20%",
            "levels": "26-27",
            "times": "Night",
            "note": "Areas 5-6"
          }
        ]
      }
    }
  },
  "164": {
    "name": "Noctowl",
    "tips": [
      "Night-only wild in all Gen 4 games; otherwise evolve Hoothoot at Lv 20. Route 8 (Kanto) in HGSS has a high night rate."
    ],
    "games": {
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 43",
            "kind": "grass",
            "rarity": "20%",
            "levels": "17",
            "times": "Night"
          },
          {
            "area": "Route 47",
            "kind": "grass",
            "rarity": "20%",
            "levels": "35",
            "times": "Night"
          },
          {
            "area": "Route 8 (Kanto)",
            "kind": "grass",
            "rarity": "40%",
            "levels": "17-18",
            "times": "Night"
          },
          {
            "area": "Viridian Forest (Kanto)",
            "kind": "grass",
            "rarity": "15%",
            "levels": "7",
            "times": "Night"
          }
        ]
      },
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 43",
            "kind": "grass",
            "rarity": "20%",
            "levels": "17",
            "times": "Night"
          },
          {
            "area": "Route 47",
            "kind": "grass",
            "rarity": "20%",
            "levels": "35",
            "times": "Night"
          },
          {
            "area": "Route 8 (Kanto)",
            "kind": "grass",
            "rarity": "40%",
            "levels": "17-18",
            "times": "Night"
          },
          {
            "area": "Viridian Forest (Kanto)",
            "kind": "grass",
            "rarity": "15%",
            "levels": "7",
            "times": "Night"
          }
        ]
      },
      "diamond": {
        "via": "wild",
        "encounters": [
          {
            "area": "Routes 210/211/216/217 / Mt. Coronet / Great Marsh",
            "kind": "grass",
            "rarity": "10-20%",
            "levels": "25-54",
            "times": "Night"
          }
        ]
      },
      "pearl": {
        "via": "wild",
        "encounters": [
          {
            "area": "Routes 210/211/216/217 / Mt. Coronet / Great Marsh",
            "kind": "grass",
            "rarity": "10-20%",
            "levels": "25-54",
            "times": "Night"
          }
        ]
      },
      "platinum": {
        "via": "wild",
        "encounters": [
          {
            "area": "Routes 210-211 / Mt. Coronet / Great Marsh",
            "kind": "grass",
            "rarity": "10-20%",
            "levels": "15-39",
            "times": "Night"
          }
        ]
      }
    }
  },
  "165": {
    "name": "Ledyba",
    "tips": [
      "SoulSilver version exclusive (HeartGold gets Spinarak instead). Morning-only encounter; not obtainable in HeartGold or any Sinnoh game without trading."
    ],
    "games": {
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 30",
            "kind": "grass",
            "rarity": "20%",
            "levels": "3",
            "times": "Morning"
          },
          {
            "area": "Route 31",
            "kind": "grass",
            "rarity": "20%",
            "levels": "4",
            "times": "Morning"
          },
          {
            "area": "Route 37",
            "kind": "grass",
            "rarity": "30%",
            "levels": "13-15",
            "times": "Morning"
          },
          {
            "area": "Route 2 (Kanto)",
            "kind": "grass",
            "rarity": "9%",
            "levels": "7-10",
            "times": "Morning"
          }
        ]
      }
    }
  },
  "166": {
    "name": "Ledian",
    "tips": [
      "SoulSilver version exclusive. Evolves from Ledyba at Lv 18; wild Ledian appears morning-only on Route 2 (Kanto) in SoulSilver. Not obtainable in HeartGold or Sinnoh games without trading."
    ],
    "games": {
      "soulsilver": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 2 (Kanto)",
            "kind": "grass",
            "rarity": "9%",
            "levels": "7-10",
            "times": "Morning"
          }
        ]
      }
    }
  },
  "167": {
    "name": "Spinarak",
    "tips": [
      "HeartGold version exclusive (SoulSilver gets Ledyba instead). Night-only encounter; not obtainable in SoulSilver or any Sinnoh game without trading."
    ],
    "games": {
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 30",
            "kind": "grass",
            "rarity": "20-30%",
            "levels": "2-3",
            "times": "Night"
          },
          {
            "area": "Route 31",
            "kind": "grass",
            "rarity": "20-30%",
            "levels": "3-4",
            "times": "Night"
          },
          {
            "area": "Route 37",
            "kind": "grass",
            "rarity": "30-40%",
            "levels": "13-15",
            "times": "Night"
          },
          {
            "area": "Route 2 (Kanto)",
            "kind": "grass",
            "rarity": "9%",
            "levels": "7",
            "times": "Night"
          }
        ]
      }
    }
  },
  "168": {
    "name": "Ariados",
    "tips": [
      "HeartGold version exclusive. Evolves from Spinarak at Lv 22; wild Ariados appears night-only on Route 2 (Kanto) in HeartGold. Not obtainable in SoulSilver or Sinnoh games without trading."
    ],
    "games": {
      "heartgold": {
        "via": "wild",
        "encounters": [
          {
            "area": "Route 2 (Kanto)",
            "kind": "grass",
            "rarity": "5%",
            "levels": "7",
            "times": "Night"
          }
        ]
      }
    }
  }
};
