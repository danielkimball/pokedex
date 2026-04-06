import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../state/store';
import { SPECIES } from '../../core/constants/species';
import { TYPES, SPECIES_TYPES } from '../../core/constants/types';
import { EVOLUTIONS, type EvolutionInfo } from '../../core/constants/evolutions';
import { LOCATIONS, type LocationInfo } from '../../core/constants/locations';
import { NATURES, NATURE_EFFECTS } from '../../core/constants/natures';
import { MOVES } from '../../core/constants/moves';
import { ABILITIES } from '../../core/constants/abilities';
import { getItemName } from '../../core/constants/items';
import { getPokemonBySpecies } from '../../db/pokemon-store';
import type { PokemonRecord } from '../../db/schema';
import { TypeBadge } from '../ui/TypeBadge';
import { getGender } from '../../core/utils/gender';
import { ORIGIN_GAMES } from '../../core/constants/origin-games';

const SPRITE_URL = (n: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${n}.png`;

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
    setCardIndex(0);
    if (dexNum >= 1 && dexNum <= 493) {
      getPokemonBySpecies(dexNum).then(records => {
        if (!cancelled) setPokemonRecords(records);
      });
    }
    return () => { cancelled = true; };
  }, [dexNum]);

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

  const name = SPECIES[dexNum] || '???';
  const types = getTypesForSpecies(dexNum);
  const registry = registryMap.get(dexNum);
  const isCaught = registry?.caught ?? false;
  const saveNameMap = new Map(saves.map(sv => [sv.id, `${sv.trainerName} (${sv.gameVersion})`]));

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
            background: isCaught ? 'rgba(79,195,247,0.15)' : 'rgba(255,68,68,0.1)',
            borderColor: isCaught ? '#4FC3F7' : '#ff444466',
            color: isCaught ? '#4FC3F7' : '#ff6666',
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
          const pkmn = pokemonRecords[cardIndex];
          if (!pkmn) return null;
          const natureEffect = NATURE_EFFECTS[pkmn.nature];
          const natureName = NATURES[pkmn.nature] || '???';
          const natureLabel = natureEffect?.increased
            ? `${natureName} (+${natureEffect.increased} -${natureEffect.decreased})`
            : natureName;
          const abilityName = ABILITIES[pkmn.ability] || `Ability #${pkmn.ability}`;
          const heldItem = getItemName(pkmn.heldItem);
          const moves = pkmn.moves
            .filter(m => m !== 0)
            .map(m => MOVES[m] || `Move #${m}`);
          const saveName = saveNameMap.get(pkmn.saveId) || 'Unknown Save';
          const loc = pkmn.location === 'party'
            ? `Party slot ${pkmn.slotIndex + 1}`
            : `Box ${pkmn.containerIndex + 1}, slot ${pkmn.slotIndex + 1}`;
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
                        <div style={st.artFrame}>
                          <img src={SPRITE_URL(dexNum)} alt={name} style={st.cardSprite} />
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
                        </div>
                      </div>
                    );
                  };

                  return (
                    <div style={{ overflow: 'hidden' }}>
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
                        borderColor: isCurrentPokemon ? '#4FC3F7' : '#4FC3F733',
                        background: isCurrentPokemon ? 'rgba(79,195,247,0.08)' : 'transparent',
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
                        color: speciesCaught ? '#4FC3F7' : '#2E86C188',
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
                <div style={{ fontSize: '10px', color: '#2E86C1', marginBottom: '4px' }}>Evolves into:</div>
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
                      <span style={{ fontSize: '11px', color: evoCaught ? '#4FC3F7' : '#2E86C1', flex: 1 }}>
                        {evoName}
                      </span>
                      <span style={{ fontSize: '10px', color: '#2E86C188' }}>{evo.method}</span>
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
            <div style={{ fontSize: '11px', color: '#2E86C166', textAlign: 'center' }}>
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
    borderBottom: '1px solid #4FC3F722',
    flexShrink: 0,
  },
  navBtn: {
    background: 'none',
    border: '1px solid #4FC3F733',
    borderRadius: '4px',
    color: '#4FC3F7',
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
    color: '#2E86C1',
  },
  pokemonName: {
    fontSize: '20px',
    fontWeight: 'bold' as const,
    color: '#4FC3F7',
    textShadow: '0 0 6px rgba(79,195,247,0.3)',
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
    color: '#2E86C188',
    marginBottom: '8px',
    paddingLeft: '2px',
  },
  section: {
    padding: '8px',
    border: '1px solid #4FC3F722',
    borderRadius: '4px',
    marginBottom: '8px',
    background: 'rgba(0,0,0,0.15)',
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
    color: '#2E86C1',
  },
  sectionTitle: {
    fontSize: '10px',
    color: '#2E86C1',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  },
  locRow: {
    display: 'flex',
    justifyContent: 'space-between' as const,
    fontSize: '11px',
    color: '#4FC3F7',
    padding: '3px 0',
    borderBottom: '1px solid rgba(79,195,247,0.06)',
  },
  locDetail: {
    color: '#2E86C1',
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
    color: '#2E86C188',
    padding: '2px 0',
    textAlign: 'center' as const,
  },
  evoArrow: {
    fontSize: '10px',
    color: '#4FC3F744',
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
    color: '#4FC3F7',
    flexShrink: 0,
  },
  branchRow: {
    display: 'flex',
    alignItems: 'center' as const,
    gap: '6px',
    padding: '3px 4px',
    borderBottom: '1px solid rgba(79,195,247,0.06)',
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
    color: '#4FC3F7',
    fontWeight: 'bold' as const,
    marginBottom: '2px',
  },
  locationLine: {
    fontSize: '10px',
    color: '#2E86C1',
    padding: '1px 0 1px 8px',
  },
  notFound: {
    textAlign: 'center' as const,
    color: '#2E86C1',
    fontSize: '14px',
    marginTop: '40px',
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
