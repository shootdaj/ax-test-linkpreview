import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';

describe('Security Integration Tests', () => {
  describe('Helmet Security Headers', () => {
    it('should set security headers on responses', async () => {
      const res = await request(app).get('/health');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    });
  });

  describe('CORS', () => {
    it('should include CORS headers', async () => {
      const res = await request(app)
        .options('/api/preview')
        .set('Origin', 'http://example.com')
        .set('Access-Control-Request-Method', 'POST');
      expect(res.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('Input Validation', () => {
    it('should reject private/internal URLs', async () => {
      const res = await request(app)
        .post('/api/preview')
        .send({ url: 'http://localhost:8080/admin' })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('private');
    });

    it('should reject localhost', async () => {
      const res = await request(app)
        .post('/api/preview')
        .send({ url: 'http://127.0.0.1/secret' })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(400);
    });

    it('should reject 10.x private IPs', async () => {
      const res = await request(app)
        .post('/api/preview')
        .send({ url: 'http://10.0.0.1/internal' })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(400);
    });

    it('should reject excessively long URLs', async () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(2040);
      const res = await request(app)
        .post('/api/preview')
        .send({ url: longUrl })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('too long');
    });
  });

  describe('Rate Limiting', () => {
    it('should include rate limit headers', async () => {
      const res = await request(app)
        .post('/api/preview')
        .send({ url: 'https://example.com' })
        .set('Content-Type', 'application/json');
      expect(res.headers['x-ratelimit-limit']).toBeDefined();
      expect(res.headers['x-ratelimit-remaining']).toBeDefined();
    });
  });
});
