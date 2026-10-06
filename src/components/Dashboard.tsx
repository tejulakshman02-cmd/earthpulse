import React from 'react';
import { AnalysisResult, LocationInfo, VariableType, TimePeriod } from '../types';
import { InsightCard } from './InsightCard';
import { MetricCardsGrid } from './MetricCard';
import { TrendChart } from './TrendChart';
import { TrendSummary } from './TrendSummary';
import { MapPanel } from './MapPanel';
import { AIExplanationPanel } from './AIExplanationPanel';
import { RotateCcw, Share2, BookOpen, Download, AlertCircle } from 'lucide-react';

interface DashboardProps {
  data: AnalysisResult;
  onModifySearch: () => void;
  onOpenMethodology: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  data,
  onModifySearch,
  onOpenMethodology,
}) => {
  const handleExportCSV = () => {
    // Generate clean CSV of the NASA time series
    const sourceLabel = data.isRealData
      ? 'Data source: NASA POWER Daily API'
      : 'Data source: Simulated fallback data — NASA POWER unavailable';
    const headers = [
      'Year',
      `${data.variableName} (${data.variableUnit})`,
      `Theil-Sen Trend (${data.variableUnit})`,
      `Anomaly vs Mean (${data.variableUnit})`,
      'Data Source',
    ];
    const rows = data.series.map((s) => [
      s.year,
      s.value,
      s.trendValue,
      s.anomaly ?? '',
      sourceLabel,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `EarthPulse_${data.location.name}_${data.variable}_${data.period.start}_${data.period.end}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onModifySearch}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/90 text-slate-300 hover:text-white text-xs font-medium hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5 text-cyan-400" />
            <span>Adjust Parameters</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/90 text-slate-300 hover:text-white text-xs font-medium hover:bg-slate-800 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-slate-400" />
            <span>Export Time Series (.CSV)</span>
          </button>
        </div>

        <button
          onClick={onOpenMethodology}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Learn about the methodology →</span>
        </button>
      </div>

      {/* Real NASA POWER API Provenance Strip */}
      {data.isRealData && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold tracking-wide">LIVE NASA POWER DATA</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-300">{data.dailyObservationsCount?.toLocaleString()} daily points ingested</span>
          </div>
          <div className="text-[11px] text-emerald-400/90 font-medium">
            Data source: NASA POWER Daily API
          </div>
        </div>
      )}

      {/* Prominent Warning when Simulated Fallback is active */}
      {data.isSimulatedFallback && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-amber-300">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-bold tracking-wide">SIMULATED FALLBACK — NASA API UNAVAILABLE</span>
            <span className="text-amber-600">·</span>
            <span className="text-amber-200/80">Offline calibrated demo parameters</span>
          </div>
          <div className="text-[11px] text-amber-300/80 font-medium">
            Data source: Simulated fallback data — NASA POWER unavailable
          </div>
        </div>
      )}

      {/* 1. Primary Insight Card */}
      <InsightCard data={data} />

      {/* 2. Four Compact Scientific Metric Cards */}
      <MetricCardsGrid stats={data.statistics} variableName={data.variableName} />

      {/* 3. Main Trend Chart */}
      <TrendChart data={data} />

      {/* 4. Trend Explanation (What changed? How much? How strong?) */}
      <TrendSummary data={data} />

      {/* 5. Map Section: Where is this happening? */}
      <MapPanel location={data.location} variable={data.variable} />

      {/* 6. AI Explanation: Turn numbers into a clearer scientific story */}
      <AIExplanationPanel data={data} />
    </div>
  );
};
