import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, Sparkles, Database } from 'lucide-react';
import { AnalysisResult } from '../types';

interface InsightCardProps {
  data: AnalysisResult;
}

export const InsightCard: React.FC<InsightCardProps> = ({ data }) => {
  const { statistics, variableName, variableUnit, location, period } = data;
  const isUpward = statistics.direction === 'upward';
  const isDownward = statistics.direction === 'downward';

  const sign = statistics.change > 0 ? '+' : '';

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-6 sm:p-8 relative overflow-hidden shadow-xl">
      {/* Subtle atmospheric glow behind focal number */}
      <div
        className={`absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none ${
          isUpward ? 'bg-amber-500' : isDownward ? 'bg-sky-500' : 'bg-cyan-500'
        }`}
      />

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {location.name}, {location.country}
            </h2>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span>{variableName}</span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span>{period.start}–{period.end}</span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span>{data.dataSource.mission}</span>
          </div>
        </div>

        {/* Status indicator without generic pill badge */}
        <div className="flex flex-col sm:items-end gap-1">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span
              className={`h-2 w-2 rounded-full ${
                data.isRealData
                  ? 'bg-emerald-400'
                  : 'bg-amber-400'
              } animate-pulse`}
            />
            <span
              className={
                data.isRealData
                  ? 'text-emerald-400 font-semibold'
                  : 'text-amber-400 font-semibold'
              }
            >
              {data.isRealData
                ? 'LIVE NASA POWER DATA'
                : 'SIMULATED FALLBACK — NASA API UNAVAILABLE'}
            </span>
          </div>
          {data.isRealData && data.dailyObservationsCount && (
            <div className="text-[11px] font-mono text-slate-400">
              {data.dailyObservationsCount.toLocaleString()} daily observations aggregated
            </div>
          )}
          {data.isSimulatedFallback && (
            <div className="text-[11px] font-mono text-amber-300/80">
              Offline simulation model · Not actual observations
            </div>
          )}
        </div>
      </div>

      {/* Primary Headline & Focal Number */}
      <div className="pt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
        <div className="md:col-span-7 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-slate-400">
            {isUpward ? (
              <span className="text-amber-400 flex items-center gap-1">
                <ArrowUpRight className="h-5 w-5" />
                <span>Upward Long-Term Trend</span>
              </span>
            ) : isDownward ? (
              <span className="text-sky-400 flex items-center gap-1">
                <ArrowDownRight className="h-5 w-5" />
                <span>Downward Long-Term Trend</span>
              </span>
            ) : (
              <span className="text-slate-300 flex items-center gap-1">
                <Minus className="h-5 w-5" />
                <span>Stable / Neutral Horizon</span>
              </span>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-100">
            {variableName} is trending {statistics.direction}
          </h3>

          <p className="text-sm text-slate-400 max-w-xl">
            {data.explanation.whatChanged}
          </p>
        </div>

        {/* Visual Focal Point: Change over selected period */}
        <div className="md:col-span-5 md:text-right">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
            Change over selected period
          </div>
          <div
            className={`font-mono text-5xl sm:text-6xl font-extrabold tracking-tight ${
              isUpward
                ? 'text-amber-300 drop-shadow-[0_0_20px_rgba(252,211,77,0.2)]'
                : isDownward
                ? 'text-sky-300 drop-shadow-[0_0_20px_rgba(125,211,252,0.2)]'
                : 'text-slate-200'
            }`}
          >
            {sign}{statistics.change}{variableUnit}
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            {sign}{statistics.percentageChange}% baseline shift ({period.start}–{period.end})
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Based on the selected NASA data series.
          </p>
        </div>
      </div>

      {/* Scientific Method Transparency Strip */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-cyan-400 font-medium">METHOD:</span>
          <span>Theil-Sen Robust Median Slope</span>
          <span className="text-slate-600">·</span>
          <span className="text-cyan-400 font-medium">SIGNIFICANCE:</span>
          <span>Mann-Kendall Test (α = 0.05)</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-500">Linear R² (ref): {statistics.rSquared}</span>
        </div>
        <div className="text-[11px] text-slate-400">
          Data source: {data.isRealData ? 'NASA POWER Daily API' : 'Simulated fallback data — NASA POWER unavailable'}
        </div>
      </div>
    </div>
  );
};
