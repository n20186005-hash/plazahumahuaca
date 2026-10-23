# Plaza Sargento Mariano Gómez visitor guide

Static Astro7 site with a native Cloudflare assets Worker. The existing Spanish/English translation pairs are compiled into `/` and `/en/`, plus matching privacy, terms and cookie pages. `scripts/localize.mjs` uses parse5 to emit translated text, metadata, topic language links, a sitemap and FAQ schema matching the rendered answers. No browser translation or hydration is needed. Language URLs take precedence over an old browser preference, keeping navigation and back behavior consistent.

Use the pinned pnpm11.24.0 and Node22 versions. Run `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm build`, `pnpm test`. Build output in `dist/` is tracked; commit newly generated styles, pages and assets with deletion of old hashes. Worker project `plazahumahuaca` serves `dist/` through ASSETS with `run_worker_first` for canonical redirects and true error responses.

The site already provides optional Google Analytics controls. Saving acceptance loads the existing integration; rejecting disables future measurement on the current page before attempting persistence. Writes require readback verification. An unsaved choice cannot control a later page or reload using an older stored choice. No new consent banner is provided. There is no weather API or live forecast in this static guide.

Visitor facts use the [Jujuy tourism manual](https://www.turismo.jujuy.gob.ar/wp-content/uploads/Manual-para-Guias-Idoneos_QUEBRADA_v5.pdf) and [national heritage record](https://www.argentina.gob.ar/capital-humano/cultura/monumentos/areas-del-pueblo-de-san-antonio-de-humahuaca). The dated Maps listing concerns the square, not nearby buildings or activities. See [IMAGE_CREDITS.md](IMAGE_CREDITS.md) for per-file image sources and licences.
