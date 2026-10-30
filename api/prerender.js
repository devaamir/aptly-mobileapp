/**
 * Vercel Serverless Function: Prerender.io middleware
 *
 * Routes bot/crawler requests through prerender.io to serve pre-rendered HTML.
 * Regular browser requests never reach this function — they are served the
 * static SPA directly by Vercel's CDN via the fallback rewrite in vercel.json.
 *
 * The vercel.json `has` condition on user-agent routes only bot traffic here.
 */

const PRERENDER_TOKEN = process.env.PRERENDER_TOKEN;
const PRERENDER_SERVICE_URL = 'https://service.prerender.io';

// List of bot/crawler user-agents that should receive pre-rendered HTML.
// This mirrors what the standard prerender middleware detects.
const BOT_USER_AGENTS = [
  'googlebot',
  'bingbot',
  'yandexbot',
  'duckduckbot',
  'slurp',           // Yahoo
  'baiduspider',
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'whatsapp',
  'applebot',
  'semrushbot',
  'ahrefsbot',
  'mj12bot',
  'gptbot',          // OpenAI crawler
  'claudebot',       // Anthropic crawler
  'chatgpt-user',
  'ccbot',
  'ia_archiver',     // Wayback Machine
  // NOTE: do NOT add 'prerender' here — prerender.io's own rendering bot must be served
  // the raw SPA (not routed back through this API), otherwise it creates an infinite loop.
];

function isBot(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some((bot) => ua.includes(bot));
}

module.exports = async function handler(req, res) {
  const userAgent = req.headers['user-agent'] || '';

  // Double-check: only serve pre-rendered content to bots.
  // (The vercel.json `has` condition already filters, but belt-and-suspenders.)
  if (!isBot(userAgent)) {
    // Not a bot — redirect to the SPA's index.html
    res.setHeader('Location', '/');
    res.status(302).end();
    return;
  }

  // Build the full URL of the page the bot is requesting
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'app.aptly.care';
  const requestUrl = req.query.url || req.url;

  // Extract the original path from the rewrite query parameter.
  // vercel.json rewrites the original path as ?url=<path> via the destination.
  let pagePath = req.query.url || '/';
  if (!pagePath.startsWith('/')) pagePath = '/' + pagePath;

  const fullUrl = `${protocol}://${host}${pagePath}`;
  const prerenderUrl = `${PRERENDER_SERVICE_URL}/${fullUrl}`;

  // Use an 8s timeout — safely under Vercel Hobby's 10s function limit.
  // If prerender.io hasn't cached the page yet (cold render takes 15-30s),
  // we fall back to the raw index.html so the user/bot still gets a response.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(prerenderUrl, {
      signal: controller.signal,
      headers: {
        'X-Prerender-Token': PRERENDER_TOKEN,
        'User-Agent': userAgent,
      },
    });
    clearTimeout(timeoutId);

    const html = await response.text();

    // Forward relevant headers from prerender.io
    const contentType = response.headers.get('content-type');
    if (contentType) res.setHeader('Content-Type', contentType);

    // Add x-prerender header so you can verify it's working
    res.setHeader('X-Prerendered', 'true');

    // Cache the pre-rendered page for 1 hour at the CDN level
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');

    res.status(response.status).send(html);
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      // Prerender.io is doing a cold render (first time seeing this URL).
      // It will cache the result — next bot visit will be fast.
      // For now, serve a minimal HTML shell so the bot gets a valid 200.
      console.log('[prerender] Cold render timeout for:', fullUrl, '— serving fallback');
    } else {
      console.error('[prerender] Error fetching from prerender.io:', err.message);
    }

    // Fallback: redirect bot to the raw SPA (index.html).
    // The bot will re-crawl later when the page is cached in prerender.io.
    res.setHeader('X-Prerendered', 'fallback');
    res.setHeader('Location', pagePath);
    res.status(302).end();
  }
};
