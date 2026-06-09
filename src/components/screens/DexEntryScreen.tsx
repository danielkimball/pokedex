import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useAppStore } from '../../state/store';
import { SPECIES } from '../../core/constants/species';
import { TYPES, SPECIES_TYPES } from '../../core/constants/types';
import { EVOLUTIONS } from '../../core/constants/evolutions';
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
import { spriteUrl, defaultSpriteUrl, monSpriteUrl, monCardArt, gameLabel, genLabel } from '../../core/constants/games';
import { gen4CatchView, gen4Tips, GEN4_GAME_LABEL } from '../../core/constants/gen4-dex-data';
import type { PokedexShellContext } from '../layout/PokedexShell';

const ROMAN_PANEL = ['', 'I', 'II', 'III', 'IV'];

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
  const [evoOpen, setEvoOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(true);
  const [pokemonRecords, setPokemonRecords] = useState<PokemonRecord[]>([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [panelGen, setPanelGen] = useState(4); // which generation's catch data the data panel shows
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

  // Live record count, read by the native touch handlers without re-binding.
  const countRef = useRef(0);
  useEffect(() => { countRef.current = pokemonRecords.length; }, [pokemonRecords.length]);

  // Callback ref: binds the swipe as a NON-PASSIVE touch listener so we can
  // call preventDefault() the instant a horizontal swipe is detected, which
  // stops the scroll container from sliding the view up/down mid-swipe. (React's
  // synthetic onTouchMove is passive, so preventDefault there is a no-op — that
  // was the cause of the vertical bleed.) A callback ref also re-binds cleanly
  // whenever the carousel remounts (e.g. collapsing/expanding the section).
  const attachTrack = useCallback((node: HTMLDivElement | null) => {
    const prev = cardTrackRef.current as (HTMLDivElement & { _swipeCleanup?: () => void }) | null;
    if (prev?._swipeCleanup) prev._swipeCleanup();
    cardTrackRef.current = node;
    if (!node) return;

    const onStart = (e: TouchEvent) => {
      dragStartXRef.current = e.touches[0].clientX;
      dragStartYRef.current = e.touches[0].clientY;
      draggingRef.current = true;
      gestureLockRef.current = null;
    };
    const onMove = (e: TouchEvent) => {
      if (!draggingRef.current) return;
      const dx = e.touches[0].clientX - dragStartXRef.current;
      const dy = e.touches[0].clientY - dragStartYRef.current;
      if (gestureLockRef.current === null) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return; // wait for a clear direction
        gestureLockRef.current = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
        if (gestureLockRef.current === 'h') node.style.transition = 'none';
      }
      if (gestureLockRef.current !== 'h') return; // vertical scroll — leave the page alone
      e.preventDefault(); // suppress vertical scroll for the duration of the swipe
      node.style.transform = `translateX(calc(-100% + ${dx}px))`;
    };
    const onEnd = (e: TouchEvent) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      if (gestureLockRef.current !== 'h') return;
      const count = countRef.current;
      const dx = e.changedTouches[0].clientX - dragStartXRef.current;
      if (Math.abs(dx) > 55 && count > 1) {
        slideToCard(dx < 0 ? 'next' : 'prev', count);
      } else {
        node.style.transition = 'transform 0.25s cubic-bezier(0.22, 0.61, 0.36, 1)';
        node.style.transform = 'translateX(-100%)';
      }
    };

    node.addEventListener('touchstart', onStart, { passive: true });
    node.addEventListener('touchmove', onMove, { passive: false });
    node.addEventListener('touchend', onEnd, { passive: true });
    node.addEventListener('touchcancel', onEnd, { passive: true });
    (node as HTMLDivElement & { _swipeCleanup?: () => void })._swipeCleanup = () => {
      node.removeEventListener('touchstart', onStart);
      node.removeEventListener('touchmove', onMove);
      node.removeEventListener('touchend', onEnd);
      node.removeEventListener('touchcancel', onEnd);
    };
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

  // The copy currently shown in the carousel — drives the data panel's moveset.
  const selectedRecord = pokemonRecords[cardIndex] ?? pokemonRecords[0] ?? null;

  useEffect(() => {
    const chainIdx = chain.indexOf(dexNum);
    const evoFrom = chainIdx > 0 ? chain[chainIdx - 1] : null;
    const catchView = gen4CatchView(dexNum, panelGen);
    const tips = panelGen === 4 ? gen4Tips(dexNum) : [];

    const rec = selectedRecord;
    const recMoves = rec ? rec.moves.filter(m => m !== 0).map(m => MOVES[m] || `Move #${m}`) : [];
    const recNature = rec ? (NATURES[rec.nature] || null) : null;
    const recAbility = rec && rec.ability ? (ABILITIES[rec.ability] || `Ability #${rec.ability}`) : null;
    const recItem = rec && rec.heldItem ? getItemName(rec.heldItem) : null;
    const recLoc = rec
      ? rec.location === 'party'
        ? `Party ${rec.slotIndex + 1}`
        : `Box ${rec.containerIndex + 1}, slot ${rec.slotIndex + 1}`
      : null;
    const total = pokemonRecords.length;

    setSidePanel(
      <div style={dp.panel}>
        {/* Header */}
        <div style={dp.header}>
          <div>
            <div style={dp.kicker}>DEX DATA</div>
            <div style={dp.title}>{name}</div>
          </div>
          <div style={dp.headerRight}>
            <span style={dp.dexNum}>#{String(dexNum).padStart(3, '0')}</span>
            <button style={dp.mainBtn} onClick={() => setActivePanel(0)}>{'MAIN ▸'}</button>
          </div>
        </div>

        {/* About + generation selector */}
        <div style={dp.about}>
          <div style={dp.aboutSpriteBox}>
            <img
              src={rec ? monSpriteUrl(rec) : spriteUrl(dexNum)}
              alt={name}
              style={dp.aboutSprite}
              onError={(e) => spriteFallback(e, dexNum)}
            />
          </div>
          <div style={dp.aboutMeta}>
            <div style={dp.typeRow}>{types.map(t => <TypeBadge key={t} type={t} />)}</div>
            <select
              style={dp.genSelect}
              value={panelGen}
              onChange={(e) => setPanelGen(Number(e.target.value))}
            >
              <option value={4}>Gen IV · HG/SS · Pt · D/P</option>
              <option value={3}>Gen III</option>
              <option value={2}>Gen II</option>
              <option value={1}>Gen I</option>
            </select>
          </div>
        </div>

        {/* Evolution */}
        <div style={dp.section}>
          <div style={dp.sectionTitle}>Evolution</div>
          {evoFrom && (
            <div style={dp.evoLine} onClick={() => { navigate(`/dex/${evoFrom}`); scrollRef.current?.scrollTo(0, 0); }}>
              <img src={SPRITE_URL(evoFrom)} alt="" style={dp.evoMini} />
              <span>From <strong>{SPECIES[evoFrom]}</strong>{evoMethod ? ` · ${evoMethod}` : ''}</span>
            </div>
          )}
          {evolvesTo && evolvesTo.length > 0 && evolvesTo.map(ev => (
            <div key={ev.species} style={dp.evoLine} onClick={() => { navigate(`/dex/${ev.species}`); scrollRef.current?.scrollTo(0, 0); }}>
              <img src={SPRITE_URL(ev.species)} alt="" style={dp.evoMini} />
              <span>Into <strong>{SPECIES[ev.species]}</strong> · {ev.method}</span>
            </div>
          ))}
          {!evoFrom && !(evolvesTo && evolvesTo.length > 0) && (
            <div style={dp.muted}>Does not evolve.</div>
          )}
        </div>

        {/* Where to catch */}
        <div style={dp.section}>
          <div style={dp.sectionTitle}>Where to Catch · Gen {ROMAN_PANEL[panelGen]}</div>
          {panelGen !== 4 ? (
            <div style={dp.muted}>Detailed catch data is Gen IV only for now.</div>
          ) : catchView.catchable.length === 0 ? (
            <div style={dp.muted}>
              {catchView.tradeOnly.length > 0 ? 'Trade / transfer only this generation.' : 'Obtained by evolution.'}
            </div>
          ) : (
            catchView.catchable.map(gc => (
              <div key={gc.label} style={dp.catchBlock}>
                <div style={dp.catchGame}>
                  {gc.label}{gc.via !== 'wild' ? ` · ${gc.via === 'gift' ? 'Gift' : 'Event'}` : ''}
                </div>
                {gc.lines.map((ln, i) => (
                  <div key={i} style={dp.catchLine}>
                    <span style={dp.catchArea}>{ln.area}</span>
                    {ln.detail && <span style={dp.catchDetail}>{ln.detail}</span>}
                  </div>
                ))}
              </div>
            ))
          )}
          {panelGen === 4 && catchView.catchable.length > 0 && catchView.tradeOnly.length > 0 && (
            <div style={dp.tradeOnly}>
              Trade only: {catchView.tradeOnly.map(g => GEN4_GAME_LABEL[g]).join(', ')}
            </div>
          )}
          {tips.map((tip, i) => (
            <div key={i} style={dp.tip}><span style={dp.tipTag}>TIP</span><span>{tip}</span></div>
          ))}
          {panelGen === 4 && !catchView.hasRich && catchView.catchable.length > 0 && (
            <div style={dp.coarseNote}>Basic location only — deeper Gen IV detail is being added.</div>
          )}
        </div>

        {/* This copy's moveset + meta */}
        {rec && (
          <div style={dp.section}>
            <div style={dp.sectionTitle}>Your {name}{total > 1 ? ` · ${cardIndex + 1}/${total}` : ''}</div>
            <div style={dp.moveGrid}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={recMoves[i] ? dp.moveCell : dp.moveCellEmpty}>{recMoves[i] || '—'}</div>
              ))}
            </div>
            <div style={dp.recMeta}>
              {recAbility && <span>{recAbility}</span>}
              {recNature && <span>{recNature}</span>}
              {recItem && <span>@ {recItem}</span>}
            </div>
            <div style={dp.recMetaDim}>
              Lv {rec.level} · {recLoc}{rec.otName ? ` · OT ${rec.otName}` : ''}
            </div>
          </div>
        )}

        <div style={dp.swipeHint}>Swipe right to return</div>
      </div>
    );

    return () => setSidePanel(null);
    // dexNum drives chain/types/evo (pure fns of it); panelGen + selectedRecord
    // cover the rest. Arrays like chain/types are intentionally omitted to avoid
    // identity churn re-running this effect every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardIndex, dexNum, name, panelGen, pokemonRecords, selectedRecord, setActivePanel, setSidePanel, navigate]);

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
                    const tcgArt = monCardArt(record);

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
                        ref={attachTrack}
                        style={{ display: 'flex', transform: 'translateX(-100%)', willChange: 'transform', touchAction: 'pan-y' }}
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

        {/* Where-to-catch, evolution detail, pro-tips and moveset now live in the
            right-hand DATA panel \u2014 swipe left (or tap MAIN \u25B8 there to return). */}
        <div style={s.dataHint} onClick={() => setActivePanel(1)}>
          Swipe left for catch locations, evolution &amp; data {'\u25B8'}
        </div>
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
  dataHint: {
    marginTop: '4px',
    padding: '10px',
    border: '1px dashed #cc001c66',
    borderRadius: '6px',
    background: 'rgba(204,0,28,0.05)',
    color: '#8f0014',
    fontSize: '11px',
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
    cursor: 'pointer',
  },
} as const;

/** Right-hand DATA panel — themed to match the cream dex screen, not a separate look. */
const dp = {
  panel: {
    height: '100%',
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const,
    padding: '10px',
    background: '#f4f1e8',
    color: '#111111',
    WebkitOverflowScrolling: 'touch' as const,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: '8px',
    paddingBottom: '6px',
    borderBottom: '2px solid #cc001c33',
  },
  kicker: {
    fontSize: '9px',
    color: '#cc001c',
    letterSpacing: '2px',
    fontWeight: 'bold' as const,
  },
  title: {
    color: '#111111',
    fontSize: '20px',
    fontWeight: 'bold' as const,
    lineHeight: 1.1,
  },
  headerRight: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-end' as const,
    gap: '5px',
  },
  dexNum: {
    fontSize: '11px',
    color: '#5d5142',
  },
  mainBtn: {
    color: '#fff8e8',
    background: '#cc001c',
    border: 'none',
    borderRadius: '5px',
    fontSize: '10px',
    fontWeight: 'bold' as const,
    fontFamily: 'inherit',
    padding: '5px 9px',
    cursor: 'pointer',
  },
  about: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center' as const,
    marginBottom: '10px',
  },
  aboutSpriteBox: {
    width: '72px',
    height: '72px',
    flexShrink: 0,
    borderRadius: '8px',
    background: 'radial-gradient(circle at 50% 45%, #ffffff 0%, #e9dfc9 100%)',
    border: '2px solid #cc001c33',
    display: 'flex',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  aboutSprite: {
    width: '60px',
    height: '60px',
    imageRendering: 'pixelated' as const,
  },
  aboutMeta: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  typeRow: {
    display: 'flex',
    gap: '4px',
    flexWrap: 'wrap' as const,
  },
  genSelect: {
    width: '100%',
    padding: '5px 6px',
    background: '#fffaf0',
    border: '1px solid #cc001c44',
    borderRadius: '6px',
    color: '#111111',
    fontSize: '11px',
    fontFamily: 'inherit',
    outline: 'none',
    cursor: 'pointer',
  },
  section: {
    padding: '8px 9px',
    border: '1px solid #22222218',
    borderRadius: '6px',
    marginBottom: '8px',
    background: '#fffaf0',
  },
  sectionTitle: {
    fontSize: '10px',
    color: '#8f0014',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    fontWeight: 'bold' as const,
    marginBottom: '6px',
  },
  muted: {
    fontSize: '11px',
    color: '#777',
  },
  evoLine: {
    display: 'flex',
    alignItems: 'center' as const,
    gap: '7px',
    padding: '3px 0',
    fontSize: '11px',
    color: '#222',
    cursor: 'pointer',
  },
  evoMini: {
    width: '28px',
    height: '28px',
    imageRendering: 'pixelated' as const,
    flexShrink: 0,
  },
  catchBlock: {
    marginBottom: '7px',
  },
  catchGame: {
    fontSize: '11px',
    fontWeight: 'bold' as const,
    color: '#111111',
    marginBottom: '2px',
  },
  catchLine: {
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '2px 0 2px 8px',
    borderLeft: '2px solid #cc001c33',
    marginBottom: '2px',
  },
  catchArea: {
    fontSize: '11px',
    color: '#222',
  },
  catchDetail: {
    fontSize: '9px',
    color: '#6a5d4a',
  },
  tradeOnly: {
    fontSize: '9px',
    color: '#998',
    marginTop: '4px',
    fontStyle: 'italic' as const,
  },
  tip: {
    display: 'flex',
    gap: '6px',
    alignItems: 'flex-start' as const,
    marginTop: '6px',
    padding: '6px 7px',
    background: 'rgba(246,213,74,0.18)',
    border: '1px solid #e8c64e88',
    borderRadius: '5px',
    fontSize: '10px',
    color: '#5a4a10',
    lineHeight: 1.35,
  },
  tipTag: {
    fontSize: '8px',
    fontWeight: 'bold' as const,
    color: '#8a6d00',
    background: '#f6d54a',
    borderRadius: '3px',
    padding: '1px 4px',
    flexShrink: 0,
    letterSpacing: '0.5px',
  },
  coarseNote: {
    fontSize: '9px',
    color: '#aa9',
    marginTop: '5px',
  },
  moveGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '5px',
    marginBottom: '6px',
  },
  moveCell: {
    padding: '6px 8px',
    background: 'rgba(0,0,0,0.05)',
    borderRadius: '5px',
    fontSize: '11px',
    fontWeight: 'bold' as const,
    color: '#1a1a1a',
  },
  moveCellEmpty: {
    padding: '6px 8px',
    background: 'rgba(0,0,0,0.03)',
    borderRadius: '5px',
    fontSize: '11px',
    color: 'rgba(0,0,0,0.25)',
  },
  recMeta: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '4px 10px',
    fontSize: '10px',
    color: '#333',
    marginBottom: '3px',
  },
  recMetaDim: {
    fontSize: '9px',
    color: '#6a5d4a',
  },
  swipeHint: {
    color: '#5d514288',
    fontSize: '10px',
    textAlign: 'center' as const,
    padding: '4px 0 8px',
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
