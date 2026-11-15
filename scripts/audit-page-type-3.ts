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
  spread: number;
  state: string;
  viewport: string;
  passed: boolean;
  failures: string[];
  spreadBottom?: number;
  maxChildBottom?: number;
}

async function auditPageType3() {
  console.log("Starting Chrome for Page Type 3 (Sources Page) full audit...");
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
    } catch {
      // retry
    }
  }

  if (!cdp) {
    console.error("Failed to connect to CDP after retries");
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

        // Baseline content check
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

  // Default viewport 1536x864
  await cdp.setViewport(1536, 864, 1.0);

  const sourcesTests = [
    {
      mission: "curiosity",
      spread: 1,
      state: "spread1_closed",
      openSources: false,
      required: ["An object becomes evidence", "Gale Crater", "Look a little closer"],
    },
    {
      mission: "curiosity",
      spread: 1,
      state: "spread1_open",
      openSources: true,
      required: ["Historical sources", "Scene of a Martian Landing", "Schematic inspection layout"],
    },
    {
      mission: "curiosity",
      spread: 3,
      state: "spread3_closed",
      openSources: false,
      required: ["Your expedition starts here", "Original schematic reconstruction"],
    },
    {
      mission: "curiosity",
      spread: 3,
      state: "spread3_open",
      openSources: true,
      required: ["Historical sources", "6 records", "Schematic inspection layout"],
    },
    {
      mission: "surveyor",
      spread: 1,
      state: "spread1_closed",
      openSources: false,
      required: ["An object becomes evidence", "Ocean of Storms"],
    },
    {
      mission: "surveyor",
      spread: 1,
      state: "spread1_open",
      openSources: true,
      required: ["Historical sources", "Apollo 12 and Surveyor 3"],
    },
    {
      mission: "surveyor",
      spread: 3,
      state: "spread3_open",
      openSources: true,
      required: ["Historical sources", "Tests of the returned Surveyor 3"],
    },
    {
      mission: "pioneer",
      spread: 1,
      state: "spread1_open",
      openSources: true,
      required: ["Historical sources", "Pioneer 10 mission history"],
    },
    {
      mission: "pioneer",
      spread: 3,
      state: "spread3_open",
      openSources: true,
      required: ["Historical sources", "Pioneer 10 Sends Last Signal"],
    },
  ];

  console.log(`\n--- Auditing ${sourcesTests.length} Sources Page States at 1536x864 ---`);

  for (const st of sourcesTests) {
    const testId = `${st.mission}_spread${st.spread}_${st.state}`;
    console.log(`Auditing: ${testId}...`);

    await openMission(st.mission);
    await goToSpread(st.spread);

    if (st.openSources) {
      await cdp.eval(`
        (() => {
          const details = document.querySelector('.reader-sources');
          if (details) details.setAttribute('open', '');
        })()
      `);
      await new Promise((r) => setTimeout(r, 200));
    } else {
      await cdp.eval(`
        (() => {
          const details = document.querySelector('.reader-sources');
          if (details) details.removeAttribute('open');
        })()
      `);
      await new Promise((r) => setTimeout(r, 200));
    }

    const check = await checkSpreadAssertions(st.required);
    const ssBuf = await cdp.screenshot();
    const ssPath = path.join(screenshotsDir, `page3_${testId}_1536x864.png`);
    fs.writeFileSync(ssPath, ssBuf);

    results.push({
      id: testId,
      mission: st.mission,
      spread: st.spread,
      state: st.state,
      viewport: "1536x864",
      passed: check.passed,
      failures: check.failures,
      spreadBottom: check.spreadBottom,
      maxChildBottom: check.maxChildBottom,
    });
  }

  // Multi-viewport & zoom matrix on Curiosity Spread 3 Open (the most content-heavy sources state)
  console.log("\n--- Auditing Multi-Viewport & Zoom Matrix on Curiosity Spread 3 Open ---");
  const viewports = [
    { label: "1920x1080 (100%)", w: 1920, h: 1080, scale: 1.0 },
    { label: "1366x768 (100%)", w: 1366, h: 768, scale: 1.0 },
    { label: "1280x720 (100%)", w: 1280, h: 720, scale: 1.0 },
    { label: "1536x864 (90%)", w: 1536, h: 864, scale: 0.9 },
    { label: "1536x864 (110%)", w: 1536, h: 864, scale: 1.1 },
    { label: "1536x864 (125%)", w: 1536, h: 864, scale: 1.25 },
  ];

  await openMission("curiosity");
  await goToSpread(3);
  await cdp.eval(`
    (() => {
      const details = document.querySelector('.reader-sources');
      if (details) details.setAttribute('open', '');
    })()
  `);

  for (const v of viewports) {
    await cdp.setViewport(v.w, v.h, v.scale);
    await new Promise((r) => setTimeout(r, 300));

    const check = await checkSpreadAssertions(["Historical sources", "6 records", "Schematic inspection layout"]);
    results.push({
      id: `curiosity_spread3_open_${v.label.replace(/[^a-zA-Z0-9]/g, "_")}`,
      mission: "curiosity",
      spread: 3,
      state: `Spread 3 Open @ ${v.label}`,
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
  console.log("       PAGE TYPE 3 (SOURCES PAGES) MULTI-STATE & VIEWPORT AUDIT RESULTS   ");
  console.log("==========================================================================\n");

  const rows = results.map((r) => ({
    "Test State": r.id,
    "Status": r.passed ? "✅ PASS" : "❌ FAIL",
    "Bottom vs Spread": `${r.maxChildBottom}px / ${r.spreadBottom}px`,
    "Failure Summary": r.failures.length ? r.failures[0].slice(0, 75) + "..." : "None (100% Fit)",
  }));

  console.table(rows);

  fs.writeFileSync(
    path.join(__dirname, "fixtures", "page-type-3-audit-results.json"),
    JSON.stringify(results, null, 2)
  );

  const failCount = results.filter((r) => !r.passed).length;
  console.log(`\nAudit completed: ${results.length - failCount} Passed, ${failCount} Failed.`);
}

auditPageType3().catch(console.error);
