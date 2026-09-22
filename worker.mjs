// Static Cloudflare Worker: all requests are served from the Astro build assets; no database, login, CMS, or external API is used.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const isProd = url.hostname === "plazahumahuaca.com" || url.hostname.endsWith(".plazahumahuaca.com");

    // Force HTTP -> HTTPS on the production domain (defensive; Cloudflare "Always Use HTTPS" also covers this).
    if (isProd && url.protocol === "http:") {
      return Response.redirect(`https://${url.hostname}${url.pathname}${url.search}`, 301);
    }

    // Consolidate trailing-slash variants (e.g. /privacy -> /privacy/) to avoid duplicate content.
    if (isProd) {
      const p = url.pathname;
      const hasExt = /\.[a-zA-Z0-9]+$/.test(p);
      const isAsset = p.startsWith("/_astro") || p.startsWith("/assets");
      if (p !== "/" && !p.endsWith("/") && !hasExt && !isAsset) {
        return Response.redirect(`${url.origin}${p}/${url.search}`, 301);
      }
    }

    return env.ASSETS.fetch(request);
  }
};
