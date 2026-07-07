import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Recommendation } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatChange(change: number): string {
  return `${change >= 0 ? '+' : ''}${change.toFixed(2)}`;
}

export function formatChangePct(pct: number): string {
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;
}

export function getChangeColor(change: number): string {
  if (change > 0) return 'text-green-600';
  if (change < 0) return 'text-red-600';
  return 'text-slate-500';
}

export function getChangeBg(change: number): string {
  if (change > 0) return 'bg-green-50 text-green-700';
  if (change < 0) return 'bg-red-50 text-red-700';
  return 'bg-slate-100 text-slate-500';
}

export function getRecommendationColor(rec: Recommendation): string {
  if (rec === 'STRONG BUY') return 'text-emerald-700';
  if (rec === 'BUY') return 'text-green-700';
  if (rec === 'HOLD') return 'text-amber-600';
  if (rec === 'SELL') return 'text-red-600';
  return 'text-red-800';
}

export function getRecommendationBadge(rec: Recommendation): string {
  if (rec === 'STRONG BUY') return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
  if (rec === 'BUY') return 'bg-green-100 text-green-800 border border-green-200';
  if (rec === 'HOLD') return 'bg-amber-100 text-amber-800 border border-amber-200';
  if (rec === 'SELL') return 'bg-red-100 text-red-800 border border-red-200';
  return 'bg-red-200 text-red-900 border border-red-300';
}

export function getSentimentBadge(sentiment: 'Positive' | 'Neutral' | 'Negative'): string {
  if (sentiment === 'Positive') return 'badge-positive';
  if (sentiment === 'Negative') return 'badge-negative';
  return 'badge-neutral';
}

export function getSignalColor(signal: string): string {
  if (signal === 'Bullish' || signal === 'Above') return 'text-green-700 bg-green-50 border-green-200';
  if (signal === 'Bearish' || signal === 'Below') return 'text-red-600 bg-red-50 border-red-200';
  return 'text-amber-700 bg-amber-50 border-amber-200';
}

export function getConfidenceColor(score: number): string {
  if (score >= 75) return '#16a34a';
  if (score >= 55) return '#d97706';
  return '#dc2626';
}

export function getScoreColor(score: number): string {
  if (score >= 75) return 'bg-green-500';
  if (score >= 55) return 'bg-amber-500';
  return 'bg-red-500';
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
