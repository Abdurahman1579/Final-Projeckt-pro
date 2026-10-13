/* ============================================================
   THEME SYSTEM — Light / Dark Mode
   ------------------------------------------------------------
   - Saves preference in localStorage
   - Respects system preference on first visit
   - Toggle button integrated in navbar
   - Works on all pages (loads via layout.js)
   ============================================================ */

(function () {
  "use strict";

  const STORAGE_KEY = "mkn-theme";
  const THEMES = { light: "light", dark: "dark" };

  /* ============================================================
     1) GET CURRENT THEME
     ============================================================ */
  function getSavedTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (err) {
      return null;
    }
  }

  function getSystemTheme() {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return THEMES.dark;
    }
    return THEMES.light;
  }

  function getInitialTheme() {
    return getSavedTheme() || getSystemTheme();
  }

  /* ============================================================
     2) APPLY THEME
     ============================================================ */
  function applyTheme(theme) {
    if (theme !== THEMES.dark && theme !== THEMES.light) {
      theme = THEMES.light;
    }

    // Set attribute on <html>
    document.documentElement.setAttribute("data-theme", theme);

    // Update toggle button icon
    updateToggleIcon(theme);

    // Update meta theme-color for mobile browser UI
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute(
        "content",
        theme === THEMES.dark ? "#0a1512" : "#0d3b2e",
      );
    } else {
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = theme === THEMES.dark ? "#0a1512" : "#0d3b2e";
      document.head.appendChild(meta);
    }
  }

  function updateToggleIcon(theme) {
    const icons = document.querySelectorAll(".theme-toggle .theme-icon");
    icons.forEach((icon) => {
      icon.textContent = theme === THEMES.dark ? "☀️" : "🌙";
    });
    const buttons = document.querySelectorAll(".theme-toggle");
    buttons.forEach((btn) => {
      btn.setAttribute(
        "aria-label",
        theme === THEMES.dark ? "Switch to light mode" : "Switch to dark mode",
      );
      btn.setAttribute(
        "title",
        theme === THEMES.dark ? "Light mode" : "Dark mode",
      );
    });
  }

  /* ============================================================
     3) TOGGLE
     ============================================================ */
  function toggleTheme() {
    const current =
      document.documentElement.getAttribute("data-theme") || THEMES.light;
    const next = current === THEMES.dark ? THEMES.light : THEMES.dark;

    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (err) {
      /* ignore */
    }

    // Dispatch event for other scripts
    window.dispatchEvent(
      new CustomEvent("themechange", {
        detail: { theme: next },
      }),
    );
  }

  /* ============================================================
     4) INIT
     ============================================================ */
  function initTheme() {
    // Apply initial theme immediately (avoid flash)
    applyTheme(getInitialTheme());

    // Attach click handlers to toggle buttons
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".theme-toggle");
      if (!btn) return;
      e.preventDefault();
      toggleTheme();
    });

    // Listen to system theme changes (if user hasn't chosen manually)
    if (window.matchMedia) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      if (mq.addEventListener) {
        mq.addEventListener("change", (e) => {
          // Only auto-switch if user hasn't saved a preference
          if (!getSavedTheme()) {
            applyTheme(e.matches ? THEMES.dark : THEMES.light);
          }
        });
      }
    }
  }

  /* ============================================================
     5) EXPOSE API
     ============================================================ */
  window.mknTheme = {
    init: initTheme,
    toggle: toggleTheme,
    set: applyTheme,
    get: () =>
      document.documentElement.getAttribute("data-theme") || THEMES.light,
    isDark: () =>
      document.documentElement.getAttribute("data-theme") === THEMES.dark,
  };

  // Apply theme ASAP (before DOMContentLoaded) to avoid flash
  applyTheme(getInitialTheme());

  // Full init after DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTheme);
  } else {
    initTheme();
  }

  console.log("[Theme] ✓ Ready");
})();
