import React, { useState } from 'react';
import { Compass, Sparkles, ArrowRight, Zap, Target, Flame, Droplets, Sun, RefreshCw } from 'lucide-react';
import { DetectiveHotspot, LocationInfo, VariableType, TimePeriod } from '../types';
import { TREND_DETECTIVE_HOTSPOTS } from '../data/mockData';

interface TrendDetectiveProps {
  onSelectHotspot: (hotspot: DetectiveHotspot) => void;
}

export const TrendDetective: React.FC<TrendDetectiveProps> = ({ onSelectHotspot }) => {
  const [selectedHotspot, setSelectedHotspot] = useState<DetectiveHotspot | null>(
    TREND_DETECTIVE_HOTSPOTS[0]
  );
  const [isScanning, setIsScanning] = useState(false);

  const handleRandomScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const remaining = TREND_DETECTIVE_HOTSPOTS.filter((h) => h.id !== selectedHotspot?.id);
      const next = remaining[Math.floor(Math.random() * remaining.length)] || TREND_DETECTIVE_HOTSPOTS[0];
      setSelectedHotspot(next);
      setIsScanning(false);
    }, 550);
  };

  const getVariableIcon = (varType: VariableType) => {
    switch (varType) {
      case 'temperature':
        return <Flame className="h-4 w-4 text-amber-400" />;
      case 'rainfall':
        return <Droplets className="h-4 w-4 text-sky-400" />;
      case 'solar':
        return <Sun className="h-4 w-4 text-yellow-400" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-cyan-400 uppercase font-medium">
            <Compass className="h-3.5 w-3.5" />
            <span>NASA Space Apps Challenge 2026</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white mt-1">
            Trend Detective
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Discover anomalous environmental patterns and decadal regime shifts without manual guessing.
          </p>
        </div>

        {/* Primary Scan Trigger Button */}
        <button
          onClick={handleRandomScan}
          disabled={isScanning}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-semibold px-5 py-3 text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isScanning ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Scanning Earth Observation Grids…</span>
            </>
          ) : (
            <>
              <Target className="h-4 w-4" />
              <span>Find an interesting trend</span>
            </>
          )}
        </button>
      </div>

      {/* Featured Detection Display */}
      {selectedHotspot && (
        <div className="relative rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-[#0c1524] to-[#060a12] p-6 sm:p-8 shadow-2xl overflow-hidden">
          {/* Subtle radar scan sweep */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Telemetry Kicker */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-semibold tracking-wider uppercase">TREND DETECTED</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">{selectedHotspot.tag}</span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              SCAN ID: #{selectedHotspot.id.toUpperCase()}
            </span>
          </div>

          {/* Main Discovery Body */}
          <div className="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
                  {getVariableIcon(selectedHotspot.variable)}
                  <span className="uppercase font-semibold tracking-wider">
                    {selectedHotspot.variable.toUpperCase()}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span>{selectedHotspot.period.start}–{selectedHotspot.period.end}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {selectedHotspot.title}
                </h3>
              </div>

              {/* Headline Trend */}
              <div className="text-base sm:text-lg font-semibold text-amber-300 flex items-center gap-2">
                <Zap className="h-4 w-4 shrink-0 text-amber-400" />
                <span>{selectedHotspot.headlineTrend}</span>
              </div>

              {/* Teaser Narrative */}
              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                {selectedHotspot.teaser}
              </p>

              {/* Exploration CTA */}
              <div className="pt-3">
                <button
                  onClick={() => onSelectHotspot(selectedHotspot)}
                  className="inline-flex items-center gap-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-2.5 text-sm shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all hover:gap-3"
                >
                  <span>Explore this trend</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Quick Metrics Tile */}
            <div className="lg:col-span-4 bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3 font-mono">
              <div className="text-[10px] uppercase text-slate-400">Location Coordinates</div>
              <div className="text-sm font-semibold text-white">
                {selectedHotspot.locationName}
              </div>
              <div className="text-xs text-cyan-400">
                {selectedHotspot.location.latitude.toFixed(4)}°N, {selectedHotspot.location.longitude.toFixed(4)}°E
              </div>

              <div className="pt-3 border-t border-slate-800">
                <div className="text-[10px] uppercase text-slate-400">Key Metric Signature</div>
                <div className="text-lg font-bold text-amber-300 mt-0.5">
                  {selectedHotspot.rateHighlight}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Discovered Hotspots Gallery */}
      <div className="space-y-4">
        <h3 className="text-sm font-mono uppercase tracking-wider text-slate-400 font-medium">
          Curated NASA Trend Catalog
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TREND_DETECTIVE_HOTSPOTS.map((hotspot) => {
            const isCurrent = hotspot.id === selectedHotspot?.id;
            return (
              <div
                key={hotspot.id}
                onClick={() => setSelectedHotspot(hotspot)}
                className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 flex flex-col justify-between ${
                  isCurrent
                    ? 'border-cyan-500 bg-cyan-950/20 shadow-md ring-1 ring-cyan-500/30'
                    : 'border-slate-800 bg-[#090d16] hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                    <span className="flex items-center gap-1.5 text-cyan-400">
                      {getVariableIcon(hotspot.variable)}
                      <span className="uppercase text-[11px] font-semibold">{hotspot.variable}</span>
                    </span>
                    <span>{hotspot.period.start}–{hotspot.period.end}</span>
                  </div>

                  <h4 className="text-sm font-semibold text-white">
                    {hotspot.locationName}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {hotspot.teaser}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-mono text-amber-300">
                    {hotspot.rateHighlight}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectHotspot(hotspot);
                    }}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <span>Investigate</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
