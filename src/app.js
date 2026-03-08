const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const { fetchMetadata } = require('./metadata');
const { validateUrl } = require('./validation');
const { createRateLimiter } = require('./rate-limiter');

const app = express();

// Security headers via Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'https:', 'http:', 'data:'],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS
app.use(cors({
  origin: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  maxAge: 86400,
}));

// Parse JSON bodies with size limit
app.use(express.json({ limit: '5kb' }));

// Rate limiting for API endpoints
const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30,
});

// Serve static files from public/
app.use(express.static(path.join(__dirname, '..', 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Preview API endpoint
app.post('/api/preview', apiLimiter, async (req, res) => {
  try {
    const { url } = req.body;

    // Validate URL
    const validation = validateUrl(url);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const metadata = await fetchMetadata(validation.url, { timeout: 10000 });
    res.json(metadata);
  } catch (error) {
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'Request timed out while fetching URL' });
    }
    res.status(502).json({ error: `Failed to fetch URL: ${error.message}` });
  }
});

module.exports = app;
