/* ============================================================
   HOMEPAGE DATA — Load stats from Supabase
   ------------------------------------------------------------
   Updates the animated counters with real numbers from Supabase
   ============================================================ */

(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState !== "loading") setTimeout(fn, 400);
    else
      document.addEventListener("DOMContentLoaded", () => setTimeout(fn, 400));
  }

  ready(async function () {
    if (!window.mknBackend) {
      console.warn("[Index Data] mknBackend not available");
      return;
    }
    if (!window.mknCounter) {
      console.warn("[Index Data] mknCounter not available");
      return;
    }

    try {
      // Fetch pledges to calculate real totals
      const res = await window.mknBackend.fetchPledges({});
      if (!res.success || !res.data) {
        console.warn("[Index Data] Failed to fetch pledges:", res.error);
        return;
      }

      const pledges = res.data;

      // Calculate totals
      const totalRaised = pledges.reduce(
        (sum, p) => sum + (Number(p.amount) || 0),
        0,
      );
      const totalGoal = 190000000;
      const percent = totalGoal > 0 ? (totalRaised / totalGoal) * 100 : 0;

      // Count unique donors (by phone)
      const uniqueDonors = new Set(pledges.map((p) => p.phone).filter(Boolean))
        .size;
      const mosqueCount = 85; // Static

      // ---- Update counters ----
      // Percent
      const percentEl = document.querySelector('.counter[data-suffix="%"]');
      if (percentEl) {
        percentEl.dataset.target = percent.toFixed(1);
        percentEl.dataset.decimals = "1";
        percentEl.dataset.animated = "false";
        percentEl.textContent = "0.0%";
      }

      // Total raised
      const raisedEl = document.querySelector(".pc-stat.green .counter");
      if (raisedEl) {
        raisedEl.dataset.target = String(totalRaised);
        raisedEl.dataset.suffix = " ብር";
        raisedEl.dataset.animated = "false";
        raisedEl.textContent = "0 ብር";
      }

      // Total donors
      const donorEls = document.querySelectorAll(
        ".pc-stat:not(.green):not(.gold) .counter",
      );
      if (donorEls[0]) {
        donorEls[0].dataset.target = String(uniqueDonors);
        donorEls[0].dataset.animated = "false";
        donorEls[0].textContent = "0";
      }

      // Mosque count (static 85)
      if (donorEls[1]) {
        donorEls[1].dataset.target = String(mosqueCount);
        donorEls[1].dataset.animated = "false";
        donorEls[1].textContent = "0";
      }

      // ---- Update progress bar width ----
      const fill = document.querySelector(".progress-card .progress-bar .fill");
      if (fill) {
        setTimeout(() => {
          fill.style.transition = "width 2s cubic-bezier(0.4, 0, 0.2, 1)";
          fill.style.width = Math.min(percent, 100) + "%";
        }, 100);
      }

      // ---- Re-run animations ----
      setTimeout(() => {
        if (window.mknCounter) {
          window.mknCounter.setup(".counter");
        }
      }, 200);

      console.log("[Index Data] ✓ Stats updated:", {
        raised: totalRaised,
        percent: percent.toFixed(1) + "%",
        donors: uniqueDonors,
        pledges: pledges.length,
      });
    } catch (err) {
      console.error("[Index Data] Error:", err);
    }
  });
})();
