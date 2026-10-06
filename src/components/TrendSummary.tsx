import React from 'react';
import { AnalysisResult } from '../types';
import { CheckCircle2, TrendingUp, HelpCircle } from 'lucide-react';

interface TrendSummaryProps {
  data: AnalysisResult;
}

export const TrendSummary: React.FC<TrendSummaryProps> = ({ data }) => {
  const { explanation, statistics, variableName, variableUnit, period } = data;

  const sections = [
    {
      title: 'What changed?',
      content: explanation.whatChanged,
      detail: `Trajectory: ${statistics.direction.toUpperCase()} · Theil-Sen rate: ${statistics.trendRate > 0 ? '+' : ''}${statistics.trendRate} ${variableUnit}/yr`,
    },
    {
      title: 'How much?',
      content: explanation.howMuch,
      detail: `Net Theil-Sen shift: ${statistics.change > 0 ? '+' : ''}${statistics.change} ${variableUnit} (Linear R² = ${statistics.rSquared})`,
    },
    {
      title: 'How strong is the trend?',
      content: explanation.howStrong,
      detail: statistics.pValue !== null && statistics.hasSufficientData
        ? `Mann-Kendall p = ${statistics.pValue} (S = ${statistics.mannKendallS}, tie count = ${statistics.tieCount})`
        : 'Insufficient data for statistical significance testing.',
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-6 sm:p-8 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-white">
            Scientific Synthesis
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Core diagnostic findings from the NASA Earth system record
          </p>
        </div>
        <span className="text-xs font-mono text-cyan-400">
          DIAGNOSTIC ID: {data.id.substring(0, 18)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        {sections.map((sec) => (
          <div key={sec.title} className="space-y-2">
            <h4 className="text-sm font-semibold text-cyan-300 font-mono flex items-center gap-1.5">
              <span>{sec.title}</span>
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {sec.content}
            </p>
            <div className="pt-2 text-[11px] font-mono text-slate-400 border-t border-slate-800/80">
              {sec.detail}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
