import type {
  MarketIndex, MarketMover, SectorPerformance, StockAnalysis,
  WatchlistItem, EarningsEntry, CompareStock, GlobalIndex, NewsItem
} from '../types';

// ─── Market Indices ──────────────────────────────────────────
export const marketIndices: MarketIndex[] = [
  { name: 'S&P 500', ticker: 'SPX', value: 5248.42, change: 38.72, changePct: 0.74 },
  { name: 'NASDAQ', ticker: 'COMP', value: 16742.39, change: 210.54, changePct: 1.27 },
  { name: 'Dow Jones', ticker: 'DJI', value: 38987.14, change: -124.33, changePct: -0.32 },
  { name: 'Russell 2000', ticker: 'RUT', value: 2082.57, change: 15.87, changePct: 0.77 },
];

export const fearGreedIndex = { value: 64, label: 'Greed' };

// ─── Top Movers ──────────────────────────────────────────────
export const topGainers: MarketMover[] = [
  { ticker: 'NVDA', name: 'NVIDIA Corp', price: 947.07, change: 24.18, changePct: 2.62, volume: '46.2M' },
  { ticker: 'META', name: 'Meta Platforms', price: 512.30, change: 18.75, changePct: 3.80, volume: '22.1M' },
  { ticker: 'TSLA', name: 'Tesla Inc', price: 178.22, change: 9.14, changePct: 5.41, volume: '88.4M' },
  { ticker: 'AMD', name: 'AMD Inc', price: 163.52, change: 7.23, changePct: 4.63, volume: '34.2M' },
  { ticker: 'PLTR', name: 'Palantir Technologies', price: 23.87, change: 1.42, changePct: 6.33, volume: '55.1M' },
];

export const topLosers: MarketMover[] = [
  { ticker: 'INTC', name: 'Intel Corp', price: 29.82, change: -2.31, changePct: -7.19, volume: '92.3M' },
  { ticker: 'PFE', name: 'Pfizer Inc', price: 26.14, change: -1.44, changePct: -5.22, volume: '41.8M' },
  { ticker: 'WBA', name: 'Walgreens Boots', price: 14.73, change: -0.92, changePct: -5.88, volume: '28.6M' },
  { ticker: 'DIS', name: 'Walt Disney Co', price: 99.88, change: -3.12, changePct: -3.03, volume: '19.2M' },
  { ticker: 'CVX', name: 'Chevron Corp', price: 155.40, change: -4.22, changePct: -2.64, volume: '11.4M' },
];

export const trendingStocks: MarketMover[] = [
  ...topGainers.slice(0, 3),
  { ticker: 'AAPL', name: 'Apple Inc', price: 189.30, change: 2.14, changePct: 1.14, volume: '54.3M' },
  { ticker: 'GOOGL', name: 'Alphabet Inc', price: 174.15, change: 1.87, changePct: 1.09, volume: '21.6M' },
  { ticker: 'MSFT', name: 'Microsoft Corp', price: 416.38, change: 3.42, changePct: 0.83, volume: '18.9M' },
];

// ─── Sector Performance ──────────────────────────────────────
export const sectorPerformance: SectorPerformance[] = [
  { sector: 'Technology', changePct: 2.14, leaders: ['NVDA', 'MSFT', 'AAPL'] },
  { sector: 'Communication', changePct: 1.87, leaders: ['META', 'GOOGL', 'NFLX'] },
  { sector: 'Consumer Disc.', changePct: 1.22, leaders: ['AMZN', 'TSLA', 'NKE'] },
  { sector: 'Healthcare', changePct: 0.43, leaders: ['JNJ', 'UNH', 'ABBV'] },
  { sector: 'Financials', changePct: -0.11, leaders: ['JPM', 'BAC', 'WFC'] },
  { sector: 'Energy', changePct: -0.88, leaders: ['XOM', 'CVX', 'COP'] },
  { sector: 'Materials', changePct: -1.24, leaders: ['LIN', 'APD', 'SHW'] },
  { sector: 'Utilities', changePct: -1.55, leaders: ['NEE', 'DUK', 'SO'] },
];

// ─── Global Indices ──────────────────────────────────────────
export const globalIndices: GlobalIndex[] = [
  { name: 'FTSE 100', ticker: 'UKX', country: 'United Kingdom', value: 8247.32, change: 42.18, changePct: 0.51, flag: '🇬🇧' },
  { name: 'DAX', ticker: 'DAX', country: 'Germany', value: 18182.74, change: -88.24, changePct: -0.48, flag: '🇩🇪' },
  { name: 'Nikkei 225', ticker: 'NI225', country: 'Japan', value: 38682.11, change: 224.16, changePct: 0.58, flag: '🇯🇵' },
  { name: 'Shanghai', ticker: 'SSE', country: 'China', value: 3104.82, change: -24.55, changePct: -0.78, flag: '🇨🇳' },
  { name: 'Hang Seng', ticker: 'HSI', country: 'Hong Kong', value: 18288.43, change: 112.74, changePct: 0.62, flag: '🇭🇰' },
  { name: 'CAC 40', ticker: 'FCHI', country: 'France', value: 8088.52, change: -18.32, changePct: -0.23, flag: '🇫🇷' },
  { name: 'ASX 200', ticker: 'AS51', country: 'Australia', value: 7844.23, change: 31.67, changePct: 0.41, flag: '🇦🇺' },
  { name: 'TSX', ticker: 'TSX', country: 'Canada', value: 22142.87, change: 88.42, changePct: 0.40, flag: '🇨🇦' },
];

// ─── NVDA Mock Analysis ──────────────────────────────────────
function generatePriceHistory(days: number, basePrice: number, volatility: number): { time: string; price: number }[] {
  const data = [];
  let price = basePrice * 0.85;
  const now = new Date('2024-05-17');
  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    price = price * (1 + (Math.random() - 0.48) * volatility);
    price = Math.max(price, basePrice * 0.6);
    data.push({
      time: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: parseFloat(price.toFixed(2)),
    });
  }
  return data;
}

const nvdaNews: NewsItem[] = [
  {
    id: 'n1',
    headline: 'NVIDIA announces new AI chip for next-gen data centers, stock surges',
    source: 'Reuters',
    time: '1 hour ago',
    sentiment: 'Positive',
    url: '#',
    summary: 'NVIDIA unveiled its next-generation Blackwell architecture chips aimed at hyperscale cloud providers.',
  },
  {
    id: 'n2',
    headline: 'NVIDIA partners with major cloud providers to expand AI infrastructure',
    source: 'Bloomberg',
    time: '3 hours ago',
    sentiment: 'Positive',
    url: '#',
    summary: 'The partnerships span AWS, Azure, and Google Cloud, covering multi-year compute commitments.',
  },
  {
    id: 'n3',
    headline: 'NVIDIA faces new competition in AI chip market from AMD and Intel',
    source: 'CNBC',
    time: '5 hours ago',
    sentiment: 'Neutral',
    url: '#',
    summary: 'While competition is increasing, analysts believe NVIDIA maintains a significant moat.',
  },
  {
    id: 'n4',
    headline: 'NVIDIA Q1 earnings preview: expectations at all-time high',
    source: 'MarketWatch',
    time: '1 day ago',
    sentiment: 'Positive',
    url: '#',
    summary: 'Wall Street consensus estimates project 250%+ YoY revenue growth for Q1 fiscal 2025.',
  },
  {
    id: 'n5',
    headline: 'Analysts raise NVIDIA price targets ahead of quarterly results',
    source: 'Barron\'s',
    time: '2 days ago',
    sentiment: 'Positive',
    url: '#',
    summary: 'Multiple buy-side analysts increased their 12-month targets to over $1,200.',
  },
];

export const mockStocks: Record<string, StockAnalysis> = {
  NVDA: {
    quote: {
      ticker: 'NVDA',
      name: 'NVIDIA Corporation',
      exchange: 'NASDAQ',
      price: 947.07,
      change: 24.18,
      changePct: 2.62,
      open: 933.12,
      high: 950.30,
      low: 929.75,
      prevClose: 922.89,
      volume: '46.2M',
      avgVolume: '44.8M',
      marketCap: '2.34T',
      sector: 'Technology',
      industry: 'Semiconductors',
    },
    recommendation: {
      recommendation: 'STRONG BUY',
      confidence: 87,
      scores: { fundamentals: 84, technicals: 78, sentiment: 92, valuation: 72 },
      overall: 87,
      summary: 'NVIDIA shows exceptional fundamental strength combined with strong technical momentum and overwhelmingly positive news sentiment. The company\'s dominant position in AI accelerator hardware provides a durable competitive moat.',
    },
    financialHealth: {
      marketCap: '2.34T',
      peRatio: 75.21,
      pegRatio: 1.32,
      roe: '68.35%',
      debtToEquity: 0.13,
      currentRatio: 3.45,
      eps: 12.62,
      revenueGrowth: '122%',
      grossMargin: '76.7%',
      operatingMargin: '54.1%',
    },
    technicals: [
      { name: 'RSI (14)', value: '58.21', signal: 'Neutral' },
      { name: 'MACD', value: '2.35', signal: 'Bullish' },
      { name: '50 MA', value: '931.23', signal: 'Above' },
      { name: '200 MA', value: '876.41', signal: 'Above' },
      { name: 'Trend', value: 'Uptrend', signal: 'Bullish' },
      { name: 'Bollinger Bands', value: 'Normal', signal: 'Neutral' },
    ],
    keyStats: [
      { label: '52 Week High', value: '$974.00' },
      { label: '52 Week Low', value: '$204.21' },
      { label: 'Beta (5Y)', value: '1.68' },
      { label: 'Dividend Yield', value: '0.04%' },
      { label: 'Employees', value: '29,600' },
      { label: 'Next Earnings', value: 'May 22, 2024' },
      { label: 'Float', value: '24.42B' },
      { label: 'Short Float', value: '0.83%' },
    ],
    news: nvdaNews,
    priceHistory: generatePriceHistory(365, 947, 0.03),
  },
  AAPL: {
    quote: {
      ticker: 'AAPL',
      name: 'Apple Inc.',
      exchange: 'NASDAQ',
      price: 189.30,
      change: 2.14,
      changePct: 1.14,
      open: 187.22,
      high: 190.12,
      low: 186.88,
      prevClose: 187.16,
      volume: '54.3M',
      avgVolume: '58.7M',
      marketCap: '2.92T',
      sector: 'Technology',
      industry: 'Consumer Electronics',
    },
    recommendation: {
      recommendation: 'BUY',
      confidence: 74,
      scores: { fundamentals: 78, technicals: 65, sentiment: 72, valuation: 68 },
      overall: 74,
      summary: 'Apple demonstrates consistent revenue growth and dominant brand equity. Services segment growth offsets hardware slowdown.',
    },
    financialHealth: {
      marketCap: '2.92T',
      peRatio: 29.14,
      pegRatio: 2.21,
      roe: '145.2%',
      debtToEquity: 1.79,
      currentRatio: 1.07,
      eps: 6.49,
      revenueGrowth: '4.8%',
      grossMargin: '45.5%',
      operatingMargin: '29.8%',
    },
    technicals: [
      { name: 'RSI (14)', value: '52.40', signal: 'Neutral' },
      { name: 'MACD', value: '0.84', signal: 'Bullish' },
      { name: '50 MA', value: '185.22', signal: 'Above' },
      { name: '200 MA', value: '179.50', signal: 'Above' },
      { name: 'Trend', value: 'Uptrend', signal: 'Bullish' },
      { name: 'Bollinger Bands', value: 'Mid', signal: 'Neutral' },
    ],
    keyStats: [
      { label: '52 Week High', value: '$199.62' },
      { label: '52 Week Low', value: '$164.08' },
      { label: 'Beta (5Y)', value: '1.28' },
      { label: 'Dividend Yield', value: '0.51%' },
      { label: 'Employees', value: '150,000' },
      { label: 'Next Earnings', value: 'Jul 30, 2024' },
      { label: 'Float', value: '15.43B' },
      { label: 'Short Float', value: '0.73%' },
    ],
    news: [
      { id: 'a1', headline: 'Apple Vision Pro shipments exceed expectations in first quarter', source: 'WSJ', time: '2 hours ago', sentiment: 'Positive', url: '#' },
      { id: 'a2', headline: 'Apple Services revenue hits new record in fiscal Q2 2024', source: 'Bloomberg', time: '5 hours ago', sentiment: 'Positive', url: '#' },
      { id: 'a3', headline: 'iPhone sales soften in China amid local competition pressure', source: 'Reuters', time: '1 day ago', sentiment: 'Negative', url: '#' },
    ],
    priceHistory: generatePriceHistory(365, 189, 0.02),
  },
  TSLA: {
    quote: {
      ticker: 'TSLA',
      name: 'Tesla, Inc.',
      exchange: 'NASDAQ',
      price: 178.22,
      change: 9.14,
      changePct: 5.41,
      open: 169.50,
      high: 180.88,
      low: 168.44,
      prevClose: 169.08,
      volume: '88.4M',
      avgVolume: '92.2M',
      marketCap: '567.8B',
      sector: 'Consumer Discretionary',
      industry: 'Electric Vehicles',
    },
    recommendation: {
      recommendation: 'HOLD',
      confidence: 52,
      scores: { fundamentals: 48, technicals: 55, sentiment: 60, valuation: 35 },
      overall: 52,
      summary: 'Tesla faces near-term margin pressure and intensifying EV competition. Energy segment provides upside optionality.',
    },
    financialHealth: {
      marketCap: '567.8B',
      peRatio: 48.22,
      pegRatio: 3.12,
      roe: '18.7%',
      debtToEquity: 0.07,
      currentRatio: 1.73,
      eps: 3.70,
      revenueGrowth: '8.8%',
      grossMargin: '17.8%',
      operatingMargin: '5.5%',
    },
    technicals: [
      { name: 'RSI (14)', value: '62.30', signal: 'Neutral' },
      { name: 'MACD', value: '-1.22', signal: 'Bearish' },
      { name: '50 MA', value: '175.48', signal: 'Above' },
      { name: '200 MA', value: '220.14', signal: 'Below' },
      { name: 'Trend', value: 'Sideways', signal: 'Neutral' },
      { name: 'Bollinger Bands', value: 'Upper', signal: 'Neutral' },
    ],
    keyStats: [
      { label: '52 Week High', value: '$299.29' },
      { label: '52 Week Low', value: '$138.80' },
      { label: 'Beta (5Y)', value: '2.31' },
      { label: 'Dividend Yield', value: 'N/A' },
      { label: 'Employees', value: '140,473' },
      { label: 'Next Earnings', value: 'Jul 23, 2024' },
      { label: 'Float', value: '3.20B' },
      { label: 'Short Float', value: '3.12%' },
    ],
    news: [
      { id: 't1', headline: 'Tesla launches cheaper Model Y variant to boost volume sales', source: 'Reuters', time: '3 hours ago', sentiment: 'Positive', url: '#' },
      { id: 't2', headline: 'Tesla Cybertruck production ramp-up slower than anticipated', source: 'CNBC', time: '6 hours ago', sentiment: 'Negative', url: '#' },
      { id: 't3', headline: 'Tesla FSD v12 receives positive early user reviews', source: 'Electrek', time: '1 day ago', sentiment: 'Positive', url: '#' },
    ],
    priceHistory: generatePriceHistory(365, 178, 0.045),
  },
  MSFT: {
    quote: {
      ticker: 'MSFT',
      name: 'Microsoft Corporation',
      exchange: 'NASDAQ',
      price: 416.38,
      change: 3.42,
      changePct: 0.83,
      open: 413.10,
      high: 418.22,
      low: 412.88,
      prevClose: 412.96,
      volume: '18.9M',
      avgVolume: '21.2M',
      marketCap: '3.09T',
      sector: 'Technology',
      industry: 'Software',
    },
    recommendation: {
      recommendation: 'BUY',
      confidence: 80,
      scores: { fundamentals: 85, technicals: 72, sentiment: 88, valuation: 65 },
      overall: 80,
      summary: 'Microsoft\'s Azure AI leadership and Office 365 stickiness make it a core holding. Copilot monetization is ahead of schedule.',
    },
    financialHealth: {
      marketCap: '3.09T',
      peRatio: 36.42,
      pegRatio: 2.14,
      roe: '38.5%',
      debtToEquity: 0.35,
      currentRatio: 1.77,
      eps: 11.43,
      revenueGrowth: '17.0%',
      grossMargin: '69.8%',
      operatingMargin: '44.6%',
    },
    technicals: [
      { name: 'RSI (14)', value: '55.80', signal: 'Neutral' },
      { name: 'MACD', value: '1.88', signal: 'Bullish' },
      { name: '50 MA', value: '408.22', signal: 'Above' },
      { name: '200 MA', value: '382.14', signal: 'Above' },
      { name: 'Trend', value: 'Uptrend', signal: 'Bullish' },
      { name: 'Bollinger Bands', value: 'Mid-High', signal: 'Neutral' },
    ],
    keyStats: [
      { label: '52 Week High', value: '$430.82' },
      { label: '52 Week Low', value: '$309.45' },
      { label: 'Beta (5Y)', value: '0.90' },
      { label: 'Dividend Yield', value: '0.72%' },
      { label: 'Employees', value: '221,000' },
      { label: 'Next Earnings', value: 'Jul 24, 2024' },
      { label: 'Float', value: '7.44B' },
      { label: 'Short Float', value: '0.53%' },
    ],
    news: [
      { id: 'm1', headline: 'Microsoft Copilot adoption accelerates across enterprise customers', source: 'Bloomberg', time: '1 hour ago', sentiment: 'Positive', url: '#' },
      { id: 'm2', headline: 'Azure growth reaccelerates to 31% in Q3 fiscal 2024', source: 'CNBC', time: '4 hours ago', sentiment: 'Positive', url: '#' },
      { id: 'm3', headline: 'Activision integration progressing, gaming revenue up 51% YoY', source: 'Reuters', time: '8 hours ago', sentiment: 'Positive', url: '#' },
    ],
    priceHistory: generatePriceHistory(365, 416, 0.018),
  },
};

// ─── Watchlist ───────────────────────────────────────────────
export const defaultWatchlist: WatchlistItem[] = [
  { ticker: 'NVDA', name: 'NVIDIA Corporation', price: 947.07, change: 24.18, changePct: 2.62, recommendation: 'STRONG BUY', confidence: 87, lastUpdated: '2 min ago' },
  { ticker: 'AAPL', name: 'Apple Inc.', price: 189.30, change: 2.14, changePct: 1.14, recommendation: 'BUY', confidence: 74, lastUpdated: '5 min ago' },
  { ticker: 'MSFT', name: 'Microsoft Corporation', price: 416.38, change: 3.42, changePct: 0.83, recommendation: 'BUY', confidence: 80, lastUpdated: '3 min ago' },
  { ticker: 'TSLA', name: 'Tesla, Inc.', price: 178.22, change: 9.14, changePct: 5.41, recommendation: 'HOLD', confidence: 52, lastUpdated: '7 min ago' },
  { ticker: 'META', name: 'Meta Platforms', price: 512.30, change: 18.75, changePct: 3.80, recommendation: 'BUY', confidence: 78, lastUpdated: '4 min ago' },
];

// ─── Earnings Calendar ───────────────────────────────────────
export const earningsCalendar: EarningsEntry[] = [
  { ticker: 'NVDA', company: 'NVIDIA Corporation', date: 'Today', time: 'After Close', estimatedEPS: 5.52, expectedRevenue: '$24.6B', lastEPS: 3.71, sector: 'Technology' },
  { ticker: 'CSCO', company: 'Cisco Systems', date: 'Today', time: 'After Close', estimatedEPS: 0.88, expectedRevenue: '$12.7B', lastEPS: 0.91, sector: 'Technology' },
  { ticker: 'DIS', company: 'Walt Disney Co.', date: 'Tomorrow', time: 'Before Open', estimatedEPS: 1.10, expectedRevenue: '$22.2B', lastEPS: 1.03, sector: 'Communication' },
  { ticker: 'SHOP', company: 'Shopify Inc.', date: 'Tomorrow', time: 'Before Open', estimatedEPS: 0.19, expectedRevenue: '$1.99B', lastEPS: 0.34, sector: 'Technology' },
  { ticker: 'AMAT', company: 'Applied Materials', date: 'Tomorrow', time: 'After Close', estimatedEPS: 2.01, expectedRevenue: '$6.65B', lastEPS: 2.09, sector: 'Technology' },
  { ticker: 'PANW', company: 'Palo Alto Networks', date: 'This Week', time: 'After Close', estimatedEPS: 1.34, expectedRevenue: '$1.98B', lastEPS: 1.17, sector: 'Technology' },
  { ticker: 'BABA', company: 'Alibaba Group', date: 'This Week', time: 'Before Open', estimatedEPS: 1.42, expectedRevenue: '$30.5B', lastEPS: 1.49, sector: 'Consumer Disc.' },
  { ticker: 'JD', company: 'JD.com Inc.', date: 'This Week', time: 'Before Open', estimatedEPS: 0.62, expectedRevenue: '$35.2B', lastEPS: 0.56, sector: 'Consumer Disc.' },
  { ticker: 'DDOG', company: 'Datadog Inc.', date: 'This Week', time: 'After Close', estimatedEPS: 0.37, expectedRevenue: '$587M', lastEPS: 0.44, sector: 'Technology' },
  { ticker: 'ZM', company: 'Zoom Video Comm.', date: 'This Week', time: 'After Close', estimatedEPS: 1.18, expectedRevenue: '$1.13B', lastEPS: 1.22, sector: 'Technology' },
];

// ─── Financial News ───────────────────────────────────────────
export const financialNews: NewsItem[] = [
  { id: 'fn1', headline: 'Fed signals possible rate cuts in second half of 2024 amid cooling inflation', source: 'Reuters', time: '30 min ago', sentiment: 'Positive', url: '#', summary: 'Federal Reserve officials indicated growing confidence that inflation is on track to reach the 2% target, opening the door for rate reductions.' },
  { id: 'fn2', headline: 'NVIDIA market cap crosses $2.5 trillion milestone for the first time', source: 'Bloomberg', time: '1 hour ago', sentiment: 'Positive', url: '#', summary: 'NVIDIA became only the third company in history to reach a $2.5 trillion market capitalization, surpassing Apple briefly.' },
  { id: 'fn3', headline: 'S&P 500 hits new all-time high as tech stocks lead broad market rally', source: 'CNBC', time: '2 hours ago', sentiment: 'Positive', url: '#', summary: 'The benchmark index closed at a new record high, driven by strong earnings beats across the technology sector.' },
  { id: 'fn4', headline: 'Apple Vision Pro returns surge as early adopters cite high price point', source: 'WSJ', time: '3 hours ago', sentiment: 'Negative', url: '#', summary: 'Return rates for the $3,499 headset are reportedly running 3x higher than other Apple product launches.' },
  { id: 'fn5', headline: 'China\'s economy shows signs of recovery with stronger-than-expected PMI data', source: 'Financial Times', time: '4 hours ago', sentiment: 'Positive', url: '#', summary: 'Manufacturing activity expanded for the first time in three months, raising hopes for a sustained recovery.' },
  { id: 'fn6', headline: 'Tesla cuts EV prices in Europe and China for the third time this year', source: 'Reuters', time: '5 hours ago', sentiment: 'Neutral', url: '#', summary: 'The price reductions range from 3% to 8% across Model 3 and Model Y variants in key international markets.' },
  { id: 'fn7', headline: 'Microsoft Azure growth reaccelerates as AI demand drives enterprise spending', source: 'Bloomberg', time: '6 hours ago', sentiment: 'Positive', url: '#', summary: 'Cloud revenue grew 31% year-over-year, beating analyst estimates by 2 percentage points.' },
  { id: 'fn8', headline: 'Oil prices dip as OPEC+ hints at potential production increase later this year', source: 'MarketWatch', time: '7 hours ago', sentiment: 'Negative', url: '#', summary: 'Brent crude fell 1.8% after OPEC+ statements suggested the alliance could begin unwinding production cuts.' },
  { id: 'fn9', headline: 'Palantir wins $480M US Army AI contract extension, shares jump 8%', source: 'Barron\'s', time: '8 hours ago', sentiment: 'Positive', url: '#', summary: 'The multi-year contract extends Palantir\'s work on the Army\'s Vantage battlefield intelligence system.' },
  { id: 'fn10', headline: 'Goldman Sachs raises year-end S&P 500 target to 5,600 on AI earnings tailwind', source: 'CNBC', time: '1 day ago', sentiment: 'Positive', url: '#', summary: 'The investment bank cites stronger-than-expected AI-driven revenue growth across the mega-cap technology sector.' },
  { id: 'fn11', headline: 'Retail sales data misses estimates, raising questions about consumer spending', source: 'Reuters', time: '1 day ago', sentiment: 'Negative', url: '#', summary: 'April retail sales came in flat versus expectations of 0.4% growth, suggesting some consumer fatigue.' },
  { id: 'fn12', headline: 'AMD launches MI300X AI chip shipments to hyperscale customers globally', source: 'TechCrunch', time: '2 days ago', sentiment: 'Positive', url: '#', summary: 'Advanced Micro Devices began shipping its latest AI accelerator to major cloud providers, positioning it as a direct NVIDIA competitor.' },
];

// ─── Compare Stocks ───────────────────────────────────────────
export const compareStocksData: Record<string, CompareStock> = {
  NVDA: {
    ticker: 'NVDA', name: 'NVIDIA Corp', price: 947.07, change: 24.18, changePct: 2.62,
    marketCap: '$2.34T', peRatio: 75.21, roe: '68.35%', rsi: 58.2,
    recommendation: 'STRONG BUY', confidence: 87,
    newsSentiment: 'Positive', technicalRating: 'Bullish',
    revenue: [16920, 26974, 44870, 60920, 80000],
    aiScore: [72, 78, 82, 85, 87],
  },
  AAPL: {
    ticker: 'AAPL', name: 'Apple Inc', price: 189.30, change: 2.14, changePct: 1.14,
    marketCap: '$2.92T', peRatio: 29.14, roe: '145.2%', rsi: 52.4,
    recommendation: 'BUY', confidence: 74,
    newsSentiment: 'Positive', technicalRating: 'Bullish',
    revenue: [274515, 365817, 394328, 383285, 390000],
    aiScore: [65, 68, 72, 71, 74],
  },
  MSFT: {
    ticker: 'MSFT', name: 'Microsoft Corp', price: 416.38, change: 3.42, changePct: 0.83,
    marketCap: '$3.09T', peRatio: 36.42, roe: '38.5%', rsi: 55.8,
    recommendation: 'BUY', confidence: 80,
    newsSentiment: 'Positive', technicalRating: 'Bullish',
    revenue: [143015, 168088, 198270, 211915, 245000],
    aiScore: [70, 72, 76, 78, 80],
  },
  TSLA: {
    ticker: 'TSLA', name: 'Tesla Inc', price: 178.22, change: 9.14, changePct: 5.41,
    marketCap: '$567.8B', peRatio: 48.22, roe: '18.7%', rsi: 62.3,
    recommendation: 'HOLD', confidence: 52,
    newsSentiment: 'Neutral', technicalRating: 'Neutral',
    revenue: [31536, 53823, 81462, 97690, 105000],
    aiScore: [55, 58, 54, 50, 52],
  },
};

// ─── Recent News (for dashboard) ─────────────────────────────
export const recentMarketNews = financialNews.slice(0, 5);

// ─── Revenue comparison labels ────────────────────────────────
export const revenueYears = ['FY2020', 'FY2021', 'FY2022', 'FY2023', 'FY2024E'];

// ─── Price performance chart (multi-stock) ────────────────────
export function generatePerfData(tickers: string[]) {
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const starts: Record<string, number> = { NVDA: 100, AAPL: 100, MSFT: 100, TSLA: 100, META: 100 };
  const growth: Record<string, number> = { NVDA: 0.08, AAPL: 0.02, MSFT: 0.04, TSLA: -0.02, META: 0.06 };
  return labels.map((month) => {
    const entry: Record<string, number | string> = { month };
    tickers.forEach((t) => {
      starts[t] = (starts[t] || 100) * (1 + (growth[t] || 0.02) + (Math.random() - 0.4) * 0.05);
      entry[t] = parseFloat(starts[t].toFixed(1));
    });
    return entry;
  });
}
