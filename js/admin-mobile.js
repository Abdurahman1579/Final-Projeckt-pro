/* ============================================================
   ADMIN MOBILE — Full: Hamburger + Close + Theme Toggle
   ============================================================ */

(function () {
  "use strict";

  function init() {
    console.log("[Admin Mobile] Init...");

    /* ============================================================
       1) THEME TOGGLE (login + dashboard)
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

    // Login theme button
    const loginThemeBtn = document.getElementById("loginThemeToggle");
    if (loginThemeBtn) {
      loginThemeBtn.addEventListener("click", toggleTheme);
      console.log("[Admin Mobile] ✓ Login theme toggle bound");
    }

    // Dashboard theme button
    const dashThemeBtn = document.getElementById("themeToggle");
    if (dashThemeBtn) {
      dashThemeBtn.addEventListener("click", toggleTheme);
      console.log("[Admin Mobile] ✓ Dashboard theme toggle bound");
    }

    /* ============================================================
       2) LANGUAGE SWITCHER (login + dashboard)
       ============================================================ */
    function bindLangSwitcher(switcherId, btnId) {
      const switcher = document.getElementById(switcherId);
      const btn = document.getElementById(btnId);
      if (!switcher || !btn) return;

      // Avoid double binding
      if (btn.dataset.bound === "1") return;
      btn.dataset.bound = "1";

      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Close other switchers
        document.querySelectorAll(".lang-switcher.open").forEach((s) => {
          if (s !== switcher) s.classList.remove("open");
        });
        switcher.classList.toggle("open");
      });

      switcher.querySelectorAll(".lang-option").forEach((opt) => {
        opt.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const lang = opt.dataset.lang;
          if (window.i18n && window.i18n.setLanguage) {
            window.i18n.setLanguage(lang);
          }
          switcher.classList.remove("open");
          // Update the visible label
          const label = switcher.querySelector(".lang-current");
          if (label) label.textContent = lang.toUpperCase();
        });
      });

      console.log(`[Admin Mobile] ✓ Lang switcher bound: ${switcherId}`);
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

    if (!toggle || !sidebar) {
      console.warn("[Admin Mobile] Toggle or sidebar not found");
      return;
    }

    function syncBodyClass() {
      if (adminApp && adminApp.classList.contains("active")) {
        document.body.classList.add("admin-active");
      } else {
        document.body.classList.remove("admin-active");
      }
    }

    if (adminApp) {
      const obs = new MutationObserver(syncBodyClass);
      obs.observe(adminApp, { attributes: true, attributeFilter: ["class"] });
      syncBodyClass();
    }

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

    // Hamburger click
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleSidebar();
    });

    // × Close button click
    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeSidebar();
        console.log("[Admin Mobile] ✓ Sidebar closed via ×");
      });
      console.log("[Admin Mobile] ✓ Close button bound");
    } else {
      console.warn(
        "[Admin Mobile] ⚠ Close button (sidebarClose) not found in HTML",
      );
    }

    // Overlay click
    if (overlay) {
      overlay.addEventListener("click", closeSidebar);
    }

    // Nav link click
    document.querySelectorAll("#adminNav a").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 860) setTimeout(closeSidebar, 150);
      });
    });

    // Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && sidebar.classList.contains("open")) {
        closeSidebar();
      }
    });

    // Resize — close on desktop
    let rz;
    window.addEventListener("resize", () => {
      clearTimeout(rz);
      rz = setTimeout(() => {
        if (window.innerWidth > 860 && sidebar.classList.contains("open")) {
          closeSidebar();
        }
      }, 200);
    });

    // Swipe left
    let tx = 0,
      ty = 0;
    sidebar.addEventListener(
      "touchstart",
      (e) => {
        tx = e.touches[0].clientX;
        ty = e.touches[0].clientY;
      },
      { passive: true },
    );

    sidebar.addEventListener(
      "touchend",
      (e) => {
        const dx = e.changedTouches[0].clientX - tx;
        const dy = e.changedTouches[0].clientY - ty;
        if (Math.abs(dx) > Math.abs(dy) && dx < -60) closeSidebar();
      },
      { passive: true },
    );

    console.log("[Admin Mobile] ✓ Ready — all bindings complete");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(init, 300));
  } else {
    setTimeout(init, 300);
  }
})();
