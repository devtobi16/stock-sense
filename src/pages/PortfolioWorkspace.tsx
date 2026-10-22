import { useEffect, useState } from 'react';
import type { PageId } from '../types';
import { useResource } from '../hooks/useResource';

type Quote = {ticker:string; price:number; changePct:number; quotedAt:string|null};
type Snapshot = {quotes:Quote[]; unavailable:string[]; retrievedAt:string};
type News = {id?:string; headline:string; source:string; time:string; url:string};
const inputClass = 'rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white min-w-0';
const buttonClass = 'rounded-lg bg-green-700 text-white px-4 py-2 text-sm font-semibold disabled:opacity-50';
function safeLink(url:string) { try { return ['https:', 'http:'].includes(new URL(url).protocol) ? url : undefined; } catch { return undefined; } }
function savedTickers() { try { const data=JSON.parse(localStorage.getItem('stocksense_watchlist') || '[]'); return Array.isArray(data) ? data.filter(t=>typeof t==='string' && /^[A-Z]{1,5}(?:[.-][A-Z]{1,2})?$/.test(t)).slice(0,5) : []; } catch { return []; } }
export function NewsList({items}:{items:News[]}) {
  return <div className="space-y-3">{items.map((n,i)=><a key={n.id || n.url || i} href={safeLink(n.url)} target="_blank" rel="noopener noreferrer" className="block bg-white border border-slate-200 rounded-xl p-4 hover:border-green-600"><p className="text-xs text-slate-500 mb-2">{n.source} · {n.time}</p><p className="font-medium text-slate-800">{n.headline}</p><span className="text-xs text-green-700 mt-2 inline-block">Read source ↗</span></a>)}</div>;
}
function NewsSection() {
  const news=useResource<News[]>('/api/news-headlines',300000);
  return <section className="space-y-3"><h2 className="text-xl font-bold">Market headlines</h2>{news.error && <p role="status">Headlines unavailable. Other features remain available. <button onClick={()=>void news.refresh()} className="underline">Retry</button></p>}{!news.data && !news.error && <p role="status">Loading headlines…</p>}<NewsList items={news.data || []}/></section>;
}
export default function PortfolioWorkspace({page, ticker, onNavigate}:{page:PageId; ticker:string; onNavigate:(page:PageId,ticker?:string)=>void}) {
  const isCompany=['stock-detail','stock-analysis','research-report'].includes(page);
  const isWatchlist=page==='watchlist';
  const isCompare=page==='compare-stocks';
  const isNews=['financial-news','thesis-feed'].includes(page);
  const [watchlist,setWatchlist]=useState(savedTickers);
  const [selection,setSelection]=useState(isCompany ? ticker : isWatchlist ? watchlist.join(',') : isCompare ? 'AAPL,MSFT' : 'AAPL,MSFT,NVDA,TSLA,AMZN');
  const [input,setInput]=useState(isCompany ? ticker : isCompare ? 'AAPL,MSFT' : '');
  const [validation,setValidation]=useState('');
  const [showExample,setShowExample]=useState(false);
  useEffect(()=>{ if(isCompany) {setSelection(ticker);setInput(ticker);} },[ticker,isCompany]);
  const path=(page==='dashboard' || page==='market-overview') ? '/api/market-snapshot' : `/api/quotes?tickers=${encodeURIComponent(selection)}`;
  const resource=useResource<Snapshot>(path,60000,!isNews && (!isWatchlist || watchlist.length>0));
  const company=useResource<Quote & {news:{title:string;link:string;time:number}[]}>(`/api/company/${encodeURIComponent(selection)}`,300000,isCompany);
  function submit(e:React.FormEvent) {
    e.preventDefault(); const values=[...new Set(input.toUpperCase().split(/[\s,]+/).filter(Boolean))];
    if(!values.length || values.some(t=>!(/^[A-Z]{1,5}(?:[.-][A-Z]{1,2})?$/).test(t)) || values.length>(isCompany?1:5)) {setValidation(isCompany?'Enter one ticker, such as AAPL.':'Enter up to five ticker symbols, separated by commas.');return;}
    setValidation('');
    if(isWatchlist) { const next=[...new Set([...watchlist,...values])];if(next.length>5){setValidation('This watchlist supports five symbols. Remove one before adding another.');return;} save(next);setInput(''); }
    else {setSelection(values.join(','));if(isCompany)onNavigate('stock-detail',values[0]);}
  }
  function save(next:string[]) {setWatchlist(next);setSelection(next.join(','));try{localStorage.setItem('stocksense_watchlist',JSON.stringify(next));}catch{setValidation('Browser storage is unavailable; changes last for this visit.');}}
  const title=isCompany ? `${selection} · Stock overview` : isCompare ? 'Compare stocks' : isWatchlist ? 'Your watchlist' : isNews ? 'Financial news' : 'Market workspace';
  const quotes=isWatchlist && !watchlist.length ? [] : resource.data?.quotes || [];
  return <div className="p-5 lg:p-8 space-y-7 max-w-[1000px] mx-auto">
    <header><p className="text-xs uppercase tracking-widest text-green-700 font-semibold mb-2">StockSense · MarketMind</p><h1 className="text-3xl font-bold text-slate-900">{title}</h1><p className="text-sm text-slate-500 mt-2">Explore market data, read original sources, and ask the analyst follow-up questions.</p></header>
    {!isNews && <>
      {(isCompany || isCompare || isWatchlist) && <form onSubmit={submit} className="flex gap-2 flex-wrap"><input aria-label="Ticker symbols" value={input} onChange={e=>setInput(e.target.value)} placeholder={isCompany?'AAPL':'AAPL, MSFT'} className={inputClass}/><button className={buttonClass}>{isWatchlist?'Add to watchlist':isCompany?'Look up':'Compare'}</button>{validation && <p role="alert" className="w-full text-sm text-red-700">{validation}</p>}</form>}
      <section aria-label="Market quotes" className="space-y-4">
        <div className="flex justify-between items-center gap-3"><h2 className="text-lg font-bold">{isCompare?'Price comparison':'Latest quotes'}</h2><button className="text-sm text-green-700 underline" disabled={resource.loading} onClick={()=>void resource.refresh()}>Refresh prices</button></div>
        {resource.error && <p role="status" className="rounded-lg bg-amber-50 p-3 text-sm">{resource.error} {resource.data?'Showing the last successful snapshot.':''}</p>}
        {!resource.data && !resource.error && !isNews && !(isWatchlist && !watchlist.length) && <p role="status">Fetching market prices…</p>}
        {isWatchlist && !watchlist.length && <p className="p-6 border border-dashed rounded-xl text-slate-500">Your watchlist is empty. Add a ticker above to follow its price.</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">{quotes.map(q=><article key={q.ticker} className="bg-white border border-slate-200 rounded-xl p-5"><button className="font-bold text-lg text-slate-900 hover:text-green-700" onClick={()=>onNavigate('stock-detail',q.ticker)}>{q.ticker} ↗</button><p className="text-2xl font-semibold mt-3">${q.price.toFixed(2)}</p><p className={q.changePct>=0?'text-green-700':'text-red-700'}>{q.changePct>=0?'+':''}{q.changePct?.toFixed(2)}% <span className="text-xs text-slate-500">daily change</span></p><p className="text-xs text-slate-500 mt-3">{q.quotedAt?`Quote: ${new Date(q.quotedAt).toLocaleString()}`:'Quote timestamp unavailable'}</p>{isWatchlist && <button className="text-xs underline mt-3" onClick={()=>save(watchlist.filter(t=>t!==q.ticker))}>Remove {q.ticker}</button>}</article>)}</div>
        {resource.data?.unavailable?.length ? <p role="status" className="text-sm">No quote returned for {resource.data.unavailable.join(', ')}. Check the symbols or retry later.</p> : null}
        {isWatchlist && watchlist.filter(t=>!quotes.some(q=>q.ticker===t)).map(t=><button key={t} className="text-xs underline mr-3" onClick={()=>save(watchlist.filter(v=>v!==t))}>Remove {t}</button>)}
        {resource.data && <p className="text-xs text-slate-500">Source: Finnhub · Fetched {new Date(resource.data.retrievedAt).toLocaleTimeString()} · Refreshes every minute while visible. Quotes may be delayed; check each quote timestamp.</p>}
        {isCompare && <p className="text-sm text-slate-600">Daily percentage change compares price movement. A higher share price alone does not mean a company is more valuable or a better investment.</p>}
      </section>
    </>}
    {isCompany ? <section className="space-y-3"><h2 className="text-xl font-bold">Headlines mentioning {selection}</h2><p className="text-sm text-slate-500">A mention alone does not establish the cause of a price movement.</p>{company.error && <p role="status">Company news is unavailable. Quotes and the analyst remain independent.</p>}{!company.data && !company.error && <p>Loading company headlines…</p>}{company.data && !company.data.news.length && <p>No company headlines returned.</p>}<NewsList items={(company.data?.news || []).map(n=>({headline:n.title,url:n.link,source:'Via Finnhub',time:new Date(n.time).toLocaleString()}))}/></section> : <NewsSection/>}
    <section className="bg-green-50 border border-green-100 rounded-xl p-5 space-y-2"><h2 className="font-bold text-green-900">Ask a follow-up</h2><p className="text-sm text-green-900">Try “What should a beginner understand about diversification?” or “Compare AAPL and MSFT, then explain the risks.” The analyst remembers recent messages in this tab. New chat clears that history.</p><p className="text-xs text-green-800">Educational information. The analyst uses supplied quotes and headlines, and can make mistakes.</p></section>
    <details onToggle={e=>setShowExample(e.currentTarget.open)} className="text-sm text-slate-500"><summary className="cursor-pointer">Explore a sample when live services are unavailable</summary>{showExample && <div className="mt-3 border rounded-xl p-4 bg-white"><strong>Illustrative example only, not a real security or live quote</strong><p className="mt-2">EXAMPLE: previous close $100, current price $102, daily change +2%.</p><p className="mt-2">Percentage change = (102 − 100) ÷ 100 × 100. This example stays available without a market-data provider.</p></div>}</details>
  </div>;
}
