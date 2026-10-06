import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
} from 'recharts';
import { AnalysisResult } from '../types';

interface TrendChartProps {
  data: AnalysisResult;
}

export const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  const { series, variableName, variableUnit, period, statistics } = data;
  const [showUncertainty, setShowUncertainty] = useState(true);

  // Compute min/max for tight scientific Y-axis scaling
  const values = series.map((s) => s.value);
  const trendValues = series.map((s) => s.trendValue);
  const allValues = [...values, ...trendValues];
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const padding = (maxVal - minVal) * 0.18 || 1;
  const yDomain = [
    Number((minVal - padding).toFixed(1)),
    Number((maxVal + padding).toFixed(1)),
  ];

  // Custom scientific tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="rounded-lg border border-slate-700 bg-[#090e18]/95 p-3 shadow-xl backdrop-blur-md font-mono text-xs">
          <div className="text-slate-400 border-b border-slate-800 pb-1 mb-1.5 flex justify-between gap-4">
            <span className="font-semibold text-white">Year {label}</span>
            <span className={data.isRealData ? 'text-emerald-400' : 'text-amber-400'}>
              {data.isRealData ? 'LIVE NASA POWER DATA' : 'SIMULATED FALLBACK — NASA API UNAVAILABLE'}
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-300 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                Observed:
              </span>
              <span className="font-bold text-white text-sm">
                {dataPoint.value} {variableUnit}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-amber-400" />
                Theil-Sen Trend:
              </span>
              <span className="text-amber-300">
                {dataPoint.trendValue} {variableUnit}
              </span>
            </div>

            {dataPoint.anomaly !== undefined && (
              <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-800/80 text-[11px]">
                <span className="text-slate-500">Anomaly vs Mean:</span>
                <span className={dataPoint.anomaly >= 0 ? 'text-amber-400' : 'text-sky-400'}>
                  {dataPoint.anomaly > 0 ? '+' : ''}{dataPoint.anomaly} {variableUnit}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-6 shadow-xl">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-white">
            {variableName} over time
          </h3>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Annual values from {period.start} to {period.end} · {series.length} valid points · Trend rate: Theil-Sen estimator
          </p>
        </div>

        {/* Chart View Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUncertainty(!showUncertainty)}
            title="Toggle ±1.96 s.e. residual uncertainty band around Theil-Sen fit"
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
              showUncertainty
                ? 'bg-cyan-950/80 border-cyan-800 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <span>Uncertainty band (±1.96 s.e.)</span>
          </button>
        </div>
      </div>

      {/* Responsive Chart Container */}
      <div className="w-full h-80 sm:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={series}
            margin={{ top: 10, right: 15, left: -10, bottom: 20 }}
          >
            <defs>
              <linearGradient id="uncertaintyBand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.16} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.03} />
              </linearGradient>
            </defs>

            {/* Subtle Scientific Grid */}
            <CartesianGrid
              stroke="#1e293b"
              strokeDasharray="3 3"
              vertical={false}
              opacity={0.7}
            />

            {/* X Axis */}
            <XAxis
              dataKey="year"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'monospace' }}
              tickLine={{ stroke: '#334155' }}
              axisLine={{ stroke: '#334155' }}
              dy={10}
            />

            {/* Y Axis */}
            <YAxis
              domain={yDomain}
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'monospace' }}
              tickLine={{ stroke: '#334155' }}
              axisLine={{ stroke: '#334155' }}
              tickFormatter={(v) => `${v}${variableUnit}`}
            />

            {/* Interactive Tooltip */}
            <Tooltip content={<CustomTooltip />} />

            {/* Legend */}
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '16px', fontSize: '12px' }}
              formatter={(value) => {
                if (value === 'value') return <span className="text-slate-300">Observed annual value</span>;
                if (value === 'trendValue') return <span className="text-slate-300">Theil-Sen trend line</span>;
                return <span className="text-slate-400">{value}</span>;
              }}
            />

            {/* Uncertainty Band (Residual spread around Theil-Sen fit) */}
            {showUncertainty && (
              <Area
                type="monotone"
                dataKey="upperConfidence"
                stroke="none"
                fill="url(#uncertaintyBand)"
                isAnimationActive={false}
              />
            )}

            {/* Observed Data Line */}
            <Line
              type="monotone"
              dataKey="value"
              name="value"
              stroke="#38bdf8"
              strokeWidth={2}
              dot={{ r: 3, fill: '#0284c7', stroke: '#bae6fd', strokeWidth: 1.5 }}
              activeDot={{ r: 6, fill: '#38bdf8', stroke: '#ffffff', strokeWidth: 2 }}
            />

            {/* Theil-Sen Robust Trend Line */}
            <Line
              type="linear"
              dataKey="trendValue"
              name="trendValue"
              stroke="#fbbf24"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Scientific Footnote */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-mono">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>TREND METHOD: THEIL-SEN ({statistics.trendRate > 0 ? '+' : ''}{statistics.trendRate} {variableUnit}/yr)</span>
          <span className="text-slate-700">|</span>
          <span>SIGNIFICANCE TEST: MANN-KENDALL ({statistics.pValue !== null ? `p = ${statistics.pValue}` : 'Insufficient data'})</span>
          <span className="text-slate-700">|</span>
          <span>REGRESSION R² (OPTIONAL REFERENCE): {statistics.rSquared}</span>
        </div>
        <div className="text-slate-400">
          Source: {data.dataSource.name}
        </div>
      </div>
    </div>
  );
};
