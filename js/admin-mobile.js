/* ============================================================
   ADMIN MOBILE — Theme + Sidebar ONLY
   ------------------------------------------------------------
   ⚠️ Lang switcher removed — js/admin.js already handles it
   (double-binding caused dropdown to close immediately)
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
    const loginThemeBtn = document.getElementById("loginThemeToggle");
    if (loginThemeBtn) {
      loginThemeBtn.addEventListener("click", toggleTheme);
    }
    const dashThemeBtn = document.getElementById("themeToggle");
    if (dashThemeBtn) {
      dashThemeBtn.addEventListener("click", toggleTheme);
    }

    /* ============================================================
       2) SIDEBAR DRAWER (mobile only)
       ============================================================ */
    const toggle = document.getElementById("mobileMenuToggle");
    const sidebar =
      document.getElementById("adminSidebar") ||
      document.querySelector(".admin-sidebar");
    const overlay = document.getElementById("mobileOverlay");
    const closeBtn = document.getElementById("sidebarClose");
    const adminApp = document.getElementById("adminApp");

    if (!toggle || !sidebar) {
      console.warn("[Admin Mobile] Sidebar elements not found");
      return;
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

    console.log("[Admin Mobile] ✓ Ready — theme + sidebar only");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(init, 300));
  } else {
    setTimeout(init, 300);
  }
})();
