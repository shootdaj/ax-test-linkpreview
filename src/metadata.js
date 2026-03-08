const cheerio = require('cheerio');

/**
 * Extract metadata from HTML content for a given URL.
 * @param {string} html - Raw HTML content
 * @param {string} url - The original URL (used for resolving relative paths)
 * @returns {object} Extracted metadata
 */
function extractMetadata(html, url) {
  const $ = cheerio.load(html);
  const parsedUrl = new URL(url);
  const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;

  const title = getTitle($);
  const description = getDescription($);
  const image = getImage($, baseUrl);
  const favicon = getFavicon($, baseUrl);
  const siteName = getSiteName($, parsedUrl.hostname);
  const domain = parsedUrl.hostname;

  return {
    url,
    title,
    description,
    image,
    favicon,
    siteName,
    domain,
  };
}

function getTitle($) {
  // Prefer OG title, then <title> tag
  const ogTitle = $('meta[property="og:title"]').attr('content');
  if (ogTitle) return ogTitle.trim();

  const twitterTitle = $('meta[name="twitter:title"]').attr('content');
  if (twitterTitle) return twitterTitle.trim();

  const titleTag = $('title').first().text();
  if (titleTag) return titleTag.trim();

  return null;
}

function getDescription($) {
  const ogDesc = $('meta[property="og:description"]').attr('content');
  if (ogDesc) return ogDesc.trim();

  const twitterDesc = $('meta[name="twitter:description"]').attr('content');
  if (twitterDesc) return twitterDesc.trim();

  const metaDesc = $('meta[name="description"]').attr('content');
  if (metaDesc) return metaDesc.trim();

  return null;
}

function getImage($, baseUrl) {
  const ogImage = $('meta[property="og:image"]').attr('content');
  if (ogImage) return resolveUrl(ogImage, baseUrl);

  const twitterImage = $('meta[name="twitter:image"]').attr('content');
  if (twitterImage) return resolveUrl(twitterImage, baseUrl);

  return null;
}

function getFavicon($, baseUrl) {
  // Check various favicon link tags
  const iconSelectors = [
    'link[rel="icon"]',
    'link[rel="shortcut icon"]',
    'link[rel="apple-touch-icon"]',
    'link[rel="apple-touch-icon-precomposed"]',
  ];

  for (const selector of iconSelectors) {
    const href = $(selector).attr('href');
    if (href) return resolveUrl(href, baseUrl);
  }

  // Default favicon location
  return `${baseUrl}/favicon.ico`;
}

function getSiteName($, hostname) {
  const ogSiteName = $('meta[property="og:site_name"]').attr('content');
  if (ogSiteName) return ogSiteName.trim();

  // Derive from hostname: remove www. prefix
  return hostname.replace(/^www\./, '');
}

/**
 * Resolve a potentially relative URL against a base URL.
 */
function resolveUrl(href, baseUrl) {
  if (!href) return null;
  if (href.startsWith('http://') || href.startsWith('https://')) return href;
  if (href.startsWith('//')) return `https:${href}`;
  if (href.startsWith('/')) return `${baseUrl}${href}`;
  return `${baseUrl}/${href}`;
}

/**
 * Fetch a URL and extract its metadata.
 * @param {string} url - URL to fetch
 * @param {object} options - Fetch options
 * @param {number} options.timeout - Timeout in milliseconds (default: 10000)
 * @returns {Promise<object>} Extracted metadata
 */
async function fetchMetadata(url, options = {}) {
  const timeout = options.timeout || 10000;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'LinkPreviewBot/1.0 (+https://github.com/shootdaj/ax-test-linkpreview)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      throw new Error(`Unsupported content type: ${contentType}`);
    }

    const html = await response.text();

    // Limit HTML processing to first 500KB to avoid memory issues
    const truncatedHtml = html.slice(0, 512 * 1024);

    return extractMetadata(truncatedHtml, url);
  } finally {
    clearTimeout(timer);
  }
}

module.exports = {
  extractMetadata,
  fetchMetadata,
  // Export helpers for testing
  getTitle,
  getDescription,
  getImage,
  getFavicon,
  getSiteName,
  resolveUrl,
};
