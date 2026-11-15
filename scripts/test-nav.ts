import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { CDPClient } from "./cdp-client.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function test() {
  const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
    "--headless=new",
    "--remote-debugging-port=9222",
    "http://localhost:5173/?audit_debug=true",
  ]);
  await new Promise((r) => setTimeout(r, 2000));
  const cdp = await CDPClient.connect(9222);

  await cdp.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await cdp.setViewport(1536, 864, 1.0);

  // Open curiosity
  await cdp.eval(`document.querySelector('.holo-book[data-book="mars"]')?.click()`);
  await new Promise((r) => setTimeout(r, 400));
  await cdp.eval(`document.querySelector('.holo-book[data-book="mars"]')?.click()`);
  await new Promise((r) => setTimeout(r, 400));
  await cdp.eval(`document.querySelector('.library-intro-actions button')?.click()`);
  await new Promise((r) => setTimeout(r, 800));

  const check = await cdp.eval(`
    (() => {
      const spread = document.querySelector('.chronological-spread');
      const spreadRect = spread.getBoundingClientRect();
      const page = document.querySelector('.archive-index');
      const pageRect = page.getBoundingClientRect();
      const records = Array.from(document.querySelectorAll('.contents-record')).map((b, i) => {
        const r = b.getBoundingClientRect();
        return {
          id: 'R0' + (i + 1),
          top: Math.round(r.top),
          bottom: Math.round(r.bottom),
          height: Math.round(r.height),
          overflowSpread: Math.round(r.bottom - spreadRect.bottom),
          snippet: b.innerText.slice(0, 30).replace(/\\s+/g, ' ')
        };
      });

      const footer = document.querySelector('.archive-index .archive-page-footer');
      const footerRect = footer ? footer.getBoundingClientRect() : null;

      return {
        spreadBottom: Math.round(spreadRect.bottom),
        pageBottom: Math.round(pageRect.bottom),
        records,
        footerOverflow: footerRect ? Math.round(footerRect.bottom - spreadRect.bottom) : null,
      };
    })()
  `);
  console.log("Contents page detailed check:", JSON.stringify(check, null, 2));

  const screenshot = await cdp.screenshot();
  const outPath = path.join(__dirname, "audit-screenshots", "page_type_1_contents_fixed_1536x864.png");
  fs.writeFileSync(outPath, screenshot);
  console.log("Saved fixed screenshot to:", outPath);

  cdp.close();
  chrome.kill();
}

test().catch(console.error);
