/* ============================================================
   LAYOUT — Shared Navbar + Footer (Full Version)
   Malka Nono Islamic Affairs Council Project
   ------------------------------------------------------------
   Features:
   - Injects navbar at <div id="site-nav">
   - Injects footer at <div id="site-footer">
   - Theme toggle (dark / light) with localStorage
   - Language switcher (EN / AM / OM / AR) with dropdown
   - Mobile hamburger menu
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
          `<li>
            <a href="${l.href}" class="${activePage === l.href ? "active" : ""}">
              <span class="nav-icon">${l.icon}</span>
              <span data-i18n="${l.key}"></span>
            </a>
          </li>`,
      )
      .join("");

    return `
      <nav class="nav" id="nav">
        <div class="nav-inner">

          <!-- Brand -->
          <a href="index.html" class="brand">
            <div class="brand-mark">☪</div>
            <div class="brand-text">
              <span data-i18n="brand.name"></span>
              <small data-i18n="brand.sub"></small>
            </div>
          </a>

          <!-- Navigation links -->
          <ul class="nav-links" id="navLinks">${linksHTML}</ul>

          <!-- Controls (theme + lang + mobile menu) -->
          <div class="nav-controls" id="navControls">

            <!-- Theme toggle -->
            <button class="theme-toggle-btn" id="themeToggle" aria-label="Toggle dark mode" title="Dark mode">🌙</button>

            <!-- Language switcher -->
            <div class="lang-switcher" id="langSwitcher">
              <button class="lang-btn" id="langBtn" aria-label="Change language">
                <span class="lang-current">AM</span>
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

            <!-- Mobile menu toggle -->
            <button class="menu-toggle" id="menuToggle" aria-label="Menu">
              <span></span><span></span><span></span>
            </button>

          </div>

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

          <!-- Column 1: Brand + description -->
          <div>
            <div class="footer-brand">
              <div class="brand-mark">☪</div>
              <span data-i18n="brand.name"></span>
            </div>
            <p style="max-width:420px;" data-i18n="footer.desc"></p>
          </div>

          <!-- Column 2: Navigation links -->
          <div>
            <h4 data-i18n="footer.dir"></h4>
            <a href="about.html"       data-i18n="nav.about"></a>
            <a href="leadership.html"  data-i18n="nav.leadership"></a>
            <a href="budget.html"      data-i18n="nav.budget"></a>
            <a href="fundraising.html" data-i18n="nav.fundraising"></a>
            <a href="news.html"        data-i18n="nav.news"></a>
          </div>

          <!-- Column 3: Address -->
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
     3) INIT LAYOUT
     ============================================================ */
  function initLayout() {
    // Detect current page filename (e.g. "about.html")
    const path = window.location.pathname.split("/").pop() || "index.html";

    /* ---- Inject Navbar ---- */
    const navPlaceholder = document.getElementById("site-nav");
    if (navPlaceholder) navPlaceholder.outerHTML = buildNav(path);

    /* ---- Inject Footer ---- */
    const footerPlaceholder = document.getElementById("site-footer");
    if (footerPlaceholder) footerPlaceholder.outerHTML = buildFooter();

    /* ============================================================
       THEME TOGGLE (dark / light)
       ============================================================ */
    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
      // Load saved preference
      const savedTheme = localStorage.getItem("mkn-theme");
      if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
        themeToggle.textContent = "☀️";
      }

      themeToggle.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isDark = document.body.classList.toggle("dark-mode");
        themeToggle.textContent = isDark ? "☀️" : "🌙";
        localStorage.setItem("mkn-theme", isDark ? "dark" : "light");
      });
    }

    /* ============================================================
       LANGUAGE SWITCHER
       ============================================================ */
    const switcher = document.getElementById("langSwitcher");
    const btn = document.getElementById("langBtn");

    if (btn && switcher) {
      // Prevent double binding
      if (btn.dataset.bound !== "1") {
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
      }

      switcher.querySelectorAll(".lang-option").forEach((opt) => {
        if (opt.dataset.bound === "1") return;
        opt.dataset.bound = "1";

        opt.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          const lang = opt.dataset.lang;

          // Change language
          if (window.i18n && window.i18n.setLanguage) {
            window.i18n.setLanguage(lang);
          }

          // Update ALL language labels on the page
          document.querySelectorAll(".lang-current").forEach((el) => {
            el.textContent = lang.toUpperCase();
          });

          // Mark active
          switcher
            .querySelectorAll(".lang-option")
            .forEach((o) => o.classList.remove("active"));
          opt.classList.add("active");

          // Close dropdown
          switcher.classList.remove("open");
        });
      });

      // Close on outside click
      document.addEventListener("click", (e) => {
        if (!e.target.closest(".lang-switcher")) {
          document
            .querySelectorAll(".lang-switcher.open")
            .forEach((s) => s.classList.remove("open"));
        }
      });
    }

    /* ============================================================
       MOBILE MENU TOGGLE
       ============================================================ */
    const toggle = document.getElementById("menuToggle");
    const links = document.getElementById("navLinks");

    if (toggle && links) {
      if (toggle.dataset.bound !== "1") {
        toggle.dataset.bound = "1";
        toggle.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          links.classList.toggle("open");
          toggle.classList.toggle("open");
        });
      }

      // Close menu when a link is clicked (mobile)
      links.querySelectorAll("a").forEach((a) => {
        if (a.dataset.bound === "1") return;
        a.dataset.bound = "1";
        a.addEventListener("click", () => {
          links.classList.remove("open");
          toggle.classList.remove("open");
        });
      });

      // Close on outside click
      document.addEventListener("click", (e) => {
        if (!e.target.closest(".nav")) {
          links.classList.remove("open");
          toggle.classList.remove("open");
        }
      });
    }

    /* ============================================================
       NAV SCROLL SHADOW
       ============================================================ */
    const nav = document.getElementById("nav");
    if (nav) {
      const onScroll = () => {
        nav.classList.toggle("scrolled", window.scrollY > 10);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    /* ============================================================
       SYNC INITIAL LANG LABEL
       ============================================================ */
    setTimeout(() => {
      const currentLang =
        window.i18n && window.i18n.getLang ? window.i18n.getLang() : "am";

      document.querySelectorAll(".lang-current").forEach((el) => {
        el.textContent = currentLang.toUpperCase();
      });

      // Mark active option in dropdown
      if (switcher) {
        switcher.querySelectorAll(".lang-option").forEach((opt) => {
          opt.classList.toggle("active", opt.dataset.lang === currentLang);
        });
      }
    }, 80);

    /* ============================================================
       LOG
       ============================================================ */
    console.log("[Layout] ✓ Navbar + Footer initialized");
  }

  /* ============================================================
     4) EXPORT
     ============================================================ */
  window.initLayout = initLayout;
})();
