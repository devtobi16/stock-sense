
import { HelpCircle, Search, Scale, BookOpen, TrendingUp, TrendingDown, Clock, FileText } from 'lucide-react';
import { Card, ChangeChip } from './index';
import type { ThesisCardData, PageId } from '../../types';
import { cn, formatPrice } from '../../lib/utils';
import CircularProgress from '../charts/CircularProgress';

interface ThesisCardProps {
  data: ThesisCardData;
  onNavigate: (page: PageId, ticker?: string) => void;
}

export default function ThesisCard({ data, onNavigate }: ThesisCardProps) {
  const isBull = data.bias === 'Bullish';
  const isBear = data.bias === 'Bearish';

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-slate-900">{data.ticker}</h2>
              <span className="text-sm font-medium text-slate-500">{data.companyName}</span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-bold text-slate-800 mono">${formatPrice(data.price || 0)}</span>
              <ChangeChip change={data.change || 0} changePct={data.changePct || 0} size="sm" />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">AI Bias</div>
            <div className={cn(
              'px-3 py-1 rounded-full text-xs font-bold border',
              isBull ? 'bg-green-50 text-green-700 border-green-200' : 
              isBear ? 'bg-red-50 text-red-700 border-red-200' : 
              'bg-amber-50 text-amber-700 border-amber-200'
            )}>
              {data.bias}
            </div>
          </div>
          <CircularProgress value={data.confidence} size={54} strokeWidth={5} label={String(data.confidence)} />
        </div>
      </div>

      {/* AI Summary */}
      <div className="mb-6 bg-slate-50 border border-slate-100 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <BookOpen size={14} className="text-green-700" />
          </div>
          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            {data.summary}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Key Drivers */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Key Drivers</h3>
          <ul className="space-y-2">
            {data.keyDrivers.map((driver, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                <span>{driver}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* What Changed */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Clock size={12} /> What Changed
          </h3>
          <div className="space-y-3 relative before:absolute before:inset-0 before:ml-[5px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {data.whatChanged.map((item, i) => (
              <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* Timeline dot */}
                <div className="flex items-center justify-center w-3 h-3 rounded-full border-2 border-white bg-slate-300 group-[.is-active]:bg-green-500 text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                
                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-white p-2.5 rounded border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <time className="text-[10px] font-bold text-slate-400">{item.date}</time>
                  </div>
                  <div className="text-xs text-slate-600 leading-snug">{item.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bull vs Bear */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50/50 border border-green-100 rounded-xl p-4">
          <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <TrendingUp size={14} /> Bull Case
          </h4>
          <ul className="space-y-2">
            {data.bullCase.map((text, i) => (
              <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                <span className="text-green-500 font-bold mt-0.5">+</span> {text}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-red-50/50 border border-red-100 rounded-xl p-4">
          <h4 className="text-xs font-bold text-red-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <TrendingDown size={14} /> Bear Case
          </h4>
          <ul className="space-y-2">
            {data.bearCase.map((text, i) => (
              <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                <span className="text-red-500 font-bold mt-0.5">-</span> {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <button className="flex-1 btn-primary bg-slate-800 hover:bg-slate-900 text-white shadow-none py-2.5 flex items-center justify-center gap-2 text-sm">
            <HelpCircle size={14} /> Ask Why
          </button>
          <button 
            onClick={() => onNavigate('stock-detail', data.ticker)}
            className="flex-1 btn-primary bg-green-600 hover:bg-green-700 text-white shadow-[0_2px_8px_rgba(22,163,74,0.25)] py-2.5 flex items-center justify-center gap-2 text-sm"
          >
            <Search size={14} /> Deep Dive
          </button>
          <button className="flex-1 btn-ghost border border-slate-200 py-2.5 flex items-center justify-center gap-2 text-sm text-slate-600 hover:bg-slate-50">
            <Scale size={14} /> Compare
          </button>
        </div>
        <button 
          onClick={() => onNavigate('research-report', data.ticker)}
          className="w-full btn-ghost py-2.5 flex items-center justify-center gap-2 text-sm text-slate-700 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <FileText size={14} /> 📄 View Earnings Report
        </button>
      </div>
    </Card>
  );
}
