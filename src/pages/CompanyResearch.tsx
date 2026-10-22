import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, FileText, Sparkles, Search, RefreshCw, ExternalLink } from 'lucide-react';
import { useResource } from '../hooks/useResource';
import type { PageId } from '../types';

type Filing={form:string;accession:string;filed:string;reportDate:string;label:string;url:string};
type Filings={name?:string;ticker:string;filings:Filing[];unsupported?:boolean;message?:string;retrievedAt?:string;cachedSnapshot?:boolean;capturedAt?:string};
type Article={id:string;title:string;link:string;publisher:string;time:number;label:'Positive'|'Negative'|'Neutral';reason:string;relevance:string;method:string;basis:string};
type News={articles:Article[];unconfirmed:Article[];retrievedAt:string;analyzedAt?:string};
type Evidence={summary?:string;excerpts:{id:string;text:string}[];filing:Filing;scope:string;cachedSnapshot?:boolean;capturedAt?:string};
type Snapshot={quotes:{ticker:string;price:number;changePct:number;quotedAt:string|null}[];retrievedAt:string};
const QUICK=['AAPL','MSFT','NVDA','TSLA','AMZN'];
const colors={Positive:'text-emerald-800 bg-emerald-50 border-emerald-200',Negative:'text-rose-800 bg-rose-50 border-rose-200',Neutral:'text-slate-700 bg-slate-100 border-slate-200'};
const safeUrl=(value:string)=>{try {return ['https:','http:'].includes(new URL(value).protocol)?value:undefined;} catch{return undefined;}};
const date=(value:string)=>new Date(value+'T12:00:00Z').toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
function useRequested<T>() {
  const [data,setData]=useState<T>();const [error,setError]=useState('');const [busy,setBusy]=useState(false);
  const controller=useRef<AbortController|null>(null);
  useEffect(()=>()=>controller.current?.abort(),[]);
  async function load(path:string) {
    controller.current?.abort();const active=new AbortController();controller.current=active;setBusy(true);setError('');
    const timer=setTimeout(()=>active.abort(),28000);
    try {const response=await fetch(path,{signal:active.signal});const body=await response.json();if(!response.ok)throw Error(body.error||'Research unavailable. Please retry.');if(controller.current===active)setData(body);}
    catch(e){if(controller.current===active)setError(e instanceof Error&&e.name!=='AbortError'?e.message:'The request took too long. Please retry.');}
    finally{clearTimeout(timer);if(controller.current===active)setBusy(false);}
  }
  return {data,error,busy,load};
}
function FilingReader({ticker,filing}:{ticker:string;filing:Filing}) {
  const reader=useRequested<Evidence>();
  const path=`/api/research/${ticker}/filings/${filing.accession}`;
  return <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
    <div className="flex justify-between gap-3 flex-wrap"><div><p className="text-sm font-bold">Selected: {filing.form} · {date(filing.filed)}</p><p className="text-xs text-slate-500 mt-1">Reporting period {filing.reportDate || 'not supplied'} · {filing.accession}</p></div><a className="text-sm text-green-800 underline" href={safeUrl(filing.url)} target="_blank" rel="noopener noreferrer">Open SEC document ↗</a></div>
    <p className="text-sm text-slate-600">Read selected passages or request an evidence-linked summary. The analyst can answer follow-ups about this selected filing.</p>
    <div className="flex flex-wrap gap-2"><button disabled={reader.busy} onClick={()=>void reader.load(path+'/excerpts')} className="px-3 py-2 border bg-white rounded-lg text-sm disabled:opacity-50">Read excerpts</button><button disabled={reader.busy} onClick={()=>void reader.load(path+'/analysis')} className="px-3 py-2 bg-green-800 text-white rounded-lg text-sm flex items-center gap-2 disabled:opacity-50"><Sparkles size={14}/>{reader.busy?'Reading filing…':'Summarize filing'}</button></div>
    {reader.error&&<p role="alert" className="text-sm text-amber-800">{reader.error}</p>}
    {reader.data&&<>{reader.data.cachedSnapshot&&<p className="text-xs text-amber-800">Saved source passages captured {new Date(reader.data.capturedAt!).toLocaleString()}. Live SEC retrieval is unavailable.</p>}<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Selected excerpts · not a complete filing review</p>{reader.data.summary&&<p className="text-sm whitespace-pre-wrap leading-relaxed text-slate-800">{reader.data.summary}</p>}<details open={!reader.data.summary}><summary className="cursor-pointer text-sm font-semibold text-green-800">Evidence passages ({reader.data.excerpts.length})</summary><div className="space-y-3 mt-3">{reader.data.excerpts.map(e=><blockquote key={e.id} className="border-l-2 border-green-700 pl-3 text-xs leading-relaxed text-slate-600"><strong>[{e.id}] </strong>{e.text}</blockquote>)}</div></details></>}
  </div>;
}
function NewsCard({article}:{article:Article}) {
  return <article className="border border-slate-200 rounded-xl bg-white p-4 space-y-3">
    <div className="flex items-center justify-between gap-2 flex-wrap"><span className={`text-xs font-semibold border px-2.5 py-1 rounded-full ${colors[article.label]}`}>{article.label}</span><span className="text-[11px] text-slate-500">{article.method} · {article.basis}</span></div>
    <a href={safeUrl(article.link)} target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-900 leading-snug block hover:text-green-800">{article.title} <ArrowUpRight className="inline" size={14}/></a>
    <p className="text-xs text-slate-500">{article.publisher} · {Number.isFinite(article.time)?new Date(article.time).toLocaleString():'Publication time unavailable'}</p>
    <p className="text-sm leading-relaxed text-slate-600"><strong className="text-slate-800">Why this tag: </strong>{article.reason}</p>
  </article>;
}
function CompanyNews({ticker,changePct}:{ticker:string;changePct?:number}) {
  const news=useResource<News>(`/api/research/${ticker}/news`,300000);
  const analysis=useRequested<News>();const [filter,setFilter]=useState('All');
  // A later provider refresh supersedes an analysis of an older set of headlines.
  const analyzed=analysis.data&&news.data&&analysis.data.articles.map(a=>a.id).join()===news.data.articles.map(a=>a.id).join();
  const data=analyzed?analysis.data:news.data;
  const articles=data?.articles||[];
  return <section aria-label="News impact" className="space-y-4">
    <div className="flex justify-between items-start gap-3 flex-wrap"><div><h2 className="font-bold text-xl">News & potential impact</h2><p className="text-sm text-slate-500 mt-1">What developments could matter for {ticker}?</p></div><button disabled={analysis.busy||!articles.length} onClick={()=>void analysis.load(`/api/research/${ticker}/news-analysis`)} className="rounded-lg border border-green-700 text-green-800 px-3 py-2 text-xs font-semibold flex gap-2 items-center disabled:opacity-40"><Sparkles size={14}/>{analysis.busy?'Analyzing…':'Deepen top 3 with AI'}</button></div>
    <div className="rounded-xl bg-slate-900 text-white p-4"><p className="text-xs uppercase tracking-wider text-slate-400">Price ≠ news sentiment</p><p className="text-sm mt-2 leading-relaxed">{changePct!==undefined?`${ticker} ${changePct>=0?'rose':'fell'} ${Math.abs(changePct).toFixed(2)}% in the quoted session. `:''}These tags describe possible business impact. Headlines can be published after the quoted session, and do not prove what caused a price move.</p></div>
    {news.error&&<p role="status" className="text-sm text-amber-800">Company news is unavailable. Filings and quotes load independently. <button className="underline" onClick={()=>void news.refresh()}>Retry news</button></p>}
    {!news.data&&!news.error&&<p role="status" className="text-sm text-slate-500">Finding company headlines…</p>}
    {analysis.error&&<p role="alert" className="text-sm text-amber-800">{analysis.error} Headline-rule tags remain available.</p>}
    {articles.length>0&&<><div className="flex flex-wrap gap-2">{['All','Positive','Negative','Neutral'].map(label=><button key={label} aria-pressed={filter===label} onClick={()=>setFilter(label)} className={`text-xs rounded-full px-3 py-1.5 border ${filter===label?'bg-green-800 text-white border-green-800':'bg-white text-slate-600'}`}>{label} · {label==='All'?articles.length:articles.filter(a=>a.label===label).length}</button>)}</div><p className="text-xs text-slate-500">Limited-confidence headline assessment. Neutral includes mixed or insufficient evidence. AI reviews up to three headlines; other tags use transparent rules.</p></>}
    <div className="space-y-3">{articles.filter(a=>filter==='All'||a.label===filter).map(a=><NewsCard key={a.id} article={a}/>)}</div>
    {data&&!articles.length&&<p className="text-sm text-slate-500 border border-dashed p-5 rounded-xl">No directly matching company headlines were returned. We have not assigned unrelated news as a price driver.</p>}
    {!!data?.unconfirmed.length&&<details className="rounded-xl border p-4"><summary className="cursor-pointer text-sm text-slate-600">Other provider headlines · relevance unconfirmed ({data.unconfirmed.length})</summary><div className="space-y-3 mt-3">{data.unconfirmed.map(a=><NewsCard key={a.id} article={a}/>)}</div></details>}
    {data&&<p className="text-xs text-slate-400">Feed retrieved {new Date(data.retrievedAt).toLocaleString()} · Source: Finnhub company news</p>}
  </section>;
}
export default function CompanyResearch({ticker,onNavigate,onFiling}:{ticker:string;onNavigate:(page:PageId,ticker?:string)=>void;onFiling:(accession:string)=>void}) {
  const companies=useResource<{ticker:string;name:string}[]>('/api/research/companies',3600000);
  const quotes=useResource<Snapshot>(`/api/quotes?tickers=${encodeURIComponent(ticker)}`,60000);
  const filings=useResource<Filings>(`/api/research/${encodeURIComponent(ticker)}/filings`,3600000);
  const [input,setInput]=useState(ticker),[error,setError]=useState(''),[chosen,setChosen]=useState('');
  const list=filings.data?.filings||[];const filing=list.find(f=>f.accession===chosen)||list.find(f=>f.form==='10-Q'||f.form==='10-K')||list[0];
  useEffect(()=>onFiling(filing?.accession||''),[filing?.accession,onFiling]);
  const quote=quotes.data?.quotes[0];const name=companies.data?.find(c=>c.ticker===ticker)?.name||ticker;
  return <div className="p-5 lg:p-8 space-y-7 max-w-[1100px] mx-auto">
    <header><p className="text-xs font-semibold uppercase tracking-[.18em] text-green-800 mb-2">StockSense / Research desk</p><h1 className="text-3xl font-bold tracking-tight text-slate-900">Behind the ticker.</h1><p className="text-sm text-slate-500 mt-2">Connect company disclosures, news signals, and market movement.</p></header>
    <form className="flex flex-wrap gap-2" onSubmit={e=>{e.preventDefault();const next=input.trim().toUpperCase();if(!/^[A-Z]{1,5}(?:[.-][A-Z]{1,2})?$/.test(next)){setError('Enter a ticker, such as AAPL.');return;}setError('');onNavigate('stock-detail',next);}}><label className="sr-only" htmlFor="research-symbol">Research ticker</label><input id="research-symbol" list="research-companies" value={input} onChange={e=>setInput(e.target.value)} className="border border-slate-300 bg-white rounded-lg px-3 py-2 min-w-0 text-sm" placeholder="Company ticker"/><datalist id="research-companies">{companies.data?.map(c=><option key={c.ticker} value={c.ticker}>{c.name}</option>)}</datalist><button className="bg-green-800 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"><Search size={15}/>Research</button>{error&&<p role="alert" className="text-sm text-red-700">{error}</p>}</form>
    <div className="flex gap-2 flex-wrap">{QUICK.map(t=><button key={t} aria-pressed={t===ticker} onClick={()=>onNavigate('stock-detail',t)} className={`text-xs px-3 py-1.5 rounded-full border ${t===ticker?'border-green-800 bg-green-50 text-green-900 font-bold':'border-slate-200 bg-white text-slate-500'}`}>{t}</button>)}</div>
    <section aria-label="Company quote" className="rounded-2xl bg-white border border-slate-200 p-5 flex justify-between gap-4 flex-wrap"><div><p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{ticker}</p><h2 className="text-xl font-bold text-slate-900 mt-1">{name}</h2><p className="text-xs text-slate-500 mt-2">{quote?.quotedAt?`Quote: ${new Date(quote.quotedAt).toLocaleString()}`:'Source: Finnhub'}</p></div><div className="text-right">{quote?<><p className="text-3xl font-semibold tracking-tight">${quote.price.toFixed(2)}</p><p className={`text-sm mt-1 ${quote.changePct>=0?'text-green-700':'text-red-700'}`}>{quote.changePct>=0?'+':''}{quote.changePct.toFixed(2)}% <span className="text-slate-400 text-xs">daily change</span></p></>:<p role="status" className="text-sm text-slate-500">{quotes.error?'Quote unavailable':'Loading quote…'}</p>}<button disabled={quotes.loading} onClick={()=>void quotes.refresh()} className="text-xs text-slate-500 mt-3 inline-flex gap-1 items-center"><RefreshCw size={12}/>Refresh quote</button></div><p className="w-full text-[11px] text-slate-400">Quotes may be delayed. Refreshes every minute while visible; market prices do not update when the exchange is closed.</p></section>
    <section aria-label="SEC filings" className="space-y-4"><div className="flex justify-between items-center gap-2"><div><h2 className="text-xl font-bold flex gap-2 items-center"><FileText size={20} className="text-green-800"/>SEC filing library</h2><p className="text-sm text-slate-500 mt-1">Company disclosures, straight from EDGAR.</p></div><span className="text-[10px] uppercase tracking-wider border rounded-full px-2 py-1 text-slate-500">Primary sources</span></div>
      {filings.error&&<p role="status" className="text-sm text-amber-800">SEC filings are temporarily unavailable. <button onClick={()=>void filings.refresh()} className="underline">Retry filings</button></p>}
      {!filings.data&&!filings.error&&<p role="status" className="text-sm text-slate-500">Loading SEC documents…</p>}
      {filings.data?.unsupported&&<p className="text-sm text-slate-600">{filings.data.message}</p>}
      {filings.data?.cachedSnapshot&&<p role="status" className="text-xs text-amber-800 rounded-lg bg-amber-50 p-3">Verified SEC snapshot · {new Date(filings.data.capturedAt!).toLocaleString()}. Live SEC retrieval is unavailable; newer filings may exist. Original documents remain linked below.</p>}
      {list.length>0&&<><div className="grid sm:grid-cols-3 gap-3">{['10-K','10-Q','8-K'].map(form=>{const f=list.find(v=>v.form===form);return <button key={form} disabled={!f} onClick={()=>f&&setChosen(f.accession)} className={`text-left rounded-xl p-4 border disabled:opacity-50 ${f?.accession===filing?.accession?'border-green-700 bg-green-50':'border-slate-200 bg-white'}`}><p className="text-lg font-bold">{form}</p><p className="text-xs text-slate-500 mt-1">{f?.label||'No recent report'}</p><p className="text-xs text-slate-600 mt-3">{f?date(f.filed):'Not returned'}</p></button>;})}</div><label className="block text-xs text-slate-500">Browse recent filings<select aria-label="Select SEC filing" value={filing?.accession||''} onChange={e=>setChosen(e.target.value)} className="block mt-2 w-full p-2 border rounded-lg bg-white text-sm text-slate-700">{list.map(f=><option key={f.accession} value={f.accession}>{f.form} · {f.filed} · {f.accession}</option>)}</select></label></>}
      {filing&&<FilingReader key={filing.accession} ticker={ticker} filing={filing}/>}
      <details className="text-xs text-slate-500"><summary className="cursor-pointer">Research coverage & filing types</summary><p className="mt-2 leading-relaxed">10-K: annual business and financial report. 10-Q: quarterly financial update. 8-K: material current events. This release covers {companies.data?.length||14} US issuers: {companies.data?.map(c=>c.ticker).join(', ')}. Older filings beyond the recent SEC list and international issuers are not included.</p></details>
    </section>
    <CompanyNews key={ticker} ticker={ticker} changePct={quote?.changePct}/>
    <div className="rounded-xl border border-green-200 bg-green-50 p-5"><h2 className="font-semibold text-green-900">Take the next research step</h2><p className="text-sm text-green-900 mt-2">Ask the analyst: “What risks does {ticker} disclose in this filing?” or “Does the news explain the price move?” The selected filing follows your conversation, with links back to the source.</p><p className="text-xs text-green-800 mt-3">Educational research. Headline tags and AI summaries are interpretations, not investment advice.</p></div>
    <a href="https://www.sec.gov/search-filings" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 inline-flex gap-1 items-center">Explore more on SEC EDGAR<ExternalLink size={12}/></a>
  </div>;
}
