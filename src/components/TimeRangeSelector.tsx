import React from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import { TimePeriod } from '../types';

interface TimeRangeSelectorProps {
  period: TimePeriod;
  onChangePeriod: (period: TimePeriod) => void;
  error?: string | null;
}

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  period,
  onChangePeriod,
  error,
}) => {
  const minYear = 1980;
  const maxYear = 2025;

  const handleStartChange = (val: number) => {
    onChangePeriod({ ...period, start: val });
  };

  const handleEndChange = (val: number) => {
    onChangePeriod({ ...period, end: val });
  };

  // Presets
  const applyPreset = (years: number) => {
    if (years === -1) {
      // Maximum available
      onChangePeriod({ start: minYear, end: maxYear });
    } else {
      onChangePeriod({ start: maxYear - years, end: maxYear });
    }
  };

  const currentSpan = period.end - period.start;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-medium">
          Observation Time Horizon
        </label>
        <span className="text-xs font-mono text-cyan-400">
          Span: {Math.max(0, currentSpan + 1)} years
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Start Year */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 focus-within:border-cyan-500/70 focus-within:ring-1 focus-within:ring-cyan-500/50">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-400">Start Year</span>
            <span className="text-xs font-mono text-slate-400">Min {minYear}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-cyan-400" />
            <input
              type="number"
              min={minYear}
              max={period.end - 1}
              value={period.start}
              onChange={(e) => handleStartChange(parseInt(e.target.value) || minYear)}
              className="w-full bg-transparent font-mono text-lg font-semibold text-white focus:outline-none"
              aria-label="Start Year"
            />
          </div>
          <input
            type="range"
            min={minYear}
            max={period.end - 1}
            value={period.start}
            onChange={(e) => handleStartChange(parseInt(e.target.value))}
            className="w-full h-1 mt-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* End Year */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 focus-within:border-cyan-500/70 focus-within:ring-1 focus-within:ring-cyan-500/50">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-400">End Year</span>
            <span className="text-xs font-mono text-slate-400">Max {maxYear}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-cyan-400" />
            <input
              type="number"
              min={period.start + 1}
              max={maxYear}
              value={period.end}
              onChange={(e) => handleEndChange(parseInt(e.target.value) || maxYear)}
              className="w-full bg-transparent font-mono text-lg font-semibold text-white focus:outline-none"
              aria-label="End Year"
            />
          </div>
          <input
            type="range"
            min={period.start + 1}
            max={maxYear}
            value={period.end}
            onChange={(e) => handleEndChange(parseInt(e.target.value))}
            className="w-full h-1 mt-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>
      </div>

      {/* Quick Presets */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs text-slate-500 font-mono">Quick Presets:</span>
        {[
          { label: '10 years', years: 10 },
          { label: '20 years', years: 20 },
          { label: '30 years', years: 30 },
          { label: 'Maximum available', years: -1 },
        ].map((preset) => {
          const isActive =
            preset.years === -1
              ? period.start === minYear && period.end === maxYear
              : currentSpan === preset.years && period.end === maxYear;

          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset.years)}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                isActive
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 font-medium'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/30 border border-rose-900/50 p-2.5 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
