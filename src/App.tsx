import React, { useState, useRef, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { LocationSelector } from './components/LocationSelector';
import { VariableSelector } from './components/VariableSelector';
import { TimeRangeSelector } from './components/TimeRangeSelector';
import { LoadingSequence } from './components/LoadingSequence';
import { Dashboard } from './components/Dashboard';
import { ComparePanel } from './components/ComparePanel';
import { TrendDetective } from './components/TrendDetective';
import { MethodologyModal } from './components/MethodologyModal';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';

import {
  LocationInfo,
  VariableType,
  TimePeriod,
  AnalysisResult,
  DetectiveHotspot,
} from './types';
import { POPULAR_LOCATIONS } from './data/mockData';
import { analyzeTrend } from './services/api';
import {
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  Compass,
} from 'lucide-react';

export default function App() {
  // Navigation active tab: explore, compare, detective, about
  const [activeTab, setActiveTab] = useState<'explore' | 'compare' | 'detective' | 'about'>('explore');

  // Analysis Workspace selections
  const [selectedLocation, setSelectedLocation] = useState<LocationInfo>(POPULAR_LOCATIONS[0]); // Bengaluru, India
  const [selectedVariable, setSelectedVariable] = useState<VariableType>('temperature');
  const [period, setPeriod] = useState<TimePeriod>({ start: 1990, end: 2025 });

  // Execution state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Methodology modal
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);

  // Ref to scroll to investigation workspace
  const workspaceRef = useRef<HTMLDivElement | null>(null);

  const scrollToWorkspace = () => {
    setActiveTab('explore');
    if (workspaceRef.current) {
      workspaceRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Perform Analysis
  const handleStartAnalysis = async () => {
    setErrorMessage(null);

    // Basic client validation
    if (period.start >= period.end) {
      setErrorMessage('Please choose a valid time period (start year must precede end year).');
      return;
    }
    if (period.start < 1980 || period.end > 2025) {
      setErrorMessage('Please select a time period between 1980 and 2025 (NASA observation epoch).');
      return;
    }

    setIsLoading(true);
    // The LoadingSequence component triggers `onComplete` after rendering the 4 steps
  };

  const handleLoadingComplete = async () => {
    try {
      // By default, query real NASA POWER data honestly without silent fallback
      const result = await analyzeTrend(selectedLocation, selectedVariable, period, {
        allowDemoFallback: false,
      });
      setAnalysisResult(result);
      setIsLoading(false);
      setTimeout(() => {
        if (workspaceRef.current) {
          workspaceRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(
        err.message || 'NASA POWER data could not be retrieved.'
      );
    }
  };

  // Explicit opt-in to demo data when NASA POWER is unavailable
  const handleRunDemoFallback = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await analyzeTrend(selectedLocation, selectedVariable, period, {
        allowDemoFallback: true,
      });
      setAnalysisResult(result);
      setIsLoading(false);
      setTimeout(() => {
        if (workspaceRef.current) {
          workspaceRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage('Unable to initialize demo data simulation.');
    }
  };

  // Reset to form
  const handleModifySearch = () => {
    setAnalysisResult(null);
    scrollToWorkspace();
  };

  // Hotspot chosen from Trend Detective
  const handleSelectHotspot = (hotspot: DetectiveHotspot) => {
    setSelectedLocation(hotspot.location);
    setSelectedVariable(hotspot.variable);
    setPeriod(hotspot.period);
    setActiveTab('explore');
    setIsLoading(true);
  };

  return (
    <div className="min-h-screen bg-[#05070B] text-slate-100 flex flex-col font-sans">
      {/* Global Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAnalyzeClick={scrollToWorkspace}
        onOpenMethodology={() => setIsMethodologyOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Tab 1: Explore (Hero + Analysis Workspace + Dashboard) */}
        {activeTab === 'explore' && (
          <>
            {/* Show Hero only if no active analysis result, or always as subtle entry */}
            {!analysisResult && (
              <Hero
                onAnalyzeClick={scrollToWorkspace}
                onExploreHowItWorks={() => setIsMethodologyOpen(true)}
              />
            )}

            {/* Analysis Workspace Container */}
            <div ref={workspaceRef} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
              {/* If Loading: show the 4-step NASA telemetry loading */}
              {isLoading && (
                <LoadingSequence
                  location={selectedLocation}
                  variable={selectedVariable}
                  period={period}
                  onComplete={handleLoadingComplete}
                />
              )}

              {/* If Error: show clear, transparent NASA error state with Retry and Demo options */}
              {errorMessage && !isLoading && (
                <div className="max-w-xl mx-auto rounded-2xl border border-amber-900/60 bg-amber-950/20 p-6 text-center space-y-4 mb-8">
                  <div className="flex justify-center">
                    <div className="h-12 w-12 rounded-full bg-amber-900/40 flex items-center justify-center text-amber-400">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">NASA POWER data could not be retrieved</h3>
                    <p className="text-sm text-amber-200/90 mt-1">{errorMessage}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      You can retry connecting to the official NASA POWER Daily API or explore using simulated demo data.
                    </p>
                  </div>
                  <div className="pt-2 flex flex-wrap justify-center gap-3">
                    <button
                      onClick={handleStartAnalysis}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold rounded-lg transition-colors"
                    >
                      Retry NASA API
                    </button>
                    <button
                      onClick={handleRunDemoFallback}
                      className="px-4 py-2 bg-amber-700/80 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors border border-amber-500/40"
                    >
                      Use Demo Data
                    </button>
                    <button
                      onClick={() => setErrorMessage(null)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              {/* If Analysis Result Available: Show Dashboard */}
              {analysisResult && !isLoading && (
                <Dashboard
                  data={analysisResult}
                  onModifySearch={handleModifySearch}
                  onOpenMethodology={() => setIsMethodologyOpen(true)}
                />
              )}

              {/* If No Result & Not Loading: Show Investigation Form (Workspace) */}
              {!analysisResult && !isLoading && (
                <div className="rounded-2xl border border-slate-800/90 bg-[#090d16] p-6 sm:p-10 shadow-2xl space-y-8">
                  {/* Workspace Title & Subtitle */}
                  <div className="border-b border-slate-800 pb-6">
                    <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
                      <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                      <span>Observation Workbench</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
                      Start your investigation
                    </h2>
                    <p className="text-sm sm:text-base text-slate-400 mt-1">
                      Choose a place, an environmental variable, and a time period.
                    </p>
                  </div>

                  {/* Form Grid */}
                  <div className="space-y-8">
                    {/* Location Field */}
                    <LocationSelector
                      selectedLocation={selectedLocation}
                      onSelectLocation={setSelectedLocation}
                    />

                    {/* Environmental Variable */}
                    <VariableSelector
                      selectedVariable={selectedVariable}
                      onSelectVariable={setSelectedVariable}
                    />

                    {/* Time Period */}
                    <TimeRangeSelector
                      period={period}
                      onChangePeriod={setPeriod}
                      error={null}
                    />
                  </div>

                  {/* Primary Action Button */}
                  <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs font-mono text-slate-400">
                      Querying: <span className="text-cyan-400">{selectedLocation.name}</span> ·{' '}
                      <span className="text-cyan-400">{selectedVariable.toUpperCase()}</span> ·{' '}
                      <span className="text-cyan-400">{period.start}–{period.end}</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleStartAnalysis}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8 py-4 text-base shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all hover:shadow-[0_0_35px_rgba(6,182,212,0.55)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                    >
                      <span>Analyze Earth</span>
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Empty State Banner */}
                  <div className="pt-4 border-t border-slate-900/60 flex items-center justify-center gap-2 text-xs text-slate-400 text-center">
                    <Info className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>
                      Your Earth investigation starts here. Selected parameters query NASA's historical observation pipelines.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Tab 2: Compare Earth */}
        {activeTab === 'compare' && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
            <ComparePanel
              initialLocationA={selectedLocation}
              initialVariable={selectedVariable}
              initialPeriod={period}
              onExploreSingle={(loc) => {
                setSelectedLocation(loc);
                setActiveTab('explore');
                handleStartAnalysis();
              }}
            />
          </div>
        )}

        {/* Tab 3: Trend Detective */}
        {activeTab === 'detective' && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
            <TrendDetective onSelectHotspot={handleSelectHotspot} />
          </div>
        )}

        {/* Tab 4: About / Built with NASA data */}
        {activeTab === 'about' && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
            <AboutSection onOpenMethodology={() => setIsMethodologyOpen(true)} />
          </div>
        )}
      </main>

      {/* Methodology Modal */}
      <MethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />

      {/* Footer */}
      <Footer
        onNavClick={setActiveTab}
        onOpenMethodology={() => setIsMethodologyOpen(true)}
      />
    </div>
  );
}
