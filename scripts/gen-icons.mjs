// One-off icon generation: rasterizes a simple "+" wordmark (the app's core action)
// into the PWA/home-screen icon sizes. Run with `node scripts/gen-icons.mjs` whenever
// the source SVG below changes; the resulting PNGs are committed, not generated at build time.
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#20242b"/>
  <circle cx="256" cy="256" r="176" fill="#5bd8de"/>
  <rect x="226" y="146" width="60" height="220" rx="16" fill="#12181d"/>
  <rect x="146" y="226" width="220" height="60" rx="16" fill="#12181d"/>
</svg>
`;

const root = process.cwd();
const iconsDir = path.join(root, "public", "icons");
await mkdir(iconsDir, { recursive: true });

const targets = [
  { file: path.join(iconsDir, "icon-192.png"), size: 192 },
  { file: path.join(iconsDir, "icon-512.png"), size: 512 },
  { file: path.join(iconsDir, "icon-maskable-512.png"), size: 512 },
  { file: path.join(root, "src", "app", "apple-icon.png"), size: 180 },
  { file: path.join(root, "src", "app", "icon.png"), size: 64 },
];

for (const { file, size } of targets) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(file);
  console.log("wrote", path.relative(root, file));
}
