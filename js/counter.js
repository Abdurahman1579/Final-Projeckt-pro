/* ============================================================
   COUNTER ANIMATION — Animated number counting
   ------------------------------------------------------------
   Usage in HTML:
     <span class="counter" data-target="190000000" data-suffix=" ብር">0</span>

   The script will animate from 0 → target when visible.
   ============================================================ */

(function () {
  "use strict";

  /* ============================================================
     1) CORE COUNTER — animate a single element
     ============================================================ */
  function animateCounter(el, options) {
    const opts = options || {};
    const target =
      parseFloat(el.dataset.target || el.textContent.replace(/[^0-9.]/g, "")) ||
      0;
    const duration = opts.duration || 2000;
    const suffix = el.dataset.suffix || "";
    const prefix = el.dataset.prefix || "";
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const useCommas = el.dataset.commas !== "false";
    const startVal = parseFloat(el.dataset.start || "0");

    const startTime = performance.now();

    function formatNumber(n) {
      let s = n.toFixed(decimals);
      if (useCommas) {
        const parts = s.split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        s = parts.join(".");
      }
      return prefix + s + suffix;
    }

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic (fast start, slow end)
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (target - startVal) * eased;

      el.textContent = formatNumber(current);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = formatNumber(target);
        el.dataset.animated = "true";
      }
    }

    requestAnimationFrame(tick);
  }

  /* ============================================================
     2) OBSERVER — start animation when element is visible
     ============================================================ */
  function setupCounterObserver(selector) {
    const elements = document.querySelectorAll(selector || ".counter");
    if (!elements.length) return;

    // Fallback for browsers without IntersectionObserver
    if (!("IntersectionObserver" in window)) {
      elements.forEach((el) => {
        if (el.dataset.animated !== "true") animateCounter(el);
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (
            entry.isIntersecting &&
            entry.target.dataset.animated !== "true"
          ) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -40px 0px" },
    );

    elements.forEach((el) => {
      if (el.dataset.animated !== "true") observer.observe(el);
    });
  }

  /* ============================================================
     3) FORCE RE-ANIMATE (e.g., after data update)
     ============================================================ */
  function resetCounters(selector) {
    document.querySelectorAll(selector || ".counter").forEach((el) => {
      el.dataset.animated = "false";
      el.textContent = "0" + (el.dataset.suffix || "");
    });
  }

  /* ============================================================
     4) UPDATE COUNTER TARGET (used when Supabase loads new data)
     ============================================================ */
  function updateCounter(elOrSelector, newTarget, options) {
    const el =
      typeof elOrSelector === "string"
        ? document.querySelector(elOrSelector)
        : elOrSelector;
    if (!el) return;

    const opts = options || {};
    const currentText = el.textContent.replace(/[^0-9.]/g, "");
    const currentVal = parseFloat(currentText) || 0;

    // If already animated, re-animate from current → new target
    el.dataset.target = String(newTarget);
    el.dataset.animated = "false";
    el.dataset.start = String(currentVal);

    // Small delay to allow DOM update
    setTimeout(() => animateCounter(el, opts), 50);
  }

  /* ============================================================
     5) AUTO-INIT on page load
     ============================================================ */
  function init() {
    setupCounterObserver(".counter");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(init, 100));
  } else {
    setTimeout(init, 100);
  }

  /* ============================================================
     6) EXPOSE GLOBAL API
     ============================================================ */
  window.mknCounter = {
    animate: animateCounter,
    setup: setupCounterObserver,
    reset: resetCounters,
    update: updateCounter,
  };

  console.log("[Counter] ✓ Ready");
})();
