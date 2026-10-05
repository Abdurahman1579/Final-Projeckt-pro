(function(){
  const STORAGE_KEY = 'malka-nono-lang';
  const DEFAULT_LANG = 'am'; // Amharic by default

  let currentLang = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  if (!translations[currentLang]) currentLang = DEFAULT_LANG;

  function t(key) {
    return (translations[currentLang] && translations[currentLang][key])
        || (translations.en && translations.en[key])
        || key;
  }

  function applyTranslations(root = document) {
    root.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = t(key);
      if (val) el.textContent = val;
    });
    root.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = t(key);
      if (val) el.setAttribute('placeholder', val);
    });
  }

  function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);

    const meta = LANG_META[lang] || LANG_META.en;
    document.documentElement.lang = lang;
    document.documentElement.dir = meta.dir;

    applyTranslations();

    // Update lang switcher UI
    document.querySelectorAll('.lang-option').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    const currentLabel = document.querySelector('.lang-current');
    if (currentLabel) {
      currentLabel.textContent = lang.toUpperCase();
    }

    // Dispatch event for other scripts
    window.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  }

  // Live translation — auto-translate newly added content
  function observeChanges() {
    const observer = new MutationObserver((mutations) => {
      let needsUpdate = false;
      mutations.forEach(m => {
        m.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            if (node.hasAttribute && (node.hasAttribute('data-i18n') || node.hasAttribute('data-i18n-placeholder'))) {
              needsUpdate = true;
            } else if (node.querySelector && node.querySelector('[data-i18n]')) {
              needsUpdate = true;
            }
          }
        });
      });
      if (needsUpdate) applyTranslations();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Init
  function init() {
    document.body.setAttribute('data-i18n-loading', 'true');
    applyTranslations();
    setLanguage(currentLang);
    observeChanges();
    setTimeout(() => document.body.removeAttribute('data-i18n-loading'), 30);
  }

  // Expose API
  window.i18n = { t, setLanguage, applyTranslations, getLang: () => currentLang, LANG_META };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();