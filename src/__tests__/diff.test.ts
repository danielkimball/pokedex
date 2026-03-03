import { describe, it, expect } from 'vitest';
import { diffSnapshots } from '../core/diff/diff-engine';
import { getPokemonIdentity, isOriginalTrainer } from '../core/diff/pokemon-identity';
import type { PokemonLocation } from '../core/parser/save-file';
import type { Pokemon } from '../core/parser/pokemon-parser';

function makePokemon(overrides: Partial<Pokemon> = {}): Pokemon {
  return {
    pid: 0x12345678,
    checksum: 0,
    species: 25,
    heldItem: 0,
    otId: 12345,
    otIdPublic: 12345,
    otSid: 0,
    experience: 50000,
    friendship: 70,
    ability: 9,
    markings: 0,
    language: 2,
    evHp: 0, evAtk: 0, evDef: 0, evSpe: 0, evSpa: 0, evSpd: 0,
    contestCool: 0, contestBeauty: 0, contestCute: 0,
    contestSmart: 0, contestTough: 0, contestSheen: 0,
    move1: 84, move2: 0, move3: 0, move4: 0,
    pp1: 30, pp2: 0, pp3: 0, pp4: 0,
    ppUp1: 0, ppUp2: 0, ppUp3: 0, ppUp4: 0,
    ivHp: 31, ivAtk: 31, ivDef: 31, ivSpe: 31, ivSpa: 31, ivSpd: 31,
    isEgg: false, isNicknamed: false,
    nickname: 'Pikachu', originGame: 10,
    otName: 'Ash',
    dateEggReceived: null, dateMet: [2009, 5, 1],
    eggLocationDP: 0, metLocationDP: 0, eggLocationPt: 0, metLocationPt: 0,
    pokerus: 0, pokeball: 4, metLevel: 5, otGender: 0, encounterType: 0,
    nature: 3, isShiny: false, gender: 0,
    battleStats: { status: 0, level: 25, capsule: 0, currentHp: 55, maxHp: 55, atk: 40, def: 30, spe: 56, spa: 35, spd: 30 },
    ...overrides,
  };
}

function makeLoc(pokemon: Pokemon, location: 'party' | 'box', containerIndex: number, slotIndex: number): PokemonLocation {
  return { pokemon, location, containerIndex, slotIndex };
}

describe('Pokemon Identity', () => {
  it('generates a stable identity key', () => {
    const pokemon = makePokemon();
    const id = getPokemonIdentity(pokemon);

    expect(id.key).toBe('305419896-12345-0'); // 0x12345678 = 305419896
    expect(id.pid).toBe(0x12345678);
  });

  it('same Pokemon always has same identity', () => {
    const p1 = makePokemon();
    const p2 = makePokemon();
    expect(getPokemonIdentity(p1).key).toBe(getPokemonIdentity(p2).key);
  });

  it('different PIDs produce different identities', () => {
    const p1 = makePokemon({ pid: 1 });
    const p2 = makePokemon({ pid: 2 });
    expect(getPokemonIdentity(p1).key).not.toBe(getPokemonIdentity(p2).key);
  });

  it('isOriginalTrainer checks TID and SID', () => {
    const pokemon = makePokemon({ otIdPublic: 12345, otSid: 67 });
    expect(isOriginalTrainer(pokemon, 12345, 67)).toBe(true);
    expect(isOriginalTrainer(pokemon, 12345, 0)).toBe(false);
    expect(isOriginalTrainer(pokemon, 99999, 67)).toBe(false);
  });
});

describe('Diff Engine', () => {
  const trainerId = 12345;
  const secretId = 0;

  it('detects new catch', () => {
    const pikachu = makePokemon();
    const prev: PokemonLocation[] = [];
    const curr = [makeLoc(pikachu, 'party', 0, 0)];

    const result = diffSnapshots(prev, curr, trainerId, secretId);
    expect(result.newCatches).toHaveLength(1);
    expect(result.newCatches[0].pokemon.species).toBe(25);
  });

  it('detects traded in (different OT)', () => {
    const traded = makePokemon({ otIdPublic: 99999, otSid: 88 });
    const prev: PokemonLocation[] = [];
    const curr = [makeLoc(traded, 'box', 0, 0)];

    const result = diffSnapshots(prev, curr, trainerId, secretId);
    expect(result.tradedIn).toHaveLength(1);
  });

  it('detects released', () => {
    const pikachu = makePokemon();
    const prev = [makeLoc(pikachu, 'party', 0, 0)];
    const curr: PokemonLocation[] = [];

    const result = diffSnapshots(prev, curr, trainerId, secretId);
    expect(result.released).toHaveLength(1);
  });

  it('detects traded out (different OT goes away)', () => {
    const traded = makePokemon({ otIdPublic: 99999, otSid: 88 });
    const prev = [makeLoc(traded, 'box', 0, 0)];
    const curr: PokemonLocation[] = [];

    const result = diffSnapshots(prev, curr, trainerId, secretId);
    expect(result.tradedOut).toHaveLength(1);
  });

  it('detects evolution', () => {
    const pikachu = makePokemon({ species: 25 });
    const raichu = makePokemon({ species: 26 }); // same PID/OT
    const prev = [makeLoc(pikachu, 'party', 0, 0)];
    const curr = [makeLoc(raichu, 'party', 0, 0)];

    const result = diffSnapshots(prev, curr, trainerId, secretId);
    expect(result.evolved).toHaveLength(1);
    expect(result.evolved[0].pokemon.species).toBe(26);
  });

  it('detects moved Pokemon', () => {
    const pikachu = makePokemon();
    const prev = [makeLoc(pikachu, 'party', 0, 0)];
    const curr = [makeLoc(pikachu, 'box', 2, 5)];

    const result = diffSnapshots(prev, curr, trainerId, secretId);
    expect(result.moved).toHaveLength(1);
  });

  it('detects level up', () => {
    const before = makePokemon({ battleStats: { status: 0, level: 25, capsule: 0, currentHp: 55, maxHp: 55, atk: 40, def: 30, spe: 56, spa: 35, spd: 30 } });
    const after = makePokemon({ battleStats: { status: 0, level: 30, capsule: 0, currentHp: 65, maxHp: 65, atk: 50, def: 38, spe: 66, spa: 43, spd: 38 } });

    const prev = [makeLoc(before, 'party', 0, 0)];
    const curr = [makeLoc(after, 'party', 0, 0)];

    const result = diffSnapshots(prev, curr, trainerId, secretId);
    expect(result.leveledUp).toHaveLength(1);
  });

  it('reports unchanged Pokemon', () => {
    const pikachu = makePokemon();
    const prev = [makeLoc(pikachu, 'party', 0, 0)];
    const curr = [makeLoc(pikachu, 'party', 0, 0)];

    const result = diffSnapshots(prev, curr, trainerId, secretId);
    expect(result.unchanged).toBe(1);
    expect(result.changes).toHaveLength(0);
  });

  it('generates summary string', () => {
    const pikachu = makePokemon();
    const bulbasaur = makePokemon({ pid: 0x11111111, species: 1 });

    const prev = [makeLoc(pikachu, 'party', 0, 0)];
    const curr = [
      makeLoc(pikachu, 'party', 0, 0),
      makeLoc(bulbasaur, 'box', 0, 0),
    ];

    const result = diffSnapshots(prev, curr, trainerId, secretId);
    expect(result.summary).toContain('+1 caught');
  });
});
