import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Search, ChevronDown, Check, Compass } from 'lucide-react';
import { LocationInfo } from '../types';
import { POPULAR_LOCATIONS } from '../data/mockData';

interface LocationSelectorProps {
  selectedLocation: LocationInfo;
  onSelectLocation: (loc: LocationInfo) => void;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  selectedLocation,
  onSelectLocation,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLocations = POPULAR_LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.climateZone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCoord = (coord: number, isLat: boolean) => {
    const dir = isLat ? (coord >= 0 ? 'N' : 'S') : coord >= 0 ? 'E' : 'W';
    return `${Math.abs(coord).toFixed(4)}° ${dir}`;
  };

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-medium">
        Target Location
      </label>

      {/* Selected Box / Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`group cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
          isOpen
            ? 'border-cyan-500 bg-slate-900/90 ring-1 ring-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
            : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/80'
        }`}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-label={`Selected location: ${selectedLocation.name}, ${selectedLocation.country}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-950/80 border border-cyan-800/50 text-cyan-400">
              <MapPin className="h-5 w-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-white">
                  {selectedLocation.name}, {selectedLocation.country}
                </span>
              </div>

              {/* Coordinates display requested specifically */}
              <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs font-mono text-cyan-400/90">
                <span>{formatCoord(selectedLocation.latitude, true)}</span>
                <span className="text-slate-600" aria-hidden="true">·</span>
                <span>{formatCoord(selectedLocation.longitude, false)}</span>
                {selectedLocation.elevationMeters && (
                  <>
                    <span className="text-slate-600" aria-hidden="true">·</span>
                    <span className="text-slate-400 font-sans">
                      Alt {selectedLocation.elevationMeters}m
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 group-hover:text-cyan-400 transition-colors hidden sm:inline">
              Change location
            </span>
            <ChevronDown
              className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-cyan-400' : ''}`}
            />
          </div>
        </div>
      </div>

      {/* Dropdown with Search */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-30 rounded-xl border border-slate-700/80 bg-[#090e18] p-3 shadow-2xl backdrop-blur-xl">
          {/* Search Input */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search a location… (e.g. Bengaluru, India)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-2 pl-9 pr-3 text-sm text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              autoFocus
            />
          </div>

          {/* Quick List */}
          <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
            {filteredLocations.length > 0 ? (
              filteredLocations.map((loc) => {
                const isSelected = loc.id === selectedLocation.id;
                return (
                  <button
                    key={loc.id}
                    onClick={() => {
                      onSelectLocation(loc);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                      isSelected
                        ? 'bg-cyan-950/70 border border-cyan-800/60 text-white'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-slate-100">
                        {loc.name}, <span className="text-slate-400">{loc.country}</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        {formatCoord(loc.latitude, true)} · {formatCoord(loc.longitude, false)}
                        {loc.climateZone && ` · ${loc.climateZone}`}
                      </div>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-cyan-400 shrink-0" />}
                  </button>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                <Compass className="h-6 w-6 text-slate-600 mx-auto mb-1.5" />
                No matching observation grid found. Select from standard NASA Earth observing stations above.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
