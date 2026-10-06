import React from 'react';
import { Database, ShieldCheck, Award, ExternalLink, LineChart, Layers } from 'lucide-react';

interface AboutSectionProps {
  onOpenMethodology: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onOpenMethodology }) => {
  return (
    <div className="space-y-12 max-w-5xl mx-auto py-8">
      {/* Title & Introduction */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-cyan-400 uppercase font-medium">
          <Award className="h-4 w-4" />
          <span>NASA Space Apps Challenge 2026</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Built with NASA Earth data
        </h2>
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          EarthPulse uses NASA environmental datasets to help people explore long-term changes in Earth's systems.
        </p>
      </div>

      {/* Grid of 4 Key Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Data Sources */}
        <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Data Sources</h3>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            NASA POWER provides analysis-ready environmental data derived from NASA Earth observation and modeling resources, including MERRA-2 atmospheric assimilation, CERES solar radiation, and GPM precipitation products.
          </p>
          <div className="text-xs font-mono text-cyan-400/90 pt-2 border-t border-slate-800">
            Endpoint: NASA POWER Daily API · Native model grid cells
          </div>
        </div>

        {/* 2. Scientific Method */}
        <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-950/80 border border-sky-800/60 text-sky-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Scientific Method</h3>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            We employ the genuine non-parametric Theil-Sen robust median slope estimator paired with tie-corrected Mann-Kendall monotonic rank testing at α = 0.05. Ordinary linear regression R² is provided as an optional reference statistic.
          </p>
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={onOpenMethodology}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
            >
              Learn about the methodology →
            </button>
          </div>
        </div>

        {/* 3. Limitations */}
        <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-950/80 border border-amber-800/60 text-amber-400">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Limitations & Causation</h3>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Statistical significance indicates monotonic directional shift and does not prove physical causation. Temporal autocorrelation in climatic records can affect significance thresholds.
          </p>
          <div className="text-xs font-mono text-slate-400 pt-2 border-t border-slate-800">
            NASA POWER grid cells smooth hyper-local microclimates
          </div>
        </div>

        {/* 4. Statistical Interpretation */}
        <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-950/80 border border-indigo-800/60 text-indigo-400">
              <LineChart className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Statistical Interpretation</h3>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            EarthPulse translates computed statistical parameters into structured summaries. Findings highlight observed multi-decadal behavior while maintaining clear distinction between live NASA data and simulated fallback modes.
          </p>
          <div className="text-xs font-mono text-slate-400 pt-2 border-t border-slate-800">
            Grounded in calculated p-values & Theil-Sen slopes
          </div>
        </div>
      </div>

      {/* NASA Attribution & Links */}
      <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-6 sm:p-8 space-y-4">
        <h3 className="text-lg font-bold text-white">
          Data Attribution & Open Science References
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          This project was developed for the <strong className="text-white">NASA Space Apps Challenge 2026</strong> under the theme <strong className="text-cyan-300">“Be An Earth System Trend Detective!”</strong>.
          We gratefully acknowledge the NASA Langley Research Center POWER Project team and the NASA Earth Science Division for open access to atmospheric and solar datasets.
        </p>

        <div className="pt-4 border-t border-slate-800 flex flex-wrap gap-4 text-xs font-mono">
          <a
            href="https://power.larc.nasa.gov/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>NASA POWER Portal</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <a
            href="https://earthdata.nasa.gov/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>NASA Earthdata Documentation</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <a
            href="https://www.spaceappschallenge.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>NASA Space Apps Challenge</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
