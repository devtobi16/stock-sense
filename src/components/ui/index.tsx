import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  accent?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function Card({ children, className, hover = false, accent = false, onClick, style }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -2 } : undefined}
      onClick={onClick}
      style={style}
      className={cn(
        'card',
        hover && 'card-hover cursor-pointer',
        accent && 'border-green-200 shadow-[0_2px_16px_rgba(22,163,74,0.08)]',
        className
      )}
    >
      {children}
    </motion.div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function CardHeader({ title, subtitle, action, icon }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-2.5">
        {icon && (
          <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

interface StatRowProps {
  label: string;
  value: string | number;
  subvalue?: string;
  valueColor?: string;
}

export function StatRow({ label, value, subvalue, valueColor }: StatRowProps) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <div className="text-right">
        <span className={cn('text-sm font-semibold text-slate-800', valueColor)}>{value}</span>
        {subvalue && <div className="text-[10px] text-slate-400">{subvalue}</div>}
      </div>
    </div>
  );
}

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  label?: string;
  showValue?: boolean;
}

export function ProgressBar({ value, max = 100, color, label, showValue = true }: ProgressBarProps) {
  const pct = Math.min((value / max) * 100, 100);
  const defaultColor = value >= 75 ? 'bg-green-500' : value >= 55 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="space-y-1">
      {(label || showValue) && (
        <div className="flex justify-between items-center">
          {label && <span className="text-xs text-slate-500">{label}</span>}
          {showValue && <span className="text-xs font-semibold text-slate-700">{value}/{max}</span>}
        </div>
      )}
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={cn('h-full rounded-full', color ?? defaultColor)}
        />
      </div>
    </div>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'positive' | 'negative' | 'neutral' | 'green' | 'blue';
  className?: string;
}

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  const variants = {
    positive: 'badge-positive',
    negative: 'badge-negative',
    neutral: 'badge-neutral',
    green: 'bg-green-100 text-green-800 border border-green-200 text-xs font-semibold px-2.5 py-1 rounded-full',
    blue: 'bg-blue-100 text-blue-800 border border-blue-200 text-xs font-semibold px-2.5 py-1 rounded-full',
  };
  return (
    <span className={cn(variants[variant], className)}>
      {children}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />;
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn('text-base font-semibold text-slate-800 mb-3', className)}>{children}</h2>
  );
}

interface ChangeChipProps {
  change: number;
  changePct: number;
  size?: 'sm' | 'md';
}

export function ChangeChip({ change, changePct, size = 'md' }: ChangeChipProps) {
  const positive = change >= 0;
  return (
    <span className={cn(
      'inline-flex items-center gap-1 font-semibold rounded-lg px-2 py-0.5',
      positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
      size === 'sm' ? 'text-xs' : 'text-sm'
    )}>
      {positive ? '▲' : '▼'} {Math.abs(changePct).toFixed(2)}%
    </span>
  );
}
