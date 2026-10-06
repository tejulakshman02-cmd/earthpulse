import React from 'react';
import { ArrowRight, HelpCircle, Activity, Satellite, Layers, Database } from 'lucide-react';
import { EarthHeroGlobe } from './EarthHeroGlobe';

interface HeroProps {
  onAnalyzeClick: () => void;
  onExploreHowItWorks: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onAnalyzeClick, onExploreHowItWorks }) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-900 bg-radial-vignette">
      {/* Background star dust/grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Mission Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Mission Sub-kicker without pill enclosures */}
            <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-cyan-400 uppercase font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span>NASA Space Apps Challenge 2026</span>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span className="text-slate-400">Earth System Trend Detective</span>
            </div>

            {/* Editorial Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
              See how our world <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-400">
                is changing.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl font-medium text-slate-200">
              Explore environmental trends through NASA Earth data.
            </p>

            {/* Supporting Text */}
            <p className="text-base text-slate-400 max-w-2xl leading-relaxed">
              EarthPulse transforms complex Earth-system measurements into clear, verifiable trends.
              Investigate decadal temperature shifts, precipitation volatility, and solar radiation patterns across 45+ years of satellite observations.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={onAnalyzeClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-6 py-3.5 text-base shadow-[0_0_24px_rgba(6,182,212,0.35)] transition-all hover:shadow-[0_0_32px_rgba(6,182,212,0.5)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
              >
                <span>Analyze Earth</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={onExploreHowItWorks}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 px-5 py-3.5 text-base font-medium transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
              >
                <HelpCircle className="h-4 w-4 text-slate-400" />
                <span>Explore how it works</span>
              </button>
            </div>
          </div>

          {/* Right Column: Real Atmospheric Earth Globe Visualization */}
          <div className="lg:col-span-5 flex justify-center relative items-center">
            <EarthHeroGlobe />
          </div>
        </div>

        {/* Trust / Data Strip */}
        <div className="mt-14 pt-8 border-t border-slate-800/80">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-slate-400 text-xs sm:text-sm font-medium">
            <div className="flex items-center gap-3">
              <Satellite className="h-4 w-4 text-cyan-400 shrink-0" />
              <div>
                <div className="text-slate-200 font-semibold">NASA Earth Data</div>
                <div className="text-xs text-slate-400">NASA POWER environmental data</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Activity className="h-4 w-4 text-sky-400 shrink-0" />
              <div>
                <div className="text-slate-200 font-semibold">Historical Trends</div>
                <div className="text-xs text-slate-400">Multi-decadal environmental records</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Layers className="h-4 w-4 text-indigo-400 shrink-0" />
              <div>
                <div className="text-slate-200 font-semibold">Scientific Analysis</div>
                <div className="text-xs text-slate-400">Theil-Sen trend + Mann-Kendall significance</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Database className="h-4 w-4 text-teal-400 shrink-0" />
              <div>
                <div className="text-slate-200 font-semibold">Open Science</div>
                <div className="text-xs text-slate-400">Transparent methods, sources & limitations</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
