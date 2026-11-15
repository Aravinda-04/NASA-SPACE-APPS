import { spawn } from "child_process";
import { CDPClient } from "./cdp-client.js";

async function measure() {
  const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
    "--headless=new",
    "--remote-debugging-port=9222",
    "http://localhost:5173/?audit_debug=true",
  ]);

  let cdp: CDPClient | null = null;
  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 500));
    try {
      cdp = await CDPClient.connect(9222);
      if (cdp) break;
    } catch {}
  }
  if (!cdp) {
    chrome.kill();
    process.exit(1);
  }

  await cdp.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await cdp.setViewport(1536, 864, 1.0);

  // Open curiosity contents
  await cdp.eval(`document.querySelector('.holo-book[data-book="mars"]')?.click()`);
  await new Promise((r) => setTimeout(r, 300));
  await cdp.eval(`document.querySelector('.holo-book[data-book="mars"]')?.click()`);
  await new Promise((r) => setTimeout(r, 300));
  await cdp.eval(`document.querySelector('.library-intro-actions button')?.click()`);
  await new Promise((r) => setTimeout(r, 800));

  // Dynamically test adding grid-template-rows: minmax(0, 1fr) and height: 100%
  const res = await cdp.eval(`
    (() => {
      const spread = document.querySelector('.chronological-spread');
      spread.style.setProperty('grid-template-rows', 'minmax(0, 1fr)', 'important');
      spread.style.setProperty('height', '100%', 'important');

      const left = document.querySelector('.planet-atlas-page');
      left.style.setProperty('height', '100%', 'important');
      left.style.setProperty('min-height', '0', 'important');

      const right = document.querySelector('.archive-index');
      right.style.setProperty('height', '100%', 'important');
      right.style.setProperty('min-height', '0', 'important');

      const viewport = document.querySelector('.planet-atlas-viewport');
      if (viewport) {
        viewport.style.setProperty('height', '210px', 'important');
        viewport.style.setProperty('min-height', '180px', 'important');
      }

      const spreadRect = spread.getBoundingClientRect();
      const leftRect = left.getBoundingClientRect();
      const rightRect = right.getBoundingClientRect();
      const footer = left.querySelector('.archive-page-footer');
      const footerRect = footer.getBoundingClientRect();

      return {
        spreadBottom: Math.round(spreadRect.bottom),
        leftBottom: Math.round(leftRect.bottom),
        rightBottom: Math.round(rightRect.bottom),
        footerBottom: Math.round(footerRect.bottom),
        footerOverflow: Math.round(footerRect.bottom - spreadRect.bottom)
      };
    })()
  `);
  console.log("Measured with grid-template-rows: minmax(0, 1fr):", res);

  cdp.close();
  chrome.kill();
}

measure().catch(console.error);
