/* ============================================================
   HOMEPAGE DATA — Load stats from Supabase
   ------------------------------------------------------------
   - Raised total (sum of pledges)
   - Goal (190M)
   - Unique donors count
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

    try {
      const res = await window.mknBackend.fetchPledges({});
      if (!res.success || !res.data) {
        console.warn("[Index Data] Failed to fetch pledges:", res.error);
        return;
      }

      const pledges = res.data;

      // ---- Calculate totals ----
      const totalRaised = pledges.reduce(
        (sum, p) => sum + (Number(p.amount) || 0),
        0,
      );
      const totalGoal = 190000000;
      const percent = totalGoal > 0 ? (totalRaised / totalGoal) * 100 : 0;

      // Unique donors = unique phone numbers
      const uniqueDonors = new Set(
        pledges.map((p) => (p.phone || "").trim()).filter(Boolean),
      ).size;

      // ---- Update percentage ----
      const percentEl = document.querySelector(".pc-percent .counter");
      if (percentEl) {
        percentEl.dataset.target = percent.toFixed(1);
        percentEl.dataset.decimals = "1";
        percentEl.dataset.animated = "false";
        percentEl.textContent = "0.0%";
      }

      // ---- Update goal (static, but ensure it's set) ----
      const goalEl = document.querySelector(".pc-stat.gold .counter");
      if (goalEl) {
        goalEl.dataset.target = String(totalGoal);
        goalEl.dataset.suffix = " ብር";
        goalEl.dataset.animated = "false";
        goalEl.textContent = "0 ብር";
      }

      // ---- Update raised ----
      const raisedEl = document.querySelector(".pc-stat.green .counter");
      if (raisedEl) {
        raisedEl.dataset.target = String(totalRaised);
        raisedEl.dataset.suffix = " ብር";
        raisedEl.dataset.animated = "false";
        raisedEl.textContent = "0 ብር";
      }

      // ---- Update unique donors ----
      // Third .pc-stat (not .green, not .gold)
      const donorEl = document.querySelector(
        ".pc-stats .pc-stat:not(.green):not(.gold) .counter",
      );
      if (donorEl) {
        donorEl.dataset.target = String(uniqueDonors);
        donorEl.dataset.animated = "false";
        donorEl.textContent = "0";
      }

      // ---- Update progress bar ----
      const fill = document.querySelector(".progress-card .progress-bar .fill");
      if (fill) {
        setTimeout(() => {
          fill.style.transition = "width 2s cubic-bezier(0.4, 0, 0.2, 1)";
          fill.style.width = Math.min(percent, 100) + "%";
        }, 100);
      }

      // ---- Re-run counter animations ----
      setTimeout(() => {
        if (window.mknCounter) {
          window.mknCounter.setup(".counter");
        }
      }, 200);

      console.log("[Index Data] ✓ Stats updated:", {
        raised: totalRaised,
        goal: totalGoal,
        percent: percent.toFixed(2) + "%",
        uniqueDonors: uniqueDonors,
        pledgesCount: pledges.length,
      });
    } catch (err) {
      console.error("[Index Data] Error:", err);
    }
  });
})();
