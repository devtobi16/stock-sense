const express = require('express');
const { resolveChatContext, sanitizeHistory } = require('./services/chatContext');
const { createResearch, COMPANIES } = require('./services/companyResearch');
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
function createApp({ market = require('./services/marketData'), handleChat = require('./services/aiSynthesizer').handleChat, budget = createChatBudget(), research } = {}) {
  const app = express();
  research ||= createResearch({market,budget});
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
  app.get('/api/research/companies', (req,res)=>{shared(res,3600);res.json(Object.entries(COMPANIES).map(([ticker,c])=>({ticker,name:c.name})));});
  app.get('/api/research/:ticker/:resource', async (req,res)=>{
    const ticker=req.params.ticker.toUpperCase(), kind=req.params.resource;
    if(!SYMBOL.test(ticker)) return res.status(400).json({error:'Invalid ticker.'});
    if(!['filings','news','news-analysis'].includes(kind)) return res.status(404).json({error:'Research endpoint not found.'});
    try {
      const data=await research[kind==='news-analysis'?'analyzeNews':kind](ticker);
      shared(res,kind==='filings'?3600:300);res.json(data);
    } catch(e) {console.warn('Research provider failure',kind,ticker,e.message);res.status(e.status===429?429:503).json({error:kind==='filings'?'SEC filings are temporarily unavailable. Please retry.':e.status===429?e.message:'Research is temporarily unavailable. Original sources remain available; please retry.'});}
  });
  app.get('/api/research/:ticker/filings/:accession/:action', async(req,res)=>{
    const ticker=req.params.ticker.toUpperCase(),{accession,action}=req.params;
    if(!SYMBOL.test(ticker)||!/^\d{10}-\d{2}-\d{6}$/.test(accession)||!['excerpts','analysis'].includes(action)) return res.status(400).json({error:'Choose a valid company filing.'});
    try {const data=await research[action==='analysis'?'analyzeFiling':'document'](ticker,accession);shared(res,3600);res.json(data);}
    catch(e){res.status(e.status===429?429:503).json({error:e.status===429?e.message:'The filing reader is unavailable. You can still open the original SEC document and retry later.'});}
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
      const filingQuestion=/\b(filing|10-k|10-q|8-k|annual report|quarterly report|sec|disclosure)\b/i.test(message) || (context.filing && resolved.tickers.includes(context.ticker));
      // Acronyms like SEC are not stock symbols. The selected company anchors filing questions.
      const focus=resolved.tickers.find(t=>COMPANIES[t]) || (COMPANIES[context.ticker]?context.ticker:null);
      const evidenceTask=filingQuestion && focus ? (async()=>{
        try {
          const list=await research.filings(focus);
          const form=/10-k|annual/i.test(message)?'10-K':/8-k|current report/i.test(message)?'8-K':'10-Q';
          const explicitForm=/10-k|10-q|8-k|annual report|quarterly report|current report/i.test(message);
          const chosen=(explicitForm?list.filings.find(f=>f.form===form):list.filings.find(f=>f.accession===context.filing)) || list.filings.find(f=>f.form===form) || list.filings[0];
          return chosen?await research.document(focus,chosen.accession,message):{unavailable:'No SEC filing returned.'};
        } catch {return {unavailable:'SEC document excerpts are currently unavailable. Do not infer filing contents.'};}
      })():Promise.resolve(null);
      const newsTask=typeof research.news==='function'?Promise.all(resolved.tickers.map(t=>research.news(t).catch(()=>null))):Promise.resolve([]);
      const [rawMarketData,filingEvidence,companyNews]=await Promise.all([market.fetchMarketData(resolved.tickers),evidenceTask,newsTask]);
      const marketData=rawMarketData.map(q=>{
        const news=companyNews.find(n=>n?.ticker===q.ticker);
        return news?{...q,news:news.articles.slice(0,3).map(n=>({title:n.title,link:n.link,time:n.time,potentialImpact:n.label,impactReason:n.reason,method:n.method}))}:q;
      });
      const reply = await handleChat(message, {marketData, filingEvidence, requestedTickers:resolved.tickers, omittedTickers:resolved.omittedTickers, contextSource:resolved.source, retrievedAt:new Date().toISOString()}, turns);
      if (typeof reply !== 'string' || !reply.trim()) throw Error('Empty reply');
      res.json({reply,context:{tickers:resolved.tickers,omittedTickers:resolved.omittedTickers}, sources:[...(filingEvidence?.filing?[{title:`${focus} ${filingEvidence.filing.form} · ${filingEvidence.filing.filed}`,url:filingEvidence.filing.url}]:[]),...marketData.flatMap(q => (q.news || []).slice(0,2).map(n=>({title:n.title,url:n.link})))], evidence:filingEvidence});
    } catch {
      res.status(503).json({error:'The AI provider is temporarily unavailable. Please retry in a minute.'});
    } finally { release(); }
  });
  app.use('/api', (req,res)=>res.status(404).json({error:'This endpoint is not part of the portfolio release.'}));
  app.use((error,req,res,_next)=>res.status(error.status === 413 ? 413 : 400).json({error:'Invalid request. Check the message and try again.'}));
  return app;
}
module.exports = {createApp, symbols};
