// HeartGold/SoulSilver save file structure offsets
export const HGSS_OFFSETS = {
  SAVE_SIZE: 0x80000, // 512 KB
  GENERAL_BLOCK_OFFSET: 0x0,
  GENERAL_BLOCK_SIZE: 0xF628,
  STORAGE_BLOCK_OFFSET: 0xF700,
  STORAGE_BLOCK_SIZE: 0x12310,
  BACKUP_OFFSET: 0x40000,

  // Within general block
  TRAINER_OFFSET: 0x0,
  TRAINER_SIZE: 0x68,
  PARTY_OFFSET: 0xA0,
  PARTY_COUNT_OFFSET: 0x9C,

  // Within storage block
  PC_OFFSET: 0x0,
  PC_BOX_COUNT: 18,
  PC_SLOTS_PER_BOX: 30,
  PC_POKEMON_SIZE: 136,
  PC_BOX_SIZE: 0x1000, // 4096 - HGSS has 16 bytes padding per box!
  BOX_NAMES_OFFSET: 0x12008, // Box name storage

  // Footer/checksum
  GENERAL_FOOTER_OFFSET: 0xF618,
  STORAGE_FOOTER_OFFSET: 0x21A00,
} as const;
