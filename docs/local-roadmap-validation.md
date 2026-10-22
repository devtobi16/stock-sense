# Local roadmap implementation and validation

Status: local changes only. No PR creation/update, push, deployment, plan upgrade, or production configuration change was performed for this implementation.

## Implemented

- Separate dashboard quote snapshot and asynchronous insights endpoints. Price rendering does not wait for AI.
- Quote-only portfolio fetching; company-news failure no longer discards a successful quote.
- Background, coalesced AI enrichment for dashboard, watchlist, comparison, stock detail, thesis feed, market overview, and financial news. Bounded analysis cache with retry backoff.
- Quote-bearing response freshness reduced to 60 seconds. AI cache refresh independent of quotes (five minutes).
- Shared client resource store with in-flight deduplication, keyed responses, stale-data retention, bounded inactive cache, timeout handling, retry backoff, and manual dashboard refresh.
- Automatic visible-tab refresh: 60 seconds for quote-bearing pages, five minutes for news/calendar/research; dashboard insight jobs polled every five seconds only while pending. Hidden tabs do not issue refresh requests. Returning online/visible triggers freshness checks.
- Stock-analysis requests abort when superseded or when leaving the page. Full research/analysis remains explicitly requested AI work; it can still take the provider budget to finish.
- Chat understands common lowercase symbols, explicit dollar symbols, and a small company alias catalogue. Conversation references precede unrelated selected-stock context. Both user and assistant stock mentions can anchor follow-ups. New-topic and educational prompts avoid blindly attaching old stock context.
- Four-symbol lookup limit is exposed in response metadata and displayed in chat. It is not silently dropped.
- Chat retains up to 40 messages in tab-scoped session storage, with New chat. Backend bounds context to the last 40 valid messages and 24,000 characters, at most 4,000 per message.
- Beginner prompt guidance asks about relevant goals/timeframe/country/risk and distinguishes funds from insured deposits. This is prompt policy, not a guarantee of model behavior.
- Removed fabricated AI fallback narratives in the modified synthesis paths. Basic data can render with analysis pending/unavailable.
- Server-Timing header measures API handler duration for later deployed profiling.

## Validation

Command: `npm test` (Node 24 used).

- 9 frontend resource-store/polling unit tests pass.
- 34 backend tests pass, including 3 local HTTP integration tests.
- Total: 43 passing, 0 failing.
- All 12 previously specified ticker/context behaviors pass; previously 5 passed and 7 failed.
- Production TypeScript/Vite build passes.
- Lint exits 0 with remaining unused-variable warnings in backend code.
- `git diff --check` passes.

HTTP tests run real Express routes on an ephemeral localhost port with mocked market/AI providers. A deliberately unresolved AI request does not prevent the snapshot endpoint returning prices. Tests also verify the Server-Timing header, beginner follow-up history, and ticker-overflow metadata. This proves separation of dependencies, not a production latency target.

Resource tests cover concurrent request reuse, navigation reuse, expiry with stale data retained, late ticker responses, failure backoff, manual refresh, eviction, hidden-tab behavior, overlapping visibility events, and unmount cleanup.

Current main JS build: approximately 374.08 KB uncompressed / 119.14 KB gzip. The prior preview was 371.89 KB / 118.29 KB: this work primarily reduces waiting and repeated requests, not bundle size.

## Still required before release

1. Deploy an approved preview and run browser checks for all changed pages, cold/warm loading, sidebar partial failure, navigation, ticker changes, chat reload/New chat, and background refresh.
2. Measure browser LCP and real-user latency; server integration test duration is not page-load speed.
3. Run new prompt evaluation with actual providers, including beginner guidance, misleading assumptions, context switches, and source accuracy. Local model calls are mocked.
4. Confirm account-specific Finnhub/Groq/Gemini quotas and concurrency budgets. Faster polling must fit actual limits. No remaining quota has been verified.
5. Choose a hosting policy. Render free-tier sleep remains unchanged; eliminating idle wake-up delays requires a separately approved hosting change. No paid changes were made.
6. The symbol catalogue is deliberately limited. Arbitrary company names, ambiguous abbreviations, international coverage, and long-term cross-session memory are not solved by these tests.

Existing unrelated mock charts/metrics elsewhere in the product are not certified by this work. These changes should be reviewed as local implementation pending preview and live-provider acceptance, not a production-readiness guarantee.
