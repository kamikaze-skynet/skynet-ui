# Contributing to Skynet UI

Thanks for helping! The project's rules keep it what it is:

1. **Two files, zero build steps, zero dependencies.** Everything ships in
   `skynet-ui.css` and `skynet-ui.js`. No preprocessors, no bundler, no
   runtime dependencies — ever.
2. **Declarative first.** New interactive behavior should work through
   `data-sk-*` attributes; global functions are the escape hatch, not the API.
3. **Every color goes through a variable.** Components must look right in all
   9 themes — if you hardcode a hex, it will break one of them.
4. **LLM.md is part of the definition of done.** Every new class, attribute,
   or function is documented there (it's served as skynetui.com/llms.txt and
   is how AI tools learn the framework), and usually in README.md + demo.html.

## Working on it

- Open `demo.html` in a browser — no server needed.
- Run the smoke tests locally: `PLAYWRIGHT_EXEC=/path/to/chromium node tests/smoke.js`
  (CI runs them on every PR).
- Size budgets are enforced: keep `skynet-ui.css` ≤ 200KB, `skynet-ui.js` ≤ 120KB.

## Releases (maintainers)

1. Bump the version in the `skynet-ui.css` / `skynet-ui.js` headers, `LLM.md`,
   and `create/package.json`.
2. `scripts/release.sh X.Y.Z` — copies into `site/` + pinned folder, minifies,
   writes SRI hashes.
3. Update `site/index.html` (badge + CDN snippet) and `site/changelog.html`.
4. Merge to `main` → the site auto-deploys.
5. Run the **Publish to npm** workflow → both packages publish with provenance
   and a GitHub Release is created.
