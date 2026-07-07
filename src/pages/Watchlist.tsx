import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Star, TrendingUp, Trash2, Bot, AlertCircle, FileText } from 'lucide-react';
import { Card, ChangeChip } from '../components/ui';
import { cn, formatPrice, getRecommendationBadge } from '../lib/utils';
import CircularProgress from '../components/charts/CircularProgress';
import type { PageId, WatchlistItem } from '../types';
import { useLoadingMessage } from '../hooks/useLoadingMessage';

const ADDABLE_STOCKS = ['TSLA', 'AMZN', 'META', 'GOOGL', 'NFLX', 'AMD', 'INTC', 'JPM', 'V', 'WMT'];

interface WatchlistProps {
  onNavigate: (page: PageId, ticker?: string) => void;
}
import { API_BASE_URL } from '../config';

export default function Watchlist({ onNavigate }: WatchlistProps) {
  const [tickers, setTickers] = useState<string[]>(() => {
    const saved = localStorage.getItem('stocksense_watchlist');
    return saved ? JSON.parse(saved) : ['AAPL', 'MSFT', 'NVDA', 'TSLA'];
  });
  
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const loadingMessage = useLoadingMessage();

  useEffect(() => {
    localStorage.setItem('stocksense_watchlist', JSON.stringify(tickers));
    
    if (tickers.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/watchlist?tickers=${tickers.join(',')}`);
        if (!res.ok) throw new Error('Failed to fetch data');
        setItems(await res.json());
      } catch (err) {
        console.error(err);
        setError('Failed to load watchlist data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tickers]);

  const remove = (ticker: string) => setTickers(tickers.filter(t => t !== ticker));
  const add = (ticker: string) => {
    if (!tickers.includes(ticker)) setTickers([...tickers, ticker]);
    setShowAddPanel(false);
  };

  return (
    <div className="p-6 space-y-5 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Watchlist</h1>
          <p className="text-sm text-slate-500 mt-0.5">{items.length} stocks tracked · stored locally</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-500 bg-green-50 border border-green-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            localStorage
          </div>
          <button onClick={() => setShowAddPanel(!showAddPanel)} className="btn-primary flex items-center gap-2">
            <Plus size={16} />
            Add Stock
          </button>
        </div>
      </div>

      {/* Add Panel */}
      <AnimatePresence>
        {showAddPanel && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <Card className="p-4 border-green-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-800">Add to Watchlist</h3>
                <button onClick={() => setShowAddPanel(false)} className="text-slate-400 hover:text-slate-700">
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {ADDABLE_STOCKS.filter((s) => !tickers.includes(s)).map((stock) => (
                  <motion.button
                    key={stock}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => add(stock)}
                    className="text-left p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-green-300 hover:bg-green-50/50 transition-all font-bold text-slate-800"
                  >
                    + {stock}
                  </motion.button>
                ))}
                {ADDABLE_STOCKS.filter((s) => !tickers.includes(s)).length === 0 && (
                  <div className="col-span-4 text-center text-sm text-slate-400 py-4">All suggested stocks are already in your watchlist.</div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <div className="text-xs text-slate-400 mb-1">Total Stocks</div>
          <div className="text-2xl font-bold text-slate-800">{items.length}</div>
        </Card>
        <Card className="p-3 text-center border-green-200">
          <div className="text-xs text-slate-400 mb-1">Avg AI Score</div>
          <div className="text-2xl font-bold text-green-600">
            {items.length ? Math.round(items.reduce((s, i) => s + i.confidence, 0) / items.length) : 0}
          </div>
        </Card>
        <Card className="p-3 text-center border-green-100">
          <div className="text-xs text-slate-400 mb-1">Buy Signals</div>
          <div className="text-2xl font-bold text-green-600">
            {items.filter((i) => i.recommendation.includes('BUY')).length}
          </div>
        </Card>
      </div>

      {/* Cards Grid */}
      {loading && items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
          <div className="text-sm font-medium text-slate-500 mt-4">{loadingMessage}</div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-red-500">
          <AlertCircle size={32} className="mb-2" />
          <div className="text-sm font-medium">{error}</div>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Star size={40} className="mb-3 opacity-20" />
          <div className="text-sm font-medium">Your watchlist currently contains no active symbols.</div>
          <div className="text-xs mt-1">Select "Add Stock" above to begin tracking financial data.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.ticker}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                whileHover={{ y: -2 }}
              >
                <Card className="p-4 card-hover" hover>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Star size={14} className="text-amber-400 fill-amber-400" />
                        <span className="text-xl font-black text-slate-800">{item.ticker}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 truncate max-w-[160px]">{item.name}</div>
                    </div>
                    <button
                      onClick={() => remove(item.ticker)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-2xl font-bold text-slate-800 mono">${formatPrice(item.price)}</span>
                    <ChangeChip change={item.change} changePct={item.changePct} size="sm" />
                  </div>

                  <div className="flex items-center gap-4 mb-4 p-3 bg-green-50/50 rounded-xl border border-green-100">
                    <CircularProgress value={item.confidence} size={60} strokeWidth={6} label={String(item.confidence)} />
                    <div>
                      <div className="text-[10px] text-slate-400 mb-1">AI Recommendation</div>
                      <div className={cn('text-sm font-bold px-2.5 py-1 rounded-lg inline-block', getRecommendationBadge(item.recommendation))}>
                        {item.recommendation}
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 mb-3">Updated {item.lastUpdated}</div>

                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onNavigate('stock-analysis', item.ticker)}
                        className="flex-1 btn-primary text-xs py-2 flex items-center justify-center gap-1.5"
                      >
                        <Bot size={13} />
                        Analyze
                      </button>
                      <button
                        onClick={() => onNavigate('compare-stocks')}
                        className="flex-1 btn-ghost text-xs py-2 flex items-center justify-center gap-1.5 border border-slate-200 rounded-xl"
                      >
                        <TrendingUp size={13} />
                        Compare
                      </button>
                    </div>
                    <button
                      onClick={() => onNavigate('research-report', item.ticker)}
                      className="w-full btn-ghost text-xs py-2 flex items-center justify-center gap-1.5 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100"
                    >
                      <FileText size={13} />
                      📄 View Earnings Report
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && items.length === 0 && !error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <Star size={40} className="text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Your watchlist is empty</h3>
          <p className="text-sm text-slate-400 mb-4">Add stocks to track their AI recommendations</p>
          <button onClick={() => setShowAddPanel(true)} className="btn-primary">
            <Plus size={16} className="inline mr-2" /> Add Your First Stock
          </button>
        </motion.div>
      )}
    </div>
  );
}
