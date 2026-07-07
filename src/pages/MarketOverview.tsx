import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, TrendingUp, TrendingDown, BarChart3, Activity, AlertCircle, Newspaper } from 'lucide-react';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  Radar, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { Card, CardHeader, ChangeChip } from '../components/ui';
import { sectorPerformance, topGainers, topLosers } from '../data/mockData';
import { cn, formatPrice } from '../lib/utils';

const sentimentData = [
  { subject: 'Tech', score: 78 },
  { subject: 'Finance', score: 52 },
  { subject: 'Energy', score: 38 },
  { subject: 'Health', score: 61 },
  { subject: 'Consumer', score: 67 },
  { subject: 'Industrial', score: 55 },
];
import { API_BASE_URL } from '../config';

export default function MarketOverview() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/market-overview`);
        if (!res.ok) throw new Error('Failed to load market overview');
        setData(await res.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
        <div className="text-sm font-medium text-slate-500 mt-4">Analyzing global markets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[60vh] text-red-500">
        <AlertCircle size={32} className="mb-2" />
        <div className="text-sm font-medium">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Market Overview</h1>
        <p className="text-sm text-slate-500 mt-0.5">Global indices, sectors, and market sentiment</p>
      </div>

      {/* AI Macro Outlook */}
      <Card className="p-5 border-green-200 bg-gradient-to-br from-white to-green-50/30">
        <CardHeader title="AI Macroeconomic Outlook" subtitle="Real-time global market analysis" icon={<Globe size={14} />} />
        <div className="mt-2 text-sm text-slate-600 leading-relaxed italic">
          "{data?.outlook}"
        </div>
      </Card>

      {/* Global Indices */}
      <Card className="p-4">
        <CardHeader title="Global Indices" subtitle="Major world markets" icon={<Globe size={14} />} />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {data?.indices?.map((idx: any) => (
            <motion.div
              key={idx.ticker}
              whileHover={{ scale: 1.02 }}
              className="bg-slate-50 rounded-xl p-3 border border-slate-200 cursor-pointer hover:border-green-300 hover:bg-green-50/40 transition-all"
            >
              <div className="text-xs font-bold text-slate-700 truncate">{idx.name}</div>
              <div className="text-[10px] text-slate-400 mb-2">{idx.ticker}</div>
              <div className="text-lg font-bold text-slate-800 mono mt-1">{idx.value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <ChangeChip change={idx.change} changePct={idx.changePct} size="sm" />
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Sector + Sentiment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4 lg:col-span-2">
          <CardHeader title="Sector Performance" subtitle="Today's % change" icon={<BarChart3 size={14} />} />
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorPerformance.map((s) => ({ name: s.sector, change: s.changePct }))} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'Poppins' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#475569', fontFamily: 'Poppins' }} tickLine={false} axisLine={false} width={90} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #d1fae5', borderRadius: 12 }} itemStyle={{ color: '#0f172a', fontSize: 11 }} formatter={(v: any) => [`${v.toFixed(2)}%`, 'Change']} />
                <Bar dataKey="change" radius={[0, 4, 4, 0]} fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <CardHeader title="Sector Sentiment" subtitle="Bull/Bear composite" icon={<Activity size={14} />} />
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={sentimentData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'Poppins' }} />
                <Radar name="Sentiment" dataKey="score" stroke="#16a34a" fill="#16a34a" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">64</div>
            <div className="text-xs text-slate-400">Overall Market Sentiment</div>
          </div>
        </Card>
      </div>

      {/* Top Gainers + Losers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[
          { title: 'Top Gainers', icon: <TrendingUp size={14} />, stocks: topGainers },
          { title: 'Top Losers', icon: <TrendingDown size={14} />, stocks: topLosers },
        ].map(({ title, icon, stocks }) => (
          <Card key={title} className="p-4">
            <CardHeader title={title} icon={icon} />
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Symbol', 'Name', 'Price', 'Change', 'Volume'].map((h) => (
                    <th key={h} className="text-[10px] text-slate-400 uppercase tracking-wider text-left pb-2 pr-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stocks.map((s) => (
                  <tr key={s.ticker} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 pr-3 font-bold text-sm text-slate-800">{s.ticker}</td>
                    <td className="py-2.5 pr-3 text-xs text-slate-400 truncate max-w-[100px]">{s.name}</td>
                    <td className="py-2.5 pr-3 text-sm font-semibold text-slate-800 mono">${formatPrice(s.price)}</td>
                    <td className="py-2.5 pr-3"><ChangeChip change={s.change} changePct={s.changePct} size="sm" /></td>
                    <td className="py-2.5 text-xs text-slate-400">{s.volume}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ))}
      </div>

      {/* Heatmap */}
      <Card className="p-4">
        <CardHeader title="S&P 500 Heatmap" subtitle="Sized by market cap · colored by daily performance" icon={<BarChart3 size={14} />} />
        <div className="grid grid-cols-10 gap-1 h-48 mt-2">
          {[
            { name: 'NVDA', pct: 2.62, size: 4 }, { name: 'MSFT', pct: 0.83, size: 3 },
            { name: 'AAPL', pct: 1.14, size: 3 }, { name: 'GOOGL', pct: 1.09, size: 2 },
            { name: 'META', pct: 3.80, size: 2 }, { name: 'AMZN', pct: 0.52, size: 2 },
            { name: 'TSLA', pct: 5.41, size: 2 }, { name: 'BRK', pct: -0.11, size: 2 },
            { name: 'INTC', pct: -7.19, size: 1 }, { name: 'PFE', pct: -5.22, size: 1 },
            { name: 'DIS', pct: -3.03, size: 1 }, { name: 'JPM', pct: 0.44, size: 1 },
            { name: 'BAC', pct: -0.22, size: 1 }, { name: 'V', pct: 0.61, size: 1 },
            { name: 'WMT', pct: 1.22, size: 1 }, { name: 'XOM', pct: -1.34, size: 1 },
            { name: 'CVX', pct: -2.64, size: 1 }, { name: 'KO', pct: 0.33, size: 1 },
            { name: 'JNJ', pct: 0.18, size: 1 }, { name: 'PG', pct: -0.44, size: 1 },
          ].map((item) => {
            const intensity = Math.min(Math.abs(item.pct) / 8, 1);
            const bg = item.pct > 0
              ? `rgba(22, 163, 74, ${0.18 + intensity * 0.6})`
              : `rgba(220, 38, 38, ${0.18 + intensity * 0.6})`;
            return (
              <motion.div
                key={item.name}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                className={cn(
                  'rounded-lg flex flex-col items-center justify-center cursor-pointer border border-white/50',
                  item.size >= 4 ? 'col-span-4' : item.size === 3 ? 'col-span-3' : item.size === 2 ? 'col-span-2' : 'col-span-1'
                )}
                style={{ backgroundColor: bg }}
              >
                <div className={cn('font-bold text-white leading-tight', item.size >= 3 ? 'text-sm' : item.size === 2 ? 'text-xs' : 'text-[9px]')}>{item.name}</div>
                <div className={cn('text-white/90', item.size >= 3 ? 'text-xs' : 'text-[8px]')}>{item.pct > 0 ? '+' : ''}{item.pct.toFixed(2)}%</div>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
