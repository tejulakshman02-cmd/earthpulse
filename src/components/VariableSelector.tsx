import React from 'react';
import { Thermometer, CloudRain, Sun, Activity } from 'lucide-react';
import { VariableType } from '../types';
import { VARIABLE_METADATA } from '../data/mockData';

interface VariableSelectorProps {
  selectedVariable: VariableType;
  onSelectVariable: (variable: VariableType) => void;
}

export const VariableSelector: React.FC<VariableSelectorProps> = ({
  selectedVariable,
  onSelectVariable,
}) => {
  const variables: Array<{
    id: VariableType;
    icon: React.ReactNode;
    colorClass: string;
    activeBorderClass: string;
    activeBgClass: string;
  }> = [
    {
      id: 'temperature',
      icon: <Thermometer className="h-5 w-5" />,
      colorClass: 'text-amber-400',
      activeBorderClass: 'border-amber-500/70',
      activeBgClass: 'bg-amber-950/20',
    },
    {
      id: 'rainfall',
      icon: <CloudRain className="h-5 w-5" />,
      colorClass: 'text-sky-400',
      activeBorderClass: 'border-sky-500/70',
      activeBgClass: 'bg-sky-950/20',
    },
    {
      id: 'solar',
      icon: <Sun className="h-5 w-5" />,
      colorClass: 'text-yellow-400',
      activeBorderClass: 'border-yellow-500/70',
      activeBgClass: 'bg-yellow-950/20',
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-medium">
          Environmental Variable
        </label>
        <span className="text-[11px] font-mono text-cyan-400">
          Unit: {VARIABLE_METADATA[selectedVariable].unit}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {variables.map((item) => {
          const isSelected = selectedVariable === item.id;
          const meta = VARIABLE_METADATA[item.id];

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectVariable(item.id)}
              aria-pressed={isSelected}
              className={`group relative flex flex-col items-start p-4 text-left rounded-xl border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                isSelected
                  ? `${item.activeBorderClass} ${item.activeBgClass} shadow-[0_0_15px_rgba(14,165,233,0.12)] ring-1 ring-cyan-500/30`
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80 text-slate-300'
              }`}
            >
              {/* Header Icon + Name */}
              <div className="flex items-center gap-2.5 mb-1.5 w-full">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/40 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  {item.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-white truncate">
                    {meta.name}
                  </div>
                </div>

                {isSelected && (
                  <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                )}
              </div>

              {/* Short Description */}
              <p className="text-xs text-slate-400 leading-snug line-clamp-2">
                “{meta.shortDescription}”
              </p>

              {/* Dataset hint */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/60 w-full text-[10px] font-mono text-slate-500 flex items-center justify-between">
                <span>NASA POWER</span>
                <span className="text-slate-400">{meta.unit}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
