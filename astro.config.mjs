// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://antonykinuthia.nestlyafrica.cloud",
  output: "static",
  integrations: [sitemap()],
  build: { inlineStylesheets: "always" },
  compressHTML: true,
});
