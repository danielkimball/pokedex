/**
 * React hooks for IndexedDB data access.
 */

import { useState, useEffect, useCallback } from 'react';
import { getAllSaves } from './save-store';
import { getAllRegistryEntries } from './registry-store';
import { getPokemonBySave } from './pokemon-store';
import type { SaveRecord, RegistryEntry, PokemonRecord } from './schema';

export function useSaves() {
  const [saves, setSaves] = useState<SaveRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await getAllSaves();
    setSaves(data);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { saves, loading, refresh };
}

export function useRegistry() {
  const [entries, setEntries] = useState<RegistryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await getAllRegistryEntries();
    setEntries(data);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const caughtCount = entries.filter(e => e.caught).length;
  const registryMap = new Map(entries.map(e => [e.species, e]));

  return { entries, caughtCount, registryMap, loading, refresh };
}

export function useSavePokemon(saveId: string | null) {
  const [pokemon, setPokemon] = useState<PokemonRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!saveId) { setPokemon([]); return; }
    setLoading(true);
    const data = await getPokemonBySave(saveId);
    setPokemon(data);
    setLoading(false);
  }, [saveId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { pokemon, loading, refresh };
}
