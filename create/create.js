#!/usr/bin/env node
/* create-skynet-ui — scaffold a Skynet UI page in seconds.
 *
 *   npm create skynet-ui            → interactive prompts
 *   npm create skynet-ui my-app -- --template chat --theme midnight
 *
 * Emits a single index.html wired to the skynetui.com CDN — no build step,
 * no dependencies. Templates: landing | dashboard | chat | auth.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const VERSION = "3.1.0";
const THEMES = ["dark", "light", "midnight", "paper", "forest", "dusk", "sky", "rose", "contrast"];
const TEMPLATES = ["landing", "dashboard", "chat", "auth"];

const HEAD = (title, theme) => `<!DOCTYPE html>
<html lang="en"${theme === "dark" ? "" : ` data-theme="${theme}"`}>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="stylesheet" href="https://skynetui.com/v${VERSION}/skynet-ui.css">
</head>
<body>
`;

const FOOT = `
  <script src="https://skynetui.com/v${VERSION}/skynet-ui.js" defer></script>
</body>
</html>
`;

const NAV = (name) => `  <nav class="sk-navbar">
    <a href="#" class="sk-navbar-brand"><span class="sk-navbar-logo">${name[0].toUpperCase()}</span> ${name}</a>
    <button class="sk-navbar-burger" data-sk-burger aria-label="Menu">&#9776;</button>
    <ul class="sk-navbar-nav">
      <li><a href="#" class="active">Home</a></li>
      <li><a href="#">About</a></li>
    </ul>
    <div class="sk-navbar-end">
      <button class="sk-btn sk-btn-ghost sk-btn-icon" data-sk-theme-toggle aria-label="Toggle theme">&#9681;</button>
      <a href="#" class="sk-btn sk-btn-primary sk-btn-sm">Get started</a>
    </div>
  </nav>
`;

const BODIES = {
  landing: (name) => NAV(name) + `
  <section class="sk-hero">
    <span class="sk-badge sk-badge-primary mb-3">now shipping</span>
    <h1 class="sk-hero-title">${name}</h1>
    <p class="sk-hero-subtitle">Your one-line pitch goes here. Edit index.html — everything is plain HTML with Skynet UI classes.</p>
    <div class="sk-hero-actions">
      <a class="sk-btn sk-btn-primary sk-btn-lg" href="#features">See features</a>
      <a class="sk-btn sk-btn-outline sk-btn-lg" href="https://skynetui.com/llms.txt">Read the docs</a>
    </div>
  </section>
  <div class="sk-container py-12" id="features">
    <div class="sk-grid sk-cols-3">
      <div class="sk-card sk-card-hover" data-sk-reveal><div class="sk-card-body">
        <h3 class="sk-card-title">Fast</h3>
        <p class="text-secondary text-sm mb-0">Two files from a CDN. No build, no install.</p>
      </div></div>
      <div class="sk-card sk-card-hover" data-sk-reveal><div class="sk-card-body">
        <h3 class="sk-card-title">Themed</h3>
        <p class="text-secondary text-sm mb-0">Nine built-in themes — try the toggle in the navbar.</p>
      </div></div>
      <div class="sk-card sk-card-hover" data-sk-reveal><div class="sk-card-body">
        <h3 class="sk-card-title">AI-ready</h3>
        <p class="text-secondary text-sm mb-0">Point any LLM at skynetui.com/llms.txt to extend this page.</p>
      </div></div>
    </div>
  </div>
  <footer class="sk-footer"><div class="sk-container">
    <div class="sk-footer-bottom"><span>&copy; ${name}</span><span>Built with Skynet UI</span></div>
  </div></footer>
`,
  dashboard: (name) => NAV(name) + `
  <div class="sk-container py-8">
    <h1>Overview</h1>
    <div class="sk-grid sk-cols-4 mb-8 mt-4">
      <div class="sk-card"><div class="sk-card-body"><div class="sk-stat-label">Users</div><div class="sk-stat-value">1,284</div><span class="sk-delta sk-delta-up">8%</span></div></div>
      <div class="sk-card"><div class="sk-card-body"><div class="sk-stat-label">Revenue</div><div class="sk-stat-value">$12.4k</div><span class="sk-delta sk-delta-up">21%</span></div></div>
      <div class="sk-card"><div class="sk-card-body"><div class="sk-stat-label">Errors</div><div class="sk-stat-value">0.2%</div><span class="sk-delta sk-delta-down">0.1%</span></div></div>
      <div class="sk-card"><div class="sk-card-body"><div class="sk-stat-label">Usage</div><div class="sk-donut mt-2" style="--p: 64; --sk-donut-size: 72px"><div><div class="sk-donut-label text-sm">64%</div></div></div></div></div>
    </div>
    <input class="sk-input mb-3" type="search" placeholder="Filter&hellip;" data-sk-filter="data" aria-label="Filter rows">
    <div class="sk-table-wrap">
      <table class="sk-table sk-table-hover" id="data" data-sk-paginate="5">
        <thead><tr><th data-sk-sort>Name</th><th data-sk-sort>Plan</th><th data-sk-sort>MRR</th><th>Status</th></tr></thead>
        <tbody>
          <tr><td class="font-medium text-main">Acme Corp</td><td>Team</td><td>$290</td><td><span class="sk-badge sk-badge-success">Active</span></td></tr>
          <tr><td class="font-medium text-main">Globex</td><td>Pro</td><td>$90</td><td><span class="sk-badge sk-badge-success">Active</span></td></tr>
          <tr><td class="font-medium text-main">Initech</td><td>Free</td><td>$0</td><td><span class="sk-badge sk-badge-warning">Trial</span></td></tr>
          <tr><td class="font-medium text-main">Umbrella</td><td>Team</td><td>$290</td><td><span class="sk-badge sk-badge-danger">Past due</span></td></tr>
          <tr><td class="font-medium text-main">Hooli</td><td>Pro</td><td>$90</td><td><span class="sk-badge sk-badge-success">Active</span></td></tr>
          <tr><td class="font-medium text-main">Vandelay</td><td>Free</td><td>$0</td><td><span class="sk-badge sk-badge-warning">Trial</span></td></tr>
        </tbody>
      </table>
    </div>
  </div>
`,
  chat: (name) => NAV(name) + `
  <main class="sk-container py-8 w-full" style="max-width: 760px">
    <div class="sk-chat" id="chat">
      <div class="sk-msg sk-msg-system">New conversation</div>
      <div class="sk-msg sk-msg-assistant sk-prose"><p>Hi! I render <strong>markdown</strong> via <code>skMarkdown</code>. Wire the send button to your model API.</p></div>
    </div>
    <div class="sk-promptbar mt-6">
      <textarea class="sk-textarea" id="prompt" data-sk-autogrow rows="1" placeholder="Message&hellip;" aria-label="Message"></textarea>
      <button class="sk-btn sk-btn-primary" id="send">Send</button>
    </div>
  </main>
  <script defer>
    addEventListener("DOMContentLoaded", function () {
      var input = document.getElementById("prompt");
      function send() {
        var text = input.value.trim();
        if (!text) return;
        input.value = "";
        skChat.append("chat", "user", text);
        skChat.typing("chat", true);
        // Replace this timeout with your model API call; use skChat.stream for a typing effect.
        setTimeout(function () {
          skChat.typing("chat", false);
          skChat.append("chat", "assistant", "Echo: " + text);
        }, 600);
      }
      document.getElementById("send").addEventListener("click", send);
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
      });
    });
  </script>
`,
  auth: (name) => `
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full" style="max-width: 400px">
      <div class="text-center mb-6">
        <span class="sk-navbar-logo" style="width: 44px; height: 44px; font-size: 1.2rem; display: inline-flex">${name[0].toUpperCase()}</span>
        <h1 class="text-2xl mt-3 mb-1">Sign in to ${name}</h1>
      </div>
      <div class="sk-card"><div class="sk-card-body">
        <form data-sk-validate onsubmit="event.preventDefault(); if (this.checkValidity()) skToast('Signed in!', 'success');">
          <div class="sk-field">
            <label class="sk-label" for="email">Email</label>
            <input class="sk-input" id="email" type="email" required autocomplete="email">
          </div>
          <div class="sk-field">
            <label class="sk-label" for="pw">Password</label>
            <input class="sk-input" id="pw" type="password" required minlength="8" autocomplete="current-password">
          </div>
          <button class="sk-btn sk-btn-primary sk-btn-block" type="submit">Sign in</button>
        </form>
      </div></div>
    </div>
  </div>
`,
};

function ask(rl, question, options, fallback) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      answer = answer.trim().toLowerCase();
      resolve(options.includes(answer) ? answer : fallback);
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const flags = {};
  const positional = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) { flags[args[i].slice(2)] = args[i + 1]; i++; }
    else positional.push(args[i]);
  }

  let dir = positional[0];
  let template = flags.template;
  let theme = flags.theme;

  if (!dir || !TEMPLATES.includes(template) || !THEMES.includes(theme)) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    if (!dir) dir = await new Promise((r) => rl.question("Project folder name (my-app): ", (a) => r(a.trim() || "my-app")));
    if (!TEMPLATES.includes(template)) template = await ask(rl, `Template [${TEMPLATES.join("/")}] (landing): `, TEMPLATES, "landing");
    if (!THEMES.includes(theme)) theme = await ask(rl, `Theme [${THEMES.join("/")}] (dark): `, THEMES, "dark");
    rl.close();
  }

  const name = path.basename(dir).replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "My App";
  const target = path.resolve(process.cwd(), dir);
  if (fs.existsSync(path.join(target, "index.html"))) {
    console.error(`Refusing to overwrite existing ${dir}/index.html`);
    process.exit(1);
  }
  fs.mkdirSync(target, { recursive: true });

  const html = HEAD(name, theme) + BODIES[template](name) + FOOT;
  fs.writeFileSync(path.join(target, "index.html"), html);

  console.log(`\n  Created ${dir}/index.html  (${template} template, ${theme} theme)`);
  console.log("  Open it in a browser — no install, no build.");
  console.log("  Extend it with any LLM: point it at https://skynetui.com/llms.txt\n");
}

main().catch((e) => { console.error(e); process.exit(1); });
