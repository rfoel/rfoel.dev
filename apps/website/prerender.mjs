// Põe o render do build (src/entry-server.tsx) dentro do dist/index.html.
// Roda depois de `vp build` e `vp build --ssr`, igual ao saci.cc.
import fs from "node:fs";

const SSR_DIR = "dist-ssr";
const FILE = "dist/index.html";
const ROOT = '<div id="root"></div>';
const { render } = await import(`./${SSR_DIR}/entry-server.js`);

const html = fs.readFileSync(FILE, "utf8");
if (!html.includes(ROOT)) throw new Error(`No empty root in ${FILE}`);
fs.writeFileSync(FILE, html.replace(ROOT, `<div id="root">${render()}</div>`));
console.log(`prerendered ${FILE}`);
fs.rmSync(SSR_DIR, { recursive: true, force: true });
