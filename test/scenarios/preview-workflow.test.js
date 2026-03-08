import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';

describe('Preview Workflow Scenarios', () => {
  it('should complete full preview workflow: submit URL and get card data', async () => {
    // Step 1: Check health
    const healthRes = await request(app).get('/health');
    expect(healthRes.status).toBe(200);

    // Step 2: Submit a URL for preview
    const previewRes = await request(app)
      .post('/api/preview')
      .send({ url: 'https://example.com' })
      .set('Content-Type', 'application/json');

    expect(previewRes.status).toBe(200);
    expect(previewRes.body).toHaveProperty('title');
    expect(previewRes.body).toHaveProperty('domain', 'example.com');
    expect(previewRes.body).toHaveProperty('url', 'https://example.com');
    expect(previewRes.body).toHaveProperty('favicon');
  }, 15000);

  it('should serve the web UI at root', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.text).toContain('Link Preview');
    expect(res.text).toContain('preview-form');
    expect(res.text).toContain('url-input');
  });

  it('should serve static CSS', async () => {
    const res = await request(app).get('/styles.css');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/css');
  });

  it('should serve static JS', async () => {
    const res = await request(app).get('/app.js');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('javascript');
  });

  it('should handle error scenario gracefully', async () => {
    const res = await request(app)
      .post('/api/preview')
      .send({ url: 'https://this-domain-definitely-does-not-exist-abc.com' })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(502);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toContain('Failed to fetch URL');
  }, 15000);

  it('should handle invalid input scenario', async () => {
    // No URL
    const res1 = await request(app)
      .post('/api/preview')
      .send({})
      .set('Content-Type', 'application/json');
    expect(res1.status).toBe(400);
    expect(res1.body.error).toBe('URL is required');

    // Bad URL
    const res2 = await request(app)
      .post('/api/preview')
      .send({ url: 'not-a-valid-url' })
      .set('Content-Type', 'application/json');
    expect(res2.status).toBe(400);
    expect(res2.body.error).toBe('Invalid URL format');

    // Non-HTTP
    const res3 = await request(app)
      .post('/api/preview')
      .send({ url: 'ftp://example.com' })
      .set('Content-Type', 'application/json');
    expect(res3.status).toBe(400);
    expect(res3.body.error).toBe('Only HTTP and HTTPS URLs are supported');
  });
});
