import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  MapPin,
  ExternalLink,
  Download,
  Layers,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Satellite,
  Compass,
  ShieldCheck,
} from 'lucide-react';
import { LocationInfo, VariableType } from '../types';

interface MapPanelProps {
  location: LocationInfo;
  variable: VariableType;
}

export const MapPanel: React.FC<MapPanelProps> = ({ location, variable }) => {
  const [mapLayer, setMapLayer] = useState<'satellite' | 'dark' | 'nasa-gibs'>('satellite');
  const [isDownloading, setIsDownloading] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const gridRectRef = useRef<L.Rectangle | null>(null);

  const formatCoord = (coord: number, isLat: boolean) => {
    const dir = isLat ? (coord >= 0 ? 'N' : 'S') : coord >= 0 ? 'E' : 'W';
    return `${Math.abs(coord).toFixed(4)}° ${dir}`;
  };

  // Safe public tile endpoints that do NOT require any API keys
  const getTileConfig = (layer: 'satellite' | 'dark' | 'nasa-gibs') => {
    switch (layer) {
      case 'satellite':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          maxZoom: 18,
          attribution: 'Tiles &copy; Esri, Maxar, Earthstar Geographics',
        };
      case 'dark':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
          maxZoom: 16,
          attribution: 'Tiles &copy; Esri, HERE, Garmin, OpenStreetMap',
        };
      case 'nasa-gibs':
        return {
          url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg',
          maxZoom: 8,
          attribution: 'NASA Earth Science Data Systems (GIBS) &middot; Blue Marble',
        };
    }
  };

  // Initialize and update the Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const lat = location.latitude;
    const lon = location.longitude;

    // Create map instance if not exists
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lon],
        zoom: 7,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Invalidate size on first mount to prevent blank container issues
      setTimeout(() => {
        map.invalidateSize();
      }, 150);
    }

    const map = mapInstanceRef.current;

    // Remove existing tile layer
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    // Add reliable free tile layer (NO API KEY REQUIRED)
    const config = getTileConfig(mapLayer);
    const tiles = L.tileLayer(config.url, {
      maxZoom: config.maxZoom,
      attribution: config.attribution,
    });
    tiles.addTo(map);
    tileLayerRef.current = tiles;

    // Make sure map container size is synced
    map.invalidateSize();

    // Fly to the exact selected location
    map.flyTo([lat, lon], mapLayer === 'nasa-gibs' ? 6 : 7, {
      duration: 1.0,
      easeLinearity: 0.25,
    });

    // Remove previous marker
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
    }

    // Create high-contrast glowing location pointer
    const customIcon = L.divIcon({
      className: 'earthpulse-marker-wrapper',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; pointer-events: auto;">
          <!-- Target beacon ping -->
          <div style="position: absolute; width: 44px; height: 44px; border-radius: 9999px; background: rgba(34, 211, 238, 0.5); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; top: -22px;"></div>
          <!-- Pointer Pin -->
          <div style="display: flex; height: 38px; width: 38px; align-items: center; justify-content: center; border-radius: 9999px; background: #082f49; border: 2.5px solid #22d3ee; color: #bae6fd; box-shadow: 0 0 24px rgba(6, 182, 212, 1); margin-top: -19px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <!-- Pointer arrow stem pointing down directly to coordinate -->
          <div style="width: 2px; height: 12px; background: #22d3ee; box-shadow: 0 0 8px #22d3ee;"></div>
          <!-- Location Label Badge -->
          <div style="background: rgba(3, 7, 18, 0.95); border: 1.5px solid #38bdf8; border-radius: 6px; padding: 3px 8px; font-family: monospace; font-size: 11px; font-weight: bold; color: #ffffff; white-space: nowrap; margin-top: 2px; box-shadow: 0 4px 14px rgba(0,0,0,0.8);">
            ${location.name}, ${location.country}
          </div>
        </div>
      `,
      iconSize: [40, 68],
      iconAnchor: [20, 31],
    });

    const marker = L.marker([lat, lon], { icon: customIcon }).addTo(map);
    markerRef.current = marker;

    // Remove previous grid cell
    if (gridRectRef.current) {
      map.removeLayer(gridRectRef.current);
    }

    // Draw the 0.5° × 0.5° NASA observation grid box around the selected point
    const halfCell = 0.25;
    const gridBounds: L.LatLngBoundsExpression = [
      [lat - halfCell, lon - halfCell],
      [lat + halfCell, lon + halfCell],
    ];

    const gridRect = L.rectangle(gridBounds, {
      color: '#22d3ee',
      weight: 2,
      dashArray: '5, 5',
      fillColor: '#0891b2',
      fillOpacity: 0.15,
    }).addTo(map);

    gridRectRef.current = gridRect;
  }, [location, mapLayer]);

  // Recenter button
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([location.latitude, location.longitude], mapLayer === 'nasa-gibs' ? 6 : 7, {
        duration: 0.8,
      });
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  // Download Map feature: exports an SVG/PNG snapshot card of the map
  const handleDownloadMap = () => {
    setIsDownloading(true);
    setTimeout(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 700;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Background
        ctx.fillStyle = '#05070B';
        ctx.fillRect(0, 0, 1200, 700);

        // Header telemetry bar
        ctx.fillStyle = '#090d16';
        ctx.fillRect(40, 40, 1120, 100);
        ctx.strokeStyle = '#1e293b';
        ctx.strokeRect(40, 40, 1120, 100);

        ctx.fillStyle = '#22d3ee';
        ctx.font = 'bold 24px monospace';
        ctx.fillText(`EARTHPULSE · NASA OBSERVATION MAP`, 70, 80);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '16px monospace';
        ctx.fillText(`TARGET: ${location.name.toUpperCase()}, ${location.country.toUpperCase()} (${formatCoord(location.latitude, true)}, ${formatCoord(location.longitude, false)})`, 70, 115);

        // Main map frame
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(40, 160, 1120, 460);
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2;
        ctx.strokeRect(40, 160, 1120, 460);

        // Coordinate crosshair reticle
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
        ctx.beginPath();
        ctx.moveTo(600, 160);
        ctx.lineTo(600, 620);
        ctx.moveTo(40, 390);
        ctx.lineTo(1160, 390);
        ctx.stroke();

        // Target Pin
        ctx.fillStyle = '#22d3ee';
        ctx.beginPath();
        ctx.arc(600, 390, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(600, 390, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText(`${location.name}, ${location.country}`, 625, 385);

        ctx.fillStyle = '#38bdf8';
        ctx.font = '14px monospace';
        ctx.fillText(`NASA POWER ANALYSIS CELL · WGS84 GEOID`, 625, 412);

        // Footer attribution
        ctx.fillStyle = '#64748b';
        ctx.font = '14px monospace';
        ctx.fillText(`NASA Space Apps Challenge 2026 · NASA POWER / MERRA-2 · Open Geospatial Imagery`, 70, 660);

        // Download as PNG file
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `EarthPulse_Map_${location.name.replace(/[^a-zA-Z0-9]/g, '_')}_${location.country}.png`;
        link.href = dataUrl;
        link.click();
      }
      setIsDownloading(false);
    }, 400);
  };

  const openExternalMap = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-6 shadow-xl space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Compass className="h-5 w-5 text-cyan-400" />
            <span>Where is this happening?</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Global satellite map targeting {location.name}, {location.country} with NASA POWER analysis grid cell
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Layer switcher */}
          <div className="flex items-center rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setMapLayer('satellite')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 ${
                mapLayer === 'satellite'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Satellite className="h-3 w-3" />
              <span>Satellite</span>
            </button>
            <button
              onClick={() => setMapLayer('dark')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 ${
                mapLayer === 'dark'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Dark Canvas</span>
            </button>
            <button
              onClick={() => setMapLayer('nasa-gibs')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 ${
                mapLayer === 'nasa-gibs'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>NASA GIBS</span>
            </button>
          </div>

          {/* Download Map Button */}
          <button
            onClick={handleDownloadMap}
            disabled={isDownloading}
            title="Download high-resolution map snapshot"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 hover:text-white hover:bg-slate-800 text-xs font-mono font-medium transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            <span>{isDownloading ? 'Downloading…' : 'Download Map'}</span>
          </button>

          {/* External Map Link */}
          <button
            onClick={openExternalMap}
            title="Open in Google Maps / OpenStreetMap"
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Real Interactive Leaflet Map Container */}
      <div className="relative h-80 sm:h-96 w-full rounded-xl overflow-hidden border border-slate-800 shadow-inner bg-[#050914]">
        {/* The actual Leaflet map canvas */}
        <div ref={mapContainerRef} className="absolute inset-0 z-0 w-full h-full" />

        {/* HUD Top Left: Target Coordinates & Country Info */}
        <div className="absolute top-3 left-3 z-10 font-mono text-[11px] text-slate-200 bg-slate-950/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-800/90 shadow-lg pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-bold text-white tracking-wide">{location.name}, {location.country}</span>
          </div>
          <div className="text-[10px] text-cyan-400 mt-1">
            {formatCoord(location.latitude, true)} · {formatCoord(location.longitude, false)}
          </div>
        </div>

        {/* HUD Top Right: NASA Grid Cell Tag */}
        <div className="absolute top-3 right-3 z-10 font-mono text-[10px] text-cyan-300 bg-slate-950/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-cyan-500/30 shadow-lg flex items-center gap-1.5 pointer-events-none">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
          <span>NASA POWER ANALYSIS CELL LOCKED</span>
        </div>

        {/* HUD Bottom Left: Interactive Map Controls */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5">
          <button
            onClick={handleZoomIn}
            title="Zoom in"
            className="h-8 w-8 rounded-lg bg-slate-950/90 backdrop-blur-md border border-slate-700 text-slate-200 hover:text-white hover:border-cyan-400 flex items-center justify-center transition-colors shadow-lg"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom out"
            className="h-8 w-8 rounded-lg bg-slate-950/90 backdrop-blur-md border border-slate-700 text-slate-200 hover:text-white hover:border-cyan-400 flex items-center justify-center transition-colors shadow-lg"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={handleRecenter}
            title="Recenter on target coordinates"
            className="h-8 px-2.5 rounded-lg bg-slate-950/90 backdrop-blur-md border border-slate-700 text-slate-200 hover:text-cyan-300 hover:border-cyan-400 flex items-center gap-1.5 text-xs font-mono transition-colors shadow-lg"
          >
            <Crosshair className="h-3.5 w-3.5 text-cyan-400" />
            <span>Recenter</span>
          </button>
        </div>

        {/* HUD Bottom Right: Free Open Science Attribution */}
        <div className="absolute bottom-2 right-3 z-10 text-[9px] font-mono text-slate-400 bg-slate-950/85 px-2 py-0.5 rounded pointer-events-none border border-slate-800/60">
          Open Earth Imagery · NASA GIBS / Esri · No Key Required
        </div>
      </div>

      {/* Geographic Meta Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
        <div className="border border-slate-800/80 rounded-lg p-3 bg-slate-950/60">
          <div className="text-slate-400 text-[10px] uppercase">Latitude</div>
          <div className="text-white font-semibold mt-1">
            {formatCoord(location.latitude, true)}
          </div>
        </div>

        <div className="border border-slate-800/80 rounded-lg p-3 bg-slate-950/60">
          <div className="text-slate-400 text-[10px] uppercase">Longitude</div>
          <div className="text-white font-semibold mt-1">
            {formatCoord(location.longitude, false)}
          </div>
        </div>

        <div className="border border-slate-800/80 rounded-lg p-3 bg-slate-950/60">
          <div className="text-slate-400 text-[10px] uppercase">Elevation</div>
          <div className="text-cyan-300 font-semibold mt-1">
            {location.elevationMeters ? `${location.elevationMeters} m ASL` : 'Near Sea Level'}
          </div>
        </div>

        <div className="border border-slate-800/80 rounded-lg p-3 bg-slate-950/60">
          <div className="text-slate-400 text-[10px] uppercase">Climate Zone</div>
          <div className="text-slate-200 font-semibold mt-1 truncate">
            {location.climateZone || 'Temperate'}
          </div>
        </div>
      </div>
    </div>
  );
};
