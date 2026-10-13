/* ============================================================
   ADMIN MOBILE — Hamburger + Close + Theme Toggle
   ============================================================ */

(function () {
  "use strict";

  function init() {
    const toggle = document.getElementById("mobileMenuToggle");
    const sidebar = document.querySelector(".admin-sidebar");
    const overlay = document.getElementById("mobileOverlay");
    const closeBtn = document.getElementById("sidebarClose");
    const adminApp = document.getElementById("adminApp");
    const loginThemeToggle = document.getElementById("loginThemeToggle");

    /* ============================================================
       1) THEME TOGGLE (works on both login + dashboard)
       ============================================================ */
    function applyThemeFromStorage() {
      const saved = localStorage.getItem("mkn-theme");
      const isDark = saved === "dark";
      document.body.classList.toggle("dark-mode", isDark);
      // Update all theme buttons
      document
        .querySelectorAll("#loginThemeToggle, #themeToggle, .theme-toggle-btn")
        .forEach((btn) => {
          btn.textContent = isDark ? "☀️" : "🌙";
        });
    }

    function toggleTheme() {
      const isDark = document.body.classList.toggle("dark-mode");
      localStorage.setItem("mkn-theme", isDark ? "dark" : "light");
      // Update all theme buttons
      document
        .querySelectorAll("#loginThemeToggle, #themeToggle, .theme-toggle-btn")
        .forEach((btn) => {
          btn.textContent = isDark ? "☀️" : "🌙";
        });
    }

    // Apply on load
    applyThemeFromStorage();

    // Login theme toggle
    if (loginThemeToggle) {
      loginThemeToggle.addEventListener("click", toggleTheme);
    }

    // Dashboard theme toggle
    const dashThemeToggle = document.getElementById("themeToggle");
    if (dashThemeToggle) {
      dashThemeToggle.addEventListener("click", toggleTheme);
    }

    /* ============================================================
       2) SIDEBAR DRAWER (mobile)
       ============================================================ */
    if (!toggle || !sidebar) return;

    function syncBodyClass() {
      if (adminApp && adminApp.classList.contains("active")) {
        document.body.classList.add("admin-active");
      } else {
        document.body.classList.remove("admin-active");
      }
    }

    if (adminApp) {
      const observer = new MutationObserver(syncBodyClass);
      observer.observe(adminApp, {
        attributes: true,
        attributeFilter: ["class"],
      });
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

    // Hamburger
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleSidebar();
    });

    // Close (×) button
    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeSidebar();
      });
    }

    // Overlay click
    if (overlay) {
      overlay.addEventListener("click", closeSidebar);
    }

    // Nav link click
    document.querySelectorAll("#adminNav a").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 860) {
          setTimeout(closeSidebar, 150);
        }
      });
    });

    // Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && sidebar.classList.contains("open")) {
        closeSidebar();
      }
    });

    // Resize
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth > 860 && sidebar.classList.contains("open")) {
          closeSidebar();
        }
      }, 200);
    });

    // Swipe left
    let touchStartX = 0;
    let touchStartY = 0;
    sidebar.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      },
      { passive: true },
    );

    sidebar.addEventListener(
      "touchend",
      (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > Math.abs(dy) && dx < -60) {
          closeSidebar();
        }
      },
      { passive: true },
    );

    console.log("[Admin Mobile] ✓ Ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(init, 300));
  } else {
    setTimeout(init, 300);
  }
})();
