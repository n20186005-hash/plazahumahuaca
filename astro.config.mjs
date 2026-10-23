import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// Keep a stable production canonical URL while allowing environment overrides.
const site = process.env.SITE_URL?.trim() || "https://plazahumahuaca.com";

export default defineConfig({
  site,
  output: "static",
  integrations: site ? [sitemap()] : [],
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ["localhost", "127.0.0.1"]
    }
  }
});
