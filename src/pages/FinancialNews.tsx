import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, ExternalLink, Clock, Filter, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui';
import { cn, getSentimentBadge } from '../lib/utils';

type FilterType = 'All' | 'Positive' | 'Neutral' | 'Negative';

import { API_BASE_URL } from '../config';

export default function FinancialNews() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filter, setFilter] = useState<FilterType>('All');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/financial-news`);
        if (!res.ok) throw new Error('Failed to fetch news');
        setNews(await res.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const filtered = news.filter((n) => filter === 'All' ? true : n.sentiment === filter);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
        <div className="text-sm font-medium text-slate-500 mt-4">Scanning global financial headlines...</div>
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
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Financial News</h1>
          <p className="text-sm text-slate-500 mt-0.5">AI-analyzed sentiment across major financial publications</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-slate-400" />
          {(['All', 'Positive', 'Neutral', 'Negative'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                filter === f
                  ? f === 'Positive' ? 'bg-green-600 border-green-600 text-white'
                    : f === 'Negative' ? 'bg-red-500 border-red-500 text-white'
                    : f === 'Neutral' ? 'bg-amber-500 border-amber-500 text-white'
                    : 'bg-slate-800 border-slate-800 text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-green-300 hover:text-green-700'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Positive', count: news.filter(n => n.sentiment === 'Positive').length, color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
          { label: 'Neutral', count: news.filter(n => n.sentiment === 'Neutral').length, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
          { label: 'Negative', count: news.filter(n => n.sentiment === 'Negative').length, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className={cn('rounded-2xl border p-3 text-center', bg)}>
            <div className={cn('text-3xl font-bold', color)}>{count}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label} Articles</div>
          </div>
        ))}
      </div>

      {/* News Feed */}
      <div className="space-y-3">
        {filtered.map((item, i) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card
              className="p-4 card-hover cursor-pointer"
              hover
              onClick={() => setExpanded(expanded === item.id ? null : item.id)}
            >
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-xl bg-green-50 flex-shrink-0 flex items-center justify-center border border-green-100">
                  <Newspaper size={20} className="text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2">
                      {item.headline}
                    </h3>
                    <span className={cn('flex-shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full', getSentimentBadge(item.sentiment))}>
                      {item.sentiment}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                      {item.source}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock size={10} />
                      {item.time}
                    </div>
                    <button className="ml-auto flex items-center gap-1 text-xs text-green-600 hover:text-green-800 transition-colors">
                      <ExternalLink size={11} />
                      Open
                    </button>
                  </div>
                  {expanded === item.id && item.summary && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 pt-3 border-t border-slate-100"
                    >
                      <p className="text-xs text-slate-500 leading-relaxed">{item.summary}</p>
                    </motion.div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <Newspaper size={40} className="mx-auto mb-3 opacity-30" />
          <p>No {filter} articles found.</p>
        </div>
      )}
    </div>
  );
}
