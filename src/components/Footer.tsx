import React from 'react';
import { ExternalLink, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onNavClick: (tab: 'explore' | 'compare' | 'detective' | 'about') => void;
  onOpenMethodology: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavClick, onOpenMethodology }) => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#04060a] text-slate-400 py-12 mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 border border-cyan-500/40 text-cyan-400">
                <svg viewBox="0 0 32 32" fill="none" className="h-4 w-4">
                  <circle cx="16" cy="16" r="11" stroke="#0ea5e9" strokeWidth="1.5" />
                  <path d="M5 16H11L13 11L16 21L19 13L21 16H27" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-base font-bold text-white tracking-tight">EarthPulse</span>
              <span className="text-xs font-mono text-cyan-400">NASA SPACE APPS 2026</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              Helping humanity detect and understand environmental shifts through NASA Earth observation data.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-mono">
            <button
              onClick={() => onNavClick('explore')}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Explore
            </button>
            <button
              onClick={() => onNavClick('compare')}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Compare
            </button>
            <button
              onClick={() => onNavClick('detective')}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Trend Detective
            </button>
            <button
              onClick={onOpenMethodology}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Methodology
            </button>
            <button
              onClick={() => onNavClick('about')}
              className="text-slate-400 hover:text-white transition-colors"
            >
              About
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            Built for the NASA Space Apps Challenge 2026: “Be An Earth System Trend Detective!”.
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Open Data · Non-Commercial Scientific Exploration
          </div>
        </div>
      </div>
    </footer>
  );
};
