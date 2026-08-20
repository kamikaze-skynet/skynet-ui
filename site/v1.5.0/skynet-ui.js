/* ==========================================================================
   Skynet UI v1.5.0 — behavior script
   Drop into any page AFTER your content or with defer:
     <script src="/skynet-ui.js" defer></script>

   Everything works through data attributes — no JS knowledge needed:
     data-sk-open="id"         → opens that modal, drawer, or command palette
     data-sk-close             → closes the modal/drawer it's inside
     data-sk-popover           → toggles the .sk-popover-panel next to it
     data-sk-carousel-prev / data-sk-carousel-next
                               → scroll the carousel track one view
     data-sk-tab="panel-id"    → tab button showing that panel
     data-sk-dropdown          → toggles the dropdown menu next to it
     data-sk-sidebar           → toggles the sidebar on mobile
     data-sk-burger            → toggles the navbar menu on mobile
     data-sk-toast="Message"   → shows a toast (data-sk-toast-type="success")
     data-sk-theme-toggle      → flips dark ↔ light theme family (remembered)
     data-sk-theme="name"      → switches to that theme: dark, light,
                                 midnight, paper, forest, dusk, sky,
                                 rose (remembered)
     data-sk-validate          → on a <form>: blocks invalid submits and
                                 shows styled inline errors
     data-sk-autogrow          → on a <textarea>: grows with its content
     data-sk-count             → on a field with maxlength: live "37 / 200"
     data-sk-reveal            → element fades in when scrolled into view
     data-sk-autoplay="4000"   → on a .sk-carousel: auto-advance every N ms
     data-sk-copy="text"       → copies text to the clipboard (or use
                                 data-sk-copy-target="element-id")
     data-sk-dismiss           → removes the .sk-chip or .sk-alert it's inside
     data-sk-segment           → on a .sk-btn-group: clicks move the .active
     data-sk-sort              → on a <th>: click sorts the table by that column
     data-sk-filter="id"       → on an <input>: typing filters that table/list
     data-sk-scroll-top        → button smooth-scrolls back to the top
     data-sk-scrollspy         → on a sidebar/nav of #links: highlights the
                                 link whose section is currently on screen

   Keyboard: Ctrl+K (Cmd+K on Mac) opens the page's .sk-cmdk command
   palette; type to filter its items, ↑/↓ to move, Enter to run, Esc closes.

   Global functions:
     skToast("Saved!", "success")   types: "info" (default), "success",
                                           "warning", "danger"
       3rd arg: duration ms (0 = sticky) OR options object
       {duration, actionText, onAction} for an action button ("Undo")
     skOpenModal(id) / skCloseModal(id)   (drawers + command palettes too)
     skSetTheme("midnight")         switches theme and remembers the choice
     skToggleTheme()                flips dark ↔ light family, remembered
     skConfirm("Delete this?", {title, okText, cancelText, danger})
                                    → Promise<boolean> confirm dialog
     skPrompt("Rename to?", {title, okText, cancelText, placeholder, value})
                                    → Promise<string|null> input dialog
   ========================================================================== */
(function () {
  "use strict";

  /* ----------------------------------------------------------------------
     THEMES — built-ins: dark (default), midnight, forest, dusk (dark
     family) and light, paper, sky, rose (light family).
     The saved choice is restored on load. data-sk-theme="name" buttons set
     a specific theme; data-sk-theme-toggle flips dark family ↔ light family.
     ---------------------------------------------------------------------- */
  var THEME_KEY = "sk-theme";
  var LIGHT_THEMES = ["light", "paper", "sky", "rose"];

  try {
    var savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) document.documentElement.setAttribute("data-theme", savedTheme);
  } catch (err) { /* localStorage unavailable (e.g. file:// in some browsers) */ }

  function skSetTheme(name) {
    document.documentElement.setAttribute("data-theme", name);
    try { localStorage.setItem(THEME_KEY, name); } catch (err) { /* ignore */ }
  }

  function skToggleTheme() {
    var current = document.documentElement.getAttribute("data-theme") || "dark";
    skSetTheme(LIGHT_THEMES.indexOf(current) > -1 ? "dark" : "light");
  }

  window.skSetTheme = skSetTheme;
  window.skToggleTheme = skToggleTheme;

  /* ----------------------------------------------------------------------
     COPY TO CLIPBOARD
     ---------------------------------------------------------------------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(
        function () { skToast("Copied to clipboard", "success"); },
        function () { skToast("Couldn't copy", "danger"); }
      );
      return;
    }
    /* Fallback for http:// pages and older browsers */
    var area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand("copy");
      skToast("Copied to clipboard", "success");
    } catch (err) {
      skToast("Couldn't copy", "danger");
    }
    document.body.removeChild(area);
  }

  /* ----------------------------------------------------------------------
     TOASTS
     ---------------------------------------------------------------------- */
  var toastContainer = null;

  function getToastContainer() {
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.className = "sk-toast-container";
      document.body.appendChild(toastContainer);
    }
    return toastContainer;
  }

  function skToast(message, type, durationOrOpts) {
    type = type || "info";
    var opts = {};
    if (typeof durationOrOpts === "number") opts.duration = durationOrOpts;
    else if (durationOrOpts && typeof durationOrOpts === "object") opts = durationOrOpts;
    var duration = typeof opts.duration === "number" ? opts.duration : 3500;

    var toast = document.createElement("div");
    toast.className = "sk-toast" + (type !== "info" ? " sk-toast-" + type : "");
    toast.setAttribute("role", "status");

    var text = document.createElement("span");
    text.textContent = message;
    toast.appendChild(text);

    if (opts.actionText) {
      var actionBtn = document.createElement("button");
      actionBtn.className = "sk-toast-action";
      actionBtn.textContent = opts.actionText;
      actionBtn.addEventListener("click", function () {
        if (typeof opts.onAction === "function") opts.onAction();
        removeToast(toast);
      });
      toast.appendChild(actionBtn);
    }

    var closeBtn = document.createElement("button");
    closeBtn.className = "sk-toast-x";
    closeBtn.setAttribute("aria-label", "Dismiss");
    closeBtn.innerHTML = "&times;";
    closeBtn.addEventListener("click", function () { removeToast(toast); });
    toast.appendChild(closeBtn);

    getToastContainer().appendChild(toast);

    if (duration > 0) {
      setTimeout(function () { removeToast(toast); }, duration);
    }
    return toast;
  }

  function removeToast(toast) {
    if (!toast.parentNode) return;
    toast.classList.add("sk-toast-leaving");
    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 250);
  }

  window.skToast = skToast;

  /* ----------------------------------------------------------------------
     MODALS + DRAWERS + COMMAND PALETTES (same open/close mechanics)
     ---------------------------------------------------------------------- */
  var OPEN_OVERLAYS = ".sk-modal.sk-open, .sk-drawer.sk-open, .sk-cmdk.sk-open";

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add("sk-open");
    document.body.classList.add("sk-modal-open");
    if (modal.classList.contains("sk-cmdk")) resetCmdk(modal);
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove("sk-open");
    if (!document.querySelector(OPEN_OVERLAYS)) {
      document.body.classList.remove("sk-modal-open");
    }
  }

  window.skOpenModal = function (id) { openModal(document.getElementById(id)); };
  window.skCloseModal = function (id) { closeModal(document.getElementById(id)); };

  /* ----------------------------------------------------------------------
     CONFIRM DIALOG — skConfirm("Delete this?").then(ok => …)
     Options: {title, okText, cancelText, danger}
     ---------------------------------------------------------------------- */
  function skConfirm(message, opts) {
    opts = opts || {};
    return new Promise(function (resolve) {
      var modal = document.createElement("div");
      modal.className = "sk-modal sk-open";
      modal.setAttribute("role", "dialog");
      modal.setAttribute("aria-modal", "true");

      var box = document.createElement("div");
      box.className = "sk-modal-box sk-modal-sm";

      var header = document.createElement("div");
      header.className = "sk-modal-header";
      header.textContent = opts.title || "Are you sure?";

      var body = document.createElement("div");
      body.className = "sk-modal-body";
      var p = document.createElement("p");
      p.className = "text-secondary mb-0";
      p.textContent = message;
      body.appendChild(p);

      var footer = document.createElement("div");
      footer.className = "sk-modal-footer";
      var cancelBtn = document.createElement("button");
      cancelBtn.className = "sk-btn sk-btn-ghost";
      cancelBtn.textContent = opts.cancelText || "Cancel";
      var okBtn = document.createElement("button");
      okBtn.className = "sk-btn " + (opts.danger ? "sk-btn-danger" : "sk-btn-primary");
      okBtn.textContent = opts.okText || "OK";
      footer.appendChild(cancelBtn);
      footer.appendChild(okBtn);

      box.appendChild(header);
      box.appendChild(body);
      box.appendChild(footer);
      modal.appendChild(box);
      document.body.appendChild(modal);
      document.body.classList.add("sk-modal-open");
      okBtn.focus();

      function done(result) {
        document.removeEventListener("keydown", onKey);
        if (modal.parentNode) modal.parentNode.removeChild(modal);
        if (!document.querySelector(OPEN_OVERLAYS)) {
          document.body.classList.remove("sk-modal-open");
        }
        resolve(result);
      }
      function onKey(e) { if (e.key === "Escape") done(false); }

      cancelBtn.addEventListener("click", function () { done(false); });
      okBtn.addEventListener("click", function () { done(true); });
      modal.addEventListener("click", function (e) { if (e.target === modal) done(false); });
      document.addEventListener("keydown", onKey);
    });
  }

  window.skConfirm = skConfirm;

  /* ----------------------------------------------------------------------
     PROMPT DIALOG — skPrompt("Rename to?", {value: "old"}).then(v => …)
     Resolves the typed string on OK/Enter, or null on Cancel/Esc/backdrop.
     Options: {title, okText, cancelText, placeholder, value}
     ---------------------------------------------------------------------- */
  function skPrompt(message, opts) {
    opts = opts || {};
    return new Promise(function (resolve) {
      var modal = document.createElement("div");
      modal.className = "sk-modal sk-open";
      modal.setAttribute("role", "dialog");
      modal.setAttribute("aria-modal", "true");

      var box = document.createElement("div");
      box.className = "sk-modal-box sk-modal-sm";

      var header = document.createElement("div");
      header.className = "sk-modal-header";
      header.textContent = opts.title || "Input needed";

      var body = document.createElement("div");
      body.className = "sk-modal-body";
      var label = document.createElement("label");
      label.className = "sk-label";
      label.textContent = message;
      var input = document.createElement("input");
      input.className = "sk-input";
      input.type = "text";
      if (opts.placeholder) input.placeholder = opts.placeholder;
      if (opts.value) input.value = opts.value;
      body.appendChild(label);
      body.appendChild(input);

      var footer = document.createElement("div");
      footer.className = "sk-modal-footer";
      var cancelBtn = document.createElement("button");
      cancelBtn.className = "sk-btn sk-btn-ghost";
      cancelBtn.textContent = opts.cancelText || "Cancel";
      var okBtn = document.createElement("button");
      okBtn.className = "sk-btn sk-btn-primary";
      okBtn.textContent = opts.okText || "OK";
      footer.appendChild(cancelBtn);
      footer.appendChild(okBtn);

      box.appendChild(header);
      box.appendChild(body);
      box.appendChild(footer);
      modal.appendChild(box);
      document.body.appendChild(modal);
      document.body.classList.add("sk-modal-open");
      input.focus();
      if (opts.value) input.select();

      function done(result) {
        document.removeEventListener("keydown", onKey);
        if (modal.parentNode) modal.parentNode.removeChild(modal);
        if (!document.querySelector(OPEN_OVERLAYS)) {
          document.body.classList.remove("sk-modal-open");
        }
        resolve(result);
      }
      function onKey(e) {
        if (e.key === "Escape") done(null);
        else if (e.key === "Enter" && document.activeElement === input) done(input.value);
      }

      cancelBtn.addEventListener("click", function () { done(null); });
      okBtn.addEventListener("click", function () { done(input.value); });
      modal.addEventListener("click", function (e) { if (e.target === modal) done(null); });
      document.addEventListener("keydown", onKey);
    });
  }

  window.skPrompt = skPrompt;

  /* ----------------------------------------------------------------------
     SIDEBAR (mobile slide-in) — creates its own backdrop
     ---------------------------------------------------------------------- */
  var backdrop = null;

  function getBackdrop() {
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.className = "sk-backdrop";
      backdrop.addEventListener("click", closeSidebar);
      document.body.appendChild(backdrop);
    }
    return backdrop;
  }

  function toggleSidebar() {
    var sidebar = document.querySelector(".sk-sidebar");
    if (!sidebar) return;
    if (sidebar.classList.contains("sk-open")) closeSidebar();
    else {
      sidebar.classList.add("sk-open");
      getBackdrop().classList.add("sk-show");
    }
  }

  function closeSidebar() {
    var sidebar = document.querySelector(".sk-sidebar");
    if (sidebar) sidebar.classList.remove("sk-open");
    if (backdrop) backdrop.classList.remove("sk-show");
  }

  /* ----------------------------------------------------------------------
     TABS
     ---------------------------------------------------------------------- */
  function activateTab(button) {
    var group = button.closest("[data-sk-tabs]");
    if (!group) return;
    var panelId = button.getAttribute("data-sk-tab");
    var panel = document.getElementById(panelId);

    group.querySelectorAll(".sk-tab").forEach(function (t) {
      t.classList.remove("active");
    });
    button.classList.add("active");

    /* Hide sibling panels: every panel whose id is referenced by this group */
    group.querySelectorAll("[data-sk-tab]").forEach(function (t) {
      var p = document.getElementById(t.getAttribute("data-sk-tab"));
      if (p) p.classList.remove("active");
    });
    if (panel) panel.classList.add("active");
  }

  /* ----------------------------------------------------------------------
     DROPDOWNS + POPOVERS
     ---------------------------------------------------------------------- */
  function closeAllDropdowns(except) {
    document.querySelectorAll(".sk-dropdown.sk-open").forEach(function (d) {
      if (d !== except) d.classList.remove("sk-open");
    });
  }

  function closeAllPopovers(except) {
    document.querySelectorAll(".sk-popover.sk-open").forEach(function (p) {
      if (p !== except) p.classList.remove("sk-open");
    });
  }

  /* ----------------------------------------------------------------------
     COMMAND PALETTE — filtering + keyboard navigation
     ---------------------------------------------------------------------- */
  function cmdkItems(cmdk) {
    var list = cmdk.querySelector(".sk-cmdk-list");
    return list ? Array.prototype.slice.call(list.children) : [];
  }

  function cmdkVisibleItems(cmdk) {
    return cmdkItems(cmdk).filter(function (item) {
      return item.style.display !== "none";
    });
  }

  function cmdkSetActive(cmdk, item) {
    cmdkItems(cmdk).forEach(function (i) { i.classList.remove("active"); });
    if (item) {
      item.classList.add("active");
      if (item.scrollIntoView) item.scrollIntoView({ block: "nearest" });
    }
  }

  function filterCmdk(cmdk, query) {
    cmdkItems(cmdk).forEach(function (item) {
      var haystack = (item.textContent + " " + (item.getAttribute("data-sk-keywords") || "")).toLowerCase();
      item.style.display = haystack.indexOf(query) > -1 ? "" : "none";
    });
    var visible = cmdkVisibleItems(cmdk);
    cmdk.classList.toggle("sk-no-results", visible.length === 0);
    cmdkSetActive(cmdk, visible[0] || null);
  }

  function resetCmdk(cmdk) {
    var input = cmdk.querySelector(".sk-cmdk-input");
    if (input) {
      input.value = "";
      filterCmdk(cmdk, "");
      setTimeout(function () { input.focus(); }, 0);
    }
  }

  /* ----------------------------------------------------------------------
     ONE GLOBAL CLICK HANDLER — wires everything up via data attributes
     ---------------------------------------------------------------------- */
  document.addEventListener("click", function (e) {
    var t;

    /* Open modal/drawer/palette (a trigger inside the palette closes it first) */
    t = e.target.closest("[data-sk-open]");
    if (t) {
      e.preventDefault();
      closeModal(t.closest(".sk-cmdk.sk-open"));
      openModal(document.getElementById(t.getAttribute("data-sk-open")));
      return;
    }

    /* Close modal/drawer (button inside one) */
    t = e.target.closest("[data-sk-close]");
    if (t) {
      e.preventDefault();
      closeModal(t.closest(".sk-modal, .sk-drawer"));
      return;
    }

    /* Click on the dark area outside the modal/drawer/palette box closes it */
    if (e.target.classList &&
        (e.target.classList.contains("sk-modal") ||
         e.target.classList.contains("sk-drawer") ||
         e.target.classList.contains("sk-cmdk"))) {
      closeModal(e.target);
      return;
    }

    /* Choosing a command palette item closes the palette; the item's own
       link/onclick/data-sk-* behavior still runs below */
    t = e.target.closest(".sk-cmdk-list > *");
    if (t) closeModal(t.closest(".sk-cmdk"));

    /* Popover toggle */
    t = e.target.closest("[data-sk-popover]");
    if (t) {
      e.preventDefault();
      var pop = t.closest(".sk-popover");
      if (pop) {
        var popWillOpen = !pop.classList.contains("sk-open");
        closeAllPopovers();
        if (popWillOpen) pop.classList.add("sk-open");
      }
      return;
    }

    /* Carousel arrows */
    t = e.target.closest("[data-sk-carousel-prev], [data-sk-carousel-next]");
    if (t) {
      e.preventDefault();
      var carousel = t.closest(".sk-carousel");
      var track = carousel && carousel.querySelector(".sk-carousel-track");
      if (track) {
        var dir = t.hasAttribute("data-sk-carousel-next") ? 1 : -1;
        track.scrollBy({ left: dir * track.clientWidth, behavior: "smooth" });
      }
      return;
    }

    /* Tabs */
    t = e.target.closest("[data-sk-tab]");
    if (t) {
      e.preventDefault();
      activateTab(t);
      return;
    }

    /* Dropdown toggle */
    t = e.target.closest("[data-sk-dropdown]");
    if (t) {
      e.preventDefault();
      var dd = t.closest(".sk-dropdown");
      if (dd) {
        var willOpen = !dd.classList.contains("sk-open");
        closeAllDropdowns();
        if (willOpen) dd.classList.add("sk-open");
      }
      return;
    }

    /* Sidebar toggle (mobile) */
    t = e.target.closest("[data-sk-sidebar]");
    if (t) {
      e.preventDefault();
      toggleSidebar();
      return;
    }

    /* Navbar burger (mobile menu) */
    t = e.target.closest("[data-sk-burger]");
    if (t) {
      e.preventDefault();
      var nav = t.closest(".sk-navbar");
      if (nav) nav.classList.toggle("sk-open");
      return;
    }

    /* Declarative toast: <button data-sk-toast="Saved!" data-sk-toast-type="success"> */
    t = e.target.closest("[data-sk-toast]");
    if (t) {
      e.preventDefault();
      skToast(t.getAttribute("data-sk-toast"), t.getAttribute("data-sk-toast-type") || "info");
      return;
    }

    /* Theme toggle */
    t = e.target.closest("[data-sk-theme-toggle]");
    if (t) {
      e.preventDefault();
      skToggleTheme();
      return;
    }

    /* Theme picker: <button data-sk-theme="midnight">Midnight</button> */
    t = e.target.closest("[data-sk-theme]");
    if (t) {
      e.preventDefault();
      skSetTheme(t.getAttribute("data-sk-theme"));
      return;
    }

    /* Copy to clipboard: data-sk-copy="text" or data-sk-copy-target="element-id" */
    t = e.target.closest("[data-sk-copy], [data-sk-copy-target]");
    if (t) {
      e.preventDefault();
      var copySource = t.getAttribute("data-sk-copy");
      if (!copySource) {
        var copyEl = document.getElementById(t.getAttribute("data-sk-copy-target"));
        if (copyEl) {
          copySource = copyEl.value !== undefined && copyEl.value !== ""
            ? copyEl.value
            : copyEl.textContent.trim();
        }
      }
      if (copySource) copyText(copySource);
      return;
    }

    /* Dismiss: removes the chip or alert the button sits inside */
    t = e.target.closest("[data-sk-dismiss]");
    if (t) {
      e.preventDefault();
      var box = t.closest(".sk-chip, .sk-alert");
      if (box && box.parentNode) box.parentNode.removeChild(box);
      return;
    }

    /* Segmented control: move .active inside a data-sk-segment button group */
    t = e.target.closest("[data-sk-segment] .sk-btn");
    if (t) {
      e.preventDefault();
      t.closest("[data-sk-segment]").querySelectorAll(".sk-btn").forEach(function (b) {
        b.classList.remove("active");
      });
      t.classList.add("active");
      return;
    }

    /* Sortable table header: click cycles ascending / descending */
    t = e.target.closest("th[data-sk-sort]");
    if (t) {
      sortByColumn(t);
      return;
    }

    /* Back to top */
    t = e.target.closest("[data-sk-scroll-top]");
    if (t) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    /* Clicking a sidebar link on mobile closes the sidebar */
    if (e.target.closest(".sk-sidebar a") && window.innerWidth < 768) {
      closeSidebar();
    }

    /* Any other click closes open dropdowns and popovers */
    if (!e.target.closest(".sk-dropdown")) closeAllDropdowns();
    if (!e.target.closest(".sk-popover")) closeAllPopovers();
  });

  /* Escape closes overlays, dropdowns, popovers, and the mobile sidebar.
     Ctrl/Cmd+K toggles the command palette; ↑/↓/Enter navigate it. */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      document.querySelectorAll(OPEN_OVERLAYS).forEach(closeModal);
      closeAllDropdowns();
      closeAllPopovers();
      closeSidebar();
      return;
    }

    if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
      var cmdk = document.querySelector(".sk-cmdk");
      if (cmdk) {
        e.preventDefault();
        if (cmdk.classList.contains("sk-open")) closeModal(cmdk);
        else openModal(cmdk);
      }
      return;
    }

    var openCmdk = document.querySelector(".sk-cmdk.sk-open");
    if (!openCmdk) return;

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      var visible = cmdkVisibleItems(openCmdk);
      if (!visible.length) return;
      var current = visible.indexOf(openCmdk.querySelector(".sk-cmdk-list > .active"));
      var next = e.key === "ArrowDown"
        ? Math.min(current + 1, visible.length - 1)
        : Math.max(current - 1, 0);
      cmdkSetActive(openCmdk, visible[next]);
    } else if (e.key === "Enter") {
      var active = openCmdk.querySelector(".sk-cmdk-list > .active");
      if (active) {
        e.preventDefault();
        closeModal(openCmdk);
        active.click();
      }
    }
  });

  /* ----------------------------------------------------------------------
     SORTABLE TABLES — <th data-sk-sort> (numeric columns detected)
     ---------------------------------------------------------------------- */
  function sortByColumn(th) {
    var table = th.closest("table");
    var tbody = table && table.tBodies[0];
    if (!tbody) return;

    var headers = Array.prototype.slice.call(th.parentNode.children);
    var col = headers.indexOf(th);
    var asc = !th.classList.contains("sk-sort-asc");
    headers.forEach(function (h) { h.classList.remove("sk-sort-asc", "sk-sort-desc"); });
    th.classList.add(asc ? "sk-sort-asc" : "sk-sort-desc");

    function cellText(row) {
      return row.cells[col] ? row.cells[col].textContent.trim() : "";
    }
    function asNumber(text) {
      return parseFloat(text.replace(/[$,%\s]/g, ""));
    }

    var rows = Array.prototype.slice.call(tbody.rows);
    var numeric = rows.length > 0 && rows.every(function (r) {
      var text = cellText(r);
      return text !== "" && !isNaN(asNumber(text));
    });

    rows.sort(function (a, b) {
      var ta = cellText(a), tb = cellText(b);
      var diff = numeric ? asNumber(ta) - asNumber(tb)
                         : ta.localeCompare(tb, undefined, { sensitivity: "base" });
      return asc ? diff : -diff;
    });
    rows.forEach(function (r) { tbody.appendChild(r); });
  }

  /* ----------------------------------------------------------------------
     LIVE FILTER — <input data-sk-filter="target-id"> hides rows/items of the
     target (table body rows, or direct children of a list/grid) that don't
     contain the typed text.
     ---------------------------------------------------------------------- */
  document.addEventListener("input", function (e) {
    /* Command palette search box */
    var cmdkInput = e.target.closest(".sk-cmdk-input");
    if (cmdkInput) {
      var cmdk = cmdkInput.closest(".sk-cmdk");
      if (cmdk) filterCmdk(cmdk, cmdkInput.value.toLowerCase());
      return;
    }

    /* Auto-growing textarea */
    var grow = e.target.closest("textarea[data-sk-autogrow]");
    if (grow) autogrow(grow);

    /* Live character counter */
    var counted = e.target.closest("[data-sk-count]");
    if (counted) updateCount(counted);

    /* Editing a field cleared by validation removes its error state */
    if (e.target.classList && e.target.classList.contains("sk-invalid")) {
      e.target.classList.remove("sk-invalid");
      var oldError = e.target.parentNode &&
        e.target.parentNode.querySelector(".sk-error[data-sk-generated]");
      if (oldError) oldError.parentNode.removeChild(oldError);
    }

    var input = e.target.closest("[data-sk-filter]");
    if (!input) return;
    var target = document.getElementById(input.getAttribute("data-sk-filter"));
    if (!target) return;
    if (target.tagName === "TABLE" && !target.tBodies[0]) return;

    var items = target.tagName === "TABLE" ? target.tBodies[0].rows : target.children;
    var query = input.value.toLowerCase();
    Array.prototype.forEach.call(items, function (item) {
      item.style.display =
        item.textContent.toLowerCase().indexOf(query) > -1 ? "" : "none";
    });
  });

  /* ----------------------------------------------------------------------
     FORM VALIDATION — <form data-sk-validate> blocks invalid submits and
     marks each bad field with .sk-invalid plus the browser's own message
     in a .sk-error line. Errors clear as the user edits the field.
     ---------------------------------------------------------------------- */
  document.querySelectorAll("form[data-sk-validate]").forEach(function (form) {
    form.setAttribute("novalidate", "");
  });

  document.addEventListener("submit", function (e) {
    var form = e.target.closest("form[data-sk-validate]");
    if (!form) return;

    form.querySelectorAll(".sk-invalid").forEach(function (field) {
      field.classList.remove("sk-invalid");
    });
    form.querySelectorAll(".sk-error[data-sk-generated]").forEach(function (err) {
      err.parentNode.removeChild(err);
    });

    if (form.checkValidity()) return;
    e.preventDefault();

    var invalid = form.querySelectorAll("input:invalid, select:invalid, textarea:invalid");
    invalid.forEach(function (field) {
      field.classList.add("sk-invalid");
      var error = document.createElement("div");
      error.className = "sk-error";
      error.setAttribute("data-sk-generated", "");
      error.textContent = field.validationMessage;
      field.parentNode.insertBefore(error, field.nextSibling);
    });
    if (invalid[0]) invalid[0].focus();
  });

  /* ----------------------------------------------------------------------
     AUTO-GROWING TEXTAREAS + CHARACTER COUNTERS
     ---------------------------------------------------------------------- */
  function autogrow(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  }

  function updateCount(field) {
    var counter = field._skCounter;
    if (!counter) {
      counter = document.createElement("div");
      counter.className = "sk-count";
      field.parentNode.insertBefore(counter, field.nextSibling);
      field._skCounter = counter;
    }
    var max = parseInt(field.getAttribute("maxlength"), 10);
    counter.textContent = max ? field.value.length + " / " + max : String(field.value.length);
    counter.classList.toggle("sk-count-warn", !!max && field.value.length >= max * 0.9);
  }

  document.querySelectorAll("textarea[data-sk-autogrow]").forEach(autogrow);
  document.querySelectorAll("[data-sk-count]").forEach(updateCount);

  /* ----------------------------------------------------------------------
     SCROLL REVEAL — data-sk-reveal fades an element in the first time it
     scrolls into view. Without IntersectionObserver support (or without
     JS at all) the element just stays visible.
     ---------------------------------------------------------------------- */
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("sk-revealed");
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -10% 0px" });

    document.querySelectorAll("[data-sk-reveal]").forEach(function (el) {
      el.classList.add("sk-reveal-init");
      revealObserver.observe(el);
    });
  }

  /* ----------------------------------------------------------------------
     CAROUSEL AUTOPLAY — <div class="sk-carousel" data-sk-autoplay="4000">
     Advances one view per interval, wraps to the start, pauses while the
     pointer or keyboard focus is inside, and respects reduced motion.
     ---------------------------------------------------------------------- */
  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduceMotion) {
    document.querySelectorAll(".sk-carousel[data-sk-autoplay]").forEach(function (carousel) {
      var track = carousel.querySelector(".sk-carousel-track");
      if (!track) return;
      var delay = parseInt(carousel.getAttribute("data-sk-autoplay"), 10) || 5000;
      var paused = false;
      carousel.addEventListener("mouseenter", function () { paused = true; });
      carousel.addEventListener("mouseleave", function () { paused = false; });
      carousel.addEventListener("focusin", function () { paused = true; });
      carousel.addEventListener("focusout", function () { paused = false; });
      carousel.addEventListener("touchstart", function () { paused = true; }, { passive: true });

      setInterval(function () {
        if (paused || !document.contains(track)) return;
        var maxScroll = track.scrollWidth - track.clientWidth;
        if (track.scrollLeft >= maxScroll - 4) track.scrollTo({ left: 0, behavior: "smooth" });
        else track.scrollBy({ left: track.clientWidth, behavior: "smooth" });
      }, delay);
    });
  }

  /* ----------------------------------------------------------------------
     SCROLLSPY — data-sk-scrollspy on a nav/sidebar of #anchor links keeps
     the link for the section currently on screen marked .active
     ---------------------------------------------------------------------- */
  if ("IntersectionObserver" in window) {
    document.querySelectorAll("[data-sk-scrollspy]").forEach(function (nav) {
      var linkFor = {};
      nav.querySelectorAll('a[href^="#"]').forEach(function (link) {
        linkFor[link.getAttribute("href").slice(1)] = link;
      });

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          nav.querySelectorAll("a.active").forEach(function (a) {
            a.classList.remove("active");
          });
          linkFor[entry.target.id].classList.add("active");
        });
      }, { rootMargin: "-20% 0px -70% 0px" });

      Object.keys(linkFor).forEach(function (id) {
        var section = document.getElementById(id);
        if (section) observer.observe(section);
      });
    });
  }
})();
