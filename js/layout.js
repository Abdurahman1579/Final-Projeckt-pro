/* ============================================================
   LAYOUT — Shared Navbar + Footer
   Malka Nono Islamic Affairs Council Project
   ------------------------------------------------------------
   - Injects navbar at <div id="site-nav">
   - Injects footer at <div id="site-footer">
   - Handles language switcher, mobile menu, nav scroll shadow
   - Brand: single-line name only (no subtitle)
   - Breakpoint: 1100px (laptop-friendly for Oromo)
   ============================================================ */

(function () {
  "use strict";

  const MOBILE_BREAKPOINT = 1100; // matches CSS media query

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
            </div>
          </a>
          <ul class="nav-links" id="navLinks">${linksHTML}</ul>
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
          <button class="menu-toggle" id="menuToggle" aria-label="Menu" aria-expanded="false">
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
     3) MOBILE MENU CONTROLLER
     ============================================================ */
  function setupMobileMenu() {
    const toggle = document.getElementById("menuToggle");
    const links = document.getElementById("navLinks");
    if (!toggle || !links) return;

    function closeMenu() {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }

    function openMenu() {
      links.classList.add("open");
      toggle.setAttribute("aria-expanded", "true");
      if (window.innerWidth <= MOBILE_BREAKPOINT) {
        document.body.style.overflow = "hidden";
      }
    }

    // Toggle button
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      if (links.classList.contains("open")) closeMenu();
      else openMenu();
    });

    // Close on link click
    links
      .querySelectorAll("a")
      .forEach((a) => a.addEventListener("click", closeMenu));

    // Close when clicking outside
    document.addEventListener("click", (e) => {
      if (!links.classList.contains("open")) return;
      if (links.contains(e.target) || toggle.contains(e.target)) return;
      closeMenu();
    });

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && links.classList.contains("open")) closeMenu();
    });

    // Close on resize to desktop
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (
          window.innerWidth > MOBILE_BREAKPOINT &&
          links.classList.contains("open")
        ) {
          closeMenu();
        }
      }, 200);
    });

    // Close when language changes (menu should reset)
    window.addEventListener("langchange", () => {
      if (links.classList.contains("open")) closeMenu();
    });
  }

  /* ============================================================
     4) LANGUAGE SWITCHER
     ============================================================ */
  function setupLangSwitcher() {
    const switcher = document.getElementById("langSwitcher");
    const btn = document.getElementById("langBtn");
    if (!btn || !switcher) return;

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      switcher.classList.toggle("open");
    });

    document.addEventListener("click", () => switcher.classList.remove("open"));

    switcher.querySelectorAll(".lang-option").forEach((opt) => {
      opt.addEventListener("click", () => {
        if (window.i18n) window.i18n.setLanguage(opt.dataset.lang);
        switcher.classList.remove("open");
      });
    });
  }

  /* ============================================================
     5) NAV SCROLL SHADOW
     ============================================================ */
  function setupNavScroll() {
    const nav = document.getElementById("nav");
    if (!nav) return;
    const onScroll = () =>
      nav.classList.toggle("scrolled", window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ============================================================
     6) INIT
     ============================================================ */
  function initLayout() {
    const path = window.location.pathname.split("/").pop() || "index.html";

    // Inject navbar
    const navPlaceholder = document.getElementById("site-nav");
    if (navPlaceholder) navPlaceholder.outerHTML = buildNav(path);

    // Inject footer
    const footerPlaceholder = document.getElementById("site-footer");
    if (footerPlaceholder) footerPlaceholder.outerHTML = buildFooter();

    // Setup interactions
    setupLangSwitcher();
    setupMobileMenu();
    setupNavScroll();

    // Re-apply translations after injecting nav/footer
    if (window.i18n && window.i18n.applyTranslations) {
      setTimeout(() => window.i18n.applyTranslations(), 30);
    }
  }

  /* ============================================================
     7) EXPORT
     ============================================================ */
  window.initLayout = initLayout;
})();
