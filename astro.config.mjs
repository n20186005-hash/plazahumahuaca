import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// The only URL setting for the site. Keep unset until a production domain is assigned.
const site = process.env.SITE_URL?.trim() || undefined;

// Development-only bridge for webdev-managed assets. Production hosting can use the same /manus-storage URLs supplied by the asset service.
const manusStorageProxy = () => ({
  name: "manus-storage-proxy",
  configureServer(server) {
    server.middlewares.use("/manus-storage", async (req, res) => {
      const key = req.url?.replace(/^\//, "");
      const forgeBaseUrl = (process.env.BUILT_IN_FORGE_API_URL || "").replace(/\/+$/, "");
      const forgeKey = process.env.BUILT_IN_FORGE_API_KEY;
      if (!key || !forgeBaseUrl || !forgeKey) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Asset unavailable");
        return;
      }
      try {
        const source = new URL("v1/storage/presign/get", `${forgeBaseUrl}/`);
        source.searchParams.set("path", key);
        const response = await fetch(source, { headers: { Authorization: `Bearer ${forgeKey}` } });
        const { url } = response.ok ? await response.json() : {};
        if (!url) throw new Error("No asset URL");
        res.writeHead(307, { Location: url, "Cache-Control": "no-store" });
        res.end();
      } catch {
        res.writeHead(502, { "Content-Type": "text/plain" });
        res.end("Asset service unavailable");
      }
    });
  }
});

export default defineConfig({
  site,
  output: "static",
  integrations: site ? [sitemap()] : [],
  vite: {
    plugins: [tailwindcss(), manusStorageProxy()],
    server: {
      allowedHosts: true
    }
  }
});
