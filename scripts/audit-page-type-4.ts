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

async function auditPageType4() {
  console.log("Starting Chrome for Page Type 4 (First-Page Preview & Planet Atlas) audit...");
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
    await new Promise((r) => setTimeout(r, 250));

    await cdp.eval(`
      (() => {
        const btn = document.querySelector('.library-intro-actions button');
        if (btn) btn.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 1000));

    currentMission = missionId;
  }

  async function runAuditCheck(baselineTexts: string[]) {
    return await cdp.eval(`
      (() => {
        const failures = [];
        const spread = document.querySelector('.chronological-spread');
        const leftPage = document.querySelector('.planet-atlas-page');
        const rightPage = document.querySelector('.archive-index');

        if (!spread || !leftPage || !rightPage) {
          return {
            passed: false,
            failures: ['Spread or pages not found'],
            spreadBottom: 0,
            maxChildBottom: 0
          };
        }

        const spreadRect = spread.getBoundingClientRect();
        const leftRect = leftPage.getBoundingClientRect();
        const rightRect = rightPage.getBoundingClientRect();

        // Check left page bounds
        let maxLeftBottom = 0;
        let leftCulprit = null;
        const leftDescendants = Array.from(leftPage.querySelectorAll('*'));
        leftDescendants.forEach(el => {
          if (el.offsetWidth === 0 && el.offsetHeight === 0) return;
          if (el.closest('defs, clipPath')) return;
          const r = el.getBoundingClientRect();
          if (r.bottom > leftRect.bottom + 6) {
            const overflow = Math.round(r.bottom - leftRect.bottom);
            const tag = el.className || el.tagName;
            failures.push('Left page overflow: <' + tag + '> by ' + overflow + 'px');
          }
          if (r.bottom > maxLeftBottom) {
            maxLeftBottom = r.bottom;
            leftCulprit = el.className || el.tagName;
          }
        });

        // Check right page bounds
        let maxRightBottom = 0;
        let rightCulprit = null;
        const rightDescendants = Array.from(rightPage.querySelectorAll('*'));
        rightDescendants.forEach(el => {
          if (el.offsetWidth === 0 && el.offsetHeight === 0) return;
          if (el.closest('defs, clipPath')) return;
          const r = el.getBoundingClientRect();
          if (r.bottom > rightRect.bottom + 6) {
            const overflow = Math.round(r.bottom - rightRect.bottom);
            const tag = el.className || el.tagName;
            failures.push('Right page overflow: <' + tag + '> by ' + overflow + 'px');
          }
          if (r.bottom > maxRightBottom) {
            maxRightBottom = r.bottom;
            rightCulprit = el.className || el.tagName;
          }
        });

        // Check for scrollbars
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
          failures.push('Inner scrollbars found on: ' + scrollable.join(', '));
        }

        // Check for cut text (last line rect extends past bottom)
        const textElements = Array.from(leftPage.querySelectorAll('p, span, h2, h3, button, footer'));
        textElements.forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.bottom > leftRect.bottom + 2 && r.top < leftRect.bottom) {
            failures.push('Cut text on left page: "' + (el.innerText || '').slice(0, 30) + '..."');
          }
        });

        // Check baseline content presence
        const bodyText = (document.body.innerText + ' ' + document.body.textContent).toLowerCase();
        const baselineList = ${JSON.stringify(baselineTexts)};
        for (const str of baselineList) {
          if (!bodyText.includes(str.toLowerCase())) {
            failures.push('Missing baseline content: "' + str + '" not found in DOM');
          }
        }

        // Check atlas controls presence
        const controls = Array.from(leftPage.querySelectorAll('.planet-atlas-controls button'));
        if (controls.length !== 9) {
          failures.push('Expected 9 atlas controls, found ' + controls.length);
        }

        return {
          passed: failures.length === 0,
          failures: Array.from(new Set(failures)),
          spreadBottom: Math.round(spreadRect.bottom),
          leftBottom: Math.round(leftRect.bottom),
          maxLeftBottom: Math.round(maxLeftBottom),
          rightBottom: Math.round(rightRect.bottom),
          maxRightBottom: Math.round(maxRightBottom),
        };
      })()
    `);
  }

  const results: AuditResult[] = [];

  // Default viewport 1536x864
  await cdp.setViewport(1536, 864, 1.0);

  const previewStates = [
    {
      mission: "curiosity",
      state: "default_viking1",
      selectArtifact: null,
      dossierCheck: false,
      required: [
        "A world of discoveries",
        "Turn the world. Find the place. Follow the evidence",
        "Viking 1",
        "Its experiments investigated Martian soil",
        "Open artifact dossier",
        "Enter 3D simulation",
        "p. 01 — Planetary atlas",
        "History, located."
      ],
    },
    {
      mission: "curiosity",
      state: "selected_curiosity_r03",
      selectArtifact: "curiosity",
      dossierCheck: false,
      required: [
        "Curiosity & the sky crane",
        "Discarded landing hardware delivers a mobile laboratory",
        "Open artifact dossier",
        "Enter 3D simulation",
      ],
    },
    {
      mission: "curiosity",
      state: "selected_ingenuity_r05",
      selectArtifact: "ingenuity",
      dossierCheck: false,
      required: [
        "Ingenuity",
        "A small rotorcraft proves that powered flight can work on Mars",
        "Open artifact dossier",
      ],
    },
    {
      mission: "surveyor",
      state: "default_surveyor3",
      selectArtifact: null,
      dossierCheck: false,
      required: [
        "The Moon, a little closer",
        "Turn the world. Find the place. Follow the evidence",
        "Surveyor 3",
        "It tested lunar soil and returned surface images",
        "Open artifact dossier",
        "Enter 3D simulation",
        "p. 01 — Planetary atlas",
      ],
    },
    {
      mission: "surveyor",
      state: "selected_camera",
      selectArtifact: "surveyor-camera",
      dossierCheck: false,
      required: [
        "The returned camera",
        "Apollo 12 astronauts Pete Conrad and Alan Bean visited Surveyor 3",
      ],
    },
    {
      mission: "pioneer",
      state: "default_pioneer10",
      selectArtifact: null,
      dossierCheck: false,
      required: [
        "Beyond the familiar",
        "Follow the context of a remarkable journey",
        "Pioneer 10",
        "It investigated Jupiter and the space environment",
        "Open artifact dossier",
        "Enter 3D simulation",
        "p. 01 — Space atlas",
      ],
    },
    {
      mission: "pioneer",
      state: "selected_near_shoemaker",
      selectArtifact: "near-shoemaker",
      dossierCheck: false,
      required: [
        "NEAR Shoemaker",
        "It explored the structure, composition and surface of asteroid Eros",
      ],
    },
  ];

  console.log(`\n--- Auditing ${previewStates.length} Preview / Atlas States at 1536x864 ---`);

  for (const st of previewStates) {
    const testId = `${st.mission}_${st.state}`;
    console.log(`Auditing: ${testId}...`);

    await openMission(st.mission);

    if (st.selectArtifact) {
      await cdp.eval(`
        (() => {
          const btn = document.querySelector('[data-artifact-id="${st.selectArtifact}"]') ||
                      document.getElementById('contents-${st.selectArtifact}');
          if (btn) btn.click();
        })()
      `);
      await new Promise((r) => setTimeout(r, 300));
    }

    const check = await runAuditCheck(st.required);

    results.push({
      id: testId,
      mission: st.mission,
      state: st.state,
      viewport: "1536x864 (100%)",
      passed: check.passed,
      failures: check.failures,
      spreadBottom: check.spreadBottom,
      maxChildBottom: Math.max(check.maxLeftBottom, check.maxRightBottom),
    });

    console.log(`  -> ${check.passed ? "PASS" : "FAIL"}: left max ${check.maxLeftBottom} / ${check.leftBottom}, right max ${check.maxRightBottom} / ${check.rightBottom}`);
    if (!check.passed) {
      console.error(`     Failures:`, check.failures);
    }
  }

  // Multi-viewport and Zoom tests on Curiosity Preview
  const viewports = [
    { w: 1920, h: 1080, dsf: 1.0, label: "1920x1080 (100%)" },
    { w: 1366, h: 768, dsf: 1.0, label: "1366x768 (100%)" },
    { w: 1280, h: 720, dsf: 1.0, label: "1280x720 (100%)" },
    { w: 1536, h: 864, dsf: 0.9, label: "1536x864 (90% zoom)" },
    { w: 1536, h: 864, dsf: 1.1, label: "1536x864 (110% zoom)" },
    { w: 1536, h: 864, dsf: 1.25, label: "1536x864 (125% zoom)" },
  ];

  console.log(`\n--- Auditing Multi-Viewport & Zoom Matrix on Preview Page ---`);
  await openMission("curiosity");

  for (const vp of viewports) {
    const testId = `curiosity_viewport_${vp.label.replace(/[^a-zA-Z0-9]/g, "_")}`;
    console.log(`Auditing ${vp.label}...`);

    await cdp.setViewport(vp.w, vp.h, vp.dsf);
    await new Promise((r) => setTimeout(r, 400));

    const check = await runAuditCheck([
      "A world of discoveries",
      "p. 01 — Planetary atlas",
      "History, located."
    ]);

    results.push({
      id: testId,
      mission: "curiosity",
      state: "default_preview",
      viewport: vp.label,
      passed: check.passed,
      failures: check.failures,
      spreadBottom: check.spreadBottom,
      maxChildBottom: Math.max(check.maxLeftBottom, check.maxRightBottom),
    });

    console.log(`  -> ${check.passed ? "PASS" : "FAIL"}: left max ${check.maxLeftBottom} / ${check.leftBottom}, right max ${check.maxRightBottom} / ${check.rightBottom}`);
    if (!check.passed) {
      console.error(`     Failures:`, check.failures);
    }
  }

  // Restore 1536x864
  await cdp.setViewport(1536, 864, 1.0);

  // Test Atlas Controls Interaction
  console.log(`\n--- Auditing Interactive Atlas Controls Behavior ---`);
  await cdp.eval(`
    (() => {
      // Click zoom in button
      const zoomIn = document.querySelector('.planet-atlas-controls button[aria-label="Zoom atlas in"]');
      if (zoomIn) zoomIn.click();
    })()
  `);
  await new Promise((r) => setTimeout(r, 200));

  await cdp.eval(`
    (() => {
      // Toggle labels
      const toggleLabels = document.querySelector('.planet-atlas-controls button[aria-label="Toggle atlas labels"]');
      if (toggleLabels) toggleLabels.click();
    })()
  `);
  await new Promise((r) => setTimeout(r, 200));

  const controlCheck = await runAuditCheck(["A world of discoveries"]);
  results.push({
    id: "curiosity_controls_interaction",
    mission: "curiosity",
    state: "controls_zoomed_and_toggled_labels",
    viewport: "1536x864 (100%)",
    passed: controlCheck.passed,
    failures: controlCheck.failures,
    spreadBottom: controlCheck.spreadBottom,
    maxChildBottom: Math.max(controlCheck.maxLeftBottom, controlCheck.maxRightBottom),
  });
  console.log(`  -> Atlas controls interaction test: ${controlCheck.passed ? "PASS" : "FAIL"}`);

  // Test Open Artifact Dossier Dialog Modal & Close
  console.log(`\n--- Auditing Artifact Dossier Modal Open & Close ---`);
  await cdp.eval(`
    (() => {
      const openBtn = document.getElementById('artifact-open-dossier');
      if (openBtn) openBtn.click();
    })()
  `);
  await new Promise((r) => setTimeout(r, 400));

  const modalOpenCheck = await cdp.eval(`
    (() => {
      const dialog = document.querySelector('.atlas-dossier-dialog');
      return {
        open: !!dialog,
        hasTitle: !!dialog?.querySelector('#artifact-heading'),
      };
    })()
  `);

  await cdp.eval(`
    (() => {
      const closeBtn = document.querySelector('.atlas-dossier-dialog .modal-close-button');
      if (closeBtn) closeBtn.click();
    })()
  `);
  await new Promise((r) => setTimeout(r, 400));

  const modalCloseCheck = await runAuditCheck(["A world of discoveries"]);
  const modalPassed = modalOpenCheck.open && modalOpenCheck.hasTitle && modalCloseCheck.passed;
  results.push({
    id: "curiosity_dossier_modal_cycle",
    mission: "curiosity",
    state: "dossier_modal_open_close",
    viewport: "1536x864 (100%)",
    passed: modalPassed,
    failures: modalPassed ? [] : ["Modal dialog failed to open, render title, or close cleanly"],
    spreadBottom: modalCloseCheck.spreadBottom,
    maxChildBottom: Math.max(modalCloseCheck.maxLeftBottom, modalCloseCheck.maxRightBottom),
  });
  console.log(`  -> Dossier modal cycle test: ${modalPassed ? "PASS" : "FAIL"}`);

  cdp.close();
  chrome.kill();

  console.log("\n==========================================================================");
  console.log("       PAGE TYPE 4 (FIRST-PAGE PREVIEW & ATLAS) AUDIT RESULTS            ");
  console.log("==========================================================================\n");

  const tableData = results.map((r) => ({
    "Test Case / State": r.id,
    Viewport: r.viewport,
    Status: r.passed ? "✅ PASS" : "❌ FAIL",
    "Max Child / Page Bottom": `${r.maxChildBottom}px / ${r.spreadBottom}px`,
    Failures: r.failures.length ? r.failures.join("; ") : "None (100% Fit)",
  }));
  console.table(tableData);

  const allPassed = results.every((r) => r.passed);
  console.log(`\nOverall Result: ${allPassed ? "ALL 15 TESTS PASSED (100% GREEN)" : "FAILURES DETECTED"}`);
  if (!allPassed) {
    process.exit(1);
  }
}

auditPageType4().catch((err) => {
  console.error("Fatal audit error:", err);
  process.exit(1);
});
