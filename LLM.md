# Skynet UI — LLM reference (v1.4.0)

Paste this file into an LLM conversation (or keep it in the repo as context) so the model can generate correct Skynet UI markup.

RULES FOR GENERATION:
- Pure CSS + vanilla JS framework. Include with: `<link rel="stylesheet" href="/skynet-ui.css">` and `<script src="/skynet-ui.js" defer></script>`. Always include `<meta name="viewport" content="width=device-width, initial-scale=1.0">`.
- Dark theme is the default; no class needed. Built-in alternatives via `data-theme` on `<html>`: `"light"`, `"midnight"` (OLED black + cyan), `"paper"` (warm cream + amber). Custom themes = another `[data-theme="x"]{…}` block overriding :root vars (include color-scheme and --sk-primary-text).
- Components are prefixed `sk-`. Utilities are short and unprefixed (`flex`, `p-4`, `mt-6`, `text-muted`).
- Interactive behavior is declarative via `data-sk-*` attributes; never write custom JS for modals/tabs/dropdowns/toasts/mobile nav.
- Mobile-first: `.sk-grid` is 1 column on phones; `sk-cols-*` add columns at ≥640px/≥1024px. Navbar collapses behind a `data-sk-burger` button; sidebar slides in via a `data-sk-sidebar` button.
- Spacing scale: number × 0.25rem (`4` = 1rem). Available steps: 0,1,2,3,4,6,8 (plus 12,16 for mt/mb/py).
- Do not invent class names not listed here.

## CSS variables (in :root — override to theme)
--sk-bg #0b0f17 page bg | --sk-surface #111826 cards/nav | --sk-surface-2 #172033 hover/inputs-on-cards | --sk-border #1e2836 subtle border | --sk-border-2 #2a3547 stronger border
--sk-text #e6eaf2 main | --sk-text-2 #aeb7c7 secondary | --sk-muted #8b95a7 | --sk-faint #5b6474 placeholder
--sk-primary #6366f1 | --sk-primary-hover #4f52e0 | --sk-primary-soft rgba(99,102,241,.15)
--sk-success #16a34a / --sk-success-text #4ade80 / --sk-success-soft | --sk-warning #d97706 / --sk-warning-text #fbbf24 / --sk-warning-soft | --sk-danger #dc2626 / --sk-danger-hover / --sk-danger-text #f87171 / --sk-danger-soft | --sk-info #0ea5e9 / --sk-info-text #38bdf8 / --sk-info-soft
--sk-radius 10px | --sk-radius-sm 7px | --sk-radius-lg 16px | --sk-shadow | --sk-shadow-lg | --sk-transition .18s ease
--sk-font | --sk-font-mono | --sk-container 1140px | --sk-navbar-height 60px | --sk-sidebar-width 250px

## JS API (global, from skynet-ui.js)
skToast(message, type?, durationMsOrOpts?) — type: "info"(default)|"success"|"warning"|"danger"; 3rd arg: duration ms (default 3500, 0 = sticky) OR {duration, actionText, onAction} for an action button ("Undo")
skOpenModal(id) / skCloseModal(id) — also open/close drawers and command palettes
skToggleTheme() — flips dark family ↔ light family; persisted in localStorage
skSetTheme(name) — switches to "dark"|"light"|"midnight"|"paper" (or a custom theme); persisted
skConfirm(message, opts?) → Promise<boolean> — builds a confirm modal; opts: {title, okText, cancelText, danger}
skPrompt(message, opts?) → Promise<string|null> — input dialog (null on cancel/Esc); opts: {title, okText, cancelText, placeholder, value}

## Data attributes (wire up behavior, no JS)
data-sk-open="id" — button opens that modal, drawer, OR command palette
data-sk-close — element inside a modal/drawer closes it (backdrop click + Esc also close)
data-sk-popover — trigger button inside .sk-popover toggles its .sk-popover-panel (outside click + Esc close)
data-sk-carousel-prev / data-sk-carousel-next — buttons inside .sk-carousel scroll the track one view
data-sk-tabs — on tab container; data-sk-tab="panel-id" — on each tab button (panel = element with that id)
data-sk-dropdown — on trigger button inside .sk-dropdown
data-sk-sidebar — button toggles .sk-sidebar on mobile
data-sk-burger — button toggles navbar links on mobile
data-sk-toast="Msg" + optional data-sk-toast-type="success|warning|danger" — button shows toast
data-sk-theme-toggle — button flips dark ↔ light theme family (persisted across page loads)
data-sk-theme="name" — button switches to that theme: dark|light|midnight|paper (persisted)
data-sk-validate — on a <form>: blocks invalid submits; bad fields get .sk-invalid + a styled .sk-error line from the browser's validationMessage (uses required/type/minlength etc.); errors clear on edit
data-sk-autogrow — on a <textarea>: height grows with content
data-sk-count — on an input/textarea with maxlength: live "37 / 200" counter appears under the field (warns near the limit)
data-sk-reveal — element fades in the first time it scrolls into view (safe without JS; skipped for reduced motion)
data-sk-autoplay="4000" — on .sk-carousel: auto-advance every N ms, wraps, pauses on hover/focus/touch, off under reduced motion
data-sk-copy="text" — button copies text to clipboard; or data-sk-copy-target="element-id" copies that element's value/text. Success toast shown automatically
data-sk-dismiss — button inside .sk-chip or .sk-alert removes it
data-sk-tip="text" — CSS-only tooltip on hover/focus (above by default; add class sk-tip-bottom to flip below; text must be short, no wrapping)
data-sk-segment — on a .sk-btn-group: clicking a button moves the .active highlight (segmented control)
data-sk-sort — on a <th>: click sorts tbody rows by that column, toggles asc/desc; numeric columns (incl. "99.9%", "$1,200") auto-detected
data-sk-filter="target-id" — on an <input>: typing hides non-matching rows (table) or direct children (list/grid) of the target
data-sk-scroll-top — button smooth-scrolls the window to the top
data-sk-scrollspy — on a nav/sidebar of href="#id" links: link for the section on screen gets .active automatically

## Components

### Button
Classes: sk-btn (base, required) + variant: sk-btn-primary | sk-btn-success | sk-btn-danger | sk-btn-outline | sk-btn-ghost. Sizes: sk-btn-sm | sk-btn-lg | sk-btn-block (full width) | sk-btn-icon (round). Loading state: add sk-btn-loading (spinner + blocks clicks). Works on <button> and <a>.
```html
<button class="sk-btn sk-btn-primary">Save</button>
```

### Button group / segmented control
div.sk-btn-group joins buttons. Add data-sk-segment for a segmented control (clicks move .active automatically).
```html
<div class="sk-btn-group" data-sk-segment><button class="sk-btn active">Day</button><button class="sk-btn">Week</button></div>
```

### Card
sk-card > optional sk-card-header (flex, title left / extras right), sk-card-body, sk-card-footer. Inside body: sk-card-title, sk-card-subtitle. Hover lift: add sk-card-hover to sk-card. Stat cards: sk-stat-label + sk-stat-value inside body.
```html
<div class="sk-card"><div class="sk-card-body">
  <h3 class="sk-card-title">Title</h3>
  <p class="sk-card-subtitle">Subtitle</p>
  <p class="text-secondary">Content</p>
</div></div>
```

### Badge
sk-badge + optional sk-badge-primary | sk-badge-success | sk-badge-warning | sk-badge-danger | sk-badge-info
```html
<span class="sk-badge sk-badge-success">Active</span>
```

### Alert
sk-alert + sk-alert-success | sk-alert-warning | sk-alert-danger | sk-alert-info
```html
<div class="sk-alert sk-alert-warning">Disk usage above 80%.</div>
```

### Form field
sk-field (wrapper, adds margin) > sk-label + sk-input|sk-select|sk-textarea + optional sk-help. Error: add sk-invalid to input, follow with div.sk-error.
```html
<div class="sk-field">
  <label class="sk-label" for="email">Email</label>
  <input class="sk-input" id="email" type="email" placeholder="name@site.com">
  <div class="sk-help">Hint text.</div>
</div>
```
Input+button joined: div.sk-input-group > input.sk-input + button.sk-btn

### Checkbox / radio
label.sk-check wrapping a bare input
```html
<label class="sk-check"><input type="checkbox" checked> Remember me</label>
<label class="sk-check"><input type="radio" name="plan"> Pro</label>
```

### Toggle switch
label.sk-toggle > input[type=checkbox] + empty span (required) + label text
```html
<label class="sk-toggle"><input type="checkbox" checked><span></span> Dark mode</label>
```

### Navbar (sticky top; collapses on mobile)
```html
<nav class="sk-navbar">
  <a href="/" class="sk-navbar-brand"><span class="sk-navbar-logo">S</span> Site</a>
  <button class="sk-navbar-burger" data-sk-burger aria-label="Menu">&#9776;</button>
  <ul class="sk-navbar-nav">
    <li><a href="/" class="active">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
  <div class="sk-navbar-end"><a href="/login" class="sk-btn sk-btn-primary sk-btn-sm">Log in</a></div>
</nav>
```
active class marks current page. sk-navbar-end right-aligns its contents.

### Sidebar layout (desktop fixed 250px; mobile slide-in)
```html
<div class="sk-layout">
  <aside class="sk-sidebar">
    <div class="sk-sidebar-title">Section</div>
    <a href="/dashboard" class="active">Dashboard</a>
    <a href="/settings">Settings</a>
  </aside>
  <main class="sk-main">
    <button class="sk-btn sk-btn-outline sk-btn-sm hide-desktop" data-sk-sidebar>&#9776; Menu</button>
    ...page content...
  </main>
</div>
```

### Table (always wrap for mobile scroll)
sk-table-wrap > table.sk-table. Modifiers on table: sk-table-hover, sk-table-striped.
```html
<div class="sk-table-wrap">
  <table class="sk-table sk-table-hover">
    <thead><tr><th>Name</th><th>Status</th></tr></thead>
    <tbody><tr><td>Job</td><td><span class="sk-badge sk-badge-success">OK</span></td></tr></tbody>
  </table>
</div>
```

### Tabs
Container div.sk-tabs[data-sk-tabs] holds button.sk-tab[data-sk-tab="panel-id"]. Panels are div.sk-tab-panel with matching id. Mark starting tab AND its panel with class active. Pill style: add sk-tabs-pills to container.
```html
<div class="sk-tabs" data-sk-tabs>
  <button class="sk-tab active" data-sk-tab="p1">First</button>
  <button class="sk-tab" data-sk-tab="p2">Second</button>
</div>
<div class="sk-tab-panel active" id="p1">One</div>
<div class="sk-tab-panel" id="p2">Two</div>
```

### Modal (place at end of body)
div.sk-modal#id > div.sk-modal-box (sizes: sk-modal-sm | sk-modal-lg) > sk-modal-header (+ button.sk-modal-x[data-sk-close]), sk-modal-body, sk-modal-footer.
```html
<button class="sk-btn sk-btn-primary" data-sk-open="m1">Open</button>
<div class="sk-modal" id="m1" role="dialog" aria-modal="true">
  <div class="sk-modal-box">
    <div class="sk-modal-header">Title <button class="sk-modal-x" data-sk-close aria-label="Close">&times;</button></div>
    <div class="sk-modal-body"><p>Content</p></div>
    <div class="sk-modal-footer">
      <button class="sk-btn sk-btn-ghost" data-sk-close>Cancel</button>
      <button class="sk-btn sk-btn-primary" data-sk-close>Save</button>
    </div>
  </div>
</div>
```

### Toast
No markup needed. JS: skToast("Saved", "success") or declarative:
```html
<button class="sk-btn" data-sk-toast="Saved!" data-sk-toast-type="success">Save</button>
```

### Dropdown
div.sk-dropdown > trigger[data-sk-dropdown] + div.sk-dropdown-menu (add sk-right to right-align) containing <a>/<button> items and hr.sk-dropdown-divider.
```html
<div class="sk-dropdown">
  <button class="sk-btn" data-sk-dropdown>Menu &#9662;</button>
  <div class="sk-dropdown-menu sk-right">
    <a href="/profile">Profile</a>
    <hr class="sk-dropdown-divider">
    <button>Sign out</button>
  </div>
</div>
```

### Drawer (slide-in panel; same wiring as modal, place at end of body)
div.sk-drawer#id (add sk-drawer-left for left side) > div.sk-drawer-box > sk-drawer-header (+ button.sk-modal-x[data-sk-close]), sk-drawer-body, sk-drawer-footer.
```html
<button class="sk-btn" data-sk-open="d1">Open</button>
<div class="sk-drawer" id="d1" role="dialog" aria-modal="true"><div class="sk-drawer-box">
  <div class="sk-drawer-header">Title <button class="sk-modal-x" data-sk-close aria-label="Close">&times;</button></div>
  <div class="sk-drawer-body">Content</div>
  <div class="sk-drawer-footer"><button class="sk-btn sk-btn-primary" data-sk-close>Done</button></div>
</div></div>
```

### Stepper (wizard progress)
div.sk-steps > div.sk-step (state: done | active | none) > div.sk-step-dot (number or &check;) + div.sk-step-label.
```html
<div class="sk-steps"><div class="sk-step done"><div class="sk-step-dot">&check;</div><div class="sk-step-label">Cart</div></div><div class="sk-step active"><div class="sk-step-dot">2</div><div class="sk-step-label">Pay</div></div></div>
```

### Timeline
div.sk-timeline > div.sk-timeline-item (dot color modifier: sk-tl-primary|success|warning|danger|info) > optional sk-timeline-time, sk-timeline-title, any content.
```html
<div class="sk-timeline"><div class="sk-timeline-item sk-tl-success"><div class="sk-timeline-time">2h ago</div><div class="sk-timeline-title">Deployed</div></div></div>
```

### Avatar group / presence dot
div.sk-avatar-group overlaps child avatars (last one can be "+N"). span.sk-presence.sk-online|sk-away|sk-busy|sk-offline wraps ONE avatar, adds status dot.
```html
<div class="sk-avatar-group"><span class="sk-avatar">AB</span><span class="sk-avatar">+5</span></div>
<span class="sk-presence sk-online"><span class="sk-avatar">SK</span></span>
```

### Callout (docs-style note; quieter than alert)
div.sk-callout (+ sk-callout-success|warning|danger|info; default edge = primary) > optional div.sk-callout-title + body.
```html
<div class="sk-callout sk-callout-warning"><div class="sk-callout-title">Careful</div>Body text.</div>
```

### File input
```html
<input class="sk-file" type="file">
```

### Sortable/filterable table (add-ons to Table above)
th[data-sk-sort] → click-sortable column. input[data-sk-filter="table-or-list-id"] → live row filter.
```html
<input class="sk-input mb-3" type="search" data-sk-filter="t1" placeholder="Filter…">
<div class="sk-table-wrap"><table class="sk-table" id="t1"><thead><tr><th data-sk-sort>Name</th></tr></thead><tbody>…</tbody></table></div>
```

### Popover (click-toggled rich panel)
div.sk-popover > trigger[data-sk-popover] + div.sk-popover-panel (optional div.sk-popover-title first; panel modifiers: sk-top opens above, sk-right right-aligns).
```html
<div class="sk-popover"><button class="sk-btn" data-sk-popover>Details &#9662;</button><div class="sk-popover-panel"><div class="sk-popover-title">Title</div>Content, even buttons.</div></div>
```

### Command palette (Ctrl/Cmd+K; place at end of body; ONE per page)
div.sk-cmdk#id > div.sk-cmdk-box > input.sk-cmdk-input + div.sk-cmdk-list (children = <a>/<button> commands; optional data-sk-keywords="extra words") + optional div.sk-cmdk-empty + optional div.sk-cmdk-hint. Opens via Ctrl/Cmd+K or [data-sk-open="id"]. Typing filters; ↑↓ move; Enter runs; Esc/backdrop close. Choosing an item closes the palette and runs its link/onclick/data-sk-*.
```html
<div class="sk-cmdk" id="cmdk" role="dialog" aria-modal="true" aria-label="Command palette"><div class="sk-cmdk-box">
  <input class="sk-cmdk-input" type="text" placeholder="Type a command…" aria-label="Search commands">
  <div class="sk-cmdk-list"><a href="/dashboard">Dashboard</a><button data-sk-theme-toggle>Toggle theme</button></div>
  <div class="sk-cmdk-empty">No matches.</div>
</div></div>
```

### Carousel (CSS scroll-snap; arrows optional)
div.sk-carousel (modifiers: sk-carousel-peek shows next slide's edge; sk-carousel-cols-2|-cols-3 show 2/3 per view ≥768px) > div.sk-carousel-track > div.sk-carousel-slide each. Arrow buttons anywhere inside the carousel: [data-sk-carousel-prev] / [data-sk-carousel-next].
```html
<div class="sk-carousel sk-carousel-peek"><div class="sk-carousel-track"><div class="sk-carousel-slide">…</div><div class="sk-carousel-slide">…</div></div>
<div class="flex gap-2 mt-3"><button class="sk-btn sk-btn-outline sk-btn-icon" data-sk-carousel-prev aria-label="Previous">&larr;</button><button class="sk-btn sk-btn-outline sk-btn-icon" data-sk-carousel-next aria-label="Next">&rarr;</button></div></div>
```

### Date/time inputs
Just use sk-input — color-scheme makes native pickers match the theme.
```html
<input class="sk-input" type="date"> <input class="sk-input" type="time">
```

### Breadcrumbs
nav.sk-breadcrumbs > <a> per ancestor + <span> for the current page. Separators added by CSS.
```html
<nav class="sk-breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><a href="/projects">Projects</a><span>Current</span></nav>
```

### Pagination
nav.sk-pagination > <a>/<button>/<span> children. Current page: class active. Disabled arrow: [disabled] (button) or class sk-disabled (link).
```html
<nav class="sk-pagination" aria-label="Pagination"><a href="?p=1">&laquo;</a><a href="?p=1">1</a><span class="active">2</span><a href="?p=3">3</a><a href="?p=3">&raquo;</a></nav>
```

### Accordion (native <details>, zero JS)
details.sk-accordion > summary + div.sk-accordion-body. Add open attr to start expanded. Same name attr on several = exclusive open.
```html
<details class="sk-accordion" open><summary>Title</summary><div class="sk-accordion-body">Content</div></details>
```

### Chip (tag)
span.sk-chip + optional variant sk-chip-primary|success|warning|danger|info. Removable: append button.sk-chip-x[data-sk-dismiss].
```html
<span class="sk-chip sk-chip-primary">frontend <button class="sk-chip-x" data-sk-dismiss aria-label="Remove">&times;</button></span>
```

### List group
div.sk-list > <a>/<button>/<div> rows (flex; ml-auto pushes badges right). Current row: class active.
```html
<div class="sk-list"><a href="/inbox" class="active">Inbox <span class="sk-badge ml-auto">12</span></a><a href="/sent">Sent</a></div>
```

### Empty state
div.sk-empty > optional sk-empty-icon (emoji/char), sk-empty-title, <p>, action button.
```html
<div class="sk-empty"><div class="sk-empty-icon">&#128230;</div><div class="sk-empty-title">No projects yet</div><p>Create one to get started.</p><button class="sk-btn sk-btn-primary sk-btn-sm">New project</button></div>
```

### Skeleton loader
sk-skeleton (block; size with inline width/height) | sk-skeleton-text modifier (thin line, stacks with spacing) | sk-skeleton-circle modifier (avatar-sized).
```html
<div class="sk-skeleton sk-skeleton-text" style="width: 60%"></div>
```

### Hero (landing-page opener)
section.sk-hero > sk-hero-title (h1), sk-hero-subtitle (p), sk-hero-actions (button row).
```html
<section class="sk-hero"><h1 class="sk-hero-title">Ship faster</h1><p class="sk-hero-subtitle">Pitch.</p><div class="sk-hero-actions"><a class="sk-btn sk-btn-primary sk-btn-lg" href="/signup">Start</a></div></section>
```

### Footer
footer.sk-footer > sk-container > sk-footer-grid (columns of sk-footer-title + links) + sk-footer-bottom (copyright bar).
```html
<footer class="sk-footer"><div class="sk-container"><div class="sk-footer-grid"><div><div class="sk-footer-title">Product</div><a href="/pricing">Pricing</a></div></div><div class="sk-footer-bottom"><span>&copy; 2026</span></div></div></footer>
```

### Range slider
```html
<input class="sk-range" type="range" min="0" max="100" value="40">
```

### Tooltip / theme toggle / copy (attribute-only, no component markup)
```html
<button class="sk-btn" data-sk-tip="Tooltip text">Hover</button>
<button class="sk-btn sk-btn-ghost sk-btn-icon" data-sk-theme-toggle aria-label="Toggle theme">&#9681;</button>
<button class="sk-btn" data-sk-copy="text to copy">Copy</button>
```

### Misc
sk-avatar (initials or img inside; sizes sk-avatar-sm/sk-avatar-lg) | sk-spinner | sk-progress > sk-progress-bar (set inline width %) | sk-divider (line with centered text) | kbd (styled automatically)
```html
<span class="sk-avatar">SK</span>
<div class="sk-progress"><div class="sk-progress-bar" style="width:60%"></div></div>
<div class="sk-divider">or</div>
```

## Layout classes
sk-container — centered max-width 1140px with side padding | sk-container-fluid — full width
sk-grid — grid, 1 col mobile, gap 1rem. Modifiers: sk-cols-2 (2 cols ≥640px) | sk-cols-3 (2 ≥640px, 3 ≥1024px) | sk-cols-4 (2 ≥640px, 4 ≥1024px) | gap-0 gap-sm gap-lg
sk-grid-auto — auto-fit columns min 240px | sk-span-all — child spans full row

## Utility classes (complete list)
Display: block inline-block hidden grid flex inline-flex
Flex: flex-col flex-row flex-wrap items-start items-center items-end justify-start justify-center justify-end justify-between flex-1 grow shrink-0 gap-1 gap-2 gap-3 gap-4 gap-6 gap-8
Responsive visibility: hide-mobile (<768px) hide-desktop (≥768px)
Position: relative absolute sticky-top
Margin: m-0..8, mt-0..16, mb-0..16, ml-1..4, mr-1..4, ml-auto mr-auto mx-auto mx-2 mx-4 my-2 my-4 my-8 (steps: 0 1 2 3 4 6 8; mt/mb also 12 16)
Padding: p-0..8, pt-0..12, pb-0..16, pl-1..4, pr-1..4, px-2 px-3 px-4 px-6, py-2 py-3 py-4 py-6 py-8 py-12
Size: w-full w-auto h-full min-h-screen max-w-sm max-w-md max-w-lg max-w-xl max-w-2xl max-w-3xl
Text size: text-xs text-sm text-base text-lg text-xl text-2xl text-3xl text-4xl
Font: font-normal font-medium font-semibold font-bold font-mono
Align: text-left text-center text-right
Transform: uppercase capitalize truncate leading-tight leading-relaxed no-underline
Text color: text-main text-secondary text-muted text-primary text-success text-warning text-danger text-info text-white
Background: bg-page bg-surface bg-surface-2 bg-primary bg-success bg-warning bg-danger
Border/shape: border border-2 border-t border-b rounded rounded-sm rounded-lg rounded-full shadow shadow-lg
Other: overflow-hidden overflow-auto cursor-pointer opacity-50 opacity-75

## Page skeleton
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page</title>
  <link rel="stylesheet" href="/skynet-ui.css">
</head>
<body>
  <nav class="sk-navbar">...</nav>
  <div class="sk-container py-8">...</div>
  <script src="/skynet-ui.js" defer></script>
</body>
</html>
```
