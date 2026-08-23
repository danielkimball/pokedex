#!/usr/bin/env node

/**
 * Build the Generation I-IV item acquisition catalog.
 *
 * Serebii ItemDex supplies per-game overworld/gift, shop, Pickup, Pokéwalker,
 * Underground and historical event rows. Pokémon Database supplies the move
 * taught by each TM/HM in each generation. Pages are cached under tmp/ so an
 * audit/rebuild does not repeatedly download hundreds of source pages.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const SEREBII = 'https://www.serebii.net';
const POKEMON_DB = 'https://pokemondb.net';
const BULBAPEDIA = 'https://bulbapedia.bulbagarden.net/wiki';
const CACHE_DIR = path.resolve('tmp/item-research/pages');
const OUT = path.resolve('src/core/constants/item-locations.generated.ts');

const GAMES = [
  'red', 'blue', 'yellow',
  'gold', 'silver', 'crystal',
  'ruby', 'sapphire', 'emerald', 'firered', 'leafgreen',
  'diamond', 'pearl', 'platinum', 'heartgold', 'soulsilver',
];

const GAME_LABELS = {
  red: 'Red', blue: 'Blue', yellow: 'Yellow',
  gold: 'Gold', silver: 'Silver', crystal: 'Crystal',
  ruby: 'Ruby', sapphire: 'Sapphire', emerald: 'Emerald',
  firered: 'FireRed', leafgreen: 'LeafGreen',
  diamond: 'Diamond', pearl: 'Pearl', platinum: 'Platinum',
  heartgold: 'HeartGold', soulsilver: 'SoulSilver',
};

const GENERATION_GAMES = {
  1: ['red', 'blue', 'yellow'],
  2: ['gold', 'silver', 'crystal'],
  3: ['ruby', 'sapphire', 'emerald', 'firered', 'leafgreen'],
  4: ['diamond', 'pearl', 'platinum', 'heartgold', 'soulsilver'],
};

const AVAILABILITY_CODES = {
  RGBY: ['red', 'blue', 'yellow'],
  GS: ['gold', 'silver'],
  C: ['crystal'],
  RS: ['ruby', 'sapphire'],
  E: ['emerald'],
  FRLG: ['firered', 'leafgreen'],
  DP: ['diamond', 'pearl'],
  Pt: ['platinum'],
  HG: ['heartgold'],
  SS: ['soulsilver'],
};

const CATEGORY_PAGES = [
  ['pokeball', 'Poké Balls'],
  ['recovery', 'Medicine'],
  ['holditem', 'Held Items'],
  ['evolutionary', 'Evolution Items'],
  ['berry', 'Berries'],
  ['gsberry', 'Generation II Berries'],
  ['battleeffect', 'Battle Items'],
  ['vitamins', 'Vitamins'],
  ['fossil', 'Fossils'],
  ['mail', 'Mail'],
  ['miscellaneous', 'Miscellaneous'],
  ['keyitem', 'Key Items'],
  ['eventitem', 'Event Items'],
];

const SOURCE_KINDS = {
  locations: 'Found / gift',
  shopping: 'Shop / exchange',
  pickup: 'Pickup',
  event: 'Event distribution',
};

const MACHINE_LOCATION_PAGES = [
  ['rb/tmhm', ['red', 'blue']],
  ['yellow/tmhm', ['yellow']],
  ['gs/tmhm', ['gold', 'silver']],
  ['crystal/tmhm', ['crystal']],
  ['rubysapphire/tmhm', ['ruby', 'sapphire']],
  ['fireredleafgreen/tmhm', ['firered', 'leafgreen']],
  ['diamondpearl/tmhm', ['diamond', 'pearl']],
  ['platinum/tmhm', ['platinum']],
  ['heartgoldsoulsilver/tmhm', ['heartgold', 'soulsilver']],
];

const ENTITY_NAMES = {
  amp: '&', apos: "'", quot: '"', lt: '<', gt: '>', nbsp: ' ',
  eacute: 'é', Eacute: 'É', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”',
  ndash: '–', mdash: '—', hellip: '…', alpha: 'α', copy: '©',
};

function decodeEntities(value) {
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity) => {
    if (entity[0] === '#') {
      const hex = entity[1]?.toLowerCase() === 'x';
      const code = Number.parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return ENTITY_NAMES[entity] ?? match;
  });
}

function stripHtml(value, separator = ' ') {
  return decodeEntities(value
    .replace(/<br\s*\/?\s*>/gi, separator)
    .replace(/<\/(?:div|p|li)>/gi, separator)
    .replace(/<[^>]+>/g, ' '))
    .replace(/Pok(?:ï¿½|Ã©|�)mon/gi, 'Pokémon')
    .replace(/Pok(?:ï¿½|Ã©|�)Gear/gi, 'Pokégear')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:])/g, '$1')
    .replace(/\s*·\s*$/, '')
    .trim();
}

function normalizeItemKey(value) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/gi, '').toLowerCase();
}

function safeFilename(url) {
  return Buffer.from(url).toString('base64url') + '.html';
}

async function fetchCached(url, encoding = 'windows-1252') {
  await mkdir(CACHE_DIR, { recursive: true });
  const cachePath = path.join(CACHE_DIR, safeFilename(url));
  try {
    return await readFile(cachePath, 'utf8');
  } catch {
    // Cache miss.
  }

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url, { headers: { 'user-agent': 'pokedex-item-research/1.0' } });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const bytes = await response.arrayBuffer();
      const html = new TextDecoder(encoding).decode(bytes);
      await writeFile(cachePath, html);
      return html;
    } catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, attempt * 500));
    }
  }
  throw new Error(`${lastError?.message ?? lastError}: ${url}`);
}

async function mapLimit(values, limit, fn) {
  const results = new Array(values.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, async () => {
    while (next < values.length) {
      const index = next++;
      results[index] = await fn(values[index], index);
    }
  }));
  return results;
}

function mainContent(html) {
  const start = html.indexOf('<main');
  const openEnd = html.indexOf('>', start);
  const end = html.indexOf('</main>', openEnd);
  return start >= 0 && end >= 0 ? html.slice(openEnd + 1, end) : html;
}

function tableRows(tableHtml) {
  return [...tableHtml.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map(row =>
    [...row[1].matchAll(/<td\b([^>]*)>([\s\S]*?)<\/td>/gi)].map(cell => ({
      attrs: cell[1],
      html: cell[2],
      text: stripHtml(cell[2], ' · '),
    })),
  );
}

function gameIdsFromText(text) {
  const legacyOnly = text
    .replace(/Omega\s+Ruby/gi, '')
    .replace(/Alpha\s+Sapphire/gi, '')
    .replace(/Brilliant\s+Diamond/gi, '')
    .replace(/Shining\s+Pearl/gi, '')
    .replace(/Let's\s+Go,?\s+Pikachu!?/gi, '')
    .replace(/Let's\s+Go,?\s+Eevee!?/gi, '');
  const ids = [];
  for (const game of GAMES) {
    const label = GAME_LABELS[game];
    const pattern = new RegExp(`(?:^|[^A-Za-z])${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:$|[^A-Za-z])`, 'i');
    if (pattern.test(legacyOnly)) ids.push(game);
  }
  return ids;
}

function parseAvailability(body) {
  const marker = body.indexOf('Attainable In');
  if (marker < 0) return [];
  const tableStart = body.lastIndexOf('<table', marker);
  const tableEnd = body.indexOf('</table>', marker);
  if (tableStart < 0 || tableEnd < 0) return [];
  const rows = tableRows(body.slice(tableStart, tableEnd + 8));
  const available = new Set();
  let pendingCodes = null;
  for (const row of rows) {
    const cells = row.map(cell => cell.text.trim());
    if (cells.length && cells.some(cell => cell in AVAILABILITY_CODES) && cells.every(cell => /^[A-Za-z0-9&;#]+$/.test(cell))) {
      pendingCodes = cells;
      continue;
    }
    if (pendingCodes && cells.length === pendingCodes.length) {
      cells.forEach((cell, index) => {
        const mappedGames = AVAILABILITY_CODES[pendingCodes[index]];
        if (mappedGames && /\bYes\b/i.test(cell)) {
          for (const game of mappedGames) available.add(game);
        }
      });
      pendingCodes = null;
    }
  }
  return [...available];
}

function classifyTable(title) {
  const normalized = title.toLowerCase();
  if (normalized === 'locations') return SOURCE_KINDS.locations;
  if (normalized === 'shopping details') return SOURCE_KINDS.shopping;
  if (normalized.includes('pickup') && normalized.includes('details')) return SOURCE_KINDS.pickup;
  return null;
}

function addSource(games, game, source) {
  const list = games[game] ?? (games[game] = []);
  if (!list.some(existing => existing.kind === source.kind && existing.text === source.text)) list.push(source);
}

function parseAcquisition(body) {
  const games = {};
  for (const table of body.matchAll(/<table\b[^>]*(?:class="(?:dextable|tab)"|class=(?:dextable|tab))[^>]*>([\s\S]*?)<\/table>/gi)) {
    const rows = tableRows(table[1]);
    if (!rows.length) continue;
    const title = rows[0].map(cell => cell.text).join(' ').trim();
    const kind = classifyTable(title);
    if (!kind) continue;

    for (const row of rows.slice(1)) {
      if (row.length < 2) continue;
      const info = row[row.length - 1].text;
      const labels = row.slice(0, -1).map(cell => cell.text).join(' ');
      if (!info || /^(Picture|Location|Price|Games)$/i.test(info)) continue;
      let gameIds = gameIdsFromText(labels);
      if (/Pok(?:é|e|�)Walker/i.test(labels)) gameIds = ['heartgold', 'soulsilver'];
      for (const game of gameIds) {
        addSource(games, game, {
          kind: /Pok(?:é|e|�)Walker/i.test(labels) ? 'Pokéwalker' : kind,
          text: info,
        });
      }
    }
  }

  // Event tables use a different three-column layout: description, duration,
  // and games. Keep historical distribution details when the source has them.
  for (const table of body.matchAll(/<table\b[^>]*class="tab"[^>]*>([\s\S]*?)<\/table>/gi)) {
    const rows = tableRows(table[1]);
    const header = rows[0]?.map(cell => cell.text).join(' ') ?? '';
    if (!/Event Description/i.test(header)) continue;
    for (const row of rows.slice(1)) {
      if (row.length < 3) continue;
      const gameIds = gameIdsFromText(row[row.length - 1].text);
      const text = [row[0].text, row[1].text].filter(Boolean).join(' · ');
      for (const game of gameIds) addSource(games, game, { kind: SOURCE_KINDS.event, text });
    }
  }

  return games;
}

function parseMachineMoves(html) {
  const body = mainContent(html);
  const moves = {};
  for (const match of body.matchAll(/<li><a href="\/move\/[^"]+">([^<]+)<\/a> in ([\s\S]*?)<\/li>/gi)) {
    const move = stripHtml(match[1]);
    const rawContext = decodeEntities(match[2]);
    let gameIds = gameIdsFromText(rawContext);
    if (!gameIds.length) {
      const context = stripHtml(match[2]);
      const generationMatch = context.match(/Generations?\s+(\d)(?:\s*[-–]\s*(\d))?/i);
      if (generationMatch) {
        const first = Number(generationMatch[1]);
        const last = Number(generationMatch[2] ?? generationMatch[1]);
        for (let generation = first; generation <= Math.min(last, 4); generation++) {
          gameIds.push(...GENERATION_GAMES[generation]);
        }
      }
    }
    for (const game of gameIds) moves[game] = move;
  }
  return moves;
}

function parsePokemonDbLocations(html) {
  const body = mainContent(html);
  const marker = body.search(/<h2>Game locations<\/h2>/i);
  if (marker < 0) return {};
  const tableStart = body.indexOf('<table', marker);
  const tableEnd = body.indexOf('</table>', tableStart);
  if (tableStart < 0 || tableEnd < 0) return {};
  const games = {};
  for (const match of body.slice(tableStart, tableEnd + 8).matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const header = match[1].match(/<th\b[^>]*>([\s\S]*?)<\/th>/i)?.[1];
    const info = match[1].match(/<td\b[^>]*>([\s\S]*?)<\/td>/i)?.[1];
    if (!header || !info) continue;
    const text = stripHtml(info, ' · ');
    if (!text || /Sorry, we don't have location data/i.test(text)) continue;
    for (const game of gameIdsFromText(stripHtml(header))) {
      addSource(games, game, { kind: SOURCE_KINDS.locations, text });
    }
  }
  return games;
}

function parseMachineLocationPage(html) {
  const body = mainContent(html);
  const result = [];
  const hiddenMachinesAt = body.search(/Hidden Machines|>HM(?:<|\s)/i);
  for (const row of body.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(cell => stripHtml(cell[1], ' · '));
    const labelled = cells[0]?.match(/^(TM|HM)\s*(\d{1,2})$/i);
    const numbered = cells[0]?.match(/^(\d{1,2})$/);
    if ((!labelled && !numbered) || cells.length < 3) continue;
    const kind = labelled?.[1] ?? (hiddenMachinesAt >= 0 && row.index > hiddenMachinesAt ? 'HM' : 'TM');
    const number = labelled?.[2] ?? numbered[1];
    const slug = `${kind.toLowerCase()}${String(Number(number)).padStart(2, '0')}`;
    result.push({ slug, move: cells[1], location: cells[cells.length - 1] });
  }
  return result;
}

function bulbapediaItemUrl(name) {
  return `${BULBAPEDIA}/${encodeURIComponent(name.replace(/ /g, '_'))}`;
}

function parseBulbapediaAcquisition(html) {
  const marker = html.search(/id="Acquisition"/i);
  if (marker < 0) return {};
  const afterMarker = html.slice(marker + 16);
  const nextHeading = afterMarker.search(/<h[23]\b/i);
  const section = nextHeading < 0 ? afterMarker : afterMarker.slice(0, nextHeading);
  const games = {};

  for (const row of section.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...row[1].matchAll(/<td\b([^>]*)>([\s\S]*?)<\/td>/gi)].map(cell => ({
      html: cell[2],
      text: stripHtml(cell[2], ' · '),
    }));
    if (cells.length < 2) continue;
    const titles = [...cells[0].html.matchAll(/title="([^"]+)"/gi)].map(match => decodeEntities(match[1])).join(' ');
    const gameIds = gameIdsFromText(`${titles} ${cells[0].text}`);
    const info = cells[cells.length - 1].text;
    if (!gameIds.length || !info || /^(Method|Location)$/i.test(info)) continue;
    for (const game of gameIds) addSource(games, game, { kind: SOURCE_KINDS.locations, text: info });
  }

  return games;
}

async function discoverCategory(pageSlug, category, seenPages, items) {
  const pageUrl = `${SEREBII}/itemdex/list/${pageSlug}.shtml`;
  if (seenPages.has(pageUrl)) return;
  seenPages.add(pageUrl);
  const body = mainContent(await fetchCached(pageUrl));
  const heading = body.search(/<font\s+size="4"><b><u>/i);
  const catalog = heading >= 0 ? body.slice(heading) : body;

  for (const match of catalog.matchAll(/<a\s+href="\/itemdex\/([^"/]+)\.shtml"[^>]*>([\s\S]*?)<\/a>/gi)) {
    const slug = decodeEntities(match[1]);
    const name = stripHtml(match[2]);
    if (!name || name === '======') continue;
    if (!items.has(slug)) items.set(slug, { slug, name, category });
  }

  for (const match of catalog.matchAll(/href="\/itemdex\/list\/([^"/]+)\.shtml"/gi)) {
    const child = decodeEntities(match[1]);
    if (CATEGORY_PAGES.some(([root]) => root === child)) continue;
    await discoverCategory(child, category, seenPages, items);
  }
}

function earliestGeneration(availableIn) {
  for (const generation of [1, 2, 3, 4]) {
    if (GENERATION_GAMES[generation].some(game => availableIn.includes(game))) return generation;
  }
  return 4;
}

async function loadPokeApiCatalog() {
  const base = 'https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv';
  const [indicesCsv, itemsCsv, namesCsv] = await Promise.all([
    fetchCached(`${base}/item_game_indices.csv`),
    fetchCached(`${base}/items.csv`),
    fetchCached(`${base}/item_names.csv`),
  ]);
  const earliestById = new Map();
  for (const line of indicesCsv.trim().split(/\r?\n/).slice(1)) {
    const [itemId, generationId] = line.split(',').map(Number);
    if (generationId > 4) continue;
    earliestById.set(itemId, Math.min(earliestById.get(itemId) ?? 4, generationId));
  }

  const identifiers = new Map();
  for (const line of itemsCsv.trim().split(/\r?\n/).slice(1)) {
    const [itemId, identifier] = line.split(',');
    if (earliestById.has(Number(itemId))) identifiers.set(Number(itemId), identifier);
  }

  const keys = new Map();
  for (const [itemId, identifier] of identifiers) {
    keys.set(normalizeItemKey(identifier), earliestById.get(itemId));
  }
  for (const line of namesCsv.trim().split(/\r?\n/).slice(1)) {
    const [itemId, languageId, ...nameParts] = line.split(',');
    if (Number(languageId) !== 9 || !earliestById.has(Number(itemId))) continue;
    const name = nameParts.join(',').replace(/^"|"$/g, '').replace(/""/g, '"');
    keys.set(normalizeItemKey(name), earliestById.get(Number(itemId)));
    // Serebii omits the leading zero on Data Cards 01-09.
    const dataCard = name.match(/^Data Card 0([1-9])$/);
    if (dataCard) keys.set(normalizeItemKey(`Data Card ${dataCard[1]}`), earliestById.get(Number(itemId)));
  }
  return keys;
}

async function main() {
  const discovered = new Map();
  const seenPages = new Set();
  for (const [slug, category] of CATEGORY_PAGES) {
    await discoverCategory(slug, category, seenPages, discovered);
  }

  for (let number = 1; number <= 92; number++) {
    const label = `TM${String(number).padStart(2, '0')}`;
    discovered.set(label.toLowerCase(), { slug: label.toLowerCase(), name: label, category: 'Machines' });
  }
  for (let number = 1; number <= 8; number++) {
    const label = `HM${String(number).padStart(2, '0')}`;
    discovered.set(label.toLowerCase(), { slug: label.toLowerCase(), name: label, category: 'Machines' });
  }

  const pokeApiCatalog = await loadPokeApiCatalog();
  const candidates = [...discovered.values()].filter(item =>
    !item.slug.endsWith('legends')
    && (pokeApiCatalog.has(normalizeItemKey(item.name)) || pokeApiCatalog.has(normalizeItemKey(item.slug))),
  );
  console.log(`Discovered ${discovered.size} catalog pages; researching ${candidates.length} Generation I-IV items...`);
  const records = await mapLimit(candidates, 6, async (item, index) => {
    if ((index + 1) % 100 === 0) console.log(`  ${index + 1}/${candidates.length}`);
    try {
      const itemUrl = `${SEREBII}/itemdex/${encodeURI(item.slug)}.shtml`;
      const html = await fetchCached(itemUrl);
      const body = mainContent(html);
      const availableIn = parseAvailability(body);
      const games = parseAcquisition(body);
      const relevant = availableIn.filter(game => GAMES.includes(game));

      let machineMoves;
      if (item.category === 'Machines') {
        try {
          const machineHtml = await fetchCached(`${POKEMON_DB}/item/${item.slug}`);
          machineMoves = parseMachineMoves(machineHtml);
          const secondaryGames = parsePokemonDbLocations(machineHtml);
          for (const [game, sources] of Object.entries(secondaryGames)) {
            for (const source of sources) addSource(games, game, source);
          }
        } catch (error) {
          console.warn(`Machine move lookup failed for ${item.name}: ${error.message}`);
        }
      }

      let bulbapediaUrl;
      if (item.category !== 'Machines') {
        bulbapediaUrl = bulbapediaItemUrl(item.name);
        try {
          const bulbapediaGames = parseBulbapediaAcquisition(await fetchCached(bulbapediaUrl, 'utf-8'));
          for (const [game, sources] of Object.entries(bulbapediaGames)) {
            if (!relevant.includes(game)) continue;
            for (const source of sources) addSource(games, game, source);
          }
        } catch (error) {
          console.warn(`Bulbapedia acquisition lookup failed for ${item.name}: ${error.message}`);
        }
      }

      return {
        ...item,
        generation: pokeApiCatalog.get(normalizeItemKey(item.name))
          ?? pokeApiCatalog.get(normalizeItemKey(item.slug))
          ?? earliestGeneration(relevant.length ? relevant : Object.keys(games)),
        availableIn: relevant,
        games: Object.fromEntries(Object.entries(games).filter(([game]) => relevant.includes(game))),
        ...(machineMoves && Object.keys(machineMoves).length ? { machineMoves } : {}),
        sourceUrl: itemUrl,
        researchUrls: [itemUrl, ...(bulbapediaUrl ? [bulbapediaUrl] : [])],
      };
    } catch (error) {
      console.warn(`Skipping ${item.name}: ${error.message}`);
      return null;
    }
  });

  const output = records.filter(Boolean);
  const bySlug = new Map(output.map(item => [item.slug, item]));
  for (const [page, pageGames] of MACHINE_LOCATION_PAGES) {
    const pageData = parseMachineLocationPage(await fetchCached(`${SEREBII}/${page}.shtml`));
    for (const machine of pageData) {
      const item = bySlug.get(machine.slug);
      if (!item) continue;
      item.machineMoves ??= {};
      for (const game of pageGames) {
        item.machineMoves[game] ??= machine.move.replace(/^De Fog$/i, 'Defog').replace(/^Dynamicpunch$/i, 'DynamicPunch');
        // The game-specific TM/HM table is authoritative for one-off machine
        // locations. Keep repeatable shops/Pickup, but replace noisy location
        // rows collected from cross-generation ItemDex pages.
        item.games[game] = (item.games[game] ?? []).filter(source => source.kind !== SOURCE_KINDS.locations);
        if (machine.location) addSource(item.games, game, { kind: SOURCE_KINDS.locations, text: machine.location });
      }
    }
  }

  output.sort((a, b) =>
    a.generation - b.generation || a.category.localeCompare(b.category) || a.name.localeCompare(b.name),
  );

  const source = `/**
 * AUTO-GENERATED by scripts/build-gen1-4-item-data.mjs.
 * Acquisition sources: Serebii ItemDex per-game Locations, Shopping Details,
 * Pickup, Pokéwalker and event tables. TM/HM move labels: Pokémon Database.
 * Retrieved ${new Date().toISOString().slice(0, 10)}. Do not hand-edit.
 */

export type ItemGame = ${GAMES.map(game => `'${game}'`).join(' | ')};
export type ItemSourceKind = 'Found / gift' | 'Shop / exchange' | 'Pickup' | 'Pokéwalker' | 'Event distribution' | 'Not normally obtainable';

export interface ItemAcquisitionSource {
  kind: ItemSourceKind;
  text: string;
}

export interface ItemLocationEntry {
  slug: string;
  name: string;
  category: string;
  generation: 1 | 2 | 3 | 4;
  availableIn: ItemGame[];
  games: Partial<Record<ItemGame, ItemAcquisitionSource[]>>;
  machineMoves?: Partial<Record<ItemGame, string>>;
  sourceUrl: string;
  researchUrls: string[];
}

export const ITEM_GAME_LABELS: Record<ItemGame, string> = ${JSON.stringify(GAME_LABELS, null, 2)};

export const ITEM_GENERATION_GAMES: Record<1 | 2 | 3 | 4, ItemGame[]> = ${JSON.stringify(GENERATION_GAMES, null, 2)};

export const GEN1_4_ITEM_LOCATIONS: ItemLocationEntry[] = ${JSON.stringify(output, null, 2)};
`;

  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, source);
  const byGeneration = Object.fromEntries([1, 2, 3, 4].map(generation => [generation, output.filter(item => item.generation === generation).length]));
  console.log(`Wrote ${OUT}`);
  console.log(`Items: ${output.length}; introduced by generation: ${JSON.stringify(byGeneration)}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
