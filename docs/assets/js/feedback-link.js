(function () {
  window._feedbackEnhancerLoaded = true;

  function getQuestion() {
    const h1 =
      document.querySelector('article h1') ||
      document.querySelector('.md-content__inner h1') ||
      document.querySelector('.md-typeset h1');
    return h1 ? h1.textContent.trim() : '';
  }

function getCategory() {
  // 1) Breadcrumb via data attribute (works on recent Material)
  const bcModern = document.querySelector('[data-md-component="breadcrumb"]');
  if (bcModern) {
    // usually: Home › Category › Page — we want the second-to-last item
    const items = bcModern.querySelectorAll('li, .md-breadcrumb__item');
    if (items.length >= 2) {
      const node =
        items[items.length - 2].querySelector('a, span, .md-ellipsis') ||
        items[items.length - 2];
      const txt = node.textContent.trim();
      if (txt) return txt;
    }
  }

  // 2) Active sidebar section title
  // Find the active page link in the primary nav
  const activeLink =
    document.querySelector('.md-nav--primary .md-nav__link--active') ||
    document.querySelector('.md-nav--primary .md-nav__item--active > .md-nav__link');

  if (activeLink) {
    // Walk up to find the nearest ancestor section (md-nav__item) that has a label or link as its heading
    let sec = activeLink.closest('.md-nav__item');
    while (sec) {
      // Prefer a section label (collapsible section header)
      const label =
        sec.querySelector(':scope > label .md-nav__link') || // old markup pattern
        sec.querySelector(':scope > label .md-ellipsis') ||
        sec.querySelector(':scope > label') ||
        sec.querySelector(':scope > .md-nav__link');

      if (label) {
        const txt = label.textContent.trim();
        if (txt) return txt;
      }
      // Move up to the parent section
      sec = sec.parentElement ? sec.parentElement.closest('.md-nav__item') : null;
    }
  }

  // 3) Derive from URL: /categories/<slug>/...
  const m = location.pathname.match(/\/categories\/([^/]+)/);
  if (m) {
    const slug = decodeURIComponent(m[1]);
    // prettify slug -> Title Case, keep your hyphens/commas where relevant
    const titleized = slug
      .replace(/-/g, ' ')
      .replace(/\b(\w)/g, (s) => s.toUpperCase())
      .trim();
    if (titleized) return titleized;
  }

  // 4) Legacy breadcrumb (your original nth-child approach)
  const legacy = document.querySelector(
    '.md-breadcrumb li:nth-child(2) a, .md-breadcrumb li:nth-child(2) span'
  );
  if (legacy && legacy.textContent.trim()) return legacy.textContent.trim();

  return '';
}

  function enhanceFeedbackLinks() {
    const question = getQuestion();
    if (!question) return;

    const category = getCategory();
    const links = document.querySelectorAll(
      '.admonition.help-feedback a[href], .help-feedback a[href]'
    );
    if (!links.length) return;
    links.forEach((a) => {
      // Skip if already processed
      if (a.dataset.postEnhanced === '1') return;
      a.dataset.postEnhanced = '1';

      a.addEventListener('click', (ev) => {
        const rawHref = a.getAttribute('href');
alert("rawHref: " + rawHref);
        if (!rawHref) return;

        let url;
        try {
          url = new URL(rawHref, window.location.origin);
          const TARGET_HOST = 'dieselsubs.com'; // or use location.host to force current site
          url = new URL(url.pathname + url.search + url.hash, 'https://' + TARGET_HOST);
          form.action = url.toString();
alert("form.action: " + form.action);
        } catch {
          return; // malformed href — let browser handle
        }

        // Build a POST form
        ev.preventDefault();

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = url.origin + url.pathname;

        // Respect target (e.g., _blank)
        const tgt = a.getAttribute('target');
        if (tgt) form.setAttribute('target', tgt);

        // 1) Add our fields
        const addField = (name, value) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = name;
          input.value = value;
          form.appendChild(input);
        };
        addField('question', question);
        if (category) addField('category', category);

        // 2) Convert any existing query params on the link to POST fields too
        const params = new URLSearchParams(url.search);
        params.forEach((v, k) => {
          // If question/category already set, don't overwrite
          if ((k === 'question' && question) || (k === 'category' && category)) return;
          addField(k, v);
        });

        // 3) If there’s a hash, pass it along as a field (optional)
        if (url.hash) addField('_hash', url.hash.substring(1));

        document.body.appendChild(form);
alert(category);
alert ("url: " + url.origin + url.pathname + "\nquestion: " + question + "\ncategory: " + category);
        form.submit();
      });
    });
  }

  if (window.document$ && typeof document$.subscribe === 'function') {
    document$.subscribe(() => requestAnimationFrame(enhanceFeedbackLinks));
  } else {
    document.addEventListener('DOMContentLoaded', () =>
      requestAnimationFrame(enhanceFeedbackLinks)
    );
  }
  setTimeout(enhanceFeedbackLinks, 300);
})();