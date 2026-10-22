import { Component, useState, lazy, Suspense } from 'react';
import type { ReactNode } from 'react';
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

class PageBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <div role="alert" className="p-8 text-slate-700">
      <p>This page could not load. A new deployment or a connection interruption may have changed its files.</p>
      <button className="mt-4 underline" onClick={() => window.location.reload()}>Reload workspace</button>
    </div> : this.props.children;
  }
}

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
      <PageBoundary key={activePage}><Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading workspace…</div>}>{renderPage()}</Suspense></PageBoundary>
    </AppShell>
  );
}

export default App;
