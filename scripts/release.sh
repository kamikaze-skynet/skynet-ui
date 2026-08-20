#!/usr/bin/env bash
# Publish the current framework files into site/ — the folder the Cloudflare
# Worker serves at skynetui.com.
#
# Usage: scripts/release.sh 3.1.0
#
# What it does:
#   - copies skynet-ui.css / skynet-ui.js to site/                 (the "latest" URLs)
#   - copies them to site/v<version>/                              (pinned, immutable)
#   - minifies both into skynet-ui.min.css / skynet-ui.min.js      (latest + pinned)
#   - copies LLM.md to site/llms.txt and site/v<version>/llms.txt  (versioned docs)
#   - writes site/v<version>/sri.txt with sha384 integrity hashes
#
# Afterwards, update site/index.html by hand (version badge + pinned CDN
# snippet) and add a section to site/changelog.html, then commit. Never
# overwrite an already-published site/vX.Y.Z/ folder — pinned versions are
# promised to be immutable.
set -euo pipefail
cd "$(dirname "$0")/.."

VERSION="${1:?usage: scripts/release.sh <version, e.g. 3.1.0>}"

if [ -d "site/v$VERSION" ]; then
  echo "site/v$VERSION already exists — pinned versions are immutable." >&2
  echo "Bump the version instead of republishing." >&2
  exit 1
fi

mkdir -p "site/v$VERSION"
cp skynet-ui.css skynet-ui.js site/
cp skynet-ui.css skynet-ui.js "site/v$VERSION/"
cp LLM.md site/llms.txt
cp LLM.md "site/v$VERSION/llms.txt"

echo "Minifying…"
npx --yes esbuild skynet-ui.css --minify --outfile=site/skynet-ui.min.css --log-level=error
npx --yes esbuild skynet-ui.js  --minify --outfile=site/skynet-ui.min.js  --log-level=error
cp site/skynet-ui.min.css site/skynet-ui.min.js "site/v$VERSION/"

echo "Writing SRI hashes…"
{
  echo "# Subresource Integrity hashes for Skynet UI v$VERSION"
  echo "# Usage: <link rel=\"stylesheet\" href=\"https://skynetui.com/v$VERSION/skynet-ui.min.css\""
  echo "#          integrity=\"sha384-…\" crossorigin=\"anonymous\">"
  for f in skynet-ui.css skynet-ui.js skynet-ui.min.css skynet-ui.min.js; do
    hash=$(openssl dgst -sha384 -binary "site/v$VERSION/$f" | openssl base64 -A)
    echo "$f  sha384-$hash"
  done
} > "site/v$VERSION/sri.txt"

echo "site/ updated: latest + v$VERSION (with .min files, llms.txt, sri.txt)"
echo "Next: update site/index.html (version badge + CDN snippet) and site/changelog.html, then commit."
