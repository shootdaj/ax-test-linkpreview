import { describe, it, expect } from 'vitest';
import {
  extractMetadata,
  getTitle,
  getDescription,
  getImage,
  getFavicon,
  getSiteName,
  resolveUrl,
} from './metadata.js';
import * as cheerio from 'cheerio';

describe('resolveUrl', () => {
  it('should return absolute URLs unchanged', () => {
    expect(resolveUrl('https://example.com/img.png', 'https://base.com')).toBe('https://example.com/img.png');
    expect(resolveUrl('http://example.com/img.png', 'https://base.com')).toBe('http://example.com/img.png');
  });

  it('should resolve protocol-relative URLs', () => {
    expect(resolveUrl('//cdn.example.com/img.png', 'https://base.com')).toBe('https://cdn.example.com/img.png');
  });

  it('should resolve root-relative URLs', () => {
    expect(resolveUrl('/images/logo.png', 'https://base.com')).toBe('https://base.com/images/logo.png');
  });

  it('should resolve relative URLs', () => {
    expect(resolveUrl('logo.png', 'https://base.com')).toBe('https://base.com/logo.png');
  });

  it('should return null for null input', () => {
    expect(resolveUrl(null, 'https://base.com')).toBeNull();
  });
});

describe('getTitle', () => {
  it('should extract og:title', () => {
    const $ = cheerio.load('<html><head><meta property="og:title" content="OG Title"><title>Fallback</title></head></html>');
    expect(getTitle($)).toBe('OG Title');
  });

  it('should fall back to twitter:title', () => {
    const $ = cheerio.load('<html><head><meta name="twitter:title" content="Twitter Title"><title>Fallback</title></head></html>');
    expect(getTitle($)).toBe('Twitter Title');
  });

  it('should fall back to title tag', () => {
    const $ = cheerio.load('<html><head><title>Page Title</title></head></html>');
    expect(getTitle($)).toBe('Page Title');
  });

  it('should return null when no title found', () => {
    const $ = cheerio.load('<html><head></head></html>');
    expect(getTitle($)).toBeNull();
  });

  it('should trim whitespace', () => {
    const $ = cheerio.load('<html><head><title>  Spaced Title  </title></head></html>');
    expect(getTitle($)).toBe('Spaced Title');
  });
});

describe('getDescription', () => {
  it('should extract og:description', () => {
    const $ = cheerio.load('<html><head><meta property="og:description" content="OG Desc"></head></html>');
    expect(getDescription($)).toBe('OG Desc');
  });

  it('should fall back to meta description', () => {
    const $ = cheerio.load('<html><head><meta name="description" content="Meta Desc"></head></html>');
    expect(getDescription($)).toBe('Meta Desc');
  });

  it('should return null when no description found', () => {
    const $ = cheerio.load('<html><head></head></html>');
    expect(getDescription($)).toBeNull();
  });
});

describe('getImage', () => {
  it('should extract og:image', () => {
    const $ = cheerio.load('<html><head><meta property="og:image" content="https://example.com/img.png"></head></html>');
    expect(getImage($, 'https://example.com')).toBe('https://example.com/img.png');
  });

  it('should resolve relative og:image', () => {
    const $ = cheerio.load('<html><head><meta property="og:image" content="/img.png"></head></html>');
    expect(getImage($, 'https://example.com')).toBe('https://example.com/img.png');
  });

  it('should fall back to twitter:image', () => {
    const $ = cheerio.load('<html><head><meta name="twitter:image" content="https://example.com/tw.png"></head></html>');
    expect(getImage($, 'https://example.com')).toBe('https://example.com/tw.png');
  });

  it('should return null when no image found', () => {
    const $ = cheerio.load('<html><head></head></html>');
    expect(getImage($, 'https://example.com')).toBeNull();
  });
});

describe('getFavicon', () => {
  it('should extract favicon from link tag', () => {
    const $ = cheerio.load('<html><head><link rel="icon" href="/favicon.png"></head></html>');
    expect(getFavicon($, 'https://example.com')).toBe('https://example.com/favicon.png');
  });

  it('should extract shortcut icon', () => {
    const $ = cheerio.load('<html><head><link rel="shortcut icon" href="/fav.ico"></head></html>');
    expect(getFavicon($, 'https://example.com')).toBe('https://example.com/fav.ico');
  });

  it('should default to /favicon.ico', () => {
    const $ = cheerio.load('<html><head></head></html>');
    expect(getFavicon($, 'https://example.com')).toBe('https://example.com/favicon.ico');
  });
});

describe('getSiteName', () => {
  it('should extract og:site_name', () => {
    const $ = cheerio.load('<html><head><meta property="og:site_name" content="My Site"></head></html>');
    expect(getSiteName($, 'example.com')).toBe('My Site');
  });

  it('should fall back to hostname without www', () => {
    const $ = cheerio.load('<html><head></head></html>');
    expect(getSiteName($, 'www.example.com')).toBe('example.com');
  });

  it('should use hostname as-is if no www prefix', () => {
    const $ = cheerio.load('<html><head></head></html>');
    expect(getSiteName($, 'blog.example.com')).toBe('blog.example.com');
  });
});

describe('extractMetadata', () => {
  it('should extract full metadata from well-formed HTML', () => {
    const html = `
      <html>
      <head>
        <title>Test Page</title>
        <meta property="og:title" content="OG Test Page">
        <meta property="og:description" content="A test page description">
        <meta property="og:image" content="https://example.com/og-image.jpg">
        <meta property="og:site_name" content="TestSite">
        <link rel="icon" href="/favicon.png">
      </head>
      <body></body>
      </html>
    `;

    const result = extractMetadata(html, 'https://www.example.com/page');

    expect(result).toEqual({
      url: 'https://www.example.com/page',
      title: 'OG Test Page',
      description: 'A test page description',
      image: 'https://example.com/og-image.jpg',
      favicon: 'https://www.example.com/favicon.png',
      siteName: 'TestSite',
      domain: 'www.example.com',
    });
  });

  it('should handle minimal HTML', () => {
    const html = '<html><head><title>Simple</title></head><body></body></html>';
    const result = extractMetadata(html, 'https://simple.com');

    expect(result.title).toBe('Simple');
    expect(result.description).toBeNull();
    expect(result.image).toBeNull();
    expect(result.domain).toBe('simple.com');
    expect(result.favicon).toBe('https://simple.com/favicon.ico');
  });

  it('should handle empty HTML', () => {
    const result = extractMetadata('', 'https://empty.com');
    expect(result.title).toBeNull();
    expect(result.description).toBeNull();
    expect(result.domain).toBe('empty.com');
  });
});
