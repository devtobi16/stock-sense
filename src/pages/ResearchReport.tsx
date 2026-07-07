import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Download, ExternalLink, Activity, Target, ShieldAlert, CheckCircle2, TrendingUp, TrendingDown, FileBadge } from 'lucide-react';
import { Card, CardHeader, Badge } from '../components/ui';
import type { PageId } from '../types';
import { useLoadingMessage } from '../hooks/useLoadingMessage';

const formatMetric = (val: any) => {
  if (!val || val === 'N/A') {
    return <span className="text-[10px] font-normal text-slate-400 leading-tight block mt-0.5">Not reported for the selected period</span>;
  }
  return val;
};

interface ResearchReportProps {
  ticker?: string;
  onNavigate: (page: PageId, ticker?: string) => void;
}

import { API_BASE_URL } from '../config';

export default function ResearchReport({ ticker = 'AAPL', onNavigate }: ResearchReportProps) {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadingMessage = useLoadingMessage();

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/research-report/${ticker}`);
        if (!res.ok) throw new Error('Failed to fetch research report');
        setReport(await res.json());
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load research report.');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [ticker]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-8 max-w-[1000px] mx-auto min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
        <div className="text-sm font-medium text-slate-500 animate-pulse mt-4">{loadingMessage}</div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="p-8 max-w-[1000px] mx-auto min-h-[60vh] flex flex-col items-center justify-center">
        <div className="text-red-500 font-semibold">{error || 'No report generated.'}</div>
        <button onClick={() => onNavigate('dashboard')} className="mt-4 text-green-700 underline">Return to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-[1000px] mx-auto pb-20 print:p-0 print:m-0 print:max-w-none print:bg-white">
      {/* Header (hidden in print) */}
      <div className="flex justify-between items-center bg-white p-2 rounded-xl shadow-sm border border-slate-100 print:hidden">
        <button 
          onClick={() => onNavigate('stock-detail', ticker)}
          className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <button 
          onClick={handlePrint}
          className="btn-primary py-2 px-4 flex items-center gap-2"
        >
          <Download size={16} />
          Download PDF
        </button>
      </div>

      {/* Report Header */}
      <div className="flex items-start justify-between border-b pb-6 print:pb-4 print:border-slate-300">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{ticker} Research Report</h1>
            <Badge variant="neutral" className="print:border-slate-300 print:text-slate-700">Earnings & Financials</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <Activity size={14} className="text-green-600" />
            <span>AI Synthesized Institutional Report</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Status</div>
          <div className="inline-flex flex-col items-end">
            <Badge variant="green" className="mb-1">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Badge>
            <span className="text-[10px] text-slate-400">Source: Latest SEC Filings</span>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <Card className="p-6 border-green-200 bg-green-50/20 print:border-none print:bg-transparent print:p-0">
        <CardHeader title="Executive Summary" icon={<Target size={16} className="text-green-700" />} />
        <p className="text-slate-800 leading-relaxed mt-4 font-medium">
          {report.executiveSummary}
        </p>
      </Card>

      {/* Key Financials & Outlook */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
        {/* Latest Financial Results */}
        <Card className="p-5 print:border-slate-200">
          <CardHeader title="Latest Financial Results" icon={<TrendingUp size={16} />} />
          <div className="grid grid-cols-2 gap-y-4 gap-x-2 mt-5">
            <div><div className="text-xs text-slate-500">Revenue</div><div className="font-bold text-slate-900">{formatMetric(report.latestEarnings?.revenue)}</div></div>
            <div><div className="text-xs text-slate-500">Revenue Growth</div><div className="font-bold text-slate-900">{formatMetric(report.latestEarnings?.revenueGrowth)}</div></div>
            <div><div className="text-xs text-slate-500">EPS</div><div className="font-bold text-slate-900">{formatMetric(report.latestEarnings?.eps)}</div></div>
            <div><div className="text-xs text-slate-500">EPS Surprise</div><div className="font-bold text-slate-900">{formatMetric(report.latestEarnings?.epsSurprise)}</div></div>
            <div><div className="text-xs text-slate-500">Gross Margin</div><div className="font-bold text-slate-900">{formatMetric(report.latestEarnings?.grossMargin)}</div></div>
            <div><div className="text-xs text-slate-500">Operating Margin</div><div className="font-bold text-slate-900">{formatMetric(report.latestEarnings?.operatingMargin)}</div></div>
            <div><div className="text-xs text-slate-500">Net Income</div><div className="font-bold text-slate-900">{formatMetric(report.latestEarnings?.netIncome)}</div></div>
            <div><div className="text-xs text-slate-500">Free Cash Flow</div><div className="font-bold text-slate-900">{formatMetric(report.latestEarnings?.freeCashFlow)}</div></div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 print:border-slate-200">
            <div className="text-xs text-slate-500 mb-1">Management Outlook</div>
            <div className="text-sm font-medium text-slate-800">{report.latestEarnings?.guidance || 'Awaiting the company\'s next financial filing.'}</div>
          </div>
        </Card>

        {/* Research Summary */}
        <Card className="p-5 print:border-slate-200">
          <CardHeader title="Research Summary" icon={<Activity size={16} />} />
          <div className="mt-5 space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><CheckCircle2 size={12} className="text-green-500" /> What Improved</h4>
              <ul className="text-sm text-slate-700 pl-4 list-disc marker:text-green-500 space-y-1">
                {(report.aiAnalysis?.whatImproved || []).map((item: string, i: number) => <li key={i}>{item}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><TrendingDown size={12} className="text-red-500" /> What Declined</h4>
              <ul className="text-sm text-slate-700 pl-4 list-disc marker:text-red-500 space-y-1">
                {(report.aiAnalysis?.whatDeclined || []).map((item: string, i: number) => <li key={i}>{item}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><ShieldAlert size={12} className="text-amber-500" /> Key Risks</h4>
              <ul className="text-sm text-slate-700 pl-4 list-disc marker:text-amber-500 space-y-1">
                {(report.aiAnalysis?.risks || []).map((item: string, i: number) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* Quarterly Financial History Table */}
      <Card className="p-5 overflow-hidden print:border-none print:p-0 print:shadow-none print:mt-6">
        <CardHeader title="Quarterly Financial History" icon={<FileText size={16} />} />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4 font-semibold">Quarter</th>
                <th className="py-3 px-4 font-semibold">Revenue</th>
                <th className="py-3 px-4 font-semibold">EPS</th>
                <th className="py-3 px-4 font-semibold">Revenue Growth</th>
                <th className="py-3 px-4 font-semibold">EPS Growth</th>
              </tr>
            </thead>
            <tbody>
              {(report.historicalResults || []).map((row: any, i: number) => (
                <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 print:border-b print:border-slate-200">
                  <td className="py-3 px-4 font-medium text-slate-900">{row.quarter}</td>
                  <td className="py-3 px-4 text-slate-700">{row.revenue}</td>
                  <td className="py-3 px-4 text-slate-700">{row.eps}</td>
                  <td className={`py-3 px-4 font-medium ${row.revenueGrowth?.startsWith('-') ? 'text-red-600' : 'text-green-600'}`}>{row.revenueGrowth}</td>
                  <td className={`py-3 px-4 font-medium ${row.epsGrowth?.startsWith('-') ? 'text-red-600' : 'text-green-600'}`}>{row.epsGrowth}</td>
                </tr>
              ))}
              {(!report.historicalResults || report.historicalResults.length === 0) && (
                <tr><td colSpan={5} className="py-8 text-center text-slate-500 text-sm">Historical earnings data is not currently available for this company. It will appear automatically when reliable financial records are available.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Financial Statements */}
      <Card className="p-5 print:border-none print:p-0 print:shadow-none print:mt-6">
        <CardHeader title="Financial Statements Summary" icon={<FileBadge size={16} />} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-5 print:grid-cols-3">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-800 border-b pb-2">Income Statement</h4>
            <p className="text-sm text-slate-600">{report.financialStatements?.incomeStatement || 'Awaiting the company\'s next financial filing.'}</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-800 border-b pb-2">Balance Sheet</h4>
            <p className="text-sm text-slate-600">{report.financialStatements?.balanceSheet || 'Awaiting the company\'s next financial filing.'}</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-800 border-b pb-2">Cash Flow</h4>
            <p className="text-sm text-slate-600">{report.financialStatements?.cashFlow || 'Awaiting the company\'s next financial filing.'}</p>
          </div>
        </div>
      </Card>

      {/* Outlook & Source Documents */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3 print:mt-6">
        <Card className="p-5 md:col-span-2 print:border-slate-200">
          <CardHeader title="AI Outlook & Key Drivers" icon={<Target size={16} />} />
          <div className="mt-4 space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Primary Business Drivers</h4>
              <div className="flex flex-wrap gap-2">
                {(report.aiAnalysis?.keyDrivers || []).map((driver: string, i: number) => (
                  <Badge key={i} variant="neutral" className="bg-slate-100">{driver}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Forward Outlook</h4>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                {report.aiAnalysis?.outlook || 'Awaiting the company\'s next financial filing.'}
              </p>
            </div>
          </div>
        </Card>

        {/* Regulatory Filings */}
        <Card className="p-5 bg-slate-50 border-slate-200 print:bg-transparent print:border-slate-200">
          <CardHeader title="Regulatory Filings & Company Reports" icon={<FileText size={16} />} />
          <div className="mt-4 space-y-3">
            {(report.sourceDocuments || [
              { title: "Latest SEC Edgar Filings", url: `https://www.sec.gov/edgar/searchedgar/companysearch.html?CIK=${ticker}` }
            ]).map((doc: any, i: number) => (
              <a 
                key={i} 
                href={doc.url} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 p-2 rounded hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700 group"
              >
                <FileText size={14} className="text-slate-400" />
                <span className="flex-1 truncate">{doc.title}</span>
                <ExternalLink size={12} className="text-slate-300 group-hover:text-green-600 opacity-0 group-hover:opacity-100 transition-opacity print:hidden" />
              </a>
            ))}
            <div className="text-[10px] text-slate-400 mt-4 pt-4 border-t border-slate-200">
              Generated automatically using publicly available SEC filings and earnings releases.
            </div>
          </div>
        </Card>
      </div>

    </div>
  );
}
