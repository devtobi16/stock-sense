const FINNHUB_KEY = process.env.FINNHUB_API_KEY || 'd969j21r01qsd323k0q0d969j21r01qsd323k0qg';

async function fetchFinnhub(endpoint) {
  const url = `https://finnhub.io/api/v1${endpoint}${endpoint.includes('?') ? '&' : '?'}token=${FINNHUB_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Finnhub error: ${res.status}`);
  return await res.json();
}

function getPastDate(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

async function fetchTickerData(ticker) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const oneWeekAgo = getPastDate(7);
    
    const [quote, news] = await Promise.all([
      fetchFinnhub(`/quote?symbol=${ticker}`),
      fetchFinnhub(`/company-news?symbol=${ticker}&from=${oneWeekAgo}&to=${today}`)
    ]);
    
    return {
      ticker,
      price: quote.c,
      changePct: quote.dp,
      news: (Array.isArray(news) ? news : []).slice(0, 5).map(n => ({
        title: n.headline,
        publisher: n.source,
        link: n.url,
        time: n.datetime * 1000
      }))
    };
  } catch (error) {
    console.error(`Error fetching data for ${ticker}:`, error.message);
    return null;
  }
}

async function fetchMarketData(tickers) {
  const promises = tickers.map(t => fetchTickerData(t));
  const results = await Promise.all(promises);
  return results.filter(r => r !== null);
}

async function fetchTrendingSymbols() {
  return ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN'];
}

async function fetchHistoricalData(ticker) {
  try {
    const to = Math.floor(Date.now() / 1000);
    const from = to - (90 * 24 * 60 * 60);
    const candles = await fetchFinnhub(`/stock/candle?symbol=${ticker}&resolution=D&from=${from}&to=${to}`);
    if (candles.s !== 'ok') return [];
    return candles.t.map((t, i) => ({
      date: new Date(t * 1000).toISOString(),
      close: candles.c[i]
    }));
  } catch (error) {
    return [];
  }
}

async function fetchDetailedQuote(ticker) {
  try {
    const [quote, profile, metrics] = await Promise.all([
      fetchFinnhub(`/quote?symbol=${ticker}`),
      fetchFinnhub(`/stock/profile2?symbol=${ticker}`),
      fetchFinnhub(`/stock/metric?symbol=${ticker}&metric=all`)
    ]);
    
    const metricData = metrics.metric || {};
    return {
      quote: {
        symbol: ticker,
        shortName: profile.name || ticker,
        longName: profile.name || ticker,
        regularMarketPrice: quote.c,
        regularMarketChange: quote.d,
        regularMarketChangePercent: quote.dp,
        regularMarketVolume: 0,
        regularMarketOpen: quote.o,
        regularMarketDayHigh: quote.h,
        regularMarketDayLow: quote.l,
        regularMarketPreviousClose: quote.pc
      },
      summary: {
        defaultKeyStatistics: {
          sharesOutstanding: profile.shareOutstanding || 0,
          beta: metricData.beta || 0,
        },
        financialData: {
          currentPrice: quote.c,
        },
        summaryDetail: {
          marketCap: profile.marketCapitalization ? profile.marketCapitalization * 1e6 : 0,
          trailingPE: metricData.peBasicExclExtraTTM || 0,
          fiftyTwoWeekHigh: metricData['52WeekHigh'] || 0,
          fiftyTwoWeekLow: metricData['52WeekLow'] || 0,
        }
      }
    };
  } catch (e) {
    return null;
  }
}

async function fetchGlobalIndices() {
  try {
    const indices = [
      { t: 'SPY', name: 'S&P 500 ETF' },
      { t: 'QQQ', name: 'Nasdaq ETF' },
      { t: 'DIA', name: 'Dow Jones ETF' }
    ];
    const quotes = await Promise.all(indices.map(i => fetchFinnhub(`/quote?symbol=${i.t}`).catch(() => null)));
    
    return quotes.filter(q => q !== null).map((q, idx) => ({
      name: indices[idx].name,
      ticker: indices[idx].t,
      value: q.c,
      change: q.d,
      changePct: q.dp
    }));
  } catch (e) {
    return [];
  }
}

function timeAgo(rawTime) {
  const ms = Date.now() - (rawTime * 1000);
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

async function fetchGlobalNews() {
  try {
    const news = await fetchFinnhub(`/news?category=general`);
    return (Array.isArray(news) ? news : []).slice(0, 15).map(n => ({
      id: n.id || String(Math.random()),
      headline: n.headline,
      source: n.source,
      time: timeAgo(n.datetime),
      url: n.url
    }));
  } catch (e) {
    return [];
  }
}

async function fetchEarningsCalendar(tickers) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = getPastDate(-30);
    const calendar = await fetchFinnhub(`/calendar/earnings?from=${today}&to=${nextMonth}`);
    
    const earnings = calendar.earningsCalendar || [];
    const relevant = earnings.filter(e => tickers.includes(e.symbol));
    
    return relevant.map(q => {
      const earnDate = new Date(q.date);
      return {
        ticker: q.symbol,
        company: q.symbol,
        date: earnDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        timestamp: Math.floor(earnDate.getTime() / 1000),
        lastEPS: q.epsActual || 0,
        sector: q.epsEstimate || 0
      };
    }).sort((a, b) => a.timestamp - b.timestamp);
  } catch (e) {
    return [];
  }
}

async function fetchResearchData(ticker) {
  try {
    const detailed = await fetchDetailedQuote(ticker);
    if (!detailed) return null;
    
    const edgarSearchUrl = `https://www.sec.gov/edgar/searchedgar/companysearch.html?CIK=${ticker}`;
    const filings = [
      { type: 'General', title: 'Search Latest SEC EDGAR Filings', url: edgarSearchUrl, date: 'Live' }
    ];

    return {
      quote: detailed.quote,
      financialData: detailed.summary.financialData,
      keyStatistics: detailed.summary.defaultKeyStatistics,
      summaryDetail: detailed.summary.summaryDetail,
      earningsHistory: [],
      filings
    };
  } catch (error) {
    return null;
  }
}

module.exports = { 
  fetchMarketData, fetchTickerData, fetchTrendingSymbols, fetchHistoricalData,
  fetchDetailedQuote, fetchGlobalIndices, fetchGlobalNews, fetchEarningsCalendar,
  fetchResearchData
};
