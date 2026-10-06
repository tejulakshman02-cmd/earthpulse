/**
 * EarthPulse API Service Layer
 * Directly connected to the official NASA POWER Daily API:
 * NASA_POWER_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"
 *
 * Implements genuine non-parametric Theil-Sen slope estimation, tie-corrected
 * Mann-Kendall monotonic trend testing, data validation, and honest live/fallback provenance.
 */

import {
  LocationInfo,
  VariableType,
  TimePeriod,
  AnalysisResult,
  ComparisonResult,
  DetectiveHotspot,
  TimeSeriesPoint,
  TrendStatistics,
} from '../types';
import { POPULAR_LOCATIONS, VARIABLE_METADATA, TREND_DETECTIVE_HOTSPOTS } from '../data/mockData';

export const NASA_POWER_URL = "https://power.larc.nasa.gov/api/temporal/daily/point";

export const API_CONFIG = {
  USE_REAL_NASA_API: true,
  NASA_POWER_URL,
  USE_BACKEND: false,
  BACKEND_BASE_URL: '/api/v1',
};

// Parameter mapping for NASA POWER API
const NASA_PARAM_MAP: Record<VariableType, string> = {
  temperature: 'T2M', // Temperature at 2 Meters (°C)
  rainfall: 'PRECTOTCORR', // Precipitation Corrected (mm/day)
  solar: 'ALLSKY_SFC_SW_DWN', // All Sky Surface Shortwave Downward Irradiance (kWh/m²/day)
};

export interface RawAnnualObservation {
  year: number;
  rawValue: number;
}

/**
 * Validates and sanitizes annual observation points
 */
export function validateAnnualSeries(rawPoints: RawAnnualObservation[]): RawAnnualObservation[] {
  if (!rawPoints || rawPoints.length === 0) {
    throw new Error('Observation series is empty.');
  }

  // Filter out non-finite values
  const valid = rawPoints.filter(
    (pt) =>
      typeof pt.year === 'number' &&
      !isNaN(pt.year) &&
      isFinite(pt.year) &&
      typeof pt.rawValue === 'number' &&
      !isNaN(pt.rawValue) &&
      isFinite(pt.rawValue)
  );

  if (valid.length < 3) {
    throw new Error(`Insufficient valid observations (${valid.length} points). Minimum 3 years required for trend evaluation.`);
  }

  // Deduplicate years by averaging values if duplicates exist
  const byYearMap = new Map<number, number[]>();
  valid.forEach((pt) => {
    const list = byYearMap.get(pt.year) || [];
    list.push(pt.rawValue);
    byYearMap.set(pt.year, list);
  });

  const deduped: RawAnnualObservation[] = [];
  byYearMap.forEach((vals, yr) => {
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    deduped.push({ year: yr, rawValue: avg });
  });

  // Sort strictly by year ascending
  deduped.sort((a, b) => a.year - b.year);

  return deduped;
}

/**
 * Genuine Theil-Sen Robust Slope & Intercept Estimator
 * Computes all pairwise slopes s_{i,j} = (y_j - y_i) / (x_j - x_i) for i < j.
 * The robust slope is the median of all pairwise slopes.
 * The robust intercept is the median of (y_i - slope * x_i).
 */
export function calculateTheilSenSlope(points: RawAnnualObservation[]): {
  slope: number;
  intercept: number;
} {
  const n = points.length;
  if (n < 2) {
    return { slope: 0, intercept: points[0]?.rawValue || 0 };
  }

  const pairwiseSlopes: number[] = [];

  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const dx = points[j].year - points[i].year;
      if (dx !== 0) {
        const dy = points[j].rawValue - points[i].rawValue;
        pairwiseSlopes.push(dy / dx);
      }
    }
  }

  if (pairwiseSlopes.length === 0) {
    return { slope: 0, intercept: points[0].rawValue };
  }

  pairwiseSlopes.sort((a, b) => a - b);
  const mid = Math.floor(pairwiseSlopes.length / 2);
  const medianSlope =
    pairwiseSlopes.length % 2 === 0
      ? (pairwiseSlopes[mid - 1] + pairwiseSlopes[mid]) / 2
      : pairwiseSlopes[mid];

  // Robust intercept: median of (y_i - medianSlope * x_i)
  const intercepts = points.map((p) => p.rawValue - medianSlope * p.year).sort((a, b) => a - b);
  const midInt = Math.floor(intercepts.length / 2);
  const medianIntercept =
    intercepts.length % 2 === 0
      ? (intercepts[midInt - 1] + intercepts[midInt]) / 2
      : intercepts[midInt];

  return { slope: medianSlope, intercept: medianIntercept };
}

/**
 * High-precision Standard Normal CDF based on Abramowitz & Stegun formula 26.2.17 (error < 7.5e-8)
 */
function normalCdf(z: number): number {
  if (isNaN(z) || !isFinite(z)) return 0.5;
  const absZ = Math.abs(z);
  const p = 0.2316419;
  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;

  const t = 1.0 / (1.0 + p * absZ);
  const poly = ((((b5 * t + b4) * t + b3) * t + b2) * t + b1) * t;
  const phi = (1.0 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * absZ * absZ);
  const cdf = 1.0 - phi * poly;
  return z >= 0 ? cdf : 1.0 - cdf;
}

/**
 * Tie-Aware Mann-Kendall Monotonic Trend Test
 * Calculates the S statistic, exact tie-corrected variance, continuity-corrected Z statistic,
 * and two-sided p-value against α = 0.05.
 * Safely handles edge cases: <3 points, identical values, zero variance, NaN values.
 */
export function calculateMannKendall(points: RawAnnualObservation[]): {
  S: number;
  variance: number;
  zScore: number | null;
  pValue: number | null;
  significant: boolean;
  tieCount: number;
  hasSufficientData: boolean;
} {
  const n = points.length;

  // Edge case 1: fewer than 3 valid observations
  if (n < 3) {
    return {
      S: 0,
      variance: 0,
      zScore: null,
      pValue: null,
      significant: false,
      tieCount: 0,
      hasSufficientData: false,
    };
  }

  // 1. Calculate Mann-Kendall S statistic
  let S = 0;
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const diff = points[j].rawValue - points[i].rawValue;
      if (diff > 1e-9) S += 1;
      else if (diff < -1e-9) S -= 1;
    }
  }

  // 2. Identify tied groups in Y values
  const sortedValues = points.map((p) => p.rawValue).sort((a, b) => a - b);
  const tieGroups: number[] = [];
  let currentTieLen = 1;

  for (let i = 1; i < sortedValues.length; i++) {
    if (Math.abs(sortedValues[i] - sortedValues[i - 1]) < 1e-9) {
      currentTieLen++;
    } else {
      if (currentTieLen > 1) {
        tieGroups.push(currentTieLen);
      }
      currentTieLen = 1;
    }
  }
  if (currentTieLen > 1) {
    tieGroups.push(currentTieLen);
  }

  // 3. Compute tie-corrected variance
  // Formula: Var(S) = [ n(n-1)(2n+5) - sum(t*(t-1)*(2t+5)) ] / 18
  const baseVar = (n * (n - 1) * (2 * n + 5));
  let tieReduction = 0;
  let totalTiedObservations = 0;

  tieGroups.forEach((t) => {
    tieReduction += t * (t - 1) * (2 * t + 5);
    totalTiedObservations += t;
  });

  const rawVariance = (baseVar - tieReduction) / 18;
  const variance = Math.max(0, rawVariance);

  // Edge case 2: Zero variance (all values identical or constant series) or non-finite
  if (variance <= 1e-12 || !isFinite(variance)) {
    return {
      S,
      variance: 0,
      zScore: null,
      pValue: null,
      significant: false,
      tieCount: totalTiedObservations,
      hasSufficientData: false,
    };
  }

  // 4. Continuity-corrected Z statistic
  let zScore = 0;
  const sqrtVar = Math.sqrt(variance);

  if (S > 0) {
    zScore = (S - 1) / sqrtVar;
  } else if (S < 0) {
    zScore = (S + 1) / sqrtVar;
  } else {
    zScore = 0;
  }

  // 5. Two-sided p-value
  const absZ = Math.abs(zScore);
  const pValue = absZ === 0 ? 1.0 : Math.max(0, Math.min(1, 2 * (1 - normalCdf(absZ))));

  // Statistical significance at standard α = 0.05
  const significant = pValue < 0.05;

  return {
    S,
    variance: Number(variance.toFixed(2)),
    zScore: Number(zScore.toFixed(3)),
    pValue: Number(pValue.toFixed(4)),
    significant,
    tieCount: totalTiedObservations,
    hasSufficientData: true,
  };
}

/**
 * Calculates comprehensive robust trend statistics:
 * Primary rate: Theil-Sen Median Slope
 * Significance test: Tie-corrected Mann-Kendall
 * Supporting metric: Ordinary Linear Regression R²
 */
export function calculateTrendStatistics(
  rawPoints: RawAnnualObservation[],
  variable: VariableType,
  unit: string,
  period: TimePeriod
): { series: TimeSeriesPoint[]; stats: TrendStatistics } {
  const points = validateAnnualSeries(rawPoints);
  const n = points.length;

  // 1. Theil-Sen robust slope & intercept
  const theilSen = calculateTheilSenSlope(points);

  // 2. Tie-corrected Mann-Kendall test
  const mk = calculateMannKendall(points);

  // 3. Supporting OLS Linear Regression (for R² reference)
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  points.forEach((pt) => {
    sumX += pt.year;
    sumY += pt.rawValue;
    sumXY += pt.year * pt.rawValue;
    sumXX += pt.year * pt.year;
  });

  const olsSlope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const olsIntercept = (sumY - olsSlope * sumX) / n;
  const meanY = sumY / n;

  let ssTot = 0;
  let ssRes = 0;
  points.forEach((pt) => {
    const fittedTheil = theilSen.slope * pt.year + theilSen.intercept;
    ssTot += Math.pow(pt.rawValue - meanY, 2);
    ssRes += Math.pow(pt.rawValue - fittedTheil, 2);
  });

  // Linear R²
  let olsSsRes = 0;
  points.forEach((pt) => {
    const fittedOls = olsSlope * pt.year + olsIntercept;
    olsSsRes += Math.pow(pt.rawValue - fittedOls, 2);
  });
  const rSquared = ssTot > 0 ? Math.max(0, 1 - olsSsRes / ssTot) : 0;

  // Residual uncertainty standard error
  const residualStdError = n > 2 ? Math.sqrt(ssRes / (n - 2)) : 0;

  // Sample lag-1 serial autocorrelation (r1) of deviations from mean
  let numAuto = 0;
  let denAuto = 0;
  for (let i = 0; i < n; i++) {
    const diff_i = points[i].rawValue - meanY;
    denAuto += diff_i * diff_i;
    if (i < n - 1) {
      const diff_next = points[i + 1].rawValue - meanY;
      numAuto += diff_i * diff_next;
    }
  }
  const lag1Autocorrelation = denAuto > 0 ? Number((numAuto / denAuto).toFixed(3)) : 0;

  // Theil-Sen period change: slope * total years span
  const firstFitted = theilSen.slope * period.start + theilSen.intercept;
  const lastFitted = theilSen.slope * period.end + theilSen.intercept;
  const totalChange = lastFitted - firstFitted;
  const pctChange = firstFitted !== 0 ? (totalChange / Math.abs(firstFitted)) * 100 : 0;

  // Trend direction threshold
  let direction: 'upward' | 'downward' | 'stable' = 'stable';
  const minSignificantSlope = variable === 'rainfall' ? 0.25 : 0.002;
  if (theilSen.slope > minSignificantSlope) direction = 'upward';
  else if (theilSen.slope < -minSignificantSlope) direction = 'downward';

  const isDecimal = variable !== 'rainfall';

  const series: TimeSeriesPoint[] = points.map((pt) => {
    const fitted = theilSen.slope * pt.year + theilSen.intercept;
    return {
      year: pt.year,
      value: Number(pt.rawValue.toFixed(isDecimal ? 2 : 1)),
      trendValue: Number(fitted.toFixed(isDecimal ? 2 : 1)),
      anomaly: Number((pt.rawValue - meanY).toFixed(isDecimal ? 2 : 1)),
      // Residual uncertainty bounds (±1.96 standard errors of residuals)
      lowerConfidence: Number((fitted - 1.96 * residualStdError).toFixed(isDecimal ? 2 : 1)),
      upperConfidence: Number((fitted + 1.96 * residualStdError).toFixed(isDecimal ? 2 : 1)),
    };
  });

  const stats: TrendStatistics = {
    average: Number(meanY.toFixed(isDecimal ? 2 : 1)),
    change: Number(totalChange.toFixed(isDecimal ? 2 : 1)),
    percentageChange: Number(pctChange.toFixed(1)),
    trendRate: Number(theilSen.slope.toFixed(isDecimal ? 3 : 2)),
    theilSenSlope: Number(theilSen.slope.toFixed(isDecimal ? 3 : 2)),
    theilSenIntercept: Number(theilSen.intercept.toFixed(2)),
    olsSlope: Number(olsSlope.toFixed(isDecimal ? 3 : 2)),
    rSquared: Number(rSquared.toFixed(3)),
    direction,
    significant: mk.significant,
    pValue: mk.pValue,
    zScore: mk.zScore,
    mannKendallS: mk.S,
    tieCount: mk.tieCount,
    hasSufficientData: mk.hasSufficientData,
    confidencePercent: 95,
    unit,
    baselinePeriod: `${period.start}–${period.end}`,
    sampleCount: n,
    lag1Autocorrelation,
    methodologyNotes:
      'Trend rate estimated using the robust Theil-Sen median estimator. Significance tested using tie-corrected Mann-Kendall at α = 0.05. R² reflects ordinary linear regression.',
  };

  return { series, stats };
}

/**
 * Builds careful, scientifically defensible narrative interpretations without causal overclaims
 */
export function buildScientificInterpretation(
  location: LocationInfo,
  variable: VariableType,
  period: TimePeriod,
  stats: TrendStatistics,
  isRealData: boolean,
  dailyCount?: number
): AnalysisResult['explanation'] {
  const meta = VARIABLE_METADATA[variable];
  const dirLabel = stats.direction === 'upward' ? 'upward' : stats.direction === 'downward' ? 'downward' : 'stable';
  const signPrefix = stats.change > 0 ? '+' : '';
  const signRate = stats.trendRate > 0 ? '+' : '';

  const sourceNotice = isRealData
    ? `Calculated from ${dailyCount?.toLocaleString() || 'multi-year'} daily observations ingested via the NASA POWER API.`
    : `Calculated from simulated demo parameters (NASA POWER live API was unavailable).`;

  const whatChanged = `The time series for ${meta.name.toLowerCase()} at ${location.name} exhibits a ${dirLabel} trajectory across the ${period.start}–${period.end} time horizon, evaluated using the robust Theil-Sen estimator.`;

  const howMuch = `The estimated shift along the Theil-Sen trend line is ${signPrefix}${stats.change} ${meta.unit} over ${period.end - period.start + 1} years, representing an annualized rate of ${signRate}${stats.trendRate} ${meta.unit}/year (OLS linear fit R² = ${stats.rSquared}).`;

  let howStrong = '';
  if (!stats.hasSufficientData || stats.pValue === null) {
    howStrong = 'Insufficient data for statistical significance testing.';
  } else if (stats.significant) {
    howStrong = `The Mann-Kendall test indicates a statistically significant monotonic trend at the 0.05 significance level (p = ${stats.pValue}, S = ${stats.mannKendallS}) under the assumptions of the test.`;
  } else {
    howStrong = `The analysis detects a directional change of ${signRate}${stats.trendRate} ${meta.unit}/year, but the evidence is not statistically significant at the 0.05 level (p = ${stats.pValue}).`;
  }

  const whatToNotice = `Notice the magnitude of interannual variability relative to the fitted trend line. Mann-Kendall significance assumes observations are sufficiently independent. Temporal autocorrelation can affect significance estimates; results should therefore be interpreted as evidence of a statistical trend rather than proof of causation.`;

  return {
    whatChanged,
    howMuch,
    howStrong,
    whatToNotice,
    statisticalInterpretation: {
      summary: `EarthPulse calculates that ${location.name} experienced an annualized ${dirLabel} trend rate of ${signRate}${stats.trendRate} ${meta.unit}/year between ${period.start} and ${period.end} (${sourceNotice}).`,
      impactContext: `This statistical trajectory may be relevant to local environmental planning, water resources, or urban thermal management in ${location.country}. The result demonstrates statistical trend behavior and does not establish direct causation.`,
      drivingFactors: [
        'Multi-decadal atmospheric state variables provided by the NASA POWER project',
        'Large-scale synoptic circulation patterns and localized land-atmosphere interactions',
        'Decadal natural climate oscillations and regional radiative forcing',
      ],
      recommendedFollowUp: `Examine seasonal sub-series or compare with neighboring regional coordinates to assess spatial consistency.`,
    },
  };
}

/**
 * Queries the official NASA POWER Daily API:
 * NASA_POWER_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"
 */
async function fetchRealNasaPowerData(
  location: LocationInfo,
  variable: VariableType,
  period: TimePeriod
): Promise<{ series: TimeSeriesPoint[]; stats: TrendStatistics; dailyCount: number }> {
  const nasaParam = NASA_PARAM_MAP[variable];
  const unit = VARIABLE_METADATA[variable].unit;

  const startStr = `${period.start}0101`;
  const endYearClamped = Math.min(2025, period.end);
  const endStr = `${endYearClamped}1231`;

  const queryParams = new URLSearchParams({
    parameters: nasaParam,
    community: 'RE',
    longitude: location.longitude.toFixed(4),
    latitude: location.latitude.toFixed(4),
    start: startStr,
    end: endStr,
    format: 'JSON',
  });

  const fullUrl = `${NASA_POWER_URL}?${queryParams.toString()}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  const response = await fetch(fullUrl, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`NASA POWER API HTTP ${response.status}: ${response.statusText}`);
  }

  const json = await response.json();
  const rawParamMap = json?.properties?.parameter?.[nasaParam];

  if (!rawParamMap || Object.keys(rawParamMap).length === 0) {
    throw new Error(`NASA POWER returned empty parameter block for ${nasaParam}`);
  }

  // Aggregate daily observations into annual points
  const byYear: Record<string, number[]> = {};
  let totalValidDays = 0;

  for (const [dateStr, rawVal] of Object.entries(rawParamMap)) {
    const val = Number(rawVal);
    // Filter fill value (-999 or missing)
    if (val === -999 || val < -900 || isNaN(val) || !isFinite(val)) continue;

    const yr = dateStr.slice(0, 4);
    if (!byYear[yr]) byYear[yr] = [];
    byYear[yr].push(val);
    totalValidDays++;
  }

  // Build annual series points
  const rawAnnualPoints: RawAnnualObservation[] = [];
  const sortedYears = Object.keys(byYear).map(Number).sort((a, b) => a - b);

  for (const yr of sortedYears) {
    const dailyValues = byYear[yr.toString()];
    if (dailyValues.length < 90) continue; // Require at least one quarter of valid days

    let annualVal: number;
    if (variable === 'rainfall') {
      // Precipitation: sum of daily mm/day scaled for complete year length
      const sum = dailyValues.reduce((a, b) => a + b, 0);
      annualVal = (sum / dailyValues.length) * (yr % 4 === 0 ? 366 : 365);
    } else {
      // Temperature and Solar: mean of daily values
      annualVal = dailyValues.reduce((a, b) => a + b, 0) / dailyValues.length;
    }

    rawAnnualPoints.push({
      year: yr,
      rawValue: annualVal,
    });
  }

  if (rawAnnualPoints.length < 3) {
    throw new Error(`Insufficient annual data retrieved from NASA POWER (${rawAnnualPoints.length} valid years).`);
  }

  const { series, stats } = calculateTrendStatistics(rawAnnualPoints, variable, unit, period);
  return { series, stats, dailyCount: totalValidDays };
}

/**
 * Fallback calibrated model for offline/demo experience
 */
function generateCalibratedFallback(
  location: LocationInfo,
  variable: VariableType,
  period: TimePeriod
): { series: TimeSeriesPoint[]; stats: TrendStatistics; dailyCount: number } {
  const seedString = `${location.latitude}_${location.longitude}_${variable}`;
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i);
    hash |= 0;
  }
  let s = Math.abs(hash) + 100;
  const rng = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };

  let baseValue = 0;
  let annualSlope = 0;
  let noiseStdDev = 0;
  const unit = VARIABLE_METADATA[variable].unit;

  if (variable === 'temperature') {
    const latAbs = Math.abs(location.latitude);
    const elevationCorrection = ((location.elevationMeters || 0) / 1000) * 6.5;
    baseValue = Math.max(-5, 29.5 - (latAbs * 0.48) - elevationCorrection);
    const warmingAmplification = 1 + (latAbs / 90) * 0.8 + (location.name.includes('Bengaluru') || location.name.includes('Phoenix') ? 0.35 : 0);
    annualSlope = 0.028 * warmingAmplification;
    noiseStdDev = 0.38;
  } else if (variable === 'rainfall') {
    if (Math.abs(location.latitude) < 15) {
      baseValue = location.name.includes('Manaus') ? 2250 : 980;
      annualSlope = -2.8;
      noiseStdDev = 140;
    } else if (location.climateZone?.includes('desert') || location.name.includes('Phoenix') || location.name.includes('Cairo')) {
      baseValue = 180;
      annualSlope = -0.45;
      noiseStdDev = 38;
    } else {
      baseValue = 820;
      annualSlope = 1.2;
      noiseStdDev = 75;
    }
  } else {
    const latAbs = Math.abs(location.latitude);
    baseValue = Math.max(2.8, 6.2 - (latAbs * 0.042));
    annualSlope = (rng() - 0.48) * 0.012;
    noiseStdDev = 0.15;
  }

  const rawData: RawAnnualObservation[] = [];
  const startRefYear = 1980;

  for (let yr = period.start; yr <= period.end; yr++) {
    const elapsed = yr - startRefYear;
    const ensoCycle = Math.sin((yr / 4.2) * Math.PI * 2) * (noiseStdDev * 0.65);
    const noise = (rng() - 0.5) * noiseStdDev * 1.5;
    const val = baseValue + (elapsed * annualSlope) + ensoCycle + noise;
    rawData.push({
      year: yr,
      rawValue: val,
    });
  }

  const { series, stats } = calculateTrendStatistics(rawData, variable, unit, period);
  return { series, stats, dailyCount: (period.end - period.start + 1) * 365 };
}

/**
 * Searches locations in the registry
 */
export async function searchLocations(query: string): Promise<LocationInfo[]> {
  const clean = query.trim().toLowerCase();
  if (!clean) return POPULAR_LOCATIONS.slice(0, 5);

  return POPULAR_LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(clean) ||
      loc.country.toLowerCase().includes(clean) ||
      loc.climateZone?.toLowerCase().includes(clean)
  );
}

/**
 * Main analysis function:
 * Queries NASA POWER Daily API.
 * If allowDemoFallback is false (default), propagates errors honestly.
 * If allowDemoFallback is true, returns explicitly marked simulation fallback.
 */
export async function analyzeTrend(
  location: LocationInfo,
  variable: VariableType,
  period: TimePeriod,
  options?: { allowDemoFallback?: boolean }
): Promise<AnalysisResult> {
  if (period.start >= period.end) {
    throw new Error('Start year must be earlier than end year.');
  }

  const allowDemoFallback = options?.allowDemoFallback ?? false;

  let series: TimeSeriesPoint[];
  let stats: TrendStatistics;
  let isRealData = false;
  let isSimulatedFallback = false;
  let dailyCount = 0;

  if (API_CONFIG.USE_REAL_NASA_API) {
    try {
      const realResult = await fetchRealNasaPowerData(location, variable, period);
      series = realResult.series;
      stats = realResult.stats;
      dailyCount = realResult.dailyCount;
      isRealData = true;
      isSimulatedFallback = false;
    } catch (err: any) {
      if (!allowDemoFallback) {
        throw new Error(
          err.message ||
            'NASA POWER data could not be retrieved right now. Please verify network access or select Demo Data.'
        );
      }
      // Explicitly opted into fallback
      const fallback = generateCalibratedFallback(location, variable, period);
      series = fallback.series;
      stats = fallback.stats;
      dailyCount = fallback.dailyCount;
      isRealData = false;
      isSimulatedFallback = true;
    }
  } else {
    const fallback = generateCalibratedFallback(location, variable, period);
    series = fallback.series;
    stats = fallback.stats;
    dailyCount = fallback.dailyCount;
    isRealData = false;
    isSimulatedFallback = true;
  }

  const explanation = buildScientificInterpretation(
    location,
    variable,
    period,
    stats,
    isRealData,
    dailyCount
  );

  return {
    id: `pulse_${location.id}_${variable}_${period.start}_${period.end}`,
    timestamp: new Date().toISOString(),
    location,
    variable,
    variableName: VARIABLE_METADATA[variable].name,
    variableUnit: VARIABLE_METADATA[variable].unit,
    period,
    statistics: stats,
    series,
    explanation,
    isRealData,
    isSimulatedFallback,
    dailyObservationsCount: dailyCount,
    dataSource: {
      name: isRealData
        ? 'NASA POWER Daily API'
        : 'Simulated fallback data — NASA POWER unavailable',
      mission: isRealData
        ? 'NASA Earth Observation & Modeling Resources (MERRA-2, CERES, GPM/IMERG)'
        : 'Offline Calibrated Simulation Model',
      resolution: 'NASA POWER native analysis grid',
      lastUpdated: isRealData ? 'Live NASA Query' : 'Synthesized Offline Model',
      apiEndpoint: NASA_POWER_URL,
      notice: isSimulatedFallback
        ? 'SIMULATED DEMO DATA: This run uses synthetic parameters because NASA POWER could not be contacted. Do not cite as scientific evidence.'
        : undefined,
    },
  };
}

/**
 * Compares two locations across the same variable and time period
 */
export async function compareLocations(
  locA: LocationInfo,
  locB: LocationInfo,
  variable: VariableType,
  period: TimePeriod,
  options?: { allowDemoFallback?: boolean }
): Promise<ComparisonResult> {
  const [resA, resB] = await Promise.all([
    analyzeTrend(locA, variable, period, options),
    analyzeTrend(locB, variable, period, options),
  ]);

  const deltaChange = Number((resA.statistics.change - resB.statistics.change).toFixed(2));
  const deltaRate = Number((resA.statistics.trendRate - resB.statistics.trendRate).toFixed(3));

  let comparativeConclusion = '';
  if (Math.abs(deltaRate) < 0.005) {
    comparativeConclusion = `${locA.name} and ${locB.name} exhibit near-identical Theil-Sen rates of change over the selected ${period.start}–${period.end} period.`;
  } else if (resA.statistics.trendRate > resB.statistics.trendRate) {
    comparativeConclusion = `${locA.name} shows a higher Theil-Sen rate of change (+${resA.statistics.trendRate} ${resA.variableUnit}/yr) than ${locB.name} (+${resB.statistics.trendRate} ${resB.variableUnit}/yr) over the selected period.`;
  } else {
    comparativeConclusion = `${locB.name} shows a higher Theil-Sen rate of change (+${resB.statistics.trendRate} ${resB.variableUnit}/yr) than ${locA.name} (+${resA.statistics.trendRate} ${resA.variableUnit}/yr) over the selected period.`;
  }

  return {
    locationA: resA,
    locationB: resB,
    deltaChange,
    deltaRate,
    comparativeConclusion,
  };
}

/**
 * Returns curated trend hotspots for the "Trend Detective" mode
 */
export async function getTrendDetectiveHotspots(): Promise<DetectiveHotspot[]> {
  return TREND_DETECTIVE_HOTSPOTS;
}
