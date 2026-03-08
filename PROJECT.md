# Link Preview Service

A web application that fetches URL metadata (title, description, image) and displays it as a rich preview card. Paste a URL, get a beautiful preview.

## Goals
- Provide a simple, fast URL metadata extraction API
- Display rich preview cards with title, description, OG image, favicon, and domain
- Handle edge cases gracefully (invalid URLs, unreachable sites, missing metadata)
- Deploy as a stateless service on Vercel (no database needed)

## Tech Stack
- **Runtime:** Node.js 20
- **Framework:** Express.js
- **HTML Parsing:** cheerio
- **Testing:** vitest + supertest
- **Deployment:** Vercel

## Status
- [x] Milestone 1: MVP (v1.0)
