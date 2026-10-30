/**
 * Signal to prerender.io that the page has finished rendering.
 *
 * prerender.io waits for `window.prerenderReady === true` before taking
 * a snapshot (because we set `window.prerenderReady = false` in index.web.js).
 * Call this once the screen's main content has loaded.
 *
 * Safe to call on React Native (no-op if window is not defined).
 */
export function signalPrerenderReady(): void {
  if (typeof window !== 'undefined') {
    (window as any).prerenderReady = true;
  }
}
