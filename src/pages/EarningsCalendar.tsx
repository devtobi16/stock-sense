import { useState } from 'react';
import { useResource } from '../hooks/useResource';

type Release={ticker:string;date:string;timestamp:number;time:string;estimatedEPS:number|null;actualEPS:number|null;expectedRevenue:number|null};
const PAGE_SIZE=25;
const money=(value:number|null)=>Number.isFinite(value)?new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',notation:'compact',maximumFractionDigits:2}).format(value!):'Not reported';
export default function EarningsCalendar() {
  const resource=useResource<Release[]>('/api/earnings-calendar',300000);
  const [query,setQuery]=useState(''),[page,setPage]=useState(1);
  const rows=(resource.data||[]).filter(row=>row.ticker.toUpperCase().includes(query.trim().toUpperCase()));
  const pages=Math.max(1,Math.ceil(rows.length/PAGE_SIZE));
  const current=Math.min(page,pages), visible=rows.slice((current-1)*PAGE_SIZE,current*PAGE_SIZE);
  return <div className="p-6 space-y-5 max-w-[1400px]">
    <header><h1 className="text-2xl font-bold text-slate-800">Earnings Calendar</h1><p className="text-sm text-slate-500 mt-1">Upcoming releases over the next 30 days across Finnhub’s returned coverage. Dates and estimates may change; coverage is not guaranteed for every security.</p></header>
    <div className="flex flex-wrap gap-3 items-center"><label className="text-sm text-slate-600">Filter by ticker<input aria-label="Filter earnings by ticker" value={query} onChange={e=>{setQuery(e.target.value);setPage(1);}} placeholder="e.g. KO, COST, AAPL" className="block mt-1 px-3 py-2 border rounded-lg bg-white"/></label><button onClick={()=>void resource.refresh()} disabled={resource.loading} className="px-3 py-2 border rounded-lg text-sm disabled:opacity-50">Refresh calendar</button></div>
    {resource.error&&<p role="alert" className="text-sm text-amber-800">{resource.data?'Refresh failed. Showing the last loaded calendar.':resource.error}</p>}
    {!resource.data&&!resource.error&&<p role="status">Loading earnings releases…</p>}
    {resource.data&&<><p role="status" className="text-sm text-slate-500">{rows.length} matching releases · {resource.data.length} returned by provider · Dates shown as scheduled calendar dates.</p>
    {!rows.length?<p className="border border-dashed rounded-xl p-6 text-slate-500">{query?'No releases match this ticker within the next 30 days.':'The provider returned no releases for the next 30 days.'}</p>:<div className="overflow-x-auto bg-white border rounded-xl"><table className="w-full text-sm"><caption className="sr-only">Upcoming earnings releases</caption><thead><tr className="text-left text-slate-500 border-b">{['Ticker','Date','Session','Estimated EPS','Reported EPS','Estimated revenue'].map(h=><th key={h} scope="col" className="p-3 whitespace-nowrap">{h}</th>)}</tr></thead><tbody>{visible.map((row,i)=><tr key={`${row.ticker}-${row.timestamp}-${i}`} className="border-b last:border-0"><th scope="row" className="p-3 text-left text-green-800">{row.ticker}</th><td className="p-3 whitespace-nowrap">{row.date}</td><td className="p-3 whitespace-nowrap">{row.time}</td><td className="p-3">{Number.isFinite(row.estimatedEPS)?`$${row.estimatedEPS!.toFixed(2)}`:'Not reported'}</td><td className="p-3">{Number.isFinite(row.actualEPS)?`$${row.actualEPS!.toFixed(2)}`:'Not reported'}</td><td className="p-3">{money(row.expectedRevenue)}</td></tr>)}</tbody></table></div>}
    {rows.length>0&&<nav aria-label="Earnings pages" className="flex gap-3 items-center text-sm"><button disabled={current===1} onClick={()=>setPage(current-1)} className="border rounded-lg px-3 py-2 disabled:opacity-40">Previous</button><span>Page {current} of {pages}</span><button disabled={current===pages} onClick={()=>setPage(current+1)} className="border rounded-lg px-3 py-2 disabled:opacity-40">Next</button></nav>}
    <p className="text-xs text-slate-400">Source: Finnhub. Cached across visitors and refreshed every five minutes while visible. Missing estimates are not treated as zero.</p></>}
  </div>;
}
