import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';

describe('API Integration Tests', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.timestamp).toBeDefined();
    });
  });

  describe('POST /api/preview', () => {
    it('should return 400 when no URL provided', async () => {
      const res = await request(app)
        .post('/api/preview')
        .send({})
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('URL is required');
    });

    it('should return 400 for invalid URL format', async () => {
      const res = await request(app)
        .post('/api/preview')
        .send({ url: 'not-a-url' })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid URL format');
    });

    it('should return 400 for non-HTTP URLs', async () => {
      const res = await request(app)
        .post('/api/preview')
        .send({ url: 'ftp://files.example.com/doc.pdf' })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Only HTTP and HTTPS URLs are supported');
    });

    it('should return 502 for unreachable URLs', async () => {
      const res = await request(app)
        .post('/api/preview')
        .send({ url: 'https://this-domain-does-not-exist-xyz123.com' })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(502);
      expect(res.body.error).toContain('Failed to fetch URL');
    }, 15000);

    it('should successfully fetch metadata from a real URL', async () => {
      const res = await request(app)
        .post('/api/preview')
        .send({ url: 'https://example.com' })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(200);
      expect(res.body.url).toBe('https://example.com');
      expect(res.body.title).toBeDefined();
      expect(res.body.domain).toBe('example.com');
    }, 15000);
  });
});
