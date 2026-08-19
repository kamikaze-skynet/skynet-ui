/* ==========================================================================
   Skynet UI v1.2.0 — behavior script
   Drop into any page AFTER your content or with defer:
     <script src="/skynet-ui.js" defer></script>

   Everything works through data attributes — no JS knowledge needed:
     data-sk-open="id"         → opens that modal or drawer
     data-sk-close             → closes the modal/drawer it's inside
     data-sk-tab="panel-id"    → tab button showing that panel
     data-sk-dropdown          → toggles the dropdown menu next to it
     data-sk-sidebar           → toggles the sidebar on mobile
     data-sk-burger            → toggles the navbar menu on mobile
     data-sk-toast="Message"   → shows a toast (data-sk-toast-type="success")
     data-sk-theme-toggle      → switches light/dark theme (remembered)
     data-sk-copy="text"       → copies text to the clipboard (or use
                                 data-sk-copy-target="element-id")
     data-sk-dismiss           → removes the .sk-chip or .sk-alert it's inside
     data-sk-segment           → on a .sk-btn-group: clicks move the .active
     data-sk-sort              → on a <th>: click sorts the table by that column
     data-sk-filter="id"       → on an <input>: typing filters that table/list
     data-sk-scroll-top        → button smooth-scrolls back to the top
     data-sk-scrollspy         → on a sidebar/nav of #links: highlights the
                                 link whose section is currently on screen

   Global functions:
     skToast("Saved!", "success")   types: "info" (default), "success",
                                           "warning", "danger"
     skOpenModal(id) / skCloseModal(id)   (drawers too)
     skToggleTheme()                flips light/dark and remembers the choice
     skConfirm("Delete this?", {title, okText, cancelText, danger})
                                    → Promise<boolean> confirm dialog
   ========================================================================== */
(function () {
  "use strict";

  /* ----------------------------------------------------------------------
     THEME — restores the saved choice on load; data-sk-theme-toggle flips it
     ---------------------------------------------------------------------- */
  var THEME_KEY = "sk-theme";

  try {
    var savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) document.documentElement.setAttribute("data-theme", savedTheme);
  } catch (err) { /* localStorage unavailable (e.g. file:// in some browsers) */ }

  function skToggleTheme() {
    var root = document.documentElement;
    var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem(THEME_KEY, next); } catch (err) { /* ignore */ }
  }

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

  function skToast(message, type, duration) {
    type = type || "info";
    duration = typeof duration === "number" ? duration : 3500;

    var toast = document.createElement("div");
    toast.className = "sk-toast" + (type !== "info" ? " sk-toast-" + type : "");
    toast.setAttribute("role", "status");

    var text = document.createElement("span");
    text.textContent = message;
    toast.appendChild(text);

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
     MODALS + DRAWERS (same open/close mechanics)
     ---------------------------------------------------------------------- */
  function openModal(modal) {
    if (!modal) return;
    modal.classList.add("sk-open");
    document.body.classList.add("sk-modal-open");
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove("sk-open");
    if (!document.querySelector(".sk-modal.sk-open, .sk-drawer.sk-open")) {
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
        if (!document.querySelector(".sk-modal.sk-open, .sk-drawer.sk-open")) {
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
     DROPDOWNS
     ---------------------------------------------------------------------- */
  function closeAllDropdowns(except) {
    document.querySelectorAll(".sk-dropdown.sk-open").forEach(function (d) {
      if (d !== except) d.classList.remove("sk-open");
    });
  }

  /* ----------------------------------------------------------------------
     ONE GLOBAL CLICK HANDLER — wires everything up via data attributes
     ---------------------------------------------------------------------- */
  document.addEventListener("click", function (e) {
    var t;

    /* Open modal */
    t = e.target.closest("[data-sk-open]");
    if (t) {
      e.preventDefault();
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

    /* Click on the dark area outside the modal/drawer box closes it */
    if (e.target.classList &&
        (e.target.classList.contains("sk-modal") || e.target.classList.contains("sk-drawer"))) {
      closeModal(e.target);
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

    /* Any other click closes open dropdowns */
    if (!e.target.closest(".sk-dropdown")) closeAllDropdowns();
  });

  /* Escape closes modals, drawers, dropdowns, and the mobile sidebar */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    document.querySelectorAll(".sk-modal.sk-open, .sk-drawer.sk-open").forEach(closeModal);
    closeAllDropdowns();
    closeSidebar();
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
