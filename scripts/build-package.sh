#!/usr/bin/env bash
# Assemble the npm package into pkg/ from the current framework files.
# Usage: scripts/build-package.sh
# The version is read from the skynet-ui.css header so npm always matches
# the framework. Publish with: cd pkg && npm publish --access public
set -euo pipefail
cd "$(dirname "$0")/.."

VERSION=$(grep -oE 'Skynet UI v[0-9]+\.[0-9]+\.[0-9]+' skynet-ui.css | head -1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')
[ -n "$VERSION" ] || { echo "could not read version from skynet-ui.css" >&2; exit 1; }

rm -rf pkg
mkdir -p pkg

cp skynet-ui.css skynet-ui.js LLM.md LICENSE pkg/
npx --yes esbuild skynet-ui.css --minify --outfile=pkg/skynet-ui.min.css --log-level=error
npx --yes esbuild skynet-ui.js  --minify --outfile=pkg/skynet-ui.min.js  --log-level=error

cat > pkg/package.json <<PKG
{
  "name": "skynet-ui",
  "version": "$VERSION",
  "description": "A tiny dark-first CSS + JS UI framework built for LLMs: 70+ components, 9 themes, Tailwind-compatible utilities, zero dependencies, zero build steps.",
  "license": "MIT",
  "homepage": "https://skynetui.com",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/kamikaze-skynet/skynet-ui.git"
  },
  "keywords": ["css", "ui", "framework", "components", "dark-theme", "llm", "ai", "tailwind", "no-build"],
  "main": "skynet-ui.js",
  "style": "skynet-ui.css",
  "unpkg": "skynet-ui.min.js",
  "jsdelivr": "skynet-ui.min.js",
  "exports": {
    ".": "./skynet-ui.js",
    "./css": "./skynet-ui.css",
    "./min": "./skynet-ui.min.js",
    "./css/min": "./skynet-ui.min.css",
    "./skynet-ui.css": "./skynet-ui.css",
    "./skynet-ui.js": "./skynet-ui.js",
    "./skynet-ui.min.css": "./skynet-ui.min.css",
    "./skynet-ui.min.js": "./skynet-ui.min.js",
    "./llms.txt": "./LLM.md",
    "./package.json": "./package.json"
  },
  "files": ["skynet-ui.css", "skynet-ui.js", "skynet-ui.min.css", "skynet-ui.min.js", "LLM.md"],
  "sideEffects": true
}
PKG

cat > pkg/README.md <<'MD'
# Skynet UI

A tiny dark-first CSS + JS UI framework **built for LLMs**: 70+ components, 9 themes,
Tailwind-compatible utilities, zero dependencies, zero build steps.

- Docs & live demo: **https://skynetui.com**
- LLM reference (paste into any model, or point it at the URL): **https://skynetui.com/llms.txt**
- MCP server for AI agents: `claude mcp add --transport http skynet-ui https://skynetui.com/mcp`

## Use without npm (recommended)

```html
<link rel="stylesheet" href="https://skynetui.com/v3.0.0/skynet-ui.css">
<script src="https://skynetui.com/v3.0.0/skynet-ui.js" defer></script>
```

## Use with npm / a bundler

```sh
npm install skynet-ui
```

```js
import "skynet-ui/css";  // the stylesheet
import "skynet-ui";      // the behaviors (browser-only side-effect script)
```

Minified variants: `skynet-ui/css/min` and `skynet-ui/min`. Or copy the files
from `node_modules/skynet-ui/` into your public folder and use plain tags.

**Note:** `skynet-ui.js` is a browser script (it wires `document` listeners on
load). Import it client-side only — in SSR frameworks, load it with a
client-only mechanism or a plain `<script defer>` tag.

## What you get

Buttons, cards, navbar, sidebar, modals, drawers, command palette (Ctrl+K),
toasts with actions, tabs, dropdowns, popovers, context menus, tables with
sorting/filtering/pagination/selection/CSV export, forms with validation,
combobox, date picker, tag input, dual-range slider, chat kit + `sk-prose`
for LLM output, carousel, tree view, tour, lightbox, 9 themes, a
Tailwind-compat utility layer, and more — all documented in `LLM.md`
(shipped in this package) so your model can write correct markup.
MD

echo "pkg/ assembled for skynet-ui@$VERSION"
