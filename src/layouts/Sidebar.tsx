import { motion } from 'framer-motion';
import {
  LayoutDashboard, TrendingUp, Scale, Star, Globe,
  Newspaper, Calendar, Info
} from 'lucide-react';
import type { PageId } from '../types';
import { cn } from '../lib/utils';

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
}

const navItems = [
  { id: 'dashboard' as PageId, icon: LayoutDashboard, title: 'Dashboard', description: 'Overview of markets' },
  { id: 'stock-analysis' as PageId, icon: TrendingUp, title: 'Stock Analysis', description: 'Deep dive any stock' },
  { id: 'compare-stocks' as PageId, icon: Scale, title: 'Compare Stocks', description: 'Side-by-side comparison' },
  { id: 'watchlist' as PageId, icon: Star, title: 'Watchlist', description: 'Your saved stocks' },
  { id: 'market-overview' as PageId, icon: Globe, title: 'Market Overview', description: 'Global market view' },
  { id: 'financial-news' as PageId, icon: Newspaper, title: 'Financial News', description: 'Latest financial news' },
  { id: 'earnings-calendar' as PageId, icon: Calendar, title: 'Earnings Calendar', description: 'Upcoming earnings' },
  { id: 'about' as PageId, icon: Info, title: 'About', description: 'Platform information' },
];

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="w-[220px] min-w-[220px] h-screen bg-white border-r border-green-100 flex flex-col overflow-hidden shadow-[2px_0_12px_rgba(0,0,0,0.05)]">
      {/* Logo */}
      <div className="p-5 pb-4 border-b border-green-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-[0_2px_8px_rgba(22,163,74,0.35)]">
            <TrendingUp size={16} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-800 leading-none">StockSense AI</div>
            <div className="text-[10px] text-slate-400 mt-0.5">AI Powered Research</div>
          </div>
        </div>
      </div>

      {/* Market Status */}
      <div className="px-4 py-2.5 border-b border-green-50 bg-green-50/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
          <span className="text-xs text-green-700 font-semibold">Market Open</span>
          <span className="ml-auto text-[10px] text-slate-400">NYSE · NASDAQ</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'sidebar-item group w-full text-left',
                isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'
              )}
            >
              <div className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors',
                isActive ? 'bg-green-500 text-white shadow-[0_2px_8px_rgba(22,163,74,0.3)]' : 'bg-slate-100 text-slate-400 group-hover:bg-green-100 group-hover:text-green-600'
              )}>
                <Icon size={14} />
              </div>
              <div className="min-w-0">
                <div className={cn(
                  'text-sm font-semibold leading-tight',
                  isActive ? 'text-green-800' : 'text-slate-600 group-hover:text-slate-800'
                )}>
                  {item.title}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 leading-tight truncate">
                  {item.description}
                </div>
              </div>
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="ml-auto w-1 h-4 rounded-full bg-green-500"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-green-50 bg-green-50/30">
        <div className="text-[10px] text-slate-400 text-center">Phase 1 — UI Demo</div>
        <div className="text-[10px] text-slate-400 text-center mt-0.5">All data is mocked</div>
      </div>
    </aside>
  );
}
