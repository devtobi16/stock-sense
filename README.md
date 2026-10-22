# StockSense / MarketMind

A financial research workspace built with React, TypeScript, Express, and Vercel Functions. It provides timestamped quotes, stock comparison, a local watchlist, source-linked news, an earnings calendar, and conversational investing education.

## Run locally

Use Node.js 22 or newer.

```sh
npm ci
npm ci --prefix server
npm run dev
```

In a second terminal, configure `FINNHUB_API_KEY` and at least one of `GROQ_API_KEY` / `GEMINI_API_KEY` in your local environment, then run:

```sh
node server/dev.js
```

The development frontend proxies `/api` to port 3001. Never put provider credentials in `VITE_` variables or commit `.env` files.

## Architecture and trade-offs

- The SPA and Express API deploy together on Vercel. `api/index.js` exports the application; `server/portfolioApp.js` implements the release API. No long-running server or background job is required on Vercel.
- Quote and news pages never invoke a language model. AI runs only when a visitor sends a chat message. This keeps navigation independent of generation time and conserves provider quotas.
- Successful public responses use the Vercel CDN cache. Quote TTL is 60 seconds; headlines and nonempty earnings calendars use 5 minutes. Brief stale-while-revalidate is allowed, and quote timestamps remain visible. Chat responses use `no-store` and are never publicly cached.
- An in-process Finnhub cache coalesces concurrent requests. It is an optimization only: serverless instances do not share memory. The CDN provides cross-instance caching for public endpoints.
- The browser reuses successful responses, retains stale data on refresh failure, stops polling while hidden, and backs off failures.
- Chat receives recent conversation turns plus up to four symbols' quotes/headlines. It retains at most 6,000 history characters for the provider request, while the tab stores up to 40 turns. New chat clears that tab's conversation. There is no account or cross-device memory.
- A conservative per-instance token reservation and concurrency guard reduces bursts. It is not a distributed account-wide rate limiter. Provider limits still apply across instances and other clients using the same keys. Busy requests return an actionable 429; provider failures return 503.
- Symbol inputs accept up to five valid ticker strings per comparison/watchlist; availability depends on Finnhub. Chat understands a small alias catalogue plus explicit symbols, not arbitrary company names worldwide.
- Sources are quotes and headlines, not full article bodies or parsed SEC filings. Unsupported AI scores, invented revenue series, and synthetic investment recommendations are excluded from the release interface.
- A clearly labelled illustrative price-change example remains available without providers. It is never substituted for live data or a real chat response.

## Deployment

The existing Vercel project builds the frontend and installs the server dependencies via `vercel.json`. Configure server-only provider keys for Preview and Production. The frontend uses same-origin `/api` requests; `VITE_API_URL` is no longer used. Deploy and validate a preview before production promotion.

The legacy Render entrypoint `server/index.js` is retained for rollback compatibility but is not the Vercel release API. Old page files are not imported by the release router.

## Verification

```sh
npm test
npm run build
npm run lint
```

Tests cover cache expiry/coalescing, polling visibility, stale data, ticker races, conversation context, empty watchlists, input validation, CDN/private cache boundaries, provider failures, and request budgets. Provider calls are mocked in automated tests. Browser and real-provider acceptance must be measured separately; test duration is not page-load latency.

This is an educational portfolio project. Provider data can be delayed or unavailable, and generated answers can be incorrect. It does not execute trades or provide personalized investment advice.
