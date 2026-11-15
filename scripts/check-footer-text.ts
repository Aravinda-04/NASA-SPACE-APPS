import { spawn } from "child_process";
import { CDPClient } from "./cdp-client.js";

async function main() {
  const chrome = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
    "--headless=new",
    "--remote-debugging-port=9222",
    "http://localhost:5173/?audit_debug=true",
  ]);

  let cdp: CDPClient | null = null;
  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 600));
    try {
      cdp = await CDPClient.connect(9222);
      if (cdp) break;
    } catch {}
  }

  await cdp.setViewport(1536, 864, 1.0);
  await cdp.eval(`document.querySelector('.holo-book[data-book="mars"]')?.click()`);
  await new Promise((r) => setTimeout(r, 300));
  await cdp.eval(`document.querySelector('.holo-book[data-book="mars"]')?.click()`);
  await new Promise((r) => setTimeout(r, 300));
  await cdp.eval(`document.querySelector('.library-intro-actions button')?.click()`);
  await new Promise((r) => setTimeout(r, 1200));

  const t = await cdp.eval(`
    (() => {
      const f = document.querySelector('.planet-atlas-page .archive-page-footer');
      return {
        textContent: f ? f.textContent : null,
        innerText: f ? f.innerText : null,
        innerHTML: f ? f.innerHTML : null,
      };
    })()
  `);
  console.log("Footer text values:", t);

  cdp.close();
  chrome.kill();
}

main().catch(console.error);
