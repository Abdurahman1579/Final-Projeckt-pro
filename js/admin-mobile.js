/* ============================================================
   ADMIN MOBILE — Hamburger Drawer + Body Class Manager
   ============================================================ */

(function () {
  "use strict";

  function init() {
    const toggle = document.getElementById("mobileMenuToggle");
    const sidebar = document.querySelector(".admin-sidebar");
    const overlay = document.getElementById("mobileOverlay");
    const adminApp = document.getElementById("adminApp");

    if (!toggle || !sidebar) {
      console.warn("[Admin Mobile] Elements not found");
      return;
    }

    // Add body class when admin is active (for overflow rules)
    function syncBodyClass() {
      if (adminApp && adminApp.classList.contains("active")) {
        document.body.classList.add("admin-active");
      } else {
        document.body.classList.remove("admin-active");
      }
    }

    // Watch for admin-app class changes (login/logout)
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

    // Hamburger click
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleSidebar();
    });

    // Overlay click
    if (overlay) {
      overlay.addEventListener("click", closeSidebar);
    }

    // Nav link click — close sidebar (mobile)
    document.querySelectorAll("#adminNav a").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 860) {
          setTimeout(closeSidebar, 150);
        }
      });
    });

    // Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && sidebar.classList.contains("open")) {
        closeSidebar();
      }
    });

    // Resize handler
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth > 860 && sidebar.classList.contains("open")) {
          closeSidebar();
        }
      }, 200);
    });

    // Swipe left to close sidebar (mobile)
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
