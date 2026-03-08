# Link Preview Service

## Project Overview
A stateless web app that fetches URL metadata and displays rich preview cards. Deployed on Vercel.

## Tech Stack
- Node.js 20, Express.js, cheerio
- Testing: vitest + supertest
- Deployment: Vercel

## Key Architecture
- `src/app.js` — Express app (exports app, does NOT call listen)
- `src/server.js` — Calls listen() for local dev
- `src/metadata.js` — URL metadata extraction logic
- `public/` — Static frontend files
- `vercel.json` — Vercel routing config
- `api/` — Vercel serverless functions (if needed)

## Commands
- `npm run dev` — Start dev server
- `npm test` — Run all tests
- `npx vitest run --dir src` — Unit tests
- `npx vitest run --dir test/integration` — Integration tests
- `npx vitest run --dir test/scenarios` — Scenario tests

# Testing Requirements (AX)

Every feature implementation MUST include tests at all three tiers:

## Test Tiers
1. **Unit tests** — Test individual functions/methods in isolation. Mock external dependencies.
2. **Integration tests** — Test component interactions with real services.
3. **Scenario tests** — Test full user workflows end-to-end.

## Test Naming
Use semantic names: `Test<Component>_<Behavior>[_<Condition>]`
- Good: `TestAuthService_LoginWithValidCredentials`, `TestFullCheckoutFlow`
- Bad: `TestShouldWork`, `Test1`, `TestGivenUserWhenLoginThenSuccess`

## Reference
- See `TEST_GUIDE.md` for requirement-to-test mapping
- Every requirement in ROADMAP.md must map to at least one scenario test
