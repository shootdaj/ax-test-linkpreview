# Roadmap

## Phase 1: Core API
**Goal:** Build the Express server with metadata extraction and API endpoint.

**Requirements:** R1, R2 (partial R4 — basic error handling)

**Deliverables:**
- Express server with structured project layout
- Metadata extraction module using cheerio
- `POST /api/preview` endpoint returning JSON metadata
- `GET /health` endpoint
- Basic error handling for fetch failures
- Unit tests for metadata extraction
- Integration tests for API endpoints

## Phase 2: Web UI
**Goal:** Build the frontend for entering URLs and displaying preview cards.

**Requirements:** R3

**Deliverables:**
- Static HTML/CSS/JS in `public/`
- URL input form with submit button
- Preview card component displaying title, description, image, favicon, domain
- Loading spinner/state
- Error message display
- Responsive design
- Unit tests for UI logic (if any)
- Scenario tests for user workflows

## Phase 3: Hardening
**Goal:** Add security, validation, and edge case handling.

**Requirements:** R4 (full), R5

**Deliverables:**
- Comprehensive URL validation
- Helmet.js security headers
- CORS configuration
- Request body size limits
- In-memory rate limiting (per-IP)
- Edge case handling (redirects, large pages, timeouts)
- Comprehensive unit, integration, and scenario tests
