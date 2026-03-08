/**
 * Simple in-memory rate limiter (per-IP).
 * Suitable for single-instance deployments. For multi-instance,
 * use Redis-backed rate limiting.
 */

/**
 * Create a rate limiter middleware.
 * @param {object} options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.maxRequests - Max requests per window per IP
 * @returns {Function} Express middleware
 */
function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || 60000;
  const maxRequests = options.maxRequests || 30;

  const store = new Map();

  // Clean up expired entries periodically
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now - record.windowStart > windowMs) {
        store.delete(key);
      }
    }
  }, windowMs);

  // Allow process to exit cleanly
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return function rateLimiterMiddleware(req, res, next) {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const now = Date.now();

    let record = store.get(ip);

    if (!record || now - record.windowStart > windowMs) {
      // Start new window
      record = { count: 1, windowStart: now };
      store.set(ip, record);
    } else {
      record.count++;
    }

    // Set rate limit headers
    res.set('X-RateLimit-Limit', String(maxRequests));
    res.set('X-RateLimit-Remaining', String(Math.max(0, maxRequests - record.count)));
    res.set('X-RateLimit-Reset', String(Math.ceil((record.windowStart + windowMs) / 1000)));

    if (record.count > maxRequests) {
      return res.status(429).json({
        error: 'Too many requests. Please try again later.',
      });
    }

    next();
  };
}

module.exports = { createRateLimiter };
