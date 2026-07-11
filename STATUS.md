# Pokedex — Living Status

**Purpose:** Hand-off doc for new AI/human sessions. Keep this updated when shipping work.  
**Repo:** `danielkimball/pokedex` · **Deploy:** Vercel (pushes to `main`)  
**Local:** `npm run dev` → `https://127.0.0.1:5173/` (HTTPS via `@vitejs/plugin-basic-ssl`)  
**Last updated:** 2026-07-11

---

## What this app is

Personal multi-gen Pokedex that:

- Imports Gen 1–4 emulator saves (esp. **HeartGold** `.dsv`)
- Tracks caught species (registry), party/boxes/daycare
- Renders each owned mon as a **TCG-style card** with real stats (IVs/EVs, moves, OT, location)
- Story-order catch guides (Yellow, HeartGold, etc.)

Key UI: collection list + **card grid**, dex entry carousel, filters/sort, Home storage.

---

## Done recently (high value)

### HGSS real card templates (Gen 4)

| Template | Path | Who gets it |
|----------|------|-------------|
| **Basic Fire** | `public/cards/gen4/templates/basic-fire.png` | HG/SS + TCG Basic + primary Fire |
| **Basic Lightning** | `public/cards/gen4/templates/basic-lightning.png` | HG/SS + TCG Basic + primary Electric |
| **Basic Grass** | `public/cards/gen4/templates/basic-grass.png` | HG/SS + TCG Basic + primary Grass/Bug/Poison |
| **Basic Water** | `public/cards/gen4/templates/basic-water.png` | HG/SS + TCG Basic + primary Water/Ice |

**Source templates (user-provided):**  
`~/Desktop/HGSS_Card_Templates/`  
- `Basic_fire_Gen4.png`  
- `Yellow_template.png` → **lightning** (replaces buggy `basic_electric_tempalte_gen4.png`)  
- `basic_leaf_template.png` → **grass**  
- `water_template_basic_gen4.png` → **water**  
- Reference full cards (not blanks): `basic_water.jpg` (Lapras), `Basic_fight.jpg` (Tyrogue), `basic_psyhic.jpg` (Wobbuffet)  
- Reference scans under `actualcards/`

**Renderer:** `src/components/ui/TcgCard.tsx` → `HgssTcgCard` when `resolveHgssTemplate()` hits.

**TCG stage (not game evo index):**  
Baby rule so **Pikachu is Basic** (Pichu → Pikachu stays Basic; Raichu = Stage 1).  
See `TCG_BABY_SPECIES` + `tcgStageLabel()` in `TcgCard.tsx`.

**Layout:** OT on silver lip under art; moves; IV/EV under bottom rule; held in Illus. pill; weakness + location bottom-right.  
Fire / lightning / grass use **per-energy vertical anchors** in `HGSS_LAYOUT` (PNG geometry is not identical).

**Grass layout notes:**  
- Source `basic_leaf_template.png` 1054×1492 → **1062×1480**, near-white punch (thr 248).  
- Silver lip ~**54.3%**; bottom rule ~**86.3%**.  
- Art window: `{ left: 7.34, top: 10.61, width: 85.40, height: 43.50 }`.

**Lightning / Yellow_template notes (re-export 2026-07-11):**  
- Source already **1062×1480**; art fill is **yellow** (not white) — rectangular punch, not white-key.  
- Art top must sit **below BASIC tab** (~12.3%) so the badge stays opaque.  
- Baked “HP” on silver wedge was cleared so CSS overlay stays single.  
- Silver lip ~**52.3%**; bottom rule ~**84.1%** (near fire).  
- Art window: `{ left: 7.72, top: 12.30, width: 85.40, height: 40.00 }`.

**Water layout notes:**  
- Source `water_template_basic_gen4.png` 1059×1486 → **1062×1480**; blue art fill (not white).  
- Same BASIC-safe top (~12.3%); silver lip ~**52.7%**; bottom rule ~**85.5%**.  
- Art window: `{ left: 6.87, top: 12.30, width: 86.35, height: 40.41 }`.

**Art:**  
- Maps: `src/core/constants/gen4-card-art.ts` (`GEN4_CARD_ART_HGSS` / PL / DP)  
- Files: `public/cards/gen4/<set>/<num>.jpg`  
- Pipeline: `tmp/gen4_download_crop.py`, picks in `tmp/gen4/_art_picks.json`  
- Cache bust: `GEN4_ART_CACHE_VER` in `gen4-card-art.ts` (bump when re-cropping)

**Art crop rules (set-aware):**  
- Below BASIC/Stage tab, above flavor silver bar  
- Aspect ≈ template art hole so `object-fit: cover` doesn’t snout-clip  
- DP/PL flavor bar is higher than HGSS — different bottoms in crop script

**Energies:**  
- Icons: `public/cards/gen1/energies/*.png`  
- Colorless = HGSS star cut from Cyndaquil card  
- URLs via `tcgEnergyUrl()` + `ENERGY_CACHE_VER` in `energies.ts`  
- Electric type → energy key `lightning` (not `electric`)  
- Grass type → energy key `grass` (Bug/Poison also map to grass frame)  
- Water type → energy key `water` (Ice also maps to water frame)

### Dex UX

- Sort: `#`, A–Z, Level ↑/↓, **Type** (list + card) — `PokedexListScreen.tsx` / `DexCardView.tsx`
- Collection vs Story modes, Progressive / All spots
- HeartGold / Yellow story progression views

### Saves / data

- Multi-gen import path (Gen 1–4)
- HGSS badges / daycare / story guide work (see recent commits)
- Dropbox / Google Drive / directory sync hooks exist

---

## Not done / next (HGSS cards)

### Templates still needed (user draws blank frames, agent wires)

| Stage | Energies needed |
|-------|-----------------|
| **Basic** | fighting, psychic, colorless (+ metal/dark if you want) |
| **Stage 1** | all energies that have evolutions |
| **Stage 2** | fire / water / grass / etc. |

**Desktop sources that are NOT blanks:**  
`basic_water.jpg`, `Basic_fight.jpg`, `basic_psyhic.jpg` are **full printed cards** (Lapras / Tyrogue / Wobbuffet). Do **not** wire them as templates without blanking art + all text (prior auto-inpaint looked bad). Prefer user-drawn blanks matching fire/leaf quality.

**Wiring a new template:**

1. Drop PNG on Desktop `HGSS_Card_Templates/`
2. Process: resize to **1062×1480** if needed; punch **transparent art hole** (near-white thr ~248; keep outer yellow corners **opaque** unless you want CSS clip)
3. Save as `public/cards/gen4/templates/{basic\|stage1\|stage2}-{energy}.png`  
   Energy keys: `fire` | `lightning` | `water` | `grass` | `fighting` | `psychic` | `colorless` | …
4. Add energy to `HGSS_BASIC_ENERGIES` (or a stage1/stage2 set) in `TcgCard.tsx`
5. Measure art hole + silver lip %; add `HGSS_BASIC_ART_WINDOW` + `HGSS_LAYOUT` entries if geometry ≠ fire
6. Re-crop that energy’s species art if aspect differs; bump `GEN4_ART_CACHE_VER`
7. Hard-refresh; then push `main` for Vercel

**Stage templates:** `resolveHgssTemplate` already maps Stage 1/2 names → `stage1` / `stage2` filenames; only **basic** + fire/lightning/grass/water are allow-listed today.  
**Template cache:** `?v=8` on HGSS template URLs.

### Known card quirks / polish

- [ ] Per-species hand crops still needed when flavor bar or framing is ugly (Charmander PL was hand-fixed; others may need same)
- [ ] Grass layout differs slightly (lip lower); fine as per-energy layout
- [ ] Yellow_template HP clear leaves a slight smudge on silver wedge (harmless under CSS HP)
- [ ] Gen 2 has art + CSS frame only (no real Neo PNG templates yet)
- [ ] Gen 3: no TCG art path (null art)
- [ ] Stage 1/2 still use CSS placeholder even for Fire/Electric/Grass/Water
- [ ] Dual-type → single primary energy for frame color

### Product / infra backlog (from older work)

- [ ] Real Gen 2/3/4 PNG frames beyond HGSS basic fire/lightning/grass/water
- [ ] Ability display completeness / Gen 3 ability slot table
- [ ] Home + transfer polish
- [ ] Living tests against Desktop `Pokemon HeartGold Version.dsv` (some tests skip if missing)

---

## Key files (start here in a new session)

| Area | Path |
|------|------|
| Card UI | `src/components/ui/TcgCard.tsx` |
| Gen4 art maps | `src/core/constants/gen4-card-art.ts` |
| Energy icons | `src/core/constants/energies.ts` |
| Dex list/sort | `src/components/screens/PokedexListScreen.tsx` |
| Card grid | `src/components/screens/DexCardView.tsx` |
| Dex entry | `src/components/screens/DexEntryScreen.tsx` |
| HGSS templates | `public/cards/gen4/templates/` |
| Crop pipeline | `tmp/gen4_download_crop.py` |
| User template sources | `~/Desktop/HGSS_Card_Templates/` |

---

## Recent git (card work)

```
(pending) HGSS Basic Water
1e1ad7d Replace HGSS lightning with Yellow_template; reapply grass
691128b Add HGSS Basic Grass card template
```

---

## Session protocol (for AI)

1. Read this file first.
2. Don’t touch Gen 1 templates unless asked.
3. New HGSS templates: process + wire allow-list + layout; don’t invent CSS placeholders for types that already have PNGs.
4. After re-cropping art, **bump cache ver** (`GEN4_ART_CACHE_VER` / template `?v=`).
5. When shipping: commit + `git push origin main` (Vercel).
6. **Update this file** at end of session: move items Done ↔ Not done, note new template filenames and any layout gotchas.

---

## Quick “what to do next” (user intent as of 2026-07-11)

Continue **one-by-one HGSS basic templates**. Fire / lightning / grass / water done. Next when **blank** frames are drawn: **fighting / psychic / colorless**. Stage 1/2 later.
