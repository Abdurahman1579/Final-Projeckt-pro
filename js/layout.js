/* ============================================================
   LAYOUT — Shared Navbar + Footer + Theme Toggle
   Malka Nono Islamic Affairs Council Project
   ------------------------------------------------------------
   - Injects navbar at <div id="site-nav">
   - Injects footer at <div id="site-footer">
   - Language switcher + Theme toggle
   - Mobile menu
   - Nav scroll shadow
   ============================================================ */

(function () {
  "use strict";

  /* ============================================================
     1) NAVBAR BUILDER
     ============================================================ */
  function buildNav(activePage) {
    const links = [
      { href: "index.html", key: "nav.home", icon: "🏠" },
      { href: "about.html", key: "nav.about", icon: "📖" },
      { href: "leadership.html", key: "nav.leadership", icon: "👥" },
      { href: "budget.html", key: "nav.budget", icon: "💰" },
      { href: "fundraising.html", key: "nav.fundraising", icon: "🎯" },
      { href: "news.html", key: "nav.news", icon: "📰" },
      { href: "reports.html", key: "nav.reports", icon: "📁" },
      { href: "donate.html", key: "nav.donate", icon: "🤲" },
      { href: "contact.html", key: "nav.contact", icon: "✉️" },
      { href: "admin.html", key: "nav.admin", icon: "⚙️" },
    ];

    const linksHTML = links
      .map(
        (l) =>
          `<li><a href="${l.href}" class="${activePage === l.href ? "active" : ""}">
            <span class="nav-icon">${l.icon}</span>
            <span data-i18n="${l.key}"></span>
          </a></li>`,
      )
      .join("");

    return `
      <nav class="nav" id="nav">
        <div class="nav-inner">
          <a href="index.html" class="brand">
            <div class="brand-mark">☪</div>
            <div class="brand-text">
              <span data-i18n="brand.name"></span>
              <small data-i18n="brand.sub"></small>
            </div>
          </a>
          <ul class="nav-links" id="navLinks">${linksHTML}</ul>
          <div class="nav-actions">
            <div class="lang-switcher" id="langSwitcher">
              <button class="lang-btn" id="langBtn" aria-label="Change language">
                🌐 <span class="lang-current">AM</span>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1 3l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                </svg>
              </button>
              <div class="lang-dropdown">
                <button class="lang-option" data-lang="en"><span class="lang-flag">🇬🇧</span> English</button>
                <button class="lang-option" data-lang="am"><span class="lang-flag">🇪🇹</span> አማርኛ</button>
                <button class="lang-option" data-lang="om"><span class="lang-flag">🌳</span> Oromoo</button>
                <button class="lang-option" data-lang="ar"><span class="lang-flag">🇸🇦</span> العربية</button>
              </div>
            </div>
            <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme" title="Toggle theme">
              <span class="theme-icon">🌙</span>
            </button>
          </div>
          <button class="menu-toggle" id="menuToggle" aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>
    `;
  }

  /* ============================================================
     2) FOOTER BUILDER
     ============================================================ */
  function buildFooter() {
    return `
      <footer>
        <div class="footer-inner">
          <div>
            <div class="footer-brand">
              <div class="brand-mark">☪</div>
              <span data-i18n="brand.name"></span>
            </div>
            <p style="max-width:420px;" data-i18n="footer.desc"></p>
          </div>
          <div>
            <h4 data-i18n="footer.dir"></h4>
            <a href="about.html"       data-i18n="nav.about"></a>
            <a href="leadership.html"  data-i18n="nav.leadership"></a>
            <a href="budget.html"      data-i18n="nav.budget"></a>
            <a href="fundraising.html" data-i18n="nav.fundraising"></a>
            <a href="news.html"        data-i18n="nav.news"></a>
          </div>
          <div>
            <h4 data-i18n="footer.addr"></h4>
            <p data-i18n="footer.addr.line1"></p>
            <p data-i18n="footer.addr.line2"></p>
            <p style="margin-top:10px;" data-i18n="footer.copyright"></p>
          </div>
        </div>
        <div class="footer-bottom" data-i18n="footer.credit"></div>
      </footer>
    `;
  }

  /* ============================================================
     3) INIT
     ============================================================ */
  function initLayout() {
    // Detect current page filename (e.g. "about.html")
    const path = window.location.pathname.split("/").pop() || "index.html";

    // Inject navbar
    const navPlaceholder = document.getElementById("site-nav");
    if (navPlaceholder) navPlaceholder.outerHTML = buildNav(path);

    // Inject footer
    const footerPlaceholder = document.getElementById("site-footer");
    if (footerPlaceholder) footerPlaceholder.outerHTML = buildFooter();

    /* ---------- Language switcher ---------- */
    const switcher = document.getElementById("langSwitcher");
    const btn = document.getElementById("langBtn");
    if (btn && switcher) {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        switcher.classList.toggle("open");
      });
      document.addEventListener("click", () =>
        switcher.classList.remove("open"),
      );

      switcher.querySelectorAll(".lang-option").forEach((opt) => {
        opt.addEventListener("click", () => {
          if (window.i18n) window.i18n.setLanguage(opt.dataset.lang);
          switcher.classList.remove("open");
        });
      });
    }

    /* ---------- Theme toggle ---------- */
    const themeBtn = document.getElementById("themeToggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.mknTheme && typeof window.mknTheme.toggle === "function") {
          window.mknTheme.toggle();
        } else {
          // Fallback if theme.js not loaded yet
          const html = document.documentElement;
          const current = html.getAttribute("data-theme") || "light";
          const next = current === "dark" ? "light" : "dark";
          html.setAttribute("data-theme", next);
          try {
            localStorage.setItem("mkn-theme", next);
          } catch (err) {}
          const icon = themeBtn.querySelector(".theme-icon");
          if (icon) icon.textContent = next === "dark" ? "☀️" : "🌙";
        }
      });

      // Sync icon with current theme
      if (window.mknTheme && typeof window.mknTheme.get === "function") {
        const currentTheme = window.mknTheme.get();
        const icon = themeBtn.querySelector(".theme-icon");
        if (icon) icon.textContent = currentTheme === "dark" ? "☀️" : "🌙";
      }
    }

    /* ---------- Mobile menu ---------- */
    const toggle = document.getElementById("menuToggle");
    const links = document.getElementById("navLinks");
    if (toggle && links) {
      toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        links.classList.toggle("open");
        // Animate hamburger
        toggle.classList.toggle("open");
      });
      links.querySelectorAll("a").forEach((a) =>
        a.addEventListener("click", () => {
          links.classList.remove("open");
          toggle.classList.remove("open");
        }),
      );
    }

    /* ---------- Nav scroll shadow ---------- */
    const nav = document.getElementById("nav");
    if (nav) {
      const onScroll = () =>
        nav.classList.toggle("scrolled", window.scrollY > 10);
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    /* ---------- Listen to theme change event (sync icon) ---------- */
    window.addEventListener("themechange", (e) => {
      const theme = e.detail && e.detail.theme;
      const icon = document.querySelector(".theme-toggle .theme-icon");
      if (icon) icon.textContent = theme === "dark" ? "☀️" : "🌙";
    });
  }

  /* ============================================================
     4) EXPORT
     ============================================================ */
  window.initLayout = initLayout;
})();
