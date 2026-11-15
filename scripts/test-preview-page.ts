import { spawn, type ChildProcess } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { CDPClient } from "./cdp-client.js";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function testPreview() {
  console.log("Starting Chrome for Preview / Atlas Page initial check...");
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

  await cdp.setViewport(1536, 864, 1.0);

  // Click on mars
  await cdp.eval(`
    (() => {
      const b = document.querySelector('.holo-book[data-book="mars"]');
      if (b) b.click();
    })()
  `);
  await new Promise((r) => setTimeout(r, 300));
  await cdp.eval(`
    (() => {
      const b = document.querySelector('.holo-book[data-book="mars"]');
      if (b) b.click();
    })()
  `);
  await new Promise((r) => setTimeout(r, 300));
  await cdp.eval(`
    (() => {
      const btn = document.querySelector('.library-intro-actions button');
      if (btn) btn.click();
    })()
  `);
  await new Promise((r) => setTimeout(r, 1200));

  const check = await cdp.eval(`
    (() => {
      const spread = document.querySelector('.chronological-spread');
      const leftPage = document.querySelector('.planet-atlas-page');
      const rightPage = document.querySelector('.archive-index');

      if (!spread || !leftPage || !rightPage) {
        return { error: 'Spread or pages not found', spread: !!spread, left: !!leftPage, right: !!rightPage };
      }

      const spreadRect = spread.getBoundingClientRect();
      const leftRect = leftPage.getBoundingClientRect();
      const rightRect = rightPage.getBoundingClientRect();

      // Check all elements inside leftPage
      const leftElements = Array.from(leftPage.querySelectorAll('*'));
      let maxLeftBottom = 0;
      let leftCulprit = null;
      for (const el of leftElements) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && r.bottom > maxLeftBottom) {
          maxLeftBottom = r.bottom;
          leftCulprit = el.className || el.tagName;
        }
      }

      // Check all elements inside rightPage
      const rightElements = Array.from(rightPage.querySelectorAll('*'));
      let maxRightBottom = 0;
      let rightCulprit = null;
      for (const el of rightElements) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && r.bottom > maxRightBottom) {
          maxRightBottom = r.bottom;
          rightCulprit = el.className || el.tagName;
        }
      }

      // Check scrollbars
      const scrollable = [];
      for (const el of Array.from(document.querySelectorAll('*'))) {
        if (el.scrollHeight > el.clientHeight + 2) {
          const style = window.getComputedStyle(el);
          if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
            scrollable.push(el.className || el.tagName);
          }
        }
      }

      const controls = Array.from(leftPage.querySelectorAll('.planet-atlas-controls button')).map(b => b.getAttribute('aria-label') || b.innerText.trim());

      const compRight = window.getComputedStyle(rightPage);
      const rightStyles = {
        inlineHeight: rightPage.style.height,
        height: compRight.height,
        alignSelf: compRight.alignSelf,
        flex: compRight.flex,
        display: compRight.display,
        minHeight: compRight.minHeight,
        maxHeight: compRight.maxHeight,
        boxSizing: compRight.boxSizing,
      };

      return {
        rightStyles,
        spreadTop: Math.round(spreadRect.top),
        spreadBottom: Math.round(spreadRect.bottom),
        spreadHeight: Math.round(spreadRect.height),
        leftTop: Math.round(leftRect.top),
        leftBottom: Math.round(leftRect.bottom),
        leftHeight: Math.round(leftRect.height),
        maxLeftBottom: Math.round(maxLeftBottom),
        rightTop: Math.round(rightRect.top),
        rightBottom: Math.round(rightRect.bottom),
        rightHeight: Math.round(rightRect.height),
        maxRightBottom: Math.round(maxRightBottom),
        rightDelta: Math.round(maxRightBottom - rightRect.bottom),
        rightCulprit,
        scrollable,
        controlsCount: controls.length,
        controls,
        summaryTitle: leftPage.querySelector('#selected-mission-title')?.textContent,
        viewportCanvas: !!leftPage.querySelector('.planet-atlas-viewport canvas'),
      };
    })()
  `);

  console.log("Check result at 1536x864:", check);

  // Take screenshot
  const ss = await cdp.screenshot();
  const brainDir = "C:\\Users\\prabh\\.gemini\\antigravity\\brain\\ce4303c1-1096-47ef-b883-7fb85884f74a";
  fs.writeFileSync(path.join(brainDir, "preview_atlas_after_1536x864.png"), Buffer.from(ss, "base64"));
  console.log("Screenshot saved to preview_atlas_after_1536x864.png");

  cdp.close();
  chrome.kill();
}

testPreview().catch(console.error);
