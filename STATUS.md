# Pokedex — Living Status

**Purpose:** Hand-off doc for new AI/human sessions. Keep this updated when shipping work.  
**Repo:** `danielkimball/pokedex` · **Deploy:** Vercel (pushes to `main`)  
**Local:** `npm run dev` → `https://localhost:5173/` (HTTPS via `@vitejs/plugin-basic-ssl`)  
**Last updated:** 2026-07-30

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

### HGSS real card templates (Gen 4) — Basic + Stage 1 + Stage 2, all 7 energies

Files: `public/cards/gen4/templates/{basic|stage1|stage2}-{energy}.webp` — **21 frames**.

| Energy | Who gets it |
|--------|-------------|
| **fire** | Fire |
| **lightning** | Electric |
| **grass** | Grass / Bug |
| **water** | Water / Ice |
| **fighting** | Fighting / Rock / Ground |
| **psychic** | Psychic / Ghost / **Poison (Gen 3+)** |
| **colorless** | Normal / Flying / Dragon (+ Steel/Dark fallback) |

**Every HGSS Pokemon now lands on a real frame** — `resolveHgssTemplate()` returns
non-null for all 493 species × their stage, pinned by
`src/__tests__/hgss-card-templates.test.ts`. Nothing falls to `CssTemplate` any more.

**2026-07-30 — Stage 1 / Stage 2 + era retyping + WebP:**

- **Stage frames derived from the basics** by `tmp/hgss_make_stages.py`: repaint the
  capsule's own gradient over the baked `BASIC` lettering, redraw `STAGE 1` /
  `STAGE 2` in Gill Sans Bold with the same emboss. Nothing else in the frame moves,
  so `HGSS_ART_WINDOW` + `HGSS_LAYOUT` (renamed from `HGSS_BASIC_*`) cover all three
  stages. Drop hand-drawn blanks at the same paths to replace them.
- **Poison is Psychic from Gen 3 on.** `tcgEnergyForGen()` in `energies.ts`. EX Ruby &
  Sapphire moved every Poison-type out of Grass; Gen 1/2 cards keep the Base Set fold.
  This is what made Ekans/Arbok/Zubat/Grimer/Koffing show a leaf frame.
- **Source art's own stage tab is cropped off** (`HGSS_ART_TAB_STRIP` in `TcgCard.tsx`).
  The v5 crop kept the source card's tab, which ghosted under the real baked tab —
  a Stage 2 Venusaur showed "STAGE 1 · Evolves from Bulbasaur" underneath.
- **PNG → WebP q92.** 21 PNG frames would be 54 MB precached by the service worker;
  WebP is 4.1 MB total and visually identical (mean error ~2/255, alpha exact). Total
  precache dropped ~34 MB → 19.7 MB. `webp` added to workbox `globPatterns` in
  `vite.config.ts`. Template cache is now **`?v=10`**.

**Known era gap:** Steel → Metal and Dark → Darkness (Neo, 2000) are deliberately NOT
applied — no Metal/Darkness frame or energy icon exists, and routing those types to a
key with no assets would drop those 26 species back to the CSS placeholder. They stay
Colorless. Pinned by a test so it is a decision, not a bug.

**Source templates (user-provided):** `~/Projects/personal/pokedex/HGSS_Card_Templates/`

| Energy | pokedex source |
|--------|----------------|
| fire | `Basic_fire_Gen4.png` |
| lightning | `Electric_Template_Gen4_basic.png` |
| grass | `basic_leaf_template.png` |
| water | `Water_Template_gen4_basic.png` |
| fighting | `Fight_Template_Gen4_Basic.png` |
| psychic | `Pyschic_template_gen4_template.png` |
| colorless | `Normal_Template_gen4_basic.png` |

**2026-07-11 reprocess (HP removed from sources):**  
All 7 re-cut to **1062×1480**, art hole punched below BASIC tab (~12.3% top), per-energy `HGSS_ART_WINDOW` + `HGSS_LAYOUT`. Metrics in `tmp/hgss_basic_metrics.json`.

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
- `tcgEnergyUrl()` = Base Set fold (dex list `TypeBadge`, Gen 1/2 cards)  
- `tcgEnergyForGen()` / `tcgEnergyUrlForGen()` = era-correct, **use these on cards**  
- Electric → `lightning`; Ice → `water`; Bug → `grass`; Rock/Ground → `fighting`; Ghost → `psychic`; Normal/Flying/Dragon/Steel/Dark → `colorless`  
- **Poison → `grass` on Gen 1/2 cards, `psychic` on Gen 3+**  
- Cache bust: `ENERGY_CACHE_VER` in `energies.ts`

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

| Frame | Why it is missing |
|-------|-------------------|
| **Metal** (basic/stage1/stage2) | Steel Pokemon are Colorless until this exists — 8 species |
| **Darkness** (basic/stage1/stage2) | Dark Pokemon are Colorless until this exists — 18 species |

Stage 1 / Stage 2 for the 7 classic energies are **done** (derived — see below). Hand-drawn
replacements are welcome; drop them at the same paths and nothing else needs to change.

**Wiring a new energy:**

1. Drop the blank PNG in `~/Projects/personal/pokedex/HGSS_Card_Templates/`
2. Process: resize to **1062×1480**; punch **transparent art hole** below the stage tab (~12.3% top); keep yellow corners opaque
3. Save as `public/cards/gen4/templates/basic-{energy}.webp` (q92 WebP — see `tmp/hgss_make_stages.py`)
4. Run `python3 tmp/hgss_make_stages.py` to derive the stage1/stage2 frames
5. Add the energy to `HGSS_ENERGIES` in `TcgCard.tsx`
6. Measure art hole + silver lip %; add `HGSS_ART_WINDOW` + `HGSS_LAYOUT` entries
7. For Metal/Darkness also add the energy icon + wire the type in `ERA_TYPE_OVERRIDES` (`energies.ts`)
8. Bump the template `?v=`; hard-refresh; push `main` for Vercel

**Template cache:** `?v=10`.

### Known card quirks / polish

- [ ] Per-species hand crops when flavor bar/framing is ugly
- [ ] Gen 2 has art + CSS frame only (no real Neo PNG templates yet)
- [ ] Gen 3: no TCG art path (null art)
- [ ] Dual-type → single primary energy for frame color
- [ ] Stage 1/2 tabs say only `STAGE 1` / `STAGE 2` — real cards also carry
      "Evolves from X" + a pre-evo thumbnail in a wider tab
- [ ] `WEAKNESS` in `TcgCard.tsx` is keyed on the game type, not the TCG type
- [x] ~~Stage 1/2 use the CSS placeholder~~ — shipped 2026-07-30

### Product / infra backlog

- [ ] Real Gen 2/3 stage frames
- [ ] Ability display completeness / Gen 3 ability slot table
- [ ] Home + transfer polish
- [ ] Living tests against `~/Projects/personal/pokedex/game_saves/Pokemon HeartGold Version.dsv`

---

## Key files

| Area | Path |
|------|------|
| Card UI | `src/components/ui/TcgCard.tsx` |
| Gen4 art maps | `src/core/constants/gen4-card-art.ts` |
| Energy icons + era retyping | `src/core/constants/energies.ts` |
| HGSS templates | `public/cards/gen4/templates/` |
| Stage-frame generator | `tmp/hgss_make_stages.py` |
| Template coverage tests | `src/__tests__/hgss-card-templates.test.ts` |
| Metrics (last reprocess) | `tmp/hgss_basic_metrics.json` |
| User template sources | `~/Projects/personal/pokedex/HGSS_Card_Templates/` |

---

## Recent git (card work)

```
(pending) HGSS Stage 1/2 frames, era-correct Poison energy, WebP templates
f5b2d20 Reprocess all HGSS Basic templates and wire full energy set
f8454ee Add HGSS Basic Water card template
1e1ad7d Replace HGSS lightning with Yellow_template; reapply grass
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

**All 21 classic frames done — no HGSS Pokemon falls to the CSS placeholder.**
Next: Metal + Darkness blanks (26 species are on the Colorless fallback), "Evolves from X"
in the stage tab, then Gen 2/3 real frames. Hard-refresh after deploy (`?v=10`).
