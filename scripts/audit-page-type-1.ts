import { spawn, type ChildProcess } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { CDPClient } from "./cdp-client.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotsDir = path.join(__dirname, "audit-screenshots");

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

interface ViewportRun {
  label: string;
  w: number;
  h: number;
  scale: number;
}

const matrix: ViewportRun[] = [
  { label: "1536x864 (100%)", w: 1536, h: 864, scale: 1.0 },
  { label: "1920x1080 (100%)", w: 1920, h: 1080, scale: 1.0 },
  { label: "1366x768 (100%)", w: 1366, h: 768, scale: 1.0 },
  { label: "1280x720 (100%)", w: 1280, h: 720, scale: 1.0 },
  { label: "1536x864 (90%)", w: 1536, h: 864, scale: 0.9 },
  { label: "1536x864 (110%)", w: 1536, h: 864, scale: 1.1 },
  { label: "1536x864 (125%)", w: 1536, h: 864, scale: 1.25 },
];

async function auditPageType1() {
  console.log("Starting Chrome for Page Type 1 (Contents) multi-viewport audit...");
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

  // Open curiosity contents page once
  await cdp.setViewport(1536, 864, 1.0);
  await cdp.eval(`document.querySelector('.holo-book[data-book="mars"]')?.click()`);
  await new Promise((r) => setTimeout(r, 400));
  await cdp.eval(`document.querySelector('.holo-book[data-book="mars"]')?.click()`);
  await new Promise((r) => setTimeout(r, 400));
  await cdp.eval(`document.querySelector('.library-intro-actions button')?.click()`);
  await new Promise((r) => setTimeout(r, 800));

  const results: any[] = [];

  for (const v of matrix) {
    console.log(`Auditing Page Type 1 at ${v.label}...`);
    await cdp.setViewport(v.w, v.h, v.scale);
    await new Promise((r) => setTimeout(r, 400));

    const check = await cdp.eval(`
      (() => {
        const failures = [];
        const spread = document.querySelector('.chronological-spread');
        if (!spread) return { passed: false, failures: ["chronological-spread not found"] };
        const spreadRect = spread.getBoundingClientRect();
        const page = document.querySelector('.archive-index');
        if (!page) return { passed: false, failures: ["archive-index not found"] };
        const pageRect = page.getBoundingClientRect();

        // 1. Check all elements in page for overflow
        const descendants = Array.from(page.querySelectorAll('*'));
        descendants.forEach(el => {
          if (el.offsetWidth === 0 && el.offsetHeight === 0) return;
          if (el.closest('defs, clipPath')) return;
          const r = el.getBoundingClientRect();
          if (r.bottom > spreadRect.bottom + 2.5) {
            const overflow = Math.round(r.bottom - spreadRect.bottom);
            const snippet = (el.innerText || el.tagName).slice(0, 35).replace(/\\s+/g, ' ');
            failures.push('Overflow: <' + el.tagName.toLowerCase() + '> "' + snippet + '" by ' + overflow + 'px');
          }
        });

        // 2. Check scrollbar
        if (page.scrollHeight > page.clientHeight + 2) {
          const overflowY = window.getComputedStyle(page).overflowY;
          if (overflowY === 'auto' || overflowY === 'scroll') {
            failures.push('Scrollbar present: ' + page.scrollHeight + ' > ' + page.clientHeight);
          }
        }

        // 3. Check cut text
        const pTags = Array.from(page.querySelectorAll('p, span, strong, li'));
        pTags.forEach(p => {
          const r = p.getBoundingClientRect();
          if (r.bottom > spreadRect.bottom + 1.5 && r.top < spreadRect.bottom) {
            failures.push('Cut text: "' + p.innerText.slice(0, 30) + '..." sliced at spread bottom');
          }
        });

        // 4. Baseline records check (all 5 records present)
        const text = page.innerText;
        for (let i = 1; i <= 5; i++) {
          const rId = 'R0' + i;
          if (!text.includes(rId)) {
            failures.push('Missing record ' + rId);
          }
        }

        return {
          passed: failures.length === 0,
          failures: Array.from(new Set(failures)),
          spreadBottom: Math.round(spreadRect.bottom),
          pageBottom: Math.round(pageRect.bottom),
        };
      })()
    `);

    const screenshot = await cdp.screenshot();
    const cleanLabel = v.label.replace(/[^a-zA-Z0-9]/g, "_");
    const ssPath = path.join(screenshotsDir, `audit_page1_${cleanLabel}.png`);
    fs.writeFileSync(ssPath, screenshot);

    results.push({
      Viewport: v.label,
      Status: check.passed ? "✅ PASS" : "❌ FAIL",
      "Page Bottom vs Spread": `${check.pageBottom}px / ${check.spreadBottom}px`,
      "Failure Reason": check.failures.length ? check.failures[0] : "None (100% Fit)",
    });
  }

  cdp.close();
  chrome.kill();

  console.log("\n==========================================================================");
  console.log("       PAGE TYPE 1 (CONTENTS) MULTI-VIEWPORT & ZOOM AUDIT RESULTS         ");
  console.log("==========================================================================\n");
  console.table(results);

  fs.writeFileSync(
    path.join(__dirname, "fixtures", "page-type-1-audit-results.json"),
    JSON.stringify(results, null, 2)
  );
}

auditPageType1().catch(console.error);
