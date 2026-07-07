import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, Zap, Clock } from 'lucide-react';
import { Card, CardHeader, Badge } from '../components/ui';
import { cn } from '../lib/utils';
import type { PageId } from '../types';
import { useLoadingMessage } from '../hooks/useLoadingMessage';

interface DashboardProps {
  onNavigate: (page: PageId, ticker?: string) => void;
}

interface MarketBrainData {
  contradictions: Array<{ ticker: string, signal: string, noise: string }>;
  narrativeShifts: Array<{ ticker: string, shift: string, sentiment: string, time: string }>;
  thesisChanges: Array<{ ticker: string, oldBias: string, newBias: string, reason: string }>;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [data, setData] = useState<MarketBrainData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadingMessage = useLoadingMessage();

  useEffect(() => {
    const fetchMarketBrain = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/market-brain');
        if (!response.ok) throw new Error('Failed to fetch data');
        const json = await response.json();
        setData(json);
      } catch (err) {
        console.error(err);
        setError('Failed to load real-time market data. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };

    fetchMarketBrain();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-8 max-w-[1000px] mx-auto pb-20 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
        <div className="text-sm font-medium text-slate-500 animate-pulse mt-4">{loadingMessage}</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 space-y-8 max-w-[1000px] mx-auto pb-20 flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle size={32} className="text-red-500 mb-2" />
        <div className="text-sm font-medium text-slate-700">{error}</div>
      </div>
    );
  }
  return (
    <div className="p-8 space-y-8 max-w-[1000px] mx-auto pb-20">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Market Brain</h1>
        <p className="text-slate-500 mt-1">Global AI-driven market intelligence command center.</p>
      </motion.div>

      {/* Narrative Shifts (High Priority) */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center gap-2 mb-3">
          <Zap size={16} className="text-green-600" />
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Narrative Shifts</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.contradictions.map((c, i) => (
            <Card key={i} className="p-4 border-amber-200 bg-amber-50/30">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-900">{c.ticker}</span>
                <Badge variant="neutral" className="bg-white border-amber-200 text-amber-700 text-[10px]">Anomaly Detected</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5" />
                  <span className="text-xs text-slate-700"><span className="font-semibold">Price Action:</span> {c.signal}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5" />
                  <span className="text-xs text-slate-700"><span className="font-semibold">Fundamental:</span> {c.noise}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </motion.div>
 
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Market Anomalies */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-5 h-full">
            <CardHeader title="Market Anomalies" icon={<AlertTriangle size={14} className="text-amber-500" />} />
            <div className="space-y-4 mt-2">
              {data.narrativeShifts.map((n, i) => (
                <div key={i} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <button 
                      onClick={() => onNavigate('stock-detail', n.ticker)}
                      className="font-bold text-slate-900 hover:text-green-700 transition-colors"
                    >
                      {n.ticker}
                    </button>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1"><Clock size={10} />{n.time || 'Recently updated'}</span>
                  </div>
                  <div className="text-sm text-slate-600 leading-snug">{n.shift}</div>
                  <div className={cn(
                    "inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded border",
                    n.sentiment === 'Positive' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                  )}>
                    {n.sentiment} Impact
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <div className="space-y-6">
          {/* Biggest Thesis Changes */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="p-5">
              <CardHeader title="Thesis Revisions" icon={<TrendingUp size={14} />} />
              <div className="space-y-3 mt-2">
                {data.thesisChanges.map((t, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900">{t.ticker}</span>
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <span className="text-slate-500 line-through">{t.oldBias}</span>
                        <span>→</span>
                        <span className={t.newBias === 'Bullish' ? 'text-green-600' : 'text-slate-800'}>{t.newBias}</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-600">{t.reason}</div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
