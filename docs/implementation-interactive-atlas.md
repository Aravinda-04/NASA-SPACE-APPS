# Cinematic library and interactive expedition atlas

The selected book previously moved left, and the reader paired a left-hand index
with a right-hand dossier. The new library centres the original cover against a
softly blurred celestial environment. Opening it reveals the **atlas on the left
and chronological index on the right**, with the full dossier in a native detail
dialog. This extends the active `BookReader` and App callbacks.

## Components and state

- `ExpeditionLibrary.tsx`: measured centre offsets, themed backgrounds, keyboard
  volume switching, selection/opening phases, interrupted opening and reduced
  motion. The original separate book-cover layers and art are unchanged.
- `OpenedExpeditionJournal.tsx`: the facing-page composition, shared artifact
  selection, compact historical summary, mobile timeline/atlas navigation and
  expanded dossier. The prior `ChronologicalContentsSpread` export is retained
  as a compatibility alias.
- `InteractivePlanetAtlas.tsx`: lazy-loaded React Three Fiber globe/space atlas,
  real drag/wheel controls, accessible buttons, marker selection, labels,
  camera focus, on-demand rendering, texture ownership and WebGL fallback.
- `planetCoordinates.ts`: east-positive coordinate conversion, longitude
  wrapping, shortest angular interpolation and bounded focus easing.
- `atlas.ts`: local NASA texture references and explicitly schematic Solar System
  display geometry. These presentation points are not astronomical coordinates.
- `chronologicalArtifacts.ts`: the existing 13 histories, now with sourced site or
  regional pins and separate deep-space context targets. Playability continues
  to derive from the three existing mission registry entries.
- `ModalFrame.tsx` adds an optional close label; existing reward/Backpack behavior
  and labels are unchanged. `ArtifactDossierPage` remains the five-question
  evidence view and can still launch its linked original mission.

## Camera behavior

One transition ref owns movement. The camera's spherical angles and radius
interpolate with cubic easing; longitude uses the shortest wrapped angular
distance. The OrbitControls target also interpolates for schematic space targets.
Globe focus keeps the selected coordinate on the camera-facing hemisphere and
uses a bounded distance outside the sphere. Lighting follows the viewer for a
legible exhibit rather than pretending to reconstruct the Sun at an event time.

Dragging or scrolling cancels automatic focus and retains selection. A new
record or repeated activation of the selected record requests a fresh focus.
Focus Mission restores the view; overview, zoom, label and directional controls
work without a mouse. Reduced motion resolves directly to the target. React
state changes at interaction boundaries, not on each frame.

The renderer uses demand frames, a capped DPR, owned/disposed textures and the
controls' built-in cleanup. It pauses behind dossiers or Backpack and when the
document is hidden. Mobile timeline-only mode unmounts the atlas and releases its
renderer. WebGL is checked before Canvas creation; unavailable/lost contexts
retain a labelled location fallback, all histories and the original mission action.
Image-loading failure keeps a real interactive sphere with an explicit schematic
label. A newly loaded color map recreates the material so its map shader is
compiled correctly.

## Compatibility and scientific limits

`readingLocations` remains 0–3. The version-2 save only gains an accepted `atlas`
panel value; existing contents/dossier contexts normalize correctly. Opening a
book from the library starts at the atlas/index, preserving its selected record
and exact saved reading-page index for Resume. Returning directly from a mission
restores the current reader context and launcher focus. Archive selection and
dossier opening do not award progress or cards.

The [source ledger](design/chronological-source-ledger.md) documents pins,
planetocentric coordinates, approximate regions and missing coordinates. The
[asset ledger](../public/images/atlas/README.md) documents the actual NASA maps.
Lunar relief is illustrative bump shading, not calibrated terrain. Outer Space
uses a labelled mission-context schematic, not invented ephemerides. Kepler's
observation targets are never treated as visited destinations.

The established DM Serif Display / DM Sans fonts, paper, cover art and volume
palette are retained. The existing Figma file was reviewed (library inventory and
heading `9:19`) and was not modified. The CSS design detector flags the already
approved DM font names against legacy `JournalDisplay` / `JournalSans` aliases in
the YAML ramp; these are the same locally hosted faces, not new font choices.

## Verification

- `npm test`: existing scientific/progress/reward checks, 13 histories, source
  contracts, trajectory geometry, sourced coordinate conversion, wrapping/poles,
  shortest-path/easing bounds, valid schematic targets, local texture existence
  and additive atlas context migration.
- `npm run build`: TypeScript and Vite production build. The shared lazy Three.js
  controls/renderer chunk remains above Vite's 500kB advisory threshold. Library
  selection does not load an interactive mission or background 3D scene.
- `scripts/check-atlas-browser.mjs`: exported `verifyAtlasJourney(page, options)`
  creates isolated contexts and verifies the actual multi-book experience. The
  original `check-book-browser.mjs` entry point delegates to this current suite.
- Browser coverage includes centring, background transformation, keyboard/Escape,
  opening, correct left/right order, all 13 synchronized records and dossiers,
  actual Gale focus coordinates, schematic Jupiter focus, zoom/labels, real drag
  interruption and refocus, wheel zoom, Backpack pause, mission launch/return,
  reload, original science pages, citations and WebGL-unavailable fallback.
- Widths: 1440, 1024, 768, 390 and 320px. Assertions check HTML/SVG alignment,
  overlap, overflow, mobile panel/focus restoration and exact preservation of
  seeded discoveries, completion, earned timestamps and optional answers.
- Screenshots and detector output are retained in ignored `output/atlas-qa/`.
  Main-path console/runtime errors: zero.

No new UI framework or dependency was introduced. No unrelated missions, cards,
Backpack layouts or completion rules were rewritten. These edits are local and
have not been committed or pushed.
