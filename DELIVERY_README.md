# Plaza Sargento Mariano Gómez — 完整网站交付包

本目录包含网站的完整可编辑源代码、Astro 构建配置、Cloudflare Worker 配置、生产构建产物、图标以及全部已使用或生成的图像资源。依赖目录 `node_modules` 未随包附带，因为 `package.json` 与 `pnpm-lock.yaml` 已锁定重建所需版本；在 Node.js 22.13.0 环境执行 `corepack pnpm install --frozen-lockfile` 即可还原。

| 内容 | 压缩包内位置 | 说明 |
| --- | --- | --- |
| 网站页面与样式 | `src/` | Astro 页面、组件、布局与 Tailwind 样式。 |
| 网站图标 | `public/` | SVG 及 16、32、180 像素 PNG favicon。 |
| 全部图像源文件 | `assets/` | 真实摄影与生成的品牌、地形、路线图形资源。 |
| 依赖与部署配置 | 根目录 | `package.json`、`pnpm-lock.yaml`、`.node-version`、`astro.config.mjs`、`wrangler.jsonc`、`worker.mjs`。 |
| 已验证生产文件 | `dist/` | 由 `pnpm build` 生成的静态产物。 |

## 图片资源与页面引用

| 文件名 | 用途 |
| --- | --- |
| `plaza-mariano-gomez-logo.png` | 头部品牌标志。 |
| `andine-topographic-hero.png` | 首屏地层图形。 |
| `field-guide-strata-panel.png` | 高原景观说明区。 |
| `route-marker-stone.png` | 交通与路线导览区。 |
| `quebrada-aerial-pexels.jpeg` | Quebrada de Humahuaca 实景摄影。 |
| `humahuaca-plaza-commons.jpg` | Humahuaca 广场实景摄影。 |
| `quebrada-landscape-commons.jpg` | 首屏及来源说明区的实景摄影。 |
| `plaza-mariano-gomez-logo_original.png` | 生成 Logo 的原始高分辨率版本。 |

> 说明：线上版本通过项目托管的 `/manus-storage/` 路径引用图片；为便于离线保存和后续迁移，所有对应原始图片已完整收录在本包的 `assets/` 目录中。
