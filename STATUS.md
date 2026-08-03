# Pokedex — Living Status

**Purpose:** Hand-off doc for new AI/human sessions. Keep this updated when shipping work.  
**Repo:** `danielkimball/pokedex` · **Deploy:** Vercel (pushes to `main`)  
**Local:** `npm run dev` → `https://localhost:5173/` (HTTPS via `@vitejs/plugin-basic-ssl`)  
**Last updated:** 2026-07-31

---

## ▶ IN PROGRESS (2026-08-03)

### Blocked on Dan — blank templates for the other eras

**`TEMPLATES-NEEDED.md` at the repo root is the shopping list.** 87 blanks, 21 already
done (Gen 4 HGSS). Generated from the art maps, so every row is a frame something
actually lands on, and each names two real common (non-holo) cards to strip.

Why: Gen 4 art comes from three blocks with different frames (D&P, Platinum, HGSS) and
everything currently renders on the HGSS frame. 28 of Dan's 174 cards are on the wrong
one — Charizard is Arceus-era art in an HGSS frame, which is what he flagged. Gen 1 has
Basic frames only; Gen 2 has art but no frames; Gen 3 has neither.

Agreed order: Platinum (21) → D&P (11) → Gen 1 stages (14) → Gen 2 Neo (21) → Gen 3 EX (20).

When blanks land, per block: process to 1062×1480 + punch the hole
(`tmp/hgss_repunch_hole.py`), derive stage variants if only Basic is supplied
(`tmp/hgss_make_stages.py`), measure `HGSS_ART_WINDOW` + `HGSS_LAYOUT` equivalents, then
add **per-block routing** — `resolveHgssTemplate` currently keys on game only, and needs
to key on the source set of `monCardArt`, mapped through the block table in
`TEMPLATES-NEEDED.md`.

### Bug 3 (OPEN) — "Held:" not centred in its silver pill

`H.heldPill` in `TcgCard.tsx` — text sits on the bottom edge of the capsule instead of
optically centred. Per-energy `heldPillTop` in `HGSS_LAYOUT`.

---

### Bug 2 — leftover pre-evolution circle from D&P-era art — **FIXED 2026-07-31**

The Gen 4 illustrations come from ~21 sets across three blocks, and the blocks do not
lay out the pre-evolution the same way:

- **D&P block** (Diamond & Pearl … Stormfront, incl. Great Encounters): the pre-evo
  circle **overhangs the artwork** at the top-left, so our crop carries the bottom of
  that circle into the card. Dan spotted it on Arbok (`dp4/33`).
- **HGSS block**: the pre-evo sits in the header, top-left, beside the name — above
  the crop, so nothing leaks in.

Fix: render our own evolution badge — pre-evo sprite in a disc plus an "Evolves from X"
pill — **where D&P puts its own**, over the art's top-left corner just under the stage
tab. It lands on top of the leftover instead of beside it, so one element both adds the
feature Dan wanted and hides the artifact, with no extra crop off the illustration.
Cropping it away instead would have cost ~17% off the top of every D&P-sourced card.

- `preEvolutionOf()` in `tcg-card.ts` walks the **game** chain, so Raichu evolves from
  Pikachu, not Pichu.
- The badge is gated on `stage !== 'Basic'`, so the TCG baby rule holds: Pikachu and
  Clefairy are Basic cards and show no evolves-from line. Pinned by a test that sweeps
  all 493 species.
- `H.evoRow` / `H.evoSprite` / `H.evoPill` in `TcgCard.tsx`. Geometry is sized to the
  leftover: it occupies roughly x 7-18%, y 10.4-17% of the card, and the stage tab
  already hides everything above 12.2%.

**Not done, and probably fine:** no new templates. Dan wondered whether differing source
sets would force per-set frames — they do not. Only the pre-evo placement differed, and
one badge covers every block.

---

### Bug 1 — blank gap along the top of every illustration — **FIXED**

**Symptom:** on every card, all three stages, there is a light empty strip across the
top of the art window — most visible immediately to the right of the `BASIC` /
`STAGE 1` tab where the tab overhangs the art. The illustration sits too low / too
short inside the hole. Introduced (or exposed) by `HGSS_ART_TAB_STRIP` in
`src/components/ui/TcgCard.tsx`, added in `bed8b8e` to crop the source card's own
stage tab out of the top of the crop.

**Target:** the art fills the transparent hole exactly, like a real HGSS card —
no gap, no overhang past the frame, no stretching or changed aspect. Compare against
`HGSS_Card_Templates/actualcards/en_US-HGSS1-011-shuckle.jpg` and
`en_US-HGSS1-061-cyndaquil.jpg`, plus the real Caterpie (HGSS 57/123) Dan sent.

**Knobs involved:**
- `HGSS_ART_TAB_STRIP` / `HGSS_ART_ZOOM` — the bottom-anchored zoom (`transform:
  scale()` + `transformOrigin: '50% 100%'`) on the `<img>` in `HgssTcgCard`.
- `HGSS_ART_WINDOW` — per-energy hole rect, measured from the template alpha. Verified
  2026-07-30 to match the alpha bbox exactly, and each hole is a solid rectangle.
- Source crops: `public/cards/gen4/<set>/<num>.jpg`, cut at
  `(0.040, 0.075, 0.960, 0.490)` of the source card by `tmp/gen4_download_crop.py`.
  **Suspect:** that crop is not uniform in what it captures above the illustration —
  different sets put the illustration box at different heights, so one fixed
  `HGSS_ART_TAB_STRIP` cannot be right for all of them.

**DIAGNOSED 2026-07-30 — it is the template, not the art.**

Measured, not eyeballed:

- The art image **does** fill the transparent hole completely. Painting the art
  holder magenta and screenshotting shows zero uncovered magenta. `HGSS_ART_WINDOW`
  matches each template's alpha bbox exactly.
- The hole itself is punched **~26px too low**. Profiling `basic-grass.webp` down
  column x=60%: the silver rail ends at y≈154 (10.4%), then there is a band of
  **flat opaque white (lum 254, alpha 255) from y≈156 to y≈181**, and only at
  y=182 (12.30%) does alpha go to 0. That white band is the "gap".
- On a real HGSS card the art starts at **10.16%** of card height — immediately
  below the rail, with the stage-tab capsule *overhanging the artwork*. Measured on
  `HGSS_Card_Templates/actualcards/en_US-HGSS1-061-cyndaquil.jpg` (734×1024), art top
  y=104 at every column sampled. Ours starts at 12.30%. That 2.1pp is the gap.
- Second, smaller error: `HGSS_ART_TAB_STRIP = 0.1157` is far too aggressive. The
  source crops only contain ~10px of 423 (**~2.4%**) of the source card's own stage
  tab — e.g. `public/cards/gen4/hgss1/57.jpg`. Zooming 13% shaves real illustration
  off the top for no reason. Once the hole reaches up under our own opaque tab, the
  source tab is hidden by it and this strip can go to ~0.

**Fixed by `tmp/hgss_repunch_hole.py`** — re-punches all 21 frames so the hole reaches
the rail. Art tops are now 10.14-10.47%, against the real card's 10.16%.

Two dead ends worth not repeating, both of which *looked* fine at thumbnail size:

- **Per-row colour walks to find the capsule's edge.** The band is flat 254 on
  fire/grass but textured on water, lightning and fighting, so the walk stopped at a
  different x on every row and left ragged horizontal slivers of template under the
  rail. The capsule sits identically on all 21 frames, so the taper is now read
  **once** off `basic-fire.webp` (its flat white band makes the silhouette
  unambiguous) and reused for every frame.
- **Starting that walk on the hole's right edge.** That column is the frame's bevel,
  nowhere near the band colour, so the walk exited immediately and most rows were
  never punched at all. Sample and start `BAND_INSET` in from the edge.

`HGSS_ART_WINDOW` heights carry **+0.10 over the measured alpha bbox**: without it the
box rounds a device pixel short at some widths and leaves a hairline of bare hole along
the bottom. The overshoot hides behind the opaque silver lip.

`HGSS_ART_TAB_STRIP` dropped 0.1157 -> **0.024**, the real amount of source-card stage
tab in the crops. The old value shaved ~13% off the top of every illustration.

Template cache is now **`?v=11`**.

**Verification harness (scratch — rebuild it):** `cardlab.html` at the repo root +
`tmp/cardlab.tsx` render `<TcgCard>` straight from `tmp/records.json`. A Playwright
script paints the art holder magenta: any magenta left on screen is hole the art fails
to cover. A second builds a contact sheet of just the tab/art junction. Checked clean
on 12 species covering all 7 energies and all 3 stages.

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
