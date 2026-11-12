/**
 * Prints cv/cv.html to public/cv.pdf with headless Chrome (or Edge).
 * Run: npm run cv     (set CHROME_PATH to override the browser location)
 */
import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "cv", "cv.html");
const out = join(root, "public", "cv.pdf");

const candidates = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);
const browser = candidates.find((p) => existsSync(p));
if (!browser) {
  console.error("Chrome/Edge not found. Set CHROME_PATH to your browser executable.");
  process.exit(1);
}

execFileSync(browser, [
  "--headless=new",
  "--disable-gpu",
  "--no-pdf-header-footer",
  "--allow-file-access-from-files",
  `--print-to-pdf=${out}`,
  pathToFileURL(src).href,
], { stdio: "inherit" });

console.log(`✓ public/cv.pdf (${Math.round(statSync(out).size / 1024)} KB)`);
