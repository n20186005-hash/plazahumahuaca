// Static Cloudflare Worker: all requests are served from the Astro build assets; no database, login, CMS, or external API is used.
export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  }
};
