import React, { useEffect, useState } from 'react';
import { Satellite, Cpu, LineChart, Sparkles } from 'lucide-react';
import { LocationInfo, VariableType, TimePeriod } from '../types';

interface LoadingSequenceProps {
  location: LocationInfo;
  variable: VariableType;
  period: TimePeriod;
  onComplete: () => void;
}

export const LoadingSequence: React.FC<LoadingSequenceProps> = ({
  location,
  variable,
  period,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Connecting to NASA Earth data…',
      detail: `Accessing NASA POWER & MERRA-2 grids for (${location.latitude.toFixed(2)}°, ${location.longitude.toFixed(2)}°)`,
      icon: <Satellite className="h-5 w-5 text-cyan-400 animate-pulse" />,
    },
    {
      title: 'Processing the time series…',
      detail: `Aggregating ${period.start}–${period.end} annual observations (${period.end - period.start + 1} annual epochs)`,
      icon: <Cpu className="h-5 w-5 text-sky-400" />,
    },
    {
      title: 'Detecting environmental trends…',
      detail: 'Estimating Theil-Sen median slope & running tie-corrected Mann-Kendall test',
      icon: <LineChart className="h-5 w-5 text-indigo-400" />,
    },
    {
      title: 'Preparing your EarthPulse…',
      detail: 'Synthesizing statistical confidence envelopes and narrative insights',
      icon: <Sparkles className="h-5 w-5 text-cyan-300" />,
    },
  ];

  useEffect(() => {
    // Step progression timer: ~400ms per step
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(onComplete, 400);
          return prev;
        }
      });
    }, 450);

    return () => clearInterval(interval);
  }, [onComplete, steps.length]);

  const progressPercent = Math.min(100, Math.round(((currentStep + 1) / steps.length) * 100));

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-[#090d16]/95 p-6 sm:p-8 backdrop-blur-xl shadow-2xl max-w-xl mx-auto my-8">
      {/* Telemetry Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </span>
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
            NASA Mission Telemetry
          </span>
        </div>
        <span className="text-xs font-mono text-slate-400">
          STATUS: COMPUTING {progressPercent}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-4 border border-slate-800">
        <div
          className="bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 h-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Active Steps List */}
      <div className="mt-6 space-y-4">
        {steps.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;
          const isPending = idx > currentStep;

          return (
            <div
              key={step.title}
              className={`flex items-start gap-3.5 transition-opacity duration-300 ${
                isPending ? 'opacity-30' : 'opacity-100'
              }`}
            >
              <div
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-mono transition-colors ${
                  isDone
                    ? 'border-cyan-500 bg-cyan-950/60 text-cyan-300'
                    : isCurrent
                    ? 'border-cyan-400 bg-slate-900 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
              >
                {idx + 1}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4
                    className={`text-sm font-medium ${
                      isCurrent ? 'text-cyan-300 font-semibold' : isDone ? 'text-slate-200' : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </h4>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  {step.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mission Footer note */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>TARGET: {location.name.toUpperCase()}</span>
        <span>VAR: {variable.toUpperCase()}</span>
      </div>
    </div>
  );
};
