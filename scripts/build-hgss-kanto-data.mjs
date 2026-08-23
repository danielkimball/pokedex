#!/usr/bin/env node

/**
 * Build the HeartGold/SoulSilver acquisition guide for National Dex 001-151.
 *
 * Source: PokeAPI's ROM-derived encounter and evolution records. The generated
 * file is committed so the app works offline; rerun this script to audit or
 * refresh the data without hand-copying hundreds of encounter slots.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const API = 'https://pokeapi.co/api/v2';
const OUT = path.resolve('src/core/constants/hgss-kanto-data.generated.ts');
const VERSIONS = ['heartgold', 'soulsilver'];

const METHOD_LABELS = {
  walk: 'Grass / cave',
  surf: 'Surf',
  'old-rod': 'Old Rod',
  'good-rod': 'Good Rod',
  'super-rod': 'Super Rod',
  headbutt: 'Headbutt tree',
  'rock-smash': 'Rock Smash',
  'squirt-bottle': 'SquirtBottle (static)',
  pokeflute: 'Pokégear Poké Flute (static)',
  static: 'Static encounter',
  roaming: 'Roaming encounter',
  gift: 'Gift / prize',
  'gift-egg': 'Gift Egg',
};

const CONDITION_LABELS = {
  'time-morning': 'Morning (4:00 AM–9:59 AM)',
  'time-day': 'Day (10:00 AM–7:59 PM)',
  'time-night': 'Night (8:00 PM–3:59 AM)',
  'radio-hoenn': 'Pokégear Radio: Hoenn Sound (Wednesday)',
  'radio-sinnoh': 'Pokégear Radio: Sinnoh Sound (Thursday)',
  'story-progress-beat-red': 'After defeating Red',
  'story-progress-receive-tm-from-claire': 'After receiving TM59 from Clair',
  'story-progress-returned-machine-part': 'After returning the Machine Part',
  'story-progress-national-dex': 'After obtaining the National Pokédex',
  'story-progress-before-national-dex': 'Before obtaining the National Pokédex',
  'story-progress-hall-of-fame': 'After entering the Hall of Fame',
  'story-progress-awakened-beasts': 'After awakening the legendary beasts',
  'bug-catching-contest-yes': 'During the Bug-Catching Contest (Tue/Thu/Sat)',
  'bug-catching-contest-no': 'Outside the Bug-Catching Contest',
  'headbutt-tree-common': 'Common Headbutt trees',
  'headbutt-tree-rare': 'Rare Headbutt trees',
  'headbutt-tree-special': 'Special Headbutt trees',
  'item-helix-fossil': 'Revive a Helix Fossil',
  'item-dome-fossil': 'Revive a Dome Fossil',
  'item-old-amber': 'Revive Old Amber',
  'other-snorlax-11-beat-league': 'Respawn on Route 12 after re-entering the Hall of Fame if the Route 11 Snorlax was defeated',
  'other-found-11-times-roaming': 'Roaming after its first 11 encounters',
  'coins-6666': 'Costs 6,666 Coins',
  'coins-9999': 'Costs 9,999 Coins',
  'coins-2100': 'Costs 2,100 Coins',
  'coins-2500': 'Costs 2,500 Coins',
  'coins-3333': 'Costs 3,333 Coins',
  'coins-5500': 'Costs 5,500 Coins',
  'coins-6500': 'Costs 6,500 Coins',
  'weekday-tuesday': 'Tuesday contest roster',
  'weekday-thursday': 'Thursday contest roster',
  'weekday-saturday': 'Saturday contest roster',
  'swarm-yes': 'During a Pokégear-announced swarm',
  'swarm-no': 'Without a swarm',
};

const ITEM_LABELS = {
  'kings-rock': "King's Rock",
  'metal-coat': 'Metal Coat',
  'dragon-scale': 'Dragon Scale',
  'up-grade': 'Up-Grade',
  'dubious-disc': 'Dubious Disc',
  protector: 'Protector',
  electirizer: 'Electirizer',
  magmarizer: 'Magmarizer',
  'reaper-cloth': 'Reaper Cloth',
  'razor-claw': 'Razor Claw',
  'razor-fang': 'Razor Fang',
};

async function fetchJson(url) {
  const response = await fetch(url, { headers: { 'user-agent': 'pokedex-data-builder/1.0' } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.json();
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

function titleCaseSlug(slug) {
  return slug
    .replace(/^johto-/, '')
    .replace(/^kanto-/, '')
    .replace(/-area$/, '')
    .split('-')
    .map(word => {
      if (/^b\d+f$/.test(word)) return word.toUpperCase();
      if (/^\d+f$/.test(word)) return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ')
    .replace(/^Road (\d+)/, 'Route $1')
    .replace(/Pokemon/g, 'Pokémon')
    .replace(/Mt /g, 'Mt. ');
}

function conditionLabel(slug) {
  if (slug === 'radio-off' || slug === 'item-none') return null;
  if (CONDITION_LABELS[slug]) return CONDITION_LABELS[slug];
  const safari = slug.match(/^johto-safari-blocks-(plains|forest|peak|water)-min-(\d+)$/);
  if (safari) {
    const labels = { plains: 'Plains', forest: 'Forest', peak: 'Peak', water: 'Waterside' };
    return `Safari Zone: place at least ${safari[2]} ${labels[safari[1]]} block${safari[2] === '1' ? '' : 's'}`;
  }
  if (slug === 'johto-safari-blocks-inactive') return 'Safari Zone: no blocks required';
  if (slug.startsWith('swarm-')) return `Pokégear swarm: ${titleCaseSlug(slug.slice(6))}`;
  return titleCaseSlug(slug);
}

function itemName(slug) {
  return ITEM_LABELS[slug] ?? titleCaseSlug(slug);
}

function evolutionText(detail) {
  const trigger = detail.trigger?.name;
  const parts = [];
  let itemSlug = detail.item?.name ?? detail.held_item?.name ?? undefined;

  if (trigger === 'level-up') {
    if (detail.min_level != null) parts.push(`at Level ${detail.min_level}`);
    // Friendship evolutions used the 220 threshold throughout Generation IV.
    if (detail.min_happiness != null) parts.push('high friendship (220+)');
    if (detail.min_beauty != null) parts.push(`Beauty ${detail.min_beauty}+`);
    if (detail.time_of_day === 'day') parts.push('during the day');
    if (detail.time_of_day === 'night') parts.push('at night');
    if (detail.known_move?.name) parts.push(`while knowing ${titleCaseSlug(detail.known_move.name)}`);
    if (detail.known_move_type?.name) parts.push(`while knowing a ${titleCaseSlug(detail.known_move_type.name)}-type move`);
    if (detail.location?.name) parts.push(`at ${titleCaseSlug(detail.location.name)}`);
    if (detail.held_item?.name) parts.push(`while holding ${itemName(detail.held_item.name)}`);
    if (detail.relative_physical_stats === 1) parts.push('with Attack higher than Defense');
    if (detail.relative_physical_stats === -1) parts.push('with Defense higher than Attack');
    if (detail.relative_physical_stats === 0) parts.push('with Attack equal to Defense');
    if (detail.party_species?.name) parts.push(`with ${titleCaseSlug(detail.party_species.name)} in the party`);
    if (detail.party_type?.name) parts.push(`with a ${titleCaseSlug(detail.party_type.name)}-type Pokémon in the party`);
    if (detail.gender === 1) parts.push('female only');
    if (detail.gender === 2) parts.push('male only');
    if (parts.length === 1 && detail.min_level != null) {
      return { text: `Reach Level ${detail.min_level}`, itemSlug };
    }
    return { text: parts.length ? `Level up ${parts.join(' · ')}` : 'Level up', itemSlug };
  }

  if (trigger === 'use-item') {
    return { text: `Use ${itemName(detail.item.name)}`, itemSlug: detail.item.name };
  }

  if (trigger === 'trade') {
    if (detail.held_item?.name) {
      return { text: `Trade while holding ${itemName(detail.held_item.name)}`, itemSlug: detail.held_item.name };
    }
    if (detail.trade_species?.name) {
      return { text: `Trade for ${titleCaseSlug(detail.trade_species.name)}`, itemSlug };
    }
    return { text: 'Trade', itemSlug };
  }

  if (trigger === 'shed') return { text: 'Have an empty party slot and a spare Poké Ball when Nincada reaches Level 20', itemSlug };
  if (trigger === 'spin') return { text: 'Spin with the required Sweet held', itemSlug };
  return { text: titleCaseSlug(trigger ?? 'Special evolution'), itemSlug };
}

function flattenEvolutionChain(chain) {
  const edges = [];
  function visit(node) {
    for (const child of node.evolves_to ?? []) {
      const to = Number(child.species.url.match(/\/(\d+)\/$/)?.[1]);
      const from = Number(node.species.url.match(/\/(\d+)\/$/)?.[1]);
      for (const detail of child.evolution_details ?? []) {
        // PokeAPI stores the current evolution alternatives, not a separate set
        // per generation. Remove later shortcuts so this guide reflects Gen IV.
        const location = detail.location?.name;
        if (location && !['mt-coronet', 'eterna-forest', 'sinnoh-route-217'].includes(location)) continue;
        if (detail.trigger?.name === 'use-item' && (
          detail.item?.name === 'ice-stone' ||
          detail.item?.name === 'galarica-cuff' ||
          detail.item?.name === 'galarica-wreath' ||
          (to === 101 && detail.item?.name === 'leaf-stone') ||
          (to === 470 && detail.item?.name === 'leaf-stone') ||
          (to === 471 && detail.item?.name === 'ice-stone') ||
          ([462, 476].includes(to) && detail.item?.name === 'thunder-stone')
        )) continue;
        if (detail.trigger?.name === 'trade' && detail.held_item?.name === 'prism-scale') continue;
        const method = evolutionText(detail);
        edges.push({ from, to, ...method });
      }
      visit(child);
    }
  }
  visit(chain);
  const unique = new Map();
  for (const edge of edges) unique.set(`${edge.from}:${edge.to}:${edge.text}:${edge.itemSlug ?? ''}`, edge);
  return [...unique.values()];
}

function normalizeEncounter(areaName, detail) {
  const conditionSlugs = detail.condition_values.map(value => value.name);
  const displayConditions = conditionSlugs.map(conditionLabel).filter(Boolean);
  return {
    type: ['gift', 'gift-egg'].includes(detail.method.name)
      ? 'gift'
      : detail.method.name === 'static' || detail.method.name === 'pokeflute' || detail.method.name === 'squirt-bottle'
        ? 'static'
        : detail.method.name === 'roaming'
          ? 'roaming'
          : 'wild',
    area: areaName,
    method: METHOD_LABELS[detail.method.name] ?? titleCaseSlug(detail.method.name),
    minLevel: detail.min_level,
    maxLevel: detail.max_level,
    chance: detail.chance,
    conditions: displayConditions,
    _conditionSlugs: conditionSlugs.filter(slug => slug !== 'radio-off' && slug !== 'item-none').sort(),
  };
}

function aggregateEncounters(encounters) {
  const grouped = new Map();
  for (const encounter of encounters) {
    const key = [
      encounter.type,
      encounter.area,
      encounter.method,
      encounter._conditionSlugs.join('|'),
    ].join('::');
    const previous = grouped.get(key);
    if (previous) {
      previous.chance += encounter.chance;
      previous.minLevel = Math.min(previous.minLevel, encounter.minLevel);
      previous.maxLevel = Math.max(previous.maxLevel, encounter.maxLevel);
    }
    else grouped.set(key, { ...encounter });
  }

  const aggregate = [...grouped.values()];
  const timeSlugs = ['time-morning', 'time-day', 'time-night'];
  const expanded = [];
  const consumed = new Set();
  for (const base of aggregate) {
    if (base.type !== 'wild' || base._conditionSlugs.some(slug => timeSlugs.includes(slug))) continue;
    const peers = aggregate.filter(peer => {
      if (peer === base || peer.type !== base.type || peer.area !== base.area || peer.method !== base.method) return false;
      const peerNonTime = peer._conditionSlugs.filter(slug => !timeSlugs.includes(slug));
      return peer._conditionSlugs.some(slug => timeSlugs.includes(slug))
        && peerNonTime.join('|') === base._conditionSlugs.join('|');
    });
    if (!peers.length) continue;

    consumed.add(base);
    for (const time of timeSlugs) {
      const peer = peers.find(candidate => candidate._conditionSlugs.includes(time));
      if (peer) consumed.add(peer);
      expanded.push({
        ...base,
        chance: base.chance + (peer?.chance ?? 0),
        minLevel: peer ? Math.min(base.minLevel, peer.minLevel) : base.minLevel,
        maxLevel: peer ? Math.max(base.maxLevel, peer.maxLevel) : base.maxLevel,
        conditions: [...base.conditions, conditionLabel(time)],
        _conditionSlugs: [...base._conditionSlugs, time].sort(),
      });
    }
  }

  return [...aggregate.filter(encounter => !consumed.has(encounter)), ...expanded]
    .map(({ _conditionSlugs, minLevel, maxLevel, ...encounter }) => ({
      ...encounter,
      levels: minLevel === maxLevel ? String(minLevel) : `${minLevel}–${maxLevel}`,
      chance: encounter.type === 'wild' || encounter.type === 'roaming'
        ? `${encounter.chance}%`
        : undefined,
    }))
    .sort((a, b) => a.area.localeCompare(b.area) || a.method.localeCompare(b.method) || a.levels.localeCompare(b.levels));
}

async function main() {
  const numbers = Array.from({ length: 151 }, (_, index) => index + 1);
  const pokemon = await mapLimit(numbers, 10, async number => {
    const [species, encounters] = await Promise.all([
      fetchJson(`${API}/pokemon-species/${number}`),
      fetchJson(`${API}/pokemon/${number}/encounters`),
    ]);
    return { number, species, encounters };
  });

  const areaUrls = new Set();
  const evolutionUrls = new Set();
  for (const entry of pokemon) {
    evolutionUrls.add(entry.species.evolution_chain.url);
    for (const area of entry.encounters) {
      if (area.version_details.some(version => VERSIONS.includes(version.version.name))) {
        areaUrls.add(area.location_area.url);
      }
    }
  }

  const areaDetails = await mapLimit([...areaUrls], 10, fetchJson);
  const areaNames = new Map(areaDetails.map(area => {
    const english = area.names.find(name => name.language.name === 'en')?.name;
    const display = (english || titleCaseSlug(area.name)).replace(/^Road (\d+)/, 'Route $1');
    return [area.name, display];
  }));

  const evolutionChains = await mapLimit([...evolutionUrls], 8, fetchJson);
  const evolutionEdges = evolutionChains.flatMap(chain => flattenEvolutionChain(chain.chain));
  const validEdges = evolutionEdges.filter(edge => edge.from <= 493 && edge.to <= 493);

  const output = {};
  for (const entry of pokemon) {
    const versions = {};
    for (const version of VERSIONS) {
      const raw = [];
      for (const area of entry.encounters) {
        const versionDetail = area.version_details.find(detail => detail.version.name === version);
        if (!versionDetail) continue;
        // This PokeAPI row is an internal duplicate of the National Park's
        // ordinary bug table, not an actual named area players can visit.
        if (area.location_area.name.startsWith('unknown-')) continue;
        const areaName = areaNames.get(area.location_area.name) ?? titleCaseSlug(area.location_area.name);
        for (const detail of versionDetail.encounter_details) raw.push(normalizeEncounter(areaName, detail));
      }
      const methods = aggregateEncounters(raw);
      // Gift/static records occasionally contain an unqualified duplicate of
      // the same scripted encounter. Prefer the row that states the unlock.
      versions[version] = methods.filter(method => !(
        ['gift', 'static'].includes(method.type)
        && method.conditions.length === 0
        && methods.some(other => other !== method
          && other.type === method.type
          && other.area === method.area
          && other.method === method.method
          && other.levels === method.levels
          && other.conditions.length > 0)
      ));
    }

    const evolvesFrom = validEdges.filter(edge => edge.to === entry.number);
    const evolvesTo = validEdges.filter(edge => edge.from === entry.number);
    output[entry.number] = {
      name: entry.species.names.find(name => name.language.name === 'en')?.name ?? titleCaseSlug(entry.species.name),
      versions,
      evolvesFrom,
      evolvesTo,
    };
  }

  // PokeAPI correctly has no ordinary encounter for Mew; preserve the official
  // Gen IV distribution as a clearly-labelled historical event route.
  for (const version of VERSIONS) {
    output[151].versions[version].push({
      type: 'event',
      area: 'Nintendo Wi-Fi Connection distribution',
      method: 'Mystery Gift (historical event)',
      levels: '5',
      conditions: ['10th Anniversary Mew: Japan Nov. 11–23, 2009 and Jan. 29–Feb. 11, 2010; North America/PAL Oct. 15–30, 2010; official Nintendo Wi-Fi Connection service is no longer available'],
    });
  }

  const source = `/**
 * AUTO-GENERATED by scripts/build-hgss-kanto-data.mjs.
 * Sources: https://pokeapi.co/docs/v2#pokemon-location-areas and
 * https://pokeapi.co/docs/v2#evolution-section (retrieved ${new Date().toISOString().slice(0, 10)}).
 * National Dex 001-151; HeartGold and SoulSilver only. Do not hand-edit.
 */

export type HgssVersion = 'heartgold' | 'soulsilver';
export type HgssAcquisitionType = 'wild' | 'gift' | 'static' | 'roaming' | 'event';

export interface HgssAcquisitionMethod {
  type: HgssAcquisitionType;
  area: string;
  method: string;
  levels?: string;
  chance?: string;
  conditions: string[];
}

export interface HgssEvolutionPath {
  from: number;
  to: number;
  text: string;
  itemSlug?: string;
}

export interface HgssKantoEntry {
  name: string;
  versions: Record<HgssVersion, HgssAcquisitionMethod[]>;
  evolvesFrom: HgssEvolutionPath[];
  evolvesTo: HgssEvolutionPath[];
}

export const HGSS_KANTO_DATA: Record<number, HgssKantoEntry> = ${JSON.stringify(output, null, 2)};
`;

  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, source);
  const methodNames = new Set(Object.values(output).flatMap(entry => VERSIONS.flatMap(version => entry.versions[version].map(method => method.method))));
  console.log(`Wrote ${OUT}`);
  console.log(`Species: ${Object.keys(output).length}; encounter labels: ${[...methodNames].sort().join(', ')}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
