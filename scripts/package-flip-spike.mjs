import { build } from "vite";
import react from "@vitejs/plugin-react";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

// Offline review copy of the SAME isolated route. No screenshots or substitute
// page renderer: the bundle still mounts the real React components and WebGL map.
const root = process.cwd();
const result = await build({
  configFile: false,
  plugins: [react()],
  build: {
    write: false,
    rollupOptions: { input: "flip-spike.html", output: { inlineDynamicImports: true } },
  },
});
const outputs = (Array.isArray(result) ? result : [result]).flatMap(item => item.output);
let code = outputs.filter(item => item.type === "chunk").map(item => item.code).join("\n");
let css = outputs.filter(item => item.type === "asset" && item.fileName.endsWith(".css")).map(item => String(item.source)).join("\n");
const files = new Set([...(`${code}\n${css}`).matchAll(/\/(?:images|fonts)\/[a-zA-Z0-9_./-]+\.(?:webp|png|jpg|jpeg|svg|ttf|woff2?)/g)].map(match => match[0]));
let embedded = 0;
for (const url of files) {
  try {
    const bytes = await readFile(path.join(root, "public", url));
    const ext = path.extname(url).slice(1);
    const mime = { webp: "image/webp", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", svg: "image/svg+xml", ttf: "font/ttf", woff: "font/woff", woff2: "font/woff2" }[ext];
    const data = `data:${mime};base64,${bytes.toString("base64")}`;
    code = code.split(url).join(data);
    css = css.split(url).join(data);
    embedded++;
  } catch { /* Dynamic asset names are still exercised by the normal dev route. */ }
}
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Off-world — offline HTML fold specimen</title><style>${css}</style></head><body><div id="root"></div><script type="module">${code.replaceAll("</script", "<\\/script")}</script></body></html>`;
const directory = path.join(root, "output/stage4-spike");
await mkdir(directory, { recursive: true });
await writeFile(path.join(directory, "standalone.html"), html);
console.log(`Offline specimen: output/stage4-spike/standalone.html (${embedded} embedded local assets; ${Buffer.byteLength(html)} bytes).`);
