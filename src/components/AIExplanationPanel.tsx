import React, { useState } from 'react';
import { BookOpen, CheckCircle2, ChevronRight, RefreshCw, AlertCircle, Info, LineChart } from 'lucide-react';
import { AnalysisResult } from '../types';

interface AIExplanationPanelProps {
  data: AnalysisResult;
}

export const AIExplanationPanel: React.FC<AIExplanationPanelProps> = ({ data }) => {
  const [isExplaining, setIsExplaining] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const { location, variableName, variableUnit, period, statistics } = data;

  const handleGenerate = () => {
    setIsExplaining(true);
    setTimeout(() => {
      setIsExplaining(false);
      setHasGenerated(true);
    }, 450);
  };

  const sign = statistics.change > 0 ? '+' : '';
  const signRate = statistics.trendRate > 0 ? '+' : '';

  const interpretationSections = [
    {
      title: 'WHAT CHANGED?',
      content: `The multi-decadal time series for ${variableName.toLowerCase()} at ${location.name} demonstrates a directional ${statistics.direction} trajectory across the ${period.start}–${period.end} observation window, evaluated using the robust Theil-Sen estimator.`,
    },
    {
      title: 'WHERE?',
      content: `${location.name}, ${location.country} (${location.latitude.toFixed(2)}°N, ${location.longitude.toFixed(2)}°E), located within the ${location.climateZone || 'regional climate zone'}${location.elevationMeters ? ` at an altitude of ${location.elevationMeters} meters` : ''}.`,
    },
    {
      title: 'HOW MUCH?',
      content: `The estimated shift along the Theil-Sen trend line is ${sign}${statistics.change} ${variableUnit} over ${period.end - period.start + 1} years, representing an annualized rate of ${signRate}${statistics.trendRate} ${variableUnit}/year (ordinary linear regression R² = ${statistics.rSquared}).`,
    },
    {
      title: 'HOW STRONG IS THE EVIDENCE?',
      content: statistics.pValue === null || !statistics.hasSufficientData
        ? `Insufficient data for statistical significance testing.`
        : statistics.significant
        ? `The tie-corrected Mann-Kendall rank trend test indicates a statistically significant monotonic trend at the 0.05 significance level (p = ${statistics.pValue}, S = ${statistics.mannKendallS}, tie count = ${statistics.tieCount}) under test assumptions.`
        : `The analysis detects a directional change of ${signRate}${statsRateString(statistics.trendRate, variableUnit)}, but the evidence is not statistically significant at the 0.05 level (p = ${statistics.pValue}). Natural interannual variability is substantial relative to the slope.`,
    },
    {
      title: 'WHAT SHOULD I NOTICE?',
      content: `Examine the magnitude of interannual oscillations around the fitted line. Mann-Kendall significance assumes observations are sufficiently independent. Temporal autocorrelation can affect significance estimates; results should therefore be interpreted as evidence of a statistical trend rather than proof of causation.`,
    },
  ];

  function statsRateString(rate: number, unit: string) {
    const s = rate > 0 ? '+' : '';
    return `${s}${rate} ${unit}/year`;
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-6 sm:p-8 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <LineChart className="h-5 w-5 text-cyan-400" />
            <h3 className="text-xl font-bold tracking-tight text-white">
              EarthPulse Statistical Interpretation
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            EarthPulse interprets the calculated statistical results to summarize the observed trend.
          </p>
        </div>

        {!hasGenerated && (
          <button
            onClick={handleGenerate}
            disabled={isExplaining}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-semibold px-4 py-2 text-sm shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all active:scale-[0.98]"
          >
            {isExplaining ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Interpreting calculated results…</span>
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4" />
                <span>Interpret Trend</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Before clicking state */}
      {!hasGenerated && !isExplaining && (
        <div className="py-8 text-center max-w-lg mx-auto space-y-3">
          <LineChart className="h-8 w-8 text-cyan-400/80 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-200">
            Interpret scientific metrics into plain language
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            EarthPulse translates the mathematically calculated Theil-Sen slope, tie-corrected Mann-Kendall p-values, and linear fit R² into a structured diagnostic synthesis.
          </p>
          <div className="pt-2">
            <button
              onClick={handleGenerate}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
            >
              Click "Interpret Trend" to generate the diagnostic breakdown →
            </button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isExplaining && (
        <div className="py-12 text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative h-12 w-12 flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-20"></span>
              <RefreshCw className="h-6 w-6 text-cyan-400 animate-spin" />
            </div>
          </div>
          <div className="text-sm font-mono text-cyan-300">
            Synthesizing statistical parameters for {location.name}…
          </div>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Structuring diagnostic insights for {variableName} ({period.start}–{period.end})
          </p>
        </div>
      )}

      {/* Generated structured explanation */}
      {hasGenerated && !isExplaining && (
        <div className="pt-6 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {interpretationSections.map((sec, idx) => (
              <div
                key={sec.title}
                className="rounded-xl border border-slate-800/90 bg-slate-950/60 p-4 sm:p-5 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                    {idx + 1}. {sec.title}
                  </span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {sec.content}
                </p>
              </div>
            ))}
          </div>

          {/* Scientific Transparency Disclaimer */}
          <div className="pt-4 border-t border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-400">
            <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-slate-300">Scientific Transparency:</strong>{' '}
              EarthPulse interprets the calculated Theil-Sen median slope and tie-corrected Mann-Kendall statistics. Statistical trend detection identifies directional movement but does not prove direct causation. Observational measurements remain the primary source of truth.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
