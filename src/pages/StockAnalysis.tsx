import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Bot, TrendingUp, Activity, BarChart3,
  Newspaper, Star, Sparkles, AlertCircle, FileText
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Card, CardHeader, ProgressBar, StatRow, Skeleton } from '../components/ui';
import CircularProgress from '../components/charts/CircularProgress';
import {
  cn, formatPrice, formatChange, formatChangePct,
  getChangeColor, getRecommendationBadge, getSignalColor, getSentimentBadge
} from '../lib/utils';
import type { PageId } from '../types';
import { API_BASE_URL } from '../config';

const TIME_FILTERS = ['1D', '5D', '1M', '6M', 'YTD', '1Y', '5Y'];

interface StockAnalysisProps {
  initialTicker?: string;
  onNavigate: (page: PageId, ticker?: string) => void;
}

const ChartTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-green-100 rounded-xl px-3 py-2 shadow-lg">
        <p className="text-xs text-slate-400">{payload[0]?.payload?.time}</p>
        <p className="text-sm font-bold text-green-700">${formatPrice(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

const DONUT_COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac'];

export default function StockAnalysis({ initialTicker = '', onNavigate }: StockAnalysisProps) {
  const [ticker, setTicker] = useState(initialTicker);
  const [analyzed, setAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState('1Y');
  const [currentData, setCurrentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async (sym?: string) => {
    const t = (sym || ticker).trim().toUpperCase();
    if (!t) return;
    setLoading(true);
    setAnalyzed(false);
    setError(null);
    setTicker(t);
    try {
      const res = await fetch(`${API_BASE_URL}/api/stock-analysis/${t}`);
      if (!res.ok) {
        if (res.status === 503) {
          throw new Error('AI rate limit exceeded. Please wait a minute and try again.');
        } else if (res.status === 404) {
          throw new Error(`Stock ${t} not found.`);
        }
        throw new Error('Failed to analyze stock.');
      }
      setCurrentData(await res.json());
      setAnalyzed(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  // Auto-analyze when navigated from another tab with a ticker
  useEffect(() => {
    if (initialTicker) {
      handleAnalyze(initialTicker);
    }
  }, [initialTicker]); // eslint-disable-line react-hooks/exhaustive-deps

  const getChartData = () => {
    if (!currentData?.priceHistory) return [];
    const history = currentData.priceHistory;
    const sliceMap: Record<string, number> = {
      '1D': 1, '5D': 5, '1M': 22, '6M': 130, 'YTD': 140, '1Y': 252, '5Y': history.length,
    };
    return history.slice(-(sliceMap[timeFilter] ?? 252));
  };

  const donutData = currentData
    ? [
        { name: 'Fundamentals', value: currentData.recommendation.scores.fundamentals },
        { name: 'Technicals', value: currentData.recommendation.scores.technicals },
        { name: 'Sentiment', value: currentData.recommendation.scores.sentiment },
        { name: 'Valuation', value: currentData.recommendation.scores.valuation },
      ]
    : [];

  return (
    <div className="p-6 space-y-5 max-w-[1400px]">
      {/* Search Bar */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-3">
          <h1 className="text-2xl font-bold text-slate-800">Stock Analysis</h1>
          <p className="text-sm text-slate-500 mt-0.5">AI-powered deep analysis of any public company</p>
        </div>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              placeholder="Enter ticker symbol — e.g. NVDA, AAPL, MSFT..."
              className="input-field pl-10 text-sm"
            />
          </div>
          <div className="flex gap-2">
            {['NVDA', 'AAPL', 'MSFT', 'TSLA'].map((t) => (
              <button
                key={t}
                onClick={() => setTicker(t)}
                className={cn(
                  'px-3 py-2 rounded-xl text-xs font-semibold border transition-all',
                  ticker === t
                    ? 'bg-green-600 border-green-600 text-white shadow-[0_2px_8px_rgba(22,163,74,0.3)]'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-green-400 hover:text-green-700'
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleAnalyze()} disabled={loading} className="btn-primary flex items-center gap-2 whitespace-nowrap">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Bot size={16} />
                  Analyze
                </>
              )}
            </button>
            <button 
              onClick={() => onNavigate('research-report', ticker)}
              className="btn-ghost flex items-center gap-2 whitespace-nowrap border border-slate-200"
            >
              <FileText size={16} />
              📄 View Earnings Report
            </button>
          </div>
        </div>
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-32 col-span-2" />
            <Skeleton className="h-32" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48" />)}
          </div>
          <Skeleton className="h-64" />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-24 text-red-500">
          <AlertCircle size={40} className="mb-3" />
          <h3 className="text-xl font-semibold mb-2">Analysis Failed</h3>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Analysis */}
      <AnimatePresence>
        {analyzed && currentData && !loading && !error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }} className="space-y-5">

            {/* Company Header */}
            <Card className="p-5 border-green-200 shadow-[0_2px_16px_rgba(22,163,74,0.08)]">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-2xl font-bold text-slate-800">{currentData.quote.name}</h2>
                    <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">{currentData.quote.ticker}</span>
                    <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-lg border border-green-200">{currentData.quote.exchange}</span>
                  </div>
                  <div className="flex items-baseline gap-3 mt-3">
                    <span className="text-4xl font-bold text-slate-800 mono">${formatPrice(currentData.quote.price)}</span>
                    <span className={cn('text-lg font-semibold', getChangeColor(currentData.quote.change))}>
                      {formatChange(currentData.quote.change)} ({formatChangePct(currentData.quote.changePct)})
                    </span>
                  </div>
                  <div className="flex gap-6 mt-3 flex-wrap">
                    {[
                      ['Market Cap', currentData.quote.marketCap],
                      ['Sector', currentData.quote.sector],
                      ['Industry', currentData.quote.industry],
                      ['Volume', currentData.quote.volume],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <div className="text-xs text-slate-400">{label}</div>
                        <div className="text-sm font-semibold text-slate-700 mt-0.5">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 flex-wrap">
                  {[
                    ['Open', currentData.quote.open],
                    ['High', currentData.quote.high],
                    ['Low', currentData.quote.low],
                    ['Prev Close', currentData.quote.prevClose],
                  ].map(([label, value]) => (
                    <div key={label as string} className="text-center px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-400">{label}</div>
                      <div className="text-sm font-bold text-slate-800 mono mt-0.5">${formatPrice(value as number)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* AI Rec + Financial Health + Technicals + Score */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* AI Recommendation */}
              <Card className="p-4 border-green-200 bg-gradient-to-br from-white to-green-50/30">
                <CardHeader title="AI Recommendation" icon={<Bot size={14} />} />
                <div className="flex flex-col items-center gap-4 mt-2">
                  <CircularProgress value={currentData.recommendation.confidence} size={110} strokeWidth={10} label={String(currentData.recommendation.confidence)} sublabel="/ 100" />
                  <div className="text-center">
                    <div className={cn('text-xl font-black px-4 py-1.5 rounded-xl inline-block', getRecommendationBadge(currentData.recommendation.recommendation))}>
                      {currentData.recommendation.recommendation}
                    </div>
                    <div className="text-xs text-slate-400 mt-1.5">Confidence Score</div>
                  </div>
                  <div className="w-full space-y-2.5">
                    <ProgressBar value={currentData.recommendation.scores.fundamentals} label="Fundamentals" />
                    <ProgressBar value={currentData.recommendation.scores.technicals} label="Technicals" />
                    <ProgressBar value={currentData.recommendation.scores.sentiment} label="Sentiment" />
                    <ProgressBar value={currentData.recommendation.scores.valuation} label="Valuation" />
                  </div>
                </div>
              </Card>

              {/* Financial Health */}
              <Card className="p-4">
                <CardHeader title="Financial Health" icon={<BarChart3 size={14} />} />
                <StatRow label="Market Cap" value={currentData.financialHealth.marketCap} />
                <StatRow label="P/E Ratio (TTM)" value={currentData.financialHealth.peRatio} />
                <StatRow label="PEG Ratio" value={currentData.financialHealth.pegRatio} />
                <StatRow label="ROE (TTM)" value={currentData.financialHealth.roe} valueColor="text-green-600" />
                <StatRow label="Debt to Equity" value={currentData.financialHealth.debtToEquity} />
                <StatRow label="Current Ratio" value={currentData.financialHealth.currentRatio} />
                <StatRow label="EPS (TTM)" value={`$${currentData.financialHealth.eps}`} />
                <StatRow label="Revenue Growth" value={currentData.financialHealth.revenueGrowth} valueColor="text-green-600" />
                <StatRow label="Gross Margin" value={currentData.financialHealth.grossMargin} />
              </Card>

              {/* Technicals */}
              <Card className="p-4">
                <CardHeader title="Technical Indicators" icon={<Activity size={14} />} />
                <div className="grid grid-cols-1 gap-2.5 mt-1">
                  {currentData.technicals.map((t: any) => (
                    <div key={t.name} className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{t.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800 mono">{t.value}</span>
                        <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', getSignalColor(t.signal))}>
                          {t.signal}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Score Breakdown */}
              <Card className="p-4">
                <CardHeader title="Score Breakdown" subtitle="AI scoring weights" icon={<Sparkles size={14} />} />
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={donutData} cx="50%" cy="45%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                        {donutData.map((_, index) => (
                          <Cell key={index} fill={DONUT_COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#fff', border: '1px solid #d1fae5', borderRadius: 12 }} itemStyle={{ color: '#0f172a', fontSize: 11 }} />
                      <Legend iconSize={8} iconType="circle" formatter={(v) => <span style={{ color: '#64748b', fontSize: 11 }}>{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center mt-1">
                  <span className="text-2xl font-bold text-green-700">{currentData.recommendation.overall}</span>
                  <span className="text-sm text-slate-400"> / 100 Overall</span>
                </div>
              </Card>
            </div>

            {/* Key Stats */}
            <Card className="p-4">
              <CardHeader title="Key Statistics" icon={<Star size={14} />} />
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                {currentData.keyStats.map((stat: any) => (
                  <div key={stat.label} className="bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                    <div className="text-[10px] text-slate-400 mb-1">{stat.label}</div>
                    <div className="text-sm font-bold text-slate-800">{stat.value}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Price Chart */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <CardHeader title="Price Chart & Technical Indicators" icon={<TrendingUp size={14} />} />
                <div className="flex gap-1.5">
                  {TIME_FILTERS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setTimeFilter(f)}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all',
                        timeFilter === f
                          ? 'bg-green-600 text-white shadow-[0_2px_8px_rgba(22,163,74,0.3)]'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getChartData()}>
                    <defs>
                      <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'Poppins' }} tickLine={false} axisLine={false} interval={Math.floor(getChartData().length / 6)} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'Poppins' }} tickLine={false} axisLine={false} width={65} tickFormatter={(v) => `$${v.toLocaleString()}`} domain={['auto', 'auto']} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="price" stroke="#16a34a" strokeWidth={2.5} fill="url(#priceGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-4 mt-3 pt-3 border-t border-slate-100 flex-wrap">
                {currentData.technicals.slice(0, 4).map((t: any) => (
                  <div key={t.name} className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{t.name}</span>
                    <span className="text-xs font-semibold text-slate-700 mono">{t.value}</span>
                    <span className={cn('text-[9px] font-semibold px-1.5 py-0.5 rounded border', getSignalColor(t.signal))}>
                      {t.signal}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* AI Summary + News */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* AI Summary */}
              <Card className="p-5 lg:col-span-2 border-green-100">
                <CardHeader title="AI Analysis Summary" subtitle="Powered by rule-based scoring engine" icon={<Bot size={14} />} />
                <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
                  <p>
                    <span className="text-green-700 font-semibold">{currentData.quote.name}</span> demonstrates
                    exceptional fundamental strength, with revenue growth of{' '}
                    <span className="text-green-600 font-semibold">{currentData.financialHealth.revenueGrowth} YoY</span>{' '}
                    and expanding profit margins. The company benefits from a dominant market position in its sector,
                    providing strong pricing power and durable competitive advantages.
                  </p>
                  <p>
                    From a technical perspective, the stock trades comfortably above both its 50-day and 200-day moving
                    averages, confirming a sustained uptrend. RSI remains in neutral territory, suggesting the current
                    price action is not yet in overbought conditions.
                  </p>
                  <p>
                    News sentiment analysis skews{' '}
                    <span className="text-green-600 font-semibold">strongly positive</span>, with{' '}
                    <span className="text-slate-800 font-semibold">{currentData.news.filter((n: any) => n.sentiment === 'Positive').length}</span>{' '}
                    positive articles out of the last {currentData.news.length} headlines tracked.
                    Institutional interest remains high, with multiple analyst upgrades in the past quarter.
                  </p>
                  <p>
                    On valuation, the P/E ratio of{' '}
                    <span className="text-slate-800 font-semibold">{currentData.financialHealth.peRatio}x</span>{' '}
                    appears elevated but justified by the company's superior growth trajectory. The PEG ratio of{' '}
                    <span className="text-slate-800 font-semibold">{currentData.financialHealth.pegRatio}x</span>{' '}
                    indicates growth-adjusted valuation remains reasonable.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 mt-2">
                    <p className="text-green-800 text-xs font-semibold mb-1">⚠️ Disclaimer</p>
                    <p className="text-slate-500 text-xs">
                      This analysis is generated from mocked data for demonstration purposes only. It does not constitute
                      financial advice. Always consult a qualified financial advisor before making investment decisions.
                    </p>
                  </div>
                </div>
              </Card>

              {/* News */}
              <Card className="p-4">
                <CardHeader
                  title="Latest News"
                  icon={<Newspaper size={14} />}
                  action={<button className="btn-ghost text-xs" onClick={() => onNavigate('financial-news')}>View All →</button>}
                />
                <div className="space-y-3">
                  {currentData.news.map((item: any) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ x: 2 }}
                      className="flex gap-3 pb-3 border-b border-slate-100 last:border-0 cursor-pointer group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-green-50 flex-shrink-0 flex items-center justify-center border border-green-100">
                        <Newspaper size={16} className="text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-700 group-hover:text-green-700 leading-snug line-clamp-2 transition-colors">{item.headline}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400">{item.source}</span>
                            <span className="text-slate-300 text-[10px]">·</span>
                            <span className="text-[10px] text-slate-400">{item.time}</span>
                          </div>
                          <span className={cn('text-[9px] font-semibold px-1.5 py-0.5 rounded-full', getSentimentBadge(item.sentiment))}>
                            {item.sentiment}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!analyzed && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-green-100 border border-green-200 flex items-center justify-center mb-4">
            <Bot size={36} className="text-green-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Analyze Any Stock</h3>
          <p className="text-slate-500 text-sm max-w-sm">Enter a ticker symbol above and press Analyze to see a full AI-powered equity research report.</p>
          <div className="flex gap-2 mt-6">
            {['NVDA', 'AAPL', 'MSFT', 'TSLA'].map((t) => (
              <button
                key={t}
                onClick={() => setTicker(t)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:border-green-400 hover:text-green-700 transition-all"
              >
                {t}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
