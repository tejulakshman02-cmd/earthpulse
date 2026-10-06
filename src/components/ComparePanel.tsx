import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { LocationInfo, VariableType, TimePeriod, ComparisonResult } from '../types';
import { POPULAR_LOCATIONS, VARIABLE_METADATA } from '../data/mockData';
import { compareLocations } from '../services/api';
import { ArrowRight, ArrowLeftRight, Check, MapPin, Sparkles, AlertCircle } from 'lucide-react';

interface ComparePanelProps {
  initialLocationA?: LocationInfo;
  initialVariable?: VariableType;
  initialPeriod?: TimePeriod;
  onExploreSingle?: (loc: LocationInfo) => void;
}

export const ComparePanel: React.FC<ComparePanelProps> = ({
  initialLocationA = POPULAR_LOCATIONS[0], // Bengaluru
  initialVariable = 'temperature',
  initialPeriod = { start: 1990, end: 2025 },
  onExploreSingle,
}) => {
  const [locA, setLocA] = useState<LocationInfo>(initialLocationA);
  const [locB, setLocB] = useState<LocationInfo>(POPULAR_LOCATIONS[1]); // Delhi
  const [variable, setVariable] = useState<VariableType>(initialVariable);
  const [period, setPeriod] = useState<TimePeriod>(initialPeriod);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);

  const runComparison = async () => {
    setLoading(true);
    try {
      const res = await compareLocations(locA, locB, variable, period);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runComparison();
  }, [locA, locB, variable, period]);

  // Merge the two series into single points for Recharts
  const chartData =
    result?.locationA.series.map((ptA, index) => {
      const ptB = result.locationB.series[index] || {};
      return {
        year: ptA.year,
        valueA: ptA.value,
        trendA: ptA.trendValue,
        valueB: ptB.value,
        trendB: ptB.trendValue,
      };
    }) || [];

  const unit = VARIABLE_METADATA[variable].unit;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-cyan-400 uppercase font-medium">
          <ArrowLeftRight className="h-3.5 w-3.5" />
          <span>Multi-Point Analysis</span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-white mt-1">
          Compare Earth
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          See how environmental trends differ between two geographic locations.
        </p>
      </div>

      {/* Control Strip */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center rounded-2xl border border-slate-800 bg-[#090d16] p-4 sm:p-6 shadow-xl">
        {/* Location A Selector */}
        <div className="md:col-span-4 space-y-1.5">
          <label className="text-[11px] font-mono text-cyan-400 uppercase">
            Location A (Primary)
          </label>
          <select
            value={locA.id}
            onChange={(e) => {
              const selected = POPULAR_LOCATIONS.find((l) => l.id === e.target.value);
              if (selected) setLocA(selected);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 font-medium focus:border-cyan-500 focus:outline-none"
          >
            {POPULAR_LOCATIONS.map((loc) => (
              <option key={loc.id} value={loc.id} disabled={loc.id === locB.id}>
                {loc.name}, {loc.country}
              </option>
            ))}
          </select>
          <div className="text-[11px] font-mono text-slate-400">
            {locA.latitude.toFixed(2)}°N, {locA.longitude.toFixed(2)}°E
          </div>
        </div>

        {/* Center Comparison Arrow & Variable Selector */}
        <div className="md:col-span-4 flex flex-col items-center justify-center space-y-2 text-center">
          <div className="text-xs font-mono text-slate-400">Variable & Horizon</div>
          <div className="flex items-center gap-2">
            {(['temperature', 'rainfall', 'solar'] as VariableType[]).map((v) => (
              <button
                key={v}
                onClick={() => setVariable(v)}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                  variable === v
                    ? 'bg-cyan-600 text-slate-950 font-semibold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {VARIABLE_METADATA[v].name}
              </button>
            ))}
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            {period.start}–{period.end} (NASA Observation Window)
          </div>
        </div>

        {/* Location B Selector */}
        <div className="md:col-span-4 space-y-1.5">
          <label className="text-[11px] font-mono text-amber-400 uppercase">
            Location B (Comparison)
          </label>
          <select
            value={locB.id}
            onChange={(e) => {
              const selected = POPULAR_LOCATIONS.find((l) => l.id === e.target.value);
              if (selected) setLocB(selected);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 font-medium focus:border-cyan-500 focus:outline-none"
          >
            {POPULAR_LOCATIONS.map((loc) => (
              <option key={loc.id} value={loc.id} disabled={loc.id === locA.id}>
                {loc.name}, {loc.country}
              </option>
            ))}
          </select>
          <div className="text-[11px] font-mono text-slate-400">
            {locB.latitude.toFixed(2)}°N, {locB.longitude.toFixed(2)}°E
          </div>
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-12 text-center text-sm font-mono text-cyan-400">
          Fetching comparative NASA Earth observations…
        </div>
      )}

      {result && !loading && (
        <div className="space-y-6">
          {/* Comparative Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Trend Direction */}
            <div className="rounded-xl border border-slate-800 bg-[#090d16] p-4 space-y-2">
              <span className="text-[11px] font-mono uppercase text-slate-400">
                Trend Trajectory
              </span>
              <div className="flex items-center justify-between text-sm font-semibold">
                <span className="text-cyan-400">{locA.name}: {result.locationA.statistics.direction}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-semibold border-t border-slate-800/80 pt-1">
                <span className="text-amber-400">{locB.name}: {result.locationB.statistics.direction}</span>
              </div>
            </div>

            {/* Total Change */}
            <div className="rounded-xl border border-slate-800 bg-[#090d16] p-4 space-y-2">
              <span className="text-[11px] font-mono uppercase text-slate-400">
                Theil-Sen Shift
              </span>
              <div className="flex items-center justify-between text-sm font-semibold">
                <span className="text-slate-400">{locA.name}:</span>
                <span className="font-mono text-cyan-300">
                  {result.locationA.statistics.change > 0 ? '+' : ''}
                  {result.locationA.statistics.change} {unit}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm font-semibold border-t border-slate-800/80 pt-1">
                <span className="text-slate-400">{locB.name}:</span>
                <span className="font-mono text-amber-300">
                  {result.locationB.statistics.change > 0 ? '+' : ''}
                  {result.locationB.statistics.change} {unit}
                </span>
              </div>
            </div>

            {/* Average */}
            <div className="rounded-xl border border-slate-800 bg-[#090d16] p-4 space-y-2">
              <span className="text-[11px] font-mono uppercase text-slate-400">
                Mean Baseline
              </span>
              <div className="flex items-center justify-between text-sm font-semibold">
                <span className="text-slate-400">{locA.name}:</span>
                <span className="font-mono text-cyan-300">
                  {result.locationA.statistics.average} {unit}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm font-semibold border-t border-slate-800/80 pt-1">
                <span className="text-slate-400">{locB.name}:</span>
                <span className="font-mono text-amber-300">
                  {result.locationB.statistics.average} {unit}
                </span>
              </div>
            </div>

            {/* Significance */}
            <div className="rounded-xl border border-slate-800 bg-[#090d16] p-4 space-y-2">
              <span className="text-[11px] font-mono uppercase text-slate-400">
                Mann-Kendall Test
              </span>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{locA.name}:</span>
                <span className={result.locationA.statistics.significant ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                  {!result.locationA.statistics.hasSufficientData || result.locationA.statistics.pValue === null
                    ? 'Insufficient data'
                    : result.locationA.statistics.significant
                    ? `p = ${result.locationA.statistics.pValue} (Sig)`
                    : `p = ${result.locationA.statistics.pValue}`}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-slate-800/80 pt-1">
                <span className="text-slate-400">{locB.name}:</span>
                <span className={result.locationB.statistics.significant ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                  {!result.locationB.statistics.hasSufficientData || result.locationB.statistics.pValue === null
                    ? 'Insufficient data'
                    : result.locationB.statistics.significant
                    ? `p = ${result.locationB.statistics.pValue} (Sig)`
                    : `p = ${result.locationB.statistics.pValue}`}
                </span>
              </div>
            </div>
          </div>

          {/* Provenance Strip */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  result.locationA.isRealData && result.locationB.isRealData
                    ? 'bg-emerald-400'
                    : 'bg-amber-400'
                } animate-pulse`}
              />
              <span
                className={
                  result.locationA.isRealData && result.locationB.isRealData
                    ? 'text-emerald-400 font-semibold'
                    : 'text-amber-400 font-semibold'
                }
              >
                {result.locationA.isRealData && result.locationB.isRealData
                  ? 'LIVE NASA POWER DATA'
                  : 'SIMULATED FALLBACK — NASA API UNAVAILABLE'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Data source: {result.locationA.isRealData && result.locationB.isRealData ? 'NASA POWER Daily API' : 'Simulated fallback data — NASA POWER unavailable'}
            </div>
          </div>

          {/* Comparison Line Chart */}
          <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-bold text-white">
                  Comparative Time Series ({period.start}–{period.end})
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Overlaid NASA Earth observing satellite observations
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-1.5 text-cyan-400">
                  <span className="h-2 w-2 rounded-full bg-cyan-400" />
                  <span>{locA.name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-400">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span>{locB.name}</span>
                </div>
              </div>
            </div>

            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 10 }}>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="year"
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'monospace' }}
                  />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'monospace' }}
                    tickFormatter={(v) => `${v}${unit}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090e18',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="valueA"
                    name={locA.name}
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={{ r: 2.5, fill: '#06b6d4' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="valueB"
                    name={locB.name}
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ r: 2.5, fill: '#f59e0b' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Comparative Conclusion Box */}
            <div className="mt-6 p-4 rounded-xl border border-cyan-800/50 bg-cyan-950/20 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-cyan-300 font-semibold">
                  Comparative Conclusion
                </div>
                <p className="text-sm text-slate-200 mt-1 leading-relaxed">
                  {result.comparativeConclusion}
                </p>
                <div className="mt-2 flex items-center gap-4 text-[11px] font-mono text-slate-400">
                  <span>Delta Rate: {result.deltaRate > 0 ? '+' : ''}{result.deltaRate} {unit}/year</span>
                  <span>·</span>
                  <span>Delta Shift: {result.deltaChange > 0 ? '+' : ''}{result.deltaChange} {unit}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
