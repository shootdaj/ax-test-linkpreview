const express = require('express');
const path = require('path');
const { fetchMetadata } = require('./metadata');

const app = express();

// Parse JSON bodies with size limit
app.use(express.json({ limit: '1kb' }));

// Serve static files from public/
app.use(express.static(path.join(__dirname, '..', 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Preview API endpoint
app.post('/api/preview', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Basic URL validation
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return res.status(400).json({ error: 'Only HTTP and HTTPS URLs are supported' });
    }

    const metadata = await fetchMetadata(url);
    res.json(metadata);
  } catch (error) {
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'Request timed out while fetching URL' });
    }
    res.status(502).json({ error: `Failed to fetch URL: ${error.message}` });
  }
});

module.exports = app;
