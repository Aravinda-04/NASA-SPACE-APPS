# Stage A — isolated HTML fold spike, not accepted

Checkpoint verified: `stage3-approved` points to `659a4fb`.
The installed engine is the MIT-licensed `page-flip` 2.0.7.

## Scope

The production entry, all 44 checkpoint source files, page content, fitting CSS,
and cover/open/close code are unchanged. The standalone development entry is
`/flip-spike.html`; production `index.html` does not import it.

The default four-page specimen uses Pioneer's real atlas, contents, science copy,
and light-time interaction (including the real native dropdown). It deliberately
samples source spreads 0 and 2 for this experiment. Production order must remain
`[L0,R0,L1,R1,L2,R2,L3,R3]`, with each leaf pairing `Rk` and `L(k+1)`.
The Pioneer investigation is a physical-page exception: its approved columns are
366.25px and 805.75px, with the right interaction crossing the 620px spine. The
HTML adapter clips that existing layout. No layout correction is authorized.
The specimen's omitted spread 1 must never become the production order.

Each source spread renders once. Only empty styling shells and decorative binding
elements are copied; page content and canvases are moved, not cloned. React's
portal target is the common scaler ancestor, so relocated pages remain inside its
event delegation boundary. The engine transforms wrapper hosts; Stage 3's fit
cleanup can continue touching real page elements without erasing engine transforms.
Cleanup restores the original DOM parents before destroying the engine.

The original Stage 3 `BookReader` still owns the stage size and whole-book scale.
The adapter maps screen coordinates into its unchanged 1240×660 coordinate system.
The library's unrestricted mouse handlers are disabled. Margins/corners are gated
before input reaches the engine, including ancestor checks for nested button SVGs,
map controls, contents records, sliders and native selects.

## Review URLs

Start the existing Vite development server, then open:

- `/flip-spike.html`: Pioneer atlas/contents → light-time event/dropdown specimen.
- `/flip-spike.html?mission=curiosity`: atlas/contents → real EDL event steps.
- `/flip-spike.html?fixture=sources-event`: actual source dropdown and event pair.
- `/flip-spike.html?fixture=all`: full eight-page order, for later navigation audits.
- `/flip-spike.html?baseline=true`: original static reader for the specimen's first spread.
- `/flip-spike.html?baseline=true&start=1`: original static reader for its second spread.
- Append `frame=0`, `25`, `50`, `75`, or `100` to freeze an actual engine turn phase.
- Append `benchmark=50` to request fifty alternating turns and collect timing samples.

The frame parameter represents geometric positions in the library's frame array,
not elapsed-time percentages. At 0 it executes the library's actual first frame,
which must be compared with the separate static baseline; it does not substitute
the static screenshot. Inspect reduced-motion separately because the specimen
respects the user's reduced-motion setting.

The engine host's `data-report` attribute exposes live page-box measurements,
landed page index, turn state, sampled engine callback work and frame intervals.
It explicitly identifies the listener audit as unmeasured. Callback work is not
the same as presentation frame interval or GPU time. A lifecycle/listener audit
and captured browser console are still required.

## What does not match the requested target

Source inspection of 2.0.7 establishes these limitations; they are not a claim
that the visual comparison has been completed:

- HTML soft pages are planar polygons with changing clip paths and rotations.
  They do not have a curved three-dimensional surface or a rounded free edge.
- The engine changes clipping, shadow widths and gradient backgrounds while
  turning. It does not satisfy a literal transform/opacity-only animation rule.
- Its default click animation starts from an already lifted corner. Frame-zero
  continuity must be checked and cannot be assumed.
- The HTML engine has no independent specular fold highlight, responsive spine
  gutter or progressing page-stack volume. Those have not been added during A.
- This isolated specimen keeps the first reader's header/navigation chrome.
  It is not evidence of production header, contents jumps, close transitions or
  full-viewport parity after landing.
- The optional all-spreads probe currently mounts all four spreads. Production
  neighbor windowing is not implemented or claimed by this specimen.
- The original journal has a mobile panel mode at 800px. Whether it should map
  to an engine's portrait page mode remains undecided; no mobile flip change is made.

The engine's own teardown omits a renderer stop method and can retain its resize
listener when native input is disabled. The adapter scopes/cancels its RAF chain
and enables native teardown before destruction. This requires runtime verification;
source fixes alone do not establish listener or performance acceptance.

## Verification performed

| Check | Result |
|---|---|
| Approved tag and dependency present | PASS |
| Checkpoint source preservation | PASS — all 44 source files match after git line-ending normalization |
| Production TypeScript/Vite build | PASS |
| Separate spike Vite build | PASS |
| Existing project non-browser tests | PASS |
| Scaled-coordinate/margin/signed-release tests | PASS — 35 cases |
| Protected production reader/CSS/cover diffs | PASS — none |

Commands: `npm run build`, `npm test`, `node scripts/check-flip-spike.mjs`, and
`npx vite build --config vite.spike.config.ts`.

The original browser audit's reported 47/47 result is the Antigravity handoff,
not a rerun during this spike. Its "zoom" matrix still changes device scale
factor, not browser zoom. It also checks selected text strings using body text
and a spread rectangle, not every fixture item or per-line clipping. A fresh
audit scoped to visible landed pages is needed for the stronger acceptance contract.

## Live evidence and acceptance

The normal-terminal HTTP server became accessible. The live atlas renders and
passes drag, zoom, focus and contents-selection checks without starting a turn.
The earlier offline blank canvas is not the live result.

Captured at 1536×864 with loaded local fonts:

- Five actual engine phases: 0%, 25%, 50%, 75%, 100%. The first frame is already
  peeled; it is not the required identical static start.
- A timestamped recording of a real short drag/snap-back, a completed corner drag,
  and a backward edge-click turn. Recording cadence is about 17–25 captured fps;
  it preserves captured timing and adds an end hold, not interpolated motion.
- Settled Stage 3 static map/event baselines and a six-panel comparison sheet.
- Live text-range audit: Pioneer map 56 lines, zero clipping and zero document
  overflow; landed Pioneer science 38 lines, **16 clipped text ranges**.
- Curiosity event selection and next-event controls work. Its sources dropdown
  stays open after a round trip; its landed audit checks 43 lines with no clipping,
  no document overflow and no scrollbars.
- The Pioneer native distance dropdown opens and changes to Earth–Moon distance
  without turning a page, but its label/control remain visibly clipped.
- Opposite-direction interruption, rapid forward requests at the last specimen
  spread, repeated backward requests at the first, and both recorded drag release
  outcomes finish at consistent indices.
- Fifty alternating real turns finish at page 0 in `read` state. Console errors:
  **0**. Live map canvases: **1**. Page hosts: **4**. Average engine callback work:
  **0.39ms**. Average measured RAF interval: **7.19ms** in this session. These are
  session measurements, not a hardware-independent performance guarantee.

The listener inventory is still unmeasured. Do not infer absence of leaked
listeners from stable DOM counts or zero console errors.

The comparison JSON records decoded JPEG pixel differences, including a separate
16/255 channel tolerance. It confirms a large landed mismatch. JPEG comparisons
are not a completed lossless 16-configuration parity audit.

| Requested acceptance test | Result | Evidence / limit |
|---|---|---|
| 1. Landed pixel diff <0.5% across the full viewport/zoom matrix | FAIL | Confirmed Pioneer mismatch at 1536×864; remaining matrix not completed |
| 2. Identical frame zero and no reflow | FAIL | First engine frame already folds a ~66px corner; frame-zero image included |
| 3. Full Stage 3 clipping/content/scroll audit on every landing | FAIL | 16 clipped Pioneer text ranges; full historical matrix not rerun |
| 4. Map, dropdown, event steps and input isolation | FAIL for visual fit | Live actions work and do not flip; Pioneer control/text clipping remains |
| 5. Bounds, rapid/opposite navigation and drag release | PASS for the four-page specimen | Tested both boundaries, repeated/opposite requests, snap-back and completed drag; production jumps/cover remain outside A |
| 6. Console, listeners after 50 turns, frame time | FAIL — listener audit incomplete | 50 turns, zero errors, 0.39ms work / 7.19ms interval; listeners not measured |

## Decision gate

**Stage A is not accepted. No production integration B–E has started.** All 44
checkpoint source files still match the approved tag after line-ending
normalization. Production build, spike build, TypeScript and the 35 coordinate/
margin/release checks pass. The existing non-browser project tests also pass.

The HTML fold visibly approximates a curled sheet with diagonal clipping and
shadow gradients; it has no curved mesh/free-edge volume, responsive stack
thickness or specular fold highlight. It also animates clip paths and gradients,
which exceeds the literal transform/opacity-only rule.

Recommended next experiment: a **WebGL mesh curl using page snapshots during the
turn, restored to the same live DOM on landing**. Snapshot physical page halves
can preserve Pioneer's original spread crossing the spine without reflowing its
controls or changing Stage 3 CSS. Content on a turning snapshot would be frozen
until landing. This is a proposal only; implementation requires the user's
approval. The approved layout will not be changed to force it into this engine.

Evidence is in `output/stage4-spike/evidence/`; `stage-a-evidence.zip` includes
frames, recording, baselines, comparison sheet and measured results. Rebuild the
review media with `python scripts/package-flip-evidence.py`.
