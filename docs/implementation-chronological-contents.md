# Interactive chronological contents

The primary spread layout in this earlier handoff is superseded by
[the interactive-atlas implementation](implementation-interactive-atlas.md).
The historical data, trajectory and save-compatibility foundations remain in use.

The active reader previously opened one of four numbered reading pages and had
no historical artifact selection. `BookReader` now adds a separate Contents view
with an interactive curved index and synchronized artifact dossier. The library,
mission launcher, scientific interactions, evidence tasks and reward system are
retained.

## Files and responsibilities

- `src/data/chronologicalArtifacts.ts`: 13 source-backed records (4 Moon, 5 Mars,
  4 Outer Space), source reuse and registry-derived playability.
- `src/utils/contentsTrajectory.ts`: variable-count cubic Bézier path and shared
  relative coordinates, including empty and single-node geometry.
- `CurvedContentsTimelinePage.tsx`: semantic chronological buttons, compass
  states, leaders, arc-length progress, keyboard focus and source-era labels.
- `ArtifactDossierPage.tsx`: five field notes, scrollable desktop reading region,
  real source links, existing mission callback and accessible source action.
- `ArtifactAtlasPreview.tsx`: lightweight SVG coordinate grid, hardware study or
  explicitly conceptual historical journey; independent of WebGL.
- `ChronologicalContentsSpread.tsx`: selection synchronization, mobile panel and
  return-focus behavior.
- `BookReader.tsx` / `book.css`: integration, chapter navigation and material
  hardbound spread using the established paper, serif and volume identities.
- `App.tsx`: saves reading context and restores mission-return focus, including
  return from the lazy-loading screen. Launch still uses `activeMissionId`.
- `types/expedition.ts` / `utils/expeditionProgress.ts`: additive context schema
  and normalization.

## Save compatibility

The storage key and save version remain `offworld-expedition:v2` and version 2.
`readingLocations` still means introduction = 0, story = 1, science = 2 and
briefing = 3. No indices are shifted. Existing v1 migration remains intact.

Optional `readingContexts[missionId]` stores `view`, `artifactId` and the mobile
`panel`. Older saves first open Contents and offer a labelled Resume action to
their exact saved reading page. New contexts restore their previous reading
view. Artifact IDs are checked against the current volume, with the first record
as a fallback if a saved record has been retired. Opening an archive does not
write discoveries, completion, collection metadata or optional answers.

## Design and interaction

The existing Figma file `SLXKYkJoQ1VipdH1vGLdJ6` was reviewed, including its Books &
Storytelling inventory and StoryNavigation component (`6:401`). Its paper/ink,
editorial fonts, 48px actions and original navigation conventions were retained.
Figma was not modified. Local SVGs provide the new diagrams; no temporary Figma
asset URLs are used.

Desktop has facing pages, binding shading, stitched details, subtle paper grid,
running headers and folios. At 800px and below it becomes a single-page contents
or dossier view. Mobile Back restores the selected contents button. Timeline
rows are HTML buttons: Tab/Enter/Space work; Up/Down/Home/End move list focus.
The SVG itself is decorative and has no inaccessible SVG-only controls.

The same fractional row centres drive HTML badges and SVG coordinates. The
active stroke uses the actual Bézier path's measured arc length to the selected
node. System reduced motion removes the stroke transition. Five dossier sections
remain reachable in a labelled, keyboard-scrollable desktop region and flow in
full on mobile. Historical links open new tabs with `noopener noreferrer`.

See [the source ledger](design/chronological-source-ledger.md) for chronology,
coordinate conventions and preview limits.

## Verification

- `npm test`: existing mission/progress/reward/science checks plus 13 source
  records, exactly three playable links, sorted chronology, coordinate bounds,
  0/1/2/4/5/9-node geometry and context migration/roundtrip checks.
- `npm run build`: TypeScript and Vite production build.
- `scripts/check-book-browser.mjs`: reusable Playwright suite, exported as
  `verifyBookReader(page, { baseURL, outputDirectory })`. Run it with a Page from
  an installed Playwright runner; it creates and closes its own isolated browser
  context and never replaces the user's save. No test framework was added.
- Actual Chromium verification: all 13 dossier selections, source-link attributes,
  correct mission launch/return for all three volumes, focus restoration, reload,
  all original reading sections and preservation of seeded completion, earned
  timestamp and optional answers. No browser console or runtime errors.
- Widths: 1440px desktop; 1024px tablet; 768px, 390px and 320px single-page mode.
  Assertions check curve/badge alignment, row overlap and horizontal overflow.
- Visual captures are retained in `docs/quality/chronological-contents/`.

The existing lazy-loaded Three.js exploration chunk still triggers Vite's
greater-than-500kB advisory. The new atlas does not load that chunk. No additional
playable missions, rewards, high-detail terrain or live spacecraft tracking were
introduced. The design detector reports palette/type-ramp advisories in the
shared legacy book stylesheet; those are not runtime or build failures.
