import { useState, lazy, Suspense } from 'react';
import AppShell from './layouts/AppShell';
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ThesisFeed = lazy(() => import('./pages/ThesisFeed'));
const StockDetail = lazy(() => import('./pages/StockDetail'));
const StockAnalysis = lazy(() => import('./pages/StockAnalysis'));
const CompareStocks = lazy(() => import('./pages/CompareStocks'));
const Watchlist = lazy(() => import('./pages/Watchlist'));
const MarketOverview = lazy(() => import('./pages/MarketOverview'));
const FinancialNews = lazy(() => import('./pages/FinancialNews'));
const EarningsCalendar = lazy(() => import('./pages/EarningsCalendar'));
const About = lazy(() => import('./pages/About'));
const ResearchReport = lazy(() => import('./pages/ResearchReport'));
import type { PageId } from './types';

function App() {
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [selectedTicker, setSelectedTicker] = useState<string>('NVDA');

  const handleNavigate = (page: PageId, ticker?: string) => {
    setActivePage(page);
    if (ticker) setSelectedTicker(ticker);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'thesis-feed':
        return <ThesisFeed onNavigate={handleNavigate} />;
      case 'stock-detail':
        return <StockDetail initialTicker={selectedTicker} onNavigate={handleNavigate} />;
      case 'stock-analysis':
        return <StockAnalysis initialTicker={selectedTicker} onNavigate={handleNavigate} />;
      case 'compare-stocks':
        return <CompareStocks />;
      case 'watchlist':
        return <Watchlist onNavigate={handleNavigate} />;
      case 'market-overview':
        return <MarketOverview />;
      case 'financial-news':
        return <FinancialNews />;
      case 'earnings-calendar':
        return <EarningsCalendar />;
      case 'research-report':
        return <ResearchReport ticker={selectedTicker} onNavigate={handleNavigate} />;
      case 'about':
        return <About />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <AppShell activePage={activePage} selectedTicker={selectedTicker} onNavigate={handleNavigate}>
      <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading workspace…</div>}>{renderPage()}</Suspense>
    </AppShell>
  );
}

export default App;
