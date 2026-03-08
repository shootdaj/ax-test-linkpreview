# Requirements

## R1: URL Metadata Extraction
Fetch a given URL, parse the HTML response, and extract:
- Page title (`<title>` tag and `og:title`)
- Description (`meta[name=description]` and `og:description`)
- OG image (`og:image`)
- Favicon (`link[rel=icon]` or default `/favicon.ico`)
- Site name / domain

## R2: Preview API
- `POST /api/preview` endpoint
- Accepts JSON body: `{ "url": "https://example.com" }`
- Returns JSON with extracted metadata
- `GET /health` endpoint for health checks

## R3: Web UI
- Clean, responsive form to enter a URL
- Displays a preview card with:
  - Title
  - Description
  - OG image (if available)
  - Favicon
  - Domain name
- Loading state while fetching
- Error display for failures

## R4: Input Validation
- Validate URL format (must be valid URL with http/https protocol)
- Reject non-http(s) URLs
- Handle fetch errors gracefully (timeout, DNS failure, invalid HTML)
- Return meaningful error messages

## R5: Security
- Helmet.js security headers
- CORS configuration
- Request body size limits
- Rate limiting (in-memory, per-IP)
