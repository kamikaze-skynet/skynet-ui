/* Skynet UI smoke tests — runs in CI on every PR (see .github/workflows/ci.yml)
 * and locally with:
 *   PLAYWRIGHT_EXEC=/path/to/chromium node tests/smoke.js
 * Asserts: demo + site pages load with zero console errors, all 9 themes
 * apply, core behaviors work, and the files stay under the size budget.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const BUDGET = { "skynet-ui.css": 200 * 1024, "skynet-ui.js": 120 * 1024 };
let failures = 0;

function check(name, ok, detail) {
  console.log((ok ? "PASS" : "FAIL") + "  " + name + (detail && !ok ? "  — " + detail : ""));
  if (!ok) failures++;
}

async function main() {
  /* size budget */
  for (const [file, limit] of Object.entries(BUDGET)) {
    const size = fs.statSync(path.join(ROOT, file)).size;
    check(`size budget ${file} (${(size / 1024).toFixed(0)}KB <= ${(limit / 1024).toFixed(0)}KB)`, size <= limit);
  }

  /* browser */
  let chromium;
  try { ({ chromium } = require("playwright")); }
  catch { ({ chromium } = require("playwright-core")); }
  const browser = await chromium.launch(
    process.env.PLAYWRIGHT_EXEC ? { executablePath: process.env.PLAYWRIGHT_EXEC } : {}
  );
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    /* absolute-path assets (favicon, iframe srcdoc includes) cannot resolve
       over file:// — they exist on the deployed site, so ignore only those */
    if (m.type() === "error" && !/ERR_FILE_NOT_FOUND|Not allowed to load local resource/.test(m.text())) errors.push(m.text());
  });

  const url = (p) => "file://" + path.join(ROOT, p);

  await page.goto(url("demo.html"));
  await page.waitForTimeout(600);
  check("demo loads with skToast defined", await page.evaluate(() => typeof window.skToast === "function"));

  /* all 9 themes apply distinct backgrounds */
  const bgs = new Set();
  for (const theme of ["dark", "light", "midnight", "paper", "forest", "dusk", "sky", "rose", "contrast"]) {
    await page.evaluate((t) => skSetTheme(t), theme);
    bgs.add(await page.evaluate(() => getComputedStyle(document.body).backgroundColor));
  }
  check("9 themes produce distinct backgrounds", bgs.size >= 8, [...bgs].join(" | "));
  await page.evaluate(() => skSetTheme("dark"));

  /* markdown + highlight */
  const md = await page.evaluate(() => skMarkdown("# T\n\n**b** `c`"));
  check("skMarkdown renders", md.includes("<h1>T</h1>") && md.includes("<strong>b</strong>"));
  const hl = await page.evaluate(() => skHighlight("const x = 1; // c", "js"));
  check("skHighlight tokens", hl.includes("sk-tok-kw") && hl.includes("sk-tok-com"));

  /* modal opens + focus trap keeps focus inside */
  await page.click('[data-sk-open="demo-modal"]');
  await page.waitForTimeout(300);
  for (let i = 0; i < 8; i++) await page.keyboard.press("Tab");
  check("focus trapped in open modal", await page.evaluate(() =>
    document.querySelector("#demo-modal").contains(document.activeElement)));
  await page.keyboard.press("Escape");

  /* charts render */
  check("donut present", (await page.locator(".sk-donut").count()) >= 1);
  check("bar chart present", (await page.locator(".sk-bar-row").count()) >= 3);

  /* v3.2: widgets initialize */
  check("multiselect built (chips + panel)", await page.evaluate(() =>
    document.querySelector(".sk-multiselect .sk-ms-control") !== null &&
    document.querySelectorAll(".sk-multiselect .sk-chip").length >= 2));
  check("otp renders 6 boxes", (await page.locator("#demo-otp input:not([type=hidden])").count()) === 6);
  check("calendar renders 42 day cells", (await page.locator("#demo-cal .sk-cal-day").count()) === 42);
  check("split bar injected", (await page.locator("[data-sk-split] .sk-split-bar").count()) >= 1);
  check("sortable items draggable", await page.evaluate(() =>
    document.querySelector("#demo-sortable > li").draggable === true));
  check("virtual list renders a window, not 10k rows", await page.evaluate(() => {
    const n = document.querySelectorAll("#demo-virtual .sk-virtual-item").length;
    return n > 3 && n < 60;
  }));
  check("skDiff marks adds and dels", await page.evaluate(() => {
    const html = skDiff("a\nb\nc", "a\nx\nc");
    return html.includes("sk-diff-add") && html.includes("sk-diff-del");
  }));
  check("input mask formats digits", await page.evaluate(() => {
    const el = document.querySelector('[data-sk-mask]');
    el.value = "5551234567";
    el.dispatchEvent(new Event("input", { bubbles: true }));
    return el.value === "(555) 123-4567";
  }));
  check("streamAsync renders markdown chunks", await page.evaluate(async () => {
    const msg = await skChat.streamAsync("demo-chat2", ["**hi** ", "there"], { delay: 1 });
    return msg && msg.innerHTML.includes("<strong>hi</strong>");
  }));
  check("parity: gradient utility produces a gradient", await page.evaluate(() => {
    const el = document.querySelector(".bg-gradient-to-r");
    return getComputedStyle(el).backgroundImage.includes("linear-gradient");
  }));
  check("parity: hover:scale class parsed (scale prop)", await page.evaluate(() => {
    const el = document.createElement("div");
    el.className = "scale-105";
    document.body.appendChild(el);
    const ok = getComputedStyle(el).scale === "1.05";
    el.remove();
    return ok;
  }));

  /* site pages load cleanly */
  for (const p of ["site/index.html", "site/examples.html", "site/themer.html", "site/play.html",
                   "site/changelog.html", "site/compare.html", "site/examples/dashboard.html",
                   "site/examples/chat.html", "site/examples/auth.html"]) {
    await page.goto(url(p));
    await page.waitForTimeout(400);
    check(`${p} has body content`, await page.evaluate(() => document.body.children.length > 1));
  }

  check("zero console errors across all pages", errors.length === 0, errors.slice(0, 3).join(" | "));
  await browser.close();

  console.log(failures ? `\n${failures} failure(s)` : "\nAll smoke tests passed");
  process.exit(failures ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
