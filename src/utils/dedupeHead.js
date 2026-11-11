/**
 * index.html ships default SEO tags (title, description, canonical, og/twitter)
 * marked with `data-static-seo`. Each screen adds its own through react-helmet,
 * which leaves the document with two titles, two descriptions and — worst — two
 * canonical links, one of them pointing every page at the homepage.
 *
 * This keeps exactly one of each: while a screen provides its own tag the static
 * one is detached, and it is put back when no screen provides one (so the head
 * is never left without a title / canonical). Web only.
 */
export function startHeadDedupe() {
  if (typeof document === 'undefined' || !document.head) return;

  const selectorFor = el => {
    if (el.tagName === 'TITLE') return 'title';
    if (el.tagName === 'LINK') return `link[rel="${el.getAttribute('rel')}"]`;
    const name = el.getAttribute('name');
    if (name) return `meta[name="${name}"]`;
    return `meta[property="${el.getAttribute('property')}"]`;
  };

  const items = Array.from(document.head.querySelectorAll('[data-static-seo]')).map(el => ({
    el,
    selector: selectorFor(el),
    parent: el.parentNode,
  }));

  const sync = () => {
    items.forEach(({ el, selector, parent }) => {
      const pageTags = Array.from(document.head.querySelectorAll(selector)).filter(
        n => n !== el && !n.hasAttribute('data-static-seo'),
      );
      if (pageTags.length > 0) {
        if (el.parentNode) el.remove();
      } else if (!el.parentNode) {
        parent.appendChild(el);
      }
    });
  };

  // og:url should always agree with the page's canonical link
  const syncOgUrl = () => {
    const canonical = document.head.querySelector('link[rel="canonical"]');
    const ogUrl = document.head.querySelector('meta[property="og:url"]');
    if (canonical && ogUrl && ogUrl.getAttribute('content') !== canonical.href) {
      ogUrl.setAttribute('content', canonical.href);
    }
  };

  const run = () => {
    sync();
    syncOgUrl();
  };

  new MutationObserver(run).observe(document.head, { childList: true });
  run();
}
