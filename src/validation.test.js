import { describe, it, expect } from 'vitest';
import { validateUrl, isPrivateHostname } from './validation.js';

describe('validateUrl', () => {
  it('should accept valid HTTP URLs', () => {
    const result = validateUrl('http://example.com');
    expect(result.valid).toBe(true);
    expect(result.url).toBe('http://example.com');
  });

  it('should accept valid HTTPS URLs', () => {
    const result = validateUrl('https://example.com/path?q=1');
    expect(result.valid).toBe(true);
  });

  it('should reject empty/missing URL', () => {
    expect(validateUrl(undefined).valid).toBe(false);
    expect(validateUrl(undefined).error).toBe('URL is required');

    expect(validateUrl('').valid).toBe(false);
    expect(validateUrl('   ').valid).toBe(false);

    expect(validateUrl(null).valid).toBe(false);
  });

  it('should reject non-string URL', () => {
    expect(validateUrl(123).valid).toBe(false);
    expect(validateUrl({}).valid).toBe(false);
  });

  it('should reject invalid URL format', () => {
    expect(validateUrl('not-a-url').valid).toBe(false);
    expect(validateUrl('not-a-url').error).toBe('Invalid URL format');
  });

  it('should reject non-HTTP protocols', () => {
    expect(validateUrl('ftp://example.com').valid).toBe(false);
    expect(validateUrl('ftp://example.com').error).toBe('Only HTTP and HTTPS URLs are supported');

    expect(validateUrl('file:///etc/passwd').valid).toBe(false);
    expect(validateUrl('javascript:alert(1)').valid).toBe(false);
  });

  it('should reject URLs longer than 2048 characters', () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(2040);
    expect(validateUrl(longUrl).valid).toBe(false);
    expect(validateUrl(longUrl).error).toBe('URL is too long (max 2048 characters)');
  });

  it('should reject private/internal URLs', () => {
    expect(validateUrl('http://localhost/admin').valid).toBe(false);
    expect(validateUrl('http://127.0.0.1/secret').valid).toBe(false);
    expect(validateUrl('http://10.0.0.1/internal').valid).toBe(false);
    expect(validateUrl('http://192.168.1.1/router').valid).toBe(false);
    expect(validateUrl('http://172.16.0.1/private').valid).toBe(false);
  });

  it('should trim whitespace from URLs', () => {
    const result = validateUrl('  https://example.com  ');
    expect(result.valid).toBe(true);
    expect(result.url).toBe('https://example.com');
  });
});

describe('isPrivateHostname', () => {
  it('should detect localhost', () => {
    expect(isPrivateHostname('localhost')).toBe(true);
    expect(isPrivateHostname('LOCALHOST')).toBe(true);
  });

  it('should detect 127.x addresses', () => {
    expect(isPrivateHostname('127.0.0.1')).toBe(true);
    expect(isPrivateHostname('127.0.0.2')).toBe(true);
  });

  it('should detect 10.x addresses', () => {
    expect(isPrivateHostname('10.0.0.1')).toBe(true);
    expect(isPrivateHostname('10.255.255.255')).toBe(true);
  });

  it('should detect 172.16-31.x addresses', () => {
    expect(isPrivateHostname('172.16.0.1')).toBe(true);
    expect(isPrivateHostname('172.31.255.255')).toBe(true);
    expect(isPrivateHostname('172.15.0.1')).toBe(false);
    expect(isPrivateHostname('172.32.0.1')).toBe(false);
  });

  it('should detect 192.168.x addresses', () => {
    expect(isPrivateHostname('192.168.0.1')).toBe(true);
    expect(isPrivateHostname('192.168.255.255')).toBe(true);
  });

  it('should detect link-local addresses', () => {
    expect(isPrivateHostname('169.254.0.1')).toBe(true);
  });

  it('should not flag public addresses', () => {
    expect(isPrivateHostname('8.8.8.8')).toBe(false);
    expect(isPrivateHostname('example.com')).toBe(false);
    expect(isPrivateHostname('github.com')).toBe(false);
  });
});
