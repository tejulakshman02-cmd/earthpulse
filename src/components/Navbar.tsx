import React, { useState } from 'react';
import { Menu, X, Globe, BarChart3, Compass, BookOpen, Info, ArrowRight } from 'lucide-react';

interface NavbarProps {
  activeTab: 'explore' | 'compare' | 'detective' | 'about';
  setActiveTab: (tab: 'explore' | 'compare' | 'detective' | 'about') => void;
  onAnalyzeClick: () => void;
  onOpenMethodology: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onAnalyzeClick,
  onOpenMethodology,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: 'explore' | 'compare' | 'detective' | 'about') => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#05070B]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Wordmark */}
        <button
          onClick={() => handleNavClick('explore')}
          className="group flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-lg p-1"
        >
          {/* Scientific Earth Pulse Mark */}
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)] transition-transform group-hover:scale-105">
            <svg
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
            >
              {/* Earth circle contour */}
              <circle cx="16" cy="16" r="11" stroke="#0ea5e9" strokeWidth="1.2" strokeOpacity="0.8" />
              {/* Latitude line */}
              <path d="M6 16C6 16 10 20 16 20C22 20 26 16 26 16" stroke="#38bdf8" strokeWidth="0.9" strokeOpacity="0.6" strokeDasharray="1.5 1.5" />
              {/* Pulse / trend sine heartbeat */}
              <path
                d="M5 16H11L13 11L16 21L19 13L21 16H27"
                stroke="#22d3ee"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-semibold tracking-tight text-white">EarthPulse</span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400/90 font-medium">NASA 2026</span>
            </div>
            <p className="text-[11px] text-slate-400 tracking-tight hidden sm:block">
              Earth System Trend Detective
            </p>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-300">
          <button
            onClick={() => handleNavClick('explore')}
            className={`px-3 py-2 rounded-md transition-colors ${
              activeTab === 'explore'
                ? 'text-cyan-400 bg-slate-800/60 font-semibold'
                : 'hover:text-white hover:bg-slate-900/50'
            }`}
          >
            Explore
          </button>

          <button
            onClick={() => handleNavClick('compare')}
            className={`px-3 py-2 rounded-md transition-colors ${
              activeTab === 'compare'
                ? 'text-cyan-400 bg-slate-800/60 font-semibold'
                : 'hover:text-white hover:bg-slate-900/50'
            }`}
          >
            Compare
          </button>

          <button
            onClick={() => handleNavClick('detective')}
            className={`px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'detective'
                ? 'text-cyan-400 bg-slate-800/60 font-semibold'
                : 'hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <Compass className="h-3.5 w-3.5 text-cyan-400" />
            <span>Trend Detective</span>
          </button>

          <button
            onClick={onOpenMethodology}
            className="px-3 py-2 rounded-md hover:text-white hover:bg-slate-900/50 transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="h-3.5 w-3.5 text-slate-400" />
            <span>Methodology</span>
          </button>

          <button
            onClick={() => handleNavClick('about')}
            className={`px-3 py-2 rounded-md transition-colors ${
              activeTab === 'about'
                ? 'text-cyan-400 bg-slate-800/60 font-semibold'
                : 'hover:text-white hover:bg-slate-900/50'
            }`}
          >
            About
          </button>
        </nav>

        {/* Primary CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={onAnalyzeClick}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold px-4 py-2 text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          >
            <span>Analyze Earth</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-md"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#090d16] px-4 py-4 space-y-2">
          <button
            onClick={() => handleNavClick('explore')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm ${
              activeTab === 'explore' ? 'bg-cyan-950/60 text-cyan-300 font-medium' : 'text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-cyan-400" />
              <span>Explore</span>
            </div>
          </button>

          <button
            onClick={() => handleNavClick('compare')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm ${
              activeTab === 'compare' ? 'bg-cyan-950/60 text-cyan-300 font-medium' : 'text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-cyan-400" />
              <span>Compare</span>
            </div>
          </button>

          <button
            onClick={() => handleNavClick('detective')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm ${
              activeTab === 'detective' ? 'bg-cyan-950/60 text-cyan-300 font-medium' : 'text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-cyan-400" />
              <span>Trend Detective</span>
            </div>
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenMethodology();
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm text-slate-300 hover:bg-slate-800/50"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-slate-400" />
              <span>Methodology</span>
            </div>
          </button>

          <button
            onClick={() => handleNavClick('about')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm ${
              activeTab === 'about' ? 'bg-cyan-950/60 text-cyan-300 font-medium' : 'text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-slate-400" />
              <span>About</span>
            </div>
          </button>

          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onAnalyzeClick();
              }}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold py-2.5 text-sm"
            >
              <span>Analyze Earth</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
