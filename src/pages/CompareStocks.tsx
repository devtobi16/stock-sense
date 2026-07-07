import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Scale, BarChart3, TrendingUp, AlertCircle } from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, BarChart, Bar
} from 'recharts';
import { Card, CardHeader } from '../components/ui';
import { compareStocksData, revenueYears, generatePerfData } from '../data/mockData';
import { cn, formatPrice, getRecommendationBadge, getSignalColor, getSentimentBadge } from '../lib/utils';
import CircularProgress from '../components/charts/CircularProgress';

const AVAILABLE = ['NVDA', 'AAPL', 'MSFT', 'TSLA', 'GOOGL', 'AMZN', 'META', 'AMD'];
const COLORS = ['#16a34a', '#2563eb', '#d97706', '#dc2626'];

const METRICS = [
  { key: 'price', label: 'Price', format: (v: any) => `$${formatPrice(v)}` },
  { key: 'marketCap', label: 'Market Cap', format: (v: any) => v },
  { key: 'peRatio', label: 'P/E Ratio', format: (v: any) => String(v) },
  { key: 'roe', label: 'ROE', format: (v: any) => v },
  { key: 'rsi', label: 'RSI', format: (v: any) => String(v) },
  { key: 'confidence', label: 'AI Confidence', format: (v: any) => `${v}/100` },
];

export default function CompareStocks() {
  const [selected, setSelected] = useState<string[]>(['NVDA', 'AAPL']);
  const [data, setData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selected.length === 0) {
      setData({});
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:3001/api/compare?tickers=${selected.join(',')}`);
        if (!res.ok) throw new Error('Failed to fetch data');
        setData(await res.json());
      } catch (err) {
        console.error(err);
        setError('Failed to load comparison data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selected]);

  const add = (t: string) => {
    if (selected.length < 4 && !selected.includes(t)) setSelected([...selected, t]);
  };
  const remove = (t: string) => setSelected(selected.filter((s) => s !== t));

  const perfData = generatePerfData(selected);
  const revenueData = revenueYears.map((year, i) => {
    const entry: Record<string, any> = { year };
    selected.forEach((t) => { entry[t] = Math.round((data[t]?.revenue?.[i] ?? 0) / 1e9); });
    return entry;
  });

  return (
    <div className="p-6 space-y-5 max-w-[1400px]">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Compare Stocks</h1>
          <p className="text-sm text-slate-500 mt-0.5">Side-by-side comparison of up to 4 companies</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400">Add:</span>
          {AVAILABLE.filter((t) => !selected.includes(t)).map((t) => (
            <button
              key={t}
              onClick={() => add(t)}
              disabled={selected.length >= 4}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 bg-white hover:border-green-400 hover:text-green-700 transition-all disabled:opacity-40"
            >
              <Plus size={12} /> {t}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 col-span-full">
          <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
          <div className="text-sm font-medium text-slate-500 mt-4">Generating comparative analysis...</div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-red-500 col-span-full">
          <AlertCircle size={32} className="mb-2" />
          <div className="text-sm font-medium">{error}</div>
        </div>
      ) : (
        <div className={cn('grid gap-4', `grid-cols-${selected.length}`)}>
          <AnimatePresence>
            {selected.map((ticker, idx) => {
              const d = data[ticker];
              if (!d) return null;
              const color = COLORS[idx];
              return (
                <motion.div key={ticker} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}>
                  <Card className="p-4 relative" style={{ borderColor: `${color}30` }}>
                    <button
                      onClick={() => remove(ticker)}
                      className="absolute top-3 right-3 w-6 h-6 rounded-full bg-slate-100 hover:bg-red-100 hover:text-red-600 text-slate-400 flex items-center justify-center transition-all"
                    >
                      <X size={12} />
                    </button>
                    <div className="mb-4 pr-6">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-xl font-black text-slate-800">{ticker}</span>
                      </div>
                      <div className="text-xs text-slate-400 truncate">{d.name}</div>
                    </div>
                <div className="flex flex-col items-center mb-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                  <CircularProgress value={d.confidence} size={80} strokeWidth={7} label={String(d.confidence)} sublabel="/100" />
                  <div className={cn('mt-2 text-xs font-bold px-3 py-1 rounded-lg', getRecommendationBadge(d.recommendation))}>
                    {d.recommendation}
                  </div>
                </div>
                <div className="space-y-2">
                  {METRICS.map((m) => (
                    <div key={m.key} className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0">
                      <span className="text-[11px] text-slate-500">{m.label}</span>
                      <span className="text-xs font-semibold text-slate-800">{m.format((d as any)[m.key])}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="text-[11px] text-slate-500">Sentiment</span>
                    <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', getSentimentBadge(d.newsSentiment))}>
                      {d.newsSentiment}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-[11px] text-slate-500">Technical</span>
                    <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', getSignalColor(d.technicalRating))}>
                      {d.technicalRating}
                    </span>
                  </div>
                </div>
                <div className={cn(
                  'mt-3 flex items-center justify-center gap-2 rounded-xl py-2 text-sm font-bold',
                  d.change >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                )}>
                  {d.change >= 0 ? '▲' : '▼'} {Math.abs(d.changePct).toFixed(2)}% Today
                </div>
              </Card>
            </motion.div>
          );
        })}
        </AnimatePresence>
      </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <CardHeader title="Price Performance (Indexed to 100)" icon={<TrendingUp size={14} />} />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={perfData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'Poppins' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'Poppins' }} tickLine={false} axisLine={false} width={40} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #d1fae5', borderRadius: 12 }} itemStyle={{ color: '#0f172a', fontSize: 11 }} />
                <Legend formatter={(v) => <span style={{ color: '#64748b', fontSize: 11, fontFamily: 'Poppins' }}>{v}</span>} />
                {selected.map((ticker, i) => (
                  <Line key={ticker} type="monotone" dataKey={ticker} stroke={COLORS[i]} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-4">
          <CardHeader title="Annual Revenue (USD Billions)" icon={<BarChart3 size={14} />} />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'Poppins' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'Poppins' }} tickLine={false} axisLine={false} width={40} tickFormatter={(v) => `$${v}B`} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #d1fae5', borderRadius: 12 }} itemStyle={{ color: '#0f172a', fontSize: 11 }} formatter={(v: any) => [`$${v}B`, '']} />
                <Legend formatter={(v) => <span style={{ color: '#64748b', fontSize: 11, fontFamily: 'Poppins' }}>{v}</span>} />
                {selected.map((ticker, i) => (
                  <Bar key={ticker} dataKey={ticker} fill={COLORS[i]} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <CardHeader title="AI Score Trend (12 Months)" icon={<Scale size={14} />} />
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((month, i) => {
              const entry: Record<string, any> = { month };
              selected.forEach((t) => {
                const scores = compareStocksData[t]?.aiScore ?? [];
                const base = scores[Math.floor(i / 3)] ?? 70;
                entry[t] = Math.round(base + (Math.random() - 0.5) * 6);
              });
              return entry;
            })}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis domain={[40, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={30} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #d1fae5', borderRadius: 12 }} itemStyle={{ color: '#0f172a', fontSize: 11 }} />
              <Legend formatter={(v) => <span style={{ color: '#64748b', fontSize: 11 }}>{v}</span>} />
              {selected.map((ticker, i) => (
                <Line key={ticker} type="monotone" dataKey={ticker} stroke={COLORS[i]} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
