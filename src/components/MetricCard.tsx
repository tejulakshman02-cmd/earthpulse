import React from 'react';
import { TrendStatistics } from '../types';

interface MetricCardProps {
  stats: TrendStatistics;
  variableName: string;
}

export const MetricCardsGrid: React.FC<MetricCardProps> = ({ stats, variableName }) => {
  const signRate = stats.trendRate > 0 ? '+' : '';

  let significanceText = 'Within normal variance';
  let significanceExpl = `No statistically significant monotonic trend detected at α = 0.05 (p = ${stats.pValue ?? 'N/A'}).`;
  let significanceClass = 'text-slate-400';

  if (!stats.hasSufficientData || stats.pValue === null) {
    significanceText = 'Insufficient data';
    significanceExpl = 'Insufficient data for statistical significance testing.';
    significanceClass = 'text-amber-400';
  } else if (stats.significant) {
    significanceText = 'Statistically significant';
    significanceExpl = `Mann-Kendall test indicates significant trend at α = 0.05 (p = ${stats.pValue}, S = ${stats.mannKendallS}).`;
    significanceClass = 'text-emerald-400';
  }

  const cards = [
    {
      label: 'Average',
      value: `${stats.average} ${stats.unit}`,
      subLabel: 'Annual mean baseline',
      explanation: `Mean annual ${variableName.toLowerCase()} across ${stats.sampleCount} valid observation years.`,
      highlightClass: 'text-white',
    },
    {
      label: 'Trend Rate (Theil-Sen)',
      value: `${signRate}${stats.trendRate} ${stats.unit}/yr`,
      subLabel: 'Robust median slope',
      explanation: 'Calculated as median of all pairwise annual slopes; robust against weather outliers.',
      highlightClass: stats.trendRate > 0 ? 'text-amber-400' : stats.trendRate < 0 ? 'text-sky-400' : 'text-slate-200',
    },
    {
      label: 'Significance (Mann-Kendall)',
      value: significanceText,
      subLabel: stats.pValue !== null ? `p-value: ${stats.pValue}` : 'Insufficient sample',
      explanation: significanceExpl,
      highlightClass: significanceClass,
    },
    {
      label: 'Linear Fit R²',
      value: `${stats.rSquared.toFixed(3)}`,
      subLabel: 'Supporting reference metric',
      explanation: 'Ordinary least squares coefficient of determination; reflects linear variance explained.',
      highlightClass: 'text-cyan-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-slate-800 bg-[#090d16] p-5 flex flex-col justify-between hover:border-slate-700 transition-colors"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                {card.label}
              </span>
            </div>
            <div className={`mt-2 font-mono text-2xl lg:text-3xl font-bold tracking-tight ${card.highlightClass}`}>
              {card.value}
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-0.5">
              {card.subLabel}
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/80 pt-3">
            {card.explanation}
          </p>
        </div>
      ))}
    </div>
  );
};
