import { useState } from 'react';
import type { PageId } from '../types';
import LeftSidebar from './LeftSidebar';
import RightPanel from './RightPanel';
interface AppShellProps { activePage:PageId; selectedTicker?:string; selectedFiling?:string; onNavigate:(page:PageId,ticker?:string)=>void; children:React.ReactNode }
export default function AppShell({activePage,selectedTicker,selectedFiling,onNavigate,children}:AppShellProps) {
  const [panel,setPanel]=useState<'navigation'|'chat'|null>(null);
  return <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50">
    <div className="lg:hidden flex justify-between border-b bg-white p-3 text-sm"><button onClick={()=>setPanel(panel==='navigation'?null:'navigation')}>☰ Navigation</button><strong>StockSense</strong><button onClick={()=>setPanel(panel==='chat'?null:'chat')}>{panel==='chat'?'Close chat':'Ask analyst'}</button></div>
    <div className="flex flex-1 min-h-0 relative">
      <div className={panel==='navigation'?'absolute left-0 top-0 bottom-0 z-20 shadow-xl overflow-auto':'hidden lg:block'}><LeftSidebar activePage={activePage} onNavigate={(page,ticker)=>{onNavigate(page,ticker);setPanel(null);}}/></div>
      <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">{children}</main>
      <div className={panel==='chat'?'absolute right-0 top-0 bottom-0 z-20 shadow-xl bg-white':'hidden lg:block'}><RightPanel filing={['dashboard','stock-detail','stock-analysis','research-report'].includes(activePage)?selectedFiling:undefined} ticker={['dashboard','stock-detail','stock-analysis','research-report'].includes(activePage)?selectedTicker:undefined}/></div>
    </div>
  </div>;
}
