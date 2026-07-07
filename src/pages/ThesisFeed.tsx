import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import ThesisCard from '../components/ui/ThesisCard';
import type { ThesisCardData, PageId } from '../types';
import { useLoadingMessage } from '../hooks/useLoadingMessage';

interface ThesisFeedProps {
  onNavigate: (page: PageId, ticker?: string) => void;
}

import { API_BASE_URL } from '../config';

export default function ThesisFeed({ onNavigate }: ThesisFeedProps) {
  const [cards, setCards] = useState<ThesisCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadingMessage = useLoadingMessage();

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/thesis-feed`);
        if (!res.ok) throw new Error('Failed to fetch data');
        setCards(await res.json());
      } catch (err) {
        console.error(err);
        setError('Failed to load dynamic thesis cards. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-[800px] mx-auto min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
        <div className="text-sm font-medium text-slate-500 animate-pulse mt-4">{loadingMessage}</div>
      </div>
    );
  }

  if (error || cards.length === 0) {
    return (
      <div className="p-8 max-w-[800px] mx-auto min-h-[60vh] flex flex-col items-center justify-center">
        <AlertCircle size={32} className="text-red-500 mb-2" />
        <div className="text-sm font-medium text-slate-700">{error || 'No data found'}</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-[800px] mx-auto pb-20">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Thesis Feed</h1>
        <p className="text-slate-500 mt-1">Real-time, AI-generated investment narratives for top trending stocks.</p>
      </motion.div>

      <div className="space-y-8">
        {cards.map((data, index) => (
          <motion.div
            key={data.ticker}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
          >
            <ThesisCard data={data} onNavigate={onNavigate} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
