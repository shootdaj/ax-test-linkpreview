import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRateLimiter } from './rate-limiter.js';

describe('createRateLimiter', () => {
  let limiter;
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    limiter = createRateLimiter({ windowMs: 60000, maxRequests: 3 });
    mockReq = { ip: '127.0.0.1' };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      set: vi.fn(),
    };
    mockNext = vi.fn();
  });

  it('should allow requests under the limit', () => {
    limiter(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should set rate limit headers', () => {
    limiter(mockReq, mockRes, mockNext);
    expect(mockRes.set).toHaveBeenCalledWith('X-RateLimit-Limit', '3');
    expect(mockRes.set).toHaveBeenCalledWith('X-RateLimit-Remaining', '2');
  });

  it('should block requests over the limit', () => {
    // Make 3 requests (all allowed)
    for (let i = 0; i < 3; i++) {
      const next = vi.fn();
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis(), set: vi.fn() };
      limiter(mockReq, res, next);
      expect(next).toHaveBeenCalled();
    }

    // 4th request should be blocked
    limiter(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(429);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Too many requests. Please try again later.',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should track different IPs separately', () => {
    const req1 = { ip: '1.1.1.1' };
    const req2 = { ip: '2.2.2.2' };

    // Exhaust limit for IP 1
    for (let i = 0; i < 4; i++) {
      const next = vi.fn();
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis(), set: vi.fn() };
      limiter(req1, res, next);
    }

    // IP 2 should still be allowed
    const next = vi.fn();
    limiter(req2, mockRes, next);
    expect(next).toHaveBeenCalled();
  });

  it('should decrement remaining count', () => {
    const res1 = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis(), set: vi.fn() };
    limiter(mockReq, res1, vi.fn());
    expect(res1.set).toHaveBeenCalledWith('X-RateLimit-Remaining', '2');

    const res2 = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis(), set: vi.fn() };
    limiter(mockReq, res2, vi.fn());
    expect(res2.set).toHaveBeenCalledWith('X-RateLimit-Remaining', '1');

    const res3 = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis(), set: vi.fn() };
    limiter(mockReq, res3, vi.fn());
    expect(res3.set).toHaveBeenCalledWith('X-RateLimit-Remaining', '0');
  });
});
