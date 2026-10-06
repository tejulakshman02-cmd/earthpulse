import React from 'react';
import { X, BookOpen, Layers, CheckCircle2, AlertTriangle, ShieldCheck, ExternalLink, Activity } from 'lucide-react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-700 bg-[#090e18] p-6 sm:p-8 shadow-2xl text-slate-200 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <BookOpen className="h-4 w-4" />
            <span>Scientific Transparency</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
            Data & Methodology
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete technical specification of NASA POWER ingestion, Theil-Sen slope estimation, and tie-corrected Mann-Kendall testing.
          </p>
        </div>

        {/* Content Body */}
        <div className="py-6 space-y-6 max-h-[70vh] overflow-y-auto pr-2 text-sm leading-relaxed">
          {/* Section 1: Where the data comes from */}
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-950 text-cyan-400 text-xs font-mono">1</span>
              NASA POWER Environmental Data & Ingestion
            </h3>
            <p className="text-slate-300">
              EarthPulse retrieves analysis-ready environmental data directly from the{' '}
              <strong className="text-white">NASA POWER (Prediction of Worldwide Energy Resources)</strong> project.
              NASA POWER synthesizes parameters derived from authoritative NASA Earth observation and modeling resources:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-xs pl-2">
              <li>
                <strong className="text-slate-200">Temperature (T2M):</strong> 2-meter surface air temperature derived from NASA GMAO MERRA-2 assimilation modeling.
              </li>
              <li>
                <strong className="text-slate-200">Precipitation (PRECTOTCORR):</strong> Corrected precipitation derived from MERRA-2 and satellite microwave observation products (GPM/IMERG).
              </li>
              <li>
                <strong className="text-slate-200">Solar Radiation (ALLSKY_SFC_SW_DWN):</strong> All-sky surface downward shortwave irradiance synthesized from NASA CERES satellite instruments and atmospheric modeling.
              </li>
            </ul>

            <div className="mt-3 p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300">
              <div className="text-cyan-400 font-semibold mb-1">Live Endpoint Ingestion:</div>
              <div className="text-slate-200 truncate">https://power.larc.nasa.gov/api/temporal/daily/point</div>
              <div className="mt-1 text-[11px] text-slate-400">
                Daily observations are retrieved and aggregated: Temperature & Solar Radiation are aggregated to annual means; Precipitation is aggregated to annual cumulative totals (mm/year).
              </div>
            </div>
          </div>

          {/* Section 2: Mathematical Trend Calculation */}
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-950 text-cyan-400 text-xs font-mono">2</span>
              Primary Trend Estimator: Theil-Sen Robust Median Slope
            </h3>
            <p className="text-slate-300">
              To prevent individual extreme climatic anomalies (such as ENSO spikes or volcanic dust dips) from distorting the trend line, EarthPulse implements the genuine non-parametric{' '}
              <strong className="text-white">Theil-Sen Median Estimator</strong>:
            </p>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 space-y-1">
              <div>Slope = Median &#123; (y_j - y_i) / (x_j - x_i) &#125; for all 1 ≤ i &lt; j ≤ N</div>
              <div>Intercept = Median &#123; y_i - Slope * x_i &#125; for all i = 1 ... N</div>
            </div>
            <p className="text-xs text-slate-400">
              With a high breakdown point of ~29.3%, the Theil-Sen estimator is substantially more robust against non-normal environmental outliers than ordinary least squares (OLS) regression. Ordinary linear regression R² is computed as a supporting reference metric.
            </p>
          </div>

          {/* Section 3: Statistical Significance */}
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-950 text-cyan-400 text-xs font-mono">3</span>
              Significance Testing: Tie-Corrected Mann-Kendall Test
            </h3>
            <p className="text-slate-300">
              We evaluate monotonic trends using the non-parametric <strong className="text-white">Mann-Kendall Test</strong> with an exact tie-correction formulation for repeated annual observations:
            </p>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 space-y-1">
              <div>S = Σ sgn(y_j - y_i) for i &lt; j</div>
              <div>Var(S) = [ N(N - 1)(2N + 5) - Σ t_k(t_k - 1)(2t_k + 5) ] / 18</div>
              <div>Z = (S ± 1) / √Var(S) (continuity corrected); two-sided p = 2 * (1 - Φ(|Z|))</div>
            </div>
            <p className="text-xs text-slate-400">
              A trend is deemed statistically significant if the two-tailed p-value falls below α = 0.05. If valid observations are fewer than 3, the test safely outputs that data is insufficient.
            </p>
          </div>

          {/* Section 4: Serial Correlation Note & Limitations */}
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Temporal Autocorrelation & Scientific Limitations
            </h3>
            <div className="p-3.5 rounded-lg bg-amber-950/30 border border-amber-800/60 text-amber-200/90 text-xs leading-relaxed">
              <strong>Autocorrelation Note:</strong> Mann-Kendall significance assumes observations are sufficiently independent. Temporal autocorrelation can affect significance estimates; results should therefore be interpreted as evidence of a statistical trend rather than proof of causation.
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-xs pl-2">
              <li>
                <strong className="text-slate-300">Autocorrelation Quantification:</strong> EarthPulse monitors the sample lag-1 serial autocorrelation coefficient (r₁) of time series deviations to evaluate serial persistence transparently.
              </li>
              <li>
                <strong className="text-slate-300">Correlation vs. Causation:</strong> Statistical trend detection measures directional trajectory across time; it does not demonstrate direct physical causation.
              </li>
              <li>
                <strong className="text-slate-300">Grid Cell Resolution:</strong> NASA POWER data is aggregated over model grid cells (~0.5° × 0.625° for MERRA-2 meteorological parameters; 1.0° for solar products). Microclimatic effects within complex topography may diverge from the cell mean.
              </li>
              <li>
                <strong className="text-slate-300">Live API vs. Fallback Simulation:</strong> When the live NASA POWER API is reachable, analysis is performed on real observational records. If offline demo fallback is selected, it is explicitly flagged as synthetic parameter simulation.
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>NASA SPACE APPS CHALLENGE 2026 · THEIL-SEN & MANN-KENDALL</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
