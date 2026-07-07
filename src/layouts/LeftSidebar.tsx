import { useState, useEffect } from 'react';
import { Home, List, Bell, Star, TrendingUp, TrendingDown, BookOpen, Calendar, Newspaper } from 'lucide-react';
import type { PageId } from '../types';
import { cn } from '../lib/utils';
import { useLoadingMessage } from '../hooks/useLoadingMessage';
import { API_BASE_URL } from '../config';

interface LeftSidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId, ticker?: string) => void;
}

interface Alert {
  type: 'earnings' | 'news';
  text: string;
  time: string;
  ticker?: string;
}

export default function LeftSidebar({ activePage, onNavigate }: LeftSidebarProps) {
  const [portfolio, setPortfolio] = useState<Array<{ ticker: string; alloc: number; pl: number }>>([]);
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);
  const [showEditPortfolio, setShowEditPortfolio] = useState(false);
  const [newTicker, setNewTicker] = useState('');
  const [newAlloc, setNewAlloc] = useState(10);
  const [portfolioItems, setPortfolioItems] = useState<Array<{ ticker: string; alloc: number }>>(() => {
    try {
      const saved = localStorage.getItem('stocksense_portfolio');
      return saved ? JSON.parse(saved) : [
        { ticker: 'AAPL', alloc: 40 },
        { ticker: 'MSFT', alloc: 30 },
        { ticker: 'TSLA', alloc: 20 },
      ];
    } catch {
      return [
        { ticker: 'AAPL', alloc: 40 },
        { ticker: 'MSFT', alloc: 30 },
        { ticker: 'TSLA', alloc: 20 },
      ];
    }
  });

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const loadingMessage = useLoadingMessage();
  const [watchlistTickers, setWatchlistTickers] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('stocksense_watchlist') || '[]'); } catch { return []; }
  });

  // Re-sync watchlist from localStorage whenever page focus returns
  useEffect(() => {
    const sync = () => {
      try { setWatchlistTickers(JSON.parse(localStorage.getItem('stocksense_watchlist') || '[]')); } catch {}
    };
    window.addEventListener('focus', sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener('focus', sync); window.removeEventListener('storage', sync); };
  }, []);

  const savePortfolio = (items: Array<{ ticker: string; alloc: number }>) => {
    setPortfolioItems(items);
    localStorage.setItem('stocksense_portfolio', JSON.stringify(items));
  };

  useEffect(() => {
    setLoadingPortfolio(true);
    fetch(`${API_BASE_URL}/api/portfolio?data=${encodeURIComponent(JSON.stringify(portfolioItems))}`)
      .then(r => r.ok ? r.json() : [])
      .then(setPortfolio)
      .catch(() => {})
      .finally(() => setLoadingPortfolio(false));
  }, [portfolioItems]);

  useEffect(() => {
    // Build live alerts from earnings + top news
    const buildAlerts = async () => {
      try {
        const [earningsRes, newsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/earnings-calendar`),
          fetch(`${API_BASE_URL}/api/financial-news`),
        ]);
        const earnings = earningsRes.ok ? await earningsRes.json() : [];
        const news = newsRes.ok ? await newsRes.json() : [];

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const earningAlerts: Alert[] = earnings.slice(0, 3).map((e: any) => {
          const earningDate = new Date(e.timestamp * 1000);
          const isToday = earningDate.toDateString() === today.toDateString();
          const isTomorrow = earningDate.toDateString() === tomorrow.toDateString();
          return {
            type: 'earnings' as const,
            text: `${e.company || e.ticker} earnings ${isToday ? 'today' : isTomorrow ? 'tomorrow' : `on ${e.date}`}`,
            time: e.date,
            ticker: e.ticker,
          };
        });

        const newsAlerts: Alert[] = news.slice(0, 3).map((n: any) => ({
          type: 'news' as const,
          text: n.headline?.slice(0, 55) + (n.headline?.length > 55 ? '…' : ''),
          time: n.time || 'Recent',
        }));

        // Interleave: earnings first, then news
        setAlerts([...earningAlerts, ...newsAlerts].slice(0, 5));
      } catch (e) {
        console.error('Failed to load alerts');
      } finally {
        setLoadingAlerts(false);
      }
    };
    buildAlerts();
  }, []);

  return (
    <aside className="w-[260px] min-w-[260px] h-screen bg-white border-r border-slate-200 flex flex-col overflow-hidden">
      {/* Logo */}
      <div className="p-5 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-green-700 flex items-center justify-center shadow-sm">
            <BookOpen size={16} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900 leading-none tracking-tight">MarketMind</div>
            <div className="text-[10px] text-slate-500 mt-0.5 font-medium uppercase tracking-widest">Analyst Workspace</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Core Nav */}
        <div className="space-y-1">
          <button
            onClick={() => onNavigate('dashboard')}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              activePage === 'dashboard' ? 'bg-green-50 text-green-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            )}
          >
            <Home size={16} /> Market Brain
          </button>
          <button
            onClick={() => onNavigate('thesis-feed')}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              activePage === 'thesis-feed' ? 'bg-green-50 text-green-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            )}
          >
            <List size={16} /> Thesis Feed
          </button>
        </div>

        {/* Portfolio */}
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3 flex items-center justify-between">
            Portfolio
            <button onClick={() => setShowEditPortfolio(true)} title="Manage portfolio">
              <Star size={12} className="text-green-500 hover:text-green-600 transition-colors" />
            </button>
          </div>
          <div className="space-y-1">
            {loadingPortfolio ? (
              <div className="text-xs text-slate-400 px-3 animate-pulse">{loadingMessage}</div>
            ) : portfolio.map((item) => (
              <button
                key={item.ticker}
                onClick={() => onNavigate('stock-detail', item.ticker)}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="font-semibold text-sm text-slate-700 group-hover:text-slate-900">{item.ticker}</div>
                  <div className="text-xs text-slate-400">{item.alloc}%</div>
                </div>
                <div className={cn('text-xs font-medium flex items-center gap-1', item.pl >= 0 ? 'text-green-600' : 'text-red-600')}>
                  {item.pl >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {Math.abs(item.pl)}%
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Watchlist quicklist — synced to Watchlist page */}
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3 flex items-center justify-between">
            My Watchlist
            <button onClick={() => onNavigate('watchlist')} title="Manage watchlist">
              <Star size={12} className="text-amber-400 hover:text-amber-500 transition-colors" />
            </button>
          </div>
          <div className="space-y-1">
            {watchlistTickers.length === 0 ? (
              <button
                onClick={() => onNavigate('watchlist')}
                className="text-xs text-slate-400 px-3 hover:text-green-600 transition-colors"
              >
                + Add stocks to watchlist
              </button>
            ) : watchlistTickers.slice(0, 6).map((ticker) => (
              <button
                key={ticker}
                onClick={() => onNavigate('stock-detail', ticker)}
                className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors group"
              >
                <div className="font-semibold text-sm text-slate-700 group-hover:text-slate-900">{ticker}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Upcoming Market Events — live from API */}
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3 flex items-center gap-1.5">
            <Bell size={12} /> Upcoming Market Events
          </div>
          <div className="space-y-2 px-3">
            {loadingAlerts ? (
              <div className="text-xs text-slate-400 animate-pulse">{loadingMessage}</div>
            ) : alerts.length === 0 ? (
              <div className="text-xs text-slate-400">No alerts right now.</div>
            ) : alerts.map((alert, i) => (
              <div key={i} className="flex gap-2">
                <div className="mt-1 flex-shrink-0">
                  {alert.type === 'earnings'
                    ? <Calendar size={10} className="text-amber-500" />
                    : <Newspaper size={10} className="text-blue-400" />
                  }
                </div>
                <div>
                  <div className="text-xs text-slate-700 leading-snug">{alert.text}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{alert.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Edit Portfolio Modal */}
      {showEditPortfolio && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 border border-slate-100 flex flex-col max-h-[80vh] text-left">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="font-bold text-slate-800 text-sm">Manage Custom Portfolio</h3>
              <button 
                onClick={() => setShowEditPortfolio(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                ✕
              </button>
            </div>
            
            {/* List of current items */}
            <div className="space-y-2 overflow-y-auto flex-1 pr-1 max-h-[40vh]">
              {portfolioItems.map((item, index) => (
                <div key={item.ticker} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="font-bold text-slate-700 text-xs w-16">{item.ticker}</span>
                  <div className="flex items-center gap-1 flex-1 justify-end">
                    <input 
                      type="number" 
                      min="1"
                      max="100"
                      value={item.alloc}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        const updated = [...portfolioItems];
                        updated[index].alloc = val;
                        savePortfolio(updated);
                      }}
                      className="w-14 px-1.5 py-0.5 text-xs border rounded text-right focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                    <span className="text-xs text-slate-500">%</span>
                  </div>
                  <button 
                    onClick={() => {
                      const updated = portfolioItems.filter((_, i) => i !== index);
                      savePortfolio(updated);
                    }}
                    className="text-red-500 hover:text-red-700 text-xs px-2 py-0.5 font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ))}

              {portfolioItems.length === 0 && (
                <div className="text-center text-xs text-slate-400 py-6">Your portfolio is currently empty. Add tickers below.</div>
              )}
            </div>

            {/* Add stock */}
            <div className="border-t pt-3 mt-3 space-y-2">
              <div className="flex gap-1.5">
                <input 
                  type="text" 
                  placeholder="Ticker" 
                  value={newTicker}
                  onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
                  className="flex-1 px-2.5 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                />
                <input 
                  type="number" 
                  placeholder="%" 
                  value={newAlloc}
                  onChange={(e) => setNewAlloc(parseInt(e.target.value) || 0)}
                  className="w-16 px-2.5 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                />
                <button 
                  onClick={() => {
                    if (!newTicker.trim()) return;
                    const tickerUpper = newTicker.trim().toUpperCase();
                    if (portfolioItems.some(i => i.ticker === tickerUpper)) return;
                    const updated = [...portfolioItems, { ticker: tickerUpper, alloc: newAlloc }];
                    savePortfolio(updated);
                    setNewTicker('');
                    setNewAlloc(10);
                  }}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold"
                >
                  Add
                </button>
              </div>

              {/* Total allocation warning */}
              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-slate-500">Total Allocation:</span>
                <span className={cn('font-bold', portfolioItems.reduce((acc, i) => acc + i.alloc, 0) === 100 ? 'text-green-600' : 'text-amber-500')}>
                  {portfolioItems.reduce((acc, i) => acc + i.alloc, 0)}%
                </span>
              </div>
            </div>

            <button 
              onClick={() => setShowEditPortfolio(false)}
              className="mt-4 w-full py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
