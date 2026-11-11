/**
 * Generates static assets from src/data/site.ts:
 *   public/og.png               (always regenerated: Open Graph image)
 *   public/favicon.svg / .ico, apple-touch-icon.png, icon-192/512.png, site.webmanifest
 *   public/cv.pdf               (placeholder: only created if missing)
 *   src/assets/projects/placeholder-*.png (only created if missing)
 *
 * Run: npm run assets
 */
import sharp from "sharp";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { site } from "../src/data/site.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = join(root, "public");
const projAssets = join(root, "src", "assets", "projects");
mkdirSync(pub, { recursive: true });
mkdirSync(projAssets, { recursive: true });

const C = { ink: "#0d1014", surface: "#151a21", text: "#e8e6e1", muted: "#9aa3ae", signal: "#4fd1a5", amber: "#f2b544", grid: "rgba(255,255,255,0.05)" };
const SANS = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
const MONO = "Consolas, 'JetBrains Mono', Menlo, monospace";
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function wrap(text, max) {
  const words = text.split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max) { lines.push(cur.trim()); cur = w; }
    else cur += " " + w;
  }
  if (cur.trim()) lines.push(cur.trim());
  return lines;
}

function sparkPath(x0, y0, w, h, n = 40, seed = 7) {
  const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const pts = Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    const v = Math.min(0.95, Math.max(0.05, 0.1 + Math.pow(t, 1.6) * 0.78 + (rand() - 0.5) * 0.16 * (1 - t * 0.6)));
    return [x0 + t * w, y0 + h - v * h];
  });
  return { d: pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" "), last: pts.at(-1) };
}

// ---------- OG image ----------
{
  const W = 1200, H = 630;
  const title = wrap(site.og.title, 22);
  const sp = sparkPath(80, 430, 1040, 90);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs><pattern id="g" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="${C.grid}" stroke-width="1"/></pattern></defs>
  <rect width="100%" height="100%" fill="${C.ink}"/><rect width="100%" height="100%" fill="url(#g)"/>
  <rect x="80" y="80" width="32" height="32" rx="7" fill="${C.text}"/>
  <polyline points="85,103 91,98 96,100 101,92 107,88" fill="none" stroke="${C.ink}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="107" cy="88" r="2.6" fill="${C.amber}"/>
  <text x="128" y="104" font-family="${SANS}" font-size="24" font-weight="600" fill="${C.text}">${esc(site.person.name)}</text>
  <text x="80" y="178" font-family="${MONO}" font-size="22" letter-spacing="3" fill="${C.signal}">FIG. 00 — ${esc(site.og.eyebrow)}</text>
  ${title.map((l, i) => `<text x="80" y="${258 + i * 76}" font-family="${SANS}" font-size="68" font-weight="700" letter-spacing="-2" fill="${C.text}">${esc(l)}</text>`).join("")}
  <path d="${sp.d}" fill="none" stroke="${C.signal}" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="${sp.last[0]}" cy="${sp.last[1]}" r="7" fill="${C.amber}"/>
  <line x1="80" y1="540" x2="1120" y2="540" stroke="#28303a"/>
  <text x="80" y="578" font-family="${MONO}" font-size="22" fill="${C.muted}">${esc(site.og.footer)}</text>
</svg>`;
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(join(pub, "og.png"));
  console.log("✓ public/og.png");
}

// ---------- Favicons ----------
{
  const icon = (pad = 0) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${32 + pad * 2} ${32 + pad * 2}">
  <rect x="${-pad}" y="${-pad}" width="${32 + pad * 2}" height="${32 + pad * 2}" rx="${pad ? 0 : 7}" fill="${C.ink}"/>
  <polyline points="5,23 11,18 16,20 21,12 27,8" fill="none" stroke="${C.signal}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="27" cy="8" r="2.8" fill="${C.amber}"/>
</svg>`;
  writeFileSync(join(pub, "favicon.svg"), icon());
  const png32 = await sharp(Buffer.from(icon()), { density: 300 }).resize(32, 32).png().toBuffer();
  // ICO container holding a single PNG
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
  header.writeUInt8(32, 6); header.writeUInt8(32, 7); header.writeUInt8(0, 8); header.writeUInt8(0, 9);
  header.writeUInt16LE(1, 10); header.writeUInt16LE(32, 12);
  header.writeUInt32LE(png32.length, 14); header.writeUInt32LE(22, 18);
  writeFileSync(join(pub, "favicon.ico"), Buffer.concat([header, png32]));
  await sharp(Buffer.from(icon(4)), { density: 600 }).resize(180, 180).png().toFile(join(pub, "apple-touch-icon.png"));
  await sharp(Buffer.from(icon(4)), { density: 600 }).resize(192, 192).png().toFile(join(pub, "icon-192.png"));
  await sharp(Buffer.from(icon(4)), { density: 900 }).resize(512, 512).png().toFile(join(pub, "icon-512.png"));
  writeFileSync(join(pub, "site.webmanifest"), JSON.stringify({
    name: site.person.name, short_name: site.person.initials,
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    theme_color: C.ink, background_color: C.ink, display: "browser",
  }, null, 2));
  console.log("✓ favicons + manifest");
}

// ---------- Placeholder chart images (never overwrite your real ones) ----------
for (const cs of site.caseStudies) {
  const out = join(projAssets, cs.image);
  if (existsSync(out) || !cs.image.startsWith("placeholder-")) continue;
  const W = 1600, H = 1000;
  let seed = cs.title.length * 13;
  const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const bars = Array.from({ length: 12 }, (_, i) => {
    const h = 120 + rand() * 520;
    return `<rect x="${200 + i * 105}" y="${840 - h}" width="64" height="${h}" rx="4" fill="#0b7354" opacity="${0.18 + (i % 3) * 0.06}"/>`;
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="100%" height="100%" fill="#efece4"/>
  ${Array.from({ length: 6 }, (_, i) => `<line x1="160" x2="1480" y1="${200 + i * 128}" y2="${200 + i * 128}" stroke="#dcd8cd"/>`).join("")}
  <line x1="160" y1="160" x2="160" y2="840" stroke="#565e68" stroke-width="2"/>
  <line x1="160" y1="840" x2="1480" y2="840" stroke="#565e68" stroke-width="2"/>
  ${bars}
  <rect x="440" y="380" width="720" height="200" rx="12" fill="#ffffff" stroke="#8f5400" stroke-dasharray="10 8" stroke-width="2"/>
  <text x="800" y="460" text-anchor="middle" font-family="${MONO}" font-size="34" font-weight="700" fill="#8f5400">TODO: CHART IMAGE</text>
  <text x="800" y="516" text-anchor="middle" font-family="${SANS}" font-size="30" fill="#16191d">${esc(cs.title)}</text>
  <text x="800" y="910" text-anchor="middle" font-family="${MONO}" font-size="24" fill="#565e68">Replace src/assets/projects/${esc(cs.image)} (1600×1000)</text>
</svg>`;
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9, palette: true }).toFile(out);
  console.log(`✓ src/assets/projects/${cs.image}`);
}

// ---------- Placeholder CV ----------
{
  const out = join(pub, "cv.pdf");
  if (!existsSync(out)) {
    const lines = [
      `${site.person.name}: CV`,
      "TODO: Replace public/cv.pdf with your real CV.",
      `Contact: ${site.person.email}`,
    ];
    const stream = "BT /F1 20 Tf 72 740 Td " +
      lines.map((l, i) => `${i ? "0 -32 Td " : ""}(${l.replace(/[()\\]/g, "\\$&")}) Tj`).join(" ") + " ET";
    const objs = [
      "<< /Type /Catalog /Pages 2 0 R >>",
      "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
      `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ];
    let pdf = "%PDF-1.4\n";
    const offsets = [];
    objs.forEach((o, i) => { offsets.push(Buffer.byteLength(pdf)); pdf += `${i + 1} 0 obj\n${o}\nendobj\n`; });
    const xref = Buffer.byteLength(pdf);
    pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` +
      offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("") +
      `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
    writeFileSync(out, pdf);
    console.log("✓ public/cv.pdf (placeholder)");
  }
}
