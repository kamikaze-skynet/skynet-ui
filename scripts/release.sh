#!/usr/bin/env bash
# Publish the current framework files into site/ — the folder Cloudflare
# Pages deploys to skynetui.com.
#
# Usage: scripts/release.sh 1.6.0
#
# What it does:
#   - copies skynet-ui.css / skynet-ui.js to site/            (the "latest" URLs)
#   - copies them to site/v<version>/                          (the pinned, immutable URLs)
#   - copies LLM.md to site/llms.txt
#
# Afterwards, update site/index.html by hand (version badge + pinned CDN
# snippet) and commit. Never overwrite an already-published site/vX.Y.Z/
# folder — pinned versions are promised to be immutable.
set -euo pipefail
cd "$(dirname "$0")/.."

VERSION="${1:?usage: scripts/release.sh <version, e.g. 1.6.0>}"

if [ -d "site/v$VERSION" ]; then
  echo "site/v$VERSION already exists — pinned versions are immutable." >&2
  echo "Bump the version instead of republishing." >&2
  exit 1
fi

mkdir -p "site/v$VERSION"
cp skynet-ui.css skynet-ui.js site/
cp skynet-ui.css skynet-ui.js "site/v$VERSION/"
cp LLM.md site/llms.txt

echo "site/ updated: latest + v$VERSION"
echo "Next: update site/index.html (version badge + CDN snippet), then commit."
