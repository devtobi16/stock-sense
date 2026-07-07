import { useState } from 'react';
import AppShell from './layouts/AppShell';
import Dashboard from './pages/Dashboard';
import ThesisFeed from './pages/ThesisFeed';
import StockDetail from './pages/StockDetail';
import StockAnalysis from './pages/StockAnalysis';
import CompareStocks from './pages/CompareStocks';
import Watchlist from './pages/Watchlist';
import MarketOverview from './pages/MarketOverview';
import FinancialNews from './pages/FinancialNews';
import EarningsCalendar from './pages/EarningsCalendar';
import About from './pages/About';
import ResearchReport from './pages/ResearchReport';
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
    <AppShell activePage={activePage} onNavigate={handleNavigate}>
      {renderPage()}
    </AppShell>
  );
}

export default App;
