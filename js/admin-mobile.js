/* ============================================================
   ADMIN MOBILE — Lang switcher + Theme + Sidebar
   ============================================================ */

(function () {
  "use strict";

  function init() {
    console.log("[Admin Mobile] Init...");

    /* ============================================================
       1) THEME TOGGLE
       ============================================================ */
    function applyTheme() {
      const isDark = localStorage.getItem("mkn-theme") === "dark";
      document.body.classList.toggle("dark-mode", isDark);
      document
        .querySelectorAll("#loginThemeToggle, #themeToggle, .theme-toggle-btn")
        .forEach((btn) => {
          btn.textContent = isDark ? "☀️" : "🌙";
        });
    }

    function toggleTheme() {
      const isDark = document.body.classList.toggle("dark-mode");
      localStorage.setItem("mkn-theme", isDark ? "dark" : "light");
      document
        .querySelectorAll("#loginThemeToggle, #themeToggle, .theme-toggle-btn")
        .forEach((btn) => {
          btn.textContent = isDark ? "☀️" : "🌙";
        });
    }

    applyTheme();
    document
      .getElementById("loginThemeToggle")
      ?.addEventListener("click", toggleTheme);
    document
      .getElementById("themeToggle")
      ?.addEventListener("click", toggleTheme);

    /* ============================================================
       2) LANGUAGE SWITCHER — Improved binding
       ============================================================ */
    function bindLangSwitcher(switcherId, btnId) {
      const switcher = document.getElementById(switcherId);
      const btn = document.getElementById(btnId);
      if (!switcher || !btn) {
        console.warn(`[Lang] ${switcherId} not found`);
        return;
      }

      // Avoid double binding
      if (btn.dataset.langBound === "1") return;
      btn.dataset.langBound = "1";

      // Toggle dropdown
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.querySelectorAll(".lang-switcher.open").forEach((s) => {
          if (s !== switcher) s.classList.remove("open");
        });
        switcher.classList.toggle("open");
      });

      // Select language
      switcher.querySelectorAll(".lang-option").forEach((opt) => {
        opt.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const lang = opt.dataset.lang;

          // Update the label
          const label = switcher.querySelector(".lang-current");
          if (label) label.textContent = lang.toUpperCase();

          // Update active state
          switcher
            .querySelectorAll(".lang-option")
            .forEach((o) => o.classList.remove("active"));
          opt.classList.add("active");

          // Change language
          if (window.i18n && window.i18n.setLanguage) {
            window.i18n.setLanguage(lang);
          }

          // Update ALL lang-current labels on the page
          document.querySelectorAll(".lang-current").forEach((el) => {
            el.textContent = lang.toUpperCase();
          });

          switcher.classList.remove("open");
          console.log(`[Lang] Changed to: ${lang}`);
        });
      });

      console.log(`[Lang] ✓ Bound: ${switcherId}`);
    }

    bindLangSwitcher("langSwitcherLogin", "langBtnLogin");
    bindLangSwitcher("langSwitcherAdmin", "langBtnAdmin");

    // Close dropdown on outside click
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".lang-switcher")) {
        document
          .querySelectorAll(".lang-switcher.open")
          .forEach((s) => s.classList.remove("open"));
      }
    });

    // Initial label sync from saved language
    setTimeout(() => {
      const lang =
        window.i18n && window.i18n.getLang ? window.i18n.getLang() : "am";
      document.querySelectorAll(".lang-current").forEach((el) => {
        el.textContent = lang.toUpperCase();
      });
    }, 100);

    /* ============================================================
       3) SIDEBAR DRAWER (mobile)
       ============================================================ */
    const toggle = document.getElementById("mobileMenuToggle");
    const sidebar =
      document.getElementById("adminSidebar") ||
      document.querySelector(".admin-sidebar");
    const overlay = document.getElementById("mobileOverlay");
    const closeBtn = document.getElementById("sidebarClose");
    const adminApp = document.getElementById("adminApp");

    if (!toggle || !sidebar) return;

    function openSidebar() {
      sidebar.classList.add("open");
      toggle.classList.add("open");
      if (overlay) overlay.classList.add("show");
      document.body.style.overflow = "hidden";
    }

    function closeSidebar() {
      sidebar.classList.remove("open");
      toggle.classList.remove("open");
      if (overlay) overlay.classList.remove("show");
      document.body.style.overflow = "";
    }

    function toggleSidebar() {
      if (sidebar.classList.contains("open")) closeSidebar();
      else openSidebar();
    }

    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleSidebar();
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeSidebar();
      });
    }

    if (overlay) overlay.addEventListener("click", closeSidebar);

    document.querySelectorAll("#adminNav a").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 860) setTimeout(closeSidebar, 150);
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && sidebar.classList.contains("open"))
        closeSidebar();
    });

    let rz;
    window.addEventListener("resize", () => {
      clearTimeout(rz);
      rz = setTimeout(() => {
        if (window.innerWidth > 860 && sidebar.classList.contains("open"))
          closeSidebar();
      }, 200);
    });

    console.log("[Admin Mobile] ✓ Ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(init, 300));
  } else {
    setTimeout(init, 300);
  }
})();
