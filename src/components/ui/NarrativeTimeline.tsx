import { motion } from 'framer-motion';
 import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface NarrativeEvent {
  date?: string;
  // Old mock fields
  event?: string;
  type?: string;
  impact?: string;
  // New API fields
  title?: string;
  description?: string;
  sentiment?: string;
}

interface NarrativeTimelineProps {
  events: NarrativeEvent[];
}

export default function NarrativeTimeline({ events }: NarrativeTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <AlertCircle size={24} className="text-slate-300 mb-2" />
        <p className="text-sm text-slate-400">No narrative events available yet.</p>
        <p className="text-xs text-slate-300 mt-1">Events will appear as AI analyzes this stock.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[15px] before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
      {events.map((event, i) => {
        // Normalize fields — support both old mock shape and new API shape
        const label = event.event || event.title || 'Update';
        const detail = event.impact || event.description || '';
        const sentimentRaw = (event.sentiment || 'neutral').toLowerCase();
        const isBullish = sentimentRaw === 'bullish' || sentimentRaw === 'positive';
        const isBearish = sentimentRaw === 'bearish' || sentimentRaw === 'negative';

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative flex items-start gap-4 group"
          >
            {/* Timeline Node */}
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 border-white shadow-sm z-10",
              isBullish ? 'bg-green-100' : isBearish ? 'bg-red-100' : 'bg-slate-100'
            )}>
              {isBullish ? (
                <TrendingUp size={14} className="text-green-600" />
              ) : isBearish ? (
                <TrendingDown size={14} className="text-red-500" />
              ) : (
                <Minus size={14} className="text-slate-400" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm group-hover:border-slate-200 transition-colors">
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{event.date || 'Recent'}</span>
                  <h4 className="text-sm font-semibold text-slate-800">{label}</h4>
                </div>
                <span className={cn(
                  "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0",
                  isBullish ? 'bg-green-600 text-white' : isBearish ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-500'
                )}>
                  {isBullish ? 'Bullish' : isBearish ? 'Bearish' : 'Neutral'}
                </span>
              </div>
              {detail && (
                <p className="text-xs text-slate-600 leading-relaxed">{detail}</p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
