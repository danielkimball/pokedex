import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useAppStore } from '../../state/store';
import { SPECIES } from '../../core/constants/species';
import { TYPES, SPECIES_TYPES } from '../../core/constants/types';
import { EVOLUTIONS } from '../../core/constants/evolutions';
import { LOCATIONS } from '../../core/constants/locations';
import { NATURES, NATURE_EFFECTS } from '../../core/constants/natures';
import { MOVES } from '../../core/constants/moves';
import { ABILITIES } from '../../core/constants/abilities';
import { getItemName } from '../../core/constants/items';
import { getPokemonBySpecies } from '../../db/pokemon-store';
import type { PokemonRecord } from '../../db/schema';
import { TypeBadge } from '../ui/TypeBadge';
import { TcgCard } from '../ui/TcgCard';
import { getGender } from '../../core/utils/gender';
import { ORIGIN_GAMES } from '../../core/constants/origin-games';
import { spriteUrl, defaultSpriteUrl, monSpriteUrl, gen1CardArt, gameLabel, genLabel } from '../../core/constants/games';
import type { PokedexShellContext } from '../layout/PokedexShell';

// Species-level sprite (generation-neutral) for the dex identity + evolution chain.
const SPRITE_URL = (n: number) => defaultSpriteUrl(n);

/** Fall back to the generation-neutral sprite if a versioned sprite 404s. */
function spriteFallback(e: React.SyntheticEvent<HTMLImageElement>, dex: number) {
  const img = e.currentTarget;
  const fallback = defaultSpriteUrl(dex);
  if (img.src !== fallback) img.src = fallback;
}

function getTypesForSpecies(speciesIndex: number): string[] {
  const pair = SPECIES_TYPES[speciesIndex];
  if (!pair) return [];
  const result: string[] = [];
  if (pair[0] >= 0) result.push(TYPES[pair[0]]);
  if (pair[1] >= 0) result.push(TYPES[pair[1]]);
  return result;
}

/** Lightened type colors for card backgrounds — matches TCG Base Set card feel */
const CARD_BG: Record<string, string> = {
  Normal: '#D4D0AC',
  Fighting: '#D4A088',
  Flying: '#C8B8F0',
  Poison: '#C890C8',
  Ground: '#E8D8A0',
  Rock: '#D4C488',
  Bug: '#C8D870',
  Ghost: '#B898C8',
  Steel: '#D8D8E8',
  Fire: '#F0C0A0',
  Water: '#A8C8F0',
  Grass: '#B0D898',
  Electric: '#F8E878',
  Psychic: '#F0A8B8',
  Ice: '#B8E0E0',
  Dragon: '#B098E8',
  Dark: '#B0A898',
  '???': '#A8C8B8',
};

export function DexEntryScreen() {
  const { number } = useParams<{ number: string }>();
  const navigate = useNavigate();
  const registryMap = useAppStore(s => s.registryMap);
  const saves = useAppStore(s => s.saves);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [locationsOpen, setLocationsOpen] = useState(false);
  const [evoOpen, setEvoOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(true);
  const [pokemonRecords, setPokemonRecords] = useState<PokemonRecord[]>([]);
  const [cardIndex, setCardIndex] = useState(0);
  const { setActivePanel, setSidePanel } = useOutletContext<PokedexShellContext>();

  // ── draggable card track ──────────────────────────────────────────────
  const cardTrackRef = useRef<HTMLDivElement>(null);
  const dragStartXRef = useRef(0);
  const dragStartYRef = useRef(0);
  const draggingRef = useRef(false);
  // null = undecided, 'h' = horizontal swipe, 'v' = vertical scroll
  const gestureLockRef = useRef<'h' | 'v' | null>(null);

  // After cardIndex changes, reset the track to center (after React re-renders new content)
  useEffect(() => {
    requestAnimationFrame(() => {
      if (cardTrackRef.current) {
        cardTrackRef.current.style.transition = 'none';
        cardTrackRef.current.style.transform = 'translateX(-100%)';
      }
    });
  }, [cardIndex]);

  const slideToCard = useCallback((direction: 'next' | 'prev', count: number) => {
    const track = cardTrackRef.current;
    if (!track || count <= 1) return;
    track.style.transition = 'transform 0.32s cubic-bezier(0.22, 0.61, 0.36, 1)';
    track.style.transform = direction === 'next' ? 'translateX(-200%)' : 'translateX(0%)';
    track.addEventListener('transitionend', () => {
      setCardIndex(prev => direction === 'next' ? (prev + 1) % count : (prev - 1 + count) % count);
    }, { once: true });
  }, []);

  const handleTrackTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartXRef.current = e.touches[0].clientX;
    dragStartYRef.current = e.touches[0].clientY;
    draggingRef.current = true;
    gestureLockRef.current = null; // reset direction on each new touch
  }, []);

  const handleTrackTouchMove = useCallback((e: React.TouchEvent) => {
    if (!draggingRef.current || !cardTrackRef.current) return;
    const dx = e.touches[0].clientX - dragStartXRef.current;
    const dy = e.touches[0].clientY - dragStartYRef.current;

    // Lock gesture direction on first significant movement
    if (gestureLockRef.current === null) {
      if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return; // not moved enough yet
      gestureLockRef.current = Math.abs(dx) >= Math.abs(dy) ? 'h' : 'v';
      if (gestureLockRef.current === 'h') {
        cardTrackRef.current.style.transition = 'none';
      }
    }

    if (gestureLockRef.current !== 'h') return; // vertical scroll — don't touch the track
    cardTrackRef.current.style.transform = `translateX(calc(-100% + ${dx}px))`;
  }, []);

  const handleTrackTouchEnd = useCallback((e: React.TouchEvent, count: number) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (gestureLockRef.current !== 'h') return; // was a scroll, nothing to do
    const dx = e.changedTouches[0].clientX - dragStartXRef.current;
    if (Math.abs(dx) > 55 && count > 1) {
      slideToCard(dx < 0 ? 'next' : 'prev', count);
    } else {
      if (cardTrackRef.current) {
        cardTrackRef.current.style.transition = 'transform 0.25s cubic-bezier(0.22, 0.61, 0.36, 1)';
        cardTrackRef.current.style.transform = 'translateX(-100%)';
      }
    }
  }, [slideToCard]);

  const dexNum = Number(number);

  useEffect(() => {
    let cancelled = false;
    const recordsPromise = dexNum >= 1 && dexNum <= 493
      ? getPokemonBySpecies(dexNum)
      : Promise.resolve([]);

    recordsPromise.then(records => {
      if (cancelled) return;
      setCardIndex(0);
      setActivePanel(0);
      setPokemonRecords(records);
    });

    return () => { cancelled = true; };
  }, [dexNum, setActivePanel]);

  const name = SPECIES[dexNum] || '???';
  const types = getTypesForSpecies(dexNum);
  const registry = registryMap.get(dexNum);
  const isCaught = registry?.caught ?? false;
  const saveNameMap = new Map(saves.map(sv => [sv.id, `${sv.trainerName} (${gameLabel(sv)})`]));

  // Evolution data
  const evoInfo = EVOLUTIONS?.[dexNum];
  const chain: number[] = evoInfo?.chain ?? [dexNum];
  const evolvesTo: { species: number; method: string }[] | null = evoInfo?.evolvesTo ?? null;
  const evoMethod: string | null = evoInfo?.method ?? null;

  // Location data
  const locInfo = LOCATIONS?.[dexNum];

  // Game location entries
  const gameLocations: { game: string; locs: string[] }[] = [];
  if (locInfo) {
    if (locInfo.heartgold?.length) gameLocations.push({ game: 'HeartGold', locs: locInfo.heartgold });
    if (locInfo.soulsilver?.length) gameLocations.push({ game: 'SoulSilver', locs: locInfo.soulsilver });
    if (locInfo.platinum?.length) gameLocations.push({ game: 'Platinum', locs: locInfo.platinum });
    if (locInfo.diamond?.length) gameLocations.push({ game: 'Diamond', locs: locInfo.diamond });
    if (locInfo.pearl?.length) gameLocations.push({ game: 'Pearl', locs: locInfo.pearl });
  }

  const hgLocations = locInfo?.heartgold ?? [];
  const ssLocations = locInfo?.soulsilver ?? [];
  const primaryMethod = evoMethod ?? hgLocations[0] ?? ssLocations[0] ?? gameLocations[0]?.locs[0] ?? 'No location data imported yet';
  const selectedRecord = pokemonRecords[cardIndex] ?? pokemonRecords[0] ?? null;
  const selectedSaveName = selectedRecord ? saveNameMap.get(selectedRecord.saveId) : null;
  const selectedOriginGame = selectedRecord?.originGame != null
    ? ORIGIN_GAMES[selectedRecord.originGame]
    : selectedSaveName?.match(/\(([^)]+)\)$/)?.[1] ?? null;
  const selectedStorage = selectedRecord
    ? selectedRecord.location === 'party'
      ? `Party slot ${selectedRecord.slotIndex + 1}`
      : `Box ${selectedRecord.containerIndex + 1}, slot ${selectedRecord.slotIndex + 1}`
    : 'No saved Pokemon found';
  const factGame = selectedOriginGame || 'this save';

  useEffect(() => {
    setSidePanel(
      <div style={sx.sidePanel}>
        <div style={sx.panelHeader}>
          <div>
            <div style={sx.panelKicker}>DATA PANEL</div>
            <div style={sx.panelTitle}>{name}</div>
          </div>
          <button style={sx.returnBtn} onClick={() => setActivePanel(0)}>MAIN</button>
        </div>

        <div style={sx.blackDisplay}>
          <div style={sx.blackDisplayCut}>
            <img
              src={selectedRecord ? monSpriteUrl(selectedRecord) : spriteUrl(dexNum)}
              alt={name}
              style={sx.scopeSprite}
              onError={(e) => spriteFallback(e, dexNum)}
            />
            <div style={sx.displayList}>
              <div style={sx.displayItem}><span style={sx.displayLabel}>Current</span><strong style={sx.displayValue}>{selectedStorage}</strong></div>
              <div style={sx.displayItem}><span style={sx.displayLabel}>Caught</span><strong style={sx.displayValue}>{selectedRecord ? 'Met location not parsed' : 'Unknown'}</strong></div>
              <div style={sx.displayItem}><span style={sx.displayLabel}>OT</span><strong style={sx.displayValue}>{selectedRecord?.otName || 'Unknown'}</strong></div>
              <div style={sx.displayItem}><span style={sx.displayLabel}>Origin</span><strong style={sx.displayValue}>{selectedOriginGame || 'Unknown'}</strong></div>
              <div style={sx.displayItem}><span style={sx.displayLabel}>Save</span><strong style={sx.displayValue}>{selectedSaveName || 'No save linked'}</strong></div>
            </div>
          </div>
        </div>

        <div style={sx.statMatrix}>
          <div style={sx.statRowLabel}>IV</div>
          {(['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as const).map(stat => (
            <div key={`iv-${stat}`} style={sx.statCell}>
              <span>{stat.toUpperCase()}</span>
              <strong>{selectedRecord ? selectedRecord.ivs[stat] : '--'}</strong>
            </div>
          ))}
          <div style={sx.statRowLabel}>EV</div>
          {(['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as const).map(stat => (
            <div key={`ev-${stat}`} style={sx.statCell}>
              <span>{stat.toUpperCase()}</span>
              <strong>{selectedRecord ? selectedRecord.evs[stat] : '--'}</strong>
            </div>
          ))}
        </div>

        <div style={sx.deviceButtons}>
          <div style={sx.whiteKey} />
          <div style={sx.whiteKey} />
          <div style={sx.yellowKey} />
        </div>

        <div style={sx.factPanel}>
          <div style={sx.blockTitle}>Field Notes</div>
          <p style={sx.factText}>
            Placeholder field note for {name} from {factGame}. Later this can use version-specific flavor text,
            encounter method notes, or route memories if the save parser exposes met-location data.
          </p>
          <p style={sx.factText}>
            Catch target: {primaryMethod}
          </p>
        </div>

        <div style={sx.swipeHint}>Swipe right to return</div>
      </div>
    );

    return () => setSidePanel(null);
  }, [
    cardIndex,
    dexNum,
    factGame,
    name,
    pokemonRecords,
    primaryMethod,
    selectedOriginGame,
    selectedRecord,
    selectedSaveName,
    selectedStorage,
    setActivePanel,
    setSidePanel,
  ]);

  if (!dexNum || dexNum < 1 || dexNum > 493) {
    return (
      <div style={s.container}>
        <div style={s.header}>
          <button style={s.navBtn} onClick={() => navigate('/dex')}>{'<'} BACK</button>
        </div>
        <div style={s.notFound}>Invalid Pokedex entry.</div>
      </div>
    );
  }

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <button style={s.navBtn} onClick={() => navigate('/dex')}>{'<'} BACK</button>
        <div style={s.navRow}>
          <button
            style={s.navBtn}
            onClick={() => navigate(`/dex/${Math.max(1, dexNum - 1)}`)}
            disabled={dexNum <= 1}
          >{'<'}</button>
          <button
            style={s.navBtn}
            onClick={() => navigate(`/dex/${Math.min(493, dexNum + 1)}`)}
            disabled={dexNum >= 493}
          >{'>'}</button>
        </div>
      </div>

      {/* Scrollable content */}
      <div ref={scrollRef} style={s.scrollArea}>
        {/* Sprite + identity */}
        <div style={s.spriteSection}>
          <img src={SPRITE_URL(dexNum)} alt={name} style={s.sprite} />
          <div>
            <div style={s.dexNumber}>#{String(dexNum).padStart(3, '0')}</div>
            <div style={s.pokemonName}>{name}</div>
            <div style={s.typeRow}>
              {types.map(t => <TypeBadge key={t} type={t} />)}
            </div>
          </div>
          <span style={{
            ...s.caughtBadge,
            background: isCaught ? 'rgba(40,120,64,0.12)' : 'rgba(204,0,0,0.08)',
            borderColor: isCaught ? '#287840' : '#cc000066',
            color: isCaught ? '#287840' : '#9b0014',
          }}>
            {isCaught ? 'CAUGHT' : 'MISSING'}
          </span>
        </div>

        {/* Status detail */}
        {isCaught && registry?.firstCaughtDate && (
          <div style={s.infoLine}>
            Registered: {new Date(registry.firstCaughtDate).toLocaleDateString()}
          </div>
        )}

        {/* Pokemon stats carousel */}
        {isCaught && pokemonRecords.length > 0 && (() => {
          if (!pokemonRecords[cardIndex]) return null;
          const total = pokemonRecords.length;

          return (
            <div style={st.cardSection}>
              <div
                style={s.sectionToggle}
                onClick={() => setStatsOpen(!statsOpen)}
              >
                <span style={s.sectionTitle}>YOUR POKEMON ({total})</span>
                <span style={s.toggleArrow}>{statsOpen ? '\u25BC' : '\u25B6'}</span>
              </div>
              {statsOpen && <>
                {/* Carousel nav */}
                {total > 1 && (
                  <div style={st.carouselNav}>
                    <button style={st.carouselBtn} onClick={() => slideToCard('prev', total)}>{'\u25C0'}</button>
                    <span style={st.carouselCounter}>{cardIndex + 1} / {total}</span>
                    <button style={st.carouselBtn} onClick={() => slideToCard('next', total)}>{'\u25B6'}</button>
                  </div>
                )}

                {/* 3-card draggable track — renders prev/current/next for live drag reveal */}
                {(() => {
                  const primaryType = types[0] || 'Normal';
                  const cardBg = CARD_BG[primaryType] || '#D4D0AC';

                  const renderCard = (record: PokemonRecord) => {
                    // All Gen 1-4 records render through TcgCard (Gen 1 uses real PNG
                    // templates; Gen 2/3/4 use a CSS placeholder until real templates land).
                    if (record.generation && record.generation >= 1 && record.generation <= 4) {
                      return <TcgCard record={record} />;
                    }
                    const ne = NATURE_EFFECTS[record.nature];
                    const nl = NATURES[record.nature] || '???';
                    const natureLabel = ne?.increased ? `${nl} (+${ne.increased} -${ne.decreased})` : nl;
                    const abilityName = ABILITIES[record.ability] || `Ability #${record.ability}`;
                    const heldItem = getItemName(record.heldItem);
                    const moves = record.moves.filter(m => m !== 0).map(m => MOVES[m] || `Move #${m}`);
                    const saveName = saveNameMap.get(record.saveId) || 'Unknown Save';
                    const loc = record.location === 'party'
                      ? `Party slot ${record.slotIndex + 1}`
                      : `Box ${record.containerIndex + 1}, slot ${record.slotIndex + 1}`;
                    const gender = getGender(record.species, record.pid);
                    const originGame = record.originGame != null ? ORIGIN_GAMES[record.originGame] : null;
                    const tcgArt = gen1CardArt(record.species, record.generation);

                    return (
                      <div style={{ ...st.cardOuter, background: cardBg }}>
                        <div style={st.titleRow}>
                          {gender === 'male' && <span style={st.genderMale}>{'\u2642'}</span>}
                          {gender === 'female' && <span style={st.genderFemale}>{'\u2640'}</span>}
                          <span style={st.cardName}>{record.nickname !== name ? record.nickname : name}</span>
                          {record.isShiny && <span style={st.shiny}>{'\u2605'}</span>}
                          <span style={st.hpLevel}>Lv.{record.level}</span>
                          {types.map(t => <TypeBadge key={t} type={t} />)}
                        </div>
                        <div style={tcgArt ? st.artFrameTcg : st.artFrame}>
                          {tcgArt ? (
                            <img
                              src={tcgArt}
                              alt={name}
                              style={st.tcgArt}
                              onError={(e) => { e.currentTarget.src = monSpriteUrl(record); }}
                            />
                          ) : (
                            <img
                              src={monSpriteUrl(record)}
                              alt={name}
                              style={st.cardSprite}
                              onError={(e) => spriteFallback(e, dexNum)}
                            />
                          )}
                        </div>
                        <div style={st.infoLine}>
                          OT: {record.otName}{originGame ? ` (${originGame})` : ''} {'\u00B7'} {natureLabel} {'\u00B7'} {abilityName}
                        </div>
                        <div style={st.movesArea}>
                          <div style={st.movesGrid}>
                            {[0, 1, 2, 3].map(i => (
                              <div key={i} style={st.moveCell}>
                                {moves[i] ? <span style={st.moveName}>{moves[i]}</span> : <span style={st.moveEmpty}>--</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div style={st.thickDivider} />
                        <div style={st.statsArea}>
                          {(['ivs', 'evs'] as const).map(kind => (
                            <div key={kind} style={kind === 'evs' ? { ...st.statsRow, marginTop: '4px' } : st.statsRow}>
                              <span style={st.statsLabel}>{kind.toUpperCase()}</span>
                              <div style={st.statGrid}>
                                {(['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as const).map(stat => (
                                  <div key={stat} style={st.statCell}>
                                    <div style={st.statHead}>{stat.toUpperCase()}</div>
                                    <div style={{
                                      ...st.statVal,
                                      color: kind === 'ivs' && record.ivs[stat] === 31 ? '#B8860B' : record[kind][stat] > 0 ? '#333' : '#bbb',
                                      fontWeight: kind === 'ivs' && record.ivs[stat] === 31 ? 'bold' as const : 'normal' as const,
                                    }}>{record[kind][stat]}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div style={st.bottomBar}>
                          <div style={st.bottomCell}>
                            <div style={st.bottomLabel}>item</div>
                            <div style={st.bottomValue}>{heldItem}</div>
                          </div>
                          <div style={st.bottomCell}>
                            <div style={st.bottomLabel}>location</div>
                            <div style={st.bottomValue}>{loc}</div>
                          </div>
                        </div>
                        <div style={st.flavorBar}>
                          #{String(dexNum).padStart(3, '0')} {'\u00B7'} {saveName}
                          {record.generation ? ` \u00B7 ${genLabel(record.generation)}` : ''}
                        </div>
                      </div>
                    );
                  };

                  return (
                    <div style={{ overflow: 'hidden' }} data-card-carousel="true">
                      <div
                        ref={cardTrackRef}
                        style={{ display: 'flex', transform: 'translateX(-100%)', willChange: 'transform' }}
                        onTouchStart={handleTrackTouchStart}
                        onTouchMove={handleTrackTouchMove}
                        onTouchEnd={(e) => handleTrackTouchEnd(e, total)}
                      >
                        <div style={{ flex: '0 0 100%' }}>
                          {total > 1 ? renderCard(pokemonRecords[(cardIndex - 1 + total) % total]) : null}
                        </div>
                        <div style={{ flex: '0 0 100%' }}>
                          {renderCard(pokemonRecords[cardIndex])}
                        </div>
                        <div style={{ flex: '0 0 100%' }}>
                          {total > 1 ? renderCard(pokemonRecords[(cardIndex + 1) % total]) : null}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Dot indicators */}
                {total > 1 && (
                  <div style={st.dots}>
                    {pokemonRecords.map((_, i) => (
                      <span
                        key={i}
                        style={i === cardIndex ? st.dotActive : st.dot}
                        onClick={() => setCardIndex(i)}
                      />
                    ))}
                  </div>
                )}
              </>}
            </div>
          );
        })()}

        {/* Evolution chain */}
        {chain.length > 1 && (
          <div style={s.section}>
            <div
              style={s.sectionToggle}
              onClick={() => setEvoOpen(!evoOpen)}
            >
              <span style={s.sectionTitle}>EVOLUTION</span>
              <span style={s.toggleArrow}>{evoOpen ? '\u25BC' : '\u25B6'}</span>
            </div>
            {evoOpen && <><div style={s.evoChain}>
              {chain.map((speciesNum, idx) => {
                const evoData = EVOLUTIONS?.[speciesNum];
                const method = evoData?.method;
                const isCurrentPokemon = speciesNum === dexNum;
                const speciesName = SPECIES[speciesNum] || '???';
                const speciesCaught = registryMap.get(speciesNum)?.caught ?? false;
                return (
                  <div key={speciesNum} style={s.evoStep}>
                    {idx > 0 && method && (
                      <div style={s.evoMethod}>{method}</div>
                    )}
                    {idx > 0 && !method && (
                      <div style={s.evoArrow}>{'>>>'}</div>
                    )}
                    <div
                      style={{
                        ...s.evoCard,
                        borderColor: isCurrentPokemon ? '#cc0000' : '#22222233',
                        background: isCurrentPokemon ? 'rgba(204,0,0,0.08)' : 'transparent',
                        cursor: isCurrentPokemon ? 'default' : 'pointer',
                      }}
                      onClick={() => {
                        if (!isCurrentPokemon) {
                          navigate(`/dex/${speciesNum}`);
                          scrollRef.current?.scrollTo(0, 0);
                        }
                      }}
                    >
                      <img src={SPRITE_URL(speciesNum)} alt={speciesName} style={s.evoSprite} />
                      <span style={{
                        ...s.evoName,
                        color: speciesCaught ? '#111111' : '#777777',
                      }}>
                        {speciesName}
                      </span>
                      <span style={s.evoDot}>{speciesCaught ? '\u25CF' : '\u25CB'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Branching evolutions (Eevee etc.) */}
            {evolvesTo && evolvesTo.length > 1 && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ fontSize: '10px', color: '#555555', marginBottom: '4px' }}>Evolves into:</div>
                {evolvesTo.map(evo => {
                  const evoName = SPECIES[evo.species] || '???';
                  const evoCaught = registryMap.get(evo.species)?.caught ?? false;
                  return (
                    <div
                      key={evo.species}
                      style={s.branchRow}
                      onClick={() => { navigate(`/dex/${evo.species}`); scrollRef.current?.scrollTo(0, 0); }}
                    >
                      <img src={SPRITE_URL(evo.species)} alt={evoName} style={s.branchSprite} />
                      <span style={{ fontSize: '11px', color: evoCaught ? '#111111' : '#666666', flex: 1 }}>
                        {evoName}
                      </span>
                      <span style={{ fontSize: '10px', color: '#777777' }}>{evo.method}</span>
                    </div>
                  );
                })}
              </div>
            )}
            </>}
          </div>
        )}

        {/* Location */}
        {(gameLocations.length > 0 || evoMethod) && (
          <div style={s.section}>
            <div
              style={s.sectionToggle}
              onClick={() => setLocationsOpen(!locationsOpen)}
            >
              <span style={s.sectionTitle}>LOCATION</span>
              <span style={s.toggleArrow}>{locationsOpen ? '\u25BC' : '\u25B6'}</span>
            </div>
            {locationsOpen && <>
              {evoMethod && (
                <div style={{ marginBottom: '6px' }}>
                  <div style={s.gameName}>Evolution</div>
                  <div style={s.locationLine}>{evoMethod} from {SPECIES[chain[chain.indexOf(dexNum) - 1]] || '???'}</div>
                </div>
              )}
              {gameLocations.map(gl => (
                <div key={gl.game} style={{ marginBottom: '6px' }}>
                  <div style={s.gameName}>{gl.game}</div>
                  {gl.locs.map((loc, i) => (
                    <div key={i} style={s.locationLine}>{loc}</div>
                  ))}
                </div>
              ))}
            </>}
          </div>
        )}

        {/* If no game location data and not caught */}
        {gameLocations.length === 0 && !LOCATIONS && !isCaught && (
          <div style={s.section}>
            <div style={{ fontSize: '11px', color: '#777777', textAlign: 'center' }}>
              Import a save file containing this Pokemon to register it.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    fontFamily: "inherit",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: '6px 10px',
    borderBottom: '1px solid #22222222',
    flexShrink: 0,
  },
  navBtn: {
    background: 'none',
    border: '1px solid #22222233',
    borderRadius: '4px',
    color: '#111111',
    fontSize: '12px',
    fontFamily: "inherit",
    cursor: 'pointer',
    padding: '4px 10px',
  },
  navRow: {
    display: 'flex',
    gap: '6px',
  },
  scrollArea: {
    flex: 1,
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const,
    minHeight: 0,
    padding: '10px',
    WebkitOverflowScrolling: 'touch' as const,
  },
  spriteSection: {
    display: 'flex',
    alignItems: 'center' as const,
    gap: '10px',
    marginBottom: '10px',
  },
  sprite: {
    width: '80px',
    height: '80px',
    imageRendering: 'pixelated' as const,
    flexShrink: 0,
  },
  dexNumber: {
    fontSize: '11px',
    color: '#666666',
  },
  pokemonName: {
    fontSize: '20px',
    fontWeight: 'bold' as const,
    color: '#111111',
    textShadow: 'none',
  },
  typeRow: {
    display: 'flex',
    gap: '4px',
    marginTop: '4px',
  },
  caughtBadge: {
    marginLeft: 'auto',
    padding: '3px 8px',
    border: '1px solid',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 'bold' as const,
    fontFamily: "inherit",
    alignSelf: 'flex-start' as const,
    flexShrink: 0,
  },
  infoLine: {
    fontSize: '10px',
    color: '#666666',
    marginBottom: '8px',
    paddingLeft: '2px',
  },
  section: {
    padding: '8px',
    border: '1px solid #22222222',
    borderRadius: '4px',
    marginBottom: '8px',
    background: 'rgba(255,255,255,0.35)',
  },
  sectionToggle: {
    display: 'flex',
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    cursor: 'pointer',
    marginBottom: '6px',
    padding: '2px 0',
    userSelect: 'none' as const,
  },
  toggleArrow: {
    fontSize: '8px',
    color: '#555555',
  },
  sectionTitle: {
    fontSize: '10px',
    color: '#555555',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  },
  locRow: {
    display: 'flex',
    justifyContent: 'space-between' as const,
    fontSize: '11px',
    color: '#111111',
    padding: '3px 0',
    borderBottom: '1px solid rgba(0,0,0,0.08)',
  },
  locDetail: {
    color: '#555555',
    fontSize: '10px',
  },
  evoChain: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
    alignItems: 'center' as const,
  },
  evoStep: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    width: '100%',
  },
  evoMethod: {
    fontSize: '9px',
    color: '#666666',
    padding: '2px 0',
    textAlign: 'center' as const,
  },
  evoArrow: {
    fontSize: '10px',
    color: '#999999',
    padding: '1px 0',
  },
  evoCard: {
    display: 'flex',
    alignItems: 'center' as const,
    gap: '8px',
    padding: '4px 8px',
    border: '1px solid',
    borderRadius: '4px',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  evoSprite: {
    width: '32px',
    height: '32px',
    imageRendering: 'pixelated' as const,
    flexShrink: 0,
  },
  evoName: {
    fontSize: '12px',
    flex: 1,
  },
  evoDot: {
    fontSize: '10px',
    color: '#111111',
    flexShrink: 0,
  },
  branchRow: {
    display: 'flex',
    alignItems: 'center' as const,
    gap: '6px',
    padding: '3px 4px',
    borderBottom: '1px solid rgba(0,0,0,0.08)',
    cursor: 'pointer',
  },
  branchSprite: {
    width: '28px',
    height: '28px',
    imageRendering: 'pixelated' as const,
    flexShrink: 0,
  },
  gameName: {
    fontSize: '11px',
    color: '#111111',
    fontWeight: 'bold' as const,
    marginBottom: '2px',
  },
  locationLine: {
    fontSize: '10px',
    color: '#555555',
    padding: '1px 0 1px 8px',
  },
  notFound: {
    textAlign: 'center' as const,
    color: '#555555',
    fontSize: '14px',
    marginTop: '40px',
  },
} as const;

/** Styles for the anime-inspired right-side Pokedex panel */
const sx = {
  sidePanel: {
    height: '100%',
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const,
    padding: '8px',
    background: '#b80018',
    color: '#f4f1e8',
    WebkitOverflowScrolling: 'touch' as const,
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: '7px',
    paddingBottom: '6px',
    borderBottom: '2px solid rgba(49,0,6,0.55)',
  },
  panelKicker: {
    fontSize: '9px',
    color: '#f6d54a',
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
  },
  panelTitle: {
    color: '#f5fbff',
    fontSize: '19px',
    fontWeight: 'bold' as const,
    lineHeight: 1.1,
    textShadow: '0 2px 0 rgba(0,0,0,0.35)',
  },
  returnBtn: {
    color: '#101010',
    background: '#f6d54a',
    border: '2px solid #5d4200',
    borderRadius: '5px',
    fontSize: '11px',
    fontWeight: 'bold' as const,
    padding: '6px 10px',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.45), 0 2px 0 rgba(0,0,0,0.28)',
  },
  blackDisplay: {
    padding: '8px',
    marginBottom: '8px',
    borderRadius: '6px',
    background: '#8f0014',
    border: '3px solid #5c000d',
    boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.12), inset 0 -4px 0 rgba(0,0,0,0.16)',
  },
  blackDisplayCut: {
    minHeight: '132px',
    padding: '8px 10px 18px',
    display: 'flex',
    alignItems: 'center' as const,
    gap: '10px',
    background: 'linear-gradient(135deg, #101013 0%, #101013 72%, transparent 72%)',
    border: '3px solid #3d0009',
    clipPath: 'polygon(0 0, 100% 0, 100% 72%, 84% 100%, 0 100%)',
  },
  scopeSprite: {
    width: '68px',
    height: '68px',
    imageRendering: 'pixelated' as const,
    filter: 'drop-shadow(0 0 8px rgba(126,215,246,0.45))',
    flexShrink: 0,
  },
  displayList: {
    display: 'grid',
    gap: '5px',
    minWidth: 0,
    flex: 1,
  },
  displayItem: {
    display: 'grid',
    gap: '1px',
  },
  displayLabel: {
    color: '#8bdff0',
    fontSize: '8px',
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
  },
  displayValue: {
    color: '#f4f1e8',
    fontSize: '10px',
    lineHeight: 1.15,
  },
  statMatrix: {
    display: 'grid',
    gridTemplateColumns: '22px repeat(6, minmax(0, 1fr))',
    gap: '3px',
    marginBottom: '8px',
  },
  statRowLabel: {
    minHeight: '29px',
    display: 'grid',
    placeItems: 'center',
    color: '#f4f1e8',
    fontSize: '9px',
    fontWeight: 'bold' as const,
    background: '#5c000d',
    border: '2px solid #3d0009',
    borderRadius: '4px',
  },
  statCell: {
    minHeight: '29px',
    padding: '2px 1px',
    background: 'linear-gradient(180deg, #8bdff0 0%, #45abc9 100%)',
    border: '2px solid #255f72',
    borderRadius: '4px',
    color: '#092b34',
    display: 'grid',
    alignContent: 'center' as const,
    gap: '2px',
    fontSize: '8px',
    lineHeight: 1,
    textAlign: 'center' as const,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
  },
  deviceButtons: {
    display: 'flex',
    alignItems: 'center' as const,
    gap: '6px',
    margin: '7px 0 9px',
  },
  whiteKey: {
    width: '42px',
    height: '20px',
    background: '#f4f1e8',
    border: '2px solid #65575a',
    borderRadius: '4px',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 0 rgba(0,0,0,0.25)',
  },
  yellowKey: {
    marginLeft: 'auto',
    width: '31px',
    height: '31px',
    borderRadius: '50%',
    background: 'radial-gradient(circle at 35% 30%, #fff4a0 0%, #f6d54a 45%, #a87600 100%)',
    border: '2px solid #5d4200',
    boxShadow: '0 0 10px rgba(246,213,74,0.45)',
  },
  factPanel: {
    marginBottom: '10px',
    padding: '9px',
    borderRadius: '6px',
    background: 'rgba(22, 7, 10, 0.56)',
    border: '2px solid rgba(246,213,74,0.28)',
  },
  blockTitle: {
    color: '#f6d54a',
    fontSize: '10px',
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
    marginBottom: '6px',
  },
  factText: {
    color: '#f5fbff',
    fontSize: '12px',
    lineHeight: 1.35,
    margin: '0 0 8px',
  },
  swipeHint: {
    color: 'rgba(245,251,255,0.68)',
    fontSize: '10px',
    textAlign: 'center' as const,
    paddingBottom: '4px',
  },
} as const;

/** Styles for the Pokemon TCG-style stats cards */
const st = {
  /* ── Section wrapper — no terminal background behind card ── */
  cardSection: {
    marginBottom: '8px',
  },

  /* ── Carousel controls ── */
  carouselNav: {
    display: 'flex',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: '14px',
    marginBottom: '8px',
  },
  carouselBtn: {
    background: 'none',
    border: '1px solid #C8A82C66',
    borderRadius: '4px',
    color: '#C8A82C',
    fontSize: '14px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    cursor: 'pointer',
    padding: '4px 14px',
    lineHeight: '1.2',
  },
  carouselCounter: {
    fontSize: '11px',
    color: '#C8A82Ccc',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    minWidth: '44px',
    textAlign: 'center' as const,
  },
  dots: {
    display: 'flex',
    justifyContent: 'center' as const,
    gap: '6px',
    marginTop: '10px',
  },
  dot: {
    display: 'inline-block',
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#C8A82C44',
    cursor: 'pointer',
  },
  dotActive: {
    display: 'inline-block',
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#C8A82C',
    cursor: 'pointer',
    boxShadow: '0 0 4px rgba(200,168,44,0.5)',
  },

  /* ── Card outer frame (yellow border + type-colored body) ── */
  cardOuter: {
    border: '4px solid #E8C64E',
    borderRadius: '8px',
    padding: '7px 7px 0',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    boxShadow: '0 3px 9px rgba(0,0,0,0.3)',
    userSelect: 'none' as const,
    touchAction: 'pan-y' as const,
    maxWidth: '264px',
    width: '100%',
    margin: '0 auto',
  },

  /* ── Title row ── */
  titleRow: {
    display: 'flex',
    alignItems: 'center' as const,
    gap: '4px',
    marginBottom: '4px',
    padding: '1px 0',
  },
  cardName: {
    fontSize: '14px',
    fontWeight: 'bold' as const,
    color: '#1a1a1a',
    flex: 1,
    lineHeight: '1.1',
  },
  hpLevel: {
    fontSize: '12px',
    fontWeight: 'bold' as const,
    color: '#1a1a1a',
  },
  genderMale: {
    fontSize: '13px',
    color: '#2968C8',
    fontWeight: 'bold' as const,
    display: 'inline-flex' as const,
    alignItems: 'center' as const,
    lineHeight: '1',
    height: '1em',
  },
  genderFemale: {
    fontSize: '13px',
    color: '#D03068',
    fontWeight: 'bold' as const,
    display: 'inline-flex' as const,
    alignItems: 'center' as const,
    lineHeight: '1',
    height: '1em',
  },
  shiny: {
    fontSize: '13px',
    color: '#C8880C',
  },

  /* ── Art frame (gold-bordered, white bg) ── */
  artFrame: {
    border: '3px solid #C8A82C',
    borderRadius: '3px',
    background: '#fff',
    padding: '10px 6px',
    display: 'flex',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: '3px',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.08)',
  },
  cardSprite: {
    width: '90px',
    height: '90px',
    imageRendering: 'pixelated' as const,
  },
  /* Original TCG illustration fills a landscape art window (its painted scene shows) */
  artFrameTcg: {
    border: '3px solid #C8A82C',
    borderRadius: '3px',
    overflow: 'hidden' as const,
    marginBottom: '3px',
    background: '#000',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.18)',
  },
  tcgArt: {
    width: '100%',
    aspectRatio: '142 / 100',
    objectFit: 'cover' as const,
    display: 'block' as const,
  },

  /* ── Info line below art ── */
  infoLine: {
    fontSize: '9px',
    color: '#555',
    textAlign: 'center' as const,
    padding: '3px 2px',
    fontStyle: 'italic' as const,
    lineHeight: '1.3',
  },

  /* ── Moves area — 2×2 grid like the in-game battle screen ── */
  movesArea: {
    padding: '6px 0 2px',
    borderTop: '1px solid rgba(0,0,0,0.12)',
  },
  movesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '5px',
  },
  moveCell: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 10px',
    background: 'rgba(0,0,0,0.07)',
    borderRadius: '5px',
    minHeight: '38px',
  },
  moveName: {
    fontSize: '12px',
    fontWeight: 'bold' as const,
    color: '#1a1a1a',
  },
  moveEmpty: {
    fontSize: '12px',
    color: 'rgba(0,0,0,0.25)',
  },

  /* ── Divider ── */
  thickDivider: {
    height: '2px',
    background: 'rgba(0,0,0,0.2)',
    margin: '2px 0',
  },

  /* ── Stats area ── */
  statsArea: {
    padding: '4px 3px',
    background: 'rgba(255,255,255,0.3)',
    borderRadius: '3px',
    margin: '3px 0',
  },
  statsRow: {
    display: 'flex',
    alignItems: 'flex-start' as const,
    gap: '3px',
  },
  statsLabel: {
    fontSize: '8px',
    color: '#888',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    fontWeight: 'bold' as const,
    minWidth: '20px',
    paddingTop: '6px',
  },
  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    textAlign: 'center' as const,
    flex: 1,
  },
  statCell: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
  },
  statHead: {
    fontSize: '6px',
    color: '#999',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  statVal: {
    fontSize: '10px',
    fontFamily: "inherit",
    padding: '1px 0',
    color: '#333',
  },

  /* ── Bottom bar (like TCG weakness / resistance / retreat) ── */
  bottomBar: {
    display: 'flex',
    borderTop: '1px solid rgba(0,0,0,0.12)',
    marginTop: '3px',
    padding: '4px 0',
  },
  bottomCell: {
    flex: 1,
    textAlign: 'center' as const,
  },
  bottomLabel: {
    fontSize: '6px',
    color: '#999',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  bottomValue: {
    fontSize: '8px',
    color: '#444',
    lineHeight: '1.3',
  },

  /* ── Flavor bar (bottom strip) ── */
  flavorBar: {
    background: 'rgba(0,0,0,0.08)',
    margin: '3px -7px 0',
    padding: '4px 7px',
    fontSize: '8px',
    color: '#666',
    fontStyle: 'italic' as const,
    borderRadius: '0 0 4px 4px',
    textAlign: 'center' as const,
  },
} as const;
