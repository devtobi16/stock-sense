import { Component, useState, lazy, Suspense } from 'react';
import type { ReactNode } from 'react';
import AppShell from './layouts/AppShell';
const PortfolioWorkspace = lazy(() => import('./pages/PortfolioWorkspace'));
const CompanyResearch = lazy(() => import('./pages/CompanyResearch'));
const EarningsCalendar = lazy(() => import('./pages/EarningsCalendar'));
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
  const [selectedTicker, setSelectedTicker] = useState<string>('AAPL');
  const [selectedFiling,setSelectedFiling] = useState('');

  const handleNavigate = (page: PageId, ticker?: string) => {
    setActivePage(page);
    if (ticker && ticker !== selectedTicker) {setSelectedTicker(ticker);setSelectedFiling('');}
  };

  const renderPage = () => {
    if (['dashboard','stock-detail','stock-analysis','research-report'].includes(activePage)) return <CompanyResearch key={selectedTicker} ticker={selectedTicker} onNavigate={handleNavigate} onFiling={setSelectedFiling}/>;
    if (activePage === 'earnings-calendar') return <EarningsCalendar />;
    return <PortfolioWorkspace key={activePage} page={activePage} ticker={selectedTicker} onNavigate={handleNavigate} />;
  };

  return (
    <AppShell activePage={activePage} selectedTicker={selectedTicker} selectedFiling={selectedFiling} onNavigate={handleNavigate}>
      <PageBoundary key={activePage}><Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading workspace…</div>}>{renderPage()}</Suspense></PageBoundary>
    </AppShell>
  );
}

export default App;
