import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui';
import { cn } from '../lib/utils';
import { useLoadingMessage } from '../hooks/useLoadingMessage';

type DateGroup = 'Today' | 'Tomorrow' | 'This Week';
const groups: DateGroup[] = ['Today', 'Tomorrow', 'This Week'];

const groupBadge: Record<DateGroup, string> = {
  'Today': 'text-green-700 bg-green-100 border-green-200',
  'Tomorrow': 'text-blue-700 bg-blue-100 border-blue-200',
  'This Week': 'text-slate-600 bg-slate-100 border-slate-200',
};

const timeColors: Record<string, string> = {
  'Before Open': 'text-amber-700 bg-amber-50 border-amber-200',
  'After Close': 'text-blue-700 bg-blue-50 border-blue-200',
  'During Market': 'text-green-700 bg-green-50 border-green-200',
};

export default function EarningsCalendar() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadingMessage = useLoadingMessage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/earnings-calendar');
        if (!res.ok) throw new Error('Failed to load earnings calendar');
        const raw = await res.json();
        
        // Process dates into groups
        const now = new Date();
        const processed = raw.map((item: any) => {
          const eDate = new Date(item.timestamp * 1000);
          const diffDays = Math.round((eDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
          let group: DateGroup = 'This Week';
          if (diffDays <= 0) group = 'Today';
          else if (diffDays === 1) group = 'Tomorrow';

          return {
            ...item,
            group,
            time: 'After Close', // Mocked as YF free tier doesn't always have it
            estimatedEPS: item.sector || (item.lastEPS * 1.1),
            sector: 'Tech', // Mocked sector
            expectedRevenue: 'Not reported'
          };
        });
        setData(processed);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const grouped = groups.reduce((acc, g) => {
    acc[g] = data.filter((e) => e.group === g);
    return acc;
  }, {} as Record<DateGroup, any[]>);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
        <div className="text-sm font-medium text-slate-500 mt-4">{loadingMessage}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[60vh] text-red-500">
        <AlertCircle size={32} className="mb-2" />
        <div className="text-sm font-medium">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Earnings Calendar</h1>
        <p className="text-sm text-slate-500 mt-0.5">Upcoming earnings releases with estimates</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Today', count: grouped['Today'].length, color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
          { label: 'Tomorrow', count: grouped['Tomorrow'].length, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
          { label: 'This Week', count: grouped['This Week'].length, color: 'text-slate-700', bg: 'bg-slate-50 border-slate-200' },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className={cn('rounded-2xl border p-3 text-center', bg)}>
            <div className={cn('text-3xl font-bold', color)}>{count}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label} Earnings</div>
          </div>
        ))}
      </div>

      {/* Tables */}
      {groups.map((group) => {
        const entries = grouped[group];
        if (entries.length === 0) return null;
        return (
          <Card key={group} className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={15} className="text-green-600" />
              <h3 className="text-base font-semibold text-slate-800">{group}'s Earnings</h3>
              <span className={cn('text-xs font-semibold px-2.5 py-0.5 rounded-full border ml-2', groupBadge[group])}>
                {entries.length} companies
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Company', 'Sector', 'Time', 'Est. EPS', 'Last EPS', 'EPS Surprise', 'Est. Revenue'].map((h) => (
                      <th key={h} className="text-[10px] text-slate-400 uppercase tracking-wider text-left pb-3 pr-4 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, i) => {
                    const epsChange = ((entry.estimatedEPS - entry.lastEPS) / Math.abs(entry.lastEPS)) * 100;
                    return (
                      <motion.tr
                        key={entry.ticker}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-3 pr-4">
                          <div className="font-bold text-sm text-slate-800">{entry.ticker}</div>
                          <div className="text-xs text-slate-400 max-w-[140px] truncate">{entry.company}</div>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full border border-green-200">
                            {entry.sector}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-1.5">
                            <Clock size={11} className="text-slate-400" />
                            <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', timeColors[entry.time])}>
                              {entry.time}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-sm font-semibold text-slate-800 mono">${entry.estimatedEPS.toFixed(2)}</span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-sm text-slate-400 mono">${entry.lastEPS.toFixed(2)}</span>
                        </td>
                        <td className="py-3 pr-4">
                          <div className={cn('flex items-center gap-1 text-xs font-semibold', epsChange >= 0 ? 'text-green-600' : 'text-red-600')}>
                            {epsChange >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                            {epsChange >= 0 ? '+' : ''}{epsChange.toFixed(1)}%
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="text-sm font-semibold text-slate-800">{entry.expectedRevenue}</span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
