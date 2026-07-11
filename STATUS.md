# Pokedex — Living Status

**Purpose:** Hand-off doc for new AI/human sessions. Keep this updated when shipping work.  
**Repo:** `danielkimball/pokedex` · **Deploy:** Vercel (pushes to `main`)  
**Local:** `npm run dev` → `https://localhost:5173/` (HTTPS via `@vitejs/plugin-basic-ssl`)  
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

### HGSS real card templates (Gen 4) — full Basic set

| Template | Path | Who gets it |
|----------|------|-------------|
| **Basic Fire** | `public/cards/gen4/templates/basic-fire.png` | Fire |
| **Basic Lightning** | `public/cards/gen4/templates/basic-lightning.png` | Electric |
| **Basic Grass** | `public/cards/gen4/templates/basic-grass.png` | Grass / Bug / Poison |
| **Basic Water** | `public/cards/gen4/templates/basic-water.png` | Water / Ice |
| **Basic Fighting** | `public/cards/gen4/templates/basic-fighting.png` | Fighting / Rock / Ground |
| **Basic Psychic** | `public/cards/gen4/templates/basic-psychic.png` | Psychic / Ghost |
| **Basic Colorless** | `public/cards/gen4/templates/basic-colorless.png` | Normal / Flying / Dragon (+ Steel/Dark fallback) |

**Classic Basic set is complete** (7 energies). Optional later: Metal / Darkness (Neo-era).

**Source templates (user-provided):** `~/Desktop/HGSS_Card_Templates/`

| Energy | Desktop source |
|--------|----------------|
| fire | `Basic_fire_Gen4.png` |
| lightning | `Electric_Template_Gen4_basic.png` |
| grass | `basic_leaf_template.png` |
| water | `Water_Template_gen4_basic.png` |
| fighting | `Fight_Template_Gen4_Basic.png` |
| psychic | `Pyschic_template_gen4_template.png` |
| colorless | `Normal_Template_gen4_basic.png` |

**2026-07-11 reprocess (HP removed from sources):**  
All 7 re-cut to **1062×1480**, art hole punched below BASIC tab (~12.3% top), per-energy `HGSS_BASIC_ART_WINDOW` + `HGSS_LAYOUT`, template cache **`?v=9`**. Metrics in `tmp/hgss_basic_metrics.json`.

**Renderer:** `src/components/ui/TcgCard.tsx` → `HgssTcgCard` when `resolveHgssTemplate()` hits.

**TCG stage (not game evo index):**  
Baby rule so **Pikachu is Basic** (Pichu → Pikachu stays Basic; Raichu = Stage 1).  
See `TCG_BABY_SPECIES` + `tcgStageLabel()` in `TcgCard.tsx`.

**Layout:** OT on silver lip under art; moves; IV/EV under bottom rule; held in Illus. pill; weakness + location bottom-right. Per-energy vertical anchors in `HGSS_LAYOUT`.

**Art:**  
- Maps: `src/core/constants/gen4-card-art.ts`  
- Files: `public/cards/gen4/<set>/<num>.jpg`  
- Pipeline: `tmp/gen4_download_crop.py`, picks in `tmp/gen4/_art_picks.json`  
- Cache bust: `GEN4_ART_CACHE_VER` in `gen4-card-art.ts`

**Energies:**  
- Icons: `public/cards/gen1/energies/*.png`  
- URLs via `tcgEnergyUrl()` + `ENERGY_CACHE_VER` in `energies.ts`  
- Electric → `lightning`; Ice → `water`; Bug/Poison → `grass`; Rock/Ground → `fighting`; Ghost → `psychic`; Normal/Flying/Dragon/Steel/Dark → `colorless`

### Dex UX

- Sort: `#`, A–Z, Level ↑/↓, **Type** (list + card)
- Collection vs Story modes, Progressive / All spots
- HeartGold / Yellow story progression views

### Saves / data

- Multi-gen import path (Gen 1–4)
- HGSS badges / daycare / story guide work
- Dropbox / Google Drive / directory sync hooks exist

---

## Not done / next (HGSS cards)

### Templates still needed

| Stage | Energies needed |
|-------|-----------------|
| **Stage 1** | all energies that have evolutions |
| **Stage 2** | fire / water / grass / etc. |
| **Optional Basic** | metal, darkness (if you want Neo-era frames) |

**Wiring a new template:**

1. Drop PNG on Desktop `HGSS_Card_Templates/`
2. Process: resize to **1062×1480**; punch **transparent art hole** below BASIC (~12.3% top); keep yellow corners opaque
3. Save as `public/cards/gen4/templates/{basic\|stage1\|stage2}-{energy}.png`
4. Add energy to `HGSS_BASIC_ENERGIES` (or stage1/stage2 set) in `TcgCard.tsx`
5. Measure art hole + silver lip %; add `HGSS_BASIC_ART_WINDOW` + `HGSS_LAYOUT`
6. Bump template `?v=`
7. Hard-refresh; push `main` for Vercel

**Stage templates:** `resolveHgssTemplate` maps Stage 1/2 → filenames; only **basic** + all 7 energies allow-listed today.  
**Template cache:** `?v=9`.

### Known card quirks / polish

- [ ] Per-species hand crops when flavor bar/framing is ugly
- [ ] Gen 2 has art + CSS frame only (no real Neo PNG templates yet)
- [ ] Gen 3: no TCG art path (null art)
- [ ] Stage 1/2 still use CSS placeholder for all energies
- [ ] Dual-type → single primary energy for frame color

### Product / infra backlog

- [ ] Real Gen 2/3 stage frames
- [ ] Ability display completeness / Gen 3 ability slot table
- [ ] Home + transfer polish
- [ ] Living tests against Desktop `Pokemon HeartGold Version.dsv`

---

## Key files

| Area | Path |
|------|------|
| Card UI | `src/components/ui/TcgCard.tsx` |
| Gen4 art maps | `src/core/constants/gen4-card-art.ts` |
| Energy icons | `src/core/constants/energies.ts` |
| HGSS templates | `public/cards/gen4/templates/` |
| Metrics (last reprocess) | `tmp/hgss_basic_metrics.json` |
| User template sources | `~/Desktop/HGSS_Card_Templates/` |

---

## Recent git (card work)

```
(pending) Reprocess all 7 HGSS basics, wire fighting/psychic/colorless
f8454ee Add HGSS Basic Water card template
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
6. **Update this file** at end of session.

---

## Quick “what to do next”

**Basic set done.** Next: Stage 1 / Stage 2 blanks when drawn. Optional metal/darkness. Hard-refresh after deploy (`?v=9`).
