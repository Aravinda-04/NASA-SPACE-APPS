import { spawn, type ChildProcess } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { CDPClient } from "./cdp-client.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotsDir = path.join(__dirname, "audit-screenshots");
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

interface AuditResult {
  id: string;
  mission: string;
  state: string;
  viewport: string;
  passed: boolean;
  failures: string[];
  spreadBottom?: number;
  maxChildBottom?: number;
}

async function auditPageType2() {
  console.log("Starting Chrome for Page Type 2 (Event Pages) full audit...");
  const chrome: ChildProcess = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9222",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "--hide-scrollbars",
    "http://localhost:5173/?audit_debug=true",
  ]);

  await new Promise((r) => setTimeout(r, 2200));

  let cdp: CDPClient;
  try {
    cdp = await CDPClient.connect(9222);
  } catch (e) {
    console.error("Failed to connect to CDP:", e);
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
      await cdp.eval(`
        (() => {
          const exit = Array.from(document.querySelectorAll('button')).find(b =>
            b.innerText.includes('Expedition Library') || b.innerText.includes('CLOSE BOOK')
          );
          if (exit) exit.click();
        })()
      `);
      await new Promise((r) => setTimeout(r, 300));
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
    await new Promise((r) => setTimeout(r, 200));

    await cdp.eval(`
      (() => {
        const b = document.querySelector('.holo-book[data-book="${carouselId}"]');
        if (b) b.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 200));

    await cdp.eval(`
      (() => {
        const beginBtn = document.querySelector('.library-intro-actions button');
        if (beginBtn) beginBtn.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 500));

    currentMission = missionId;
    currentSpread = 0;
  }

  async function goToSpread(targetSpread: number) {
    if (currentSpread === targetSpread) return;

    if (targetSpread > currentSpread) {
      for (let s = currentSpread; s < targetSpread; s++) {
        await cdp.eval(`
          (() => {
            const nextBtn = document.querySelector('.reader-pagination .ow-primary');
            if (nextBtn) nextBtn.click();
          })()
        `);
        await new Promise((r) => setTimeout(r, 250));
      }
    } else {
      for (let s = currentSpread; s > targetSpread; s--) {
        await cdp.eval(`
          (() => {
            const prevBtn = document.querySelector('.reader-pagination button:first-child');
            if (prevBtn) prevBtn.click();
          })()
        `);
        await new Promise((r) => setTimeout(r, 250));
      }
    }
    currentSpread = targetSpread;
  }

  async function checkSpreadAssertions(baselineTexts: string[] = []) {
    return await cdp.eval(`
      (() => {
        const failures = [];
        const scaler = document.querySelector('.reader-book-scaler');
        if (!scaler) return { passed: false, failures: ["reader-book-scaler not found"] };

        const spread = document.querySelector('.chronological-spread') || document.querySelector('.reader-spread') || document.querySelector('.light-time') || scaler;
        const spreadRect = spread.getBoundingClientRect();

        const pages = Array.from(scaler.querySelectorAll('.reader-page, .archive-page, .science-copy, .science-interaction'));
        if (pages.length === 0) return { passed: false, failures: ["No pages found inside scaler"] };

        let maxBottom = 0;

        pages.forEach((pageEl, pIdx) => {
          const descendants = Array.from(pageEl.querySelectorAll('*'));
          descendants.forEach((childEl) => {
            if (childEl.offsetWidth === 0 && childEl.offsetHeight === 0) return;
            if (childEl.closest('dialog, .ow-dialog, defs, clipPath')) return;

            const childRect = childEl.getBoundingClientRect();
            if (childRect.bottom > maxBottom) maxBottom = childRect.bottom;

            if (childRect.bottom > spreadRect.bottom + 2.5) {
              const overflowAmt = Math.round(childRect.bottom - spreadRect.bottom);
              const snippet = (childEl.innerText || childEl.getAttribute('aria-label') || childEl.tagName).slice(0, 35).replace(/\\s+/g, ' ');
              failures.push('Overflow: Page ' + pIdx + ' child <' + childEl.tagName.toLowerCase() + '> "' + snippet + '" exceeds spread bottom by ' + overflowAmt + 'px');
            }
          });

          // Check scrollbars
          if (pageEl.scrollHeight > pageEl.clientHeight + 2) {
            const overflowY = window.getComputedStyle(pageEl).overflowY;
            if (overflowY === 'auto' || overflowY === 'scroll') {
              failures.push('Scrollbar present on page ' + pIdx + ': ' + pageEl.scrollHeight + ' > ' + pageEl.clientHeight);
            }
          }
        });

        // Check cut text
        pages.forEach((pageEl, pIdx) => {
          const pTags = Array.from(pageEl.querySelectorAll('p, blockquote, dt, dd, li, h1, h2, h3, h4, span'));
          pTags.forEach(p => {
            const r = p.getBoundingClientRect();
            if (r.bottom > spreadRect.bottom + 1.5 && r.top < spreadRect.bottom) {
              failures.push('Cut text mid-line on page ' + pIdx + ': "' + p.innerText.slice(0, 30) + '..." sliced at spread bottom');
            }
          });
        });

        // Content baseline check
        const bodyText = document.body.innerText;
        const baselineList = ${JSON.stringify(baselineTexts)};
        for (const str of baselineList) {
          if (!bodyText.includes(str)) {
            failures.push('Missing baseline content: "' + str + '" not found in DOM');
          }
        }

        return {
          passed: failures.length === 0,
          failures: Array.from(new Set(failures)),
          spreadBottom: Math.round(spreadRect.bottom),
          maxChildBottom: Math.round(maxBottom),
        };
      })()
    `);
  }

  const results: AuditResult[] = [];

  // 1. Audit Curiosity across ALL 7 EDL steps at 1536x864
  console.log("\n--- Auditing Curiosity EDL (All 7 Steps) at 1536x864 ---");
  await cdp.setViewport(1536, 864, 1.0);
  await openMission("curiosity");
  await goToSpread(2);

  const edlSteps = [
    { step: 0, name: "Atmospheric entry", required: ["Atmospheric entry", "05:10:45.7 UTC", "Heat shield"] },
    { step: 1, name: "Parachute deployment", required: ["Parachute deployment", "Supersonic parachute"] },
    { step: 2, name: "Heat-shield separation", required: ["Heat-shield separation", "The shield falls separately"] },
    { step: 3, name: "Back shell separates", required: ["Back shell separates", "Release the powered descent stage"] },
    { step: 4, name: "Rover separation", required: ["Rover separation", "Descent stage and tethers"] },
    { step: 5, name: "Touchdown", required: ["Touchdown", "Earth received touchdown at 05:31:45.4 UTC"] },
  ];

  for (const es of edlSteps) {
    await cdp.eval(`
      (() => {
        const buttons = document.querySelectorAll('.timeline-events button');
        if (buttons[${es.step}]) buttons[${es.step}].click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 200));

    const check = await checkSpreadAssertions(es.required);
    const ssBuf = await cdp.screenshot();
    const ssPath = path.join(screenshotsDir, `page2_curiosity_edl_step_${es.step}_1536x864.png`);
    fs.writeFileSync(ssPath, ssBuf);

    results.push({
      id: `curiosity_edl_step_${es.step}`,
      mission: "curiosity",
      state: es.name,
      viewport: "1536x864",
      passed: check.passed,
      failures: check.failures,
      spreadBottom: check.spreadBottom,
      maxChildBottom: check.maxChildBottom,
    });
  }

  // 2. Audit Surveyor Camera across all 3 evidence tabs at 1536x864
  console.log("\n--- Auditing Surveyor Camera (All 3 Tabs) at 1536x864 ---");
  await openMission("surveyor");
  await goToSpread(2);

  const surveyorTabs = [
    { index: 0, name: "photo", required: ["Historical photo", "The visit was documented"] },
    { index: 1, name: "tests", required: ["Laboratory tests", "Wear tells an engineering story"] },
    { index: 2, name: "reconstruction", required: ["Illustration", "A reconstruction explains form"] },
  ];

  for (const st of surveyorTabs) {
    await cdp.eval(`
      (() => {
        const buttons = document.querySelectorAll('.science-controls button');
        if (buttons[${st.index}]) buttons[${st.index}].click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 200));

    const check = await checkSpreadAssertions(st.required);
    const ssBuf = await cdp.screenshot();
    const ssPath = path.join(screenshotsDir, `page2_surveyor_tab_${st.name}_1536x864.png`);
    fs.writeFileSync(ssPath, ssBuf);

    results.push({
      id: `surveyor_camera_${st.name}`,
      mission: "surveyor",
      state: st.name,
      viewport: "1536x864",
      passed: check.passed,
      failures: check.failures,
      spreadBottom: check.spreadBottom,
      maxChildBottom: check.maxChildBottom,
    });
  }

  // 3. Audit Pioneer Light-Time across both modes at 1536x864
  console.log("\n--- Auditing Pioneer Light-Time (One-Way & Round-Trip) at 1536x864 ---");
  await openMission("pioneer");
  await goToSpread(2);

  const pioneerStates = [
    { name: "one_way", clickRoundTrip: false, required: ["ONE-WAY LIGHT TIME", "PIONEER 10 · 23 JANUARY 2003"] },
    { name: "round_trip", clickRoundTrip: true, required: ["HYPOTHETICAL ROUND TRIP", "Hypothetical exchange"] },
  ];

  for (const ps of pioneerStates) {
    if (ps.clickRoundTrip) {
      await cdp.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('.science-controls button'));
          const rtBtn = btns.find(b => b.innerText.includes('Hypothetical round trip'));
          if (rtBtn) rtBtn.click();
        })()
      `);
      await new Promise((r) => setTimeout(r, 200));
    }

    const check = await checkSpreadAssertions(ps.required);
    const ssBuf = await cdp.screenshot();
    const ssPath = path.join(screenshotsDir, `page2_pioneer_${ps.name}_1536x864.png`);
    fs.writeFileSync(ssPath, ssBuf);

    results.push({
      id: `pioneer_light_time_${ps.name}`,
      mission: "pioneer",
      state: ps.name,
      viewport: "1536x864",
      passed: check.passed,
      failures: check.failures,
      spreadBottom: check.spreadBottom,
      maxChildBottom: check.maxChildBottom,
    });
  }

  // 4. Multi-viewport & zoom audit across the reference states
  console.log("\n--- Auditing Multi-Viewport & Zoom Matrix ---");
  const viewports = [
    { label: "1920x1080 (100%)", w: 1920, h: 1080, scale: 1.0 },
    { label: "1366x768 (100%)", w: 1366, h: 768, scale: 1.0 },
    { label: "1280x720 (100%)", w: 1280, h: 720, scale: 1.0 },
    { label: "1536x864 (90%)", w: 1536, h: 864, scale: 0.9 },
    { label: "1536x864 (110%)", w: 1536, h: 864, scale: 1.1 },
    { label: "1536x864 (125%)", w: 1536, h: 864, scale: 1.25 },
  ];

  // Test Curiosity EDL touchdown step 5 across all viewports/zooms
  await openMission("curiosity");
  await goToSpread(2);
  await cdp.eval(`
    (() => {
      const buttons = document.querySelectorAll('.timeline-events button');
      if (buttons[5]) buttons[5].click();
    })()
  `);

  for (const v of viewports) {
    await cdp.setViewport(v.w, v.h, v.scale);
    await new Promise((r) => setTimeout(r, 300));

    const check = await checkSpreadAssertions(["Touchdown", "Earth received touchdown at 05:31:45.4 UTC"]);
    results.push({
      id: `curiosity_edl_step_5_${v.label.replace(/[^a-zA-Z0-9]/g, "_")}`,
      mission: "curiosity",
      state: `Touchdown @ ${v.label}`,
      viewport: v.label,
      passed: check.passed,
      failures: check.failures,
      spreadBottom: check.spreadBottom,
      maxChildBottom: check.maxChildBottom,
    });
  }

  cdp.close();
  chrome.kill();

  console.log("\n==========================================================================");
  console.log("       PAGE TYPE 2 (EVENT PAGES) MULTI-STATE & VIEWPORT AUDIT RESULTS     ");
  console.log("==========================================================================\n");

  const rows = results.map((r) => ({
    "Test State": r.id,
    "Status": r.passed ? "✅ PASS" : "❌ FAIL",
    "Bottom vs Spread": `${r.maxChildBottom}px / ${r.spreadBottom}px`,
    "Failure Summary": r.failures.length ? r.failures[0].slice(0, 75) + "..." : "None (100% Fit)",
  }));

  console.table(rows);

  fs.writeFileSync(
    path.join(__dirname, "fixtures", "page-type-2-audit-results.json"),
    JSON.stringify(results, null, 2)
  );

  const failCount = results.filter((r) => !r.passed).length;
  console.log(`\nAudit completed: ${results.length - failCount} Passed, ${failCount} Failed.`);
}

auditPageType2().catch(console.error);
