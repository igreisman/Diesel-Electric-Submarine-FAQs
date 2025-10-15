<script>
  (function () {
    // --- Helper: extract current page's main question title ---
    function getQuestion() {
      const h1 =
        document.querySelector('article h1') ||
        document.querySelector('.md-content__inner h1') ||
        document.querySelector('.md-typeset h1');
      return h1 ? h1.textContent.trim() : '';
    }

  // --- Helper: extract category from breadcrumb or sidebar ---
  function getCategory() {
    // 1) Breadcrumb (modern Material builds)
    const bc = document.querySelector('[data-md-component="breadcrumb"]');
  if (bc) {
      const items = bc.querySelectorAll('li, .md-breadcrumb__item');
      if (items.length >= 2) {
        const node =
  items[items.length - 2].querySelector('a, span, .md-ellipsis') ||
  items[items.length - 2];
  const txt = node && node.textContent ? node.textContent.trim() : '';
  if (txt) return txt;
      }
    }

  // 2) Fallback: active link in sidebar section
  const active = document.querySelector('.md-nav__link--active');
  if (active) {
      const section = active.closest('.md-nav__item');
  if (section) {
        const label =
          section.querySelector('> .md-nav__link .md-ellipsis') ||
          section.querySelector('> .md-nav__link');
  if (label && label.textContent) return label.textContent.trim();
      }
    }
  return '';
  }

  // --- Build full URL to feedback form ---
  function buildUrl() {
    const question = getQuestion();
  const category = getCategory();
  const url = new URL('https://dieselsubs.com/index.php');
  if (question) url.searchParams.set('question', question);
  if (category) url.searchParams.set('category', category);
  return url.toString();
  }

  // Decide whether a link is "the" feedback link we want to rewrite
  function isFeedbackLink(a) {
    if (!a || !a.href) return false;

  const text = (a.textContent || '').toLowerCase().trim();
  const href = a.getAttribute('href') || '';

  // Visible text check
  const looksLikeClickHere = text.includes('click here');

  // Placeholder/known targets we want to overwrite
  const looksLikePlaceholder =
  href.includes('other.example.com/feedback') ||
  href.includes('dieselsubs.com/index.php') ||
  href === '#' || href === '';

  return looksLikeClickHere || looksLikePlaceholder;
  }

  // --- Update all likely feedback links in the content area ---
  function updateFeedbackLinks() {
    const targetUrl = buildUrl();

  // 1) Preferred: the custom help-feedback admonition
  const candidates = Array.from(
  document.querySelectorAll('.admonition.help-feedback a')
  );

  // 2) Fallbacks: any "Click here" anchors in article content
  if (candidates.length === 0) {
    candidates.push(
      ...document.querySelectorAll('article a, .md-content__inner a, .md-typeset a')
    );
    }

  let updated = 0;
  for (const a of candidates) {
      if (!isFeedbackLink(a)) continue;
  a.setAttribute('href', targetUrl);

  // Open behavior (choose ONE)
  a.setAttribute('target', '_self');    // same tab
  // a.setAttribute('target', '_blank'); // new tab (uncomment if desired)
  a.setAttribute('rel', 'noopener');

  updated++;
    }

    // Optional: uncomment to debug counts
    // console.debug('[feedback-link] updated anchors:', updated, 'url:', targetUrl);
  }

  // --- Legacy: if you still keep a dummy nav link, rewrite it too ---
  function updateLegacyNavLink() {
    const a = document.querySelector('.md-nav__item a[href="#"]');
  if (!a) return;
  a.href = buildUrl();
  a.target = '_self';
  a.rel = 'noopener';
  }

  function init() {
    updateFeedbackLinks();
  updateLegacyNavLink();
  }

  // Run on initial load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  // Re-run on every page navigation (Material SPA)
  if (window.document$) {
    window.document$.subscribe(init);
  }
})();
</script>