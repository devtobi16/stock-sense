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
- Quote and news pages never invoke a language model. AI runs only when a visitor sends a chat message or explicitly requests research analysis. This keeps navigation independent of generation time and conserves provider quotas.
- Successful public responses use the Vercel CDN cache. Quote TTL is 60 seconds; headlines and nonempty earnings calendars use 5 minutes. Brief stale-while-revalidate is allowed, and quote timestamps remain visible. Chat responses use `no-store` and are never publicly cached.
- An in-process Finnhub cache coalesces concurrent requests. It is an optimization only: serverless instances do not share memory. The CDN provides cross-instance caching for public endpoints.
- The browser reuses successful responses, retains stale data on refresh failure, stops polling while hidden, and backs off failures.
- Chat receives recent conversation turns plus up to four symbols' quotes/headlines. It retains at most 6,000 history characters for the provider request, while the tab stores up to 40 turns. New chat clears that tab's conversation. There is no account or cross-device memory.
- A conservative per-instance token reservation and concurrency guard reduces bursts. It is not a distributed account-wide rate limiter. Provider limits still apply across instances and other clients using the same keys. Busy requests return an actionable 429; provider failures return 503.
- Symbol inputs accept up to five valid ticker strings per comparison/watchlist; availability depends on Finnhub. Chat understands a small alias catalogue plus explicit symbols, not arbitrary company names worldwide.
- Sources include quotes, headlines and selected SEC filing passages, not full article bodies. Unsupported AI scores, invented revenue series, and synthetic investment recommendations are excluded from the release interface.
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


## Company research desk

The home page connects quotes, SEC filings, and explained news-impact labels for a selected company. SEC lookup uses the full source-attributed SEC ticker directory (refresh with `node scripts/refresh-directory.cjs`). Search suggestions return up to 20 matches, not a coverage cap. Users may enter any provider-supported ticker. Quotes/news and SEC availability are independent; ETFs and non-SEC issuers may lack corporate filings. The earnings calendar includes all valid releases returned by Finnhub for the next 30 days, with ticker filtering and 25-row pagination. Weekly requests avoid truncation of large provider responses; capped windows are subdivided. Fetch concurrency is two, windows are cached for 15 minutes in-process, and public calendar responses are CDN-cached for five minutes.

- SEC submissions identify the original 10-K, 10-Q and 8-K documents. The server verifies CIK and ticker identity and derives document URLs from SEC-provided accession metadata.
- Read excerpts and summarize filing are explicit requests. The reader strips document markup and retrieves at most four passages by lexical relevance; it is not a complete filing review or a financial-table parser. Summary and chat display those passages and the original document link.
- Every displayed company-news item has a Positive, Negative or Neutral potential-impact tag and reason. Initial tags use conservative headline rules; optional AI reviews the first three directly matching headlines. Neutral includes ambiguous/mixed evidence. Headlines without a company mention are separated as relevance unconfirmed. Tags do not establish price causality, and publication time must be compared with quote time. Full news articles are not retrieved.
- Quotes, filings and news load independently. No AI call happens merely from opening a page. Public successful research responses use CDN caching; bounded per-instance caches coalesce SEC and AI requests. Chat history stays tab-local and chat responses are never publicly cached. Cache persistence across all function restarts is not guaranteed.
- SEC requests use a declared StockSense User-Agent (override with SEC_USER_AGENT), timeouts, a 6 MB document limit and per-instance pacing. Account-wide enforcement remains with the providers; the app is intended for a modest portfolio audience, not unrestricted production traffic.

Tests cover issuer/path validation, evidence extraction, relevance and mixed sentiment, malformed model output, cache coalescing, provider failures and chat filing context. Provider integration still requires live preview checks.

### SEC availability and saved snapshots

SEC may reject requests from a hosting network. The app therefore includes bounded, source-attributed snapshots of verified submission metadata and selected passages from a subset of issuers' available 10-K, 10-Q and 8-K reports. These are real filing passages, not invented examples. When live retrieval fails, the UI labels the snapshot and capture time; it does not claim the list is current. Older documents still link to SEC but may not have saved passages.

Run `npm run refresh:sec` from an environment permitted to retrieve SEC data, review `server/data/secSnapshots.json`, and commit it to refresh this fallback. Failed retrievals preserve the previous snapshot. This command is manual, not a scheduled refresh; an old snapshot can miss newer filings. No API keys or AI calls are needed.

SEC supports 10-K, 10-Q, 8-K, 20-F, 40-F and 6-K reports. If live SEC retrieval is unavailable, existing dated snapshots remain available; other issuers try Finnhub's filing index and otherwise show a clearly labelled original EDGAR library link. A library link is not a retrieved filing: in-app summaries only run on successfully retrieved document text. Broader lookup does not guarantee document retrieval for every issuer. `npm run refresh:sec -- KO COST` can capture additional source snapshots; the default refresh updates existing snapshots only, never all directory entries.
