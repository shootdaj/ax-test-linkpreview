/**
 * Validate and normalize a URL for preview fetching.
 * @param {string|undefined} url - The URL to validate
 * @returns {{ valid: boolean, url?: string, error?: string }}
 */
function validateUrl(url) {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required' };
  }

  const trimmedUrl = url.trim();

  if (trimmedUrl.length === 0) {
    return { valid: false, error: 'URL is required' };
  }

  if (trimmedUrl.length > 2048) {
    return { valid: false, error: 'URL is too long (max 2048 characters)' };
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(trimmedUrl);
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return { valid: false, error: 'Only HTTP and HTTPS URLs are supported' };
  }

  // Block private/internal IPs
  const hostname = parsedUrl.hostname;
  if (isPrivateHostname(hostname)) {
    return { valid: false, error: 'URLs pointing to private/internal networks are not allowed' };
  }

  return { valid: true, url: trimmedUrl };
}

/**
 * Check if a hostname resolves to a private/internal address.
 */
function isPrivateHostname(hostname) {
  const privatePatterns = [
    /^localhost$/i,
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^192\.168\./,
    /^0\./,
    /^169\.254\./,
    /^\[::1\]$/,
    /^\[fc/i,
    /^\[fd/i,
    /^\[fe80:/i,
  ];

  return privatePatterns.some(pattern => pattern.test(hostname));
}

module.exports = { validateUrl, isPrivateHostname };
