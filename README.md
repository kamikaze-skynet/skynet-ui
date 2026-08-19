# Skynet UI

A tiny dark-first UI framework for your websites. Two files, zero build steps, zero dependencies.

- `skynet-ui.css` — all the styling (theme, utilities, components)
- `skynet-ui.js` — small script that makes modals, toasts, tabs, dropdowns, and the mobile menu work
- `demo.html` — open this in a browser to see every component
- `LLM.md` — compact reference to paste into a Claude conversation so it can write correct Skynet UI markup for you

No npm, no Tailwind, no React. You just write normal HTML with class names.

---

## 1. Adding it to an Express + EJS site

Step 1 — copy `skynet-ui.css` and `skynet-ui.js` into your site's `public` folder:

```
your-site/
├── public/
│   ├── skynet-ui.css
│   └── skynet-ui.js
├── views/
│   └── index.ejs
└── app.js
```

Step 2 — make sure Express serves the `public` folder (most apps already have this line in `app.js`):

```js
app.use(express.static('public'));
```

Step 3 — add two tags to your EJS page (or your shared layout/header partial):

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="/skynet-ui.css">
</head>
<body>
  <!-- your page content -->
  <script src="/skynet-ui.js" defer></script>
</body>
```

The `viewport` meta tag matters — without it the mobile layout won't work.

That's the entire installation. Every page that includes those two tags gets the dark theme, all components, and all utility classes.

---

## 2. The 60-second mental model

Skynet UI gives you two kinds of class names:

1. Components — prefixed with `sk-`. These are prebuilt things: `sk-btn`, `sk-card`, `sk-navbar`, `sk-modal`. You copy their HTML pattern and it looks right.
2. Utilities — short unprefixed helpers for spacing and layout: `p-4` (padding), `mt-6` (margin-top), `flex`, `gap-3`, `text-muted`, `text-center`. You sprinkle these to adjust spacing and alignment.

A typical bit of page:

```html
<div class="sk-card">
  <div class="sk-card-body">
    <h3 class="sk-card-title">Hello</h3>
    <p class="text-muted">Some secondary text.</p>
    <button class="sk-btn sk-btn-primary mt-4">Do the thing</button>
  </div>
</div>
```

Interactive components (modals, tabs, dropdowns, toasts, the mobile menu) work through `data-sk-...` attributes — you never write JavaScript. For example, `data-sk-open="my-modal"` on a button opens the modal with `id="my-modal"`.

---

## 3. Theming — change your whole site in one place

Open `skynet-ui.css`. The very first block is `:root { ... }` with all the colors, fonts, and corner radii. Edit those values and every component updates.

Want a green accent instead of indigo? Change:

```css
--sk-primary:        #6366f1;   /* → e.g. #10b981 */
--sk-primary-hover:  #4f52e0;   /* → a slightly darker version, e.g. #059669 */
--sk-primary-soft:   rgba(99, 102, 241, 0.15);  /* → rgba(16, 185, 129, 0.15) */
```

You can also override variables per-site without touching the framework file — put this in a `<style>` tag or your own CSS loaded after skynet-ui.css:

```html
<style>
  :root { --sk-primary: #10b981; --sk-primary-hover: #059669; }
</style>
```

A light theme is built in: add `data-theme="light"` to the `<html>` or `<body>` tag.

Want a user-facing switch instead? Put `data-sk-theme-toggle` on any button and skynet-ui.js does the rest — it flips the theme and remembers the choice in `localStorage` across page loads:

```html
<button class="sk-btn sk-btn-ghost sk-btn-icon" data-sk-theme-toggle aria-label="Toggle theme">&#9681;</button>
```

---

## 4. Components

### Buttons

```html
<button class="sk-btn sk-btn-primary">Primary</button>
<button class="sk-btn">Default</button>
<button class="sk-btn sk-btn-outline">Outline</button>
<button class="sk-btn sk-btn-ghost">Ghost</button>
<button class="sk-btn sk-btn-success">Success</button>
<button class="sk-btn sk-btn-danger">Danger</button>
```

Sizes: add `sk-btn-sm` or `sk-btn-lg`. Full-width: `sk-btn-block`. Round icon button: `sk-btn-icon`. Links can be buttons too: `<a class="sk-btn sk-btn-primary" href="/signup">Sign up</a>`.

Loading state: add `sk-btn-loading` — a spinner appears before the label and clicks are blocked (toggle the class from your JS while a request is in flight).

Button groups join buttons into one bar; add `data-sk-segment` to turn the group into a segmented control where clicking moves the `active` highlight automatically:

```html
<div class="sk-btn-group" data-sk-segment>
  <button class="sk-btn active">Day</button>
  <button class="sk-btn">Week</button>
  <button class="sk-btn">Month</button>
</div>
```

### Cards

```html
<div class="sk-card">
  <div class="sk-card-header">
    Title in the header
    <span class="sk-badge sk-badge-success">Live</span>
  </div>
  <div class="sk-card-body">
    <h3 class="sk-card-title">Card title</h3>
    <p class="sk-card-subtitle">Muted subtitle</p>
    <p>Body content.</p>
  </div>
  <div class="sk-card-footer">
    <button class="sk-btn sk-btn-primary sk-btn-sm">Action</button>
  </div>
</div>
```

Header and footer are optional — a card can be just `sk-card` + `sk-card-body`. Add `sk-card-hover` to make it lift on hover (good for clickable cards). For dashboard stat cards use `sk-stat-label` + `sk-stat-value` inside a card body.

### Navbar

```html
<nav class="sk-navbar">
  <a href="/" class="sk-navbar-brand">
    <span class="sk-navbar-logo">S</span> My Site
  </a>
  <button class="sk-navbar-burger" data-sk-burger aria-label="Menu">&#9776;</button>
  <ul class="sk-navbar-nav">
    <li><a href="/" class="active">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
  <div class="sk-navbar-end">
    <a href="/login" class="sk-btn sk-btn-primary sk-btn-sm">Log in</a>
  </div>
</nav>
```

On phones the links collapse behind the burger button automatically — the `data-sk-burger` attribute is all the wiring needed. Put `class="active"` on the current page's link. The navbar sticks to the top of the page by default.

### Sidebar layout

```html
<div class="sk-layout">
  <aside class="sk-sidebar">
    <div class="sk-sidebar-title">Menu</div>
    <a href="/dashboard" class="active">Dashboard</a>
    <a href="/settings">Settings</a>
  </aside>
  <main class="sk-main">
    <!-- somewhere visible on mobile, a button to open the sidebar: -->
    <button class="sk-btn sk-btn-outline sk-btn-sm hide-desktop" data-sk-sidebar>&#9776; Menu</button>
    <h1>Page content</h1>
  </main>
</div>
```

Desktop: fixed 250px sidebar next to the content. Mobile: the sidebar slides in from the left when a `data-sk-sidebar` button is tapped, with a dark backdrop (tap it or press Esc to close). The `hide-desktop` utility hides the menu button on big screens.

### Forms

```html
<div class="sk-field">
  <label class="sk-label" for="email">Email</label>
  <input class="sk-input" id="email" type="email" placeholder="name@site.com">
  <div class="sk-help">Optional hint text under the input.</div>
</div>

<div class="sk-field">
  <label class="sk-label" for="topic">Topic</label>
  <select class="sk-select" id="topic">
    <option>One</option>
    <option>Two</option>
  </select>
</div>

<div class="sk-field">
  <label class="sk-label" for="msg">Message</label>
  <textarea class="sk-textarea" id="msg"></textarea>
</div>

<button class="sk-btn sk-btn-primary" type="submit">Send</button>
```

`sk-field` just adds bottom margin so fields stack neatly. For a validation error, add `sk-invalid` to the input and an `<div class="sk-error">message</div>` under it.

Input with attached button:

```html
<div class="sk-input-group">
  <input class="sk-input" type="text" placeholder="Search…">
  <button class="sk-btn sk-btn-primary">Go</button>
</div>
```

Date and time inputs are just `sk-input` too — the framework sets `color-scheme`, so the browser's native date/time pickers automatically match the dark (or light) theme:

```html
<input class="sk-input" type="date">
<input class="sk-input" type="time">
```

### Checkboxes, radios, toggles

```html
<label class="sk-check"><input type="checkbox" checked> Remember me</label>
<label class="sk-check"><input type="radio" name="plan" checked> Free plan</label>

<label class="sk-toggle">
  <input type="checkbox" checked><span></span> Dark mode
</label>
```

The toggle needs that empty `<span></span>` right after the input — that's the switch itself.

### Tables

```html
<div class="sk-table-wrap">
  <table class="sk-table sk-table-hover">
    <thead>
      <tr><th>Name</th><th>Status</th></tr>
    </thead>
    <tbody>
      <tr>
        <td>Deploy v2</td>
        <td><span class="sk-badge sk-badge-success">Active</span></td>
      </tr>
    </tbody>
  </table>
</div>
```

Always keep the `sk-table-wrap` wrapper — it gives the rounded border and lets wide tables scroll sideways on phones instead of breaking the layout. Options: `sk-table-hover` (row highlight), `sk-table-striped` (zebra rows).

Sorting: put `data-sk-sort` on any `<th>` and clicking it sorts the rows by that column (click again to reverse). Columns whose cells are all numbers — including `99.98%` or `$1,200` — sort numerically.

Filtering: an input with `data-sk-filter="table-id"` hides rows that don't contain the typed text as you type. It works on lists too — point it at a `.sk-list` (or any container) and it filters the direct children:

```html
<input class="sk-input mb-3" type="search" placeholder="Filter…" data-sk-filter="my-table">
<div class="sk-table-wrap">
  <table class="sk-table" id="my-table">
    <thead><tr><th data-sk-sort>Name</th><th data-sk-sort>Uptime</th></tr></thead>
    <tbody>…</tbody>
  </table>
</div>
```

### Tabs

```html
<div class="sk-tabs" data-sk-tabs>
  <button class="sk-tab active" data-sk-tab="panel-one">First</button>
  <button class="sk-tab" data-sk-tab="panel-two">Second</button>
</div>
<div class="sk-tab-panel active" id="panel-one">First panel content</div>
<div class="sk-tab-panel" id="panel-two">Second panel content</div>
```

Rules: the container gets `data-sk-tabs`; each button's `data-sk-tab` value matches a panel's `id`; put `active` on the starting tab and its panel. For pill-shaped tabs add `sk-tabs-pills` to the container.

### Modals

```html
<button class="sk-btn sk-btn-primary" data-sk-open="my-modal">Open</button>

<!-- put modals near the end of <body> -->
<div class="sk-modal" id="my-modal" role="dialog" aria-modal="true">
  <div class="sk-modal-box">
    <div class="sk-modal-header">
      Title
      <button class="sk-modal-x" data-sk-close aria-label="Close">&times;</button>
    </div>
    <div class="sk-modal-body">
      <p>Anything can go here — text, forms, images.</p>
    </div>
    <div class="sk-modal-footer">
      <button class="sk-btn sk-btn-ghost" data-sk-close>Cancel</button>
      <button class="sk-btn sk-btn-primary" data-sk-close>Save</button>
    </div>
  </div>
</div>
```

`data-sk-open="the-modal-id"` opens; anything with `data-sk-close` inside the modal closes it. Clicking the dark backdrop or pressing Esc also closes. Sizes: add `sk-modal-sm` or `sk-modal-lg` to the `sk-modal-box`. From your own JS you can also call `skOpenModal('my-modal')` / `skCloseModal('my-modal')`.

For a quick confirmation you don't need any markup — `skConfirm` builds the dialog for you and returns a promise:

```js
skConfirm("Delete this project?", { danger: true, okText: "Delete" })
  .then(ok => { if (ok) deleteProject(); });
// options (all optional): title, okText, cancelText, danger
```

### Drawers (slide-in panels)

Same wiring as modals — `data-sk-open` / `data-sk-close` / backdrop / Esc — but the box slides in from the side. Good for filters, settings, carts.

```html
<button class="sk-btn" data-sk-open="my-drawer">Open drawer</button>

<!-- put drawers near the end of <body>, like modals -->
<div class="sk-drawer" id="my-drawer" role="dialog" aria-modal="true">
  <div class="sk-drawer-box">
    <div class="sk-drawer-header">
      Title
      <button class="sk-modal-x" data-sk-close aria-label="Close">&times;</button>
    </div>
    <div class="sk-drawer-body">Anything can go here.</div>
    <div class="sk-drawer-footer">
      <button class="sk-btn sk-btn-primary" data-sk-close>Done</button>
    </div>
  </div>
</div>
```

Slides from the right by default; add `sk-drawer-left` to the container for the left side.

### Toasts (notifications)

Easiest — no JS, just an attribute:

```html
<button class="sk-btn" data-sk-toast="Saved!" data-sk-toast-type="success">Save</button>
```

Or from JavaScript (e.g. after a fetch):

```js
skToast("Profile updated", "success");
skToast("Something went wrong", "danger");
skToast("Heads up", "warning");
skToast("Plain info toast");           // default "info" style
skToast("Stays until dismissed", "info", 0);  // 3rd arg = ms; 0 = sticky
```

Toasts appear bottom-right and dismiss themselves after 3.5 seconds.

The third argument can also be an options object, which is how you add an action button ("Undo" patterns):

```js
skToast("Message archived", "info", {
  duration: 6000,             // optional, ms; 0 = sticky
  actionText: "Undo",
  onAction: () => restoreMessage(),   // runs on click, then the toast closes
});
```

### Dropdown menus

```html
<div class="sk-dropdown">
  <button class="sk-btn" data-sk-dropdown>Menu &#9662;</button>
  <div class="sk-dropdown-menu">
    <a href="/profile">Profile</a>
    <a href="/settings">Settings</a>
    <hr class="sk-dropdown-divider">
    <button>Sign out</button>
  </div>
</div>
```

Add `sk-right` to the menu to align it to the right edge (useful at the end of a navbar). Clicking elsewhere or pressing Esc closes it.

### Popovers

A dropdown's bigger sibling: a click-toggled panel for rich content instead of menu items.

```html
<div class="sk-popover">
  <button class="sk-btn" data-sk-popover>Details &#9662;</button>
  <div class="sk-popover-panel">
    <div class="sk-popover-title">Optional title</div>
    Any content — text, lists, even buttons.
  </div>
</div>
```

Opens below the trigger. On the panel: `sk-top` opens above, `sk-right` aligns to the trigger's right edge. Outside click and Esc close it.

### Command palette (Ctrl+K)

Put one `.sk-cmdk` near the end of `<body>` and it opens with <kbd>Ctrl</kbd>+<kbd>K</kbd> (<kbd>⌘</kbd><kbd>K</kbd> on Mac) or any `data-sk-open` button. Typing filters the items, <kbd>↑</kbd>/<kbd>↓</kbd> moves, <kbd>Enter</kbd> runs the highlighted one, Esc closes.

```html
<div class="sk-cmdk" id="cmdk" role="dialog" aria-modal="true" aria-label="Command palette">
  <div class="sk-cmdk-box">
    <input class="sk-cmdk-input" type="text" placeholder="Type a command…" aria-label="Search commands">
    <div class="sk-cmdk-list">
      <a href="/dashboard">&#128200; Dashboard</a>
      <a href="/settings" data-sk-keywords="preferences account">&#9881; Settings</a>
      <button onclick="deploy()">&#128640; Deploy now</button>
    </div>
    <div class="sk-cmdk-empty">No matching commands.</div>
    <div class="sk-cmdk-hint">
      <span><kbd>&uarr;</kbd><kbd>&darr;</kbd> navigate</span>
      <span><kbd>Enter</kbd> run</span>
      <span><kbd>Esc</kbd> close</span>
    </div>
  </div>
</div>
```

Items are plain links or buttons — choosing one closes the palette and runs it. `data-sk-keywords` adds extra words the filter matches (the hint bar and empty state are optional).

### Carousel

Scroll-snap based: swiping and momentum come from the browser, so the track works with zero JS. The optional arrow buttons scroll one view per click.

```html
<div class="sk-carousel sk-carousel-peek">
  <div class="sk-carousel-track">
    <div class="sk-carousel-slide"><div class="sk-card">…</div></div>
    <div class="sk-carousel-slide"><div class="sk-card">…</div></div>
  </div>
  <div class="flex gap-2 mt-3">
    <button class="sk-btn sk-btn-outline sk-btn-icon" data-sk-carousel-prev aria-label="Previous">&larr;</button>
    <button class="sk-btn sk-btn-outline sk-btn-icon" data-sk-carousel-next aria-label="Next">&rarr;</button>
  </div>
</div>
```

One slide per view by default. On the carousel: `sk-carousel-peek` shows the edge of the next slide; `sk-carousel-cols-2` / `sk-carousel-cols-3` show 2/3 per view from 768px up.

### Badges and alerts

```html
<span class="sk-badge sk-badge-success">Active</span>
<span class="sk-badge sk-badge-danger">Failed</span>

<div class="sk-alert sk-alert-warning">Disk usage is above 80%.</div>
```

Variants for both: `primary`, `success`, `warning`, `danger`, `info` (badges also have a plain default).

### Breadcrumbs

```html
<nav class="sk-breadcrumbs" aria-label="Breadcrumb">
  <a href="/">Home</a>
  <a href="/projects">Projects</a>
  <span>Current page</span>
</nav>
```

Links for the ancestors, a plain `<span>` for the current page. The `/` separators are added automatically.

### Pagination

```html
<nav class="sk-pagination" aria-label="Pagination">
  <a href="?p=1">&laquo;</a>
  <a href="?p=1">1</a>
  <span class="active">2</span>
  <a href="?p=3">3</a>
  <a href="?p=3">&raquo;</a>
</nav>
```

Children can be `<a>`, `<button>`, or `<span>`. Mark the current page with `active`; disable an arrow with the `disabled` attribute (buttons) or `sk-disabled` class (links).

### Accordion

```html
<details class="sk-accordion" open>
  <summary>Section title</summary>
  <div class="sk-accordion-body">Content — anything can go here.</div>
</details>
<details class="sk-accordion">
  <summary>Another section</summary>
  <div class="sk-accordion-body">More content.</div>
</details>
```

Built on the native `<details>` element, so it needs no JavaScript at all. Add `open` to the one that should start expanded. Give several the same `name="faq"` attribute if you want opening one to close the others.

### Tooltips

```html
<button class="sk-btn" data-sk-tip="Shown on hover">Hover me</button>
<button class="sk-btn sk-tip-bottom" data-sk-tip="Shown below">Or me</button>
```

Pure CSS — put `data-sk-tip="text"` on anything. Appears above by default; `sk-tip-bottom` flips it below. Keep the text short, it doesn't wrap.

### Chips (tags)

```html
<span class="sk-chip">design</span>
<span class="sk-chip sk-chip-primary">
  frontend <button class="sk-chip-x" data-sk-dismiss aria-label="Remove">&times;</button>
</span>
```

Variants: `primary`, `success`, `warning`, `danger`, `info`. The optional `sk-chip-x` button with `data-sk-dismiss` removes the chip when clicked (`data-sk-dismiss` also works inside an `sk-alert` to make it dismissible).

### List group

```html
<div class="sk-list">
  <a href="/inbox" class="active">Inbox</a>
  <a href="/sent">Sent</a>
  <div>Plain non-interactive row</div>
</div>
```

A bordered stack of rows — links and buttons get hover states, `active` marks the current one. Rows are flex containers, so `ml-auto` pushes a badge to the right edge.

### Empty state

```html
<div class="sk-empty">
  <div class="sk-empty-icon">&#128230;</div>
  <div class="sk-empty-title">No projects yet</div>
  <p>Create your first project to get started.</p>
  <button class="sk-btn sk-btn-primary sk-btn-sm">New project</button>
</div>
```

### Skeleton loaders

```html
<div class="sk-skeleton" style="width: 60%"></div>          <!-- generic block -->
<div class="sk-skeleton sk-skeleton-text"></div>            <!-- thin text line; stacks -->
<span class="sk-skeleton sk-skeleton-circle"></span>        <!-- avatar-sized circle -->
<div class="sk-skeleton" style="height: 120px"></div>       <!-- image placeholder -->
```

Shimmering placeholders to show while content loads. Size them with inline widths/heights or utilities.

### Hero

```html
<section class="sk-hero">
  <h1 class="sk-hero-title">Ship faster</h1>
  <p class="sk-hero-subtitle">One-line pitch goes here.</p>
  <div class="sk-hero-actions">
    <a class="sk-btn sk-btn-primary sk-btn-lg" href="/signup">Start free</a>
    <a class="sk-btn sk-btn-outline sk-btn-lg" href="/docs">Read docs</a>
  </div>
</section>
```

Big centered landing-page opener with a soft accent glow behind it.

### Footer

```html
<footer class="sk-footer">
  <div class="sk-container">
    <div class="sk-footer-grid">
      <div>
        <div class="sk-footer-title">Product</div>
        <a href="/features">Features</a>
        <a href="/pricing">Pricing</a>
      </div>
      <!-- more columns -->
    </div>
    <div class="sk-footer-bottom">
      <span>&copy; 2026 My Site</span>
      <span>Made with Skynet UI</span>
    </div>
  </div>
</footer>
```

Link columns wrap automatically on small screens.

### Stepper (wizard progress)

```html
<div class="sk-steps">
  <div class="sk-step done"><div class="sk-step-dot">&check;</div><div class="sk-step-label">Cart</div></div>
  <div class="sk-step active"><div class="sk-step-dot">2</div><div class="sk-step-label">Shipping</div></div>
  <div class="sk-step"><div class="sk-step-dot">3</div><div class="sk-step-label">Payment</div></div>
</div>
```

Mark completed steps `done` and the current one `active`; the connector lines color themselves.

### Timeline

```html
<div class="sk-timeline">
  <div class="sk-timeline-item sk-tl-success">
    <div class="sk-timeline-time">2 hours ago</div>
    <div class="sk-timeline-title">Deploy finished</div>
    <p class="text-muted text-sm mb-0">v2.1 rolled out.</p>
  </div>
  <div class="sk-timeline-item">
    <div class="sk-timeline-time">Yesterday</div>
    <div class="sk-timeline-title">Project created</div>
  </div>
</div>
```

Dot colors: `sk-tl-primary`, `sk-tl-success`, `sk-tl-warning`, `sk-tl-danger`, `sk-tl-info` (default is a neutral dot).

### Avatar groups & presence

```html
<div class="sk-avatar-group">
  <span class="sk-avatar">AB</span>
  <span class="sk-avatar">CD</span>
  <span class="sk-avatar">+5</span>
</div>

<span class="sk-presence sk-online"><span class="sk-avatar">SK</span></span>
```

`sk-avatar-group` overlaps its avatars. `sk-presence` wraps one avatar and adds a status dot: `sk-online`, `sk-away`, `sk-busy`, `sk-offline`.

### Callouts

```html
<div class="sk-callout sk-callout-warning">
  <div class="sk-callout-title">Careful</div>
  Body text — quieter than an alert, good for docs and notes.
</div>
```

Edge colors: default (primary), `sk-callout-success`, `sk-callout-warning`, `sk-callout-danger`, `sk-callout-info`.

### File input

```html
<input class="sk-file" type="file">
```

### Range slider

```html
<input class="sk-range" type="range" min="0" max="100" value="40">
```

### Scrollspy (auto-highlighting nav)

Add `data-sk-scrollspy` to a sidebar or nav whose links point at `#section-ids` on the same page — the link for the section currently on screen gets `active` automatically as you scroll:

```html
<aside class="sk-sidebar" data-sk-scrollspy>
  <a href="#intro">Intro</a>
  <a href="#usage">Usage</a>
</aside>
```

### Back to top

```html
<button class="sk-btn sk-btn-outline sk-btn-sm" data-sk-scroll-top>&uarr; Top</button>
```

### Copy to clipboard

```html
<button class="sk-btn" data-sk-copy="npm install nothing">Copy command</button>

<div class="sk-input-group">
  <input class="sk-input" id="api-key" type="text" value="sk-123" readonly>
  <button class="sk-btn" data-sk-copy-target="api-key">Copy</button>
</div>
```

`data-sk-copy="text"` copies literal text; `data-sk-copy-target="element-id"` copies that element's value (inputs) or text content. A success toast confirms the copy.

### Small extras

```html
<span class="sk-avatar">SK</span>                     <!-- initials avatar; sk-avatar-sm / sk-avatar-lg -->
<span class="sk-avatar"><img src="/me.jpg" alt=""></span>
<span class="sk-spinner"></span>                       <!-- loading spinner -->
<div class="sk-progress"><div class="sk-progress-bar" style="width: 60%"></div></div>
<div class="sk-divider">or</div>                       <!-- line with centered text -->
<kbd>Ctrl</kbd> + <kbd>K</kbd>                         <!-- keyboard key styling -->
```

---

## 5. Layout and utilities

### Page container

```html
<div class="sk-container">  <!-- centered, max 1140px wide, side padding -->
  ...page content...
</div>
```

### Grid

Mobile-first: everything is one column on phones, then splits into columns on bigger screens.

```html
<div class="sk-grid sk-cols-3">
  <div class="sk-card">...</div>
  <div class="sk-card">...</div>
  <div class="sk-card">...</div>
</div>
```

- `sk-cols-2` — 2 columns from 640px up
- `sk-cols-3` — 2 columns from 640px, 3 from 1024px
- `sk-cols-4` — 2 columns from 640px, 4 from 1024px
- `sk-grid-auto` — fits as many 240px-minimum columns as there is room for
- `sk-span-all` on a child — spans the full row
- Gap sizes: add `gap-sm`, `gap-lg`, or `gap-0` to the grid

### Flexbox

```html
<div class="flex items-center justify-between gap-3">
  <span>Left side</span>
  <button class="sk-btn sk-btn-sm">Right side</button>
</div>
```

Available: `flex`, `inline-flex`, `flex-col`, `flex-wrap`, `items-start/center/end`, `justify-start/center/end/between`, `flex-1`, `grow`, `shrink-0`, `gap-1/2/3/4/6/8`, `ml-auto`, `mr-auto`.

### Spacing

Pattern: `{property}{side}-{size}`. Properties: `m` margin, `p` padding. Sides: none (all), `t` top, `b` bottom, `l` left, `r` right, `x` horizontal, `y` vertical. Sizes: `0, 1, 2, 3, 4, 6, 8` (and `12, 16` for `mt`/`mb`/`py`), where each step is 0.25rem — so `4` = 1rem = 16px.

Examples: `p-4` (padding 1rem), `mt-6` (margin-top 1.5rem), `mb-2`, `px-4`, `py-8`, `mx-auto` (center horizontally).

### Text

- Size: `text-xs` `text-sm` `text-base` `text-lg` `text-xl` `text-2xl` `text-3xl` `text-4xl`
- Weight: `font-normal` `font-medium` `font-semibold` `font-bold`; `font-mono`
- Align: `text-left` `text-center` `text-right`
- Color: `text-main` `text-secondary` `text-muted` `text-primary` `text-success` `text-warning` `text-danger` `text-info` `text-white`
- Other: `uppercase`, `truncate` (ellipsis), `leading-tight`, `leading-relaxed`

### Show/hide by screen size

- `hide-mobile` — hidden below 768px
- `hide-desktop` — hidden at 768px and up (e.g. the mobile sidebar button)
- `hidden` — always hidden

### Misc utilities

`w-full`, `h-full`, `min-h-screen`, `max-w-sm/md/lg/xl/2xl/3xl`, `border`, `border-t`, `border-b`, `rounded`, `rounded-lg`, `rounded-full`, `shadow`, `shadow-lg`, `bg-surface`, `bg-surface-2`, `overflow-hidden`, `relative`, `sticky-top`, `cursor-pointer`, `opacity-50`.

---

## 6. A complete EJS page skeleton

`views/layout-example.ejs`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= title %></title>
  <link rel="stylesheet" href="/skynet-ui.css">
</head>
<body>
  <nav class="sk-navbar">
    <a href="/" class="sk-navbar-brand"><span class="sk-navbar-logo">S</span> My Site</a>
    <button class="sk-navbar-burger" data-sk-burger aria-label="Menu">&#9776;</button>
    <ul class="sk-navbar-nav">
      <li><a href="/">Home</a></li>
      <li><a href="/about">About</a></li>
    </ul>
  </nav>

  <div class="sk-container py-8">
    <h1><%= title %></h1>

    <div class="sk-grid sk-cols-3 mt-6">
      <% items.forEach(function (item) { %>
        <div class="sk-card sk-card-hover">
          <div class="sk-card-body">
            <h3 class="sk-card-title"><%= item.name %></h3>
            <p class="text-muted text-sm"><%= item.description %></p>
          </div>
        </div>
      <% }) %>
    </div>
  </div>

  <script src="/skynet-ui.js" defer></script>
</body>
</html>
```

---

## 7. Tips

- Open `demo.html` in a browser and use your browser's inspector (right-click → Inspect) to see how anything on that page is built, then copy the pattern.
- Resize the browser window narrow to see the mobile behavior (burger menu, sliding sidebar, one-column grids).
- When something looks cramped, reach for spacing utilities first: `mt-4`, `mb-6`, `gap-3`.
- Paste `LLM.md` into a Claude conversation and ask it to build pages with Skynet UI — it contains everything Claude needs to generate correct markup.
