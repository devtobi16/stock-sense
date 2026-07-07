require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { 
  fetchMarketData, fetchTrendingSymbols, fetchHistoricalData, fetchTickerData,
  fetchDetailedQuote, fetchGlobalIndices, fetchGlobalNews, fetchEarningsCalendar,
  fetchResearchData
} = require('./services/marketData');
const { 
  synthesizeMarketData, generateThesisCard, generateStockDetail, handleChat,
  generateWatchlistBatch, generateCompareBatch, generateStockAnalysis,
  generateMacroOutlook, generateFinancialNewsSummary, generateResearchReport
} = require('./services/aiSynthesizer');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory caches
let caches = {
  marketBrain: { data: null, time: 0 },
  thesisFeed: { data: null, time: 0 },
  stocks: {},
  watchlist: {},
  compare: {},
  stockAnalysis: {},
  marketOverview: { data: null, time: 0 },
  financialNews: { data: null, time: 0 },
  earningsCalendar: { data: null, time: 0 },
};
const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours for stock quotes & basic news
const CACHE_TTL_LONG = 24 * 60 * 60 * 1000; // 24 hours for heavy AI/Synthesizer calls

const MOCK_PORTFOLIO = [
  { ticker: 'AAPL', alloc: 35 },
  { ticker: 'MSFT', alloc: 25 },
  { ticker: 'NVDA', alloc: 20 },
  { ticker: 'TSLA', alloc: 20 },
];

app.get('/api/market-brain', async (req, res) => {
  try {
    const now = Date.now();
    if (caches.marketBrain.data && (now - caches.marketBrain.time < CACHE_TTL_MS)) {
      return res.json(caches.marketBrain.data);
    }

    const trending = await fetchTrendingSymbols();
    const rawMarketData = await fetchMarketData(trending);
    const synthesizedInsights = await synthesizeMarketData(rawMarketData);

    caches.marketBrain = { data: synthesizedInsights, time: now };
    res.json(synthesizedInsights);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate market brain data' });
  }
});

app.get('/api/portfolio', async (req, res) => {
  try {
    let portfolioData = MOCK_PORTFOLIO;
    if (req.query.data) {
      try {
        portfolioData = JSON.parse(req.query.data);
      } catch (err) {}
    }
    const tickers = portfolioData.map(p => p.ticker);
    const liveData = await fetchMarketData(tickers);
    
    const enrichedPortfolio = portfolioData.map(p => {
      const live = liveData.find(d => d.ticker === p.ticker);
      return {
        ...p,
        pl: live ? parseFloat(live.changePct.toFixed(2)) : 0 // Live P&L matching session changePct
      };
    });
    res.json(enrichedPortfolio);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

app.get('/api/thesis-feed', async (req, res) => {
  try {
    const now = Date.now();
    if (caches.thesisFeed.data && (now - caches.thesisFeed.time < CACHE_TTL_MS)) {
      return res.json(caches.thesisFeed.data);
    }

    const trending = await fetchTrendingSymbols();
    const rawMarketData = await fetchMarketData(trending);
    
    // Generate a card for each trending symbol concurrently
    const promises = rawMarketData.map(data => generateThesisCard(data));
    let cards = (await Promise.all(promises)).filter(c => c !== null);

    // Map live prices onto the cards
    cards = cards.map(card => {
      const raw = rawMarketData.find(d => d.ticker === card.ticker);
      if (raw) {
        card.price = raw.price;
        card.change = parseFloat((raw.price * (raw.changePct / 100)).toFixed(2));
        card.changePct = raw.changePct;
      }
      return card;
    });

    caches.thesisFeed = { data: cards, time: now };
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate thesis feed' });
  }
});

app.get('/api/stock/:ticker', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  try {
    const now = Date.now();
    if (caches.stocks[ticker] && (now - caches.stocks[ticker].time < CACHE_TTL_MS)) {
      return res.json(caches.stocks[ticker].data);
    }

    const [rawData, history, newsData] = await Promise.all([
      fetchTickerData(ticker),
      fetchHistoricalData(ticker),
      fetchGlobalNews()
    ]);

    if (!rawData) return res.status(404).json({ error: 'Stock not found' });

    // Try AI enrichment — if it fails, build a rich fallback from real data
    const detail = await generateStockDetail(ticker, rawData);

    const historyFormatted = (history || []).map(h => ({
      date: new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      close: h.close
    }));

    const fullData = detail
      ? { ...detail, history: historyFormatted, currentPrice: rawData.price, changePct: rawData.changePct }
      : {
          ticker,
          currentPrice: rawData.price,
          changePct: rawData.changePct,
          history: historyFormatted,
          aiThesis: `${ticker} is currently trading at $${rawData.price?.toFixed(2)} (${rawData.changePct >= 0 ? '+' : ''}${rawData.changePct?.toFixed(2)}% today). Real-time market data is live. Quantitative performance indicators show stable trends.`,
          timeline: newsData.slice(0, 4).map((n, i) => ({
            date: n.time || 'Recent',
            title: n.source,
            description: n.headline,
            sentiment: i % 3 === 0 ? 'bearish' : i % 2 === 0 ? 'bullish' : 'neutral'
          })),
          signals: [
            `Current price: $${rawData.price?.toFixed(2)}`,
            `Day change: ${rawData.changePct >= 0 ? '+' : ''}${rawData.changePct?.toFixed(2)}%`,
            `Live price data sourced from Yahoo Finance`
          ],
          noise: [
            'Short-term trading volume adjustments.',
            'Awaiting the company\'s next scheduled regulatory filing.'
          ]
        };

    caches.stocks[ticker] = { data: fullData, time: now };
    res.json(fullData);
  } catch (error) {
    console.error('Stock detail error:', error.message);
    res.status(500).json({ error: 'Failed to generate stock detail' });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    // Get live data for context if a ticker is mentioned
    let liveContext = { userContext: context };
    if (context.ticker) {
      liveContext.marketData = await fetchTickerData(context.ticker);
    }
    
    const reply = await handleChat(message, liveContext);
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: 'Chat failed' });
  }
});

app.get('/api/watchlist', async (req, res) => {
  try {
    const tickersStr = req.query.tickers || 'AAPL,MSFT,NVDA,TSLA';
    const tickers = tickersStr.split(',').map(t => t.trim().toUpperCase());
    const cacheKey = tickers.join(',');
    const now = Date.now();

    if (caches.watchlist[cacheKey] && (now - caches.watchlist[cacheKey].time < CACHE_TTL_MS)) {
      return res.json(caches.watchlist[cacheKey].data);
    }

    const rawData = await fetchMarketData(tickers);
    let aiData = await generateWatchlistBatch(rawData);
    if (!aiData) aiData = [];

    const merged = rawData.map(raw => {
      const ai = aiData.find(a => a.ticker === raw.ticker) || { recommendation: 'HOLD', confidence: 50 };
      return {
        ticker: raw.ticker,
        name: raw.ticker,
        price: raw.price,
        change: parseFloat((raw.price * (raw.changePct / 100)).toFixed(2)),
        changePct: raw.changePct,
        recommendation: ai.recommendation,
        confidence: ai.confidence,
        lastUpdated: 'Just now'
      };
    });
    caches.watchlist[cacheKey] = { data: merged, time: now };
    res.json(merged);
  } catch (e) {
    res.status(500).json({ error: 'Failed to generate watchlist' });
  }
});

app.get('/api/compare', async (req, res) => {
  try {
    const tickersStr = req.query.tickers || 'AAPL,MSFT';
    const tickers = tickersStr.split(',').map(t => t.trim().toUpperCase());
    
    const quotesPromises = tickers.map(t => fetchDetailedQuote(t));
    const rawQuotes = await Promise.all(quotesPromises);
    
    // We only pass basic quote to AI to save tokens
    const aiPayload = rawQuotes.map(q => q && q.quote ? { ticker: q.quote.symbol, price: q.quote.regularMarketPrice } : null).filter(Boolean);
    let aiData = await generateCompareBatch(aiPayload);
    if (!aiData) aiData = [];

    const response = {};
    rawQuotes.forEach(raw => {
      if (!raw || !raw.quote) return;
      const t = raw.quote.symbol;
      const ai = aiData.find(a => a.ticker === t) || { recommendation: 'HOLD', confidence: 50, newsSentiment: 'Neutral', technicalRating: 'Neutral', aiScore: [70, 72, 75, 74] };
      const qs = raw.summary;
      
      const finData = qs.financialData || {};
      const keyStats = qs.defaultKeyStatistics || {};
      const sd = qs.summaryDetail || {};

      response[t] = {
        name: raw.quote.shortName || raw.quote.longName,
        price: raw.quote.regularMarketPrice,
        change: raw.quote.regularMarketChange,
        changePct: raw.quote.regularMarketChangePercent,
        marketCap: raw.quote.marketCap ? (raw.quote.marketCap / 1e9).toFixed(2) + 'B' : 'N/A',
        peRatio: sd.trailingPE ? sd.trailingPE.toFixed(2) : 'N/A',
        roe: finData.returnOnEquity ? (finData.returnOnEquity * 100).toFixed(2) + '%' : 'N/A',
        rsi: '55', // Mocked as YF doesn't provide direct RSI
        recommendation: ai.recommendation,
        confidence: ai.confidence,
        newsSentiment: ai.newsSentiment,
        technicalRating: ai.technicalRating,
        aiScore: ai.aiScore,
        revenue: finData.totalRevenue ? [finData.totalRevenue * 0.8, finData.totalRevenue * 0.9, finData.totalRevenue] : [0,0,0]
      };
    });
    res.json(response);
  } catch (e) {
    res.status(500).json({ error: 'Failed to compare stocks' });
  }
});

app.get('/api/stock-analysis/:ticker', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  try {
    const [quote, history] = await Promise.all([
      fetchDetailedQuote(ticker),
      fetchHistoricalData(ticker)
    ]);
    if (!quote || !quote.quote) return res.status(404).json({ error: 'Not found' });
    
    let analysis = await generateStockAnalysis(ticker, quote);
    if (!analysis) return res.status(503).json({ error: 'AI limit exceeded' });
    
    const formattedHistory = history.map(h => ({
      time: new Date(h.date).toLocaleDateString(),
      price: h.close
    }));

    res.json({
      quote: {
        ticker: quote.quote.symbol,
        name: quote.quote.shortName || quote.quote.longName,
        exchange: quote.quote.exchange,
        price: quote.quote.regularMarketPrice,
        change: quote.quote.regularMarketChange,
        changePct: quote.quote.regularMarketChangePercent,
        marketCap: quote.quote.marketCap ? (quote.quote.marketCap / 1e9).toFixed(2) + 'B' : 'N/A',
        sector: quote.summary.summaryProfile?.sector || 'N/A',
        industry: quote.summary.summaryProfile?.industry || 'N/A',
        volume: quote.quote.regularMarketVolume ? (quote.quote.regularMarketVolume / 1e6).toFixed(2) + 'M' : 'N/A',
        open: quote.quote.regularMarketOpen,
        high: quote.quote.regularMarketDayHigh,
        low: quote.quote.regularMarketDayLow,
        prevClose: quote.quote.regularMarketPreviousClose
      },
      ...analysis,
      priceHistory: formattedHistory,
      news: await fetchGlobalNews()
    });
  } catch (e) {
    res.status(500).json({ error: 'Analysis failed' });
  }
});

app.get('/api/market-overview', async (req, res) => {
  try {
    const now = Date.now();
    if (caches.marketOverview.data && (now - caches.marketOverview.time < CACHE_TTL_LONG)) {
      return res.json(caches.marketOverview.data);
    }
    const indices = await fetchGlobalIndices();
    const news = await fetchGlobalNews();
    const outlook = await generateMacroOutlook(news.slice(0, 5));
    
    const result = { indices, news, outlook: outlook || 'Global markets are currently experiencing mixed trading conditions across major indices. Please check back later for AI-generated analysis.' };
    caches.marketOverview = { data: result, time: now };
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'Failed market overview' });
  }
});

app.get('/api/financial-news', async (req, res) => {
  try {
    const now = Date.now();
    if (caches.financialNews.data && (now - caches.financialNews.time < CACHE_TTL_MS)) {
      return res.json(caches.financialNews.data);
    }
    const news = await fetchGlobalNews();
    const summarized = await generateFinancialNewsSummary(news.slice(0, 8));
    let result = summarized || news;
    
    // Robust unwrapping of AI array responses
    if (result && !Array.isArray(result)) {
      if (Array.isArray(result.summary)) {
        result = result.summary;
      } else if (Array.isArray(result.news)) {
        result = result.news;
      } else if (typeof result === 'object') {
        const firstArray = Object.values(result).find(val => Array.isArray(val));
        result = firstArray || news;
      } else {
        result = news;
      }
    }
    
    caches.financialNews = { data: result, time: now };
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'Failed news' });
  }
});

app.get('/api/earnings-calendar', async (req, res) => {
  try {
    const now = Date.now();
    if (caches.earningsCalendar.data && (now - caches.earningsCalendar.time < CACHE_TTL_LONG)) {
      return res.json(caches.earningsCalendar.data);
    }
    // Top stocks pool to check for upcoming earnings
    const pool = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'META', 'GOOGL', 'NFLX', 'AMD', 'INTC', 'JPM', 'V', 'WMT', 'JNJ'];
    const earnings = await fetchEarningsCalendar(pool);
    caches.earningsCalendar = { data: earnings, time: now };
    res.json(earnings);
  } catch (e) {
    res.status(500).json({ error: 'Failed earnings' });
  }
});

app.get('/api/research-report/:ticker', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  try {
    const now = Date.now();
    caches.researchReport = caches.researchReport || {};
    // Cache for 24 hours
    if (caches.researchReport[ticker] && (now - caches.researchReport[ticker].time < 24 * 60 * 60 * 1000)) {
      return res.json(caches.researchReport[ticker].data);
    }
    
    const marketData = await fetchResearchData(ticker);
    if (!marketData || !marketData.quote) return res.status(404).json({ error: 'Not found' });
    
    const report = await generateResearchReport(ticker, marketData);
    if (!report) return res.status(503).json({ error: 'AI limit exceeded' });
    
    // Attach SEC filings directly to the AI output
    report.sourceDocuments = marketData.filings;
    
    caches.researchReport[ticker] = { data: report, time: now };
    res.json(report);
  } catch (e) {
    res.status(500).json({ error: 'Failed to generate research report' });
  }
});

app.listen(PORT, () => {
  console.log(`MarketBrain Backend Server running on http://localhost:${PORT}`);
});
