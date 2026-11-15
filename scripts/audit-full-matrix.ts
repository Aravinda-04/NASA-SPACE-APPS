import { spawn, type ChildProcess } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { CDPClient } from "./cdp-client.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotsDir = path.join(__dirname, "full-matrix-screenshots");
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

interface MatrixResult {
  mission: string;
  spread: number;
  state: string;
  viewport: string;
  status: "PASS" | "FAIL";
  maxBottom: number;
  spreadBottom: number;
  failures: string[];
}

async function runFullMatrixAudit() {
  console.log("==========================================================================");
  console.log("       STARTING STAGE 3 FINAL FULL-APPLICATION MATRIX AUDIT               ");
  console.log("==========================================================================\n");

  const chrome: ChildProcess = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9222",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "--hide-scrollbars",
    "http://localhost:5173/?audit_debug=true",
  ]);

  let cdp: CDPClient | null = null;
  for (let attempt = 0; attempt < 10; attempt++) {
    await new Promise((r) => setTimeout(r, 600));
    try {
      cdp = await CDPClient.connect(9222);
      if (cdp) break;
    } catch {}
  }

  if (!cdp) {
    console.error("Failed to connect to CDP");
    chrome.kill();
    process.exit(1);
  }

  await cdp.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });

  let currentMission: string | null = null;
  let currentSpread = 0;

  async function openMission(missionId: string) {
    if (currentMission === missionId) return;

    const carouselId =
      missionId === "surveyor"
        ? "moon"
        : missionId === "curiosity"
          ? "mars"
          : "outer-space";

    console.log(`[Nav] Opening mission: ${missionId}...`);

    if (currentMission !== null) {
      await goToSpread(0);
      await new Promise((r) => setTimeout(r, 300));
      await cdp.eval(`
        (() => {
          const exitBtn = Array.from(document.querySelectorAll('button')).find(b =>
            b.innerText.includes('Expedition Library') || b.innerText.includes('CLOSE BOOK')
          );
          if (exitBtn) exitBtn.click();
        })()
      `);
      await new Promise((r) => setTimeout(r, 400));
    }

    await cdp.eval(`
      (() => {
        const backBtn = document.querySelector('.library-back-button');
        if (backBtn) backBtn.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 200));

    await cdp.eval(`
      (() => {
        const b = document.querySelector('.holo-book[data-book="${carouselId}"]');
        if (b) b.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 250));

    await cdp.eval(`
      (() => {
        const b = document.querySelector('.holo-book[data-book="${carouselId}"]');
        if (b) b.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 250));

    await cdp.eval(`
      (() => {
        const btn = document.querySelector('.library-intro-actions button');
        if (btn) btn.click();
      })()
    `);
    const waitStart = Date.now();
    while (Date.now() - waitStart < 8000) {
      const mounted = await cdp.eval(`!!document.querySelector('.reader-book-scaler')`);
      if (mounted) break;
      await new Promise((r) => setTimeout(r, 200));
    }
    await new Promise((r) => setTimeout(r, 400));

    currentMission = missionId;
    currentSpread = 0;
  }

  async function goToSpread(targetSpread: number) {
    if (currentSpread === targetSpread) return;

    console.log(`[Nav] Moving from spread ${currentSpread} -> ${targetSpread}...`);

    if (targetSpread > currentSpread) {
      for (let s = currentSpread; s < targetSpread; s++) {
        await cdp.eval(`
          (() => {
            const nextBtn = document.querySelector('.reader-pagination .ow-primary');
            if (nextBtn) nextBtn.click();
          })()
        `);
        await new Promise((r) => setTimeout(r, 350));
      }
    } else {
      for (let s = currentSpread; s > targetSpread; s--) {
        await cdp.eval(`
          (() => {
            const prevBtn = document.querySelector('.reader-pagination button:first-child');
            if (prevBtn) prevBtn.click();
          })()
        `);
        await new Promise((r) => setTimeout(r, 350));
      }
    }
    currentSpread = targetSpread;
  }

  async function evaluateLayout(baselineTexts: string[]) {
    return await cdp.eval(`
      (() => {
        const failures = [];
        const scaler = document.querySelector('.reader-book-scaler');
        if (!scaler) {
          return { passed: false, failures: ['reader-book-scaler container not found'], maxBottom: 0, spreadBottom: 0 };
        }

        const spread = document.querySelector('.chronological-spread') ||
                       document.querySelector('.reader-spread') ||
                       document.querySelector('.light-time') ||
                       scaler;
        const spreadRect = spread.getBoundingClientRect();

        let maxChildBottom = 0;
        let culprit = null;

        // Check descendant bounds against spread
        const allDescendants = Array.from(spread.querySelectorAll('*'));
        allDescendants.forEach(el => {
          if (el.offsetWidth === 0 && el.offsetHeight === 0) return;
          if (el.closest('defs, clipPath')) return;
          const r = el.getBoundingClientRect();
          if (r.bottom > spreadRect.bottom + 6) {
            const overflow = Math.round(r.bottom - spreadRect.bottom);
            const tag = el.className || el.tagName;
            failures.push('Overflow beyond spread: <' + tag + '> by ' + overflow + 'px');
          }
          if (r.bottom > maxChildBottom) {
            maxChildBottom = r.bottom;
            culprit = el.className || el.tagName;
          }
        });

        // Check scrollbars
        const scrollable = [];
        const allElements = Array.from(document.querySelectorAll('*'));
        allElements.forEach(el => {
          if (el.scrollHeight > el.clientHeight + 2) {
            const style = window.getComputedStyle(el);
            if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
              scrollable.push(el.className || el.tagName);
            }
          }
        });
        if (scrollable.length > 0) {
          failures.push('Scrollbar present on: ' + scrollable.join(', '));
        }

        // Check cut text
        const textElements = Array.from(spread.querySelectorAll('p, span, h2, h3, dt, dd, li'));
        textElements.forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.bottom > spreadRect.bottom + 2 && r.top < spreadRect.bottom) {
            failures.push('Cut text: "' + (el.innerText || '').slice(0, 30) + '..."');
          }
        });

        // Baseline text verification
        const domText = (document.body.innerText + ' ' + document.body.textContent).toLowerCase();
        const baselineList = ${JSON.stringify(baselineTexts)};
        for (const str of baselineList) {
          if (!domText.includes(str.toLowerCase())) {
            failures.push('Missing baseline text: "' + str + '"');
          }
        }

        return {
          passed: failures.length === 0,
          failures: Array.from(new Set(failures)),
          maxBottom: Math.round(maxChildBottom),
          spreadBottom: Math.round(spreadRect.bottom),
        };
      })()
    `);
  }

  const results: MatrixResult[] = [];

  // Default viewport 1536x864
  await cdp.setViewport(1536, 864, 1.0);

  // Test matrix covering all volumes and spreads
  const testMatrix = [
    // --- CURIOSITY ---
    {
      mission: "curiosity",
      spread: 0,
      state: "atlas_and_contents",
      setup: async () => {},
      required: ["A world of discoveries", "Viking 1", "Ingenuity", "p. 01 — Planetary atlas"],
    },
    {
      mission: "curiosity",
      spread: 1,
      state: "story_sources_closed",
      setup: async () => {
        await cdp.eval(`(() => { const d = document.querySelector('details.reader-sources'); if (d) d.open = false; })()`);
        await new Promise((r) => setTimeout(r, 200));
      },
      required: ["An object becomes evidence", "Gale Crater", "Look a little closer"],
    },
    {
      mission: "curiosity",
      spread: 1,
      state: "story_sources_open",
      setup: async () => {
        await cdp.eval(`(() => { const d = document.querySelector('details.reader-sources'); if (d) d.open = true; })()`);
        await new Promise((r) => setTimeout(r, 250));
      },
      required: ["Historical sources", "Scene of a Martian Landing", "Schematic inspection layout"],
    },
    {
      mission: "curiosity",
      spread: 2,
      state: "edl_event_step_0",
      setup: async () => {},
      required: ["Seven minutes of terror", "Atmospheric entry", "Heat shield"],
    },
    {
      mission: "curiosity",
      spread: 2,
      state: "edl_event_step_1",
      setup: async () => {
        await cdp.eval(`(() => { const b = document.querySelectorAll('.timeline-events button')[1]; if (b) b.click(); })()`);
        await new Promise((r) => setTimeout(r, 200));
      },
      required: ["Parachute deployment", "Supersonic parachute"],
    },
    {
      mission: "curiosity",
      spread: 2,
      state: "edl_event_step_2",
      setup: async () => {
        await cdp.eval(`(() => { const b = document.querySelectorAll('.timeline-events button')[2]; if (b) b.click(); })()`);
        await new Promise((r) => setTimeout(r, 200));
      },
      required: ["Heat-shield separation"],
    },
    {
      mission: "curiosity",
      spread: 2,
      state: "edl_event_step_3",
      setup: async () => {
        await cdp.eval(`(() => { const b = document.querySelectorAll('.timeline-events button')[3]; if (b) b.click(); })()`);
        await new Promise((r) => setTimeout(r, 200));
      },
      required: ["Back shell separates"],
    },
    {
      mission: "curiosity",
      spread: 3,
      state: "arrival_sources_closed",
      setup: async () => {
        await cdp.eval(`(() => { const d = document.querySelector('details.reader-sources'); if (d) d.open = false; })()`);
        await new Promise((r) => setTimeout(r, 200));
      },
      required: ["Your expedition starts here", "Original schematic reconstruction"],
    },
    {
      mission: "curiosity",
      spread: 3,
      state: "arrival_sources_open",
      setup: async () => {
        await cdp.eval(`(() => { const d = document.querySelector('details.reader-sources'); if (d) d.open = true; })()`);
        await new Promise((r) => setTimeout(r, 250));
      },
      required: ["Historical sources", "6 records", "Schematic inspection layout"],
    },

    // --- SURVEYOR ---
    {
      mission: "surveyor",
      spread: 0,
      state: "atlas_and_contents",
      setup: async () => {},
      required: ["The Moon, a little closer", "Surveyor 3", "The returned camera", "p. 01 — Planetary atlas"],
    },
    {
      mission: "surveyor",
      spread: 1,
      state: "story_sources_open",
      setup: async () => {
        await cdp.eval(`(() => { const d = document.querySelector('details.reader-sources'); if (d) d.open = true; })()`);
        await new Promise((r) => setTimeout(r, 250));
      },
      required: ["An object becomes evidence", "Ocean of Storms", "Apollo 12 and Surveyor 3"],
    },
    {
      mission: "surveyor",
      spread: 2,
      state: "camera_investigation",
      setup: async () => {},
      required: ["SURVEYOR 3 / APOLLO 12", "The camera that became evidence", "Historical photo", "Laboratory tests"],
    },
    {
      mission: "surveyor",
      spread: 3,
      state: "arrival_sources_open",
      setup: async () => {
        await cdp.eval(`(() => { const d = document.querySelector('details.reader-sources'); if (d) d.open = true; })()`);
        await new Promise((r) => setTimeout(r, 250));
      },
      required: ["Your expedition starts here", "Tests of the returned Surveyor 3"],
    },

    // --- PIONEER ---
    {
      mission: "pioneer",
      spread: 0,
      state: "atlas_and_contents",
      setup: async () => {},
      required: ["Beyond the familiar", "Pioneer 10", "NEAR Shoemaker", "p. 01 — Space atlas"],
    },
    {
      mission: "pioneer",
      spread: 1,
      state: "story_sources_open",
      setup: async () => {
        await cdp.eval(`(() => { const d = document.querySelector('details.reader-sources'); if (d) d.open = true; })()`);
        await new Promise((r) => setTimeout(r, 250));
      },
      required: ["An object becomes evidence", "Pioneer 10 mission history"],
    },
    {
      mission: "pioneer",
      spread: 2,
      state: "light_time_diagram",
      setup: async () => {},
      required: ["PIONEER 10 · 23 JANUARY 2003", "The 11-hour message", "ONE-WAY LIGHT TIME"],
    },
    {
      mission: "pioneer",
      spread: 3,
      state: "arrival_sources_open",
      setup: async () => {
        await cdp.eval(`(() => { const d = document.querySelector('details.reader-sources'); if (d) d.open = true; })()`);
        await new Promise((r) => setTimeout(r, 250));
      },
      required: ["Your expedition starts here", "Pioneer 10 Sends Last Signal"],
    },
  ];

  console.log(`\nExecuting full state test across ${testMatrix.length} volume configurations at 1536x864...\n`);

  for (const tc of testMatrix) {
    const testId = `${tc.mission}_spread${tc.spread}_${tc.state}`;
    console.log(`[Test] ${testId}...`);

    await openMission(tc.mission);
    await goToSpread(tc.spread);
    await tc.setup();

    const evalResult = await evaluateLayout(tc.required);

    results.push({
      mission: tc.mission,
      spread: tc.spread,
      state: tc.state,
      viewport: "1536x864 (100%)",
      status: evalResult.passed ? "PASS" : "FAIL",
      maxBottom: evalResult.maxBottom,
      spreadBottom: evalResult.spreadBottom,
      failures: evalResult.failures,
    });

    console.log(`  -> ${evalResult.passed ? "PASS" : "FAIL"}: max bottom ${evalResult.maxBottom} / ${evalResult.spreadBottom}px`);
    if (!evalResult.passed) {
      console.error(`     Failures:`, evalResult.failures);
    }
  }

  // Multi-viewport & zoom verification across key states
  const multiViewportStates = [
    { mission: "curiosity", spread: 0, state: "atlas_spread0" },
    { mission: "curiosity", spread: 1, state: "sources_open_spread1" },
    { mission: "curiosity", spread: 2, state: "edl_touchdown_spread2" },
    { mission: "curiosity", spread: 3, state: "schematic_sources_open_spread3" },
    { mission: "pioneer", spread: 2, state: "light_time_spread2" },
  ];

  const viewports = [
    { w: 1920, h: 1080, dsf: 1.0, label: "1920x1080 (100%)" },
    { w: 1366, h: 768, dsf: 1.0, label: "1366x768 (100%)" },
    { w: 1280, h: 720, dsf: 1.0, label: "1280x720 (100%)" },
    { w: 1536, h: 864, dsf: 0.9, label: "1536x864 (90% zoom)" },
    { w: 1536, h: 864, dsf: 1.1, label: "1536x864 (110% zoom)" },
    { w: 1536, h: 864, dsf: 1.25, label: "1536x864 (125% zoom)" },
  ];

  console.log(`\nExecuting multi-viewport and zoom matrix verification...\n`);

  for (const s of multiViewportStates) {
    await openMission(s.mission);
    await goToSpread(s.spread);

    if (s.state === "sources_open_spread1" || s.state === "schematic_sources_open_spread3") {
      await cdp.eval(`(() => { const d = document.querySelector('details.reader-sources'); if (d) d.open = true; })()`);
      await new Promise((r) => setTimeout(r, 250));
    } else if (s.state === "edl_touchdown_spread2") {
      await cdp.eval(`(() => { const b = document.querySelectorAll('.timeline-steps button')[3]; if (b) b.click(); })()`);
      await new Promise((r) => setTimeout(r, 200));
    }

    for (const vp of viewports) {
      console.log(`[Viewport Test] ${s.mission} spread ${s.spread} at ${vp.label}...`);
      await cdp.setViewport(vp.w, vp.h, vp.dsf);
      await new Promise((r) => setTimeout(r, 350));

      const evalResult = await evaluateLayout([]);

      results.push({
        mission: s.mission,
        spread: s.spread,
        state: `${s.state}_${vp.label.replace(/[^a-zA-Z0-9]/g, "_")}`,
        viewport: vp.label,
        status: evalResult.passed ? "PASS" : "FAIL",
        maxBottom: evalResult.maxBottom,
        spreadBottom: evalResult.spreadBottom,
        failures: evalResult.failures,
      });

      console.log(`  -> ${evalResult.passed ? "PASS" : "FAIL"}: max bottom ${evalResult.maxBottom} / ${evalResult.spreadBottom}px`);
      if (!evalResult.passed) {
        console.error(`     Failures:`, evalResult.failures);
      }
    }
  }

  cdp.close();
  chrome.kill();

  console.log("\n==========================================================================");
  console.log("            STAGE 3 FINAL FULL-MATRIX AUDIT RESULTS TABLE                 ");
  console.log("==========================================================================\n");

  const tableData = results.map((r, i) => ({
    "#": i + 1,
    Mission: r.mission,
    Spread: `Spread ${r.spread}`,
    State: r.state,
    Viewport: r.viewport,
    Status: r.status === "PASS" ? "✅ PASS" : "❌ FAIL",
    "Child / Spread Bottom": `${r.maxBottom}px / ${r.spreadBottom}px`,
    Failures: r.failures.length ? r.failures.join("; ") : "None (100% Fit)",
  }));
  console.table(tableData);

  const totalTests = results.length;
  const totalPassed = results.filter((r) => r.status === "PASS").length;
  const allPassed = totalTests === totalPassed;

  console.log(`\n==========================================================================`);
  console.log(`Summary: ${totalPassed} / ${totalTests} Tests Passed (${Math.round((totalPassed / totalTests) * 100)}%)`);
  console.log(`Status: ${allPassed ? "STAGE 3 100% GREEN - READY FOR 3D FLIPBOOK" : "FAILURES DETECTED"}`);
  console.log(`==========================================================================\n`);

  if (!allPassed) {
    process.exit(1);
  }
}

runFullMatrixAudit().catch((err) => {
  console.error("Fatal error during full matrix audit:", err);
  process.exit(1);
});
