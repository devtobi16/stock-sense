import { motion } from 'framer-motion';
import {
  Database, Server, Code2, Bot, BarChart3, User,
  ArrowDown, Zap, Globe, Shield, Cpu, GitBranch
} from 'lucide-react';
import { Card, CardHeader } from '../components/ui';

const archSteps = [
  { icon: User, label: 'User', sub: 'Query + Ticker', color: '#16a34a' },
  { icon: Code2, label: 'Frontend', sub: 'React + TypeScript', color: '#2563eb' },
  { icon: Server, label: 'Backend', sub: 'FastAPI (Python)', color: '#0891b2' },
  { icon: Globe, label: 'Financial APIs', sub: 'Finnhub · FMP · Polygon', color: '#d97706' },
  { icon: BarChart3, label: 'Scoring Engine', sub: 'Rule-Based Logic', color: '#7c3aed' },
  { icon: Bot, label: 'LLM Explanation', sub: 'OpenAI GPT-4o', color: '#16a34a' },
  { icon: Zap, label: 'Recommendation', sub: 'BUY · HOLD · SELL', color: '#15803d' },
];

const futureSteps = [
  { icon: Globe, label: 'Real-Time Data', color: '#16a34a', desc: 'WebSocket feeds from Finnhub and Polygon.io for live price updates' },
  { icon: Database, label: 'Vector DB', color: '#2563eb', desc: 'Store earnings reports and filings as embeddings for semantic search' },
  { icon: Bot, label: 'Agent Framework', color: '#7c3aed', desc: 'Autonomous AI agents that research, validate, and debate each pick' },
  { icon: Cpu, label: 'Fine-Tuned LLM', color: '#d97706', desc: 'Custom model trained on 10K/Q filings and analyst report patterns' },
  { icon: Shield, label: 'Risk Engine', color: '#dc2626', desc: 'Portfolio-level risk assessment with correlation matrix analysis' },
  { icon: GitBranch, label: 'Backtesting', color: '#0891b2', desc: 'Validate scoring model against 10 years of historical returns' },
];

const techStack = [
  { category: 'Frontend', items: ['React', 'TypeScript', 'Tailwind CSS', 'Recharts', 'Framer Motion'] },
  { category: 'Backend (Planned)', items: ['FastAPI', 'Python', 'Pydantic', 'Uvicorn'] },
  { category: 'Data Sources', items: ['Finnhub', 'Financial Modeling Prep', 'Polygon.io', 'Alpha Vantage'] },
  { category: 'AI / LLM', items: ['OpenAI GPT-4o', 'LangChain', 'LlamaIndex'] },
  { category: 'Infrastructure', items: ['PostgreSQL', 'Redis', 'Pinecone', 'AWS / GCP'] },
  { category: 'Scoring Engine', items: ['40+ Indicators', 'Weighted Scoring', 'Customizable Weights'] },
];

export default function About() {
  return (
    <div className="p-6 space-y-6 max-w-[1100px]">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
        <div className="inline-flex items-center gap-2 bg-green-100 border border-green-200 rounded-full px-4 py-1.5 text-xs text-green-700 font-semibold mb-4">
          <Zap size={12} />
          Phase 1 — UI Demo
        </div>
        <h1 className="text-4xl font-black text-slate-800 mb-3">
          StockSense <span className="gradient-text">AI</span>
        </h1>
        <p className="text-slate-500 text-base max-w-2xl mx-auto leading-relaxed">
          An AI-powered equity research platform that combines rule-based financial scoring with
          large language model explanations to deliver institutional-quality stock analysis to individual investors.
        </p>
      </motion.div>

      {/* System Architecture */}
      <Card className="p-6">
        <CardHeader title="System Architecture" subtitle="How StockSense AI works end-to-end" icon={<Server size={14} />} />
        <div className="flex flex-col items-center gap-0 mt-4">
          {archSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div key={step.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="flex flex-col items-center">
                <div
                  className="flex items-center gap-3 px-6 py-3 rounded-2xl border min-w-[280px] justify-center"
                  style={{ backgroundColor: `${step.color}0f`, borderColor: `${step.color}25` }}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${step.color}20` }}>
                    <Icon size={16} style={{ color: step.color }} />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-slate-800">{step.label}</div>
                    <div className="text-xs text-slate-400">{step.sub}</div>
                  </div>
                </div>
                {i < archSteps.length - 1 && (
                  <div className="flex flex-col items-center my-1">
                    <div className="w-px h-4 bg-slate-200" />
                    <ArrowDown size={12} className="text-slate-400" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Scoring Engine */}
      <Card className="p-5 border-green-200">
        <CardHeader title="Scoring Engine — Rule-Based Logic" icon={<BarChart3 size={14} />} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
          {[
            { label: 'Fundamentals', pct: 35, desc: 'P/E, PEG, ROE, Margins, Growth', color: '#16a34a' },
            { label: 'Technicals', pct: 25, desc: 'RSI, MACD, MA, Trend', color: '#2563eb' },
            { label: 'Sentiment', pct: 25, desc: 'News NLP, Social Signals', color: '#7c3aed' },
            { label: 'Valuation', pct: 15, desc: 'DCF, Comparables, Multiples', color: '#d97706' },
          ].map((item) => (
            <div key={item.label} className="text-center p-3 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-2xl font-black mb-1" style={{ color: item.color }}>{item.pct}%</div>
              <div className="text-xs font-semibold text-slate-700 mb-1">{item.label}</div>
              <div className="text-[10px] text-slate-400 leading-tight">{item.desc}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-200 font-mono text-xs text-slate-500 leading-relaxed">
          <div className="text-green-600 mb-1">// Overall Score Formula</div>
          <div>score = (0.35 × fundamental_score)</div>
          <div className="ml-8">+ (0.25 × technical_score)</div>
          <div className="ml-8">+ (0.25 × sentiment_score)</div>
          <div className="ml-8">+ (0.15 × valuation_score)</div>
        </div>
      </Card>

      {/* Future Pipeline */}
      <Card className="p-5">
        <CardHeader title="Future AI Pipeline" subtitle="Planned enhancements for Phase 2 and beyond" icon={<Zap size={14} />} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
          {futureSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.07 }}
                whileHover={{ y: -2 }}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-green-300 hover:bg-green-50/50 transition-all cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${step.color}18` }}>
                  <Icon size={18} style={{ color: step.color }} />
                </div>
                <div className="text-sm font-bold text-slate-800 mb-1">{step.label}</div>
                <div className="text-xs text-slate-500 leading-relaxed">{step.desc}</div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Tech Stack */}
      <Card className="p-5">
        <CardHeader title="Technologies & APIs" icon={<Code2 size={14} />} />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
          {techStack.map((group) => (
            <div key={group.category}>
              <div className="text-xs font-semibold text-green-700 mb-2 uppercase tracking-wider">{group.category}</div>
              <div className="space-y-1.5">
                {group.items.map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-green-500" />
                    <span className="text-xs text-slate-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Free Tier Note */}
      <Card className="p-5 bg-green-50 border-green-200">
        <h3 className="text-sm font-semibold text-green-700 mb-3">✓ Why 100% Free APIs Are Possible</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600">
          {[
            'All data APIs have generous free tiers for personal & MVP projects',
            'No authentication required for public market data',
            'OpenAI API costs pennies per analysis at gpt-4o-mini pricing',
          ].map((item) => (
            <div key={item} className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5 border border-green-200">
                <span className="text-green-600 text-[10px]">✓</span>
              </div>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
