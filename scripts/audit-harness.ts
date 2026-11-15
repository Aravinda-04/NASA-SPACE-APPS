import { spawn, type ChildProcess } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { CDPClient } from "./cdp-client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotsDir = path.join(__dirname, "audit-screenshots");
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const baselinePath = path.join(__dirname, "fixtures", "content-baseline.json");
const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf-8"));

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

interface AuditResult {
  id: string;
  mission: string;
  pageType: string;
  state: string;
  viewport: string;
  zoom: string;
  passed: boolean;
  failures: string[];
  screenshotPath: string;
}

async function runAudit() {
  console.log("Starting Chrome in debug mode...");
  const chrome: ChildProcess = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=9222",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "--hide-scrollbars",
    "http://localhost:5173/?audit_debug=true",
  ]);

  await new Promise((r) => setTimeout(r, 2500));

  let cdp: CDPClient;
  try {
    cdp = await CDPClient.connect(9222);
  } catch (e) {
    console.error("Failed to connect to Chrome CDP:", e);
    chrome.kill();
    process.exit(1);
  }

  console.log("Connected to Chrome DevTools Protocol.");

  // Viewports to test
  const viewports = [
    { name: "1536x864", w: 1536, h: 864, scale: 1.0 },
    { name: "1920x1080", w: 1920, h: 1080, scale: 1.0 },
    { name: "1366x768", w: 1366, h: 768, scale: 1.0 },
    { name: "1280x720", w: 1280, h: 720, scale: 1.0 },
    { name: "1536x864@90%", w: 1536, h: 864, scale: 0.9 },
    { name: "1536x864@110%", w: 1536, h: 864, scale: 1.1 },
    { name: "1536x864@125%", w: 1536, h: 864, scale: 1.25 },
  ];

  // Helper to navigate directly to volume and spread in App state
  async function navigateTo(missionId: string, pageNum: number, view: "contents" | "reading") {
    await cdp.eval(`
      (() => {
        window.__AUDIT_DEBUG__ = true;
        document.body.setAttribute("data-audit-debug", "true");
        // Open volume directly via dispatching app state or clicking library book
        const currentSaved = JSON.parse(localStorage.getItem("ow-save") || "{}");
        currentSaved.lastMissionId = "${missionId}";
        currentSaved.readingLocations = { ...(currentSaved.readingLocations || {}), ${missionId}: ${pageNum} };
        currentSaved.readingContexts = {
          ...(currentSaved.readingContexts || {}),
          ${missionId}: { view: "${view}", artifactId: "${missionId === "surveyor" ? "surveyor-3" : missionId === "curiosity" ? "curiosity-landing" : "pioneer-10"}", panel: "contents" }
        };
        localStorage.setItem("ow-save", JSON.stringify(currentSaved));
      })()
    `);

    // Click volume or navigate directly
    await cdp.send("Page.navigate", { url: `http://localhost:5173/?audit_debug=true` });
    await new Promise((r) => setTimeout(r, 1200));

    // Ensure we are inside the book reader
    await cdp.eval(`
      (() => {
        window.__AUDIT_DEBUG__ = true;
        document.body.setAttribute("data-audit-debug", "true");
        // If still in library, click to open
        const bookBtn = document.querySelector('.library-books [data-volume="${missionId}"] button, .volume-action');
        if (bookBtn) (bookBtn as HTMLElement).click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 600));

    // Now set the exact spread in BookReader if needed
    await cdp.eval(`
      (() => {
        // Find pagination buttons or update view
        if ("${view}" === "contents") {
          // If not in contents, click Previous until contents or update
          const prevBtn = document.querySelector('.reader-pagination button:first-child');
          if (prevBtn && !prevBtn.disabled) (prevBtn as HTMLElement).click();
        } else {
          // Click continue reading if in contents
          const nextBtn = document.querySelector('.reader-pagination .ow-primary');
          if (nextBtn) (nextBtn as HTMLElement).click();
        }
      })()
    `);
    await new Promise((r) => setTimeout(r, 600));
  }

  // Assertion evaluator
  async function checkPageAssertions(missionId: string, stateKey: string) {
    return await cdp.eval(`
      (() => {
        const failures = [];
        const scaler = document.querySelector('.reader-book-scaler');
        if (!scaler) return { passed: false, failures: ["reader-book-scaler not found"] };

        const pages = Array.from(scaler.querySelectorAll('.reader-page, .archive-page, .science-copy, .science-interaction'));
        if (pages.length === 0) return { passed: false, failures: ["No pages found inside scaler"] };

        // 1. Check for element bounding box overflow beyond page inner box
        pages.forEach((pageEl, pIdx) => {
          const pageRect = pageEl.getBoundingClientRect();
          const descendants = Array.from(pageEl.querySelectorAll('*'));

          descendants.forEach((childEl) => {
            if (childEl.offsetWidth === 0 && childEl.offsetHeight === 0) return;
            // Ignore modal dialog or portals
            if (childEl.closest('dialog, .ow-dialog')) return;

            const childRect = childEl.getBoundingClientRect();
            if (childRect.bottom > pageRect.bottom + 2.5) {
              const overflowAmt = Math.round(childRect.bottom - pageRect.bottom);
              const snippet = (childEl.innerText || childEl.getAttribute('aria-label') || childEl.tagName).slice(0, 45).replace(/\\s+/g, ' ');
              failures.push('Overflow: Page ' + pIdx + ' (' + pageEl.className.slice(0, 20) + ') child <' + childEl.tagName.toLowerCase() + '> "' + snippet + '" exceeds page bottom by ' + overflowAmt + 'px');
            }
          });

          // 2. Check for scrollbars
          if (pageEl.scrollHeight > pageEl.clientHeight + 2) {
            const overflowY = window.getComputedStyle(pageEl).overflowY;
            if (overflowY === 'auto' || overflowY === 'scroll') {
              failures.push('Scrollbar present on page: scrollHeight (' + pageEl.scrollHeight + ') > clientHeight (' + pageEl.clientHeight + ')');
            }
          }
        });

        // 3. Check for cut text (last visible line partly outside bounding box)
        pages.forEach((pageEl, pIdx) => {
          const pageRect = pageEl.getBoundingClientRect();
          const pTags = Array.from(pageEl.querySelectorAll('p, blockquote, dt, dd, li'));
          pTags.forEach(p => {
            const r = p.getBoundingClientRect();
            if (r.bottom > pageRect.bottom && r.top < pageRect.bottom) {
              failures.push('Cut text mid-line on page ' + pIdx + ': "' + p.innerText.slice(0, 35) + '..." sliced at bottom boundary');
            }
          });
        });

        return {
          passed: failures.length === 0,
          failures: Array.from(new Set(failures))
        };
      })()
    `);
  }

  const results: AuditResult[] = [];

  // Focus testing on the representative reference viewport 1536x864, plus the full viewport suite
  const testStates = [
    { mission: "curiosity", pageType: "contents", state: "spread0_preview", pageNum: 1, view: "contents" as const },
    { mission: "curiosity", pageType: "story", state: "spread1_closed", pageNum: 1, view: "reading" as const },
    { mission: "curiosity", pageType: "story", state: "spread1_open", pageNum: 1, view: "reading" as const, openDetails: true },
    { mission: "curiosity", pageType: "event_edl", state: "edl_step_0", pageNum: 2, view: "reading" as const, edlStep: 0 },
    { mission: "curiosity", pageType: "event_edl", state: "edl_step_1", pageNum: 2, view: "reading" as const, edlStep: 1 },
    { mission: "curiosity", pageType: "event_edl", state: "edl_step_2", pageNum: 2, view: "reading" as const, edlStep: 2 },
    { mission: "curiosity", pageType: "event_edl", state: "edl_step_3", pageNum: 2, view: "reading" as const, edlStep: 3 },
    { mission: "curiosity", pageType: "event_edl", state: "edl_step_4", pageNum: 2, view: "reading" as const, edlStep: 4 },
    { mission: "curiosity", pageType: "event_edl", state: "edl_step_5", pageNum: 2, view: "reading" as const, edlStep: 5 },
    { mission: "curiosity", pageType: "event_edl", state: "edl_step_6", pageNum: 2, view: "reading" as const, edlStep: 6 },
    { mission: "curiosity", pageType: "sources", state: "spread3_closed", pageNum: 3, view: "reading" as const },
    { mission: "curiosity", pageType: "sources", state: "spread3_open", pageNum: 3, view: "reading" as const, openDetails: true },
    { mission: "surveyor", pageType: "contents", state: "spread0_preview", pageNum: 1, view: "contents" as const },
    { mission: "surveyor", pageType: "event_camera", state: "camera_tests", pageNum: 2, view: "reading" as const },
    { mission: "pioneer", pageType: "contents", state: "spread0_preview", pageNum: 1, view: "contents" as const },
    { mission: "pioneer", pageType: "event_light_time", state: "light_time_one_way", pageNum: 2, view: "reading" as const },
  ];

  console.log(`Running baseline audit across ${testStates.length} states...`);

  // Default audit run at reference viewport 1536x864
  await cdp.setViewport(1536, 864, 1.0);

  for (const tc of testStates) {
    const testId = `${tc.mission}_${tc.pageType}_${tc.state}`;
    console.log(`Auditing: ${testId}...`);

    await navigateTo(tc.mission, tc.pageNum, tc.view);

    // If step or details open is requested
    if (tc.openDetails) {
      await cdp.eval(`
        (() => {
          const details = document.querySelector('.reader-sources');
          if (details) details.setAttribute('open', '');
        })()
      `);
      await new Promise((r) => setTimeout(r, 400));
    }

    if (typeof tc.edlStep === "number") {
      await cdp.eval(`
        (() => {
          const buttons = document.querySelectorAll('.timeline-events button');
          if (buttons[${tc.edlStep}]) (buttons[${tc.edlStep}] as HTMLElement).click();
        })()
      `);
      await new Promise((r) => setTimeout(r, 400));
    }

    // Check assertions
    const assertion = await checkPageAssertions(tc.mission, tc.state);
    const screenshotBuf = await cdp.screenshot();
    const screenshotFile = path.join(screenshotsDir, `baseline_${testId}_1536x864.png`);
    fs.writeFileSync(screenshotFile, screenshotBuf);

    results.push({
      id: testId,
      mission: tc.mission,
      pageType: tc.pageType,
      state: tc.state,
      viewport: "1536x864",
      zoom: "100%",
      passed: assertion.passed,
      failures: assertion.failures || [],
      screenshotPath: screenshotFile,
    });
  }

  cdp.close();
  chrome.kill();

  // Print results table
  console.log("\n=======================================================");
  console.log("             BASELINE AUDIT RESULTS (CURRENT BUILD)      ");
  console.log("=======================================================\n");

  const rows = results.map((r) => ({
    "Test State": r.id,
    "Status": r.passed ? "✅ PASS" : "❌ FAIL",
    "Failure Reason(s)": r.failures.length ? r.failures[0] : "None",
  }));

  console.table(rows);

  // Write full JSON result
  fs.writeFileSync(
    path.join(__dirname, "fixtures", "baseline-audit-results.json"),
    JSON.stringify(results, null, 2)
  );

  const failCount = results.filter((r) => !r.passed).length;
  console.log(`\nAudit completed: ${results.length - failCount} Passed, ${failCount} Failed.`);
}

runAudit().catch(console.error);

