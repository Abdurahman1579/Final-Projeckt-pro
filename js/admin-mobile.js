/* ============================================================
   ADMIN MOBILE — Hamburger Menu Toggle
   ============================================================ */

(function () {
  "use strict";

  function init() {
    const toggle = document.getElementById("mobileMenuToggle");
    const sidebar = document.querySelector(".admin-sidebar");
    const overlay = document.getElementById("mobileOverlay");
    const navLinks = document.querySelectorAll("#adminNav a");

    if (!toggle || !sidebar) {
      console.warn("[Admin Mobile] Toggle or sidebar not found");
      return;
    }

    // ---- Open/close sidebar ----
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
      e.stopPropagation();
      toggleSidebar();
    });

    // Overlay click — close
    if (overlay) {
      overlay.addEventListener("click", closeSidebar);
    }

    // Nav link click — close (mobile)
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 860) {
          setTimeout(closeSidebar, 150);
        }
      });
    });

    // Escape key — close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && sidebar.classList.contains("open")) {
        closeSidebar();
      }
    });

    // Resize — reset on desktop
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth > 860) {
          closeSidebar();
        }
      }, 200);
    });

    // ---- Sidebar swipes on mobile (bonus) ----
    let touchStartX = 0;
    let touchStartY = 0;
    let touchMoved = false;

    sidebar.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchMoved = false;
      },
      { passive: true },
    );

    sidebar.addEventListener(
      "touchmove",
      (e) => {
        touchMoved = true;
        const dx = e.touches[0].clientX - touchStartX;
        const dy = e.touches[0].clientY - touchStartY;
        // Swipe left to close (only if mostly horizontal)
        if (Math.abs(dx) > Math.abs(dy) && dx < -60) {
          closeSidebar();
        }
      },
      { passive: true },
    );

    console.log("[Admin Mobile] ✓ Hamburger menu ready");
  }

  // Init on load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(init, 300));
  } else {
    setTimeout(init, 300);
  }
})();
