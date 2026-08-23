import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../../state/store';
import {
  GEN1_4_ITEM_LOCATIONS,
  ITEM_GAME_LABELS,
  ITEM_GENERATION_GAMES,
  getItemLocation,
  type ItemGame,
  type ItemLocationEntry,
} from '../../core/constants/item-locations';

const GENERATIONS = [1, 2, 3, 4] as const;
const ROMAN = ['', 'I', 'II', 'III', 'IV'];
const CATEGORIES = [...new Set(GEN1_4_ITEM_LOCATIONS.map(item => item.category))].sort();

function sourceTone(kind: string) {
  if (kind === 'Not normally obtainable') return { color: '#8f0014', background: '#cc001c0d', borderColor: '#cc001c33' };
  if (kind === 'Event distribution') return { color: '#765000', background: '#e7b70014', borderColor: '#b8870033' };
  return { color: '#3d352c', background: '#00000008', borderColor: '#00000012' };
}

function GameSources({ item, game }: { item: ItemLocationEntry; game: ItemGame }) {
  const sources = item.games[game] ?? [];
  const hasDocumentedSource = item.availableIn.includes(game);
  const move = item.machineMoves?.[game];

  return (
    <div style={s.gameSources}>
      <div style={s.gameTitle}>
        {ITEM_GAME_LABELS[game]}
        {move && <span style={s.move}>Teaches {move}</span>}
      </div>
      {!hasDocumentedSource ? (
        <div style={s.notPresent}>No obtainable source is documented for this game.</div>
      ) : sources.length === 0 ? (
        <div style={s.notPresent}>Present in the game data, but no legitimate acquisition is documented.</div>
      ) : (
        sources.map((source, index) => (
          <div key={`${source.kind}-${source.text}-${index}`} style={{ ...s.source, ...sourceTone(source.kind) }}>
            <span style={s.sourceKind}>{source.kind}</span>
            <span style={s.sourceText}>{source.text}</span>
          </div>
        ))
      )}
    </div>
  );
}

function ItemRow({
  item,
  selectedGame,
  expanded,
  onToggle,
}: {
  item: ItemLocationEntry;
  selectedGame: ItemGame;
  expanded: boolean;
  onToggle: () => void;
}) {
  const sourceCount = item.games[selectedGame]?.length ?? 0;
  const status = !item.availableIn.includes(selectedGame)
    ? 'No source'
    : sourceCount > 0
      ? `${sourceCount} ${sourceCount === 1 ? 'method' : 'methods'}`
      : 'Special / unobtainable';

  return (
    <article id={`item-${item.slug}`} style={s.itemCard}>
      <button type="button" style={s.itemSummary} onClick={onToggle} aria-expanded={expanded}>
        <span style={s.itemIdentity}>
          <span style={s.itemName}>{item.name}</span>
          <span style={s.itemMeta}>Gen {ROMAN[item.generation]} · {item.category}</span>
        </span>
        <span style={s.itemStatus}>{ITEM_GAME_LABELS[selectedGame]} · {status}</span>
        <span style={s.chevron}>{expanded ? '▴' : '▾'}</span>
      </button>
      {expanded && (
        <div style={s.itemDetail}>
          <GameSources item={item} game={selectedGame} />
          <div style={s.availableRow}>
            <span style={s.availableLabel}>Documented in:</span>
            {item.availableIn.length > 0
              ? item.availableIn.map(game => <span key={game} style={s.gameChip}>{ITEM_GAME_LABELS[game]}</span>)
              : <span style={s.notPresent}>No normally indexed game availability.</span>}
          </div>
          <div style={s.sourceLinks}>
            {[...new Set(item.researchUrls ?? [item.sourceUrl])].map((url, index) => (
              <a key={url} href={url} target="_blank" rel="noreferrer" style={s.sourceLink}>
                Research source {index + 1} ↗
              </a>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

export function ItemsScreen() {
  const navigate = useNavigate();
  const dexProgression = useAppStore(state => state.dexProgression);
  const setDexProgression = useAppStore(state => state.setDexProgression);
  const [params, setParams] = useSearchParams();
  const linkedItem = getItemLocation(params.get('item') ?? '');
  const initialGame = params.get('game') as ItemGame | null;
  const [query, setQuery] = useState(linkedItem?.name ?? '');
  const [generation, setGeneration] = useState<number | null>(null);
  const [category, setCategory] = useState('all');
  const [selectedGame, setSelectedGame] = useState<ItemGame>(initialGame && ITEM_GAME_LABELS[initialGame] ? initialGame : 'heartgold');
  const [expanded, setExpanded] = useState<string | null>(linkedItem?.slug ?? null);

  useEffect(() => {
    if (!linkedItem) return;
    const timer = window.setTimeout(() => document.getElementById(`item-${linkedItem.slug}`)?.scrollIntoView({ block: 'center' }), 80);
    return () => window.clearTimeout(timer);
  }, [linkedItem]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return GEN1_4_ITEM_LOCATIONS.filter(item => {
      if (generation && item.generation !== generation) return false;
      if (category !== 'all' && item.category !== category) return false;
      if (!needle) return true;
      const gameText = Object.values(item.games).flat().map(source => source.text).join(' ');
      const moves = Object.values(item.machineMoves ?? {}).join(' ');
      return `${item.name} ${item.category} ${gameText} ${moves}`.toLowerCase().includes(needle);
    });
  }, [category, generation, query]);

  const chooseGame = (game: ItemGame) => {
    setSelectedGame(game);
    const next = new URLSearchParams(params);
    next.set('game', game);
    if (expanded) next.set('item', expanded);
    setParams(next, { replace: true });
  };

  const toggle = (slug: string) => {
    const nextExpanded = expanded === slug ? null : slug;
    setExpanded(nextExpanded);
    const next = new URLSearchParams(params);
    if (nextExpanded) next.set('item', nextExpanded);
    else next.delete('item');
    next.set('game', selectedGame);
    setParams(next, { replace: true });
  };

  return (
    <div style={s.container}>
      <div style={s.masthead}>
        <button type="button" style={s.backBtn} onClick={() => navigate('/')}>‹ Back</button>
        <div style={s.modeSeg}>
          <button type="button" style={s.modeSegOff} onClick={() => { setDexProgression(null); navigate('/dex'); }}>Collection</button>
          <button type="button" style={s.modeSegOn}>Items</button>
          <button type="button" style={s.modeSegOff} onClick={() => { setDexProgression(dexProgression ?? 'HeartGold'); navigate('/dex'); }}>Story</button>
        </div>
        <span style={s.headerCount}>{filtered.length}/563</span>
      </div>

      <div style={s.controls}>
        <div style={s.searchWrap}>
          <span style={s.searchIcon}>⌕</span>
          <input
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search items, moves, or locations…"
            aria-label="Search items"
            style={s.searchInput}
          />
        </div>

        <div style={s.filterRow}>
          <label style={s.field}>
            <span style={s.label}>Game</span>
            <select value={selectedGame} onChange={event => chooseGame(event.target.value as ItemGame)} style={s.select}>
              {GENERATIONS.map(gen => (
                <optgroup key={gen} label={`Generation ${ROMAN[gen]}`}>
                  {ITEM_GENERATION_GAMES[gen].map(game => <option key={game} value={game}>{ITEM_GAME_LABELS[game]}</option>)}
                </optgroup>
              ))}
            </select>
          </label>
          <label style={s.field}>
            <span style={s.label}>Introduced</span>
            <select value={generation ?? ''} onChange={event => setGeneration(event.target.value ? Number(event.target.value) : null)} style={s.select}>
              <option value="">All generations</option>
              {GENERATIONS.map(gen => <option key={gen} value={gen}>Generation {ROMAN[gen]}</option>)}
            </select>
          </label>
          <label style={s.field}>
            <span style={s.label}>Category</span>
            <select value={category} onChange={event => setCategory(event.target.value)} style={s.select}>
              <option value="all">All categories</option>
              {CATEGORIES.map(value => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div style={s.explainer}>
        Every indexed inventory and Key Item introduced in Generations I–IV. Select a cartridge to see all documented finite, repeatable, held-item, shop, Pickup, event, and unavailable methods for that game.
      </div>

      <div style={s.list}>
        {filtered.map(item => (
          <ItemRow
            key={item.slug}
            item={item}
            selectedGame={selectedGame}
            expanded={expanded === item.slug}
            onToggle={() => toggle(item.slug)}
          />
        ))}
        {filtered.length === 0 && <div style={s.empty}>No items match these filters.</div>}
      </div>
    </div>
  );
}

const s = {
  container: { display: 'flex', flexDirection: 'column' as const, height: '100%', background: 'linear-gradient(180deg, #f7f3ea 0%, #f0ebe0 100%)', color: '#1a1510' },
  masthead: { display: 'flex', alignItems: 'center' as const, gap: '8px', padding: '8px 10px', flexShrink: 0, background: 'linear-gradient(180deg, #cc001c 0%, #a00016 100%)', boxShadow: '0 2px 8px rgba(0,0,0,0.18)' },
  backBtn: { background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '6px', color: '#fff8e8', fontSize: '11px', fontFamily: 'inherit', fontWeight: 'bold' as const, cursor: 'pointer', padding: '5px 10px', flexShrink: 0 },
  modeSeg: { flex: 1, display: 'flex', justifyContent: 'center' as const, background: 'rgba(0,0,0,0.22)', borderRadius: '8px', padding: '2px', gap: '2px' },
  modeSegOn: { padding: '5px 12px', border: 'none', borderRadius: '6px', background: '#fff8e8', color: '#a00016', fontSize: '11px', fontFamily: 'inherit', fontWeight: 'bold' as const, cursor: 'pointer' },
  modeSegOff: { padding: '5px 12px', border: 'none', borderRadius: '6px', background: 'transparent', color: 'rgba(255,248,232,0.75)', fontSize: '11px', fontFamily: 'inherit', cursor: 'pointer' },
  headerCount: { minWidth: '52px', textAlign: 'right' as const, fontSize: '10px', color: '#fff8e8', fontWeight: 'bold' as const },
  controls: { padding: '9px 10px 7px', borderBottom: '1px solid #8f001422', background: '#fffaf0', flexShrink: 0 },
  searchWrap: { display: 'flex', alignItems: 'center' as const, gap: '6px', marginBottom: '7px', padding: '0 8px', border: '1px solid #8f001433', borderRadius: '7px', background: '#fff' },
  searchIcon: { color: '#8f0014', fontSize: '15px' },
  searchInput: { width: '100%', minWidth: 0, border: 'none', outline: 'none', background: 'transparent', padding: '7px 0', font: 'inherit', fontSize: '11px', color: '#222' },
  filterRow: { display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '6px' },
  field: { display: 'flex', minWidth: 0, flexDirection: 'column' as const, gap: '2px' },
  label: { fontSize: '8px', textTransform: 'uppercase' as const, letterSpacing: '0.6px', fontWeight: 'bold' as const, color: '#8f0014' },
  select: { width: '100%', minWidth: 0, padding: '5px', border: '1px solid #8f001433', borderRadius: '5px', background: '#fff', color: '#222', font: 'inherit', fontSize: '9px' },
  explainer: { padding: '7px 11px', background: '#eadfca88', borderBottom: '1px solid #8f00141a', color: '#665b4e', fontSize: '9px', lineHeight: 1.35, flexShrink: 0 },
  list: { flex: 1, overflowY: 'auto' as const, padding: '8px', WebkitOverflowScrolling: 'touch' as const },
  itemCard: { marginBottom: '6px', border: '1px solid #231b121c', borderRadius: '7px', background: '#fffaf0', overflow: 'hidden' as const },
  itemSummary: { width: '100%', display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '8px', alignItems: 'center' as const, padding: '8px 9px', border: 'none', background: 'transparent', color: 'inherit', font: 'inherit', textAlign: 'left' as const, cursor: 'pointer' },
  itemIdentity: { display: 'flex', minWidth: 0, flexDirection: 'column' as const, gap: '1px' },
  itemName: { fontSize: '12px', fontWeight: 'bold' as const, color: '#241c15' },
  itemMeta: { fontSize: '8px', color: '#75695c' },
  itemStatus: { maxWidth: '145px', fontSize: '8px', color: '#8f0014', textAlign: 'right' as const },
  chevron: { color: '#8f0014', fontSize: '10px' },
  itemDetail: { padding: '0 9px 9px', borderTop: '1px solid #8f001414' },
  gameSources: { paddingTop: '7px' },
  gameTitle: { display: 'flex', alignItems: 'baseline' as const, justifyContent: 'space-between' as const, gap: '7px', marginBottom: '5px', fontSize: '11px', fontWeight: 'bold' as const, color: '#8f0014' },
  move: { fontSize: '9px', color: '#765000', fontWeight: 'normal' as const },
  source: { display: 'grid', gridTemplateColumns: '105px 1fr', gap: '7px', padding: '5px 6px', marginBottom: '4px', border: '1px solid', borderRadius: '5px' },
  sourceKind: { fontSize: '8px', fontWeight: 'bold' as const, textTransform: 'uppercase' as const, letterSpacing: '0.3px' },
  sourceText: { fontSize: '9px', lineHeight: 1.4 },
  notPresent: { fontSize: '9px', color: '#766d62', fontStyle: 'italic' as const, padding: '3px 0' },
  availableRow: { display: 'flex', flexWrap: 'wrap' as const, gap: '3px', alignItems: 'center' as const, marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #00000012' },
  availableLabel: { marginRight: '3px', fontSize: '8px', fontWeight: 'bold' as const, color: '#665b4e', textTransform: 'uppercase' as const },
  gameChip: { padding: '2px 4px', borderRadius: '3px', background: '#8f001410', color: '#6f0010', fontSize: '7px' },
  sourceLinks: { display: 'flex', flexWrap: 'wrap' as const, gap: '8px', marginTop: '7px' },
  sourceLink: { color: '#806000', fontSize: '8px' },
  empty: { padding: '30px', textAlign: 'center' as const, color: '#776c60', fontSize: '11px' },
} as const;
