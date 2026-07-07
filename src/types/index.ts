// ─── Navigation ──────────────────────────────────────────────
export type PageId =
  | 'dashboard'
  | 'thesis-feed'
  | 'stock-detail'
  | 'stock-analysis'
  | 'compare-stocks'
  | 'watchlist'
  | 'market-overview'
  | 'financial-news'
  | 'earnings-calendar'
  | 'research-report'
  | 'about';

export interface NavItem {
  id: PageId;
  icon: string;
  title: string;
  description: string;
}

// ─── Market ──────────────────────────────────────────────────
export interface MarketIndex {
  name: string;
  ticker: string;
  value: number;
  change: number;
  changePct: number;
}

export interface MarketMover {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  volume: string;
}

export interface SectorPerformance {
  sector: string;
  changePct: number;
  leaders: string[];
}

// ─── Stock ───────────────────────────────────────────────────
export type Recommendation = 'STRONG BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG SELL';

export interface StockQuote {
  ticker: string;
  name: string;
  exchange: string;
  price: number;
  change: number;
  changePct: number;
  open: number;
  high: number;
  low: number;
  prevClose: number;
  volume: string;
  avgVolume: string;
  marketCap: string;
  sector: string;
  industry: string;
}

export interface AIRecommendation {
  recommendation: Recommendation;
  confidence: number;
  scores: {
    fundamentals: number;
    technicals: number;
    sentiment: number;
    valuation: number;
  };
  overall: number;
  summary: string;
}

export interface FinancialHealth {
  marketCap: string;
  peRatio: number;
  pegRatio: number;
  roe: string;
  debtToEquity: number;
  currentRatio: number;
  eps: number;
  revenueGrowth: string;
  grossMargin: string;
  operatingMargin: string;
}

export interface TechnicalIndicator {
  name: string;
  value: string;
  signal: 'Bullish' | 'Bearish' | 'Neutral' | 'Above' | 'Below';
}

export interface KeyStatistic {
  label: string;
  value: string;
}

export interface PriceDataPoint {
  time: string;
  price: number;
  volume?: number;
  open?: number;
  close?: number;
  high?: number;
  low?: number;
}

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  time: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  url: string;
  thumbnail?: string;
  summary?: string;
}

export interface NarrativeEvent {
  date: string;
  event: string;
  impact: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  type: 'Signal' | 'Noise';
}

export interface ThesisCardData {
  ticker: string;
  companyName: string;
  bias: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
  price: number;
  change: number;
  changePct: number;
  summary: string;
  keyDrivers: string[];
  whatChanged: { date: string; text: string }[];
  bullCase: string[];
  bearCase: string[];
}

export interface StockAnalysis {
  quote: StockQuote;
  recommendation: AIRecommendation;
  financialHealth: FinancialHealth;
  technicals: TechnicalIndicator[];
  keyStats: KeyStatistic[];
  news: NewsItem[];
  priceHistory: PriceDataPoint[];
  narrativeTimeline?: NarrativeEvent[];
  thesis?: ThesisCardData;
}

// ─── Watchlist ───────────────────────────────────────────────
export interface WatchlistItem {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  recommendation: Recommendation;
  confidence: number;
  lastUpdated: string;
}

// ─── Earnings ────────────────────────────────────────────────
export type EarningsTime = 'Before Open' | 'After Close' | 'During Market';

export interface EarningsEntry {
  ticker: string;
  company: string;
  date: string;
  time: EarningsTime;
  estimatedEPS: number;
  expectedRevenue: string;
  lastEPS: number;
  sector: string;
}

// ─── Compare Stocks ──────────────────────────────────────────
export interface CompareStock {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  marketCap: string;
  peRatio: number;
  roe: string;
  rsi: number;
  recommendation: Recommendation;
  confidence: number;
  newsSentiment: 'Positive' | 'Neutral' | 'Negative';
  technicalRating: 'Bullish' | 'Neutral' | 'Bearish';
  revenue: number[];
  aiScore: number[];
}

// ─── Global Indices ──────────────────────────────────────────
export interface GlobalIndex {
  name: string;
  ticker: string;
  country: string;
  value: number;
  change: number;
  changePct: number;
  flag: string;
}
