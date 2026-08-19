/* ==========================================================================
   Skynet UI v1.0.0 — behavior script
   Drop into any page AFTER your content or with defer:
     <script src="/skynet-ui.js" defer></script>

   Everything works through data attributes — no JS knowledge needed:
     data-sk-open="modal-id"   → opens that modal
     data-sk-close             → closes the modal it's inside
     data-sk-tab="panel-id"    → tab button showing that panel
     data-sk-dropdown          → toggles the dropdown menu next to it
     data-sk-sidebar           → toggles the sidebar on mobile
     data-sk-burger            → toggles the navbar menu on mobile
     data-sk-toast="Message"   → shows a toast (data-sk-toast-type="success")

   One global function:
     skToast("Saved!", "success")   types: "info" (default), "success",
                                           "warning", "danger"
   ========================================================================== */
(function () {
  "use strict";

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
     MODALS
     ---------------------------------------------------------------------- */
  function openModal(modal) {
    if (!modal) return;
    modal.classList.add("sk-open");
    document.body.classList.add("sk-modal-open");
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove("sk-open");
    if (!document.querySelector(".sk-modal.sk-open")) {
      document.body.classList.remove("sk-modal-open");
    }
  }

  window.skOpenModal = function (id) { openModal(document.getElementById(id)); };
  window.skCloseModal = function (id) { closeModal(document.getElementById(id)); };

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

    /* Close modal (button inside a modal) */
    t = e.target.closest("[data-sk-close]");
    if (t) {
      e.preventDefault();
      closeModal(t.closest(".sk-modal"));
      return;
    }

    /* Click on the dark area outside the modal box closes it */
    if (e.target.classList && e.target.classList.contains("sk-modal")) {
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

    /* Clicking a sidebar link on mobile closes the sidebar */
    if (e.target.closest(".sk-sidebar a") && window.innerWidth < 768) {
      closeSidebar();
    }

    /* Any other click closes open dropdowns */
    if (!e.target.closest(".sk-dropdown")) closeAllDropdowns();
  });

  /* Escape closes modals, dropdowns, and the mobile sidebar */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    document.querySelectorAll(".sk-modal.sk-open").forEach(closeModal);
    closeAllDropdowns();
    closeSidebar();
  });
})();
