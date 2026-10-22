const express = require('express');
const { resolveChatContext, sanitizeHistory } = require('./services/chatContext');
const { createChatBudget } = require('./services/chatBudget');
const SYMBOL = /^[A-Z]{1,5}(?:[.-][A-Z]{1,2})?$/;
const DEFAULTS = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN'];
function symbols(value, fallback = DEFAULTS) {
  if (value === undefined) return fallback;
  if (typeof value !== 'string') throw Error('Use comma-separated ticker symbols.');
  const list = [...new Set(value.split(',').map(t => t.trim().toUpperCase()).filter(Boolean))];
  if (list.length > 5 || list.some(t => !SYMBOL.test(t))) throw Error('Enter up to five valid US ticker symbols.');
  return list;
}
function createApp({ market = require('./services/marketData'), handleChat = require('./services/aiSynthesizer').handleChat, budget = createChatBudget() } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '32kb' }));
  app.use((req, res, next) => {
    const started = performance.now();
    const json = res.json.bind(res);
    res.json = body => { res.set('Server-Timing', `app;dur=${(performance.now()-started).toFixed(1)}`); return json(body); };
    res.set('Cache-Control', 'no-store');
    next();
  });
  const shared = (res, ttl = 60) => {
    // CDN shares public market data across function instances. Chat is never cached.
    res.set('Cache-Control', 'public, max-age=0, must-revalidate');
    res.set('Vercel-CDN-Cache-Control', `public, s-maxage=${ttl}, stale-while-revalidate=60`);
  };
  app.get('/api/health', (req,res) => res.json({ok:true, version:'portfolio-v1'}));
  app.get(['/api/market-snapshot', '/api/quotes'], async (req,res) => {
    let tickers;
    try { tickers = symbols(req.query.tickers); } catch(e) { return res.status(400).json({error:e.message}); }
    const quotes = await market.fetchQuotes(tickers);
    if (tickers.length && !quotes.length) return res.status(503).json({error:'Quotes are unavailable. Please retry shortly.'});
    if (quotes.length === tickers.length) shared(res);
    res.json({quotes, unavailable:tickers.filter(t => !quotes.some(q => q.ticker === t)), retrievedAt:new Date().toISOString(), source:'Finnhub'});
  });
  app.get('/api/company/:ticker', async (req,res) => {
    const ticker = req.params.ticker.toUpperCase();
    if (!SYMBOL.test(ticker)) return res.status(400).json({error:'Enter a valid ticker symbol.'});
    const data = await market.fetchTickerData(ticker);
    if (!data) return res.status(404).json({error:'No quote is available for this symbol. Check the ticker or retry later.'});
    shared(res);
    res.json({...data, retrievedAt:new Date().toISOString(), source:'Finnhub'});
  });
  app.get('/api/news-headlines', async (req,res) => {
    const news = await market.fetchGlobalNews();
    if (!news.length) return res.status(503).json({error:'Headlines are currently unavailable.'});
    shared(res,300); res.json(news);
  });
  app.get('/api/earnings-calendar', async (req,res) => {
    let data;
    try { data = await market.fetchEarningsCalendar([...DEFAULTS,'META','GOOGL','NFLX','AMD','INTC','JPM','V','WMT','JNJ'], {strict:true}); }
    catch { return res.status(503).json({error:'The earnings calendar is temporarily unavailable.'}); }
    // Empty calendars are legitimate; short caching avoids hiding recovery for long.
    shared(res,data.length ? 300 : 30); res.json(data);
  });
  app.post('/api/chat', async (req,res) => {
    const {message, context={}, history=[]} = req.body || {};
    if (typeof message !== 'string' || !message.trim() || message.length > 4000) return res.status(400).json({error:'Please send a message of 1–4000 characters.'});
    let turns = sanitizeHistory(history);
    while (turns.reduce((n,t)=>n+t.content.length,0)>6000) turns.shift();
    const resolved = resolveChatContext(message, context || {}, turns);
    // Reserve before fetching data, so rejected requests don't consume Finnhub quota.
    const estimate = Math.ceil((message.length + JSON.stringify(turns).length + 5000)/3) + 768;
    const release = budget.acquire(estimate);
    if (!release) return res.status(429).set('Retry-After','60').json({error:'The analyst is busy or at its free usage limit. Please retry in a minute.'});
    try {
      const marketData = await market.fetchMarketData(resolved.tickers);
      const reply = await handleChat(message, {marketData, requestedTickers:resolved.tickers, omittedTickers:resolved.omittedTickers, contextSource:resolved.source, retrievedAt:new Date().toISOString()}, turns);
      if (typeof reply !== 'string' || !reply.trim()) throw Error('Empty reply');
      res.json({reply,context:{tickers:resolved.tickers,omittedTickers:resolved.omittedTickers}, sources:marketData.flatMap(q => (q.news || []).map(n=>({title:n.title,url:n.link})))});
    } catch {
      res.status(503).json({error:'The AI provider is temporarily unavailable. Please retry in a minute.'});
    } finally { release(); }
  });
  app.use('/api', (req,res)=>res.status(404).json({error:'This endpoint is not part of the portfolio release.'}));
  app.use((error,req,res,_next)=>res.status(error.status === 413 ? 413 : 400).json({error:'Invalid request. Check the message and try again.'}));
  return app;
}
module.exports = {createApp, symbols};
