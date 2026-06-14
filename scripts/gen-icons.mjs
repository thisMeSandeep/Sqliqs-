// One-off: build the PWA/app icon set from public/logo.svg.
// - Recolors the dim #0B7B6A mark to the brand gradient (#34E0A1→#2EE0B8→#22D3EE)
// - Centers it on a #0A0A0A canvas inside a maskable-safe zone (~68%)
// - Emits a 1024 master + the sizes the manifest / iOS need.
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = join(root, "public");

const raw = await readFile(join(pub, "logo.svg"), "utf8");

// Pull the inner drawing out of logo.svg (everything between the <svg> tags).
const inner = raw
  .replace(/^[\s\S]*?<svg[^>]*>/i, "")
  .replace(/<\/svg>\s*$/i, "")
  .replaceAll("#0B7B6A", "url(#brand)"); // brighten: dim teal → brand gradient

// logo.svg authored in viewBox "406 66 228 228". Map that 228-unit box into a
// 700px region centered on a 1024 canvas (162px padding ⇒ ~68% safe zone).
const S = 700 / 228;
const TX = 162 - S * 406;
const TY = 162 - S * 66;

const master = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="brand" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#34E0A1"/>
      <stop offset="0.55" stop-color="#2EE0B8"/>
      <stop offset="1" stop-color="#22D3EE"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="#0A0A0A"/>
  <g transform="translate(${TX.toFixed(2)} ${TY.toFixed(2)}) scale(${S.toFixed(6)})">${inner}</g>
</svg>`;

const masterPng = await sharp(Buffer.from(master)).png().toBuffer();
await writeFile(join(pub, "icon-master.png"), masterPng);

// Derive every size from the rendered master.
const outputs = [
  ["icon-192.png", 192],
  ["icon-512.png", 512],
  ["icon-maskable-512.png", 512], // same art; padding already in safe zone
  ["apple-touch-icon.png", 180], // iOS: opaque, it rounds the corners itself
];

for (const [name, size] of outputs) {
  await sharp(masterPng).resize(size, size).png().toBuffer().then((b) => writeFile(join(pub, name), b));
}

// A crisp vector favicon (mark on dark, no extra padding so it reads when tiny).
const faviconS = 24 / 228; // fit the 228-unit art into a 24 viewBox with small margin
const fav = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <defs>
    <linearGradient id="brand" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#34E0A1"/>
      <stop offset="1" stop-color="#22D3EE"/>
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="6" fill="#0A0A0A"/>
  <g transform="translate(${(4 - faviconS * 406).toFixed(2)} ${(4 - faviconS * 66).toFixed(2)}) scale(${faviconS.toFixed(6)})">${inner}</g>
</svg>`;
await writeFile(join(pub, "favicon.svg"), fav);

console.log("Generated: icon-master.png, icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png, favicon.svg");
