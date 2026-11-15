# Stage 4 restart — checkpoint blocked

The failed flip has been removed from the working source. Stage A has not started.
No commit or `stage3-approved` tag was created: this workspace permits read access
to `.git` but rejects git's index lock and object writes. Do not treat the working
tree as a completed checkpoint.

## Stage 3 provenance

Stage 3 was implemented in Antigravity. Its original final audit report is retained
in `stage3/antigravity-final-audit.md`. The matching Stage 3 scripts, fixture and
screenshots remain in `scripts/`. That report is historical evidence, not a new
audit run. No saved pre-flip source revision was found in Antigravity's editor
history or git. The reader was reconstructed by preserving the current Stage 2/3
fit block and source-dropdown wrapper and restoring the original static reader
rendering/navigation. All CSS preceding the explicit Stage 4 block was retained.

Before editing, every modified/untracked file was archived in
`output/stage4-restart/pre-reset-worktree.zip`, with the tracked diff and file list
beside it. The reset can therefore be reviewed and recovered.

## Why the failed attempt missed the target

1. **Rigid geometry.** One rectangle rotated around the spine. `rotateZ`, skew and
   a moving gradient cannot bend its free edge or create a diagonal paper fold.
2. **Repeated live spreads.** Each half rendered an entire spread and clipped it.
   Turning replaced the static tree with several new trees, recreating map and
   event state and risking visible jumps when the trees were replaced on landing.
3. **Changed landed appearance.** Added hardcover, stack and spine overlays and
   global stage overrides changed the approved static rendering before any turn.
4. **Fragile gesture handling.** Pointer-down was attached to corner elements that
   disappeared when dragging started. Large corner/edge overlays could intercept
   underlying controls. Release used absolute velocity, including motion in the
   wrong direction. In-flight navigation requests were discarded.
5. **Incomplete navigation/accessibility contract.** Multi-spread requests skipped
   intermediate leaves. Reduced motion hard-cut instead of crossfading. The engine
   also added unsolicited page sound.
6. **Insufficient visual proof.** Existing tests did not establish pixel parity,
   frame-zero parity, listener stability or turn frame time. The inherited Stage 3
   matrix calls device scale factor "zoom"; device scale factor is not browser
   zoom, so those results do not establish the requested zoom matrix.

## Reading order and test specimens

Every existing spread has a left and right page, including the Pioneer science
spread (`science-copy`, `science-interaction`). The production order can be
`[L0,R0,L1,R1,L2,R2,L3,R3]`. A leaf pairs `Rk` with `L(k+1)`; no existing
desktop spread inherently breaks that pairing.

The map/contents are spread 0. Event steps are spread 2. Existing sources
dropdowns are on spreads 1 and 3; the event page has no dropdown to preserve.
A four-page map/event specimen would skip spread 1 and must be labeled as a test
specimen, never installed as the production reading order. A separate four-page
sources/event specimen can exercise the existing dropdown without adding content.
The original journal has an 800px mobile panel mode; this needs inspection before
assuming it is equivalent to a single-page flip engine.

## Verification in this restart

| Check | Result | Evidence |
|---|---|---|
| Backup before reset | PASS | 96 modified/untracked files archived |
| Failed engine/CSS/wiring removed | PASS | No production `BookFlipEngine` import or Stage 4 CSS block |
| Stage 3 fit rules retained | PASS (source) | Fit effects and all pre-Stage-4 CSS preserved |
| Production build | PASS | `npm run build` |
| Existing non-browser tests | PASS | `npm test` |
| Approved commit and tag | FAIL — blocked | `.git/index.lock` and `.git/objects` writes denied |
| StPageFlip installation | FAIL — blocked | npm registry DNS/network unavailable; dependency files unchanged |
| Browser access to preview | FAIL — blocked | Browser timed out on local preview; shell loopback access denied |

## Requested Stage A acceptance

| Acceptance test | Result |
|---|---|
| 1. Landed pixel diff, all viewports and browser zooms | FAIL — not established; no spike or new captures |
| 2. Frame-zero parity and no reflow during turn | FAIL — not established; no spike |
| 3. Full Stage 3 browser/content audit after landing | FAIL — not rerun; inherited report is not a new pass |
| 4. Map, dropdown, event and contents interaction isolation | FAIL — not established; no spike |
| 5. Navigation interruption, bounds and release consistency | FAIL — not established; no spike |
| 6. Console, listeners after 50 turns, mean frame time below 16ms | FAIL — not measured; no spike |

No frames or video have been produced in this restart. Do not approve Stage A or
proceed to B–E based on this reset report.

## Resume point

First allow local git metadata writes and secure the restored Stage 3 state with
the requested commit/tag. Review the reconstruction against the retained Stage 3
captures before claiming exact visual parity. Then obtain `page-flip` from its
official npm distribution and build only an isolated HTML-mode specimen. Keep
`BookReader`, its fit CSS and the production cover/close flow unchanged during A.
If the HTML fold cannot match the requested curved appearance or requires
animating clip paths beyond the transform/opacity rule, show that discrepancy
and obtain approval for an alternative before building it.
