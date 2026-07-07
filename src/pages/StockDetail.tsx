import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, TrendingUp, TrendingDown, Clock, Activity, BarChart2, FileText } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { motion } from 'framer-motion';
import { Card, CardHeader, Badge } from '../components/ui';
import NarrativeTimeline from '../components/ui/NarrativeTimeline';
import type { PageId } from '../types';
import { useLoadingMessage } from '../hooks/useLoadingMessage';

interface StockDetailProps {
  initialTicker?: string;
  onNavigate: (page: PageId, ticker?: string) => void;
}

export default function StockDetail({ initialTicker = 'AAPL', onNavigate }: StockDetailProps) {
  const [ticker, setTicker] = useState(initialTicker);
  const [searchInput, setSearchInput] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadingMessage = useLoadingMessage();

  useEffect(() => {
    setTicker(initialTicker);
  }, [initialTicker]);

  useEffect(() => {
    const fetchStockDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:3001/api/stock/${ticker}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to fetch data');
        }
        setData(await res.json());
      } catch (err: any) {
        console.error(err);
        setError(err.message || `Failed to load data for ${ticker}.`);
      } finally {
        setLoading(false);
      }
    };
    fetchStockDetail();
  }, [ticker]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onNavigate('stock-detail', searchInput.toUpperCase());
      setSearchInput('');
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-[1000px] mx-auto min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
        <div className="text-sm font-medium text-slate-500 animate-pulse mt-4">{loadingMessage}</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-[1000px] mx-auto min-h-[60vh] flex flex-col items-center justify-center">
        <div className="text-red-500 font-semibold">{error || 'No data found'}</div>
        <button onClick={() => onNavigate('dashboard')} className="mt-4 text-green-700 underline">Return to Dashboard</button>
      </div>
    );
  }

  const isPositive = data.changePct >= 0;

  return (
    <div className="p-8 space-y-6 max-w-[1000px] mx-auto pb-20">
      {/* Search Bar */}
      <div className="flex justify-between items-center bg-white p-2 rounded-xl shadow-sm border border-slate-100">
        <button 
          onClick={() => onNavigate('dashboard')}
          className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <form onSubmit={handleSearch} className="flex-1 max-w-[400px] relative mx-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search any ticker (e.g. MSFT)..."
            className="w-full bg-slate-50 border-none rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </form>
      </div>

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{data.ticker}</h1>
            <Badge variant="neutral">Equity Analysis</Badge>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <span className="text-2xl font-bold text-slate-800">${data.currentPrice?.toFixed(2) || '---'}</span>
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {Math.abs(data.changePct || 0).toFixed(2)}%
            </span>
          </div>
        </div>
        <div>
          <button 
            onClick={() => onNavigate('research-report', data.ticker)}
            className="btn-primary py-2 px-4 flex items-center gap-2"
          >
            <FileText size={16} />
            📄 View Earnings Report
          </button>
        </div>
      </div>

      {/* AI Investment Thesis */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-6 border-green-100 bg-green-50/30">
          <CardHeader title="AI Investment Thesis" icon={<Activity size={16} />} />
          <p className="text-slate-700 leading-relaxed mt-3">
            {data.aiThesis}
          </p>
        </Card>
      </motion.div>

      {/* Narrative Timeline & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Price Action Focus */}
          <Card className="p-5 h-[300px] flex flex-col">
            <CardHeader title="90-Day Narrative Trajectory" icon={<BarChart2 size={16} />} />
            <div className="flex-1 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.history}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isPositive ? '#16a34a' : '#dc2626'} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={isPositive ? '#16a34a' : '#dc2626'} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" hide />
                  <YAxis domain={['auto', 'auto']} hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelFormatter={() => ''}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="close" 
                    stroke={isPositive ? '#16a34a' : '#dc2626'} 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorPrice)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5">
            <CardHeader title="Narrative Evolution" icon={<Clock size={16} />} />
            <div className="mt-6">
              <NarrativeTimeline events={data.timeline || []} />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5 border-slate-200">
            <CardHeader title="Signals vs Noise" icon={<TrendingUp size={16} />} />
            
            <div className="mt-5 space-y-5">
              <div>
                <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> High-Impact Signals
                </h4>
                <ul className="space-y-2">
                  {data.signals?.map((signal: string, i: number) => (
                    <li key={i} className="text-sm text-slate-700 pl-3 border-l-2 border-green-200">{signal}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300" /> Ignorable Noise
                </h4>
                <ul className="space-y-2">
                  {data.noise?.map((n: string, i: number) => (
                    <li key={i} className="text-sm text-slate-500 pl-3 border-l-2 border-slate-200 italic">{n}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
