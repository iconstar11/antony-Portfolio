# Antony N. Kinuthia: Portfolio

Personal site: **https://antonykinuthia.nestlyafrica.cloud**
Astro (static output), plain CSS, about 1 KB of JS (theme toggle only).

## Edit content

**All text, links and lists live in [`src/data/site.ts`](src/data/site.ts).** You don't need to touch the components.

- Any string containing `TODO` is shown on the page with an amber **TODO** badge, so unfinished bits are easy to spot.
  Remove the `TODO…` part when you fill it in.
- A link whose `href` is `"TODO"` or empty is shown as a placeholder, not a broken link.
- **Case study chart:** put the image (png/jpg/webp/avif, about 1600×1000) in `src/assets/projects/`
  and set `image: "your-file.png"` plus a real `imageAlt`. Astro generates AVIF/WebP sizes automatically.
- **CV:** edit `cv/cv.html`, then run `npm run cv` to regenerate `public/cv.pdf` (uses Chrome or Edge
  in headless mode; set `CHROME_PATH` if it isn't found). Keep it one column so ATS systems parse it.
  Don't add phone numbers or referee contact details: this file is public.
- **Open Graph image / favicons:** edit the `og` block in `site.ts`, then run `npm run assets`
  to regenerate `public/og.png`. Placeholder charts and the CV are only generated if missing,
  so your real files are never overwritten.
- **Colours / fonts:** `src/styles/tokens.css`.

## Run locally

```bash
npm install
npm run dev        # http://localhost:4321 (hot reload)
```

## Build

```bash
npm run build      # outputs static site to dist/
npm run preview    # serve dist/ at http://localhost:4321
```

## Deploy (Cloudflare Pages)

```bash
npx wrangler login          # once
npm run deploy              # = build + wrangler pages deploy dist --project-name portfolio
```

Or connect the GitHub repo in the Cloudflare dashboard for automatic deploys on push
(build command `npm run build`, output directory `dist`).

## Structure

```
src/data/site.ts         ← all content
src/components/*.astro   ← one component per section
src/layouts/Base.astro   ← <head>, SEO, Open Graph, JSON-LD, theme script
src/styles/              ← tokens.css (palette/type), global.css
scripts/make-assets.mjs  ← OG image, favicons, placeholders
public/                  ← cv.pdf, robots.txt, _headers, icons
```
